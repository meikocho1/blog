---
title: "The proof of the Riemann hypothesis and Wang's case for superintelligence"
emoji: "🧮"
topics: ["ai", "llm", "数学", "考察"]
published_at: "2026-11-24"
---

On November 20, 2026, Levent Alpöge, a mathematician who works at Anthropic, announced that he had proved the Riemann hypothesis together with Claude. The proof was published not as a regular paper but as about 17 million lines of code in the Lean theorem prover, and on the 21st, the next day, the Lean and Mathlib communities issued a joint statement confirming that the code passes verification and matches the original statement.

On November 22 (UTC), Alexandr Wang, Meta's Chief AI Officer, published an article titled "Superintelligence is Arriving" on X. It opens like this.

> Superintelligence is arriving. How humanity acts over the next year will have great consequence on what future world we live in.

Here's the conclusion up front.

> Wang reads the proof of the Riemann hypothesis as evidence that intelligence is already sufficient. I read the fact that this proof passed verification the day after its announcement as a result of there being Lean, a machine verifier, even though people did not yet understand the contents. I think the "loop of experiments, data, and feedback" that Wang put in parentheses as a remaining challenge is exactly what corresponds to Lean in other fields, and that in fields without it, the same speed won't be achieved.

---

## About this post

What I read is the body of Wang's article on X. For the course of the proof, I checked articles from Al Jazeera and techno-science.net. I have not read the four-page explanation that Alpöge himself posted on his site, nor the joint statement of Lean and Mathlib itself. I have not looked at the Lean code of the proof either.

Let me also state where I stand. I am not a mathematician, and I have no ability to evaluate the contents of the proof of the Riemann hypothesis. What this post covers is how Wang's argument is built, and the route by which the proof passed verification.

## Wang's argument

The structure is a ranking of intellectual difficulty.

First, he writes that when o3 scored high on the math contest AIME in December 2024, people with competition-math experience felt a moment when "everything changes." AIME's hard problems are far harder than the problems engineers and business people solve day to day. Extending models to other fields required domain-specific knowledge and context, but what was lacking was not raw intelligence. In the two years since, coding has been almost solved, and powerful cyber and agent capabilities have emerged, he says.

Next, he continues that AIME is a teenage extracurricular activity, while the Riemann hypothesis may be the most intellectually demanding problem humanity has considered.

> The remaining gaps for models to greatly surpass humanity in every field are no longer intelligence; they are domain-specific know-how, plumbing, and experimentation.

AI research is also much easier than the Riemann hypothesis, so models will clearly surpass humans by automating AI research and improving themselves. Research in biology, weapons, and economics will also be greatly accelerated. And just as the math community has not yet fully digested the proof of the Riemann hypothesis, he writes, most fields could accelerate at a speed humans can neither understand nor oversee.

The latter half is a warning. It is hard to imagine a world in which humanity keeps control of fully unconstrained recursive self-improvement. There is a lazy idea in the industry that "ASI is inevitable and the only question is how to build it safely." We must not accept "handing over" society to AI, he says.

## The proof passed verification before it was understood

Here I look at the route by which the proof passed verification.

Alpöge did not publish a regular paper. He posted a four-page explanation on his site and published the proof itself as Lean code. About 17 million lines, 175,187 files. According to Al Jazeera, Alpöge wrote "Claude far outpaced me near the finish line." The next day, the Lean and Mathlib communities confirmed that all files compile, that the proven statement matches the original conjecture, and that the proof does not rely on additional unproven assumptions.

On the other hand, the contents are not yet understood. Kevin Buzzard of Imperial College London told Al Jazeera this.

> At the minute, we don't even know why the theorem is true

Buzzard went on to say that 17 million lines could amount to tens of thousands of pages in mathematics, and that it is still unclear which parts are new ideas and which are boilerplate the machine merely filled in. Around the world, work is under way to translate the Lean code back into English. Buzzard also says, however, that if you hand people the Lean code, understanding improves a lot within a week or two. Understanding is expected to catch up.

Even so, as of November 21, what supported the correctness of this proof was not human understanding but Lean's verification. The phrase in Wang's article, "the math community has not fully digested the proof," describes this state.

![On the left, a towering mountain of bundled paper rides in on a conveyor belt, with a red stamp "Verified" pressed on the front of the pile. Beside a small stamping machine in the middle (a black cat sits on top) is an orange "Checked by machine". On the right, sumi crouches and peers through a magnifying glass at a single page pulled from the pile, with a blue "Not readable yet". A thick closed book lies at his feet](/images/wang-superintelligence-riemann-lean/en/01-unread-pile.webp)

## My view

Wang uses this event as evidence that intelligence is sufficient. I think the same event shows another condition instead. In fields where results can be verified by machine, you can trust AI's results before people understand them.

Mathematics had Lean. No one can check 17 million lines by hand, but Lean can. So the day after the announcement, at least the question "does this prove the statement?" had an answer. What about the fields Wang names next? A biology hypothesis can take as long as several months to confirm by experiment. For an economic policy, whether it worked can stay unknown for years. Wang himself wrote that MIT professors would say the hardest problems in many fields are "easier" than the Riemann hypothesis, and then added this parenthetical.

> albeit with other challenges such as experimentation, data, and feedback loops.

Wang also lists this as a challenge, so the difference between us is in the weighting. I think what is inside this parenthetical is heavier than what is outside it. Experiments and feedback loops are the verifier for that field. In a field without them, no matter how clever an answer the AI produces, the time until it is known to be correct does not shrink.

![In the top lane (blue "Has a checker"), a small box with legs runs through a checkered gate and reaches the finish flag almost instantly (orange "Next day"). In the bottom lane (blue "No checker"), a similar box trudges along a long winding road that stretches to the horizon, with calendar pages scattered behind it (red "Months"). sumi walks alongside holding a stopwatch](/images/wang-superintelligence-riemann-lean/en/02-two-speeds.webp)

Something that intelligence alone cannot explain also appears in the Al Jazeera article. Buzzard says that Alpöge himself should be credited first, and that others who had access to the same frontier models and compute did not arrive at the proof. There was a person who decided which direction to search.

Wang feared that most fields could accelerate at a speed "humans can neither understand nor oversee." Wang's "oversee" is about controlling AI's self-improvement, which is a different matter from Lean's verification. Still, the proof of the Riemann hypothesis shows that, even before understanding catches up, a verifier lets you at least pin down "is it correct." Conversely, if you try to get the same speed in a field without a verifier, results pile up with neither understanding nor verification. This is the part that scares me.

Lastly, many of the comparisons in the article are Wang's own assessment. The basis for the sentence saying that many physicists would agree the discovery of the atomic bomb was homework-level compared with the Riemann hypothesis is his own experience of growing up in Los Alamos. The claims that AI research is much easier than the Riemann hypothesis and that coding is almost solved also have no sources shown.

## If you take away only one thing

When you hear "AI will accelerate this field," look for that field's Lean. That is, a mechanism that checks by machine whether results are correct before people understand them. I think fields will get truly faster, starting with the ones that have it.

![Three market stalls stand in a row, signs reading "Math", "Biology" and "Economics" in blue. Only the math stall holds a small stamp-style checker machine, with a spark. Biology and economics have only dust and cobwebs. sumi peers in with a flashlight and a notebook, saying "Where is the checker?" in red](/images/wang-superintelligence-riemann-lean/en/03-find-the-checker.webp)

Sources: Alexandr Wang, "[Superintelligence is Arriving](https://x.com/i/article/2124634870681063424)" and the introducing [post](https://x.com/alexandr_wang/status/2124636606959345776) (X, November 22, 2026 UTC). The course of the proof and Buzzard's remarks are from Al Jazeera, "[Riemann hypothesis: Has the world's most famous maths problem been cracked?](https://www.aljazeera.com/news/2026/11/21/riemann-hypothesis-has-the-worlds-most-famous-maths-problem-been-cracked)" (November 21, 2026). The line and file counts and the contents of the joint statement are from techno-science.net, "[An AI solves the Riemann hypothesis: 17 million lines for a historic proof](https://www.techno-science.net/en/news/ai-riemann-hypothesis-lean-proof-29823)." I have not read Alpöge's explanation, the joint statement of Lean and Mathlib, or the Lean code itself.
