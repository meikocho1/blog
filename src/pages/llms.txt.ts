import type { APIContext } from 'astro';
import { publishedPosts, excerpt, SITE } from '../posts';

/** llms.txt — AI 検索エンジンが記事一覧と要約をまとめて取得できるようにする */
export async function GET({ site }: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const posts = await publishedPosts();

  const lines = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    `著者: ${SITE.author} / 言語: 日本語`,
    '',
    '## 記事',
    '',
    ...posts.map((p) => {
      const url = new URL(`${base}${p.id}/`, site).href;
      return `- [${p.data.title}](${url}): ${excerpt(p.body ?? '', 160)}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
