---
title: "Taking Apart Boardy's CI Speedup Article"
emoji: "🏎️"
topics: ["ci", "githubactions", "エージェント", "開発生産性", "考察"]
published_at: "2026-11-02"
---

Here's the conclusion up front.

> The article about cutting Boardy's CI wait from up to 40 minutes down to 2 is more useful read not as a how-to for going fast, but as a record of how "cutting something to go faster opens a path where CI goes green without anything having passed." Of the 9 items, only one describes deliberately breaking that path to check it. **In a workflow where agents trust a green CI and move on, I think a lying green costs more than a slow CI.**

The original is "How I made our CI 20x faster (steal this)" by Owen Gretzinger, head of engineering at Boardy, published October 31, 2026 (JST) as an [X Article](https://x.com/owengretzinger/status/2116291924219060319).

A disclosure. I read only the text of the article, not the images embedded in it (the config diffs and graphs). I haven't tried these 9 items in my own CI. The article names several products, starting with the runner Blacksmith, but says nothing about the author's relationship to those companies.

---

## The time was outside the tests

Here's the paragraph that motivates the article.

> They push, wait for CI, fix the red check, push again. When writing code gets 10x faster and CI doesn't, CI is what you're waiting on.

I agree with this. What's interesting is where the saved time came from.

The biggest win was the first item: dropping GitHub's standard runners. Waits of up to 11 minutes for a machine to be assigned became a start in 8 seconds. That alone, the article says, took the wait of up to 40 minutes down to about 10. The other 8 items cut those 10 minutes to 2.

The test jobs have the same shape. The server test job went from 168 seconds to 74, but the tests inside barely changed. What shrank was setup: dependency cache misses, the `node_modules` cache, and how git clones. They also tried cutting tests, and here's what happened when they had an agent audit 20,000 of them.

> An agent audited all 20,000 test cases in our server and found almost nothing worth cutting, and the time was never in the tests anyway.

The 30 minutes from 40 to 10 came from swapping the runner alone. The new runner's faster machines are probably mixed in, so I can't say all of it was waiting, but the article does say a single job could wait up to 11 minutes. The remaining 10 to 2 also owes something to swapping out lint and type-check tools, so not all of it is about waiting and preparation. Even so, the order of "when CI feels slow, suspect wait time and preparation time before the contents of the tests" matches the article's numbers.

## Where you cut to go faster, a path to a lying green opens

From here it's my reading. From the article's 9 items, I picked out the moves that cut something or swapped it for something else to go faster, and re-sorted them by "where can this go green without anything being checked."

| Move | What was cut or swapped | What the article says |
| --- | --- | --- |
| Vitest `isolate: false` | A clean environment for each test file | A warning that tests will start leaking into each other. As countermeasures it lists a hook that resets state per file, and telling the agent how far cleanup should go |
| `nx affected` | Tests for projects that didn't change | They tested the skip logic itself (more below). On main, the full test suite runs every night |
| ESLint → Oxlint, tsc → bun check | The checking tools themselves | Only the speed numbers. Doesn't say whether the new tools catch what the old ones caught |
| shallow clone | git history | Says that history-reading steps break with a shallow clone, and recommends a blobless clone (keep the history, fetch file contents later) |

The third row is the one that bothered me most. Swapping a checker for a faster one also swaps what it checks. If the rule mapping or the type judgments differ, something that used to be red passes as green. The article says they swapped the type checker three times in one month, but from the text I can't tell what they compared each time (the benchmark in the embedded images may show something).

The other moves, like swapping the runner, parallelizing, and caching, aren't moves that let you skip checking something. Halving the parallelism is rather the opposite: the article says speed didn't change and one flaky test disappeared.

The most important row in this table is the `nx affected` one.

> We hid a server change from Nx on purpose and all six shards skipped their tests and reported green. Now that fails the run.

They broke it on purpose, confirmed that green came out, and then closed the hole. Of the 9 items, this is the only one that describes attacking the mechanism they had just built this way. The nightly full run on main isn't framed this way in the article, but I read it as a second net over the same hole.

For `isolate: false`, the countermeasures the article lists are a state-reset hook and instructions to the agent. But those prevent leaks. They aren't a way to notice when a leak happens. If even one cleanup is missed, a test might ride on state left behind by another file and pass by luck. A test like that won't go red under `isolate: false`.

## Agents that just rerun

Why does a lying green matter that much? The article's cache story has a close example.

> That bug had been there all year. Nobody noticed because nobody was sitting there watching CI. The agents were, and they just retried instead of fixing the actual issue.

The ones watching CI most closely were the agents, and instead of fixing the odd behavior, they got by with a rerun. Even with visible symptoms, slowness and the need to rerun, it went unnoticed for a year. This next part is my guess: a lying green doesn't even produce those symptoms. If an agent sees green and moves on to the next task, nobody gets a chance to notice.

The article's 9th item hits the same spot. It's the reason the pre-push check lives in a hook instead of AGENTS.md.

> Put it in a hook rather than a line in AGENTS.md, because agents skip steps.

I agree with this completely. And I want to take the same logic one step further. Agents skip steps, and sometimes let odd behavior slide instead of fixing it. If so, then whenever you cut something to go faster, you need a mechanism that checks the cut part can still actually go red. Boardy did that with `nx affected`. The same should be possible with `isolate: false`.

For example, run the nightly full suite with `isolate: true` too, and count the tests whose results disagree with the daytime `isolate: false` run. If any test passes by riding on state left by a previous file, it should go red on the isolated side. Or put a pair side by side: a test that leaves state behind, and a test whose result changes if that state is present, and see whether the hook really cleans up. I haven't tried either, and neither is in the original article. It's just applying to isolation what the author did for skip detection.

## I can't tell whether $4,300 a month pays for itself

Finally, the cost.

> Our CI bill went from $230 a month to $4,300, but it's the cheapest money we spend on making agents faster.

That's about 18.7x, an increase of $4,070 a month.

But whether it pays for itself can't be judged from the article's numbers. It doesn't say how many PRs go out each month, or how long agent sessions spent waiting on CI. "The cheapest money we spend" is the author's own sense of it, and it isn't in a form where readers can plug in their own CI and check the math.

The article closes with the line that the next bottleneck is how fast the author presses the merge button. Once CI is down to 2 minutes, the human check is what's left. In a design memo from the DeepSeek Harness team that I read in another article, there was a line: "In the current design, a single task is capped by the model's capability, but multitasking is capped by human attention." They end up at the same point.

## If you take one thing away

When you add a move that speeds up CI, break it on purpose to check whether it can produce a lying green.

Swapping the runner took a wait of up to 40 minutes down to about 10 with one line, and since it cut nothing, it adds no new ways to break. The dangerous ones are the "cut it to go faster" moves that come after. I think the most worthwhile thing to copy from Boardy's article is that experiment where they hid a server change from Nx and watched six shards return green.
