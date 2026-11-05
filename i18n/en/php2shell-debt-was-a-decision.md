---
title: "PHP2Shell and IEEE Spectrum's \"Technical Debt\""
emoji: "🐘"
topics: ["php", "セキュリティ", "ai", "考察"]
published_at: "2026-11-05"
---

IEEE Spectrum ran a piece on PHP2Shell. Its subtitle reads:

> AI is forcing us to pay off 40 years of technical debt

On Hacker News it passed 1,000 points and drew more than 600 comments. Among the comments that collected the most replies are lines like "we've been building on quicksand" and "this AI auditing is going to make the promise of open source software getting audited by others actually real."

Put that subtitle next to the account the PHP Foundation published, and parts of it don't line up. Here's the conclusion up front.

> The root problem behind PHP2Shell was found in 2024, in the course of a human-run audit. What stalled was not discovery but a **decision**: which of several fixes to pick. What AI brought was proof that the bug could actually be used to take over a server, which made the decision impossible to keep putting off. What got paid off was less 40 years of code debt than two years of a judgment nobody could settle.

I'm not involved in PHP development. I'm lining up primary sources from the outside. I read the IEEE Spectrum piece (by Dina Genkina, November 2, 2026) and the PHP Foundation blog post (October 21, 2026) in full. I did not read the CVE technical details (the php.net announcement) or the technical write-ups by Calif and Wiz.

---

## What the IEEE Spectrum piece says

The piece makes three points.

First: bugs that sat around as mere crashes are getting promoted, thanks to AI, into things attackers can use. It quotes Suman Jana of Columbia University.

> If you look at any at any point of time, there will be a bunch of bug reports that are waiting to be fixed, which are just crashes. Most people don’t take them very seriously

Second: finding and fixing are asymmetric, and fixing is the heavier side.

> There is a fundamental asymmetry in finding bugs and fixing bugs

Third: so defenders should get money and frontier models, and formal verification should bring the fixing side closer to automation. Matthew Green of Johns Hopkins University is less optimistic: "Nobody's going to fix this problem until something really bad happens."

I have no quarrel with the second and third points. What bothers me is the first, and the subtitle that bundles everything together.

## The PHP Foundation says it was found in 2024

The PHP Foundation's post went out on the day of the fix release. Here's the part about the history.

> While fixing one of the issues Quarkslab reported, a PHP core developer contracted by the PHP Foundation found the first signs of the OOM problem behind CVE-2026-109618. In 2024, a potential exploit for the OOM problem was theorized, but no concrete vectors were found and other concrete issues with clear impact overshadowed these concerns.

The Quarkslab audit was PHP's first external audit in years, organized by OSTIF with funding from Germany's Sovereign Tech Agency. The person who found the problem was a human, not an AI.

So why did it go unfixed for nearly two years? The post is explicit.

> To fix the OOM problem, the PHP security team developed several competing approaches, but each came with its own trade-offs: backward compatibility breaks, new denial-of-service potential, or requiring changes to many third-party extensions which seemed impossible to coordinate. The PHP security team, operating on consensus, struggled to choose between these and feared the repercussions of shipping the wrong choice.

And they sum it up themselves:

> We won't pretend otherwise: the delay was a structural failure, caused by both the security team's decision process and its lack of resources.

There were candidate fixes. What was missing was picking one.

## What AI brought was "proof"

Things changed in the summer of 2026.

> On August 11th, researcher Ryan A at Calif reported an unconditional remote code execution with the same root cause as the OOM problem we had found in 2024.

Calif's audit was part of OpenAI's Patch the Planet program and began on July 30. OpenAI independently reported the same root cause, and Wiz reported a separate attack path on August 24. The post continues:

> The reports from Calif, OpenAI, and Wiz made the full impact of the OOM problem clear, and from August 11th onward, fixing it became the top priority for all of the PHP Foundation's team working on security.

From August 11 to the October 21 release is 71 days. That roughly matches the IEEE Spectrum line that "a team of four engineers spent two months developing a patch." Something stuck since 2024 shipped ten weeks after the proof arrived.

Laid out by how the time was spent:

| Period | What was happening | Who |
| --- | --- | --- |
| 2024 | Signs of the OOM problem found while fixing audit findings. Exploitation only theoretical | Humans (core developer) |
| 2024 – summer 2026 | Several candidate fixes; consensus couldn't pick one; work stalled and restarted | Humans (security team) |
| July 30 – August 11, 2026 | Unconditional RCE reported 12 days into the audit | Calif (with AI assistance) |
| August 11 – October 21, 2026 | Top-priority fix, released on all supported branches | Humans (Foundation team) |

The second row is the longest. And it's not the row AI sped up.

![Pure white background. Three sheets labeled "Plan A", "Plan B", "Plan C" lie on a long desk. sumi stands beside the desk with arms crossed, not moving. A black cat sleeps at the end of the desk. Torn-off pages of a wall calendar pile up on the floor, with "2024→2026" in orange. From the right, a small delivery robot holds out a red envelope marked "Pwned" in red. Above sumi, "Decide" in blue](/images/php2shell-debt-was-a-decision/en/01-three-fixes-stalled.webp)

## "Crashes don't get taken seriously" fits this case poorly

IEEE Spectrum describes the case like this:

> The bug underlying the PHP2Shell vulnerability was reported to the PHP Foundation as far back as 2024.

The year 2024 matches the Foundation's account. But in the Foundation's telling, it wasn't "reported" from outside: a contracted core developer found the signs while fixing audit findings. And right after that line, the piece explains that this kind of error normally just crashes the program, which isn't dangerous in itself, and so the bug remained unaddressed — and pours the case into Jana's general point that crashes aren't taken seriously.

The Foundation gives a different reason. An exploit was "theorized." They didn't shrug it off; they were stuck on how to fix it. They were short-handed, and other issues with clear impact came first. That is a different story from "it was just a crash, so we left it."

One more thing. A secondary source (merginit's explainer) cites PHP bug report #78876 from 2020 as an older record of the same behavior. When I opened it, it had been filed in November 2019 as a "Sec Bug," assigned CVE-2019-11048, and Closed in May 2020. At least that report was not left sitting as a mere crash. I could not confirm how much #78876 shares a root cause with the current bugs (the claim that "Calif later linked" them appears only in the secondary source, and I haven't read Calif's original).

The IEEE Spectrum piece's explanation of OOM ("an out-of-memory error, in which the amount of memory allocated to a piece of data is too small to hold the data") also differs in substance from the Foundation's (if a request hits PHP's memory limit "at exactly the wrong moment," partially initialized data is later treated as valid). It's a detail and I won't dig further, but together with the "40 years" in the subtitle, my reading is that the piece uses PHP2Shell as an entry point to a general argument and doesn't follow this case's own history very closely.

---

## My view: what dropped was the cost of proof, not the cost of decisions

This is the main part.

"40 years of technical debt" paints a picture of holes buried in old code, with AI digging them up. The PHP2Shell history shows a slightly different picture. The hole had been found. There were candidate fixes. What stalled was the decision — "we'll pay this price and go with this plan" — and what moved it was proof that the bug could actually be used to take over a server.

I'd like to call what changed here "the cost of proof." In 2024, an exploit was theorized, but no concrete attack path was found. The core developers who know the engine deeply were few, and had many other responsibilities. In 2026, an unconditional RCE arrived 12 days into an audit. That's the part where AI took over what Jana calls "a lot of very specific reasoning that is painful to do."

To be fair, proof wasn't the only thing that changed. In May 2026 the Foundation created the Ecosystem Security Team, and it added people in July and September. It also writes that the reason multiple people could work on the fix full time from August on was the Foundation's funding. And the cause the Foundation itself names for the delay is "both the security team's decision process and its lack of resources." So "proof moved the decision" might more accurately be "proof arrived just as the organization was getting ready." Still, the post states plainly that the switch to top priority happened on August 11, the day the proof arrived.

The cost of decisions, on the other hand, hasn't dropped. The Foundation writes:

> What tools cannot do is decide on the right fix for a long-standing design decision in the engine, weigh the compatibility trade-offs, and review the patch.

Proof gets cheaper; decisions cost the same. What follows? Proofs will now arrive in volume. According to the Foundation, since July 1 alone the team has published 15 CVEs and worked through more than 100 reports that turned out to be invalid, duplicates, or not reproducible. Each time a proof arrives, a stalled decision becomes "right now." In a world where proof can arrive in 12 days, there's no longer room to let a decision sit for two years.

IEEE Spectrum wrote that finding and fixing are asymmetric. I think the asymmetry needs to be split one level further. Of the work of fixing, the part where you write the patch may get faster with formal verification and LLMs. What stands out in PHP2Shell's two years is less the speed of writing a patch than the failure to settle on one of several plans (in the Foundation's words, work on a fix stalled and restarted repeatedly over months). Formal verification can prove "this patch is correct," but it won't decide "we go with this plan even if it breaks backward compatibility."

![Pure white background. Two balance scales side by side. On the left scale's pan sits a single small slip of paper, labeled "Proof" in orange, and a small robot keeps stacking more slips on it. The right scale's pan holds a heavy boulder and is pushed all the way down, labeled "Decision" in red. sumi grips the boulder with both hands, straining to lift it. A black cat sits between the scales, with "Only one got cheaper" in blue](/images/php2shell-debt-was-a-decision/en/02-proof-cheap-decision-heavy.webp)

### Re-examining your team's reasons for "on hold"

Bring this back to your own work and the question becomes: **which of the tickets on hold are stalled because "we don't know if it's exploitable" or "the repro conditions are narrow"?**

I think the call the PHP security team made in 2024 made sense on the information they had. There was no concrete attack path, there were other problems with clear impact, and people were limited. Under those conditions, putting it off was rational. The problem was that the shelf life of the premise "there's no attack path" suddenly got much shorter in 2026.

"We don't know if it's exploitable" is now a weaker reason to put something on hold. Of course, the 12 days here came from Calif researchers who know PHP and security deeply, using AI; it won't arrive that fast no matter who asks. Jana stresses it too: "I'm not claiming that AI can do it all by itself. It clearly cannot." Still, Jana's view is that the pool of people who can build such proofs is widening. "We don't know if it's exploitable" is drifting toward "nobody has seriously come to build the proof yet." If you put something on hold, write the reason in a form that survives a proof arriving, like "even if exploited, the impact stays within this scope."

The other thing is how decisions get made. The PHP security team writes that after this, it has started changing its process so that "decisions can be made by majority and compromises are encouraged." It also says a serious vulnerability with a fix stuck on hard trade-offs would now reach Foundation leadership much sooner. A system that waits for consensus hid the cost of waiting back when proof was slow. Now the cost is visible.

This is the part I find heaviest. What AI digs up is not only holes in old code but also the things an organization has left sitting undecided. AI patches don't help with the latter.

![Pure white background. sumi crouches in front of a large chest of drawers and opens a lower drawer. Inside, many cards marked "On hold" in black are stacked, and only the top card has "Exploitable? Unknown" in red. A small robot holding a magnifying glass peers down from the top of the chest, with an orange dotted line running from the glass to the cards. A black cat sits beside the chest. On the memo pad in sumi's hand, "Set a deadline" in blue](/images/php2shell-debt-was-a-decision/en/03-pending-drawer.webp)

### What "40 years" hides

Back to the subtitle. "40 years of technical debt" puts the blame on past authors: AI is now collecting on code people wrote carelessly long ago.

The cause is certainly old. The Foundation itself calls it "a long-standing design decision in the engine," and according to a secondary source the impact goes back to PHP 5.4. In that sense the subtitle isn't wrong.

But the person who found the signs in 2024, the people who worked out fixes, and the people who couldn't decide are all people of 2024 to 2026. The Foundation called the delay a "structural failure" in its own words. That an old design had a hole, and that nobody could settle on a fix for nearly two years after finding it, are separate accounts. Rolling them into one "40 years" figure, I think, dissolves the latter into a story about old code in general.

Matthew Green is introduced in the piece as "less optimistic." He says "Nobody's going to fix this problem until something really bad happens" and "PHP2Shell wasn't bad enough to be really bad," and goes on to say that once something really bad happens, "We're going to fund everything." Green is talking about how money moves, but I think the same applies to decisions. Proof that something bad could happen now arrives before it does. Whether you can decide on that proof is a question for the organization.

## If you take one thing home

Delete "we don't know if it's exploitable" from the reason field of your on-hold tickets, and write "who decides, by when" instead.

In PHP2Shell, proof arrived 12 days after experts started an AI-assisted audit. Meanwhile, the fix went undecided for nearly two years. If you don't put a deadline on the decision, then on the day the next proof arrives, you'll be doing two years of judgment in 71 days.

## Sources

- Dina Genkina, "The PHP2Shell Vulnerability Heralds Cybersecurity Hell," IEEE Spectrum, November 2, 2026 https://spectrum.ieee.org/ai-in-cybersecurity-php2shell-vulnerability
- The PHP Foundation, "Today's PHP Security Release, and How We're Strengthening PHP Security," October 21, 2026 https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/
- PHP Bug #78876, "Long variables in multipart/form-data cause OOM and temp files are not cleaned," filed November 28, 2019 https://bugs.php.net/bug.php?id=78876
- merginit, "PHP2Shell: What Happened, Who Is at Risk, and What PHP Administrators Should Do" https://merginit.com/blog/24102026-php2shell-rce-what-happened-and-what-to-do
- Hacker News thread (November 4, 2026) https://news.ycombinator.com/item?id=50364336
