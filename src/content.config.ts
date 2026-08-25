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
      published_at: z.string().optional(),
    }),
  }),
};
