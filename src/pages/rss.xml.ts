import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publicNotes, noteUrl } from '../lib/notes';

export async function GET(context: APIContext) {
  const notes = (await publicNotes()).reverse();
  return rss({
    title: 'THEREFORE · 그러므로',
    description: '인생은 초등학교에서 배운 것의 복습이란다.',
    site: context.site!,
    items: notes.map((n) => ({ title: n.data.title, pubDate: n.data.date, description: n.data.summary, link: noteUrl(n), categories: n.seriesEntry ? [n.seriesEntry.data.name] : [] })),
    customData: '<language>ko</language>',
  });
}
