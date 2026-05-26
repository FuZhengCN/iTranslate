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
| macOS / Linux | 同上；如果遇到权限错误，加 `sudo`：`sudo npm install -g @anthropic-ai/claude-code` |

> ⚠️ **macOS / Linux 注意**：如果之前用 `sudo` 装过其他全局 npm 包，直接用 `npm install -g` 可能报 `EACCES` 权限错误。加上 `sudo` 即可解决。Windows 用户（在 Git Bash 中）通常不会遇到这个问题。

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

1. 从 GitHub 下载安装：[github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)（选择对应平台的最新版本）
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

解决：在 API 请求中显式添加 `"thinking": { "type": "disabled" }` 关闭思考模式。大多数 OpenAI 兼容的配置方式允许在请求体中追加参数；如果 `/config` 面板不支持，可以在 settings.json 中通过 `extraBody` 或类似字段注入。后续通常的翻译或编码任务不需要 thinking 模式，关掉反而更快更稳定。

**坑 5：Windows 终端问题**

如果你按 2.1 节的建议用了 Git Bash，这个坑你不会遇到。如果你坚持用 CMD 或 PowerShell：Unicode 字符可能出现乱码（特别是 Claude Code 返回中文时），且本书所有命令语法都不兼容。

解决：回到 2.1 节，装 Git Bash。VS Code 用户可以直接在 VS Code 内置终端中选择 Git Bash（`Ctrl+`` ` 打开终端，点击右上角下拉菜单选择 "Git Bash"）。

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
> - 配置 Claude Code 用 DeepSeek：推荐用 CC-Switch 图形化工具一键切换；进阶用户可手动编辑 settings.json（Base URL: `https://api.deepseek.com/anthropic`，认证类型: `ANTHROPIC_AUTH_TOKEN`）。
> - 第一条指令不只是"生成代码"——体验 CC 的完整工作流：理解需求 → 设计方案 → 实现 → 验证。
> - 三个关键配置文件：CLAUDE.md（项目指令）、settings.json（全局/项目设置）、权限管理（安全机制）。
> - 五个常见坑：Node 版本低 → 升级；网络代理 → 设 `HTTPS_PROXY`；Key 不生效 → 检查冲突；V4 thinking 空返回 → 关闭 thinking；Windows 终端 → 用 Git Bash。
> - 核心原则：先跑通再优化，默认配置够用，不要一开始就折腾高级配置。

---
