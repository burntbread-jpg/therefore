# THEREFORE · 그러므로

> 인생은 초등학교에서 배운 것의 복습이란다

교육론, AI 활용, 그 밖의 생각을 모아 두는 글 아카이브.

ELSEWHERE(다른 곳)와 HERE(여기)에 이은 세 번째 사이트다. 세 이름은 모두 HERE를 품는다.

```
elsewHERE · HERE · tHEREfore
```

| 사이트 | 다루는 것 | 저장소 |
|---|---|---|
| ELSEWHERE | 해외 여행기 | burntbread-jpg/elsewhere (공개) |
| HERE | 국내 장소 지도 | burntbread-jpg/here (비공개) |
| THEREFORE | 생각 · 글 (연재 중심) | burntbread-jpg/therefore (공개) |

## 실행

```bash
pnpm install
pnpm dev       # http://127.0.0.1:4321
pnpm build     # dist/ 에 정적 사이트
pnpm check     # 타입 검사
```

배포 주소: https://therefore-seven.vercel.app (Vercel, `main`에 올리면 자동 배포). 주소를 바꾸면 `astro.config.mjs`의 `site`나 환경 변수 `SITE_URL`을 고친다.

## 글 쓰는 법

`src/content/notes/`에 `.mdx` 파일 하나가 글 한 편이다. 파일 이름이 주소가 된다(`/notes/파일-이름/`).

```mdx
---
title: "글 제목"
date: 2026-11-20
series: textbook        # src/content/series.json 의 id. 연재 밖 글이면 이 줄을 지운다
format: essay           # essay(긴 글) 또는 memo(메모)
summary: "목록과 글 머리에 나오는 한두 줄 소개"
# draft: true           # 초안이면 사이트에 나오지 않는다
# place: { name: "교토", lat: 35.01, lng: 135.77 }   # 통합 화면용, 도시·지역 단위
# related: ["https://elsewhere-travel-archive.vercel.app/journal/..."]
---

본문
```

- 회차(몇 편)와 글 번호는 날짜 순서로 자동으로 붙는다.
- 연재는 `src/content/series.json`에서 추가·수정한다. 색은 종이 위 대비 4.5:1 이상인 짙은 색만 쓴다.
- 지금 들어 있는 글 30편과 연재 4개는 `sample: true`인 예시다. 실제 글이 하나라도 올라오면 예시 글은 사이트에서 자동으로 빠진다. 정리할 때는 예시 파일을 지우면 된다.

## 구조

| 경로 | 내용 |
|---|---|
| `/` | 원고지 부제(2D) + 쌓이는 생각(3D 나선, `src/scripts/spiral.js`) |
| `/notes/[slug]/` | 글. 같은 연재의 이전·다음 편 |
| `/series/`, `/series/[id]/` | 연재 목록, 연재 목차 |
| `/archive/` | 달별 전체 글 |
| `/about/` | 소개 |
| `/rss.xml`, `/feed.json` | 구독, 세 사이트 통합 화면용 목록(docs/FAMILY.md) |

## 현재 상태

사이트 1차 제작(예시 글). 결정 사항과 남은 질문은 [docs/HANDOFF.md](docs/HANDOFF.md), 시안과 평가는 `drafts/`, `docs/REVIEW-2026-11-19.md`.
