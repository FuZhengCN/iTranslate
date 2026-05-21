# UI 通用化设计 Spec

> 去除所有硬编码的 DeepSeek/EN→ZH 假定，让 UI 体现"通用多模型多语言翻译器"定位。

**Goal:** 用户从设置页选择源/目标语言后，Popup 和 API 调用自动适配。任何 OpenAI 兼容模型均可接入。

**Architecture:** 新增 sourceLang / targetLang 两个设置字段，系统提示词由语言选择自动生成（可覆盖编辑）。Popup 标签从设置动态读取。所有 DeepSeek 专有文案替换为通用文案。

---

## 改动范围

### 1. 设置页 — 新增语言选择区域

**文件:** `src/settings/settings.html`, `src/settings/settings.ts`, `src/settings/settings.css`

- 新增双下拉框（Source / Target）+ 交换按钮（⇄），布局为并排紧凑型
- 语言列表：English, 中文, 日本語, 한국어, Français, Deutsch（6 种）
- 交换按钮点击后将 Source 和 Target 互换
- 语言变化时自动生成系统提示词，填入文本框

### 2. 设置页 — 文案通用化

**文件:** `src/settings/settings.html`, `src/settings/settings.ts`

- API Endpoint 提示：`"Default: DeepSeek API. Change if using a proxy."` → `"Any OpenAI-compatible API endpoint"`
- API Key 提示：`"Your DeepSeek API key. Stored locally..."` → `"Stored locally in your browser"`
- 测试连接成功：`"DeepSeek API is reachable."` → `"Connection successful"`
- System Prompt 标签增加说明：`"(auto-generated, editable)"`

### 3. Popup — 语言标签动态化

**文件:** `src/popup/popup.html`, `src/popup/popup.ts`, `src/popup/popup.css`

- `EN → ZH` hardcode 标签 → 动态读取 `sourceLang → targetLang` 显示为 `"English → 中文"`
- `syncState()` 同时拉取语言配置

### 4. 类型定义 — 新增字段

**文件:** `src/shared/types.ts`

- `Settings` 增加 `sourceLang: string` 和 `targetLang: string`

### 5. 默认值

**文件:** `src/shared/constants.ts`

- `sourceLang` 默认 `'English'`
- `targetLang` 默认 `'中文'`
- 系统提示词默认值改为 `'You are a professional ${sourceLang}-to-${targetLang} translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the translation, nothing else.'`

### 6. 翻译器 — 提示词动态化

**文件:** `src/background/translator.ts`

- `buildPrompt` 使用设置中的 `systemPrompt`（已支持，无需改动）

### 7. 提示词自动生成逻辑

**文件:** `src/settings/settings.ts`

- `generateSystemPrompt(sourceLang, targetLang): string` — 根据语言选择生成标准翻译提示词
- 语言切换时自动更新提示词文本框
- 切换前如果用户已手动修改，弹 confirm 确认是否覆盖

### 8. Storage 迁移

**文件:** `src/shared/storage.ts`

- `getSettings()` 合并默认值，确保新增字段有 fallback
- 旧用户缺失 `sourceLang` / `targetLang` → 自动填充为 `'English'` / `'中文'`

---

## 不改变

- API 调用方式（OpenAI 兼容 `/chat/completions`）
- 翻译流程（extract → cache → translate → render）
- 图标、配色方案
- 按钮文案（`Translate This Page`）
- 缓存逻辑

---

## 语言代码映射

下拉显示名称 → API 使用的语言名称：

| 显示 | 代码/名称 |
|------|----------|
| English | English |
| 中文 | Chinese |
| 日本語 | Japanese |
| 한국어 | Korean |
| Français | French |
| Deutsch | German |
