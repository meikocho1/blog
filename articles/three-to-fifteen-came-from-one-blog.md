---
title: "3〜15%という失敗率の出典を辿る"
emoji: "🔗"
type: "idea"
topics: ["ai", "llm", "エージェント", "openai", "設計"]
published: true
published_at: "2026-09-11"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> 「本番のツール呼び出しは3〜15%失敗する」という数字を出典まで辿ると、**個人が「自分で追跡しているから知っている」と書いたブログ1本**に着きます。方法も母数も書かれていません。それが10か月で「production 横断の研究が示す」に化けました。数字が間違いだとは言いません。**測定が存在しない**と言っています。

## この記事について

元記事は [@gippp69 の X Article](https://x.com/gippp69/status/2097696163424014406)「How to Build a Business Back Office That Runs on Agents with GPT-6 Astra (Complete Guide)」（2026年9月9日）。

先に言っておくと、**この記事は良い記事です**。出典節を持っていて、SDK の仕様も価格も Temporal も出所を示しています。最後から2番目の節（自分なら作り直さない3つ）は、この手のガイドで滅多に読めない質です。

そのうえで、記事が自分で「これが記事の全部だ」と書いた数字だけ、出所がぼやけています。そこを辿った記録です。

**正直な開示。** 私は OpenAI Agents SDK でこの構成を組んでいません。以下は元記事と、数字の出所を辿った検索結果だけです。GPT-6 Astra の価格・コンテキスト長・ベンチマーク値は、元記事の記述としてそのまま引いていて、OpenAI の一次ページでは確認していません。

## 「これが記事の全部だ」と書かれた数字を辿った

元記事の冒頭はこうです。

> Tool calling, the mechanism by which every agent in every one of those guides actually touches a real system, **fails between 3% and 15% of the time in production. Not in bad systems. In well engineered ones.**
>
> That is the whole article.

構成もそのとおりになっています。8つのエージェント、8ステップの構築手順、6つの静かな失敗、そして「3〜15%は後で対処するエッジケースではなく、設計上の制約だ」という締め。数字が動けば、記事の骨格が動きます。

辿りました。

| 出所 | 日付 | 書き方 |
| --- | --- | --- |
| Michael Hannecke（Medium） | 2025-10-29 | 3〜15%。**「I know this because I've been tracking it.」** |
| Scalekit（ブログ） | 2026-05-26 | 3〜15%。断定、出典なし |
| Openlayer（ブログ） | 2026-07-21 | 3〜15%。**「Research across production deployments shows」** |
| 元記事 | 2026-09-09 | 3〜15%。「well engineered なシステムでも」 |

私が見つけた最古は Hannecke の記事です。**一人のエンジニアが「自分で追跡しているから知っている」と書いた**もの。母数も、期間も、何を失敗と数えたかも書かれていません。誠実な書き方だと思います。個人の観測として読めば、何も問題がない。

10か月かけて、それが「Research across production deployments shows」になりました。主語が個人から研究に変わっている。その間に新しい測定が行われた形跡はありません。**同じ数字が、引用されるたびに格が上がっています。**

![1枚の紙が3回コピーされ、そのたびに署名が「私が計測した」から「研究が示す」に書き換わっていく](/images/three-to-fifteen-came-from-one-blog/01-the-signature-keeps-upgrading.png)

## 同じ時期に、別の「業界の数字」が3つ流通していた

もし 3〜15% が本当に業界の合意なら、他の数字は出てこないはずです。出ています。

| 出所 | 数字 | 枠組み |
| --- | --- | --- |
| AgentMarketCap（2026-04-10） | **12〜18%** 「The industry has a number for this gap」 | 本番パイプライン |
| cheesecat / JK Labs（2026-05-17） | **5〜15%** | プロトコル問題として |
| Presenc AI（2026-05-07） | ツール5個で85〜91%、20個超で65〜78%（＝失敗9〜35%） | **BFCL v3 を引用** |

3つとも「業界の数字」を名乗っています。3〜15%、5〜15%、12〜18%。**全部が業界の数字であることはありえません。**

面白いのは Presenc AI で、ここだけ枠組みが違います。単一のレンジを出さず、**ツール数の関数**として出している。5個なら85〜91%、20個超なら65〜78%。そして UC Berkeley の BFCL v3 リーダーボードという、名前のある測定を引いています。失敗の内訳まで出していて、パラメータ不一致が約38%、型変換エラーが約24%、ツール選択ミスが約18%。

数字を1つに丸めると「3〜15%」になり、丸めるのをやめると「あなたが何本ツールを持っているかによる」になります。**後者のほうが、設計する人には使えます。**

![3つの看板がそれぞれ違う数字を掲げて同じ方角を指している](/images/three-to-fifteen-came-from-one-blog/02-three-industry-numbers.png)

## 出典節を持っている記事が、1か所だけぼかしている

元記事には出典節があります。これは褒めるべきところです。

- SDK のプリミティブ、sandbox の permissions、sessions、Responses API との使い分け → OpenAI 公式ドキュメントと `openai/openai-agents-python`
- Astra の価格、272K のしきい値、コンテキスト長、初回成功率 → OpenAI のモデルドキュメントと OpenRouter
- Agent Builder と Evals の終了日 → OpenAI の AgentKit ページ
- 耐久実行 → temporal.io

具体的です。そして問題の1行はこうです。

> The 3-15% tool call failure figure and the ChatDev correctness number come from **published production write-ups**.

リンクがありません。「published production write-ups」が誰の何なのか書いていない。**出典を10か所きちんと示した記事が、記事の土台にした1つだけを名前なしで済ませています。**

意図的だとは思いません。たぶん著者も、これが「みんな知っている数字」だと思っている。私もこの記事を読むまでそう思っていました。

![9本の糸はそれぞれ札の付いた杭に結ばれ、1本だけ先が霧に消えている](/images/three-to-fifteen-came-from-one-blog/03-one-thread-ends-in-fog.png)

## 数字が1つも出てこない節が、一番良かった

記事の10節「What I would cut if I started this over」には、数字がほとんど出てきません。ここが一番良い。

**1つめ。分類器を独立したエージェントにしたこと。** チケットを読んで種別を返すだけ。それは席ではなく関数呼び出しです。著者の表現を借りると、

> If a seat has no tools and no branch, it is **a function call wearing a costume**.

**2つめ。リトライを万能薬にしたこと。** 失敗したツール呼び出しを3回まで再試行した。紙の上では5%が0.0125%になります。書き込みパスでは、**1通の重複請求書が3通になります**。「リトライ回数より先に冪等キーが要る」という順序は、実装した人しか書けない順序です。

**3つめ。較正していない確信度。** 抽出器が0〜1を返し、0.7未満を弾く。100件を原本と突き合わせたら、**0.65 と 0.9 で正確さがほぼ同じ**だった。つまりしきい値はランダムに仕事を捨てていただけ。

> A number you have not measured against reality is a decoration that looks like a control.

実測していない数字は、制御に見える飾りだ。

この一文が、記事の冒頭にある 3〜15% に、そのまま当てはまります。

## 私の見解

この記事を叩きたいわけではありません。**構造の話をしたい。**

3つの後悔はどれも「自分でやって、自分で測って、間違っていた」という形をしています。100件突き合わせた、という行がある。一方、冒頭の 3〜15% には測った人がいません。**同じ記事の中で、検証の密度が両端で真逆になっている。**

これは著者の怠慢ではなく、たぶん記事の書き方の問題です。導入には「読者が知らない衝撃的な数字」が要る。自分の実測は地味で、レンジにならない。だから借りてきた数字が前に来て、自分の測定が後ろに行く。**借り物ほど前に置かれ、自作ほど後ろに置かれる。**

私はこれを自分の記事でもやっています。前々回、Anthropic の figure を読めないまま両端2点で曲線の形を決めて間違えました。あれも「手元にある数字で早く言い切りたい」が原因です。

もう1つ。**3〜15% が仮に正しくても、設計には使えません。** 3%と15%では5倍違います。5倍違う数字は、リトライ戦略も、人間レビューの置き場所も、席の分け方も変えます。Presenc AI のように「ツール5個なら85〜91%」と言われたほうが、ツールを何本持つか決められる。**レンジが広い数字は、広いこと自体が「測っていない」の証拠です。**

そして元記事の設計そのもの、**「7つの席が候補を作り、1つの席だけがコミットする」**は、数字がなくても正しい。取り消せない操作を1か所に集めて、監査もレート制限も停止もそこでやる。これは 3% でも 15% でも 41% でも成り立つ設計です。**記事の主張は、記事が土台と呼んだ数字に依存していません。**

![8つの席のうち1つだけが判子を持ち、残り7つは紙を差し出している](/images/three-to-fifteen-came-from-one-blog/04-one-seat-holds-the-stamp.png)

## 1つだけ持ち帰るなら

**レンジで書かれた「業界の数字」を見たら、上限を下限で割ってください。** 3〜15%は5倍。12〜18%は1.5倍。前者は測定ではなく印象で、後者はまだ測定の形をしています。5倍のレンジを設計の前提に置くと、何を作っても「想定内」になります。

## 出典

- [@gippp69, "How to Build a Business Back Office That Runs on Agents with GPT-6 Astra (Complete Guide)"](https://x.com/gippp69/status/2097696163424014406), X Article、2026年9月9日
- Michael Hannecke, ["Why AI Agents Fail in Production: What I've Learned the Hard Way"](https://medium.com/@michael.hannecke/why-ai-agents-fail-in-production-what-ive-learned-the-hard-way-05f5df98cbe5), Medium、2025年10月29日 — 私が見つけた最古の「3〜15%」
- [Scalekit, "Tool Call Failures in Production"](https://www.scalekit.com/blog/tool-call-failures-production)（2026年5月26日）
- [Openlayer, "AI Agent Failure Modes"](https://www.openlayer.com/blog/ai-agent-failure-modes-tool-calling-loops-propagation)（2026年7月21日）
- [AgentMarketCap（2026年4月10日）](https://agentmarketcap.ai/blog/2026/04/10/agent-tool-call-retry-failure-mode-handling-production-2026) — 12〜18%
- [Presenc AI, "AI Agent Tool-Calling Accuracy Benchmarks 2026"](https://presenc.ai/research/ai-agent-tool-calling-accuracy-benchmarks-2026)（2026年5月7日） — BFCL v3 を引用
- [JK Labs（2026年5月17日）](https://cheesecat.net/blog/ai-agent-tool-calling-reliability-production-checklist-2026/) — 5〜15%

「私が見つけた最古」と書いたのは、Hannecke より前に同じ数字を出した記事がない、という意味ではありません。**私の検索で遡れた範囲でそこが最初だった**という意味です。それ以前の出所をご存じの方がいたら教えてください。この記事の主張が崩れるので、そのほうが良い。

GPT-6 Astra の数値（1,050,000トークン、272,000を超えると入力とキャッシュが2倍・出力が1.5倍でリクエスト全体に適用、初回88.0%対55.9%、4回以内99.2%対68.7%、プロンプトインジェクション成功率11.2%）は、すべて元記事の記述です。OpenAI の一次ページで確認していません。
