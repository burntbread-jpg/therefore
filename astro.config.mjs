import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// 배포 주소(RSS·feed.json의 전체 주소에 쓰인다). 도메인을 바꾸면 여기나 SITE_URL 환경 변수를 고친다.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://therefore-seven.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
