# 第 6 章 脚手架：Manifest V3 扩展

**本章目标**：读完本章，你将理解 Claude Code 自动生成的 Manifest V3 扩展脚手架中每个文件的来龙去脉——manifest.json 为什么只有三个权限、Vite + crxjs 的构建原理、四个执行上下文的隔离机制，以及 Content Script 为什么必须单独构建为 IIFE 格式。

**预计字数**：约4000字

**状态**：✅ 初稿完成

## 6.1 把项目描述丢给 CC

搭建脚手架的过程很简单——告诉 CC 你要什么，它生成全部文件。我当时的输入是：

> "我要做一个 Chrome Manifest V3 扩展，用 Vite + TypeScript。帮我初始化项目结构。"

几分钟后，CC 生成了一套完整的文件。下面这张 manifest.json 就是它产出的核心配置（为了展示清晰，这里只保留关键字段）：

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

CC 生成的这份配置中有几个关键决策值得拆开来看：

- `manifest_version: 3`：CC 直接选了 V3，没有问。这是正确的默认选择——V2 即将被 Chrome 废弃，新项目选 V2 等于给自己埋后续重构的坑。
- `permissions`：**只有三个**——`storage`（保存设置）、`activeTab`（获取当前标签页）、`scripting`（动态注入脚本）。CC 没有加 `host_permissions`，这是我最感激它的一个决定——后面会详细说为什么这在审核和用户信任上至关重要。
- `background.service_worker` 指向 TypeScript 源码路径而不是编译产物——crxjs 在构建时会自动处理路径映射，CC 选择 crxjs 的时候就顺便解决了这个问题。
- `version: "0.0.0"`：这是一个占位符。真正的版本号在 `package.json` 里，构建时 crxjs 会自动注入。

**为什么只有三个权限？**

大多数 Chrome 翻译扩展在 manifest 中声明 `<all_urls>` 或 `host_permissions`，意味着它们可以读取用户访问的任何网页。CC 没有加这个权限，而是在后面的内容脚本方案中选择了"按需注入"策略——用户点击翻译按钮时才向当前页面注入脚本，页面关闭后脚本自然消失。回过头看，这个决策带来了三个实际好处：

1. **Chrome Web Store 审核更快**：广泛主机权限需要更长的审核周期和详细的隐私说明。只声明三项基础权限的扩展审核通常几天内完成。
2. **按需注入更干净**：Content Script 不随页面自动加载，只有用户主动触发翻译的页面才有脚本注入，对用户隐私的影响是"点对点"的。
3. **安装时不弹高危警告**：用户不会看到"此扩展可以读取和修改您在所有网站上的数据"，对于一款需要用户输入 API Key 的扩展来说，这直接决定了安装转化率。

代价是实现复杂度更高——注入检测、按需注入、注入确认这套机制需要额外写，但这个代价后续章节会看到是值得的。

---

## 6.2 Vite + crxjs：CC 的构建选型

CC 选了 Vite + `@crxjs/vite-plugin` 作为构建方案。它生成的 `vite.config.ts` 只有几行：

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

核心逻辑：`crx()` 插件展开源码 `manifest.json` 的所有字段，然后用 `package.json` 的 `version` 覆盖 `0.0.0` 占位符。这意味着你永远不需要手动同步版本号——`npm run release` 自动递增构建号后，产物的 manifest 自动跟上。

为什么选 crxjs？它的价值在三个维度：

1. **自动处理 manifest**：版本号注入、TS 源码到编译产物的路径映射、权限声明合并，全自动完成。手动维护 manifest 是 Chrome 扩展开发中最容易出错的环节，crxjs 直接消灭了这个环节。
2. **HMR 热更新**：`npm run dev` 后修改 Popup 的 TS 文件，保存，浏览器里的扩展弹窗直接更新，不需要手动刷新。这个体验差距在 UI 迭代时非常大。
3. **区分构建上下文**：Background（Service Worker）、Content Script、Popup 是三套不同的运行时环境，构建需求不同。crxjs 把差异封装在内部，我只需要关注业务代码。

**两种加载方式也是 CC 直接告诉我的：**

- 开发时：`npm run dev` → Chrome `chrome://extensions` → "加载已解压的扩展程序" → 选择**项目根目录**（不是 `dist/`）
- 生产时：`npm run build` → 产出 `dist/` → Chrome 加载 `dist/`

---

## 6.3 四个独立的执行上下文

CC 生成的文件结构是这样的：

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

四个独立入口不是设计偏好，而是 Chrome MV3 的架构强制要求。MV3 把扩展拆成了互相隔离的沙箱：

- **Service Worker**（Background）：没有 DOM 访问权，可随时被浏览器休眠。空闲约 30 秒后终止，下次有消息时重新唤醒。不能在 Background 里维护全局状态，不能用 `setTimeout` 做长时间操作。每次唤醒都是"干净"的环境。
- **Content Script**：运行在页面上下文中，有完整 DOM 访问权。和页面 JS 在隔离世界（isolated world）中运行——变量不共享，互不污染。生命周期随页面：注入时激活，页面关闭时销毁。
- **Popup**：点击工具栏图标时创建，点击其他区域时销毁。每次打开都是全新实例，状态不保留。
- **Settings**：独立标签页，用户配置完就关，生命周期短。

这四个沙箱之间唯一的通信方式是 `chrome.runtime.sendMessage`。Background 不能操作 DOM，Content Script 不持有 API Key 和缓存——敏感数据存在 Background 的 IndexedDB 里，Content Script 只负责把文本发给 Background、把翻译结果渲染到页面上。

初始代码量极少——每个入口文件基本上就是一个空的骨架。后面的模块（router、extractor、renderer、translator）都是在各自功能开发时才拆出来的，CC 没有在脚手架阶段做过度设计。

---

## 6.4 IIFE：Content Script 的特殊构建

这个坑是我在项目开发到一半时才发现的。`chrome.scripting.executeScript` 用来动态注入 Content Script，但它有一个关键限制：**不支持 ESM 的 `import`/`export` 语法**。如果直接把含有 `import` 语句的 TypeScript 编译产物丢给 `executeScript`，运行时会报错。

CC 在脚手架阶段就预判了这个问题。它额外生成了一个独立的 `vite.content.config.ts`，把 Content Script 构建为 IIFE 格式——所有依赖内联到一个文件里，用一层函数包裹，不产生任何模块边界：

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

几个关键决策都是 CC 做的：

- `formats: ['iife']`：输出 IIFE，不做代码分割，所有东西在一个自执行函数里。
- `emptyOutDir: false`：不能清空 `dist/`——主构建已经把 popup、background、settings 的产物放进去了，这个辅助构建只是往 `dist/assets/` 追加一个 `content.js`。
- CSS 通过 `?inline` 导入为字符串，注入时创建 `<style>` 标签插入页面。这样 CSS 也被内联进了 IIFE，不需要额外的文件加载。

完整的构建命令也自动变成了两步：

```bash
tsc && vite build && vite build --config vite.content.config.ts
```

先类型检查，再主构建，最后辅助构建。`emptyOutDir: false` 这个配置尤其关键——清空了主构建产物，扩展在浏览器里就直接崩了。CC 在脚手架阶段就把这个坑绕过去了。

**为什么不用 `content_scripts` 声明式注入？** MV3 支持在 manifest 中声明匹配 URL 让 Chrome 自动注入脚本，但那个方案必须在 manifest 中声明 `host_permissions`。iTranslate 的权限策略不允许这样做。`executeScript` + `activeTab` 的组合是唯一符合最小权限原则的方案，代价就是多了一个 `vite.content.config.ts`。

---

## 6.5 核心技巧

1. **脚手架交给 CC，你只需要确认关键决策**。不需要手写 manifest.json 和构建配置——告诉 CC 技术选型（Vite + TypeScript + MV3），它会生成正确的文件集合。但权限策略一定要自己确认：CC 默认可能加 `host_permissions`，你需要明确要求最小权限。

2. **权限策略一开始就要定好，且只减不加**。Chrome 扩展的权限是"不可逆"的——你今天加了 `host_permissions`，以后去掉了，已安装的用户不会自动失去这个权限。iTranslate 的三个权限是深思熟虑后的最小集。

3. **脚手架阶段不要写业务逻辑**。CC 生成的初始文件只包含骨架——空的监听器、空的 HTML、最小化的 import。后续的 router、extractor、renderer 等模块都是在各自功能需要时才拆出来的。早期定型的设计反而是负担。

4. **dev 和 build 加载的目录不同**。开发时 Chrome 加载项目根目录（crxjs dev server 从这里提供文件），生产构建后加载 `dist/`。很多新手在这里犯错——改完代码发现没变化，因为加载了 `dist/` 但没 build。

---

## 6.6 小结

- **脚手架是 CC 自动生成的，不是手搭的**。告诉 CC 你的技术选型，它会输出正确的文件集合和构建配置。
- **manifest.json 的权限只声明三个**：`storage`、`activeTab`、`scripting`。没有 `host_permissions`——这是 CC 做的关键决策，直接影响审核速度和用户信任。
- **Vite + crxjs 自动处理 manifest**：版本号注入、路径映射、HMR 热更新。`vite.config.ts` 只有几行，因为复杂度被 crxjs 封装了。
- **四个执行上下文是完全隔离的沙箱**：Background（Service Worker，随时休眠）、Content Script（页面 DOM，按需注入）、Popup（点击弹窗，即开即毁）、Settings（独立标签页）。它们之间唯一的通信方式是 `chrome.runtime.sendMessage`。
- **Content Script 必须构建为 IIFE**：`executeScript` 不支持 ESM。`vite.content.config.ts` 是 CC 预判的，`emptyOutDir: false` 是关键——清空了主构建产物就全崩了。
- **脚手架阶段保持极简**：每个入口文件只有骨架，没有业务逻辑。后续模块在需要时才拆出来。

> 下一章：第 7 章「翻译引擎：Prompt 设计」——从 API 调通到写出第一个能产出合格翻译的 System Prompt。
