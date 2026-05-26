# 第 11 章 词典功能：结构化输出

## 1. 本章目标

读完本章，你将理解 iTranslate 词典查询功能的核心——如何用 Prompt 让 AI 输出结构化的 JSON，而不是自由文本。你会看到一份 20 行的 System Prompt 如何约束模型的输出行为、一段 10 行的解析函数如何防御模型的"不听话"、以及一个 `fallback` 分支如何保证用户体验不被 JSON 解析失败打断。本章的重点不是词典学，而是**结构化输出——AI 编程中最重要的 Prompt Engineering 技能之一**。

---

## 2. 词典 vs 翻译的本质区别

翻译和词典查询对用户来说都是"输入文字，返回结果"，但在 AI 的输出格式上是完全不同的东西。

翻译的输出是**扁平文本**——一段英文进去，一段中文出来。模型只需要理解语义，输出可以是任何自然语言表达。用户看到译文后，理解就结束了。

词典的输出是**结构化数据**——一个单词进去，需要返回音标、词性、多个义项。这些信息有明确的字段边界和类型约束。用户不仅要知道"这个词什么意思"，还需要知道"怎么读"、"什么词性"、"有哪些不同用法"。

这对 AI 的要求完全不同：

- 翻译要求的是**语义保真度**——译文不能曲解原文
- 词典要求的是**结构保真度**——输出必须严格遵循 JSON schema，一个字段都不能少

为什么不用传统词典 API 而用 AI？传统词典 API（如 Merriam-Webster、Oxford）词库固定，更新慢。新词、俚语、专业术语、缩写——这些在社交媒体和技术文档中大量出现的内容，传统 API 往往查不到。AI 的优势在于：它不是一个静态词库，而是理解语言本身。即使在训练数据中没有收录某个词，AI 也能根据上下文推断含义并给出结构化的释义。更重要的是，Prompt 让你完全控制输出格式——要几个义项、要不要音标、词性用什么标签格式，都是你说了算。

---

## 3. JSON 输出格式设计

iTranslate 的词典输出目标是一份精简但信息完备的 JSON：

```json
{
  "word": "example",
  "ipa": "/ɪɡˈzæmpəl/",
  "pos": "noun",
  "definitions": [
    {"zh": "例子；实例"},
    {"zh": "榜样；模范"}
  ]
}
```

四个字段各有设计考量：

**`word`：返回原词，客户端校验用。** 虽然请求时已经知道查的是哪个词，但让模型在响应中返回原词有两个好处：一是解析端可以交叉校验（"模型返回的词和我查的词是不是同一个？"）；二是对齐——未来如果要支持批量词典查询，每个响应自带 word 字段就不需要外部维护映射关系。

**`ipa`：国际音标，全局通用。** 音标标注有很多体系——美式音标用特殊符号（如 ā、ē），英式用 DJ 音标，国际音标（IPA）是语言学界最通用的标准。选 IPA 的原因很简单：Unicode 原生支持，不需要特殊字体，任何平台都能显示。美式/英式发音差异不是 iTranslate 当前阶段需要解决的问题——用户查一个生词，看到一个 IPA 音标就够了。

**`pos`：词性标签。** 用英文缩写（noun/verb/adjective 等）而非中文全称（名词/动词/形容词），原因是词性标签在 UI 上以胶囊徽章形式出现，英文缩写更紧凑。`pos` 不是数组——一个词在特定查找中只有一个主词性，多词性的情况由多个义项的分组来体现。

**`definitions`：义项数组，按常用度排序。** 每条义项是一个 `{ zh: string }` 对象。选择数组而非字典结构是因为义项天然有顺序——常用义项排前面，生僻义项排后面。数组保留了这种顺序关系，而字典（`{ "1": "...", "2": "..." }`）虽然也能表达顺序，但解析端需要额外的排序逻辑。

为什么选这个结构？够用但不冗余。四个字段精确覆盖了"查词典"这个动作需要的信息——这个词是什么、怎么读、什么词性、有哪些意思。不包含例句（例句会让响应变长、token 消耗增加、解析变复杂），不包含词源（绝大多数用户不关心），不包含同反义词（那是另一个功能）。每个字段都有明确的"存在理由"，没有"万一以后会用到"的冗余设计。

---

## 4. Prompt 如何控制 JSON 输出

这是本章的核心——用 System Prompt 精确约束 AI 的输出格式。iTranslate 的词典 System Prompt 全文如下：

```
You are an English-Chinese dictionary. For the given English word,
output a JSON object with this exact structure:

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
- Output ONLY the JSON object, no markdown fences, no extra text
```

拆解这份 Prompt 的设计逻辑：

**角色设定："You are an English-Chinese dictionary."** 这不是随便写的寒暄——角色设定锚定了模型的"身份"。当你告诉模型"你是一个词典"，它会在训练数据中找到与词典编纂者相关的语言模式和输出风格，自动抑制闲聊、解释、评价等无关输出。对照实验：如果把这句话去掉，模型有时会在 JSON 前面加一句 "Here is the definition for 'example':"，这行额外文字就破坏了下游的 JSON 解析。

**结构示例（Few-shot Prompting）：** 直接给模型一个完整的 JSON 对象作为格式模板，这比纯文字描述"输出 word、ipa、pos、definitions 四个字段"准确得多。模型在看到目标格式的形状后，会无意识地对齐字段名、花括号位置、引号类型。人类理解格式规范和看到格式示例的差异，在模型身上同样存在——"照着这个格式输出"比"输出这种结构"更不容易出错。

**约束语句的三层递进：**

1. "Output 2-3 most common definitions, ordered by frequency" — 控制义项数量和排序。不加这句的话，模型可能输出 8 个义项（包括生僻用法），浪费 token 且用户看到一大片义项也无从选择。2-3 个是"够用不冗余"的甜蜜点。

2. "IPA must use standard International Phonetic Alphabet" — 控制音标格式。有些模型在没被明确约束时可能输出美式音标（如 `/ig'zampəl/`）而非 IPA。加这一句把格式锁定到 IPA 标准。

3. "Output ONLY the JSON object, no markdown fences, no extra text" — 这是整份 Prompt 中最关键的一句。模型在输出代码或结构化数据时，天然倾向于用 Markdown 代码块（\`\`\`json ... \`\`\`）包装——这是训练数据中绝大多数结构化输出的格式习惯。但客户端需要一个裸 JSON 字符串直接 `JSON.parse()`，三个反引号让它从合法 JSON 变成非法文本。明确禁止 fences 和额外文字是"把话说死"——不给模型留任何"发挥"的空间。

**为什么约束如此严格？** 词典功能的核心可靠性取决于一个判断——`JSON.parse()` 能否成功。如果解析失败，整个词典查询就失败了（虽然后续有降级，但那是兜底策略）。AI 的"创造性"在这里是敌人——用户不需要一个"有趣的解释"、"详细的例句"、"近义词推荐"，需要的是准确的结构化数据。每一行 Prompt 的措辞都服务于一个目标：**让模型的输出可被程序直接消费，而不是被人阅读**。这是 AI 编程和 AI 聊天之间的分水岭——前者要求机器可解析，后者要求人类可理解。

**Temperature 选择：0.1 而非 0。** 词典模式同样使用 `temperature: 0.1`。为什么不设成 0（绝对确定性）？因为 Temperature 0 在部分模型上会触发一种"重复循环"行为——模型在一些边界情况下会不断重复相同的 token。0.1 引入了一点点随机性，足以打破这种循环，同时又足够低来保证输出的结构一致性。这是一种工程上的防御性选择，不是对"创造性"的妥协。

另外注意 `thinking: { type: 'disabled' }` 参数——对于 DeepSeek 等推理模型，如果不显式禁用 thinking，模型会在输出 JSON 之前生成一段推理链，这段推理链会混在 `choices[0].message.content` 中，导致 JSON 解析失败。这不是 Prompt 能解决的问题，必须在 API 参数层面禁用。

---

## 5. 解析与降级

即使 Prompt 写得再精确，AI 的输出也不完全可控。`parseDictionaryResponse()` 是一道防御性闸门：

```typescript
export function parseDictionaryResponse(raw: string): DictionaryResult | null {
  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*\n?/i, '')   // 清除开头 fences
      .replace(/\n?```\s*$/, '')              // 清除结尾 fences
      .trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.word && parsed.pos && Array.isArray(parsed.definitions)) {
      return parsed as DictionaryResult;
    }
    return null;
  } catch {
    return null;
  }
}
```

三步防御：

**第一步：清除 Markdown fences。** 尽管 Prompt 明确说了"no markdown fences"，但模型有时仍然会输出 \`\`\`json ... \`\`\`——训练数据中太多的代码块格式让这个习惯根深蒂固。两个正则分别清除开头和结尾的 fences，支持 `\`\`\`` 和 `\`\`\`json` 两种格式。这一步把"模型不听话"的风险消化在了解析层。

**第二步：JSON.parse()。** 标准解析。任何不合法的 JSON（缺少引号、多余逗号、字段名未加引号）都会在这里抛出异常。

**第三步：字段校验。** 即使 JSON 解析成功，也必须检查三个必填字段：`word`（原词）、`pos`（词性）、`definitions`（义项数组）。模型可能返回一个合法 JSON 但缺失某个字段——比如 `ipa` 缺失不会导致解析失败（因为 UI 可以跳过音标展示），但 `definitions` 缺失意味着没有翻译结果，必须判定为失败。

**降级策略：失败不等于出错。**

在 `handleTranslate()` 的路由中，词典模式的 fallback 逻辑非常简洁：

```typescript
if (mode === 'dictionary') {
  const result = await translateDictionary(text);
  if (result.success) {
    // 正常词典结果
  } else {
    // 降级为翻译模式
    mode = 'translate';
    const translations = await translateBatch([text]);
    // 用普通翻译结果展示
  }
}
```

如果词典 JSON 解析失败，路由器**不抛出错误**——它静默切换到 `translate` 模式，把单词当成普通文本翻译一遍。用户看到的是一个正常的翻译结果（"example → 例子"），而不是一个技术错误信息（"JSON 解析失败"）。对用户来说，这条链路是无中断的——他们不会知道背后发生了一次降级。只有开发者在控制台能看到降级日志 `Dictionary parse failed, falling back to translate`。

为什么需要降级？因为 AI 的输出不完全可控——这是一个工程事实，不是理论问题。与其赌模型"一定按格式输出"，不如在系统架构层面承认不确定性并设计兜底策略。降级保证了：词典是增值功能，不是单点故障。

---

## 6. 可扩展性设计

当前 `dict-prompt.ts` 只包含一份硬编码的英→中词典 Prompt。`DICT_SYSTEM_PROMPT` 是模块级常量，`dictUserPrompt()` 只接受一个 `word` 参数——没有语言参数、没有配置注册表、没有动态选择逻辑。

扩展方向很清晰：

- **语言对注册表**：一份 `Map<string, PromptConfig>`，key 为 `"English→Chinese"`、`"Chinese→English"`、`"Japanese→English"` 等，value 为各自的 System Prompt 和 User Prompt 模板
- **每对语言有独立的 Prompt**：不同语言的词典学结构不同。中→英词典不需要 IPA 音标（中文字没有音标体系），但可能需要拼音字段。日→英词典需要标注假名读音。通用 JSON 结构需要按语言对调整。
- **路由器根据 `sourceLang + targetLang` 选择 Prompt**：`handleTranslate()` 在词典模式下查找注册表中匹配的语言对条目，找到则使用对应 Prompt，找不到则降级为翻译模式

为什么现阶段不扩展？

遵循 YAGNI 原则（You Aren't Gonna Need It）。当前用户群 90% 以上的翻译需求是英→中，词典查询也只在这一个语言方向上触发。为"未来可能"的中→英词典或日→英词典提前实现注册表，会增加代码量和维护成本，却满足不了当下的任何用户需求。但架构上已经预留了扩展点——`dict-prompt.ts` 作为独立模块，`handleTranslate()` 的词典分支只依赖 `translateDictionary()` 的返回值格式。将来加第二个词典时，改 `dict-prompt.ts` 增加注册表、改 `translator.ts` 增加语言对参数、改 `router.ts` 传入语言信息——三个文件的局部改动，不涉及 UI 层和缓存层的任何变更。

---

## 7. CC 对话实录

以下是设计词典 Prompt 时的真实迭代过程：

```
[我的 Prompt]
> 做一个英文词典功能，用户查单词时输出音标、词性、
> 中文释义。结果用 JSON 格式。

[CC 实现 v1]
> 写了一个 System Prompt，让模型返回 JSON。
> 你试试效果。

[我测试]
> 有时候在前面多了一行"Here is the definition"，
> JSON.parse 失败了。得加一句"不要额外文字"。

[CC 实现 v2]
> 加了"Output ONLY the JSON object"。另外加了正则
> 清除 Markdown fences 做防御。再试试。

[我测试]
> 大部分正常了。但有一次返回了 8 个义项——太长了。
> 限制 2-3 个常用义项就够了。

[CC 实现 v3]
> 加了"Output 2-3 most common definitions"。现在
> 的解析层是两层防御——Prompt 层面约束 + parse 函数
> 清除 fences 和字段校验。

[我测试]
> OK 了。但如果 JSON 解析失败会怎样？用户应该看到
> 错误提示还是？

[CC 回复]
> 不建议显示错误。可以在 router 层做降级——词典失败
> 时自动切到翻译模式，用户看到的是正常的翻译结果，
> 不会感知到词典功能的内部失败。降级日志记录到控制台。
```

```
[为什么这样问]
💡 结构化输出是 AI 编程中最重要的 Prompt Engineering 技能。核心原则是：
Prompt 负责"要求"，解析层负责"兜底"，路由层负责"降级"。三层防线，
每一层解决上一层无法保证的问题——Prompt 解决意图，解析解决格式，降级
解决体验。不要试图用"更长的 Prompt"来覆盖所有边界情况——Prompt 越长，
模型越容易忽略关键约束。把"模型不听话"当做一个工程问题来处理，
而不是试图用更严厉的口吻让它听话。
```

---

## 8. 核心技巧

1. **Few-shot 比纯文字描述更可靠。** 在 Prompt 中给出目标 JSON 的完整示例，比用文字描述"输出一个包含 word、ipa、pos、definitions 的对象"准确得多。模型看到格式的形状后，输出会自然对齐。

2. **Prompt 中明确禁止 fences 和额外文字。** Markdown 代码块是模型输出结构化数据的天然习惯，"no markdown fences, no extra text"是 JSON 输出的必加约束——少了这句话，十次中有三次会被 fences 包裹。

3. **解析层做 defense-in-depth。** 即使 Prompt 禁止了 fences，解析器仍然用正则清除它们。不信任 Prompt 的约束力，是防御性编程在 AI 时代的延续——"Never trust user input"在这里变成了"Never trust model output"。

4. **校验必填字段，不只是 JSON.parse。** 合法的 JSON 不代表合法的词典结果。`word`、`pos`、`definitions` 三个字段缺一不可，校验逻辑写在 `parseDictionaryResponse` 中，解析和校验是一体的。

5. **降级保证用户体验无中断。** 词典 JSON 解析失败 → 自动切换翻译模式。用户看到的是翻译结果，不是错误信息。增值功能不能成为单点故障——这是系统设计的原则，不是 Prompt Engineering 的范畴。

6. **`thinking: { type: 'disabled' }` 阻止推理模型污染输出。** DeepSeek 等推理模型会在输出 JSON 之前生成推理链。不显式禁用 thinking，推理链会混入 `content` 字段，破坏 JSON 解析。

---

## 9. 小结

- **词典功能的核心不是语言学，是结构化输出。** 翻译输出扁平文本，词典输出 JSON——这个差异决定了一整套不同的 Prompt 设计和解析策略。
- **JSON 结构设计遵循"够用不冗余"原则。** word/ipa/pos/definitions 四个字段精确覆盖查词典的信息需求，不含例句、词源、同反义词——每个字段都有明确的"存在理由"。
- **Prompt 的三层约束：角色设定锚定身份、结构示例引导格式、禁止语句消除噪音。** "no markdown fences, no extra text"是结构化输出 Prompt 的标配约束。
- **解析层防御性处理：清除 fences → JSON.parse → 字段校验。** 不信任模型输出完全遵守 Prompt 约束，程序端必须做自己的输入清洗和结构验证。
- **降级兜底是工程纪律，不是妥协。** 词典 JSON 解析失败 → 自动切翻译模式。用户永远看到的是可用结果，不是技术错误。
- **扩展点预留但不提前实现，遵循 YAGNI。** `dict-prompt.ts` 独立模块化，注册表方向清晰，但非当前用户需求不超前编码。

> 下一章：第 12 章「测试：70 个用例的覆盖策略」——如何在 jsdom 环境中 mock Chrome API、如何设计测试数据以覆盖边界条件、以及 fake-indexeddb 如何让缓存层测试变得可能。
