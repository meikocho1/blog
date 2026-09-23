---
title: "Opus 5.5 の公式ガイドの CSS を見た"
emoji: "🎨"
type: "idea"
topics: ["ai", "llm", "claudecode", "anthropic", "デザイン"]
published: true
published_at: "2026-09-23"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> デザイン依頼のとき「避けてほしい見た目」を具体名で挙げろ、という節があります。挙がっている5つのうち**2つは、その記事を載せているサイト自身の見た目**でした。クリーム色の背景 `#faf9f5`（ライトモード時）と、monospace のラベル。どちらも anthropic.com でも使われている**ハウススタイル**です。だから「genericな見た目を避けて」が効かないのは当然で、**モデルにとってそれは generic ではなく、既定値**だからです。

## この記事について

読んだのは [claude.dev の Playbook「Getting the most out of Opus 5.5 in Claude and Claude Code」](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/)（2026年9月22日、9分）。著者は Addy Osmani、校閲は Molly Vorwerck とあります。

まず素性の確認から。`claude.dev` というドメインだけ見ると非公式に見えますが、**公式でした**。ページの JSON-LD に publisher が明記されています。

```json
"publisher": {"@type":"Organization","name":"Anthropic","url":"https://www.anthropic.com"}
```

そして Opus 5.5 自体も実在します。[anthropic.com/claude-opus-5-5](https://www.anthropic.com/claude-opus-5-5)「Introducing Claude Opus 5.5」が **同じ9月22日**。つまりこの Playbook はリリース当日のガイドです。

**正直な開示。** 私は Opus 5.5 をまだ使っていません。検証したのは、外から確かめられるもの（ドメインの素性、公開日、サイトの CSS）だけです。**著者の所属は記事に明記されていません。** Anthropic の人なのか外部の寄稿なのか、ページからは判断できませんでした。

## 「避けるべき5つ」を、発行元の CSS で探した

デザインの節が良かったので引用します。

> With no design direction, Opus 5.5 falls back on a few default styles. **A general instruction like "avoid a generic look" mostly swaps one default for another.** A list of specific patterns works much better.

デザインの指示がないと、Opus 5.5 はいくつかの既定スタイルに落ちる。「genericな見た目を避けて」のような一般的な指示は、**たいてい既定を別の既定に入れ替えるだけ**。具体的なパターンを列挙したほうがずっと効く。

そして挙がっている5つがこれです。

> Don't use a **cream or off-white background**, **italic accent words in headings**, numbered **"01 / 02 / 03" section labels**, **monospace labels**, or **pill-shaped buttons**.

読んでいて引っかかりました。**この5つ、どこかで見た気がする。** 記事が載っているページそのものです。CSS を落として調べました。

| 挙がっているパターン | claude.dev の CSS |
| --- | --- |
| クリーム／オフホワイトの背景 | **該当**。`@media (prefers-color-scheme:light)` で `--bg:#faf9f5`、`--bg-raised:#f1efe8`、`--bg-panel:#ece9e0` |
| monospace のラベル | **該当**。`font-family:var(--mono)` を持つ規則が **100個**。セレクタに `.label` `.mono` `.tabs` `.meter` `.nav-brand` など |
| 見出しの italic 強調語 | 見当たらず（`font-style:italic` は2箇所のみ） |
| pill 型ボタン | 見当たらず（該当する `border-radius` は2箇所のみ） |
| 「01 / 02 / 03」の節番号 | **不一致**。このサイトは「1. / 2. / 3.」形式 |

**5つ中2つ**です。全部ではありません。ただ、当たった2つの中身が効きます。

`--mono` の定義はこうでした。

```css
--mono: "Anthropic Mono", ui-monospace, "SF Mono", Menlo, monospace
```

**Anthropic Mono**。自社の monospace 書体があって、それをラベルに使っている。

念のため本家も見ました。

| サイト | `#faf9f5` | `#141413` | "Anthropic Mono" |
| --- | --- | --- | --- |
| claude.dev | ライトモードの `--bg` | 既定の `--bg` | `--mono` に定義 |
| anthropic.com/claude-opus-5-5 | 37回 | 50回 | 1回 |
| anthropic.com（トップ） | 8回 | 13回 | 3回 |

`#faf9f5` と `#141413` は3サイトに共通して出てきます。**これはハウスカラーです。**

![5枚の色見本を壁に当てていて、2枚が壁の色とぴったり同じ](/images/the-house-style-is-the-default/01-two-swatches-match-the-wall.png)

## だから「generic を避けて」は効かない

ここが本題です。ガイドは「一般的な指示は既定を別の既定に入れ替えるだけ」と書いていて、それは正しい。ただ**なぜそうなるか**は書いていません。CSS を見ると説明がつきます。

モデルにとって、あの5つは「generic」ではありません。**既定値**です。周りがずっとそうだったものを、悪いものとして認識できない。「genericなのを避けて」と言われたとき、モデルは自分の既定を generic だと思っていないので、別の何かを generic だと判断して、そちらを避ける。結果、既定が別の既定に入れ替わる。

だから具体名の列挙が効くわけです。**「これは既定である」という情報を、外から渡している**ことになる。

言い換えると、あの5つは趣味の悪い見た目ではありません。むしろ整っています。整っているものが既定になっていて、既定であることが問題なのであって、醜さが問題なのではない。**「AIっぽいデザイン」の正体は、たぶん下手さではなく一様さです。**

これは私自身が今月やらかした話とまったく同じ形でした。このブログのタイトルが45本とも同じ型になっていたとき、1本ずつはどれも悪くなかった。規則に従うと同じ形が出て、同じ形であること自体は規則違反にならないので、内側からは検出できない。

![同じ型抜きを2回押すと、違う模様のつもりで同じ形が2つ出てくる](/images/the-house-style-is-the-default/02-two-presses-one-shape.png)

## 14日前に測られたことが、チェックリストになった

このガイドの冒頭3つのうち2つ目がこれです。

> Delete "think carefully" lines. Opus 5.5 already thinks before every reply.

そして巻末のチェックリストにも入っています。「No "think hard" lines in prompts or saved instructions」。

9月8日に Anthropic が出したコスト削減の記事を読んだときのことを思い出しました（[私の記事](https://meikocho1.github.io/blog/claude-official-cost-down)）。アンチパターンを6つ仕込んで測った実験で、そのうち2つが **verification rituals（「2回検証せよ」）** と **thoroughness boosters（「最大限に徹底的に」）** でした。掃除した結果がコスト −14.6%、正解率 +5.3%。

**14日後、それが製品ガイドのチェックリストになっています。** 9月8日は「測ったらこうだった」、9月22日は「消してください」。測定から指導まで2週間。

今回のガイド側の根拠はこう書かれています。

> In our testing in a chat product, removing a "think carefully" line made replies start sooner, with **no clear drop in quality**.

「明確な品質低下はなかった」。9月8日の記事には信頼区間まで付いていたので、そちらのほうが厳密です。ただ言っていることは同じで、こちらは使い方の側から書かれている。

## 半分は回避策で、一番重いものが5節目にある

もう1点。このガイドは18個ほどの「What to do」で構成されていますが、読み分けると**2種類**あります。

**新しくできるようになったこと**（丸ごと渡して走らせる、サブエージェントに分ける、図をそのまま貼る、長い資料の矛盾を探させる、完成ファイルで受け取る、レビューさせる）。

**新しい挙動への回避策**（「think carefully」を消す、避けたいデザインを列挙する、`CLAUDE.md` に「止まらず進め」と書く、タスクリストをファイルに置く、プロジェクト指示に「済んだ答えは蒸し返すな」と書く、推論の開示を求める文を消す）。

だいたい半々でした。分類は主観が入るので数字は出しませんが、**「もっと引き出す」というタイトルの半分が、新しい摩擦を避ける手順**です。

そして一番重いものが5節目にあります。

> Opus 5.5 is the first Opus model to launch with Fable-level bio and cyber safeguards. In Claude apps and Claude Code, **most flagged messages move to an older model, and your work goes on there.**

フラグが立つと**古いモデルに移り、そのまま作業が続く**。Claude Code では `/model` で戻す、`/config` で「Switch models when a message is flagged」を変える、`Esc` 2回で直前のメッセージを編集する。

しかも判定は会話全体が対象だと書いてあります。「The check covers everything in the conversation, including files and search results.」直前の発言ではなく、前に読ませたファイルが原因で切り替わることがある。

これは知らないと気づけません。Opus 5.5 を選んだつもりで古いモデルが答えていて、出力の質が落ちた理由が分からない。**ガイドの中で一番「知らないと損をする」情報が、プロンプトの書き方の後ろに置かれています。**

![チェックリストの下半分をめくると、使い方ではなく回り道が並んでいる](/images/the-house-style-is-the-default/03-the-lower-half-is-detours.png)

## 私の見解

このガイド自体は良くできています。1項目が「What to do / Why it matters on Opus 5.5 / How」の3行で揃っていて、コード例が短く、チェックリストで閉じる。読める形になっている。

そのうえで、読み手としてやっておくべきだったのは**CSSを見ること**だったと思います。5つのパターンは本文を読んでいるだけなら「なるほど、AIっぽい見た目ってそういうのか」で終わります。発行元の CSS と突き合わせて初めて、**これは「悪い見た目のリスト」ではなく「既定値のリスト」だ**と分かる。

意味が変わります。悪い見た目のリストなら、覚えて避ければいい。既定値のリストなら、**リストは環境が変われば変わる**。Anthropic のモデルの既定は Anthropic の見た目に寄るはずで、別のベンダーのモデルは別の既定を持つ。だから移植するなら5つの名前ではなく、**「自分が使っているモデルの既定を、具体名で書き出す」という手順のほう**です。

1つ、注意したい引用も見つけました。

> **One early tester said** Opus 5.5 at its lowest effort caught more bugs than Opus 5 at high effort, with fewer false alarms.

「初期テスターの1人が言った」。N=1 の伝聞です。同じ記事の中で、「think carefully」の件には社内テストが添えられ、こちらには伝聞が添えられている。どちらも同じ「Why it matters」の枠に入っているので、読んでいる側からは区別がつきません。**測定と伝聞が同じ見出しの下に並ぶ**のは、先月から何度も同じ形で見ている問題でした。

![第5節の奥の棚に「別のモデルに切り替わります」の札が伏せて置いてある](/images/the-house-style-is-the-default/04-the-notice-in-section-five.png)

## 1つだけ持ち帰るなら

**「genericを避けて」と書くのをやめて、避けたいものを5つ書き出してください。** そして書き出すとき、自分が使っているモデルのベンダーのサイトを開いて、そこの背景色とラベルの書体を見るのが早いです。今回の5つのうち2つは、そこに載っていました。

## 出典

- Addy Osmani, ["Getting the most out of Opus 5.5 in Claude and Claude Code"](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/), claude.dev、2026年9月22日（Playbooks、9分、校閲 Molly Vorwerck）
- [Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5), Anthropic、2026年9月22日
- claude.dev / anthropic.com の CSS は2026年9月23日に取得して数えました

`claude.dev` が Anthropic の媒体だという判断は、ページの JSON-LD の `publisher` 欄に拠ります。**著者の所属は記事に書かれていません。**

CSS の数え方を書いておきます。「monospace のラベル」は `font-family:var(--mono)` を含む規則を数えて100個。「クリーム背景」は `@media (prefers-color-scheme:light)` 内の `--bg:#faf9f5` です。**このサイトの既定は `:root{--bg:#141413}` のダークで、クリームはライトモードのときだけ**なので、「サイトがクリーム色だ」と言い切ると不正確です。`italic` と pill 型の `border-radius` はそれぞれ2箇所しか見つからなかったので、該当なしとしました。節番号も「01 / 02 / 03」ではなく「1. / 2. / 3.」で、これは当たりに数えていません。

私は Opus 5.5 を使っていないので、ガイドが書いている挙動（長時間走る、報告が明確、途中で止まって聞いてくる、フラグで切り替わる）はどれも自分で確認していません。全部、記事の記述です。
