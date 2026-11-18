---
title: "Reading the numbers on Opus 5.5's two-stage run"
emoji: "🔁"
topics: ["ai", "評価", "開発生産性", "考察"]
published_at: "2026-11-10"
---

Addy Osmani wrote "Which Claude model should you build with?" on claude.dev (November 9, 2026). It is a post about choosing among Haiku, Sonnet, Opus, and Fable, but what caught me most was not the model-selection table. It was a single line of numbers in the section on effort.

> On the same SWE-bench Pro subset, Opus 5.5 at `low` with failures re-run at `high` passed about 97% of tasks for about $0.17 each, against 95.3% for $0.29 with every task at `high`.

Here's the conclusion up front.

> What these numbers support is "the score did not drop, and cost fell by about 40%," and no further. The 1.7-point gap between 97% and 95.3% is the same size as the margin the same post calls "the edge of run-to-run noise" when it talks about a different benchmark. Working backward, re-running a task that failed at low appears to cost about twice as much as solving an average task at high. The two-stage run is cheap because few tasks fail.

I have not reproduced this experiment. The post does not give the number of tasks in the subset either, so what follows is a back-calculation from the rounded numbers that appear in the post.

---

## The order the post recommends

When a model's performance is not enough, the post gives this order of things to try.

> 1. Check that the model can verify its own work, with a test, a build or a script that calls the endpoint.
> 2. Raise effort one level.
> 3. Move to the next model up, starting at a lower effort level than you used on the smaller one.

Changing the model comes last. The first two are moves you can make with the model you already have. The two-stage run is an extension of the first. If you can judge results automatically, you can run everything on the cheap setting and use the expensive setting only on what failed.

A little earlier in the same section, the post also gives the differences between effort levels. These are on SWE-bench Pro, relative to Opus 5.5 at `high`.

> At `low` it scored about 8 points lower for about a third of the cost.

It goes on: `medium` is about 2.5 points lower at about 70% of the cost, and `xhigh` is about 1.4 points higher at 2.5 times the cost.

## Re-running a failed task is expensive

Combine these two and you can make a rough back-calculation. From here on it is my own arithmetic. There are two assumptions: that $0.17 is the total per task including the first run at `low`, and that the per-effort numbers come from the same subset (the post says "same" for the latter). I am using the numbers marked "about" as rounded, so look only at the order of magnitude.

All tasks at `high` is 95.3% for $0.29. `low` is about 8 points below that, so around 87%. The cost is about a third, so just under $0.10 per task. The failures come to around 13%.

The two-stage total is $0.17, so the re-runs cost about $0.07 per task on average. Divide that by the 13% that failed, and you get **around $0.55 per re-run**. That is nearly twice the $0.29 average for all tasks at `high`.

This is not a strange number. The tasks that fail at `low` are the hard ones, and hard tasks make `high` think longer and call tools more, too. Another section of the post also talks about cost being concentrated in a few problems.

> On one 20-problem search benchmark, two problems carried 43% of the spend.

The two-stage run comes out cheap not because the unit cost of a re-run is low. It is because few tasks get re-run. If you take the same approach to a group of tasks where the `low` pass rate drops, say a backlog that is hard from the start, I think this $0.17 will not reproduce. Suppose 30% fail at `low`. At the same unit cost the re-runs alone come to more than $0.16, and the total approaches the $0.29 of all tasks at `high`.

![Sumi wheels only the failed red boxes on a hand truck from beside a thin conveyor belt toward a huge hand-cranked furnace. The ordinary boxes that passed pile up in a big bin, labelled "Most pass" in blue; "Only the failures" in red; an orange arrow points at the furnace's blank tag, "Re-runs cost more"](/images/opus-low-then-high-rerun/en/01-rerun-cost.webp)

## Don't read 1.7 points as an improvement in score

Put 97% and 95.3% side by side and the two-stage run looks both cheaper and higher-scoring. But in its section on the advisor tool, the post says this. It is about a combination where Opus 5.5 had Fable 5.1 as an advisor, and scored 1.7 points higher than Opus 5.5 alone.

> A gain that size is at the edge of run-to-run noise, and about what raising effort would have bought.

97 − 95.3 is also 1.7. The advisor result is from an internal coding benchmark with a different number of tasks, so I can't carry that yardstick over as is. Still, since the same post calls 1.7 points "the edge of run-to-run noise," I hesitate to read the two-stage run's 1.7 points as a score improvement.

The rule of thumb I use in my own evaluation notes is `1/sqrt(tasks × runs)`, and if the difference is smaller than that I don't write "improved." I can't compute it because I don't know the subset's task count. That rule of thumb is a rough upper bound for pass rates around 50%, and near a ceiling like 95%+ the spread is smaller. So I can't go as far as "it's noise." The accurate statement is that "the post gives no material to tell it apart from noise."

![Sumi crouches and looks through a magnifying glass at two paper cups of water at almost the same level. The table under them ripples and shakes, and the shaking range of the water line is a blue band, "noise band". The tiny gap between the two levels is a red "1.7 points". On the right, a tall and a short stack of coins with an orange arrow, "Cost down 40%"](/images/opus-low-then-high-rerun/en/02-noise-band.webp)

I can think of one reason the score might look like it went up. In the two-stage run, a task that failed gets a second attempt. One run at `low` plus one run at `high`, and passing either one is enough. The post does not state the number of attempts, but if all tasks at `high` get one attempt each, the effect of effort and the effect of the number of attempts are mixed together.

So I read this result as "quality did not drop, and cost fell by about 40%." The cost side is the difference between 0.29 and 0.17, which is much sturdier than the score difference.

## It's unusable without a judge

There is one more thing the post states as a condition.

> If you can check outcomes automatically, run everything at a low level and re-run only the failures at a high one.

In a benchmark, a test decides mechanically whether a task passed. In use where you fix things interactively, that doesn't hold. A person decides "it failed," and does so after reading the diff that came out.

In that case, an operating rule of "run once at `low`, and if it's no good, `high`" is something different from the post's two-stage run. For a task that failed at `low`, you read the diff, decide "no good," wait for the `high` result, and read it again. What the two-stage run saves is about $0.12 per task (0.29 − 0.17). Compared with the extra human re-reading and waiting on the failed tasks, which are a bit over one in ten, it looks to me like it does not pay.

What can be used interactively is the first item in the post's order. Prepare tests and a build first, and have the model judge for itself. Then even when you run at `low`, you can expect the model to notice that it failed and redo the work. That said, the 97% figure came out on top of a strong judge, the benchmark's tests. If your own tests are lax, a task that failed but was counted as passing will not be re-run, and the number drops by that much. The way I found most useful to read the two-stage numbers is as a price list for building the judge first. You get that price only when the judge is as accurate as the one in the experiment.

![Sumi fits a fine mesh into a wooden gate-like frame on legs, labelled "Checker" in blue (orange "Build it first"). On the right, boxes that passed land in a tray. At his feet a coarse-meshed sieve lies abandoned, a red box has slipped through its hole onto the floor, and a black cat watches (red "Slipped through")](/images/opus-low-then-high-rerun/en/03-sieve-checker.webp)

## If you take away only one thing

The two-stage run is cheap when few tasks fail at `low`. Before adopting it, measure the pass rate when you run your own tasks at `low`. With the unit cost from the back-calculation above, the cost matches all-`high` once around 35% fail at `low`. In practice, the more tasks fail, the easier the re-run contents become, so the unit cost should change. Even so, that is no reason to adopt it without measuring the pass rate.

Source: Addy Osmani, "[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)" (claude.dev, November 9, 2026). I have not read "Spending your effort," which the post refers to, or the platform cost guide.
