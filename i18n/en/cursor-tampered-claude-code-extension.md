---
title: "On the Tampered Claude Code Extension That Showed Up in Cursor"
emoji: "🧩"
topics: ["claudecode", "cursor", "セキュリティ", "サプライチェーン", "vscode"]
published_at: "2026-11-01"
---

Here's the conclusion up front.

> On October 29, 2026, a Claude Code extension with an SSH backdoor sat in Cursor's marketplace for about 11 hours. Anthropic says "the versions on our official channels are not affected." But Anthropic's own documentation had a "Install for Cursor" link that goes straight to that tampered marketplace, and it was there before the incident. **The tampered builds were distributed under the same extension ID as the real one, and 2.1.312 even had the same version number. The "official channel" is a line drawn by the distributor, and you can't tell the difference by looking at the ID and the number.**

I'll keep the recap of the facts short, because both Cursor's notice and Phorion's analysis are specific and easy to read. What I added in this piece is a count of the version history on npm and Open VSX, and a check of past versions of Anthropic's documentation on the Wayback Machine.

A disclosure first. What I read was Cursor's security notice, Phorion's analysis, the HN thread (501 comments), and Anthropic's documentation for the VS Code extension. I have not seen the actual tampered VSIX. Phorion is a company that sells EDR, and their post ends with a push to sign up for a demo. Their analysis doesn't contradict Cursor's notice, so I use it, but I don't treat Phorion's wording "discovered" as fact when it comes to who found this first. I also haven't checked in this piece whether my own machine was affected.

![White background. Sumi holds an identical cardboard box in each hand, looking at them side by side with a calm face. Both boxes carry the same name tag and the same number tag, with orange text reading "same name tag" and "same number." Only the right box has a small window cut in its side, and a black tube runs out of it past the edge of the frame. Red text reads "different inside."](/images/cursor-tampered-claude-code-extension/en/01-same-tag-different-box.webp)

---

## The tampered version sat there for 11 hours

Quoting from Cursor's notice.

> Between about 2:27am PT and 1:35pm PT today, a maliciously modified version of Anthropic's Claude Code extension was made available in the Cursor VS Code Extension Marketplace.

The date is October 29 (Pacific Daylight Time). In Japan time, that's 18:27 on the 29th to 5:35 on the 30th. The date on Phorion's post is October 30, but that's the publication date.

The affected builds were **2.1.312 and 2.1.313** of `Anthropic.claude-code`, for macOS (darwin-arm64) and Windows (win32-x64). Phorion initially listed only 2.1.313, then added 2.1.312 the next day to match Cursor's notice.

The payload is an SSH backdoor. It appends the attacker's public key to `~/.ssh/authorized_keys` and opens a reverse SSH tunnel to the attacker's server. On macOS it persists through a LaunchAgent with the Apple-sounding label `com.apple.sysmond`. It sends the hostname, username, Git email address, public IP, and the **names** (not the values) of any environment variables matching `KEY|TOKEN|SECRET|PASS|AWS|GCP` over plain HTTP. Phorion's post has the detailed steps and the IOCs.

Cursor removed the tampered build and took the marketplace down entirely for a while.

> We audited access and confirmed no other extensions were tampered with. We rotated our keys, rebuilt the marketplace, and brought it back online.

The notice says "we rotated our keys," but nowhere does it say how the attacker got the ability to publish to the marketplace. On HN, too, the question "how did they get access?" came up again and again.

---

## 2.1.313 was a version that didn't exist anywhere

This part I counted myself. On the extension's version number, Anthropic's documentation says this.

> The extension's version number is the Claude Code version it bundles.

That means I can check it against the publish history of `@anthropic-ai/claude-code` on npm. I pulled the registry JSON on November 1.

| Version | Published on npm (UTC) | Open VSX |
| --- | --- | --- |
| 2.1.311 | Oct 26, 19:47 | Yes |
| 2.1.312 | Oct 27, 18:36 | Yes |
| 2.1.313 | **No record** | **No** |
| 2.1.314 | Oct 30, 00:12 | Yes |

2.1.313 is in neither `versions` nor `time` on npm. It's not in the Open VSX version list either. Someone on HN wrote "why was npm's 2.1.313 pulled?" and later corrected themselves: it wasn't pulled, it never existed.

So the two builds are different in nature. **2.1.312 is the same number as the real one**, indistinguishable from the real 2.1.312. **2.1.313 is a number the real project never released**, and it looks newer than the real 2.1.312.

The gap at 2.1.313 is no coincidence. On HN, Anthropic's ddworken wrote this.

> In order to disambiguate, we made sure our next update was 2.1.314.

The real 2.1.314 appeared on npm about 3 hours 40 minutes after the Cursor listing window ended.

![White background. Number cards stand on a wooden stand, reading 311, 312, an empty slot, and 314. Sumi is pinching a crudely hand-cut "313" card and pulling it out of the empty slot. Red text reads "a number the real one doesn't have," and blue text on the 314 card reads "next is 314."](/images/cursor-tampered-claude-code-extension/en/02-forged-313-card.webp)

---

## It runs even if you never open the extension

In Phorion's analysis, I think this is the heaviest single sentence.

> The user doesn't need to interact with the extension for the payload to fire.

The tampering added an immediately invoked function to the top of `extension.js`. It runs the moment Node loads the file, before the extension's `activate`. When `extension.js` gets loaded (right after install, or when the editor starts) isn't written in any of the sources. But opening the Claude Code panel is not a condition for it to fire.

---

## The step that opens SSH was stopped twice, by permissions and by a bug

On macOS, the step that enables SSH fails in many environments. Two things stopped it, stacked on top of each other.

One is the OS's privilege separation. Enabling the SSH service needs administrator rights, and the malware has no way to escalate privileges. According to Phorion, the enable command is run with `sudo -n`, so it fails unless the environment allows passwordless sudo. Cursor's notice names both the admin-rights requirement and a mistake in the attack code.

> Outside of highly unusual circumstances where Cursor was started with administrator privileges, due to errors in the malicious code, this step would fail.

The other is that mistake. In Phorion's analysis, the macOS routine halts before it even reaches `sudo`. The malware only tries to enable SSH when the output of `systemsetup -getremotelogin` contains `Off`. But when you run that as a regular user, this happens.

> systemsetup refuses to read the setting without administrator privileges, prints the error to stdout, and exits with status 0

The output is "You need administrator access...", which doesn't contain `Off`, so the enable routine never runs. The malware mistook "I don't have the privileges to check whether SSH is off" for "SSH is already on."

Still, neither the privilege wall nor the bug stopped anything beyond the step of opening the entrance. Cursor is clear about this too.

> The extension added the attacker's SSH key, installed persistence, and sent host details to the attacker. Follow the remediation steps below regardless.

On a Mac that already had "Remote Login" turned on, the entrance was open from the start. The same goes if it was turned on later. The key and the persistence are already planted.

![White background. A single padlocked door stands there, with blue text reading "door stays shut." Sumi is crouched in front of it, lifting the corner of the doormat and peering through a magnifying glass at an unfamiliar spare key that was lying underneath. Red text reads "the spare key stayed." Behind the door, a small wind-up robot holds a crumpled piece of paper and tilts its head.](/images/cursor-tampered-claude-code-extension/en/03-door-shut-key-left.webp)

---

## My take

### The "official channel" line was drawn inside the documentation

Anthropic's Felix Rieseberg posted this on HN.

> A malicious actor used access to Cursor's marketplace to publish a tampered copy of the Claude Code extension, which we didn't build or publish. The versions on our official channels are not affected and this only impacts Cursor users.

Someone replied to this.

> Is Cursor not an official channel for Claude?

There's no direct reply to that question. But in a different comment, Anthropic's ddworken spelled out what "official channels" contains.

> The versions on our official channels including VS Code and OpenVSX are not affected and this only impacts Cursor users.

The official channels include at least the VS Code marketplace and Open VSX, and Cursor's marketplace is put on the affected side.

Even so, I think the question is the right one. Open Anthropic's documentation for the VS Code extension and in the "Install the extension" section there are two links side by side. `vscode:extension/anthropic.claude-code` and **`cursor:extension/anthropic.claude-code`**. Clicking the latter opens Cursor, and you install from Cursor's extensions screen. For Cursor users, that is, as far as I can tell, a route that goes through the very marketplace where the tampered build was placed this time. The existence of this link had already been pointed out on HN (with the caveat that a URI alone doesn't tell you whether a proxy is involved).

What I can add is the timeline. The copy of October 23 on the Wayback Machine (six days before the incident) also had this "Install for Cursor" link. The current documentation, on the other hand, has the following note right below it.

> Extension marketplaces are third-party software, which Anthropic doesn't endorse, maintain, or audit. Anthropic submits extensions for publication to the Visual Studio Marketplace and Open VSX Registry.

I couldn't find the wording of this note in the October 23 copy. I haven't pinned down when it was added. The last Wayback copy is from October 23, and after that I've only seen the version I fetched on November 1. But at least six days before the incident, the documentation was pointing Cursor users to Cursor's marketplace, and it did not say "that is not an official channel."

I don't think Anthropic's account is wrong. That Anthropic neither built nor published the tampered build is probably true. But "official channel" is a line drawn by the distributor. It's not the line users are looking at.

![White ground with a diagonal dotted line drawn across it, with blue text reading "the distributor's line." Two stalls stand on the near side of the dotted line and one on the far side. Sumi walks along the near side reading a guidebook, and an orange arrow slips out of the page, crosses the dotted line, and points at the stall on the far side. Orange text reads "the guide's arrow." Sumi hasn't noticed the dotted line at their feet.](/images/cursor-tampered-claude-code-extension/en/04-distributor-line-guide-arrow.webp)

### The ID and the number were standing in for a signature

So what were Cursor users looking at when they decided it was "official"? On HN, someone wrote that they had assumed the "Made by Anthropic" label in Cursor's store meant Anthropic had signed it. I haven't seen Cursor's screen, so I don't know what label the tampered build displayed. But the extension ID was `Anthropic.claude-code`, the same as the real one, and 2.1.312 even matched a real version number. That makes the advice "install from the official source" hard for Cursor users to follow, because you can't tell from the ID and the number which one is official.

On the other hand, 2.1.313 may have been distinguishable. As the table above shows, the documentation says **the extension's version number is the same as the bundled CLI's version number**. So if you had been cross-checking, "when an extension update arrives, see whether that version exists on npm too," 2.1.313 would have been caught as a version that doesn't exist on npm. 2.1.312 wouldn't be caught, because its number is the same as the real one.

The extension's ID and number had ended up standing in for a signature. I think that's the center of this incident's structure. In early HN comments many said "Open VSX was compromised," but that was later corrected. The tampered build was placed in Cursor's marketplace (Open VSX never had 2.1.313 at all), and how that marketplace connects to Open VSX was a point where opinions split on HN (some said it's a proxy in front of Open VSX, others said they weren't sure). Where to put signature verification is a question that comes after we understand how that distribution path is built.

### Watch the file, not the process

There was one more point in Phorion's detection section that matters when thinking about agent permission settings.

> process-only rules watching for shell commands like echo or tee touching authorized_keys won't catch it.

The append to `authorized_keys` is done directly with Node's `fs.appendFileSync`, so no shell command appears at that step (`ssh`, `launchctl`, and so on run in other steps). The only thing that shows up as a key append is a file-write event: "an IDE helper process like Cursor Helper wrote to `~/.ssh/authorized_keys`."

You can write a deny rule on the Claude Code side to keep agents and extensions from touching `~/.ssh`. But this tampered build didn't go through Claude Code's tool calls. The editor's extension host wrote directly, with the editor's privileges. An agent's permission settings don't apply to code that comes from outside the agent. If you want protection, the only option is to restrict, at the OS or endpoint-product layer, which processes can write to `~/.ssh`. Discounting the fact that Phorion ties this into advertising its own product, I think the way they split the layers is itself right.

---

## If you take away just one thing

"Install from the official channel" is a line for the distributor. This tampered build claimed the same extension ID as the real one, and 2.1.312 had the same version number too. And Anthropic's own documentation had placed a link to that route.

If you use the Claude Code extension in Cursor and an update may have come in on October 29, I think it's worth running the check command from Cursor's notice once. On macOS it's this.

```sh
grep -qs svc-telemetry ~/.ssh/authorized_keys && echo "svc-telemetry key found" || echo "No key found; machine not impacted"
```

If it finds something, uninstalling the extension won't remove it. The LaunchAgent and the tunnel script remain. Use the remediation script in Cursor's notice.

---

## What I haven't verified

- How the attacker got the ability to publish to Cursor's marketplace. Cursor's notice doesn't say.
- When the note below the `Install for Cursor` link was added. All I can say is that it wasn't in the October 23 Wayback copy and was in the November 1 version.
- Linux behavior (such as the bug in how cron is handled) is something Phorion wrote from reading the code. The builds Cursor's notice names as affected are only the ones for macOS and Windows.
- The first discoverer. The names Phorion, Paul McCarty of OpenSource Malware, and Kevin Beaumont of DoublePulsar came up on HN, but I haven't verified the timeline.
- Whether the tampered build showed a label like "Made by Anthropic" in Cursor's store. I haven't seen Cursor's screen.
- The timing of when `extension.js` gets loaded (at install or at startup).
- Whether my own environment was affected. I haven't checked that in this piece.

---

## Sources

- Cursor "[Claude Code extension security notice](https://cursor.com/blog/claude-code-extension-security-notice)" (October 29, 2026, updated October 30)
- Calum Hall (Phorion) "[Official Claude Code Extension Compromise: Security Advisory](https://phorion.io/blog/offical-claude-code-vsx-compromise/)" (October 30, 2026, updated October 31)
- Hacker News "[Backdoor in Claude Code for VS Code extension on the Cursor Marketplace](https://news.ycombinator.com/item?id=50300683)", with comments from Anthropic's Felix Rieseberg ([50304129](https://news.ycombinator.com/item?id=50304129)) and ddworken ([50305139](https://news.ycombinator.com/item?id=50305139), [50304793](https://news.ycombinator.com/item?id=50304793))
- Claude Code Docs "[Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)" (retrieved November 1, 2026), and the Wayback Machine [copy of October 23, 2026](https://web.archive.org/web/20261023033631/https://code.claude.com/docs/en/vs-code)
- Version lists for npm registry `@anthropic-ai/claude-code` and Open VSX `Anthropic/claude-code` (retrieved November 1, 2026)
