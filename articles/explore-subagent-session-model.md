---
title: "Explore サブエージェントのモデルについて"
emoji: "🔍"
type: "idea"
topics: ["ai", "エージェント", "claudecode", "考察"]
published: true
published_at: "2026-11-10"
source: blog-essay
audience: engineer
---

Addy Osmani さんの「Which Claude model should you build with?」（claude.dev、2026年11月9日）は、Haiku・Sonnet・Opus・Fable の使い分けの記事です。その中の、サブエージェントの節にこう書いてあります。

> In current versions of Claude Code, the built-in Explore subagent runs on your session's model instead of always running on Haiku. On the Claude API, that model is capped at Opus. To keep exploration cheap, define your own subagent named `Explore` with `model: haiku`.
>
> （現在の Claude Code では、組み込みの Explore サブエージェントは、常に Haiku で動くのではなく、セッションのモデルで動く。Claude API では、そのモデルの上限は Opus。探索を安く保つには、`Explore` という名前の自前のサブエージェントを `model: haiku` で定義する。）

先に結論だけ書くと、こうです。

> Explore を Haiku に固定する設定は入れてよいと思います。ただ、記事が小さいモデルに任せてよい条件として挙げる「間違いが安く見つかる」は、探索の半分にしか当てはまりません。「見つかった」という答えは確かめられますが、「無かった」という答えは確かめにくい。漏れが困る探索は、Haiku に渡さないほうがいいと考えています。

私は Claude Code に、サブエージェントのモデルについての自分用のルールを書いて読ませています。この記事を読んで、そのルールの穴が1つ見えました。後半はその話です。

---

## 記事の基準は「間違いが安く見つかるか」

記事は、モデルごとの出発点を表にしています。サブエージェントの行はこうです。

ファイル検索・ログ読み・要約をするサブエージェントは Haiku 5.5 か Sonnet 5.5 で始める。理由の欄はこうです。

> Wrong answers are cheap to spot, and the main model has the judgment calls anyway.
>
> （間違った答えは安く見つかるし、どのみち判断はメインのモデルがする。）

例として載っているのは、テストのログを読んで失敗したテストを報告する `log-reader` という定義で、`model: haiku` が付いています。そのあとに、何を小さいモデルに任せ、何を任せないかの線引きが続きます。

> Keep small models on work where a mistake is cheap to spot, like finding files, running tests and reading logs. Keep code edits and judgment calls on the main model. When a small model misreads a search result, the main model opens the wrong file and spends tokens on it.
>
> （小さいモデルには、ファイル探し、テストの実行、ログ読みのように、間違いが安く見つかる仕事を任せる。コードの編集と判断はメインのモデルに残す。小さいモデルが検索結果を読み違えると、メインのモデルが違うファイルを開いて、そこにトークンを使う。）

Claude Code の `opusplan`（計画を Opus、実行を Sonnet に任せる別名）はこの逆で、コードの編集を小さいほうに回す。だから自分のタスクで測ってから既定にするように、とも書いています。

## 見つかる間違いと、見つからない間違い

記事が例に挙げている間違いは、「違うファイルを開く」です。これは確かに安く見つかります。メインのモデルがそのファイルを開けば、関係ないことがすぐわかる。

探索の答えには、もう1種類あります。「この関数の呼び出し元は3つです」の、4つ目が抜けている場合です。あるいは「この設定を読んでいる箇所はありません」が、実はある場合です。

こちらは見つかりません。メインのモデルは報告された3つを直し、4つ目には手を付けずに終わります。テストがその4つ目を通っていなければ、レビューまで誰も気づかない。記事の言う「違うファイルを開いてトークンを使う」よりずっと高くつきますし、そのコストはトークンの請求書には出てきません。

間違いが安く見つかるかどうかは、モデルではなく問いの形で決まると私は思います。

- 「X はどこにある？」：答えが間違っていれば、開いた時点でわかる。小さいモデルでいい
- 「X を使っている箇所を全部」：抜けは開いても見えない。漏れが困るなら、`grep` の結果そのものをメインに渡すか、メインのモデルで探す

`log-reader` が小さいモデルで安全なのは、失敗したテストを報告し漏らしても、次にテストを回せばまた落ちるからです。後ろに確かめる仕組みがある。全件の列挙には、それがありません。

## 私のルールの穴

私の Claude Code の設定には、サブエージェントのモデルについてこう書いてあります（自分用のルールファイルからの引用です）。

> Agent ツールでは `model` を明示する。指定しないと親のモデルを継承し、Fable の場合はコストが跳ね上がるため。

その下には「読むだけ・検索 → `haiku`」とも書いています。サブエージェントの定義を置くディレクトリ `~/.claude/agents/` は、意図して空にしてあります。

記事を読んで気づいたのは、このルールが「メインのモデルが毎回 `model` を書くこと」に頼っているという点です。書き忘れれば、Explore はセッションのモデルで動きます。私が Fable に切り替えている日なら、Claude API の上では Opus です。忘れたかどうかは、あとで使用量を見るまでわかりません。

別のルールファイルには、アプリを設計するときの原則として「ルーティング・リトライ・ステータス判定のように switch で書けるものに LLM の判断を使わない」と書いています。アプリの話として書いたものですが、どのモデルで探索するかも switch で書ける処理です。毎回モデルに思い出させるより、`Explore` の定義を1枚置くほうが、自分の原則に合っています。

ただし、置くなら上の線引きとセットです。そして書いていて気づきましたが、私のルールの「検索 → `haiku`」自体が、すでに「全部挙げて」という探索まで Haiku に回す書き方になっています。穴は書き忘れだけではありませんでした。

Explore の定義の説明文に「全件の列挙には使わない」と書くこともできます。ただ、それはメインのモデルが説明文を読んで従うことに頼る形で、さっきの原則とまた食い違います。私は、ルールのほうを「場所を探す → `haiku`、全件を挙げる → `grep` の結果をメインが読む」と分けて書き直すほうがいいと考えています。

## 細かいが効く2点

記事には、設定を書く前に知っておいたほうがいいことがあと2つ書いてあります。

1つは、`haiku` という別名が指すモデルが場所によって違うことです。Anthropic API では Haiku 5.5 で、Claude Code v2.1.293 以降が必要です。Amazon Bedrock、Google Cloud、Microsoft Foundry、Claude Platform on AWS では、まだ Haiku 4.5 を指します。固定したいなら `ANTHROPIC_DEFAULT_HAIKU_MODEL` で指定できます。

もう1つは、Haiku 5.5 だけ、プロンプトの長さで単価が変わることです。

> A prompt of up to 100K tokens bills at the lower tier, and a prompt over 100K bills at five times that rate.
>
> （10万トークンまでのプロンプトは安い単価で、10万を超えると5倍の単価になる。）

ログ読みは、記事が Haiku に向くと書いている仕事です。同時に、プロンプトが長くなりがちな仕事でもあります。10万を超えても単価は Sonnet 5.5 の4分の1なので、まだ安い。それでも記事は、長いプロンプトが毎回必要なら一覧価格ではなく完了したタスクあたりの費用で比べるように書いています。ログ全体を渡すより、`grep` で失敗の周辺だけ切り出して渡すほうが、どちらのモデルでも安くつきます。

## 1つだけ持ち帰るなら

サブエージェントを小さいモデルに回すかどうかは、「その答えが間違っていたら、誰がいつ気づくか」で決める。「無かった」と答える探索は、気づく人がいません。

`CLAUDE_CODE_SUBAGENT_MODEL` という環境変数（`model` を指定していないサブエージェントの既定を決める）が、組み込みの Explore にも効くのかは、記事からは読み取れませんでした。私も試していません。確実なのは、記事どおり `Explore` という名前で自前の定義を置く方法です。

出典: Addy Osmani「[Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku](https://claude.dev/blog/which-claude-model-should-you-build-with/)」（claude.dev、2026年11月9日）。Claude Code の model configuration と subagents のドキュメントは読んでいません。
