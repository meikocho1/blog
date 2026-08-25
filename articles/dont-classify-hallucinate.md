---
title: "分類させるな、幻覚させろ — LLMに語彙を渡すのをやめる設計と、それが静かに買っているもの"
emoji: "🏷️"
type: "idea"
topics: ["ai", "llm", "embeddings", "検索", "生成ai"]
published: true
published_at: "2026-08-18"
source: blog-essay
audience: engineer
---

## この記事について

検索エンジニアの Doug Turnbull 氏が2026年8月10日、自身のブログに「[Don't classify. Hallucinate!](https://softwaredoug.com/blog/2026/08/10/hypothetical-classifications)」という短い記事を公開しました。私がこれを知ったのは Simon Willison 氏が8月14日に[リンク記事](https://simonwillison.net/2026/Aug/14/dont-classify-hallucinate/)として紹介していたからです。読んだのは2026年8月18日。

先に開示しておきます。私は Turnbull 氏が公開している [Colab ノートブック](https://colab.research.google.com/drive/1ljk72SBRuqWIijuEusCnDbhG1WAfZFcC)も [cheat-at-search リポジトリ](https://github.com/softwaredoug/cheat-at-search/blob/main/cheat_at_search/enrich/vocabulary.py)も、自分の手では動かしていません。この記事は原文と、私が別途確認した OpenAI の公式仕様に基づく考察です。

先に結論だけ書くと、こうです。

> このテクニック自体は3行で説明が終わります。面白いのはそこではない。**enum に語彙を全部詰め込む設計は、思っているよりずっと早い段階で物理的に壊れている**こと。そして、その代替としてこの手法を入れると、失敗が「エラーになる失敗」から「もっともらしく黙って間違える失敗」に変質します。安くなった分の代金は、評価コストで払うことになります。

前半は短くします。手法の説明は原文を読めば足りるので。字数は後半の「私の見解」に使います。

![すみが「語彙」と書かれた長すぎる巻物の端を持ち、床にとぐろを巻いた先が小さな機械の細い投入口で詰まっている。詰まった箇所に赤で「入らない」、機械の横に赤で「上限」の書き込み](/images/dont-classify-hallucinate/01-enum-scroll-overflow.png)

---

## 第1部 — enum に語彙を詰める設計は、数百件で壁に当たる

やりたいことは平凡です。「wood coffee table」という検索クエリを、Wayfair の商品カテゴリのどれかに割り当てたい。カテゴリはこういう形をしています。

```
Furniture / Living Room Furniture / Coffee Tables & End Tables / Coffee Tables
Décor & Pillows / Decorative Pillows & Blankets / Throw Pillows
Furniture / Bedroom Furniture / Dressers & Chests
```

定石は Structured Outputs です。Pydantic で正解の値だけを並べた巨大な `Literal` を作り、LLM の出力をそこに拘束する。

```python
FullyQualifiedClassifications = Literal[
 'Furniture / Bedroom Furniture / Beds & Headboards / Beds',
 'Furniture / Living Room Furniture / Chairs & Seating / Accent Chairs',
 'Rugs / Area Rugs',
  ...
  # times 500
]
```

Turnbull 氏はこれを「これは動く。でも、もっと安くやる方法がある」と評しています。原文は上限の存在に触れつつ、具体的な数字は公式ドキュメントへのリンクに任せていました。そこが気になったので自分で読みに行きました。[OpenAI の Structured Outputs ガイド](https://developers.openai.com/api/docs/guides/structured-outputs)にはこう書いてあります。

> スキーマ全体で enum 値は最大 1000 個まで。
>
> 単一の enum プロパティが文字列値を持つ場合、enum 値が 250 個を超えるなら、全 enum 値の合計文字列長は 15,000 文字を超えられない。
>
> （拙訳）

この2つ目の条件が意地悪です。文字数制限は250件を超えたときにだけ発動する。だから250件までは、パスがどれだけ長くても（スキーマ全体の12万文字に収まる限り）通ります。

問題は251件目です。上に挙げた `Furniture / Living Room Furniture / Coffee Tables & End Tables / Coffee Tables` は78文字。Wayfair のフルパス型カテゴリはだいたいこのくらいの長さになります。251件を並べた瞬間に文字数制限が発動して、合計15,000文字以内が要求される。ところが15,000 ÷ 78 ≒ 192 なので、192件分しか入らない。251件以上でありながら192件以内、という条件を同時に満たす方法はありません。

つまりフルパス型の分類では、**251件目が存在できない**。上限はふわっとした「だいたい数百」ではなく、きっちり250件です。1000件という enum 個数の上限は一度も効かない。その4分の1で崖に着く。Turnbull 氏が「hundreds（数百）」と書いたカテゴリ数は、偶然ではなく、ちょうど崖の位置なんです。

Simon Willison 氏の用途だとさらに露骨です。彼のブログには1,856個のタグがある。`generative-ai` のような13文字前後のタグでも 1,856 × 13 ≒ 24,000 文字。個数でも文字数でも二重にアウトで、この設計は最初から選択肢に入らない。

「LLM に選択肢を渡して選ばせる」は、実運用の語彙サイズだとそもそも成立しないことが多い。ここは肌感ではなく仕様で決まっています。

---

## 第2部 — 手順は3行で終わる

Turnbull 氏の提案はこうです。

1. 安いモデルに、**実在しない**分類を勝手にでっち上げさせる
2. 実在するカテゴリ全部の埋め込みを、事前に手元で作っておく
3. でっち上げた分類の埋め込みを、実在カテゴリ集合に内積で最近傍検索して着地させる

プロンプトは語彙を一切渡しません。渡すのは「形」だけです。

> あなたのタスクは、検索クエリに最も適合する、**新規でこれまでに存在しない**家具・生活用品・金物の分類を作ることです。
>
> 商品分類はこういう形をしています：
>
> `Furniture / Living Room Furniture / Coffee Tables & End Tables / Coffee Tables`
> `Décor & Pillows / Decorative Pillows & Blankets / Throw Pillows`
> `Furniture / Bedroom Furniture / Dressers & Chests`
> （以下略）
>
> 分類を生成する対象のクエリ：
>
> `brown coffee table`
>
> （原文プロンプトより、拙訳）

出てくるのは実在しないデタラメです。たとえば `Furniture / Living Room / Tables / Coffee`。原文の一行が効いています。

> それは全然役に立たない。
>
> 実は、めちゃくちゃ役に立つ。
>
> （拙訳）

MiniLM で実在カテゴリ全件を埋め込んでおいて、このデタラメの埋め込みと内積を取れば、`Furniture / Living Room Furniture / Coffee Tables & End Tables / Coffee Tables` に着地する。実在カテゴリの埋め込みはインメモリで持てるので安い。そしてスキーマを毎回 LLM に送らなくていい。

説明は以上です。

![すみが「でっち上げ」と書いた名札を宙に放ち、橙の弧を描いて棚に並んだ実在ラベルの一枚に着地している。着地点に赤で「一番近い」、棚の上に黒猫が座っている](/images/dont-classify-hallucinate/02-fake-label-snaps.png)

---

## 私の見解

ここからが本題です。

### これは HyDE を裏返しただけ、と気づくと応用範囲が見える

Gao らの HyDE（Hypothetical Document Embeddings, 2022）は、クエリで直接ドキュメントを探すのをやめて、まず LLM に「この質問に答えているであろう架空のドキュメント」を書かせ、その架空ドキュメントの埋め込みで実在ドキュメントを検索する手法でした。クエリとドキュメントは文体も長さも違うので埋め込み空間で近くならない。だから偽物を経由して形を揃える。

今回のは、これの向きが逆です。HyDE は**架空のドキュメントを作って実在ドキュメントに当てる**。Turnbull 氏の手法は**架空のラベルを作って実在ラベルに当てる**。どちらも同じ一手を打っています。

> 出力を語彙に拘束するのをやめる。自由に生成させて埋め込み空間に飛ばし、最近傍で実在の値に着地させる。

この抽象で捉え直すと、対象がタグやカテゴリである必然性はどこにもない。社内 API 名、Jira のコンポーネント、エラーコード体系、勘定科目、部品番号 — 「有限だが多すぎる語彙に、自然言語を対応づけたい」場面すべてが同じ形をしています。私が面白いと思ったのは分類の小技としてではなく、ここです。**閉じた語彙への対応づけは、スキーマの問題ではなくて検索の問題だった**という捉え直しのほう。

enum に詰め込む発想は、語彙を「制約」として扱っています。この手法は語彙を「インデックス」として扱う。制約はモデルに渡さないと効かないからスケールしないけれど、インデックスは手元に置けるからスケールする。この一点で勝負がついている。

![すみが中央に立ち、左右の手回し機械を同時に回している。左は「偽の文書」が橙の矢印で実在ドキュメントの束へ、右は「偽の名札」が実在ラベルの列へ。頭上に赤で「同じ手」、足元に橙で「本物へ」](/images/dont-classify-hallucinate/03-hyde-mirror.png)

### 「幻覚」と呼んだせいで、本当に起きている交換が見えにくい

タイトルは効いていますが、正確ではないと思います。ここで LLM は幻覚を起こしていない。指示どおりに、意味を正規化した表現を生成しているだけです。デタラメなのは文字列であって、意味ではない。むしろこのプロンプトは、LLM を分類器ではなく**意味の正規化器**として使っている。

言葉遊びに見えるかもしれませんが、呼び方を間違えると設計の判断を間違えます。「幻覚を利用する裏技」だと思うと、モデルの賢さを上げれば精度が上がる気がする。実際には精度を決めているのは後段です。埋め込みモデルと、実在語彙側の表現。

そして、ここが私が一番引っかかったところ。**この設計は失敗の出方を変えます。**

Structured Outputs は、語彙外の値が出たら壊れます。バリデーションエラーになる。うるさいけれど、気づける。最近傍検索は違う。どんな入力に対しても、必ず何かを返す。類似度が0.9でも0.2でも、いちばん近いものが返ってくる。「該当なし」を返す口がデフォルトでは存在しない。

クエリが `wood coffee table` なら問題ありません。問題は業務データの隅にいる、`hvac damper actuator 24v` みたいな、そのタクソノミーにそもそも居場所がないやつです。enum なら「該当なし」に落ちるか、無理やり選んで明らかにおかしい値が出て目立つ。この手法だと、静かに `Home Improvement / HVAC / Vents & Registers` あたりに吸い込まれて、誰も気づかないまま集計に混ざる。

なので、実戦投入するなら最近傍の類似度に閾値を入れて棄却レーンを作るのは、オプションではなく必須だと思っています。原文にはこの話は出てきません。

![大きな漏斗に丸・三角・星などの札が次々落ちていき、明らかに形の違う赤い札も同じように吸い込まれている。すみが札を一枚持ったまま漏斗の側面を手で探るが投入口はなく、赤で「出口なし」の書き込み](/images/dont-classify-hallucinate/04-no-abstain-slot.png)

### 一番言うべきなのは「評価が載っていない」ことだ

原文には精度の数字がありません。WANDS データセットを使っていて、Colab ノートブックまで公開しているのに、「Structured Outputs 版と比べて精度が何%」という比較が本文にない。私が読み落としているのでなければ、ここは空白のままです。

これは Turnbull 氏を責める話ではありません。あれは短いアイディア記事で、そう名乗っている。責める先があるとしたら、こういう手法を「安くて同等」と要約して伝播させる側です（この記事も含めて）。

主張されているのは「安い」「スキーマを毎回送らなくていい」の2点で、これは構造から自明です。主張されていないのは「同じくらい当たる」。そして実務でこれを採用するかどうかは、まさにその測られていない部分で決まる。

しかも評価が面倒な形をしています。分類の当たり外れは、LLM 側の生成品質と埋め込みモデルの近傍品質が掛け算になっていて、外れたときにどっちのせいか分離しづらい。フルパス文字列（`A / B / C / D`）を MiniLM 級のモデルに素で食わせている点も気になります。埋め込みモデルは自然文で学習されていて、スラッシュ区切りの階層パスは学習分布から外れている。階層の深いところの差 — `Coffee Tables` と `End & Side Tables` — が、上位階層が共通なせいで埋め込み上ほとんど潰れる可能性がある。ここは実際に測らないと分からない。だから測る話が要る。

### で、いつ使うか

私の線引きはこうです。

語彙が数百を超えていて、間違いが致命的でなく、集計や検索の絞り込みのように**間違いが後で洗い出せる**用途なら、迷わず使う。Simon 氏の「1,856タグの過去記事にタグを振る」はどんぴしゃです。enum 版が仕様上そもそも作れないうえ、タグが1つズレても誰も死なない。

逆に、語彙が200件に収まっていて enum が普通に通るなら、わざわざ埋め込みパイプラインを足す理由はありません。壊れたときに壊れたと言ってくれる仕組みのほうが価値がある。課金の勘定科目みたいに、間違いが静かに効いてくる領域も同じ理由で避けます。

つまりこれは「Structured Outputs の上位互換」ではなく、**enum が物理的に入りきらないサイズの語彙のための道具**です。そう位置づければ、かなり良い道具だと思います。

---

## まとめ

1つだけ持ち帰るなら、テクニックそのものではなく、その手前の事実のほうです。

**LLM に選択肢リストを渡して選ばせる設計には、具体的な天井がある。** OpenAI の場合、250件を超えた瞬間に全 enum 値の合計15,000文字という条件が発動するので、長い階層パスだと実質250件ちょうどで打ち止めになる。自分のタクソノミーが今そこに対してどの位置にいるか、一度数えてみる価値はあります。250はそれほど遠くない数字です。

そのうえで、天井を超えていたら選択肢は2つ。階層を分けて多段分類にするか、Turnbull 氏のように「生成して、埋め込んで、最近傍で着地させる」に切り替えるか。後者を選ぶなら、類似度の閾値と棄却レーンを最初から設計に入れておくこと。エラーが出なくなったのは、間違いが減ったからではないので。

---

## 出典

- Doug Turnbull「[Don't classify. Hallucinate!](https://softwaredoug.com/blog/2026/08/10/hypothetical-classifications)」softwaredoug.com、2026年8月10日
- Simon Willison「[Don't classify. Hallucinate!](https://simonwillison.net/2026/Aug/14/dont-classify-hallucinate/)」simonwillison.net、2026年8月14日（リンク記事）
- [Colab ノートブック](https://colab.research.google.com/drive/1ljk72SBRuqWIijuEusCnDbhG1WAfZFcC) / [cheat-at-search](https://github.com/softwaredoug/cheat-at-search/blob/main/cheat_at_search/enrich/vocabulary.py)（Turnbull 氏による実装）
- OpenAI「[Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs)」（enum 上限の記述、2026年8月18日に確認）
- Luyu Gao et al.「[Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496)」2022年（HyDE）
