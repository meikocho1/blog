import { getCollection } from 'astro:content';

export const SITE = {
  title: 'akimitu の記録',
  description: 'AI コーディングと開発まわりの調べもの・実験メモ。',
  author: 'akimitu',
  lang: 'ja',
} as const;

/** published: true のみ。published_at 降順、未設定は末尾（タイトル順） */
export async function publishedPosts() {
  const posts = await getCollection('articles', (e) => e.data.published);
  return posts.sort(
    (a, b) =>
      (b.data.published_at ?? '').localeCompare(a.data.published_at ?? '') ||
      a.data.title.localeCompare(b.data.title),
  );
}

/** 本文冒頭から meta description 用の抜粋を作る */
export function excerpt(body: string, max = 120): string {
  const text = body
    .replace(/^:::.*$/gm, '')
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/^#{1,6} .*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** 本文最初の画像を OGP 画像に使う */
export function firstImage(body: string): string | undefined {
  return /!\[[^\]]*\]\((\/images\/[^)]+)\)/.exec(body)?.[1];
}
