// 内容脚本独立构建 — IIFE 格式，供 chrome.scripting.executeScript 注入
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
