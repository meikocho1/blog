---
title: "The Claude Code Team's Verification Gates"
emoji: "🚧"
topics: ["ai", "claudecode", "エージェント", "コードレビュー", "考察"]
published_at: "2026-11-18"
---

Addy Osmani wrote "How the Claude Code team thinks about verification" on claude.dev (November 16, 2026). On the Claude Code team, Claude reportedly writes about 90% of the code and Claude reviews it. At that scale, the article pulls together how they get an agent to check its own work with evidence.

When I finished reading, I copied just one line into my notes.

> I think the sentence doing the most work is "Changes can't modify their own checks." The article keeps to it by reading the review rules from a branch the change can't touch. But the verify skill that the same article recommends is meant to live inside the repository, in a place the change can rewrite. If you protect a verdict, protect it by where it lives. Read with that in mind, the article itself has a verdict that isn't yet protected by where it lives.

---

## About this post

I read only the body of the article. I have not read "Solving code review at Anthropic," which the article links to, or the Code Review and hooks documentation.

I'll also say where I stand. I use Claude Code on my own, and I don't have mechanisms like the commit gates or the reliability checklist in the article. What I have is a rules file I make Claude read, the permission settings in `settings.json`, and a mechanical check of quotations when I write blog posts.

## First half of the article: three kinds of tests worth investing in

The first half is about which tests to invest in. Three are listed.

The first is the E2E test. It traces a real user flow (add to cart, purchase, go to the confirmation screen), and because the whole feature either works or doesn't, it's hard to fudge. The article says unit tests can pass while the feature is broken.

The second is the property test. You write properties that must not break, such as "encode then decode gets you back the original" or "the balance never goes negative," and have a library generate large numbers of inputs to look for counterexamples. The explanation was that the advantage is trying inputs that don't share the bias of the agent that wrote the code.

The third is the differential test. In situations like a migration, where behavior must not change, you feed the same input to the old system and the new one and compare the results.

The article also names a failure to avoid.

> If your tests are flaky you'll train the agent to run them again rather than fixing the failing code.

## Second half of the article: how the team works

The second half is the Claude Code team's own way of working, and for me it was the main subject. Here it is in a short list.

- Verification means running the change. Turn the steps for launching and operating the app into a skill named `verify`, and have Claude use it before committing
- If a check still fails after three fixes, Claude stops and calls a human
- Checks are written by the owner of the code
- There is a 39-item reliability checklist, and each item comes with a "trigger you can read from the diff." Claude checks only the items that apply to the diff (usually 3 to 10)
- Don't stack reviewers; tune a single reviewer with REVIEW.md
- Changes can't modify their own checks
- Start a new gate in "observation mode" first
- Watch the reviewer too. Track things like the number of changes that were reverted after merge and the number that maintainers rejected before merge
- Turn misses into rules. Clean up the rules periodically too

## Protect it by where it lives

Of these, the one I found heaviest is "Changes can't modify their own checks."

> If a change can modify the check that judges it, the check is broken.

Concretely, Code Review reads REVIEW.md from the base branch, not from the PR's changes. The rules that decide whether a change gets through live on a branch the change can't touch.

What matters here is that the protection isn't an instruction saying "don't rewrite it." It's placed where rewriting it has no effect. Whatever the agent decides, the PR's changes don't reach it.

![Sumi stands on a small stepladder, placing an open rulebook on a high shelf (blue "Base branch"). A tall brick wall stands between the shelf and a walking sheet of paper (orange "Change") on the other side, which stretches a pencil-holding arm up toward the wall but can't come close to reaching the book (red "Out of reach"). A black cat sits on top of the wall](/images/claude-code-team-verification-gates/en/01-base-branch-wall.webp)

Mechanisms for keeping a record are listed too. Stamp each commit with how it was verified, record "none" as well, and make unverified commits searchable later. Run a new gate in observation mode first, record what it would have stopped, and check for false positives.

But unlike protection by where it lives, these have escape hatches written out explicitly. If you write in the commit message why you didn't verify, it goes through. If you're stopped twice in the same session, the third time goes through. The article explains these as outlets so Claude doesn't get stuck. I read it as a mechanism whose weight is on being searchable afterward rather than on stopping.

## A verdict in the article that isn't protected by where it lives

Still, something caught my eye as I read. It's where the verify skill lives.

> Put it in a .claude/skills/ folder in your repo, as close to the relevant code as you can, and add as many as you need.

The verify skill is what the article calls a "smoke-test harness," the procedure for checking that a change actually runs. Its role differs from a rule like REVIEW.md that decides whether a change can merge, but it is still judging the change. If it's inside the repository, a PR can rewrite it. You could change one line of the launch procedure so it never opens the broken screen. REVIEW.md is read from the base branch, but the article doesn't say the verify skill gets the same treatment.

![Inside a big cardboard box (blue "Repository"), a walking sheet of paper holds a large eraser and rubs out the first line of a checklist taped to the inside of the box (blue "verify", red "Erasable"). Sumi leans over the edge of the box and peers in with a magnifying glass; a black cat sits on top of the box](/images/claude-code-team-verification-gates/en/02-verify-in-box.webp)

It's possible that the article's other mechanisms make up for this. The commit gate checks whether /code-review or /verify was used in the session. On the /code-review side, REVIEW.md is read from the base branch, so it can't be rewritten. The article also says checks are written and tuned by the owner of the code. Even so, for /verify, "was it used" and "was it used with a procedure that hasn't been rewritten" are separate questions.

There are similar paths elsewhere. For flaky tests, the article lets Claude "delete the test and write down why if it can't find the root cause." The rules files are also tidied periodically. Both are paths by which the change's side can reduce verification. The article ends by summing up the verification layer as "put it out of reach of the changes it judges."

> Keep it out of reach of the changes they judge,

If you apply that sentence to the verification layer as a whole, I think the verify skill and the decision to delete a test should both be put outside the change. Once you've decided that "verdicts are protected by where they live," you start to see which verdicts still aren't.

## Counting in my own environment

I tried applying this principle to my own environment.

In my Claude Code, which commands are allowed is decided by allow/deny in `~/.claude/settings.json`. That is enforced by Claude Code itself; it isn't something I'm just telling Claude. Separately, the instructions set by my organization's administrator include one sentence: "Claude 自身が権限設定（.claude/settings.json 等の allow/deny）を緩める変更をしない" (Claude itself must not make changes that loosen permission settings such as allow/deny in .claude/settings.json).

The problem is the relationship between the two. allow/deny is enforced, but the file it's written in is in a place Claude can rewrite by editing files. What stops the rewriting is that one sentence in the administrator's instructions. The location is on the administrator's side, but the way it's enforced is by telling.

In fact, within the past week I had Claude rewrite the model settings in `~/.claude/settings.json`. I asked only for a change to the default model and effort, and didn't touch permissions. Even so, allow/deny is in the same file, and Claude was in a position to reach it.

To borrow the article's phrasing, my permission rules are close to the state where "a change can modify the check that judges it." The testing rule is similar. My rules file says "what you fix is the implementation, not the test (unless the test itself is wrong)," but the test files are in a place Claude can edit, and the exception in the parentheses is there too.

Protecting everything by where it lives is overkill for a personal environment, I think. Still, it's worth moving things that are hard to notice once loosened, like permissions, to a place Claude can't rewrite, starting from those. I believe Claude Code has an administrator-level setting that users can't override, but I haven't checked how far it can be used.

## If you take away one thing

List the rules you make your agent follow, and ask of each one, "if the agent rewrote this, would it stop working?" The ones that would stop working are only being told.

![Sumi turns the crank of a hand-cranked press. The machine hammer (blue "If rewritten") strikes one of three rule cards lined up on a workbench: the first is already crushed with a red cross (red "Broken"), and an orange arrow runs from the untouched card at the back, asking "Still works?". A black cat sits at the end of the bench](/images/claude-code-team-verification-gates/en/03-rewrite-press.webp)

Source: Addy Osmani, "[How the Claude Code team thinks about verification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/)" (claude.dev, November 16, 2026). I have not read "Solving code review at Anthropic," which the article links to, or the Code Review, hooks, and /goal documentation. I also haven't checked in the documentation how the administrator-level settings work.
