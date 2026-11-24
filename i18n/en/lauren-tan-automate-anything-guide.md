---
title: "I read Lauren Tan's guide to automating anything"
emoji: "🥧"
topics: ["ai", "エージェント", "自動化", "考察"]
published_at: "2026-11-24"
---

Here's the conclusion up front.

> The skeleton of the article is: separate the goal from the process, tell the bot the process out loud, teach it how to check the work and where the information comes from, and run it on a set trigger. The two places I found most effective were quiet ones. One is the definition of done, "a booking isn't finished just because an email was sent," and the other is the paragraph saying it helps to have the same ID across apps. Both are about getting closer to a form in which an outside check can decide whether the work is done, and they point the same way as the lint rules Lauren Tan invested in for her own development. On the other hand, the item on how to check is presented as something you tell the bot by talking, and the article never gets to building a mechanism that decides whether the work is done. That's where I would add something.

---

## About this post

What I read was an X article by Lauren Tan (@poteto), who builds Grok Bot, "Automate Anything with Grok Bot," published on November 18, 2026 (UTC), together with the post introducing it.

> I think a lot of people aren't using Grok Bot to its full potential, because knowing how to automate things is actually quite a difficult skill to learn.

The audience is people who don't write code. A little while ago I wrote a post about how the same Lauren Tan described her own way of developing on a podcast, so I read the two side by side.

Let me also state where I stand. I have never used Grok Bot. I haven't installed Dr Eggbot (the bot that designs bots), which the article recommends at the end. What I automate with is Claude Code, and what I use is rule files and hooks. Lauren Tan is on the Grok Bot team, so the article is also a how-to for the product.

## How the article runs

In order, it goes like this.

1. Automation is a way of thinking, made of two things: a goal and a process (baking an apple pie, changing a flat tire)
2. Start with the goal. Don't mistake a process for the goal. Filling in a form or sending an email is not a goal; it is just one step of a process
3. Hand over the process by talking it through by voice, as it comes to mind. The usual steps, the things you watch out for, the apps you use, how you check the work, where the information comes from, and where you get feedback
4. Teach the judgments you make without thinking about them
5. Let the bot gather feedback on its own and improve
6. Decide on a trigger (email, message, scheduled run) and let it run automatically. In Grok Bot this is called a routine

The sections on teaching goal, process, and judgment come with sample phrases you can say to the bot as they are. For example, after handing over a process, you don't have it run right away; you first have it restate.

> I want you to think about how you can take this over completely from me. Before you begin, restate what you think my goal and process is in simple English so I can give you feedback and confirm it.

The first half is almost the same as the procedure for handing work over to a person. What differs is that it says not to cling to the process, because the bot may find a more efficient way, which assumes that even reviewing the process itself is left to the bot.

## "Sending the email doesn't mean it's done"

What made me stop reading was the booking example in the section on "teaching how to think."

> A booking also isn't finished just because an email was sent. The appointment needs to be saved correctly and the customer needs a confirmation.

It goes on to say which to trust when the email and the booking system disagree on the time, and that while waiting for details the bot should record that, so that when it resumes later it doesn't create the booking twice.

Packed briefly in here are a definition of done, which side is the source of truth, and not breaking when the same process runs twice. The article handles this in one paragraph, but I thought it was the heaviest paragraph in the article. "I sent the email" is something the bot can say itself, whereas "the booking was saved and the customer got a confirmation" is something you can check against an outside record. The article itself doesn't go as far as saying "check against an outside record." Reading it that way is on me.

![A huge ledger stands upright on a stone desk like a heavy slab, and sumi presses a stamp onto one empty row (red "Saved"). On the left, a paper airplane flies off along an arrow (blue "Email sent"). On the right, a small tray holds an envelope with a red check (orange "Confirm to customer"). A black cat sits on the corner of the ledger](/images/lauren-tan-automate-anything-guide/en/01-email-vs-ledger.webp)

## The ID paragraph

The other is the last paragraph of the section on having the bot improve itself.

> If you use multiple apps and services, having unique and consistent IDs across all these tools will help you bring that data together so bot can fully understand what's going on.

The paragraph before it says the more data there is, the more the bot can help. The example is a car repair shop. If you record the time the customer arrived, the time they got to talk to the front desk, the time you took their keys, and the start and end of the work, you can calculate wait times and look for the cause. When someone writes on Yelp that they waited a long time, you can check it against that day's records.

The article puts it as "the more data and connections, the more helpful," but I think the next step matters more. When there is data linked by the same ID, the "booking was saved and the customer got a confirmation" from earlier can be decided by matching the booking system against the email records, not by the bot's own report. The ID is the foundation for checking completion from the outside.

![Three card boxes labelled "Booking", "Email" and "Visit log" sit on a table, each with a tall card standing up in red "Same ID". Sumi lines the three cards up in one row with both hands, and an orange line runs through them (blue "Connected"). A black cat sits beside them](/images/lauren-tan-automate-anything-guide/en/02-same-id-cards.webp)

## My view

In my earlier post, I covered how Lauren Tan described her own way of developing on a podcast. The point was that, to let an agent merge her PRs, she moves the problems she used to catch in human review into lint rules and static analysis.

> We don't want to have to catch it in code review. We'll actually build it as like a lint rule.

This article reads to me like the same person saying the same thing to people who don't write code. What differs is the tool. In development, she wrote the check in a form a machine could judge, a lint rule. In this article, how you check is one of the six items of the process (How you check that the work was done right), and it is to be conveyed by talking.

A check you convey by talking is something the bot remembers and keeps to. The article also shows a route where the bot looks at email, social media, Yelp reviews, and that day's records and ties them to improvement, but that is a means of noticing after the fact. The booking example and the ID paragraph are clues for making the check something that can be judged from the outside, and the article doesn't go that far.

The other thing that caught my attention was the section on having the bot improve itself. The heading is "Let your bots improve themselves," which reads as the bot improving itself. In the concrete examples in the body, though, the bot gathers feedback and "suggests improvements"; it doesn't say the bot rewrites the process on its own. Which side of that line the article means, I can't decide from the article. I think it should stop at suggestions. If the same bot can rewrite both the process and how it is checked, the check can loosen to fit the process. Whether to adopt a change is for a person to decide.

I can imagine the objection that telling people who don't write code "make the check something a machine can judge" won't reach them. But the article already contains a clue. It says itself that Grok Bot can build tools and apps for collecting data. If you can have it build an app that records arrival times, you should be able to have it build a small mechanism for checking "was the booking saved." Don't just talk through how to check; have it build the tool that checks. That's where I would add something.

![On the left, sumi speaks into a big horn-shaped funnel and a small round machine just nods in return (blue "Just nods", "Tell by talking"). On the right, sumi tightens a bolt with a wrench on a small gate-shaped checking machine, its lamp lit as a box passes through (red "Have it built", orange "A tool that checks"). A black cat sits on the bench](/images/lauren-tan-automate-anything-guide/en/03-speak-vs-build.webp)

## If you take away only one thing

When you hand work to a bot, write the definition of "done" before the process. And write it in a form that can be checked against an outside record, not the bot's report. The booking example in the article can be used as a way to write that definition.

Sources: Lauren Tan (@poteto), "[Automate Anything with Grok Bot](https://x.com/i/article/2122921713864171520)" and the introducing [post](https://x.com/poteto/status/2123159537016533493) (X, November 18, 2026 UTC). The lint rule remark is from Y Combinator, "[The Rise Of AI Coworkers](https://www.youtube.com/watch?v=y1-9yeYLJUo)" (Lightcone, November 14, 2026; checked against YouTube's auto-generated English captions). I have not used Grok Bot or Dr Eggbot.
