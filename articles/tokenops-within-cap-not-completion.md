---
title: "「完了率が67%→96%」は、たぶんあなたが思っている実験ではない — TokenOps の数字を一次資料で確かめた"
emoji: "🧮"
type: "idea"
topics: ["ai", "llm", "エージェント", "finops", "コンテキストエンジニアリング"]
published: true
published_at: "2026-08-24"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> 「トークン代を78%削って、完了率は67%→96%に上がった」という形で回っている話の一次資料を読むと、**対照群は「ハード制限（スロットリング）」ではなく「ガバナンスなし」**で、指標は「タスク完了率」ではなく **「予算上限内で終わった run の割合」**（within-cap success）だった。N=27、1 run あたり $0.068 → $0.014。作られたシステムは面白いし数字も実測だけど、いちばん引用されている一文は、たぶん誰も測っていない実験の話になっている。

## この記事について

Microsoft の Tisha Chawla と Susheem Koul が作った **TokenOps** という、エージェントの run 単位でトークン支出を実行時に制御するシステムの話です。

- 一次資料: [Who spent all the tokens? Real-time, run-scoped cost control for AI agents](https://commandline.microsoft.com/tokenops-real-time-run-scoped-cost-control-ai-agents/) — Tisha Chawla, Susheem Koul（Microsoft Command Line、2026年8月13日）
- 講演: [Who Spent All the Tokens? — Tisha Chawla & Susheem Koul, Microsoft](https://www.youtube.com/watch?v=GJX19pNhmSw)（AI Engineer）
- コード: [github.com/theagentplane/tokenops](https://github.com/theagentplane/tokenops)

私がこれを知ったのは中国語圏の要約経由で、そこではこう紹介されていました。「トークン代を78%カットしたのに、タスク完了率は67%から96%に急上昇。常識では、トークンを節約する一番手っ取り早い手段はハード制限で打ち切ることだが、それをやると金は浮いてもタスクが死ぬ。ところが Microsoft は……」。

この枠組みが面白かったので一次資料を読みに行きました。読んだら、対照群が違いました。

正直に開示します。私はベンチを走らせていないし、リポジトリのコードも読んでいません。講演動画も通しでは見ていません（トランスクリプトの一部を読んだだけ）。以下は Command Line の記事本文を読んだ範囲の話です。

## 原文の数字は、こう書かれている

該当箇所を引用します。太字は私が付けました。

> - Cost: mean cost per completed run. 78.9% lower than no governance: $0.068 → $0.014 average spend per run (weighted total $1.839 → $0.388, N=27 scored trials across browser-use and MetaGPT scenarios).
> - Completion: share of runs that **finish under the cap**, **vs. no governance**. +29pp: 67% → 96% **within-cap success** (18/27 → 26/27), N=27.

3点、要約で落ちていたものがあります。

**1. 対照群は「ガバナンスなし」です。** スロットリングではありません。原文はこの段落の直前で、比較の基準をわざわざ宣言しています。「the baseline that governs the demand for this post: no governance at all」。つまり「何もしない vs TokenOps」の比較で、「硬く打ち切る vs 賢く舵を切る」の比較実験は、この記事の中には存在しません。

**2. 指標は within-cap success です。** 「予算上限の内側で終わった run の割合」。タスクが成功したかどうかではありません。ガバナンスなしの33%（27回中9回）は、**タスクが死んだのではなく、予算を超えた**。原文の書き方はどこも正確で、"finish under the cap" と "within-cap success" と2回言い換えています。日本語に訳すときに「完了率」にしてしまうと意味が変わります。

**3. N=27 です。** browser-use と MetaGPT の2リポジトリのシナリオを合わせて27試行。1 run あたりの平均は $0.068 → $0.014。7セントが1.4セントになった話です。

## 「予算内に収まった率が上がった」は、どこまで主張なのか

ここが私が引っかかったところです。

予算上限を導入して、上限を超えないように途中で舵を切るシステムを入れる。その結果「上限内で終わった run の割合」が上がる。……これは、かなりの部分が設計の定義から出てきます。上限を守るために作った仕組みが、上限を守る率を上げる。もし上がらなかったら、そのほうがニュースです。

もちろん完全な同義反復ではありません。**HALT（打ち切り）で上限を守っても within-cap success は増えません。** 上限に当たって殺された run は「上限内で終わった」に入らないので。だから26/27という数字は、「舵を切って、上限内に収まって、しかも終わった」を26回やったことを意味していて、そこには実質があります。原文の STEER の設計（モデルを安いほうに落とす、プロンプトを縮める、壊れたループを直す）が効いた、という読み方は成立します。

でも、そこから「タスクの完了率が上がった」には届きません。届かない理由を、原文が自分で書いています。この記事でいちばん誠実な節がこれです。

> To be clear about the boundary: everything above governs cost. (中略) It does not decide whether the spend was worth it. A cost cap halts on dollars; it cannot see whether the dollars bought a correct answer.

そして MAST（Berkeley のマルチエージェント失敗研究）を引いて、マルチエージェントの失敗の半分以上は仕様と検証の問題であり、コスト上限は正解と誤答を区別できない、と続けます。**「品質は測っていない」と本人たちが明言している記事の数字が、「品質が上がった」証拠として流通している**。ここが今回いちばん面白かったところです。

私の見立てでは、失真は1ステップで起きています。原文の "Completion" という見出し語です。中身は within-cap success なんですが、見出しだけ抜くと completion rate に見える。表に落とし込む段階で列名が「完了率」になり、対照群が「no governance」から「スロットリング」に差し替わって、「打ち切りだと33%が死ぬ」という原文にない一文が足される。1回の要約で、測っていない実験ができあがります。

![すみが床にテープで線を引き、線の内側にいる人数を数えて「増えた」と書いている。線を引いたのはすみ自身で、テープのロールを持ったまま](/images/tokenops-within-cap-not-completion/01-drew-the-line-then-counted.png)

## それでも読む価値がある3つの部分

数字の解釈にケチをつけましたが、記事自体はかなり良いです。私が持ち帰ったのは指標の話ではなく、こっちでした。

### 1. $2 の上限が実質 $4 になっていたバグ

これが一番実用的です。テストベンチは2つのエージェントを別プロセスで動かしていました。検索ツールをループする research agent が、findings を HTTP で summarizer agent に渡す。両者は同じ run id を共有し、run には予算がある。テストは全部通っていたのに、バグがありました。

> 各プロセスが自分のメモリに支出カウンタを持っていた。両方がゼロから始まり、両方が run の予算の全額を見ていたので、$2 の run 上限は実質「research agent に $2、summarizer にもう $2」だった。合計すればキャップの2倍を使えるのに、ローカルのチェックは全部通る。

修正はカウンタをプロセス外の共有 ledger に出すこと。原文の一般化はこうです。**マルチエージェントの run で、各エージェントが自分で数えている予算は run 予算ではない。**

これは LLM の話ではなく分散システムの話です。だから逆に、LLM の事情が変わっても腐りません。私はここを読んで、自分が「予算」と呼んでいるものが本当に単一の真実の源を持っているか、一度も確認していないことに気づきました。

![2人のすみが背中合わせに座り、それぞれ手元の帳簿に同じ「$2」と書き込んでいる。2冊の帳簿の間には何もつながっていない](/images/tokenops-within-cap-not-completion/02-two-ledgers-one-cap.png)

### 2. ポリシーの一覧が、コストの式から導かれている

原文はポリシーを先に並べません。まず run のコストが何でできているかを書きます。

```
cost of a run = Σ over calls ( input tokens × input price + output tokens × output price )

calls per run = loop depth × fan-out breadth
                (逐次ステップ)   (並列サブエージェント)
```

請求を決めるのは「1回のコールのトークン数」と「コール数」の2つだけ。コール数の出どころも2つだけ（ループの深さと、サブエージェントの広がり）。だから守るべき対象は閉じたリストになります。1回あたりのトークン、ループ深さ、fan-out、そして総額の天井。原文のポリシーは10本で、`cost_budget` が天井で、残り9本がそれぞれ1箇所を守ります。

私が良い論証だと思ったのは次の一文です。

> このリストはコストから導いたが、失敗研究の結果とも一致する。OWASP の Unbounded Consumption、Microsoft の agentic failure taxonomy (v2.0)、Berkeley の MAST が同じモードを挙げている: ループ、進捗のない反復、退化した出力、過大なコンテキストとペイロード、不正なツールコール、無制限の fan-out。2方向から同じリストに着くのは、明らかなモードを取りこぼしていない良い証拠だ。

コスト最適化の観点から数え上げたリストと、セキュリティ／障害分析の観点から数え上げたリストが一致する。この確認の取り方は、自分の設計チェックリストにも使えます。

### 3. STEER が先、HALT が最後

これは設計順序の話で、1行で言えます。

> Steering runs first. A halt is the last resort because halting a legitimate run causes the outage you were trying to avoid.

打ち切りは、避けようとしていた障害を自分で起こす。だから最後。そして enforcement のパスにはモデルを一切置かない、という判断も明確です。「統治される対象に、自分を止めるかどうかを決めさせたくない」から。ここで CaMeL（プロンプトインジェクション対策として、モデルの外側に決定的な制御層を置く手法）を引いてきて、脅威は違うが設計は同じだと言っています。この対応づけは上手いと思いました。

![すみが片手で船の舵を切りながら、もう片方の手のひらを大きな赤いブレーカーに向けて押しとどめている。ブレーカーには「最後の手段」と書かれた札が下がっている](/images/tokenops-within-cap-not-completion/03-steer-first-halt-last.png)

## 細かいが書いておく2点

**リポジトリは Microsoft 組織の下ではありません。** [github.com/theagentplane/tokenops](https://github.com/theagentplane/tokenops) です。「Microsoft のエンジニアが作ったオープンソース」と「Microsoft のオープンソース」は別物で、前者が正しい。ちなみに Microsoft 組織下には [agent-governance-toolkit](https://github.com/microsoft/agent-governance-toolkit) という別のプロジェクトがあって、こちらはコストではなくセキュリティ側のガバナンスです。混ざりやすいので。

**この記事はプロダクトの宣伝ではなく、レイヤの主張です。** 原文の後半に「どのレイヤが既にあって、どこが空いていたか」の表があり、accounting は FOCUS、observability は OpenTelemetry GenAI conventions、request 単位の enforcement は LiteLLM / Portkey / Cloudflare、ステップ上限は LangGraph の `recursion_limit` や CrewAI の `max_iter`、と埋めていって、run 単位の enforcement だけが空いている、と位置づけています。この整理のほうが、78%より寿命が長いと思います。

## 1つだけ持ち帰るなら

数字の話ではありません。

**指標の名前ではなく定義を読む。** 今回のズレは「Completion」という見出しと "share of runs that finish under the cap" という定義のあいだで起きました。見出しは要約で生き残り、定義は落ちます。落ちた側にしか、その数字が何の証拠なのかは書かれていません。

そしてこの手のベンチを自分で引用するときは、N を一緒に書くこと。N=27 は「方向の示唆」で、「78%削減が期待できる」ではありません。原文はちゃんと N を書いています。落としたのは要約する側です（私も落としかけました）。

## 出典

- Tisha Chawla, Susheem Koul, [Who spent all the tokens? Real-time, run-scoped cost control for AI agents](https://commandline.microsoft.com/tokenops-real-time-run-scoped-cost-control-ai-agents/), Microsoft Command Line、2026年8月13日
- 講演: [Who Spent All the Tokens? — Tisha Chawla & Susheem Koul, Microsoft](https://www.youtube.com/watch?v=GJX19pNhmSw), AI Engineer
- コード: [github.com/theagentplane/tokenops](https://github.com/theagentplane/tokenops)

記事中の数値・引用はすべて上記の Command Line 記事からです。私はベンチを再現しておらず、リポジトリのコードも読んでいません。講演は通しで視聴していません。§「『予算内に収まった率が上がった』は、どこまで主張なのか」の後半は、指標の解釈についての私の議論で、原文の主張ではありません。
