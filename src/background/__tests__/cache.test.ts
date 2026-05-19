import { describe, it, expect, beforeEach } from 'vitest';
import { cacheGet, cacheSet, cacheGetBulk, cacheSetBulk, cacheClear } from '../cache';

describe('cache', () => {
  beforeEach(async () => {
    await cacheClear();
  });

  it('returns undefined for missing key', async () => {
    const result = await cacheGet('nonexistent');
    expect(result).toBeUndefined();
  });

  it('stores and retrieves a single entry', async () => {
    const entry = { translated: '你好', timestamp: Date.now() };
    await cacheSet('key1', entry);
    const result = await cacheGet('key1');
    expect(result).toEqual(entry);
  });

  it('stores and retrieves bulk entries', async () => {
    const entries = new Map([
      ['key1', { translated: '你好', timestamp: Date.now() }],
      ['key2', { translated: '世界', timestamp: Date.now() }],
    ]);
    await cacheSetBulk(entries);
    const result = await cacheGetBulk(['key1', 'key2', 'key3']);
    expect(result.size).toBe(2);
    expect(result.get('key1')?.translated).toBe('你好');
    expect(result.get('key2')?.translated).toBe('世界');
    expect(result.has('key3')).toBe(false);
  });

  it('clears all entries', async () => {
    await cacheSet('key1', { translated: '你好', timestamp: Date.now() });
    await cacheClear();
    const result = await cacheGet('key1');
    expect(result).toBeUndefined();
  });
});
