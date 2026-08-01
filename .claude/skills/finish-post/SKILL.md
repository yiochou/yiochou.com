---
name: finish-post
description: Use when Yio explicitly invokes /finish-post for a yiochou.com draft he has finished writing. Fills in the description, reviews title and slug against the finished body, then publishes. Do not trigger on casual mentions of being done with a post.
---

# Finish Post

The body is written. Everything `/new-post` had to guess from a title alone, you can now read.

Scope is frontmatter plus publishing. Do not edit the body. If a sentence in it bothers you, say so at the end and leave it alone.

## Step 1: Read the whole post

Read the file end to end before proposing anything. Not the first paragraph, not a skim for keywords. The point of this skill is that you have the argument in front of you and `/new-post` did not.

If the file has no body past the frontmatter, stop and say so. There is nothing to finish.

## Step 2: Propose, do not write

Your first response is a proposal and nothing else. No edit, no build, no `draft: false`.

The proposal is exactly this shape:

```
title:       人生 4 千個禮拜
slug:        four-thousand-weeks
description: 承認做不完,才有得選。

破折號:      無
```

Then, for each of `title` and `slug`, one line: keep it, or change it and why. Then stop and wait.

Most of the time the answer for both is keep. Say so plainly and move on. Proposing changes to prove you read carefully is worse than proposing nothing.

## What each field is for

`description` is the whole reason this skill exists. It reaches three places, all of them outside the site:

- `<meta name="description">`, the line under the title in search results
- `og:description` and `twitter:description`, the preview card in Slack, LINE, Twitter
- the RSS item summary

It does **not** reach the OG image. `src/pages/blog/[id]/og.png.ts` draws the title and nothing else. It does not appear on the post page or the homepage list either. Its only reader is someone deciding whether to click.

So: one line, same language as the post, no em dashes, short sentences, periods for pauses, understated. Say what the post argues. Not what it is about, not which category it belongs to, not a longer version of the title.

`title` is now worth a second look because titles drift while writing. Only raise it if the finished post argues something the title does not point at. A title that is merely plainer than it could be is fine.

`slug` is free to change while `draft: true` and expensive after. Nothing links to the URL yet. Apply the same rules as `/new-post`: ASCII, lowercase, hyphens, 2 to 4 words, translate meaning rather than transliterate. Only raise it if the subject genuinely moved.

## Checks

**Dashes, description only.** Scan the proposed description for `—`, `–`, and `--`. The body is prose and is not your business. If one appears, rewrite the description without it before proposing; do not propose a line and then note that it breaks the rule.

**Language.** Compare `lang` in the frontmatter against what the body is actually written in. A Chinese post can carry an English title, so judge by the body. If they disagree, flag it in the proposal.

## Step 3: Apply, after he approves

In order:

1. Write the approved `description`, and `title` or `slug` if either changed. A slug change is a file rename: `git mv src/content/blog/<old>.md src/content/blog/<new>.md`.
2. Set `draft: false`.
3. Run `npm run build`.

The build is the real check. It is the first time the post passes the zod schema for real, and the first time satori renders its OG image, which is where a missing glyph in `LXGWWenKaiTC-Regular.ttf` would show up. Draft posts are filtered out of every `getCollection` call, so none of this runs until `draft: false`.

If the build fails, say so with the error and leave `draft: false` in place. Do not revert it to hide a failure.

Do not commit. Do not push. Report what changed and let him look at it.

## Red flags

- Proposing a description before reading the body to the end
- A description that restates the title in more words
- Changing the title or slug to look thorough
- Editing the body
- `draft: false` in the same turn the proposal was made
- Skipping the build because the change was "just a description"
- Saying the build passed without running it
- Committing
