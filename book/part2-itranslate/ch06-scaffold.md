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

- **manifest.json 是扩展的身份证**：`manifest_version: 3` 声明时代，`permissions` 只写三个（storage、activeTab、scripting），不声明 `host_permissions`——这是 iTranslate 审核一次通过的关键。
- **Vite + crxjs 把脚手架简化到 13 行配置**：自动版本号注入、HMR 热更新、多上下文构建差异封装。源码 manifest 版本号写 `0.0.0` 占位。
- **四个执行上下文是完全隔离的沙箱**：Background（Service Worker，随时休眠）、Content Script（页面 DOM，按需注入）、Popup（点击弹窗，即开即毁）、Settings（独立标签页）。它们之间唯一的通信方式是 `chrome.runtime.sendMessage`。
- **Content Script 必须构建为 IIFE**：`executeScript` 不支持 ESM。用独立的 `vite.content.config.ts` 打包，`emptyOutDir: false` 避免覆盖主构建产物。CSS 通过 `?inline` 内联为字符串。
- **脚手架阶段保持极简**：CC 生成的初始文件不超过 30 行，只做骨架不写业务逻辑。

> 下一章：第 7 章「翻译引擎：Prompt 设计」——从 API 调通到写出第一个能产出合格翻译的 System Prompt。
