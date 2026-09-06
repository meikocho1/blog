---
title: "「行数で測るのをやめろ」は実行できない — ACM Queue が8つの神話を潰したあとに残る測定レイテンシの問題"
emoji: "📏"
type: "idea"
topics: ["ai", "llm", "開発生産性", "マネジメント", "計測"]
published: false
draft: true
source: acm-queue
audience: engineer
---

## この記事について

ACM Queue の「[Eight Myths on Software Engineering and GenAI](https://queue.acm.org/detail.cfm?id=3807963)」を扱います。著者は Jenna Butler、Brian Houck、Margaret-Anne Storey、Travis Lowdermilk、Steven Clarke、Emerson Murphy-Hill（Microsoft と University of Victoria の研究者たち）。Volume 24, issue 2、DOI 10.1145/3807963。

先に日付を開示します。**公開は2026年5月26日**です。今月の新作ではありません。私がいま取り上げているのは、この論文が8月に解説記事経由で改めて回り始めたからです（[GIGAZINE が8月5日](https://gigazine.net/gsc_news/en/20260805-8-myths-software-engineering-gen-ai/)、explainx.ai が8月）。3か月前の査読誌の記事が今になって拡散しているという事実そのものも、この記事の後半の論点と関係します。

原文（英語）を全文取得して、8つの神話すべての節を原文で確認しました。引用の訳は私です。参照されている個別の一次研究（Microsoft の450人調査など）は abstract 以上を読めていないものが多く、そこは「論文がそう引いている」というレベルで扱います。

先に結論だけ書くと、こうです。

> この論文の事実整理は正確で、Myth 1〜8 はすべて成立しています。問題は処方のほうです。「行数で測るな、成果で測れ」という結論は、**測定のレイテンシを無視している**。妥当性のある指標（品質・保守性・デリバリー速度）は結果が出るまで数か月かかる。意思決定サイクルに間に合う指標（行数、採択率、トークン消費）は全部無効。組織が行数を使い続けるのは愚かだからではなく、**それが唯一「間に合う」信号だから**です。だから正しい処方は「無効な指標を捨てる」ではなく、**無効であることを明記したうえで先行指標として使い、遅い指標のほうを短縮する投資をする**ことだと思っています。

前半は事実の整理なので短く済ませます。8つの神話の要約は他でも読めるので。後半のほうが長いです。

---

## 第1部 — 論文が潰した8つの神話

論文の冒頭が全体の要約になっています。

> Generative AI is reshaping software engineering—but the narrative has gotten ahead of the evidence. Marketing claims, anecdotal wins, and misread studies have given rise to a set of persistent myths that are quietly driving poor decisions about AI adoption, tooling, and how to measure success.
>
> （生成 AI はソフトウェアエンジニアリングを作り変えている。だが語られている物語が証拠を追い越してしまった。マーケティングの主張、個別の成功譚、誤読された研究が、根強い神話群を生んだ。そしてその神話が、AI の導入・ツール選定・成功の測り方について、静かに劣った意思決定を駆動している）

8つはこうです。

1. 開発者は時間の大半をコードを書くことに使っている
2. コードを書くことがボトルネックである
3. AI が書いた行数が最良のインパクト指標である
4. AI はすべてのタスクとすべてのエンジニアを等しく助ける
5. AI は個人を10x デベロッパーに変える
6. AI を機能させるのは各開発者の仕事である
7. 性能の高い AI ツールは自然に採用される
8. GenAI があればエンタープライズもスタートアップの速度で回せる

この記事で押さえてほしい数字は3つだけです。

**14%。** Microsoft の450人超のエンジニアを対象にした2025年の調査で、コードを書いている時間の割合。

> A study of more than 450 engineers at Microsoft in 2025 showed developers spend only 14 percent of their time writing code, reflecting what has been found in studies over the years.
>
> （2025年に Microsoft の450人超のエンジニアを対象に行われた調査は、開発者がコードを書くのに使っている時間はわずか14%であることを示した。これは長年の研究が見つけてきたことと一致する）

「良い日」で18%、「悪い日」で11%という別の研究も引かれています。良い日と悪い日の差が7ポイントしかない、という指摘のほうが個人的には刺さりました。

**80% と 29%。** Stack Overflow 2025 Developer Survey から。AI ツールを使っている開発者は80%、その正確性を信頼している開発者は29%。

**55%。** 「Copilot で生産性55%向上」という有名な数字。論文はこれを否定していません。context dependent だと言っています。孤立したタスクの測定値であって、協調・調整・知識共有を含むチーム環境には直接転移しない、と。

![タイムシートを広げて見せるすみ。「コードを書く」の欄だけが異常に細く、残りは会議・設計・レビュー・環境構築でびっしり埋まっている](/images/loc-metric-latency-problem/01-fourteen-percent.png)

---

## 第2部 — 私の見解 (1)：14%の分母は固定されていない

Myth 2 の論証はこうなっています。

> If developers spend only about 15 percent of their time typing in the editor, then even an AI assist that makes coding twice as fast would, in theory, improve developers' overall productivity by less than 15 percent. The other 85 percent of their time remains untouched.
>
> （開発者がエディタで打っている時間が15%程度でしかないなら、コーディングを2倍速くする AI アシストがあったとしても、理論上、開発者の全体生産性の改善は15%未満にとどまる。残りの85%の時間は手つかずのままだ）

アムダールの法則です。正しい。そして、この論証は同じ節の3段落あとで著者自身が壊しています。

> If AI enables developers to churn out code faster, it can simply move the pressure downstream. For example, producing more code quickly means more code that needs to be reviewed, tested, and integrated into the product.
>
> （AI が開発者に速くコードを吐き出させるなら、それは単に圧力を下流に移すだけになりうる。たとえば、より多くのコードを速く生産するということは、レビューされ、テストされ、製品に統合されなければならないコードが増えるということだ）

圧力が下流に移るなら、85%は「手つかず」ではありません。**増えています。** アムダールの法則は各パートの仕事量が固定という前提で成り立つ式です。下流の仕事量が上流の生産量に比例して増えるなら、これはアムダールの問題ではなくボトルネック理論の問題になります。そして式の答えは「15%未満の改善」ではなく、**符号が反転しうる**です。

これは論文の粗さを責めたいのではありません。順序の話をしています。論文は Myth 1（14%）で分母を固定して、Myth 2 で分母が動くと書いた。読者の頭に残るのは前者だけです。「コードを書く時間は14%だから AI の効果は小さい」という形で切り出されやすい。念のため確認しましたが、GIGAZINE の記事は8つを順に紹介しているだけで、14%だけを見出しに立ててはいません。私が言っているのは記事の書き方の問題ではなく、**引用されるときに残る数字**の問題です。

私が現場で見ているのは、後者のほうです。**エージェントを使うと自分の一日の形が変わる。** コードを書く時間が減って、読む時間とレビューする時間が増える。14%だったコーディング比率が7%に落ちて、その7%分が丸ごとレビューに移動する、みたいな動きをします。分母の内訳が組み替わっているので、「14%を速くしても15%しか改善しない」という計算は、そもそも自分の一日に当てはまらなくなっている。

つまり14%という数字の正しい使い方は「AI の効果の上限を見積もる」ではありません。**「一日の時間配分が組み替わったかどうかを見るベースライン」**です。前者に使うと、静的な世界の話になってしまう。

![巨大な蛇口を全開にするすみ。噴き出した橙色の流れが「レビュー」「テスト」「統合」の3つのバケツを順に溢れさせ、赤くこぼれ落ちている。最後のバケツの縁には黒猫が平然と座っている](/images/loc-metric-latency-problem/02-pressure-downstream.png)

---

## 第3部 — 私の見解 (2)：本命は測定のレイテンシ

ここが本題です。

Myth 3 は、行数指標を叩いています。2014年の研究まで引いてきて、統計的妥当性がないと。

> Lines of code (and other single-point metrics such as story points), however, are neither statistically valid nor meaningful indicators of impact.
>
> （しかし行数（およびストーリーポイントのような他の単一点指標）は、統計的に妥当でもなく、インパクトの意味のある指標でもない）

そして結論はこうです。

> Lines of code and speed alone are poor proxies for real progress. Ultimately, realizing the full value of AI in software engineering requires moving beyond hype and simplistic metrics and instead focusing on the broader goals of building secure, maintainable, and high-quality software.
>
> （行数と速度だけでは、本当の進捗の代理指標として貧弱だ。最終的に、ソフトウェアエンジニアリングにおける AI の価値を完全に実現するには、誇大宣伝と単純化された指標を超えて、安全で保守可能で高品質なソフトウェアを作るという、より広いゴールに焦点を合わせる必要がある）

異論はありません。そして、これは実行できません。

理由は一つです。**安全性・保守性・品質は、測定結果が出るまでの遅延が導入判断のサイクルより長い。**

具体的に並べます。AI ツールを全社導入したとして、その判断が正しかったかどうかを妥当な指標で測ろうとすると:

- 保守性への影響 → 同じコードに二度目の変更が入るまで待つ。早くて3か月、普通は半年から1年
- インシデント率の変化 → 統計的に有意な差が出るまで待つ。障害は幸いにも低頻度なので、母数が溜まるのに数四半期
- セキュリティ脆弱性 → 発見されるまで。中央値で言えば年単位
- デリバリー速度 → 四半期単位のトレンドとして

一方で、ライセンス更新の判断は年1回。CFO への報告は四半期ごと。ツールの世代交代は3か月ごと。**測定が答えを返す前に、次の意思決定が来ます。**

だから行数が使われる。行数は今日わかる。「AI が書いた行数の割合が30%」という数字は、Microsoft の CEO が2025年4月に公の場で言えたくらい、集計が速い。妥当性がゼロで、レイテンシがゼロなんです。

論文が「行数をやめて成果で測れ」と言うとき、それは「レイテンシ0で無効な計器をやめて、レイテンシ6か月で有効な計器を使え」と言っています。そう言われた組織は、行数を捨てません。**両方持って、行数だけ見ます。** 実際そうなっている。論文が2026年5月に発表されて、8月に「まだ行数で測っている企業が多い」という論調で拡散していることそれ自体が、処方が刺さっていない証拠だと思います。

### DORA があるじゃないか、と思うかもしれませんが

デプロイ頻度・変更のリードタイム・変更失敗率・平均復旧時間。DORA 4指標は速く、そして妥当性の検証もされています。私の「速い指標は全部無効」という主張への一番強い反論です。

これに対する私の答えは一つだけです。DORA 指標は**デリバリーシステムの健全性**を測っていて、**AI の寄与**を測っていません。デプロイ頻度が上がったとき、それが AI 導入によるものか、たまたま同時期にやった CI の高速化によるものか、チーム編成の変更によるものかを、DORA 指標は分離できない。AI 導入の効果を知りたいという問いに対しては、DORA は交絡だらけの観測データです。RCT を組めるなら別ですが、組める組織は多くない。

つまり「速くて妥当な指標」は存在します。ただしそれは「AI が効いているか」という問いには答えません。

### では何をすべきか

3つあります。重いと思う順に書きます。

**1. 速い指標に「無効」というラベルを本文に書く。** 行数もトークン消費も採択率も、使っていいと思います。ただしダッシュボードに置くとき、指標名の横に「これは活動量であり成果ではない。この数字が上がっても品質は何も保証されない」と一文添える。冗談ではなく、これが一番効きます。数字は文脈を失うと勝手に目標になるからです。ラベルは自動では剥がれないので、剥がすには誰かが「無効と書いてあるのに目標にしていますよね」と言えるようになる。それだけで運用が変わります。

**2. 遅い指標のレイテンシを短縮する投資をする。** 保守性が6か月後にしかわからないのは、6か月後にしか二度目の変更が来ないからです。だったら「同じファイルへの再変更にかかった時間」を継続的に記録し始める。今日の記録が意味を持つのは半年後ですが、半年後には持ちます。これを始めていない組織は、半年後も行数を見ています。着手が遅れるほど、行数から抜けられなくなる。

**3. 判断のサイクルを測定のサイクルに合わせる。** 一番正論で、一番実行されないやつです。「3か月で AI 導入の効果を判定する」という要求そのものが、測定不可能なものを要求している。ここを飲む勇気がある組織は、そもそも行数で困っていないと思います。

![脚立の上で壁の2つの計器を見比べるすみ。左の「行数」計は針が勢いよく振れているが文字盤に赤字で「無効」、右の「保守性」計は針がゼロのままで、根元に「反応まで6か月」の札が下がっている](/images/loc-metric-latency-problem/03-two-instruments.png)

---

## 第4部 — 触れておきたいもう一つ、Myth 7 の数字

80%が使い、29%しか信頼していない。

一般的な読み方は「信頼が足りないから採用が伸びない、だから信頼を上げよう」です。論文もその方向で書いています。社会的・組織的・認知的な障壁の話として。

私は逆向きに読みました。**信頼していないのに使っている状態は、検証している状態です。** 健全なほうです。危ないのは信頼が80%に上がって、使用率と一致したときです。そのとき人は出力を読まなくなる。

だから「信頼を上げる」を目標に置くのは方向が違うと思っています。上げるべきは信頼ではなく**検証のしやすさ**です。差分が読めること、テストが速いこと、ロールバックが安いこと。検証が安くなれば、信頼しないまま使い続けられる。これはコストの問題であって、心理の問題ではありません。

![「信頼しない」と札を貼られた機械が紙のリボンを吐き続けている。すみは椅子に座って手回しの検査ゲートにそれを通し、「通す」と「戻す」に振り分けている。ゲートの横には青字で「検査は安い」](/images/loc-metric-latency-problem/04-cheap-verification.png)

一段落で済ませます。この論点は私が以前書いた記事とかなり重なるので。

---

## まとめ

1つだけ持ち帰るなら、これです。

**「行数で測るな」は指標選択の問題ではなく、測定レイテンシの問題です。** 妥当な指標が答えを返すのに数か月かかり、意思決定が数週間で来る限り、無効で速い指標は消えません。捨てようとするのではなく、無効と明記して使い、同時に遅い指標のレイテンシを縮める記録を今日から始める。それしか道がないと思っています。

順位をつけると、この論文の8つの神話のうち一番実務を変えるのは Myth 3（行数）ではなく Myth 6（AI を機能させるのは個人の仕事ではない）です。Cal Newport の引用がいい。

> Now we casually ask individual knowledge workers to undertake similarly complex optimizations of their own proverbial factories, and to do it concurrently with all the work they're attempting to streamline.
>
> （いまわれわれは、個々の知識労働者に対して、自分自身の工場のいわば同様に複雑な最適化を引き受けるよう、それも効率化しようとしている当の仕事と並行してやるよう、気軽に頼んでいる）

フォードはライン化のために金と時間と失敗を投じた。エンジニア個人に「AI で自分のワークフローを最適化しておいて」と言うのは、それを本業と並行でやれと言っているのと同じ。指摘としては地味ですが、行数の話より射程が長いと思います。

---

## 出典

- Jenna Butler, Brian Houck, Margaret-Anne Storey, Travis Lowdermilk, Steven Clarke, Emerson Murphy-Hill, "Eight Myths on Software Engineering and GenAI", *ACM Queue*, Volume 24, issue 2, 2026年5月26日. DOI: [10.1145/3807963](https://spawn-queue.acm.org/doi/10.1145/3807963) / [queue.acm.org](https://queue.acm.org/detail.cfm?id=3807963)
- GIGAZINE「What are the '8 misconceptions' about software engineering and generative AI?」2026年8月5日. https://gigazine.net/gsc_news/en/20260805-8-myths-software-engineering-gen-ai/
- Stack Overflow, "Developers remain willing but reluctant to use AI: The 2025 Developer Survey results are here"（論文の参考文献20として引用）
- TechCrunch「Microsoft CEO says up to 30% of the company's code was written by AI」2025年4月29日（論文本文からリンク）
- Cal Newport の *New Yorker* 記事（論文の参考文献16として引用）
