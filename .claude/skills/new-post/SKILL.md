---
name: new-post
description: Use when Yio explicitly invokes /new-post with a title for a yiochou.com blog post. Do not trigger on casual mentions of wanting to write something.
---

# New Post

Yio supplies the title. You work out `slug`, `lang`, and `description`. He approves them before anything is written to disk.

`pubDate` (today) and `draft: true` are filled by the script. Never propose them.

Scope is frontmatter only. The post's outline is a separate conversation, after the file exists.

## Step 1: Propose, do not create

Your first response is a proposal and nothing else. No file, no `npm run new-post`, no Bash call.

The proposal is exactly this shape:

```
title:       Why I Don't Use Dashes
slug:        why-i-dont-use-dashes
lang:        en
description: Short sentences do the work. Punctuation shouldn't.
```

Then one line naming the field you are least sure about and why. Then stop and wait.

The description is a guess drawn from the title, because a title alone rarely says what a post argues. Say so in that line. A guess presented as settled is the failure mode here; a guess he can react to is the point.

## Field rules

| Field | Rule |
|---|---|
| `slug` | ASCII, lowercase, hyphens. 2 to 4 words. Translate the meaning of a Chinese title, never transliterate. `六點的泳池` becomes `pool-at-six`, not `liu-dian-de-yong-chi`. |
| `lang` | `en` or `zh-tw`. Infer from the language the **body** will be written in, not the title. A Chinese post can carry an English title. If the title alone does not settle it, ask in the same line. |
| `description` | One line. Same language as the post. It reaches `<meta>`, the link preview card, and the RSS feed, so it is public copy: no em dashes, short sentences, periods for pauses, understated. Say what the post argues, not which category it belongs to. |

## Step 2: Create, after he approves

```bash
npm run new-post -- "<title>" [--slug <slug>] [--lang zh-tw] [--desc "<description>"]
```

Pass `--slug` whenever the agreed slug differs from what the title would produce on its own, which is always for a Chinese title. Pass `--lang` only for `zh-tw`; `en` is the default.

The script refuses to overwrite an existing file. If that happens, propose a different slug instead of forcing it.

Then open the file and offer to work on the outline.

## Red flags

- About to call Bash in the same turn the title arrived
- "The title is unambiguous, I'll just create it and he can fix the frontmatter"
- A description that restates the title in more words
- An empty `description` to sidestep the discussion
- Proposing a `pubDate`
- Transliterating a Chinese title into the slug
