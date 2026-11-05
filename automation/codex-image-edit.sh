#!/bin/bash
# 無人実行から挿絵の書き込みを差し替える（英中版）ための入口。codex-image.sh と同じく引数を固定する。
# 入力画像はリポジトリの images/ 配下の PNG に限る（任意のファイルを codex に読ませないため）。
[ $# -eq 2 ] || { echo "usage: automation/codex-image-edit.sh '<prompt>' images/<slug>/<file>.png" >&2; exit 2; }
case "$2" in
  images/*.png) ;;
  *) echo "input must be images/**/*.png" >&2; exit 2 ;;
esac
case "$2" in *..*) echo "no .. in path" >&2; exit 2 ;; esac
[ -f "$2" ] || { echo "not found: $2" >&2; exit 2; }
exec codex exec -s read-only "$1" -i "$2" < /dev/null
