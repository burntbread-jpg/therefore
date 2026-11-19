import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;
export type Series = CollectionEntry<'series'>;
export type NoteView = Note & { no: number; ep?: number; seriesEntry?: Series };

// 예시 글은 실제 글이 하나라도 올라오면 자동으로 빠진다(ELSEWHERE와 같은 규칙).
export async function publicNotes(): Promise<NoteView[]> {
  const all = await getCollection('notes', ({ data }) => !data.draft);
  const real = all.filter((n) => !n.data.sample);
  const list = (real.length ? real : all).sort((a, b) => a.data.date.getTime() - b.data.date.getTime() || a.id.localeCompare(b.id));
  const series = new Map((await getCollection('series')).map((s) => [s.id, s]));
  const counts = new Map<string, number>();
  return list.map((n, i) => {
    const sid = n.data.series?.id;
    const ep = sid ? (counts.get(sid) ?? 0) + 1 : undefined;
    if (sid) counts.set(sid, ep!);
    return Object.assign(n, { no: i + 1, ep, seriesEntry: sid ? series.get(sid) : undefined });
  });
}

export async function publicSeries(notes: NoteView[]) {
  const used = new Set(notes.map((n) => n.data.series?.id).filter(Boolean));
  return (await getCollection('series')).filter((s) => used.has(s.id)).sort((a, b) => a.data.order - b.data.order);
}

export const pad = (n: number) => String(n).padStart(2, '0');
// 날짜는 머리말에 적은 날짜 그대로(UTC 기준) 보여 준다. 빌드하는 곳의 시간대에 따라 하루씩 밀리지 않게.
export const dateLabel = (d: Date) => `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const noteUrl = (n: Note) => `/notes/${n.id}/`;
export const formatLabel = { essay: '긴 글', memo: '메모' } as const;
