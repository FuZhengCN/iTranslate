/**
 * Chrome Web Store 宣传图截图脚本
 * 使用 Puppeteer 将 promo-small.html 和 promo-marquee.html 渲染为精确尺寸 PNG
 * 输出：24-bit PNG（无 alpha 透明层，背景已填充）
 */

const puppeteer = require('puppeteer');
const path = require('path');

const STORE_DIR = __dirname;

const TASKS = [
  {
    name: 'Small Tile',
    html: `file:///${path.join(STORE_DIR, 'promo-small.html').replace(/\\/g, '/')}`,
    output: path.join(STORE_DIR, 'promo-small.png'),
    width: 440,
    height: 280,
  },
  {
    name: 'Marquee',
    html: `file:///${path.join(STORE_DIR, 'promo-marquee.html').replace(/\\/g, '/')}`,
    output: path.join(STORE_DIR, 'promo-marquee.png'),
    width: 1400,
    height: 560,
  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const task of TASKS) {
    console.log(`Capturing ${task.name} (${task.width}×${task.height})...`);

    const page = await browser.newPage();
    await page.setViewport({
      width: task.width,
      height: task.height,
      deviceScaleFactor: 1,
    });

    await page.goto(task.html, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: task.output,
      type: 'png',
      omitBackground: false, // 保留背景，确保无透明度
    });

    await page.close();
    console.log(`  -> ${task.output}`);
  }

  await browser.close();
  console.log('Done.');
})();
