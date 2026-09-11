---
title: "6体のボットチームは、プロファイル6つとsqliteのボードだった"
emoji: "🗂️"
type: "idea"
topics: ["ai", "llm", "エージェント", "oss", "設計"]
published: true
published_at: "2026-09-11"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> 製品は実在します。Bot Mode も記事が言う8月16日リリースで合っています。ただし公式ドキュメント自身が「**新しいプリミティブはない。ボットとは Hermes のプロファイルのことだ**」と書いています。記事が価値として書いている6つの役割契約と受け渡し記録は、**Bot Mode がなくても成立する**設計のほうです。移植できるのはそちらです。

## この記事について

元記事は [@VibeMarketer_ の X Article](https://x.com/vibemarketer_/status/2093330541177352217)「How to Build a One-Person Media Company With Hermes Bots」（2026年8月28日）。6体のボットで一人メディア企業を作る、という構成の解説です。

まず製品の確認から。記事の記述と一致しました。

| 記事の記述 | 実際 |
| --- | --- |
| hermes agent の8月16日リリース | `NousResearch/hermes-agent` **v0.20.3（v2026.8.16.2）、2026年8月16日**。MIT |
| bot mode | 同リリースで desktop に bundled・default-on |
| profiles（個別のメモリ・セッション・スキル） | `~/.hermes/profiles/<name>/` に分離 |
| kanban（依存・コメント・レビュー・リトライ） | sqlite ベース。プラグイン SDK の最初のプラグイン |

**正直な開示。** 私は Hermes をインストールしていません。以下は元記事と、Hermes の公式ドキュメント・リリースノート・GitHub の差分、および MarkTechPost の報道だけを読んだ結果です。6体を実際に走らせていません。

## 公式ドキュメントのほうが、記事より控えめだった

Bot Mode のドキュメントに、こう書いてあります。

> **There is no new primitive to learn: a Bot is a Hermes profile** — isolated config, memory, skills, credentials, and chat history under `~/.hermes/profiles/<name>/`. **Bot Mode is a UI over that primitive**, so everything you do in it is visible from the CLI too.

学ぶべき新しいプリミティブはない。ボットとは Hermes のプロファイルのことだ。Bot Mode はそのプリミティブの上に載った UI にすぎない。

そのうえ、対応表まで載っています。

| Bot Mode 上の操作 | シェルでの等価物 |
| --- | --- |
| ボットと会話する | `hermes -p <name> chat` |
| ボットのファイル・スキル・メモリ | `~/.hermes/profiles/<name>/` |
| ルーティン（定期実行） | `hermes cron list`（`[bot:<name>]` という名前で並ぶ） |
| プロファイルの作成・確認 | `hermes profile create`, `hermes profile list` |

ボット同士のメッセージも、MarkTechPost によれば実体は CLI の受け渡しです。`hermes -p <name> chat -c "Agent Inbox" -q "..."` が飛んでいる。

つまり「6体のボットチーム」は、**6つのプロファイルディレクトリと、sqlite のボードと、その上に載った顔つきの UI**です。記事はこれを「bot mode / profiles / kanban の3層が必要なピースを揃えた」と書きますが、profiles は前からありました。8月16日に増えたのは**見えるようになったこと**です。

![「ボット」と書かれた看板を持ち上げると、下にフォルダが6つ並んでいる](/images/six-bots-are-six-profiles/01-lift-the-sign.png)

## 記事は必要なものを4つ挙げ、製品はそのうち1つを配っている

ここで、記事自身の一番良い一文を引きます。

> this is why six independent chatbots are not a media company. they need **clear ownership, shared context, structured handoffs, and one feedback loop**.

6体の独立したチャットボットはメディア企業ではない。必要なのは、明確な所有権、共有文脈、構造化された受け渡し、そして1つのフィードバックループ。

正しいと思います。そして並べてみると、**Bot Mode が配っているのはこの4つのどれでもありません**。

| 必要なもの | どこから来るか |
| --- | --- |
| 明確な所有権 | 著者が書いた役割契約（owns / reads / returns / must not / done when） |
| 共有文脈 | 著者が設計した obsidian vault の構造 |
| 構造化された受け渡し | 著者が決めたキャンペーン記録のフィールド |
| 1つのフィードバックループ | 著者が引いた performance → playbook の線 |
| （見えること） | **Bot Mode** |

4つとも著者の設計です。Bot Mode が足しているのは5行目、可視性だけ。kanban は受け渡しを**運ぶ**入れ物ですが、何を運ぶかを決めているのは著者のフィールド定義です。

だから移植できます。プロファイルを分けられる仕組みなら何でもいい。Claude Code の設定ディレクトリでも、別々のリポジトリでも、フォルダ6つでも。**役割契約のフォーマットが本体です。**

- **owns**: このボットが責任を持つ決定
- **reads**: 使ってよいファイルと受け渡しフィールド
- **returns**: 次のボットが受け取る成果物の形
- **must not**: 他のボットか人間に属する決定
- **done when**: 受け渡しが完了したと言える観測可能な条件

最後の2つが効きます。`must not` と `done when` がないと、どのボットも「良いコンテンツを作る」という同じ広い指示を持つことになる。記事の言い方だと、それが multi-agent workflow を壊す最短経路です。

![5つの札のうち4つは人が書いた手書き、1つだけ既製品のラベル](/images/six-bots-are-six-profiles/02-four-handwritten-one-printed.png)

## 記事が触れていない上限が1つある

リリースノートとドキュメントを読んでいて見つけました。グループチャットには制限があります。

> Group chats open a shared room for **two to six bots**. Your message triggers up to **three serial rounds** of member turns.

2〜6体、最大3ラウンド。記事の構成はちょうど6体なので、**全員が入った部屋は人数上限ちょうど**です。そして3ラウンドで打ち切られます。

記事の設計はこれに当たりません。signal scout → researcher → strategist → writer → distribution → editor という直列の流れで、kanban が運ぶ形になっているからです。**会話で調整せず、ファイルと kanban で状態を持て**と記事は明示しています。

> use conversation for coordination. use files and kanban for state.

この一行が、結果的に3ラウンド上限を踏まない設計になっている。著者が上限を知っていて書いたのか、たまたまか、記事からは分かりません。ただ**「会話で状態を持たない」という判断は、上限があろうがなかろうが正しい**と思います。会話は消えるし、順番が保証されないので。

## 他人の数字は1つあって、確かめられない

記事にはこう書いてあります。

> this is the exaxt system that has helped me generate over **5.8 million impressions** on X account in just the past 4 weeks.

4週間で580万インプレッション。自己申告で、確かめる方法がありません。参考までに、この記事自体は fxtwitter の値で **750,902 views**、ブックマーク9,568です。1本でこれなら、4週間で580万は届く範囲ではあります。ただ「この構成のおかげで」の部分は、どうやっても確かめられません。

これは責める話ではなく、**この種のガイドの数字は全部この形**だという話です。前に書いた別の記事で、「本番のツール呼び出しは3〜15%失敗する」という数字を辿ったら個人ブログ1本に着きました（[私の記事](https://meikocho1.github.io/blog/three-to-fifteen-came-from-one-blog)）。そちらは借り物で、こちらは自前。どちらも測定にはなっていません。

## 私の見解

この記事で一番面白いのは、6体の内訳でも obsidian でもなく、**editor の権限**だと思っています。

> editor can approve, request a revision, or reject an asset. **it cannot publish.**

承認も差し戻しも却下もできる。**公開だけできない。** 最後の不可逆な操作を、6体のうちどれにも渡していません。

同じ週に読んだ別のガイド（OpenAI Agents SDK でバックオフィスを作る話）にも、まったく同じ規則が出てきます。8つの席のうち7つは候補を作り、1つだけがコミットする。エコシステムも言語も違う書き手が、独立に同じ場所に線を引いている。

**取り消せる仕事はいくらでも並列化してよくて、取り消せない仕事は1か所に集める。** これは新しくもないし、エージェントに固有でもありません。デプロイ権限を1人に絞るのと同じことです。ただ、エージェントの文脈で書かれると急に忘れられる。6体いると6体に仕事をさせたくなるからです。

もう1つ。この記事は Hermes の `SOUL.md` に役割契約を書け、と指示しています。SOUL ファイルについては前に別の論文の話を書きました。**空の SOUL ファイルが一番影響を受けやすい**、という測定です。6体分の SOUL を書くとき、埋まっているファイルと空のファイルが混ざるはずで、そこは記事が触れていない穴だと思います。役割契約を書いた4体と、とりあえず作った2体では、同じ指示に対する反応が変わる可能性があります。

![6つの部屋のうち1つだけ扉に鍵がかかっていて、他の5つは開いている](/images/six-bots-are-six-profiles/03-only-one-door-locks.png)

## 1つだけ持ち帰るなら

**役割を分ける前に、`must not` と `done when` を先に書いてください。** 分けること自体には効果がありません。分けた先が「何をしてはいけないか」と「いつ終わりか」を持っていないと、6体が同じ広い指示で同じことをします。この2行は製品を選ばないので、今日書けます。

## 出典

- [@VibeMarketer_, "How to Build a One-Person Media Company With Hermes Bots"](https://x.com/vibemarketer_/status/2093330541177352217), X Article、2026年8月28日
- [Bot Mode — Hermes Agent 公式ドキュメント](https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode)
- [NousResearch/hermes-agent リリース v0.20.3（v2026.8.16.2）](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.16.2)（2026年8月16日）
- Michal Sutter, ["Nous Research Ships Bot Mode for Hermes Agent"](https://www.marktechpost.com/2026/08/17/nous-research-hermes-bot-mode/), MarkTechPost、2026年8月18日

私は Hermes をインストールしておらず、6体構成を実行していません。CLI の等価コマンド、グループチャットの2〜6体・3ラウンド上限、プロファイルのパスは、いずれも公式ドキュメントとリリースノートの記述です。自分で確認したものではありません。580万インプレッションの数字は著者の自己申告で、検証手段がありません。
