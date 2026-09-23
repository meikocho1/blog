---
title: "Andrew Ng の Skills Map を元から当たる"
emoji: "🗺️"
type: "idea"
topics: ["ai", "llm", "エージェント", "キャリア", "設計"]
published: true
published_at: "2026-09-21"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> X に流れてきたのは**5本シリーズの最終回**で、4つある技能のうち1つだけを展開したものでした。しかもその技能を必要にしている**前提の一文が、X 版には入っていません**。「エージェントは spec があれば作れるようになった。だから仕事は spec に何を書くかを決めるほうへ移る」— これが元の論証で、X 版は「役割の境界が曖昧になってきた」から始まります。結論は同じで、根拠が入れ替わっています。

## この記事について

読んだのは [@AndrewYNg の X Article](https://x.com/AndrewYNg/status/2098459474608672916)「AI Engineering Skills Map: Shaping the build」（2026年9月11日）。848,829 views、ブックマーク7,402。

読み始めてすぐ引っかかりました。タイトルに Map とあるのに、地図が出てこない。調べたら、DeepLearning.AI の `The Batch` に**5本の連載**がありました。

| 号 | 日付 | 内容 |
| --- | --- | --- |
| issue-366 | 8月14日 | **地図そのもの**。4技能と、それをどう作ったか |
| issue-367 | 8月21日 | (i) Building and deploying AI applications |
| issue-368 | 8月28日 | (ii) Software engineering fundamentals |
| issue-369 | 9月4日 | (iii) Using coding agents |
| issue-370 | 9月11日 | **(iv) Shaping the build** ← X に流れてきたのはこれ |

**正直な開示。** 5本とも本文を読みました。図は2枚（地図の全体図と Shaping the build の展開図）を取得して目視しています。ただし survey の生データや job posting の一覧は公開されていないので、方法論の中身は確認していません。

## X に出たのは、4本目の枝だった

issue-366 に地図の全体があります。4つです。

1. Building and deploying AI applications
2. Software engineering fundamentals
3. Using coding agents
4. **Shaping the build**

**上の3つは技術です。** X に流れてきたのは4つ目、唯一の非技術枝でした。

これを単独で読むと、「AI エンジニアリングとは、プロダクト感覚と主体性とコミュニケーションと当事者意識のことだ」という話に見えます。実際、4つの下位技能はこうです。

- Driving the build loop
- Making product decisions
- Communicating and leading
- High-agency ownership

1つも技術的なものがありません。一方で issue-367 が展開した (i) の下位技能は6つで、LLM foundations、Grounding models with data、Building agentic systems、Evaluation-driven development、Operating in production、Machine learning foundations。全部技術です。

**地図では3:1で技術が多数派なのに、X に出た1枚だけを見ると0:4で非技術に見えます。**

![5枚綴じの冊子から最後の1枚だけを破り取って手渡している](/images/skills-map-from-the-source/01-the-last-page-only.png)

## 消えていたのは、前提のほう

ここが本題です。地図（issue-366）で Ng が (iv) を導入するとき、こう書いています。

> **Given a clear spec, coding agents are rapidly improving at delivering to it.** Thus, our work as engineers is shifting toward deciding what should be in the spec.

明確な spec さえあれば、コーディングエージェントはそれを実装できるようになってきている。**だから**エンジニアの仕事は、spec に何を入れるかを決めるほうへ移っている。

技術的な前提から、非技術的な結論が導かれています。エージェントの実装能力が上がったという観測が先にあって、そこから「では人間は何をするのか」が出てくる。

X 版（issue-370）の書き出しはこうです。

> Before modern AI tools accelerated and expanded what a single developer could do, tech companies established the practice of having product managers (PMs) and designers specify what should be built and then developers build it. However, these roles are blurring.

役割の境界が曖昧になってきた。

**issue-370 の本文を検索しましたが、`clear spec` も `deciding what should be in the spec` も出てきません。** 前提が消えて、結論だけが残っています。

違いは小さく見えて、効きます。「役割が曖昧になってきた」は社会の観察で、誰でも言えるし、反対もできる。「エージェントが spec を実装できるようになったので、spec を決める側に人が移る」は技術の話で、**エージェントの実装能力が上がらなければ成り立ちません**。片方は流行の記述で、片方は条件付きの主張です。

![積み木の塔から下のブロックを1つ抜いても、塔はそのまま立っている](/images/skills-map-from-the-source/02-the-tower-still-stands.png)

## 方法論はある。ただし読み違えやすい

これも X 版には入っていません。issue-366 にだけあります。

> Based on an analysis of over **10,000 job postings**; carrying out **dozens of structured interviews** with AI experts, hiring managers, and recruiters; gathering data through **surveys**; and synthesizing other online data

私がここ数本で読んだ AI エンジニアリングのガイドで、**方法を書いてあったのはこれが初めて**です。前に書いた記事では、「本番のツール呼び出しは3〜15%失敗する」という数字を辿ったら個人ブログ1本に着きました（[私の記事](https://meikocho1.github.io/blog/three-to-fifteen-came-from-one-blog)）。比べると差は大きい。

そのうえで、3つ注意が要ると思います。

**10,000は求人票の数であって、人数ではありません。** 人に聞いたのは "dozens"、数十回です。10,000という数字だけが記憶に残ると、サンプルサイズを一桁も二桁も取り違えます。

**著者自身が「informal」と書いています。** 「You can informally think of our process as akin to clustering on a massive dataset」。クラスタリングに喩えられる、という言い方で、クラスタリングをしたとは書いていない。

**まだ集めている最中です。** issue-366 の追伸はアンケートへの協力依頼で、「AI が変わるたびに地図を更新していく」と書いてあります。つまりこれは「測り終えた結果」ではなく「測っている途中の中間報告」です。

![1万枚の紙束と、数十人分の椅子。並べると大きさが違う](/images/skills-map-from-the-source/03-ten-thousand-and-dozens.png)

## 図はブログにしかない

地図の図は2枚あります。1枚目は4つの枝が並んだ木。2枚目は Shaping the build だけが色違いで強調され、その下に4つの下位技能がぶら下がった木です。

2枚目が良くできています。**強調された枝の隣に、強調されていない3枝が必ず映っている。** 図を見れば「これは4分の1の話だ」が一目で分かります。

そして X Article には、この図がありません。本文18ブロック、全部テキストです。**割合を戻してくれる唯一の装置が、848,829 views のほうには載っていません。**

## 私の見解

Ng を責める記事ではありません。5本に分けて連載する以上、各回が単独で読まれるのは避けられないし、issue-370 自体は良い文章です。

書きたいのは**切り出しの非対称性**です。

5本のうち、最終回だけが突出して拡散しています。理由は分かる気がします。技術3本は「LLM の基礎を学べ」「トレードオフを理解しろ」「エージェントを操れ」で、これは聞いたことがある。4本目だけが「あなたの仕事の範囲が変わる」という話で、当事者の数が桁違いに多い。**シリーズの中で一番キャリア不安に触る回が、一番遠くまで飛びます。**

そして飛ぶときに、技術的な前提は落ちます。落ちても文章として成立してしまうからです。「役割が曖昧になってきたので、product sense を持ちましょう」— 前提なしで読める。読めるので、削っても誰も気づかない。

ここから引き出す読み方は1つです。**「〜すべき」と書いてある文章を読んだら、その主張が成り立たなくなる条件を探してください。** 見つからないなら、それは前提が落ちている版を読んでいる可能性があります。Ng の元の文には条件があります。「spec があればエージェントが実装できる」が崩れたら、(iv) の重要性も下がる。条件つきの主張は弱そうに見えますが、**条件があるほうが強い主張です。** 外れる形が定義されているので。

もう1つ。issue-369 に、こういう一文があります。

> The rapid pace of evolution for coding agents means this skill, too, is evolving rapidly — **faster than other top-level AI engineering skills**.

4つの技能のうち、(iii) だけが他より速く陳腐化する、と地図の著者自身が書いている。これは地図としては珍しく正直な注記だと思います。地図に「この部分は他より早く古くなる」と書いてある。

![3本の太い柱が、その上に載った4本目の横木を支えている](/images/skills-map-from-the-source/04-three-pillars-one-beam.png)

## 1つだけ持ち帰るなら

**シリーズものの1本が流れてきたら、第1回を探してください。** 連載の初回には、だいたい全体像と方法論が置いてあります。そして拡散するのは初回ではありません。今回は5本中1本が84万回見られていて、地図と方法論が入っている第1回はそこにリンクされていません。

## 出典

- [@AndrewYNg, "AI Engineering Skills Map: Shaping the build"](https://x.com/AndrewYNg/status/2098459474608672916), X Article、2026年9月11日（848,829 views / 4,622 likes / 7,402 bookmarks / 270 replies）
- [The Batch issue-366](https://www.deeplearning.ai/the-batch/issue-366/)（2026年8月14日）— 地図の全体と方法論
- [issue-367](https://www.deeplearning.ai/the-batch/issue-367/)（8月21日）/ [issue-368](https://www.deeplearning.ai/the-batch/issue-368/)（8月28日）/ [issue-369](https://www.deeplearning.ai/the-batch/issue-369/)（9月4日）/ [issue-370](https://www.deeplearning.ai/the-batch/issue-370/)（9月11日）

X Article の本文は issue-370 とほぼ同一です。「`clear spec` の一文が X 版にない」というのは、issue-370 の本文を検索して該当がなかった、という意味です。X Article が The Batch 版と完全に同一でない可能性は排除していません。

図2枚は The Batch の画像URLから取得して目視しました。survey の回答、10,000件の job posting、structured interview の記録はいずれも公開されていないので、方法論そのものは検証していません。「方法が書いてある」と「方法が検証できる」は別だという点は、この記事の主張に対しても当てはまります。
