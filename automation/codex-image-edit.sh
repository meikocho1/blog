#!/bin/bash
# 無人実行から挿絵の書き込みを差し替える（英中版）ための入口。codex-image.sh と同じく引数を固定する。
# 入力画像はリポジトリの images/<slug>/ 直下の PNG に限る（任意のファイルを codex に読ませないため）。
REPO="/Users/akimitu/Documents/my-zenn"
die() { echo "$1" >&2; exit 2; }

[ $# -eq 2 ] || die "usage: automation/codex-image-edit.sh '<prompt>' images/<slug>/<file>.png"
case "$1" in -*) die "prompt must not start with -" ;; esac
[[ "$2" =~ ^images/[a-z0-9-]+/[A-Za-z0-9_-]+\.png$ ]] || die "input must match images/<slug>/<file>.png"

p="$REPO/$2"
[ -f "$p" ] && [ ! -L "$p" ] && [ ! -L "$(dirname "$p")" ] || die "not a regular file: $2"
case "$(realpath "$p")" in "$REPO/images/"*) ;; *) die "input escapes images/" ;; esac

exec codex exec -s read-only -i "$p" -- "$1" < /dev/null
