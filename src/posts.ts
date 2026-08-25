import { getCollection } from 'astro:content';

export const SITE = {
  title: 'すみと黒の記録',
  description: '気になったことを調べて整理しておく、個人のメモ置き場。',
  author: 'すみ',
  authorUrl: 'https://github.com/meikocho1',
  bio: '気になった話題を自分なりに整理してメモしておくスペースです。監修：黒（猫）。',
  avatar: '/images/profile-icon/avatar-192.png',
  lang: 'ja',
  /** アクセス解析。Cloudflare Web Analytics のトークンを入れると計測が有効になる */
  cfAnalyticsToken: '',
  /** Google Analytics 4 の測定ID（G-XXXXXXXXXX）。空なら計測しない */
  gaId: '',
  /** Google Search Console のサイト所有権確認 */
  googleSiteVerification: 'YvevDsFY1R6b9T_svBXNd1dfgbavtICCqXf5suQHcRs',
} as const;

/** 1ページあたりの記事数 */
export const PER_PAGE = 12;

/**
 * ブログは `published`（Zenn 用）を見ない。Zenn 側だけ非公開にしてもブログには残る。
 * ブログから外したい記事は frontmatter に `draft: true` を書く。
 */
export async function publishedPosts() {
  const posts = await getCollection('articles', (e) => e.data.draft !== true);
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

/** トピックごとの記事数（多い順） */
export async function topicCounts(): Promise<{ topic: string; count: number }[]> {
  const posts = await publishedPosts();
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}
