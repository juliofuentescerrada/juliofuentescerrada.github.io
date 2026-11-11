import { getCollection, type CollectionEntry } from 'astro:content';
import { NOTE_TOPICS, type NoteTopic } from './note-topics';

export { NOTE_TOPICS, topicSlug, type NoteTopic } from './note-topics';

export type Note = CollectionEntry<'notes'>;

/**
 * Notes that can be shown, newest first. Drafts are visible in `astro dev` so they can be reviewed,
 * and never reach a build: not in pages, the index, the home page or the feed.
 */
export async function getVisibleNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft);
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** Topics in their canonical order, keeping only those with at least one visible note. */
export function topicsInUse(notes: Note[]): NoteTopic[] {
  const used = new Set(notes.map(({ data }) => data.topic));
  return NOTE_TOPICS.filter((topic) => used.has(topic));
}

export function formatNoteDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
