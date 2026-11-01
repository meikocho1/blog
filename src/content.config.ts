import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '*.md', base: './articles' }),
    schema: z.object({
      title: z.string(),
      emoji: z.string().optional(),
      type: z.string().optional(),
      topics: z.array(z.string()).default([]),
      published: z.boolean().default(false),
      /** ブログ側だけの非公開フラグ（Zenn の published とは独立） */
      draft: z.boolean().default(false),
      published_at: z.string().optional(),
    }),
  }),
  /** articles/ の翻訳。id は `en/<slug>` / `zh/<slug>`。articles/ に置くと Zenn に同期されるので別フォルダ */
  translations: defineCollection({
    loader: glob({ pattern: '{en,zh}/*.md', base: './i18n' }),
    schema: z.object({
      title: z.string(),
      emoji: z.string().optional(),
      // トピックは日本語版と共通の名前。英中ページでは読めない日本語タグを出さない
      topics: z
        .array(z.string())
        .default([])
        .transform((ts) => ts.filter((t) => /^[\x20-\x7E]+$/.test(t))),
      published_at: z.string().optional(),
    }),
  }),
};
