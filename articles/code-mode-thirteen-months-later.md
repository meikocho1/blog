---
title: "Cloudflare の Code Mode を13か月後に読む"
emoji: "🧮"
type: "idea"
topics: ["ai", "llm", "mcp", "cloudflare", "エージェント"]
published: true
published_at: "2026-10-14"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> 「MCP の使い方をみんな間違えていた」で始まるこの記事は、13か月たっても引用され続けていて、**主張は正しかった**と思います。ただし本文の散文に出てくる数字は、**「12」（読了12分）と「2025」（年）の2つだけ**でした。パーセントもトークン数もゼロ。"The results are striking" の striking は、測定ではなく仕組みの説明と比喩で支えられています。数字を付けたのは**39日後の Anthropic の記事**で、そちらは Cloudflare を名指しで引用しています。**アイデアの出典と、数字の出典が別の会社になっています。**

## この記事について

読んだのは [Cloudflare Blog の "Code Mode: the better way to use MCP"](https://blog.cloudflare.com/code-mode/)（Kenton Varda / Sunil Pai、2025年9月26日）。MCP のツールを LLM に直接見せるのではなく、**TypeScript の API に変換して、LLM にはそれを呼ぶコードを書かせる**という話です。

今日は2026年10月14日なので、**公開から383日**。1年以上前の記事を、今読む形になります。

**正直な開示。** Code Mode を自分で動かしていません。確かめたのは、記事の中の数字の数、引用関係、公開日、そして**今のドキュメントと料金表**です。料金からの試算も1つやりましたが、前提は全部書きます。

## 散文に数字が2つしかない

まず主張のほうを書きます。これは今読んでも筋が通っています。

> The special tokens used in tool calls are things LLMs have never seen in the wild. They must be specially trained to use tools, based on synthetic training data.

ツール呼び出しの特殊トークンは、LLM が自然界で見たことがないもので、合成データで後から訓練されている。一方コードは、何百万もの OSS から大量に学んでいる。だから**コードを書かせたほうがうまい**。

比喩も効いています。

> Making an LLM perform tasks with tool calling is like putting Shakespeare through a month-long class in Mandarin and then asking him to write a play in it.

シェイクスピアに1か月の中国語講座を受けさせて、中国語で戯曲を書かせるようなものだ。

わかりやすい。そして記事の冒頭はこうです。

> The results are **striking**

結果は striking だ、と。そこで本文（H1 から関連タグまで、コードブロックを除いた13,791字）から数字を全部拾いました。

| 探したもの | 件数 |
| --- | --- |
| パーセント表記 | **0** |
| 「〜トークン」という数量 | **0** |
| "benchmark" という語 | **0** |
| "measure" を含む語 | **0** |
| 散文中の数字 | **2**（「12 minute read」の12と、「throughout 2025」の2025） |

**striking の中身は、1つも数で書かれていません。** 根拠として書かれているのは「We found agents are able to handle many more tools」という観察と、その理由の仮説（"**Perhaps** this is because LLMs have an enormous amount of real-world TypeScript in their training set"）です。perhaps と書いてあります。

誤解のないように書くと、これは嘘ではありません。「測っていない」と「間違っている」は別です。ただ、**どれだけ効くのかは、この記事からは誰にも分かりません。**

![ざるで記事を振るうと、数字が2つだけ残る](/images/code-mode-thirteen-months-later/01-only-two-numbers-fall-out.png)

## 数字は39日後に、別の会社から出た

2025年11月4日、Anthropic が ["Code execution with MCP: Building more efficient agents"](https://www.anthropic.com/engineering/code-execution-with-mcp) を出しています。**Cloudflare の記事の39日後**です。

そしてこの記事には、Cloudflare への言及があります。

> **Cloudflare published similar findings, referring to code execution with MCP as "Code Mode."** The core insight is the same: LLMs are adept at writing code and developers should take advantage of this strength to build agents that interact with MCP servers more efficiently.

同じ発見だ、と明記されている。そのうえで、数字はこちらにあります。

> This reduces the token usage from **150,000 tokens to 2,000 tokens—a time and cost saving of 98.7%**.

同じ数え方で Anthropic 側を見ると、パーセントが1個（98.7%）、トークン数量が3個（50,000 / 150,000 / 2,000）。Cloudflare 側は0と0でした。

ここで注意が要ります。**98.7% もベンチマークではありません。** 文脈は「この例では」で、Google Drive と Salesforce をつなぐ1つの架空のワークフローの試算です。測定条件も、タスク数も、分散も書かれていません。

つまり、こういう並びになっています。

| | アイデア | 数字 |
| --- | --- | --- |
| 出どころ | Cloudflare（2025-09-26） | Anthropic（2025-11-04） |
| 根拠の形 | 観察と仮説（perhaps） | 1例の試算 |

引用されるときに名前が付くのは「Code Mode」のほうで、数字として覚えられるのは「98.7%」のほうです。**別々の記事から来た2つが、1つの主張として流通しています。**

![左の人がアイデアの札を、右の人が数字の札を持っていて、札の持ち主が違う](/images/code-mode-thirteen-months-later/02-two-hands-two-cards.png)

## 13か月で、記事のほうが置いていかれた

記事の末尾はこうです。

> The Dynamic Worker Loader API is in **closed beta**. To use it in production, sign up today.
> We have **not yet finalized pricing** for the Worker Loader API

今日、ドキュメントを見に行きました。

Worker Loader の API リファレンスの URL は、**Dynamic Workers という独立した製品セクション**に飛びます。Overview、Getting started、Bindings、Egress control、Observability、Custom resource limits、Examples、そして **Pricing** と **Platform Limits** が並んでいます。最終更新は**2026年10月12日**、つまり2日前。

本文に `beta` という語は**1つもありません**。

料金も出ていました（ページの最終更新は2026年6月11日）。

| 項目 | 含まれる分 | 超過分 |
| --- | --- | --- |
| 1日に作成した Dynamic Worker | 月1,000個 | **+$0.002 / 個 / 日** |
| リクエスト | 月1,000万 | +$0.30 / 100万 |
| CPU 時間 | 月3,000万 CPU ミリ秒 | +$0.02 / 100万 CPU ミリ秒 |

課金は**2026年5月26日開始**、Workers Paid プランのみ。

一方で記事は今も「closed beta」「pricing は未確定」と書いたままです。記事の `dateModified` は **2026年7月15日**なので、料金が公開された後に何かは更新されています。**何が変わったのかは確かめられませんでした**（後述）。

なお、コードのほうは生きていました。記事が載せている `import { codemode } from "agents/codemode/ai"` の `agents` パッケージは、現在 **0.28.1**（公開は2026年10月13日、昨日）で、`./codemode/ai` のエクスポートが今も存在します。**13か月前のサンプルコードの import パスが、そのまま通ります。**

![「準備中」の貼り紙の横に、新しい料金表が貼ってある](/images/code-mode-thirteen-months-later/03-the-sign-and-the-price-list.png)

## 料金が出たので、2本の記事を足して計算できる

ここが、この記事で私がやった計算です。**どちらの記事にも書いていません。**

Cloudflare の主張の核心は「使い捨てでいい」でした。

> Isolates are so fast that we can just create a new one for every piece of code the agent runs. There's no need to reuse them.

当時は料金が未定だったので、この「毎回作り直す」がいくらなのかは誰にも計算できませんでした。**今は計算できます。**

料金ページの定義が効きます。**Dynamic Worker は「Worker ID とコード」で一意に識別され、どちらかが変われば新しい Worker として数えられる。** Code Mode は毎回ちがうコードを生成するので、**1回の実行 = 1個の新しい Dynamic Worker** です。

| エージェントの実行回数 | 月間 | 超過分の料金 |
| --- | --- | --- |
| 1日100回 | 3,000個 | **$4 / 月** |
| 1日1,000回 | 30,000個 | **$58 / 月** |
| 1日10,000回 | 300,000個 | **$598 / 月** |

次に、これを節約と並べます。Anthropic の例では 150,000 → 2,000 トークンなので、節約は **148,000トークン**。入力 $2 / 100万トークン（Claude Sonnet 5、手元の資料は2026年6月24日時点）で換算すると **$0.296**。

サンドボックス1回分は **$0.002**。

| | 1タスクあたり |
| --- | --- |
| 節約されるトークン代 | $0.296 |
| サンドボックス代 | $0.002 |
| **サンドボックス代が節約に占める割合** | **0.68%**（148倍） |

キャッシュ読み（通常入力の約0.1倍）で節約分が全部まかなわれていた場合でも、節約は $0.0296 で、割合は **6.8%**（14.8倍）。

**どちらの前提でも、桁で勝っています。** だから Cloudflare が料金を出す前から「使い捨てでいい」と言い切れたのは、結果的には妥当でした。ただし当時その根拠は示されておらず、**示せるようになったのは料金表が出た5か月前からです。**

![節約の札束の山の隣に、小さなコインが1枚置いてある](/images/code-mode-thirteen-months-later/04-the-coin-beside-the-stack.png)

## 私の見解

このブログでは、数字の出典を辿って「個人ブログ1本に行き着いた」とか「平均ではなくピークだった」とか、そういう記事を何本か書いてきました。今回は**逆のケース**です。

**数字が1つもないのに、主張は正しかった。**

だから「測定がない記事はダメだ」とは書けません。Cloudflare の記事が持っていたのは測定ではなく、**機構の説明**でした。「特殊トークンは合成データでしか訓練されていない。コードは実データで大量に訓練されている」。これは反証可能な形をしていて、しかも読んだ人が自分の経験と突き合わせられる。数字より先に納得が来るタイプの根拠です。

そのうえで、13か月たって見えることを書きます。**誰も、どれだけ効くのかを言えないまま引用し続けている。**

実際に流通しているのは「Code Mode（Cloudflare）」という名前と「98.7%（Anthropic の1例）」という数字の組み合わせです。前者は測っておらず、後者は1つの架空タスクの試算です。**2つを足しても、ベンチマークは1つもありません。** それでも「MCP は直接呼ぶな」は、この1年で既定の作法になりました。

もう1つ。**記事は更新されないが、製品は動く。** closed beta は製品になり、料金表が出て、課金が始まり、ドキュメントは2日前に更新されている。それでも記事の末尾は beta のままです。読む側としては、**13か月前の記事で「今どうなっているか」を判断してはいけない**という、それだけの話ではあります。ただ、この記事は今も検索で最初に出てきます。

最後に、自分に返ってくる話を書いておきます。**この記事の 0.68% という数字も、根拠の強さは Anthropic の試算と同じです。** 148,000トークンという節約幅は1つの例から借りてきたもので、私が測ったものではありません。借りた数字で割り算をすると、**割り算の精度が元の数字の精度を超えたように見えます。** そこは超えていません。

## 1つだけ持ち帰るなら

**「これが効く」と書いてある記事を読んだら、その記事の中の数字を数えてください。** 0本なら、効き目の大きさは別のどこかから来ています。今回は39日後の別会社の記事から来ていました。**出典を辿るというのは、主張の出典と数字の出典が同じかどうかを確かめることでもあります。**

## 出典

- Kenton Varda, Sunil Pai, ["Code Mode: the better way to use MCP"](https://blog.cloudflare.com/code-mode/), Cloudflare Blog、2025年9月26日公開（JSON-LD の `dateModified` は 2026-07-15）
- Anthropic Engineering, ["Code execution with MCP: Building more efficient agents"](https://www.anthropic.com/engineering/code-execution-with-mcp)、2025年11月4日
- [Cloudflare Dynamic Workers のドキュメント](https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/)（最終更新2026年10月12日）と[料金ページ](https://developers.cloudflare.com/dynamic-workers/pricing/)（同2026年6月11日、課金開始2026年5月26日）。いずれも2026年10月14日に取得
- `agents` パッケージのバージョンとエクスポートは npm から2026年10月14日に取得（0.28.1、公開2026年10月13日）

数の数え方を書いておきます。Cloudflare の記事は H1 から「Related tags」までを本文とみなし、コードブロックを除いた13,791字から数えました。`%` 表記0件、「〜tokens」0件、`benchmark` 0件、`measure` 系0件。残った数字は「12 minute read」の12と「throughout 2025」の2025です。**コードブロックの中には数字があります**（`gpt-5`、`compatibilityDate: "2025-06-01"`、`SOME_NUMBER: 123`、天気の例の93°F）。測定値ではないので除きました。

2026年7月15日に何が更新されたのかは**確かめられませんでした。** Wayback Machine に2025年9月26日からのスナップショットは残っていますが、取得できる HTML に本文が含まれておらず（JavaScript で描画されるため）、差分が取れません。「beta の記述が当時のまま」という私の推測は、**現在の本文が beta のままである**という事実と、ドキュメント側が beta でなくなっているという事実から言っているだけです。

料金からの試算の前提を並べます。**1回の Code Mode 実行＝1個の新規 Dynamic Worker**（料金ページの「Worker ID とコードで一意、どちらか変われば新規」という定義から）。無料枠は月1,000個として超過分だけを計上。**リクエスト料金と CPU 時間は計算に入れていません**（Workers の既存プランに合算されるため）。トークン単価は手元の資料（2026年6月24日時点）の Claude Sonnet 5 入力 $2 / 100万トークンで、**公式の価格ページで本日時点の再確認はしていません。** 節約量148,000トークンは Anthropic の記事の例の数字をそのまま使っています。したがって 0.68% という値は、**例 × 私の単価 × 私の課金モデル**の積です。桁が合っているかを見る用途以上には使えません。

Code Mode を実際に動かしていないので、「ツールが多いときに本当に成功率が上がるのか」は私には何も言えません。この記事で言えたのは、**原典に数字がないこと**と、**数字が別の記事から来ていること**の2つだけです。
