#!/bin/bash
# 無人実行（daily-article.sh）から codex を呼ぶ唯一の入口。
# `Bash(codex exec:*)` を許可すると -s danger-full-access などの引数も通ってしまうので、
# 引数はプロンプト1つだけ受け取り、サンドボックスを read-only に固定する。
[ $# -eq 1 ] || { echo "usage: automation/codex-image.sh '<prompt>'" >&2; exit 2; }
exec codex exec -s read-only "$1" < /dev/null
