# 第 14 章 Prompt 工程模式

**本章目标**：读完本章，你将掌握 AI 编程中最重要的软技能——Prompt 工程。这不是"怎么写提示词"的技巧清单，而是从 iTranslate 项目中提炼出的可复用的 Prompt 设计模式。你会看到一份好的 System Prompt 包含哪四个要素，三种典型的 Prompt 设计模式分别适用于什么场景，以及五个最常见的 Prompt 反模式是如何毁掉 AI 输出质量的。

**预计字数**：约5000字

**状态**：✅ 初稿完成

## 14.1 好的 Prompt 长什么样

先看一个反面教材：

```
帮我写个翻译功能
```

这不是夸张——很多开发者对 AI 说的第一句话就是这个水平。它的问题出在哪？

**没有角色。** AI 不知道它是"同传译员"还是"字幕组翻译"还是"文学翻译家"。不同的角色会产生完全不同的翻译风格。

**没有格式。** AI 可能返回一段话、一个列表、一个 JSON、或者带表情符号的聊天回复。你无法程序化地解析它的输出。

**没有约束。** 它会不会在翻译前面加"以下是翻译结果："？会不会自作主张加解释性括号？会不会把原文重新排版？你完全不知道。

**没有示例。** 当你说"翻译成中文"，AI 可能在直译和意译之间摇摆，可能保留英文标点也可能转成中文标点——它不知道你的偏好。

现在看 iTranslate 实际使用的翻译 User Prompt（来自 `buildPrompt` 函数）：

```
Translate the following texts. Each text is wrapped with a numbered tag.
Output the translations using the same numbered tags, one per line,
with no additional commentary:

[0] Machine learning is transforming the way we interact with technology.
[1] Deep neural networks can recognize patterns invisible to the human eye.
```

和对应的结果解析器预期输出：

```
[0] 机器学习正在改变我们与技术交互的方式。
[1] 深度神经网络可以识别肉眼不可见的模式。
```

两相对比，好的 Prompt 有四个要素：

**第一，角色。** System Prompt 开头那句 `You are a professional English-to-Chinese translator` 不是客套话——它设定了 AI 的行为基线。一个"专业翻译"不会添加个人评论、不会省略难译的段落、不会在遇到歧义时随便猜一个意思。角色就是行为边界。

**第二，任务。** `Translate the following texts.` 一句话说清楚要做什么。"以下"这个范围限定同样重要——AI 不会把 Prompt 中的指令本身也当成要翻译的内容。在 Claude Code 的使用中，任务描述越窄越好："把 `src/utils/format.ts` 中的三个函数改写为箭头函数"比"重构这个项目"有效一百倍。

**第三，约束。** `with no additional commentary` 是最关键的 5 个单词。没有这个约束，AI 可能会输出"好的，以下是翻译结果：\n\n[0] 机器学习......"——这些"礼貌用语"在程序解析时会变成毒药。负向约束（"不要做什么"）通常比正向约束（"请做什么"）更有力，因为 AI 的默认行为倾向于"多说话"，你需要明确告诉它闭嘴。

**第四，示例。** `[N]` 编号格式本身就是一个隐式示例——AI 看到 `[0]` 开头就知道输出也应该 `[0]` 开头。如果你想让 AI 遵循特定格式，最有效的做法不是反复描述格式规则，而是直接给一个输入输出的例子（few-shot）。iTranslate 的 `[N]` 编号在 User Prompt 中只出现了一次（输入侧），AI 就自动学会了在输出侧使用相同编号——这就是示例的力量。

总结一句话：**好的 Prompt 是把"你想让 AI 做的事"翻译成"AI 不可能误解的指令"。** 如果你的 Prompt 有第二种解读方式，AI 就可能选错的那种。

---

## 14.2 System Prompt 设计模式

iTranslate 项目中有三种典型的 System Prompt 设计模式，每一种对应一类任务类型。理解这三种模式，你就有了应对大多数 AI 编程场景的 Prompt 工具箱。

### 模式 1：翻译/转换型

**适用场景：** 输入→处理→输出，有明确的一对一映射关系。翻译、代码转换、格式迁移、文本改写。

**核心要求：** 保持输入输出的可追溯性。当输入有 50 个段落时，输出必须有 50 个对应项，而且你能确定第 37 项输出对应第 37 项输入。这是程序化消费 AI 输出的前提。

**iTranslate 案例：** 翻译 System Prompt 的 `[N]` 编号方案。

```typescript
function buildPrompt(texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following texts. Each text is wrapped with a numbered tag. Output the translations using the same numbered tags, one per line, with no additional commentary:\n\n${segments}`;
}
```

`[N]` 编号是 iTranslate 整个翻译管线中最简单也最重要的设计决策。它解决了三个问题：
- **对齐**：解析器通过正则 `/^\[(\d+)\]\s*(.+)/` 提取编号，输出和输入按编号一一对应，不需要依赖顺序
- **容错**：如果 AI 漏翻了一段，编号断开了，解析器能检测到缺失的位置
- **简洁**：`[0]` 只占 3 个字符，几乎不消耗额外的 token 预算

**Prompt 模板：**

```
你是一个 [角色]。将以下 [输入类型] 转换为 [输出类型]：
- 每个输入项用 [编号格式] 标记
- 输出使用相同的编号，一个输出项一行
- 仅输出转换结果，不要添加任何额外内容

[输入内容]
```

### 模式 2：结构化提取型

**适用场景：** 从非结构化或半结构化输入中提取结构化信息。信息抽取、实体识别、词典查询、数据解析。

**核心要求：** 定义清晰的输出 schema，并**假设 AI 不会严格遵守格式**。schema 是用来约束 AI 的，不是用来信任 AI 的。

**iTranslate 案例：** 词典 `DICT_SYSTEM_PROMPT` 的 JSON schema。

```typescript
export const DICT_SYSTEM_PROMPT = `You are an English-Chinese dictionary. For the given English word, output a JSON object with this exact structure:

{
  "word": "string",
  "ipa": "string (IPA pronunciation)",
  "pos": "string (part of speech, e.g. n./v./adj./adv./prep.)",
  "definitions": [
    { "zh": "Chinese definition" }
  ]
}

Rules:
- Output 2-3 most common definitions, ordered by frequency
- IPA must use standard International Phonetic Alphabet
- Output ONLY the JSON object, no markdown fences, no extra text`;
```

这个 System Prompt 有两个值得注意的点：

**Schema 用示例而非描述。** 你没有说"返回一个包含 word、ipa、pos 字段的对象"，而是直接给出了一个 JSON 示例。AI 理解示例远比理解抽象描述准确——看到 `"ipa": "string (IPA pronunciation)"`，它知道这个字段应该填音标而不是空字符串。

**但你不能相信 AI 会听话。** 看 `parseDictionaryResponse` 的防御代码：

```typescript
export function parseDictionaryResponse(raw: string): DictionaryResult | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*\n?/i, '')   // 清理 Markdown fence
      .replace(/\n?```\s*$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.word && parsed.pos && Array.isArray(parsed.definitions)) {
      return parsed as DictionaryResult;
    }
    return null;  // 校验失败，返回 null
  } catch {
    return null;  // JSON 解析失败，返回 null
  }
}
```

尽管 System Prompt 明确说 "no markdown fences, no extra text"，AI 仍然可能在输出外层包裹 ` ```json ... ``` `。你花了 5 分钟写了 `parseDictionaryResponse` 的清理逻辑，但如果不写，每次 AI 调皮一下，你的程序就会因为 `JSON.parse` 失败而崩溃。**Prompt 是建议，解析器是纪律。**

**Prompt 模板：**

```
你是一个 [角色]。从以下 [输入] 中提取信息，以 JSON 格式返回：

{
  "field1": "类型和含义",
  "field2": ["数组元素的含义"]
}

规则：
- [约束 1]
- [约束 2]
- 仅输出 JSON 对象，不要包含 Markdown 代码块标记
```

### 模式 3：决策辅助型

**适用场景：** 分析问题、比较方案、给出建议。架构决策、代码审查、Bug 诊断。

**核心要求：** 要求 AI 解释推理过程，不能只给结论。一个没有推理过程的结论，你无法判断它是深思熟虑还是随机猜测。

**在 Claude Code 中的体现：** 当你让 CC 做架构决策时，它默认会先分析现状再给出方案。这不是巧合——Claude 的训练中包含了"解释推理步骤"的偏好。但如果你只问"这段代码有什么问题"，它仍然可能跳过分析直接给修改建议。更好的问法是：

```
这段代码有三个潜在问题：（1）...（2）...（3）... 请逐一分析每个问题的严重程度和修改方案，不要跳过分析直接给最终代码。
```

这个模式在 iTranslate 开发中反复出现：过滤器升级（从字符数阈值到结构化过滤）、DOM 提取器的祖先链检查、词典功能的 JSON fallback 机制——每一个架构决策的背后都是一段 CC 先分析、你确认、再实施的协作流程。

**Prompt 模板：**

```
[背景描述]

请按以下步骤分析：
1. 识别当前方案的优缺点
2. 提出 2-3 个替代方案
3. 比较各方案的 tradeoff（复杂度、性能、可维护性）
4. 给出你的推荐和理由

不要只给结论，展示分析过程。
```

三种模式不是互斥的——一个复杂的 AI 应用可能同时用到三者。iTranslate 的翻译流程中，翻译本身是模式 1（转换型），词典查询是模式 2（结构化提取型），而架构迭代中 CC 的角色是模式 3（决策辅助型）。关键是**识别你当前的任务属于哪种模式，然后选择对应的 Prompt 结构。**

---

## 14.3 格式控制技巧

格式控制是 Prompt 工程中最务实的话题——它不涉及"AI 理解力"的哲学讨论，只解决一个问题：**你怎么确保 AI 输出的内容能被程序可靠地解析。**

### 分隔符策略

分隔符的目的是在 AI 的自由文本输出中标记结构化边界。三种常见策略：

**`[N]` 编号。** 简单、直观、程序易解析。iTranslate 选择它有三个理由：编号天然对应输入输出的一对一关系；正则 `/^\[(\d+)\]\s*(.+)/` 一行代码就能解析；编号占 token 极少（3 个字符）。缺点是不适合非列表型输出——你不能让 AI 返回的 JSON 字段用 `[0]` 标记。

**JSON。** 结构化数据的首选。优势是所有编程语言都有原生 JSON 解析器，不需要手写正则。缺点是 AI 对 JSON 的遵循度不稳定——它可能多输出一个逗号、少写一个引号、在 `{}` 外面包 Markdown 代码块。你需要像 iTranslate 的 `parseDictionaryResponse` 那样做防御性清理。一个经验阈值：如果 schema 超过 5 个字段，优先选 JSON；如果只是键值对或简单列表，`[N]` 更稳妥。

**自定义分隔符。** `---SEGMENT---` 或 `<<<END>>>` 等——选一个正文中不太可能出现的字符组合。适合分段输出但不需要编号的场景。风险是 AI 可能在翻译内容中误用分隔符（比如翻译的文章里正好有 `---`），导致解析器把一个结果拆成两个。缓解方法：用足够长的分隔符（`===ITEM_SEPARATOR===` 比 `---` 安全），并做结果数量的校验。

### 兼容性防御

一条铁律：**不要假设 AI 会严格遵守格式约束。** iTranslate 的 `parseResponse` 函数是这条铁律的最佳注脚：

```typescript
// Try multiple numbering formats that models commonly produce
const patterns = [
  /^\[(\d+)\]\s*(.+)/,       // [0] text
  /^(\d+)[\.\)、]\s*(.+)/,   // 0. text, 0) text, 0、text
];
```

你在 Prompt 里说"使用 `[N]` 格式"，但 AI 可能输出 `0.`、`0)`、`0、`——三种变体都合理（Markdown 有序列表用 `0.`，中文标点习惯用 `0、`）。兼容这四种格式只需要两行正则，但如果不写，10% 的翻译结果会因为格式不匹配而丢失。**Prompt 是愿望，解析器是现实。** 永远按最坏情况写解析器。

另一个防御措施是 **always fallback**。词典 JSON 解析失败时，iTranslate 不会直接报错或显示"查询失败"，而是自动降级为普通翻译：

```typescript
if (mode === 'dictionary') {
  const result = await translateDictionary(text);
  if (result.success) {
    // 词典结果正常使用
  } else {
    // JSON 解析失败 → 降级为翻译
    responseMode = 'translate';
    const translations = await translateBatch([text]);
    // 使用普通翻译结果
  }
}
```

用户体验上，"降级为翻译"远好于"显示错误"——用户不知道也不关心底层是词典还是翻译，他们只关心"选中文字后有没有结果"。

### 限制输出长度

AI 天然倾向于"多说话"——它被训练成乐于助人的助手，而乐于助人的助手会加开场白、加解释、加总结。你需要明确压制这个倾向。

**"仅输出翻译结果"比"请输出翻译结果"更有效。** 多一个"仅"字，让整句话从"建议"变成"指令"。iTranslate 的 User Prompt 用了三重约束：`with no additional commentary` + `one per line` + `using the same numbered tags`。三重约束不是啰嗦——它们从三个不同角度压制了 AI 的"多说话"倾向。

**负向约束比正向约束更有效。** "不要添加任何解释"的效果好于"输出翻译结果"——因为 AI 对负向指令的遵循度高于正向指令。AI 接到正向指令时会想"好的，输出翻译结果，我还可以顺便总结一下要点"，接到负向指令时逻辑是"明确说了不要解释，那我就真的不加"。如果你只能加一个约束，选负向的。

---

## 14.4 Token 预算管理

Token 是 AI API 的计价单位，也是 Prompt 工程中唯一有"硬上限"的约束。超过模型的上下文窗口，输入会被截断，输出会被截断——你的程序会收到不完整的数据。

### 为什么需要了解 Token

三个原因：

**第一，API 按 token 计费。** DeepSeek 的 API 按每百万 token 定价，输入和输出可能不同价。你不需要做精确的成本核算，但需要知道"一个 5000 字的英文页面翻译大约消耗多少 token"，以便在批处理大小和 API 调用次数之间找到经济平衡点。

**第二，输入+输出超过上下文窗口会被截断。** DeepSeek 的上下文窗口是 128K token，看起来很大，但如果你一次塞进 100 个段落的 System Prompt + User Prompt + 翻译结果，再加上推理模型的 thinking token，128K 并非不可能用尽。iTranslate 的分批策略就是为了确保每批都远在窗口限制之内。

**第三，`max_tokens` 参数需要合理估算。** `max_tokens` 是输出上限——设太小翻译被截断，设太大浪费配额且增加延迟。这个值不能拍脑袋填，需要基于输入长度动态估算。

### Token 估算经验值

一个字符不等于一个 token。不同语言的 token 效率差异巨大：

| 语言 | Token 效率 | 说明 |
|------|-----------|------|
| 英文 | ~0.25 token/字符 | 空格分隔单词，高频词占用 1 token |
| 中文 | ~1.5 token/字符 | 每个汉字通常是 1-2 token |
| 日文/韩文 | ~1.2 token/字符 | 介于中英之间 |
| 代码 | ~0.3 token/字符 | 接近英文，但符号密集时更高 |

这些是经验值而非精确值——不同的 tokenizer（DeepSeek、OpenAI、Claude 各自有独立的 tokenizer）会有细微差异。但作为批处理大小的估算，经验值足够用了。

iTranslate 的分批逻辑直接体现了这些经验值：

```typescript
const CJK_TOKEN_RATIO = 1.5;   // 中文/日文/韩文：~1.5 token/字符
const LATIN_TOKEN_RATIO = 0.35; // 英文/法文/德文：~0.35 token/字符
const TARGET_BATCH_TOKENS = 1500; // 每批目标 1500 token

function segmentTokenEstimate(text: string): number {
  const sample = text.length <= 40 ? text : text.slice(0, 40);
  let cjkChars = 0;
  for (const ch of sample) {
    if (isCJK(ch.codePointAt(0) ?? 0)) cjkChars++;
  }
  const ratio = (cjkChars / sample.length) > 0.3 ? CJK_TOKEN_RATIO : LATIN_TOKEN_RATIO;
  return Math.ceil(text.length * ratio);
}
```

注意 `segmentTokenEstimate` 做的不是精确 token 计数——它只取前 40 个字符做采样，判断是 CJK 为主的文本还是拉丁为主的文本，然后乘以对应比率。这对于分批的目的是充分的——你只需要知道这一批大概占用多少 token，不需要精确到个位数。

### 批处理大小的权衡

批处理大小是一个三体问题：

- **批次太大** → 超过 `max_tokens` 限制，翻译被截断，用户看到半截句子
- **批次太小** → API 调用次数增加，"请求-等待-响应"的延迟叠加，总耗时变长
- **并发太多** → 触发 API 的速率限制（429 Too Many Requests）

iTranslate 的选择是 1500 token/批，3 批并发。为什么是 1500？一张网页的单个段落通常在 100-300 英文词（~130-400 token），1500 token/批能装下 3-10 个段落。3 批并发意味着同一时间有 3 个 API 请求在网络中飞行——第 1 批返回后立即发射第 4 批，始终保持 3 个在途请求。这个数字的选择是实测出来的——4 批并发在某些 API 端点上触发 429，2 批并发总耗时增加了 50%，3 是甜点。

### max_tokens 动态估算

iTranslate 的 `estimateTokens` 函数很简短：

```typescript
function estimateTokens(promptChars: number, _textCount: number): number {
  const outputEstimate = Math.ceil(promptChars * 0.6 * 1.5);
  return Math.max(512, Math.min(8192, outputEstimate + 256));
}
```

逻辑拆解：翻译输出通常比输入短（中文翻译比英文原文紧凑），`promptChars * 0.6` 估算翻译后的字符数，再 `* 1.5` 转换为 token 数，加 256 token 安全余量。最终值夹在 512 到 8192 之间——太小的 max_tokens 可能导致长段落的翻译被截断，太大的值浪费配额且可能增加响应延迟。

你不一定要用完全相同的公式。核心原则是：**max_tokens 应该基于输入动态计算，而不是写死一个常数。** 因为你的输入长度是变化的——一段 50 词的文字和一段 500 词的文章需要的输出空间差异巨大。

---

## 14.5 常见 Prompt 反模式

iTranslate 开发过程中踩过的 Prompt 坑，整理为五个反模式。你可以把它们当作检查清单——写完一个 Prompt 后，对照这五条逐条排除。

### 反模式 1：模糊需求型

**现象：** "翻译得好一点"、"生成的结果自然一点"、"把代码写得优雅一点"。

**根因：** 这些修饰词对 AI 来说没有信息量。"好"在翻译中的含义取决于场景——是忠实原文的好、还是读起来流畅的好、还是保留原文句式的好？AI 只能猜你的偏好，而它大概率猜错。

**修正方法：** 把模糊的形容词替换为可执行的标准。"翻译得好一点" → "译文保持原文的信息密度，不增译不漏译，标点风格统一为中文全角"。每当你用"好""自然""优雅"这些词时，停下来问自己：**"我怎么判断 AI 是否满足了这个要求？"** 如果你答不上来，AI 更答不上来。

### 反模式 2：过度约束型

**现象：** 一个 System Prompt 写了 20 条规则，部分规则互相矛盾。比如同时要求"保留原文的所有格式"和"输出为纯文本不要任何标记"——AI 不知道该遵守哪条。

**根因：** 规则越多，冲突概率越高。AI 不是编译器——它不会在规则冲突时报错，而是默默地选择一条遵守、忽略另一条，或者试图同时满足导致输出自相矛盾。

**修正方法：** System Prompt 的规则控制在 5 条以内。超过 5 条时，问问自己：哪些是"必须遵守的硬约束"，哪些是"最好遵守的软建议"？软建议可以放到 User Prompt 中按场景动态添加，留给 System Prompt 的只有铁律。iTranslate 的默认 System Prompt 只有一句话——角色 + 任务 + 约束，没有更多。

### 反模式 3：一次太多型

**现象：** 一个 Prompt 要求 AI 同时做翻译 + 摘要 + 分类 + 格式化——四个任务塞在同一条消息里。

**根因：** AI 在多任务场景下的注意力会分散。在"翻译这段文字并用一句话总结它的主题，然后给它打三个标签"这个 Prompt 中，AI 会在翻译到一半时开始构思标签，导致翻译质量下降，或者忘记做摘要。

**修正方法：** 一个 Prompt 只做一件事。如果需要翻译 + 总结，拆成两次 API 调用。iTranslate 的翻译和词典是两条独立的路径——不是在一个 Prompt 里同时要求，而是通过 `mode` 参数在上游路由中分流。单次调用的额外 latency（几百毫秒）远好于一个试图做所有事但什么都做不好的 Prompt。

### 反模式 4：忽略 Temperature

**现象：** 用默认 temperature（通常 0.7-1.0）做翻译、信息抽取等确定性任务。

**根因：** Temperature 控制输出的随机性。高 temperature 让 AI 在每次生成 token 时从更宽的候选池中采样，结果更"有创意"但也更不稳定。翻译和信息抽取不需要创意——用户希望每次翻译同一段文字得到相同结果。

**修正方法：** 确定性任务（翻译、提取、分类、格式化输出）使用低 temperature（0-0.3）。创意性任务（头脑风暴、文案改写、方案构思）使用中高 temperature（0.5-1.0）。iTranslate 的所有 API 调用都使用 `temperature: 0.1`——不是 0（完全确定性会让输出僵硬），但也远低于默认值。

### 反模式 5：不清理输出

**现象：** 直接使用 AI 的原始输出，不做任何 sanitize。

**根因：** AI 的输出永远比你预期的"脏"——它可能在 JSON 外面包 Markdown fence，可能在翻译前面加"好的，以下是翻译结果：\n\n"，可能在末尾加一个礼貌的"\n\n希望对您有帮助！"。信任 AI 的输出格式会直接导致解析崩溃。

**修正方法：** 任何来自 AI 的输出，在被程序消费之前，必须经过一道 sanitize 步骤。至少做三件事：清理 Markdown fence（`` ```json ... ``` ``）、trim 首尾空白和多余换行、校验必填字段存在且类型正确。iTranslate 的 `parseResponse` 兼容 4 种编号格式、`parseDictionaryResponse` 清理 fence 并校验字段，两道防线确保即使 AI"调皮"了，程序也不会崩溃。

---

## 14.6 核心技巧

- **角色是行为边界，不是客套话。** "你是一个专业的英中翻译"和"请翻译以下内容"的区别在于，前者给了 AI 一套行为准则——专业翻译不应该添加解释、不应该省略难句、不应该自己发挥。

- **示例比描述更有效。** 如果你想让 AI 返回特定格式，直接给一个输入输出对。描述"请用 JSON 格式返回，包含 word 和 definition 字段"不如直接写 `{"word": "hello", "definition": "你好"}`。AI 的模仿能力远强于规则理解能力。

- **负向约束优先于正向约束。** "不要添加解释" > "仅输出翻译结果" > "请翻译"。负向约束直接切断了 AI 添加额外内容的可能性，正向约束只是建议了正确方向。

- **解析器不能相信 Prompt。** Prompt 说 "no markdown fences"，解析器仍然要做 fence 清理。Prompt 是给 AI 的软约束，解析器是给程序的硬防护。两者的关系是"信任但要验证"——Prompt 尽最大努力让 AI 听话，解析器保证即使 AI 不听话也不会崩。

- **Temperature 0.1 是翻译/提取类任务的甜点。** 完全确定的 temperature 0 会让输出僵硬（每个句子结构完全一致），0.7 会让翻译每次不同（用户困惑）。0.1 在确定性和自然度之间取平衡。

- **Token 估算不需要精确到个位数。** 采样判断语言类型 + 经验比率就足够分批使用了。追求精确 token 计数需要引入 tokenizer 库，增加的复杂度远超收益。

- **降级策略是对用户友好的兜底。** 词典 JSON 解析失败时降级为普通翻译，用户体验近乎无损。AI 功能的设计中，总应该有一个"如果 AI 没按预期工作，用户看到什么"的答案。答案永远不应该包含"报错"二字。

---

## 14.7 小结

本章从 iTranslate 项目提取了 Prompt 工程的通用模式。好的 Prompt 有四个要素：角色、任务、约束、示例。三种典型的 System Prompt 模式——转换型、结构化提取型、决策辅助型——覆盖了大多数 AI 编程场景。格式控制的核心原则是"解析器不能相信 Prompt"，兼容性防御比格式要求更值得投入。Token 预算是 AI 编程中唯一的硬约束——了解不同语言的 token 效率、合理设置批处理大小和 `max_tokens`，是保证程序稳定运行的前提。五个反模式（模糊需求、过度约束、一次太多、忽略 Temperature、不清理输出）是 Prompt 工程中的常见陷阱。

最重要的认知转变：**Prompt 不是对话艺术，是软件工程。** 当你把 System Prompt 当作 API 合约来设计、把解析器当作防御层来构建、把 token 预算当作资源限制来管理——你就不是在"和 AI 聊天"，而是在"用 AI 编程"。

下一章，我们将进入软件工程中最具挑战性的任务之一：在不引入新 Bug 的前提下，对现有代码库进行大规模重构。你会看到 Claude Code 如何帮助你在复杂重构中保持方向感。

---

*本章所有 Prompt 案例均来自 iTranslate 项目源码：`src/background/translator.ts`（翻译 Prompt + 解析器）、`src/background/dict-prompt.ts`（词典 Prompt + schema）、`src/shared/constants.ts`（默认 System Prompt）。*
