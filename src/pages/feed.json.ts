import type { APIContext } from 'astro';
import { publicNotes, noteUrl, isoDate } from '../lib/notes';

// 세 사이트 통합 화면용 공개 목록(docs/FAMILY.md 2절, v0).
export async function GET(context: APIContext) {
  const notes = (await publicNotes()).reverse();
  const abs = (path: string) => new URL(path, context.site).href;
  const body = {
    version: 0,
    site: 'therefore',
    items: notes.map((n) => ({
      id: `notes/${n.id}`,
      title: n.data.title,
      date: isoDate(n.data.date),
      url: abs(noteUrl(n)),
      ...(n.data.series ? { series: n.data.series.id } : {}),
      ...(n.data.place ? { place: n.data.place } : {}),
      ...(n.data.related.length ? { related: n.data.related } : {}),
      ...(n.data.sample ? { sample: true } : {}),
    })),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
