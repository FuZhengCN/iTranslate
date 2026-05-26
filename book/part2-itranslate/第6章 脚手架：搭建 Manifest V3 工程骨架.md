# 第6章 脚手架：搭建 Manifest V3 工程骨架

**本章目标**：读完本章，你将彻底读懂 Claude Code 自动生成的 Manifest V3 扩展脚手架全貌。完整理解极简权限设计的底层逻辑、Vite + crxjs 的核心构建原理、四大隔离执行上下文的运行机制，同时吃透 Content Script 必须编译为 IIFE 格式的关键原因，从零掌握 AI 生成脚手架的每一处核心设计决策。

**预计字数**：约4000字

**状态**：✅ 初稿精修完成

## 6.1 快速初始化：让 AI 生成标准项目骨架

本项目的脚手架无需手动搭建，全程依托 Claude Code 一键生成，仅需清晰告知技术栈与项目需求，AI 即可自动输出规范、完整、避坑的项目文件与核心配置。我当时向 Claude Code 输入的指令简洁且精准：

> 我要做一个 Chrome Manifest V3 扩展，用 Vite + TypeScript。帮我初始化项目结构。

短短一句指令，Claude Code 自动完成了项目初始化、目录搭建、核心配置编写、构建脚本生成等全套工作。其中，`manifest.json` 作为扩展的核心配置文件，其生成的关键设计极具参考价值。下文仅保留核心字段，方便清晰解读：

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

这份 AI 自动生成的配置，暗藏多处精准且关键的工程决策，每一项设计都贴合 MV3 规范与项目长期迭代需求：

1. **强制使用 manifest_version: 3**：Claude Code 默认选用最新 V3 规范，无需人工叮嘱。当前 Chrome 已逐步淘汰 V2 版本，新项目沿用 V2 只会埋下后续重构、商店审核失败的隐患，V3 是唯一合规且长期可用的选择。
2. **极简三权限设计**：仅声明 `storage`、`activeTab`、`scripting` 三项核心权限，无冗余、无高危全局权限。这是整套脚手架最核心、最亮眼的设计，彻底区别于市面绝大多数翻译扩展，为后续商店审核、用户信任度提升奠定基础。
3. **源码路径直接映射 Service Worker**：Background 服务工作器直接指向 TypeScript 源码路径，而非编译产物。依托 crxjs 构建能力，自动完成路径解析与编译映射，省去手动适配打包路径的繁琐工作。
4. **版本号占位设计**：`version: "0.0.0"` 为临时占位符，真实版本号统一托管于 `package.json`，构建时自动注入同步，彻底解决手动维护版本号、多文件版本不一致的问题。

### 6.1.1 极简三权限的核心价值

市面绝大多数 Chrome 翻译扩展，都会在配置中声明 `<all_urls>` 全局匹配或宽泛的 `host_permissions` 主机权限，意味着扩展可读取、修改用户访问的**所有网页数据**，功能便捷但隐私风险极高。

Claude Code 为本项目采用**零全局主机权限 + 按需注入**的极简方案，不扫描、不监听全网页面，仅在用户主动触发翻译时，对当前页面临时注入脚本，页面关闭后脚本自动销毁。该决策带来三大核心优势：

1. **审核效率大幅提升**：宽泛的全局权限会触发 Chrome Web Store 严格审核机制，需要补充大量隐私说明、延长审核周期；极简权限配置审核标准宽松，通常数天即可完成上架审核。
2. **用户隐私更安全**：摒弃全局监听模式，仅在用户主动使用功能时临时生效，对用户隐私的干预是「点对点、临时性」的，无后台常驻监听、无长期数据采集。
3. **安装转化率更高**：用户安装时不会弹出「该扩展可读取和修改所有网站数据」的高危警告，极大降低用户安装顾虑，适配需要用户主动配置 API Key的产品定位。

这套方案的唯一代价是**实现复杂度提升**，需要额外开发脚本探测、按需注入、状态确认等配套逻辑，但从项目合规、用户信任、长期迭代的角度来看，该取舍完全值得。

## 6.2 构建方案：Vite + crxjs 自动化工程体系

Claude Code 直接为本项目敲定 **Vite + @crxjs/vite-plugin** 构建方案，摒弃老旧的 Webpack 与繁琐的手动配置，以极简配置实现高效开发与标准化构建。最终生成的 `vite.config.ts` 配置简洁、逻辑清晰，完全适配 MV3 扩展开发场景：

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

### 6.2.1 核心构建逻辑

整套配置的核心作用是**自动化适配扩展构建规范**：crxjs 插件会自动解析原生 `manifest.json` 全部字段，并用 `package.json` 的标准版本号，覆盖 manifest 内的占位版本。自此项目实现**版本号统一自动化管理**，无需开发者手动同步、修改，执行打包命令即可自动更新。

### 6.2.2 crxjs 三大核心价值

1. **全自动化 Manifest 管理**：自动完成版本注入、源码路径映射、权限合并、规范校验，彻底解决手动维护 Manifest 易出错、易遗漏的行业痛点。
2. **极速 HMR 热更新**：开发模式下修改 Popup、页面样式、业务逻辑等代码，保存后浏览器扩展实时刷新生效，无需手动重载扩展、重启浏览器，UI 迭代效率成倍提升。
3. **多环境构建隔离**：MV3 扩展包含 Background、Content Script、Popup 等多套独立运行环境，构建规则各不相同。crxjs 内部封装差异化适配逻辑，开发者无需关注底层构建差异，专注业务开发即可。

### 6.2.3 开发与生产双环境加载规范

Claude Code 同步生成标准化的项目加载方案，区分开发、生产两种场景，规避新手常见的加载错误：

- **开发环境（dev）**：执行 `npm run dev`，进入 Chrome 扩展管理页面 `chrome://extensions`，选择「加载已解压的扩展程序」，选中**项目根目录**即可（crxjs 开发服务器实时提供源码服务）。
- **生产环境（build）**：执行 `npm run build`，生成标准化产物至 `dist/` 目录，浏览器直接加载 `dist/` 文件夹即可用于测试与打包上架。

## 6.3 架构基石：四大隔离执行上下文

Claude Code 生成的目录结构完全贴合 MV3 官方架构规范，四大核心模块相互独立、职责拆分明确，无冗余文件、无过度设计。标准脚手架目录结构如下：

```plain
src/
├── background/
│   └── index.ts          # 后台服务：消息监听、缓存、API 核心逻辑骨架
├── content/
│   └── index.ts          # 页面脚本：DOM 操作、文本提取、翻译渲染骨架
├── popup/
│   ├── popup.html        # 工具栏弹窗页面结构
│   └── popup.ts          # 弹窗交互、按钮事件、消息下发逻辑
├── settings/
│   ├── settings.html     # 扩展配置页面结构
│   └── settings.ts       # 配置表单、数据存储、参数更新逻辑
└── shared/
    ├── types.ts          # 全局共享 TS 类型定义
    └── storage.ts        # 浏览器存储方法统一封装
```

这套多入口隔离结构并非主观设计偏好，而是 **Chrome MV3 架构的强制约束**。MV3 将扩展拆分为四个相互隔离的独立沙箱环境，各环境生命周期、权限、能力完全不同，具体特性如下：

### 6.3.1 Background（Service Worker 后台服务）

无 DOM 操作权限、无页面视图，是纯后台计算与数据管理环境。浏览器会自动休眠闲置的 Service Worker，默认空闲 30 秒左右自动终止，收到新消息时重新唤醒。因此**无法维护全局持久状态、不支持长时间定时器**，每次唤醒都是全新的干净运行环境，主要负责处理 API 请求、数据缓存、全局消息分发等核心业务逻辑。

### 6.3.2 Content Script（页面脚本）

运行在当前网页上下文，拥有完整 DOM 操作权限，但处于浏览器的「隔离沙箱」中，与原页面 JS 变量完全不互通、互不污染，杜绝页面冲突。生命周期与页面绑定，脚本注入后激活，页面关闭、刷新后自动销毁，仅负责文本提取、页面渲染、动态 DOM 监听等页面交互工作。

### 6.3.3 Popup（工具栏弹窗）

点击浏览器扩展图标时临时创建，点击页面空白处即刻销毁，属于「即开即毁」的临时实例，无法持久保存状态，主要承载用户快捷操作入口。

### 6.3.4 Settings（配置页面）

独立浏览器标签页运行，生命周期短，仅用于用户配置 API 密钥、模型参数、翻译规则，配置完成后即可关闭。

### 6.3.5 跨沙箱通信规则

四大隔离环境之间唯一的通信方式是 `chrome.runtime.sendMessage`。整套架构严格遵循权责分离原则：Background 不操作 DOM、不参与页面渲染；Content Script 不持有 API 密钥、不处理缓存逻辑、不发起网络请求；敏感数据统一存放在 Background 的 IndexedDB 中，从架构层面规避数据泄露、逻辑混乱问题。

脚手架阶段仅生成极简骨架代码，包含基础监听器、空页面、通用工具封装，无任何冗余业务逻辑。后续的文本提取、翻译渲染、路由分发、缓存处理等模块，均根据业务需求逐步拆分迭代，避免前期过度设计导致的代码冗余。

## 6.4 关键避坑：Content Script 强制 IIFE 构建

这是 MV3 扩展开发的高频隐性坑点，Claude Code 在脚手架阶段就提前预判并完美规避。

项目采用 `chrome.scripting.executeScript` 动态注入 Content Script，但该原生 API 存在严格限制：**不支持 ESM 的 import/export 模块化语法**。若直接编译带模块化语法的 TS 代码，页面注入后会直接报错、功能失效。

为适配该底层限制，Claude Code 自动生成独立的构建配置文件 `vite.content.config.ts`，专门将 Content Script 编译为 **IIFE 自执行函数格式**，所有依赖内联打包为单文件，无模块边界、无导出语法，完美适配动态注入规则：

```typescript
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

### 6.4.1 三大核心避坑配置解析

1. **formats: ['iife']**：强制输出自执行函数格式，取消模块化拆分，所有代码、依赖全部内联至单个文件，适配原生脚本注入规则。
2. **emptyOutDir: false**：禁止清空构建目录。主构建流程已完成 Popup、Background、Settings 产物打包，该配置仅用于追加编译 Content Script，避免清空已有产物导致项目报错。
3. **样式内联处理**：所有 CSS 样式通过 `?inline` 语法转为字符串，脚本注入时动态创建 Style 标签挂载样式，无需单独加载 CSS 文件，保证脚本独立性与完整性。

最终项目形成双步构建逻辑，兼顾类型校验、主流程打包、特殊脚本编译：

```bash
tsc && vite build && vite build --config vite.content.config.ts
```

执行流程为：先全局 TS 类型校验、再执行主工程构建、最后单独构建 Content Script，全程自动化规避格式报错、文件丢失问题。

### 6.4.2 放弃声明式注入的核心原因

MV3 支持 `content_scripts` 声明式自动注入，但该方案必须配置宽泛的 `host_permissions` 全局主机权限，与本项目**最小权限、按需注入、保护隐私**的核心策略完全冲突。

因此项目最终选择 `activeTab + executeScript` 动态注入方案，以少量开发复杂度为代价，守住权限安全底线，实现合规、安全、可控的脚本注入能力。

## 6.5 本章核心实战技巧

1. **脚手架全权交给 AI，核心决策人工把控**：无需手动编写 Manifest、构建配置与基础目录，只需明确技术栈需求（MV3 + Vite + TS），AI 可生成标准化工程骨架。但**权限策略必须人工确认**，主动规避 AI 默认生成的宽泛主机权限。
2. **权限遵循「只减不加、一次定型」原则**：Chrome 扩展权限具备不可逆特性，前期添加的冗余权限，后续删除后无法同步覆盖已安装用户，会持续留存隐私风险。极简三权限架构是长期最优解，立项脚手架阶段直接定型。
3. **脚手架保持极致轻量化，拒绝过度设计**：初始骨架仅保留基础运行能力，无冗余业务逻辑。所有功能模块、复杂逻辑，均在开发阶段按需拆分迭代，避免前期过度设计导致的代码负担。
4. **严格区分开发与生产加载目录**：开发模式加载项目根目录、生产模式加载 dist 产物。新手常因目录混淆，修改代码后未重新构建，导致代码不生效、调试异常等问题。

## 6.6 本章小结

本章完整拆解了 AI 生成的 Manifest V3 扩展脚手架核心设计与底层原理，核心要点汇总如下：

- 项目脚手架由 Claude Code 全自动生成，基于「MV3 + Vite + TypeScript」技术栈，规范标准、避坑完善，无需手动搭建基础工程；
- 核心配置 `manifest.json` 采用**极简三权限架构**，舍弃全局主机权限，依托按需注入实现功能，大幅提升审核效率与用户信任度；
- Vite + crxjs 构建方案实现版本自动同步、路径自动映射、HMR 热更新，以极简配置封装复杂的扩展构建逻辑；
- 四大执行上下文完全隔离，Background、Content Script、Popup、Settings 各司其职、权限拆分清晰，通过统一消息机制通信，构成稳定的 MV3 架构基石；
- Content Script 专属 IIFE 构建是关键避坑点，适配原生动态注入 API 限制，依靠独立构建配置解决模块化语法报错问题；
- 优质脚手架遵循「轻量化、无冗余、可扩展」原则，仅保留基础骨架，业务模块按需迭代，兼顾稳定性与灵活性。

**下一章预告**：第7章「翻译引擎：Prompt 设计」——从接口调通到打磨出第一个高质量、稳定适配网页翻译的专属 System Prompt。