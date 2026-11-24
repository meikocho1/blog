---
title: "Reading the Enterprise Frontier Safeguards documentation"
emoji: "🪣"
topics: ["ai", "claude", "セキュリティ", "考察"]
published_at: "2026-11-24"
---

On November 23, 2026, Anthropic announced the public beta of Enterprise Frontier Safeguards (EFS). The headline of the announcement is "Zero data retention with Enterprise Frontier Safeguards is now in beta". Its opening explanation reads like this.

> EFS provides state-of-the-art detection of sophisticated misuse, while remaining compatible with zero data retention (ZDR): neither Anthropic nor any cloud providers retain enterprises' data.

The announcement says that automated monitoring analyzes data on infrastructure the customer manages. But it didn't say what is left there or who can read it, so I read through to the developer documentation it links to.

Here's the conclusion up front.

> The "zero" in EFS means that the prompts and responses of the Messages API are not retained by Anthropic or the cloud providers. The data stays in the customer's bucket. The sealed form that the customer can't read (up to 28 days) is always there; the Transcript that the customer's team can read (up to 30 days) depends on configuration. Human review also moves from Anthropic's staff to the customer's own team. I read it as a mechanism where, in exchange for using the top-tier models under ZDR, the customer takes on managing the readable copy and the responsibility for review.

---

## About this post

What I read: the announcement (the English version; the body at the Japanese URL was also in English), and these pages of the developer documentation: the EFS overview, customer-owned storage, Safety Case review, the Safety Case file format, the FAQ, and the data retention page. I have not read the security whitepaper, the September threat intelligence report, or the Safety Cases API page.

I have not tried EFS. What follows is limited to what I read in the documentation.

## Why EFS is needed

The announcement says that existing ZDR customers are protected by classifiers (a mechanism that reviews each request immediately, one at a time). But sophisticated attacks span many requests, and each one looks harmless when viewed alone. As an example, it cites an operation from the September threat intelligence report that targeted about 50 organizations. An AI agent split the attack work across many parallel agents and stored the credentials it collected between sessions. Viewed one at a time, it would have looked like separate, more innocuous tasks, the announcement says.

What catches this is "automated safety monitoring", which looks at patterns spanning many requests. To look, requests have to be kept somewhere. This is where it collides with ZDR.

The data retention page gave a more direct reason.

> These models require 30-day data retention and are not available under ZDR unless expressly authorized by Anthropic.

"These models" are the six models: Claude Fable and Mythos at 5, 5.1, and 5.2. A company under a ZDR contract can't use the top-tier models as is, without Anthropic's individual authorization. The paths until now were to set 30-day retention for specific workspaces only, or to use Anthropic-managed storage. EFS is a third path, where the data stays on the customer's side.

## The data stays in the customer's bucket

With EFS, the customer prepares a bucket in their own cloud and gives Anthropic access to it (a role). According to the "What's stored, and where" table in the documentation, three kinds of things can be written there: sealed data, the Transcript, and exchanges such as Safety Cases. I'll look at the first two.

The first is Sealed Safety Data. It is the prompts, responses, and model reasoning, encrypted in Anthropic's format.

> Your team can't read it, even in storage you own.

It is data for automated safety monitoring, retained for up to 28 days. On Claude Platform's S3 Anthropic deletes it, and on Google Cloud Storage it expires through the bucket's lifecycle rules.

The second is the Transcript, a readable copy of the prompts and responses. The customer's team reads it to investigate a Safety Case. On Claude Platform, the destination setting for this is optional. If you choose "Not copied to your storage", it is not copied to the customer's bucket (it is required on Claude Platform on AWS and on the Anthropic-managed version on Google Cloud). For the case where you do set a destination, the documentation adds a caution.

> The Transcripts might include requests that never lead to a Safety Case, so plan who can read your bucket.

Transcripts are deleted after at most 30 days. The customer can't extend that period, and modifying the bucket's lifecycle rules directly fails the setup check. The file format page says that anything you want to keep longer, you should copy to other storage yourself.

The announcement's "Neither Anthropic nor your cloud provider retains your data" is an accurate way to put it on top of this setup. Neither Anthropic nor the cloud provider holds a copy for its own use. But the bucket itself sits on the customer's cloud. Those who read what's inside are Anthropic's automated monitoring (for the sealed side) and, if you configured it to store Transcripts, the customer's own team.

![On the left, sumi gestures palms-up toward a big wooden pail labelled "Customers bucket" in blue. Inside are a box sealed with a big padlock and tape (orange "Sealed · 28 days") and an unrolled scroll of wavy text with a black cat on top (orange "Transcript · 30 days"). At the far right, outside the pail, sits an empty tray with a red label "Anthropic: zero"](/images/efs-zero-data-retention-two-copies/en/01-two-copies.webp)

The scope also needs attention. What EFS covers is Messages API requests; code execution containers, the Files API, Batch API results, and Managed Agents sessions are outside it. Also, Anthropic keeps a record of Safety Case exchanges, which does not contain prompts or responses.

## Review moves to the customer

In the existing mechanism, a small specialist team at Anthropic may look at what the automated monitoring flags. With EFS, this Anthropic Human Review is always off, and the customer's team reviews Safety Cases instead.

A Safety Case contains neither prompts nor responses. What it contains is the status, timestamps, the policy classification, the identifiers of the related Transcripts, and so on. The customer's team reads the contents from the Transcripts in the bucket or through the Safety Cases API, cross-checks against their own logs to investigate the cause, and returns either `violation` or `no_violation`. The deadline is 7 calendar days. The documentation says that if it passes without a valid response, the Safety Case is closed, and if the lack of response continues, access can be stopped. On top of that, Anthropic doesn't automatically notify you when a new Safety Case is created, so you need to watch the bucket or poll the API.

It wouldn't be fair to exaggerate the burden, so I'll lay out the documentation's caveats as well. Safety Cases are expected to be rare for most organizations, and 24-hour coverage is not required. A response can be "in days, not hours", and it's enough to route notifications to a queue that someone checks every business day. The documentation also says that when automated monitoring finds clear, intentional harm and imposes a stop, the scope can be narrowed down to a single user.

![On the left, a box-shaped building labelled "Anthropic" sends out a big orange rubber stamp on a wooden hand-cart, with an orange arrow pointing right. On the right, sumi sits at a desk marked "Customer", pen over a sheet of paper. A wall calendar has "7 days" circled in red. A black cat sleeps on the desk beside an empty inbox whose bell is crossed out in blue: "No notification"](/images/efs-zero-data-retention-two-copies/en/02-review-moves.webp)

## My take

Of the three guarantees in the announcement, the second was this.

> No operator human review. Neither Anthropic nor your cloud provider personnel access your inputs and outputs. Only automated safety monitoring can access this data.

This guarantee is about Anthropic's people and the cloud provider's people, and it doesn't include the customer's own organization. So it isn't a loophole. But human review hasn't disappeared; it has moved from Anthropic's staff to staff inside the customer's company.

I think the move itself makes sense. For a medical, financial, or legal company, having people at an outside company read your data is completely different from having your own security team read it. The words of the Wells Fargo CISO in the announcement (the logs are placed in an environment Wells controls, under keys Wells controls) ask for exactly this.

However, if internal staff can read it, that also means someone inside the company can read the prompts that employees sent to Claude. If you store Transcripts in the bucket, that includes ordinary requests that never became Safety Cases, for up to 30 days. Storing Transcripts is optional on Claude Platform, but I expect many companies to turn it on. A Safety Case contains no content, and without a copy in the bucket, a 7-day investigation would have to rely on reading through the API (this part is my guess; the documentation doesn't say so).

Let me also check what to compare against. The other path to the top-tier models was to have Anthropic hold a 30-day copy. EFS replaces that with a copy inside the customer's bucket. The copy doesn't go away; only its owner changes. When the owner changes, a new job arises: deciding which people in your own company can read it, in place of Anthropic's reviewers. I think the documentation goes out of its way to say "plan who can read your bucket" because this becomes a new point of discussion at adoption time.

The other is operations. No notification comes, so you watch for it yourself, and when one does come, rare as it is, you investigate the cause and reply within 7 days. Someone has to own the check every business day.

I think what the person deciding on adoption should read is not the announcement but the "What's stored, and where" table in the documentation.

## If you take away only one thing

Before adopting EFS, there are two things to decide. Whether to store Transcripts in the bucket, and if so, who in your company can read that prefix. And who will look at Safety Cases every business day.

![A big orange headline: "Who can read it?". On the left, three faceless outlined silhouettes stand in a line. In the middle, sumi drops a single red key into the first silhouette's palm (note: "One key each"), holding a key ring in the other hand, a black cat at the feet. On the right, a big wooden pail with a small keyhole door, labelled "bucket" in blue](/images/efs-zero-data-retention-two-copies/en/03-who-reads.webp)

Sources: Anthropic, "[Zero data retention with Enterprise Frontier Safeguards is now in beta](https://claude.com/resources/articles/zero-data-retention-with-enterprise-frontier-safeguards)" (claude.com, November 23, 2026). From Claude Platform Docs: "[Enterprise Frontier Safeguards](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/overview)", "[Customer-owned storage](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/customer-owned-storage)", "[Review Safety Cases](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/flagged-cases)", "[Safety Case files](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/safety-case-files)", "[FAQ](https://platform.claude.com/docs/en/manage-claude/enterprise-frontier-safeguards/faq)", "[API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)".
