// Scaffold a new blog post in src/content/blog with frontmatter matching the collection schema.
// Usage: npm run new-post -- "Post title" [--lang zh-tw] [--slug custom-slug] [--desc "One line."]
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const LANGS = ['en', 'zh-tw'];

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const args = process.argv.slice(2);
const opts = { lang: 'en', slug: '', desc: '' };
const rest = [];
for (let i = 0; i < args.length; i++) {
  const key = args[i].replace(/^--/, '');
  if (args[i].startsWith('--') && key in opts) {
    const value = args[++i];
    if (value === undefined) fail(`--${key} needs a value`);
    opts[key] = value;
  } else {
    rest.push(args[i]);
  }
}

const title = rest.join(' ').trim();
if (!title) {
  fail('usage: npm run new-post -- "Post title" [--lang zh-tw] [--slug custom-slug] [--desc "One line."]');
}
if (!LANGS.includes(opts.lang)) fail(`--lang must be one of ${LANGS.join(', ')}`);

const slug =
  opts.slug.trim() ||
  title
    .toLowerCase()
    .replace(/['’]/g, '') // don't -> dont, not don-t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
if (!slug) {
  fail('could not derive a slug from the title; pass one with --slug');
}

const now = new Date();
const pubDate = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');

// The title lands in YAML, so single quotes are the safe wrapper. Double any it contains.
const yaml = (s) => `'${s.replace(/'/g, "''")}'`;

const file = join(DIR, `${slug}.md`);
await mkdir(DIR, { recursive: true });
if (await access(file).then(() => true, () => false)) {
  fail(`src/content/blog/${slug}.md already exists; pick another slug`);
}

const body = `---
title: ${yaml(title)}
description: ${yaml(opts.desc)}
pubDate: ${pubDate}
lang: ${opts.lang}
draft: true
---

`;

await writeFile(file, body);
console.log(`wrote src/content/blog/${slug}.md (draft)`);
