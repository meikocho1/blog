---
title: "Cursor に出た改ざん版 Claude Code 拡張について"
emoji: "🧩"
type: "idea"
topics: ["claudecode", "cursor", "セキュリティ", "サプライチェーン", "vscode"]
published: true
published_at: "2026-11-01"
source: cursor-claude-code-extension-security-notice
audience: engineer
---

先に結論だけ書くと、こうです。

> 2026年10月29日、Cursor のマーケットプレイスに SSH バックドア入りの Claude Code 拡張が約11時間並んだ。Anthropic は「公式チャネルの版は影響を受けていない」と言う。でも Anthropic 自身のドキュメントには、その改ざんされたマーケットプレイスへ直行する「Install for Cursor」リンクが、事件の前から置いてあった。**改ざん版は本物と同じ拡張 ID で配られ、2.1.312 は版番号まで本物と同じだった。「公式チャネル」は配る側が引いた線で、ID と番号を見ても区別はつかない。**

事実の整理は短めにします。Cursor の告知と Phorion の解析は、どちらも具体的で読みやすいので。この記事で足したのは、npm と Open VSX の版の履歴を数えたことと、Anthropic のドキュメントの過去版を Wayback で確かめたことです。

先に開示しておきます。読んだのは Cursor のセキュリティ告知、Phorion の解析記事、HN のスレッド（501件）、Anthropic の VS Code 拡張のドキュメントです。改ざんされた VSIX の実物は見ていません。Phorion は EDR を売っている会社で、記事の最後はデモ申し込みへの誘導です。解析の中身は Cursor の告知と食い違っていないので使いますが、「最初に見つけたのは誰か」については、Phorion の「discovered」という書き方を事実として扱いません。自分の手元の環境が影響を受けたかどうかも、この記事では確かめていません。

---

## 11時間、改ざん版が並んでいた

Cursor の告知から引きます。

> Between about 2:27am PT and 1:35pm PT today, a maliciously modified version of Anthropic’s Claude Code extension was made available in the Cursor VS Code Extension Marketplace.
>
> （本日の太平洋時間で午前2時27分ごろから午後1時35分ごろまで、悪意を持って改変された Anthropic の Claude Code 拡張が、Cursor の VS Code 拡張マーケットプレイスで入手できる状態だった。）

日付は10月29日（太平洋夏時間）です。日本時間だと29日18時27分から30日5時35分まで。Phorion の記事の日付は10月30日ですが、これは公開日です。

影響を受けたのは `Anthropic.claude-code` の **2.1.312 と 2.1.313**。macOS（darwin-arm64）と Windows（win32-x64）の版です。Phorion は最初 2.1.313 だけを挙げていて、翌日 Cursor の告知に合わせて 2.1.312 を足しました。

中身は SSH バックドアです。攻撃者の公開鍵を `~/.ssh/authorized_keys` に追記し、攻撃者のサーバーへ逆向きの SSH トンネルを張る。macOS では `com.apple.sysmond` という Apple を名乗るラベルの LaunchAgent で永続化する。ホスト名・ユーザー名・Git のメールアドレス・公開 IP、それに `KEY|TOKEN|SECRET|PASS|AWS|GCP` に一致する環境変数の**名前**（値ではない）を、HTTP の平文で送る。詳しい手順と IOC は Phorion の記事に揃っています。

Cursor は改ざん版を消し、マーケットプレイスを一度丸ごと止めました。

> We audited access and confirmed no other extensions were tampered with. We rotated our keys, rebuilt the marketplace, and brought it back online.
>
> （アクセスを監査し、ほかの拡張が改ざんされていないことを確認した。鍵をローテーションし、マーケットプレイスを作り直して、再開した。）

「鍵をローテーションした」とはありますが、攻撃者がどうやってマーケットプレイスに掲載する権限を得たのかは、告知のどこにも書かれていません。HN でも「どうやってアクセスを得たのか」という問いが何度も出ていました。

---

## 2.1.313 は、どこにも存在しない版だった

ここは自分で数えました。拡張の版番号について、Anthropic のドキュメントはこう書いています。

> The extension's version number is the Claude Code version it bundles.
>
> （拡張の版番号は、同梱している Claude Code の版番号と同じ。）

それなら、npm の `@anthropic-ai/claude-code` の公開履歴と突き合わせられます。11月1日に registry の JSON を取りました。

| 版 | npm の公開時刻（UTC） | Open VSX |
| --- | --- | --- |
| 2.1.311 | 10月26日 19:47 | あり |
| 2.1.312 | 10月27日 18:36 | あり |
| 2.1.313 | **記録なし** | **なし** |
| 2.1.314 | 10月30日 00:12 | あり |

2.1.313 は npm の `versions` にも `time` にもありません。Open VSX の版一覧にもない。HN で「npm の 2.1.313 はなぜ取り下げられたのか」と書いた人は、あとで「取り下げではなく最初から無かった」と訂正しています。

つまり2つの版は性格が違います。**2.1.312 は本物と同じ番号**で、本物の 2.1.312 と見分けがつかない。**2.1.313 は本物が出していない番号**で、本物の 2.1.312 より新しく見える。

2.1.313 が欠番になっているのは偶然ではありません。HN で Anthropic の ddworken 氏がこう書いています。

> In order to disambiguate, we made sure our next update was 2.1.314.
>
> （区別できるように、次の更新を 2.1.314 にした。）

本物の 2.1.314 が npm に出たのは、Cursor の掲載期間が終わってから約3時間40分後です。

---

## 拡張を開かなくても動く

Phorion の解析で、いちばん重いのはこの1文だと思います。

> The user doesn't need to interact with the extension for the payload to fire.
>
> （ペイロードが発火するのに、ユーザーが拡張を操作する必要はない。）

改ざんは `extension.js` の先頭に即時実行関数を足す形でした。Node がファイルを読み込んだ時点で実行され、拡張の `activate` よりも先に走る。`extension.js` がいつ読み込まれるか（インストール直後か、エディタの起動時か）は、どのソースにも書かれていません。ただ、Claude Code のパネルを開くことは発火の条件ではない。

---

## SSH を開ける段は、権限とバグの二重で止まった

macOS で SSH を有効にする段は、多くの環境で失敗しています。止めたものは2つ重なっています。

1つは OS の権限分離です。SSH サービスを有効にするには管理者権限が要り、マルウェアは権限昇格の手段を持っていない。Phorion によれば、有効化の命令は `sudo -n` 付きで、パスワード無しの sudo が通る環境でなければ失敗する。Cursor の告知も、管理者権限と攻撃コードの誤りの両方を挙げています。

> Outside of highly unusual circumstances where Cursor was started with administrator privileges, due to errors in the malicious code, this step would fail.
>
> （Cursor が管理者権限で起動されたという非常にまれな状況を除けば、悪意あるコードの誤りのため、この段は失敗する。）

もう1つが、その誤りです。Phorion の解析では、macOS の処理は `sudo` にたどり着く前に止まっている。マルウェアは `systemsetup -getremotelogin` の出力に `Off` が含まれるときだけ有効化を試みる。ところが一般ユーザーでこれを実行すると、こうなる。

> systemsetup refuses to read the setting without administrator privileges, prints the error to stdout, and exits with status 0
>
> （systemsetup は管理者権限が無いと設定を読まず、エラーを stdout に出して、終了コード 0 で終わる。）

出力は「You need administrator access...」なので `Off` を含まず、有効化の処理には入りません。「SSH が off かどうか確認する権限が無い」を「SSH はもう on」と取り違えたわけです。

ただ、権限の壁もバグも、止めたのは「入口を開ける」段だけでした。Cursor もここははっきり書いています。

> The extension added the attacker’s SSH key, installed persistence, and sent host details to the attacker. Follow the remediation steps below regardless.
>
> （拡張は攻撃者の SSH 鍵を追加し、永続化を仕込み、ホストの情報を攻撃者に送った。いずれにせよ、以下の対処手順に従ってほしい。）

もともと「リモートログイン」を有効にしていた Mac なら、入口は最初から開いていたことになります。あとから有効にした場合も同じです。鍵と永続化はもう仕込まれているので。

---

## 私の見解

### 「公式チャネル」の線は、ドキュメントの中で引かれていた

HN には Anthropic の Felix Rieseberg 氏が書き込んでいます。

> A malicious actor used access to Cursor’s marketplace to publish a tampered copy of the Claude Code extension, which we didn’t build or publish. The versions on our official channels are not affected and this only impacts Cursor users.
>
> （悪意ある者が Cursor のマーケットプレイスへのアクセスを使って、Claude Code 拡張の改ざん版を公開した。それは私たちがビルドしたものでも公開したものでもない。公式チャネルの版は影響を受けておらず、影響は Cursor の利用者に限られる。）

これに対して、こう返した人がいます。

> Is Cursor not an official channel for Claude?
>
> （Cursor は Claude の公式チャネルではないのか？）

この問いへの直接の返信はありません。ただ、同じ Anthropic の ddworken 氏が、別の書き込みで「公式チャネル」の中身を挙げています。

> The versions on our official channels including VS Code and OpenVSX are not affected and this only impacts Cursor users.
>
> （VS Code と OpenVSX を含む公式チャネルの版は影響を受けておらず、影響は Cursor の利用者に限られる。）

公式チャネルには少なくとも VS Code のマーケットプレイスと Open VSX が含まれ、Cursor のマーケットプレイスは影響を受けた側に分けられている。

それでも私は、問いのほうが正しいと思っています。Anthropic の VS Code 拡張のドキュメントを開くと、「Install the extension」の節にリンクが2つ並んでいます。`vscode:extension/anthropic.claude-code` と、**`cursor:extension/anthropic.claude-code`** です。後者を押すと Cursor が開いて、Cursor の拡張画面からインストールすることになる。Cursor の利用者にとっては、今回改ざん版が置かれたマーケットプレイスを通る経路だと考えられます。このリンクの存在は、HN でもすでに指摘されていました（URI だけではプロキシ経由かどうか分からない、という注意付きで）。

私が足せるのは時系列です。Wayback に残っている10月23日のコピー（事件の6日前）にも、この「Install for Cursor」リンクはありました。一方、今のドキュメントには、そのすぐ下に次の注記が付いています。

> Extension marketplaces are third-party software, which Anthropic doesn't endorse, maintain, or audit. Anthropic submits extensions for publication to the Visual Studio Marketplace and Open VSX Registry.
>
> （拡張のマーケットプレイスはサードパーティのソフトウェアで、Anthropic は推奨も保守も監査もしていない。Anthropic が拡張の公開を申請しているのは Visual Studio Marketplace と Open VSX Registry である。）

10月23日のコピーには、この注記の文言が見つかりませんでした。いつ足されたのかは特定できていません。Wayback のコピーは10月23日が最後で、その後は11月1日に私が取った版しか見ていないので。ただ、少なくとも事件の6日前の時点では、ドキュメントは Cursor 利用者に Cursor のマーケットプレイスを案内していて、「そこは公式チャネルではない」とは書いていなかった。

Anthropic の言い分が間違っているとは思いません。改ざん版をビルドしたのも公開したのも Anthropic ではない、というのはおそらく事実です。ただ「公式チャネル」という言葉は、配る側が引いた線です。利用者が見ている線とは違います。

### ID と番号が、署名の代わりになっていた

では、Cursor の利用者は何を見て「公式」だと判断していたのか。HN には「Cursor のストアの "Made by Anthropic" という表示を、Anthropic が署名したという意味だと思っていた」と書いた人がいました。私は Cursor の画面を見ていないので、改ざん版にどんな表示が出ていたかは分かりません。ただ、拡張 ID は本物と同じ `Anthropic.claude-code` で、2.1.312 は番号まで実在の版と一致していた。これでは「公式から入れましょう」という助言は、Cursor の利用者には実行しにくい。どれが公式なのかを、ID と番号からは見分けられないからです。

一方で、2.1.313 のほうは見分けられた可能性があります。さっきの表のとおり、**拡張の版番号は同梱 CLI の版番号と同じ**、とドキュメントは書いている。だから「拡張の更新が来たら、その版が npm にもあるかを見る」という突き合わせをしていれば、2.1.313 は「npm に存在しない版」として引っかかったはずです。2.1.312 は引っかからない。番号が本物と同じなので。

拡張の ID と番号が、署名の代わりになってしまっていた。私はこれが今回の構造の中心だと思っています。HN の初期のコメントには「Open VSX が侵害された」とするものが多くありましたが、のちに訂正されています。改ざん版が置かれたのは Cursor のマーケットプレイスで（Open VSX には 2.1.313 がそもそも無い）、それが Open VSX とどうつながっているのかは、HN でも意見が割れていました（Open VSX の前段に置かれたプロキシだとする人も、よく分からないとする人もいた）。署名検証をどこに入れるべきかは、その配布経路の作りが分かってからの話になります。

### 見張るべきは、プロセスではなくファイル

もう1つ、Phorion の検知の節に、エージェントの権限設定を考えるうえで外せない指摘がありました。

> process-only rules watching for shell commands like echo or tee touching authorized_keys won't catch it.
>
> （`authorized_keys` に触れる echo や tee のようなシェルコマンドを見張るプロセス中心のルールでは、これは捕まえられない。）

`authorized_keys` への追記は Node の `fs.appendFileSync` で直接行われるので、この段ではシェルコマンドが出ない（`ssh` や `launchctl` などはほかの段で動いている）。鍵の追記として見えるのは、「Cursor Helper のような IDE の補助プロセスが `~/.ssh/authorized_keys` に書いた」というファイル書き込みのイベントだけです。

エージェントや拡張に `~/.ssh` を触らせない設定は、Claude Code 側の deny ルールで書けます。でも今回の改ざん版は、Claude Code のツール呼び出しを通っていません。エディタの拡張ホストが、エディタの権限で直接書いている。エージェントの権限設定は、エージェントの外から来たコードには効かない。守りたいなら、OS かエンドポイント製品の層で、`~/.ssh` に書けるプロセスを絞るしかない。Phorion がこれを自社製品の宣伝につなげているのは割り引くとしても、層の分け方そのものは正しいと思います。

---

## 1つだけ持ち帰るなら

「公式チャネルから入れる」は、配る側にとっての線です。今回の改ざん版は本物と同じ拡張 ID を名乗り、2.1.312 は版番号まで本物と同じでした。そして Anthropic 自身のドキュメントが、その経路へのリンクを置いていました。

Cursor で Claude Code 拡張を使っていて、10月29日に更新が入った可能性があるなら、Cursor の告知にある確認コマンドを一度実行しておくのがいいと思います。macOS ならこれです。

```sh
grep -qs svc-telemetry ~/.ssh/authorized_keys && echo "svc-telemetry key found" || echo "No key found; machine not impacted"
```

見つかった場合、拡張をアンインストールするだけでは消えません。LaunchAgent とトンネルのスクリプトが残ります。Cursor の告知にある修復スクリプトを使ってください。

---

## 確かめていないこと

- 攻撃者が Cursor のマーケットプレイスに掲載する権限をどう得たのか。Cursor の告知には書かれていません。
- `Install for Cursor` リンクの下の注記がいつ足されたのか。10月23日の Wayback のコピーには無く、11月1日の版にはあった、までしか分かりません。
- Linux の挙動（cron の扱いのバグなど）は Phorion がコードを読んで書いたものです。Cursor の告知で影響対象とされている配布物は macOS と Windows 向けだけでした。
- 最初の発見者。Phorion、OpenSource Malware の Paul McCarty 氏、DoublePulsar の Kevin Beaumont 氏の名前が HN に挙がっていますが、時系列は確かめていません。
- Cursor のストアで、改ざん版に「Made by Anthropic」などの表示が出ていたか。Cursor の画面は見ていません。
- `extension.js` が読み込まれるタイミング（インストール時か起動時か）。
- 自分の環境が影響を受けたかどうか。この記事では確認していません。

---

## 出典

- Cursor「[Claude Code extension security notice](https://cursor.com/blog/claude-code-extension-security-notice)」（2026年10月29日、10月30日更新）
- Calum Hall（Phorion）「[Official Claude Code Extension Compromise: Security Advisory](https://phorion.io/blog/offical-claude-code-vsx-compromise/)」（2026年10月30日、10月31日更新）
- Hacker News「[Backdoor in Claude Code for VS Code extension on the Cursor Marketplace](https://news.ycombinator.com/item?id=50300683)」、Anthropic の Felix Rieseberg 氏（[50304129](https://news.ycombinator.com/item?id=50304129)）と ddworken 氏（[50305139](https://news.ycombinator.com/item?id=50305139)、[50304793](https://news.ycombinator.com/item?id=50304793)）のコメント
- Claude Code Docs「[Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)」（2026年11月1日に取得）と、Wayback Machine の[2026年10月23日のコピー](https://web.archive.org/web/20261023033631/https://code.claude.com/docs/en/vs-code)
- npm registry `@anthropic-ai/claude-code`、Open VSX `Anthropic/claude-code` の版一覧（2026年11月1日に取得）
