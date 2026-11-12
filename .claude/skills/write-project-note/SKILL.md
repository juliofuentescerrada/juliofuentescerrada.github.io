---
name: write-project-note
description: Research one of the owner's project repositories and turn what was learned building it into notes for this site. Use when the owner asks to brainstorm, plan, draft, illustrate or publish a note about a project (Pauper Pilot, Arcana, Herald, Steward, Archivist…).
---

# Write a project note

A note is not a description of a repository or its features. It explains something specific the owner learned while building a project: a decision that changed, a problem nobody expected, a trade-off, something they would do differently. Notes are written from the owner’s point of view, in English, for engineers and hiring managers who may know nothing about the project’s domain.

The work happens in this repository, which holds the format and publishes the notes. The project repository is only a source: clone it read-only and never write to it.

Work in phases and stop where a phase says so. Talk to the owner in the language they use; the note itself is always in English.

## 1. Research the project

Input: the project repository (`owner/name`). Clone it (shallow is fine; fetch more history if the git log matters) next to this repository.

1. Read its agent instructions first (`CLAUDE.md`, `AGENTS.md`): they hold the project’s rules, and many rules exist because something went wrong.
2. Study the real history, not only the current state, using whatever the repository has:
   - decision records: `design.md` files, ADRs, archived OpenSpec changes (`openspec/changes/archive/`), the roadmap and what was deferred or discarded;
   - git history: reverts, large refactors, files rewritten several times;
   - friction: comments such as “workaround” or “because”, pinned versions, limits and checks added after a failure, tests written for one specific bug.
3. Count and measure from the repository itself. Every number that may reach a note must come from a file or a command you ran, and you must be able to say which one. Do not round up or estimate a count; if a figure cannot be verified (for example, a grep that also matches unrelated text), drop it.

## 2. Brainstorm (stop here)

Propose 10–15 note ideas. For each one:

- a provisional title, specific rather than generic (in English, as it would be published);
- the lesson in one or two sentences: what the owner believed, what happened, what they know now;
- the evidence: paths, commits or documents that support it;
- the type: architecture decision, error or surprise, process, tool or technique, something to do differently;
- who outside the project would find it useful;
- an interest rating from 1 to 3.

Then group them by theme, mark overlaps that could merge, recommend the 3–4 to start with and why, and list what the repository cannot tell you (motivation, alternatives tried outside the code, time spent, frustrations) as concrete questions.

Stop and wait for the owner’s answers and choices. The owner may steer the series towards an angle (for example, process and product decisions); rebuild the series around it rather than appending to the first list.

## 3. Plan the series

Agree on a short series (about five notes) with one thesis per note, the cases each one uses and the order. One note usually works as the opening and the others link back to it. Length: 800–1,200 words per note unless the owner says otherwise.

## 4. Draft

Create `src/content/notes/<id>.md` with `draft: true`. The id is lowercase and hyphenated, starting with the project id (`pauper-pilot-spec-driven-development`).

```yaml
title: Where spec-driven development actually paid off
summary: One sentence that states the lesson, not the topic.
date: 2026-11-11                 # the intended publication date; the owner confirms it
project: pauper-pilot            # id of a file in src/content/projects/
topic: AI-assisted development   # one of src/lib/note-topics.ts
tags: [Spec-driven development, OpenSpec]
takeaways:                       # 3–4 transferable lessons, shown in their own box
  - With an AI agent, the scarce resource is not code but well-defined decisions.
draft: true
```

Quote any frontmatter value that contains `: ` (a title such as `"Splitting a document for RAG: let its structure decide"`); unquoted, it breaks the YAML and the build.

Body sections, in this order, as `##` headings: The problem, What I tried, What worked, The trade-off, What I would change. Do not add a Takeaways section to the body.

Writing rules (see also “Writing guidelines” in `README.md`):

- **Facts only.** No invented metrics, dates, results or quotes. Anything missing becomes a `[PLACEHOLDER]` and the note stays a draft.
- **Little domain jargon.** Readers do not know the project’s domain. Name the domain once, early, then describe things by what they are (“deck types”, not the game’s term). Keep engineering terms such as “medoid”, explained in the same sentence.
- **Concrete.** Lead each case with the situation, show the data that drove the decision, then the decision. Tables are fine for small comparisons.
- **The owner’s voice.** First person, plain and factual; no claims about how others see the owner. Do not name employers, clients or their products.
- **Lists:** prefer lists for parallel items, keep paragraphs for reasoning.
- **Typography:** typographic quotes and apostrophes (“ ” ’) in prose; straight ones only inside code.
- **Links:** linking to the owner’s repositories is fine, even private ones.

Show the draft to the owner and iterate on the text before any visual work.

## 5. Visuals (offer, then generate on request)

While drafting, tell the owner where a diagram or image would help (a process loop, an architecture, a chart of the data behind a decision) and why. Generate one only when the owner asks.

- Save it as `public/notes/<project>/<name>.svg` and reference it from the body with an absolute path and an alt text that describes what the diagram shows, not what it is.
- Notes are read in a 720px column and at phone width (about 312px of content). Draw for that: a vertical layout with a viewBox about 400px wide, and `width`/`height` attributes set to the viewBox size so it never grows past it. Body text inside the SVG at 14px or more. Wide horizontal diagrams become unreadable.
- Use the site’s tokens as literal colors (`--ground` #0B0D10, `--surface` #14181D, `--line` #2A3038, `--ink` #F4F6F8, `--body` #C5CCD3, `--muted` #98A2AC, `--accent` #C6F432 for the one thing that matters most) and font stacks that start with Space Grotesk, Inter and JetBrains Mono (an SVG shown with `<img>` cannot load the site’s fonts, so the fallbacks must look acceptable).
- Include `<title>` and `<desc>` with `role="img"`.
- Render it with Playwright at 360px and 1280px, look at the screenshots, and fix overlaps or lines that do not connect before showing it.

## 6. Validate

1. `npm run check` and `npm run build` with no errors or warnings.
2. Confirm the draft is absent from `dist/` (no page, no index entry, no feed item).
3. Run `npm run dev` and review the note, the index, its topic page and the home page at 360px, 768px and 1280px: no horizontal overflow, readable tables and diagrams.

## 7. Publish

1. Commit on a branch and open a pull request with the purpose, the validation done and screenshots. The draft can be merged as a draft: it stays out of the build.
2. The owner reviews the text and confirms every fact, the date and the links.
3. Publishing is a separate, small change: set `draft: false` (and the final `date`), run the checks again and merge to `main`. The workflow deploys to GitHub Pages.
4. Tick the related tasks in `ROADMAP.md` only with evidence.
