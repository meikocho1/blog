---
title: "Sam Altman の13項目を仕分けた"
emoji: "🧭"
type: "idea"
topics: ["ai", "キャリア", "llm", "エージェント", "考察"]
published: true
published_at: "2026-10-26"
source: blog-essay
audience: engineer
---

Sam Altman が2019年1月に自分のブログに出した「How to Be Successful」を読み直しました。Y Combinator の代表だった頃、何千人もの創業者を見てきた経験から、桁外れの成功に必要なことを13項目にまとめた文章です。

7年前の文章で、書かれたのは ChatGPT より前です。当時の Altman が想定していた「てこ」の中に、AI はまだ入っていません。

なので、13項目を2026年の目で読んで、「今のほうが強くなったもの」「そのままのもの」「弱くなったもの」に仕分けてみました。

先に結論だけ書くと、こうです。

> 13項目のうち一番揺らいだのは「7. Work hard」ではなく、「1. Compound yourself」の中にある一文、「2年目の人が20年目の人と同じくらい働ける仕事は避けろ」だと思う。AI はまさにこの差を縮める方向に働いている。逆に、AI で価値が上がったのは「6. Focus」と「4. Get good at "sales"」の書く力で、どちらも「何をやらせるか」を決める側の能力だった。

---

## 13項目の中身

項目名だけ並べます。原文の見出しそのままです。

1. Compound yourself
2. Have almost too much self-belief
3. Learn to think independently
4. Get good at "sales"
5. Make it easy to take risks
6. Focus
7. Work hard
8. Be bold
9. Be willful
10. Be hard to compete with
11. Build a network
12. You get rich by owning things
13. Be internally driven

Altman は冒頭で、これはある程度の成功（特権か努力で）にすでに届いている人が、それを桁外れの成功に変えるための話だと断っています。脚注では、自分が今の場所にいるのは生まれの運が大きいとも書いています。前提の置き方は正直な文章です。

内容の要約は他でもたくさん読めるので、ここからは仕分けの話だけをします。

![](/images/altman-how-to-be-successful-sorted/01-thirteen-cards-three-bins.png)

## 揺らいだ一文：2年目と20年目

一番引っかかったのは、1番目の項目にあるこの段落です。

> You don't want to be in a career where people who have been doing it for two years can be as effective as people who have been doing it for twenty—your rate of learning should always be high.
>
> （2年やった人が20年やった人と同じくらい成果を出せるようなキャリアにいたくはない。学ぶ速さは常に高くあるべきだ。）

2019年の時点では、ソフトウェアエンジニアはこの条件を満たす職業の代表でした。20年目の人は2年目の人より明らかに強かった。設計の勘、障害の読み方、どこに地雷があるかの記憶。経験がそのまま複利になる仕事でした。

2026年の今、この前提はかなり崩れていると私は見ています。2年目の人が Claude Code や Codex を使うと、20年目の人が書いていたような量と質のコードが出てきます。全部ではありません。ただ、「書く」という部分に限れば、2年と20年の差は2019年よりずっと小さい。

Altman の物差しをそのまま当てると、ソフトウェアエンジニアは「避けるべきキャリア」の側に寄ってきていることになります。

と書くと「いや、20年目の人は AI の出力の良し悪しを見分けられる」と言われそうです。それはそのとおりで、私もそこに差は残ると思います。ただ、それは「コードを書く経験」ではなく「出力を検証する経験」の複利です。同じ20年でも、何に複利が乗っていたかで、AI 以後の価値が分かれる。Altman の文章はそこまで細かく分けていませんが、今読むなら分けて読む必要があります。

![](/images/altman-how-to-be-successful-sorted/02-two-years-and-twenty.png)

## 強くなった：Focus と書く力

逆に、AI で価値が上がったと思うのは2つです。

1つ目は「6. Focus」です。

> It is much more important to work on the right thing than it is to work many hours.
>
> （何時間働くかより、正しいことに取り組むことのほうがずっと重要だ。）

エージェントに作業をさせると、手を動かす時間はほぼタダになります。残るのは「何をやらせるか」を決める時間です。このブログも下書きは Claude Code に書かせていますが、どの題材を選ぶかだけは、今も人が決めています。間違ったものを選べば、エージェントは間違ったものを速く大量に作るだけです。Altman の Focus は、AI 以前より今のほうが文字どおりの意味で当てはまります。

![](/images/altman-how-to-be-successful-sorted/03-tiller-on-the-machine.png)

2つ目は「4. Get good at "sales"」の中の、書く力の段落です。

> Getting good at communication—particularly written communication—is an investment worth making. My best advice for communicating clearly is to first make sure your thinking is clear and then use plain, concise language.
>
> （コミュニケーション、特に書くことがうまくなるのは、やる価値のある投資だ。明確に伝えるための一番の助言は、まず自分の考えを明確にし、それから平易で簡潔な言葉を使うことだ。）

Altman はこれを、顧客や投資家や採用候補を説得するための力として書いています。今はそこに、エージェントへの指示が加わりました。考えが明確でないまま書いた指示からは、明確でない成果物が返ってきます。読む相手が人から AI に増えただけで、求められる力は同じです。

## 弱くなった：Work hard の「時間」の部分

7番目の「Work hard」は、今読むと半分だけ古くなっています。

> You can get to about the 90th percentile in your field by working either smart or hard, which is still a great accomplishment. But getting to the 99th percentile requires both
>
> （賢く働くか、たくさん働くかのどちらかで、その分野の上位10%くらいには行ける。それでも大したものだ。だが上位1%に行くには両方が要る。）

「hard」が労働時間を指すなら、エージェントが並列で何本も作業を回せる今、人間の時間の価値は相対的に下がっています。一方で、Altman が同じ項目で書いている「work stamina」、つまり長く続ける力のほうは古くなっていません。エージェントの出力を毎日見て、直して、また回す作業は、短距離走ではなく持久走だからです。

なので私の読みでは、Work hard は「長時間」から「長期間」に意味がずれた、です。

![](/images/altman-how-to-be-successful-sorted/04-long-road-not-long-hours.png)

## そのまま：10番と12番

残りの多くは、AI があってもなくても同じように読めます。中でも、AI の時代に向けて書かれたのかと思うほど当てはまるのが10番です。

> If what you do can be done by someone else, it eventually will be, and for less money.
>
> （あなたのやっていることが他の誰かにできるなら、いずれそうなる。しかも、もっと安く。）

2019年の「someone else」は、他の人間か、オフショアの会社でした。今はそこにモデルが入ります。そして、モデルは人間よりずっと安い。この一文は、AI 以後のほうがずっと速く現実になります。

12番の「You get rich by owning things」も同じ向きです。Altman は「Time only scales linearly」と書いています。時間を売る働き方が線形なのは昔からですが、その時間の単価自体を AI が押し下げるので、所有の側に回る理由は強くなりました。

## 1つだけ持ち帰るなら

13項目を仕分けて分かったのは、Altman の文章の中で古くなったのは「勤勉さ」の話ではなく、「経験年数がそのまま価値になる」という前提だったということです。

2年目と20年目の差がどこに残るのかを、自分の仕事について一度書き出してみる。差が「書いた量」にしかないなら、その仕事は Altman の物差しでいう避けるべきキャリアに近づいています。差が「何を選ぶか」「何を正しいと判定するか」にあるなら、その経験はまだ複利で効いています。
