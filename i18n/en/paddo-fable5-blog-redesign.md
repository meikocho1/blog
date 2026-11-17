---
title: "paddo.dev's Fable 5 redesign"
emoji: "🎨"
topics: ["ai", "llm", "デザイン", "評価", "考察"]
---

I tried to read the UX Planet article "Can Claude Fable 5.2 Replace Product Designers?" (Nick Babich, November 10, 2026), but it is members-only and I could only read the opening. Instead I found a post that answers a nearby question on the author's own site: paddo's "[One-Shot Taste: Redesigning This Blog with Claude Fable 5](https://paddo.dev/blog/one-shot-taste/)" (July 4, 2026). The model is the earlier Fable 5, and the question is slightly different too: "does a one-shot demo hold up on real work on an existing site?"

Here's the conclusion up front.

> By paddo's estimate, 60% of the Fable 5 redesign was making the site obey a design document that had already been written. The site had not been obeying it when humans did the work. From this I read that the answer to "can it replace designers?" depends heavily on whether there is a design document written in a form that can be checked. The one remaining human job that paddo lists, checking the mobile widths, is something I think can partly be handed to the model if you give it the steps for checking.

---

## About this post

I read only paddo's post. Claire Vo's test, Michal Malewicz's test on a real project, and the Hacker News thread that the post cites are known to me only through paddo's quotations; I have not seen the originals. I could read only the first three sentences of the UX Planet article, so I do not touch its conclusions.

I should also say where I stand. I did not have Fable do any design work for this post. This blog's repository has no file that corresponds to a design document. What I compare in the second half is the blog's rules for "writing" instead.

## The viral demos, and what lies outside them

The first half of the post describes the week on X starting June 9. Demos lined up: a landing page built in one shot from one sentence, a macOS-style web OS packed into a single HTML file. It quotes a post from Meng To, who has taught designers for ten years.

> Claude Fable 5 is a monster for creating landing pages.

paddo's view is that the demos are real but they are bait. A one-shot demo has no constraints. There is no existing brand, no old CSS, no person with opinions about their own site. Start from a blank page and a strong "usual style" looks like genius.

Voices from the other side are quoted too. Claire Vo had it make a product design in one shot and wrote that it was not even slapdash AI work but fundamentally bad design. And paddo writes that one HN comment described their own week exactly. One-shot UI is still so-so, but the model

> can keep a design system together much better without veering off into random tailwind classes.

## What came out first was a "charge sheet"

paddo's blog has a written design document. Dark only, cyan accent, pixel-art-style decoration, glow effects only when earned and never sprinkled around, and the pixel display font reserved for small labels.

> The first thing Fable 5 produced was not a redesign. It was a charge sheet.

The site was violating its own design document. Gradient buttons that the document forbids, glow effects reaching even the bullet points of lists, the pixel font used larger than the upper limit, three card grids of identical construction on a site that promises hierarchy.

In paddo's estimate, 60% of the redesign that followed was making the site obey "rules that had already been written," and 40% was new moves. A phosphor-dot background that drifts in response to the cursor, and replacing the grid of identical cards with a numbered list, are examples. The post ends like this.

> The phosphor field behind the title above you is the model’s idea. The rules that kept it cyan instead of purple-gradient are mine.

## What got replaced was the effort of enforcing rules

Here is what I can say about "can it replace them?" from this record. From here on it is my reading.

60% of the work was making the site obey rules. paddo had written those rules earlier, but as three years of CSS piled up, the site stopped obeying them. What the model did was check the site against rules that people had failed to keep, list the gaps, and fix them. paddo wrote the rules, and the reason the redesign avoided purple gradients was, in paddo's own words, because the identity was written down and enforced. Starting from a blank page, paddo writes, the output gathers around the usual style.

So I think the question "can it replace designers?" is hard to answer as it stands. To make it answerable, I would put it as "is there someone who writes the rules and does not give way on them?" If there is, a lot of the effort of enforcing the rules can be left to the model. It even picks up what human hands could not keep up with. If there isn't, the model drifts back to its usual style.

## The same thing was happening with this blog's writing

Reading this record reminded me of something similar on my own blog. Not design, but writing.

I have Claude help draft the articles on this blog. Among the writing rules I have it read is a section on titles. I made it in September 2026 by counting the titles of 80 Hatena Blog technical articles and 45 articles on this blog. Titles with a dash and a subtitle were 6% on Hatena and 100% on this blog. Titles of 30 characters or fewer were 43% on Hatena and 0% on this blog.

It resembles paddo's site violating its own design document, but there is a difference. paddo's rules were written first, and the site did not follow them. In my case the rules were not written anywhere yet, and it was only by counting that I saw "they are all the same mold." After counting, I wrote "15 to 25 characters" and "dash subtitles in at most one of five articles," and since then those rules get applied to every draft.

One thing became clear here. Rules that are easy to enforce are the ones written in a form that can be checked. "Does it have a dash subtitle?" and "is it over 30 characters?" can be judged just by looking. paddo's rules also line up in checkable form, like "no gradients" and "the pixel font only at small sizes." Of the four violations on the charge sheet, the gradient and the font size are of this kind. "Glow only when earned" and "promise hierarchy" need a little more interpretation, but even those are reduced to judgments like "bullet points don't need a glow" and "three identical grids is not a hierarchy."

Conversely, rules like "make it good design" or "make the writing not sound like AI" cannot be enforced. I think how much can be left to the model is decided by how far we can write our rules into a form that can be judged.

## The mobile width was never shown to the model

Of the items paddo lists under "What Fable 5 doesn't solve," the one that interested me most was the one about verification.

> It screenshotted and checked the desktop build itself; the mobile breakpoints shipped on code review alone.

paddo sums this up as QA still being a human job. Why only the mobile width was not checked by screenshot is not written. But the model did check the screens it could see itself, and the screens it did not see got through on reading code alone.

Addy Osmani's post, which I covered earlier on this blog, also named letting the model verify its own work as the first thing to do when performance falls short. I think the same holds for design. Opening a browser at several widths and taking screenshots is now a few lines of script. If you hand over that procedure, there is a good chance the mobile width can be moved to the side the model looks at itself. I have not tried it, so I do not know whether the model can judge correctly what it sees.

I'll also note the last item in the post. According to paddo, after the relaunch Fable 5 started silently routing flagged requests to Opus 4.8. Some of the posts saying "Fable 5 designed this" might actually be Opus output. When you compare by looking at demos, you need to keep this uncertainty in mind too.

## If you take away only one thing

Before testing "can I leave design to the model?", write the design document in a form that can be judged, and hand over the steps for taking mobile-width screenshots. I think how much you can leave to the model depends heavily on those two.

Sources: paddo, "[One-Shot Taste: Redesigning This Blog with Claude Fable 5](https://paddo.dev/blog/one-shot-taste/)" (paddo.dev, July 4, 2026). Nick Babich, "[Can Claude Fable 5.2 Replace Product Designers?](https://uxplanet.org/can-claude-fable-5-2-replace-product-designers-8f0bd3554d12)" (UX Planet, November 10, 2026; members-only, so I read only the opening). I have not read the original articles for the tests that paddo cites.
