---
title: "Fable 5.2 と Opus 5.5 を行き来する"
emoji: "⚖️"
type: "idea"
topics: ["ai", "エージェント", "評価", "考察"]
published: true
published_at: "2026-11-10"
source: blog-essay
audience: engineer
---

普段は Opus を使い、深い推論が要るときだけ `/model` で Fable に切り替える。私のモデルの使い方はこれで、自分用のルールファイルにもそう書いてあります。この「切り替える」に向きがあることが、Addy Osmani さんの記事「Which Claude model should you build with?」（claude.dev、2026年11月9日）の2つの節をつなぐと見えてきます。

記事の勧めは、まず Opus 5.5 を effort `medium` で使うことです。Fable 5.2 に上がるのは、いちばん難しい技術的な仕事、Opus 5.5 の `high` でも足りないとき、長い無人実行のとき。記事に並ぶ Fable と Opus の比較では点数はほぼ並び、違うのは費用です。そこに、記事の後半にあるモデル切り替えの仕様を重ねると、もう1つ見えてくるものがあります。

先に結論だけ書くと、こうです。

> 同じ会話のまま Opus から Fable に上がると、Opus の思考は Fable に引き継がれます。Fable から Opus に戻ると、Fable の思考は捨てられます。難しい部分だけ Fable に任せて戻るなら、戻る前に、Fable がたどり着いた判断を見える文字に書き出させておく必要があります。

思考ブロックの扱いは、記事が書いている Claude API と Google Cloud（Google 管理）の話です。以下の費用も記事の数字を並べたもので、自分の使用量で測ったものではありません。

---

## 点数は並び、費用が違う

記事に出てくる Fable と Opus の単体同士の比較は2つあります。1つ目は Terminal-Bench 3.0 です。

> on Anthropic's runs of Terminal-Bench 3.0, the previous Fable, 5.1, at `max` scored 58.0%, while Opus 5.5 at `high` scored 58.9% with half the tokens.
>
> （Anthropic が回した Terminal-Bench 3.0 では、1つ前の Fable 5.1 を `max` にすると 58.0%、Opus 5.5 を `high` にすると 58.9% で、トークンは半分だった。）

2つ目は FrontierCode 2.0 で、こちらは向きが逆です。

> On FrontierCode 2.0, Fable 5.2 at `high` scored about level with Opus 5.5 at `max` (45.3% vs. 45.5%) for roughly half the cost per task.
>
> （FrontierCode 2.0 では、Fable 5.2 の `high` が Opus 5.5 の `max` とほぼ同じ点（45.3% 対 45.5%）で、タスクあたりの費用はおよそ半分だった。）

どちらも点数の差は1ポイント未満で、FrontierCode のほうには記事自身も「about level」と書いています。主張しているのは費用のほうです。Terminal-Bench では Opus の `high` が1つ前の Fable 5.1 の `max` の半分のトークンで済み、FrontierCode では、Opus を `max` まで上げるより Fable の `high` のほうがタスクあたり半分の費用で済んだ。

記事の結論もそこにあります。

> So before you raise Opus 5.5 past `high` on a hard task, test Fable 5.2.
>
> （だから難しいタスクで Opus 5.5 を `high` より上げる前に、Fable 5.2 を試す。）

この記事の中には、同じ effort で Fable が Opus より何ポイント上か、という数字は出てきません。モデル別の点数は Fable 5.2 の紹介ページにあると書かれていますが、私はそちらを読んでいません。なので、この記事だけから言えるのは「effort の上限に来たら、モデルを替えたほうが安いことがある。だから試す価値がある」までです。根拠は FrontierCode の1件です。

## 長い実行では、差は単価の2倍より小さい

一覧価格では、Fable 5.2 は入力も出力も Opus 5.5 の2倍です（100万トークンあたり入力 8 ドル・出力 40 ドルと、4 ドル・20 ドル）。ただ、キャッシュ読み出しの単価は同じです。

> Fable 5.2 charges the same $0.20, so on a long, cache-heavy run the gap between Fable and Opus comes down to uncached input and output, where Fable costs twice as much per token.
>
> （Fable 5.2 も同じ 0.20 ドルなので、キャッシュの多い長い実行では、Fable と Opus の差はキャッシュされない入力と出力に絞られる。そこでは Fable がトークンあたり2倍かかる。）

長いセッションほど入力の大半はキャッシュ読み出しになる、というのが記事の説明です。だから「Fable は2倍高い」は、長い実行では言い過ぎになります。同じタスクを Opus の `max` で長く考えさせるより、Fable の `high` で短く済むなら、出力トークンの差で逆転してもおかしくない。FrontierCode の「半分」は、たぶんこういう形で出ています。

## 切り替えには向きがある

ここからが、記事の別々の節をつないだ私の読みです。

記事は「Mixing models」の節で、モデルを途中で替えるときに失うものを2つ書いています。1つ目はキャッシュです。

> The prompt cache belongs to the model that wrote it. Your first turn on a new model pays the cache-write price on the whole conversation.
>
> （プロンプトキャッシュは、それを書いたモデルのもの。新しいモデルでの最初のターンは、会話全体についてキャッシュ書き込みの料金を払う。）

これは上がるときも下がるときも同じです。記事は、切り替える前に Claude Code で `/compact` するか、短い計画を書いて新しいセッションを始めるよう勧めています。

2つ目は思考ブロックで、こちらには向きがあります。

> A move down a tier loses the earlier reasoning, because a model never reads the blocks of a model above it.
>
> （1つ下の段に移ると、それまでの推論は失われる。モデルは自分より上のモデルの思考ブロックを読まないからだ。）

Fable 5.2 は Opus 5.5・Sonnet 5.5・Haiku 5.5 の思考ブロックを読めます。逆に Fable 5.2 から一般提供の他のモデルに移ると、Fable の推論は落とされます。リクエストはエラーにならず、そのまま通るそうです。

つまり、同じ会話のまま「Opus で詰まったら Fable に上げる」なら、キャッシュの書き込み代を払えば、Opus がそこまで考えたことは Fable に渡ります。危ないのは、Fable が難所を越えたあとに Opus へ戻すときです。Fable がなぜその設計を選んだか、どの案を捨てたかが思考ブロックの中にしか無ければ、Opus はそれを知らないまま続きを書きます。リクエストはエラーにならないので、思考が落ちたことには気づきにくいはずです。

なお、この非対称が効くのは同じ会話の履歴をそのまま持ち越すときのはずです。`/compact` や新しいセッションで思考ブロックがどう扱われるかは記事に書かれていませんが、履歴を要約し直せば、上がるときも持ち越されないと考えるのが自然です。また記事のこの説明は Claude API と Google Cloud（Google 管理）の話で、Claude Code の `/model` で同じことが起きるかは、私は確かめていません。

## 戻る前に書かせる

私が考える対策は単純で、Fable から降りる前に、決めたことと捨てた案を会話の本文か計画ファイルに書かせることです。思考ブロックは消えても、普通のメッセージやファイルは残ります。この対策は、まだ意識して試したことはありません。

これは記事の勧めとも矛盾しません。記事が切り替えの前に勧める「短い計画を書いて新しいセッションを始める」は、キャッシュ代を減らすための手ですが、同時に思考を見える文字にする手でもあります。どちらの向きでも、計画を書いてから切り替えれば、キャッシュ代は小さくなり、推論は文字で残る。上で書いた「上がるときは引き継がれる」に頼る必要もなくなります。

もう1つ、私のルールファイルは今も「深い推論が必要なときは、ユーザーが `/model` で Fable 5.1 に切り替える」と書いたままです。版が古いうえに、「深い推論」の線引きが曖昧です。記事に沿うなら、合図は2つに分けられます。大規模なリファクタや移行、設計の計画のように最初から Fable で始める仕事と、Opus を `high` より上げたくなったとき。後者は気分ではなく effort の上限で決まるので、私には使いやすい合図です。

## 1つだけ持ち帰るなら

Fable から降りるときに、何を考えたかを文字で残す。思考ブロックは、下のモデルには渡りません。

出典: Addy Osmani「[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)」（claude.dev、2026年11月9日）。Fable 5.2 の紹介ページ、ローンチ記事、Preserved thinking のドキュメントは読んでいません。思考ブロックの扱いは、記事に書かれている範囲の Claude API と Google Cloud（Google 管理）の話です。
