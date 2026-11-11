import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
  return rss({
    title: 'Julio Fuentes — Notes',
    description: 'What I learn while building my projects: what I tried, what worked and what I would change.',
    site: context.site ?? 'https://juliofuentescerrada.github.io',
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: note.data.date,
      link: `/notes/${note.id}/`,
      categories: [note.data.topic, ...note.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
