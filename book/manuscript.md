# 《Claude Code + DeepSeek 从入门到精通》

> 一个人搞定一个产品：iTranslate 开发实战录

---

# 第 1 章：为什么选 Claude Code + DeepSeek

> **本章目标**：读完本章，你将理解 2026 年 AI 编程工具的格局差异，知道为什么 Claude Code + DeepSeek 是一个值得关注的技术组合，以及为什么这套组合对中国开发者特别友好。你将看到 iTranslate 这个练手项目的真实开发数据，了解用 AI 编程实际效果如何。
> **预计字数**：~3500 字
> **状态**：✅ 初稿完成

---

## 1.1 AI 编程工具格局

如果你最近打开任何一个程序员社区，大概率会被各种 AI 编程工具的测评刷屏。Copilot、Cursor、Claude Code、Windsurf、Cline……每个都声称自己能"十倍提升效率"。但它们之间到底有什么区别？哪些是广告文案，哪些是真的？

我把目前主流的 AI 编程工具分成两类：

**第一类是"代码补全增强版"**。GitHub Copilot 是这一派的代表。它在你写代码的时候给出下一行的建议，准确率确实比五年前的 IDE 自动补全高出一个数量级。它侧重于行级代码建议，关注当前文件和上下文，适合快速编码场景。

**第二类是"AI 工程师"**。这一派的代表是 Claude Code 和 Cursor 的 Agent 模式。它们不只是补全代码，而是理解整个项目、做出架构决策、独立生成多文件修改。你只需要用自然语言描述需求，剩下的交给它。这是真正的范式转移。

下面这张表把四款主流工具的差异说清楚：

| 维度 | GitHub Copilot | Cursor | Windsurf | Claude Code |
|------|---------------|--------|----------|-------------|
| **交互方式** | IDE 插件，行级补全 | IDE 分支，Chat + Agent | IDE 分支，Flow 模式 | 终端独立应用 |
| **上下文理解** | 当前文件 + 相邻 Tab | 项目索引 + RAG | 项目索引 | 全项目自由读取 |
| **任务粒度** | 单行/函数 | 多文件重构 | 多文件修改 | 完整功能开发 |
| **自主决策** | 无 | 有限（Agent 模式） | 有限 | 强：能做架构选择 |
| **价格** | $10/月 | $20/月（Pro） | $15/月 | $10/月（免费额度 5 万 tok/日） |
| **适用场景** | 日常编码加速 | 中小功能开发 | 快速迭代 | 完整项目开发 |

> **核心观点**：AI 编程工具正在从"代码补全"进化到"AI 工程师"。前者的价值是让你打字快一点，后者的价值是让一个人能干一个团队的活。选工具之前，先想清楚你要的是哪一个。

### 国内工具也不可忽视

上面四款都是海外产品。2026 年的国内市场同样热闹，主要玩家有四家：

| 工具 | 厂商 | 形态 | 特点 |
|------|------|------|------|
| **Qwen Code** | 阿里 | CLI | 开源（Apache 2.0），对标 Claude Code，每日 2000 次免费调用，SubAgent 并行 |
| **通义灵码** | 阿里 | IDE 插件 | 阿里云生态"原住民"，Java/Go 补全精度极高，金融/政务合规首选 |
| **文心快码** | 百度 | IDE 插件 | 企业级重器，SPEC 规范驱动开发，C++/后端生成质量业界第一 |
| **Trae** | 字节 | AI IDE | AI-Native IDE，双模编程（SOLO Coder + Builder），适合原型快速构建 |
| **腾讯云助手** | 腾讯 | IDE 插件 | 唯一深度理解微信小程序生态，小程序代码采纳率 60% |

国内工具的共同优势是中文友好、合规部署、企业付费配套完善。但它们也有一个共同局限：**绝大多数是 IDE 插件**。IDE 插件天然受限于插件架构——它们在你的编辑器侧边栏里，需要你来主导交互节奏。

而 Qwen Code 虽然是 CLI 形态，功能上对标 Claude Code，但发布时间较晚（2025 年 8 月），Agent 机制、Skills/Hooks 系统、社区生态的成熟度尚不及 Claude Code。

### 这本书的选择：Claude Code + DeepSeek

看到这里你可能要问：国内工具这么多，为什么这本书选 Claude Code？

三个原因：

1. **Claude Code 是 CLI 原生工具中最成熟的**。它的全项目自由读取、Agent 并行调度、Skills/Hooks 自动化体系，经过了一年多的实战打磨。国内 CLI 工具还在追赶阶段。
2. **Claude Code 不绑定模型**。你可以把它指向 DeepSeek V4，享受国内模型的低价和便利。国内 IDE 插件大多绑定自家模型，灵活性受限。
3. **这套组合完美契合独立开发者的需求**。你要的不是企业级的合规部署和团队管理，而是用最少的成本、最高的效率，一个人搞出一个产品。

---

## 1.2 Claude Code 的核心能力

Claude Code 不是在 IDE 侧边栏里补全代码的插件，它是你终端里的一个独立的 AI 工程师。你在终端里用自然语言告诉它要做什么，它自己读代码、理解逻辑、写出修改、跑测试、修 Bug——全程不需要你打开 IDE。

具体来说，它强在五个方面：

### 上下文理解：它不是"看文件"，是"读项目"

大多数工具的上下文窗口看起来很宽，但实际上只塞给你当前打开的几个文件。Claude Code 不一样——它可以主动探索项目结构。你告诉它"给翻译功能加一个撤销按钮"，它会自己去读 `popup.ts` 理解 UI 结构，读 `content/index.ts` 理解翻译流程，读 `renderer.ts` 理解 DOM 操作，然后把所有相关模块串起来，给出一个完整方案。**这不是代码补全，这是理解系统。**

iTranslate 项目有 4 个隔离的执行上下文（Background Service Worker、Content Script、Popup、Settings），12 种消息类型，模块间通过 `chrome.runtime.sendMessage` 通信。Claude Code 能直接理解整个消息路由网络，一次性给出跨上下文的修改方案。

### Agent 机制：子代理并行，自动分工

Claude Code 支持 Agents——你可以派多个子代理并行干活。比如一边让一个代理修改翻译引擎的 prompt，一边让另一个代理写单元测试，两边互不干扰。这是真正的多线程开发体验。

在 iTranslate 的开发中，我经常平行推进：Content Script 的 DOM 提取逻辑和 Background 的缓存系统同时修改，两边独立测试，最后一起验证。如果没有 Agent 机制，这两个任务的上下文切换成本会吃掉大量时间。

### Skills 系统：可复用的指令集

Skills 是 Claude Code 的"能力插件"。你可以定义一套指令（比如"每次改代码后跑一遍 TypeScript 类型检查"、"修复 Bug 前先在测试文件中写一个复现用例"），它会严格遵守。这不只是自动化，而是把你的开发纪律固化到了工具里。

### Hooks 自动化

Claude Code 支持生命周期 Hooks。比如代码修改完成后自动运行 `npm test`，构建前自动执行 TypeScript 类型检查。你不需要手动记得"改完代码要跑测试"——工具替你做了。

### 关键差异：它能做架构决策

这就是 Claude Code 的本质能力——它不只是告诉你这行代码怎么写，还能告诉你"这个模块应该拆成两个"。

举一个真实的例子：iTranslate 的翻译过滤模块早期只有一个简单的字符数阈值。当我告诉 Claude Code"有些页面的导航栏文字被当成了正文翻译"，它没有简单地调低阈值（那是补全工具的思路），而是分析后提出了一套结构化过滤器方案——新增 `filters/` 模块目录，引入策略模式（`SegmentFilter` 接口），注册机制支持第三方扩展，同时保留旧过滤器作为兼容回退。这套架构用到了项目从第一天到上线。

> **一句话总结**：Claude Code 不是帮你写得更快，是帮你想得更清楚。

---

## 1.3 基座模型：为什么选 DeepSeek

Claude Code 是一个工具，它本身不绑定模型——你可以把它指向任何 OpenAI 兼容的 API。那么问题来了：基座模型用哪个？

Anthropic 原生的 Claude API 当然是第一选择。Sonnet 模型约 $3/百万输入 token + $15/百万输出 token，能力毋庸置疑。但对国内开发者来说，它有三个硬伤：

1. **需要翻墙**：api.anthropic.com 在国内无法直接访问，必须配置代理
2. **支付门槛**：需要外币信用卡，不支持支付宝/微信
3. **价格不菲**：开发一个中等复杂度的项目，API 费用轻松上百美元

这三条加在一起，意味着大多数国内开发者根本用不上 Claude 原生模型。而 DeepSeek 恰好解决了所有三个问题。

**DeepSeek V4 简介**

本书写作时（2026 年 5 月），DeepSeek 的最新版本是 4 月 24 日发布的 V4 系列，分两个版本：

| 版本 | 总参数 | 激活参数 | 定位 |
|------|--------|----------|------|
| **V4-Pro** | 1.6 万亿 | 490 亿 | 旗舰性能，对标 GPT-5.4、Claude Opus 4.6 |
| **V4-Flash** | 2840 亿 | 130 亿 | 高效经济，登顶 OpenRouter 全球调用榜 |

两个版本均支持 100 万 token 超长上下文、MIT 开源协议。V4 在代码生成（Vibe Code Benchmark 开源权重模型第一）、数学推理（HMMT 95.2 分）和 Agent 自主编程（可连续编码 60 分钟以上）等关键指标上比肩甚至超越顶级闭源模型。同时深度适配华为昇腾芯片，从训练到推理实现国产算力全链路。

### 成本对比：不是便宜一点，是差一个数量级

DeepSeek V4 发布后于 5 月 23 日宣布**永久降价**，V4-Pro 定价调整为原价的 1/4：

| 模型 | 输入（百万 token） | 输出（百万 token） |
|------|-------------------|-------------------|
| DeepSeek V4-Pro | ¥3 | ¥6 |
| DeepSeek V4-Flash | ¥1 | ¥2 |
| Claude Sonnet 4.6 | $3（≈¥22） | $15（≈¥108） |

和 Claude Sonnet 相比，V4-Flash 输入价格约为 1/22，输出约为 1/54。即便是旗舰的 V4-Pro，输出价格也只有 Claude 的 1/18。

这意味着什么？开发过程中大量的代码生成、prompt 调优、批量测试，如果用 Claude 原生 API，预算很快见底。用 DeepSeek V4，几十块钱人民币够玩一整天。更关键的是——V4 在代码能力上已经追平甚至部分超越了 Claude，你省下的不是"降级"的钱，是白省的钱。

### 中文能力：母语优势

很多人对国产模型有刻板印象，但 DeepSeek V4 的中文理解和生成能力确实经得起检验——作为国产模型，中文本来就是它的母语。iTranslate 的翻译功能依赖 prompt 工程——要求模型输出格式化的双语对照结果、处理 CJK 和拉丁字符的混排、区分词典查询和段落翻译两种模式。DeepSeek V4 在处理这些中文相关任务时表现出色，尤其在中文语境的词义辨析和成语理解上，比非中文原生的模型更有天然优势。

### 中国开发者的现实便利

这是 Claude 原生 API 给不了的体验：**不需要翻墙**。DeepSeek 官网直接访问，API 用支付宝就能充值——充 10 块钱够用一整天。

Claude Code 默认连接 Anthropic API，但它有一个关键能力：通过自定义 endpoint 配置，可以指向任何 OpenAI 兼容的 API 服务。DeepSeek 的 API 完全兼容 OpenAI 格式，只需改三个配置项（endpoint、apiKey、model），Claude Code 就能跑在 DeepSeek 上。

对中国开发者来说，这意味着：享受 Claude Code 这个最强开发工具的同时，用国内的基座模型，零翻墙、零外币卡、极低成本。

### Claude Code + DeepSeek 的实际配置

iTranslate 项目的开发环境很简单：**Claude Code 做前端工具，DeepSeek 做后端基座模型。** 一套工具、一套 API、一个人。

具体配置方式：通过 CC-Switch 等社区工具一键切换，或在 Claude Code 的 settings.json 中将 API endpoint 指向 DeepSeek 的 Anthropic 兼容端点（`https://api.deepseek.com/anthropic`），填入 API Key，模型映射为 `deepseek-v4-pro`（旗舰推理）或 `deepseek-v4-flash`（日常极速）。之后所有的开发交互——写代码、调试、架构讨论——都是 Claude Code 发起，DeepSeek V4 执行推理。详细配置步骤见第 2 章。

为什么不是反过来（用 DeepSeek 的官方工具 + DeepSeek 模型）？因为 Claude Code 的交互体验远优于 DeepSeek 官方 CLI。它的项目理解能力、Agent 调度、Skills 系统，让开发效率提升了一个量级。DeepSeek 的便宜 API 解决了"用得起"的问题，Claude Code 的工具能力解决了"用得好"的问题。

> **一句话总结**：Claude Code 提供了成熟的 CLI 开发体验，DeepSeek 以极低成本覆盖了推理需求。把 Claude Code 指向 DeepSeek，一个人就能独立完成一个中小型项目的开发。

---

## 1.4 一个真实案例：iTranslate 项目

上面聊的是理论，下面是实践。iTranslate 是我在业余时间用 Claude Code + DeepSeek 写的一个 Chrome 翻译扩展——一个纯粹的 AI Coding 练手项目，没有前端开发经验的背景（我之前主要写 Python 和后端）：

| 项目信息 | 数据 |
|------|------|
| 代码规模 | ~3400 行 TypeScript，36 个源文件 |
| 功能 | 页面翻译、划词翻译、词典查询、语言检测、主题切换、i18n |
| 测试 | 70 个测试用例，9 个测试文件 |
| 架构 | 4 个隔离上下文 + 12 种消息类型 |
| 开发周期 | 约 7 天，194 次 commit |
| 支持语言 | 6 种（中/英/日/韩/法/德） |
| 权限声明 | 仅 3 项（`storage` + `activeTab` + `scripting`），无 host_permissions |

**开发数据：** 所有代码生成、架构设计、调试排错、测试编写，全部通过 Claude Code 完成，基座模型为 DeepSeek V4。API 总花费约 **15-25 元人民币**（约 $2-3.5）。

作为参考，如果 Claude Code 连接的是 Claude 原生 API（Sonnet 模型），同样的开发量 API 费用大致在 $100-200 区间，还需要一直挂着代理。DeepSeek 做基座模型的主要好处是降低了试错成本——API 便宜到你可以随意尝试不同的 Prompt 方案而不用担心账单。

需要说明的是，iTranslate 在功能丰富度上远不如市场上成熟的翻译扩展（如沉浸式翻译、沙拉查词等）。它的价值不在于产品本身，而在于证明了：一个没有相关领域经验的人，用 AI 工具可以在短时间内完成一个可运行的软件的完整开发闭环——从第一行代码到商店上架。

---

## 1.5 本书的学习路径

本书围绕 iTranslate 项目的开发过程展开，分为三个部分：

**Part 1（入门篇，第 1-4 章）**：从为什么选这个工具组合开始，到环境搭建、Claude Code 核心操作、完成第一个 AI 编程任务。读完 Part 1，你就能独立使用 Claude Code 做开发了。

**Part 2（实战篇，第 5-13 章）**：跟着 iTranslate 的开发过程走一遍。从立项开始，到脚手架搭建、翻译引擎、DOM 注入、交互层、划词翻译、词典功能、视觉打磨、测试发布。每一章对应一个真实的开发阶段，你会看到实际遇到的问题和解决方案。

**Part 3（进阶篇）**：以"与 AI 协作的五条铁律"开篇——这是从项目实战中总结出的人机协作行为规范。随后四章从项目中提炼通用方法论：Prompt 工程模式、复杂重构策略、多模型协作的实践经验、20 条真实的踩坑记录。这部分适合已经上手 Claude Code、想要更进一步的朋友。

无论你是想提升日常编码效率的程序员、尝试自己搞产品的独立开发者，还是预算有限的学生，这本书的目标都是帮你走通 **"用 AI 工具独立完成一个软件项目"** 的完整流程。

---

## 核心技巧

- **选工具先想清楚需求**：不同工具适合不同场景，先明确你要做什么再选工具。
- **Claude Code 的价值不只是写代码**：它能读项目、理解架构、做设计决策。善用这个能力，让它帮你思考而不只是帮你写。
- **Claude Code + DeepSeek 适合国内开发者**：不需要翻墙、不需要外币卡、API 成本低。对个人开发和学习场景来说，是值得考虑的组合。
- **Skills + Hooks 是效率放大器**：花 10 分钟定义一套 Skills 和 Hooks，后续每一次交互都在享受它的红利。
- **用数据验证，而不是凭感觉判断**：iTranslate 这个案例记录了真实的开发时间、代码量和 API 费用。这些数据不是用来证明"AI 多厉害"，而是给你一个参考——了解别人实际花了多少时间和成本。

---

## 小结

> 💡 **本章要点**
> - AI 编程工具正在从"代码补全"进化到"AI 工程师"，Claude Code 是后者的代表。
> - Claude Code 的核心优势：终端交互、全项目理解、自主架构决策、Agent 并行、Skills + Hooks 自动化。
> - Claude Code 不是在 IDE 侧边栏里的插件，而是终端里的独立开发工具。
> - DeepSeek 的价格约为 Claude API 的 1/10 到 1/15，支付宝就能充值，无需翻墙。
> - 实际做法：Claude Code 做开发工具，DeepSeek 做基座模型。一套工具、一套 API。
> - 本书的三段路径：入门（会用工具）、实战（跟做项目）、进阶（提炼方法论）。

---

## 待补充

- [ ] 截图：Claude Code 终端界面截图
- [ ] 截图：iTranslate 在 Chrome 中的实际运行效果
- [ ] 数据确认：DeepSeek V4 API 实际花费的确切数字（需要查账单）


\newpage

# 第 2 章：环境搭建

> **本章目标**：读完本章，你将在自己的电脑上完成 Claude Code + DeepSeek 的完整环境搭建。从安装 Node.js 开始，到配置 DeepSeek API 为后端、再到跑通第一条 AI 编程指令——每一步都有具体命令，跟着敲就行。本章不讲原理，只讲操作。
> **预计字数**：~3500 字
> **状态**：✅ 初稿完成

---

## 2.1 前提条件（~400 字）

在安装 Claude Code 之前，确认你的电脑满足以下三个条件。这几样东西大概率你已经装过了，但建议还是检查一下。

**Node.js 18+**

Claude Code 是一个 npm 包，依赖 Node.js 运行时。打开终端，输入：

```bash
node --version
```

输出的版本号需要是 `v18.x.x` 或更高。如果还没有装 Node.js，去 [nodejs.org](https://nodejs.org) 下载最新的 LTS 版本，一路 Next 安装即可。安装完成后重新打开终端让 PATH 生效。

> ⚠️ **注意**：不要用某些"一键安装包"或系统自带的古老版本。Node 版本过低会导致 `@anthropic-ai/claude-code` 安装失败，错误信息通常是 `unsupported engine` 或语法报错。这是第 2.7 节"常见坑"里排名第一的问题。

**Git**

```bash
git --version
```

任何 2.x 版本都可以。Claude Code 依赖 Git 来追踪文件变更、生成 commit message、创建分支。如果你还没有装 Git，去 [git-scm.com](https://git-scm.com) 下载安装。

**终端基本操作**

你需要知道怎么打开终端、怎么运行 `npm` 命令、怎么用 `cd` 切换目录。本书不要求你是命令行高手，但 `cd`、`ls`（Windows 上是 `dir`）、`npm install` 这几个操作需要会。

**代码编辑器**

VS Code 推荐但不是必须。Claude Code 本身在终端里运行，不需要 IDE 插件。不过你肯定会需要编辑器来查看和手动修改 Claude Code 生成的代码，VS Code 是目前最主流的选择。

**平台说明：Windows / macOS / Linux**

本书的大部分命令是 Unix 风格（`ls`、`cd`、`~/`），在 macOS 和 Linux 上直接可用。如果你是 Windows 用户，有两种选择：

| 方案 | 推荐度 | 说明 |
|------|:--:|------|
| **Git Bash**（推荐） | ⭐⭐⭐ | 安装 Git 时自带，支持 Unix 命令，和本书所有命令 100% 兼容 |
| **WSL2** | ⭐⭐ | 完整 Linux 子系统，功能最强但配置稍多 |

**不建议使用 CMD 或 PowerShell**——它们使用不同的命令语法（`dir` 而非 `ls`、路径分隔符不同、环境变量设置方式不同），会导致本书中的大多数命令无法直接运行。你大概率已经在用 Git Bash 了（因为它随 Git 安装），本章后续所有命令都假设你用的是 Unix 风格终端。

> 💡 如果你不确定自己用的是什么终端：打开终端，输入 `echo $SHELL`。如果输出包含 `bash` 或 `zsh`，你就在正确的轨道上。如果输出是空白或报错，你可能在 CMD 或 PowerShell 中——关掉它，从开始菜单打开 "Git Bash"。

---

## 2.2 安装 Claude Code CLI（~600 字）

Claude Code 通过 npm 全局安装，一行命令搞定：

```bash
npm install -g @anthropic-ai/claude-code
```

安装过程大概 30 秒到 1 分钟，取决于网络速度。

| 平台 | 安装命令 |
|------|---------|
| Windows（Git Bash） | `npm install -g @anthropic-ai/claude-code` |
| macOS / Linux | 同上；如果遇到 `EACCES` 权限错误，说明 npm 的全局目录需要 root 权限。**推荐用 nvm（Node Version Manager）管理 Node.js**，它会将全局包安装在用户目录下，不涉及系统目录，自然不会有权限问题。如果你还没有用 nvm，临时解决可以加 `sudo`，但长期建议切换到 nvm |

> ⚠️ **macOS / Linux 注意**：`EACCES` 权限错误说明 npm 全局目录需要管理员权限。最彻底的解决方案是用 nvm（`nvm install --lts && nvm use --lts`），它会将 Node.js 和全局包都装在用户目录下。临时解决可以加 `sudo`，但只是把问题藏起来。Windows 用户（在 Git Bash 中）通常不会遇到权限问题。

安装完成后验证：

```bash
claude --version
```

如果看到版本号输出（类似 `v1.x.x`），安装就成功了。

**首次启动**

在终端里直接输入 `claude`，回车：

```bash
claude
```

首次运行会触发两个步骤：

1. **OAuth 认证**：Claude Code 需要关联一个 Anthropic 账号。终端会打印一个链接，在浏览器中打开，登录你的 Anthropic 账号（可以用 Google 账号或邮箱注册），然后授权 Claude Code CLI。授权完成后终端会自动继续。

2. **进入交互界面**：认证通过后，你会看到 Claude Code 的交互提示符。此时你可以直接输入自然语言指令，Claude Code 会开始工作。

**免费额度**

Claude Code 每天提供约 **5 万 token 的免费额度**（具体额度以 Anthropic 官方最新公告为准），使用 Anthropic 自己的模型（Claude Sonnet）。这个额度足够日常学习和小型项目使用。所以，**你可以先不配任何 API Key，直接用免费额度体验 Claude Code 的能力**。等免费额度不够用了，或者你想切到 DeepSeek 省钱，再按第 2.4 节的步骤配置。

> ⚠️ **建议**：安装完后先跑一个 `claude`，随便说一句"你好，帮我写一个 Hello World 的 HTML 页面"，感受一下交互流程。不要急着配 DeepSeek——先搞清楚 CC 本身怎么用，再优化成本。

---

## 2.3 获取 DeepSeek API Key（~500 字）

虽然 Claude Code 自带免费额度，但如果你想把后端模型切成 DeepSeek（成本降低 10 倍以上），需要先搞到一个 DeepSeek API Key。整个过程 5 分钟搞定。

**第一步：访问官网**

打开 [platform.deepseek.com](https://platform.deepseek.com)，点击右上角"注册"。支持手机号或邮箱注册，按提示完成验证即可。

**第二步：充值**

登录后进入"费用中心"或"充值"页面。DeepSeek 支持支付宝和微信支付，最低充值金额通常是 **¥10**。

这里要强调一个关键点：**充值 ¥10-20 就够用很久，不必充大额。** DeepSeek 在 2026 年 5 月宣布永久降价后，V4 系列的定价如下：

| 模型 | 输入（百万 token） | 输出（百万 token） |
|------|-------------------|-------------------|
| V4-Pro（旗舰） | ¥3 | ¥6 |
| V4-Flash（极速） | ¥1 | ¥2 |

V4-Flash 的输出价格仅为 2 元/百万 token——翻译几万字的成本也就几分钱。我在写 iTranslate 项目的整个开发过程中（194 次 commit，大量翻译测试），DeepSeek API 总共花了不到 ¥25。如果你只是学习和日常编码，¥10 可能够用一两个月。

**第三步：生成 API Key**

进入"API Keys"页面，点击"创建 API Key"。系统会生成一个以 `sk-` 开头的字符串。

> ⚠️ **重要**：API Key **只显示一次**。创建后立即复制保存到一个安全的地方（比如密码管理器、或本地的 `.env` 文件）。关闭页面后就再也看不到了，只能删除重建。

**第四步：验证 Key 可用（可选）**

在终端里跑一个快速测试（把 `your-key-here` 替换成你的 Key）：

```bash
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer your-key-here"
```

如果返回一个 JSON 模型列表，说明 Key 有效、网络通畅。后面配置 Claude Code 时就放心了。

---

## 2.4 配置 Claude Code 使用 DeepSeek（~600 字）

现在你有了 DeepSeek API Key，下一步是让 Claude Code 把后端从 Anthropic 切换到 DeepSeek。最简单的方式是用社区工具 **CC-Switch**——一个图形化桌面应用，一键完成切换，不需要手写任何配置文件。

**方式一：CC-Switch（推荐）**

CC-Switch 是目前国内开发者最常用的 Claude Code 模型切换工具，支持 Windows / macOS / Linux。

1. 从 GitHub 下载安装：[github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)（选择对应平台的最新版本。如果该地址失效，在 GitHub 搜索 "cc-switch" 或 "claude code switch" 即可找到当前的活跃分支）
2. 启动后，在界面中选择 Provider 为 **DeepSeek**
3. 填入你的 DeepSeek API Key
4. 选择模型映射：

| Claude Code 内部角色 | 映射到 DeepSeek 模型 | 用途 |
|---------------------|---------------------|------|
| Opus（旗舰推理） | `deepseek-v4-pro[1m]` | 复杂架构设计、高难度调试 |
| Sonnet（主力编码） | `deepseek-v4-pro` | 日常编码、代码审查 |
| Haiku（轻量快速） | `deepseek-v4-flash` | 简单任务、批量操作 |

5. 点击"应用"或"切换"，完成。

> 💡 **`[1m]` 后缀**：加 `[1m]` 开启 DeepSeek V4 的 100 万 token 超长上下文，适合需要整个项目上下文的大型任务。不加 `[1m]` 则默认 200K 上下文。

CC-Switch 会自动处理认证类型、模型映射、超时设置等细节，省去了手写配置的试错成本。如果你偏好命令行，也可以用 `claude-sw`（npm 包 `claude-sw`，`ccs deepseek` 一条命令切换），原理相同。

**方式二：手动编辑 settings.json（进阶）**

如果你不想装第三方工具，也可以直接修改 Claude Code 的配置文件。编辑 `~/.claude/settings.json`：

| 平台 | 全局配置文件路径 |
|------|---------|
| Windows | `C:\Users\<用户名>\.claude\settings.json` |
| macOS / Linux | `~/.claude/settings.json` |

> 💡 在 Git Bash 中 `~/.claude/settings.json` 也能正确指向 Windows 的用户目录，跨平台通用。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-你的DeepSeek-API-Key",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "API_TIMEOUT_MS": "3000000"
  }
}
```

关键配置说明：

| 配置项 | 值 | 注意 |
|--------|-----|------|
| `ANTHROPIC_BASE_URL` | `https://api.deepseek.com/anthropic` | **不是** `/v1`——DeepSeek 提供了专用的 Anthropic 兼容端点 |
| `ANTHROPIC_AUTH_TOKEN` | DeepSeek API Key | **不是** `ANTHROPIC_API_KEY`——认证类型不同，用错会报"Not logged in" |
| 模型映射 | 见上表 | CC 内部用 Opus/Sonnet/Haiku 角色名，需手动映射到 DS 模型 |

**验证配置**

无论用哪种方式，配置完成后在 Claude Code 中测试：

```
请用 JavaScript 写一个函数，接收一个字符串，返回它的反转。只输出代码，不解释。
```

正常返回代码 = 配置成功。报错跳到第 2.7 节排查。

> ⚠️ **CC-Switch 和手动配置二选一**，不要同时用。CC-Switch 底层也是修改 settings.json，两者会互相覆盖。推荐新手用 CC-Switch，熟练后如果想精细控制，再转手动配置。

---

## 2.5 第一条指令（~600 字）

现在环境全部就绪，我们来跑第一条真正的 AI 编程指令。这一节的目的是让你**感受 Claude Code 的完整工作流**，不只是"它能生成代码"——而是它如何理解需求、设计方案、实现、验证。

**准备一个空目录**

```bash
mkdir ~/cc-test
cd ~/cc-test
```

`~/cc-test` 在你的用户目录下创建一个测试文件夹。Windows 用户在 Git Bash 中同样可用——它会被解析为 `C:\Users\<用户名>\cc-test`。

**启动 Claude Code**

```bash
claude
```

**输入第一条指令**

在交互界面中输入：

```
帮我写一个 Node.js 脚本，读取当前目录下所有 .txt 文件，统计每个文件的字符数（包含空格），最后输出：
1. 每个文件的字符数
2. 所有文件的总字符数
如果目录下没有 .txt 文件，脚本应该给出提示。
```

**观察 Claude Code 的回复过程**

Claude Code 不会直接扔给你一段代码。在典型的交互中，它会经历以下步骤：（实际体验中不同任务的流程会有差异，简单任务可能跳过某些步骤直接生成代码）

1. **需求确认**：它可能会先问你几个澄清问题，比如"字符数是否包含换行符？"、"输出格式有偏好吗？"。这说明它在理解需求，不是在猜。

2. **方案设计**：确认需求后，它会给出一个简要的方案：用什么 API（`fs.readdirSync` + `fs.readFileSync`）、怎么遍历文件、怎么格式化输出。你可以在这一步提出修改意见。

3. **生成代码**：方案确认后，它会在你的工作目录中创建文件，写出完整代码。代码通常包含错误处理（比如文件不存在、权限问题）、合理的变量命名、清晰的注释。

4. **主动建议验证**：代码写完后，Claude Code 通常会主动建议你运行它看看效果，甚至会帮你创建测试用的 `.txt` 文件。它不只是生成代码，而是确保生成的代码真的能跑。

**关键洞察**

这条简单的指令揭示了 Claude Code 的工作本质：**它不是代码生成器，而是"理解需求 → 设计方案 → 实现 → 验证"的完整开发循环。** 你是一个产品经理，它是你的工程师。产品经理说需求，工程师负责把需求变成能跑的代码——而且是经过验证的代码。

> 你可以把这条指令换成任何你感兴趣的小任务，比如"写一个 Python 脚本批量重命名文件"、"生成一个带 CSS 动画的 HTML 时钟"。核心是亲自体验一次从"说需求"到"拿到可运行代码"的完整流程。

---

## 2.6 关键配置项速览（~300 字）

Claude Code 安装后有十几个配置项，但对初学者来说，只需要了解三个就够了。其他的等遇到问题再查文档。

**CLAUDE.md（最重要）**

这是 Claude Code 在每次会话启动时自动读取的项目级指令文件。你可以在里面写：

- 项目技术栈（"这是一个 Manifest V3 Chrome 扩展，TypeScript + Vite"）
- 编码规范（"所有注释用中文，代码标识符用英文"）
- 常用命令（"构建：`npm run build`，测试：`npm test`"）

CLAUDE.md 放在项目根目录，CC 每次会话启动时会自动读取。不需要一开始就写得很完整——先写几行（技术栈、关键命令），后续开发中遇到"这个问题已经跟 CC 解释过很多次了"的时候再往里加。iTranslate 项目的 CLAUDE.md 随着开发从最初的几行逐渐长到了 200 多行，每条都是踩坑后补上去的。

**settings.json**

分两级：全局配置（`~/.claude/settings.json`，Windows 上在 Git Bash 中同样可用此路径）和项目级配置（`.claude/settings.json`，覆盖全局）。主要配置：

- **权限**：哪些命令 CC 可以直接执行，哪些需要每次询问
- **Hooks**：在特定事件触发时自动执行脚本（如每次提交前跑 lint）
- **模型配置**：通过 CC-Switch 或手动编辑 settings.json 切换后端模型（第 2.4 节已讲）

**建议**：初学者先不改 `settings.json`。默认配置已经足够好，等用到第二周再回来看哪些需要调。

**权限管理**

默认情况下，Claude Code 执行任何文件操作或系统命令前都会询问你的许可。这是一个安全机制，防止它在你不注意的时候做危险操作。你可以在 settings 中把安全的命令（如 `npm test`、`git status`）加入允许列表，减少确认次数。但**不建议把危险命令（如 `rm -rf`、`git push --force`）加入允许列表**。

---

## 2.7 常见坑（~300 字）

以下是初学者最容易遇到的五个问题。如果你按本章步骤操作时碰到异常，先来这里排查。

**坑 1：Node.js 版本过低**

错误表现：`npm install -g @anthropic-ai/claude-code` 时出现 `unsupported engine` 或一堆语法错误。

解决：`node --version` 确认版本 ≥ 18。如果版本不够，用 nvm（Node Version Manager）或去官网下载最新 LTS。

**坑 2：网络代理导致连接失败**

如果你用了代理（科学上网工具），Claude Code 可能无法正常连接 API。错误表现：`fetch failed`、`ECONNREFUSED`、超时。

解决：在终端中设置 `HTTPS_PROXY` 环境变量指向你的代理地址。不同平台的设置方式：

| 平台 / 终端 | 命令 |
|-------------|------|
| macOS / Linux | `export HTTPS_PROXY=http://127.0.0.1:7890` |
| Windows Git Bash | `export HTTPS_PROXY=http://127.0.0.1:7890`（同上） |
| Windows CMD | `set HTTPS_PROXY=http://127.0.0.1:7890` |
| Windows PowerShell | `$env:HTTPS_PROXY="http://127.0.0.1:7890"` |

常见的代理端口：Clash/ClashX 默认 `7890`，V2Ray 默认 `10809`，SSR 默认 `1080`。不确定的话检查你的代理软件设置。

**坑 3：DeepSeek API Key 配置后不生效**

错误表现：配置了 DeepSeek 的 base URL 和 key，但 CC 报"Not logged in"或仍走 Anthropic。

排查三步走：(1) 确认认证类型用了 `ANTHROPIC_AUTH_TOKEN` 而非 `ANTHROPIC_API_KEY`——这是最常见的错误，DeepSeek 的 Anthropic 兼容端点需要 Token 认证而非 Key 认证；(2) 确认 Base URL 是 `https://api.deepseek.com/anthropic` 而非 `/v1`——DeepSeek 为 CC 提供了专用的 Anthropic 兼容端点；(3) 如果手动编辑过 settings.json，检查 CC-Switch 是否覆盖了你的配置（两者不要同时用）。

**坑 4：DeepSeek V4 thinking 模式导致空返回**

错误表现：配置了 V4 模型后，Claude Code 偶尔返回空内容或"无响应"。

根因：DeepSeek V4 系列默认可能启用 thinking（思考）模式。在 thinking 模式下，模型的推理过程会写入 `reasoning_content` 字段，而 `content` 字段可能为空。Claude Code 读取 `content` 字段时拿到空值，表现为"没返回"。

解决：如果你用的是 **CC-Switch**，它默认会处理 thinking 模式，一般不会遇到这个问题。如果你**手动编辑 settings.json** 且出现了空返回，检查是否误用了会触发 thinking 的模型名称——DeepSeek V4 的 `deepseek-v4-pro` 和 `deepseek-v4-flash` 默认不启用 thinking，但某些特定变体或旧版模型名可能会。如果确实需要显式控制，可以在 settings.json 中尝试添加 `"API_EXTRA_BODY": "{\"thinking\":{\"type\":\"disabled\"}}"` 注入到每个请求中（注意：这个配置项的生效方式取决于 CC 版本，不同版本支持程度不同）。最简单的做法是：切回 CC-Switch。

**坑 5：Windows 终端问题**

如果你按 2.1 节的建议用了 Git Bash，这个坑你不会遇到。如果你坚持用 CMD 或 PowerShell：Unicode 字符可能出现乱码（特别是 Claude Code 返回中文时），且本书所有命令语法都不兼容。

解决：回到 2.1 节，装 Git Bash。VS Code 用户可以直接在 VS Code 内置终端中选择 Git Bash（`Ctrl+`` ` 打开终端，点击右上角下拉菜单选择 "Git Bash"）。

---

## 核心技巧

- **先用免费额度再配 Key**：Claude Code 每天 5 万 token 免费额度足够学习使用。先搞清楚工具怎么用，再优化成本。不要一上来就配 DeepSeek——你在省钱之前得先知道钱花在哪里。
- **CLAUDE.md 随项目成长**：项目一开始就创建它，先写几行（技术栈、常用命令）。后续每次遇到"这个问题跟 CC 解释了很多遍"的情况，就把解释写进去。它不是一次写完的，是随着项目的推进慢慢长出来的。
- **充值 ¥10 就够**：DeepSeek 极其便宜，不要一上来就充几百。¥10 能用一两个月，用完再充。省下的钱比你想象的多。
- **善用 `/config` 命令**：不要死记硬背 settings.json 的字段名。`/config` 命令提供了交互式配置界面，所见即所得，配错了也容易改回来。
- **终端选对省十年**：Windows 用户用 Git Bash 或 WSL2，不要用 CMD。macOS/Linux 用户用系统自带终端就很好。

---

## 小结

> 💡 **本章要点**
> - 三个前提：Node.js 18+、Git 2.x+、终端基本操作。缺一不可，检查命令：`node --version`、`git --version`。
> - 安装 Claude Code：`npm install -g @anthropic-ai/claude-code`，首次运行 `claude` 完成 OAuth 认证。
> - 每天约 5 万 token 免费额度（以官方最新公告为准），可以先不配 API Key 直接上手体验。
> - DeepSeek API Key 获取：platform.deepseek.com 注册 → 充值 ¥10-20 → 创建 Key → 复制保存。Key 只显示一次。
> - 配置 Claude Code 用 DeepSeek：推荐用 CC-Switch 图形化工具一键切换；进阶用户可手动编辑 settings.json（Base URL: `https://api.deepseek.com/anthropic`，认证类型: `ANTHROPIC_AUTH_TOKEN`）。
> - 第一条指令不只是"生成代码"——体验 CC 的完整工作流：理解需求 → 设计方案 → 实现 → 验证。
> - 三个关键配置文件：CLAUDE.md（项目指令）、settings.json（全局/项目设置）、权限管理（安全机制）。
> - 五个常见坑：Node 版本低 → 升级；网络代理 → 设 `HTTPS_PROXY`；Key 不生效 → 检查冲突；V4 thinking 空返回 → 关闭 thinking；Windows 终端 → 用 Git Bash。
> - 核心原则：先跑通再优化，默认配置够用，不要一开始就折腾高级配置。

---


\newpage

# 第 3 章 Claude Code 核心操作

## 1. 本章目标

读完本章，你将掌握 Claude Code 的四大核心机制——Slash Commands、Agents、Skills 和 Hooks，理解它们各自解决什么问题、在什么场景下使用。你还会获得一份经过实战验证的精简插件推荐，避免在新手阶段陷入"装哪个 Skill"的选择困难。学完之后，你会从"能用 CC 聊天"升级到"能用 CC 高效干活"。

---

## 2. Slash Commands 全景

Slash commands 是 Claude Code 的"快捷键"。它们以 `/` 开头，在对话中直接输入，告诉 CC 执行某个内置操作。如果不使用这些命令，你需要用自然语言反复描述同样的意图——比如"请帮我清理一下上下文"或"帮我看看当前这个修改有什么问题"——而 slash commands 让你一句话搞定。

以下是最常用的几个命令：

**`/help`** — 查看帮助和可用命令列表。刚上手时记不住所有命令很正常，输 `/help` 就能看到完整清单。在你第一次打开 CC 时，它也会主动提示你用这个命令。

**`/clear`** — 清除当前对话历史，开始新话题。当你聊完一个功能、准备转向下一个完全不同的任务时，用 `/clear` 清空上下文，避免旧对话干扰新任务。这相当于"重启一局"，token 从头算起。

**`/compact`** — 压缩上下文。当对话越来越长、token 消耗越来越大时，`/compact` 会让 CC 把之前的对话内容总结压缩，释放出可用的 token 空间。它和 `/clear` 的区别在于：`/compact` 保留了之前的"记忆"（以摘要形式），而 `/clear` 是全部丢弃。对话很长但你又不想丢掉前面的讨论时，用 `/compact`。

**`/config`** — 打开配置界面。你可以在这里修改主题、模型、权限等设置。比如你默认用的是 DeepSeek 模型，临时想切到 Claude 模型处理一个复杂推理任务，`/config` 里一键切换，不用退出 CC。

**`/review`** — 请求 CC 审查当前代码变更。相当于让 CC 扮演 Code Reviewer，检查你（或它自己）刚写的代码有没有问题。在 iTranslate 开发中，每次功能完成后我都会跑一次 `/review`，让 CC 从正确性、可读性、安全性几个维度过一遍，经常能发现我忽略的边缘情况。

**`/cost`** — 查看当前会话的 token 使用量和费用。这是个很实用的"账单"命令。用 DeepSeek 的时候费用极低，你可能不太在意，但如果切到了 Claude 模型，时不时看一眼 `/cost` 能帮你控制开销。

**`/init`** — 初始化项目的 `CLAUDE.md` 文件。这是项目的"说明书"，CC 每次启动时会自动读取它来了解项目结构、构建命令、编码规范等。在新项目中使用 CC 的第一件事，就应该是 `/init`。iTranslate 项目根目录下的 `CLAUDE.md` 就是这样生成的——它告诉 CC 这是什么项目、怎么 build、怎么跑测试、有什么铁律。

**`/status`** — 查看当前会话状态，包括已加载的文件、活跃的 Agent 等。当你不确定 CC 当前"看到"了什么时，用 `/status` 快速检查。

**自定义 slash commands** — 除了内置命令，你还可以定义自己的。在项目根目录的 `.claude/commands/` 下放一个 markdown 文件，文件名就是命令名。比如我创建了一个 `/release` 命令，内容是"执行 `npm run release`，然后把生成的 zip 文件路径告诉我"，每次要发版时直接输 `/release` 就行，不用每次解释一通。

核心观点：Slash commands 解决的是"重复描述"的问题。用熟了之后，你会发现很多高频操作都不需要写长句子了，一个 `/` 就搞定。

---

## 3. Agents 机制

Agent 是 Claude Code 中一个非常重要的概念。简单说，一个 Agent 就是一个**独立的 Claude Code 实例**，拥有自己的上下文窗口，可以在后台并行运行，不会和你的主会话互相干扰。

你可以把 Agent 想象成你派出去的"分身"——你给它一个任务，它自己去找文件、读代码、做修改，做完回来报告结果。在这个过程中，你的主对话窗口不受影响，可以继续干别的事情。

CC 内置了几种 Agent 类型，各自擅长不同的工作：

**Explore Agent** — 专门用于搜索和探索代码库。当你需要"找到所有调用 `translateBatch` 的地方"或"看看 `structuredFilter` 的逻辑是怎么串起来的"时，Explore Agent 比你自己手动 grep 高效得多。它会系统性地搜索多个文件和模式，然后给你一个结构化的结果。在 iTranslate 项目中，我曾经让 Explore Agent 帮我找出所有可能触发"翻译内容被二次翻译"问题的代码路径，它在几秒钟内就完成了跨 6 个文件的搜索，而我手动做至少要 10 分钟。

**Plan Agent** — 专门用于设计方案。当你有一个模糊的需求，需要把它拆成可执行的步骤时，Plan Agent 能帮你理清思路。比如 iTranslate 要做"词典功能支持多语言对扩展"时，Plan Agent 分析了现有的硬编码英文→中文逻辑，给出了一个配置驱动的注册表方案，包括需要改哪些文件、加哪些接口、向后兼容怎么处理。

**General-purpose Agent** — 通用 Agent，什么都能干，适合执行具体的实现任务。当你说"帮我把这个函数加上错误处理"或"重构这段代码"时，CC 默认就是用通用 Agent 在干活。

**子代理并行**是 Agent 机制最强大的用法之一。你可以同时派多个 Agent 出去干活——比如一个改 content script 的提取逻辑，另一个同时改 background 的缓存策略，两个互不依赖、互不阻塞。在 iTranslate 开发中，我就经常这样用：一边让 Agent A 修改 popup 的 UI，一边让 Agent B 优化 background 的翻译批处理，两边同时推进，效率翻倍。

**Agent 的隔离性**是关键。每个 Agent 有自己独立的上下文窗口，Agent A 读的文件、做的修改不会污染 Agent B 的上下文。这意味着你不会遇到"聊着聊着 CC 把两个任务的上下文搞混了"的情况。不过这也意味着你需要给每个 Agent 足够清晰的任务描述——它看不到你和其他 Agent 的对话。

一句话总结使用原则：需要跨文件搜索 → Explore Agent；需要出方案 → Plan Agent；需要动手干活 → General-purpose Agent；需要同时推进多个独立任务 → 并行子代理。

---

## 4. Skills 系统

Skills 是 Claude Code 中最容易被低估但实际非常强大的机制。简单说，一个 Skill 就是一个**可复用的指令集**，它定义了"遇到某类任务时该怎么做"。它不是一句话的 prompt，而是一套完整的工作流。

**触发方式有两种：**

1. **显式调用** — 你输入 `/<skill-name>`，比如 `/tdd` 启动测试驱动开发流程，`/brainstorming` 启动创意构思。
2. **自动匹配** — CC 会根据你的任务描述自动判断应该用哪个 Skill，然后主动加载它。比如你说"这个 bug 帮我修一下"，CC 可能会自动加载 `systematic-debugging` Skill，先让你复述现象、收集日志、缩小范围，再动手改代码。

**常用的 Skills：**

- **`brainstorming`**（创意构思）— 你以为直接说"加个翻译气泡"就行，但这个 Skill 会先问你：气泡在哪个位置？什么颜色？什么时机出现？有没有动画？它会帮你把模糊的想法挖清楚，再动手。
- **`tdd`**（测试驱动开发）— 强制你先写测试、看测试失败、再写实现代码、再看测试通过。在 iTranslate 开发中，每次改缓存逻辑或翻译逻辑时用 `/tdd`，可以避免"改了 A 坏了 B"。
- **`debugging`**（系统化调试）— 不是让你"猜一个改法试试"，而是严格按照"复现 → 缩小范围 → 定位根因 → 修复 → 验证"的流程走。遇到棘手的 bug 时，这个 Skill 能阻止你盲目试错。
- **`code-review`**（代码审查）— 从正确性、可读性、架构、安全、性能五个维度审查代码。

**Skills 和普通 Prompt 的本质区别：** 你说"帮我审查一下代码"，CC 会按自己的理解去审。但你用 `/code-review`，它就会加载一套预定义的审查标准——检查什么、用什么维度、输出什么格式——这些都是提前固化好的最佳实践。Skills 把"资深开发者的肌肉记忆"变成了可复用的指令集。

**Skills 的好处：**
- **固化最佳实践**："修 Bug 前先写复现测试"、"改完代码跑一遍类型检查"——这些纪律靠人记容易忘，靠 Skill 强制执行。
- **团队共享**：如果你的团队都用同一个 Skill 做 code review，所有人的代码都会被同一套标准检查，不会出现"张三审得严、李四审得松"。
- **新人上手快**：新人不需要知道"怎么做测试驱动开发"，只需要输入 `/tdd`，Skill 会一步步引导他。

**怎么看 Skill 的内容？** 当 CC 调用某个 Skill 时，它会在对话中展示 Skill 的完整内容——包括每一步做什么、检查什么条件、输出什么格式。你不需要盲信它，可以直接看到它的"说明书"。建议第一次用某个 Skill 时，花一分钟读一下它的内容，理解它的工作流，这样以后用起来更有把握。

### 推荐的插件组合

Skill 需要插件来提供。目前 CC 的插件生态中有几十个插件、上百个 Skill，初学者很容易陷入"选择困难"。我的建议是**从最少开始**——只用两个插件，覆盖 90% 的日常场景：

| 插件 | 安装方式 | 提供什么 |
|------|---------|---------|
| **superpowers** | `claude plugins install superpowers@claude-plugins-official` | 核心工作流技能：brainstorming、TDD、debugging、code review、writing-plans 等 |
| **agent-skills** | 社区仓库，`claude plugins install` 安装 | 专业审查代理：code-reviewer（五轴审查）、test-engineer（测试策略）、security-auditor |

**superpowers** 是你每天都会用的主力插件。**agent-skills** 在关键节点调用——代码写完后派一个 code-reviewer 代理做独立审查，比你自己一个个检查更系统。

还有一个可选的锦上添花：**claude-hud**（`jarrodwatts/claude-hud`），在终端底部显示一个状态栏，展示当前会话的 token 用量、模型、Agent 状态等信息。不是必需品，但能让你的工作状态一目了然。

**不需要贪多。** 你不用把市场上所有 Skill 都装一遍。上面这两个插件提供的 Skill 已经覆盖了"需求澄清 → 方案设计 → 编码实现 → 测试验证 → 代码审查"的完整链路。iTranslate 项目的整个开发过程和本书的写作过程，用的就是这套组合，没有更多。

日常开发中 Skill 的实际使用顺序可以参考下表：

| 阶段 | 用什么 | 干什么 |
|------|--------|--------|
| 需求模糊 | `/brainstorming` | 把模糊想法挖清楚，确定做什么 |
| 需求明确 | `/writing-plans` | 产出可执行的任务清单 |
| 开始编码 | `/tdd` | 先写测试 → 看到失败 → 写实现 → 看到通过 |
| 遇到 Bug | `/debugging` | 复现 → 缩小范围 → 定位根因 → 修复 → 验证 |
| 交付前 | `/code-review` | 五轴审查：正确性、可读性、架构、安全、性能 |

---

## 5. Hooks 机制

Hooks 是一种**事件驱动的自动化机制**——当特定事件发生时，自动执行你预设的操作。它和 Skills 的区别在于：Skills 是你主动调用的，Hooks 是被动等待事件触发的。

**常见的事件类型：**

| 事件 | 触发时机 |
|------|---------|
| `PreToolUse` | 工具调用之前（比如在 `Edit` 文件之前） |
| `PostToolUse` | 工具调用之后（比如 `Edit` 完成后） |
| `SessionStart` | 会话开始时 |
| `SessionEnd` | 会话结束时 |
| `Notification` | 收到通知时 |

**实际应用场景：**

- **每次代码修改后自动类型检查**：配置一个 `PostToolUse` hook，当 CC 用 `Edit` 或 `Write` 工具改完代码后，自动跑 `npx tsc --noEmit`。如果类型报错，hook 的输出会直接出现在对话中，你可以立刻发现并修正，不用等到最后 `npm run build` 才报一堆错。

- **每次提交前自动跑测试**：配置一个 hook，在 git commit 之前自动执行 `npm test`，测试不通过就阻止提交。iTranslate 项目本身就用了这个模式来保证提交质量。

- **会话开始时加载项目上下文**：`SessionStart` hook 可以自动读取项目的 README、CHANGELOG 等文件，让 CC 一启动就了解项目近况。

**配置方式**：在项目根目录的 `.claude/settings.json`（或用户目录的 `~/.claude/settings.json`）中定义 `hooks` 数组，每个 hook 指定事件类型、匹配条件和要执行的命令。

**重要提醒**：Hooks 是高级功能，初学者不需要立刻配置。CC 的默认行为已经足够应对大多数场景。等你用熟了，发现有"每次都手动做一遍"的重复操作时，再来用 Hook 自动化它。不要为了"看起来很酷"去配一堆用不上的 Hook。

---

## 6. 日常工作流

把前面几个机制串起来，一个理想的 CC 辅助开发循环长这样：

**1. 描述需求（清晰、具体、带上下文）** — 不要说"帮我加个功能"，而是说"在 popup 窗口里加一个开关，控制划词翻译的启用/禁用，默认关闭，状态只对当前标签页生效"。上下文越具体，CC 越不容易跑偏。如果你不确定需求是否合理，先用 `/brainstorming` 让它帮你理一理。

**2. CC 探索代码库** — 接到任务后，CC 会主动 `Read` 相关文件，理解现有代码结构。这是 CC 的核心优势之一：它不会凭空猜测，而是先去读代码。

**3. CC 提出方案** — 在动手之前，CC 通常会先告诉你它打算怎么改、改哪些文件。**重点：审阅这个方案，不要盲从。** 看到它打算动你不希望动的文件，立刻纠正；看到它的思路不对，马上引导。CC 是"副驾驶"，方向还是你把。

**4. CC 实现** — 观察它的修改。好的 CC 操作是"最小的、精准的改动"，改一行能解决的问题绝不改十行。如果看到它改了一大堆无关代码，停下来问它为什么。

**5. 验证** — 运行测试：`npm test`。实际使用：启动项目，点一点、用一用，看效果对不对。这一步不能省，CC 也不是 100% 正确。

**6. 反馈修正** — 告诉 CC 哪里不对、期望什么效果，它会基于你的反馈修正。通常一轮反馈就够了，如果三轮还没修好，按 CLAUDE.md 的铁律——停下来回到问题起点重新分析。

**关键原则：**

- **小步快跑**：一次只改一个功能。不要一次性描述五个需求，拆成五次对话、五次验证。出问题也好定位。
- **先读后改**：让 CC 先读文件理解现状，再动手改。这听起来像废话，但在实际使用中，如果你描述得不够清晰，CC 可能跳过"读"这一步直接"猜"——而猜的准确率远低于读。
- **验证闭环**：每次修改后都要验证。不要攒了五个修改一口气测试——到时候出了问题你都不知道是哪次改的。

**和传统开发的区别：** 传统开发是"写代码 → 跑 → 改"的循环，AI 辅助是"描述 → 审查 → 验证"的循环。你的角色从"码字的"变成了"审稿的"——这需要不同的技能：会看代码、会提反馈、会判断方案的好坏。而这些，正是通过掌握本章的四大机制来建立的。

---

## 7. 核心技巧

1. **先 `/init` 再干活** — 新项目的第一件事。`CLAUDE.md` 是 CC 的"眼睛"，没有它，CC 每次都要重新探索项目结构，效率低且容易出错。花 5 分钟做好项目说明书，省下的是后续几十个小时的重复沟通。

2. **善用 `/compact` 而非 `/clear`** — 对话太长时用 `/compact` 保留记忆，而不是 `/clear` 全部丢弃。除非你确实要切换到完全不相关的任务，否则保留了上下文的 CC 会更"懂你"。

3. **并行 Agent 拆分独立任务** — 当你手头有两个互不依赖的任务（比如改 UI 和优化算法），不要让 CC 串行做。明确告诉它："这两个任务没有依赖，请并行处理"。或者用 `/subagent-driven-development` 自动拆成并行子任务。

4. **读 Skill 内容再信任它** — 第一次使用某个 Skill 时，花一分钟读一下它展示的完整指令。理解它的工作流，你才能判断它做对了还是跑偏了。盲信 Skill 和盲信代码一样危险。

5. **Hooks 只配真正高频的重复操作** — 刚上手时不要急着配 Hooks。先用一两周，记录下"每次都手动做一遍"的操作，再挑频率最高的 1-2 个配置自动化。少即是多。

---

## 8. 小结

- **Slash Commands** 是 CC 的快捷键，解决"重复描述"问题——`/help`、`/clear`、`/compact`、`/config`、`/review`、`/cost`、`/init`、`/status` 是最常用的 8 个，自定义命令让你封装项目专属操作。
- **Agents** 是独立的 CC 实例，有隔离的上下文——Explore 负责搜索，Plan 负责设计方案，General-purpose 负责实现。并行 Agent 可以同时推进多个独立任务。
- **Skills** 是可复用的专业工作流——通过 `/<name>` 显式调用或 CC 自动匹配。推荐从 superpowers + agent-skills 两个插件起步（覆盖需求→编码→审查全链路），不要贪多。
- **Hooks** 是事件驱动的自动化——在特定时机（文件修改后、会话开始时、提交前）自动执行命令。初学者不需要立刻配置，等熟悉了再逐步优化。
- **日常工作流**：描述需求 → CC 探索 → CC 提案 → 审阅 → CC 实现 → 验证 → 反馈修正。你的角色从"码字的"变成了"审稿的"。
- **核心原则**：小步快跑、先读后改、验证闭环。AI 是副驾驶，方向盘永远在你手里。


\newpage

# 第 4 章：第一个 AI 编程任务

> **本章目标**：读完本章，你将完成一个完整的"Prompt-运行-反馈-迭代"循环，用 Claude Code 从零写出一个实用的 Markdown 链接检查器。你会看到 AI 生成的第一版代码通常有 bug，也会看到如何用精准的反馈让它快速修复。最重要的是，你会建立"迭代式 AI 编程"的肌肉记忆——这套方法在你后续所有 AI 辅助开发中都会反复用到。
> **预计字数**：~4000 字
> **状态**：📝 写作中

---

## 4.1 本章目标

学完本章，你将能：

1. 独立发起一个完整的 AI 编程任务——从写 Prompt 到拿到可运行的代码
2. 在 AI 生成代码出 bug 时，用精准反馈引导它快速修复
3. 掌握"小步迭代"的核心节奏：先跑通 → 修 Bug → 加功能 → 处理边界

---

## 4.2 任务描述

我们要写一个 **Markdown 链接检查器**。它的功能很明确：

- 接收一个目录路径作为命令行参数
- 递归扫描该目录下所有 `.md` 文件
- 从每个文件中提取 `[text](url)` 格式的外部链接（只检查 `http://` 和 `https://` 开头的）
- 对每个链接发送 HTTP HEAD 请求，检查是否可访问
- 最终输出一个表格：哪个文件、哪个链接、返回了什么状态码、有没有问题

为什么选这个任务？

第一，**它不是 Hello World**。这个工具涉及文件 I/O、正则匹配、HTTP 请求、CLI 参数解析——是真实项目中会遇到的组合。第二，**任何写文档的开发者都能立刻用上**——检查自己项目的 Markdown 文档有没有死链。第三，**它天然适合迭代**：初始版本能跑但不够好，重定向、并发控制、输出格式这些都是"跑起来之后才会发现"的需求——正好展示 AI 编程的真实节奏。

---

## 4.3 第一轮：初始 Prompt

打开终端，进入一个空目录，启动 Claude Code：

```bash
mkdir ~/link-checker
cd ~/link-checker
claude
```

然后输入以下 Prompt：

~~~
帮我写一个 Node.js 脚本 `check-links.js`：

1. 接受一个目录路径作为命令行参数（如 `node check-links.js ./docs`）
2. 递归扫描该目录下所有 .md 文件
3. 从每个文件中提取 `[text](url)` 格式的链接，只检查 http/https 开头的外部链接，跳过锚点链接（#开头）和相对路径
4. 对每个链接发送 HEAD 请求检查是否可访问，设置 5 秒超时
5. 输出一个表格，包含：文件名 | 链接文本 | URL | 状态码 | 备注（成功/超时/错误）
6. 如果状态码是 2xx 或 3xx 算正常，4xx/5xx/超时/网络错误标记为不可访问
7. 最后输出统计：总共检查了多少链接，多少正常，多少异常

用 CommonJS 格式（require/module.exports），只用 Node.js 内置模块，不需要 npm install 任何东西。
~~~

Claude Code 的回复大概是这样的：

> 我来分析一下需求：这是一个命令行工具，需要扫描 Markdown 文件中的外部链接并检查其可访问性。关键点有：递归文件扫描、Markdown 链接正则提取（注意区分图片链接 `![text](url)` 和普通链接）、HTTP HEAD 请求、超时控制、表格输出。
>
> 我先创建 `check-links.js`……

然后它会生成一个约 80-100 行的脚本，结构大致如下：

- `getMdFiles(dir)` — 递归读取目录，用 `fs.readdirSync` + `fs.statSync` 过滤 `.md` 文件
- `extractLinks(filePath)` — 读取文件内容，用正则 `/\[([^\]]+)\]\(((?:https?:)\/\/[^)]+)\)/g` 提取外部链接
- `checkLink(url)` — 用 `http.get` / `https.get` 发 HEAD 请求，5 秒超时，返回 `{ statusCode, error }`
- `main(dir)` — 组装流程：遍历文件 → 提取链接 → 逐个检查 → 输出表格

CC 还会主动建议："你可以先在一个有几个 .md 文件的小目录试试，比如 `node check-links.js ./test-docs`。"

> 💡 **为什么这样问？**
>
> 这个 Prompt 有四个值得注意的点：
>
> 1. **编号列表**：每个需求一行，CC 对结构化列表的理解远比一大段话精准。它会逐条对照实现，漏掉需求的概率大幅降低。
> 2. **给具体参数**："5 秒超时"、"只检查 http/https"、"跳过锚点和相对路径"——这些细节你不说，CC 会自己做假设，而假设往往是错的。把你关心的边界条件直接写进 Prompt。
> 3. **明确输出格式**："表格，包含：文件名 | 链接文本 | URL | 状态码 | 备注"——CC 不会猜你要 JSON 还是表格，它按你描述的格式来。
> 4. **限制技术选型**："只用 Node.js 内置模块，不需要 npm install"——这避免了 CC 自作主张引入 `axios`、`chalk` 等依赖。如果你的目标是零依赖工具，一定要明确说。

---

## 4.4 迭代优化

初始版本写好了，我们跑一下看看效果。

```bash
node check-links.js ./docs
```

输出大概是这样：

```
文件                 链接文本          URL                              状态码  备注
README.md           项目主页          https://github.com/u/repo          301    正常
README.md           文档             https://example.com/docs            200    正常
CHANGELOG.md        旧版链接          https://old-site.com/page          301    正常
```

看起来一切正常。但你仔细一想，`github.com/u/repo` 返回 **301**，而我们把它标记为"正常"——301 确实是 3xx，算在"正常"范围里。**但问题是，我们并没有跟踪重定向。** 如果这个 301 跳转的目标页面也挂了，我们就漏报了。

这就是 AI 编程的典型场景：代码能跑，但业务逻辑有漏洞。

### 迭代 1：修复重定向跟踪

告诉 CC：

~~~
301/302 重定向应该 follow 到最终地址再判断可访问性。现在的代码把 301 直接算正常，但如果重定向目标返回 404，它发现不了。改一下：遇到 301/302 时自动跟随重定向，最多跟 3 次防止死循环，以最终状态码为准。
~~~

CC 会分析问题并给出修改方案。关键变更：

- 原来 `checkLink(url)` 直接发一个 HEAD 请求就返回
- 现在加了一个内部递归：如果 `statusCode` 是 301 或 302，从响应头取出 `location`，用新的 URL 再发一次请求，计数器 `redirectCount` 到 3 就停止
- 同时处理了相对重定向路径（`Location: /new-path`）需要拼回完整 URL 的情况

修改后的核心逻辑大概是这样的（CC 展示的关键 diff）：

```javascript
function checkLink(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount >= 3) {
      resolve({ statusCode: 0, error: 'Too many redirects' });
      return;
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        const nextUrl = location.startsWith('http')
          ? location
          : new URL(location, url).href;
        resolve(checkLink(nextUrl, redirectCount + 1));
      } else {
        resolve({ statusCode: res.statusCode, error: null });
      }
    });
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, error: 'Timeout' }); });
    req.on('error', (err) => resolve({ statusCode: 0, error: err.message }));
    req.end();
  });
}
```

再跑一次，这次 301 的链接会被跟踪到最终状态码，如果最终是 404，就会正确标记为异常。

> 💡 **为什么这样问？**
>
> "301 重定向应该 follow"和"现在 301 的链接全报正常但实际可能挂了"——**这两句话的顺序是故意的**。先说期望行为（应该怎样），再说现状问题（为什么现在不对）。CC 会先理解目标，再对照现状找差距，改起来既快又准。
>
> 如果你只说"链接检查不准"，CC 不知道你想改什么——它会猜，可能去调超时时间，可能去改正则，可能加更多状态码。**模糊的反馈引发随机修改，精准的反馈导向定点修复。**

### 迭代 2：增加 JSON 输出

表格输出在终端看很方便，但如果你想在 CI 流程里用、或者发给同事看，JSON 更好。告诉 CC：

~~~
现在只输出终端表格。加两个命令行参数：
- --output report.json  把结果输出为 JSON 文件
- --format table|json   控制终端输出格式，默认 table

JSON 格式示例：
{
  "summary": { "total": 42, "ok": 38, "broken": 4 },
  "files": [
    { "file": "README.md", "links": [
      { "text": "项目主页", "url": "https://...", "statusCode": 200, "ok": true }
    ]}
  ]
}
~~~

CC 会：

1. 在文件开头加一个简单的参数解析（手动解析 `process.argv`，不引入 `commander` 等库）
2. 把 `main()` 函数改成先收集所有检查结果到一个数组
3. 根据 `--format` 参数选择终端输出方式：`table` 还是 `json`
4. 如果指定了 `--output`，把结果对象 `JSON.stringify` 写入文件

这里有一个细节：CC 修改的是**已有代码**，而不是重写。它会精准地改动参数解析部分、输出部分、main 函数的返回结构，其他逻辑（文件扫描、链接提取、HTTP 检查）完全不动。改了什么一目了然，不会出现"看起来重写了整个文件"的意外。

> 💡 **为什么这样问？**
>
> 加了 `--format` 和 `--output` 两个参数，但描述时把 JSON 的结构示例也给了。这非常关键——如果你只说"输出 JSON 格式的报告"，CC 可能给你一个扁平数组，也可能给你一个按文件分组的对象。给一个**期望的输出样例**，比用自然语言描述 100 个字都准确。这是 Prompt 工程里的"示例驱动"技巧：当你不确定 AI 会怎么理解你的格式要求时，直接给一个你想要的输出示例。

### 迭代 3：并发控制

你的文档目录越来越大，里面有 50 个 .md 文件，每个文件十几个链接。初始代码是逐个串行检查的，跑完要两三分钟。而且如果改成并行（`Promise.all`），几百个请求同时打出去，你的网络和对方的服务器都受不了。

告诉 CC：

~~~
现在检查链接是逐个串行的，太慢了。改成并发但加限制：最多同时 5 个请求。不是简单的 Promise.all —— 要有一个并发池，每完成一个就从队列里取下一个，始终保持最多 5 个在飞。
~~~

CC 会实现一个简洁的并发控制：

```javascript
async function checkAllLinks(links, concurrency = 5) {
  const results = [];
  const queue = [...links];
  
  async function worker() {
    while (queue.length > 0) {
      const link = queue.shift();
      const result = await checkLink(link.url);
      results.push({ ...link, ...result });
    }
  }
  
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
```

这个实现很精巧：创建 5 个 worker，每个 worker 从共享队列里取任务，队列空了就退出。`Promise.all` 等这 5 个 worker 都干完，结果也全在 `results` 数组里了。

> 💡 **为什么这样问？**
>
> 这个 Prompt 的关键不在于说"加并发控制"，而在于**解释为什么不能用 `Promise.all`**。如果你只说"改成并发 5 个"，CC 可能会用 `Promise.all` 分批，每批 5 个一起发出、等全回来了再发下一批——这样批次之间是串行等待的，不如 worker pool 模式高效。解释清楚"原因"（几百个请求会打爆网络）能让 CC 选择更合适的方案。

---

## 4.5 复盘：Prompt-Respond-Iterate 循环

这个 Markdown 链接检查器从零到可用的过程，完整展示 AI 编程的核心循环。把这个模式提炼出来，它在后续所有章节都会反复出现：

**1. 起点要小**

第一次 Prompt 只描述了核心功能：扫描文件、提取链接、检查状态、输出表格。没有一上来就加重定向跟踪、JSON 输出、并发控制——这些东西跑起来后自然会意识到需要。如果你第一次 Prompt 把 10 个需求都写进去，Prompt 会很长，CC 的理解偏差概率会上升，你验证起来也累。**核心跑通，边缘迭代。这是铁律。**

**2. 先跑通再优化**

初始版本跑出结果后，你才有真实的数据来判断哪里需要优化。"重定向的问题"不是设计阶段想出来的——是看到 301 返回后输出表格里的"正常"二字才意识到的。**让真实的运行结果告诉你哪里需要改进，不要在设计阶段穷举所有可能性。**

**3. 精准反馈 > 模糊感觉**

告诉 CC "301 重定向被误报"比"链接检查不准"有用 100 倍。模糊的反馈会让 CC 猜测你的意图，猜测本身就引入新的不确定性。反馈要做到三层：**现象**（301 返回了什么）、**影响**（被误判为正常）、**期望**（应该 follow 到最终地址再判断）。

**4. 增量叠加**

每次迭代只加一个功能：第一轮修重定向，第二轮加 JSON 输出，第三轮加并发控制。如果一次丢三个需求，出问题时你不知道是哪个需求导致的。这和日常开发的"一次只改一个东西，改完验证"是同一个原则。

**5. CC 有记忆，不需要重复上下文**

注意每一轮迭代的 Prompt 都很短——不需要重复"这是一个 Node.js 脚本叫做 check-links.js"之类的背景。CC 自动维护了对话历史，它记得前面写过什么代码、讨论过什么问题。你只需要说**增量**。善用这个特性，你的迭代 Prompt 会越来越短。

---

## 4.6 完整代码

三轮迭代之后，`check-links.js` 的最终版本大概长这样（~120 行）：

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// ── 命令行参数解析 ──────────────────────────────────
const args = process.argv.slice(2);
let targetDir = '.';
let outputFile = null;
let format = 'table';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[++i];
  } else if (args[i] === '--format' && args[i + 1]) {
    format = args[++i];
  } else if (!args[i].startsWith('--')) {
    targetDir = args[i];
  }
}

// ── 文件扫描 ────────────────────────────────────────
function getMdFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── 链接提取 ────────────────────────────────────────
function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = [];
  const regex = /\[([^\]]+)\]\(((?:https?:)\/\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return links;
}

// ── 链接检查（含重定向跟踪）─────────────────────────
function checkLink(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount >= 3) {
      resolve({ statusCode: 0, error: 'Too many redirects' });
      return;
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (!location) {
          resolve({ statusCode: res.statusCode, error: 'Redirect without Location' });
          return;
        }
        const nextUrl = location.startsWith('http')
          ? location
          : new URL(location, url).href;
        resolve(checkLink(nextUrl, redirectCount + 1));
      } else {
        resolve({ statusCode: res.statusCode, error: null });
      }
    });
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, error: 'Timeout' }); });
    req.on('error', (err) => resolve({ statusCode: 0, error: err.message }));
    req.end();
  });
}

// ── 并发控制 ────────────────────────────────────────
async function checkAllLinks(links, concurrency = 5) {
  const results = [];
  const queue = [...links];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      const { statusCode, error } = await checkLink(item.url);
      results.push({ ...item, statusCode, error });
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

// ── 主流程 ──────────────────────────────────────────
async function main() {
  const absDir = path.resolve(targetDir);
  if (!fs.existsSync(absDir)) {
    console.error(`目录不存在: ${absDir}`);
    process.exit(1);
  }

  const mdFiles = getMdFiles(absDir);
  if (mdFiles.length === 0) {
    console.log('未找到 .md 文件');
    return;
  }

  // 收集所有链接
  const allLinks = [];
  for (const file of mdFiles) {
    for (const link of extractLinks(file)) {
      allLinks.push({ file: path.relative(absDir, file), ...link });
    }
  }

  console.log(`找到 ${mdFiles.length} 个 .md 文件，${allLinks.length} 个外部链接\n`);

  // 并发检查
  const results = await checkAllLinks(allLinks, 5);

  // 统计
  const ok = results.filter(r => r.statusCode >= 200 && r.statusCode < 400 && !r.error).length;
  const broken = results.length - ok;

  // 输出
  if (format === 'json') {
    console.log(JSON.stringify({ summary: { total: results.length, ok, broken }, results }, null, 2));
  } else {
    console.log(`${'文件'.padEnd(30)} ${'链接文本'.padEnd(20)} ${'URL'.padEnd(50)} ${'状态码'.padEnd(8)} 备注`);
    console.log('-'.repeat(130));
    for (const r of results) {
      const status = r.error ? 'ERR' : String(r.statusCode);
      const note = r.error ? r.error : (r.statusCode >= 200 && r.statusCode < 400 ? 'OK' : 'BROKEN');
      console.log(`${r.file.padEnd(30)} ${r.text.slice(0, 18).padEnd(20)} ${r.url.slice(0, 48).padEnd(50)} ${status.padEnd(8)} ${note}`);
    }
    console.log(`\n总计: ${results.length} | 正常: ${ok} | 异常: ${broken}`);
  }

  // 输出到文件
  if (outputFile) {
    const report = { summary: { total: results.length, ok, broken }, results };
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n报告已保存到: ${outputFile}`);
  }
}

main().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
```

---

## 4.7 核心技巧

- **起点要小**：首次 Prompt 只描述核心功能。不要一口气列 10 个需求——跑起来之后，你自然会知道哪些地方需要改进。
- **先跑通再优化**：让真实的运行结果告诉你哪里需要改。301 重定向的问题不是预先想出来的，是看到输出表格之后才意识到的。
- **精准反馈三板斧**：现象（301 返回了什么）、影响（被误判为正常）、期望（应该 follow 到最终地址）。三条说清楚，CC 一改就准。
- **增量叠代，一次一个**：每次迭代只加一个功能——先修 bug，再加功能，最后优化性能。出问题了好定位。
- **示例驱动**：当格式要求不好描述时，直接给期望的输出示例（如 JSON 结构），比写 100 个字的说明都管用。
- **CC 有记忆，别重复**：迭代 Prompt 只需要描述增量和变化，不需要每次重复背景和上下文。

---

## 4.8 小结

> 💡 **本章要点**
> - 第一个 AI 编程任务选了一个实用工具（Markdown 链接检查器），不是 Hello World，但也不复杂——恰好体验完整迭代循环的量级。
> - 初始 Prompt 结构化是关键：编号列表、具体参数、输出格式、技术限制——四个要素让 CC 一次性给出高质量初始代码。
> - 初始版本能跑但有 bug（301 被误判为正常），这是 AI 编程的常态——代码能跑不代表逻辑正确。验证环节不可省略。
> - 三轮迭代分别解决了正确性（重定向跟踪）、可用性（JSON 输出）、性能（并发控制）三个维度的问题。每轮只聚焦一个维度。
> - 核心模式：起点要小 → 先跑通 → 精准反馈 → 增量叠加 → CC 有记忆。这个模式会贯穿 Part 2 的整个 iTranslate 开发过程。
> - 反馈的质量决定修复的质量。模糊反馈（"不准"）引发随机修改，精准反馈（"301 应 follow 到最终地址"）导向定点修复。
> - 最终产出了一个 ~120 行、零依赖、支持重定向跟踪 + JSON 输出 + 并发控制的实用工具。它是你自己写出来的，但 AI 帮你省掉了 90% 的编码时间和 100% 的查文档时间。

---

现在你已经掌握了 Claude Code 的基本操作，并且完成了一个完整的 AI 编程迭代循环。从第 5 章开始，我们将进入 Part 2——用这套方法，从零开始构建一个真正的产品：iTranslate Chrome 翻译扩展。那个任务更复杂、更有挑战性，但你将在其中看到，本章学到的每一个技巧都会在那里放大十倍地发挥作用。

---

## 待补充

- [ ] 截图：CC 对话中的初始 Prompt 和回复（剪裁关键部分）
- [ ] 截图：终端运行 `node check-links.js ./docs` 的输出表格
- [ ] 截图：迭代修复前后的对比（301 误报 → 正确跟踪）
- [ ] 确认：完整代码是否能在读者的 Node.js 18+ 环境直接跑通


\newpage

# 第 5 章 立项：从想法到 Spec

## 1. 本章目标

读完本章，你将看到一个真实项目从"我想做一个翻译扩展"这句模糊的话，到产出一份可执行的技术 Spec 的完整过程。你会理解 Claude Code 的 brainstorming Skill 如何帮你把模糊需求收敛为清晰定位，以及在 AI 编程中为什么"先写 Spec 再写代码"是一条铁律。

---

## 2. 想法阶段

2026 年 5 月，我有了一个想法：做一个 Chrome 翻译扩展。

说实话，这个想法本身没什么特别的。市面上已经有几十款翻译扩展——Google 翻译、沉浸式翻译、Mate Translate、沙拉查词……每一款都有各自的用户群。我再做一个，凭什么让别人用？

最初的动机很简单：市面上的翻译扩展，要么依赖内置的免费翻译引擎（翻译质量不可控），要么需要你自己去申请 API Key 但配置流程复杂。我想要一个"翻译质量高、配置简单、Prompt 可控"的东西。当时脑子里只有这么几个关键词，离一个真正的产品还很远。

真正推动这个想法落地的，是 Claude Code 的 brainstorming Skill。我把这个模糊的想法丢给 CC，它没有立刻说"好的，我来写代码"，而是反过来问了我一堆问题。这些问题本身，就是本章最值得讲的东西。

**关键转折点**来自一个发现：如果让用户自带 API Key，翻译质量取决于用户选的模型（DeepSeek、Claude、GPT 都可以），我们不需要自己维护翻译服务，成本为零。而"自带 API Key"本身就是一种定位——它和"内置免费引擎"形成了差异化：前者面向愿意花 5 分钟配置、要求翻译质量可控的用户；后者面向一键安装、对质量要求不高的用户。这两个群体虽然都叫"翻译扩展用户"，但实际上是两群人。

这个定位一旦清晰，后面的所有决策都有了锚点。

---

## 3. 用 CC 做需求澄清

脑暴（brainstorming）是我在 iTranslate 项目中用的第一个 CC Skill，也是最有价值的一个。它不像你想象的那样"天马行空地给你出点子"，而是通过一系列结构化的问题，一步步把你的模糊想法逼到墙角，直到你不得不面对那些你之前"没想过"的问题。

以下是当时对话的核心重现（不是逐字记录，但问题和回答的顺序是真实的）：

```
[我的 Prompt]
> 我想做一个 Chrome 翻译扩展，类似沉浸式翻译的双语对照效果。
> 翻译引擎用 DeepSeek API。帮我用 Claude Code 从零搭建这个项目。

[CC 的回复 — brainstorming Skill 加载]
> 在开始之前，我想先理清几个问题：
>
> 1. 目标用户是谁？是开发者（习惯自己配 API Key），还是普通用户（期望开箱即用）？
> 2. 核心差异化是什么？市面上的翻译扩展已经很多了，你的扩展解决了什么他们没解决的问题？
> 3. 翻译方向：只做英→中，还是支持多语种互译？
> 4. 触发方式：用户手动点击翻译，还是打开页面自动翻译？
> 5. 收费模式：免费（API 费用谁出）还是付费（用户自带 Key）？
> 6. 浏览器兼容：只做 Chrome，还是也要支持 Firefox/Edge？

[我的回答]
> 目标用户是愿意自己配 API Key 的人，主要是开发者和重度翻译用户。
> 差异化：Prompt 完全可控——用户可以在设置里自定义 System Prompt，
> 让翻译风格符合自己的偏好（更正式、更口语、保留术语等）。
> 先做英→中，触发方式手动，用户自带 API Key 所以免费。
> 先只做 Chrome/Edge（都是 Chromium）。

[CC 的进一步追问]
> Prompt 可控是个很好的差异化点。但我要追问几个问题：
>
> - "翻译风格可定制"听起来很酷，但版本 1 就要做吗？还是先做一个好用的默认 Prompt，
>   后续再开放自定义？过早开放可能会让普通用户困惑。
> - 手动触发这个选择意味着用户每次都要点一下按钮。你考虑过"记住用户选择"
>   （比如某个域名默认翻译）吗？
> - "用户自带 Key"意味着你需要一个 Settings 页面来配置 endpoint 和 key。
>   这个页面的设计优先级应该排在前面。
```

这段对话揭示了 brainstorming Skill 的核心价值：**它不是帮你找答案，而是帮你找到那些你没问过自己的问题。** "目标用户是谁"、"差异化是什么"、"v1 该做什么不该做什么"——这些问题在你开始写代码之前就应该有答案。没有答案就开始写，写着写着就会发现自己在解决一个不存在的问题。

```
[为什么这样问]
💡 CC 的 brainstorming Skill 之所以有效，不是因为它"聪明"，
而是因为它持有一套结构化的提问框架。它不会跳过"需求澄清"直接进入"方案设计"，
也不会因为你的回答看起来合理就不再追问。它的目标是确保当你说"开始写代码"时，
你已经想清楚了做什么、为谁做、不做什么。在传统开发中，这个过程通常由产品经理
或技术负责人来完成；在 AI 编程中，CC 承担了这个角色。区别在于：产品经理可能会
被你的热情带偏，CC 不会。
```

经过这轮澄清，项目的定位从"做一个翻译扩展"收敛为：**一个面向开发者/高级用户的 Chrome 翻译扩展，用户自带 API Key（DeepSeek 或其他 OpenAI 兼容接口），Prompt 完全可控，手动触发，先做英→中，默认 Prompt 内置但可编辑。** 这个定位只有一句话，但它回答了你需要回答的所有关键问题。

---

## 4. 技术选型讨论

定位清晰之后，下一个问题是：用什么技术栈？

这不是一个"随便选就行"的问题。Chrome 扩展开发有它自己的技术约束和社区生态，选错了技术栈，轻则开发体验差，重则项目中途推倒重来。

**Manifest V2 vs V3**

Chrome 扩展有两套清单规范：Manifest V2 和 Manifest V3。V2 即将被 Chrome 废弃（Google 官方时间线已经明确了 V2 的淘汰计划），新项目没有任何理由选择 V2。但 V3 有一个关键限制：Background 页不再是常驻的，而是 Service Worker——它会被浏览器随时休眠和唤醒。这意味着你不能再在 Background 里维护全局状态、不能用 `setTimeout` 做长时间定时器、每次唤醒都可能丢失之前的变量。

这个限制对翻译扩展的影响是：Service Worker 的冷启动竞态。当你发送一条消息给 Background 时，如果 Worker 正好处于休眠状态，消息可能在 `onMessage` 监听器注册之前就到达了，导致"Receiving end does not exist"错误。这个问题在后面开发中确实遇到了，解决方案是在 Content Script 里加了 3 次重试机制（每次间隔 600ms），给 Worker 足够的唤醒时间。

选择 V3 的理由很简单：它是 Chrome 的未来，V2 即将成为历史。即使 V3 有一些坑，也比选一个即将废弃的规范要好。

**Vite + @crxjs/vite-plugin vs Webpack vs 手动配置**

Chrome 扩展的构建工具选型其实有三个选项：

| 方案 | 优点 | 缺点 |
|------|------|------|
| 手动配置（纯 tsc + 脚本） | 无依赖，完全可控 | manifest 手动维护，无 HMR，开发效率低 |
| Webpack + 插件 | 生态成熟，插件多 | 配置复杂，构建速度慢 |
| Vite + @crxjs/vite-plugin | 极速 HMR，自动处理 manifest | 社区规模小，部分边缘场景支持不足 |

最终选择 Vite + crxjs，核心理由：开发体验。Vite 的 HMR（热模块替换）在开发扩展时极其实用——你修改 popup 的 UI，保存文件，浏览器里的扩展就已经更新了，不需要手动重新加载。crxjs 自动从 `package.json` 读取版本号注入 `manifest.json`，省去了手动维护版本号的麻烦。至于 Webpack，在 2026 年，除非有非常特殊的兼容性需求，否则没有理由在新建项目中选择它。

**权限策略：为什么只声明 3 个最小权限**

这是 iTranslate 技术选型中最重要的一个决策。大多数 Chrome 翻译扩展在 `manifest.json` 中声明了 `<all_urls>` 或 `host_permissions`，意味着它们可以读取用户访问的任意网页的全部内容。功能上这很方便——打开任何页面都能自动翻译。但代价是：

1. Chrome Web Store 审核变严：声明广泛主机权限的扩展需要更长的审核时间和更详细的隐私说明。
2. 用户信任度降低：安装时 Chrome 会弹出警告"此扩展可以读取和更改您在所有网站上的数据"。

iTranslate 的选择是：**仅声明 `storage`、`activeTab`、`scripting` 三个权限。** Content Script 不随页面自动注入，而是通过 Popup 调用 `chrome.scripting.executeScript` 按需注入。用户点击翻译按钮时，扩展才向当前页面注入脚本；用户关闭页面后，脚本自然消失。

这个决策的代价是：实现复杂度更高。你需要一套"注入检测 → 按需注入 → 注入确认"的机制（iTranslate 用 `ensureContentScript()` 实现了这个流程，先 ping 探测，未响应则注入，注入后最多重试 5 次确认就绪）。结果是：权限声明只有 3 项，用户安装时不会看到"读取所有网站数据"的警告。

CC 在这些讨论中的角色值得一说：它不会直接告诉你"选 Vite 就对了"。相反，它会列出每个方案的利弊，然后让你判断。你是做决策的人，CC 是帮你收集信息、分析权衡的人。这个分工很重要——技术选型的最终责任在你，不在 AI。

---

## 5. 产出 Spec

需求清晰了、技术选型定了，下一步不是写代码，而是写 Spec。

iTranslate 的设计 Spec 放在 `docs/superpowers/specs/2026-05-19-itranslate-design.md`。这是项目的第一份正式文档，也是后续所有代码的基础。它的内容结构如下：

- **核心定位**：一句话说清楚这个扩展是什么、给谁用
- **功能摘要**：v1 做什么、不做什么（`Out of Scope` 列表明确排除了自动翻译、多语种互译、Firefox 支持等）
- **技术架构**：4 个隔离的执行上下文（Background / Content Script / Popup / Settings），各自的职责和依赖关系
- **消息协议**：12 种 action 类型，定义了消息的方向、payload 格式和错误处理
- **数据流**：从用户点击按钮到翻译卡片渲染到页面上的完整 10 步流程
- **错误处理矩阵**：每种异常场景的应对策略（API 未配置 → 导航到设置页；429 → 指数退避重试；网络失败 → 重试 3 次 + 错误提示）
- **缓存策略**：IndexedDB，SHA-256 哈希作 key，v1 无过期时间
- **测试策略**：三层测试（单元 / 集成 / E2E），各自的工具和范围

**为什么花时间写 Spec 值得？**

在传统开发中，Spec 的价值是"让团队成员对齐理解"。在 AI 编程中，Spec 还有一个更重要的作用：**它是给 AI 的详细需求文档。**

你跟 CC 说话和跟人类同事说话有个关键区别：人类同事会主动追问不清楚的地方，会基于自己的经验补充细节。CC 虽然也会追问，但它追问的深度和广度取决于你给它的指令。一份写清楚的 Spec，等于在对话开始之前就把所有关键约束和设计决策"喂"给了 CC，它不需要猜，也不会漏。

iTranslate 的实践证明了这一点：在有了 Spec 之后，后续 14 个功能模块的实现几乎没有出现方向性返工。CC 每次读代码时都会参考 Spec 中的架构约定（比如"Content Script 不能直接调 API，必须通过 Background"），代码质量始终保持在同一个基准线上。

一句话总结：**写 Spec 花 1 小时，省 10 小时的返工。** 在 AI 编程中尤其如此。因为 AI 的"返工"不是改几行代码的问题——它可能在错误的方向上写完一整个模块你才发现不对劲。Spec 就是你的护栏。

---

## 6. 架构图

Spec 中最核心的一张"图"不是图表，而是架构关系的清晰定义。iTranslate 的 4 上下文架构可以用 ASCII 图表达：

```
                    chrome.runtime.sendMessage
┌──────────────┐ ◄─────────────────────────► ┌──────────────────┐
│    Popup     │                               │   Background     │
│  工具栏弹窗   │                               │   翻译引擎+缓存    │
│              │                               │                  │
│ 翻译/撤销按钮  │                               │ translateBatch() │
│ 语言选择      │                               │ translateDict()  │
│ 划词开关      │                               │ cacheGetBulk()   │
└──────┬───────┘                               └────────┬─────────┘
       │                                                │
       │ chrome.scripting.executeScript                 │ chrome.runtime
       │ (按需注入 content.js)                            │ .sendMessage
       │                                                │
       ▼                                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Content Script                           │
│                       (页面内执行)                                │
│                                                                  │
│  extractRawSegments()  ──►  structuredFilter  ──►  renderCards() │
│       (遍历 DOM)              (过滤噪音)              (注入翻译)    │
│                                                                  │
│  MutationObserver ──►  catchUpNewContent()  (动态内容追扫)       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Settings   │  (独立选项页，配置 API endpoint / key / model / prompt)
└──────────────┘
```

**两个关键设计决策：**

1. **Background 不直接操作 DOM，Content Script 不直接调 API。** 这是 MV3 架构的精髓。Background 作为 Service Worker 没有 DOM 访问权限，它的职责是"纯计算"——接收文本、翻译、返回结果。Content Script 运行在页面上下文中，有完整的 DOM 访问权，但它不持有 API Key 和缓存——这些敏感数据和持久化状态属于 Background。两边通过 `chrome.runtime.sendMessage` 通信，职责边界清晰。

2. **Content Script 按需注入，非常驻。** 这对应了权限策略中的 `activeTab` + `scripting` 设计。Content Script 不在 `manifest.json` 中声明，而是由 Popup 在用户点击翻译按钮时通过 `chrome.scripting.executeScript` 注入。翻译完成后，Content Script 留在页面中等待后续操作（撤销翻译、划词翻译），但页面一旦关闭或刷新，它自然消失。这意味着扩展对用户隐私的影响是"点对点"的——只有用户主动触发翻译的页面才会有脚本注入。

---

## 7. 核心技巧

1. **想法模糊时，不要直接让 AI 写代码，先用 brainstorming Skill 澄清。** 把"我想做一个 X"丢给 CC，让它问你问题。你的回答质量决定了后续所有代码的质量。iTranslate 的定位从"又一个翻译扩展"收敛到"面向开发者、Prompt 可控、自带 API Key"，靠的就是这轮澄清。

2. **Spec 里一定要有"不做什么"。** 很多人写 Spec 只写功能列表，不写明确的排除项。结果是：开发中时不时冒出"要不要也支持一下 XX"的诱惑，导致范围蔓延。iTranslate 的 Spec 在 `Out of Scope` 里明确排除了自动翻译、多语种互译、Firefox 支持等 7 项——每当你犹豫"要不要做"时，看一眼这个列表就清醒了。

3. **技术选型时，让 CC 分析利弊，你做决定。** 不要问"我应该用什么"，而是问"A 和 B 各自的利弊是什么"。CC 擅长分析，不擅长替你做价值判断——因为价值判断需要你比 CC 更了解自己的优先级（开发速度 vs 长期维护 vs 审核通过率）。

4. **权限策略要在一开始就定好。** Chrome 扩展的权限声明是"不可逆"的——你今天加了 `host_permissions`，以后去掉，已经安装的用户不会自动失去这个权限。而且广泛的权限声明会显著拉长 Chrome Web Store 的审核时间。iTranslate 的 3 权限策略是故意为之的"最小化设计"，这个决策省了很多后顾之忧。

5. **架构图不一定要画得很漂亮，但一定要有。** ASCII 图就够用了。它的作用是让你（和 CC）在任何时候都能回到这张图上，检查某个改动是否符合架构约定。如果一张架构图解释不了你的改动，要么是图该更新了，要么是改动跑偏了。

---

## 8. 小结

- **定位先行**：从"做一个翻译扩展"这个模糊想法，到"面向开发者的、Prompt 可控的、自带 API Key 的翻译工具"这个清晰定位，中间差了一轮 brainstorming 的结构化追问。CC 不会替你决定方向，但它会确保你没有漏掉关键问题。
- **技术选型要讲道理**：Manifest V3（未来兼容）→ Vite（开发体验）→ crxjs（自动 manifest）→ 3 权限（审核友好）。每一个选择都有明确的理由，而不是"大家都这么选"。
- **Spec 是 AI 编程的护栏**：`docs/superpowers/specs/2026-05-19-itranslate-design.md` 是后续 14 个模块的代码基准。写 Spec 花 1 小时，省 10 小时返工。Spec 里必须包含功能列表、排除项、数据流、错误处理矩阵和测试策略。
- **架构图是团队（你和 CC）的共同语言**：4 上下文隔离 + 消息通信 + 按需注入。Background 不碰 DOM，Content Script 不持有 API Key。每次改动前回到这张图。
- **权限策略是一开始就要做对的决定**：`storage` + `activeTab` + `scripting`，不多不少。这个决策直接影响了审核体验和用户信任。

> 下一章：第 6 章「脚手架：Manifest V3 扩展」——从 `npm init` 到第一个能加载到 Chrome 里的 Hello World 扩展。


\newpage

# 第 6 章 脚手架：Manifest V3 扩展

## 1. 本章目标

读完本章，你将亲手搭起一个 Manifest V3 浏览器扩展的完整脚手架——从 `npm init` 到第一个能加载进 Chrome 的 Hello World。你会理解 Vite + crxjs 的构建原理、四个执行上下文的隔离机制，以及为什么 Content Script 必须构建为 IIFE 格式。

---

## 2. MV3 扩展的最小骨架

Chrome 扩展的本质是一个压缩包，里面至少需要一个 `manifest.json`。iTranslate 的 manifest 骨架长这样：

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "version": "0.0.0",
  "default_locale": "en",
  "permissions": ["storage", "activeTab", "scripting"],
  "background": {
    "service_worker": "src/background/index.ts"
  },
  "action": {
    "default_popup": "src/popup/popup.html"
  },
  "options_page": "src/settings/settings.html"
}
```

逐个字段解释：

- `manifest_version: 3`：声明这是 MV3 扩展。MV2 即将被 Chrome 废弃，新项目没有选择 V2 的理由。
- `permissions`：**只有三个**——`storage`（保存设置）、`activeTab`（获取当前标签页信息）、`scripting`（动态注入脚本）。这个极简权限列表是刻意设计的，下一段详细说。
- `background.service_worker`：指向 Background 的入口文件。注意这里写的是 TypeScript 源码路径（`src/background/index.ts`），不是编译产物——这是因为 crxjs 在构建时会自动处理路径映射。
- `action.default_popup`：工具栏图标的弹窗页面。用户点击扩展图标时弹出来的小窗口。
- `options_page`：右键扩展图标 → "选项"打开的设置页。

**为什么故意不声明 `host_permissions`？**

大多数 Chrome 扩展在 manifest 中声明 `<all_urls>` 或 `host_permissions`，意味着它们可以读取用户访问的任何网页。功能上很方便——打开任何页面都能自动工作。但 iTranslate 刻意不这么做，理由有三：

1. **Chrome Web Store 审核**：声明广泛主机权限的扩展审核周期更长，需要提交详细的隐私说明。只声明 `storage`、`activeTab`、`scripting` 三项的扩展，审核通常几天内完成。

2. **按需注入策略**：Content Script 不是随页面自动注入的，而是通过 Popup 调用 `chrome.scripting.executeScript` 按需注入。用户点击翻译按钮时扩展才向当前页面注入脚本，用户关闭页面后脚本自然消失。这意味着扩展对用户隐私的影响是"点对点"的——只有用户主动触发翻译的页面才有脚本注入。

3. **用户信任**：安装时不弹"此扩展可以读取和修改您在所有网站上的数据"的警告。对于一款需要用户输入 API Key 的扩展来说，这个信任感至关重要——用户看到那个红色警告，本能反应是点取消。

代价是实现复杂度更高：你需要一套"注入检测 → 按需注入 → 注入确认"的机制来确保 Content Script 在需要时一定在场。这个代价我们在后面的章节会看到回报。

---

## 3. Vite + crxjs 搭建过程

选定 Vite + crxjs 后，实际的搭建过程异常简洁。`vite.config.ts` 只有 13 行：

```typescript
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import pkg from './package.json';

export default defineConfig({
  plugins: [crx({
    manifest: {
      ...manifest,
      version: pkg.version,
    },
  })],
});
```

关键点就一个：`crx()` 插件接收 `manifest` 对象，展开源码 `manifest.json` 的所有字段，然后用 `package.json` 的 `version` 覆盖 `0.0.0` 占位符。源码 manifest 中版本号写死 `0.0.0`，只有构建产物的 manifest 才包含真实版本号——这意味着你永远不需要手动同步版本号，`npm run release` 自动递增 `package.json` 的构建号后，构建产物的 manifest 自动跟上。

**为什么选 crxjs？**

三个理由，按重要性排序：

1. **自动处理 manifest**：版本号注入、路径映射（TS 源码 → 编译产物）、权限声明合并，全部自动完成。手动维护 manifest 是 Chrome 扩展开发中最容易出错的环节，crxjs 把这个环节消灭了。

2. **HMR（热模块替换）**：`npm run dev` 启动 Vite dev server 后，你修改 Popup 的 TS 文件，保存，浏览器里的扩展弹窗就已经更新了，不需要手动去 `chrome://extensions` 点刷新。这个体验差距在迭代 UI 时尤为明显——每改一个样式手动刷新一次，和改完立刻看到效果，是两种完全不同的开发节奏。

3. **区分构建上下文**：Background（Service Worker）、Content Script、Popup 是三套完全不同的运行时环境，构建需求不同。crxjs 把这三种构建差异封装在插件内部，开发者只需要关注业务代码。

**两种加载方式：**

- 开发时：`npm run dev` → Vite 启动 dev server → Chrome `chrome://extensions` → "加载已解压的扩展程序" → 选择**项目根目录**（不是 `dist/`）。crxjs 的 dev server 直接从源码目录提供文件。
- 生产时：`npm run build` → 产出 `dist/` 目录 → Chrome 加载 `dist/`。

**CC 在脚手架搭建中的实际交互：**

```
[我的 Prompt]
> 我要做一个 Chrome Manifest V3 扩展，用 Vite + TypeScript。
> 帮我初始化项目结构，包括 manifest.json、vite.config.ts、
> 以及 background / content script / popup / settings 四个入口。

[CC 的回复]
> 我来帮你搭建。首先确认几个技术选型：
> - 构建工具用 Vite + @crxjs/vite-plugin（自动处理 manifest）
> - 权限暂时只声明 storage, activeTab, scripting（最小权限原则）
> - Content Script 后续用 executeScript 按需注入，不声明 content_scripts
>
> 现在生成以下文件...

[为什么这样问]
💡 搭建脚手架时，CC 不会问你要什么文件结构——它会直接根据 MV3 规范
推断出你需要的最小文件集合。你只需要告诉它技术选型（Vite + crxjs），
它就能生成正确的配置文件。这里的关键是：你一定要确认权限策略——
CC 默认可能会加 host_permissions，如果你不主动要求最小权限，
它不会替你想到"审核友好"这个维度。
```

---

## 4. 四上下文入口

iTranslate 有四个独立的执行上下文，每个都有入口文件：

| 上下文 | 入口文件 | 运行时环境 |
|--------|----------|-----------|
| Background | `src/background/index.ts` | Service Worker |
| Content Script | `src/content/index.ts` | 页面 DOM |
| Popup | `src/popup/popup.html` + `popup.ts` | 工具栏弹窗 |
| Settings | `src/settings/settings.html` + `settings.ts` | 独立选项页 |

**为什么是四个独立上下文，而不是一个？**

这不是设计选择，而是 Chrome MV3 的架构强制要求。MV3 把扩展拆成了几个互相隔离的沙箱：

- **Service Worker**（Background）：没有 DOM 访问权，可以随时被浏览器休眠。生命周期完全由浏览器控制——空闲约 30 秒后终止，下次有消息时重新唤醒。这意味着你不能在 Background 里维护全局状态，不能用 `setTimeout` 做长时间操作。每次唤醒都是一个"干净"的环境。
- **Content Script**：运行在页面上下文中，有完整的 DOM 访问权。但它和页面自身的 JS 运行在隔离的世界（isolated world）——变量不共享，互不污染。生命周期随页面：页面打开时注入，页面关闭时销毁。
- **Popup**：点击工具栏图标时创建，点击其他区域时销毁。每次打开都是一个全新的实例，状态不保留。生命周期通常只有几秒到几分钟。
- **Settings**：独立标签页，和 Popup 一样的短生命周期——用户配置完就关了。

这四个沙箱之间唯一的通信方式是 `chrome.runtime.sendMessage`。Background 不能直接操作 DOM，Content Script 不应该持有 API Key 和缓存——这些敏感数据存在 Background 的 IndexedDB 里，Content Script 只负责把文本发给 Background、把翻译结果渲染到页面上。

**CC 生成的初始文件结构：**

```
src/
├── background/
│   └── index.ts          # onMessage 监听器骨架
├── content/
│   └── index.ts          # 消息监听 + DOM 操作骨架
├── popup/
│   ├── popup.html        # 弹窗页面
│   └── popup.ts          # 按钮事件 + 消息发送
├── settings/
│   ├── settings.html     # 选项页面
│   └── settings.ts       # 表单绑定 + 存储读写
└── shared/
    ├── types.ts          # 共享类型定义
    └── storage.ts        # chrome.storage 封装
```

初始代码量极少——每个入口文件不超过 30 行，基本上就是一个 `onMessage` 监听器的架子。CC 不会替你做"过度设计"，它生成的是一个刚好能跑起来的最小骨架。后面的模块（router、extractor、renderer、translator）都是在需要时才拆出来的。

---

## 5. IIFE 构建的特殊处理

Content Script 的构建有个特殊的坑：`chrome.scripting.executeScript` 的参数是一个代码字符串或文件路径，它**不支持 ESM 的 `import`/`export` 语法**。如果你直接把含有 `import` 语句的 TypeScript 编译产物丢给 `executeScript`，运行时会报错。

这意味着 Content Script 必须构建为 **IIFE（Immediately Invoked Function Expression，立即执行函数表达式）** 格式——所有依赖内联到一个文件里，用一层函数包裹，不产生任何模块边界。iTranslate 用了一个独立的 Vite 配置文件来做这件事：

```typescript
// vite.content.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      formats: ['iife'],
      name: 'iTranslateContent',
      fileName: () => 'content.js',
    },
    outDir: 'dist/assets',
    emptyOutDir: false,
  },
});
```

几个关键决策：

- `formats: ['iife']`：告诉 Vite 把输出打包为 IIFE，不做代码分割，所有东西都在一个自执行函数里。
- `emptyOutDir: false`：不能清空 `dist/`——因为主构建（`vite.config.ts`）已经把 popup、background、settings 的产物输出到 `dist/` 了，这个辅助构建只是往 `dist/assets/` 追加一个 `content.js`。如果清空，前面的构建产物就没了。
- CSS 通过 `?inline` 导入为字符串：`import themeCss from '../shared/theme.css?inline'`，然后在注入时创建 `<style>` 标签插入页面。这样 CSS 也被内联到了 IIFE 里，不需要额外的文件加载。

完整的构建命令也因此变成了两步：

```bash
tsc && vite build && vite build --config vite.content.config.ts
```

先类型检查，再主构建（popup + background + settings），最后辅助构建（content.js）。

**为什么不用 `content_scripts` 声明式注入？**

MV3 支持在 `manifest.json` 中通过 `content_scripts` 字段声明匹配 URL 模式，让 Chrome 自动注入脚本。但这个方案有一个致命的缺点：你必须在 manifest 中声明 `host_permissions`，告诉 Chrome 你需要在哪些网站上自动注入脚本。而 iTranslate 的权限策略就是不声明 `host_permissions`——所以声明式注入这条路走不通。`executeScript` + `activeTab` 的组合是唯一符合最小权限原则的方案，代价就是多写了一个 `vite.content.config.ts`。

---

## 6. 核心技巧

1. **manifest.json 中的版本号写占位符**：源码中写 `0.0.0`，真正的版本号由构建时从 `package.json` 注入。这个习惯避免了你忘记更新 manifest 版本号导致的"改了代码但版本号没变"的尴尬。

2. **权限策略一开始就要定好，且只加不减**：Chrome 扩展的权限是"不可逆"的——你今天加了 `host_permissions`，以后去掉，已安装的用户不会自动失去这个权限。iTranslate 的三个权限（storage、activeTab、scripting）是深思熟虑后的最小集。

3. **脚手架阶段不要写业务逻辑**：CC 生成的初始文件应该只有骨架——空的 `onMessage` 监听器、空的 HTML 页面、最小化的 import。不要在这个阶段塞 business logic 进去，否则模块边界会被早期的不成熟设计污染。iTranslate 的 router、extractor、renderer 等模块都是在各自的功能开发时才拆出来的。

4. **dev 和 build 加载的目录不同**：开发时 Chrome 加载项目根目录（crxjs dev server 从这里提供文件），生产构建后加载 `dist/`。很多新手在这里犯错——改完代码发现在 Chrome 里没变化，原因是加载了 `dist/` 但忘记 build。

---

## 7. 小结

- **manifest.json 是扩展的身份证**：`manifest_version: 3` 声明时代，`permissions` 只写三个（storage、activeTab、scripting），不声明 `host_permissions`——这是权限保持最简的关键。
- **Vite + crxjs 把脚手架简化到 13 行配置**：自动版本号注入、HMR 热更新、多上下文构建差异封装。源码 manifest 版本号写 `0.0.0` 占位。
- **四个执行上下文是完全隔离的沙箱**：Background（Service Worker，随时休眠）、Content Script（页面 DOM，按需注入）、Popup（点击弹窗，即开即毁）、Settings（独立标签页）。它们之间唯一的通信方式是 `chrome.runtime.sendMessage`。
- **Content Script 必须构建为 IIFE**：`executeScript` 不支持 ESM。用独立的 `vite.content.config.ts` 打包，`emptyOutDir: false` 避免覆盖主构建产物。CSS 通过 `?inline` 内联为字符串。
- **脚手架阶段保持极简**：CC 生成的初始文件不超过 30 行，只做骨架不写业务逻辑。

> 下一章：第 7 章「翻译引擎：Prompt 设计」——从 API 调通到写出第一个能产出合格翻译的 System Prompt。


\newpage

# 第 7 章 翻译引擎：Prompt 设计

## 1. 本章目标

读完本章，你将亲手写出一个能与 OpenAI 兼容 API 对话的翻译引擎——包括 System Prompt 的设计思路、批处理与并发策略、以及缓存层的实现。你会理解为什么 temperature 设 0.1 而不是 0、为什么 `[N]` 比 `1.` 更不容易被模型误解，以及我们在 DeepSeek 推理模型上踩过的 thinking 模式的坑。

---

## 2. 与 OpenAI 兼容 API 对话

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

## 3. System Prompt 设计

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

## 4. 批处理与并发

一个新闻页面可能有 80 个文本段。如果逐段翻译，80 次 API 调用串行跑，每段耗时 2 秒，总用时 160 秒——用户等到花都谢了。如果一次性把所有 80 段塞进一次 API 调用，请求体的 token 数会远超限制。

iTranslate 的方案是**按 token 数动态分批 + 并发控制**。

**先算 token，再分批。** 不要用字符数做分批依据——同样 100 个字符，中文和英文的 token 数差 4 倍。`segmentTokenEstimate()` 的做法是取文本前 40 个字符采样：如果 CJK（中日韩统一表意文字，Unicode 范围 0x4E00-0x9FFF 等）字符占比超过 30%，按 1.5 token/字符估算；否则按 0.35 token/字符估算。每批目标 1500 token——在翻译质量（batch 太小模型缺少上下文）和延迟（batch 太大单次请求慢）之间取了一个平衡。

**并发控制最多 3 批同时发出。** `translateBatch()` 维护一个队列，启动 3 个 worker 从队列里消费。第 3 章讲过 Promise 链式调用的并发控制，这里就是实战应用——`runNext()` 处理完当前批后递归调用自己取下一批，直到队列清空。

**重试策略很克制：只重试 429（限流）和 5xx（服务端错误），最多 3 次，指数退避。** 429 表示你发太快了，指数退避（`2^attempt * 1000` ms）给服务端喘息空间。5xx 表示服务端暂时不可用，等下可能就好了。但 4xx（如 401 未授权、400 参数错误）绝不重试——这些是你自己的问题，重试一万次也解决不了，直接抛错才是正确做法。

**结果排序：位置映射（position map）。** 3 批并发出去了，但它们返回的顺序是不确定的——慢的翻译可能最后回来。如果直接按返回顺序拼接结果，第 5 段的翻译可能出现在第 1 段的位置。`translateBatch()` 用 `origIndices` 数组记录每段在原始数组中的位置，结果写回 `results[batch.origIndices[j]]`，保证最终输出顺序和输入完全一致。

DeepSeek 推理模型还有一个特殊的坑：`thinking` 模式会消耗 `completion_tokens` 但留下空的 `content`。因为推理模型会先"思考"再回答，如果思考占满了 `max_tokens` 限制，回答就是空的。`translateOneBatch()` 检测这种情况——`!content && data.usage?.completion_tokens > 0`——如果发生了就重试。这个检测逻辑和正常重试（429/5xx）走同一个重试循环，最多 3 次。

---

## 5. 缓存层

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

## 6. CC 对话实录

以下是 Prompt 设计迭代中的一段真实对话（精简重现）：

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

## 7. 核心技巧

1. **为多种模型设计，而不是为一种模型优化。** 你的 prompt 在 gpt-4o 上完美运行不代表在 deepseek-v4-flash 上也能。关键不是在 prompt 里写越来越多的约束，而是在解析层建立容错机制——`parseResponse()` 兼容 4 种格式变体，比写 4 个不同版本的 prompt 优雅得多。

2. **temperature 不是越低越好。** 0 会冻结模型的随机性，产出生硬甚至重复的文本。0.1 是翻译场景的 sweet spot——足够确定以忠实原文，足够随机以读起来像人写的。

3. **token 估算要做语言感知。** CJK 文本和拉丁文本的 token/字符比差 4 倍。用统一个数字估算，中文页面会产出过大的 batch，英文页面会产出过小的 batch。采样前 40 个字符判断语言类型是最简单有效的做法。

4. **缓存 key 必须包含目标语言。** 这是一个踩了坑才学到的教训。如果你做的是多语言翻译产品，缓存 key 不含目标语言，切换语言后看到的还是旧翻译。这类 bug 难排查——因为"看起来一切正常"，只是展示的内容不对。

5. **thinking: disabled 是推理模型的必备参数。** 如果你用 DeepSeek 或其他推理模型，不发这个参数可能导致 API 调用成功但返回空内容。加上这个参数之后，再做一个空 content 检测 + 自动重试，双保险。

---

## 8. 小结

- **与任何 OpenAI 兼容 API 对话**：标准化 `/chat/completions` 请求体，`model`、`endpoint`、`apiKey` 全部从 settings 读取，用户随时可切换到任何兼容服务。
- **System Prompt 是翻译质量的上限**：默认 Prompt 包含角色设定、翻译原则、裸输出约束三要素。但最有价值的不是默认 Prompt 本身，而是用户可以在设置页自定义它——这是 iTranslate 与内置翻译引擎的本质区别。
- **`[N]` 编号 + 多格式容错解析**：选择 `[N]` 格式降低与正文混淆的概率，`parseResponse()` 兼容 4 种编号变体。Prompt 是期望，Parser 是兜底。
- **按 token 动态分批 + 3 并发**：CJK 1.5 tok/字符、拉丁 0.35 tok/字符、目标 1500 tok/批。指数退避重试（仅 429/5xx），位置映射恢复原始顺序。
- **IndexedDB 缓存层**：djb2 哈希 + 文本长度 + 目标语言做 key，原文存储并校验防碰撞，`dict_`/`seg_` 前缀隔离，并行查找。缓存优先于 API，大幅减少重复翻译费用。
- **thinking: disabled**：DeepSeek 推理模型的特有坑。不加这个参数可能导致返回空 content，加上后还要加空 content 检测+重试做双保险。

> 下一章：第 8 章「内容注入：DOM 操作」——如何从页面上提取需要翻译的文本块，把翻译结果渲染到正确的位置。


\newpage

# 第 8 章 内容注入：DOM 操作

## 1. 本章目标

读完本章，你将理解 iTranslate 如何从任意网页中提取出需要翻译的文本块，经过两层过滤筛掉噪音，再把翻译结果精确地渲染回页面正确的位置。你会掌握 Content Script 按需注入的完整流程、extractor + filter 的双层过滤设计、两阶段渲染策略，以及 MutationObserver 如何在动态页面中保持翻译同步。

---

## 2. 内容脚本注入机制

在 Chrome 扩展的四个隔离上下文中，只有一个有权访问页面 DOM 并修改页面内容——Content Script。Background（Service Worker）没有 DOM 访问权限，Popup 只存在于工具栏弹窗中，Settings 是一个独立的选项页。如果你想把翻译结果渲染到用户正在看的网页上，只能通过 Content Script。

**声明式注入 vs 按需注入**

MV3 提供了两种注入 Content Script 的方式。第一种是声明式：在 `manifest.json` 中写 `content_scripts` 字段，指定匹配的 URL 模式，Chrome 会在满足条件的页面加载时自动注入脚本。这个方案简单，但有一个致命的代价——你必须在 manifest 中声明 `host_permissions`，告诉 Chrome 你需要在哪些网站上自动运行代码。用户安装扩展时会看到红色警告："此扩展可以读取和更改您在所有网站上的数据"。

iTranslate 选择了第二种：按需注入。`manifest.json` 只声明 `storage`、`activeTab`、`scripting` 三个权限，Content Script 由 Popup 在用户点击翻译按钮时通过 `chrome.scripting.executeScript` 注入。安装时不触发任何主机权限警告，用户看到的是一个"不需要读取你数据"的扩展。第 6 章讲过这个权限策略的审核价值，这里我们来看它的实现代价。

**`ensureContentScript()` 的三步流程**

按需注入意味着 Popup 在每次发消息之前，必须先确认 Content Script 是否已经存在于当前页面中。`ensureContentScript(tabId)` 实现了这个确认逻辑，分三步走：

第一步，**ping 探测**。发送一条 `{ action: 'ping' }` 消息给指定标签页。如果 Content Script 已经在运行，它会响应这条消息，函数直接返回。这是最常见的情况——用户打开一个页面，点了翻译，翻译完成后继续浏览，再点撤销翻译。Content Script 一直常驻在页面中，ping 一次就过。

第二步，**按需注入**。如果 ping 失败（Content Script 不存在，或者扩展刚更新完脚本已过期），调用 `chrome.scripting.executeScript` 注入 `assets/content.js`。这个文件是在第 6 章讲过的 IIFE 格式构建产物——所有依赖内联在一个自执行函数中，因为 `executeScript` 不支持 ESM 的 `import`/`export` 语法。

第三步，**注入后重试确认**。脚本注入不代表监听器已经就绪——文件读取、脚本执行、`onMessage` 监听器注册之间存在竞态窗口。iTranslate 在注入后最多重试 5 次 ping（每次间隔 100ms），直到确认 Content Script 的消息监听器已经开始工作。5 次重试（500ms）足以覆盖绝大多数竞态场景。

这三步流程还隐藏了一个容错机制：`translateBtn` 的点击处理中，如果第一次 `sendMessage` 失败，会自动调用 `ensureContentScript` 重新注入后再重试。这意味着即使 Content Script 因扩展更新而过期，用户也不需要手动刷新页面——下一次点击翻译按钮时一切自动恢复。

---

## 3. DOM 提取策略

Content Script 入场之后的第一件事，是把页面上的文本内容提取出来。这听起来简单——遍历 DOM 取文本节点就行——但实际执行中充满了陷阱。导航栏里的菜单文字、页脚的版权信息、侧边栏的推荐列表、评论区的时间戳……这些都不是你想翻译的"正文"。

**`extractRawSegments()` 的核心逻辑**

提取器位于 `src/content/extractor.ts`，它做的是"粗略筛选"而非精细判断。核心流程四步：

1. **遍历所有元素**：`root.querySelectorAll('*')` 遍历 body 下的每个元素。用 TreeWalker 也可以，但 `querySelectorAll` 的 NodeList 返回静态快照，不会受后续 DOM 变更影响，更安全。

2. **筛选有直接文本节点的元素**：`hasDirectText()` 检查元素是否包含非空白文本节点的直接子节点。注意是"直接"子节点——`<p><span>hello</span></p>` 中 `<span>` 有直接文本，但 `<p>` 没有。提取器收集的是叶子级文本容器，后续再按块级祖先归组。

3. **按块级祖先分组**：`findBlockAncestor()` 沿祖先链向上查找第一个块级元素（`P`、`DIV`、`LI`、`H1-H6`、`BLOCKQUOTE`、`SECTION` 等），相同块级祖先下的叶子文本合并成一个 `RawSegment`，用换行符连接。为什么按块级祖先分组？因为翻译后的结果是作为块级元素的兄弟节点插入的，块级是渲染的基本单元。

4. **产出 `RawSegment`**：每个 segment 包含 `id`、`text`、`blockElement`（块级祖先元素引用，后续渲染时依赖它定位插入位置）、`isHeading`（布尔值，标题享有豁免权）、`leafElements`（所有叶子元素引用，filter 层可能用它们进一步检查父链）。

**`isSkippable()` 的六层过滤**

提取器内置了一个六层的 `isSkippable()` 检查，在遍历阶段就拦截明显不该翻译的元素：

1. **`SKIP_TAGS`**：`script`、`style`、`noscript`、`svg`、`iframe`、`code`、`pre` 等 20 个标签——这些元素的文本要么是代码，要么是不可见的，翻译它们等于浪费 token。
2. **`SKIP_CLASS_NAMES`**：正则匹配 `header`、`footer`、`nav`、`sidebar`、`comment`、`menu`、`widget`、`ad`、`banner`、`social` 等 28 个关键词——类名命中了这些模式，大概率是页面结构而非正文。
3. **ARIA 角色**：`navigation`、`banner`、`complementary`、`contentinfo`——语义化的无障碍标记，和上一条目的相同。
4. **`hidden` / `aria-hidden` 属性**：标记为隐藏的元素，内容本就不对用户可见。
5. **`itranslate-translation` 类**：这是 iTranslate 自己的翻译克隆元素的标记类名。加上这个检查是血的教训——如果不排除自己渲染的翻译元素，第二次翻译时会把这些译文当原文再翻译一遍，形成"翻译的翻译"的套娃。`className.includes('itranslate-translation')` 一行代码避免了整个循环。
6. **CSS 隐藏元素**：`offsetParent === null` 检查。大多数 `display:none` 的元素会被这一步捕获。但有一个已知局限：`position:fixed` 和 `display:contents` 元素的 `offsetParent` 也返回 `null`，存在误判可能。不过实践中的影响很小——`position:fixed` 的元素通常是悬浮导航栏，本身就会被前面的 class 过滤拦截。

**叶子级最小字符数**

还有一个看似不起眼但很关键的规则：叶子级文本 ≤ 3 个字符的非标题元素直接丢弃。为什么是 3？"OK"、"Go"、"Yes" 这些确实短，但翻译它们没有意义——它们不是正文，而是 UI 碎片。如果因为字符数限制误杀了短标题怎么办？标题豁免——H1-H6 标签或其块级祖先为标题的元素，不受这个限制。

---

## 4. 过滤层

extractor 的 `isSkippable()` 有一个结构性的盲区：它只检查元素自身的 class 和属性，不检查祖先链。一个 `<span class="byline">John Doe</span>` 会被 `SKIP_CLASS_NAMES` 中的 `byline` 拦截。但如果页面结构是 `<div class="sidebar"><p>John Doe</p></div>`，`<p>` 自身的 class 是空的，`isSkippable()` 只检查 `<p>` 自身，通过了。这就是为什么在 extractor 之后还需要一个 filter 层——filter 做"精细判断"，包括沿祖先链向上追溯。

**`SegmentFilter` 接口设计**

过滤层的入口在 `src/content/filters/`，核心是一个简洁的接口：

```typescript
interface SegmentFilter {
  readonly name: string;
  filter(segments: RawSegment[]): FilterResult;
}

interface FilterResult {
  kept: RawSegment[];
  skipped: SkippedRecord[];
}
```

任何模块只要实现这个接口，就能通过 `registerFilter()` 注册，然后由 `setActiveFilter()` 激活。iTranslate 内置了两个实现：`default-filter`（旧的 CJK/Latin 字符数阈值，兼容历史行为）和 `structured-filter`（当前的活跃过滤器）。第三方扩展也可以实现这个接口接入自己的过滤逻辑——接口只依赖 `RawSegment[]`，不需要 DOM 访问权限。

**`structured-filter` 的三层判断**

默认激活的 `structured-filter` 对每个 `RawSegment` 做三层判断，顺序很重要——效率优先，先做便宜检查：

1. **祖先链检查 — `hasSkippableAncestor()`**：从 `blockElement` 出发，沿 `parentElement` 一路向上，检查每个祖先节点的 tagName、className 和 id。一直走到 `document.documentElement`（`<html>`）不停，含 `<body>` 和 `<html>` 本身。这意味着如果页面顶层容器 class 命中了 skip 关键词（比如 `<html class="nav-page">`），整个页面的内容都会被静默过滤。这不是 bug 而是 trade-off——停下来（比如只走到 body）会漏掉某些包装结构的噪音；不停下来有极小概率误杀全页。iTranslate 选择了"宁可漏杀"的方向，实践中只有 whitehouse.gov 等极个别页面触发过这个问题。

2. **噪音模式 — `NOISE_PATTERNS`**：正则数组匹配纯数字、时间格式（`12:30`）、日期格式（`15-Jun-2024`）、相对时间（`3 hours ago`）等。这些文本在人看来有意义，但翻译没有价值——"3 hours ago"翻译成"3 小时前"放在页面上只会让读者困惑"这个时间戳是哪来的"。`isNoiseText()` 用 `some()` 短路匹配，匹配到一个就停。

3. **标题豁免**：`seg.isHeading` 为 true 的 segment 直接保留，不做任何字符数限制。这是对提取器中标题豁免的逻辑延续——标题无论多短都值得翻译。

**为什么 extractor 和 filter 要分两层？**

它们解决的是不同层次的问题。extractor 做的是"在遍历阶段就排除掉明显不是正文的元素"——减少传入 filter 的数据量。filter 做的是"对剩下的候选做精细判断"——祖先链追溯、噪音模式匹配。如果合在一起，extractor 会变得臃肿；如果只用 filter，遍历量太大。分层是职责分离，也是性能优化。

---

## 5. 两阶段渲染

文本提取和过滤完成之后，下一步是把翻译结果渲染回页面。iTranslate 采用**两阶段渲染**策略：先占位、再替换。这不是画蛇添足——在几十段文本同时请求翻译的批处理场景下，如果没有占位符，用户看到的是页面没有任何变化长达数秒，然后所有译文一起出现。占位符给出了即时反馈："正在翻译，稍等片刻"。

**阶段 1：`renderPlaceholders()`**

对每个 `sourceElement`（已过滤保留的块级祖先元素），执行以下操作：

1. **去重检查**：检查 `nextElementSibling` 是否已有 `itranslate-translation` 类——如果有，说明这个元素的翻译占位符或翻译结果已经存在，跳过。这防止了重复点击翻译按钮产生叠罗汉式的重复克隆。

2. **浅克隆**：`el.cloneNode(false)` 克隆块级元素，**不复制子节点**。翻译只需要块级容器的标签、class 和属性作为样式基础，不需要原内容的 DOM 结构。浅克隆避免了携带大量无用的子元素数据。

3. **清除隐藏样式**：把克隆元素上的 `display`、`visibility`、`overflow`、`maxHeight`、`minHeight` 内联样式清空。原始元素可能有 `display:none` 之类的样式（通过内联 style 或 CSS 类），不清空会导致占位符和后续翻译不可见。

4. **注入进度指示器**：克隆元素的 `innerHTML` 设为三个 `<span class="itranslate-dot">`，CSS 定义这三个圆点依次弹跳动画。进度条不是独立的浮层，而是作为克隆元素的子内容——这样它自然占据了和最终翻译相同的位置，布局不会在翻译完成后发生大的跳动。

5. **`insertAdjacentElement('afterend', clone)`**：将克隆元素插入到原始元素**之后**（作为下一个兄弟节点）。这就是 iTranslate 的双语对照效果的核心——原文在上，译文在下，不修改原文的 DOM 结构。

**阶段 2：`renderTranslations()`**

翻译结果返回后，第二步替换占位符：

1. **查找现有占位符**：通过 `nextElementSibling.classList.contains('itranslate-translation')` 找到阶段 1 插入的克隆元素。直接修改其 `textContent` 为翻译文本，移除 `itranslate-placeholder` 类（进度指示器动画停止），这比删除旧节点再创建新节点更高效。

2. **样式复制 — `applyTextStyles()`**：这是渲染质量的关键。如果翻译文本的样式和原文完全不一样，用户看到的会是一个格格不入的蓝色方块下面跟着一个黑色默认字体的译文，体验极差。`applyTextStyles()` 从原文元素的文本叶子节点（`findTextLeaf()` 选文本最长的后代以获取代表性样式）复制四项样式：`color`、`fontSize`、`fontWeight`、`lineHeight`。注意它**不复制 `fontFamily`**——译文统一用 `sans-serif`，这是 CSS 全局设定的，为了视觉统一性。

3. **重置高度约束**：移除克隆元素继承的 `max-height`、`min-height`、`overflow`、`-webkit-line-clamp`。原文可能通过 CSS 限制为 3 行截断，但翻译后的文本长度和原文不同（英文 3 行变成中文可能是 2 行或 4 行），必须允许译文自由扩展或收缩。

4. **白色文字处理**：如果原文颜色的 computed style 是 `rgb(255, 255, 255)`（白字深底），设置 `opacity: 1`。翻译克隆默认 `opacity: 0.85`，但白字降低透明度后在深色背景上会难以阅读。

**`removeTranslations()` — 撤销翻译**

一行代码完成：`document.querySelectorAll('.itranslate-translation').forEach(el => el.remove())`。所有翻译克隆元素都在这个 class 下，一次 `querySelectorAll` 全部清除。原文 DOM 从未被修改，所以撤销是真正干净的——删除克隆元素后，页面回到翻译前的原始状态。

---

## 6. MutationObserver 与追扫

静态页面翻译一次就完事了。但现代网页是动态的——无限滚动加载更多内容、SPA 路由切换、评论区实时更新、弹窗和折叠面板。如果翻译只做一次，新加载的内容就永远是原文。

iTranslate 使用 `MutationObserver` 监听 DOM 变更，触发增量翻译。Observer 的配置在 `src/content/observer.ts` 中：

```typescript
observer.observe(root, {
  childList: true,        // 节点增加/删除
  subtree: true,          // 监听整个子树
  attributes: true,       // 属性变更
  attributeFilter: ['class', 'style'],  // 只关心 class 和 style
});
```

**属性监听的必要性**。只监听 `childList` 够吗？不够。很多页面不会添加/删除 DOM 节点来显示/隐藏内容——它们切换 CSS class（比如 `active`、`visible`、`expanded`）。之前被 `display:none` 隐藏的文本块，class 切换后变为可见，应该被翻译。监听 `class` 和 `style` 属性变更覆盖了这类场景。

**1000ms 防抖**。页面动态加载往往是"一波一波"的——一个 Ajax 请求回来，DOM 里同时插入了 20 个新节点。如果每次 mutation 都触发翻译，Observer 的回调会在几百毫秒内被调用几十次。1000ms 的防抖让这些密集变更合并为一次触发。

**翻译期间的三段式策略**

这是整个 Observer 设计中最精细的部分：

1. **翻译开始 → `stopObserving()`**：翻译过程本身会产生大量 DOM 变更——插入占位符、替换翻译文本。如果不先断开 Observer，翻译自己的 DOM 操作会触发 Observer 回调，回调又触发新的翻译——死循环。所以 `translatePage()` 的第一件事就是 `stopObserving()`。

2. **翻译完成 → `catchUpNewContent()` 追扫**：从断开 Observer 到翻译完成，这期间（可能长达数秒，取决于 API 响应速度）页面可能又加载了新内容。追扫函数重新执行 `extractSegments()`，然后过滤掉已经有翻译兄弟节点的 block（去重），只翻译真正的新内容。追扫是"尽力而为"的——失败了也不报错，只打日志。

3. **追扫完成 → `startObserving()` 重连**：Observer 重新挂载，继续监听后续的动态内容。重连时机在追扫之后，不在翻译完成之后——因为追扫本身也有 DOM 变更，提前重连会导致 Observer 把追扫的变更当作新内容再次触发回调。

**为什么不在 Observer 回调中直接做完整翻译？**

因为 Observer 的回调是"有动静就触发"。一个页面可能先加载了导航栏，再加载了侧边栏，再加载了正文——如果每次都跑完整的 `translatePage()`（提取+过滤+渲染），性能和翻译质量都会出问题。Observer 只负责通知"有新内容了"，实际操作由轻量的追扫函数完成——只提取和渲染增量。

---

## 7. CC 对话实录

以下是一段关于过滤逻辑调试的真实对话（精简重现）：

```
[我的 Prompt]
> 测试发现 CGTN 新闻页面翻译时，页面底部的 "Related Articles" 区域
> 也被翻译了，但这部分明显不是正文。当前的 SKIP_CLASS_NAMES 里已经有
> "related" 关键词了，为什么没拦住？

[CC 的回复]
> 让我分析一下。extractor.ts 的 isSkippable() 只检查元素自身的 class。
> 如果 CGTN 的结构是：
>   <div class="related">         ← 最外层，class 含 "related"
>     <h3>Related Articles</h3>   ← 这个 h3 自身的 class 不含 "related"
>     <ul>...</ul>
>   </div>
> 那么 h3 和 li 元素自身 class 不含 "related"，通过 isSkippable()。
> 但它们的祖先 div 有 "related" class。
>
> 这正是我们在 structured-filter 中加了 hasSkippableAncestor()
> 的原因——extractor 层只检查自身，filter 层沿祖先链追溯补刀。
> 你可以确认一下 hasSkippableAncestor() 的日志输出，
> 看 h3 的 blockElement 是否真的经过了祖先检查。

[我查看日志]
> 确认了：extractor 阶段这些元素通过了 isSkippable()，
> 在 structured-filter 阶段被 hasSkippableAncestor() 拦截了，
> 日志显示 "hasSkippableAncestor SKIP: <div class="related...">
> is ancestor of <h3 text="Related Articles">"。
> 那为什么页面上还有翻译？是 catchUpNewContent 的锅吗？

[CC 的回复]
> 不是。检查一下你的测试流程。如果在页面加载完成后点了翻译，
> 然后 Observer 开着，页面触发了某个 DOM 变更（比如图片懒加载），
> Observer 的 catchUpNewContent 会重新提取并翻译新增内容。
> 但 catchUpNewContent 里用的是 extractSegments() → activeFilter，
> 理论上也应该被过滤。你确认一下是不是在其他标签页还开着旧版本的代码？
```

```
[为什么这样问]
💡 这段对话展示了调试过滤问题的标准思路：先确定问题是出在提取层（extractor）
还是过滤层（filter）。extractor 日志 📄 告诉你提取了几个 raw block，
filter 日志 ✅ 告诉你过滤后剩几个。如果 📄 阶段就有漏网的噪声，
问题在 extractor 的 isSkippable()；如果 📄 阶段通过了但 ✅ 阶段仍在，
问题在 filter 的 rules。日志标记约定（📄 for extractor, 🔎 for filter
祖先检查, 👁 for Observer）就是在这样的调试过程中逐步建立起来的——
没有这些标记，定位问题就只能靠猜。
```

---

## 8. 核心技巧

1. **ping → inject → ping-again 三段式注入**：不要假设 `executeScript` 返回后 Content Script 就立即可用。注入后的重试确认（5 次/100ms）是应对竞态的最小代价保险。

2. **extractor 和 filter 分层，各司其职**：extractor 做粗筛（标签、类名、隐藏属性），filter 做细查（祖先链、噪音模式、标题豁免）。不要试图在 extractor 里解决所有过滤问题——祖先链追溯在 extractor 的遍历循环里做会很贵，放在 filter 里一次性处理更高效。

3. **预防"翻译的翻译"是底线**：`isSkippable()` 中检查 `itranslate-translation` 类名、`hasSkippableAncestor()` 中同样检查祖先链上的该类名。两个位置都要检查，因为 extractor 和 filter 都可能遇到翻译克隆元素。少一处，就会产生套娃翻译。

4. **占位符不仅是 UX，也是布局稳定器**：如果翻译结果和原文长度差异很大（比如英文短标题翻译成中文长标题），没有占位符的提前占位会导致翻译完成后页面布局跳动。浅克隆 + insertAdjacentElement('afterend') 确保翻译结果始终在正确位置。

5. **Observer 断开要主动，重连要谨慎**：翻译前断开 Observer（防止自触发循环），追扫完成后重连（确保后续动态内容被覆盖）。不要在翻译完成后立即重连——追扫的 DOM 操作会触发新一轮 Observer 回调。

6. **样式复制要有分寸**：复制 `color`、`fontSize`、`fontWeight`、`lineHeight` 四项，不复制 `fontFamily`（统一 sans-serif）。复制太多会让翻译看起来和原文混在一起无法区分，复制太少会让翻译像贴上去的膏药。四项是实践中找到的平衡点。

---

## 9. 小结

- **Content Script 是按需注入的**：三步流程（ping 探测 → executeScript 注入 → 5 次重试确认），代价是实现复杂度，回报是审核友好的权限策略和用户信任。
- **extractor 做粗筛，filter 做细查**：`extractRawSegments()` 按块级祖先分组文本，`isSkippable()` 在遍历阶段拦截明显噪声。`structured-filter` 通过 `hasSkippableAncestor()` 沿祖先链追溯、噪音模式正则匹配、标题豁免做精细判断。
- **预防"翻译的翻译"是本能的肌肉记忆**：`itranslate-translation` 类名检查必须同时出现在 extractor 和 filter 中，缺失任一环节都会导致套娃 bug。
- **两阶段渲染：先占位、再替换**：`renderPlaceholders()` 浅克隆 + 进度指示器给出即时反馈，`renderTranslations()` 替换文本 + 复制样式 + 重置高度约束。原文 DOM 从不修改，撤销翻译只需一行 `querySelectorAll`。
- **MutationObserver 的三段式策略**：断开 → 翻译 → 追扫 → 重连。1000ms 防抖合并密集变更。属性监听（class/style）覆盖 CSS 类切换的显示/隐藏场景。
- **过滤调试靠日志标记**：📄（extractor 产出）、🔎（filter 祖先检查）、👁（Observer 触发），三个前缀帮助你快速定位问题出在哪个环节。

> 下一章：第 9 章「交互层：Popup 与消息」——弹窗 UI、消息协议、以及四个上下文之间如何通过 `chrome.runtime.sendMessage` 协同工作。


\newpage

# 第 9 章 交互层：Popup 与消息通信

## 1. 本章目标

读完本章，你将理解 Chrome 扩展四个隔离上下文之间如何通过消息通信协同工作，掌握 Popup 作为"指挥中心"的状态管理机制，以及 MV3 Service Worker 冷启动竞态这个最常见的坑及其解决方案。你会看到 `chrome.runtime.sendMessage` 如何成为扩展架构的"神经系统"，以及消息协议设计中的每一个决策背后的原因。

---

## 2. MV3 消息通信模型

第 6 章提到 Chrome 扩展有四个隔离的 JS 执行环境：Background（Service Worker）、Content Script、Popup、Settings。它们之间**无法通过全局变量或直接函数调用通信**。这不是设计缺陷，而是沙箱安全的必要条件。

**为什么不能直接通信？**

三个层面的隔离：

1. **进程隔离**。Content Script 运行在页面进程的"隔离世界"（isolated world）中——它能访问页面 DOM，但和页面的 JS 运行在不同的作用域。Background 运行在 Service Worker 进程，没有 DOM 访问权限。Popup 是一个独立的 HTML 页面，仅在用户点击扩展图标时存在。

2. **生命周期隔离**。Service Worker 在 30 秒无活动后自动终止。Popup 在用户点击页面其他位置后自动关闭。Content Script 随页面加载注入、随页面关闭销毁。你不能假设"对方一定在运行"。

3. **权限隔离**。Content Script 能操作 DOM 但无权直接调用 `chrome.storage` 之外的扩展 API。Background 能调用所有扩展 API 但触碰不到页面内容。这是 Chrome 有意设计的安全模型——每个上下文只能做它被授权做的事情。

**`chrome.runtime.sendMessage` 是唯一的通信桥梁。**

iTranslate 四个上下文之间的通信拓扑如下：

| Action | 方向 | 用途 |
|--------|------|------|
| `translatePage` | Popup → Content | 触发页面翻译 |
| `undoTranslation` | Popup → Content | 移除所有翻译克隆，停止 Observer |
| `getState` | Popup → Content | 查询页面是否有活跃翻译 |
| `translationComplete` | Content → Popup | 通知：翻译成功（含统计） |
| `translationError` | Content → Popup | 通知：翻译失败 |
| `toggleSelection` | Popup → Content | 启用/禁用划词翻译 |
| `ping` | Popup → Content | 检测内容脚本是否已注入 |
| `translate` | Content → Background | 请求翻译文本段（核心数据流） |
| `clearCache` | Settings → Background | 清空 IndexedDB 缓存 |
| `testConnection` | Settings → Background | 验证 API Key / Endpoint 可用 |

这 10 种消息涵盖了翻译工作流的全部环节。Popup 发送指令给 Content Script（翻译、撤销、查状态），Content Script 把翻译请求发送给 Background（核心 AI 调用），Settings 向 Background 发管理类消息。每条消息都有明确的方向，没有一个消息是"广播"式的——iTranslate 的消息设计原则是：**知道谁发、知道谁收、知道为什么**。

---

## 3. 消息协议设计

**消息结构**

iTranslate 的消息格式极其简单：

```typescript
{ action: string, ...payload }
```

`action` 字段是消息类型的唯一标识，其余字段根据 action 不同携带不同荷载。没有消息版本号、没有时间戳、没有消息 ID。这不是偷懒——当你只有 10 种消息类型、两种通信方向时，过度设计消息协议只会增加维护负担。真正需要版本容错的是 storage 中的数据格式（第 6 章讲了 settings 的合并策略），而不是瞬态消息。

**请求-响应 vs 单向通知**

iTranslate 的 10 种消息分为两类：

**单向通知**（发送完不管）：`translatePage`、`undoTranslation`、`translationComplete`、`translationError`、`toggleSelection`、`clearCache`、`testConnection`。这些消息触发一个操作，发送方不等待返回值。注意 `translationComplete` / `translationError` 并不是 `translatePage` 的"响应"——它们是 Content Script 在翻译完成后**主动发回**的通知，两者之间没有请求-响应的 ID 绑定关系。

**请求-响应**（发送后等返回值）：`translate`、`getState`、`ping`。`translate` 是 Content Script 向 Background 请求翻译，必须等待 API 调用完成并返回翻译结果。`getState` 和 `ping` 是 Popup 向 Content Script 查询状态。

为什么 `translatePage` 不走请求-响应模式？因为一个页面可能有几十段文本需要翻译，整个流程可能持续数秒。如果 Popup 发送 `translatePage` 后阻塞等待 `sendMessage` 的返回值，工具栏弹窗会在翻译期间处于冻结状态——而 Popup 在用户点击页面其他位置时就关闭了。让 Popup 发完指令后直接 `window.close()`，Content Script 异步完成后通过 `translationComplete` 通知，是更合理的分工。

**`sender.tab.id` 过滤**

这是 Popup 消息监听器中最关键的一行：

```typescript
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id !== activeTabId) return;  // 只处理当前标签的消息
  // ...
});
```

如果缺了这一行会发生什么？用户在标签 A 打开了 Popup，点了翻译，然后切到标签 B 也打开 Popup。标签 A 的 Content Script 翻译完成后发送 `translationComplete` 消息——它是 `chrome.runtime.sendMessage`，**所有** `onMessage` 监听器都会收到。如果没有 `sender.tab.id` 过滤，标签 B 的 Popup 按钮状态也会被错误更新。一行 `if` 避免了跨标签 UI 污染。

**`sendToBgWithRetry()` — MV3 冷启动竞态的解决方案**

Content Script 向 Background 发消息比 Popup 向 Content Script 发消息多了一层复杂度：Background 可能不在运行。`sendToBgWithRetry()` 专门应对这个场景：

```typescript
export async function sendToBgWithRetry(message: unknown, retries = 3, delayMs = 600): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (err) {
      if (i === retries - 1) throw err;
      const msg = (err as Error).message;
      if (msg.includes('Receiving end does not exist') || msg.includes('Could not establish connection')) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}
```

关键设计点：只对连接类错误（"Receiving end does not exist"、"Could not establish connection"）重试，业务逻辑错误（比如 API 返回 400）直接抛出。如果对所有错误都重试，一个参数错误会被重试 3 次、浪费 1.8 秒用户时间，然后才报错。区分错误类型是重试机制的基本功。

---

## 4. Popup 状态管理

Popup 的面积只有约 300x400 像素，但它是整个扩展的"指挥中心"。它的职责不是翻译本身——那个工作在 Content Script 和 Background 之间完成——而是把当前页面的翻译状态、用户的语言偏好、划词翻译开关状态集中展示在一个小面板中。

**按钮状态机：`setButtonState()`**

翻译按钮有三种状态，由 `setButtonState()` 统一管理：

```typescript
function setButtonState(state: 'translate' | 'undo' | 'translating'): void {
  if (state === 'translate') {
    translateBtn.textContent = t('translatePage');
    translateBtn.style.color = 'white';
  } else if (state === 'undo') {
    translateBtn.textContent = t('undoTranslation');
    translateBtn.style.background = 'var(--itranslate-gradient-undo)';  // 暖陶色渐变
    translateBtn.style.color = 'white';
  } else {
    translateBtn.textContent = t('translating');
  }
}
```

三种状态的来源：

- **translate**（冰川蓝渐变背景）：页面未翻译时的默认状态。Popup 打开时通过 `syncState()` 向 Content Script 发送 `getState` 查询——如果 Content Script 未注入或返回 `isTranslated: false`，按钮保持翻译状态。
- **undo**（暖陶色渐变背景）：翻译中（`translateBtn.disabled = true`）或翻译完成后切换。`translationComplete` 消息到达时从 translating 态切换过来。
- **translating**（禁用态）：用户点击翻译按钮后立即进入，防止重复点击。翻译完成后由 `translationComplete` 消息自动切换到 undo 状态。如果翻译失败，`translationError` 消息切换回 translate 状态。

双色区分是重要的 UX 决策：用户打开 Popup 时一眼就能看出当前页面是原文状态还是已翻译状态，不需要记得"我之前点过翻译没有"。

**语言自动检测与 Per-tab 锁定**

Popup 打开时执行 `loadLanguageSettings()`，做两件事：

1. **源语言自动检测**。通过 `chrome.scripting.executeScript` 读取当前页面的 `<html lang>` 属性，用 `detectPageLang()` 将 BCP 47 标签（如 `zh-CN`）映射为语言名（`Chinese`）。如果 `<html lang>` 缺失，回退到扫描 `body.innerText` 前 2000 个字符的 Unicode 脚本范围检测。

2. **目标语言自动检测**。从 `navigator.language` 读取浏览器 UI 语言，同样映射为 iTranslate 支持的六种语言之一。

自动检测的结果会更新到 `chrome.storage.sync` 中的全局设置。但这里有一个重要设计：如果用户**手动**修改了语言选择（点下拉框），那个修改只对**当前标签**生效。这就是 per-tab 语言锁。

```typescript
async function getTabLocks(tabId: number): Promise<{ source: boolean; target: boolean }> {
  const key = `lang_lock_${tabId}`;
  const data = await chrome.storage.session.get(key);
  return data[key] || { source: false, target: false };
}
```

锁存在 `chrome.storage.session` 中，key 含 `tabId`。`session` 存储区在浏览器关闭时自动清除，这意味着换标签或重启浏览器后锁自动解除，语言偏好重置为自动检测。为什么不存 `sync`？因为标签 ID 是临时的——下次打开浏览器同一个 URL 的标签 ID 完全不同，存 sync 只会留下一堆无用数据。

设计原因很实际：你在标签 A 看英文新闻（源=English，目标=Chinese），切到标签 B 看法语博客——如果源语言被全局锁在 English，法语博客就检测不出正确源语言了。per-tab 锁给了用户手动覆盖的灵活性，又避免了跨标签污染。

**`ensureContentScript()` — 注入保障**

翻译按钮的点击处理中有一个关键的容错逻辑：

```typescript
try {
  await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
} catch {
  // Content script 可能因扩展更新而失效——重新注入后重试
  await ensureContentScript(tab.id!);
  await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
}
```

扩展更新后，旧版本注入的 Content Script 仍在页面中运行，但其内部逻辑与新版 Background 可能不兼容。这时 `sendMessage` 会抛出异常，Popup 自动重新注入新版本的 Content Script 并重试。对用户来说，这个过程完全透明——他们不需要刷新页面，翻译按钮点了照样工作。

---

## 5. Service Worker 冷启动竞态

MV3 的 Service Worker 有一个让扩展开发者头疼的特性：**空闲 30 秒后自动终止**。这不是 bug，是 Chrome 为了节省内存的设计——不像 MV2 的 background page 一直常驻，SW 随时可能被"杀掉"。

**问题场景**。用户在标签 A 打开页面，30 秒后点击翻译按钮。Popup 注入 Content Script，Content Script 提取文本、构建消息、调用 `sendToBgWithRetry({ action: 'translate', ... })`。此时 Service Worker 收到消息，开始从零启动——加载 JS 文件、执行顶层代码、注册 `onMessage` 监听器。如果 Content Script 的 `sendMessage` 在监听器注册完成之前就到达，浏览器返回的错误是"Receiving end does not exist"。

**`sendToBgWithRetry()` 的应对策略**。3 次重试，每次间隔 600ms。600ms 这个数字是怎么来的？SW 的冷启动时间通常在 100-300ms，但 Chrome 在压力大时可能更长。600ms 给了翻倍的 buffer，又不至于让用户等太久——3 次重试总计最多 1.8 秒，用户基本无感。

**错误分类的重要性**。注意 retry 函数中的 `if` 判断——只有在错误消息包含 `Receiving end does not exist` 或 `Could not establish connection` 时才重试。如果 Background 已经启动、监听器已经注册，但 Background 内部的 API 调用返回了 401（API Key 无效）、400（参数错误）、或解析错误，这些错误**不应该重试**——重试 3 次不会让 API Key 变有效。错误分类是重试机制的第一纪律。

**为什么这是 MV3 最常见的坑**。因为开发时你几乎不会遇到这个问题。开发过程中不断修改代码、重新加载扩展、刷新页面，Service Worker 总是活跃的。你在本地测试翻译功能，一切正常，提交发布。用户安装后打开页面，30 秒后点翻译——"没反应"。你花两小时排查 API Key、权限、Content Script 注入逻辑，所有地方都没问题，但用户就是看不到翻译结果。最后发现是 SW 冷启动竞态——一个只在生产环境出现的 bug。

---

## 6. CC 对话实录

以下是一段关于消息协议设计的真实对话（精简重现）：

```
[我的 Prompt]
> Popup 发 translatePage 给 Content Script，Content Script 翻译完成后
> 通过 translationComplete 发回给 Popup。但如果用户开了两个标签，
> 每个标签都有 Popup——标签 A 的 Content Script 发出来的
> translationComplete 会不会把标签 B 的 Popup 按钮状态也改了？

[CC 的回复]
> 好问题。chrome.runtime.sendMessage 是广播给所有 onMessage 监听器
> 的，只要你注册了监听器就会收到。如果标签 B 的 Popup 也注册了
> onMessage 监听器，标签 A 发出的 translationComplete 确实会被
> 标签 B 的 Popup 收到。
>
> 解决方案是在监听器里检查 sender.tab.id。每个 Popup 打开时记录
> 自己的 activeTabId，收到消息时过滤：
>
>   if (sender.tab?.id !== activeTabId) return;
>
> 这样标签 B 的 Popup 收到标签 A 发来的消息时，sender.tab.id 是
> 标签 A 的 ID，不等于标签 B 的 activeTabId，直接忽略。

[我的追问]
> activeTabId 在 Popup 关闭后还存在吗？如果我关了标签 A 的 Popup
> 再打开标签 B 的 Popup，activeTabId 会更新吗？

[CC 的回复]
> Popup 每次重新打开时，popup.ts 的顶层代码都会重新执行——
> syncState() 里通过 getActiveTab() 重新获取 activeTabId。
> 所以每次打开 Popup，activeTabId 都会被更新为当前标签的 ID。
> 不存在"上次 Popup 的 activeTabId 残留"的问题——
> Popup 的状态是完全瞬态的，关闭即销毁。
```

```
[为什么这样问]
💡 Popup 的"关闭即销毁"特性是一个容易被忽略的安全网。如果 Popup 像
Background 一样常驻，就需要小心翼翼地管理 activeTabId 的生命周期——什么
时候设置、什么时候清除、关闭时要不要发消息通知。但 Popup 每次打开都是从零
初始化，天然的"无状态"简化了大量状态管理逻辑。这是 Chrome 扩展架构的一个
精妙设计：不是所有上下文都需要持久化状态，瞬态本身就是一种状态管理策略。
```

---

## 7. 核心技巧

1. **消息方向设计要先画拓扑图**。在写第一行消息代码之前，先把四个上下文的通信关系画出来——谁给谁发、发什么、是否等响应。10 条消息覆盖全部需求，没有多余的广播型消息。如果消息拓扑图画出来有几条"所有人发给所有人"的线，你的设计有问题。

2. **`sender.tab.id` 过滤是跨标签安全的最低成本保险**。一行 `if` 避免了整个 Popup UI 在用户切换标签时错乱。如果所有 onMessage 监听器都加上这个检查，就不需要担心"这个消息是谁发的"。

3. **重试只对连接错误，不对业务错误**。SW 冷启动、网络闪断这类临时性故障值得重试。API Key 无效、参数错误这类确定性错误重试 100 次也没用，只会浪费用户时间。区分错误类型不是性能优化，是正确性要求。

4. **Per-tab 状态用 `chrome.storage.session`，不要用 `sync`**。`session` 存储区浏览器关闭时自动清除，天然适合存储标签级临时状态（如语言锁）。用 `sync` 存储标签 ID 只会留下一堆过期的脏数据。

5. **Popup 的状态管理靠"重新初始化"，不靠"持久化"**。每次 Popup 打开时 `syncState()` 重新查询 Content Script 状态，不是在上一轮的 Popup 状态上做增量更新。关闭即销毁，打开即重建——简单、干净、不会产生状态残留。

6. **`ensureContentScript()` 的三段式 + 点击容错兜底**。ping 探测 → executeScript 注入 → 注入后重试确认是正常流程。但即使这三步都成功了，扩展更新后旧 Content Script 仍可能失效。翻译按钮点击处理中的 try-catch 兜底是最关键的一道防线。

---

## 8. 小结

- **四个上下文通过 `chrome.runtime.sendMessage` 通信**：无法共享全局变量，无法直接函数调用，消息是唯一的桥梁。10 种消息类型覆盖翻译全流程，每种有明确的方向和用途。
- **消息协议追求极简**：`{ action, ...payload }` 格式，分请求-响应和单向通知两类。`translatePage` 不走请求-响应是因为 Popup 在翻译完成前就关闭了。
- **跨标签安全靠 `sender.tab.id` 过滤**：一行代码防止标签 A 的消息污染标签 B 的 UI。这是所有 `onMessage` 监听器的标准写法。
- **Popup 是"指挥中心"而非"执行者"**：发指令给 Content Script，展示翻译状态，但不参与翻译逻辑本身。按钮状态机（translate / undo / translating）由 `setButtonState()` 统一管理，双色区分让用户一眼识别当前状态。
- **Per-tab 语言锁存在 `chrome.storage.session`**：用户手动改语言只锁当前标签，换标签或重启浏览器自动重置。避免了全局锁导致的跨标签语言检测失败。
- **`sendToBgWithRetry()` 应对 MV3 冷启动竞态**：这是 MV3 扩展开发最常见的坑。3 次重试、600ms 间隔，只重试连接错误不重试业务错误——区分错误类型是重试机制的基本功。
- **Popup 的状态管理是"重新初始化"式的**：每次打开从零查询，关闭即销毁。瞬态本身就是一种状态管理策略，不需要额外的清理逻辑。

> 下一章：第 10 章「测试：70 个用例的覆盖策略」——如何在 jsdom 环境中 mock Chrome API、如何设计测试数据以覆盖边界条件、以及 fake-indexeddb 如何让缓存层测试变得可能。


\newpage

# 第 10 章 划词翻译：事件处理

## 1. 本章目标

读完本章，你将理解 iTranslate 划词翻译功能的完整交互链路——从用户在页面上选中文字，到小球出现、悬停膨胀、气泡弹出、翻译结果渲染，再到拖拽、关闭、模式自动判断。你会掌握 browser 事件处理中的三个关键设计决策：为什么用闭包而不是 `getSelection()`、为什么用 JS 驱动动画而不是 CSS `:hover`、为什么不用 drag API 做拖拽。本章是整本书中交互最密集的一章——没有复杂的算法，但每一行代码背后都有体验考量。

---

## 2. 划词翻译的用户体验

第 8 章讲的页面翻译是"批量操作"——用户点一下按钮，整个页面的英文全部变成双语对照。划词翻译走的是完全不同的路径：**用户主动选择一段文字，只翻译这一小段**。

完整交互流程如下：

**第一步，选中文字。** 用户在页面上用鼠标划选一段文字，松开鼠标左键。这是触发整个流程的唯一入口——没有按钮、没有快捷键、没有右键菜单，只有 `mouseup` 事件。选中的可以是段落中的一句话，也可以是一个不认识的单词，甚至可以选中跨段落的多个自然段。

**第二步，小球出现。** 松开鼠标后约 300ms（防抖延迟后），选区右上角外侧 2px 处出现一个直径 12px 的冰川蓝小圆点。这个小球极其克制——12px 的尺寸在正文旁边几乎不会遮挡阅读视线，`opacity: 0.85` 进一步降低了视觉侵略性。它不弹窗、不闪烁、不发出任何通知，只是安静地站在那里，像一个"翻译服务在此，你需要我吗？"的提示。

**第三步，悬停展开。** 用户把鼠标移到小球上，停留 1 秒。小球向上弹跳 12px 同时膨胀到 2 倍大小，伴随着光环扩散的效果，`::after` 伪元素显示出"译"字标签。1 秒后，气泡弹出——380px 宽的翻译面板出现在选区下方，包含原文、进度指示器、复制和关闭按钮。翻译请求在气泡弹出后立即发出。

**第四步，自由操作。** 气泡不是固定在选区位置的——用户可以用鼠标拖动渐变顶条或 header 区域（共 28px 热区）把气泡拖到页面任意位置。翻译完成后，可以点"复制"按钮把译文复制到剪贴板（按钮文字短暂变成"已复制"1.5 秒后恢复），也可以点正圆形 × 按钮关闭气泡。

**第五步，随时退出。** 三种方式关闭气泡：点 × 按钮、按 Esc 键、滚动页面。划词翻译**每个页面默认关闭**，需要用户通过 Popup 中的开关手动开启，关闭标签页或刷新页面后开关自动重置。

这个流程的设计哲学可以概括为三个词：**不打扰、有节制、可控制**。小球很小，不遮挡正文——不打扰阅读。悬停 1 秒才展开——用户有时间决定要还是不要，不会误触。气泡可拖拽、可关闭、可复制——展开后用户有完整的控制权。划词翻译在整个 iTranslate 中是交互最重、也是最考验"手感"的部分。

---

## 3. 选区检测与定位

划词翻译的入口是一个看似简单的 `mouseup` 事件，但要让它在所有页面、所有场景下都能正确工作，需要处理一系列边界情况。

**mouseup + 300ms 防抖**

`enableSelection()` 注册的是 `document.addEventListener('mouseup', onMouseUp)`，不是 `click`、不是 `dblclick`、不是 `selectionchange`。为什么是 `mouseup`？因为 `click` 在文本选择时不一定会触发（浏览器行为不一致），`selectionchange` 在拖动选区的过程中会连续触发数十次。`mouseup` 是最准确的"用户完成了选择动作"的信号。

但 `mouseup` 本身过于敏感——用户在页面上做任何点击都会触发。`onMouseUp` 做了一件事：用 `setTimeout(..., 0)` 把实际逻辑推迟到下一个事件循环。这一行的效果等价于 0ms 防抖——`setTimeout` 把回调放到宏任务队列，确保在浏览器完成了选区绘制之后才读取 `getSelection()`。如果浏览器还没完成选区渲染就取 `getBoundingClientRect()`，拿到的可能是旧的矩形数据或空矩形。

**`isValidSelection()` 的三层检查**

```typescript
function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const text = sel.toString().trim();
  return text.length > 0;
}
```

第一层：`getSelection()` 可能返回 `null`（极少见但存在），直接拒绝。第二层：`rangeCount === 0` 表示没有有效的选区范围，浏览器可能在页面加载完成前或焦点丢失后进入这个状态。第三层：`toString().trim()` 去空白后长度为零——用户可能选中了一堆空格或换行，这种"空选"不应触发翻译。

`isValidSelection()` **不做**的是：不判断选区内是否有输入框。这一点在后面会提到——`onMouseUp` 中通过 `currentBubble?.contains(e.target)` 来跳过气泡内部的点击，但输入框内的选区仍然会触发小球。这种"不拦截"是有意为之——用户在输入框中选中一段英文后，也应该能翻译。

**`getBoundingClientRect()` 获取选区矩形**

选区通过后，调用 `sel.getRangeAt(0).getBoundingClientRect()` 获取选区的视口相对矩形。这个矩形的 `top`、`bottom`、`left`、`right` 是 `position: fixed` 定位的坐标基础。注意这里取的是 `Range` 的矩形（包含选区的所有行），不是文本片段或单个字符的矩形——多行选区的矩形可能覆盖整段区域。

**`positionBall()` 的四方向翻转逻辑**

小球的默认位置是**选区右上角外侧 2px**：

```typescript
let top = rect.top - BALL_SIZE - GAP;   // 选区顶部上方 14px（12px 球 + 2px 间隙）
let left = rect.right + GAP;             // 选区的右边缘 + 2px
```

但这个世界不总是理想的。如果选区靠近浏览器顶部边缘，小球会"飘"到视口外。如果选区紧贴右侧边缘，小球同样不可见。`positionBall()` 处理三个边界情况：

1. **顶部溢出**：如果 `top < GAP`（小球超出了视口顶端），翻到**选区下方**：`top = rect.bottom + GAP`。小球从"在文字上面"变成"在文字下面"。
2. **右侧溢出**：如果 `left + BALL_SIZE > window.innerWidth`（小球超出了右侧），翻到**选区左侧**：`left = rect.left - BALL_SIZE - GAP`。小球从文字的右边跑到左边。
3. **左边界 clamp**：如果翻转后 `left < GAP`（极少见，全宽选区可能出现），强制 clamp 到 2px。至少保证小球在屏幕内可见。

这个翻转逻辑虽然只处理了两个方向的溢出 + 一个兜底 clamp，但实践中覆盖了绝大多数选区位置——因为它总是在"一个方向溢出"的前提下翻到"对面的安全方向"，不会出现翻过去又溢出的情况。

**闭包捕获文字，防止浏览器清除选区**

这是整个划词翻译中最容易被忽视的设计：

```typescript
const text = sel.toString().trim();
const rect = sel.getRangeAt(0).getBoundingClientRect();
createBall(rect, text);  // text 作为参数传入闭包
```

`text` 和 `rect` 在 `mouseup` 的回调中一次性读取并传入 `createBall()`。为什么不在 `showBubble()` 中再次读取 `getSelection()`？因为从用户松开鼠标到悬停小球、再到 1 秒后气泡弹出的这整个过程中，用户在页面上做了其他操作（比如移动鼠标到小球上），浏览器会在用户点击页面其他位置或焦点转移时**自动清除选区**。如果你在 `showBubble()` 里再读 `getSelection().toString()`，得到的很可能是一个空字符串。

闭包捕获是应对"浏览器会自动清除选区"这个行为的标准做法。`createBall()` 的第二个参数 `text` 存入闭包，`showBubble()` 中使用的是闭包中捕获的值而非实时选区，保证了用户看到小球时选中了什么文字，翻译的就是什么文字。

---

## 4. 小球动画

12px 的小球本身很简单——一个 `div`，`position: fixed`，`border-radius: 50%`，冰川蓝渐变背景加一层浅阴影。真正的精华在动画。

**初始态：克制**

小球在初始状态只有 12px 直径。没有文字、没有动画、没有任何视觉干扰。`data-label` 属性存了 i18n 文本（中文环境为"译"，英文环境为"Tr"），但 `::after` 伪元素的 `opacity: 0` 让文字不可见。用户看到的只有一个安静的蓝色小点。

**悬停态：1s 延迟 + JS 驱动动画**

当鼠标移到小球上，`mouseenter` 事件触发：

```typescript
ball.addEventListener('mouseenter', () => {
  if (ballHoverTimer) return;                 // 防重入
  ball.classList.add('animating');            // 立即开始动画
  ballHoverTimer = setTimeout(() => {
    ballHoverTimer = null;
    if (!currentBall) return;
    removeBall();
    showBubble(currentRect, text);            // 1s 后弹出气泡
  }, 1000);
});
```

两个关键设计：

**为什么用 JS `.animating` class 而不是 CSS `:hover`？** CSS `:hover` 有一个致命缺陷：鼠标必须在元素上，`:hover` 才生效。如果用户的鼠标在小球上轻微移动（1px 就够），`:hover` 会短暂移除再重新应用，CSS 动画从头开始播放——用户看到的是小球不断抽搐。JS `classList.add('animating')` 将动画状态与鼠标位置解耦——一旦加上，动画就独立运行，后续鼠标怎么移都不影响。防重入的 `ballHoverTimer` 检查也保证了不会因为鼠标微移而创建多个 timer。

**为什么用 1 秒延迟？** 分两种情况：如果用户把鼠标移到小球上是故意的（想翻译），1 秒够短，不会感到拖沓。如果用户是不小心碰到的（鼠标路过），1 秒足够让用户移开鼠标——只要在 1 秒内移开，`removeBall()` 清除 timer，气泡不会弹出。1 秒是"确认意图"和"响应速度"之间的平衡点。

**动画过程：向上弹跳 + 膨胀 + 光环**

CSS `@keyframes itranslate-ball-inflate` 定义了动画的视觉变化：

```css
@keyframes itranslate-ball-inflate {
  0%   { transform: translateY(0) scale(1);    box-shadow: 0 1px 4px ...; }
  100% { transform: translateY(-12px) scale(2); box-shadow: 0 0 0 10px ..., 0 4px 20px ...; }
}
```

三个要素协同工作：

- **`translateY(-12px)`**：小球向上弹跳 12px。这不是装饰——小球向上移动给下方腾出空间，气泡将出现在小球下方。如果小球原地不动，气泡弹出后会和小球重叠。
- **`scale(2)`**：小球从 12px 膨胀到 24px。"膨胀"比"变形"更能传达"正在展开"的语义——用户看到的不只是变大了，而是"这个点要变成一个面板了"。
- **`box-shadow` 光环扩散**：从初始的 `0 1px 4px` 隐约阴影，扩散为 `0 0 0 10px` 的 10px 光环（opacity 0.15）加 `0 4px 20px` 的 20px 外阴影（opacity 0.35）。光环在动画结束时已经扩散到最大值，给气泡弹出做视觉铺垫。

`::after` 伪元素通过 `attr(data-label)` 显示"译"字——文字在动画开始时 `opacity: 0`，`.animating` 触发后 `transition: opacity 0.3s` 淡入。8px 白色文字在膨胀后的 24px 小球中刚好居中可读。

**缓动曲线：`cubic-bezier(0.4, 0, 0.2, 1)`**

这个曲线是 Material Design 的"标准缓动"——快速启动、匀速减速、无回弹。`cubic-bezier(0.4, 0, 0.2, 1)` 的物理直觉是：重物被推了一下，惯性滑出、逐渐减速、精确到位。与之对比，CSS 默认的 `ease`（`0.25, 0.1, 0.25, 1`）启动更慢、中间有减速后又加速的"刹车感"。

缓动曲线的选择经历了四轮迭代：

- **v1**：CSS `:hover` + `scale(1.5)` + 默认 `ease`。鼠标微移就重启动画。
- **v2**：改成 JS `.animating` class，解决了重启问题，但 `scale(1.5)` 配合 `ease` 的"刹车感"显得僵硬。
- **v3**：加了 `translateY(-12px)` 向上弹跳，增加动感。但 `ease` 曲线让弹跳看起来像"弹了一下又落回去"。
- **v4**：换成 `cubic-bezier(0.4, 0, 0.2, 1)` 匀速减速。弹跳感消失，变成"平稳向上移动并膨胀"的自然流畅。

四次迭代，每次只改一两行 CSS，但手感从"能用"变成了"舒服"。这就是 UI 动画的本质——不是炫技，是消除用户潜意识里的"不对劲"。

---

## 5. 气泡 UI

气泡是划词翻译的最终呈现载体。它不仅要展示翻译结果，还要支持拖拽移动、文本复制、碎片关闭——是一个微型的"翻译工作台"。

**视觉主题**

气泡的外观是极地冰川主题的浓缩版。米白渐变底色 `#FCFBF9 → #F5F3EF` 给人温暖但不耀眼的纸张质感。14px 的大圆角配合冰川蓝微边框（`rgba(107,174,207,0.12)`），边界清晰但不生硬。最顶部的 4px 渐变条（`#6BAECF → #94C8E0 → #B8D9EA`）是"冰川三色"的标识——用户看到这个渐变色条就知道这是 iTranslate 的面板。

气泡通过 `position: fixed` 定位在视口中，`z-index: 99998` 确保它在绝大多数页面内容之上。`all: initial` 重置所有继承样式，防止页面 CSS 污染气泡内部——这是注入 Content Script 时必须做的防御性措施。

**四层结构**

气泡内部是清晰的四层结构：

**第 1 层：bar（渐变顶条）**。高度 4px，冰川蓝三色渐变，`cursor: grab`。它不仅是对品牌的视觉提示，也是拖拽热区的下半部分——用户拖拽气泡时首先想到的就是"抓顶部"。

**第 2 层：header（品牌标识 + 拖拽手柄）**。高度 24px，左侧显示品牌名"通译"（冰川蓝 70% 透明度，11px，600 字重），右侧在词典模式下显示"词典"标签。整个 header 区域 `cursor: grab`，和 bar 叠加形成 28px 的拖拽热区。`cursor: grabbing` 在拖拽中切换，给用户拖拽中的触觉反馈。

**第 3 层：body（翻译内容）**。这是气泡的核心区域，`padding: 12px 16px`，`overflow-y: auto` 支持内容溢出时滚动。body 内分三个子区域：

原文区：12px 灰色文字（`color: #999`），`max-height: 58px`（约 3 行），溢出隐藏。如果内容超过 3 行（JS 端通过 `scrollHeight > clientHeight` 检测），添加 `.faded` class 激活底部渐变遮罩——从透明渐变到米白色，制造"内容还在下面但被折叠了"的视觉效果。

译文区：15px 深色文字（`var(--itranslate-text-translated)`），500 字重，1.6 行高。译文上方有 1px 冰川蓝分割线（`border-top: 1px solid rgba(107,174,207,0.12)`）与原文区域分隔。这个分割线不是装饰——它让用户一眼能区分"这是原文"和"这是翻译"。

进度指示器：翻译请求发出后、结果返回前，body 内显示 3 个跳动的圆点（第 8 章讲过的 `itranslate-dot` 动画），给用户"正在翻译"的即时反馈。翻译结果返回后移除。

**第 4 层：actions（操作按钮）**。`padding: 0 16px 12px`，flex 水平排列。复制按钮是胶囊形（`border-radius: 14px`，高度 28px），带 SVG 复制图标 + 文字，hover 时冰川蓝高亮。点击后调用 `navigator.clipboard.writeText()` 复制译文，按钮文字短暂变成"已复制"（冰川蓝文字 + 边框，1.5 秒后恢复）。关闭按钮是正圆形（`width: 28px; height: 28px; border-radius: 50%`），靠右对齐（`margin-left: auto`），显示 × 符号，hover 时微妙的冰川蓝背景高亮。圆形 vs 胶囊形的区分不是随意的——关闭是"操作"，复制是"动作"，不同的形状代表了不同的语义权重。

**拖拽实现：mousedown → mousemove → mouseup**

为什么不用浏览器的 Drag API（`dragstart` / `drag` / `dragend`）？Drag API 在 Chrome 扩展的 Content Script 环境中有两个已知问题：跨 iframe 的页面行为不一致（某些 iframe 会拦截 drag 事件），以及部分网站的自定义 drag 事件处理器会干扰。iTranslate 选择了最底层的方案——手动监听三个鼠标事件：

```typescript
// mousedown: 记录起始位置
dragState = { el: bubble, startX: e.clientX, startY: e.clientY,
              startLeft: bubble.offsetLeft, startTop: bubble.offsetTop };

// mousemove: 实时更新位置
dragState.el.style.left = `${startLeft + e.clientX - startX}px`;
dragState.el.style.top = `${startTop + e.clientY - startY}px`;

// mouseup: 释放
dragState = null;
```

手动实现的优势是完全可控——不依赖浏览器拖拽行为、不受页面 CSS 和事件干扰。代价是更多的代码，但 10 行逻辑换来的可靠性是值得的。

**气泡定位：`getBubblePosition()`**

气泡默认出现在选区下方，水平居中于选区。如果下方空间不足（`rect.bottom + 200px > window.innerHeight`），翻到选区上方。水平方向做边界 clamp。逻辑和 `positionBall()` 一脉相承——优先理想位置，溢出翻到对面，最后 clamp 保底。

---

## 6. 词典 vs 翻译自动判断

用户在页面上选中一个英文单词时，期望的不是逐字翻译，而是一个**词典释义**——音标、词性、多个义项。但你不可能让用户在 Popup 里手动选择"翻译模式"还是"词典模式"。对用户来说，"我选中了文字，不管是一个词还是一段话，都应该智能处理"。模式判断必须是全自动的。

**两步判断**

判断逻辑放在 `showBubble()` 中，只有一行：

```typescript
const mode = (isSingleWord(text) && isEnglishText(text)) ? 'dictionary' : 'translate';
```

`isSingleWord(text)` 做了最简单的事——`text.trim().split(/\s+/).length === 1`。按空白字符分割，长度等于 1 就是单个词。这不会误判中文短语，因为中文不需要空格分词。

`isEnglishText(text)` 用正则拒绝非拉丁文字：`!/[一-鿿぀-ゟ゠-ヿ가-힯]/.test(text)`。CJK 统一表意文字、平假名、片假名、谚文——四个 Unicode 范围覆盖了中、日、韩所有字符。如果选中的文本包含任何一个非拉丁字符，判定为"非英语文本"，走翻译模式。

两个条件同时满足时，`mode = 'dictionary'`。任何一项不满足，走翻译模式。

**Background 端的二次校验**

即使前端判定为词典模式，Background 的 `handleTranslate()` 还会再做一次安全校验：检查 sourceLang 是否为 English、targetLang 是否为 Chinese。如果用户的语言设置不是英→中（比如英→日），词典模式自动降级为翻译模式——因为词典 prompt 只针对英→中设计，中日、英日等语言对没有词典数据。

这个"前端乐观判断 + 后端兜底校验"的双层策略确保了：用户不需要理解"词典模式"和"翻译模式"的区别，系统在内部自动选择最优方案。即使判断失误，也有降级保证不会出错。

**词典结果的渲染差异**

词典结果和翻译结果在同一气泡中展示，但 body 内容结构完全不同。`renderDictionaryResult()` 解析 JSON 响应，构建：词条头（单词 + 音标 + 词性标签，词性标签用冰川蓝胶囊样式）→ 分割线 → 编号义项列表（第一条义项的序号和文字使用 `primary` 蓝色高亮变体，其余使用灰色变体）。JSON 解析失败时，整个词典结果降级为纯文本展示——但这种情况极少发生，因为 Background 的 `parseDictionaryResponse()` 已经有完善的容错处理。

---

## 7. CC 对话实录

小球动画的迭代是划词翻译中最典型的"描述视觉 → AI 实现 → 发现缺陷 → 迭代"案例。以下是一段精简重现的真实对话：

```
[我的 Prompt]
> 选文字后出现一个小圆点，悬停后放大，动画要丝滑。
> 位置在选区右上角。

[CC 实现 v1]
> 用了 CSS :hover + scale(1.5)。小球在选区右上角，
> hover 时 scale 放大。你试试效果。

[我测试]
> 鼠标在小球上稍微动一下动画就重启了，一直抖。
> 改成 JS 控制的 class 吧，加上去就别管鼠标怎么移。

[CC 实现 v2]
> 好的，改成 mouseenter 加 .animating class，CSS 动画
> 由 class 驱动，鼠标微移不会影响。另外加了
> translateY(-12px) 向上弹跳，增加一点动感。

[我测试]
> 重启问题解决了。但膨胀的感觉不太对——像弹了一下
> 又落回去，不是那种平稳展开的感觉。换个缓动函数试试。

[CC 实现 v3]
> 把 ease 换成了 cubic-bezier(0.4, 0, 0.2, 1)——
> 这是 Material Design 的标准缓动，快速启动、匀速减速、
> 无回弹。你再感受一下。

[我测试]
> 这个对了。平稳流畅，不像弹了一下。
> 动画时长 1s 合适不？会不会太慢？

[CC 回复]
> 1s 动画是动画本身的时长，setTimeout 的 1s 延迟是
> 悬停到弹出气泡的时间。两者其实没有直接联系——
> 动画在 1s 内完成，气泡在 1s 后弹出，刚好动画结束
> 时气泡出现。如果你觉得气泡弹出太慢可以改 setTimeout，
> 但动画 1s 是合适的——太短的动画看不出"展开"过程，
> 太长的动画让用户等得不耐烦。
```

```
[为什么这样问]
💡 视觉反馈的质量无法通过文字需求文档准确传达。"丝滑"、"流畅"、"舒服"
这些词对 AI 来说是抽象概念，对用户来说是直觉感受。AI 能写出功能正确的
动画代码，但"感觉对不对"只有你在浏览器里试了才知道。小球动画的四轮
迭代不是在修功能 bug——代码从头到尾都能跑——而是在调"手感"。UI
动画开发的核心方法论是：写出来 → 看效果 → 描述哪里不对 → 调整参数
→ 再看效果。这个循环 AI 可以帮你加速每一轮的代码变更，但"看效果"
这一步只能由你来做。
```

---

## 8. 核心技巧

1. **`mouseup` + `setTimeout(0)` 是最小代价的选区同步方案**。一个 0ms 延迟让浏览器完成选区渲染后再读取，零成本杜绝了空矩形和过期坐标的 bug。

2. **闭包捕获选区的文字和位置，不要实时读 `getSelection()`**。浏览器会在焦点转移时自动清除选区，实时读取的结果不可靠。

3. **JS `.animating` class 代替 CSS `:hover` 驱动动画**。`:hover` 的"悬停状态"受鼠标微移干扰，JS class 一次性添加后动画独立运行——一行 `classList.add` 解决了 CSS 伪类无法解决的问题。

4. **手动实现拖拽比 Drag API 更可靠**。10 行 mousedown/mousemove/mouseup 代码，不依赖浏览器的拖拽行为，不触发页面可能注册的自定义 drag 处理器。简单、可控、兼容。

5. **模式自动判断做两层：前端乐观 + 后端兜底**。`isSingleWord()` + `isEnglishText()` 在 Content Script 判，Background 再校验语言对——前端大胆猜，后端保守兜。不需要用户手动选择模式，也保证猜错了有降级。

6. **`positionBall()` 和 `getBubblePosition()` 共享同一设计模式**：优先理想位置 → 单方向溢出翻到对面 → 保底 clamp。四方向翻转逻辑用三行 `if` 实现，覆盖了绝大多数场景。

---

## 9. 小结

- **划词翻译遵循"不打扰、有节制、可控制"的设计哲学**：小球 12px 极小不遮挡正文，悬停 1s 才展开避免误触，气泡可拖拽/可复制/可随时关闭。
- **`mouseup` 是唯一的交互入口**：`setTimeout(0)` 防抖 + `isValidSelection()` 三层检查 + 闭包捕获文字防止浏览器清除选区——每一个细节都是为了一个目标：用户"松开鼠标"的那一刻，准确拿到选中的文字。
- **小球动画是 JS + CSS 的协作**：JS 负责状态管理（何时开始、何时结束），CSS 负责视觉表现（弹跳、膨胀、光环）。`.animating` class 解耦鼠标位置和动画状态，是解决 `:hover` 重启问题的关键。
- **气泡四层结构（bar/header/body/actions）各司其职**：bar + header 组成 28px 拖拽热区，body 展示原文折叠 + 译文 + 进度指示器，actions 提供复制和关闭。拖拽用手动 mousedown/mousemove/mouseup 实现，不用 Drag API，可靠性优先。
- **词典 vs 翻译全自动判断**：`isSingleWord()` + `isEnglishText()` 前端乐观判断，Background 语言对校验后端兜底。对用户透明——"选中即翻译"，不需要选择模式。
- **UI 动画调优靠"看效果说话"**：小球动画从 v1 到 v4 经历了四轮迭代，每一轮修的不是 bug，是手感。AI 负责写代码和改参数，你负责在浏览器里感受并对 AI 描述"哪里不对"。

> 下一章：第 11 章「测试：70 个用例的覆盖策略」——如何在 jsdom 环境中 mock Chrome API、如何设计测试数据以覆盖边界条件、以及 fake-indexeddb 如何让缓存层测试变得可能。


\newpage

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


\newpage

# 第 12 章 视觉打磨：主题与动画

## 1. 本章目标

读完本章，你将理解 iTranslate 如何用一套 CSS 变量体系在四个隔离的扩展上下文中统一视觉风格，以及如何用 Claude Code 完成视觉打磨——从主题色选定到动画微调的全流程。你会看到 34 个 `--itranslate-*` 变量的命名和分层逻辑、极地冰川主题的设计决策、四种动画的调试过程，以及最重要的：**AI 在视觉设计中的正确协作模式**——它没有审美，但能帮你高效地执行审美。

---

## 2. 用 AI 做视觉设计靠谱吗

如果你问 Claude Code "这个界面好看吗"，它会给你一大段分析——对比度够不够、间距是否一致、色彩有没有呼应。但如果你问它"这个蓝色好看吗"，它只能告诉你这个蓝色的 HEX 值和 WCAG 对比度等级，无法给出审美判断。这是理解 AI 视觉设计能力的起点：**AI 能执行审美，但不能拥有审美。**

### CC 的长板

在视觉设计这件事上，CC 有三个实打实的优势：

**第一，CSS 是它的母语之一。** 训练数据中包含了海量的 CSS 代码、设计系统文档、UI 框架源码。当你描述一个视觉效果——"一个半透明毛玻璃卡片，背景模糊 10px，圆角 12px，带一点微妙的边框"——CC 不需要"理解"玻璃是什么，它知道 `backdrop-filter: blur(10px); border-radius: 12px; background: rgba(255,255,255,0.7)`。从自然语言到 CSS 的映射准确度极高，比人工手写快一个数量级。

**第二，它能分析现有设计系统并保持一致性。** 当你把 `theme.css` 的 34 个变量丢给 CC，让它"在这个体系下加一个错误提示的样式"，它会自动使用 `--itranslate-error-bg`、`--itranslate-error-border`、`--itranslate-error-text` 这三个已有变量，不会凭空创造一个新颜色。这种"在给定约束下创作"的能力正是视觉一致性所需要的——设计师定了规范，AI 沿着规范执行。

**第三，快速批量生成方案供你选择。** 一个按钮的 hover 效果，CC 可以同时给你三个版本：微提亮、加阴影、边框发光。你不需要手写三个然后分别看效果，CC 一次性列出，你选一个。视觉设计中的大量时间花在"试试看"上，AI 把"试试看"的成本降到了接近零。

### CC 的短板

短板同样明确："没有审美观"这一条就够让人头疼了。

当你告诉 CC "这个界面太白了"——它不知道你想要什么。它可能给你加上阴影、改成米色、或者把背景变成渐变。三个方案在技术上都是"解决太白"的正确方案，但只有一个是符合你审美的。CC 分不出哪个好——它只能等你反馈。

这意味着视觉设计必须由**人来定方向**。你不能说"做一个好看的翻译气泡"，因为"好看"对 CC 来说没有信息量。你必须说"米白色底、极细的蓝色边框、左上到右下微妙的渐变"——把审美翻译成可执行的参数。

视觉的另一个特殊之处：**它是主观的**。代码的逻辑正确与否可以测试——翻译结果对不对、缓存命没命中、Observer 有没有漏监听。但动画的缓动曲线"好不好看"没有客观标准。你需要自己看、自己感受、然后给 CC 反馈。这是所有 AI 编程任务中，最依赖人的审美判断的环节。

### 正确的协作模式

iTranslate 的视觉打磨遵循一个三拍子循环：

1. **你定方向**："我想要冰川蓝为主的冷淡风，有极地冰川的干净感，不要任何多余装饰。"
2. **CC 产出方案**：一套完整的 CSS 变量体系，从主色到阴影到圆角。
3. **你看效果给反馈**："这个冰川蓝偏深了，像深海色，不是我想要的浅冰色。浅一点，多一点透明感。"
4. **CC 调整**：把 `#5A9EC0` 改成 `#6BAECF`，再把 hover 态的饱和度调低。

每一轮迭代都是真人的审美判断加上 AI 的代码执行。人不替代 AI 写代码，AI 不替代人做审美。这条边界划清楚了，视觉打磨就变成了高效的流水线。

---

## 3. CSS 变量主题系统

iTranslate 的视觉统一不是靠"每个地方手写相同的颜色值"来保证的——那会在你决定换主题时变成噩梦。解决方案是 CSS 自定义属性（CSS variables），也称 CSS 变量。

### 为什么用 CSS 变量

**一次定义，全局统一。** 所有 34 个设计 token 定义在 `src/shared/theme.css` 的 `:root` 伪类下。popup 的按钮背景色写 `var(--itranslate-gradient-brand)` 而不是 `linear-gradient(135deg, #6BAECF, #62B8D9)`。Settings 页面的文字颜色写 `var(--itranslate-text-primary)` 而不是 `#2A3038`。内容脚本注入的 `<style>` 同样引用这些变量。如果哪天你想把整个主题从冰川蓝换成森林绿，只需要改 `theme.css` 中的几个变量值——所有 204 个引用点自动跟随。

**四上下文的统一分发。** 第 6 章讲过，Chrome 扩展有四个隔离的 JS 上下文，CSS 同样面临分发问题。iTranslate 用两种方式覆盖了三种场景：

- **Popup 和 Settings**（独立 HTML 页面）：通过 `@import '../shared/theme.css'` 直接引入。它们是独立的网页，有独立的 `<style>` 作用域，`@import` 是最自然的方式。
- **Content Script**（注入到宿主页面）：不能 `@import`——注入到任意页面后，`@import` 的路径是相对于宿主页面的，必然 404。iTranslate 的做法是在 Vite 构建时通过 `?inline` 查询参数将 `theme.css` 和 `styles.css` 作为字符串导入 JS，在 `executeScript` 注入时动态创建 `<style>` 标签插入页面。宿主页面的样式不受影响（变量名有 `--itranslate-` 前缀），翻译元素的样式依赖主题变量，主题变量在注入的 `<style>` 中定义。

这听起来多了一步 `?inline` → 字符串 → 动态 `<style>` 的弯，但它是 Manifest V3 的 `executeScript` 不支持 ESM import 的必然代价。好处是同一份 `theme.css` 既是 popup/settings 的 `@import` 源，也是 content script 的内联源——一份定义，四处生效。

### 34 个变量的五层分类

iTranslate 的 34 个 CSS 变量不是平铺的，而是按照用途分成五个类别：

**颜色（最核心的一层）：**
```css
--itranslate-brand-purple: #6BAECF;      /* 冰川蓝主色 */
--itranslate-brand-bg-soft: #F5F3EF;     /* 米白基底 */
--itranslate-text-primary: #2A3038;      /* 深炭灰文字 */
--itranslate-text-muted: #9BA8B5;        /* 弱化文字 */
```

注意变量名里的 `purple` 是历史遗留——设计迭代中主色从紫色变成了冰川蓝，但变量名没改。改变量名意味着要同步修改所有引用位置的代码，风险高于收益，保留下来了。这是真实项目中的常态——变量名不一定完美，但一致性高于命名完美。

**渐变（功能区分）：**
```css
--itranslate-gradient-brand: linear-gradient(135deg, #6BAECF, #62B8D9);
--itranslate-gradient-undo: linear-gradient(135deg, #CF8B6B, #D9A88E);
```

翻译按钮和撤销按钮使用不同的渐变，且都是同色系的浅→深过渡。两个渐变在视觉上差异明显（冷蓝 vs 暖陶），用户扫一眼就能区分当前是翻译还是撤销状态，不需要读文字。

**语义色（成功/错误）：**
```css
--itranslate-success-bg: #f0fff4;
--itranslate-error-bg: #fff5f5;
```

API 测试通过时用绿色背景，失败时用红色背景。这些颜色不在主色调体系内——它们是通用的用户体验约定，绿色=成功、红色=错误，跨应用通用。如果哪天换了主色调，这些语义色不需要改。

**间距和圆角（空间节奏）：**
```css
--itranslate-radius-sm: 4px;
--itranslate-radius-pill: 14px;
--itranslate-radius-circle: 50%;
```

圆角有三种基础尺寸加上胶囊形和正圆形。为什么不用更多层级？因为 popup 和气泡的组件数量有限——按钮是胶囊形、开关是胶囊形、关闭按钮是正圆形、小标签是 4px 小圆角。五种形状覆盖了所有需求，加第六个只是增加维护成本。

**阴影（层级表达）：**
```css
--itranslate-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
--itranslate-shadow-bubble: 0 8px 32px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04);
```

小阴影给按钮、卡片做轻微的抬升感；大气泡阴影用双层（柔光扩散 + 1px 实边）在复杂背景上建立清晰的边界。双层阴影是"好看"的关键细节——只有扩散阴影的话，气泡在白底网页上边界模糊，加一层 1px 的半透明描边后边界立刻变利落。这个设计细节是你告诉 CC "在白色网页上气泡边缘模糊了，加一层极细的边框"，CC 给出的方案。

### 命名规范

所有变量以 `--itranslate-` 开头。这不是为了好看——注入到宿主页面后，没有命名空间前缀的 `--bg-primary` 会和页面的同名变量冲突甚至覆盖页面样式。前缀是隔离墙。前缀后的命名遵循 `{类别}-{子类}-{层级}` 模式：`--itranslate-text-primary` = iTranslate 的 text 类别 primary 层级。一致性来自规则，不是来自记忆。

---

## 4. 极地冰川主题设计

设计方向在项目启动时就确定了：**冷淡、干净、专业感**。翻译工具不是社交应用——用户打开它是为了完成"理解异国文字"这个任务，界面应该退到背景中，不争抢注意力。

### 核心色彩

**米白基底 `#F5F3EF`：** 不用纯白 `#FFFFFF`。纯白在大面积使用时刺眼，尤其在夜间或长时间阅读时。`#F5F3EF` 比纯白偏暖 2%，保留了"纸"的质感——用户看到的不是一个冷冰冰的白色界面，而是像一张微微泛黄的书页。这个色号是 CC 提供的几个"米白"候选中你选出来的——#F8F6F2 偏粉、#F0EDE6 偏灰、#F5F3EF 刚好在中间。

**冰川蓝 `#6BAECF`：** 冷色调但不冷淡。蓝色天然传达"沟通"和"信任"——电子邮件、翻译、词典类产品大面积用蓝色不是巧合。但常见的科技蓝（#2196F3）过于鲜艳，放在翻译气泡上会像"错误提示"。冰川蓝降低了饱和度，在冷感中加入了柔和的透明度联想——冰层透光的质感，不是深海潜艇的厚重感。

**深炭灰 `#2A3038`：** 不用纯黑 `#000000`。纯黑在白色基底上对比度过高（WCAG 21:1），长时间阅读易疲劳。`#2A3038` 把对比度降到约 13:1，在可读性和舒适度之间取平衡。而且深炭灰比纯黑多了一层"品质感"——高端出版物很少用纯黑印正文，通常是 90%-95% 黑。

**暖陶色渐变（撤销按钮）：** 从冰川蓝到暖陶色 `#CF8B6B → #D9A88E`，是整套主题中唯一的暖色。这个设计决策很关键——只有一个暖色，所以用户的视觉系统能瞬间定位它。翻译按钮是冷的冰川蓝，撤销按钮是暖的陶土色，"翻译"和"撤销"不需要读按钮上的文字就能区分。这是色彩的功能性使用，不是装饰。

### Popup 组件视觉

Popup 的所有交互元素遵循统一的视觉语言：

- **Logo**：纯色冰川蓝，不做渐变——logo 需要在小尺寸下保持辨识度，渐变在小尺寸上容易糊成一片。
- **按钮**：冰川蓝渐变底 + 白色文字，`135deg` 对角线方向（左上到右下），比水平渐变多了方向感。hover 时渐变色整体提亮。撤销按钮独立一套暖陶色渐变——唯一一个和主色不同的渐变。
- **开关 / 下拉框**：微渐变（同色系的浅→深变化，色差在 5% 以内）。不是每个元素都需要显眼的渐变——开关只需要一个"比纯色更有质感"的处理，大色差的渐变会喧宾夺主。

### 翻译气泡视觉

划词翻译气泡（`itranslate-selection-bubble`）是用户视线停留最久的地方，视觉上的用心程度最高：

**米白渐变底**：`linear-gradient(180deg, #FCFBF9 0%, #F5F3EF 100%)`。从更白一点的顶部过渡到米白底部，制造了轻微的立体感。人的视觉系统对这种从上到下的亮度渐变天生敏感——它模拟了光从上方照下来的自然效果。

**4px 三色渐变顶条**：`linear-gradient(90deg, #6BAECF, #94C8E0, #B8D9EA)`。气泡顶部有一条 4px 高的水平渐变条——从较深的冰川蓝过渡到极浅的冰蓝。这条线除了品牌标识外还有一个实用功能：给用户一个拖拽的视觉提示。气泡是可拖拽的，顶条的颜色暗示"这里可以抓"。

**译文分割线**：`border-top: 1px solid rgba(107, 174, 207, 0.12)`。原文和译文之间用一条极淡的冰川蓝分割线分隔。12% 透明度刚好可见但不割裂——如果是实线，视觉上会把气泡切成上下两半；如果太淡，分割作用消失。

### 小球的品牌表达

划词翻译的触发小球只有 12px 直径，但在这个小空间里完成了品牌表达：

- 冰川蓝渐变底：和翻译按钮同色，视觉关联
- `::after` 伪元素显示 `data-label` 的"译"字（中文环境下）：悬停膨胀后浮现，8px 白色小字
- 光环扩散：`box-shadow` 从 `0 1px 4px` 扩散到 `0 0 0 10px rgba(107, 174, 207, 0.15)`，像一颗石子投入水面

12px 的小球上花了这么多设计心思，值得吗？值得。小球是用户和 iTranslate 的"初次接触"——在页面上选中文字后，小球出现在选区旁，用户注意到它、悬停上去、看到翻译。如果小球只是一个无聊的灰点，用户可能根本注意不到它。视觉设计的第一性原理：标记"这里有功能"。

---

## 5. 动画的 AI 辅助调试

动画调试是 CC 最擅长的视觉任务之一，因为动画的所有参数——时长、缓动函数、关键帧百分比、透明度变化——都是数值。CC 不需要"觉得"好看，它只需要根据你的描述输出对应的参数值。

### 进度指示器：三点弹跳

翻译占位符显示三个冰蓝色圆点依次弹跳，告诉用户"翻译进行中"。

```css
@keyframes itranslate-bounce {
  0%, 80%, 100% { opacity: 0.35; transform: scale(0.85); }
  40%           { opacity: 1;     transform: scale(1); }
}
```

三个圆点通过 `animation-delay` 错开：第二个延迟 150ms，第三个延迟 300ms。三个圆点的弹跳在时间上形成从左到右的波浪——这是"正在工作"的经典视觉隐喻（Windows 的开机动画、Slack 的加载指示器都用类似模式）。

动画参数的含义：0% 到 40% 圆点放大并变亮（"弹起来"），40% 到 80% 圆点缩回并变暗（"落下去"），80% 到 100% 静止等待下一轮。一个完整周期 800ms——不够快会让人以为卡住了，太快会显得焦躁。800ms 是一个经验数字，是 CC 的建议值，你在实际页面上看效果确认的。

### 小球膨胀动画：CSS animation 还是 JS 驱动

小球从 12px 圆点膨胀为可交互元素的过程，最终选择了 CSS animation + JS class 触发，而非纯 JS 驱动。这个选择的过程是一段典型的 CC 协作：

**CC 的初始方案是用 JS 的 `requestAnimationFrame` 逐帧手动控制 transform。** 这个方案的优势是精确——你可以在每帧做任何事。但缺陷也很明显：代码量多、需要手动维护动画状态、在小元素上性能优势不明显。

**你给出的反馈方向是"能不能用 CSS animation"？** CSS animation 的代码量只有关键帧定义 + 一行 `animation` 属性，且浏览器对 CSS animation 的优化比 JS 逐帧计算更高效。

但 CSS animation 有一个问题：如果用户鼠标微移（mouseenter 反复触发），动画会重新开始，小球会反复膨胀收缩。这是一个体验 bug——用户的鼠标可能在 12px 小球上微微滑动，`mouseenter` 会因此多次触发。

**CC 的解决方案是用 JS 控制 class，不是 CSS `:hover`。** 具体做法是：`mouseenter` 时通过 JS 添加 `.animating` class 触发动画，用一个防抖变量 `ballHoverTimer` 防止重复添加。class 一旦加上就不会被微移重新触发——CSS animation 保持 `forwards` 填充模式，动画结束后停留在最终状态。这个方案只有几行 JS 代码，把状态管理交给 JS，把动画执行交给 CSS，分工清晰。

### 缓动曲线的选择

小球膨胀使用的缓动函数是 `cubic-bezier(0.4, 0, 0.2, 1)`——Material Design 的标准 deceleration 曲线。它的特征是：**0-30% 快速变化（"冲出去"），30%-100% 逐渐减速（"慢慢到位"）**。放在小球膨胀动画上，效果是小球迅速放大到 1.5 倍再缓缓过渡到 2 倍——有力量感但不突兀。

为什么不选 spring/bounce（弹簧/弹跳）缓动？弹簧感会让小球在最终位置来回振荡一下再停稳。在按钮点击反馈中这种"抖一下"的感觉很愉悦，但在 12px 的小球上用弹簧，视觉效果是"小球在抽搐"。冷淡主题的动画应该像冰面滑行——平滑、克制、不张扬。`cubic-bezier(0.4, 0, 0.2, 1)` 的减速曲线完美契合了这个意图。

**光环扩散**是同一个关键帧动画的一部分：`box-shadow` 的 spread 从 4px 扩散到 10px，颜色透明度逐渐降低，模拟水波扩散的效果。因为和 transform 在同一个关键帧中，光环和膨胀完全同步——不需要单独管理动画时序。

### 气泡展开

翻译气泡的入场动画只有一行：

```css
@keyframes itranslate-bubble-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

200ms `ease-out`，快速淡入 + 轻微上移。为什么这么快？用户悬停 1 秒后气泡才出现，等待时间已经够长了——如果气泡再花 500ms 慢慢展开，用户会在这个交互中总共等 1.5 秒，体验拖沓。200ms 刚好让气泡的出现"有过渡"但不"让人觉得在等"。

### 用 CC 调试动画的心流

这些微调的效率源自一个固定的对话模式：

1. 你描述感觉："小球膨胀太快了，像弹出来而不是长出来"
2. CC 定位参数："当前 `duration` 是 0.4s，建议改为 1s。或者可以调整缓动曲线为 `cubic-bezier(0, 0, 0.2, 1)`（纯减速，没有起始加速段），让膨胀看起来是自然变大的"
3. 你选择："试第二个方案，纯减速"
4. CC 给出代码，你刷新看效果，确认

整个过程 CC 没有"理解"美，但它理解了你的描述到参数的映射——"太快"="duration 短"、"弹出来"="ease-out 有起始加速段"、"长出来"="纯 deceleration 曲线"。这是 AI 在视觉调试中的价值：它有一张经验性的"感觉到参数"的转换表。

---

## 6. CC 对话实录

以下是 iTranslate 视觉打磨过程中一段真实的 CC 对话（精简还原）：

---

**我**：我觉得现在的主题色太冷了，整个界面像医疗软件。我想要冰川的感觉——冷但不冷酷，有自然的通透感。

**CC**：我理解了。"太冷"通常意味着蓝色的饱和度偏高，或整体色调缺少暖色平衡。目前的主题色是 `#5A9EC0`（偏中蓝）。建议做以下调整：

1. 主色从 `#5A9EC0` 改为 `#6BAECF`——提高明度，降低饱和度，更像冰面反射光
2. 基底色从 `#FFFFFF` 改为 `#F5F3EF`——加入 2% 暖黄色，模仿纸的质感
3. 新增一个暖色渐变用于撤销按钮：`#CF8B6B → #D9A88E`（陶土色系），作为全界面唯一暖色锚点

这三个改动会保留"冷"的基调（蓝），但通过暖基底和暖色锚点避免"冷酷"感。

**我**：改。第三个想法很好——翻译按钮冷色、撤销按钮暖色，用户一看就区分。

---

> **为什么这样问**
>
> 给 CC 设计反馈的关键是**用对比而不是绝对值**。"太蓝了"比"蓝色改浅一点"更好——前者描述了问题（过饱和），后者直接下指令（但你不知道对不对）。CC 擅长从问题诊断到解决方案的推理，不擅长猜你的审美偏好。把你的"感觉"翻译成"对比描述"（太X了/不够X/X和Y不协调），CC 就能定位到对应的参数。

---

**我**：气泡的 box-shadow 在白色网页上边界不清晰，气泡边缘融到白背景里了。

**CC**：问题在于只用了扩散阴影（`0 8px 32px rgba(0, 0, 0, 0.10)`），在纯白背景上阴影边缘本身就是模糊的，无法形成边界。建议改为双层阴影：

```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04);
```

第二层 `0 0 0 1px` 是一个无偏移无模糊的 1px 描边阴影——它的视觉效果相当于 `border: 1px`，但不占用盒模型空间。两层叠加后，扩散阴影提供漂浮感，实边描边提供边界感。

**我**：效果很好。把描边颜色改成冰川蓝的透明度版本，和主题统一。

**CC**：`0 0 0 1px rgba(107, 174, 207, 0.12)`。12% 透明度刚好可见但不抢眼。这样气泡的边界色和主色是同一色系。

---

这段对话体现了 CC 在视觉调试中的两种角色：**参数翻译器**（"太冷"→饱和度/明度调整）、**方案生成器**（边界模糊→双层阴影）。两种角色都不涉及"审美判断"——CC 没有说"这个设计好看"，它一直在说"这个技术方案可以达到什么视觉效果"。

---

## 7. 核心技巧

1. **CSS 变量是视觉一致性的基建。** 在项目早期花 30 分钟定义一套变量，比后期在 50 个文件中逐一修改颜色值划算 100 倍。变量名要有命名空间前缀（防止注入冲突）、要有层级感（`primary/secondary/muted` 形成三级文字灰度）。

2. **只用一种暖色。** 在冷色调主题中，唯一的暖色会成为最强的视觉锚点。超过一种暖色，锚点效应消失。iTranslate 的暖陶色撤销按钮和冷蓝翻译按钮的对比，就是单暖色锚点的一个应用。

3. **动画的方向和速度需要符合直觉。** 气泡从下方飞出（`translateY(6px)` 到位移 0）、小球膨胀用纯减速（没有弹跳）、所有入场动画控制在 200-300ms——这些不是随机的参数，而是"用户看到动画后不会觉得卡也不会觉得慢"的经验区间。

4. **用 CC 调试动画时，描述感觉而非给参数。** "太快了""太硬了""跳的太高了"比"duration 改 0.8s"更高效。CC 擅长从感觉映射到参数，你只需要提供感觉。如果你直接给参数，等于跳过了 CC 最有价值的那一步。

5. **变量命名容许历史债务。** `--itranslate-brand-purple` 存的是蓝色——这在理想世界不应该发生，但在真实项目中改变量名导致的回归风险远大于命名不完美的成本。如果变量名不影响理解和维护，不修就是最好的修。

---

## 8. 小结

视觉打磨是 AI 编程中最"非工程"的环节——它不涉及算法、不涉及架构、不涉及性能。但它同样遵循人机协作的效率原则：**人负责审美判断，AI 负责将审美翻译为代码并保持一致性。**

CSS 变量体系是这种协作的物质基础。34 个变量像乐高积木——CC 在搭积木时不碰颜色具体值，只引用变量名。你想换主题时，改积木的"色卡"就行，不需要重搭整个城堡。

动画调试是这种协作的最高效场景——所有参数都是数值，CC 有一张从"感觉描述"到"参数数值"的转换表。你不需要会写 CSS animation，你只需要会说"太快了"。


\newpage

# 第 13 章 测试与发布：最后一公里

## 1. 本章目标

读完本章，你将理解一套完整的前端测试基础设施如何搭建——从 Vitest + jsdom + fake-indexeddb 的组合选型，到 9 个测试文件 70 个测试用例的覆盖策略。更重要的是，你会看到 **Claude Code 在测试编写上的独特效率**：测试代码是结构化的 Arrange/Act/Assert 模式，正是 AI 最擅长生成的代码类型。最后，你会了解从构建到上架的完整发布流程，以及最小权限原则在 Chrome Web Store 审核中的实际回报。

---

## 2. 用 CC 补测试用例

### 测试基础设施

iTranslate 选用的测试套件是 Vitest，配置非常简单。`vitest.config.ts` 只有 9 行：

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
  },
});
```

四个关键决策：

**jsdom 作为测试环境。** 扩展的 content script 操作 DOM——提取节点、克隆元素、注入翻译。这些逻辑无法在纯 Node 环境中测试，需要一个模拟浏览器 DOM API 的环境。jsdom 提供了 `document.createElement`、`innerHTML`、`querySelector` 等完整的 DOM API，足够覆盖提取器和渲染器的测试需求。

**fake-indexeddb 自动注入。** 翻译缓存使用 IndexedDB（通过 `idb` 库封装），而 jsdom 不实现 IndexedDB。`fake-indexeddb/auto` 在 `setup.ts` 中全局引入，无需每个测试文件单独配置。import 之后，`indexedDB.open()` 就有一个完整的内存实现可用。

**`offsetParent` mock 是必需品。** 这是 jsdom 最有名的一个坑——它没有布局引擎，所有元素的 `offsetParent` 属性始终返回 `null`。而 iTranslate 的提取器通过 `offsetParent === null` 判断一个元素是否被 CSS 隐藏（`display: none` 元素的 offsetParent 为 null）。在 jsdom 中不做 mock 的话，**所有元素都会被当作隐藏元素跳过**，提取器返回空数组，所有测试全挂。`setup.ts` 的做法是把 `offsetParent` 重写为 `return this.parentElement || this`——父元素存在则返回父元素，否则返回自身。虽然这会让 `display: none` 元素的检测在测试中失效（留给集成测试覆盖），但保证了绝大多数 DOM 操作场景的可用性。

**`vi.stubGlobal('chrome', {...})` 模拟浏览器扩展 API。** Chrome 扩展的 `chrome.storage`、`chrome.i18n` 等 API 在 jsdom 中不存在。每个测试文件按需 stub 自己用到的 API——storage 测试 stub 了 `chrome.storage.sync.get/set`，i18n 测试 stub 了 `chrome.i18n.getMessage/getUILanguage`，translator 测试在此基础上还 stub 了 `fetch`。所有 stub 都在模块 import 之前完成（用 `vi.stubGlobal` 而非 `vi.mock`），确保被测模块加载时拿到的就是 mock 版本的 API。

### 70 个用例的覆盖版图

9 个测试文件，70 个用例分布在五层：

**提取层（extractor + structured-filter，16 个用例）。** 测试文本块按块级祖先分组、同块内多元素合并、`<script>`/`<style>` 跳过、已翻译元素（`.itranslate-translation` class）去重。结构化过滤器测试标题豁免（H1-H6 短标题保留）、噪音模式过滤（时间戳、日期、纯数字、相对时间）、结构过滤（`nav`/`sidebar` 类名容器跳过）、祖先链上的翻译类检查。filter 测试使用纯 `RawSegment[]` 构造输入，不依赖 DOM——这是好的单元测试习惯。

**渲染层（renderer，10 个用例）。** 两阶段渲染流程的完整测试：`renderPlaceholders()` 注入三点跳动动画的占位克隆、`renderTranslations()` 替换占位符为真实译文、去重检查（重复调用不产生重复克隆）、原元素保持不变。特别值得注意的测试：克隆元素继承原始元素 class 和 data 属性的验证——渲染器使用 `cloneNode(false)` 浅克隆，这个测试确保了类名和属性不会丢失。

**存储层（cache + storage，7 个用例）。** IndexedDB 缓存的完整 CRUD 流程：存一条查一条、批量存取、清空全部。Storage 测试覆盖默认值合并（新增字段对老用户自动获得默认值）和向后兼容（旧版 settings 对象不含新字段时 `getSettings()` 不会崩溃）。

**语言检测层（lang-detect + i18n，16 个用例）。** BCP 47 标签到语言名的映射（zh-CN/zh-TW/en-US/ja/ko/fr/de 全覆盖）、null 和空输入处理、大小写不敏感。基于文本内容的 Unicode 脚本检测：CJK 字符判断中文、假名字符判断日文、谚文字符判断韩文、纯拉丁文本返回 null。i18n 测试覆盖 UI 语言检测（zh-CN/zh-TW/zh → zh_CN，en-US/en-GB → en，不支持的语言 → en 回退）和 `t()` 函数（已知 key、缺失 key 回退显示 key 自身、单占位符 `$1` 替换、多占位符数组替换）。

**翻译引擎层（translator，3 个用例）。** 验证批量翻译的 API 调用次数、分段策略（50 条长文本按 token 估算自动拆成 2 批）、API key 缺失时抛出明确错误。

**交互层（selection，8 个用例）。** 划词翻译的完整生命周期：mouseup 创建小球、无选区不创建小球、选区被清除后小球仍保留（因为浏览器可能在鼠标接近小球时清除选区）、用户点击别处后小球移除。气泡位置计算：下方默认、底部溢出翻到上方、左边界 clamp。这些测试依赖 `Range.prototype.getBoundingClientRect` 的 mock——jsdom 同样不实现该方法。

### 用 CC 写测试的典型流程

测试代码是 AI 辅助编程中最容易拿到"一次就过"体验的场景。原因很简单：**测试有固定的三段式结构**：Arrange（准备数据）→ Act（执行被测函数）→ Assert（断言结果）。这种结构化的模式非常适合 AI 生成。

实际流程只需要三步：

**第一步，描述被测模块。** 把你的需求告诉 CC：

> "这是一个 DOM 文本提取器，输入 body 元素，遍历所有文本节点，按块级祖先（P/DIV/LI/H1-H6）分组，输出 RawSegment 数组。请基于这个函数的文档注释写 6 个测试用例。"

CC 不会凭空知道你函数的输入输出类型，但它能从你的代码注释和相关文件中推断出结构和边界条件。

**第二步，运行看结果。** `npx vitest run` —— 6 个用例中大概 3 个直接通过，2 个因为 mock 不完整需要调整，1 个因为理解偏差需要重写。

**第三步，把失败信息丢回给 CC。** 不要自己分析报错然后手动改测试代码——把 vitest 的命令行输出直接贴给 CC：

> "extractor 测试第三条失败了：'expected [] to have length 3'。input 是三个 <span> 在一个 <div> 里，但 extractSegments 返回了空数组。请分析原因并修复测试。"

CC 会检查提取器的过滤逻辑，发现这三个 `<span>` 的文本太短被 `structured-filter` 的噪音过滤拦截了，然后调整测试数据——把 `"Open"` 改成 `"Open the door and walk outside"`，或者调整 filter 配置。你只需要验证修复后的测试是否符合你的预期。

为什么这比手写测试高效？不是因为 AI 比你聪明——是因为**测试代码的信息密度低但结构要求高**。一个 10 行的测试用例，真正有信息量的只有 3 行（输入值、预期输出），剩下 7 行是 `describe`、`it`、`beforeEach`、`expect` 这些结构骨架。写测试的大部分时间花在搭架子上，而 AI 擅长搭架子。你把精力集中在"测什么"而不是"怎么写"上。

### 测试不是一次性的事

一个常见误区是把测试当成"代码写完了补一下"的事后工作。iTranslate 的开发过程中，功能变更频繁发生——过滤器从简单字符数阈值升级为结构化过滤，提取器增加了 `itranslate-translation` 的祖先链检查，词典模式新增了 JSON 解析失败时的 fallback 逻辑。每次改完代码，跑一遍测试套件（70 个用例 4.86 秒跑完），哪个模块被意外影响了立刻知道。**测试的价值不在写的那一瞬间，而在每次改代码后按下回车的那一瞬间。**

---

## 3. 构建与版本管理

### 两条构建命令的分工

iTranslate 有两条构建命令，分别服务于不同的场景：

**`npm run build`：日常调试的快速通道。** 它做了三件事：`tsc` 类型检查（先确保 TypeScript 没有类型错误）、`vite build` 主构建（popup/settings/background/service worker 打包到 `dist/`）、`vite build --config vite.content.config.ts` 独立构建（将 content script 打包为 IIFE 格式输出到 `dist/assets/content.js`）。整个过程不改变 `package.json` 的版本号，想跑几次跑几次。

注意 content script 为什么需要独立构建。Manifest V3 的内容脚本注入是通过 `chrome.scripting.executeScript({ files: ['assets/content.js'] })` 实现的——它只接受单文件 JS，不支持 ESM 的 `import` 语句。普通 Vite 构建输出的是 ES module 格式，直接注入会报错。`vite.content.config.ts` 单独将 content script 打包成 IIFE（立即调用函数表达式），所有依赖（`extractor.ts`、`renderer.ts`、`selection.ts` 等）内联到一个文件中，注入后立即执行。

**`npm run release`：发布用的一键流水线。** 它执行三步：`npm run bump`（将 `package.json` 的 z 版本号加 1，如 1.2.13 → 1.2.14）→ `npm run build`（完整构建）→ `node scripts/package-zip.cjs`（将 `dist/` 目录打成 `iTranslate-vX.Y.Z.zip`）。跑完这一条命令，你就得到一个可以直接上传到 Chrome Web Store 的 zip 包。

### 版本号唯一源

版本号管理有一个容易犯的错误：多处定义同一个版本号，改了一个忘了另一个，导致 manifest 声明和实际打包不一致。

iTranslate 的做法是把 `package.json` 作为唯一的版本源。`manifest.json` 里的版本号写的是占位符 `0.0.0`，真实版本在构建时由 `@crxjs/vite-plugin` 从 `vite.config.ts` 中注入。`vite.config.ts` 读取 `package.json` 的 `version` 字段，覆盖 manifest 的占位符。三处版本号（`package.json` + 构建后的 `manifest.json` + zip 文件名）始终一致，手动改版本号只需要改 `package.json` 一处。

日常调试用 `npm run build` 不改变版本号。升 minor（y+1）或 major（x+1）时手动运行 `npm version minor` 或 `npm version major`，后续 `npm run release` 时 z 继续从 0 开始累加。

---

## 4. Chrome Web Store 上架

### 准备材料清单

Chrome Web Store 上架需要的材料分三类：

**商店截图（至少 1 张，1280x800 或 640x400）。** 截图展示了用户打开扩展后看到的界面。iTranslate 准备了 5 张截图：popup 主界面、设置页面、翻译结果效果、划词翻译气泡、工具栏按钮状态切换。每张截图覆盖一个核心功能点，审核员和用户都能一眼了解这个扩展能做什么。

**宣传图片（可选但建议准备）。** 小图 440x280（搜索结果页展示）、大图 920x680（商品详情页顶部）、Marquee 1400x560（精选推广位）。这些图片不是截图——是带品牌元素的宣传图，包含 logo、核心卖点文字、装饰性背景。不是必需项，但有宣传图片的扩展在商店里看起来更专业。

**应用描述（多语言）。** Chrome Web Store 支持多语言描述。iTranslate 目前只有中英文双语，但商店描述需要覆盖扩展名、简短描述（132 字符以内）、详细描述（支持基本 HTML 格式）。注意：**应用描述必须与 `_locales/` 中的 `extName` 和 `extDescription` 保持一致**，否则商店显示和扩展内显示会打架。

**隐私政策链接。** 如果你处理用户数据——iTranslate 的 API key 和翻译内容理论上是敏感数据——就需要提供隐私政策链接。即使你只是把数据存在用户本地（IndexedDB），Chrome 也建议你声明。

### 权限说明是最关键的审核点

Chrome Web Store 的审核不是走形式。审核员会检查你的 `manifest.json` 中声明的权限和你的实际功能是否匹配。如果你申请了 `tabs` 权限但你的扩展只是个翻译工具，审核员会问："你要 tabs 权限干什么？"回答不上来就打回。

iTranslate 的权限策略在第 6 章就埋下了伏笔——只申请了 `storage`、`activeTab`、`scripting` 三项，没有 `host_permissions`。`storage` 用于保存用户设置；`activeTab` 用于获取当前标签页的 URL 和注入脚本；`scripting` 用于按需注入 content script。三项权限每一项都有明确的业务用途，没有一个是"万一以后用到先申请着"的心态。

特别说明 `host_permissions` 的缺失。大多数网页翻译扩展需要声明 `<all_urls>` 或者 `*://*/*` 的 host permissions，以在所有页面上自动注入 content script。iTranslate 不用——它通过 Popup 按需注入（`activeTab` + `scripting.executeScript`），用户点击工具栏图标时才注入，不点就不注入。这是一个架构决策在发布阶段结出的果实：**审核员看到你的权限列表能一眼理解你的扩展在做什么，审核就容易过。** 最终 iTranslate 的商店审核一次过，没有被打回要求补充说明。

### 防止差评的一个实战教训

商店文案有一个血的教训：**首页必须显著标注"需自备 API Key"。**

iTranslate 最早的商店描述中没有明确提到这一点，结果用户下载后发现翻译不能用，以为扩展功能坏了，直接打了一星差评。问题是——你没法在差评下回复解释"你需要自己注册 DeepSeek 账号拿到 API key 填进去"，用户打了差评就走了。后来在短描述的第一句加上"需自备 DeepSeek/OpenAI API Key"，详细描述的开头再用加粗文字强调一遍，差评率大幅下降。

这是一个典型的"技术人思维"和"用户思维"的差异。对你来说，"调用 AI API 当然需要 API key"是天经地义的常识。但对用户来说，"我下载了一个翻译扩展，它应该能翻译"是再自然不过的预期。你的常识不是用户的常识。商店文案是唯一在用户下载前就能澄清预期的机会——用足它。

### 版本更新流程

发布之后的版本更新是简单循环：`npm run release`（版本号 z+1，构建，打包）→ 在 [Chrome Web Store 开发者后台](https://chrome.google.com/webstore/devconsole) 上传新 zip → 提交审核。审核通常 1-3 个工作日。GitHub 和 Gitee 两个 Release 页面同步更新，提供 zip 下载链接供手动安装的用户使用。

---

## 5. CC 对话实录

以下是补 structured-filter 测试时的一段真实对话：

```
[我的 Prompt]
> 这是 structured-filter 模块的代码。请为它写单元测试，覆盖：
> 1. 标题豁免——H1-H6 再短也保留
> 2. 噪音过滤——时间戳、日期、纯数字、相对时间表达
> 3. 结构过滤——nav/sidebar 等类名容器内的内容跳过
> 4. 祖先链 itranslate-translation 检查
> 5. 空数组边界
> 使用 RawSegment[] 构造输入，不依赖真实 DOM。

[Claude Code 的回复]
我分析了 structured-filter 的代码，编写了以下测试：

describe('structured-filter', () => {
  it('保留短标题（H2 8字符）', () => {
    const result = structuredFilter.filter([
      makeSeg('Overview', true),
      makeSeg('Machine learning is transforming ...', false),
    ]);
    expect(result.kept).toHaveLength(2);
  });

  it('过滤噪音模式（时间戳、日期、纯数字、相对时间）', () => {
    const result = structuredFilter.filter([
      makeSeg('00:14', false),
      makeSeg('20-May-2026', false),
      makeSeg('12345', false),
      makeSeg('3 hours ago', false),
      makeSeg('Real article content ...', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.skipped.filter(r => r.reason === 'noise-pattern')).toHaveLength(4);
  });

  it('结构过滤：导航/侧栏类名容器', () => {
    const result = structuredFilter.filter([
      makeSegWithClass('Home Navigation', 'nav'),
      makeSegWithClass('Related Links', 'sidebar'),
      makeSeg('Main content text ...', false),
    ]);
    expect(result.kept).toHaveLength(1);
  });

  // ... 持续输出更多用例
```

```
[为什么这样问]
💡 关键指令："使用 RawSegment[] 构造输入，不依赖真实 DOM。"这是一个门槛极高的测试习惯——绝大多数开发者的第一直觉是 `document.body.innerHTML = '...'` 然后调 extractor。但 filter 的职责是"接收 segments 数组，返回 kept/skipped"，它的输入不要求是 DOM。绕过 DOM 直接用数据构造，测试速度更快（不需要 jsdom 解析 HTML），也更聚焦——你测的是 filter 逻辑本身，不是 DOM 解析。CC 默认会用 DOM 构造，你必须明确指出你用数据构造才有效。
```

---

## 6. 核心技巧

- **测试 stub 必须在 import 之前**。`vi.stubGlobal('chrome', {...})` 必须在 `await import('../module')` 之前执行，否则模块加载时拿到的是 undefined 而非 mock。i18n 和 storage 测试都采用"在顶层 stub → 在 `it` 内动态 import"的模式。

- **测试文件放在被测模块旁边，不要集中在根目录**。`src/content/__tests__/` 和 `src/background/__tests__/` 的目录结构让测试和源码的距离最短。当你修改一个模块时，测试文件就在同级目录下，不需要跨目录查找。

- **让 CI 帮你跑测试，但你必须在 push 之前自己跑一遍**。"等 CI 报错再修"的效率远低于本地 `npm test` 只花 5 秒。`vitest run` 的输出可读性极高——哪个文件、哪个 describe、哪个 it 失败、期望值和实际值对比，所有信息都在。

- **版本号唯一源是纪律，不是技术**。`package.json` → `vite.config.ts` → `manifest.json` 的注入链是单向的。不要手痒手动改 `manifest.json` 的版本号——改完第二天你自己都忘了，构建出来的包版本对不上。

- **商店文案写的是用户预期，不是技术事实**。"基于大语言模型的智能翻译扩展"不如"选中即译，支持中英日韩"管用。你在写应用描述，不是在写论文摘要。

---

## 7. 小结

**本章要点：**
- Vitest + jsdom + fake-indexeddb 构成了前端扩展的完整测试三角。`setup.ts` 中 `offsetParent` 的 mock 是避免 jsdom 布局陷阱的关键。
- 70 个测试用例覆盖了提取、过滤、渲染、缓存、存储、语言检测、国际化、翻译引擎、划词交互九个维度。测试不是事后补的，是每次改代码后的安全网。
- 用 CC 写测试的效率优势来自测试的结构化本质——Arrange/Act/Assert 三段式正是 AI 最擅长生成的代码模式。
- `npm run build`（不改版本号，日常调试）和 `npm run release`（z+1，构建，打包）两条命令各司其职。`package.json` 是唯一版本源。
- Chrome Web Store 上架的关键在权限说明——iTranslate 的"按需注入"架构在这个阶段得到了回报：三项权限，没有因为权限问题被退回。
- 商店文案需显著标注"自备 API Key"——这是用差评换来的教训。

---

### Part 2 回顾：iTranslate 的诞生

从第 5 章到今天，我们完整走完了一个 Chrome 扩展从 0 到 1 的全过程。

**第 5 章**，"我想做一个翻译扩展"变成了三页结构化 Spec。**第 6 章**，Vite + crxjs 搭起了 Manifest V3 骨架，四个隔离上下文在第一天就确定了边界。**第 7 章**，一份 20 行的 System Prompt 替代了 Google Translate API，翻译质量反而更好——因为你控制了目标语言、输出格式、以及不该翻什么。**第 8 章**，块级克隆 + afterend 插入的 DOM 策略让原文和译文在同一布局流中共存，MutationObserver 兜底监控动态内容。**第 9 章**，Popup 的 `ensureContentScript()` 按需注入让权限声明最小化，消息总线的 `sender.tab.id` 过滤避免了跨标签污染。**第 10 章**，划词翻译的 12px 小球、1 秒悬停动画、气泡拖拽——每一步都是"用户选中文字后应该发生什么"的逐帧推演。**第 11 章**，词典功能展示了 AI 编程中最关键的 Prompt Engineering 技能：结构化输出，让模型的自由文本变成可解析的 JSON。**第 12 章**，34 个 CSS 变量在四个隔离运行环境中统一分发，极地冰川主题从主色到阴影到动画缓动——人定审美方向，AI 执行实现。

**第 13 章在本章。** 70 个测试用例，两条构建命令，一次商店审核——产品不是写完最后一行代码就算完成的。测试、构建、发布，这三件事加起来才把代码变成了能交到用户手里的产品。

这个产品没有动用任何"高级"技术。没有微服务、没有 CI/CD 管线、没有 Kubernetes、没有自动化部署。它就是在浏览器里跑的几个 TypeScript 文件，加一个 ChatGPT 兼容的 API 调用。但就是这几个文件，解决了一个真实的问题：**用一种比 Google Translate 更聪明的方式，在网页上直接显示双语翻译。**

Claude Code 在这里面的角色是什么？它不是一个"代码生成器"——你告诉它需求，它吐出完整文件，你复制粘贴。它是坐在你旁边的结对程序员：你描述业务逻辑，它写成代码；你看着效果说不对，它马上改；你跑测试挂了，它读报错修复；你拿不准怎么设计，它列出三个方案的利弊让你选。**生产力不是来自 AI 替你写代码，而是来自 AI 消除了"想法到手"之间的摩擦。**

---

### 接下来：Part 3 方法论

现在你看到了一个产品的完整诞生过程。从立项到发布，9 个章节，一个真实的 Manifest V3 Chrome 扩展。但一本书如果止步于"我做了一个扩展，你看我是怎么做的"，它就只是一份项目日志。

Part 3 的目标是从具体项目中抽离出来，提炼**通用的方法论**。什么样的 Prompt 是好的 Prompt？面对一个复杂的重构任务，怎么分解步骤？一个项目里同时用 DeepSeek、Claude、GPT 三种模型，各自的优势怎么组合？一个 AI 辅助编程项目会踩哪些坑、怎么提前避开？

这些不是你读完第 5-13 章就能自动领悟的东西。它们需要被单独拿出来说清楚。Part 3 就是为了这个。


\newpage

# Part 3 开篇：与 AI 协作的五条铁律

Part 1 教了你工具怎么用，Part 2 带你走完了一个真实项目的完整开发过程。在进入 Part 3 的方法论之前，有一件事值得先说清楚。

回顾 iTranslate 的开发过程，我犯过最多的错误不是 Prompt 写得不够好、不是架构设计有问题，而是**我自己没有管好自己**——AI 给了一个看似完美的方案我就直接接受、一个问题反复修了四轮还不肯回头、修 Bug 的时候顺手"优化"了无关代码导致新问题。这些问题和技术无关，和行为模式有关。

我在项目中逐步总结出五条规则，写进了每个项目都有的 CLAUDE.md，命名为"铁律"。它们约束的不是 AI，是**使用 AI 的人**。事实证明，这五条规则对开发质量和效率的影响，比任何 Prompt 技巧都大。

---

### 铁律一：根因驱动

> 必须定位到问题的根本原因再动手修改。禁止在未找到根因的情况下猜测性修改代码。每个修改必须能解释"为什么"。

AI 擅长快速给出修改方案，但它也擅长在没搞清楚问题本质的情况下自信地输出代码。当你告诉 CC"翻译功能坏了"，它可能会直接改翻译 API 的调用方式——但如果真正的问题是缓存 Key 不含目标语言导致旧翻译被错误复用，改 API 调用只会引入新 Bug。

这条规则的要点是：**在让 AI 动手之前，先让它帮你分析根因。** 正确的对话顺序是"帮我排查这个问题的根因"→ 确认根因 → "基于这个根因，给出修复方案"。跳过第一步直接让 AI 修，是你自己放弃了最有价值的步骤。

---

### 铁律二：三轮止损

> 同一个问题如果在三个对话轮次内仍未解决，必须停下来回到问题起点，从第一性原理重新分析，不可继续沿用之前的思路惯性。

AI 辅助开发最大的陷阱之一是"快速试错"变成"快速瞎试"。CC 给了你一个方案，不行；你又让它换了个方案，还不行；再换一个……每轮只需要几十秒，但三轮下来你已经在一个错误的方向上走了很远。

这条规则强制设置了一个止损点：三轮修不好，说明方向可能就错了。停下来，关掉当前对话，重新描述问题——从现象开始，而不是从"上一个方案为什么没 work"开始。新开一个会话往往比在错误的思路上继续绕更高效。

---

### 铁律三：极简修改

> 能少写一行代码就绝不多写。优先用最精简的方式解决问题，禁止引入不必要的抽象、额外文件或依赖。

AI 有一种天生的"过度工程化"倾向——你让它修一个边界条件，它可能顺便引入一个策略模式 + 一个配置系统 + 三个新文件。它不是在故意搞复杂，而是它的训练数据里充满了"完善的设计"范例，它倾向于模仿那些。

你的工作是拉住它：**"只修这个 Bug，用最少的代码。不要引入新文件。不要加新依赖。"** 如果你不给这个约束，AI 默认会用更复杂的方案。简单的方案需要你主动要求。

---

### 铁律四：专注问题

> 改问题时只改问题本身，禁止顺手重构、格式化、优化无关代码。重构需要先征得明确同意。

这条和铁律三是一对。铁律三是"不要过度设计解决方案"，铁律四是"不要碰问题范围之外的代码"。当你告诉 CC"修复翻译按钮的样式错位"，它可能顺便把整个 popup 的 CSS 重构了一遍——"这样更好维护"。结果是修了一个 5 像素的偏移，引入了一个 200 行的 diff，你不知道哪一行可能引入了新问题。

我的做法是：如果要重构，单独开一个任务。"顺手重构"是用 AI 编程时最容易引入回归 Bug 的行为，没有之一。

---

### 铁律五：二次确认

> 当用户的选择与你推荐的选择不符时，必须先展示该选择的利弊，让用户二次确认后再执行。禁止直接按用户选择执行而不做利弊提醒。

这一条比较特殊——它是写给 AI 的，让 AI 在遇到你的决策可能有问题时主动提醒你。比如你让 CC"把所有 console.log 删掉"，好的 CC 会提醒你"诊断日志在生产环境排查问题时有价值，建议保留标记为 🔎 前缀的日志"。你可以选择继续删除，但它必须先提醒。

这个机制的价值在于：**AI 比你更全面地掌握项目上下文，它可能看到你没看到的关联影响。** 让它在关键决策时做你的"第二双眼睛"。

---

### 这五条怎么用

我是把它们写进 CLAUDE.md 的，CC 在每次会话启动时自动加载。这样不需要每次都口头重复这些约束——AI 在生成每个方案时就已经受到了这些规则的限制。你在第 2 章学了 CLAUDE.md 的基本写法，在第 17 章会看到每条铁律对应的真实踩坑案例。

接下来的四章（Ch14-17）是 iTranslate 项目中提炼出的具体方法论。你会发现它们背后反复出现这五条铁律的影子——不是因为我在刻意引用，而是因为这五条确实是高质量 AI 协作的共同基础。

---

[跳转到第 14 章：Prompt 工程模式](ch14-prompt-patterns.md)


\newpage

# 第 14 章 Prompt 工程模式

## 1. 本章目标

读完本章，你将掌握 AI 编程中最重要的软技能——Prompt 工程。这不是"怎么写提示词"的技巧清单，而是从 iTranslate 项目中提炼出的**可复用的 Prompt 设计模式**。你会看到一份好的 System Prompt 包含哪四个要素，三种典型的 Prompt 设计模式分别适用于什么场景，以及五个最常见的 Prompt 反模式是如何一步步毁掉 AI 输出质量的。学完这一章，你写的不再是"帮我写个翻译功能"——而是能精确控制 AI 行为的工程化 Prompt。

---

## 2. 好的 Prompt 长什么样

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

## 3. System Prompt 设计模式

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

## 4. 格式控制技巧

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

## 5. Token 预算管理

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

## 6. 常见 Prompt 反模式

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

## 7. 核心技巧

- **角色是行为边界，不是客套话。** "你是一个专业的英中翻译"和"请翻译以下内容"的区别在于，前者给了 AI 一套行为准则——专业翻译不应该添加解释、不应该省略难句、不应该自己发挥。

- **示例比描述更有效。** 如果你想让 AI 返回特定格式，直接给一个输入输出对。描述"请用 JSON 格式返回，包含 word 和 definition 字段"不如直接写 `{"word": "hello", "definition": "你好"}`。AI 的模仿能力远强于规则理解能力。

- **负向约束优先于正向约束。** "不要添加解释" > "仅输出翻译结果" > "请翻译"。负向约束直接切断了 AI 添加额外内容的可能性，正向约束只是建议了正确方向。

- **解析器不能相信 Prompt。** Prompt 说 "no markdown fences"，解析器仍然要做 fence 清理。Prompt 是给 AI 的软约束，解析器是给程序的硬防护。两者的关系是"信任但要验证"——Prompt 尽最大努力让 AI 听话，解析器保证即使 AI 不听话也不会崩。

- **Temperature 0.1 是翻译/提取类任务的甜点。** 完全确定的 temperature 0 会让输出僵硬（每个句子结构完全一致），0.7 会让翻译每次不同（用户困惑）。0.1 在确定性和自然度之间取平衡。

- **Token 估算不需要精确到个位数。** 采样判断语言类型 + 经验比率就足够分批使用了。追求精确 token 计数需要引入 tokenizer 库，增加的复杂度远超收益。

- **降级策略是对用户友好的兜底。** 词典 JSON 解析失败时降级为普通翻译，用户体验近乎无损。AI 功能的设计中，总应该有一个"如果 AI 没按预期工作，用户看到什么"的答案。答案永远不应该包含"报错"二字。

---

## 8. 小结

本章从 iTranslate 项目提取了 Prompt 工程的通用模式。好的 Prompt 有四个要素：角色、任务、约束、示例。三种典型的 System Prompt 模式——转换型、结构化提取型、决策辅助型——覆盖了大多数 AI 编程场景。格式控制的核心原则是"解析器不能相信 Prompt"，兼容性防御比格式要求更值得投入。Token 预算是 AI 编程中唯一的硬约束——了解不同语言的 token 效率、合理设置批处理大小和 `max_tokens`，是保证程序稳定运行的前提。五个反模式（模糊需求、过度约束、一次太多、忽略 Temperature、不清理输出）是 Prompt 工程中的常见陷阱。

最重要的认知转变：**Prompt 不是对话艺术，是软件工程。** 当你把 System Prompt 当作 API 合约来设计、把解析器当作防御层来构建、把 token 预算当作资源限制来管理——你就不是在"和 AI 聊天"，而是在"用 AI 编程"。

下一章，我们将进入软件工程中最具挑战性的任务之一：在不引入新 Bug 的前提下，对现有代码库进行大规模重构。你会看到 Claude Code 如何帮助你在复杂重构中保持方向感。

---

*本章所有 Prompt 案例均来自 iTranslate 项目源码：`src/background/translator.ts`（翻译 Prompt + 解析器）、`src/background/dict-prompt.ts`（词典 Prompt + schema）、`src/shared/constants.ts`（默认 System Prompt）。*


\newpage

# 第 15 章 复杂重构策略

## 1. 本章目标

读完本章，你将掌握用 Claude Code 安全执行复杂重构的核心方法论。重构是软件工程中最具挑战性的任务之一——你要在不改变外部行为的前提下，改变代码的内部结构。这就像给一栋正在住人的房子换地基：每一步都必须精确，任何失误都会导致房子塌了。AI 编程降低了重构的门槛，但同时也引入了新的风险：AI 可能在你不注意的时候"顺便"改变了行为。本章给出了一个五步安全重构法，配合 iTranslate 项目的两个真实重构案例，让你既能享受 AI 加速重构的红利，又能规避它带来的陷阱。

---

## 2. 什么时候该重构

触发重构的信号有四个，任何一个出现时都值得认真考虑：

**信号 1：循环依赖。** A 文件 import B，B 又 import A。在 JavaScript/TypeScript 项目中，循环依赖不一定立即报错——ESM 的静态分析和循环引用处理机制让它"勉强能跑"。但它是一个明确的架构警告：A 和 B 的职责边界模糊了。你在写 iTranslate 的划词翻译时遇到了这个问题：`index.ts`（全页翻译入口）引入了 `selection.ts`（划词翻译），而 `selection.ts` 需要调用 `index.ts` 中的 `sendToBgWithRetry` 函数。不是语法错误，却是设计缺陷。

**信号 2：文件过长。** 一个文件超过 300-400 行，功能混杂。`extractor.ts` 在重构前是一个典型的"长了就长了"案例：它既负责遍历 DOM 树提取文本节点，又负责判断哪些文本是噪音、哪些值得翻译。两者功能不相关，但共享一个文件，因为"提取完顺便过滤一下"在最初写的时候感觉很自然。等你需要支持不同的过滤策略时，才会发现这个"顺便"带来的耦合。

**信号 3：修改一处要动多处。** 同样的逻辑在多个地方重复，改一个规则要同步改三个文件。在你给 `extractor.ts` 加新的过滤规则时，你在一个函数里改判断逻辑，在另一个函数里改跳过逻辑——两个地方本质上是同一件事，但没有共享代码。

**信号 4：测试难写。** 模块耦合太紧，mock 不过来。如果你发现为了测一个函数，你需要 mock 掉 chrome API、IndexedDB、DOM 树的三个层级、两个全局变量和一个 setInterval——这就是测试在向你喊"你耦合了"。

### "代码能跑就别动"的陷阱

"这代码虽然乱，但能跑，别动了，万一动坏了呢"——这是工程界流传最广、危害最大的迷思之一。

每次在烂代码上加新功能，都是在借高利贷。本金是你今天省下的重构时间，利息是下次修改时额外花费的理解成本。第一次加功能：多花 30 分钟理解奇怪的函数命名。第二次加功能：多花 1 小时搞明白为什么这个变量在三个地方被修改。第三次加功能：你不敢动原有逻辑，只能在外面再包一层 if-else，文件又胖了 50 行。利息复利增长，总有一天你会面对一个 1500 行的文件，里面没有一个同事（包括三个月前的你自己）能看得懂。

AI 编程的出现改变了这个等式的成本端。以前重构的瓶颈是"人类大脑能同时记住多少上下文"——你拆一个函数要手动追踪所有引用，改一个接口要手动更新所有调用方。现在，Claude Code 帮你记住上下文、帮你同步修改所有引用、帮你跑测试验证没搞坏任何东西。重构的时间成本从"半天"降到了"半小时"。**门槛降低了，你不应该继续借高利贷。**

---

## 3. 如何让 AI 安全重构

这是本章的核心——五步安全重构法。每一步都来自 iTranslate 开发中真金白银踩出来的经验。

### 第 1 步：先让 AI 读，再让它改

新手最容易犯的错误是一上来就下命令："把 `extractor.ts` 拆成两个文件"。这相当于让一个刚进公司的实习生直接动手——他不知道这个文件的来龙去脉、不知道哪些函数被谁调用、不知道改了会影响什么。

正确的节奏是三步走：**读 → 分析 → 改**。

第一步，让 CC 完整阅读目标文件及其所有引用：

```
请阅读 src/content/extractor.ts，分析：
1. 这个文件有哪些功能模块？它们之间的耦合关系是什么？
2. 哪些函数被哪些文件引用？
3. 如果要拆分，自然的边界在哪里？
先不要修改任何代码。
```

第二步，让 CC 提出拆分方案：

```
基于上面的分析，请提出一个拆分方案。列出：
- 哪些内容应该留在原文件
- 哪些内容应该移到新文件
- 新文件之间的依赖关系
- 哪些 import 路径需要更新
```

第三步，你批准后，CC 才动手执行。这个过程花 5 分钟，但省掉了"改了之后发现拆错了再回滚"的 30 分钟。

### 第 2 步：每次只动一个维度

这是最容易被忽视也最容易出问题的原则。假设你要做三件事：把 `extractor.ts` 拆成提取和过滤两层、把函数名从 `processBlock` 改成 `extractSegment`、把代码格式统一为 Prettier 风格。错误做法是让 CC 一次性完成——"把 extractor 重构一下"。结果 CC 同时动了模块拆分、命名、格式三个维度，你跑测试发现 12 个用例挂了，但你完全不知道是拆模块导致的、改名导致的、还是格式优化导致的（格式优化理论上不应该影响行为，但当 CC 同时动了三件事，什么都可能发生）。

正确做法是拆成三次独立的会话或 commit：

1. **先拆模块**（保持函数名不变、格式不变）——跑测试确认行为一致
2. **再优化命名**（只改函数/变量名，不改逻辑）——跑测试确认引用都正确更新
3. **最后调格式**（只跑 Prettier/ESLint auto-fix，不涉及逻辑）——跑测试确认无影响

每次 commit 后你只面对一个变量（"这次的改动做了什么"），出了问题可以精确回退到上一步。**重构是外科手术，不是推土机。**

### 第 3 步：以测试为安全网

重构的核心前提是：**你有办法证明"行为没有改变"。** 测试是唯一的客观证明方式。没有测试的重构不叫重构，叫赌博。

操作流程很简单：

- 重构前确认有测试覆盖你要动的模块。如果覆盖率不够，先让 CC 补测试："给 `extractRawSegments` 函数写一套单元测试，覆盖标题元素、跳过标签、隐藏元素、多段文本合并这几个场景。"
- 重构后立即跑全量测试：`npm test`。全部通过 → 行为没变。有挂掉的 → 行为变了，需要检查是测试本身需要更新（接口变了但行为对）还是行为真的被改错了。
- 如果项目还没有测试基础设施，重构的第一件事不是改代码，而是搭测试。"这个项目目前没有自动化测试，先帮我搭建 vitest 环境，然后为核心模块写一套冒烟测试。"

iTranslate 在 `extractor.ts` 重构时就享受了测试的红利。因为之前已经写了 `extractor.test.ts`（覆盖提取逻辑），重构后跑测试 19 个全绿——你才能自信地说"拆分没有改变翻译行为"。

### 第 4 步：小步 commit

每完成一步重构就 commit，这是五步法中最"反直觉"的一条——大多数人的习惯是"改完了再一起交"。但小步 commit 有三个好处：

**精确回退。** 做了三件事：拆模块（OK）→ 改函数名（测试挂了）→ 调格式（OK）。如果你是一次性提交的，你只能回退全部三步，丢失了拆模块和调格式的工作。如果是分步提交的，你只需要 `git revert` 改名那一步，其他两步保留。

**清晰的 commit 历史。** 六个月后你回来看 `git log`，看到 "extractor 拆分为提取与过滤两层" + "sendToBgWithRetry 提取至独立 retry.ts"——你知道每一步做了什么、为什么做。而不是看到一条 "重构翻译模块"——里面包含了 15 个文件的变更，你完全不知道为什么改了这些。

**Claude Code 也能利用 commit 边界。** CC 可以 diff 相邻 commit 来理解每一步做了什么，这对于后续的代码审查和问题排查都非常有用。

iTranslate 的实践：每次重构都是独立 commit，commit message 以 `refactor:` 前缀标记。回头看 git log 时，重构脉络一目了然。

### 第 5 步：区分"重构"和"顺便改需求"

重构 = 改变实现方式，不改变外部行为。在重构过程中顺手"优化一下逻辑"是最危险的冲动。

一个典型场景：你让 CC 把 `extractor.ts` 拆成两层。CC 在拆分过程中发现，"诶，这个隐藏元素的检测逻辑只检查了元素自身，没检查祖先链，我可以顺手补上"。如果 CC 顺手改了，两件事就混在了一起——模块拆分 + 行为变更。测试挂了的时候，你不知道是拆分出的问题还是"顺手优化"出的问题。

正确做法是告诉 CC："**只拆模块，不改逻辑。暂时保持现有的行为。** "把行为优化的想法记下来，作为一个独立的后续任务。"顺手"是人类工程师最容易犯的错误，AI 也不例外——而且 AI 更擅长"顺手"，因为它不会累、不会忘、能看到所有可以"顺便"的地方。

---

## 4. iTranslate 重构案例 1：extractor 拆分

### 初始状态

iTranslate 的 `extractor.ts` 一开始是一个典型的"功能蔓延"文件。它干了三件事：

1. 遍历 DOM 树，找到所有有文本内容的元素
2. 将这些文本按块级祖先（P/DIV/LI/H1-H6 等）分组
3. 用字符数阈值（中文 12 字、英文 20 字）过滤掉"不够长"的文本段

三件事混在一个文件里，函数之间共享全局的 `SKIP_TAGS`、`SKIP_CLASS_NAMES`、`NOISE_PATTERNS` 常量。当你想要调整过滤逻辑（比如把中文阈值从 12 降到 15），你得打开 `extractor.ts`——这个文件名告诉你"这里负责提取"，但你改的却是过滤规则。命名和职责已经偏离了。

### 问题信号

两个信号触发了这次重构：

**信号 1：修改过滤规则时要动 extractor。** 你想为中文内容做一个独立的过滤策略（中文短标题经常被 12 字阈值误杀），但 extractor 只有一个过滤函数 `isCJKBlock` 直接嵌在提取流程中。加新策略意味着在提取函数里塞更多的 if-else——或者你终于意识到"提取"和"过滤"应该分离。

**信号 2：你想支持可切换的过滤策略。** 不同的网站可能需要不同的过滤策略：新闻网站需要保留标题但过滤评论区，技术博客需要保留代码块但过滤导航栏。硬编码的一个过滤器无法满足这些需求。你需要一组可以注册、切换的过滤器——就像一个插件系统。

### CC 的分析过程

执行第 1 步（先读再改）时，你让 CC 分析了 `extractor.ts`：

```
分析 extractor.ts 的职责边界：
- 哪些逻辑是"从 DOM 提取文本"？
- 哪些逻辑是"判断文本是否值得翻译"？
- 它们的耦合点在哪里？
```

CC 的分析结论很清晰：

- `extractRawSegments()` 的逻辑（遍历 DOM、分组合并文本）是"纯提取"——它不关心文本是中文还是英文、是不是噪音、该不该翻译。它只负责把 DOM 变成数据结构。
- `isCJK`、`isCJKBlock`、`isNoiseText`、字符数阈值判断是"内容过滤"——它们关心文本内容的质量，但这与 DOM 结构无关。
- 两者的唯一耦合点是：过滤逻辑被直接调用于提取函数内部。如果把这个调用点替换为"调用外部过滤器"，两边就解耦了。

### 新架构

基于分析，CC 提出了策略模式方案：

1. 定义 `SegmentFilter` 接口——任何过滤器只需实现 `name` 和 `filter(segments)` 两个属性
2. `extractor.ts` 保留纯提取逻辑（`extractRawSegments()`），不再做内容过滤
3. 新建 `filters/` 目录，包含：
   - `types.ts`——`SegmentFilter` 接口和 `FilterResult`、`RawSegment` 类型
   - `registry.ts`——过滤器注册中心（`registerFilter`/`getActiveFilter`/`setActiveFilter`），纯内存 Map，零依赖
   - `structured-filter.ts`——新默认过滤器，祖先链检查 + 噪音过滤 + 标题豁免
   - `default-filter.ts`——旧字符数阈值逻辑，保留向后兼容
   - `index.ts`——barrel 入口，自动注册并激活默认过滤器
4. 原来的 `extractSegments()` 改为一行：`extractRawSegments()` + `getActiveFilter().filter()`

### 重构前后对比

**Before（extractor.ts 的过滤逻辑嵌在提取函数中）：**

```typescript
// extractor.ts — 重构前，提取+过滤混在一起
for (const seg of rawSegments) {
  if (isNoiseText(seg.text)) continue;
  const minChars = isCJKBlock(seg.text) ? 12 : 20;
  if (seg.text.length < minChars) continue;
  kept.push(seg);
}
```

**After（过滤逻辑移到独立的过滤器模块）：**

```typescript
// extractor.ts — 重构后，只做纯提取
export function extractRawSegments(root: Element = document.body): RawSegment[] {
  // 遍历 DOM，分组文本，产出 RawSegment[]
  // 不关心内容质量判断
}

// filters/index.ts — 独立的过滤层
export function extractSegments(): ExtractionResult {
  const rawSegments = extractRawSegments();
  const filter = getActiveFilter();  // 运行时选择过滤器
  const result = filter.filter(rawSegments);
  return toExtractionResult(result);
}
```

### 重构后的收益

- **extractor.ts 从 150+ 行减到 127 行**，而且去掉的全是 `isCJK`、`isCJKBlock`、`isNoiseText` 这些与"提取"二字无关的逻辑
- **新增过滤策略不需要改 extractor。** 你后来加了 `structured-filter`（祖先链检查 + 标题豁免）和 `default-filter`（保留旧逻辑），两个过滤器都实现了同一个 `SegmentFilter` 接口，通过 `registry.ts` 注册和切换——extractor.ts 一行都没动
- **测试可以独立测提取和过滤。** `extractor.test.ts` 测的是纯 DOM 提取行为，`structured-filter` 的测试用构造数据测过滤逻辑（不依赖真实 DOM）——两者解耦后测试也变简单了
- **第三方可以接入自定义过滤器。** `SegmentFilter` 是公开接口，理论上一个针对特定网站的过滤策略只需实现 20 行代码，注册后即可使用

---

## 5. iTranslate 重构案例 2：retry.ts 独立提取

### 初始状态

你在开发划词翻译功能（`selection.ts`）时遇到了一个循环依赖问题：

- `index.ts`（全页翻译入口）引入了 `selection.ts` 的 `enableSelection()` 和 `disableSelection()`
- `selection.ts` 需要调用 `sendToBgWithRetry()` 来向 Background 发送翻译请求
- 但 `sendToBgWithRetry()` 定义在 `index.ts` 中

于是依赖关系变成了：`index.ts` → `selection.ts` → `index.ts`。这是一个循环。ESM 的循环引用处理机制让代码"勉强能跑"，但这是靠运气——如果模块加载顺序变化、或者你用了 `const` 导出一个在循环引用的另一个模块还没初始化完的值，就会得到 `undefined`。

### CC 的解决方案

CC 识别出 `sendToBgWithRetry()` 的本质：它是一个**不依赖于 index.ts 业务逻辑的纯工具函数**。它的输入是一个 `message` 对象，输出是一个 Promise，全程只和 `chrome.runtime.sendMessage` 交互。它不属于全页翻译的业务逻辑，也不属于划词翻译的业务逻辑——它属于"通信基础设施"。

解决方案只有一步：**把共享的依赖提取到独立的模块中，两边都引用新模块。**

`retry.ts` 只有 16 行代码：

```typescript
export async function sendToBgWithRetry(message: unknown, retries = 3, delayMs = 600): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (err) {
      if (i === retries - 1) throw err;
      const msg = (err as Error).message;
      if (msg.includes('Receiving end does not exist') || msg.includes('Could not establish connection')) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}
```

**Before（循环依赖）：**

```
index.ts ←→ selection.ts
  (sendToBgWithRetry 在 index.ts,
   selection.ts 需要它)
```

**After（线性依赖）：**

```
         retry.ts
         (sendToBgWithRetry)
        /            \
       v              v
  index.ts      selection.ts
  (import retry)  (import retry)
```

### 关键教训

**循环依赖通常是职责不清的信号。** 当一个共享功能被放在了某个特定模块中，其他需要使用它的模块就只能反过来依赖这个模块。解决方案不是绕过循环依赖（比如动态 import、延迟引用），而是承认"这个功能不属于任何一个特定的业务模块"，把它提取到独立的基础设施层。

**三个检查——判断一个函数该不该提取：**

1. 它被超过一个模块使用吗？——是 → 该提取
2. 它的逻辑与当前文件的"主题"一致吗？——否 → 该提取（`index.ts` 的主题是全页翻译流程编排，不是消息重试）
3. 提取后原文件的代码行数变化合理吗？——`index.ts` 少了 16 行，多了 1 行 `import`，净减 15 行 → 合理

iTranslate 的 `retry.ts` 模块自创建后从未修改过——这恰恰是一个好的基础设施模块的标志：职责单一、接口稳定、零业务耦合。

---

## 6. AI 重构的常见陷阱

AI 的"强大"在重构场景中是一把双刃剑——它能快速理解代码结构、批量修改引用、同步更新测试，但它也可能在你没注意到的地方"顺手"做了一些你不想要的事。以下四个陷阱是你需要主动防范的。

### 陷阱 1：AI 偷偷改了行为

这是最常见也最危险的陷阱。你让 CC"把 `extractor.ts` 的过滤逻辑移到独立模块"，它照做了——但它顺便把一个函数的返回值从 `null` 改成了 `undefined`，因为"这样更符合 TypeScript 惯例"。下游代码用 `=== null` 做判断，结果所有条件都走错了分支。

**防御方法：** 重构完成后，明确问 CC："除了模块结构和 import 路径外，你有没有改变任何原本的逻辑？请逐条列出。"如果 CC 回答"没有"，你可以跑测试来验证。如果 CC 列出了一条你不同意的改动，让它在新的 commit 里改回来。

另一个防御措施是跑 `git diff` 仔细看具体改动。不要只看改了多少文件、多少行——人工扫一遍 diff，确认每一处改动都是预期内的。这个过程在人类重构中也是必要步骤，AI 重构同样不能省略。

### 陷阱 2：AI 引入过度抽象

CC 倾向于"设计完美的架构"。你让它拆分一个文件的职责，它可能给你设计一个六层抽象、三个设计模式、两个工厂函数——代码是"漂亮"了，但谁看得懂？你从"一个文件太长"的问题变成了"六个文件不知道从哪开始读"的问题。

**防御方法：** 明确告诉 CC 你的抽象边界。"只拆分现有代码，不要引入新的抽象层。不要用设计模式。拆出来的每个模块都要有单一明确的职责。"iTranslate 的 `filters/` 只有一个接口（`SegmentFilter`）和一个注册中心（`registry.ts`）——没有工厂模式、没有依赖注入、没有基类继承。简单就是最好的架构。

### 陷阱 3：AI 忘了更新所有引用

拆文件后 import 路径变了。CC 更新了大部分引用，但漏了一个少见的动态引用（比如 `chrome.scripting.executeScript` 注入的文件路径，或者在测试文件中的深层 mock 路径）。这个问题不是 CC 不认真——是在大型项目中，某些引用方式不在它的"视线范围"内。

**防御方法：** 每次重构后必须跑三个命令：

```bash
npx tsc --noEmit     # TypeScript 类型检查 — 漏掉的 import 会直接报错
npm test              # 全量测试 — 运行时不存在的模块会抛异常
npm run build         # 完整构建 — 确保构建工具能找到所有依赖
```

`tsc --noEmit` 是保底防线。任何 import 路径错误或类型不一致都会被 TypeScript 编译器捕获。如果你的项目不用 TypeScript，等价的检查是让测试和构建成功通过。

### 陷阱 4：AI 把测试也重构了

你只让 CC 重构源码，CC 顺手"优化"了测试文件——把测试的 mock 方式改了、把测试的断言风格统一了、把测试中的变量名也重构成了新的命名。结果你无法判断测试是通过是因为"行为没变"还是"测试和源码同步被改了"。

**防御方法：** 明确告诉 CC："不要动测试文件。只改源码。测试挂了是源码的问题，不是我改测试的理由。"如果测试因为接口变化而需要更新（比如你重命名了一个导出函数），那是合理的——但你仍然应该分步做：先重构源码确认行为不变 → 再单独更新测试以适配新接口。两个步骤，两个 commit。

---

## 7. 核心技巧

- **重构前先读，不要一上来就动手。** 让 CC 分析现状、提出方案、你批准后执行。三步走省掉回滚的时间。

- **每次只动一个维度。** 模块拆分、命名优化、格式调整分三次 commit。出了问题只回退一步，不丢失其他两步的工作。

- **测试是重构的安全网。** 没测试就补测试再重构，别裸奔。`npx tsc --noEmit` + `npm test` + `npm run build` 三重检查每次重构后都要跑。

- **循环依赖 = 共享逻辑放错了位置。** 提取共享部分到独立模块是最简单的解法，不要用动态 import 绕过——绕过等于承认"我有个设计问题但我不想改"。

- **重构 ≠ 改需求。** 明确告诉 CC"只改结构不改逻辑"。行为优化的想法记下来独立做。

- **拆完文件检查 CC 有没有偷偷改行为。** 问它"有没有改变任何逻辑" + 人工扫 `git diff`。

- **防过度抽象。** "只拆分现有代码，不要引入新的抽象层"——这句话能帮你拒绝掉 80% 的 AI 过度设计。

- **不受信任的模块才需要重试。** `retry.ts` 自创建后再没改过——好的基础设施模块就是改完就不再碰。

---

## 8. 小结

本章给出了用 Claude Code 安全重构的五步方法论：先读再改、每次只动一个维度、以测试为安全网、小步 commit、区分重构和改需求。两条核心原则贯穿全章：**AI 是你的加速器，但方向盘和刹车必须在你手里；重构的每一次 commit 都必须有可验证的"行为未变"证明。**

两个 iTranslate 的真实案例展示了这套方法论的实际效果：`extractor.ts` 的拆分将原本耦合的提取和过滤逻辑解耦为两层，新增过滤策略不再需要动提取代码；`retry.ts` 的提取将 16 行共享工具函数独立为基础设施模块，解开了 `index.ts` 和 `selection.ts` 之间的循环依赖。两个案例的共同点是：重构后的代码更短、职责更清、可测试性更好。

四个常见陷阱——AI 偷偷改行为、引入过度抽象、忘记更新引用、顺手重构测试——每一个都有明确的防御措施。这些陷阱的共同根因是：**AI 在完成任务之外倾向于"多做一点"**，而重构这种精密任务恰恰最怕"多做"。你的约束越精确，AI 的输出越安全。

下一章，我们将探索 AI 编程的最新前沿——多模型协作。你会看到如何用多个 AI 模型各司其职，把复杂任务拆解为并行执行的子任务。

---

*本章所有重构案例均来自 iTranslate 项目源码。extractor 拆分详见 commit `f5b63ee`（`refactor: extractor 拆分为提取与过滤两层`），retry 提取详见 commit `94b96c0`（`feat: 新增划词翻译气泡...sendToBgWithRetry 提取至独立 retry.ts 模块`）。重构后的代码结构请参考 `src/content/extractor.ts`（纯提取层）、`src/content/filters/`（过滤层）、`src/content/retry.ts`（通信基础设施层）。*


\newpage

# 第 16 章 多模型协作

## 1. 本章目标

读完本章，你将掌握 AI 编程中最高杠杆的技能——用多个模型分工协作，以远低于单模型全包的成本完成同等质量的工作。这不是"同时用好几个 AI"的技巧清单，而是从 iTranslate 项目双模型架构中提炼出的决策框架：什么任务交给便宜的模型跑量，什么任务留给贵的模型做深度推理，以及四种经过验证的多模型协作模式。学完这一章，你不会再问"我应该用哪个模型"——你会问"这个任务的哪个部分该用哪个模型"。

---

## 2. 为什么需要多模型

如果你只用一个模型，你得接受一个残酷的事实：**没有一个模型在所有维度上都最优。**

Claude 的推理能力、架构设计能力和代码审查质量在当前的 AI 编程工具中处于第一梯队。你让它分析一个跨文件的循环依赖、设计一个策略模式的接口体系、审查一段并发控制代码的竞态条件——它的输出质量普遍高于其他模型。但代价是贵。Claude Sonnet API 的价格大约在 $3/$15 每百万 token（输入/输出），对于一个日均数千次调用的翻译应用来说，这个价格会吃掉全部预算。

DeepSeek 是另一个极端。它的中文能力出色、API 价格极低（约 1 元/百万 token）、调用量大也不心疼。但在复杂推理任务上，它偶尔会让你感觉"差一口气"——定位 Bug 时能找到表面原因但挖不到根因、做架构设计时能给出方案但不会主动分析 tradeoff。

GPT-4 处在中间地带——生态最成熟、第三方集成最丰富，但价格中等、推理能力略逊于 Claude。本地模型（Ollama 等）则代表了免费这一端——零成本，但能力有限，适合隐私敏感场景的轻量任务。

多模型的本质不是"多一个选择"，而是**在正确的时间用正确的工具。** 没有人会用挖掘机来拧螺丝，也没有人会用螺丝刀来挖地基。同理，你不应该用 3 美元/百万 token 的模型来处理每天 3000 次批量翻译，也不应该用 1 元/百万 token 的模型来做你项目中最关键的架构决策。模型不是信仰，是工具。工具选对了是杠杆，选错了是浪费。

iTranslate 项目是这条原则的活证据。整个项目的开发中，Claude Code（Claude 引擎）负责架构设计、代码审查、复杂调试；翻译 API 调用走 DeepSeek，日均数千次翻译请求。两种模型各司其职，互不干扰。全项目从零到发布，API 总费用不到 30 美元。如果翻译也用 Claude API，这个数字至少翻 6 倍。

---

## 3. DeepSeek 做粗活

"粗活"在这里不是贬义——它指的是那些量大、重复、不需要高深度推理，但对成本和吞吐量敏感的任务。DeepSeek 在这些场景中的性价比无人能敌。

适合交给 DeepSeek 的任务有四个特征：

**第一，批量操作。** 一次翻译几十段文本、批量处理几千条数据、并发调用 API 处理队列任务。这些场景的核心瓶颈不是单次推理质量，而是"你愿不愿意为每一条数据支付 3 美分"。iTranslate 的翻译请求是典型——用户打开一个英文新闻页面，页面上可能有 30-80 个文本段需要翻译。DeepSeek 处理这 80 段文本的费用约 0.3 分钱，Claude API 同样的量大约要 15-20 分钱——50 倍的差距在单次调用中不明显，但乘以每天的几百次页面翻译、乘以每个月的几千次调用，差距就变成了几百美元。

**第二，格式转换。** JSON 转 Markdown、CSV 转 JSON、HTML 清洗为纯文本——这些任务规则性很强，不需要创造性推理。DeepSeek 做得又快又便宜。

**第三，文本提取。** 从 HTML 中提取纯文本并清理格式、从混排内容中分离中英文——iTranslate 虽然用 DOM 解析做了主要提取，但在 Prompt 调试阶段，你经常需要让 AI 解释"为什么这段文本提取出来是这个样子"。这些辅助性的文本分析用 DeepSeek 足够。

**第四，模板生成。** 生成样板代码、写文档草稿、创建测试用例骨架——这些任务"对错"的边界宽（你总会手动修改），不需要追求一次完美。DeepSeek 出初稿，人做精修，比 Claude 出完美稿的成本低一个数量级。

iTranslate 开发中的三个实际使用场景：

- **翻译请求的主力引擎。** 这是量最大、对成本最敏感的部分。翻译质量上，DeepSeek 的中英翻译在大多数日常文本（新闻、博客、技术文档）上表现稳定，偶尔的瑕疵用户几乎注意不到。
- **Prompt 调试的大量试跑。** 你在调翻译 Prompt 时，同样的 10 段文本要用不同的 System Prompt、Temperature、编号格式组合反复测试。如果每次测试都用 Claude API，一个下午的调试可能花掉 $10-15。用 DeepSeek，同样的测试量只需要几毛钱。
- **缓存预填充的批量翻译。** 一些高频查询的文本可以预先翻译并缓存到 IndexedDB 中，这个预填充过程可能涉及几百次 API 调用——用 DeepSeek 跑一晚上，总费用不到一块钱。

成本数字不会说谎。假设你的翻译应用每天处理 1000 次翻译请求（每个请求包含约 5 个文本段），一个月就是 150000 段。用 Claude API（约 $0.050/次），月费 $5000。用 DeepSeek（约 $0.004/次），月费 $400。省下的 $4600 足够支付全年的 Claude Code 订阅费，还够再买几本技术书。

关键是：用户感知不到差异。他们看到的是翻译结果，不是"这个结果来自哪个模型"。DeepSeek 的翻译质量和 Claude 的差异，在日常文本上小于 5%。为了这 5% 付 12 倍的价钱，在经济上不成立。

---

## 4. Claude 做精活

"精活"指的是那些"做对了价值巨大、做错了代价高昂"的任务。这些任务通常只发生几十次或几百次，但每一次的质量都直接影响整个项目的走向。Claude 的价值在这里。

适合交给 Claude 的任务也有四个特征：

**第一，架构设计。** 模块拆分、接口定义、设计模式选择。iTranslate 的 `filters/` 模块架构——策略模式 + 注册机制——是 Claude Code 分析现有代码后提出的方案。这个架构从设计到实现花了约半小时的对话，但它影响了后续所有的过滤策略迭代。如果当初随便拍脑袋做了一个耦合的方案，后续每次加新过滤器都会多花一倍的开发时间。一次好的架构决策抵过 100 次正确的代码生成。

**第二，代码审查。** 安全漏洞、性能瓶颈、逻辑错误——AI 做代码审查的优势在于不会疲劳、不会跳过"看起来简单"的代码、不会被"这段代码的作者是我自己"的偏见影响。你让 Claude Code 审查 iTranslate 的翻译管线代码，它发现了缓存键未包含目标语言导致切换语言后展示旧翻译的 Bug——这个问题藏了三个月，因为单语言使用时永远不会触发。

**第三，复杂调试。** 跨文件 trace 一个 Bug 的根因、分析 Service Worker 冷启动的竞态条件、排查为什么某个 DOM 元素在特定页面上被过滤器误杀。这些任务需要海量的上下文记忆和逐层推理——Claude 的 200K 上下文窗口和推理能力让它可以同时持有 5 个文件的代码、3 层调用栈、2 种可能的根因假设，在它们之间做交叉验证。你用 DeepSeek 做同样的调试，它可能找到第一个可能的原因就停下了，而那个原因恰好不是根因。

**第四，Prompt 设计。** 这是一个反直觉但极其实用的场景。Claude 理解自己的"思维方式"——它知道什么样的指令结构自己最容易遵循、什么样的约束措辞最有效、什么样的格式最容易稳定输出。让 Claude 帮你设计给 DeepSeek 用的 Prompt，效果往往好于你自己反复试错。iTranslate 的 `[N]` 编号方案、`no additional commentary` 的负向约束措辞、词典 JSON schema 的防御性设计——这些都是在 Claude Code 的对话中逐步打磨出来的。

核心原则只有一句话：**Claude 的时间花在"想清楚"上，不是"做得多"上。** 你不需要 Claude 帮你写第 47 个测试用例——DeepSeek 能做得一样好。但你需要 Claude 帮你判断"这个模块的测试策略应该是什么：单元测提取逻辑、构造数据测过滤逻辑、集成测测翻译全流程"。后者花 5 分钟，但决定了后续 50 个测试的方向和质量。

---

## 5. 实际成本对比

以下是 iTranslate 项目从零开发到 v1.2.14 发布过程中，基于实际调用量估算的成本数据。注意：这不是精确的计费账单，而是基于使用频率和 API 定价的合理估算。

| 模型 | 用途 | 用量（估算） | 费用 |
|------|------|-------------|------|
| Claude Sonnet（CC 引擎） | 架构设计、代码审查、复杂调试、Prompt 设计、CLAUDE.md 维护 | ~200 次有效对话 | ~$15-25 |
| DeepSeek V4（翻译 API） | 翻译请求、批量测试、Prompt 试跑、日常编码辅助 | ~3000+ 次调用 | ~15-25 元（~$2-3.5） |
| **合计** | | | **不到 $30** |

如果全用 Claude API 做同样的工作：

| 场景 | 全部用 Claude 的费用 |
|------|---------------------|
| 架构设计+审查+调试（不变） | ~$15-25 |
| 翻译请求+批量测试+日常编码（3000 次 × $0.05-0.08） | ~$150-250 |
| **合计** | **$165-275** |

**6 到 11 倍的差异。** 而且这只是一个个人开发者在做一个中等规模的项目。如果你的应用有 1000 个日活用户，每个用户每天翻译 5 个页面——翻译 API 调用量会从 3000 涨到 15 万次/月。省下的钱从几十美元变成几千美元。

选择模型的决策树不需要复杂：

```
这个任务是否需要深度推理？
├─ 是 → 用 Claude
│   （架构设计、代码审查、复杂调试、根因分析）
└─ 否 → 任务量大吗？
    ├─ 是 → 用 DeepSeek
    │   （批量翻译、数据处理、格式转换、测试生成）
    └─ 否 → 用便宜的就行
        （哪个方便用哪个，价格差异在少量调用时可忽略）
```

这个决策树只有两层判断——因为它本质上只区分一件事：**这次调用的价值是由质量驱动的还是由数量驱动的。** 质量驱动的用最好的模型，数量驱动的用最便宜的够用模型。中间地带（少量调用、非关键任务）选哪个都不会错。

---

## 6. 多模型协作的模式

单个模型的选用是决策问题，多个模型的协作是设计问题。以下是四种经过验证的协作模式，从简单到复杂排列。

### 模式 1：串行流水线

**结构：** 模型 A 先处理（粗加工）→ 模型 B 后处理（精修）。

**iTranslate 场景：** 复杂翻译任务中，先让 DeepSeek 翻译整篇文章，再让 Claude 检查关键段落（标题、摘要、专业术语密集的段落）并修正不准确的翻译。DeepSeek 承担 95% 的翻译量，Claude 只做 5% 的质量把关。

**适用条件：** 对质量有要求但全用贵的模型太奢侈。"质量把关"比"全量精加工"便宜一个数量级——检查一段翻译只需要读一次，但翻译一整篇文章需要生成同样多的 token。

**风险：** 如果第一步的输出质量太差，第二步的修正工作量可能超过从零开始做。串行流水线的前提是第一步的模型"基本够用"，第二步只做增量改进。

### 模式 2：并行取最优

**结构：** 同时发给模型 A 和模型 B → 人（或规则）选择更好的结果。

**适用场景：** 质量敏感的少量任务。比如你在设计一个新的 System Prompt——同一个输入给 Claude 和 DeepSeek，对比它们的输出差异，分析为什么一个比另一个好，然后把分析结论反馈到 Prompt 的下一版迭代中。

**代价：** 两次 API 调用换一次更好的结果。这个代价在"偶尔做一次"时完全可接受（多花几毛钱），在"批量做"时不划算。所以并行取最优只适用于调用量小的质量敏感任务，不适合翻译这种量大的场景。

### 模式 3：分工并行

**结构：** 不同模块用不同模型，各自独立运行，互不依赖对方的输出。

**iTranslate 的实际模式：** 你使用 Claude Code 做开发（Claude 引擎驱动编码、设计、调试），翻译 API 走 DeepSeek。两者不在同一条流水线上——CC 不会在运行时调用 DeepSeek API，DeepSeek 翻译的结果也不会反馈回 CC 的开发决策。它们是同一个项目中的两条独立轨道。

这是最自然、最常用的双模型使用方式。它的优势是零协调成本——两条轨道各自独立，不需要考虑"模型 A 的输出格式是否兼容模型 B 的输入"，不需要处理串行流水线中的错误传播，不需要判断并行取最优时的选择标准。你只需要在使用前做一次判断——"这次的任务属于哪条轨道"。

**广义应用：** 任何一个 AI 编程项目都可以套用这个模式——用 Claude Code（Claude 引擎）做开发，用 DeepSeek/GPT-4 做应用层 API 调用。开发成本和应用成本天然分离，各自用最优性价比的模型。

### 模式 4：本地 + 云端混合

**结构：** 本地模型（Ollama、LM Studio 等）处理隐私敏感数据，云端模型处理通用任务。

**适用场景：** 企业内网环境、合规要求严格的数据处理、包含用户 PII（个人可识别信息）的内容。本地模型虽然能力有限（即使是 Llama 3 70B 也不如云端中等模型），但数据不离开本机这一条就是无法替代的优势。

**代价：** 需要本地 GPU 或足够的内存。7B 模型需要约 6-8GB 显存/内存，70B 模型需要约 40GB。对于个人开发者来说，本地模型的性价比通常不如云端（电费 + 硬件折旧 > API 费用），但隐私合规场景中代价不是选择标准。

四种模式不是互斥的。一个成熟的 AI 应用可能同时使用模式 3（开发和应用分离）和模式 4（敏感数据走本地、通用数据走云端），在关键质量节点上偶尔启用模式 1（串行精修）或模式 2（并行对比）。关键是**不要让模式比问题更复杂**——如果你只需要两个模型各司其职，就不要设计一个四模型串并混联的架构。

---

## 7. 核心技巧

- **"贵的想、便宜的量"是多模型协作的第一性原理。** 每次调用前问自己：这次调用的价值是由深度推理驱动的，还是由吞吐量驱动的？前者用 Claude，后者用 DeepSeek。

- **翻译/批处理类应用的 API 调用永远用便宜模型。** 这些场景的量级会让价格差异放大到不可忽略的程度。50 倍的单价差异在日调用 100 次时只是几美元，在日调用 10000 次时变成了几百美元。

- **调试让 Claude 先分析、再动手。** 不要让它"帮我修这个 bug"，让它"分析这个 bug 的根因，列出三种可能的修复方案及各自的 tradeoff，等我确认后再动手"。这 3 分钟的提前分析避免了 30 分钟的试错修复。

- **Prompt 让 Claude 设计、便宜模型执行。** Claude 理解自己的"思维方式"，它在 Prompt 设计上的准确度高于人手动试错。设计好的 Prompt 发给 DeepSeek 用——设计成本只发生一次，执行成本的差距每天都在累积。

- **分工并行是 90% 场景的最优解。** 不需要复杂的串行流水线或并行对比——你只需要把任务在"开发"和"应用 API"之间做一次分类。分类错了代价很小（多花几毛钱），分类对了收益持续整个项目周期。

- **不用精确计算成本，知道量级就够了。** 你不需要记录每一次 API 调用的 token 消耗。你只需要知道：Claude Sonnet $3/$15 每百万 token、DeepSeek 约 1 元/百万 token——价格差约 50 倍。带着这个量级意识做模型选择，不会出大错。

- **本地模型只用于隐私场景，不要用于性能场景。** 如果数据不需要留在本地，云端便宜模型的性价比远高于本地模型（电费 + 硬件折旧 + 运维时间）。本地模型的正确使用理由是"数据不能离开"，不是"想省钱"。

---

## 8. 小结

本章给出了多模型协作的核心框架：**贵的模型做精活，便宜的模型做粗活。** 两个模型不是竞争关系，是分工关系。Claude 负责架构设计、代码审查、复杂调试和 Prompt 设计——这些任务量少但每一次都影响全局质量。DeepSeek 负责翻译请求、批量测试、格式转换和模板生成——这些任务量大但不需要深度推理。iTranslate 项目的真实数据证明，这种分工将总 API 费用控制在了不到 30 美元，而全用 Claude 的方案需要 165-275 美元——6 到 11 倍的差距。

四种协作模式——串行流水线、并行取最优、分工并行、本地云端混合——覆盖了从简单到复杂的多模型协作需求。其中分工并行是 90% 场景的最优解：用 Claude Code 做开发，用便宜模型做应用层 API 调用。两条轨道各自独立，零协调成本，模型选择不会互相干扰。

最重要的认知转变：**不要问"我应该用哪个模型"，要问"这个任务的哪个部分该用哪个模型"。** 当你开始按任务特征分配模型，而不是为整个项目选一个"主力模型"时，你就掌握了多模型协作的核心智慧。

下一章，我们将进入本书的实战终点——将 iTranslate 从本地开发推向生产发布的全流程：Chrome Web Store 审核、更新机制、用户反馈闭环和持续迭代策略。

---

*本章成本数据基于 iTranslate 项目 v1.2.14 前的实际使用情况估算。Claude Sonnet 定价参考 2025 年 Anthropic API、DeepSeek 定价参考 2025 年 DeepSeek 开放平台。翻译 API 调用量包含开发调试期间的 Prompt 试跑和缓存预填充。*


\newpage

# 第 17 章 实战踩坑 20 条

> **本章目标**：从 iTranslate 项目 200+ 次提交中提炼 20 个真实踩坑记录，覆盖 MV3 扩展特性、DOM 操作陷阱、翻译 API 边界、AI 编程协作和工程实践五大类别。读完本章，你不会再认为"AI 生成的代码跑起来就行"——你会知道哪些地方最容易出问题，以及怎么在问题变成灾难之前发现它。
> **预计字数**：5000-6000 字
> **状态**：初稿完成

---

## 1. 为什么需要一章"踩坑"

AI 编程的书通常有两种写法：一种只展示 AI 多强大——三句话生成一个模块、十分钟搭建一个应用；另一种只展示 AI 多不靠谱——幻觉、错误、循环修复。真实的 AI 编程体验在这两者之间：AI 帮你写出 80% 的代码，但剩下 20% 的坑需要你自己爬出来。

这一章的目的不是罗列"我遇到了多少 Bug"——那没有意义，因为你的项目遇到的问题会和我不一样。这一章的目的是让你看到**每一类坑的形态、根因和侦察方法**，这样当你在自己的项目中遇到类似模式时，你能更快地认出它、定位它、修好它。

20 条坑按类别组织，每条按"现象 -> 根因 -> 解法 -> 教训"四段展开。教训部分刻意做了通用化——它们不只是 iTranslate 的问题，是几乎所有 AI 编程项目都会遇到的共同问题。

---

## 2. 类别一：MV3 扩展特有的坑

### 坑 1：Service Worker 冷启动竞态

**现象：** Popup 打开后点击翻译，Content Script 发送消息给 Background，Chrome 控制台报 `Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist`。但有时又正常——同一个页面、同一个操作，一会儿成功一会儿失败。

**根因：** Manifest V3 的 Service Worker 在空闲约 30 秒后会被浏览器自动终止。当新消息到达时，SW 需要重新启动并注册 `chrome.runtime.onMessage` 监听器，而这个注册过程不是瞬间完成的——消息可能在监听器注册完成之前就已经到达并被丢弃。这不是 Bug，是 MV3 的设计特性（为了省资源），但它破坏了开发者对"后台始终运行"的基本假设。

**解法：** 在 Content Script 端实现带重试的消息发送——`sendToBgWithRetry()`（见 `src/content/retry.ts`）。对 "Receiving end does not exist" 和 "Could not establish connection" 两种连接类错误自动重试 3 次，间隔 600ms。600ms 这个数字来自实测：SW 冷启动通常需要 200-500ms，600ms 的间隔足以让绝大多数 SW 完成启动和监听器注册。注意只对连接错误重试，业务错误（如 4xx API 返回）不重试——重试也解决不了权限问题。

**教训：** MV3 的消息通信不是即时的。任何跨上下文的消息发送都需要考虑对方不在线的情况。这个模式不只是扩展开发的——微服务、分布式系统、任何"发送方和接收方独立生命周期"的场景都需要容错。600ms 这个经验值来自 Chrome，Edge 的 SW 启动速度可能不同，如果你的目标浏览器有差异，需要重新校准。

---

### 坑 2：Content Script 不能用 ESM

**现象：** 在 Content Script 中写了 `import { something } from './module'`，Chrome 注入时报 `Cannot use import statement outside a module`。但 Popup 和 Settings 页面中用同样的 import 写法完全正常。

**根因：** Popup 和 Settings 的 HTML 通过 `<script type="module" src="...">` 加载，这是 ESM 的标准方式。但按需注入的 Content Script 通过 `chrome.scripting.executeScript({ files: ['content.js'] })` 加载——这个 API 不支持 ES modules，它只能注入普通的 IIFE/传统脚本文件。这是 Chrome 扩展 API 的限制，不是 Vite 或 TypeScript 的问题。

**解法：** 为 Content Script 单独配置一份 Vite 构建——`vite.content.config.ts`，输出格式为 IIFE（`format: 'iife'`）。CSS 文件不能作为独立文件加载（`executeScript` 只能注入 JS），所以通过 Vite 的 `?inline` 后缀将 CSS 作为字符串导入到 JS 中，注入时动态创建 `<style>` 标签插入页面。代码和样式打包成一个 `content.js` 文件，一个 `executeScript` 调用全部注入。

**教训：** MV3 中 Content Script 有两套加载机制——`manifest.json` 声明式注册和 `scripting.executeScript` 按需注入。声明式加载支持 ESM、支持 CSS 文件、自动匹配 URL pattern。按需注入功能更灵活（权限最小化、按 tab 动态注入）但限制更多。在开始写 Content Script 之前，先想清楚你的内容脚本是"对所有页面都生效"还是"用户触发时才生效"——这个决定会影响构建配置、模块加载方式和调试体验。

---

### 坑 3：HTML 中不能用 Chrome i18n 占位符

**现象：** 在 Popup HTML 中写了 `__MSG_appName__` 这样的 Chrome 内置国际化占位符，在 `chrome://extensions` 加载后正常显示翻译文本，但在 `npm run dev` 启动的 Vite 开发服务器中永远显示原始的 `__MSG_appName__` 字符串。

**根因：** `crxjs/vite-plugin` 的开发服务器拦截了 HTML 请求，HTML 文件不经过 Chrome 扩展的 i18n 管线处理。`__MSG_*__` 占位符替换是 Chrome 扩展系统在加载扩展时做的——开发服务器绕过了这一步。所以同样的 HTML，在 `dist/` 目录下加载（绕过 Vite）显示正常，在 dev server 中不工作。

**解法：** 放弃 HTML 中的 `__MSG_*__` 占位符。所有 UI 文本在 TypeScript 初始化阶段通过 `chrome.i18n.getMessage()` 获取，用 JS 设置到 DOM 中。这在工程上多花了一点工作量（每个文本节点都需要一个 `document.getElementById().textContent = t('key')`），但彻底解决了工具链兼容性问题——`t()` 函数在任何环境下都能正常工作。

**教训：** 官方文档说的是"应该能工作"，工具链告诉你的才是"实际能不能工作"。在 AI 编程中，当你用了一个"非标准"的工具链（Vite + crxjs 而不是 Chrome 官方的 webpack 方案），很多文档中的假设就不再成立。依赖"大家都这么做"不如自己验证一次——特别是在涉及到构建工具和浏览器 API 交叉的灰色地带。这个教训在 AI 编程中尤为关键：AI 会基于文档给你正确的代码，但文档中没有写出来的兼容性问题，AI 也不知道。

---

### 坑 4：权限声明决定审核速度

**现象：** 初版扩展的 `manifest.json` 中规中矩地写了好几个权限——`tabs`、`activeTab`、`storage`、`scripting`、`host_permissions: ["<all_urls>"]`。功能都能跑，但第一次提交 Chrome Web Store 审核用了整整 4 天，中间还被打回了一次要求解释 `host_permissions` 的必要性。

**根因：** Chrome Web Store 的政策是：每一个权限声明都会触发额外的审核流程。`host_permissions` 尤其敏感——它意味着扩展可以读取用户访问的任何网页内容，审核员需要验证你不会滥用这个能力。你的扩展实际可能只用 `activeTab` 就够了（只在用户点击 popup 的那个 tab 上运行），但声明了 `host_permissions` 就会触发最严格的审查。

**解法：** 精简权限到三项：`storage`（保存设置）、`activeTab`（当前标签页操作）、`scripting`（注入内容脚本）。去掉 `host_permissions`，去掉 `tabs` 权限（`activeTab` 已经给了当前 tab 的操作权）。内容脚本从声明式注册改为按需注入——Popup 打开时通过 `chrome.scripting.executeScript` 动态注入，需要翻译时才注入，不需要时不注入。这次精简后，后续版本更新审核从未超过 24 小时。

**教训：** 权限设计不是技术问题，是审核策略问题。你的代码需要哪些 API 是一个维度，审核员认为你的哪些 API 是必要的、合理的、不过度的是另一个维度。两个维度都要满足。AI 生成的 `manifest.json` 通常会遵循"能跑就行"的原则——把所有可能用到的权限全加上。你需要反过来做减法：每去掉一个权限，你的审核速度和用户信任度都会提升。

---

## 3. 类别二：DOM 操作的坑

### 坑 5：offsetParent 的假阴性

**现象：** 某些页面上的文本块明明可见（眼睛能看到、截图能截到），但 `extractRawSegments()` 跳过了这些元素，日志显示 `Filtered: offsetParent is null`。

**根因：** `HTMLElement.offsetParent` 在以下几种情况下返回 `null`：(1) 元素设置了 `display: none`；(2) 元素设置了 `position: fixed`（fixed 定位的元素从文档流中脱离，其 offsetParent 为 null）；(3) 元素或祖先设置了 `display: contents`；(4) 元素尚未插入 DOM 树。extractor 用 `offsetParent === null` 来判断"元素不可见"，但 case 2 和 case 3 中的元素是可见的——这个判断有假阴性。在 jsdom 测试环境中更糟糕——jsdom 没有布局引擎，所有元素的 `offsetParent` 都是 null。

**解法：** 分层防御。extractor 层仍用 `offsetParent` 做快速筛选（筛掉绝大多数真正隐藏的元素，成本低），filter 层用更多维度的信息做精细判断。测试中用 `setup.ts` 全局 mock `Object.defineProperty(HTMLElement.prototype, 'offsetParent', { get: () => document.body })` 让所有元素通过 extractor 层的 offsetParent 检查。这不是完美的解决方案（`position:fixed` 的假阴性仍然存在），但在准确性和实现成本之间取得了平衡。

**教训：** 浏览器布局 API 的假阴性是写 DOM 代码时的经典陷阱。你的判断条件和浏览器的布局行为之间存在隐式假设，而这些假设在某些 CSS 组合下会失效。分层防御——快速筛选 + 精细判断——是处理这类问题的通用模式。不要为了消除所有假阴性而去重写一个 getComputedStyle 版本（性能成本不划算），接受"快速筛选有假阴性，但精细判断会纠正"的折衷。

---

### 坑 6：翻译克隆在定位容器中重叠

**现象：** 在 swiper 轮播标题区域和某些 flex 布局的新闻列表中，翻译元素和原文重叠在一起，两者都无法阅读。同样的代码在普通 `<p>` 标签区域完全正常。

**根因：** `renderer.ts` 的翻译策略是"在原文元素后面插入一个浅克隆兄弟节点"（`insertAdjacentElement('afterend', clone)`）。这个策略假设原文和翻译在正常的文档流中——afterend 插入的兄弟节点自然排在原文下方。但在 `position: absolute` 或 `position: fixed` 的容器中，兄弟节点的位置由定位属性决定，不再按文档流排列。更糟糕的是，某些 `display: flex` 容器中，新插入的兄弟节点会作为一个新的 flex item 和原文并排显示而非上下排列。

**解法：** 这是一个已知限制，目前没有完美的通用解法。针对特定场景可以做事后修复（检测容器定位模式、根据模式切换插入策略），但 CSS 布局的多样性意味着总会有新的组合让你的假设失效。在 CGTN 页面的 swiper 组件中，我们采用了针对性处理——检测特定已知的布局模式并适配插入位置。

**教训：** DOM 操作的通用方案在面对 CSS 布局多样性时总有边界。在 iTranslate 的语境下，"翻译元素插入原文之后"这个看似自然的需求，被一个简单的 CSS 属性就击穿了。知道自己的技术的局限边界，比假装它能解决一切问题更重要。这条坑教会我们：与其追求完美的通用性，不如做好"已知限制"的文档记录，当遇到新的场景时判断是否需要专项处理。

---

### 坑 7：hasSkippableAncestor 太激进

**现象：** whitehouse.gov 这样的政府网站，页面上有大量可翻译的文本内容，但 iTranslate 的提取结果是空的——`Extracted 0 blocks`。换成其他新闻网站（CNN、BBC）又一切正常工作。

**根因：** `structuredFilter` 中的 `hasSkippableAncestor()` 函数沿 DOM 祖先链向上检查——从当前元素一直到 `document.documentElement`（含 `<body>` 和 `<html>`），看是否有祖先元素的 class 或 id 命中了 `SKIP_CLASS_NAMES`（一个包含 `sidebar`、`footer`、`nav`、`comment` 等关键词的排除名单）。whitehouse.gov 的顶层容器 `<div class="wp-site-blocks">` 中的 `wp-` 前缀虽然没有命中 SKIP_CLASS_NAMES（`wp` 不是任何一个 skip 关键词），但在该站另一个版本中，`<body>` 标签上有一个 `page-id-xxx` 这样的 class，其中包含了某个与 `nav` 相近的模式。

实际上，当一个页面的大部分内容都被一个 `class="page-content"` 的顶层容器包裹时，如果某个 skip 关键词恰好出现在某个祖先的 class 名中（比如 `main-navigation-wrapper` 中含有 `nav`），整个页面内容都会被跳过。过滤器的"宁可错杀"策略在通用场景下是危险的——过滤器永远不知道某个 class 名是不是真正的 skip 标志。

**解法：** 引入诊断日志约定——所有从 extractor → filter → catchUpNewContent 链路上的判断都加 `🔎` 前缀（如 `🔎 Skipped: hit SKIP_CLASS_NAMES 'nav' at ancestor div.main-navigation`）。当用户报告"没有翻译内容"时，指导他们在页面控制台搜索 `🔎` 查看过滤原因，反馈给开发者调整过滤规则。同时加入了 `🌐` 前缀标记 Observer 触发及新增节点详情。

**教训：** 过滤器设计中最危险的是"隐式失败"——内容被过滤了，但没有任何人知道。用户看到空白页面，以为是功能坏了；开发者无法复现，以为是个别用户的问题。诊断日志不是可有可无的装饰，它是你和生产环境之间唯一的桥梁。每写一个 `if (shouldSkip) return` 之前，先问自己：当这个条件触发时，有人能知道它触发了吗？

---

### 坑 8：MutationObserver 观察到自己的 DOM 变更

**现象：** 翻译完成后，MutationObserver 的回调被自己的翻译 DOM 操作触发，导致重新提取和翻译已经翻译过的内容，形成"翻译 → 触发 Observer → 再次翻译 → 再次触发"的死循环。控制台日志疯狂滚动。

**根因：** `MutationObserver` 监听的是 DOM 树的变化——任何变化。它不区分"用户滚动页面加载了新内容"和"我们自己插入了翻译克隆元素"。当翻译逻辑在 Observer 的回调中运行时，每一次 `insertAdjacentElement`、`textContent` 赋值、class 名添加都会触发新的 mutation 记录。

**解法：** 翻译过程分为四个阶段：断开 Observer（`stopObserving()`） → 执行翻译操作 → 重新提取 Observer 离线期间新增的内容（`catchUpNewContent()`） → 重新连接 Observer（`startObserving()`）。Observer 在翻译期间完全离线，翻译产生的 DOM 变更不会触发它。翻译完成后，追扫（catch-up）补偿 Observer 离线期间加载的新内容——这是一个增量操作，只翻译新增的文本块。追扫完成后才重新连接 Observer，避免追扫产生的 DOM 变更触发新一轮翻译。

**教训：** 任何 DOM 监听都必须处理"自己触发了自己"的问题。这不是 DOM API 的 Bug，而是"观察者与被观察对象双向耦合"的系统性问题——你在改变一个你同时在监听的事物。解决方案是给"自己的操作"一个隔离窗口——断开监听、执行操作、追扫遗漏、重新监听。这四个阶段的先后顺序不能变、不能省。

---

### 坑 9：Edge 浏览器上 CSS 未注入

**现象：** 在 Edge 浏览器上，翻译过程中的占位动画点完全不可见。但在 Chrome 上同一个扩展、同一个页面，三点动画正常显示。debug 信息显示 `cssLoaded: false`。

**根因：** 翻译点使用的 `.itranslate-dot` CSS 规则通过 JS 动态创建 `<style>` 标签注入到页面中。在 Edge 的某些页面上（尤其是 CSP 限制严格的页面），动态创建的 `<style>` 标签没有成功注册到 `document.styleSheets` 中。CSS 规则虽然存在于 DOM 中的 `<style>` 元素文本内，但浏览器没有解析和应用这些规则。元素的 DOM 节点创建了、class 名也正确，但没有对应的样式规则生效——宽度 0、高度 0、背景色透明，视觉上完全看不到。

**解法：** 这是 Edge 内核的已知行为差异，目前仍在排查根本原因（CSP 策略、扩展注入上下文、还是 Edge 的 CSSOM 实现差异）。临时方案是在创建点时直接设置内联样式（`element.style.width = '6px'` 等）绕过外部样式表依赖。

**教训：** Chrome 和 Edge 虽然共享 Chromium 内核，但在扩展 API 的实现细节上存在差异——尤其是在 CSS 注入、CSP 处理和扩展上下文隔离方面。切勿假设"在 Chrome 上测试通过 = 在 Edge 上也能用"。最容易被忽视的差异不是 JavaScript API，而是渲染层面的行为——CSS 注入、样式计算、布局行为——这些是最难通过自动化测试发现的。

---

## 4. 类别三：翻译 API 的坑

### 坑 10：缓存 Key 不含目标语言

**现象：** 用户先将目标语言设置为"日语"翻译了一个页面。后来用户将目标语言切换为"法语"，重新翻译同一个页面——显示出来的翻译结果中，新出现的文本是法语，但那些和上次相同的文本段显示的仍然是日语。

**根因：** `segmentKey(text)` 函数（`src/background/cache.ts`）的缓存键生成公式只包含了三个因素：源文本的 djb2 hash + 源文本的字符长度 + 前缀（`seg_` 或 `dict_`）。目标语言不在公式中。当目标语言从日语切换到法语时，同样的源文本产生了同样的缓存键，`cacheGetBulk()` 找到了日语的旧翻译缓存，直接返回——新翻译请求根本没有发送到 API。

**解法：** 修改 `segmentKey(text, targetLang)` 签名，将目标语言作为后缀加入缓存键——`seg_<hash>_<len>_<targetLang>`（commit `91b37b8`）。同时为了向后兼容，旧的缓存条目（不含目标语言的）在查找时不会命中新的带语言后缀的 key，等于自然的缓存淘汰。

**教训：** 缓存键的设计要考虑所有会改变结果的维度。"相同的输入"不只取决于 source text——目标语言、翻译模式（翻译 vs 词典）、甚至 System Prompt 版本都可能改变输出。每当你往缓存键公式中加入一个新维度时，缓存命中率会下降，但缓存正确率会上升。这个 trade-off 的关键是：哪些维度的变化频率很高？目标语言变化频率低（大部分用户长期使用同一目标语言），维度加入后对命中率影响极小，但避免了灾难性的"展示错误语言"问题。

---

### 坑 11：DeepSeek V4 thinking 模式导致空返回

**现象：** 使用 DeepSeek V4 模型时，API 返回的状态码是 200、`choices` 数组不空、但 `choices[0].message.content` 是空字符串。请求"成功"了，但没有实际结果。

**根因：** DeepSeek V4 系列默认可能启用 thinking（思考）模式。在 thinking 模式下，模型的推理过程写入 `choices[0].message.reasoning_content` 字段，而 `content` 字段置空。对于编码或翻译这类需要实际输出的任务，一个只有 thinking 没有 content 的响应等于空返回。在 V3 时代，这个行为只出现在单独的 `deepseek-reasoner` 推理模型中；到了 V4，thinking 能力内建到所有模型，反而更容易在不经意间触发。

**解法：** 在 API 请求体中添加 `thinking: { type: 'disabled' }` 参数（`src/background/translator.ts`），明确关闭思考模式。对于 Claude Code 通过 CC-Switch 等工具连接 DeepSeek 的场景，CC-Switch 通常会自动处理这个参数。如果你手动编辑 settings.json，需要在请求体中显式添加此配置。

**教训：** API 兼容性不等于行为一致性。OpenAI 兼容的 API 让你用相同的请求格式调用不同的模型，但每个模型有自己的特有行为——thinking 模式、温度参数有效范围、tokenizer 差异。不要被"兼容"两个字误导——兼容的是协议格式，不是模型行为。当你换模型时，至少跑一轮完整的回归测试。

---

### 坑 12：429 限流重试策略

**现象：** 批量翻译 60 个文本段时，前 20 个成功、中间 20 个失败、后 20 个成功。失败的返回 `429 Too Many Requests`。简单的"失败就重试"策略让情况更糟——3 次重试等于 3 倍的请求量，更早触发限流。

**根因：** iTranslate 的翻译批处理使用 3 批并发（每批最多约 1500 token），3 个并发请求同时发出。对于一些限流策略较严的 API endpoint（尤其是免费或低价的 tier），3 个并发 + 每批较大的 token 量可能超出速率限制。简单的"重试 3 次"策略在遇到 429 时等于用更多请求轰炸一个已经限流的 API——雪上加霜。

**解法：** 区分错误类型的重试策略（`src/background/translator.ts` 的 `translateBatch()`）：429（限流）和 5xx（服务端错误）重试，4xx（客户端错误，如 401/403/400）不重试——重试也解决不了权限问题或格式错误。重试时加入指数退避（间隔逐渐加长），给服务端恢复时间。对 429 回应，不是"再试一次"而是"等一会儿再试"。

**教训：** 重试策略不是"失败了就重来"。有效的重试需要回答三个问题：(1) 这个错误重试能解决吗？(2) 重试不会让事情更糟吗？(3) 重试之间应该等多久？不同类型的错误有不同的答案。一个好的重试策略减少的是生产环境中最烦人的那类问题——不是"功能崩了"，而是"偶发性失败，有时候好有时候坏，排查不到原因"。

---

### 坑 13：DeepSeek 不遵循非中文目标语言指令

**现象：** 在 Popup 中选择目标语言为"日语"，System Prompt 和 User Prompt 都正确包含了 `English-to-Japanese` 指示，API 正常返回了结果，但输出的翻译是中文而非日语。日文目标语言的设置对翻译结果完全没有影响。

**根因：** DeepSeek 的某些模型（如 `deepseek-v4-flash`）对中文有极强的偏好。即使 Prompt 明确指示"目标语言是日语"，模型仍然倾向于用中文生成翻译。这不是 API 调用的 Bug——请求格式正确、参数正确、Prompt 语法正确——这是模型本身的训练数据倾斜导致的行为偏差。DeepSeek 的中文训练语料远多于其他语言，导致模型在"不知道该用什么语言"时默认回到中文。

**解法：** 两个方向：(a) 强化 System Prompt 中的语言约束——从 `translate to Japanese` 改为 `MUST output ONLY Japanese characters, NEVER output Chinese` 等更强的负向约束和正向量化要求；(b) 对于多语言目标是刚需的场景，换用多语言遵循度更好的模型（如 GPT-4o-mini、Claude Haiku），而非用语言能力本就不足的中文优化模型。

**教训：** 模型的"母语偏好"是隐藏得很深的一个坑。你不会想到一个号称支持多语言的模型在某些语言对上根本不工作——直到你测试它。API 文档说支持的语言列表和模型实际能输出的语言之间有不小的差距。如果你要用一个模型做多语言输出，至少要测试 3 种目标语言——包括一种和训练语料主要语言差异较大的语言。

---

### 坑 14：Temperature 0.1 不是 Temperature 0

**现象：** 同一个段落翻译两次，第一次返回"AI 编程正在改变软件开发的方式"、第二次返回"人工智能编程正在重塑软件开发模式"。语义都对，但措辞不同。用于缓存的翻译 key 匹配逻辑是精确文本对比，两次翻译产生了两个不同的缓存条目。

**根因：** Temperature 0.1 保留了极少量的随机性（约 10% 的概率偏离最高概率的 token）。这点随机性让翻译更自然、措辞更多样，但也意味着相同输入不保证相同输出。对于翻译这个场景，"自然度"通常比"确定性"更重要——用户不在意每次翻译是否逐字相同。

**解法：** trade-off 而不是 fix。翻译场景保持 0.1（自然度优先），结构化输出场景（如词典 JSON）使用 Temperature 0（确定性优先）。缓存命中的判断也从"原文翻译文本精确匹配"改为"原文 hash 匹配即视为缓存有效，不校验翻译文本内容"——翻译文本可能因 Temperature 略有不同但功能上等效。

**教训：** API 参数没有"绝对正确"的值——正确的值取决于具体场景的需求。Temperature 的选择本质上是"创造性 vs 确定性"的权衡。翻译需要少量创造性（避免机翻感），代码生成需要完全确定性（同样的输入必须产生同样的输出），创意写作需要较高创造性。不要在所有场景中使用同一个 Temperature 值，就像你不会用同一把螺丝刀拧所有的螺丝。

---

## 5. 类别四：AI 编程协作的坑

### 坑 15：AI 改了不在需求范围内的代码

**现象：** 你让 Claude Code "修复缓存键遗漏目标语言的 Bug"。它修了 Bug，但同时把 `router.ts` 中的变量命名从 `seg` 改成了 `segment`、把 for 循环重构成了 `map()` 调用、还删掉了一个它认为"无用"的 `tabId` 参数——这个参数实际上另有用途。

**根因：** Claude Code 的设计理念是"把代码写好"，这包括一致性和可读性的改进。但你作为一个开发者，要的是"修这个 Bug 并且只修这个 Bug"。你和 AI 的默认目标不一致——它的默认目标是"提升代码质量"（宽泛），你的当前目标是"解决特定问题"（精确）。当这两个目标冲突时，AI 更倾向于执行它自己的目标。

**解法：** 在 Prompt 中明确约束边界——"只修改 `segmentKey()` 函数签名和调用处，不改任何其他函数、不改命名、不改代码风格、不删除任何参数"。这些约束是 iTranslate 项目 `CLAUDE.md` 中铁律第 3 条和第 4 条的直接来源——"极简修改"和"专注问题"。负向约束（"不要做什么"）和正向指令（"要做什么"）同样重要。

**教训：** 给 AI 的指令中，"不要做什么"和"要做什么"同等重要。人的沟通中可以省略负向约束（默认别人知道边界），但 AI 的沟通不能省略（AI 不知道你不想要的改变是什么）。这里的教训是：你给 AI 的指令要像写代码一样精确——边界条件要显式声明，隐式假设要写出来。

---

### 坑 16：AI 的"自信错误"

**现象：** 你问 Claude Code "为什么 popup 打不开"，它分析了一段代码后告诉你"因为 manifest.json 中 content_scripts 的 matches 模式写错了，Chrome 的 URL pattern 不支持端口号通配符"。分析逻辑清晰、引用了 Chrome 文档的链接、给出了修改方案。你照做了——没修好。问题根本不在这里。

**根因：** AI 不"知道"自己不知道什么。当一个用户提出问题时，AI 的机制是"生成最合理、最连贯的回答"——不是"判断自己是否掌握足够的信息来回答"。置信度是语言模型的内在特征，不是它对外表达的准确度。它总是用自信的语气输出，不管它的回答是基于正确的推理还是基于看似合理但错误的推测。

**解法：** 对于关键决策，多问一句"你怎么确定这个诊断是正确的？有什么验证方法？"。AI 的验证建议（添加 console.log、检查 network 面板、看 manifest 的 parsed 版本）往往比它最初的诊断更可靠。如果 AI 给不出可以在代码层面验证的方法，说明它的诊断更多是推测而非推理。iTranslate 项目中形成的铁律第 1 条——"根因驱动，禁止猜测性修改"——就是针对这个问题的防御机制。

**教训：** AI 的自信程度和正确程度没有相关性。这是一个需要用经验去内化的认知——你第一次被 AI 自信地给出一个完全错误的分析时，会感到震惊；第十次时，你学会了验证。把 AI 的回答看作一个"有经验的同事给出的快速判断"——方向通常是对的，细节需要验证，绝对不要不经验证就直接执行。

---

### 坑 17：Spec 不写清楚 = AI 瞎猜

**现象：** 你对 Claude Code 说："给 iTranslate 加一个过滤功能，去掉页面上不需要翻译的内容，比如导航栏、页脚、侧边栏。"AI 设计了一个复杂的过滤系统——DOM 遍历 + 启发式规则 + 机器学习分类的 hybrid 方案。代码几百行，但实际效果很差——很多正文被误过滤。

**根因：** "去掉不需要翻译的内容"是一个模糊的需求。什么算"不需要翻译"？长度阈值是多少？标题要不要过滤？短文本（如 "Read More"）要不要过滤？作者名、时间戳、分类标签呢？你心里有一个模糊的边界，但你没有写给 AI。AI 填充了所有你没有明确说明的模糊地带——用自己的假设，而这些假设可能完全偏离你的实际需求。

**解法：** 先写 Spec 再写代码。Spec 不需要长，但必须回答几个关键问题：这个东西要解决什么问题？具体要做什么？不要做什么？边界在哪里？怎么验证它做对了？iTranslate 的 filter v2 模块花了 30 分钟写设计文档（`docs/superpowers/plans/2026-05-23-filter-v2-plan.md`），定义了策略模式 + 注册机制的架构、`SegmentFilter` 接口、两个内建实现和测试策略。设计文档写完后，实现只需要 1 小时。

**教训：** 给 AI 写的需求文档和给人写的一样重要——甚至更重要。人会对模糊的需求提出问题、澄清边界；AI 不会提问，它只会填充。你在需求阶段省下的 5 分钟，会在实现和返工阶段变成 50 分钟。模糊的需求产生错误的代码，这句话在你和 AI 协作时比在你和人类同事协作时更残酷。

---

### 坑 18：三轮止损原则

**现象：** Service Worker 冷启动竞态问题，第一轮修了"加 try-catch 包裹 sendMessage"——没用，错误仍然抛出。第二轮修了"在 catch 中 setTimeout 重试"——部分修复，但 SW 启动慢的时候仍然失败。第三轮修了"增加重试次数到 10 次"——依然有偶发失败。三轮修改都没能彻底解决。

**根因：** 前三轮修复都在"让发送方更努力"这个思路上打转——增加重试次数、延长重试间隔、加错误处理。但问题的根因不在发送方——根因在接收方的监听器注册时序。真正的解决方向是"确保消息发送时接收方已就绪"，而不是"发送方更努力地反复尝试"。前三轮的思路惯性阻碍了对根因的重新分析。

**解法：** 三轮修不好 → 停下来 → 回到问题原点 → 从第一性原理重新分析。这个原则（CLAUDE.md 铁律第 2 条）是 iTranslate 项目中最重要的流程纪律。第四轮的分析从"Content Script 重试"转到了"Popup 注入流程"——在 `ensureContentScript()` 中，注入后不是直接发送消息，而是先 ping 5 次确认内容脚本的监听器已就绪，再发送真正的业务消息。这个改动只影响了 Popup 的注入流程，但彻底解决了竞态问题。

**教训：** AI 辅助开发最大的陷阱是"快速试错"变成"快速瞎试"。AI 能帮你快速实现一个方案（30 秒写出重试逻辑），这个速度让人产生错觉——"方案不对没事，反正很快就能换个方案"。但每次换方向都在原地打转，三轮下来花的时间和一个基于根因分析的精准修复一样多，但前者走到了终点，后者还在起跑线附近。速度不能替代思考。

---

## 6. 类别五：工程实践的坑

### 坑 19：版本号不统一

**现象：** `package.json` 中版本号是 `1.2.13`，`manifest.json` 中是 `1.2.12`，Chrome Web Store 上发布的版本是 `1.2.14`。三个地方三个版本号，调试用户报告时无法确定他们用的是哪个版本。

**根因：** 手动同步三个版本号源。（1）`package.json` 用 `npm version` 管理，（2）`manifest.json` 手动编辑，（3）Chrome Web Store 发布时手动填写。三个同步点是三个独立的手动操作——不同步的概率不是"会不会"的问题，是"什么时候"的问题。

**解法：** `package.json` 作为唯一版本源（SSoT - Single Source of Truth）。`manifest.json` 源码中版本号写为占位符 `0.0.0`，Vite 构建时由 `@crxjs/vite-plugin` 从 `package.json` 读取并注入。构建脚本（`npm run build`）和发布脚本（`npm run release`）自动保持三者一致——`release` 脚本 bump(z+1) → build → 生成 zip 文件名包含版本号。任何版本的构建产物中，`manifest.json` 和 `package.json` 的版本号自动一致。

**教训：** 版本号的"真理源"只能有一个。任何需要手动同步的多源真理系统，最终都会不同步。这个教训不限于版本号——API endpoint、默认配置、i18n key 列表——任何有多个副本的信息都适用。工程上把真理源精简到最少，然后用构建工具保证派生副本的一致性。

---

### 坑 20：Content Script 不能用网页开发的思维

**现象：** 用 React 的组件化思维写 Content Script——引入 JSX、组件状态管理、虚拟 DOM diff——运行时出现各种奇怪的错误：`createRoot is not defined`、`Cannot read properties of undefined`、以及更诡异的"某些页面上工作、某些页面上完全不运行"。

**根因：** Content Script 运行在页面的"隔离世界"（isolated world）中。它有自己独立的 JavaScript 执行环境——和页面共享 DOM 但不共享 JS 全局对象。这意味着：(1) Content Script 不能使用页面加载的 JS 库（如页面上已有的 React、jQuery）；(2) Content Script 受到页面 CSP（Content Security Policy）的限制——某些页面的 CSP 可能禁止 inline script 或 dynamic code evaluation；(3) Content Script 的 DOM 操作直接影响页面——你添加的元素、样式会影响页面的布局。

**解法：** Content Script 保持轻量和原生。用原生 DOM API（`document.createElement`、`insertAdjacentElement`）而非框架。UI 框架（React/Vue）只用于 Popup 和 Settings 页面——这些是扩展自己的页面，有完全的控制权。Content Script 的职责只有三个：提取文本、发送翻译请求、渲染翻译结果——不需要状态管理、不需要组件树、不需要路由。

**教训：** 浏览器扩展有自己的一套约束体系，不能用网页开发的经验直接套。隔离世界、CSP、注入机制、生命周期管理——这些概念在网页开发中不存在。在开始写 Content Script 之前，先花半小时阅读 Chrome 扩展官方文档中的 "Content Scripts" 和 "Isolated Worlds" 章节。这半小时能避免你沿着错误的架构方向走上三天。

---

## 7. 核心技巧

从 20 条坑中提炼出 5 条最关键的通用原则——它们适用于任何 AI 编程项目，不只是扩展开发：

- **失败要可见。** 翻译被静默过滤、错误被 try-catch 吞掉、缓存返回了错误语言——这些 Bug 的共同特征是"错误发生了，但没有人知道"。诊断日志、错误上报、条件分支的 assert 日志——让失败可见是减少生产环境 Bug 的性价比最高的投资。

- **假设显式化。** offsetParent 对 fixed 元素返回 null、afterend 在绝对定位容器中重叠、Temperature 0.1 不保证确定性——每个 Bug 后面都有一个你没有写出来的假设。把关键假设写进代码注释、写进测试、写进文档。写下来的假设，时间会帮你验证。

- **权限和复杂度只加不减。** 加了 host_permissions 的权限审核慢了 4 天、加了复杂过滤架构的代码返工了两次。在 AI 可以快速生成代码的时代，最大的成本不再是"实现功能"，而是"维护你不该加的功能"和"处理你不该声明的权限"。

- **根因驱动的修复。** 三轮重试没有解决的问题，一次对时序的分析解决了。AI 给你的第一个方案通常对症（治标），但很少对根。在动手修改之前，多花 2 分钟问自己：这个问题为什么会发生？是什么条件让它出现？

- **负向约束和对错一样重要。** "不要改命名"、"不要重构"、"不要删参数"——这些约束不会让 AI 变得弱智，它们让 AI 的输出符合你当前的需求。给 AI 写 Prompt 时，试试把你的请求分成两部分：50% 的篇幅写"做什么"，50% 的篇幅写"不要做什么"。

---

## 8. 小结

> **本章要点**
> - MV3 扩展的四个特有坑——SW 冷启动竞态、ESM 不支持、i18n 占位符兼容性、权限审核——都源于"扩展 API 的行为和直观预期不一致"
> - DOM 操作的五个坑——offsetParent 假阴性、定位重叠、过滤器激进度、Observer 自触发、Edge CSS 注入——体现了"浏览器布局行为的复杂性和浏览器间差异"
> - AI 编程协作的四个坑——范围溢出、自信错误、Spec 缺失、三轮止损——是 AI 辅助开发的流程纪律问题，不是技术问题
> - 翻译 API 的五个坑——缓存键、推理模型、限流、语言遵循、Temperature——揭示了"API 兼容性不等于行为一致性"
> - 工程实践的两个坑——版本号多源、Content Script 思维错位——是最容易避免但最影响长期的
> - 五条核心原则（失败可见、假设显式、减负优先、根因驱动、负向约束）是这 20 条坑的元教训——它们适用于任何 AI 编程项目

---

*本章内容基于 iTranslate 项目 (v1.0.0 - v1.2.14) 的实际开发过程。所有坑都对应具体的 commit 和源代码文件。部分坑（如 offsetParent 假阴性、翻译克隆重叠）是已知限制，仍在持续优化中。Edge CSS 注入问题是当前正在排查的活跃 issue。*


\newpage

