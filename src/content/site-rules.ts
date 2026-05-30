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
  {
    hostname: 'gitee.com',
    selector: '.markdown-body',
    description: 'Gitee 码云 — 与 GitHub 使用相同 CSS 类名',
  },
  {
    hostname: 'gitlab.com',
    selector: '.md',
    description: 'GitLab — Markdown 渲染区域（README/Issue/MR/Wiki）',
  },
  {
    hostname: 'stackoverflow.com',
    selector: '.s-prose',
    description: 'Stack Overflow — 问题/回答正文',
  },
  {
    hostname: 'stackexchange.com',
    selector: '.s-prose',
    description: 'Stack Exchange 全系列 — 问题/回答正文',
  },
  {
    hostname: 'npmjs.com',
    selector: '#readme',
    description: 'NPM — 包 README 区域',
  },
  {
    hostname: 'medium.com',
    selector: 'article',
    description: 'Medium — 文章正文（语义标签）',
  },
  {
    hostname: 'dev.to',
    selector: '#article-body',
    description: 'Dev.to — 文章正文',
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
