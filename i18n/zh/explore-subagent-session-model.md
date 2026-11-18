---
title: "关于 Explore 子 agent 用的模型"
emoji: "🔍"
topics: ["ai", "エージェント", "claudecode", "考察"]
published_at: "2026-11-10"
---

Addy Osmani 的"Which Claude model should you build with?"（claude.dev，2026 年 11 月 9 日）是一篇讲 Haiku、Sonnet、Opus、Fable 该怎么分工的文章。其中关于子 agent 的一节是这样写的。

> In current versions of Claude Code, the built-in Explore subagent runs on your session's model instead of always running on Haiku. On the Claude API, that model is capped at Opus. To keep exploration cheap, define your own subagent named `Explore` with `model: haiku`.
>
> （在当前版本的 Claude Code 中，内置的 Explore 子 agent 不再总是运行在 Haiku 上，而是运行在会话所用的模型上。在 Claude API 上，该模型的上限是 Opus。想让探索保持低成本，就用 `model: haiku` 定义一个名为 `Explore` 的自己的子 agent。）

先说结论。

> 我认为可以加一条把 Explore 固定在 Haiku 上的设置。不过，文章把"错误很便宜就能发现"作为可以交给小模型的条件，这个条件只适用于探索的一半。"找到了"这个答案可以核实，"没有"这个答案却很难核实。对于漏掉就麻烦的探索，我认为最好不要交给 Haiku。

我给 Claude Code 写了一份关于子 agent 模型的自用规则，让它去读。读了这篇文章，我在那份规则里看到了一个漏洞。后半篇讲的就是这件事。

---

## 文章的标准是"错误是否很便宜就能发现"

文章用一张表列出了各个模型的起点。子 agent 那一行是这样的。

做文件搜索、读日志、做摘要的子 agent，从 Haiku 5.5 或 Sonnet 5.5 开始。理由一栏是这样写的。

> Wrong answers are cheap to spot, and the main model has the judgment calls anyway.
>
> （错误的答案很便宜就能发现，而且判断本来就由主模型来做。）

文中给出的例子，是一个读测试日志并报告失败测试的 `log-reader` 定义，带有 `model: haiku`。接着是一段划线：什么交给小模型，什么不交给。

> Keep small models on work where a mistake is cheap to spot, like finding files, running tests and reading logs. Keep code edits and judgment calls on the main model. When a small model misreads a search result, the main model opens the wrong file and spends tokens on it.
>
> （让小模型做那些错误很便宜就能发现的工作，比如找文件、运行测试、读日志。代码编辑和判断留给主模型。小模型读错搜索结果时，主模型会打开错误的文件，并在上面花掉 token。）

Claude Code 的 `opusplan`（计划交给 Opus、执行交给 Sonnet 的别名）正好相反，是把代码编辑交给较小的模型。所以文章也写了，要先在自己的任务上测过，再设为默认。

## 能发现的错误，和发现不了的错误

文章举的错误例子是"打开了错误的文件"。这确实很便宜就能发现。主模型一打开那个文件，马上就知道它无关。

探索的答案还有另一种。比如"这个函数的调用方有 3 处"，而第 4 处漏掉了。或者"没有任何地方读取这个设置"，实际上有。

这种错误发现不了。主模型把报告出来的 3 处改完，第 4 处没动就结束了。如果测试没有经过那第 4 处，直到评审都没人会察觉。这比文章说的"打开错误的文件，并在上面花掉 token"贵得多，而且这笔成本不会出现在 token 账单上。

![小黑站在桌前，用放大镜检查篮子里并排站着的三张带腿的小纸片。篮子旁边是橙字“3个”，小黑头顶是蓝字“没人发现”。小黑身后，第4张用红色虚线画出的纸片（红字“第4个”）正迈着腿走出桌沿，朝敞开的门走去](/images/explore-subagent-session-model/zh/01-fourth-slips-away.webp)

错误是否很便宜就能发现，我认为取决于问题的形状，而不是模型。

- "X 在哪里？"：答案错了，一打开就知道。用小模型就行
- "用到 X 的所有地方"：漏掉的东西，打开了也看不见。漏掉会很麻烦的话，就把 `grep` 的结果本身交给主模型，或者让主模型去找

`log-reader` 之所以在小模型上是安全的，是因为即使漏报了失败的测试，下次再跑测试还是会失败。它后面有核实的机制。全量枚举没有这个。

## 我的规则里的漏洞

我的 Claude Code 设置里，关于子 agent 的模型是这样写的（引自我自用的规则文件）。

> Agent ツールでは `model` を明示する。指定しないと親のモデルを継承し、Fable の場合はコストが跳ね上がるため。
>
> （使用 Agent 工具时要明确指定 `model`。不指定就会继承父模型，如果是 Fable，成本会暴涨。）

在它下面，我还写了"読むだけ・検索 → `haiku`"（只读、搜索 → `haiku`）。存放子 agent 定义的目录 `~/.claude/agents/`，是我有意留空的。

读了文章我才意识到，这条规则依赖主模型每次都写上 `model`。一旦忘了写，Explore 就会运行在会话所用的模型上。在我切到 Fable 的那天，在 Claude API 上就是 Opus。是否忘了写，要到事后看用量才知道。

在另一个规则文件里，我把"ルーティング・リトライ・ステータス判定のように switch で書けるものに LLM の判断を使わない"（路由、重试、状态判定这类能用 switch 写出来的东西，不要用 LLM 的判断）写成了设计应用时的原则。它是针对应用写的，但用哪个模型来探索，同样是能用 switch 写出来的处理。与其每次让模型想起来，不如放一份 `Explore` 的定义，这更符合我自己的原则。

![一条铁轨分成两条的岔路口，小黑用螺丝刀把一块小金属板拧在道岔扳手上固定住。板子上方是橙字“一份定义”，扳手被扳向左边，橙色箭头指向左。左边路尽头的小箱子上是蓝字“haiku”，右边路尽头的大箱子上是蓝字“会话的模型”。小黑脚边有一张皱巴巴的便签，红字“每次都要记”被红叉划掉，一只黑猫坐在上面](/images/explore-subagent-session-model/zh/02-fixed-switch.webp)

不过，要放的话，必须和上面那条界线成套。而且写到这里我才发现，我规则里的"搜索 → `haiku`"本身，就已经把"全部列出来"这类探索也交给了 Haiku。漏洞不只是忘了写。

也可以在 Explore 定义的说明文字里写上"不用于全量枚举"。但那样依赖的是主模型读了说明文字并照做，和前面的原则又冲突了。我认为更好的办法，是把规则本身改写成分开的两条："找位置 → `haiku`，列出全部 → 由主模型读 `grep` 的结果"。

## 细小但管用的两点

文章里还写了两件在写设置之前最好知道的事。

一件是，`haiku` 这个别名指向的模型因地方而异。在 Anthropic API 上是 Haiku 5.5，需要 Claude Code v2.1.293 或更高版本。在 Amazon Bedrock、Google Cloud、Microsoft Foundry、Claude Platform on AWS 上，仍然指向 Haiku 4.5。想固定的话，可以用 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 来指定。

另一件是，只有 Haiku 5.5 的单价会随提示长度变化。

> A prompt of up to 100K tokens bills at the lower tier, and a prompt over 100K bills at five times that rate.
>
> （10 万 token 以内的提示按较低档计费，超过 10 万 token 的按其 5 倍的费率计费。）

读日志是文章说适合 Haiku 的工作，同时也是提示容易变长的工作。即使超过 10 万，单价仍是 Sonnet 5.5 的四分之一，所以还是便宜。尽管如此，文章写道，如果每次都需要很长的提示，应该按完成每个任务的成本来比较，而不是按标价。与其把整份日志交过去，不如用 `grep` 只截取失败前后的部分再交，用哪个模型都更省钱。

## 只带走一件事的话

要不要把子 agent 交给小模型，看"这个答案如果错了，谁会在什么时候发现"。回答"没有"的探索，没有人会发现。

`CLAUDE_CODE_SUBAGENT_MODEL` 这个环境变量（用来决定没有指定 `model` 的子 agent 的默认值）对内置的 Explore 是否也有效，我从文章里读不出来。我自己也没有试过。可靠的办法是按文章所说，放一份名为 `Explore` 的自己的定义。

出处：Addy Osmani "[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)"（claude.dev，2026 年 11 月 9 日）。Claude Code 的 model configuration 和 subagents 文档我没有读过。
