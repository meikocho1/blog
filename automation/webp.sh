#!/bin/bash
# 無人実行から生成画像を英中版の webp に変換する入口。cwebp を直接許可すると出力先が自由になるため、
# 入力は codex の generated_images の PNG、出力は images/<slug>/{en,zh}/<file>.webp に限る。
REPO="/Users/akimitu/Documents/my-zenn"
GEN="/Users/akimitu/.codex/generated_images/"
die() { echo "$1" >&2; exit 2; }

[ $# -eq 2 ] || die "usage: automation/webp.sh <generated.png> images/<slug>/<en|zh>/<file>.webp"
[ -f "$1" ] && [ ! -L "$1" ] || die "not a regular file: $1"
src="$(realpath "$1")"
case "$src" in "$GEN"*.png) ;; *) die "source must be a PNG under $GEN" ;; esac
[[ "$2" =~ ^images/[a-z0-9-]+/(en|zh)/[A-Za-z0-9_-]+\.webp$ ]] || die "output must match images/<slug>/<en|zh>/<file>.webp"

slug_dir="$REPO/$(dirname "$(dirname "$2")")"
[ -d "$slug_dir" ] && [ ! -L "$slug_dir" ] || die "article image dir missing: $slug_dir"
out_dir="$REPO/$(dirname "$2")"
mkdir -p "$out_dir"
[ ! -L "$out_dir" ] || die "symlinked output dir"
dst="$REPO/$2"
[ ! -L "$dst" ] || die "symlinked output file"

exec /opt/homebrew/bin/cwebp -quiet -q 80 "$src" -o "$dst"
