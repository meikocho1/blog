---
title: "Spotifyのトークン90%削減を、コミットされたベンチマークで確かめた"
emoji: "🚰"
type: "idea"
topics: ["ai", "llm", "claudecode", "エージェント", "コンテキストエンジニアリング"]
published: true
published_at: "2026-09-10"
source: blog-essay
audience: engineer
---

先に結論だけ書くと、こうです。

> ベンチマークはリポジトリにコミットされています。中を見ると、4シナリオのうち1つは **92行** のファイル2本を読むテストでした。このプラグインが門を閉じるのは **350行** から。つまり**自分のしきい値の下を通る**ケースが、90%という平均に入っています。仕組みは良くできています。弱いのは数字の出し方のほうです。

## この記事について

元記事は Spotify Engineering の [Portal by Spotify cut my Claude Code token usage by 90%](https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90)（2026年9月3日）。[Hacker News で277ポイント、176コメント](https://news.ycombinator.com/item?id=49571465)。

先に3つ、伝わり方を戻しておきます。

**書いたのはエンジニアではありません。** 著者は Dimitri Mazmanov、肩書きは Principal Product Manager です。私が読んだ英語の解説2本はどちらも「a Spotify engineer」と書いていましたが、記事の署名はそうなっていません。原題も "cut **my** Claude Code token usage" と一人称です。会社のアーキテクチャの発表ではなく、**PMが自分の使い方を直した記録**が、エンジニアリングブログに載っている、という形です。

**「Spotifyのエージェント・アーキテクチャ」でもありません。** これは Portal という社内基盤の上に載せた Claude Code プラグイン1本（`shunt`）の話です。Honk や Fleet Management とは別の記事系列です。

**正直な開示。** 私は Portal を持っていないので、プラグインを動かしていません。以下はすべて元記事と、公開リポジトリ [spotify/portal-ai-plugins](https://github.com/spotify/portal-ai-plugins) に**コミットされているファイル**を読んだ結果です。ベンチマークを再実行してはいません。

## 何をするものか、先に3層だけ

構造は素直です。

| 層 | 中身 | 性格 |
| --- | --- | --- |
| Hooks | `PreToolUse` で `Read` を監視。既定350行超で**ブロック** | 強制 |
| Scripts | `bulk-read` / `code-write`。Portal CLI 経由で安いモデルを呼ぶ | 配管 |
| Skills | いつどう呼ぶかを Claude に教える | 助言 |

安いモデル側は Gemini 2.5 Flash、temperature 0.2、`bulk-reader`（読む）と `code-writer`（書く）の2つ。大きなファイルは worker が読んで、Claude には**要約だけ**が返る。原文の表現を借りると、本体は worker に行って **Claude のコンテキストには一度も入らない**。

著者は効かない場所も自分で3つ挙げています。編集は委譲できない（要約に行番号が乗らない）、推論は委譲できない（worker はスレッドセーフのバグを見逃した）、レイテンシは1回10〜30秒で Portal 側の上限が30秒。ここは誠実です。

## 自分のしきい値の下を通ったシナリオが、平均に入っている

元記事にはベンチマークの表がありません。あるのはこの一文だけです。

> Tested against a Java monorepo across four scenarios ... Mean bulk-read savings were around a whopping 90%.

表がないなら、リポジトリを見ればいい。`plugins/shunt/evals/benchmarks.json` に4シナリオの定義がそのまま入っています。

| # | 名前 | 種類 | 読むファイル | 行数 |
| --- | --- | --- | --- | --- |
| 1 | single-large-file | bulk-read | websocket-handler.ts | 603 |
| 2 | multi-file-cross-read | bulk-read | 上記＋2本 | 695 |
| 3 | source-plus-test | bulk-read | user-service.ts + order-service.test.ts | **92** |
| 4 | code-generation | code-write | — | — |

まず4シナリオのうち **bulk-read は3つ**です。4つめは code-write で、これについては元記事自身が「トークンで測るのが難しい」と書いています。だから「4シナリオで平均90%」ではなく、**3シナリオの平均**です。

問題は3番です。36行と56行、合わせて92行。このプラグインが `Read` をブロックし始めるのは既定で350行から。**92行のファイルを読んでも、hook は何も起きません。**

著者自身がその理由を書いています。

> The line threshold exists for this reason, below it the overhead of delegation exceeds the savings.

しきい値より下では、委譲のオーバーヘッドが節約を上回る。著者のこのルールに従えば、シナリオ3は**そもそも委譲してはいけないケース**です。それが「委譲するとどれだけ得か」の平均に入っています。

念のためテスト側も見ました。`hook-evals.json` の17ケースの1番目の名前は `small-file` です。**小さいファイルは通す、とプラグイン自身がテストで保証している。** その通したはずのサイズが、ベンチマークでは節約実績として数えられています。

![92行の紙束が350行と書かれた門の下をくぐっていく。門は開いたまま、閂は上がりきっている](/images/one-scenario-below-its-own-gate/01-under-its-own-gate.png)

## 18倍ちがう2つを、パーセントで平均する

シナリオ1と3の大きさを見ておきます。リポジトリの `token_estimate` は `chars / 4` なので、その定義で揃えます。

| | 文字数 | 概算トークン |
| --- | --- | --- |
| シナリオ1（603行） | 48,024 | 約12,006 |
| シナリオ3（92行） | 2,720 | 約680 |

**約18倍**ちがいます。仮に両方きれいに90%削れたとして、1で浮くのは約11,000トークン、3で浮くのは約600トークン。パーセントで平均すると、この2つが**同じ重み**で並びます。

90%という数字は、603行のファイルでは本当だと思います。そこが一番効く場所だからです。平均という操作が、その一番効く場所の話を「どこでも90%」に薄めている。私が引っかかったのはそこだけで、削減そのものを疑ってはいません。

![大小2つの分銅にどちらも「90%」の札。天秤は釣り合っている](/images/one-scenario-below-its-own-gate/02-two-weights-same-label.png)

## Javaと書いてあるが、リポジトリに .java は1つもない

元記事は "Tested against a **Java** monorepo" と書いています。ところがコミットされているフィクスチャは `websocket-handler.ts`、`user-service.ts`、`order-service.test.ts` の3本で、全部 TypeScript。リポジトリ全体を検索しても `.java` は**1つもありません**。

これは寛容に読むべきだと思います。Spotify が社内モノレポを公開できるわけがないので、**公開用に作り直した再現セット**と考えるのが自然です。悪意のある話ではない。

ただ、そう読むと結論はこうなります。**リポジトリで再現できるベンチマークは、見出しの数字の出どころではない。** そして再現できるほうの中に、自分のしきい値を下回るケースが1つ入っている。

なお再現の道はちゃんと用意されています。`evals/run.sh --benchmark` で benchmarks.json を回せます（portal-cli の認証が要ります）。README が言う51テストは hook 17＋bash hook 17＋transport 17 で、ベンチマークはその外側の別フラグです。テストとベンチマークを分けてあるのは、むしろ真っ当な設計です。

## v1 も router だった。変わったのは執行力

ここが記事の一番おもしろい部分だと思っています。元記事によれば、**最初のバージョンは CLAUDE.md に書いたルーティングルールでした**。

> It sort of worked: Claude would read the instructions and self-route to Portal. But it had problems. The rules were advisory, not enforced. Claude could ignore them.

「まあまあ効いた」。つまり v1 の時点で router はもう存在していた。v2 で変わったのは**ルーティングの賢さではなく、無視できるかどうか**です。お願いが、閂になった。

これは4日前に読んだ Anthropic 公式の話と同じ場所を指しています（[私の記事](https://meikocho1.github.io/blog/claude-official-cost-down)）。あちらは「指示は減価する。長いセッションでは効果が落ちる」と測っていました。こちらは同じ問題に対して、**指示をやめて hook にした**という実装側の答えです。同じ週に、片方が測り、片方が直している。

![CLAUDE.mdと書かれた紙の貼り紙の横に、実際に落ちてくる門。紙のほうはめくれている](/images/one-scenario-below-its-own-gate/03-a-note-and-a-latch.png)

## 「これ subagent では」への答えが、7月の issue にある

HN のコメントで一番多かった反応がこれです。

> This does seem to just be a subagents implementation.

> Pretty sure claude code already delegates reading a large codebase to haiku subagents.

私も最初そう思いました。ただ同じスレッドに、確認できる反証がありました。`anthropics/claude-code` の [issue #72940](https://github.com/anthropics/claude-code/issues/72940)（2026年7月1日、クローズ済み）のタイトルはこうです。

> [DOCS] Sub-agents page still says the built-in Explore agent uses Haiku; v2.1.198 has it inherit the main model

**組み込みの Explore サブエージェントは、もう Haiku ではありません。** v2.1.198 から親モデルを継承します。ドキュメントだけが Haiku のままだった、という報告です。

つまり「Claude Code はもう安いモデルに委譲している」は、**7月の時点で成り立たなくなっていた**。Opus で走らせていれば Explore も Opus で走る。読むだけの仕事に、フロンティアモデルの値段を払っている。shunt が埋めているのはこの穴です。

そしてこれは、HN の別のコメントが書いていたとおり、Explore エージェントを安いモデルに固定するだけでも埋まります。プラグイン1本を入れるより先に、そこを見たほうがいい人は多いはずです。

## 私の見解

この記事の価値は 90% ではなく、**「読む」と「決める」を別々の予算にした**ことだと思っています。

これまでコンテキスト削減の話は、だいたい「入れる量を減らす」でした。Uber が MCP ツール1,000個をコンテキストから追い出した話も、`/compact` の話もそうです。今回のは違って、**量は減らしていません**。48,024文字はどこかで読まれています。読んだ場所が変わっただけです。高い机の上から、安い机の上に移った。

だから効果は「どれだけ減らしたか」ではなく、**高い机の上に何を残したか**で測るべきだと思います。元記事が「編集は委譲できない、推論は委譲できない」と早めに線を引いているのは、たぶん著者が同じことを考えたからです。あの3つの制限は失敗談ではなく、**高い机に残すものの定義**です。

![窓口の向こうへ大きな紙束を押し込み、戻ってくるのは小さなカード1枚](/images/one-scenario-below-its-own-gate/04-a-bale-in-a-card-out.png)

もう1つ。momo5502 の監査を思い出しました（[私の記事](https://meikocho1.github.io/blog/subagent-isolation-costs-duplication)）。あちらは、サブエージェントが隔離されているせいで同じファイルを何度も読み直し、結局トークンを損した、という2GBのログの分析でした。今回の元記事の「編集は委譲できない。編集が要るなら該当箇所を自分で読み直す」は、**まさにその重複読みの請求書**です。著者はそれを認めて、targeted read を通す穴を hook に空けている。同じ問題に、片方は「切った」、片方は「穴を空けた」。

## 1つだけ持ち帰るなら

**パーセントで報告された節約を見たら、分母の絶対量を聞いてください。** 90%が3件の平均で、そのうち1件が680トークンの話なら、その1件はゼロと変わりません。そして今回それが分かったのは、著者が benchmarks.json をリポジトリに置いてくれていたからです。数字を疑えたこと自体が、この記事の誠実さの証拠でもあります。

## 出典

- Dimitri Mazmanov（Principal Product Manager）, [Portal by Spotify cut my Claude Code token usage by 90%](https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90), Spotify Engineering、2026年9月3日
- [spotify/portal-ai-plugins](https://github.com/spotify/portal-ai-plugins) — `plugins/shunt/` の README、`evals/benchmarks.json`、`evals/hook-evals.json`、`evals/run.sh`、`evals/fixtures/`
- [Hacker News のスレッド](https://news.ycombinator.com/item?id=49571465)（277ポイント / 176コメント、2026年9月4日）
- [anthropics/claude-code issue #72940](https://github.com/anthropics/claude-code/issues/72940)（2026年7月1日）

行数と文字数は、上記リポジトリの `main` ブランチのファイルを2026年9月10日に取得して数えたものです。トークン概算はリポジトリ自身の定義（`chars / 4`）に合わせました。実測のトークン数ではありません。元記事が挙げている「開発者1人あたり月$200〜$500」「2028年にはAIコーディング費用が平均年収を超える」には出典が示されていないので、この記事では使っていません。
