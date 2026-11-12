---
title: Embeddings, vector search and the model behind them
summary: Vector search found the right rule almost twice as often as keyword search, and the embedding model that makes it work moved through four Microsoft Foundry deployments in nine days, each teaching something about running a model rather than calling one.
date: 2026-11-12
project: arcana
topic: Applied AI
tags: [Embeddings, Vector search, pgvector, Microsoft Foundry, Azure]
takeaways:
  - "Embeddings find text by meaning, which is what users’ questions need; keyword search still matters for exact names and numbers."
  - "Embedding a small corpus costs almost nothing. Store a hash of each text so you only pay, and wait, for what changed."
  - "Put the model behind an interface and reach it with an identity, not a key: moving it then becomes a configuration change."
  - "Treat any change to the embedding deployment as a change to the data: re-embed and measure again, even when the model name is the same."
draft: false
---

## The problem

This is the third note in a series on Arcana, a rules assistant for the card game Magic: The Gathering. [The first note](/notes/arcana-rag-pieces/) gave the overview of its retrieval-augmented generation (RAG) pipeline, and [the second](/notes/arcana-chunking/) explained how the rulebook is cut into chunks. This one covers how those chunks are found, and where the model that makes that possible runs.

Players and the rulebook do not use the same words. A player asks what happens when “my creature has zero toughness”; the rule that answers it uses its own precise vocabulary. Keyword search only finds text that shares words with the question, so paraphrases slip through.

Finding text by meaning needs an embedding model, and a model has to run somewhere. For Arcana that somewhere is Microsoft Foundry, Azure’s platform for serving AI models. I expected the model to be the easy part. Deploying it taught me as much as using it.

## What I tried

**Embeddings.** An embedding model turns a text into a vector: a list of numbers, 1,536 of them for the model Arcana uses, arranged so that texts with similar meanings get vectors that point in similar directions. The question and the rule about zero toughness end up close together even with few words in common. Closeness is measured with cosine similarity, which compares the directions of two vectors.

**Vector search.** Every chunk of the rulebook is embedded once, when a new version is ingested. At question time, Arcana embeds the question and fetches the 50 chunks whose vectors are closest. The vectors live in PostgreSQL with the pgvector extension, in the same database as everything else. An HNSW index, a layered graph that finds near neighbours without comparing the question against every vector, keeps that fast.

**The model.** I chose `text-embedding-3-small`. The larger version, `text-embedding-3-large`, does better on public benchmarks, but its 3,072 dimensions exceed the 2,000 that pgvector’s HNSW index supports, and it costs about six times more. The small one turned out to be cheap enough not to think about: embedding the whole rulebook, about 214,000 tokens, costs less than a cent and takes about 30 seconds. Each stored vector keeps a hash of its text, so a new rulebook release only re-embeds what changed.

**The deployment.** In Foundry you do not call a model directly. You create a deployment: a named instance of a model, with a deployment type that decides where requests are processed and a quota in tokens per minute. Arcana’s embedding deployment went through four versions:

1. **By hand, with a key.** The first deployment was created in the Azure portal, in Sweden Central, as **Data Zone Standard**, which keeps processing inside the EU. The application authenticated with a key stored in local secrets and in a GitHub secret.
2. **As code, with identities.** Four days later, the whole environment was rebuilt with OpenTofu (an infrastructure-as-code tool) and the hand-made resource was deleted. Keys were turned off. Each app, and the CI pipeline, now signs in with its own managed identity, an Azure identity with no password to store.
3. **Global Standard.** When the subscription gained more quota, every model Arcana uses moved to the same Foundry account as **Global Standard** deployments. For the chat models, Global Standard meant more quota and a lower price, at the cost of requests being processed in any region where the model runs.
4. **On a shared platform.** Finally, the models moved to a Foundry account shared by my projects, managed from another repository. Arcana no longer owns the deployment; its identities only get permission to call it.

Through all four, the code that uses embeddings did not change. It depends on `IEmbeddingGenerator` from `Microsoft.Extensions.AI`, an interface with no vendor in it, and reaches the model through Foundry’s OpenAI-compatible endpoint. Only the move from a key to identities touched code, in how the client signs in; the other moves were configuration.

## What worked

**Vector search clearly beat keyword search.** On the same 76 test questions, I measured recall@10: how often the rule that answers the question appears among the first ten results.

| Search | Recall@10 |
|---|---:|
| Keyword (PostgreSQL full-text) | 0.454 |
| Vector | 0.849 |

The gap was widest on questions about when things happen and in what order: keyword search found the right rule in one case out of six, vector search in seven out of eight. Those questions are written in everyday language, far from the rulebook’s wording.

**Combining both did not help here.** Hybrid search, which merges the two result lists, scored 0.763, below vector search alone, because the weak keyword results pushed good vector results down. The next note covers what did improve the results.

**No keys anywhere.** Moving to identities removed every model credential from the project: local development signs in with the Azure CLI, apps and CI with their own identities. That made the later moves cheap, because there was no secret to rotate or copy.

## The trade-off

**Embeddings blur exact terms.** Card names and rule numbers carry little meaning for an embedding model. Arcana finds the cards a question names with plain text matching instead, before any vector search.

**Vectors belong to their deployment.** Vectors from different models cannot be compared, so changing the model means re-embedding everything. I learned the subtler version the hard way. When the embedding deployment was recreated as Global Standard, the model was the same, but the vectors came out slightly different, and plain vector search on the quick test set dropped from 0.794 to 0.768. It went unnoticed in the first measurement after the change, which had still run against the old deployment.

**Changing the deployment type replaces the deployment.** In OpenTofu, switching from Data Zone to Global Standard destroys the deployment and creates a new one. For the moments in between, vector search, and every answer with it, fails. Acceptable in a single test environment; anywhere else it would need a second deployment and a switch.

**Global Standard is a privacy decision.** It means a question can be processed outside the EU. For a personal learning project with no personal data in its questions, I accepted that. A project that stored users’ personal data should choose differently.

## What I would change

- **Create the deployment as code from the first day.** The hand-made resource lived for four days, and a page of the documentation exists only to record what was clicked in the portal.
- **Record the deployment with every vector, not just the model name,** and re-run the evaluation after any deployment change, so a shift in the vectors is caught on purpose instead of by accident.

Next in the series: reranking, the step that lifted Arcana’s search well past what vector search did alone.
