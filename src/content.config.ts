import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

// 시리즈(연재). 색은 카드의 색인 탭과 범례에 쓰인다. 작은 글자에 쓰이므로 종이 위 대비 4.5:1 이상인 색만.
const series = defineCollection({
  loader: file('./src/content/series.json'),
  schema: z.object({
    name: z.string(),
    topic: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    description: z.string().optional(),
    order: z.number().int(),
    sample: z.boolean().default(false),
  }),
});

// 글. 주소는 파일 이름(/notes/[파일 이름]/)이고, 시리즈를 바꿔도 주소는 그대로다.
// 회차(몇 편)는 같은 시리즈 안의 날짜 순서로 자동 계산한다(src/lib/notes.ts).
const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    series: reference('series').optional(),
    format: z.enum(['essay', 'memo']).default('essay'),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    sample: z.boolean().default(false),
    // 세 사이트 통합 화면용(docs/FAMILY.md). 위치는 도시·지역 단위로만.
    place: z.object({ name: z.string(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
    related: z.array(z.string().url()).default([]),
  }),
});

export const collections = { series, notes };
