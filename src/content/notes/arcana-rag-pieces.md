---
title: What RAG is, and the pieces I used to build one
summary: Retrieval-augmented generation is usually drawn as three boxes; building Arcana taught me that almost all the work, and almost all the risk, is in the box before the model.
date: 2026-11-11
project: arcana
topic: Applied AI
tags: [RAG, Embeddings, pgvector, Microsoft Foundry]
takeaways:
  - "In RAG, the model is a reader, not an oracle: it answers from the passages you give it, and retrieval sets the ceiling on what it can get right."
  - "Most of a RAG system is not the model call. Plan for ingestion, search, ranking and checks, not just a prompt."
  - "Use the simplest tool that finds the right text: plain name matching and an ordinary database went a long way."
  - "Know the alternative you are beating. If the whole corpus fits in the prompt, RAG has to justify itself on cost, speed and accuracy."
draft: true
---

## The problem

Arcana answers questions about the rules of Magic: The Gathering, a card game whose official rulebook (the Comprehensive Rules) is long, precise and updated several times a year. Every answer cites the exact rule it relies on, like `[CR 702.35a]`, so the reader can check it. I built it as a learning project, to understand retrieval-augmented generation (RAG) by building one end to end.

A language model on its own is a poor fit for this. It learned the rules during training, so its knowledge is:

- **approximate:** it paraphrases rules instead of quoting them;
- **frozen:** it does not know about the latest release of the rulebook;
- **unattributable:** it cannot point at where an answer comes from;
- **sometimes invented:** it can produce rule numbers that look right and do not exist.

The question was how to make a model answer from the exact, current text, and show where each statement comes from.

This is the first note of a series on how Arcana works, one piece at a time.

## What I tried

RAG adds one idea to a plain model call: before generating, **retrieve** the passages of a trusted source that are relevant to the question, put them in the prompt, and ask the model to answer only from them.

```
question → find relevant passages → prompt = instructions + passages + question → model → answer with citations
```

That is the version usually drawn as three boxes: retrieve, augment, generate. Arcana ended up with two groups of pieces.

**Prepared once, when a new rulebook is released (ingestion):**

1. **Parse and validate.** The rulebook is downloaded, parsed into rules and glossary terms, and checked. A version that fails validation is stored as failed and never served. Each version is kept, so old citations still resolve.
2. **Split into chunks.** Each rule becomes one chunk, with the titles of the sections above it, and so does each glossary term. The latest rulebook gives 1,936 chunks.
3. **Turn chunks into embeddings.** An embedding is a list of numbers (1,536 here) that places a text so that texts with similar meaning end up close together. Arcana uses `text-embedding-3-small` on Microsoft Foundry. Embedding the whole rulebook takes about 216,000 tokens and costs less than a cent.
4. **Store everything in PostgreSQL.** The pgvector extension stores the embeddings and searches them, in the same database as the rules, the cards and the users’ conversations.

**Run on every question (the Ask pipeline):**

1. **Find the cards the question names** by matching their names in the text, with no model involved, and add their official text as extra sources.
2. **Vector search:** embed the question and fetch the 50 closest chunks.
3. **Rerank:** a chat model reads those 50 and keeps the 10 that actually help.
4. **Abstain early** if none of them is relevant.
5. **Expand references:** add the rules that the selected rules point to.
6. **Generate** the answer with `gpt-6-luna`, citing a rule for every claim.
7. **Validate the citations:** every cited rule must exist and must be among the sources the model was given. If one fails, the model gets one retry; if that fails too, Arcana says it does not know.
8. **Stream** the answer to the browser as it is written.

The backend is .NET 10 with `Microsoft.Extensions.AI` for model calls, the web app is Angular, and it runs on Azure.

## What worked

Building each piece taught me more than the three-box diagram did.

**The model is one step out of many.** Only step 6 writes the answer. Everything before it decides what the model gets to read, and everything after it checks what the model wrote. If the right rule is not retrieved, no prompt can fix the answer. Testing by hand, I saw a wrong answer whose citations were all valid: the rule that decided the question had not been retrieved, and the model reached a conclusion anyway. Retrieval is the ceiling.

**A fixed pipeline before an agent.** An agent lets the model decide which tools to call and in what order. Arcana’s questions almost always follow the same path, so the steps are fixed in code. That makes the system predictable, and it means each step can be measured on its own: how often search finds the right rule, how often a citation fails, what each step costs.

**Not everything needs embeddings.** Card names are found with plain text matching, including fuzzy matching for misspelled names. A name is either in the question or not, and exact matching is faster, cheaper and easier to explain than vector search. The cards are not embedded at all.

**An ordinary database is enough at this size.** The corpus is a few thousand rules and tens of thousands of cards. PostgreSQL with pgvector handles the search and everything else, so there is one database to run, back up and understand. Search sits behind an interface, so a dedicated search service can be compared later without rewriting the pipeline.

**Grounding is a contract, not a hope.** The model is told to answer only from the sources and to cite them, and the code checks the citations. When the sources do not support an answer, Arcana says so and lists the closest rules instead of guessing.

## The trade-off

RAG adds moving parts. Ask makes two model calls per question (reranking and generation, both with `gpt-6-luna`) on top of an embedding, so the first words take about 3.8 seconds to appear at the median. A question costs about $0.0008 in model calls.

There is also an alternative I have not ruled out. The whole rulebook nearly fits in the context window of current models, so another design is to skip retrieval and send all of it with every question. My estimate was about $0.06 per question without prompt caching, around 15 times what Arcana cost per question at the time. With caching the gap narrows a lot, and speed would decide. I planned to measure it, but the subscription’s quota did not allow that many tokens per minute, so the comparison is still open. RAG has not proven it beats “just send everything” here; it has only proven it is cheaper.

## What I would change

- **Measure the simplest alternative first.** I would run the “whole rulebook in the prompt” baseline before building the pipeline, so every piece has a number to beat.
- **Give each model task its own setting from the start.** At one point a single setting chose the model for both reranking and generation, so trying a new generation model silently changed the reranker too. They are separate settings now.

The rest of the series takes the pieces one by one:

- splitting a document into chunks;
- embeddings and vector search, compared with keyword search;
- reranking;
- answers with citations and the right to say “I don’t know”;
- follow-up questions.

The last note covers how I measured all of it. The next step on Arcana’s roadmap, paused for now, is to try the evaluations built into Microsoft Foundry.
