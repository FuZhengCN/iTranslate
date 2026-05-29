import { describe, it, expect, beforeEach } from 'vitest';
import { getSiteRoot, SITE_RULES } from '../site-rules';

describe('site-rules', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('命中规则 → 返回 querySelector 匹配元素', () => {
    const div = document.createElement('div');
    div.className = 'markdown-body';
    document.body.appendChild(div);

    const root = getSiteRoot('github.com');
    expect(root).toBe(div);
  });

  it('无匹配规则 → 返回 document.body', () => {
    const root = getSiteRoot('example.com');
    expect(root).toBe(document.body);
  });

  it('命中规则但选择器无匹配 → 降级返回 document.body', () => {
    // document.body 中没有 .markdown-body
    const root = getSiteRoot('github.com');
    expect(root).toBe(document.body);
  });

  it('多规则时取第一个命中', () => {
    const first = document.createElement('div');
    first.className = 'first-selector';
    document.body.appendChild(first);

    const second = document.createElement('div');
    second.className = 'markdown-body';
    document.body.appendChild(second);

    // 临时插入一条也匹配 github.com 的规则，验证优先匹配
    const saved = SITE_RULES.slice();
    SITE_RULES.unshift({ hostname: 'github.com', selector: '.first-selector' });
    try {
      const root = getSiteRoot('github.com');
      expect(root).toBe(first);
    } finally {
      SITE_RULES.length = 0;
      SITE_RULES.push(...saved);
    }
  });

  it('空规则数组 → 返回 document.body', () => {
    const saved = SITE_RULES.slice();
    SITE_RULES.length = 0;
    try {
      const root = getSiteRoot('github.com');
      expect(root).toBe(document.body);
    } finally {
      SITE_RULES.push(...saved);
    }
  });
});
