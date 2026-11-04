---
title: "Sorting Addy Osmani's Remedies for \"Cognitive Surrender\""
emoji: "🧾"
topics: ["ai", "エージェント", "コードレビュー", "考察"]
published_at: "2026-11-04"
---

Addy Osmani's new piece contains this sentence.

> Before I run an agent on any non-trivial task, I write down, even just in my head, what I think the answer might be.

What caught me was "even just in my head." Here's the conclusion up front.

> The "surrender" this piece describes creeps in a little at a time without the person noticing. If so, the remedies that live only in your head (the questions you ask yourself) should fall away along with it, without anyone noticing they were skipped. What works is the set of **habits that leave a trace someone can look at later**, like files, logs and tests, and I think "even just in my head" should be cut.

The original is "Critical thinking when agents do the work," which Addy Osmani published as an [X Article](https://x.com/addyosmani/status/2117512471930167377) on November 3, 2026.

A disclosure. I read the body as text through the fxtwitter API. There is one image embedded at the end of the piece, and I haven't seen it. I also didn't open the papers and blogs it links to (the "cognitive surrender" paper, Margaret-Anne Storey's post, and so on). And I haven't tried the practices in the piece myself or measured their effect.

---

## A slope with three levels

The skeleton of the piece is a split of how we hand work to agents into three levels.

> At the top: cognitive offloading, the act of delegating tasks to the AI, but maintaining ownership of the result. I do this all day. You should, too. In the middle: deferral, where the output of the tool becomes your new input; the result has ceased to be a hypothesis. At the bottom: cognitive surrender - the AI's output quietly becomes your own, you feel no need to check it.

"Cognitive surrender" is apparently a term from Steven Shaw and Gideon Nave at Wharton.

I have no objection to the three levels. What matters is the explanation of how people walk down this slope.

> The transition is rarely observed, because the steps are each gradual and seem reasonable. You read the last answer well, so you skim the next one. You just scan the skeleton of the one after that. Then you get asked about a line and can't explain it, even with your agent's help.

The piece names one more place where surrender gets discovered.

> It's usually discovered when you try to apply a mental model of the system and it doesn't exist.

So it is invisible from the inside. It is found when someone asks you, or when your hands stop as you try to make a change. Either way, you only find out when something pokes at it from outside. These two quotes are the premise for how I read the rest.

![A pure white background. Sumi is drawn three times walking down a long, gentle staircase. At the top he reads a thick stack of pages with a pen; in the middle he glances at a single page while walking; at the bottom he holds only an empty frame and walks on with the same face. The black cat sits on the top step watching him go. Black labels "Offload" and "Defer", a red "Surrender", and an orange dotted line along the stairs with "Each step is small". At the lower right, a hand reaches out of a blue door holding a "?" card, labeled in blue "Noticed when asked"](/images/osmani-critical-thinking-practices-sorted/en/01-stairs-down-to-surrender.webp)

## Sorting the remedies by whether they leave a trace

The second half of the piece is remedies: six questions to ask yourself, verification habits, how to review, how to write prompts, weekly and monthly exercises. There are a lot of them, so I re-sorted them along a single axis: **can someone other than you check afterward whether you actually did it?**

| Remedy | Trace |
| --- | --- |
| Form a guess at the answer before asking ("even just in my head") | None |
| Ask yourself "am I asking it to help me think, or to think for me?" | None |
| Ask "what would have to be true for this to be wrong?" and go find out | The result of checking remains |
| Have multiple models argue the opposite side | The output remains |
| Ask yourself "would I bet on this in front of the person who has to maintain it?" | None |
| Ask yourself "what am I no longer practicing?" | None (the monthly write-up habit does leave one) |
| Define "verified" up front | Remains if written |
| Make the finish line a test, screenshot or log | Remains |
| Have a subagent in a fresh context critique the work, built into the loop | Remains |
| Have the agent list the decisions and assumptions it made | Remains |
| Put a quiz at the end of the change report and only merge on a perfect score | The questions remain; the score is self-reported |
| Record why something missed the bar in config, a hook or a test | Remains |

Four of the six questions are completed entirely in your head. And this is the core of my argument.

As quoted in the previous section, surrender advances with each step "seeming reasonable," unobserved by the person. If so, the further someone has drifted, the more they skip the in-head questions, and they won't remember having skipped them. I asked properly last time, so this time lightly, and next time not at all. The questions should walk down the same slope the piece describes for skimming.

By contrast, the items marked "Remains" leave a gap when skipped. No note with the guess, no list of decisions, no quiz record. Even if the person is drifting, a look at the files shows what's missing. But this only holds for traces that have been decided in advance to belong there. A trace nobody misses, like whether you read the opposing argument, can go missing without anyone noticing.

Let me head off an objection: this axis measures "did you do it," not "did you actually think." A perfunctory guess note is still a trace. As the piece itself says, "You can also surrender verification." Leaving traces can be surrendered too. Still, an empty note reads as empty when you look at it later. A question skipped in your head doesn't even leave that.

![A pure white background. Sumi sits at a desk writing on cards and dropping them into a long card drawer that extends to his side. In the row of cards there is exactly one empty slot, and the black cat points at it with its paw. Red label "This slot is empty", orange label "Written trace". Above his head, thought bubbles with "?" float up and pop into dotted rings, labeled in blue "In my head" and in red "Gone without a trace"](/images/osmani-critical-thinking-practices-sorted/en/02-empty-slot-in-the-drawer.webp)

I think Osmani is half aware of this distinction himself. About subagent self-critique, he writes:

> it's worth baking that into the loop so it runs every time, not just when you remember.

"Not just when you remember." That logic should apply to the six questions just as well. Yet the questions are left as "ask yourself," and the first one comes with "even just in my head."

The ending is interesting.

> Before you ask, write down what you think will happen, and after the agent is done, write down one thing it didn't check.

The final suggestion doesn't carry "even just in my head." Osmani hasn't retracted the opening sentence, and this "write down" may also include writing in your head. Still, I think it's better read literally: write it on paper or in a file. If I were to rewrite the opening sentence, I'd cut "even just in my head." That alone moves the question to the "Remains" side of the table.

## The hit rate of "Did I miss anything?" isn't given

There's one more passage in the piece that I'm most skeptical of.

> I still ask at the end "Did I miss anything?" That sounds silly, but so often, when I finish some complex feature work using a frontier model, look at it, review it, and then ask, "Did I miss anything?" It will then come back with two or three more things. That's why I always ask.

So often, two or three things come back. But how many of those two or three were actually missed is not stated.

From here on is my guess. I think a model asked "did I miss anything?" rarely answers "no." Listing something is the natural way to respond to the question. If that's right, getting two or three items back is not evidence that anything was missed. On a day with zero misses, two or three items might come back just the same.

In the same piece, he writes this about tests.

> When a check goes green, ask what it proved. Then ask what it didn't.

I think the same should be turned on "Did I miss anything?" This question returns something on any day, so the fact that it returned something proves nothing by itself. To check it, you'd sort the returned items one by one by "did this really need fixing?" and count what fraction were hits. I haven't counted yet, but I think continuing to "always ask" without counting is itself an entrance to the surrender the piece describes.

![A pure white background. A capsule vending machine with a button labeled in blue "Anything missed?". Three capsules have dropped into the tray, labeled in orange "Always comes out", and older capsules lie on the floor. Sumi opens one capsule while sorting them into two boxes on a stool beside him, labeled in red "Real" and "Not real". A tally counter hangs from his bag, labeled in orange "Count". The black cat looks down from the top of the machine](/images/osmani-critical-thinking-practices-sorted/en/03-capsules-always-come-out.webp)

## If you take away one thing

Write the questions you ask yourself on paper or in a file.

The piece says surrender advances invisibly to the person. Trying to stop something invisible with your own memory and self-control is a poor bet. The closing suggestion, "write down a guess before asking, and one thing it didn't check afterward," is two lines of text, and anyone, you or someone else, can check later whether it was written. I think keeping those two lines in a file will last longer than remembering all six questions.

You don't need to do it for every request. The piece also says "Where the stakes are low, feel free to delegate entirely," and doesn't ask you to write things down for requests where being wrong is cheap. The opening sentence is already limited to "any non-trivial task," so within that scope, write it in a file instead of in your head. That's the only thing I want to change.

## Source

- Addy Osmani, "Critical thinking when agents do the work," X Article, November 3, 2026 https://x.com/addyosmani/status/2117512471930167377
