# yiochou.com Astro 重寫 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把現有手寫單頁名片站重寫為 Astro 內容站(首頁/Blog/Now/About),SEO 建置時全自動,部署 Cloudflare Pages。

**Architecture:** Astro 靜態輸出(零 client JS),文章用 Content Collections 管理 Markdown;一個 BaseLayout 統一 header/footer/meta;sitemap、RSS、OG 圖(satori+sharp)、JSON-LD 全在建置時生成。在 `redesign` branch 上開發,Cloudflare Pages 切換 build 設定後才合併回 main。

**Tech Stack:** Astro 5、@astrojs/sitemap、@astrojs/rss、satori、sharp、Fontsource(EB Garamond / LXGW WenKai TC / Inter / Noto Sans TC)、Cloudflare Pages。

**Spec:** `docs/superpowers/specs/2026-07-08-website-redesign-design.md`(色票、字型、頁面規格皆以 spec 為準)

## Global Constraints

- 全站零 client-side JS;唯一例外是 Cloudflare Web Analytics beacon(且只在 `PUBLIC_CF_BEACON_TOKEN` 環境變數存在時輸出)
- 色票:底 `#fffdf8`、墨 `#292524`、次要 `#78716c`、淡出 `#a8a29e`、分隔線 `#e7e5e4`、粉 `#ffcfdf`、桃紅 `#e0679a`、深粉字 `#9d2c5a`、湖水綠 `#b0f3f1`、深綠字 `#134e4a`
- 字型:內文/標題 `'EB Garamond','LXGW WenKai TC',serif`;UI `'Inter Variable','Noto Sans TC Variable',sans-serif`;程式碼系統等寬。全部 self-host(Fontsource),`font-display: swap`(Fontsource 預設)
- 介面文字用英文(Blog / Now / About / Writing);站台預設 `lang="zh-tw"`,文章頁依 frontmatter `lang`
- site URL:`https://yiochou.com`
- 內文欄寬 65ch、單欄置中、手機優先;不做深色模式
- 對外連結:GitHub `https://github.com/yiochou`、LinkedIn `https://www.linkedin.com/in/yio-c-8956111a3/`、CV `https://resume.yiochou.com/index.pdf`、Email `hi@yiochou.com`
- 所有 commit 訊息結尾加上 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- 本專案無單元測試框架;每個 task 的「測試」= `npm run build` + 對 `dist/` 產物的斷言指令(grep / test / file),指令與預期輸出如各步驟所示

---

### Task 1: 專案鷹架與 repo 改造

**Files:**
- Create: `package.json`、`astro.config.mjs`、`tsconfig.json`、`src/pages/index.astro`、`public/_headers`、`public/_redirects`
- Modify: `.gitignore`
- Delete: `dist/`(舊手寫站,git 追蹤移除)、根目錄 `_headers`、`_redirects`

**Interfaces:**
- Consumes: 無(起點)
- Produces: 可 build 的 Astro 專案;`astro.config.mjs` 匯出含 `site: 'https://yiochou.com'` 的 config;`npm run dev` / `npm run build` 可用

- [ ] **Step 1: 建立分支**

```bash
git checkout -b redesign
```

- [ ] **Step 2: 建立 package.json 並安裝 Astro**

建立 `package.json`:

```json
{
  "name": "yiochou.com",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

```bash
npm install astro
```

- [ ] **Step 3: 建立 astro.config.mjs 與 tsconfig.json**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yiochou.com',
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/base",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 搬移 Cloudflare 設定檔到 public/,原樣保留內容**

`public/_headers`:

```
/*
  Access-Control-Allow-Origin: *
  Referrer-Policy: no-referrer-when-downgrade
```

`public/_redirects`:

```
/resume https://resume.yiochou.com/index.pdf 301
```

```bash
git rm _headers _redirects
```

- [ ] **Step 5: 移除舊站產物、更新 .gitignore**

```bash
git rm -r dist
```

`.gitignore` 改為:

```
.DS_Store
.superpowers/
node_modules/
dist/
.astro/
```

- [ ] **Step 6: 建立暫時首頁**

`src/pages/index.astro`:

```astro
---
---
<html lang="zh-tw">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yio Chou</title>
  </head>
  <body>
    <h1>Yio Chou</h1>
  </body>
</html>
```

- [ ] **Step 7: 驗證 build**

```bash
npm run build && test -f dist/index.html && test -f dist/_headers && test -f dist/_redirects && echo TASK1-OK
```

預期:build 成功、最後輸出 `TASK1-OK`。
(注意:`src/content/blog/` 已有既存文章,Astro 可能對未設定的 collection 出現警告,屬預期,Task 3 會補上設定。)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, retire hand-written site

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 設計 tokens、字型與 BaseLayout

**Files:**
- Create: `src/styles/global.css`、`src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: Task 1 的專案鷹架
- Produces: `BaseLayout.astro`,props 介面:`{ title: string; description: string; lang?: string /* 預設 'zh-tw' */; type?: 'website' | 'article'; ogImage?: string /* 絕對路徑,如 '/blog/x/og.png' */ }`,並提供預設 `<slot />`;`global.css` 匯出 CSS 變數(見下)供各頁使用

- [ ] **Step 1: 安裝字型套件**

```bash
npm install @fontsource/eb-garamond @fontsource/lxgw-wenkai-tc @fontsource-variable/inter @fontsource-variable/noto-sans-tc
```

- [ ] **Step 2: 建立 global.css**

`src/styles/global.css`:

```css
:root {
  --bg: #fffdf8;
  --ink: #292524;
  --ink-2: #78716c;
  --ink-3: #a8a29e;
  --line: #e7e5e4;
  --pink: #ffcfdf;
  --pink-deep: #e0679a;
  --pink-text: #9d2c5a;
  --teal: #b0f3f1;
  --teal-text: #134e4a;
  --font-serif: 'EB Garamond', 'LXGW WenKai TC', serif;
  --font-sans: 'Inter Variable', 'Noto Sans TC Variable', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

* { box-sizing: border-box; }

html { background: var(--bg); }

body {
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
  max-width: 42rem;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.9;
}

h1, h2, h3 { line-height: 1.4; font-weight: 600; }

a { color: inherit; text-decoration-color: var(--pink-deep); text-underline-offset: 4px; }
a:hover { text-decoration-color: var(--teal-text); }

code, pre { font-family: var(--font-mono); font-size: 0.85em; }
pre { padding: 1rem 1.25rem; overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; line-height: 1.6; }

img { max-width: 100%; height: auto; }

.pill {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  padding: 0.15rem 0.7rem;
  border-radius: 99px;
}
.pill-teal { background: var(--teal); color: var(--teal-text); }
.pill-pink { background: var(--pink); color: var(--pink-text); }

.hl-name {
  background: linear-gradient(120deg, var(--pink) 0%, var(--teal) 100%);
  padding: 0 0.35rem;
  border-radius: 4px;
}
```

- [ ] **Step 3: 建立 BaseLayout.astro**

`src/layouts/BaseLayout.astro`:

```astro
---
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/eb-garamond/600.css';
import '@fontsource/lxgw-wenkai-tc/index.css';
import '@fontsource-variable/inter/index.css';
import '@fontsource-variable/noto-sans-tc/index.css';
import '../styles/global.css';
import ebGaramondWoff2 from '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2?url';

interface Props {
  title: string;
  description: string;
  lang?: string;
  type?: 'website' | 'article';
  ogImage?: string;
}

const { title, description, lang = 'zh-tw', type = 'website', ogImage } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const beaconToken = import.meta.env.PUBLIC_CF_BEACON_TOKEN;
const nav = [
  { href: '/blog', label: 'Blog' },
  { href: '/now', label: 'Now' },
  { href: '/about', label: 'About' },
];
const current = Astro.url.pathname;
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="preload" href={ebGaramondWoff2} as="font" type="font/woff2" crossorigin />
    <link rel="alternate" type="application/rss+xml" title="Yio Chou" href={new URL('rss.xml', Astro.site)} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    {ogImage && <meta property="og:image" content={new URL(ogImage, Astro.site)} />}
    <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {ogImage && <meta name="twitter:image" content={new URL(ogImage, Astro.site)} />}
    {beaconToken && (
      <script
        is:inline
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${beaconToken}"}`}
      ></script>
    )}
  </head>
  <body>
    <header>
      <a class="site-name" href="/">Yio Chou<span class="dot">.</span></a>
      <nav>
        {nav.map((item) => (
          <a href={item.href} class:list={{ active: current.startsWith(item.href) }}>{item.label}</a>
        ))}
      </nav>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <a href="https://github.com/yiochou">GitHub</a>
      <a href="https://www.linkedin.com/in/yio-c-8956111a3/">LinkedIn</a>
      <a href="https://resume.yiochou.com/index.pdf">CV</a>
      <a href="mailto:hi@yiochou.com">hi@yiochou.com</a>
    </footer>
  </body>
</html>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4rem;
  }
  .site-name {
    font-style: italic;
    font-size: 1.15rem;
    font-weight: 600;
    text-decoration: none;
  }
  .site-name .dot { color: var(--pink-deep); }
  nav { display: flex; gap: 1.5rem; }
  nav a {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--ink-3);
    text-decoration: none;
  }
  nav a.active {
    color: var(--ink);
    border-bottom: 2px solid var(--pink);
  }
  main { min-height: 55vh; }
  footer {
    margin-top: 5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--line);
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-family: var(--font-sans);
    font-size: 0.85rem;
  }
  footer a { color: var(--ink-3); text-decoration: none; }
  footer a:hover { color: var(--ink); text-decoration: underline; text-decoration-color: var(--teal-text); }
</style>
```

- [ ] **Step 4: 首頁改用 BaseLayout**

`src/pages/index.astro` 全檔改為:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Yio Chou" description="寫程式,也寫一些字。Yio Chou 的個人網站與部落格。">
  <h1>嗨,我是 <span class="hl-name">Yio</span>。</h1>
</BaseLayout>
```

- [ ] **Step 5: 驗證 build 與 meta 產出**

```bash
npm run build \
  && grep -q 'rel="canonical" href="https://yiochou.com/"' dist/index.html \
  && grep -q 'property="og:title"' dist/index.html \
  && grep -q 'rel="preload"' dist/index.html \
  && ! grep -q 'cloudflareinsights' dist/index.html \
  && echo TASK2-OK
```

預期:輸出 `TASK2-OK`(beacon 未設 env 時不得出現)。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: design tokens, self-hosted fonts, BaseLayout with SEO meta

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Content Collections 與首頁文章列表

**Files:**
- Create: `src/content.config.ts`
- Modify: `src/pages/index.astro`
- 既存內容:`src/content/blog/rebuilding-this-website.md`(已 commit,frontmatter 為 title/description/pubDate/lang)

**Interfaces:**
- Consumes: `BaseLayout.astro`(Task 2)
- Produces: collection `blog`,entry 形狀 `{ id: string; data: { title: string; description: string; pubDate: Date; lang: 'zh-tw' | 'en'; updatedDate?: Date; draft: boolean } }`;collection `pages`(供 Task 5 的 now/about 使用);文章 URL 慣例 `/blog/<id>`

- [ ] **Step 1: 建立 content.config.ts**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    lang: z.enum(['zh-tw', 'en']),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { blog, pages };
```

- [ ] **Step 2: 驗證 schema 會擋壞文章(失敗測試)**

```bash
mkdir -p src/content/pages
printf -- '---\ndescription: missing title\npubDate: 2026-01-01\nlang: zh-tw\n---\nbad\n' > src/content/blog/tmp-bad-post.md
npm run build; echo "exit=$?"
```

預期:build **失敗**(schema 驗證錯誤,訊息含 `title`),`exit=1`。

- [ ] **Step 3: 移除壞文章,確認 build 恢復**

```bash
rm src/content/blog/tmp-bad-post.md
npm run build && echo SCHEMA-OK
```

預期:輸出 `SCHEMA-OK`。

- [ ] **Step 4: 首頁加上文章列表**

`src/pages/index.astro` 全檔改為:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const isNew = (d: Date) => Date.now() - d.valueOf() < THIRTY_DAYS;
const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
---
<BaseLayout title="Yio Chou" description="寫程式,也寫一些字。Yio Chou 的個人網站與部落格。">
  <h1 class="intro-title">嗨,我是 <span class="hl-name">Yio</span>。</h1>
  <p class="intro">寫程式,也寫一些字。相信慢慢寫,比較快。</p>

  <p class="section-label"><span class="pill pill-teal">WRITING</span></p>
  <ul class="post-list">
    {posts.map((post) => (
      <li>
        <a href={`/blog/${post.id}`}>{post.data.title}</a>
        {isNew(post.data.pubDate) && <span class="pill pill-pink">new</span>}
        <span class="date">{fmt(post.data.pubDate)}</span>
      </li>
    ))}
  </ul>
</BaseLayout>

<style>
  .intro-title { font-size: 1.6rem; margin: 0 0 0.25rem; }
  .intro { color: var(--ink-2); margin: 0 0 3rem; }
  .section-label { margin: 0 0 0.75rem; }
  .post-list { list-style: none; margin: 0; padding: 0; }
  .post-list li {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.45rem 0;
  }
  .post-list a { text-decoration: none; }
  .post-list a:hover { text-decoration: underline; text-decoration-color: var(--pink-deep); }
  .date { margin-left: auto; color: var(--ink-3); font-family: var(--font-sans); font-size: 0.8rem; }
</style>
```

- [ ] **Step 5: 驗證首頁列表**

```bash
npm run build \
  && grep -q '關於重寫個人網站這件事' dist/index.html \
  && grep -q 'href="/blog/rebuilding-this-website"' dist/index.html \
  && echo TASK3-OK
```

預期:輸出 `TASK3-OK`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: content collections schema and home page post list

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 文章頁

**Files:**
- Create: `src/pages/blog/[id].astro`、`src/pages/blog/index.astro`

**Interfaces:**
- Consumes: collection `blog`(Task 3)、`BaseLayout`(Task 2)
- Produces: 路由 `/blog/<id>`(文章)與 `/blog`(列表,與首頁同資料;nav 的 Blog 需有落點);文章頁輸出 `<html lang={post.data.lang}>` 與 JSON-LD `BlogPosting`

- [ ] **Step 1: 建立文章頁**

`src/pages/blog/[id].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);

const fmt = (d: Date, lang: string) =>
  d.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.pubDate.toISOString(),
  ...(post.data.updatedDate && { dateModified: post.data.updatedDate.toISOString() }),
  inLanguage: post.data.lang,
  author: { '@type': 'Person', name: 'Yio Chou', url: 'https://yiochou.com' },
  mainEntityOfPage: new URL(`/blog/${post.id}`, Astro.site).toString(),
};
---
<BaseLayout
  title={`${post.data.title} — Yio Chou`}
  description={post.data.description}
  lang={post.data.lang}
  type="article"
>
  <script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd)} />
  <article>
    <p class="meta">
      <span class="pill pill-teal">ESSAY</span>
      <time datetime={post.data.pubDate.toISOString()}>{fmt(post.data.pubDate, post.data.lang)}</time>
    </p>
    <h1>{post.data.title}</h1>
    <div class="prose">
      <Content />
    </div>
  </article>
</BaseLayout>

<style>
  .meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 1rem;
    color: var(--ink-3);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
  }
  h1 { font-size: 1.75rem; margin: 0 0 2rem; }
  .prose :global(h2) { font-size: 1.25rem; margin: 2.5rem 0 0.75rem; }
  .prose :global(p) { margin: 0 0 1.25rem; }
  .prose :global(blockquote) {
    margin: 1.5rem 0;
    padding-left: 1rem;
    border-left: 3px solid var(--pink);
    color: var(--ink-2);
  }
  .prose :global(hr) { border: none; border-top: 1px solid var(--line); margin: 2.5rem 0; }
</style>
```

- [ ] **Step 2: 建立 /blog 列表頁**

`src/pages/blog/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
---
<BaseLayout title="Blog — Yio Chou" description="Yio Chou 的文章列表。">
  <h1 class="page-title">Blog</h1>
  <ul class="post-list">
    {posts.map((post) => (
      <li>
        <a href={`/blog/${post.id}`}>{post.data.title}</a>
        <span class="date">{fmt(post.data.pubDate)}</span>
      </li>
    ))}
  </ul>
</BaseLayout>

<style>
  .page-title { font-size: 1.6rem; margin: 0 0 1.5rem; }
  .post-list { list-style: none; margin: 0; padding: 0; }
  .post-list li { display: flex; align-items: baseline; gap: 0.6rem; padding: 0.45rem 0; }
  .post-list a { text-decoration: none; }
  .post-list a:hover { text-decoration: underline; text-decoration-color: var(--pink-deep); }
  .date { margin-left: auto; color: var(--ink-3); font-family: var(--font-sans); font-size: 0.8rem; }
</style>
```

- [ ] **Step 3: 驗證文章頁產出**

```bash
npm run build \
  && grep -q '<html lang="zh-tw"' dist/blog/rebuilding-this-website/index.html \
  && grep -q 'application/ld+json' dist/blog/rebuilding-this-website/index.html \
  && grep -q 'BlogPosting' dist/blog/rebuilding-this-website/index.html \
  && grep -q '關於重寫個人網站這件事' dist/blog/index.html \
  && echo TASK4-OK
```

預期:輸出 `TASK4-OK`。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: blog post page with JSON-LD and blog index

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Now、About、404 頁

**Files:**
- Create: `src/content/pages/now.md`、`src/content/pages/about.md`、`src/pages/now.astro`、`src/pages/about.astro`、`src/pages/404.astro`

**Interfaces:**
- Consumes: collection `pages`(Task 3 已定義,schema `{ title, description }`)、`BaseLayout`
- Produces: 路由 `/now`、`/about`、`/404`(Cloudflare Pages 自動用 `dist/404.html`)

- [ ] **Step 1: 建立 now.md 與 about.md**

`src/content/pages/now.md`:

```markdown
---
title: Now
description: Yio 現在在做什麼——近況、正在學的東西。
---

_最後更新:2026-07-08_

- 正在用 Astro 重寫這個網站(你看到的就是成果)
- 正在練習公開寫作,中文為主、偶爾英文

想知道這是什麼頁面?見 [nownownow.com](https://nownownow.com/about)。
```

`src/content/pages/about.md`:

```markdown
---
title: About
description: 關於 Yio Chou——工程師,寫程式也寫字。
---

我是 Yio,一個寫程式的人。這裡放我的文章與近況。

找我:[GitHub](https://github.com/yiochou)、[LinkedIn](https://www.linkedin.com/in/yio-c-8956111a3/)、[CV](https://resume.yiochou.com/index.pdf),或寫信到 [hi@yiochou.com](mailto:hi@yiochou.com)。
```

- [ ] **Step 2: 建立 now.astro 與 about.astro**

`src/pages/now.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const page = await getEntry('pages', 'now');
if (!page) throw new Error('missing src/content/pages/now.md');
const { Content } = await render(page);
---
<BaseLayout title={`${page.data.title} — Yio Chou`} description={page.data.description}>
  <h1 class="page-title">{page.data.title}</h1>
  <Content />
</BaseLayout>

<style>
  .page-title { font-size: 1.6rem; margin: 0 0 1.5rem; }
</style>
```

`src/pages/about.astro`:同上,把兩處 `'now'` 換成 `'about'`、錯誤訊息換成 `missing src/content/pages/about.md`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const page = await getEntry('pages', 'about');
if (!page) throw new Error('missing src/content/pages/about.md');
const { Content } = await render(page);
---
<BaseLayout title={`${page.data.title} — Yio Chou`} description={page.data.description}>
  <h1 class="page-title">{page.data.title}</h1>
  <Content />
</BaseLayout>

<style>
  .page-title { font-size: 1.6rem; margin: 0 0 1.5rem; }
</style>
```

- [ ] **Step 3: 建立 404 頁**

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404 — Yio Chou" description="這一頁不存在。">
  <h1 class="page-title">404</h1>
  <p>這一頁不存在。回<a href="/">首頁</a>看看?</p>
</BaseLayout>

<style>
  .page-title { font-size: 1.6rem; margin: 0 0 1rem; }
</style>
```

- [ ] **Step 4: 驗證**

```bash
npm run build \
  && grep -q 'nownownow.com' dist/now/index.html \
  && grep -q 'hi@yiochou.com' dist/about/index.html \
  && test -f dist/404.html \
  && echo TASK5-OK
```

預期:輸出 `TASK5-OK`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: now, about, and 404 pages

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: sitemap、RSS、robots.txt

**Files:**
- Create: `src/pages/rss.xml.js`、`public/robots.txt`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: collection `blog`、`astro.config.mjs` 的 `site`
- Produces: `dist/sitemap-index.xml`(+分片)、`dist/rss.xml`、`dist/robots.txt`

- [ ] **Step 1: 安裝套件**

```bash
npm install @astrojs/sitemap @astrojs/rss
```

- [ ] **Step 2: 啟用 sitemap integration**

`astro.config.mjs` 全檔改為:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yiochou.com',
  integrations: [sitemap()],
});
```

- [ ] **Step 3: 建立 RSS 端點**

`src/pages/rss.xml.js`:

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return rss({
    title: 'Yio Chou',
    description: '寫程式,也寫一些字。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 4: 建立 robots.txt**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://yiochou.com/sitemap-index.xml
```

- [ ] **Step 5: 驗證**

```bash
npm run build \
  && test -f dist/sitemap-index.xml \
  && grep -q 'yiochou.com/blog/rebuilding-this-website' dist/sitemap-0.xml \
  && grep -q '關於重寫個人網站這件事' dist/rss.xml \
  && grep -q 'sitemap-index.xml' dist/robots.txt \
  && echo TASK6-OK
```

預期:輸出 `TASK6-OK`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sitemap, RSS feed, robots.txt

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: OG 分享圖自動生成

**Files:**
- Create: `src/assets/og/LXGWWenKaiTC-Regular.ttf`(下載)、`src/pages/blog/[id]/og.png.ts`
- Modify: `src/pages/blog/[id].astro`(接上 `ogImage` prop)

**Interfaces:**
- Consumes: collection `blog`、`BaseLayout` 的 `ogImage?: string` prop(Task 2 已定義)
- Produces: 每篇文章的 `/blog/<id>/og.png`(1200×630 PNG,米白底、粉綠漸層點、文章標題)

- [ ] **Step 1: 安裝套件並下載字型**

```bash
npm install satori sharp
mkdir -p src/assets/og
curl -L -o src/assets/og/LXGWWenKaiTC-Regular.ttf \
  https://github.com/lxgw/LxgwWenkaiTC/releases/latest/download/LXGWWenKaiTC-Regular.ttf
file src/assets/og/LXGWWenKaiTC-Regular.ttf
```

預期:`file` 輸出含 `TrueType`。若 curl 得到 404,打開 https://github.com/lxgw/LxgwWenkaiTC/releases 查最新版資產檔名後重試(檔名可能含版本號)。

- [ ] **Step 2: 建立 OG 圖端點**

`src/pages/blog/[id]/og.png.ts`:

```ts
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';

const font = fs.readFileSync('./src/assets/og/LXGWWenKaiTC-Regular.ttf');

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as CollectionEntry<'blog'>;
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#fffdf8',
          color: '#292524',
          fontFamily: 'LXGW WenKai TC',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      backgroundColor: '#b0f3f1',
                      color: '#134e4a',
                      fontSize: '22px',
                      letterSpacing: '6px',
                      padding: '6px 22px',
                      borderRadius: '99px',
                      marginBottom: '36px',
                      alignSelf: 'flex-start',
                    },
                    children: 'BLOG',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontSize: '58px', lineHeight: 1.4 },
                    children: post.data.title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '18px', fontSize: '30px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            width: '40px',
                            height: '40px',
                            borderRadius: '20px',
                            backgroundImage: 'linear-gradient(135deg, #ffcfdf 0%, #b0f3f1 100%)',
                          },
                        },
                      },
                      { type: 'div', props: { style: { display: 'flex' }, children: 'Yio Chou' } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', fontSize: '26px', color: '#a8a29e' },
                    children: 'yiochou.com',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'LXGW WenKai TC', data: font, weight: 400, style: 'normal' }],
    }
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
```

- [ ] **Step 3: 文章頁接上 og:image**

`src/pages/blog/[id].astro` 的 `<BaseLayout ...>` 加一個屬性:

```astro
<BaseLayout
  title={`${post.data.title} — Yio Chou`}
  description={post.data.description}
  lang={post.data.lang}
  type="article"
  ogImage={`/blog/${post.id}/og.png`}
>
```

- [ ] **Step 4: 驗證**

```bash
npm run build \
  && file dist/blog/rebuilding-this-website/og.png | grep -q 'PNG image data, 1200 x 630' \
  && grep -q 'og:image" content="https://yiochou.com/blog/rebuilding-this-website/og.png"' dist/blog/rebuilding-this-website/index.html \
  && echo TASK7-OK
```

預期:輸出 `TASK7-OK`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build-time OG image generation with satori + sharp

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: 部署切換與最終驗收

**Files:**
- 無程式碼變更(Cloudflare 設定 + 驗收);merge `redesign` → `main`

**Interfaces:**
- Consumes: 完整可 build 的專案(Task 1–7)
- Produces: 上線的新網站

- [ ] **Step 1: 本機最終檢查**

```bash
npm run build && npx astro preview &
sleep 2
for p in / /blog /blog/rebuilding-this-website /now /about /rss.xml /sitemap-index.xml /robots.txt; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "http://localhost:4321$p"
done
kill %1
```

預期:全部 `200`。

- [ ] **Step 2: 推分支,請使用者更新 Cloudflare Pages 設定(使用者操作)**

```bash
git push -u origin redesign
```

請使用者在 Cloudflare dashboard → Pages → yiochou.com 專案:

1. **Build 設定**:Build command = `npm run build`,Build output directory = `dist`
2. **環境變數**:`NODE_VERSION` = `22`;(選用)`PUBLIC_CF_BEACON_TOKEN` = Web Analytics 的 token(dashboard → Analytics & Logs → Web Analytics 建立取得)
3. 確認 preview deployment(redesign branch)建置成功、頁面正常

**此步驟需使用者確認完成才能繼續。**

- [ ] **Step 3: 合併上線**

```bash
git checkout main && git merge redesign && git push
```

- [ ] **Step 4: 線上驗收清單(使用者/執行者共同檢查)**

- `https://yiochou.com/`、`/blog`、`/blog/rebuilding-this-website`、`/now`、`/about` 正常顯示,手機寬度正常
- `/resume` 轉址到 CV PDF(_redirects 生效)
- 不存在的網址顯示自訂 404
- 用 https://pagespeed.web.dev 跑首頁與文章頁:Performance / SEO / Accessibility ≥ 95
- 用 https://cards-dev.twitter.com/validator 或貼到 Slack 確認文章 OG 圖顯示
- 若已設 beacon token:Cloudflare Web Analytics 面板開始有數據

- [ ] **Step 5: 清理**

```bash
git branch -d redesign && git push origin --delete redesign
```

---

## Self-Review 紀錄

- **Spec coverage**:IA 四頁+404(Task 3–5)、視覺 tokens 與字型(Task 2)、schema 含 lang/draft(Task 3)、_headers/_redirects 保留(Task 1)、sitemap/RSS/robots(Task 6)、meta/canonical/OG/Twitter(Task 2)、JSON-LD(Task 4)、OG 圖(Task 7)、Analytics(Task 2 條件式 + Task 8 設 token)、驗收標準(Task 8)——全數對應
- **Spec 微調(有意識的偏離)**:hreflang 不實作——每篇文章只有單一語言版本、無 alternate 頁面,hreflang 無對象;以 `<html lang>`、`inLanguage`(JSON-LD)落實 spec 的語言標記意圖
- **佔位掃描**:無 TBD/TODO;所有步驟含完整程式碼與指令
- **型別/命名一致性**:`BaseLayout` props(Task 2 定義)與 Task 4/5/7 使用一致;collection 名 `blog`/`pages`、URL `/blog/<id>` 全計畫一致
