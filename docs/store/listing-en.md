# Chrome Web Store Listing — English

## Short Description (≤132 characters)

> AI-powered bilingual translation. Translations appear inline below original text — no layout disruption. Bring your own API key, data stays local.

---

## Detailed Description

**iTranslate lets you read any webpage in your language, as naturally as if it were written that way.**

### Why You Need iTranslate

Over 70% of internet content is in a language you might not speak natively. Technical documentation, research papers, industry news, product reviews — the best information is often locked behind a language barrier. Traditional solutions force you to switch between translation tools and the original page, breaking your reading flow and losing context.

iTranslate takes a different approach: it embeds AI translations **directly below the original text**, in a slightly muted style. No tab-switching. No full-page replacement. Original and translation coexist in the same view — read what you understand, glance down when you need help. One seamless experience.

### What Makes It Different

Most page translators do "replacement" — they swap the entire page with machine-translated text. Two problems: you lose the original for cross-referencing, and page layouts often break.

iTranslate does "overlay" — the original stays untouched, and translations are inserted beneath each paragraph as a supplementary layer. The page structure, images, code blocks, and styling remain intact. Think of translations as "subtitles" for the web.

### Key Advantages

**AI-powered, not machine translation.** iTranslate calls large language models — GPT, DeepSeek, Claude — not statistical MT engines. It understands context, recognizes technical terms, and handles complex sentences. Translation quality far exceeds built-in browser translation.

**You use your own API key.** iTranslate doesn't sell translation as a service. It's a bridge between you and the AI model you choose. Your data goes directly from your browser to your designated API provider. No intermediary servers ever touch your data.

**All data stays local.** API keys, translation cache, language preferences — everything lives in your browser. No account registration, no data upload, no ads, no tracking. Your browsing privacy and translation content are entirely under your control.

**Translation cache saves you money.** Translated sentences are cached locally. Encounter the same content again and results appear instantly, with zero API cost. Cache hit rates are high when browsing multiple pages on the same site.

### Features

- One-click full-page translation with inline bilingual display
- Select any text on the page for instant pop-up translation
- Supports 6 languages: Chinese, English, Japanese, Korean, French, German
- Automatic page language detection, smart target language matching
- Configurable API endpoint, model name, and system prompt
- One-click undo to restore the original page
- Glacier polar theme — clean, minimal, easy on the eyes

### Who It's For

- **Developers & engineers** — reading docs, GitHub issues, Stack Overflow
- **Researchers & academics** — browsing foreign papers, journal abstracts, conference sites
- **Product managers & analysts** — competitive research, industry reports
- **E-commerce sellers** — overseas product descriptions, customer reviews
- **Language learners** — side-by-side bilingual reading
- **Everyone else** — foreign news, blogs, Wikipedia

### Getting Started

1. Install the extension and get an AI API key (DeepSeek, OpenAI, Claude, or any compatible provider)
2. Click the extension icon → gear icon → enter API details → test connection → save
3. Open any webpage, click the extension icon, select languages, click "Translate This Page"

Where to get API keys: DeepSeek (platform.deepseek.com), OpenAI (platform.openai.com) — most offer free credits upon signup.

---

## Permission Justification

| Permission | Why It's Needed |
|-----------|-----------------|
| `activeTab` | Accesses page content only when you click the extension icon. Never silently reads pages in the background |
| `storage` | Stores your API key, translation cache, and language preferences locally in your browser |
| `scripting` | Renders translation text onto the page |
| Access all HTTP/HTTPS websites | Translation must work on any page you visit — we can't predict which domains you'll need |

**iTranslate does NOT:** collect browsing history, upload data to any developer server, or embed ads or tracking code. The developer does not own any servers.

---

## Privacy

All data (API keys, translation records, preferences) is stored locally in your browser. Translation text is sent directly to your designated AI service with no intermediary. See the full [Privacy Policy](https://fuzhengcn.github.io/iTranslate/docs/store/privacy.html).
