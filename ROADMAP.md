# Roadmap

Milestones for building the site, in order. Each one ends with something deployed. Tick tasks as they are completed. Project context is in [README.md](./README.md); contributor rules are in [AGENTS.md](./AGENTS.md). The M0 application foundation is deployed on GitHub Pages; browser QA remains pending. Content publication requires owner-supplied or owner-validated facts; retain placeholders in unpublished entries.

## M0 · Foundation and first deployment

**Goal:** an empty but real site, live on GitHub Pages, with the design tokens and base layout in place.

- [x] Scaffold the Astro project (minimal template, TypeScript strict)
- [x] Set `site` in `astro.config.mjs`; add `public/.nojekyll`
- [x] Receive the approved reference: [Portfolio prototype](<./Julio Fuentes — Portfolio prototype.html>) (four views; implementation and visual verification remain pending)
- [x] `src/styles/global.css`: tokens, reset, base typography, focus styles
- [x] Load Space Grotesk, Inter and JetBrains Mono (self-hosted)
- [x] `Base.astro`: `<head>`, navigation and footer (“Let’s talk.”)
- [x] Install and configure Astro checks; run `npx astro check` and `npm run build` in CI without warnings
- [x] Temporary home page with the hero only
- [x] Add `.github/workflows/deploy.yml` with validation, build and deployment
- [x] Verify Pages source is GitHub Actions and the first deployment succeeds ([first successful run](https://github.com/juliofuentescerrada/juliofuentescerrada.github.io/actions/runs/42908371903))
- [ ] Visually verify the hero, keyboard access and layout at phone width (browser unavailable in this session)

**Done when:** a push to `main` publishes the hero at `https://juliofuentescerrada.github.io` and it reads well on a phone.

## M1 · Home page

**Goal:** the complete home page from the prototype, with real content.

- [ ] Components: `SectionHeading`, `StatBand`, `StackBand`, `ProjectRow`, `NoteCard`
- [ ] Hero with highlighted word and both calls to action
- [ ] At-a-glance figures and stack band
- [ ] Define the projects collection in `content.config.ts` and one Markdown file per project
- [ ] Projects section: five public collection-backed cards linking to repositories; `draft` hides the whole project and `caseStudyPublished` defaults to false
- [ ] “How I develop with AI” on the inverted light section
- [ ] Technologies table
- [ ] Experience timeline: titles and dates only, no employer names
- [ ] Responsive pass at 360px, 768px and 1280px

**Done when:** the home page matches the prototype and every link works.

## M2 · First published case study

**Goal:** Arcana has a published case study using the existing projects collection.

- [ ] Generate case-study routes only for non-draft projects with `caseStudyPublished: true`
- [ ] `projects/[id].astro` template: header, meta strip, on-this-page nav, sections
- [ ] Decisions and trade-offs table (scrolls horizontally on small screens)
- [ ] Evaluation tiles and architecture diagram slot
- [ ] Owner supplies or validates Arcana decisions and measured results; complete placeholders before publishing
- [ ] Previous / next navigation between published case studies only

**Done when:** `/projects/arcana/` is live with no placeholders, and the other four project cards remain public with repository links and `caseStudyPublished: false`.

## M3 · Notes

**Goal:** the notes section works end to end and has its first entries.

- [ ] `notes` schema, with `draft` entries excluded from build, index and feed
- [ ] `notes/index.astro`: list ordered by date, topic filter
- [ ] `notes/[id].astro`: article layout, code blocks, takeaways box, related links
- [ ] Latest three notes on the home page, from the collection
- [ ] “What I learned” links from case studies to notes
- [ ] `rss.xml` and feed link in `<head>`
- [ ] Owner supplies or validates the first two notes; resolve placeholders and dates before publication

**Done when:** two notes are live, appear on the home page and in the feed, and a draft stays hidden.

## M4 · Remaining case studies

**Goal:** every project on the home page has its own case study.

- [ ] Steward: platform decisions, delivery and cost trade-offs
- [ ] Herald: architecture and implementation status
- [ ] Archivist: pipeline and evaluation
- [ ] Pauper Pilot: product and delivery
- [ ] At least one note per project
- [ ] Architecture diagrams where they help

**Done when:** all five “Case study” links lead to a published page.

## M5 · Quality and discoverability

**Goal:** the site is ready to share widely.

- [ ] Page titles, descriptions, canonical URLs and Open Graph images
- [ ] Sitemap and `robots.txt`
- [ ] Custom 404 page
- [ ] Accessibility review: keyboard navigation, contrast, headings, alt text
- [ ] Lighthouse pass on performance, accessibility, best practices and SEO
- [ ] Link the site from the GitHub profile README and LinkedIn
- [ ] Decide on a custom domain; if yes, add `public/CNAME` and update `site`

**Done when:** sharing a link shows a correct preview and audits report no blocking issues.

## Later

Ideas to consider once the above is done, in no fixed order.

- Tag pages and search across notes
- Light theme toggle
- Spanish version of the site
- Privacy-friendly analytics
- Series pages grouping notes by project
- “Now” section with what I am currently building or learning

## Documentation maintenance

- [x] Separate README context, contributor guidelines and delivery plan; align prototype references, project publication rules and milestone dependencies.
