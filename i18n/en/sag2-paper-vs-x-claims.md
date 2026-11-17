---
title: "Checking SAG2's numbers against the paper"
emoji: "🔎"
topics: ["ai", "rag", "検索", "評価", "考察"]
---

I read the X article "RAG这次真死了！SAG2才是本地知识库的神，又快又准又便宜～" (roughly: "RAG is really dead this time! SAG2 is the god of local knowledge bases, fast, accurate and cheap") by 袋鼠帝, dated November 9, 2026. It is an introduction to SAG2 by someone who builds knowledge bases for a living in the Chinese-speaking world. I wanted to find out why SAG2 is supposed to be stronger than RAG, so I went back to the original paper.

Here's the conclusion up front.

> SAG2 does not replace RAG. It moves the "retrieval" part of RAG from up-front processing to judgment at question time. What the paper shows is how often it picks up the evidence passages for a multi-hop question (recall); it does not measure whether the final answers are correct. And the JEV it uses for judging is an external API, and the question and the candidate texts are sent to it. "本地知识库" (local knowledge base) and "便宜" (cheap) have to be read with those two conditions attached.

On the paper's tables, it is stronger than what it was compared against. But I think what it is stronger than has gotten shifted in the retelling.

---

## About this post

I read the X article and the paper it is based on, "SAG2: Embedding-Free Multi-Hop Retrieval with BM25 and JEV" (Yuchao Wu, Zleap AI, [arXiv:2610.22588](https://arxiv.org/abs/2610.22588), October 15, 2026).

Where I stand: I have run neither SAG2 nor the desktop SAG Wiki. The numbers below come from the paper's tables and text, except for 7,000x and 4.57 hours (numbers from the X article); the differences and per-question values are my own divisions of those. I measured nothing. I have not read the first SAG paper (Wu et al., 2026) or the EnterpriseRAG-Bench paper (Sun et al., 2026), both cited in the paper as comparison sources.

I do not use the paper's figures. arXiv's license here is not CC but a form where the rights stay with the authors (arXiv.org perpetual non-exclusive license), so I copied the numbers I needed into tables.

## What SAG2 does

The mechanism can be described briefly. Index building (what the X article calls "建库") calls no model at all; it just builds an SQLite full-text search (FTS5) index over the original passages. When a question arrives, it repeats the following.

1. Fetch candidate passages with BM25
2. JEV looks at the question and the evidence collected so far, and judges each candidate on "is this usable evidence?"
3. Pick up terms from the usable passages and use them for the next search

The paper's abstract says this.

> This moves semantic evidence selection to query time, eliminating offline embedding computation, LLM-based event--entity extraction, and dedicated database servers.

JEV is a judgment-only model published by TypeSafe AI. It does not write text; for each judgment it returns the probability of "yes." The paper's implementation calls `typesafe/jev-1.13-20260917` through OpenRouter.

The example of Zhang San in the X article (Company A acquires Company B, Zhang San is the CTO of Company A, Zhang San moves to the Pangu project) is just this 1 → 2 → 3 loop run as is.

## The paper's numbers

These are passage recall on three multi-hop question datasets (1,000 questions each). I pulled some of the table. Units are %.

| Method | MuSiQue R@5 | MuSiQue R@10 | 2Wiki R@10 | HotpotQA R@10 |
| --- | --- | --- | --- | --- |
| BM25 | 47.47 | 54.41 | 71.50 | 86.90 |
| NV-Embed-v2 (embedding search) | 68.84 | 77.27 | 80.75 | 97.70 |
| HippoRAG 2 (graph) | 65.13 | 73.76 | 93.40 | 97.15 |
| SAG (first version) | 80.36 | 83.37 | 93.57 | 97.70 |
| SAG2 | 80.68 | 86.62 | 97.43 | 99.00 |

R@10 is how much of the correct evidence passages fall within the top 10 passages. On MuSiQue, the hardest of the three, it is 9 points above the best embedding search and 13 points above HippoRAG 2.

On EnterpriseRAG-Bench, which uses 510,000 simulated internal documents (emails, tickets, meeting minutes and so on), document-level Recall@10 was 81.10%. BM25 in the same table is 68.4%, and vector search is 46.0%.

There is also a cost table. Index building for MuSiQue's 11,656 passages took 2.36 seconds, the SQLite file is 25.87 MiB, and there were 0 up-front model calls. JEV's charge for the 1,000 questions was 4.33 dollars.

## What works is "repeating with context"

What I thought was most worth reading is the ablation on MuSiQue (a comparison with components removed).

| Configuration | R@10 |
| --- | --- |
| BM25 only | 54.41 |
| BM25 + JEV, no expansion | 67.93 |
| BM25 + JEV, judging more in one pass (judgment count matched to SAG2) | 69.82 |
| SAG2, without passing the collected evidence to the judge | 76.25 |
| SAG2 (2 expansions, evidence passed) | 86.62 |

Adding JEV alone stalls at around 68%. Even with as many judgments as SAG2 uses, finishing in one pass gives 69.82%. What produces the 17 points from there is searching again with the terms of the passages picked up, and having the judge see the evidence so far. Just not passing the evidence drops it by 10 points.

So the core of SAG2's strength is neither BM25 nor JEV alone, but the loop of "searching again using what you found as a clue." This is not an idea opposed to RAG. Iterative retrieval such as IRCoT (a method that alternates reasoning and retrieval) has existed for some time, and the paper's related work lists it. What is new in SAG2 is running that loop with a lexical index that needs zero up-front processing and a cheap judge.

So the comparison "SAG2 vs RAG" is, precisely, "retrieval that pulls once vs retrieval that repeats while judging." The passages SAG2 fetches are in the end handed to an LLM to build the answer. That is RAG.

## Where the X article and the paper diverge

The X article is passionate and easy to read, but there are places where, set against the paper, it says too much.

**"8 项指标全部第一" ("first on all 8 metrics").** What the paper claims is the best R@5 and R@10, no more. In the tables, the first SAG version is higher on MuSiQue's R@1 and R@2 and on 2Wiki's R@1. The paper itself writes "SAG retains higher R@1 and R@2 on MuSiQue." If you narrow down to the top 1 or 2 hits, there are still cases where the first version is better.

**"本地知识库" ("local knowledge base").** The index is a local SQLite, but the judgment is made by the external JEV. The X article also says that you put the JEV key in the settings and that the judge model can be swapped for another. But the word "本地" ("local") lets people read it as the data never leaving your machine. The paper says this in its limitations section.

> Consequently, the present system cannot be independently deployed entirely on premises using publicly released model artifacts, even though its retrieval index is local.

It goes on to say that the question and the candidate texts have to be sent to that service. If you handle documents that cannot leave the company, this is the first thing to check. The accuracy when swapped to a different judge model is not evaluated in the paper.

**"又快又准又便宜" ("fast, accurate and cheap") and "速度直接提升7000倍" ("speed directly up 7,000x").** 7,000x is the ratio of the first SAG version's index building time of 4.57 hours to SAG2's 2.36 seconds. The X article says the 4.57-hour figure does not appear in the SAG2 paper and comes from the first version's paper. I have not checked that one.

What matters more is that the computation did not disappear; it moved. The first version used an LLM at index-building time to extract events and entities. SAG2 calls JEV on every question. By the paper's numbers, JEV made 331,325 judgments over MuSiQue's 1,000 questions, about 330 per question. The charge is about 0.4 cents per question. But the paper does not put this next to the query-time cost of other methods, so the table cannot tell us whether this is cheap by comparison. Response time is not measured either.

> Online latency is not reported because service waiting time was not separated from concurrent execution.

**"LightRAG、MS-GraphRAG、HippoRAG 2 这些图谱方案都没跑完全量" ("graph approaches like LightRAG, MS-GraphRAG and HippoRAG 2 all failed to finish the full run").** The EnterpriseRAG-Bench table in the SAG2 paper lists only three: BM25, vector search and a Bash agent. I could not confirm from the paper that the graph-based ones did not finish. It may be written in the benchmark's own paper, but I have not read it.

## Conditions of the comparison

The paper itself includes cautions for reading the numbers.

- The embedding-search and graph-based numbers in the three-dataset table are copied from the first SAG paper. The paper writes "The SAG comparison uses different models and implementations."
- MuSiQue was also used during method development ("MuSiQue was also used during method development."). MuSiQue, where the gap to BM25 is largest, is also a dataset used for tuning.
- EnterpriseRAG-Bench is a synthetic corpus.
- On MuSiQue's 4-hop questions (166 questions), the share where the top 10 collected all the evidence is only 28.31%.
- The paper states that the 17-point comparison matches the number of judgments but not the token count or the cost.
- What is measured is only retrieval recall; answer correctness is left as future work.

> Generalization to an unused split, private organizational corpora, and downstream answer generation remains to be evaluated.

There is one more thing that is not in the tables. The X article itself says that hybrid search, combining full-text search, vector search and reranking, is "标配" (standard equipment) and still "最成熟的工业方案" (the most mature industrial solution). That standard configuration, for example search that mixes BM25 and embedding search and then applies reranking, is not in the paper's comparison tables. What SAG2 beats is BM25 alone, embedding search alone, and the graph-based methods.

## My take

When deciding whether to use SAG2, I think the thing to look at is not the recall table but the following three.

The first is whether you can send questions and document fragments to an external API. If you can't, you can't choose SAG2 as it is now. The paper also lists a judge model that runs locally as future work.

The second is how much your current search misses on your own questions. HotpotQA's R@10 is 97.70% even for embedding search, a gap of 1.3 points from SAG2's 99.00%. The gap is large on questions that follow clues across several steps, like MuSiQue and 2Wiki. If your current hybrid search shows no conspicuous misses, I think the reason to switch is weak.

The third is the direction of the cost. SAG2 took the index-building cost to 0 and changed it into a pay-per-question form. Unlike a scheme where you pay once up front, this accumulates in proportion to the number of questions. For a knowledge base with many documents but few questions, SAG2's form wins; if a small number of documents gets a large number of questions every day, it should cross over with the up-front processing scheme somewhere. The paper has no comparison of query-time cost, so where that crossover lies you can only compute from your own numbers.

Jev also appeared in the Hightouch post I wrote earlier on this blog ("On Hightouch's two-stage Jev and Opus judge"). Because it is the same name, I read it as a model of the same lineage, but the source article there does not explain what Jev is, and I have not confirmed that they are the same. There, Jev was "a cheap, fast first-stage judge that returns a probability," and the cases it was unsure about went to Opus. SAG2 is a design that calls the same kind of cheap judge about 330 times per question. With the arrival of cheap judges, options other than "process everything up front" became realistic. I read SAG2 as one form of that.

The flip side is that SAG2's value rides on JEV's price and on its continued availability. The paper also writes that continued availability of the evaluated version is up to the provider.

## If you take away one thing

Before trying SAG2, confirm whether you can send questions and document fragments to an external judge API. If you can't, there is no point yet in reading the recall table.

Sources: 袋鼠帝, "[RAG这次真死了！SAG2才是本地知识库的神，又快又准又便宜～](https://x.com/aikangarooking/status/2119717912546304048)" (X, November 9, 2026). Yuchao Wu, "[SAG2: Embedding-Free Multi-Hop Retrieval with BM25 and JEV](https://arxiv.org/abs/2610.22588)" (arXiv:2610.22588, October 15, 2026). The benchmark's reproduction code is at [Zleap-AI/SAG-Benchmark](https://github.com/Zleap-AI/SAG-Benchmark). I have not read the first SAG paper, the EnterpriseRAG-Bench paper, or the official JEV article. I have not run SAG Wiki.
