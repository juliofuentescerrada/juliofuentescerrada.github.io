# Repository Guidelines

## Project Structure & Organization

The repository contains an Astro static application, documentation and `Julio Fuentes — Portfolio prototype.html`. See [README.md](./README.md) for the planned architecture, content models and design system, and [ROADMAP.md](./ROADMAP.md) for delivery order.

Code lives in `src/pages/`, `src/components/`, `src/layouts/` and `src/styles/`. Markdown projects and notes belong in `src/content/`; static assets belong in `public/`.

## Development & Validation

Use `npm install` to install dependencies, `npm run dev` for local development, `npm run build` for production output, and `npm run preview` to inspect it. Run `npx astro check` and the build without warnings before completing application changes. Both checks run in CI.

No test framework, coverage target, formatter or linter is configured yet. For interface changes, check keyboard access, visible focus, links and layouts at 360px, 768px and 1280px. Verify draft exclusion when implementing collections.

## Coding Style & Content

Use strict TypeScript, Astro components and plain CSS custom properties. Use two-space indentation, PascalCase component names and lowercase hyphenated content IDs. Keep client JavaScript small and local.

Follow the prototype and documented design tokens; ask before adding colors, fonts or dependencies. Preserve the original prototype and font licenses. Experience shows titles and dates only, overriding prototype descriptions.

Write site content in English. Never invent facts: retain placeholders and keep incomplete entries unpublished. Do not name employers, clients or their products. Project and note copy comes from collections, never components.

## Commits, Pull Requests & Agent Workflow

There is no commit history yet. Use small, focused commits with descriptive imperative messages. PRs should explain purpose and validation, link relevant issues when available, and include screenshots for visual changes.

Work on one roadmap milestone at a time. Tick completed tasks in the same change only when supported by evidence. Do not complete missing portfolio content on the owner’s behalf.
