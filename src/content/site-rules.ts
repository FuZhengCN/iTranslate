export interface SiteRule {
  hostname: string;
  selector: string;
  description?: string;
}

export const SITE_RULES: SiteRule[] = [
  {
    hostname: 'github.com',
    selector: '.markdown-body',
    description: 'GitHub — 只翻译 Markdown 渲染区域（README/Issue/PR/Wiki）',
  },
];

function matchRule(hostname: string, rule: SiteRule): boolean {
  return hostname === rule.hostname || hostname.endsWith('.' + rule.hostname);
}

export function getSiteRoot(hostname?: string): Element {
  const hn = hostname ?? location.hostname;
  const rule = SITE_RULES.find((r) => matchRule(hn, r));
  if (!rule) return document.body;
  return document.querySelector(rule.selector) ?? document.body;
}
