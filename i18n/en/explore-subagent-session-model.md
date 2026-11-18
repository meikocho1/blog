---
title: "On the Model Behind the Explore Subagent"
emoji: "🔍"
topics: ["ai", "エージェント", "claudecode", "考察"]
published_at: "2026-11-10"
---

Addy Osmani's "Which Claude model should you build with?" (claude.dev, November 9, 2026) is a guide to choosing among Haiku, Sonnet, Opus, and Fable. Its section on subagents says this.

> In current versions of Claude Code, the built-in Explore subagent runs on your session's model instead of always running on Haiku. On the Claude API, that model is capped at Opus. To keep exploration cheap, define your own subagent named `Explore` with `model: haiku`.

Here's the conclusion up front.

> I think it's fine to add a setting that pins Explore to Haiku. But the condition the article gives for leaving work to a small model, "mistakes are cheap to spot," applies to only half of exploration. An answer of "found it" can be checked, but an answer of "there isn't one" is hard to check. For exploration where a miss would hurt, I think it's better not to hand it to Haiku.

I have written my own rules about subagent models and have Claude Code read them. Reading this article showed me one hole in those rules. The second half of this post is about that.

---

## The article's test is "can you spot a wrong answer cheaply"

The article tabulates a starting point for each model. The subagent row says this.

Subagents that search files, read logs, or summarize start on Haiku 5.5 or Sonnet 5.5. The reason column says this.

> Wrong answers are cheap to spot, and the main model has the judgment calls anyway.

The example given is a definition called `log-reader`, which reads test logs and reports the failed tests, with `model: haiku` attached. What follows is a line between what to leave to a small model and what not to.

> Keep small models on work where a mistake is cheap to spot, like finding files, running tests and reading logs. Keep code edits and judgment calls on the main model. When a small model misreads a search result, the main model opens the wrong file and spends tokens on it.

Claude Code's `opusplan` (an alias that leaves planning to Opus and execution to Sonnet) is the reverse: it sends code edits to the smaller model. So the article also says to measure on your own tasks before making it the default.

## Mistakes you can spot, and mistakes you can't

The mistake the article gives as its example is "opening the wrong file." That is indeed cheap to spot. Once the main model opens that file, it's immediately clear the file is irrelevant.

Exploration has another kind of answer. Take "this function has three callers" when the fourth is missing. Or "nothing reads this setting" when something actually does.

You can't spot these. The main model fixes the three reported callers and finishes without touching the fourth. If no test goes through that fourth one, nobody notices until review. That costs far more than the article's "opens the wrong file and spends tokens on it," and the cost doesn't show up on the token bill.

![Sumi stands at a table inspecting three small paper sheets with legs, lined up in a basket, through a magnifying glass. An orange label by the basket reads "3 found" and a blue label above sumi reads "nobody notices". Behind sumi, a fourth sheet drawn with a red dashed outline ("the 4th" in red) walks off the edge of the table toward an open door](/images/explore-subagent-session-model/en/01-fourth-slips-away.webp)

I think whether a mistake is cheap to spot is decided by the shape of the question, not by the model.

- "Where is X?": if the answer is wrong, you know the moment you open it. A small model is fine
- "Every place that uses X": a miss is invisible even when you open the files. If a miss would hurt, hand the main model the `grep` output itself, or have the main model do the search

`log-reader` is safe on a small model because if it fails to report a failed test, the next test run fails again. There is a mechanism behind it that checks. A full enumeration has no such thing.

## The hole in my rules

My Claude Code settings say this about subagent models (a quote from my own rules file).

> Agent ツールでは `model` を明示する。指定しないと親のモデルを継承し、Fable の場合はコストが跳ね上がるため。
>
> (Always specify `model` in the Agent tool. If you don't, it inherits the parent's model, and with Fable the cost jumps.)

Below that I also wrote "読むだけ・検索 → `haiku`" (read-only and search go to `haiku`). The directory for subagent definitions, `~/.claude/agents/`, is deliberately left empty.

What I noticed after reading the article is that this rule depends on the main model writing `model` every time. If it forgets, Explore runs on the session's model. On a day when I've switched to Fable, that is Opus on the Claude API. I can't tell whether it forgot until I look at usage later.

In another rules file I wrote, as a principle for designing apps, "ルーティング・リトライ・ステータス判定のように switch で書けるものに LLM の判断を使わない" (don't use LLM judgment for what can be written as a switch, like routing, retries, and status checks). I wrote it about apps, but which model explores is also something a switch can handle. Putting down one `Explore` definition fits my own principle better than reminding the model every time.

![At a fork where one railway track splits in two, sumi screws a small metal plate onto the switch lever to fix it. An orange label on the plate reads "one definition file" and an orange arrow shows the lever pushed left. The small box at the end of the left road is labelled "haiku" in blue, and the big box at the end of the right road "session model" in blue. At sumi's feet lies a crumpled sticky note reading "remember every time" in red, struck through with a red X, with a black cat sitting on it](/images/explore-subagent-session-model/en/02-fixed-switch.webp)

But if I put one down, it has to come with the line drawn above. And I noticed as I was writing this that my rule's "search → `haiku`" itself already sends even "list them all" explorations to Haiku. The hole was not only forgetting to write it.

I could also put "don't use for full enumeration" in the Explore definition's description. But that depends on the main model reading the description and complying, which again conflicts with the principle above. I think it's better to rewrite the rule itself, split as "finding where something is → `haiku`; listing everything → the main model reads the `grep` output."

## Two small details that matter

The article lists two more things worth knowing before you write the setting.

One is that the model the `haiku` alias points to differs by location. On the Anthropic API it is Haiku 5.5, and that requires Claude Code v2.1.293 or later. On Amazon Bedrock, Google Cloud, Microsoft Foundry, and Claude Platform on AWS, it still points to Haiku 4.5. If you want to pin it, you can specify it with `ANTHROPIC_DEFAULT_HAIKU_MODEL`.

The other is that only Haiku 5.5 changes its unit price with prompt length.

> A prompt of up to 100K tokens bills at the lower tier, and a prompt over 100K bills at five times that rate.

Reading logs is work the article says suits Haiku. It is also work where prompts tend to get long. Even past 100K the unit price is a quarter of Sonnet 5.5's, so it's still cheap. Even so, the article says that if you need long prompts every time, you should compare on cost per completed task rather than list price. Cutting out just the area around the failure with `grep` and passing that, rather than the whole log, is cheaper on either model.

## If you take away just one thing

Decide whether to send a subagent to a small model by "if this answer is wrong, who notices, and when." An exploration that answers "there isn't one" has nobody to notice.

I couldn't tell from the article whether the environment variable `CLAUDE_CODE_SUBAGENT_MODEL` (which sets the default for subagents that don't specify `model`) also applies to the built-in Explore. I haven't tried it either. The sure way is to put down your own definition named `Explore`, as the article says.

Source: Addy Osmani, "[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)" (claude.dev, November 9, 2026). I have not read Claude Code's model configuration and subagents documentation.
