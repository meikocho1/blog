import type { APIContext } from 'astro';

// AI 検索エンジン（GEO）向け。明示的に許可しておかないと除外する実装があるため列挙する。
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
];

export function GET({ site }: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const sitemap = new URL(`${base}sitemap-index.xml`, site).href;
  const llms = new URL(`${base}llms.txt`, site).href;

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${sitemap}`,
    `# llms.txt: ${llms}`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
