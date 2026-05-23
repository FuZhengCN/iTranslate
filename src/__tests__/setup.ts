import 'fake-indexeddb/auto';

// jsdom 无布局引擎，offsetParent 始终为 null。mock 为非 null 使所有元素在测试中可见。
// 真实浏览器中 display:none 元素 offsetParent 为 null，会被提取器正确跳过。
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() { return this.parentElement || this; },
  configurable: true,
});
