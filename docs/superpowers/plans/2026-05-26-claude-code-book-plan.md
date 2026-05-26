# 《Claude Code + DeepSeek 从入门到精通》写作实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成《Claude Code + DeepSeek 从入门到精通》全书 17 章的初稿写作，目标 7-10 万字，交付可提交微信读书「写完记发」的完整书稿。

**Architecture:** 分四个阶段：环境搭建 → Part 1 入门篇（4 章）→ Part 2 实战篇（9 章）→ Part 3 进阶篇（4 章）→ 全书审校与平台准备。每章独立 Markdown 文件，Git 管理版本。

**Tech Stack:** Markdown 写作、Git 版本管理、iTranslate 项目源码作为素材来源

---

## 文件结构

```
book/
├── README.md                  # 写作规范与进度追踪
├── manuscript.md              # 全书合稿（编译脚本生成）
├── template.md                # 每章写作模板
├── part1-getting-started/
│   ├── ch01-why-cc-ds.md      # 为什么选 Claude Code + DeepSeek
│   ├── ch02-setup.md          # 环境搭建
│   ├── ch03-cc-basics.md      # Claude Code 核心操作
│   └── ch04-first-task.md     # 第一个 AI 编程任务
├── part2-itranslate/
│   ├── ch05-planning.md       # 立项：从想法到 Spec
│   ├── ch06-scaffold.md       # 脚手架：Manifest V3 扩展
│   ├── ch07-engine.md         # 翻译引擎：Prompt 设计
│   ├── ch08-content-inject.md # 内容注入：DOM 操作
│   ├── ch09-popup-msg.md      # 交互层：Popup 与消息
│   ├── ch10-selection.md      # 划词翻译：事件处理
│   ├── ch11-dictionary.md     # 词典功能：结构化输出
│   ├── ch12-visual.md         # 视觉打磨：主题与动画
│   └── ch13-testing-release.md # 测试与发布
├── part3-advanced/
│   ├── ch14-prompt-patterns.md # Prompt 工程模式
│   ├── ch15-refactoring.md    # 复杂重构策略
│   ├── ch16-multi-model.md    # 多模型协作
│   └── ch17-pitfalls-20.md    # 实战踩坑 20 条
└── assets/
    ├── screenshots/           # CC 交互截图
    └── diagrams/              # 架构示意图
```

---

## 阶段一：写作环境搭建

### Task 1: 创建书籍目录结构与写作模板

**Files:**
- Create: `book/README.md`
- Create: `book/template.md`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p book/part1-getting-started book/part2-itranslate book/part3-advanced book/assets/screenshots book/assets/diagrams
```

- [ ] **Step 2: 创建写作模板 `book/template.md`**

```markdown
# 第 X 章：[标题]

> **本章目标**：（3 句话说明读者读完能做什么）
> **预计字数**：3000-5000 字
> **状态**：📝 写作中 / ✅ 初稿完成 / 🔍 审校中

---

## [第 1 节标题]

（正文内容）

### 实战任务

（真实代码 + CC 对话记录，带标注框）

```
[我的 Prompt]
> ...

[Claude Code 的回复]
（精简展示关键代码和解释）

[为什么这样问]
💡 ...
```

---

## [第 N 节标题]

---

## 核心技巧

- **技巧 1**：...
- **技巧 2**：...
- **技巧 3**：...

## 小结

> 💡 **本章要点**
> - 要点 1
> - 要点 2
> - 要点 3

## 待补充

- [ ] 截图：...
- [ ] 架构图：...
- [ ] 代码示例：...
```

- [ ] **Step 3: 创建进度追踪文件 `book/README.md`**

```markdown
# 《Claude Code + DeepSeek 从入门到精通》写作进度

| 章 | 标题 | 状态 | 字数 | 截图 | 审校 |
|----|------|------|------|------|------|
| 1 | 为什么选 Claude Code + DeepSeek | 📝 | - | - | - |
| 2 | 环境搭建 | 📝 | - | - | - |
| ... (17 行) | | | | | |
```

- [ ] **Step 4: 提交**

```bash
git add book/ && git commit -m "chore: 初始化书籍目录结构与写作模板"
```

---

## 阶段二：Part 1 入门篇（第 1-4 章）

### Task 2: 第 1 章 — 为什么选 Claude Code + DeepSeek

**Files:** Create: `book/part1-getting-started/ch01-why-cc-ds.md`
**素材来源：** 本次 brainstorming 对话中的竞品分析、CLAUDE.md 架构文档

- [ ] **Step 1: 搜集素材**

```bash
# 列出 AI 编程工具对比的关键信息
git log --oneline -30  # 了解项目全貌
```

- [ ] **Step 2: 撰写初稿（~3500 字）**

按模板结构写：
1. **AI 编程工具格局**（500 字）— Copilot/Cursor/CC/Windsurf 各自定位，附对比表
2. **为什么 Claude Code 是当前最强**（800 字）— 上下文理解、Agents、Skills 机制、与 IDE 插件的本质区别
3. **为什么配 DeepSeek**（800 字）— 成本对比（附真实账单）、中文理解、性价比路线
4. **组合的实际效果**（600 字）— 用 iTranslate 开发中的真实数据点（提交次数、代码行数、开发时间、API 费用）
5. **本书的学习路径**（300 字）— 三段结构预览图
6. **核心技巧 + 小结**

- [ ] **Step 3: 自检**

对照 spec 检查：是否覆盖了三大卖点？口语化"?字数在 3000-5000？包含对比表？

- [ ] **Step 4: 提交**

```bash
git add book/part1-getting-started/ch01-why-cc-ds.md && git commit -m "feat: 第1章初稿 — 为什么选CC+DeepSeek"
```

---

### Task 3: 第 2 章 — 环境搭建

**Files:** Create: `book/part1-getting-started/ch02-setup.md`

- [ ] **Step 1: 撰写初稿（~3500 字）**

1. **前提条件**（300 字）— Node.js 18+、Git、终端基础
2. **安装 Claude Code CLI**（500 字）— npm 安装、验证、首次启动、认证
3. **获取 DeepSeek API Key**（500 字）— 注册、充值（¥10 起步）、生成 Key、配置到 CC
4. **第一条指令**（600 字）— 用 CC 让 DeepSeek 生成 Hello World → 分析回复结构
5. **关键配置项**（500 字）— CLAUDE.md 是什么、settings.json、权限设置
6. **常见坑**（300 字）— 网络代理、API Key 格式、Node 版本
7. **核心技巧 + 小结**

- [ ] **Step 2: 截取关键截图**

CC 安装成功界面、第一条指令的完整回复、settings.json 配置

- [ ] **Step 3: 自检 + 提交**

```bash
git add book/part1-getting-started/ch02-setup.md book/assets/screenshots/ && git commit -m "feat: 第2章初稿 — 环境搭建"
```

---

### Task 4: 第 3 章 — Claude Code 核心操作

**Files:** Create: `book/part1-getting-started/ch03-cc-basics.md`

- [ ] **Step 1: 撰写初稿（~4000 字）**

1. **Slash Commands 全景**（800 字）— /help、/clear、/compact、/config、/review 等核心命令，每个一句话 + 使用场景
2. **Agents 机制**（800 字）— 什么是 Agent、内置 Agent 类型（Explore/Plan/Code Reviewer）、何时用哪种、子代理并行
3. **Skills 系统**（800 字）— 技能即指令集、触发方式、常用 Skills（brainstorming/tdd/debugging）、如何读 Skill 内容
4. **Hooks 机制**（600 字）— 事件驱动的自动化、常见 Hook 场景（PreToolUse/PostToolUse）、settings.json 配置
5. **日常工作流**（500 字）— 推荐的开发循环：描述需求 → CC 探索 → 审阅方案 → 实现 → 验证
6. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

```bash
git add book/part1-getting-started/ch03-cc-basics.md && git commit -m "feat: 第3章初稿 — CC核心操作"
```

---

### Task 5: 第 4 章 — 第一个 AI 编程任务

**Files:** Create: `book/part1-getting-started/ch04-first-task.md`

- [ ] **Step 1: 设计实战任务**

选一个独立的小脚本，能在一章内完成，比如"用 CC+DS 写一个批量重命名文件的 CLI 工具"。要求：
- 不依赖 iTranslate 项目（读者还没开始 Part 2）
- 展示完整的 Prompt → 回复 → 迭代循环
- 包含错误处理（AI 第一次写错了怎么办）

- [ ] **Step 2: 执行任务并记录对话**

实际用 CC+DS 完成这个任务，保留关键对话回合。

- [ ] **Step 3: 撰写初稿（~4000 字）**

1. **任务描述**（300 字）— 要做什么、输入输出
2. **第一轮：初始 Prompt**（600 字）— 完整 Prompt + CC 回复 + "为什么这样问"分析
3. **第二轮：修 Bug**（600 字）— 发现什么问题、怎么描述给 CC、回复如何
4. **第三轮：增强功能**（600 字）— 加 dry-run 模式等
5. **复盘：完整的 Prompt-Respond-Iterate 循环**（500 字）— 提炼出通用模式
6. **核心技巧 + 小结**

- [ ] **Step 4: 自检 + 提交**

```bash
git add book/part1-getting-started/ch04-first-task.md && git commit -m "feat: 第4章初稿 — 第一个AI编程任务"
```

---

## 阶段三：Part 2 实战篇（第 5-13 章）

### Task 6: 第 5 章 — 立项：从想法到 Spec

**Files:** Create: `book/part2-itranslate/ch05-planning.md`
**素材来源：** git log 初始提交、`docs/superpowers/specs/` 中的早期 spec

- [ ] **Step 1: 搜集素材**

```bash
git log --oneline --reverse | head -20  # 项目最早期的提交
ls docs/superpowers/specs/              # 查看所有 spec 文件
```

- [ ] **Step 2: 撰写初稿（~4000 字）**

1. **想法阶段**（500 字）— "我想要一个翻译扩展" 这个模糊需求
2. **用 CC 做需求澄清**（800 字）— brainstorming skill 的使用、提出关键问题、需求收敛过程
3. **技术选型讨论**（800 字）— Manifest V3 vs V2、Vite vs Webpack、crxjs 的取舍、CC 的角色
4. **产出 Spec**（600 字）— Spec 文件的结构、为什么 Spec 比直接写代码重要
5. **架构图**（300 字）— 四上下文隔离架构（Background/Content/Popup/Settings）
6. **核心技巧 + 小结**

- [ ] **Step 3: 绘制架构示意图**

四上下文架构图、消息流图

- [ ] **Step 4: 自检 + 提交**

---

### Task 7: 第 6 章 — 脚手架：Manifest V3 扩展

**Files:** Create: `book/part2-itranslate/ch06-scaffold.md`
**素材来源：** `package.json`、`vite.config.ts`、`vite.content.config.ts`、`manifest.json`

- [ ] **Step 1: 搜集素材**

```bash
# 阅读项目构建配置
cat package.json vite.config.ts vite.content.config.ts manifest.json
```

- [ ] **Step 2: 撰写初稿（~3500 字）**

1. **MV3 扩展的最小骨架**（600 字）— manifest.json 结构、权限声明、为什么不声明 host_permissions
2. **Vite + crxjs 搭建过程**（800 字）— 为什么选 crxjs、安装配置、dev 模式下的热更新
3. **四上下文入口**（600 字）— Background SW / Content Script / Popup / Settings 各自入口和职责
4. **IIFE 构建的特殊处理**（500 字）— content script 为什么不能用 ESM、vite.content.config.ts 做了什么
5. **用 CC 搭脚手架的实际对话**（500 字）— 关键 Prompt 和回复
6. **核心技巧 + 小结**

- [ ] **Step 3: 自检 + 提交**

---

### Task 8: 第 7 章 — 翻译引擎：Prompt 设计

**Files:** Create: `book/part2-itranslate/ch07-engine.md`
**素材来源：** `src/background/translator.ts`、`src/background/router.ts`、`src/background/cache.ts`

- [ ] **Step 1: 搜集素材**

阅读 background 目录下所有核心文件，理解翻译请求 → 缓存查找 → API 调用 → 结果解析的完整链路。

- [ ] **Step 2: 撰写初稿（~4500 字）**

1. **与 OpenAI 兼容 API 对话**（600 字）— chat/completions 接口、messages 结构、temperature/max_tokens
2. **System Prompt 设计**（1000 字）— iTranslate 的 system prompt 是怎么写的、为什么这样设计、实际效果
3. **批处理与并发**（600 字）— Token 估算（CJK 1.5/字 vs 拉丁 0.35/字）、3 并发、429 重试
4. **缓存层**（600 字）— IndexedDB 封装、djb2 hash + 长度防碰撞、原文校验
5. **真实的 CC 对话**（500 字）— 设计 Prompt 时的迭代对话
6. **核心技巧 + 小结**

- [ ] **Step 3: 自检 + 提交**

---

### Task 9: 第 8 章 — 内容注入：DOM 操作

**Files:** Create: `book/part2-itranslate/ch08-content-inject.md`
**素材来源：** `src/content/extractor.ts`、`src/content/renderer.ts`、`src/content/filters/`

- [ ] **Step 1: 搜集素材**

理解 extractRawSegments → filter → renderPlaceholders → renderTranslations 的完整管线。

- [ ] **Step 2: 撰写初稿（~4500 字）**

1. **内容脚本注入机制**（600 字）— executeScript 按需注入、ping 探测、IIFE 格式的原因
2. **DOM 提取策略**（800 字）— 遍历 body → 找文本叶节点 → 按块级祖先分组 → 产出 RawSegment
3. **过滤层**（800 字）— structured-filter：hasSkippableAncestor、噪音模式、标题豁免；为什么需要 filter 层
4. **两阶段渲染**（600 字）— Placeholder（3 点动画）→ 真实翻译替换、克隆 vs 修改原文的取舍
5. **MutationObserver 与追扫**（500 字）— 翻译期间断开 Observer、catchUpNewContent 补偿、防重入
6. **真实的 CC 对话**（300 字）
7. **核心技巧 + 小结**

- [ ] **Step 3: 自检 + 提交**

---

### Task 10: 第 9 章 — 交互层：Popup 与消息

**Files:** Create: `book/part2-itranslate/ch09-popup-msg.md`
**素材来源：** `src/popup/popup.ts`、`src/shared/storage.ts`、消息路由相关代码

- [ ] **Step 1: 撰写初稿（~3500 字）**

1. **MV3 消息通信模型**（600 字）— chrome.runtime.sendMessage、四种上下文的收发关系
2. **消息协议设计**（600 字）— Action 枚举、Message Catalog、sender.tab.id 过滤防跨标签污染
3. **Popup 状态管理**（600 字）— 按钮状态切换（翻译/撤销双色）、语言选择与 per-tab 锁
4. **Service Worker 冷启动竞态**（600 字）— sendToBgWithRetry 的设计、3 次重试/600ms 间隔
5. **真实的 CC 对话**（400 字）— 消息协议设计时的迭代
6. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

---

### Task 11: 第 10 章 — 划词翻译：事件处理

**Files:** Create: `book/part2-itranslate/ch10-selection.md`
**素材来源：** `src/content/selection.ts`

- [ ] **Step 1: 撰写初稿（~4500 字）**

1. **划词翻译的用户体验**（500 字）— mouseup → 小球 → 悬停 → 气泡的完整交互流
2. **选区检测与定位**（700 字）— isValidSelection、getBoundingClientRect、小球四方向翻转逻辑
3. **小球动画**（700 字）— 悬停 1s 延迟、JS 驱动 .animating class、防鼠标微移重启、光环扩散
4. **气泡 UI**（800 字）— 极地冰川主题、渐变顶条、拖拽、原文折叠、品牌名手柄
5. **词典 vs 翻译自动判断**（500 字）— isSingleWord + isEnglishText → mode 自动选择
6. **真实的 CC 对话**（500 字）— 小球动画优化是最典型的"描述视觉 → AI 实现 → 发现缺陷 → 迭代"案例
7. **核心技巧 + 小结**

- [ ] **Step 2: 截取关键截图**

小球出现/膨胀/光环三态截图、气泡完整截图、词典气泡 vs 翻译气泡对比

- [ ] **Step 3: 自检 + 提交**

---

### Task 12: 第 11 章 — 词典功能：结构化输出

**Files:** Create: `book/part2-itranslate/ch11-dictionary.md`
**素材来源：** `src/background/dict-prompt.ts`、`src/background/router.ts` 中的 translateDictionary

- [ ] **Step 1: 撰写初稿（~3500 字）**

1. **词典 vs 翻译的本质区别**（400 字）— 不是一个"更短的翻译"，是结构化数据提取
2. **JSON 输出格式设计**（600 字）— `{word, ipa, pos, definitions}` 字段定义、为什么选这个结构
3. **Prompt 如何控制 JSON 输出**（800 字）— `DICT_SYSTEM_PROMPT` 设计、format 约束、常见幻觉与防御
4. **解析与降级**（600 字）— parseDictionaryResponse、JSON 解析失败 → 自动降级 translateBatch
5. **可扩展性设计**（400 字）— 从硬编码到语言对注册表的演进方向
6. **真实的 CC 对话**（400 字）
7. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

---

### Task 13: 第 12 章 — 视觉打磨：主题与动画

**Files:** Create: `book/part2-itranslate/ch12-visual.md`
**素材来源：** `src/shared/theme.css`、`src/content/renderer.ts`（样式相关部分）

- [ ] **Step 1: 撰写初稿（~3500 字）**

1. **用 AI 做视觉设计靠谱吗**（500 字）— CC 擅长什么、不擅长什么、需要人做什么
2. **CSS 变量主题系统**（700 字）— 34 个 --itranslate-* 变量、集中式主题切换、四上下文共享
3. **极地冰川主题设计**（700 字）— 色彩选择（#F5F3EF / #6BAECF / #2A3038）、渐变、圆角、视觉层次
4. **动画的 AI 辅助调试**（700 字）— 小球缓动曲线调优、弹跳 vs 弹簧的取舍、JS 驱动动画的原因
5. **真实的 CC 对话**（400 字）
6. **核心技巧 + 小结**

- [ ] **Step 2: 截取 before/after 对比截图**

主题优化前后的翻译气泡对比

- [ ] **Step 3: 自检 + 提交**

---

### Task 14: 第 13 章 — 测试与发布

**Files:** Create: `book/part2-itranslate/ch13-testing-release.md`
**素材来源：** `src/**/__tests__/` 目录、`package.json` scripts、Chrome Web Store 上架流程

- [ ] **Step 1: 撰写初稿（~3500 字）**

1. **用 CC 补测试用例**（800 字）— 描述被测模块 → CC 生成测试 → 运行 → 修复的循环；vitest + jsdom + fake-indexeddb 配置
2. **70 个测试怎么分布的**（400 字）— 9 个测试文件覆盖 extractor/filter/renderer/cache/storage/i18n
3. **构建与发布**（600 字）— `npm run build` vs `npm run release`、zip 生成、版本号管理
4. **Chrome Web Store 上架**（600 字）— 商店文案、截图规范、权限说明、审核经验
5. **真实的 CC 对话**（300 字）
6. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

---

## 阶段四：Part 3 进阶篇（第 14-17 章）

### Task 15: 第 14 章 — Prompt 工程模式

**Files:** Create: `book/part3-advanced/ch14-prompt-patterns.md`
**素材来源：** iTranslate 项目中的 System Prompt、DICT_SYSTEM_PROMPT、用户可编辑的 settings.systemPrompt

- [ ] **Step 1: 撰写初稿（~4000 字）**

1. **好的 Prompt 长什么样**（600 字）— 清晰的角色、明确的输出格式、具体的约束、正反例对比
2. **System Prompt 设计模式**（800 字）— iTranslate 的翻译 Prompt vs 词典 Prompt，对比设计思路
3. **格式控制技巧**（600 字）— `[N]` 分隔符、编号格式兼容（`[N]`/`N.`/`N)`/`N、`）、Markdown fence 清理
4. **Token 预算管理**（600 字）— CJK vs 拉丁字估算、max_tokens 动态计算、避免截断
5. **常见 Prompt 反模式**（600 字）— 从 iTranslate 开发中的失败 Prompt 案例提炼
6. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

---

### Task 16: 第 15 章 — 复杂重构策略

**Files:** Create: `book/part3-advanced/ch15-refactoring.md`
**素材来源：** git log 中的重构提交（如 extractor 拆分为 extractor + filters、retry.ts 独立提取）

- [ ] **Step 1: 搜集素材**

```bash
git log --oneline --grep="refactor\|拆分\|重构\|提取"
```

- [ ] **Step 2: 撰写初稿（~4000 字）**

1. **什么时候该重构**（500 字）— 循环依赖、文件过长、职责混乱的信号
2. **如何让 AI 安全重构**（800 字）— "先读后改"原则、让 CC 先分析再动手、分步重构
3. **iTranslate 重构案例 1**（600 字）— extractor.ts 拆分为 extractor + filters 模块，为什么拆、怎么指导 CC 拆
4. **iTranslate 重构案例 2**（600 字）— retry.ts 独立提取解决循环依赖，CC 怎么发现的
5. **AI 重构的常见陷阱**（600 字）— 偷偷改行为、引入新抽象、破坏测试
6. **核心技巧 + 小结**

- [ ] **Step 3: 自检 + 提交**

---

### Task 17: 第 16 章 — 多模型协作

**Files:** Create: `book/part3-advanced/ch16-multi-model.md`

- [ ] **Step 1: 撰写初稿（~4000 字）**

1. **为什么需要多模型**（500 字）— 不同模型的能力差异和成本差异
2. **DeepSeek 做粗活**（700 字）— 批量翻译、缓存 key 生成、文本提取等对准确性要求不高的任务；成本收益分析
3. **Claude 做精活**（700 字）— Prompt 设计、架构决策、代码审查、复杂调试
4. **实际成本对比**（600 字）— iTranslate 开发中的真实 API 费用数据、不同任务的模型选择决策树
5. **多模型协作的模式**（700 字）— 串行（先 DS 粗加工再 Claude 精修）、并行（同时发请求取最优）、分工（不同模块不同模型）
6. **核心技巧 + 小结**

- [ ] **Step 2: 自检 + 提交**

---

### Task 18: 第 17 章 — 实战踩坑 20 条

**Files:** Create: `book/part3-advanced/ch17-pitfalls-20.md`
**素材来源：** CLAUDE.md 中的铁律、git log 中的 fix 提交、开发中遇到的问题记录

- [ ] **Step 1: 从项目中提炼 20 条踩坑经验**

```bash
git log --oneline --grep="fix\|bug\|修复"
```

- [ ] **Step 2: 撰写初稿（~5000 字）**

每条按统一格式：**现象 → 根因 → 解法 → 教训**，各 2-3 句。关键条目包括：

1. MV3 Service Worker 冷启动竞态 → sendToBgWithRetry
2. offsetParent 对 fixed/contents 元素返回 null → 漏判
3. 翻译克隆在绝对定位容器中重叠 → block insert 策略局限
4. hasSkippableAncestor 沿祖先链过滤太激进 → 页面顶层 class 命中导致全页静默
5. 缓存 key 不含目标语言 → 切换语言后展示旧翻译
6. CSS 变量在 content script 中需手动注入 → ?inline 导入
7. content script 不支持 ESM → 单独 IIFE 构建
8. HTML 中不能用 __MSG_*__ → Vite/Crxjs 拦截
9. 小狗动画反复重启动 → JS 驱动 .animating class
10. 词典 JSON 解析失败 → 自动降级 translateBatch
...（补齐到 20 条）

- [ ] **Step 3: 自检 + 提交**

---

## 阶段五：审校与出版准备

### Task 19: 全书一致性审校

**Files:** Modify: 所有章节文件
**依赖：** Task 2-18 全部完成

- [ ] **Step 1: 术语一致性检查**

全篇搜索统一：Claude Code（不写 CC CLI）、DeepSeek（不写 deepseek/DS）、iTranslate（统一小写 i+大写 T）

- [ ] **Step 2: 交叉引用检查**

Part 2 各章中引用的"详见第 X 章"是否指向正确的章节

- [ ] **Step 3: 字数统计**

统计全篇总字数，确认在 7-10 万字范围内

- [ ] **Step 4: 对话记录去重**

检查全书中的 CC 对话记录，确保同一段对话不在多个章节中重复

- [ ] **Step 5: 提交**

```bash
git add -A book/ && git commit -m "chore: 全书一致性审校"
```

---

### Task 20: 编译合稿与格式准备

**Files:** Create: `book/manuscript.md`、`book/scripts/compile.js`

- [ ] **Step 1: 编写合稿脚本**

```javascript
// book/scripts/compile.js
const fs = require('fs');
const path = require('path');

const order = [
  'part1-getting-started/ch01-why-cc-ds.md',
  'part1-getting-started/ch02-setup.md',
  // ... 全部 17 章按顺序
  'part3-advanced/ch17-pitfalls-20.md',
];

let manuscript = `# 《Claude Code + DeepSeek 从入门到精通》\n\n> 一个人搞定一个产品：iTranslate 开发实战录\n\n`;

for (const file of order) {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
  manuscript += content + '\n\n\\newpage\n\n';
}

fs.writeFileSync(path.join(__dirname, '..', 'manuscript.md'), manuscript);
console.log(`Compiled: ${manuscript.length} chars`);
```

- [ ] **Step 2: 运行脚本生成合稿**

```bash
node book/scripts/compile.js
```

- [ ] **Step 3: 转换为微信读书格式**

研究「写完记发」平台要求的文件格式（epub/markdown），按需转换。

- [ ] **Step 4: 提交**

```bash
git add book/manuscript.md book/scripts/ && git commit -m "feat: 全书合稿与编译脚本"
```

---

### Task 21: 辅助渠道内容准备

**Files:** Create: 掘金/思否文章草稿、GitHub README

- [ ] **Step 1: 准备 GitHub 开源仓库 README**

从书籍定位中提炼，作为项目主页

- [ ] **Step 2: 准备掘金/思否首篇文章**

从第 1 章提炼一篇 2000 字精华文，末尾引导到微信读书

- [ ] **Step 3: 提交**

```bash
git add book/promo/ && git commit -m "feat: 辅助渠道推广物料"
```

---

## 风险与应对

| 风险 | 概率 | 应对 |
|------|:--:|------|
| CC 对话素材不足 | 中 | 后续开发中有意识保留关键对话；必要时重现某些场景 |
| 微信读书不接受技术类 | 低 | 先确认「写完记发」是否支持非文学类；备选：知乎电子书/掘金小册 |
| 写作时间超预期 | 高 | 按章连载而非全部写完再发，降低单次压力 |
| Part 2 章节素材缺失 | 低 | 项目代码和 git 历史完整，所有素材均可回溯 |
