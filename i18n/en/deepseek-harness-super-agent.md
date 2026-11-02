---
title: "Reading the DeepSeek Harness Super-agent Design"
emoji: "🛰️"
topics: ["ai", "エージェント", "llm", "アーキテクチャ", "セキュリティ"]
published_at: "2026-11-02"
---

Here's the conclusion up front.

> The design memo the DeepSeek Harness team posted on X about their Super-agent is most worth reading as a blueprint for "not letting the model decide whether to do the work itself or hand it off." The difference in their comparison experiment against a single session came from exactly that decision. On the other hand, the most eye-catching feature, reading a group chat and opening a PR without anyone calling it, stands on top of a security problem the authors themselves label "unresolved" in the last section. **I think that order is backwards.**

The original piece was published as an X Article on November 1, 2026 by [@DeepSeekHarness](https://x.com/deepseekharness/status/2116857257245987236). It opens with a note saying "the original is in Chinese, this is a machine translation" and "this is about design, not an introduction to existing features." The author is Yujia Qiao, and the ending also says that `dsh-superagent-prototype`, which implements part of the design, is "not an official DeepSeek product."

A disclosure. All I read was the body text of the English translation. I couldn't get the figures (the architecture diagram and the experiment graphs), so I haven't seen them. Numbers that appear only in the graphs, such as the token volume on the single-session side, are outside the scope of this piece. I also haven't run the prototype.

---

## The bottleneck is human attention

The problem statement fits in one paragraph.

> In our experience, a person can usually follow only 3 to 5 active sessions at once. With these designs, a single task is limited by model capability, but multi-tasking is limited by human attention.

So they want to hide the sessions from the user and make it look like "one agent that's always running." Five components are listed to get there.

- Two layers: a Router that only talks to people and hands out work, and Workers isolated one task at a time
- Event-driven: chat, email, CI, and review comments come in as Triggers
- Full duplex: long-running tools become asynchronous calls with `start()` / `stop()`
- Separation of compute, state, and execution environment: the loop in the cloud, state in a DB, execution in a light daemon on your own machine
- Watchdog: outside the main body, a model watches whether a Worker is spinning its wheels

None of these is a new invention, and the authors say so themselves. Fast Path / Slow Path, context as a cache (Inline and Spill), speculative execution, separation of compute and storage. It's a framing that applies old tools from computer systems to agents. I think that's a fair way to read it.

## Enforcing delegation through structure

The most important part is the ablation in 7.1. They fed in about 300 messages (about 20 of them were work requests), replaced the coding work with "a tool that just eats time," and compared scheduling only. Five runs each.

The Super-agent's completion time was p50 12.4 minutes, p95 15.7 minutes. The comparison target, "a single session plus a subagent tool," behaved differently depending on the prompt.

> With the neutral prompt, the model did not call a subagent in any of the 5 runs.

With the neutral prompt, the parent did everything itself, kept getting interrupted by new messages, and p95 came out at 29.5 minutes. The prompt that prioritizes delegation reads like this.

> Prefer handing each piece of work to a subagent of its own, and do only small things yourself...

With this one, it delegated in 4 of 5 runs. In the remaining one, the model judged the work to be "small," did it itself, and that became the long tail. The prompt allows "do small things yourself," so the model didn't disobey the instruction. It was just left to decide what counts as small.

> A single session has to rely on prompt engineering and the model's on-the-spot judgment to decide whether to delegate. The two-level architecture mitigates this problem at the system level instead: the Router does not execute work itself, and each Worker receives only messages from the Threads it subscribes to.

The Router is designed not to execute tasks itself, and section 2.1 says it "can run without a Bash tool." It has tools for handing out work and for recalling context, but it doesn't need a means of execution. If it doesn't have one, the judgment "this is small, I'll do it myself" never comes up in the first place. That said, I couldn't tell from the text whether the Router in 7.1 actually had its tools removed or was just held back by the prompt.

This is the part I nodded at most. In my own config I've written, as a principle for designing apps, "don't use LLM judgment for things that can be written as a switch, like routing, retries, and status checks." This experiment is something close to a measurement of that. Writing "prioritize delegation, do small things yourself" in a prompt is only asking for a judgment, while not handing over a means of execution removes the room for judgment. I think the 1-in-5 outlier is the limit of asking, showing up as it is.

Still, 7.1 compares the architecture as a whole (separating Router and Worker, subscription and pass-through, Worker isolation). It isn't an experiment that isolates "not giving it a means of execution." This data can't rank how much each piece contributes.

What wasn't measured is also clear. Coding is a sleep-equivalent tool, so they didn't look at what splitting into Workers does to the quality of the output. On cost, the only numbers the text gives are for the comparison with and without pass-through (removing pass-through increases the Router's judgments by about 30%, and cache reads go from 23.2M to 31.8M tokens, about 37% more). How many times more it uses than a single session isn't in the text, and I couldn't see the graphs. Saying "they bought speed and stability with tokens" is a purchase with no price written on it.

## Router batching is not evidence of headroom

7.2 load-tests the Router on its own. Raising the Triggers that need a judgment from about 1 per minute to about 40, the average batch size goes 1.0 → 2.8, the time per request 2.5 seconds → 3.9 seconds, and the amortized inference time per judgment 6.4 seconds → 1.6 seconds. The conclusion is "no need to split the Router yet."

Let me do a little subtraction here. What follows is my own estimate, not in the original.

Processing 40 judgments per minute at 1.6 seconds each takes 64 seconds of inference per minute. A minute is 60 seconds, so read literally, utilization is over 100%. Let me count another way. Processing 40 items in batches of 2.8 means about 14 requests per minute, and at 3.9 seconds each that's about 56 seconds. That's over 90% as well.

The original says that even then the Router "did not reach its throughput limit." That doesn't match my estimate. The definition of "amortized inference time" (how they counted a judgment that spans several requests) or the rounding of "about 40" might explain it, but I couldn't tell from the text. At the very least, these aren't numbers that read as having headroom.

For one thing, batches get bigger because events piled up during the previous inference. A batch size of 2.8 also means events are being made to wait. It's true that the amortized time drops, but that's efficiency that comes from a queue forming, and the wait for each individual event is probably getting longer (the original didn't measure wait time). The original also says the ceiling is set by "the context length and the number of Triggers it can handle accurately in one turn," so it isn't contradicting itself. But you should read off the numbers that the "current scale" in "enough for the current team size" is just short of 40 per minute.

## The more spontaneous it gets, the wider the attack surface

The showpiece of the original is the example where the in-house Super-agent, in public group chats, finds a bug, tracks down the cause, and opens a PR without anyone @-mentioning it. The "quietly reproduce and fix" policy in section 3.4 points in the same direction.

In the last section, 8.4, the authors write this.

> If a server-side intrusion or a prompt injection compromises the Agent Loop, every endpoint device connected to it could be taken over.

> As long as credentials on an endpoint can enter the model's context, normal execution can expose them.

Let me put these two next to the showpiece from before.

- The input is someone's message in a group chat, an email, a GitHub comment. In other words, things outsiders can write.
- It acts without being called. In fact, acting without being called is the selling point.
- On the local machine there's a daemon, with uncommitted changes and local credentials.

The more spontaneous it gets, the more chances there are for it to act on text an attacker wrote. The event filter in section 3.1 has a Fast Path that narrows by "sender, group, and allowlist," so narrowing it would protect you. But that's nearly the same operation as narrowing the "picks things up without anyone calling it" from before.

So I think 8.4 is not the fourth item under "future work." It's a precondition for combining BYOM (the setup that connects your own machine) with spontaneous Triggers in production. The original's wording is "unless this problem is solved, it can only be used within a very small, trusted scope," which says the same thing. The difference is placement, and I'd put it before section 2. Also, the showpiece example is a public group chat and a user group, a setup that acts when "someone reports a bug." That puts an example that takes input from outside the small trusted scope in the most prominent place.

On November 1, I [wrote about](/articles/cursor-tampered-claude-code-extension) the tampered Claude Code extension that showed up in Cursor's marketplace. That one was about the distribution path and this one is about the input path, but both end up at "the privileges of an agent sitting on your own machine."

## If you take one thing away

Don't hand the Router a means of execution.

Event-driven design and the separation of compute and state can't be tried without setting up a resident cloud environment and a daemon. "Don't give the command tower a means of execution" needs fewer parts. If you keep all the tools on the parent session and encourage delegation through the prompt, that's the same shape as the single-session side of this experiment. With the neutral prompt, the parent did everything itself in all 5 runs, and even with delegation prioritized, in 1 of 5 the parent judged it "small" and held on to the work. I haven't confirmed this in my own setup, but I think cutting down the parent's tools is worth trying.

Let me also write down what I haven't tried. I haven't run the prototype, and the original gives no numbers on how accurately the Watchdog can tell "deviation from the goal."
