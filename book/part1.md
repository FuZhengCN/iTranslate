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

上面聊的是理论，下面是实践。iTranslate 是我在业余时间用 Claude Code + DeepSeek 写的一个 Chrome 翻译扩展——一个纯粹的 AI Coding 练手项目。我的本职是软件技术经理，有移动端 App 全平台开发经验，但 Chrome 扩展开发是一个我不熟悉的领域，正好用来测试 AI 工具在陌生技术栈中的表现：

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

需要说明的是，iTranslate 在功能丰富度上远不如市场上成熟的翻译扩展（如沉浸式翻译、沙拉查词等）。它的价值不在于产品本身，而在于证明了：即使在一个你不熟悉的技术领域，AI 工具也能帮你快速跨越入门门槛，在短时间内完成从第一行代码到商店上架的完整闭环。

---

## 1.5 本书的学习路径

本书围绕 iTranslate 项目的开发过程展开，分为三个部分：

**Part 1（入门篇，第 1-3 章）**：从为什么选这个工具组合开始，到环境搭建、Claude Code 核心操作。读完 Part 1，你就能独立使用 Claude Code 做开发了。

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

Slash Commands 是 Claude Code 的"快捷键"。它们以 `/` 开头，在对话中直接输入，告诉 CC 执行某个内置操作。如果不使用这些命令，你需要用自然语言反复描述同样的意图——比如"请帮我清理一下上下文"或"帮我看看当前这个修改有什么问题"——而 Slash Commands 让你一句话搞定。

以下是最常用的几个命令：

**`/help`** — 查看帮助和可用命令列表。刚上手时记不住所有命令很正常，输 `/help` 就能看到完整清单。在你第一次打开 CC 时，它也会主动提示你用这个命令。

**`/clear`** — 清除当前对话历史，开始新话题。当你聊完一个功能、准备转向下一个完全不同的任务时，用 `/clear` 清空上下文，避免旧对话干扰新任务。这相当于"重启一局"，token 从头算起。

**`/compact`** — 压缩上下文。当对话越来越长、token 消耗越来越大时，`/compact` 会让 CC 把之前的对话内容总结压缩，释放出可用的 token 空间。它和 `/clear` 的区别在于：`/compact` 保留了之前的"记忆"（以摘要形式），而 `/clear` 是全部丢弃。对话很长但你又不想丢掉前面的讨论时，用 `/compact`。

**`/config`** — 打开配置界面。你可以在这里修改主题、模型、权限等设置。比如你默认用的是 DeepSeek 模型，临时想切到 Claude 模型处理一个复杂推理任务，`/config` 里一键切换，不用退出 CC。

**`/review`** — 请求 CC 审查当前代码变更。相当于让 CC 扮演 Code Reviewer，检查你（或它自己）刚写的代码有没有问题。在 iTranslate 开发中，每次功能完成后我都会跑一次 `/review`，让 CC 从正确性、可读性、安全性几个维度过一遍，经常能发现我忽略的边缘情况。

**`/cost`** — 查看当前会话的 token 使用量和费用。这是个很实用的"账单"命令。用 DeepSeek 的时候费用极低，你可能不太在意，但如果切到了 Claude 模型，时不时看一眼 `/cost` 能帮你控制开销。

**`/init`** — 初始化项目的 `CLAUDE.md` 文件。这是项目的"说明书"，CC 每次启动时会自动读取它来了解项目结构、构建命令、编码规范等。在新项目中使用 CC 的第一件事，就应该是 `/init`。iTranslate 项目根目录下的 `CLAUDE.md` 就是这样生成的——它告诉 CC 这是什么项目、怎么 build、怎么跑测试、有什么铁律。

**`/status`** — 查看当前会话状态，包括已加载的文件、活跃的 Agent 等。当你不确定 CC 当前"看到"了什么时，用 `/status` 快速检查。

核心观点：Slash Commands 解决的是"重复描述"的问题。用熟了之后，你会发现很多高频操作都不需要写长句子了，一个 `/` 就搞定。

---

## 3. Agents 机制

Agent 是 Claude Code 中一个非常重要的概念。简单说，一个 Agent 就是一个**独立的 Claude Code 实例**，拥有自己的上下文窗口，可以在后台并行运行，不会和你的主会话互相干扰。

你可以把 Agent 想象成你派出去的"分身"——你给它一个任务，它自己去找文件、读代码、做修改，做完回来报告结果。在这个过程中，你的主对话窗口不受影响，可以继续干别的事情。

CC 内置了几种 Agent 类型，各自擅长不同的工作：

**Explore Agent** — 专门用于搜索和探索代码库。当你需要"找到所有调用 `translateBatch` 的地方"或"看看 `structuredFilter` 的逻辑是怎么串起来的"时，Explore Agent 比你自己手动 grep 高效得多。它会系统性地搜索多个文件和模式，然后给你一个结构化的结果。在 iTranslate 项目中，我曾经让 Explore Agent 帮我找出所有可能触发"翻译内容被二次翻译"问题的代码路径，它在不到一分钟内就完成了跨 6 个文件的搜索，而我手动做要花不少时间。

**Plan Agent** — 专门用于设计方案。当你有一个模糊的需求，需要把它拆成可执行的步骤时，Plan Agent 能帮你理清思路。比如 iTranslate 要做"词典功能支持多语言对扩展"时，Plan Agent 分析了现有的硬编码英文→中文逻辑，给出了一个配置驱动的注册表方案，包括需要改哪些文件、加哪些接口、向后兼容怎么处理。

**General-purpose Agent** — 通用 Agent，什么都能干，适合执行具体的实现任务。当你说"帮我把这个函数加上错误处理"或"重构这段代码"时，CC 默认就是用通用 Agent 在干活。

**子代理并行**是 Agent 机制最实用的场景之一。你可以同时派多个 Agent 出去干活——比如一个改 content script 的提取逻辑，另一个同时改 background 的缓存策略，两个互不依赖、互不阻塞。在 iTranslate 开发中，我就经常这样用：一边让 Agent A 修改 popup 的 UI，一边让 Agent B 优化 background 的翻译批处理，两边同时推进，不用等一个做完再开始另一个。

**Agent 的隔离性**是关键。每个 Agent 有自己独立的上下文窗口，Agent A 读的文件、做的修改不会污染 Agent B 的上下文。这意味着你不会遇到"聊着聊着 CC 把两个任务的上下文搞混了"的情况。不过这也意味着你需要给每个 Agent 足够清晰的任务描述——它看不到你和其他 Agent 的对话。

一句话总结使用原则：需要跨文件搜索 → Explore Agent；需要出方案 → Plan Agent；需要动手干活 → General-purpose Agent；需要同时推进多个独立任务 → 并行子代理。

---

## 4. Skills 系统

Skills 是 Claude Code 中一个重要的机制。简单说，一个 Skill 就是一个**可复用的指令集**，它定义了"遇到某类任务时该怎么做"。它不是一句话的 prompt，而是一套完整的工作流。

**触发方式有两种：**

1. **显式调用** — 你输入 `/<skill-name>`，CC 加载对应的指令集并严格遵循。
2. **自动匹配** — CC 会根据你的任务描述自动判断应该用哪个 Skill，然后主动加载它。比如你说"这个 bug 帮我修一下"，CC 可能会自动加载调试类 Skill，先让你复述现象、收集日志、缩小范围，再动手改代码。

**Skills 和普通 Prompt 的本质区别：** 你说"帮我审查一下代码"，CC 会按自己的理解去审。但你加载了审查类 Skill，它就会启用一套预定义的审查标准——检查什么、用什么维度、输出什么格式——这些都是提前固化好的最佳实践。Skills 把"资深开发者的肌肉记忆"变成了可复用的指令集。

**Skills 的好处：**
- **固化最佳实践**："修 Bug 前先写复现测试"、"改完代码跑一遍类型检查"——这些纪律靠人记容易忘，靠 Skill 强制执行。
- **团队共享**：如果你的团队都用同一个 Skill 做 code review，所有人的代码都会被同一套标准检查，不会出现"张三审得严、李四审得松"。
- **新人上手快**：新人不需要知道"怎么做测试驱动开发"，只需要加载 TDD Skill，它会一步步引导。

**怎么看 Skill 的内容？** 当 CC 调用某个 Skill 时，它会在对话中展示 Skill 的完整内容——包括每一步做什么、检查什么条件、输出什么格式。你不需要盲信它，可以直接看到它的"说明书"。建议第一次用某个 Skill 时，花一分钟读一下它的内容，理解它的工作流，这样以后用起来更有把握。

**Skill 从哪来？** Skill 不是 CC 自带的，而是由**插件**提供的。一个插件通常包含一组相关 Skill。CC 的插件生态中有几十个插件、上百个 Skill，初学者很容易陷入"选择困难"。

### 推荐的插件组合

我的建议是**从最少开始**——只用两个插件：

| 插件 | 提供什么 |
|------|---------|
| **superpowers** | 核心工作流：brainstorming（需求澄清）、tdd（测试驱动开发）、debugging（系统化调试）、code-review（代码审查）、writing-plans（任务规划） |
| **agent-skills** | 专业审查代理：code-reviewer（五轴审查）、test-engineer（测试策略）、security-auditor（安全审计） |

**superpowers** 是你每天都会用的主力插件。**agent-skills** 在关键节点调用——代码写完后派一个 code-reviewer 代理做独立审查，比你自己一个个检查更系统。

还有一个可选的锦上添花：**claude-hud**（`jarrodwatts/claude-hud`），在终端底部显示一个状态栏，展示当前会话的 token 用量、模型、Agent 状态等信息。不是必需品，但能让你的工作状态一目了然。

安装方式因插件而异——有的通过 `claude plugins install` 命令，有的从 GitHub 仓库安装，有的本地目录加载。具体安装步骤参考各插件的官方文档，版本和安装方式可能变化，本书不做时效性强的操作指南。

**不需要贪多。** 上面这两个插件覆盖了"需求澄清 → 方案设计 → 编码实现 → 测试验证 → 代码审查"的完整链路。iTranslate 项目的整个开发过程和本书的写作过程，用的就是这套组合，没有更多。

装好插件后，以下是日常开发中 Skill 的实际使用顺序：

| 阶段 | 用什么 | 干什么 |
|------|--------|--------|
| 需求模糊 | `/brainstorming` | 把模糊想法挖清楚，确定做什么 |
| 需求明确 | `/writing-plans` | 产出可执行的任务清单 |
| 开始编码 | `/tdd` | 先写测试 → 看到失败 → 写实现 → 看到通过 |
| 遇到 Bug | `/debugging` | 复现 → 缩小范围 → 定位根因 → 修复 → 验证 |
| 交付前 | `/code-review` | 五轴审查：正确性、可读性、架构、安全、性能 |

这些 Skill 不是 CC 自带的，都来自 superpowers 插件。如果你跳过了上面的安装步骤，这些命令不会生效。

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

- **每次提交前自动跑测试**：配置一个 hook，在 git commit 之前自动执行 `npm test`，测试不通过就阻止提交。这是一个常见的质量保障模式，适合多人协作或对代码质量有要求的项目。

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

1. **先 `/init` 再干活** — 新项目的第一件事。`CLAUDE.md` 是 CC 的"眼睛"，没有它，CC 每次都要重新探索项目结构，效率低且容易出错。一开始不需要写得很完整——先写几行（技术栈、常用命令），后续遇到"这个问题跟 CC 解释过很多遍"时再往里加。

2. **善用 `/compact` 而非 `/clear`** — 对话太长时用 `/compact` 保留记忆，而不是 `/clear` 全部丢弃。除非你确实要切换到完全不相关的任务，否则保留了上下文的 CC 会更"懂你"。

3. **并行 Agent 拆分独立任务** — 当你手头有两个互不依赖的任务（比如改 UI 和优化算法），不要让 CC 串行做。明确告诉它："这两个任务没有依赖，请并行处理"。或者用 `/subagent-driven-development` 自动拆成并行子任务。

4. **盲信 Skill 和盲信代码一样危险** — Skill 会展示它的完整指令，读一遍理解它的工作流，你才能判断它做对了还是跑偏了。Skill 不是"一键搞定"的魔法，你仍然是最终决策者。

5. **Hooks 只配真正高频的重复操作** — 刚上手时不要急着配 Hooks。先用一两周，记录下"每次都手动做一遍"的操作，再挑频率最高的 1-2 个配置自动化。少即是多。

---

## 8. 小结

- **Slash Commands** 是 CC 的快捷键，解决"重复描述"问题——`/help`、`/clear`、`/compact`、`/config`、`/review`、`/cost`、`/init`、`/status` 是最常用的 8 个。
- **Agents** 是独立的 CC 实例，有隔离的上下文——Explore 负责搜索，Plan 负责设计方案，General-purpose 负责实现。并行 Agent 可以同时推进多个独立任务。
- **Skills** 是可复用的专业工作流——通过 `/<name>` 显式调用或 CC 自动匹配。推荐从 superpowers + agent-skills 两个插件起步（覆盖需求→编码→审查全链路），不要贪多。
- **Hooks** 是事件驱动的自动化——在特定时机（文件修改后、会话开始时、提交前）自动执行命令。初学者不需要立刻配置，等熟悉了再逐步优化。
- **日常工作流**：描述需求 → CC 探索 → CC 提案 → 审阅 → CC 实现 → 验证 → 反馈修正。你的角色从"码字的"变成了"审稿的"。
- **核心原则**：小步快跑、先读后改、验证闭环。AI 是副驾驶，方向盘永远在你手里。
