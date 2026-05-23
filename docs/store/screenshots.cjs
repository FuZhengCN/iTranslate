// Playwright 截图脚本 — Chrome Web Store 展示截图
// 用法: node docs/store/screenshots.js
// 需要: npm run build 已执行，dist/ 存在

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EXT_PATH = path.resolve(__dirname, '../../dist');
const OUT_DIR = path.resolve(__dirname, 'screenshots');
const TEST_PAGE = 'file://' + path.resolve(__dirname, 'test-page.html');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launchPersistentContext(
    path.resolve(__dirname, '.browser-data'),
    {
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      channel: undefined,
      args: [
        `--disable-extensions-except=${EXT_PATH}`,
        `--load-extension=${EXT_PATH}`,
      ],
      viewport: { width: 1280, height: 800 },
    }
  );

  let extId = null;
  // 等待 Service Worker 启动
  for (let i = 0; i < 10 && !extId; i++) {
    await new Promise(r => setTimeout(r, 1000));
    for (const p of browser.pages()) {
      const m = p.url().match(/chrome-extension:\/\/([a-z]{32})/);
      if (m) { extId = m[1]; break; }
    }
    // 也检查 background service worker
    if (!extId && browser.backgroundPages) {
      for (const p of browser.backgroundPages()) {
        const m = p.url().match(/chrome-extension:\/\/([a-z]{32})/);
        if (m) { extId = m[1]; break; }
      }
    }
  }

  if (!extId) {
    console.error('未能获取扩展 ID。请确认 dist/ 已构建（npm run build）');
    await browser.close();
    process.exit(1);
  }
  console.log('Extension ID:', extId);

  // ═══ 截图 1: Popup 弹窗 ═══
  const popup = await browser.newPage();
  await popup.setViewportSize({ width: 400, height: 500 });
  await popup.goto(`chrome-extension://${extId}/src/popup/popup.html`, { waitUntil: 'networkidle', timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));
  await popup.screenshot({ path: path.join(OUT_DIR, '01-popup.png') });
  console.log('✓ 01-popup.png — 弹窗界面');
  await popup.close();

  // ═══ 截图 2: 设置页 ═══
  const settings = await browser.newPage();
  await settings.setViewportSize({ width: 1280, height: 800 });
  await settings.goto(`chrome-extension://${extId}/src/settings/settings.html`, { waitUntil: 'networkidle', timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));
  await settings.screenshot({ path: path.join(OUT_DIR, '02-settings.png') });
  console.log('✓ 02-settings.png — 设置页面');
  await settings.close();

  // ═══ 截图 3: 测试页面（翻译前）═══
  const page = await browser.newPage();
  await page.goto(TEST_PAGE, { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '03-page-before.png'), fullPage: false });
  console.log('✓ 03-page-before.png — 翻译前页面');

  // ═══ 截图 4: Popup 在页面上下文（模拟打开弹窗的效果）═══
  // 这个截图展示扩展和页面在一起的视觉效果
  await page.screenshot({ path: path.join(OUT_DIR, '04-page-with-icon.png'), fullPage: false });
  console.log('✓ 04-page-with-icon.png — 页面全貌');

  await page.close();
  await browser.close();

  console.log('\n===== 截图完成 =====');
  console.log('文件:', OUT_DIR);
  console.log('\n需手动补充（自动截图无法替代）:');
  console.log('  1. 加载扩展 → 配置 API Key → 翻译测试页面 → 截取翻译结果');
  console.log('  2. 浏览器工具栏扩展图标特写');
  console.log('  3. 划词翻译气泡（需开启划词翻译开关后选中文字）');
})().catch(err => {
  console.error('截图失败:', err);
  process.exit(1);
});
