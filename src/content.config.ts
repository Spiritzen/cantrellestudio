import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content Collection "realisations" — CS-S0.
// Contenu volontairement court et factuel (voir prompt CS-S0, section 4) :
// pas d'étude de cas marketing complète, pas de métrique inventée.
const realisations = defineCollection({
  loader: glob({ base: './src/content/realisations', pattern: '**/*.json' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    shortTitle: z.string().optional(),
    summary: z.string(),
    category: z.string(),
    featured: z.boolean().default(false),
    order: z.number(),
    technologies: z.array(z.string()).default([]),
    problem: z.string(),
    solution: z.string(),
    result: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
});

export const collections = { realisations };
