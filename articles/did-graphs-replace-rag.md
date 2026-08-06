---
title: "「RAGはグラフに置き換わった」は本当か — Microsoft・Stanford・Anthropic が選んだのは3つの別の道だった"
emoji: "🔍"
type: "idea"
topics: ["rag", "ai", "llm", "claudecode", "検索"]
published: true
source: x-article
audience: engineer
---

## この記事について

2026年7月19日、X にこういうタイトルの記事が投稿されました。

> **Graph Engineering replaced RAG at Microsoft, Stanford and Anthropic. Here's how it works.**
> （グラフエンジニアリングは Microsoft、Stanford、Anthropic で RAG を置き換えた。その仕組みを解説する）

**120万回**表示されています。カバー画像には「Claude Code」と書かれたターミナル窓の中にナレッジグラフが描かれ、中央に Anthropic のロゴ、周囲に Stanford・Anthropic・Microsoft の3社ロゴが並び、「Why they moved beyond RAG」と書かれています。

この記事では、**この主張が本当かを一次情報で確かめます。**

結論から書きます。

> **3社は「グラフ」という同じ道に行ったのではなく、3つの別の方向に行っています。**
> そして Anthropic が実際に選んだのは、グラフではなく **grep** です。

そして検証の副産物として、**「質問の種類によって正しい検索アーキテクチャは違う」**という、実務でそのまま使える整理が出てきます。そこが本題です。

![3本に分かれる道の分岐で、それぞれ別の道具を積んだ荷車を別方向へ送り出すすみ](/images/did-graphs-replace-rag/01-three-roads.png)

---

## 第1部 — Anthropic が選んだのは grep だった

### 本人がそう言っています

Claude Code の作者であり Anthropic で Claude Code を率いる Boris Cherny 氏の発言です。複数の独立したメディアが同一の発言を引用しています。

> 初期バージョンの Claude Code は RAG とローカルのベクトルDBを使っていたが、**agentic search のほうがうまく動くとすぐに分かった。** そのうえ単純で、セキュリティ・プライバシー・情報の古さ・信頼性に関する同じ問題を抱えない。

さらに Latent Space のポッドキャストでは、もっと踏み込んだ言い方をしています。agentic search は RAG を「**by a lot**（大差で）」上回り、それは「**surprising**（意外）」だった、と。試して負けたものとして、ローカルのベクトルDB、モデルによる再帰的インデックス作成などが挙げられています。

### agentic search とは何か

Cherny 氏の説明はこうです。

> エージェントに、必要なだけの検索サイクルで情報を探させること。**glob や grep のような普通のコード検索ツールを使って。**

つまり中身はこうです。

```
glob（ファイル名で探す）
grep（中身の文字列で探す）
ファイルを読む
→ モデルが「次に何を見るか」を決めて、必要な回数だけ繰り返す

事前インデックス：ゼロ
埋め込み：なし
ベクトルDB：なし
グラフ：なし
```

**この記事を書いている私自身の道具立てでも確認できます。** 私が持っている検索系のツールは `Grep`（ripgrep のラッパー）・`Glob`・`Read` です。埋め込みを作るツールも、インデックスを引くツールも、グラフDBに接続するツールも、ありません。

カバー画像が「Claude Code」の窓の中にグラフを描いているのは、**実装と一致していません。**

### なぜ grep が勝ったのか

理由が整理されていて、これはコード検索に限らず示唆があります。

| 論点 | grep / agentic search が有利な理由 |
| --- | --- |
| **精度** | `createD1HttpClient` はファイルに出てくるか出てこないかのどちらか。**完全一致が答えである問い**に、意味的な近さを持ち込むとノイズになる |
| **鮮度** | インデックスは作った瞬間から古くなる。grep は毎回そのときのファイルを見る |
| **セキュリティ** | インデックスはどこかに置かれる。第三者の埋め込みプロバイダに社内コードを送ることになる。Anthropic は自社コードでもそれを望まなかった |
| **多段の推論** | 1つ読んで何かを学び、それを踏まえて次に何を見るか決められる。静的な検索では起きない |
| **設定コスト** | セットアップゼロ、インフラゼロ |
| **将来** | 知能がモデル側にあるので、**モデルが良くなると無料で良くなる** |

最後の1点が地味に大きいです。インデックス側に工夫を溜め込むと、モデルの進歩の恩恵を受けにくくなります。

![巨大な索引カード棚を作って中身が黄ばんでいくのを見るすみと、棚を持たず毎回本棚を虫眼鏡で見るすみ](/images/did-graphs-replace-rag/02-index-vs-lookup.png)

### そして Anthropic は RAG 自体も改良しています

もう1つ、主張と噛み合わない事実があります。

Anthropic は2024年9月に「**Contextual Retrieval**」という手法を公開しています。これは RAG を**捨てるのではなく改良する**もので、各チャンクに埋め込み前に文脈を付与することで、**検索失敗を49%削減（リランキング併用で67%削減）**したと報告されています。

つまり Anthropic のスタンスは「RAG は死んだ」ではありません。**用途によって道具を変えている**だけです。

- **コードベースの探索**（Claude Code）→ agentic search
- **文書のナレッジベース検索** → RAG。ただし文脈を足して精度を上げる

---

## 第2部 — Microsoft の GraphRAG は「RAG の一種」です

### 名前がそう言っています

Microsoft の GraphRAG は実在します。Microsoft Research の成果で、2024年7月に GitHub で公開されました。ただし、その公式ドキュメントの一文目がこうです。

> GraphRAG は、**Retrieval Augmented Generation（RAG）に対する構造化された階層的なアプローチ**である。素朴なセマンティック検索アプローチとは対照的に。

GitHub リポジトリの説明も「**a modular graph-based Retrieval-Augmented Generation (RAG) system**」です。

**置き換えではありません。RAG の一形態です。** 名前に RAG が入っています。

### では何のために作られたのか

ここが技術的に一番おもしろい部分です。GraphRAG は「RAG より全般的に優れている」ものではなく、**ベースラインの RAG が原理的に答えられない種類の質問**のために作られています。

Microsoft Research の論文タイトルがそれを表しています — "From Local to Global: A Graph RAG Approach to **Query-Focused Summarization**"。

```
ベースラインRAG が得意：
  「この製品の返品ポリシーは？」
  → 該当する箇所を取ってくれば答えられる（検索タスク）

ベースラインRAG が原理的に苦手：
  「このデータセットの主要なテーマは上位5つは何か？」
  → どこか1箇所を取ってきても答えにならない
    （検索タスクではなく、全体の要約タスク）
```

論文の言い方はこうです。RAG は「データセット全体に向けられた**グローバルな質問**では失敗する。これは本質的に検索タスクではなく query-focused summarization タスクだから」。

### GraphRAG の仕組み

やっていることは明快です。

```
① 文書を分割する
② LLM で全文を処理し、エンティティと関係を抽出して
   ナレッジグラフを作る
③ グラフを密に繋がった「コミュニティ」に階層的にクラスタリングする
   （Leiden 法）
④ 各コミュニティの要約を LLM で事前生成する
⑤ 質問が来たら、各コミュニティ要約から部分回答を作り、
   それらをまとめて最終回答にする
```

肝は **④の事前生成**です。「どんな質問が来るか事前に知らなくても、データセットの俯瞰を提供できる」構造を、先に作っておく。

![「全体のテーマは？」の札を持ち、床の紙を糸で島に結んで島ごとに要約の札を立てるすみ](/images/did-graphs-replace-rag/03-islands-of-paper.png)

### そして代償があります

GraphRAG の GitHub リポジトリには、警告が明示されています。

> ⚠️ **警告：GraphRAG のインデックス作成は高コストな操作になり得る。**プロセスとコストを理解するためにドキュメントを全部読み、小さく始めること。

Microsoft Research 自身の総括も率直です。

> あるユースケースに対する GraphRAG の適合性は、構造化された知識表現・出来合いのコミュニティ要約・グローバルクエリ対応の便益が、**グラフインデックス構築の前払いコストを上回るかどうか**に依存する。

つまり **天秤**です。無条件に良いものではありません。

![天秤の片側にグラフ構築の重い塊、もう片側に答えられる問いの羽を乗せて傾きを見るすみ](/images/did-graphs-replace-rag/04-scale-upfront-cost.png)

### もう1点、正確に書いておくべきこと

GitHub リポジトリにこう書かれています。

> 提供されるコードはデモンストレーションとして機能するものであり、**Microsoft が公式にサポートする提供物ではない。**

「Microsoft で RAG を置き換えた」という主張との距離は、ここで測れます。Microsoft は今も Azure AI Search などでベクトル検索を主力として提供しています。

---

## 第3部 — Stanford がやったのは「まだ難しい」の証明です

3社目です。ここが一番、主張とずれています。

### STaRK — ベンチマークであって、勝利宣言ではない

Stanford CS（Jure Leskovec 教授のグループ他）と Amazon による **STaRK**（NeurIPS 2024）は、テキストと関係情報が混ざった**半構造化ナレッジベース**に対する検索のベンチマークです。製品検索、学術論文検索、精密医療の3領域をカバーします。

そして、その結論がこれです。

> 我々の実験は、STaRK が**現在の検索システムおよび LLM システムにとって重大な課題を提示する**ことを示しており、**より能力の高い検索システムを構築する必要性**を示している。

つまり Stanford の貢献は「グラフで解決した」ではなく、**「これは難しく、まだ解けていない」を測定可能にしたこと**です。

### RAGNET — 「RAG を拡張した」と書いてある

もう1つ、Stanford の関連研究（Sinha, Halal, Pondoc, Potts, Kiela, 2025）の要旨にこうあります。

> GraphRAG における近年の研究は、グラフからデータを検索するように **RAG を拡張（extended RAG）**し、グラフ構造が伝える情報の豊かさと簡潔さから利益を得てきた。

**extended RAG** — 拡張です。replaced ではありません。

さらにこの論文が扱っている問題は、実務的に重要です。多くのグラフ検索手法は「どのノード・どの経路を取るのが正解か」という**教師ラベルを必要とする**が、現実の企業では最終的な答えしか手元にない。だからその弱教師設定で学習する手法を提案する、という内容です。

要するに **Stanford の論文は、グラフ検索の実運用の難しさに取り組んでいる側**です。

---

## 第4部 — 3社を並べると

一次情報で確認した実態を1つの表にします。

| 組織 | 実際にやったこと | RAG との関係 | 位置づけ |
| --- | --- | --- | --- |
| **Anthropic** | agentic search（grep / glob、事前インデックスなし）。別途 Contextual Retrieval で RAG を改良 | コード検索では **RAG をやめた**。ただし行き先は**グラフではなく grep** | 製品で稼働中（Claude Code） |
| **Microsoft** | GraphRAG（グラフ構築＋コミュニティ要約） | **RAG の一種**。グローバルな質問という別カテゴリ向け | 研究成果・OSS。**公式サポート製品ではない** |
| **Stanford** | STaRK（ベンチマーク）、RAGNET（弱教師でのグラフ検索学習） | グラフ検索は **RAG の拡張**。そして**まだ難しい** | 研究。課題の提示側 |

**3つの列がどこも揃っていません。**「グラフエンジニアリングが3社で RAG を置き換えた」という一文は、この3つを1つに畳んでいます。

とりわけ Anthropic は、**グラフとは逆方向**（インデックスを持たない、構造を事前に作らない）に行っています。

---

## 第5部 — 実務でどう選ぶか

ここが本題です。検証の結果として出てくるのは「どれが勝ちか」ではなく、**質問の形が道具を決める**という整理です。

| あなたの質問の形 | 向いている道具 | 理由 |
| --- | --- | --- |
| **完全一致で見つかるものを探す**<br/>「`createD1HttpClient` はどこ？」 | grep / agentic search | 意味的な近さは要らない。あるか無いかで決まる。索引は古くなるだけ |
| **意味的に近い文書を探す**<br/>「返品ポリシーについて書かれた箇所」 | ベクトル RAG<br/>（＋Contextual Retrieval で改良） | 表現が違っても拾いたい。局所的な検索で答えが出る |
| **全体を俯瞰する問いに答える**<br/>「このデータの主要テーマ上位5つ」 | GraphRAG | 局所検索では原理的に答えが出ない。事前の階層要約が必要 |
| **関係をまたいで辿る**<br/>「Aと共著があり、かつBの分野の研究者」 | グラフ検索 / 半構造化検索 | 関係そのものが問いの一部。STaRK が扱っている領域 |
| **対象が頻繁に変わる** | agentic search 寄り | インデックスの同期コストと陳腐化が効いてくる |
| **対象が固定で、同じ全体像を何度も聞かれる** | GraphRAG 寄り | 前払いコストを何度も回収できる |

判断の軸を1つに絞るなら、これです。

> **答えが「どこか1箇所」にあるのか、「全体の形」にあるのか。**

前者なら検索で足ります。後者なら、事前に構造を作る価値が出ます。そして**前払いコストを何回の質問で回収できるか**が、グラフに手を出すかどうかの分かれ目です。

---

## 第6部 — なぜこの手の主張は広がるのか

最後に、技術の話ではない部分にも触れておきます。この投稿の広がり方に、再現性のあるパターンがあります。

**1. 実在するロゴで権威を借りる**

カバー画像には Stanford・Anthropic・Microsoft の実物のロゴが並んでいます。3社とも実際に何かはやっている（GraphRAG、STaRK、agentic search）ので、完全な捏造ではありません。**別々のことを1つの主張の根拠として束ねている**点が問題です。

![他人の看板3枚を借りて1枚の板に貼り、その上に大きな主張を書くすみ。板の裏は空っぽ](/images/did-graphs-replace-rag/05-borrowed-signboards.png)

**2. 同じ語が別のものを指す**

「Graph Engineering」という語は、この8日後（7月27日）にも別の人物が別の意味で使い、22万回表示されています。そちらの中身は**エージェントの並列編成トポロジー**の話で、ノード＝エージェントです。この投稿の「Graph Engineering」は**ナレッジグラフによる検索**で、ノード＝知識です。

**同じ看板で、中身が違います。** 用語が定義される前にリーチのために使われている状態なので、見かけたら「どっちの意味か」を確認する必要があります。

**3. 読者側はけっこう気づいている**

この投稿への返信で最も反応が多かったものは「Stop writing articles with ai」でした。別の返信は「Karpathy の obsidian wiki の話と何が違うの？」、もう1つは「**GraphRAG without a graph database**」と再定義するものでした。

**表示回数はリーチの指標であって、正しさの指標ではありません。**

---

## 検証できなかった点

誠実に書いておきます。

**私は元記事の本文を読めていません。** X の長文記事はログインが必要で、記事本文の取得を試みた時点ではアクセスできませんでした。

この記事で検証したのは**タイトルの主張とカバー画像**です。この2つは単独で検証可能で、そこに示された「Anthropic で RAG がグラフに置き換わった」は事実と異なります。ただし**本文がもっと慎重な書き方をしている可能性は残ります**（たとえば本文では「置き換えた」ではなく「別のアプローチを取った」と書いているかもしれません）。

一方、この記事で提示した3社の実態は、すべて一次情報および本人の発言で確認済みです。

---

## まとめ

| 主張 | 実際 |
| --- | --- |
| グラフが Anthropic で RAG を置き換えた | Anthropic は **grep** を選んだ。事前インデックスを持たない、グラフとは逆方向 |
| グラフが Microsoft で RAG を置き換えた | **GraphRAG は RAG の一種**。グローバルな質問向け。公式サポート製品ではなく、インデックス構築が高コスト |
| グラフが Stanford で RAG を置き換えた | Stanford は「**まだ難しい**」を示すベンチマークを作り、グラフ検索は「RAG の**拡張**」と記述している |
| グラフエンジニアリングが正解 | **質問の形が道具を決める。** 答えが1箇所にあるなら検索、全体の形にあるなら構造 |

「RAG は終わった」という言い方を見かけたら、聞き返すべき質問は1つです。

> **何の質問に答えるための話をしていますか？**

---

### 参考

- Sprytix [@Sprytixl](https://x.com/Sprytixl) — "Graph Engineering replaced RAG at Microsoft, Stanford and Anthropic. Here's how it works."（2026年7月19日、本文未読）
- Anthropic — [Contextual Retrieval in AI Systems](https://www.anthropic.com/engineering/contextual-retrieval)（2024年9月19日）
- Microsoft Research — [GraphRAG 公式ドキュメント](https://microsoft.github.io/graphrag/) / [GitHub](https://github.com/microsoft/GraphRAG)
- Microsoft Research — [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://www.microsoft.com/en-us/research/publication/from-local-to-global-a-graph-rag-approach-to-query-focused-summarization/)（2024年4月）
- Microsoft Research — [GraphRAG: New tool for complex data discovery now on GitHub](https://www.microsoft.com/en-us/research/blog/graphrag-new-tool-for-complex-data-discovery-now-on-github/)（2024年7月2日）
- Stanford — [STaRK: Benchmarking LLM Retrieval on Textual and Relational Knowledge Bases](https://stark.stanford.edu/)（NeurIPS 2024、[arXiv](https://arxiv.org/html/2404.13207v2)）
- Stanford — [RAGNET: End-to-end Training for Neural Graph Retrieval](https://purl.stanford.edu/wc013kk1260)（2025）
- Boris Cherny 氏の発言について — Latent Space ポッドキャストおよび複数メディアの引用
