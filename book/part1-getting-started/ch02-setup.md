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

输出的版本号需要是 `v18.x.x` 或更高。如果还没有装 Node.js，去 [nodejs.org](https://nodejs.org) 下载 LTS 版本（目前是 v22），一路 Next 安装即可。安装完成后重新打开终端让 PATH 生效。

> ⚠️ **注意**：不要用某些"一键安装包"或系统自带的古老版本。Node 版本过低会导致 `@anthropic-ai/claude-code` 安装失败，错误信息通常是 `unsupported engine` 或语法报错。这是第 2.7 节"常见坑"里排名第一的问题。

**Git**

```bash
git --version
```

任何 2.x 版本都可以。Claude Code 依赖 Git 来追踪文件变更、生成 commit message、创建分支。如果你还没有装 Git，去 [git-scm.com](https://git-scm.com) 下载安装。

**终端基本操作**

你需要知道怎么打开终端、怎么运行 `npm` 命令、怎么用 `cd` 切换目录。本书不要求你是命令行高手，但 `cd`、`ls`（Windows 上是 `dir`）、`npm install` 这几个操作需要会。

**代码编辑器**

VS Code 推荐但不是必须。Claude Code 本身在终端里运行，不需要 IDE 插件。不过你肯定会需要编辑器来查看和手动修改 Claude Code 生成的代码，VS Code 是目前最主流的选择。第 2.7 节会讲到 Windows 用户终端选择的注意事项。

---

## 2.2 安装 Claude Code CLI（~600 字）

Claude Code 通过 npm 全局安装，一行命令搞定：

```bash
npm install -g @anthropic-ai/claude-code
```

安装过程大概 30 秒到 1 分钟，取决于网络速度。如果遇到权限错误（macOS/Linux 上常见），在前面加 `sudo`：

```bash
sudo npm install -g @anthropic-ai/claude-code
```

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

Claude Code 每天提供约 **5 万 token 的免费额度**，使用 Anthropic 自己的模型（Claude Sonnet）。这个额度足够日常学习和小型项目使用。所以，**你可以先不配任何 API Key，直接用免费额度体验 Claude Code 的能力**。等免费额度不够用了，或者你想切到 DeepSeek 省钱，再按第 2.4 节的步骤配置。

> ⚠️ **建议**：安装完后先跑一个 `claude`，随便说一句"你好，帮我写一个 Hello World 的 HTML 页面"，感受一下交互流程。不要急着配 DeepSeek——先搞清楚 CC 本身怎么用，再优化成本。

---

## 2.3 获取 DeepSeek API Key（~500 字）

虽然 Claude Code 自带免费额度，但如果你想把后端模型切成 DeepSeek（成本降低 10 倍以上），需要先搞到一个 DeepSeek API Key。整个过程 5 分钟搞定。

**第一步：访问官网**

打开 [platform.deepseek.com](https://platform.deepseek.com)，点击右上角"注册"。支持手机号或邮箱注册，按提示完成验证即可。

**第二步：充值**

登录后进入"费用中心"或"充值"页面。DeepSeek 支持支付宝和微信支付，最低充值金额通常是 **¥10**。

这里要强调一个关键点：**充值 ¥10-20 就够用很久，不必充大额。** DeepSeek V3 的定价约 ¥2/百万输入 token + ¥8/百万输出 token。翻译几万字，成本也就几分钱。我在写 iTranslate 项目的整个开发过程中（194 次 commit，大量翻译测试），DeepSeek API 总共花了不到 ¥25。如果你只是学习和日常编码，¥10 可能够用一两个月。

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

## 2.4 配置 Claude Code 使用 DeepSeek（~500 字）

Claude Code 支持自定义 API endpoint，这意味着你可以把它的后端从 Anthropic 换成任何兼容 OpenAI 接口的服务——DeepSeek 正好完全兼容。

配置方式有两种，推荐第一种（更直观）。

**方式一：通过 `/config` 命令**

在 Claude Code 交互界面中，输入：

```
/config
```

这会打开一个配置面板，你可以设置以下关键项：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| API Base URL | `https://api.deepseek.com/v1` | DeepSeek 的 API 地址 |
| API Key | `sk-xxxxxxxx` | 你的 DeepSeek API Key |
| Model | `deepseek-chat` | DeepSeek V3 的模型 ID |

你也可以在 `/config` 中把模型设成 `deepseek-reasoner`（DeepSeek R1，推理模型），适合复杂的架构设计和逻辑推理任务。日常编码用 `deepseek-chat` 就够了，速度快且便宜。

**方式二：编辑 settings.json**

如果你更习惯直接编辑配置文件，Claude Code 的设置存储在 `~/.claude/settings.json`（全局）或项目的 `.claude/settings.json`（项目级）。在 `~/.claude/settings.json` 中添加：

```json
{
  "apiKeyHelper": "",
  "env": {
    "ANTHROPIC_API_KEY": "sk-your-deepseek-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/v1"
  },
  "model": "deepseek-chat"
}
```

两个方式效果一样，选你顺手的。

**验证配置**

配置完后，在 Claude Code 中输入一条简单指令测试连通性：

```
请用 JavaScript 写一个函数，接收一个字符串，返回它的反转。只输出代码，不解释。
```

如果 Claude Code 正常返回了代码，说明 DeepSeek 后端已连通。如果报错（通常是网络或 Key 格式问题），跳到第 2.7 节排查。

> ⚠️ **切换模型注意**：`/config` 中切换模型后，后续所有的交互都走新的模型。如果你同时有 Claude API Key 和 DeepSeek Key，可以根据任务类型切换——复杂架构用 Claude，日常编码用 DeepSeek。这是第 1 章讲过的双模型分工策略在操作层面的落地。

---

## 2.5 第一条指令（~600 字）

现在环境全部就绪，我们来跑第一条真正的 AI 编程指令。这一节的目的是让你**感受 Claude Code 的完整工作流**，不只是"它能生成代码"——而是它如何理解需求、设计方案、实现、验证。

**准备一个空目录**

```bash
mkdir ~/cc-test
cd ~/cc-test
```

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

Claude Code 不会直接扔给你一段代码。通常它会经历以下步骤：

1. **需求确认**：它可能会先问你几个澄清问题，比如"字符数是否包含换行符？"、"输出格式有偏好吗？"。这说明它在理解需求，不是在猜。

2. **方案设计**：确认需求后，它会给出一个简要的方案：用什么 API（`fs.readdirSync` + `fs.readFileSync`）、怎么遍历文件、怎么格式化输出。你可以在这一步提出修改意见。

3. **生成代码**：方案确认后，它会在你的工作目录中创建文件，写出完整代码。代码通常包含错误处理（比如文件不存在、权限问题）、合理的变量命名、清晰的注释。

4. **主动建议验证**：代码写完后，Claude Code 通常会主动建议你运行它看看效果，甚至会帮你创建测试用的 `.txt` 文件。这是它和 Copilot 最大的区别——**Copilot 只给代码，Claude Code 帮你验证代码对不对**。

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

CLAUDE.md 放在项目根目录，CC 会自动发现。有了它，你不需要每次对话都重复项目背景。**这是 Claude Code 最被低估但最重要配置文件，没有之一。**

**settings.json**

分两级：`~/.claude/settings.json`（全局生效）和 `.claude/settings.json`（项目级，覆盖全局）。主要配置：

- **权限**：哪些命令 CC 可以直接执行，哪些需要每次询问
- **Hooks**：在特定事件触发时自动执行脚本（如每次提交前跑 lint）
- **模型配置**：API endpoint、Key、模型名称（第 2.4 节已讲）

**建议**：初学者先不改 `settings.json`。默认配置已经足够好，等用到第二周再回来看哪些需要调。

**权限管理**

默认情况下，Claude Code 执行任何文件操作或系统命令前都会询问你的许可。这是一个安全机制，防止它在你不注意的时候做危险操作。你可以在 settings 中把安全的命令（如 `npm test`、`git status`）加入允许列表，减少确认次数。但**不建议把危险命令（如 `rm -rf`、`git push --force`）加入允许列表**。

---

## 2.7 常见坑（~300 字）

以下是初学者最容易遇到的四个问题。如果你按本章步骤操作时碰到异常，先来这里排查。

**坑 1：Node.js 版本过低**

错误表现：`npm install -g @anthropic-ai/claude-code` 时出现 `unsupported engine` 或一堆语法错误。

解决：`node --version` 确认版本 ≥ 18。如果版本不够，用 nvm（Node Version Manager）或去官网下载最新 LTS。

**坑 2：网络代理导致连接失败**

如果你用了代理（科学上网工具），Claude Code 可能无法正常连接 API。错误表现：`fetch failed`、`ECONNREFUSED`、超时。

解决：在终端中设置 `HTTPS_PROXY` 环境变量指向你的代理地址，例如：

```bash
export HTTPS_PROXY=http://127.0.0.1:7890
```

或者如果你用的是 Clash/ClashX，一般是 `http://127.0.0.1:7890`。

**坑 3：DeepSeek API Key 配置后不生效**

错误表现：配置了 DeepSeek 的 base URL 和 key，但 CC 仍走 Anthropic。

排查：确认 key 不在 shell 环境变量中冲突。`echo $ANTHROPIC_API_KEY` 检查是否有旧值。优先使用 `/config` 命令配置，它会覆盖环境变量。同时确认 base URL 末尾有 `/v1`（完整地址：`https://api.deepseek.com/v1`）。

**坑 4：Windows 终端问题**

Windows 的 CMD 和 PowerShell 在处理 Unicode 字符时可能出现乱码，特别是 Claude Code 返回中文内容时。

解决：建议使用 **Git Bash**（安装 Git 时自带）或 **WSL2**。Git Bash 对 Unicode 的支持好于 CMD，而且是 Unix 风格命令行，和本书所有命令一致。如果你用 VS Code，直接打开 VS Code 内置终端（`Ctrl+`` `），它也支持 Git Bash。

---

## 核心技巧

- **先用免费额度再配 Key**：Claude Code 每天 5 万 token 免费额度足够学习使用。先搞清楚工具怎么用，再优化成本。不要一上来就配 DeepSeek——你在省钱之前得先知道钱花在哪里。
- **CLAUDE.md 是第一优先级**：花 5 分钟在项目根目录写一个 CLAUDE.md，后续每一次和 CC 对话都能省下大量重复的背景解释。这是投入产出比最高的配置操作。
- **充值 ¥10 就够**：DeepSeek 极其便宜，不要一上来就充几百。¥10 能用一两个月，用完再充。省下的钱比你想象的多。
- **善用 `/config` 命令**：不要死记硬背 settings.json 的字段名。`/config` 命令提供了交互式配置界面，所见即所得，配错了也容易改回来。
- **终端选对省十年**：Windows 用户用 Git Bash 或 WSL2，不要用 CMD。macOS/Linux 用户用系统自带终端就很好。

---

## 小结

> 💡 **本章要点**
> - 三个前提：Node.js 18+、Git 2.x+、终端基本操作。缺一不可，检查命令：`node --version`、`git --version`。
> - 安装 Claude Code：`npm install -g @anthropic-ai/claude-code`，首次运行 `claude` 完成 OAuth 认证。
> - 每天 5 万 token 免费额度，可以先不配 API Key 直接上手体验。
> - DeepSeek API Key 获取：platform.deepseek.com 注册 → 充值 ¥10-20 → 创建 Key → 复制保存。Key 只显示一次。
> - 配置 Claude Code 用 DeepSeek：`/config` 命令设置 Base URL (`https://api.deepseek.com/v1`)、API Key、模型 (`deepseek-chat`)。
> - 第一条指令不只是"生成代码"——体验 CC 的完整工作流：理解需求 → 设计方案 → 实现 → 验证。
> - 三个关键配置文件：CLAUDE.md（项目指令）、settings.json（全局/项目设置）、权限管理（安全机制）。
> - 四个常见坑：Node 版本低 → 升级；网络代理 → 设 `HTTPS_PROXY`；Key 不生效 → 检查冲突；Windows 终端 → 用 Git Bash。
> - 核心原则：先跑通再优化，默认配置够用，不要一开始就折腾高级配置。

---
