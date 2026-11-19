import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// 배포 주소가 정해지면 SITE_URL 환경 변수로 넣는다(RSS·feed.json의 전체 주소에 쓰인다).
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
