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
