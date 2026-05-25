# 划词词典 Prompt 设计

## 背景

当前划词翻译对所有选中内容使用同一套翻译 prompt，不区分短语和单词。用户划单个单词时，意图是"查词"而非"翻译"——需要音标、词性、多义项等词典级信息。

## 目标

为单单词划词提供词典级查词体验，多词短语保持现有翻译行为。零新增用户操作，零 UI 入口增加。

---

## 架构

### 1. 单词判断与消息分发

**位置**：`src/content/selection.ts`，`showBubble()` 调用前

```ts
function isSingleWord(text: string): boolean {
  return text.trim().split(/\s+/).length === 1;
}
```

消息携带 `mode` 字段：

```ts
const response = await sendToBgWithRetry({
  action: 'translate',
  segments: [{ id: 'sel_0', text }],
  mode: isSingleWord(text) ? 'dictionary' : 'translate',
});
```

### 2. Background 消息路由

**位置**：`src/background/index.ts`

验证逻辑不变。`mode` 透传给 `handleTranslate`：

```ts
handleTranslate(segments, _sender.tab?.id, message.mode ?? 'translate')
```

### 3. Router 分支

**位置**：`src/background/router.ts`

`handleTranslate` 新增第三个参数 `mode: 'translate' | 'dictionary'`，默认 `'translate'`。

mode 影响两个决策：
- **缓存 key 前缀**：`dict_` vs `seg_`
- **API 调用路径**：mode='dictionary' 时走 `translateDictionary()`，否则走 `translateBatch()`

缓存 value 统一存 JSON 字符串到 `CacheEntry.translated` 字段：
- 翻译：纯文本 `"微妙的"`
- 词典：JSON 字符串 `'{"word":"subtle","ipa":"/ˈsʌt.əl/","pos":"adj.","definitions":[{"zh":"微妙的"}]}'`

返回给前端的结果新增 `mode` 字段以区分渲染方式：
```ts
{ success: true, mode: 'dictionary', results: [{ id:'sel_0', original:'subtle', translated: '<JSON string>' }] }
```

### 4. 词典 Prompt

**位置**：`src/background/dict-prompt.ts`（新文件）

System prompt 硬编码，不走 `settings.systemPrompt`，用户不可编辑：

```
You are an English-Chinese dictionary. For the given English word, output a JSON object with this exact structure:

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

User prompt：`Define: ${word}`

API 调用参数与翻译一致（temperature 0.1, thinking disabled），复用 `fetch` + 重试逻辑。

### 5. JSON 解析与降级

**位置**：`src/background/dict-prompt.ts`

```ts
function parseDictionaryResponse(raw: string): DictionaryResult | null {
  // 清理 markdown fences → JSON.parse → 字段校验
  // 失败返回 null
}
```

解析失败 → 后台自动降级走翻译。前端无感，得到的是 `{ mode: 'translate', ... }`，正常展示翻译结果。

### 6. 缓存隔离

| 场景 | Key 前缀 | 示例 |
|------|----------|------|
| 翻译 | `seg_` | `seg_abc123_3_Chinese` |
| 词典 | `dict_` | `dict_abc123_3_Chinese` |

同一单词的词典和翻译结果互不覆盖。

### 7. 前端渲染

**位置**：`src/content/selection.ts`，`showBubble()` 中根据 `response.mode` 分支：

- `mode === 'dictionary'`：渲染词典气泡布局
- `mode === 'translate'`（默认）：现有翻译气泡布局

词典气泡结构（与翻译气泡一脉相承）：

```
┌─ Bar: 渐变线 4px ─────────────────────┐
│  iTranslate               [词典] 标签  │  ← header
├────────────────────────────────────────┤
│  subtle  /ˈsʌt.əl/  [adj.]            │  ← 词+音标+词性
│  ────────────────────────────────────  │  ← 分隔线
│  ① 微妙的；不明显的                    │  ← 主义项
│  ② 巧妙的；含蓄的                      │  ← 次义项
│  ③ 敏锐的；有洞察力的                  │  ← 次义项
├────────────────────────────────────────┤
│  [复制]                          [×]   │  ← actions
└────────────────────────────────────────┘
```

设计语言完全复用现有翻译气泡：
- 背景 `linear-gradient(180deg, #FCFBF9, #F5F3EF)`
- 圆角 14px，阴影 `0 4px 20px rgba(42,48,56,0.06)`
- 词条头 15px / `#2A3038` / weight 600（对应翻译气泡译文字号）
- 音标 12px / `#9BA8B5`
- 词性标签：10px / `#6BAECF` / bg `rgba(107,174,207,0.08)`
- 主义项编号 `#6BAECF`，释义 `#2A3038`
- 次义项编号 `#9BA8B5`，释义 `#5A6270`
- 关闭按钮 `margin-left: auto` 推至最右

### 8. 气泡位置

词典气泡使用与翻译气泡相同的 `getBubblePosition(rect)` 定位逻辑，无特殊处理。

---

## 不做的

- ❌ 英文例句（token 消耗大、气泡体积大）
- ❌ 语境匹配标记（上下文引入复杂度、不稳定）
- ❌ 多语言词典（当前仅英→中）
- ❌ 用户自定义词典 prompt（内置固化）

---

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/background/dict-prompt.ts` | 新增 | 词典 system prompt + user prompt + JSON 解析 |
| `src/background/index.ts` | 修改 | mode 字段透传 |
| `src/background/router.ts` | 修改 | mode 参数，缓存前缀分支，API 路径分支 |
| `src/content/selection.ts` | 修改 | 单词判断、mode 发送、词典气泡渲染 |
| `src/content/styles.css` | 修改 | 词典气泡样式（词条头、义项列表、词性标签等） |
| `src/shared/types.ts` | 可能修改 | 如需新增类型（DictionaryResult 等） |

## 不涉及

- `src/content/index.ts`（整页翻译，不走词典）
- `src/shared/storage.ts` / `settings`（词典 prompt 不存 settings）
- `manifest.json`
- 任何 popup/settings 页面
