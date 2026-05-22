# 通译 / iTranslate

使用 AI 大模型的沉浸式双语网页翻译浏览器扩展。翻译结果以浅色文本直接插入原文下方，不破坏页面结构。

## 功能

- **整页沉浸式翻译** — 翻译文本直接出现在原文下方，保留页面布局
- **6 种目标语言** — 支持英/中/日/韩/法/德互译
- **自动语言检测** — 源语言从页面 `<html lang>` 自动检测，目标语言跟随浏览器 UI 语言
- **翻译缓存** — 已翻译内容本地缓存，相同内容不重复请求 API
- **自定义 API** — 支持任意 OpenAI 兼容 API 端点（DeepSeek、OpenAI、Claude 等）

## 安装

1. 下载 `iTranslate-vX.Y.Z.zip` 并解压到本地文件夹
2. 打开 Chrome/Edge 浏览器，地址栏输入 `chrome://extensions` 或 `edge://extensions`
3. 开启右上角**开发者模式**
4. 点击**加载解压缩的扩展**，选择解压后的文件夹

## 配置

加载扩展后，点击扩展图标 → 齿轮图标进入设置页：

| 配置项 | 说明 |
|--------|------|
| API Endpoint | OpenAI 兼容 API 地址，如 `https://api.deepseek.com/v1` |
| API Key | 你的 API 密钥，存储在浏览器本地 |
| Model | 模型名称，如 `deepseek-chat`、`gpt-4o` |
| System Prompt | 翻译提示词，根据选择的语言自动生成，可编辑 |

填写后点击**测试连接**确认配置可用，再点击**保存**。

## 使用

1. 打开任意网页
2. 点击浏览器工具栏的**通译**图标
3. 在弹窗中选择源语言和目标语言
4. 点击 **翻译此页面**
5. 翻译结果以低透明度文本出现在原文下方
6. 如需还原，点击 **撤销翻译**

## 技术栈

TypeScript · Vite · @crxjs/vite-plugin · Chrome Extension Manifest V3
