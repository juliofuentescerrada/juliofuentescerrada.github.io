# juliofuentescerrada.github.io

Personal site of Julio Fuentes: a portfolio of personal engineering projects, plus notes on what was learned while building them. Published with GitHub Pages at <https://juliofuentescerrada.github.io>.

This README describes the site and its planned extensions. Contributor instructions are in [AGENTS.md](./AGENTS.md). The delivery plan is in [ROADMAP.md](./ROADMAP.md).

## Current status

The Astro foundation is implemented: a static hero page, base layout, local fonts and GitHub Pages workflow. Projects, notes and the remaining home sections are planned. Run `npm install` and `npm run dev` locally (Node 22.23.4 or newer). Actual deployment and the Pages source setting still need verification in GitHub.

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
status: Live demo available
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
draft: true
```

Body sections: The problem, What I tried, What worked, The trade-off, What I would change, Takeaways.

**Topics:** Applied AI, Azure, .NET, Angular, Architecture, Data, AI-assisted development.

Entries with `draft: true` are excluded from public pages, indexes and feeds. A non-draft project appears on the home page even when `caseStudyPublished` is false; its card links to its repository. Generate case-study routes and previous/next links only for non-draft projects with `caseStudyPublished: true`. Notes retain the single `draft` publication flag.

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
