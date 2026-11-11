# juliofuentescerrada.github.io

Personal site of Julio Fuentes: a portfolio of personal engineering projects, plus notes on what was learned while building them. Published with GitHub Pages at <https://juliofuentescerrada.github.io>.

This README describes the site and its planned extensions. Contributor instructions are in [AGENTS.md](./AGENTS.md). The delivery plan is in [ROADMAP.md](./ROADMAP.md).

## Current status

The home page includes the hero, at-a-glance figures, five collection-backed project cards, the latest notes, AI workflow, technologies and experience. Project copy comes from the approved prototype; experience shows titles and dates only. Notes (M3) have an index with topic pages, a page per note and an RSS feed; the home page shows an empty state until the first note is published. Case-study pages begin in M2. Run `npm install` and `npm run dev` locally (Node 22.23.4 or newer). GitHub Pages is configured to deploy with GitHub Actions. Browser-based visual and keyboard review remains pending.

The five project repositories are currently private. Their links are retained at the owner’s request and require repository access; this site does not change their visibility.

## Purpose

- Extend the GitHub profile README into a full site: who I am, what I build, how I work.
- Give each project a case study that explains decisions and trade-offs, not only features.
- Publish short notes with the learnings from each project, so the site keeps growing.

**Audience:** recruiters, hiring managers and engineers evaluating my profile. They skim first and read in depth second, so every page must make sense from its headings alone.

## Site map

| Route | Page | Source |
| --- | --- | --- |
| `/` | Home: hero, at-a-glance figures, projects, latest notes, how I develop with AI, technologies, experience, contact | `src/pages/index.astro` |
| `/projects/<id>/` | Case study | `src/content/projects/*.md` |
| `/notes/` | Notes index, filterable by topic | `src/pages/notes/index.astro` |
| `/notes/topics/<topic>/` | Notes on one topic | `src/pages/notes/topics/[topic].astro` |
| `/notes/<id>/` | Single note | `src/content/notes/*.md` |
| `/rss.xml` | Feed of published notes | `src/pages/rss.xml.ts` |

## Stack

- **Astro** (static output) with **TypeScript** in strict mode.
- **Content collections** in Markdown for projects and notes.
- Plain **CSS with custom properties**. No CSS framework, no UI library.
- No client-side JavaScript unless a feature needs it; when it does, keep it small and local to the component.
- **GitHub Actions** builds and deploys to **GitHub Pages** on every push to `main`.

## Project structure

```
src/
  styles/global.css        Design tokens and base styles
  layouts/Base.astro       <head>, navigation, footer
  components/              SectionHeading, ProjectRow, NoteCard, StatBand, TagList…
  data/home.ts             Approved home copy: AI practices, technologies, experience
  content.config.ts        Collection schemas
  content/
    projects/              One Markdown file per case study
    notes/                 One Markdown file per note
  pages/                   Routes (see site map)
public/                    Static files (.nojekyll, favicon, images)
Julio Fuentes — Portfolio prototype.html  Approved design reference (repository root)
.github/workflows/deploy.yml
```

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npx astro check    # type and content schema checks
```

## Content model

**Projects** (`src/content/projects/<id>.md`)

```yaml
title: Arcana
focus: Applied AI & evaluation        # short engineering focus
summary: One or two sentences.
order: 3                               # position on the home page
tags: [RAG, Retrieval evaluation, MCP]
stack: [.NET API, Angular, PostgreSQL + pgvector, Microsoft Foundry]
repo: https://github.com/juliofuentescerrada/arcana
live: https://…                        # optional
liveLabel: Live demo                   # optional, defaults to Live demo
status: Live demo available            # optional
draft: false
caseStudyPublished: false              # publish the case study separately
```

Body sections, in this order: Context, Architecture, Decisions and trade-offs, Evaluation, What I learned, Next steps.

**Notes** (`src/content/notes/<id>.md`)

```yaml
title: Teaching a RAG assistant to abstain
summary: One sentence.
date: 2026-01-01
project: arcana                        # optional, id of a project
topic: Applied AI                      # one of the topics below
tags: [RAG, Evaluation]
takeaways:                             # one or more, shown in the takeaways box
  - Decide what the system does when its sources fall short.
draft: true
```

Body sections, in this order: The problem, What I tried, What worked, The trade-off, What I would change. The takeaways live in the frontmatter, not in the body, so the note page can show them in their own box.

**Topics:** Applied AI, Azure, .NET, Angular, Architecture, Data, Product, Security, AI-assisted development. The list lives in `src/lib/note-topics.ts`; the schema rejects any other value.

**Images and diagrams** for a note go in `public/notes/<project>/` and are referenced from the body with an absolute path and a descriptive alt text. Notes are read in a 720px column and at phone width, so diagrams are drawn for that width (vertical rather than wide) with the site’s colors.

**Writing a note:** follow the `write-project-note` skill in `.claude/skills/write-project-note/SKILL.md`. It covers researching a project repository, brainstorming, drafting, visuals and validation.

Project `draft` defaults to `true`; `caseStudyPublished` defaults to `false`. A non-draft project appears on the home page even when its case study is unpublished; its card links to its repository and optional demo. All five initial project cards are public, with empty, unpublished case-study bodies. M2 will generate case-study routes and previous/next links only for non-draft projects with `caseStudyPublished: true`.

Notes use the single `draft` flag, which defaults to `true`. Drafts are shown, marked as drafts, by `npm run dev` so they can be reviewed in place, and are excluded from every build: no page, no entry in the index or topic pages, no card on the home page and no feed item. To publish a note, set `draft: false` and merge to `main`.

## Design system

The approved look is dark, high-contrast and typographic: oversized headings, hairline rules, one bright accent. The reference is [Julio Fuentes — Portfolio prototype.html](<./Julio Fuentes — Portfolio prototype.html>). It contains the home, Arcana case study, notes index and single-note views. Keep the original export and embedded font licenses intact. Its unpacking scripts are for viewing the reference, not production code. Placeholder content requires owner completion or validation before publication. Experience must show titles and dates only, overriding the descriptions in the prototype.

```css
:root {
  --ground:  #0B0D10;   /* page background */
  --surface: #14181D;   /* cards */
  --ink:     #F4F6F8;   /* headings, links */
  --body:    #C5CCD3;   /* body text */
  --muted:   #98A2AC;   /* labels, metadata */
  --line:    #2A3038;   /* rules and borders */
  --accent:  #C6F432;   /* single accent */
  --accent-surface: #1B2114; /* note takeaways box */
  --invert-ground: #F4F6F8;  /* light section background */
  --invert-ink:    #0B0D10;
}
```

- **Type:** Space Grotesk (headings, 600–700), Inter (body), JetBrains Mono (labels and metadata).
- **Display sizes** are fluid with `clamp()`; headings use tight line-height and negative letter-spacing.
- **Layout:** `max-width: 1200px` container (720px for a note body), flex rows that wrap; every page must work at phone width.
- **Accent** is used for emphasis only: one highlighted word, labels, primary links, the stack band and the footer.
- No gradients, no emoji, no skill bars or proficiency percentages.

## Writing guidelines

- **English** throughout.
- **Plain, factual tone.** Describe what was done and why. Do not claim how others see me or attribute recognition ("the go-to reference", "trusted by the team").
- **Never invent facts.** No made-up metrics, dates, results or quotes. If a fact is missing, leave a `[PLACEHOLDER]` and keep the entry as a draft.
- **Experience section:** job titles and dates only. Do not name employers, clients or their products anywhere on the site.
- **Personal projects only.** Work for employers is described in general terms; no internal details.
- Use typographic quotes and apostrophes in prose.

## Quality bar

- Semantic HTML: real `<a>`, `<button>`, headings in order, one `<h1>` per page.
- Accessible contrast (4.5:1 for text) and visible focus states; touch targets of at least 44px.
- The build must pass `npx astro check` and `npm run build` with no warnings before a change is considered done.
- Keep pages fast: no unnecessary scripts, optimized images, fonts loaded with `font-display: swap`.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. Repository setting: **Settings → Pages → Source: GitHub Actions**. `site` in `astro.config.mjs` is `https://juliofuentescerrada.github.io`; no `base` is needed because this is the user site repository.

## Contact

- Email: <juliofuentescerrada@outlook.com>
- LinkedIn: <https://www.linkedin.com/in/juliofuentescerrada/>
- GitHub: <https://github.com/juliofuentescerrada>
