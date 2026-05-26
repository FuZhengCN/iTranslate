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
