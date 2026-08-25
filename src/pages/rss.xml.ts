import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedPosts, excerpt, SITE } from '../posts';

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const posts = await publishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(`${base}/`, context.site!).href,
    customData: `<language>ja</language>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: excerpt(p.body ?? '', 200),
      link: `${base}/${p.id}/`,
      categories: p.data.topics,
      ...(p.data.published_at ? { pubDate: new Date(p.data.published_at) } : {}),
    })),
  });
}
