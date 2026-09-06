---
title: "Cursor が失ったのは5%のトラフィックではない — モデルAPIが「依存関係」ではなく「与信」だと分かった日"
emoji: "🔌"
type: "idea"
topics: ["ai", "llm", "openai", "cursor", "アーキテクチャ"]
published: false
draft: true
source: news
audience: engineer
---

## この記事について

2026年8月28日に OpenAI が公開した「[Our decision on Cursor following its acquisition by SpaceX](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/)」を扱います。SpaceX による Cursor 買収を理由に、OpenAI が Cursor へのモデル供給契約を打ち切るという発表です。停止予定日は2026年11月12日。

先に自分の位置を開示します。私は Cursor を SpaceX 傘下になってから触っていません。当事者の X 投稿（Cursor の Michael Truell 氏、OpenAI の Thibault Sottiaux 氏、Anthropic の Tom Brown 氏）も原文を直接は読めておらず、[the-decoder](https://the-decoder.com/openai-cuts-off-cursor-after-spacex-acquisition-citing-musks-history-of-breaking-contracts/) と [CNBC](https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html) の引用経由です。だからこの記事は当事者の証言ではなく、公開されている契約の形についての読み解きです。

先に結論だけ書くと、こうです。

> この件の本体は Musk と Altman の因縁ではありません。**モデル供給契約に change-of-control（支配権の変更）条項が入っていた**という一点です。Cursor は品質でもToS違反でもなく、**自社の株主が変わったこと**で供給を切られました。つまりモデルAPIは、置き換え可能な依存関係ではなく、相手から与えられた「与信」です。npm パッケージは fork できますが、与信は fork できません。そしてこれが、マルチモデル対応の意味を変えます。

第1部は事実確認で、短く済ませます。後半のほうが長いです。誰が誰を嫌っているかの話は他でたくさん読めるので。

---

## 第1部 — 何が起きたか

### 発表の中身

OpenAI の発表文はこう始まります。

> Today, we notified SpaceX that we intend to wind down our contract providing OpenAI models to Cursor, with a proposed shutoff date of November 12, 2026. To maximize the time that developers can retain access to our models through Cursor, we are giving the maximum notice provided by our contract.
>
> （本日、SpaceX に対し、Cursor へ OpenAI モデルを提供する契約を終了する意向を通知した。停止予定日は2026年11月12日。開発者が Cursor 経由で当社モデルを使える期間を最大化するため、契約上可能な最長の予告期間を取っている）

理由として挙げられているのは、SpaceX が利用規約の範囲内で技術を使うと確信できないこと。根拠として、Musk 氏による Twitter 買収後の契約破棄と、今年の法廷で本人が認めた xAI による OpenAI 利用規約違反（蒸留）が名指しされています。

そして本記事が注目するのはこの一文です。

> Our custom agreement with Cursor gives us a limited time window to cancel it after a change of control. As AI capabilities advance, we also have a new level of accountability to ensure our upcoming model, Astra, is being used in accordance with our terms.
>
> （Cursor との個別契約は、支配権の変更（change of control）後の限られた期間内であれば当社が契約を解除できると定めている。AI の能力が上がるにつれ、次期モデル Astra が当社の規約に沿って使われることを確かめる説明責任も、新しい水準になっている）

この直後に「契約解除を可能な限り遅い日付に設定しつつ、Cursor には今後のモデルを提供しない」という趣旨の一文が続きます。ここは取得できたテキストが途中で切れていて全文は確認できていませんが、意味は明確です。11月12日まで動くのは既存モデルだけで、Astra 以降は最初から対象外ということになります。

![床に長い契約書を広げ、虫眼鏡で一つの条項を覗き込むすみ。赤く丸をつけたその条項から橙色の電源コードが実体化して伸び、すみがもう片方の手でプラグを壁のコンセントから半分抜いている。書き込みは黒字「所有者が変わる」、橙字「ここが電源」、青字「性能は無関係」。足元に落ちた暦の紙には「通知まで14日」。巻紙の上に黒猫が座っている](/images/model-access-is-credit-not-dependency/01-change-of-control-clause.png)

SpaceX による Cursor の買収完了が8月14日、OpenAI の通知が8月28日。14日です。「限られた期間」がどれだけの長さなのかは公開されていないので、期限に追われた判断だったとまでは言えません。それでも、この規模の取引先を切る判断が2週間で下りている事実は残ります。条項が用意されていた側は、迷う時間を長く取らなくてよかった。

### 切られたのは誰なのか（ここは正確に書く）

見出しだけ読むと「OpenAI が開発者を切った」に見えますが、それは不正確です。Decoder が伝える Sottiaux 氏の説明によれば、Cursor 内で自分の OpenAI API キーを使う経路は残り、Cursor 向けの OpenAI 製 IDE 拡張も継続します。

止まるのは、Cursor がサーバー側でまとめて仕入れて再販していた分です。つまり OpenAI が拒否したのは、ユーザーでもコードでもなく、**取引相手という単位**でした。あなたの利用が禁止されたのではなく、あなたの仕入先が禁止された。この区別は後半で効いてきます。

### 5%という数字の読み方

Truell 氏は X で、OpenAI モデルは Cursor のAIトラフィックの約5%にすぎないと反応しました（Cursor 側の自己申告値で、第三者検証はされていません）。CNBC もこれを見出し級の事実として扱っています。

多くの記事はこれを「だから影響は小さい」と読んでいます。私は逆に読みます。5%はすでに分散が終わっていた証拠であって、影響が小さかった理由そのものです。同じ発表が2年前に出ていたら、この数字は5%ではなかったはずです。

同じ投稿の中で Truell 氏が使った表現のほうが重い、と思います。

> we've trusted their platform to be neutral infrastructure for our business
>
> （我々は彼らのプラットフォームを、自社事業にとっての中立なインフラだと信じてきた）

過去形です。中立インフラという前提が壊れた、と当事者が言っている。

---

## 第2部 — 私の見解

### 依存関係と与信は、切られ方が違う

ソフトウェアの依存関係管理は、ずっと「壊れる」ことを前提に組み立てられてきました。バージョンが上がって壊れる、メンテナが飽きて止まる、ライセンスが変わる。どれも痛いですが、共通点があります。最悪、自分でどうにかできる。ロックファイルで固める、fork する、vendoring する、最終手段として自分で書く。

モデルAPIにはこれが1つもありません。ロックできるのはバージョン名だけで、供給そのものはロックできない。fork は物理的に不可能です。そして今回はっきりしたのは、切られる引き金が自分のコードの外にあることでした。品質でも、利用量でも、支払いでもなく、株主構成です。

これは依存関係ではなく与信だ、というのが私の言い分です。銀行が融資を引き上げるときと構造が同じで、引き上げの判断材料に自分の技術は入っていない。

![細い縦線で左右に分かれた画面。左では手回し式の複製機に箱を1つ入れ、同じ箱が次々出てきて積み上がっていくのをすみが操作している。黒字「自分で複製できる」。右では同じすみが高い窓口カウンターの手前で空の箱を差し出しているが、カウンターの向こうから伸びた手だけが判子を引っ込めていく。黒字「相手が決める」、赤字「判子が引っ込む」、箱には青字「与信」。カウンターの上で黒猫が寝そべっている](/images/model-access-is-credit-not-dependency/02-fork-vs-credit.png)

「でもうちは OSS モデルをセルフホストできるから関係ない」と思うかもしれません。半分そのとおりです。ただ、ここで比較すべきなのは能力ではなく切り替えにかかる日数です。11月12日まで76日でした。76日で移行できる設計になっているかどうかが、この条項に対する唯一の防御です。

### マルチモデル対応は、性能のためではなく継続性のための冗長化だった

多くのチームがマルチモデル対応を持っています。ただ、なぜ持っているかを聞くと、たいてい返ってくるのは「タスクごとに安いモデルと賢いモデルを使い分けるため」「新モデルが出たときにA/Bするため」です。私も自分の設定をそう説明してきました。

今回の件はその説明を書き換えます。マルチモデル対応の本来の役割は**冗長化**であって、性能最適化はおまけです。そして厄介なのは、この2つが同じコードに見えて、要求水準がまったく違うことです。

A/B目的の切り替えは、両方の経路が同時に生きていることが前提です。冗長化目的の切り替えは、**片方が死んだ状態で残りだけで回る**ことが要件です。前者を作ったつもりで後者を持っている、と思い込むのが一番危ない。

具体的にどこで壊れるか。プロンプトをモデル固有にチューニングした瞬間です。thinking ブロックの扱い、ツール定義の書き方、system prompt の効き方、`temperature` が使えるかどうか。これらを1つのモデルに合わせて詰めるほど、切替レバーは繋がっているように見えて配線が1本しかない状態になります。レバーは倒せる。倒した先で品質が崩れる。

![背丈ほどある切替盤の裏扉を開けて中を覗き込むすみ。表のレバーには黒字「倒せる」。中では橙色のケーブルが1本だけ端子に繋がっていて橙字「性能A/B用」、もう一方の端子から出たケーブルの先はほつれたまま宙に垂れ、赤字「繋がっていない」。青字で「冗長化ではない」。垂れた線先を黒猫が前足で叩いている](/images/model-access-is-credit-not-dependency/03-switch-not-wired.png)

だから提案は1つだけです。マルチモデル対応を持っているチームは、**主力モデルを丸ごと落とした状態で1日回す**日を作ってください。カオスエンジニアリングの言い方をすれば、ゲームデーです。76日あれば余裕がありますが、ゲームデーを一度もやったことがないなら、76日は余裕ではありません。

### ToS遵守が、リクエスト単位からエンティティ単位のゲートになった

もう1つ、この発表で静かに変わったことがあります。

これまで、モデルプロバイダの利用規約は基本的にリクエスト単位で執行されるものでした。禁止された内容を送れば拒否される。繰り返せばアカウントが止まる。判定対象は行為です。

今回 OpenAI が使った理屈は違います。SpaceX が規約を守ると確信できないから供給しない。判定対象は行為ではなく、相手が誰かです。そして発表文が Astra を持ち出して「新しいレベルの説明責任」と書いているとおり、この判定は今後のモデルほど厳しくなる前提で書かれています。

安全性の理屈としては筋が通っていて、私はこの理屈自体には反対しません。ただ結果として何が起きるかというと、**モデル供給が信用調査を伴う商取引になる**。誰が株主か、過去に何を訴訟されたか、どの国にあるか。技術評価の外にある変数が、SLA の一部になります。

エンジニアリングの意思決定への影響でいうと、ここが一番大きいと思っています。AIコーディングツールを選ぶとき、私たちはベンチマークとコンテキスト長と価格を見ます。この3つはどれも、今回の件を1ミリも予測しません。

### これで3回目、15ヶ月

前例を並べると、単発の喧嘩には見えなくなります。

2025年6月、Anthropic が Windsurf の Claude アクセスを遮断。OpenAI による買収が報じられた直後でした。2025年8月、今度は Anthropic が OpenAI 自身の API アクセスを剥奪。GPT-5 前のベンチマークに Claude を使ったとされたためです。そして2026年8月、OpenAI が Cursor を切った。

3回とも、引き金は「相手が誰の側についたか」です。3回とも、切られた側のコードには問題がありませんでした。

Anthropic の Tom Brown 氏は今回、Cursor は Sonnet 3.5 の頃からの信頼できるパートナーであり、Claude のコンピュート容量を今後も拡大すると X で表明しています。信頼できるパートナーとしての立ち位置を取りにいった格好ですが、Windsurf を切ったのは同じ会社です。さらに CNBC の記事によれば、その Anthropic は現在 SpaceX と提携し、Musk 氏の会社からコンピュートを借りています。

![細長い掲示板の前で脚立に乗り、鉛筆をくわえたまま4枚目の白紙を留めているすみ。上から青字で「2025年6月」「2025年8月」「2026年8月」の通知書が3枚並び、どれにも赤くコードを切断されたプラグの絵が描かれている。その下の空欄に橙字で「4枚目の空欄」の矢印。掲示板の天辺から黒猫が見下ろしている](/images/model-access-is-credit-not-dependency/04-three-notices.png)

この座組みで「うちは切りません」という表明を、契約と同じ強度で受け取ることはできません。表明はいつでも撤回できて、条項は撤回に手続きが要ります。読むべきは前者ではなく後者です。

---

## まとめ — 1つだけ持ち帰るなら

この件を「Musk と Altman がまたやっている」として読むと、次のニュースを待つ話になります。「モデル供給に change-of-control 条項が入っていて、それが自分のインフラ仕様の一部だった」として読むと、今日やることが1つ決まります。

主力モデルを落とした状態で、チームが1日仕事を回せるか試す。回らなければ、それが今のあなたの与信枠です。

## 出典

- [Our decision on Cursor following its acquisition by SpaceX](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/) — OpenAI、2026年8月28日
- [OpenAI to end model access to Cursor after acquisition by SpaceX](https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html) — CNBC、2026年8月29日
- [OpenAI cuts off Cursor after SpaceX acquisition, citing Musk's history of breaking contracts](https://the-decoder.com/openai-cuts-off-cursor-after-spacex-acquisition-citing-musks-history-of-breaking-contracts/) — the-decoder、2026年8月28日（8月29日更新）
- Michael Truell 氏の X 投稿（[該当ポスト](https://x.com/mntruell/status/2093532254006063557)）、Tom Brown 氏の X 投稿（[該当ポスト](https://x.com/NotTomBrown/status/2093541294027280657)）、Thibault Sottiaux 氏の X 投稿 — いずれも原文未読、the-decoder / CNBC の引用経由
