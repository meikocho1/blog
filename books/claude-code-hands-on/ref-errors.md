---
title: "付録B エラー文の逆引き全一覧"
free: true
---

画面に出た英語のエラー文から引ける一覧です。

:::message
**エラー文を覚える必要はありません。** 次の一文で足ります。

```
このエラーが出ました。原因と対処を日本語で説明して、
危険な操作を含まない範囲で直してください。

（エラー文を全部そのまま貼る）
```

「危険な操作を含まない範囲で」を付けるのがコツです。これがないと、手っ取り早い削除を提案されることがあります。
:::

:::message
**この章は「引く」ためのものです。頭から読む必要はありません。**

記号の意味: 🟢 見るだけ（安全） / 🟡 変わるが戻せる / 🔴 止めて確認 / 📖 用語
:::

---

## 早見表

| | 名前 | 一言でいうと |
| --- | --- | --- |
| 📖 | `command not found` | そんな名前の命令は見つからない、という意味 |
| 📖 | `No such file or directory` | 指定した名前のファイルやフォルダが見つからない |
| 📖 | `Permission denied` | 許可がないのでそのファイルを読み書きできない |
| 📖 | `Operation not permitted` | macOSの保護機能そのものに操作を止められた |
| 📖 | `Is a directory` | ファイルだと思っていた相手がフォルダだった |
| 📖 | `Killed（exit code 137）` | メモリが足りず、OSが処理を強制終了させた |
| 📖 | `No space left on device / ENOSPC` | ディスクの空き容量がなくなり保存できない |
| 📖 | `EADDRINUSE / Address already in use` | そのポート番号はすでに他のプログラムが使用中 |
| 📖 | `EACCES` | アクセス権が足りずファイルを作れない・触れない |
| 📖 | `EPERM` | そもそもその操作をする権限が与えられていない |
| 📖 | `ENOENT` | 指定したパスにファイルやフォルダが存在しない |
| 📖 | `ECONNREFUSED` | 相手のサーバーが接続を受け付けてくれない |
| 📖 | `ETIMEDOUT` | 待ち時間を超えても相手から返事が来なかった |
| 📖 | `ENOTFOUND` | ドメイン名から接続先の住所を引けなかった |
| 📖 | `EAI_AGAIN` | 名前解決が一時的に失敗した（再試行して） |
| 📖 | `fatal: not a git repository` | ここはGitで管理されているフォルダではない |
| 📖 | `fatal: refusing to merge unrelated histories` | 共通の祖先がない2つの履歴は合体させない |
| 📖 | `CONFLICT (content): Merge conflict in ...` | 同じ行を両方が書き換えていてGitが決められない |
| 📖 | `error: failed to push some refs to` | 送ろうとしたが相手のほうが進んでいて拒否された |
| 📖 | `fatal: The current branch ... has no upstream branch` | このブランチの送り先がまだ決まっていない |
| 📖 | `You are in 'detached HEAD' state` | 枝ではなく特定の一点に直接立っている状態 |
| 📖 | `error: Your local changes to the following files would be overwritten by merge` | 未保存の手直しが上書きされそうなので中断した |
| 📖 | `*** Please tell me who you are.` | コミットする人の名前とメールが未設定のまま |
| 📖 | `Permission denied (publickey).` | GitHubに鍵が通らず本人確認できなかった |
| 📖 | `fatal: Authentication failed` | ログイン情報が受け付けられず認証に失敗した |
| 📖 | `npm ERR! code ELIFECYCLE` | package.jsonの実行スクリプトが途中で失敗した |
| 📖 | `npm ERR! code ERESOLVE` | 部品同士が要求するバージョンが噛み合わない |
| 📖 | `npm error Missing script: "dev"` | package.jsonにその名前の実行手順が無い |
| 📖 | `npm ERR! 404 Not Found` | そのパッケージが公開の倉庫に見つからない |
| 📖 | `Error: Cannot find module / MODULE_NOT_FOUND` | 読み込もうとした部品（モジュール）が見つからない |
| 📖 | `ERR_REQUIRE_ESM` | 新しい方式の部品を古い書き方で読もうとした |
| 📖 | `SyntaxError: Unexpected token` | 文法が崩れていて機械がプログラムを読めない |
| 📖 | `ReferenceError: ... is not defined` | その名前のものがどこにも用意されていない |
| 📖 | `TypeError: Cannot read properties of undefined` | 中身が空のものから値を取り出そうとして失敗 |
| 📖 | `ModuleNotFoundError: No module named '...'` | Pythonの部品が入っていない・見つからない |
| 📖 | `IndentationError / TabError` | Pythonの行頭の字下げがずれている・混ざっている |
| 📖 | `FileNotFoundError: [Errno 2]` | Pythonで開こうとしたファイルが存在しない |
| 📖 | `xcrun: error: invalid active developer path` | Macの開発ツールが入っていない・壊れている |
| 📖 | `command not found: claude` | claudeコマンドの場所をシェルが知らない |
| 📖 | `Prompt is too long` | 会話とファイルが多すぎて記憶枠に入り切らない |
| 📖 | `API Error: Repeated 529 Overloaded errors` | アクセスが集中してサーバー側が一時的に満杯 |
| 📖 | `Not logged in · Please run /login` | 有効なログイン情報が見つからず使えない状態 |
| 📖 | `You've hit your session limit · resets 3:45pm` | 一定時間あたりの利用枠を使い切ってしまった |
| 📖 | `Unable to connect to API. Check your internet connection` | Claudeのサーバーにネットワークで届かない |

---

### 📖 `command not found`（コマンド・ノット・ファウンド）

**一言でいうと**: そんな名前の命令は見つからない、という意味

打ち込んだ名前の道具がパソコンの中に見つからないときに出ます。原因はほぼ2つで、名前のタイプミスか、その道具をまだインストールしていないかです。電話帳に載っていない人に電話をかけようとしたのと同じで、番号がないので何も起きません。「◯◯ が command not found と出た。インストールされているか確認して」と頼めば調べてもらえます。

```
zsh: command not found: pnpm
```

### 📖 `No such file or directory`（ノー・サッチ・ファイル・オア・ディレクトリ）

**一言でいうと**: 指定した名前のファイルやフォルダが見つからない

開こうとした先にファイルもフォルダも存在しない、という知らせです。名前の打ち間違い、拡張子違い、そして「今いる場所（フォルダ）が違う」のがほぼ全ての原因です。届け先の住所が実在しない郵便物が戻ってくるのと同じ状態です。「今いるフォルダの中身を一覧にして、正しいパスで開き直して」と頼むと直ります。

```
cat: settings.json: No such file or directory
```

### 📖 `Permission denied`（パーミッション・ディナイド）

**一言でいうと**: 許可がないのでそのファイルを読み書きできない

ファイルやフォルダに「あなたは触っていい人リストに入っていない」と断られた状態です。誰か別の持ち主のものだったり、書き込み禁止になっているときに出ます。会員証がないと入れない部屋の前で止められたのと同じです。「Permission denied が出た。持ち主と権限を確認して、安全な直し方を教えて」と頼むのが正解で、sudo（管理者権限）を付ければ通りますが、必ず理由を確認してからにしてください。

```
bash: ./deploy.sh: Permission denied
```

### 📖 `Operation not permitted`（オペレーション・ノット・パーミッテッド）

**一言でいうと**: macOSの保護機能そのものに操作を止められた

Permission denied と似ていますが、こちらは macOS 自体の保護機能（ディスクアクセス保護など）が止めていることが多いです。持ち主でも触れない、金庫会社が別に鍵をかけている状態です。デスクトップや書類フォルダを触るときに出やすく、システム設定でターミナルに「フルディスクアクセス」を許可すると解決する場合があります。ただし許可の範囲を勝手に広げるのは危険なので、まず人に相談してください。

```
mv: rename /Users/me/Desktop/a.txt: Operation not permitted
```

### 📖 `Is a directory`（イズ・ア・ディレクトリ）

**一言でいうと**: ファイルだと思っていた相手がフォルダだった

中身を読もうとした相手が、実はフォルダだったという知らせです。封筒の中身を読もうとしたら、それは封筒ではなく引き出しだった、という取り違えです。フォルダの中を見たいなら、中身を一覧にする命令に変える必要があります。「これはフォルダだったので中身を一覧にして」と頼めば進みます。

```
cat: src: Is a directory
```

### 📖 `Killed（exit code 137）`（キルド）

**一言でいうと**: メモリが足りず、OSが処理を強制終了させた

処理が重すぎてパソコンの作業机（メモリ）が埋まり、OS が「これ以上は危ない」と割り込んで止めた状態です。理由が一言も書かれず Killed だけ出るのが特徴です。机が狭いのに資料を広げすぎて、片付け係が全部下げてしまったようなものです。他のアプリを閉じる、扱うデータを小さく分ける、で解決します。Claude Code の更新中に出た場合は claude update をやり直すよう公式が案内しています。

```
Killed / Installation was killed before it could finish (exit code 137)
```

### 📖 `No space left on device / ENOSPC`（イーノースペース）

**一言でいうと**: ディスクの空き容量がなくなり保存できない

保存しようとしたがディスクがいっぱいで書き込めない状態です。npm install の途中で出ることが多く、npm 公式のよくあるエラー一覧にも npm ERR! Error: ENOSPC, write として載っています。冷蔵庫が満杯で買ってきた食材が入らないのと同じです。不要なファイルやキャッシュを消して空きを作れば直りますが、何を消すかは必ず確認してから実行してください。

```
npm ERR! Error: ENOSPC, write
```

### 📖 `EADDRINUSE / Address already in use`（イーアドレス・イン・ユース）

**一言でいうと**: そのポート番号はすでに他のプログラムが使用中

Node.js 公式ドキュメントでは「ローカルのアドレスに割り当てようとしたが、既に別のサーバーがそのアドレスを占有していた」と説明されています。開発サーバーを二重に起動したときの定番エラーです。同じ駐車枠に二台目を停めようとして入らないのと同じです。「3000番ポートを使っているプロセスを調べて止めて」と頼むか、別のポート番号で起動し直すと解決します。

```
Error: listen EADDRINUSE: address already in use :::3000
```

### 📖 `EACCES`（イーアクセス）

**一言でいうと**: アクセス権が足りずファイルを作れない・触れない

Node.js 公式では「ファイルのアクセス権が禁じている方法でアクセスしようとした」と定義されています。npm install -g（パソコン全体に入れるインストール）で最も多く見ます。共有ロッカーを勝手に開けようとして鍵が合わなかった状態です。npm 公式は sudo を使わず、インストール先を自分の持ち物のフォルダに変える方法を推奨しているので、「sudo なしで直す方法を教えて」と頼むのが安全です。

```
npm ERR! code EACCES / Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

### 📖 `EPERM`（イーパーム）

**一言でいうと**: そもそもその操作をする権限が与えられていない

Node.js 公式の一覧で「Operation not permitted（操作が許可されていない）」とされるコードです。EACCES がファイルの鍵の問題なのに対し、EPERM は「そもそもあなたにその行為をする資格がない」に近いものです。免許を持たない人が運転席に座れないのと同じです。Windows で、そのファイルを他のアプリが開いたままのときにも出るので、エディタや動いているサーバーを閉じてやり直すと直ることがあります。

```
Error: EPERM: operation not permitted, rename
```

### 📖 `ENOENT`（イーノーエント）

**一言でいうと**: 指定したパスにファイルやフォルダが存在しない

Node.js 公式では「指定したパスの一部が存在しない」と説明されています。No such file or directory の短縮版で、意味は同じです。エラー文の末尾に「探しに行ったパス」が必ず書かれているので、そこを見れば原因がすぐ分かります。宛先を読み上げてくれている配達員のようなものなので、「このENOENTのパスを確認して、正しいファイル名に直して」と頼んでください。

```
Error: ENOENT: no such file or directory, open 'package.json'
```

### 📖 `ECONNREFUSED`（イーコネクション・リフューズド）

**一言でいうと**: 相手のサーバーが接続を受け付けてくれない

Node.js 公式で「Connection refused（接続拒否）」とされるコードです。つなぎたい相手のサーバーが起動していない、またはポート番号が違う、のどちらかがほぼ全ての原因です。お店に行ったら閉まっていてシャッターが下りていた状態です。データベースやAPIサーバーを先に起動する、接続先の番号を見直す、で直ります。

```
connect ECONNREFUSED 127.0.0.1:5432
```

### 📖 `ETIMEDOUT`（イータイムドアウト）

**一言でいうと**: 待ち時間を超えても相手から返事が来なかった

Node.js 公式では「Connection timed out（接続がタイムアウト）」とされています。相手が黙ったままで、決められた待ち時間を超えたので諦めた状態です。呼び出しベルを鳴らしても誰も出てこないので帰った、という感じです。ネットワークが不安定、社内のファイアウォールに止められている、相手が混み合っている、のいずれかなので、まず時間を置いて再実行してみてください。

```
Error: connect ETIMEDOUT 20.27.177.113:443
```

### 📖 `ENOTFOUND`（イーノットファウンド）

**一言でいうと**: ドメイン名から接続先の住所を引けなかった

Node.js 公式では「DNS lookup failed（DNSの名前解決に失敗）」と説明されています。ドメイン名から実際の番号を調べる作業に失敗した状態です。電話帳で名前を引いたのに載っていなかった、というイメージです。URLの綴り間違いか、ネットにつながっていないのが原因なので、まずブラウザで同じサイトが開けるか確かめると切り分けられます。

```
getaddrinfo ENOTFOUND registry.npmjs.org
```

### 📖 `EAI_AGAIN`（イーエーアイ・アゲイン）

**一言でいうと**: 名前解決が一時的に失敗した（再試行して）

住所を調べる仕組み（DNS）が、今だけ返事をくれなかった状態です。AGAIN という名前どおり、時間を置いて再実行すると通ることが多い一時的な不調です。電話帳の案内センターが混み合って繋がらなかった、というイメージです。Wi-Fiを切り替える、社内ネットワークやVPNを疑う、少し待って再実行する、の順に試してください。

```
getaddrinfo EAI_AGAIN registry.npmjs.org
```

### 📖 `fatal: not a git repository`（ファタル・ノット・ア・ギット・リポジトリ）

**一言でいうと**: ここはGitで管理されているフォルダではない

git の命令を出したのに、今いるフォルダとその親のどこにも Git の管理情報が見つからない状態です。図書館の貸出手続きを、図書館ではないただの部屋でしようとしたのと同じです。フォルダを間違えているか、まだ git init していないかのどちらかです。「今どこにいるか確認して、正しいプロジェクトのフォルダに移動して」と頼めば解決します。

```
fatal: not a git repository (or any of the parent directories): .git
```

### 📖 `fatal: refusing to merge unrelated histories`（リフュージング・トゥ・マージ・アンリレイテッド・ヒストリーズ）

**一言でいうと**: 共通の祖先がない2つの履歴は合体させない

git 公式ドキュメントは「共通の祖先を持たない履歴の統合は、既定では安全のため拒否する」と明記しています。手元で作り始めたプロジェクトと、別に作った空のリポジトリを繋ぐときの定番です。まったく別の家系図を無理に一本にしようとして止められた状態です。専用の指定を付ければ通りますが、履歴が混ざるので「なぜ2つに分かれたか調べてから合体して」と頼むのが安全です。

```
fatal: refusing to merge unrelated histories
```

| オプション | 意味 |
| --- | --- |
| `--allow-unrelated-histories` | 共通の祖先がない履歴でも合体を許可する。git公式が用意した例外指定で、めったに使わない前提のもの |

### 📖 `CONFLICT (content): Merge conflict in ...`（コンフリクト・コンテント・マージ・コンフリクト・イン）

**一言でいうと**: 同じ行を両方が書き換えていてGitが決められない

2つの流れが同じファイルの同じ場所を別々に直したため、Git がどちらを採用すべきか判断できず手を止めた状態です。同時に「Automatic merge failed; fix conflicts and then commit the result.」も表示されます。同じ書類の同じ行に二人が別々の赤入れをしてきて、清書係が困っている状況です。ファイルの中に <<<<<<< などの目印が入るので、それを消して正しい形にしてから保存します。「コンフリクトの中身を見せて、どちらを採るべきか説明して」と頼むのが安全です。

```
CONFLICT (content): Merge conflict in src/index.ts
Automatic merge failed; fix conflicts and then commit the result.
```

| オプション | 意味 |
| --- | --- |
| `--abort` | 統合をやめて、始める前の状態に戻す（git merge --abort） |
| `--continue` | 目印を消して直した後に、統合を完了させる（git merge --continue） |

### 📖 `error: failed to push some refs to`（フェイルド・トゥ・プッシュ・サム・レフス）

**一言でいうと**: 送ろうとしたが相手のほうが進んでいて拒否された

git 公式は「push は、相手側の記録が自分の記録の祖先でない場合、上書きを拒む」と説明しています（fast-forwardチェックという安全装置です）。他の人が先に送った変更を、あなたがまだ持っていないときに出ます。同じ書類に他人が加筆した後で、加筆前の版で差し替えようとして止められた状態です。まず git pull で相手の分を取り込み、それから送り直すのが正しい順番です。

```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

| オプション | 意味 |
| --- | --- |
| `--force / -f` | 相手の記録を強制的に上書きする。他人のコミットが消えるので原則使わない |
| `--force-with-lease` | 自分が把握している状態から相手が変わっていなければ上書きする、より安全な強制 |

### 📖 `fatal: The current branch ... has no upstream branch`（ハズ・ノー・アップストリーム・ブランチ）

**一言でいうと**: このブランチの送り先がまだ決まっていない

新しく作った枝（ブランチ）を初めて送るとき、どこの何という名前に送るかが未設定だと出ます。宛先を書かずに手紙を投函しようとした状態です。エラー文の中に git push --set-upstream origin ◯◯ という直し方がそのまま提示されるので、それを実行すれば以後は git push だけで済むようになります。

```
fatal: The current branch feature/login has no upstream branch.
To push the current branch and set the remote as upstream, use: git push --set-upstream origin feature/login
```

| オプション | 意味 |
| --- | --- |
| `--set-upstream / -u` | 送り先を記憶させる。次回以降は git push だけでよくなる |

### 📖 `You are in 'detached HEAD' state`（デタッチト・ヘッド）

**一言でいうと**: 枝ではなく特定の一点に直接立っている状態

git 公式は「HEAD が名前付きブランチではなく、特定のコミットを直接指している状態」と説明しています。過去の版を見に行くとこうなります。しおりを挟まずに本の途中のページを開いて読んでいる状態で、ここで書いた内容は後で見失いやすく、Git の自動掃除で消える可能性があると公式も警告しています。何も変更していなければ元の枝に戻るだけで大丈夫ですが、ここで作業してしまった場合は「今の状態から新しいブランチを作って保存して」と先に頼んでください。

```
You are in 'detached HEAD' state. You can look around, make experimental changes and commit them...
```

### 📖 `error: Your local changes to the following files would be overwritten by merge`（ローカル・チェンジズ・ウッド・ビー・オーバーライトゥン）

**一言でいうと**: 未保存の手直しが上書きされそうなので中断した

まだ保存（コミット）していない編集があるのに、取り込むと消えてしまうファイルがあるため、Git が守るために手前で止めた状態です。机に広げた書き途中の原稿の上に新しい原稿を重ねる前に「これ消えますよ」と教えてくれた、ということです。先にコミットして保存するか、git stash で一時的に脇へ退避すれば進めます。「変更を退避してから取り込んで」と頼むのが安全です。

```
error: Your local changes to the following files would be overwritten by merge:
	src/app.ts
```

### 📖 `*** Please tell me who you are.`（プリーズ・テル・ミー・フー・ユー・アー）

**一言でいうと**: コミットする人の名前とメールが未設定のまま

Git は記録に「誰がやったか」を必ず書き込むため、名前とメールアドレスが未設定だとコミットを断ります。宿帳の署名欄が空のままではチェックインできないのと同じです。エラー文の中に git config --global user.email と user.name の設定例がそのまま出るので、それを実行すれば解決します。設定した情報は記録に残り続けるので、どのメールを使うかは意識して選んでください。

```
*** Please tell me who you are.
fatal: unable to auto-detect email address
```

### 📖 `Permission denied (publickey).`（パーミッション・ディナイド・パブリックキー）

**一言でいうと**: GitHubに鍵が通らず本人確認できなかった

SSHの鍵（パスワード代わりの合鍵）が GitHub 側に登録されていない、または手元で読み込まれていないため、本人だと認めてもらえなかった状態です。ビルの入口でカードキーをかざしたが未登録で開かない、という状況です。鍵ファイルの中身は絶対に人に見せたり貼り付けたりしてはいけません。「SSHの設定を確認する手順を教えて」と頼み、鍵ファイル自体は開かせないようにしてください。

```
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

### 📖 `fatal: Authentication failed`（オーセンティケーション・フェイルド）

**一言でいうと**: ログイン情報が受け付けられず認証に失敗した

HTTPS で GitHub などに繋ぐとき、ユーザー名とパスワード（正しくはアクセストークン）が受け付けられなかった状態です。GitHub は通常のパスワードでの接続を廃止しているため、古いパスワードが保存されたままだとここで止まります。期限切れの会員カードで受付を通れないのと同じです。トークンを作り直して登録すれば解決しますが、トークンは秘密情報なので画面共有やコミットに残らないよう注意してください。

```
fatal: Authentication failed for 'https://github.com/user/repo.git/'
```

### 📖 `npm ERR! code ELIFECYCLE`（イーライフサイクル）

**一言でいうと**: package.jsonの実行スクリプトが途中で失敗した

npm run で動かした中身のコマンドが、途中でエラー終了したという報告です。npm 自身の不具合ではなく「npm が呼んだ相手がこけた」という伝令にすぎず、npm のメッセージにも「これはおそらく npm の問題ではなく、上に本当の理由が出ている」と書かれています。宅配業者が「先方が受け取ってくれませんでした」と持ち帰ってきたのと同じです。本当の原因は必ずこの行より上にあるので、「このログの上のほうの本当のエラーを読んで直して」と頼んでください。

```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

### 📖 `npm ERR! code ERESOLVE`（イーリゾルブ）

**一言でいうと**: 部品同士が要求するバージョンが噛み合わない

ある部品が「相棒はこのバージョンでないと困る」と宣言しているのに、実際には別のバージョンが入っている、という食い違いです（peerDependencies の衝突）。npm 公式は、この衝突を解決できない場合はインストールを失敗として扱うと説明しています。ネジの規格が合わず組み立てられない状態です。無理に通すオプションもありますが後で謎の不具合になりやすいので、「なぜ衝突しているか調べて、正しいバージョンに揃えて」と頼むのが本筋です。

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

| オプション | 意味 |
| --- | --- |
| `--legacy-peer-deps` | peerDependenciesの衝突を無視して、古い方式でインストールする |
| `--force` | 衝突を押し切ってインストールする。npm公式も推奨していない最後の手段 |

### 📖 `npm error Missing script: "dev"`（ミッシング・スクリプト）

**一言でいうと**: package.jsonにその名前の実行手順が無い

npm run のあとに書いた名前が、package.json の scripts の中に見つからない状態です。メニューに載っていない料理を注文したのと同じです。多くは名前の間違い（dev / start / serve の混同）か、そのプロジェクトでは別の名前になっているだけです。「package.json の scripts に何があるか一覧にして」と頼めば、正しい名前がすぐ分かります。

```
npm error Missing script: "dev"
```

### 📖 `npm ERR! 404 Not Found`（フォーオーフォー・ノットファウンド）

**一言でいうと**: そのパッケージが公開の倉庫に見つからない

npm 公式のよくあるエラー一覧にも載っている症状で、指定した名前の部品が公開の倉庫に登録されていない状態です。名前の打ち間違い、社内限定の非公開パッケージ、存在しないバージョン指定が主な原因です。取り寄せを頼んだ品番が、そのカタログに載っていなかったのと同じです。「パッケージ名とバージョンが正しいか確認して」と頼んでください。

```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/reakt - Not found
```

### 📖 `Error: Cannot find module / MODULE_NOT_FOUND`（キャンノット・ファインド・モジュール）

**一言でいうと**: 読み込もうとした部品（モジュール）が見つからない

Node.js 公式では「require の仕組みがモジュールを見つけられなかったときに投げられる」とされています。npm install をしていない、ファイル名の綴りが違う、パスの書き方が違う、のどれかです。レシピに「ボウルを使う」と書いてあるのに台所にボウルが無い状態です。まず npm install を実行し、それでも出るなら綴りとパスを確認します。

```
Error: Cannot find module 'express'
    code: 'MODULE_NOT_FOUND'
```

### 📖 `ERR_REQUIRE_ESM`（エラー・リクワイア・イーエスエム）

**一言でいうと**: 新しい方式の部品を古い書き方で読もうとした

JavaScript には部品の読み込み方が2種類（require と import）あり、新しい形式（ESM）で作られたパッケージを古い require で読もうとすると Node.js がこれを出します。DVDをカセットデッキに入れようとしたような規格違いです。import に書き換える、package.json に設定を足す、といった対処が必要なので「このプロジェクトの方式に合わせて書き換えて」と頼むのが確実です。

```
Error [ERR_REQUIRE_ESM]: require() of ES Module ... not supported
```

### 📖 `SyntaxError: Unexpected token`（シンタックスエラー・アンイクスペクテッド・トークン）

**一言でいうと**: 文法が崩れていて機械がプログラムを読めない

Python 公式の言い方を借りると、これは「解析係が文法の誤りに出会った」状態です。括弧やカンマの閉じ忘れが定番で、文の途中に句点が入っていて意味が取れない文章と同じです。npm 公式は、取得先から本来のデータではなくHTMLが返ってきた場合にも SyntaxError: Unexpected token < が出ると説明しています。エラー文には必ずファイル名と行番号が付くので、「この行の文法エラーを直して」と頼めば十分です。

```
SyntaxError: Unexpected token '}' (at app.js:12)
```

### 📖 `ReferenceError: ... is not defined`（リファレンスエラー・イズ・ノット・ディファインド）

**一言でいうと**: その名前のものがどこにも用意されていない

使おうとした名前が、どこにも定義されていない状態です。綴り間違い、宣言の忘れ、読み込む前に使ってしまった、が主な原因です。会議で「例の資料を出して」と言われても、そんな資料が作られていなかった、という状況です。「この名前がどこで定義されるべきか調べて直して」と頼むと解決します。

```
ReferenceError: fetchData is not defined
```

### 📖 `TypeError: Cannot read properties of undefined`（タイプエラー・キャンノット・リード・プロパティーズ）

**一言でいうと**: 中身が空のものから値を取り出そうとして失敗

あると思っていたデータが実は空（undefined）で、その中の項目を読もうとして失敗した状態です。空っぽの封筒から書類を取り出そうとしたのと同じです。読み込みが終わる前に使ってしまった、外部から返ってきたデータの形が想定と違った、が典型的な原因です。「どこで undefined になっているか追って、空のときの分岐を入れて」と頼むと直ります。

```
TypeError: Cannot read properties of undefined (reading 'name')
```

### 📖 `ModuleNotFoundError: No module named '...'`（モジュール・ノットファウンド・エラー）

**一言でいうと**: Pythonの部品が入っていない・見つからない

Python 公式は「import がモジュールを見つけられないときに発生する ImportError の一種」と定義しています。pip install をしていない、仮想環境を有効にしていない、名前の綴り違いが主な原因です。取り寄せていない部品を、組み立て手順が呼んでしまった状態です。「必要なパッケージを requirements に沿って入れて」と頼めば整います。

```
ModuleNotFoundError: No module named 'requests'
```

### 📖 `IndentationError / TabError`（インデンテーションエラー／タブエラー）

**一言でいうと**: Pythonの行頭の字下げがずれている・混ざっている

Python 公式では IndentationError を「字下げの誤りに関する構文エラーの基底クラス」、TabError を「タブとスペースの使い方が混ざっているときに発生」と説明しています。Python は行頭の空白そのものが意味を持つ言語なので、目に見えないズレでも止まります。箇条書きのインデントが揃っていないと階層が読めないのと同じです。エディタの設定を揃えるのが根本的な対処になります。

```
IndentationError: unexpected indent
```

### 📖 `FileNotFoundError: [Errno 2]`（ファイル・ノットファウンド・エラー）

**一言でいうと**: Pythonで開こうとしたファイルが存在しない

Python 公式は「ファイルやディレクトリを要求したが存在しない。errno の ENOENT に対応する」と説明しています。No such file or directory や ENOENT の Python 版です。多くは、実行しているフォルダと想定しているフォルダが違うだけです。地図の起点がズレている状態なので、「今の作業フォルダを表示して、絶対パスで開き直して」と頼むと解決します。

```
FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'
```

### 📖 `xcrun: error: invalid active developer path`（エックスシーラン・エラー）

**一言でいうと**: Macの開発ツールが入っていない・壊れている

macOS を更新した後などに、開発用の道具箱（Command Line Tools）の場所が無効になると出ます。git と打っただけでこれが出ることもあります。工具箱ごと持ち去られて、どの工具も取り出せない状態です。Apple の開発者フォーラムの案内どおり xcode-select --install を実行して利用条件に同意し、インストールが終われば直ります。数GBのダウンロードがあるので時間に余裕があるときに実行してください。

```
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun
```

### 📖 `command not found: claude`（コマンド・ノット・ファウンド・クロード）

**一言でいうと**: claudeコマンドの場所をシェルが知らない

Claude Code 公式のインストール診断ページに載っている症状で、原因は PATH（コマンドを探す道順）に入っていないことです。インストール自体は成功しているのに呼び出せない、という状態が大半です。荷物は届いているが玄関ではなく物置に置かれていて気づいていない、という感じです。ターミナルで claude doctor を実行すると自動で診断してくれます。

```
zsh: command not found: claude
```

### 📖 `Prompt is too long`（プロンプト・イズ・トゥー・ロング）

**一言でいうと**: 会話とファイルが多すぎて記憶枠に入り切らない

Claude Code 公式の説明では、会話と読み込んだファイルの合計が、モデルの記憶枠（コンテキストウィンドウ）を超えた状態です。机の上に資料を積み上げすぎて、新しい紙を置く場所がなくなったのと同じです。/compact で会話を要約して圧縮するか、/clear で一度まっさらにすれば続けられます。/context を打つと、何が場所を取っているか内訳を確認できます。

```
Prompt is too long
```

### 📖 `API Error: Repeated 529 Overloaded errors`（エーピーアイ・エラー・オーバーローデッド）

**一言でいうと**: アクセスが集中してサーバー側が一時的に満杯

Claude Code 公式は「利用者全体に対して API が一時的に容量いっぱいになっている状態で、あなたの利用量の制限ではない」と明記しています。人気店の入店待ちと同じで、待てば入れます。少し時間を置いて再実行するか、/model で別のモデルに切り替えると通ることがあります。status.claude.com で障害情報も確認できます。

```
API Error: Repeated 529 Overloaded errors. The API is at capacity — this is usually temporary. Try again in a moment.
```

### 📖 `Not logged in · Please run /login`（ノット・ログドイン）

**一言でいうと**: 有効なログイン情報が見つからず使えない状態

Claude Code 公式のエラー一覧では「有効な認証情報が見つからない」状態とされ、/login を実行すれば解決します。似た文言で「OAuth token has expired · Please run /login」も出ますが、こちらは有効期限切れで、対処は同じです。定期券の期限が切れて改札を通れない状態です。/status を打つと、今どの認証方法が使われているか確認できます。

```
Not logged in · Please run /login
```

### 📖 `You've hit your session limit · resets 3:45pm`（ユーブ・ヒット・ユア・セッション・リミット）

**一言でいうと**: 一定時間あたりの利用枠を使い切ってしまった

Claude Code 公式のエラー一覧に載っている表示で、一定時間ごとに回復する利用枠を使い切った状態です。表示された時刻になれば自動的に元に戻ります。乗り放題チケットの当日分を使い切った状態で、翌日になればまた使えるのと同じです。/model で軽いモデルに切り替える、/usage-credits で追加の枠を確認する、という選択肢もあります。

```
You've hit your session limit · resets 3:45pm
```

### 📖 `Unable to connect to API. Check your internet connection`（アンエイブル・トゥ・コネクト・トゥ・エーピーアイ）

**一言でいうと**: Claudeのサーバーにネットワークで届かない

Claude Code 公式では「APIへの接続が失敗した、または完了しなかった」状態とされます。ネット未接続、社内のプロキシやファイアウォール、VPN が原因のことが多いです。電話をかけても回線自体が繋がっていない状態です。まずブラウザで普通にウェブが見えるか確認し、社内ネットワークならプロキシ設定を担当部署に確認するのが早道です。

```
Unable to connect to API. Check your internet connection (ECONNREFUSED / ETIMEDOUT と併記されることもある)
```

---

## この章の出典

- https://nodejs.org/api/errors.html
- https://docs.python.org/3/library/exceptions.html
- https://docs.npmjs.com/common-errors/
- https://docs.npmjs.com/cli/v11/using-npm/config/
- https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/
- https://git-scm.com/docs/git-checkout
- https://git-scm.com/docs/git-merge
- https://git-scm.com/docs/git-push
- https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
- https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
- https://code.claude.com/docs/en/errors
- https://code.claude.com/docs/en/troubleshoot-install
- https://code.claude.com/docs/en/troubleshooting
- https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html
- https://developer.apple.com/forums/thread/673827
