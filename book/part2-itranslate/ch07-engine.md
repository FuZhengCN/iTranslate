# 第 7 章 翻译引擎：Prompt 设计

**本章目标**：读完本章，你将理解 iTranslate 翻译引擎的完整设计——从与 OpenAI 兼容 API 的对接方式、System Prompt 的设计思路、批处理与并发策略，到缓存层的实现。你会理解为什么 temperature 设 0.1 而不是 0、为什么 `[N]` 比 `1.` 更不容易被模型误解，以及 DeepSeek 推理模型 thinking 模式的实际影响。

**预计字数**：约5000字

**状态**：✅ 初稿完成

## 7.1 与 OpenAI 兼容 API 对话

iTranslate 的翻译引擎有一个设计前提：**不绑定任何特定的 AI 服务商**。只要 API 兼容 OpenAI 的 `/chat/completions` 格式，无论是 DeepSeek、OpenAI、Claude API，还是本地跑 Ollama，都能接入。

这个兼容性的关键是请求体的标准化。`translator.ts` 中发送的每一次翻译请求，核心参数只有这几个：

```typescript
fetch(`${endpoint}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.apiKey}`,
  },
  body: JSON.stringify({
    model: settings.model,           // 从 settings 读取
    messages: [
      { role: 'system', content: settings.systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: maxTokens,           // 动态估算
    thinking: { type: 'disabled' },  // DeepSeek 特有
  }),
});
```

逐个解释这些参数的设计意图：

**`model` 和 `messages`** 是 `/chat/completions` 的标准字段，没什么好说的。`model` 从 settings 读取，用户可以在设置页随时切换——今天用 `deepseek-v4-flash`，明天换 `gpt-4o`，代码一行不改。

**`temperature: 0.1`** 是一个经过权衡的值。翻译场景下，你不希望模型"发挥创造力"——原文说"Apple"，你希望译文是"苹果"而不是"一种蔷薇科水果"。但设为 0（完全确定性）也有问题：输出会变得生硬，缺乏自然语言的流畅感。0.1 保留了极少量的随机性，足以让译文读起来自然，同时不会偏离原文语义。这是翻译场景的最优解，不是随便挑的数字。

**`max_tokens`** 是动态估算的，不是写死的。`estimateTokens()` 用了一个简单但有效的公式：把 prompt 字符数乘以 0.6（估算的输出比例），再乘以 1.5（token/字符比），然后 clamp 到 `[512, 8192]` 区间，额外加 256 的 buffer。这个公式不追求精确，但它保证了两件事：输出不会因为 token 不够被截断，也不会因为 max_tokens 设得过大浪费额度。

**`thinking: { type: 'disabled' }`** 是 DeepSeek 推理模型（如 deepseek-reasoner）特有的参数。DeepSeek 的推理模型在回答问题之前会先"思考"——在内部产生推理 token，计入 `completion_tokens` 但不输出到 `content` 字段。如果不禁用 thinking，可能出现一种诡异的情况：API 调用成功了，`usage.completion_tokens` 有值，但 `content` 为空——因为所有 token 都花在了"思考"上，一个字没翻译。后面的 CC 对话实录会详细讲这个坑是怎么发现的。

**endpoint 和 apiKey 从 settings 读取**，这意味着用户完全掌控翻译服务的选择和费用。iTranslate 本身不维护任何代理服务器，所有 API 调用直接从用户的浏览器发出。这个设计的副作用是：不需要隐私政策里写"我们会把你的网页内容发送到我们的服务器处理"——因为根本没有我们的服务器。

---

## 7.2 System Prompt 设计

这是本章的绝对核心。Prompt 的质量直接决定了翻译质量，而 Prompt 的设计远不止"你是一个翻译引擎"这么一句话。

iTranslate 的默认 System Prompt 长这样：

```
You are a professional English-to-Chinese translator. Translate the following
text accurately while preserving the original meaning, tone, and formatting.
Only output the Chinese translation, nothing else.
```

看着简单，但每一句都有明确的意图：

**"professional ... translator"** — 角色设定。告诉模型你不是在闲聊，不是在写文章，你的唯一身份是专业翻译。这不是装饰性的前缀。对大语言模型来说，角色设定会影响输出的语气、措辞甚至格式——一个"翻译引擎"和一个"翻译助手"产出的结果在风格上会有微妙但可感知的差异。

**"preserving the original meaning, tone, and formatting"** — 三条翻译原则。准确（meaning）是底线要求，但语气（tone）和格式（formatting）同样重要。原文是幽默的，译文不能严肃；原文有分段空行，译文不能把全部内容挤成一段。这条指令让模型理解：你不是在做摘要，你是在做忠实还原。

**"Only output the Chinese translation, nothing else"** — 最重要的一句。没有这句话，模型很可能会在译文前后附加"Here is the translation:"之类的寒暄。对普通聊天来说这无伤大雅，但对程序解析来说——paraphrase 这种多余文本会直接导致 `parseResponse()` 解析失败。强制要求裸输出，是程序化调用 Prompt 的铁律。

但这只是 System Prompt。User Prompt（每条消息的具体内容）也需要设计。iTranslate 用 `buildPrompt()` 组装每条消息：

```typescript
function buildPrompt(texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following texts. Each text is wrapped with a numbered tag.
Output the translations using the same numbered tags, one per line, with no
additional commentary:\n\n${segments}`;
}
```

**为什么用 `[0]`、`[1]` 这样的编号格式？**

因为需要程序能把翻译结果和原文一一对应。一段用户消息里包含几十个文本段，模型返回的是一大段文本，你没办法依赖"第几行对应第几段"——模型可能会合并行、拆分行、或者改变顺序。编号是唯一可靠的对应方式。

选择 `[N]` 格式而非 `1.`、`N)` 或 `N、`，有一条实战经验：**数字+标点的格式容易和正文内容混淆。** 比如原文里有一段"1. 引言"——如果你也要求模型用 `1.` 格式输出译文，模型可能搞不清哪个 `1.` 是编号、哪个是译文内容。`[N]` 方括号包裹的格式在日常文本中出现概率极低，大大降低了误解析的可能。

**那如果模型还是不按 `[N]` 格式返回怎么办？**

事实上它确实经常不按。有些模型会输出 `0. translated text`，有些是 `0) translated text`，还有 `0、译文`。这不是偶然现象——不同模型有各自的"编号习惯"，你不可能用一个 prompt 约束住所有模型。

所以 `parseResponse()` 采取了防御性解析策略——用两个正则模式，按优先级依次匹配：

```typescript
const patterns = [
  /^\[(\d+)\]\s*(.+)/,       // [0] text
  /^(\d+)[\.\)、]\s*(.+)/,   // 0. text, 0) text, 0、text
];
```

先尝试匹配 `[N]` 格式（你要求的格式），匹配不到再尝试 `N.`、`N)`、`N、` 三种常见变体。如果所有格式都匹配不到，用 `[Translation unavailable for segment ${i}]` 作为占位符——保证程序不崩溃，同时让用户看到明确的问题提示。

这个设计体现了一个重要的原则：**prompt 是你的期望，parseResponse 是容错机制。你的代码不应该假设模型一定会遵循 prompt——它应该优雅地处理模型的"不听话"。**

**用户的 Prompt 可编辑——这是 iTranslate 的核心差异化。**

在设置页面，System Prompt 是一个可编辑的文本框，预填默认值，用户可以随意修改。这意味着什么？如果你觉得默认 Prompt 翻译得太生硬，你可以改成"翻译得更口语化"；如果你翻译的是技术文档，你可以加一句"保留所有技术术语的英文原文"；如果你翻译小说，你可以要求"保留原文的文学性和修辞手法"。这种 Prompt 级别的可控性，是 iTranslate 与一切内置翻译引擎（Google 翻译、DeepL、Edge 翻译）的本质区别：后者给你的是"翻译结果"，iTranslate 给你的是"翻译能力"——怎么翻译你说了算。

---

## 7.3 批处理与并发

一个新闻页面可能有 80 个文本段。如果逐段翻译，80 次 API 调用串行跑，每段耗时 2 秒，总用时 160 秒——用户等到花都谢了。如果一次性把所有 80 段塞进一次 API 调用，请求体的 token 数会远超限制。

iTranslate 的方案是**按 token 数动态分批 + 并发控制**。

**先算 token，再分批。** 不要用字符数做分批依据——同样 100 个字符，中文和英文的 token 数差 4 倍。`segmentTokenEstimate()` 的做法是取文本前 40 个字符采样：如果 CJK（中日韩统一表意文字，Unicode 范围 0x4E00-0x9FFF 等）字符占比超过 30%，按 1.5 token/字符估算；否则按 0.35 token/字符估算。每批目标 1500 token——在翻译质量（batch 太小模型缺少上下文）和延迟（batch 太大单次请求慢）之间取了一个平衡。

**并发控制最多 3 批同时发出。** `translateBatch()` 维护一个队列，启动 3 个 worker 从队列里消费。第 3 章讲过 Promise 链式调用的并发控制，这里就是实战应用——`runNext()` 处理完当前批后递归调用自己取下一批，直到队列清空。

**重试策略很克制：只重试 429（限流）和 5xx（服务端错误），最多 3 次，指数退避。** 429 表示你发太快了，指数退避（`2^attempt * 1000` ms）给服务端喘息空间。5xx 表示服务端暂时不可用，等下可能就好了。但 4xx（如 401 未授权、400 参数错误）绝不重试——这些是你自己的问题，重试一万次也解决不了，直接抛错才是正确做法。

**结果排序：位置映射（position map）。** 3 批并发出去了，但它们返回的顺序是不确定的——慢的翻译可能最后回来。如果直接按返回顺序拼接结果，第 5 段的翻译可能出现在第 1 段的位置。`translateBatch()` 用 `origIndices` 数组记录每段在原始数组中的位置，结果写回 `results[batch.origIndices[j]]`，保证最终输出顺序和输入完全一致。

DeepSeek 推理模型还有一个特殊的坑：`thinking` 模式会消耗 `completion_tokens` 但留下空的 `content`。因为推理模型会先"思考"再回答，如果思考占满了 `max_tokens` 限制，回答就是空的。`translateOneBatch()` 检测这种情况——`!content && data.usage?.completion_tokens > 0`——如果发生了就重试。这个检测逻辑和正常重试（429/5xx）走同一个重试循环，最多 3 次。

---

## 7.4 缓存层

翻译不是免费的——每次 API 调用都在烧 token。同样一段文字，第二次、第三次打开同一个页面时不应该重新翻译。这就是缓存层的存在意义。

iTranslate 用 IndexedDB（通过 `idb` 库）做持久化缓存。选 IndexedDB 而非 `localStorage` 或 `chrome.storage` 的理由很直接：`localStorage` 有 5MB 上限，翻译缓存很容易超过；`chrome.storage.sync` 有写入频率限制，不适合高频操作；IndexedDB 容量大（浏览器通常不限制）、支持事务、异步操作，是缓存场景的标准选择。

**Key 设计的三个考量：**

1. **djb2 哈希 + 文本长度**：太长不能直接做 key（IndexedDB 的 key 有长度限制），纯哈希有碰撞风险。`segmentKey()` 的做法是 `djb2_hash + '_' + text.length`——长度作为第二维度极大降低了碰撞概率。

2. **包含目标语言**：`segmentKey(text, targetLang)` 的 key 里包含 `targetLang`。这不是一开始就有的设计，而是踩了坑之后补上的——早期版本缓存 key 不含目标语言，切换目标语言后展示的仍是旧语言的翻译。一个看似微小的遗漏，导致了一个非常明显的用户可见 bug。

3. **前缀隔离**：`dict_` 用于词典查询缓存，`seg_` 用于翻译缓存。两种不同模式的缓存互不覆盖——你用词典查 "apple" 和一个翻译请求中的 "apple" 虽然原文相同，但缓存 key 不同，互不影响。

**原文存储并校验。** `CacheEntry` 结构包含 `original`、`translated` 和 `timestamp`。命中缓存时，除了用 key 查找，还校验 `cached.original === segments[i].text`。这意味着即使 djb2 哈希碰撞（虽然概率极低），碰撞的内容也不会被错误地当作翻译结果返回。

**并行查找。** `cacheGetBulk()` 用 `Promise.all` 并行读出所有 key，而不是 `for...of` 串行读。IndexedDB 支持并行读取，没必要串行等。

**缓存优先于 API。** `handleTranslate()` 的执行顺序是：先 `cacheGetBulk()` 查缓存 → 命中的直接使用 → 未命中的才走 API → API 返回后 `cacheSetBulk()` 写入缓存。这意味着第二次翻译同一个页面的任何段落，都是零 API 调用、零延迟、零费用。

---

## 7.5 实战复盘：System Prompt 调试

基于真实调试经历复盘：

```
[我的 Prompt]
> 翻译引擎的 System Prompt 这样设计可以吗：
> "You are a professional translator. Translate the following text.
>  Use [0], [1] format to label each translation."
> 实际测试中发现两个问题：
> 1. 有时模型不按 [0] [1] 格式返回，解析失败
> 2. DeepSeek 返回的 content 有时是空的，但 API 调用本身成功了

[CC 的回复]
> 两个问题分开解决。
>
> 问题 1：不要指望模型严格遵循格式要求——即使 prompt 里写得很清楚，
> 不同模型（甚至同一模型的不同调用）可能输出 0. xxx、0) xxx、0、xxx 等变体。
> 解决方案：在 parseResponse 里兼容多种格式，用正则按优先级匹配。
>
> 问题 2：检查一下 API 返回的 usage.completion_tokens——如果 content 为空
> 但 completion_tokens > 0，说明 token 花在了内部推理上。这是 DeepSeek
> 推理模型的 thinking 模式导致的。解决方案：发送 thinking: {type:'disabled'}
> 参数禁用推理模式。同时加一个检测逻辑——如果禁用了 thinking 之后
> 仍然出现空 content + completion_tokens > 0，自动重试。
>
> 以下是修改后的代码...

[为什么这样问]
💡 这两个问题是"上线之后才会发现"的典型。本地开发时你可能只测了一种模型
（比如 gpt-4o），它恰好严格遵循你的格式要求，也没有 thinking 模式。
但一旦部署到真实环境，用户用的是各种不同的模型，格式兼容性和
推理模式就暴露了。这不是 prompt 写得"不够好"的问题——不同模型有不同行为
是 LLM 的固有特性。正确的处理方式不是写更详细的 prompt 去"说服"模型，
而是在解析层做好容错。这条原则适用于所有与 LLM 交互的程序：prompt 是你的
"期望"，parser 是你的"兜底"。
```

---

## 7.6 核心技巧

1. **为多种模型设计，而不是为一种模型优化。** 你的 prompt 在 gpt-4o 上完美运行不代表在 deepseek-v4-flash 上也能。关键不是在 prompt 里写越来越多的约束，而是在解析层建立容错机制——`parseResponse()` 兼容 4 种格式变体，比写 4 个不同版本的 prompt 优雅得多。

2. **temperature 不是越低越好。** 0 会冻结模型的随机性，产出生硬甚至重复的文本。0.1 是翻译场景的 sweet spot——足够确定以忠实原文，足够随机以读起来像人写的。

3. **token 估算要做语言感知。** CJK 文本和拉丁文本的 token/字符比差 4 倍。用统一个数字估算，中文页面会产出过大的 batch，英文页面会产出过小的 batch。采样前 40 个字符判断语言类型是最简单有效的做法。

4. **缓存 key 必须包含目标语言。** 这是一个踩了坑才学到的教训。如果你做的是多语言翻译产品，缓存 key 不含目标语言，切换语言后看到的还是旧翻译。这类 bug 难排查——因为"看起来一切正常"，只是展示的内容不对。

5. **thinking: disabled 是推理模型的必备参数。** 如果你用 DeepSeek 或其他推理模型，不发这个参数可能导致 API 调用成功但返回空内容。加上这个参数之后，再做一个空 content 检测 + 自动重试，双保险。

---

## 7.7 小结

- **与任何 OpenAI 兼容 API 对话**：标准化 `/chat/completions` 请求体，`model`、`endpoint`、`apiKey` 全部从 settings 读取，用户随时可切换到任何兼容服务。
- **System Prompt 是翻译质量的上限**：默认 Prompt 包含角色设定、翻译原则、裸输出约束三要素。但最有价值的不是默认 Prompt 本身，而是用户可以在设置页自定义它——这是 iTranslate 与内置翻译引擎的本质区别。
- **`[N]` 编号 + 多格式容错解析**：选择 `[N]` 格式降低与正文混淆的概率，`parseResponse()` 兼容 4 种编号变体。Prompt 是期望，Parser 是兜底。
- **按 token 动态分批 + 3 并发**：CJK 1.5 tok/字符、拉丁 0.35 tok/字符、目标 1500 tok/批。指数退避重试（仅 429/5xx），位置映射恢复原始顺序。
- **IndexedDB 缓存层**：djb2 哈希 + 文本长度 + 目标语言做 key，原文存储并校验防碰撞，`dict_`/`seg_` 前缀隔离，并行查找。缓存优先于 API，大幅减少重复翻译费用。
- **thinking: disabled**：DeepSeek 推理模型的特有坑。不加这个参数可能导致返回空 content，加上后还要加空 content 检测+重试做双保险。

> 下一章：第 8 章「内容注入：DOM 操作」——如何从页面上提取需要翻译的文本块，把翻译结果渲染到正确的位置。
