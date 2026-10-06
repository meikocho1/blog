---
title: "Harness Engineering の9部品と、毎朝の自動下書き"
emoji: "🪢"
type: "idea"
topics: ["ai", "llm", "claudecode", "エージェント", "harness"]
published: true
published_at: "2026-10-06"
source: x-article
audience: engineer
---

このブログのリポジトリには、毎朝9時に launchd から起動される `automation/daily-article.sh` というシェルスクリプトがあります。中身は、`claude -p` を1回呼んで記事の下書きと挿絵を作らせるだけです。無人で動きます。

santi（[@santtiagom_](https://x.com/santtiagom_)）の「Harness Engineering: explicado desde cero」を読みながら、記事に出てくる9つの部品をこのスクリプトに1つずつ当ててみました。

私の読みを先に置きます。

> モデルに渡す側の6部品は、借り物も含めてほぼ揃っていた。足りなかったのは、自分に返ってくる側の3部品（権限、観測、eval）だ。しかも一番重い穴は、santi が「一番大事な考え」と書いた場所にあった。禁止事項4つのうち、丸ごと権限で止まっていたのは git だけ。残りは半分か、まったく止まっておらず、そのうち1つは指示のほうが危ない許可を出していた。公開前に塞ぎに行ったら、対話で貯めた許可が無人実行に合流していて、Bash の許可リストも効いていなかった。

出典は santi の X Article「[Harness Engineering: explicado desde cero](https://x.com/santtiagom_/status/2098782814837543075)」（スペイン語、2026年9月12日）です。著者は Mercado Libre のエンジニアで、私が取得した時点で約77万回表示、ブックマークは3,430件でした。引用の訳はすべて私です。

先に断っておきます。本文は fxtwitter の API 経由で全文を取得し、図2枚とコードブロック6つも見ています。元記事が引いている3つの一次資料のうち、OpenAI と LangChain は自分で開いて確かめました。Anthropic の記事は開いていません。自分のスクリプトについての記述は、すべてリポジトリの実物と、手元で1回走らせた `claude -p` の出力から書いています。

---

## 記事に書いてあること

santi の記事は入門の解説です。モデルは文字を受け取って文字を返すだけで、ファイルを開くのもテストを走らせるのも周りのシステムがやっている。その周りのシステムを harness（ハーネス）と呼ぶ、というところから始まります。

> Un harness es el sistema de software que rodea al modelo y convierte lo que escribe en trabajo terminado
>
> （ハーネスとは、モデルを取り囲み、モデルが書いたものを仕上がった仕事に変えるソフトウェアのことだ。）

そこから「投稿にいいねボタンを付けて」という1つの依頼を例に、何もできないモデルに部品を1つずつ足していきます。部品は9つで、2つのグループに分かれています。

| モデルに渡すもの | 自分に返ってくるもの |
| --- | --- |
| 1. ツール（動けるように） | 7. 権限と上限（やってはいけないことをさせない） |
| 2. ループ（手順をつなぐ） | 8. 観測（何が起きたかを見る） |
| 3. 記憶（やったことを覚える） | 9. eval（良くなったかを測る） |
| 4. コンテキスト（各回に何を見せるか） | |
| 5. 作業場所（自分の環境と切り離す） | |
| 6. はっきりした目標と検証（終わったかを知る） | |

最初の6つがあればエージェントは自分で働けるようになり、残りの3つがあれば人間はそれを制限し、理解し、測れるようになる、という整理です。

権限の節に、記事で一番強い一文があります。

> los límites importantes tienen que vivir en el sistema de permisos, no en las instrucciones. Una instrucción como "no borres nada importante" depende de que el modelo la interprete bien en cada momento.
>
> （大事な制限は、指示ではなく権限の仕組みの中に置かなければならない。「大事なものは消すな」という指示は、モデルが毎回それを正しく解釈してくれることに頼っている。）

eval の節はこう締めています。

> Lo ves cuando corrés las mismas veinte tareas antes y después del cambio, y comparás los resultados.
>
> （変更の前と後で同じ20個のタスクを走らせて比べたとき、初めてそれが見える。）

最後は、harness engineering とは「モデルが現実の仕事を終えられるようにするシステムを、設計し、測り、改善する仕事だ」という定義で終わります。

![すみが大きな見えない力の塊に9本の帯を掛けている。6本は塊に結ばれ、残りの3本はすみ自身の手元に手綱として集まっている](/images/harness-nine-pieces-daily-drafts/01-six-straps-three-reins.png)

---

## 引用元で確かめたこと

記事は冒頭で3社の事例を挙げています。そのうち2つを開きました。

**OpenAI の「100万行」。** OpenAI の [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)（Ryan Lopopolo、2026年2月11日）には、5か月で約100万行、プルリクエスト約1,500件、手で書いたコードは0行とあります。santi の要約どおりです。ただ、同じ段落に「3人のエンジニアが Codex を動かし、のちに7人に増えた」「エンジニア1人あたり1日平均3.5件」とも書いてあり、見出しの標語は「Humans steer. Agents execute.」（人間が舵を取り、エージェントが実行する）です。santi の「人間は1行も書かずに」は嘘ではありませんが、人間が何をしていたかが抜けています。

**LangChain の「30位から5位」。** LangChain の [The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)（Vivek Trivedy、2026年3月10日）に「Top 30 to Top 5 on Terminal Bench 2.0 by only changing the harness」とあります。これも合っています。

1つだけずれていました。santi は終盤で「LangChain は Opus 4.6 を Claude Code の中と他のハーネスで測り、Claude Code のほうがかなり低かった」と書いています。LangChain の原文は「Opus 4.6 in Claude Code scores far below Opus 4.6 in other harnesses」で、根拠として挙げているのは Terminal Bench 2.0 の公開リーダーボードです。LangChain が自分で測ったわけではありません。

**Codex のサンドボックス。** 「Codex には3段階ある」は、手元の `codex exec --help` で `read-only`、`workspace-write`、`danger-full-access` の3つを確認しました。「既定は真ん中で、ネットワークは切ってある」は確かめていません。手元では、信頼済みにしていないリポジトリで `codex exec` を走らせると `sandbox: read-only` と表示されました。

---

## 9部品を自分のスクリプトに当てる

ここからが本題です。`automation/daily-article.sh` と、それが読む `automation/daily-article-prompt.md`、それから Claude Code のプロジェクト記憶を、santi の9部品に当てました。

| 部品 | 毎朝の自動下書きでは | 状態 |
| --- | --- | --- |
| 1. ツール | `--allowedTools` で WebSearch、WebFetch、Read、Write、Edit、Glob、Grep、Skill と、Bash 7パターン（`codex exec` や `ls` など）を許可 | ある |
| 2. ループ | `claude -p` の中身そのまま | ある（借り物） |
| 3. 記憶 | タスク内は Claude Code のセッション。日をまたぐ分はプロジェクト記憶のメモ3件 | ある。ただし古い手順が積もる |
| 4. コンテキスト | 指示ファイルと、必要なときに読むスキル2つ。作業前の土台だけで 39,179 トークン | ある。ただし関係ないものも入る |
| 5. 作業場所 | 自分の Mac の、本物のリポジトリ | ない |
| 6. 目標と検証 | 目標は指示ファイルにある。終わったあとの検証はない | 指示だけ |
| 7. 権限と上限 | Bash はホワイトリスト、`git`・`curl`・`rm` は拒否。ファイルの書き込みは `acceptEdits` でリポジトリ全体に通る。1日3回までのリトライ | 半分 |
| 8. 観測 | 日ごとのログファイル。中身は最後の返答と終了コードだけ | ほぼない |
| 9. eval | なし | ない |

4番の 39,179 トークンは、このリポジトリで `claude -p` に「YES か NO だけ答えて」と頼んだときの `usage` です。記事を書き始める前に、それだけの量がもう入っている。中には、SessionStart フックが毎回差し込む「怠惰なシニア開発者として最短のコードを書け」というコーディング用の指示も含まれていました（モデルに「コンテキストに ponytail という語があるか」と聞いたら YES と返ってきた、という確かめ方なので、これは自己申告です）。記事を書く仕事に、コードを短くしろという人格が毎朝付いてくる。santi の「コンテキストは多ければいいわけではない」の、ささやかな実例です。

左の6つは、ほとんど Claude Code から借りています。ループもコンテキスト管理もスキルの段階的な読み込みも、私が作ったものではありません。自分で書いたのは、右の3つと5番に当たる部分です。そして穴はそこに集まっていました。

![夜の作業部屋。机のロボットの書き手が、毎朝9時の目覚まし時計とひもでつながった壁の指示書へ長い腕を伸ばしている。すみは踏み台に乗り、鉛筆が指示書に届く手前でロボットの手首をつかんでいる](/images/harness-nine-pieces-daily-drafts/02-robot-reaching-for-the-timetable.png)

---

## 私の見解

### 1. 一番重い穴は、指示が許可を出していた場所

指示ファイルの「禁止事項」には、こう書いてあります。

> - **git 操作（add / commit / push / branch 等）は一切行わない**。下書きファイルを置くだけで終了する
> - `articles/` `images/` `automation/` 以外のリポジトリ内ファイルを変更しない
> - 既存記事の編集・削除をしない

これに「`published: false` と `draft: true` の両方を必ず書く」を足した4つが、この仕組みの禁止事項です。丸ごと権限で止まっているのは、最初の git だけでした（`--disallowedTools "Bash(git:*)"`）。3つ目の「既存記事の編集・削除」は、`rm` の拒否で削除だけが止まっていて、編集は止まっていない。2つ目と4つ目は、指示に書いてあるだけです。

2つ目の行をよく読むと、`automation/` は「変更してよい場所」に入っています。そしてスクリプトはファイルの編集を `--permission-mode acceptEdits` で自動承認している。launchd の設定ファイル（plist）には「アプレットは daily-article.sh を呼ぶだけなので、スクリプト編集時の再コンパイルは不要」というコメントがあります。

つなげるとこうなります。無人のエージェントが Web の文章を読み、`automation/daily-article.sh` を書き換えられる。翌朝9時、launchd はその書き換えられたスクリプトを、Claude Code の権限の外でそのまま実行する。スクリプトの中には「無人実行 + Web由来のテキストを読む構成なので、Bash はプロンプトインジェクション経路になる。」で始まり、だからブラックリストではなくホワイトリストにする、と続くコメントまであります。Bash については santi の言うとおりに作ってあったのに、ファイルの書き込みは同じ目で見ていなかった。

穴はもう1つあります。`articles/` には、まだコミットしていない下書きが27本あります。`rm` は拒否されていますが、Write で上書きすることはできる。git に入っていないので、上書きされたら戻せません。守っているのは「既存記事の編集・削除をしない」という1行の指示だけです。

これは5番（作業場所）がないことのしわ寄せでもあります。santi は、サンドボックスは「1枚の層であって保証ではない」と書いています。私のスクリプトでは、ファイルの書き込みについてはその1枚すらなく、壁は7番の権限だけでした。その権限も、Bash にしか張られていなかった。

公開する前に塞ぎました。最初は `automation/` への書き込みを拒否する1行を足すつもりでした。使い捨てのリポジトリで試すと、拒否は効きました。ただ、それだと `.claude/settings.json` にフックを書かれる経路が残ります。Bash と同じ考え方で、書き込みも許可リストにしました。`--permission-mode acceptEdits` を外し、書き込みの許可を `Edit(/articles/**)` と `Edit(/images/**)` の2つだけにしています。Claude Code のドキュメントによると、`Edit(...)` のパス規則は Write にも効き、`Write(...)` と書いた規則は参照されません。

試しているうちに、もう1枚の穴が見つかりました。こちらのほうが大きかった。

プロジェクトの `.claude/settings.local.json` には、対話セッションで「今後も許可」を押して貯まった許可が95件ありました。その中に `Bash(python3 *)` と `Bash(rtk git *)` があります。`claude -p` はこのファイルも読むので、コマンドラインで渡した許可リストに、この95件がそのまま足されていました。実際に、スクリプトと同じ権限の指定で `python3 -c "print(7*6)"` を頼むと、42 が返ってきました。`rtk git status` も通りました。python3 が使えれば、どのファイルでも書けます。`rtk git` は、`Bash(git:*)` の拒否に引っかかりません。Bash の許可リストは、最初から効いていなかったことになります。

これは `--setting-sources user` で、プロジェクトとローカルの設定を読ませないようにして塞ぎました。ついでに、`Bash(codex exec:*)` の許可も外しました。この形だと `-s danger-full-access` のような引数も通ってしまうからです。代わりに、引数をプロンプト1つに限り、サンドボックスを `read-only` に固定した小さなスクリプト `automation/codex-image.sh` だけを許可しています。

直したあと、同じ指定で8通りの書き換えと実行を頼みました。`.claude/settings.json` への書き込み、python3、`codex exec` の直接呼び出し、`..` で許可外のパスに出る `cp`、`rtk git` は、どれも `permission_denials` に載りました。通ったのは `codex-image.sh` だけです。`automation/` への書き込みは、使い捨てのリポジトリのほうで拒否を確かめています。

止まるほうだけ確かめても足りませんでした。通るべき操作も同じ指定で試したら、`ls` と `cp` と `mkdir` が拒否されていました。`ls` は、別のフックが `rtk ls` に書き換えてから権限を判定するので、`Bash(ls:*)` に当たらない。`cp` と `mkdir` は、これまで acceptEdits の自動承認で通っていただけでした。そのまま翌朝を迎えていたら、挿絵が1枚も入らない下書きができていたはずです。`rtk ls` の形も許可し、`cp` はコピー先を `images/` に限ったパターンに書き直して、コピー元のフォルダを `--add-dir` で足しました。

残っているのは、`articles/` の下書きです。この記事を書いた時点で、まだコミットしていない下書きが27本ありました。書き込みの許可は `articles/` 全体に出しているので、既存の下書きの上書きは、今も指示の1行でしか止まっていません。下書きは、書かれたらすぐコミットするようにします。

### 2. 観測がないので、何が拒否されたのかを知る手段がない

ログには、`claude -p` の最後の返答と終了コードしか残りません。どのツールを呼んで、どれが権限で拒否されたのかは記録されていない。

実際、このプロジェクトの記憶メモには「非対話の実行では Playwright が権限を出せずに即失敗する」「Bash から `/tmp` へのリダイレクトが拒否される」といった発見が、日付付きで並んでいます。どれも毎朝のログから分かったのではなく、私が対話セッションで同じことを試して気づいたものです。

手元で `claude -p --output-format json` を走らせると、出力に `permission_denials` という欄がありました。ログをこの形式に変えるだけで、「何が止められたか」は毎朝残るようになります。santi が8番で挙げている「どのツールを、どの引数で呼び、何が返ったか」の全部ではありませんが、権限まわりの事故に限ればこれで足ります。

### 3. 長期記憶は、手順の地層になる

santi は、長期記憶の難しさを「古い情報が新しい実行を汚さないようにすること」と書いています。うちの記憶メモがまさにそうなっていました。

挿絵生成の手順を書いたメモは 7,661 バイトあり、9月7日から9月29日までの追記が日付付きで重なっています。9月13日に「この呼び方で動いた」と書いた形が、9月15日には「通らなくなっていた」と上書きされ、その下にまた別の形が足されている。新しいエントリほど下にあるので、上から読むと古い手順に先に出会います。

毎朝のエージェントはこのメモを読んで codex を呼びます。メモは記憶として働いていますが、整理されないまま積もると、santi の言う「汚染」の元にもなる。追記ではなく書き直すべき時期に来ていると思います。

### 4. eval は、20タスクでは足りないことが多い

9番は、まったくありません。指示ファイルを変えて記事が良くなったのか悪くなったのかを、私は感覚でしか判断してこなかった。

santi の「同じ20タスクを前後で走らせる」は正しい出発点です。ただ、数字の粗さは知っておいたほうがいい。Anthropic の claude-api スキルの eval ガイドは、変更の前後の差の誤差の目安を `1/sqrt(件数×回数)` としています。20件を1回ずつなら約 ±22 ポイントです。santi の例（文脈を広げたら難しいタスクは良くなり、簡単なタスクは悪くなった）のような、タスクの種類で効き方が分かれる変化は、20件をさらに分ければもっと粗くなる。このあたりは[前に書いた hillclimb の記事](/articles/claude-api-hillclimb-held-out)で詳しく数えています。

実は、タイトル付けだけを測る小さな eval を作りかけています。既存記事75本を2回ずつで、誤差は約 ±8 ポイント。入力セットを決めたところで止まっています。

![すみが、地層のように重なった付箋の崖を小さなシャベルで掘っている。上の層ほど古い日付で、下の層ほど新しい日付が書かれている](/images/harness-nine-pieces-daily-drafts/03-strata-of-sticky-notes.png)

---

## 1つだけ持ち帰るなら

自分のエージェントの指示ファイルから「〜しない」「〜禁止」と書いた行を全部抜き出して、1行ずつ「これを止めている権限の設定はどれか」を横に書いてみてください。私の場合、丸ごと書けたのは4行中1行でした。書けなかった行は、santi の言う「モデルが毎回正しく解釈してくれることに頼っている」行です。そして中には、指示の側が許可を出している行が混ざっているかもしれません。

![すみが机の上で、指示書の「しない」と書かれた行の横に1本ずつ鍵を置いていく。鍵が置かれた行は1つだけで、残りの行の横は空いている](/images/harness-nine-pieces-daily-drafts/04-keys-beside-the-rules.png)

---

## 出典と、確かめた方法

- santi (@santtiagom_), 「[Harness Engineering: explicado desde cero](https://x.com/santtiagom_/status/2098782814837543075)」, X Article, 2026年9月12日（スペイン語）
- Ryan Lopopolo, 「[Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)」, OpenAI, 2026年2月11日
- Vivek Trivedy, 「[The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)」, LangChain, 2026年3月10日

santi の記事は、`api.fxtwitter.com` から X Article の本文ブロックとコードブロック、図2枚を取得して読みました。表示回数などの数字はそのときの値です。

自分のスクリプトについては、`automation/daily-article.sh`、`automation/daily-article-prompt.md`、launchd の plist、プロジェクト記憶のメモを直接読んでいます。39,179 トークンと `permission_denials` 欄は、このリポジトリで `claude -p "…" --no-session-persistence --output-format json` を1回走らせたときの出力です（モデルは Opus 5.5）。未コミットの下書き27本は `git status` で数えました。権限を直したあとの確認は、スクリプトと同じ `--allowedTools`・`--disallowedTools`・`--setting-sources user` を付けた `claude -p`（モデルは Haiku 4.5）に8つの操作を頼み、`permission_denials` と実際のファイルを見ています。

### 検証できなかった点

- Anthropic の [harness-design-long-running-apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) と [effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) の中身（santi が引いている generator と evaluator の分担、進捗ファイルの話）
- Codex のサンドボックスの既定値（信頼済みのディレクトリでの値）と、ネットワークが既定で切られているかどうか
- santi が Codex のモデル名として書いている「Sol」
- SessionStart フックの指示が毎朝の実行に入っていることは、モデルの自己申告で確かめただけ。システムプロンプトそのものは見ていない
- 別のディレクトリで `--tools ""` を付けて同じ質問をしたら、土台は 76,852 トークンでした。なぜツールを外したほうが倍になるのかは分かっていません
- 毎朝の実行で、実際にどのツールがどれだけ拒否されてきたか。ログに残っていないので、過去の分は分かりません
