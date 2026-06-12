export async function sendToBgWithRetry(message: unknown, retries = 5, baseDelayMs = 300): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (err) {
      if (i === retries - 1) throw err;
      const msg = (err as Error).message;
      if (msg.includes('Receiving end does not exist') || msg.includes('Could not establish connection')) {
        // MV3 Service Worker 冷启动可能超过 1s，指数退避给足时间
        // 300 → 600 → 1200 → 2400 = 最大等待 4.5s
        const delay = baseDelayMs * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      // Extension 重载后旧 content script 已失效，重试无意义
      if (msg.includes('Extension context invalidated')) {
        throw new Error('EXTENSION_CONTEXT_INVALIDATED');
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}
