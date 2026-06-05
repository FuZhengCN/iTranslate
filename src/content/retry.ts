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
      // Extension 重载后旧 content script 已失效，重试无意义
      if (msg.includes('Extension context invalidated')) {
        throw new Error('EXTENSION_CONTEXT_INVALIDATED');
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}
