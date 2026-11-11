import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { NOTE_TOPICS } from './lib/note-topics';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    focus: z.string(),
    summary: z.string(),
    order: z.number().int().positive(),
    tags: z.array(z.string()),
    stack: z.array(z.string()),
    repo: z.url(),
    live: z.url().optional(),
    liveLabel: z.string().default('Live demo'),
    status: z.string().optional(),
    draft: z.boolean().default(true),
    caseStudyPublished: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    project: reference('projects').optional(),
    topic: z.enum(NOTE_TOPICS),
    tags: z.array(z.string()).default([]),
    takeaways: z.array(z.string()).min(1),
    draft: z.boolean().default(true),
  }),
});

export const collections = { projects, notes };
