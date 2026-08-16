#!/bin/bash
# 毎日1回、headless Claude Code で Zenn 記事の下書き+挿絵を自動生成する。
# launchd (RunAtLoad + StartCalendarInterval) から呼ばれる。1日1回ガード付き。
set -u

REPO="/Users/akimitu/Documents/my-zenn"
STATE_DIR="$HOME/.local/state/zenn-daily"
STAMP="$STATE_DIR/last-run"
LOG_DIR="$STATE_DIR/logs"
mkdir -p "$LOG_DIR"

TODAY=$(date +%Y-%m-%d)
# 成功した日はもう走らない
if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$TODAY" ]; then
  exit 0
fi

# 失敗時は再試行するが、無限に叩かないよう1日3回まで。
# （スリープでプロセスが殺されるケースがあるため。成功時のみスタンプを書く方式）
ATTEMPTS="$STATE_DIR/attempts-$TODAY"
N=$(cat "$ATTEMPTS" 2>/dev/null || echo 0)
if [ "$N" -ge 3 ]; then
  exit 0
fi
echo $((N + 1)) > "$ATTEMPTS"
find "$STATE_DIR" -name 'attempts-*' ! -name "attempts-$TODAY" -delete 2>/dev/null

# launchd の環境は素なので PATH を明示する（claude / codex の実パスに合わせる）
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

command -v claude >/dev/null || { echo "claude not found" >> "$LOG_DIR/$TODAY.log"; exit 1; }
command -v codex  >/dev/null || { echo "codex not found"  >> "$LOG_DIR/$TODAY.log"; exit 1; }

cd "$REPO" || exit 1

# 無人実行 + Web由来のテキストを読む構成なので、Bash はプロンプトインジェクション経路になる。
# ブラックリストは `git -C ... push` / `sh -c ...` / curl 外部送信などで簡単に回り込めるため、
# 挿絵生成に実際に必要なコマンドだけのホワイトリストにする。
# 許可外の Bash は拒否されるだけで実行自体は続くので、最悪でも「挿絵が減る」で済む。
# caffeinate -is: 実行中（約20分）のアイドルスリープ／システムスリープを抑止する。
# ただしフタを閉じたスリープは userland では止められない → その場合は上のリトライで拾う。
caffeinate -is claude -p "$(cat "$REPO/automation/daily-article-prompt.md")" \
  --permission-mode acceptEdits \
  --allowedTools \
    "WebSearch" "WebFetch" "Read" "Write" "Edit" "Glob" "Grep" "Skill" \
    "Bash(codex exec:*)" \
    "Bash(codex features list)" \
    "Bash(command -v codex)" \
    "Bash(find /Users/akimitu/.codex/generated_images:*)" \
    "Bash(cp /Users/akimitu/.codex/generated_images/:*)" \
    "Bash(mkdir -p images/:*)" \
    "Bash(ls:*)" \
  --disallowedTools "Bash(git:*)" "Bash(curl:*)" "Bash(rm:*)" \
  >> "$LOG_DIR/$TODAY.log" 2>&1

RC=$?
echo "exit=$RC attempt=$((N + 1)) finished=$(date +%H:%M:%S)" >> "$LOG_DIR/$TODAY.log"

# 成功したときだけ「今日はもう実行済み」を記録する
if [ "$RC" -eq 0 ]; then
  echo "$TODAY" > "$STAMP"
fi
