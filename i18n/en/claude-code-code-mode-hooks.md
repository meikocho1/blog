---
title: "The Code Mode docs and my own hooks"
emoji: "🧮"
topics: ["ai", "claudecode", "エージェント", "セキュリティ", "考察"]
published_at: "2026-11-18"
---

Anthropic's official developer account (@claudedevs) introduced Code Mode on November 17, 2026 (UTC).

> Check out Code Mode, a new, experimental way for Claude Code to work with tools. Claude writes scripts that chain your tools together in sophisticated ways, and it can answer you while long commands are still running.

The post was only a short introduction, the environment variable that turns it on, and a link to the documentation, so I read the linked page. Then I checked it against my own Claude Code settings, one item at a time.

Here's the conclusion up front.

> With Code Mode, what the auto mode classifier looks at changes from "each individual tool call" to "the code that bundles the calls together." The classifier does not see values that are decided while the code runs (such as a path taken from search results). My environment has no deny or ask rules at all, and I leave almost all of the decisions about what to stop to the auto mode classifier, so I was on the side that would be affected most. I also found one more thing: if there is a hook with a 1-second timeout, then once code has run, any tool call where that hook takes longer than 1 second will be rejected.

---

## About this post

What I read is the body of the document "Run tool calls from code with Code Mode". I have not read the permissions, permission modes, and hooks pages that it links to.

I should also say where I stand. My Claude Code is v2.1.326, which meets the document's version requirement (v2.1.323 or later). But I did not turn Code Mode on for this post. What follows is the result of reading the document and my own settings files side by side; I have not confirmed the actual behavior.

## What Code Mode does

Normally, Claude Code calls Bash, Read, and Edit one call at a time, reads the result, and then decides what to do next. In Code Mode, Claude writes JavaScript and calls the tools from inside it. The document's example looks like this.

```javascript
const files = await $`rg -l "function retryPolicy" src`.text();
const target = files.trim().split("\n")[0];
await edit(target, "maxAttempts: 3", "maxAttempts: 5");
({ edited: target, tests: $`npm test -- retryPolicy`.nothrow() });
```

It searches, edits, and runs the tests in one piece of code, and the last line returns only what Claude will read. The conversation shows tool calls such as the diff, and the code itself is folded away inside the transcript that opens with `Ctrl+O`.

The document lists the kinds of work it suits: the same change across many files, searches you want to narrow down before reading, and independent commands that can run at the same time. To turn it on, set the environment variable `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1`.

This "return only what will be read" is close to what I now have a plugin do. In my environment, if I try to read a large output directly with Read or Bash, the plugin's hook stops it and tells me to process it in a sandbox and output only the answer. Code Mode looks like a mechanism that does that on the Claude Code side itself.

However, the document's table of reasons it does not start includes "it doesn't yet work with the plugin" and "it doesn't yet work with an installed mod". In my environment, where I have a plugin that inspects and rewrites tool calls, I don't know whether it would start at all.

## The classifier does not see values decided at run time

The main subject is the permissions section. Each tool call inside the code passes through the deny and ask rules and the PreToolUse hooks one at a time, under the usual tool names. What changes is the auto mode classifier.

> the classifier reviews each piece of code before it runs, not each tool call. It doesn't see values computed at run time, such as a path taken from search output, so keep rules or hooks for calls you must control.

In the example above, what the classifier sees is code that says "edit the first line of the `rg` result." Which file gets edited is not decided until `rg` runs. Ordinary auto mode looks at each call, so I think the file name for Edit should be visible to it, but I have not read the permission modes page, so that is a guess.

![Sumi sits at a small desk, peering through a magnifying glass at a single sheet of paper (the code before it runs) and pressing a blue "Classifier" stamp on it. An orange arrow runs from the sheet to the right, to a big hand-cranked machine that drops one box out of a heap of identical file boxes into a bin; a red question mark floats over it, labelled "Which file?"](/images/claude-code-code-mode-hooks/en/01-plan-not-action.webp)

Here I opened my own settings. In `~/.claude/settings.json`, `defaultMode` is `auto`, `allow` is empty, and there is no `deny` or `ask`. The other settings file (`settings.local.json`) has a few `allow` entries, but there is no `deny` or `ask` anywhere. In other words, I have written no rule that stops anything, and I leave almost all of the decisions about what to stop to the classifier. I am on the side that lacks the rules the document says to keep.

The document also gives another caution. Bash rules match against the command string, so the same thing can be done in a form that matches no rule. This is not specific to Code Mode, it says. In Code Mode, a `git push` in the `app` folder can reach a hook as `cd 'app' && git push`. If I add rules or hooks, I will need to write them so that they split compound commands and check each part.

## The hook with a 1-second timeout

The other place where I stopped while reading was the troubleshooting section.

> **`the hook did not finish`**: your hook timed out on a call from code, or on any other tool call once Claude has run code in the session.

In this case the call is rejected on the grounds that the PreToolUse hook did not return a decision. This is so even if `onFailure` is not set.

In the PreToolUse section of `settings.json`, there is one hook that applies to all tools, and its `timeout` is 1 second. From its name and the text it displays, I believe it is a hook for updating the display of a desktop pet, and that it makes no permission decisions (I have not read the contents of the script). If the document is right, then in Code Mode, once code has run, any call where this hook takes longer than 1 second will be rejected. A hook that was never meant to stop anything ends up on the side that stops. I have not measured how often it actually exceeds 1 second. I have not checked the timeouts of the hooks that come from plugins either.

![Sumi stands beside a toll-booth style barrier gate holding a stopwatch (orange "1 sec"). A box riding the conveyor has been stopped by the lowered bar and is marked "Denied" in red. A black cat yawns on the gate control box, with a blue note "Only updates the display"](/images/claude-code-code-mode-hooks/en/02-slow-hook-gate.webp)

The document's prescription is to extend the timeout or to add `"onFailure": "continue"`. For a hook that only updates a display, I think the latter fits.

UserPromptSubmit hooks, it says, also run on the code's output when code runs in the background. In my environment there is one in `settings.json` and a hook installed by a plugin that adds context. I have not checked whether either of them can return a decision to stop.

## My view

It is often said that to keep a decision safe, you put it where changes cannot reach it. Reading the Code Mode document, I thought a decision has one more condition: it can see the thing it is deciding on.

The Code Mode classifier looks at the code before its arguments are decided. What it sees is a plan, not the actual act. Even if the plan is correct, the act changes if `rg` returns an unexpected file. Rules and hooks, on the other hand, are applied one at a time to the calls inside the code too. I read the document's "keep rules or hooks" as saying that those are the ones that can see the actual values. The document also mentions a way to inspect the code itself: put a PreToolUse hook on `REPL` (the tool that runs the code) and read `tool_input.code`. But that, like the classifier, is a means of looking at the plan.

On the other hand, the protection of where the setting lives was solid. `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE` is ignored if written in a project's settings file, so a cloned repository cannot turn Code Mode on by itself. An organization's administrator can stop it with managed settings but cannot turn it on. Only the user can turn it on.

So my conclusion is that, before deciding whether to try Code Mode, I should count how much I leave to the classifier. In my case it was almost all of the decisions about what to stop. At the least, for anything whose destination changes with a run-time value (`git push`, `rm`, sending data outside), I plan to move it to deny or ask rules or a hook before I try it.

## If you take away just one thing

Before turning on Code Mode, count the `deny` and `ask` entries in `permissions`. If it is 0, the only thing stopping what you want stopped is a classifier that does not see values decided at run time. Look at the hook `timeout` next.

![Sumi crouches in front of a filing cabinet and pulls open its two drawers, labelled "Deny" and "Ask" in blue. Both are empty, each with a red "0". An orange arrow labelled "Only here" points to a black cat sitting in a small distant booth with a blue "Classifier" sign](/images/claude-code-code-mode-hooks/en/03-empty-drawers.webp)

Sources: ClaudeDevs (@claudedevs)'s [post](https://x.com/claudedevs/status/2122801681939234950) (November 17, 2026 UTC). Claude Code Docs, "[Run tool calls from code with Code Mode](https://code.claude.com/docs/en/code-mode)". I have not read the permissions, permission modes, hooks, and sandboxing pages that it links to. I have not actually turned Code Mode on, and I have not confirmed on my machine what happens when a hook times out.
