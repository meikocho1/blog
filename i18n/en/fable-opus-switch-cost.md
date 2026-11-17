---
title: "Moving between Fable 5.2 and Opus 5.5"
emoji: "⚖️"
topics: ["ai", "エージェント", "評価", "考察"]
published_at: "2026-11-10"
---

I usually use Opus, and switch to Fable with `/model` only when I need deep reasoning. That is how I use models, and my own rules file says so. The fact that this "switch" has a direction becomes visible when you connect two sections of Addy Osmani's post "Which Claude model should you build with?" (claude.dev, November 9, 2026).

The post recommends starting with Opus 5.5 at effort `medium`. You move up to Fable 5.2 for the hardest technical work, when even Opus 5.5 at `high` is not enough, and for long unattended runs. In the Fable-versus-Opus comparisons in the post, the scores are nearly level and what differs is cost. Lay the model-switching rules from the second half of the post over that, and one more thing shows up.

Here's the conclusion up front.

> If you move from Opus up to Fable in the same conversation, Opus's thinking is carried over to Fable. If you move from Fable back down to Opus, Fable's thinking is discarded. If you hand only the hard part to Fable and then return, you need to have Fable write out, in visible text, the decisions it reached before you go back.

The handling of thinking blocks is about the Claude API and Google Cloud (Google-managed), as the post describes it. The costs below also just line up the post's numbers; they are not measured on my own usage.

---

## Scores are close, and the cost differs

The post has two direct Fable-versus-Opus comparisons. The first is Terminal-Bench 3.0.

> on Anthropic's runs of Terminal-Bench 3.0, the previous Fable, 5.1, at `max` scored 58.0%, while Opus 5.5 at `high` scored 58.9% with half the tokens.

The second is FrontierCode 2.0, and it points the other way.

> On FrontierCode 2.0, Fable 5.2 at `high` scored about level with Opus 5.5 at `max` (45.3% vs. 45.5%) for roughly half the cost per task.

In both, the score gap is under 1 point, and for FrontierCode the post itself writes "about level." What it claims is the cost. On Terminal-Bench, Opus at `high` needed half the tokens of the previous Fable 5.1 at `max`. On FrontierCode, Fable at `high` cost half as much per task as pushing Opus up to `max`.

The post's conclusion is there too.

> So before you raise Opus 5.5 past `high` on a hard task, test Fable 5.2.

The post gives no number for how many points Fable is ahead of Opus at the same effort. It says per-model scores are on the Fable 5.2 introduction page, but I have not read that page. So all that can be said from this post alone is: "when you hit the effort ceiling, switching models can be cheaper, so it's worth trying." The evidence for that is the single FrontierCode result.

## On long runs, the gap is smaller than the 2x unit price

At list price, Fable 5.2 is double Opus 5.5 on both input and output ($8 input and $40 output per million tokens, versus $4 and $20). But the cache-read price is the same.

> Fable 5.2 charges the same $0.20, so on a long, cache-heavy run the gap between Fable and Opus comes down to uncached input and output, where Fable costs twice as much per token.

The post's explanation is that the longer the session, the more of the input is cache reads. So "Fable costs twice as much" overstates it for long runs. If the same task takes a short run on Fable at `high` instead of a long think on Opus at `max`, the difference in output tokens could easily flip the result. The "half" in FrontierCode probably comes out in this shape.

## Switching has a direction

From here on is my reading, connecting separate sections of the post.

In its "Mixing models" section, the post describes two things you lose when you change models partway through. The first is the cache.

> The prompt cache belongs to the model that wrote it. Your first turn on a new model pays the cache-write price on the whole conversation.

This is the same whether you move up or down. The post recommends running `/compact` in Claude Code before you switch, or writing a short plan and starting a new session.

The second is thinking blocks, and this one has a direction.

> A move down a tier loses the earlier reasoning, because a model never reads the blocks of a model above it.

Fable 5.2 can read the thinking blocks of Opus 5.5, Sonnet 5.5, and Haiku 5.5. In the other direction, when you move from Fable 5.2 to another generally available model, Fable's reasoning is dropped. The request goes through without an error, apparently.

So if you stay in the same conversation and "move up to Fable when Opus gets stuck," then once you pay the cache-write cost, what Opus had thought up to that point is passed to Fable. The risky part is going back to Opus after Fable has gotten past the hard spot. If the reason Fable chose that design, or which options it threw away, exists only inside the thinking blocks, Opus carries on writing without knowing it. Since the request doesn't error, it should be hard to notice that the thinking was dropped.

Note that this asymmetry should matter when you carry the same conversation history over as is. How thinking blocks are handled under `/compact` or in a new session is not written in the post, but if you re-summarize the history, it's natural to assume nothing is carried over on the way up either. Also, the post's explanation here is about the Claude API and Google Cloud (Google-managed), and I have not confirmed whether the same happens with `/model` in Claude Code.

## Have it write things down before going back

The countermeasure I have in mind is simple: before stepping down from Fable, have it write the decisions it made and the options it discarded into the body of the conversation or into a plan file. Thinking blocks vanish, but ordinary messages and files remain. I have not yet tried this countermeasure deliberately.

This doesn't contradict the post's advice either. The "write a short plan and start a new session" that the post recommends before switching is a way to cut the cache cost, but it is also a way to turn thinking into visible text. In either direction, if you write the plan and then switch, the cache cost is small and the reasoning stays as text. You also no longer need to rely on the "it's carried over on the way up" point from above.

One more thing: my rules file still says "深い推論が必要なときは、ユーザーが `/model` で Fable 5.1 に切り替える" (when deep reasoning is needed, the user switches to Fable 5.1 with `/model`). The version is out of date, and where "deep reasoning" starts is vague. Following the post, the trigger can be split in two. One is work you start on Fable from the beginning, like a large refactor or migration, or planning a design. The other is when you want to raise Opus past `high`. The latter is decided not by mood but by the effort ceiling, so it is an easy trigger for me to use.

## If you take away only one thing

When you step down from Fable, leave in text what it thought. Thinking blocks are not passed to the model below.

Source: Addy Osmani, "[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)" (claude.dev, November 9, 2026). I have not read the Fable 5.2 introduction page, the launch post, or the Preserved thinking documentation. The handling of thinking blocks is about the Claude API and Google Cloud (Google-managed), to the extent the post describes it.
