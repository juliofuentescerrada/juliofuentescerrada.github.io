---
title: Where spec-driven development actually paid off
summary: On Pauper Pilot, the specs were worth less as instructions for an AI agent than as the place where vague ideas became measurable decisions.
date: 2026-11-11
project: pauper-pilot
topic: AI-assisted development
tags: [Spec-driven development, OpenSpec, Product decisions]
takeaways:
  - "With an AI agent, the scarce resource is not code but well-defined decisions. Spend the human time there."
  - "A proposal step that requires data turns “obvious” features into explicit, defensible choices."
  - "Record who decided what. A design document that separates the owner’s decisions from the agent’s recommendations is a better log than commit history."
  - "Turn every surprise into a project rule; the agent’s context file is the project’s long-term memory."
draft: true
---

## The problem

Pauper Pilot is a static site built on public tournament results for a competitive card game: Pauper, a format of Magic: The Gathering. Every week, a few hundred decklists are published. The site groups them into deck types, measures how popular each type is, and compares them with the cards a player already owns. I play the format, and I wanted a tool that answered my own question: “With the cards I have, what can I build, and what am I missing?”

That made me both the developer and the only stakeholder. I knew what I wanted only at a high level:

- “show how popular each deck type is”;
- “show a representative list for each type”;
- “tell me how close my collection is to each deck”.

None of those sentences is specific enough to implement. An AI agent fed directly with them would have produced something plausible. Plausible is not the same as correct, and in a data product the gap is hard to see.

I built it in about three intense weeks with Claude Code, using spec-driven development (SDD) through OpenSpec. By the end there were 120 archived changes and 27 capability specs.

## What I tried

OpenSpec splits work into changes. Each change goes through the same loop: explore, propose, human review, apply, archive. A proposal has three parts:

- a `proposal.md` that says why the change exists;
- delta specs with requirements written as WHEN/THEN scenarios;
- a `design.md` for the decisions and the alternatives that were discarded.

Only after I approve does the agent implement it. When it is archived, the delta specs merge into the main specs, which become the source of truth for what the system does.

Pending work lives in a single roadmap. Every entry follows the same format: **Objective**, **Scope**, **Acceptance criteria** and **Open questions**. The open questions are the important part. They have to be answered in the change’s `design.md` before any code is written, and if there is no clearly recommended option, the agent has to ask me.

![A roadmap entry goes through explore, propose, human review, apply and archive. Explore, propose and review are where the product gets defined, and review can send a proposal back for another iteration. Archiving merges the specs into the source of truth, and surprises found while implementing become project rules in CLAUDE.md. Both feed the context of the next change.](/notes/pauper-pilot/openspec-loop.svg)

This is the loop that fits a solo project like mine, not the only way to use OpenSpec. The workflow is meant to be adapted:

- the project chooses a schema (I used the default, `spec-driven`) and adds its own context in `openspec/config.yaml`, which the agent reads before writing any artifact;
- for changes that need no discussion, a fast-forward command creates every artifact in one step.

A team might add more reviewers, or skip explore for routine work. What matters is deciding where the human decisions happen.

I expected the value of this process to come from the apply step: precise specs in, correct code out. It came from somewhere else.

## What worked

The biggest payoff came in explore and propose, the conversation before any code exists. That is where a one-line idea turned into a decision I could defend. Three examples show the pattern.

**Defining “popularity”.** “Percentage of published decks per type” sounds trivial until you look at the data. One recurring event only publishes decks with a perfect record, and it publishes daily over several weeks. The same player can therefore appear many times with the exact same list. During the proposal, the agent measured three counting rules on the 4,675 decks available at the time:

| Rule | Decks counted | Largest change in a share |
| --- | --- | --- |
| Count everything | 4,675 | — |
| Count an identical list from the same player and event once | 4,364 (−7%) | 0.3 points |
| Count one deck per player, type and event | 3,952 (−15%) | 0.7 points |

With the numbers on the table, the choice was easy. I kept the middle rule: it removes exact repeats without discarding genuinely different results. Two smaller decisions came out of the same review:

- percentages use largest-remainder rounding, so the table always adds up to exactly 100.0;
- time windows end on the date of the latest published event, not on the build date, so a run with no new data produces identical output.

**Choosing a representative list.** My first idea was an “average deck”. The agent tested it against real data before proposing it, and the averaged lists came out at 62, 56, 61 and 60 cards. A deck must follow construction rules (60 cards in the main deck, for instance), so an average deck is often not a valid one. The approved design uses the medoid instead: the real list closest to the average.

The medoid has three advantages:

- it is always valid;
- it links to a real published result;
- it is a short pure function.

The same distance also measures how much a deck type varies. In the most consistent type, the representative list was 3.8 cards away from the average; in the most varied one, 22.6. The page explains that the list is the most central one, not a canonical one.

**Setting limits from real data.** When per-account database limits were added, the design included the actual maximums from production: no collection had more than 2,823 entries. I picked generous limits, such as 30,000 entries per collection, knowing exactly how much headroom they left.

These decisions share something. None of them is technically hard. Each one is a **product decision hidden inside an implementation detail**, and each needed data before it could be made. The proposal step forced both. Because the `design.md` files record which decisions I made in review and which ones the agent recommended, the archive explains not only what was built but who chose it, and why.

A second, quieter benefit was memory. Lessons learned while building did not stay in my head; they became rules in `CLAUDE.md`, the agent’s project instructions. Two examples:

- After a data source’s README turned out to describe a format different from its real files, the rule became “inspect real files and keep small fixtures before writing a parser”.
- After Cloudflare’s Git integration published the site with no data, because its build skips the data step, the rule became “keep the Git integration disconnected”.

Every later change started from that accumulated context.

## The trade-off

SDD costs time up front, and it does not cost the same everywhere. For a pure UI tweak, a full proposal with delta specs is a lot of ceremony; many late changes were small updates whose `design.md` is a handful of lines. The process pays off in proportion to how ambiguous the change is: much for a metric definition, little for spacing in a table.

There is a subtler cost. The agent implements faithfully what is in its context, and only that. Constraints written down from day one, such as row-level security on every table, appeared in the very first accounts change. Constraints nobody wrote down arrived late. I will cover that in a separate note on security.

## What I would change

- **Scale the ceremony to the ambiguity.** Use the full explore → propose loop for changes with open product questions, and a lighter path for mechanical changes.
- **Write the non-functional baseline into the first spec**, next to the functional one, instead of discovering it change by change.
- **Keep the “measure before deciding” habit explicit** in the proposal template, so every open question comes with the data needed to answer it.
