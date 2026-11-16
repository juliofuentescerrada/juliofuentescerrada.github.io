---
title: "Reranking: a second, slower look at fewer results"
summary: Letting a model read the question next to each of 50 search results moved the right rule from around second place to first and lifted recall from 0.85 to 0.98; it was the biggest improvement in Arcana’s search, and the one I had to overrule my own budget to keep.
date: 2026-11-12
project: arcana
topic: Applied AI
tags: [RAG, Reranking, Evaluation, Microsoft Foundry]
takeaways:
  - "Fast search finds the right neighbourhood; a reranker that reads the question with each candidate picks the right house."
  - "Measure the order, not only the hit: a metric like MRR shows whether the right result is first or merely present."
  - "A dedicated tool is not automatically better. Measure the general-purpose option next to it."
  - "Write the decision rule before measuring, and when you overrule it, write down why."
draft: true
---

## The problem

This is the fourth note in a series on Arcana, a rules assistant for the card game Magic: The Gathering. [The previous note](/notes/arcana-embeddings-foundry/) showed vector search finding the right rule among its first ten results for 85 % of the test questions. That sounds good until you look at where in those ten it appears.

The rules that reach the model that writes the answer are passed in order, best first. Being tenth is not as good as being first. To measure that, I used a second metric next to recall@10: **MRR** (mean reciprocal rank). For each question it scores 1 if the first correct rule is in first place, 0.5 if it is second, a third if third, and so on, then averages. Vector search had an MRR of 0.596: on average, the right rule sat around second place.

The reason is how vector search works. The question and each chunk are turned into vectors separately and only the vectors are compared. The question and the rule are never read together. It is like choosing a book by its catalogue card without opening it: you reach the right shelf, but not always the book that answers you.

## What I tried

**Two stages.** Reranking adds a second, slower stage after search. Fast search returns many candidates; then a model reads the question together with each candidate and puts them in order. Reading them together lets it tell a rule that answers the question from one that only mentions the same topic, and notice details such as “can’t” or “only during your turn”. Because that reading costs time and money, it only runs on a short list.

There are several kinds of reranker:

- **a dedicated reranking model,** trained only to score how relevant a text is to a question (Arcana tried Cohere Rerank, which Microsoft Foundry serves next to OpenAI’s models);
- **a general chat model,** given the question and the candidates and asked which ones answer it, in order.

**A rule before the numbers.** Before measuring anything, I wrote down how I would choose: the best recall@10 within a budget of 2.5 seconds at the 95th percentile and $0.0005 per question, ties to the simpler option. Then I measured the options on the same 76 test questions:

| Configuration | Recall@10 | MRR | Cost per question |
|---|---:|---:|---:|
| Vector search alone | 0.849 | 0.596 | $0 |
| Vector and keyword search, merged with vector weighted 3:1 | 0.882 | 0.609 | $0 |
| Top 50 reranked by Cohere | 0.855 | 0.684 | $0.002 |
| Top 20 reranked by a chat model | 0.947 | 0.839 | $0.0017 |
| **Top 50 reranked by a chat model** | **0.980** | **0.894** | $0.0039 |

The chat model was `gpt-5.4-mini`. In the pipeline, it receives the question and the 50 candidates, each cut to 600 characters, and returns the keys of the relevant ones in order; Arcana keeps the first 10.

## What worked

**Reading beats searching.** Reranking 50 candidates with a chat model was by far the biggest improvement in Arcana’s search: recall@10 from 0.849 to 0.980, and MRR from 0.596 to 0.894. The right rule moved from around second place to first in most questions. The gain held on 19 questions kept aside and checked only once: an MRR of 0.908, against 0.608 for the best option without a model. After reranking, keyword search added nothing measurable, so it left the question path entirely.

**The dedicated reranker was not the better one.** Cohere Rerank was faster and half the price, and it improved the order, but its recall@10 was barely above plain vector search. Its quota of 20,000 tokens per minute also allowed only a few questions a minute. A general chat model, prompted well, beat it clearly on this data.

**My rule said no, and I said yes.** By the rule I had written, the winner was the free option: weighted hybrid search at 0.882. Reranking cost almost eight times the budget I had set. I chose it anyway, raised the budget to about $0.004 per question, and recorded both the decision and the cheaper option as the fallback. The rule did its job: it made the trade-off explicit instead of letting the best number win by default.

The same thing happened again later. A newer model, `gpt-6-luna`, was measured as the reranker against a rule written beforehand: no more than 0.02 below on recall@10 and MRR. It missed by a hair (0.866 against 0.888 on a larger test set), while ranking better (MRR 0.813 against 0.765) at an eighth of the cost. I chose it, for one model instead of two and for the price, and wrote down that the decision went against the rule. A question now costs a fifth of what it did, with no change in the quality of the answers.

**Failure has a default.** If the reranker fails, takes more than 5 seconds or returns something unusable, Arcana keeps the vector search order and records the fallback. Search never depends on the reranker answering.

## The trade-off

- **Time.** Reranking adds about a second before the answer starts being written.
- **Run-to-run variation.** A chat model does not return exactly the same order every time: MRR moved by about 0.025 between two runs of the same configuration. Every measurement with a chat model ran twice.
- **Prompt injection.** A chat model can be steered by instructions hidden in the text it reads, and here it reads 50 pieces of text per question. The prompt treats the candidates as data, and only keys that exist in the list are accepted back.
- **Quota decides more than it should.** The cheapest candidate, `gpt-5-nano`, could not be measured at all: the subscription had no quota for it.

## What I would change

- **Give a new model its own prompt before comparing.** `gpt-6-luna` was measured with the prompt written for `gpt-5.4-mini`. A prompt tuned for it might close the gap the rule caught; it is still on the list.
- **Measure from a copy nobody is editing.** The first `gpt-6-luna` comparison measured nothing: the evaluation runner rebuilds on every run, and the code had been changed halfway through, so all 238 reranking calls fell back. Running measurements from a separate, untouched copy of the code avoids that.

Next in the series: what the model does with the top 10, and how Arcana checks its citations and decides when to say “I don’t know”.
