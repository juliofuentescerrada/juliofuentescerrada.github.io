---
title: "Splitting a document for RAG: let its structure decide"
summary: Cutting a rulebook every few hundred tokens is the default; cutting it where its own rules begin and end gave Arcana cleaner citations, and smaller pieces did not search any better.
date: 2026-11-12
project: arcana
topic: Applied AI
tags: [RAG, Chunking, Embeddings]
takeaways:
  - "A chunk boundary is a citation boundary. Cut where you want the answer to point."
  - "If the document has structure, use it before reaching for fixed-size windows."
  - "A short piece needs its context: carry the path of headings above it."
  - "Chunk size is a parameter to measure, not a default to copy: smaller is not automatically more precise."
draft: true
---

## The problem

This is the second note in a series on how Arcana, a rules assistant for the card game Magic: The Gathering, works. [The first note](/notes/arcana-rag-pieces/) gave the overview of its retrieval-augmented generation (RAG) pipeline. This one is about the first real decision in that pipeline: how to cut the source into pieces.

Retrieval does not work on whole documents. The rulebook is about 200,000 tokens, far too much to send with every question, and far more than an embedding model accepts in one go. So the text is split into **chunks**: pieces that are embedded, searched and handed to the model one by one. Each retrieved chunk becomes a source the answer can cite.

That last point is what made chunking matter for Arcana. Every claim in an answer must cite a rule, like `[CR 702.35a]`, and a program checks those citations. If a chunk holds half of one rule and half of the next, what exactly does a citation to it point at?

## What I tried

The default advice for RAG is to split text into fixed-size windows, a few hundred tokens each, with some overlap so that nothing is lost at the edges. It is simple and works on any text. It also ignores the text completely: a window can start in the middle of one rule and end in the middle of another.

The rulebook is not any text. It has an explicit structure:

- sections, such as “702 Keyword Abilities”;
- rules inside them, numbered like `702.35`;
- subrules, numbered like `702.35a`, `702.35b`;
- examples under some rules;
- a glossary of terms.

So I let that structure decide the boundaries:

1. **One chunk per rule, with all its subrules.** A rule and its subrules are read together; they rarely make sense apart.
2. **The heading path goes with it.** Each chunk starts with the titles above it, like “702 Keyword Abilities > 702.35 Madness”, so even a short rule says what it is about.
3. **Long rules are split, but only between subrules.** Above 4,000 characters, a rule is cut at a subrule boundary, never in the middle of one, and each part repeats the heading path.
4. **Examples stay out.** They are kept with the rule in the database but not in the chunk text.
5. **One chunk per glossary term.**

On the rulebook version I measured first, that gave 1,185 rule chunks and 741 glossary chunks. The median rule chunk is 353 characters, and the largest is 3,963. Only 9 rules were long enough to be split.

## What worked

**Citations became exact.** Every chunk maps to rule numbers. When search returns a chunk, its source is a rule the model can cite and a reader can open. The check that validates citations relies on this: a citation is valid only if that rule was among the chunks the model received.

**Smaller chunks did not search better.** The obvious objection is that a whole rule is too coarse: if the question is about one subrule, why not index each subrule on its own? I measured it instead of guessing. I built a second index with one chunk per subrule, 3,166 rule chunks with a median of 198 characters, and ran the same 76 test questions against both. The metric was recall@10: how often the rule that answers the question appears among the first ten results.

| Search | One chunk per rule | One chunk per subrule |
|---|---:|---:|
| Vector search | 0.849 | 0.868 |
| Vector + keyword search | 0.763 | 0.605 |

Vector search barely moved; the difference is within the noise of a small test set. Search that also matches keywords got much worse, because a short chunk contains fewer words to match. Smaller chunks would also have meant re-processing the whole rulebook and changing the chunker, for no real gain. One chunk per rule stayed.

**What is not in a chunk cannot be found.** Leaving examples out of the chunks had a visible effect: an early test expected a keyword search to match a word that only appeared in an example, and it found nothing. The test was wrong, not the search, but it was a good reminder that chunking decides what is searchable at all.

**The chunker is versioned.** Any change to how text is cut changes every chunk, every embedding and every evaluation result built on them. Ingestion skips a rulebook file it has already stored, which is what makes it safe to run again. One step earlier, that had already bitten me: I fixed a bug in the parser, re-ran ingestion, and nothing changed, because the file’s hash was already stored. So when chunking arrived, the stored hash combined three things from the start: the file, the parser’s version and the chunker’s version. Changing either one now re-processes the same file.

## The trade-off

Structure-based chunks are uneven. Most rules are a few hundred characters, a few are close to 4,000, and a rule with one very long line stays whole even past the limit. Very short rules give the embedding little to work with, which is part of why the heading path matters.

The unit is also coarser than the citation. A chunk holds a rule and all its subrules, while the answer cites one subrule. That is fine as long as the model is given the whole chunk, but it means search finds “the right rule”, and the model still has to find the right line inside it.

## What I would change

- **Measure the default I argued against.** I ruled out fixed-size windows on principle and only measured smaller chunks. A run with windows of a few hundred tokens and some overlap would have shown how much the structure actually adds to search, not just to citations.
- **A bigger test set before trusting small differences.** With 76 questions, a change of two points in recall cannot be told apart from noise. The verdict on keyword search was clear; the one on vector search only says “no evidence it helps”. More questions would turn that into a real answer.

Next in the series: embeddings and vector search, and why they beat keyword search on the same questions.
