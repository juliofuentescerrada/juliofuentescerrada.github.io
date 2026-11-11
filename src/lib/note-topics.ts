/** Note topics in display order. Shared by the content schema and the pages. */
export const NOTE_TOPICS = [
  'Applied AI',
  'Azure',
  '.NET',
  'Angular',
  'Architecture',
  'Data',
  'Product',
  'Security',
  'AI-assisted development',
] as const;

export type NoteTopic = (typeof NOTE_TOPICS)[number];

/** URL segment for a topic: lowercase, with runs of other characters as one hyphen (".NET" → "net"). */
export function topicSlug(topic: NoteTopic): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
