# FAMILY — ELSEWHERE · HERE · THEREFORE 공통 규칙

세 사이트를 나중에 **지도형 통합 화면** 하나로 겹쳐 보기 위해, 지금부터 맞춰 두는 이음새를 적는다.
통합 화면 자체는 아직 만들지 않는다. 확정되지 않은 사항은 **[확인 필요]**로 둔다.

## 1. 통합 화면 그림 (사용자 결정: 지도형)

```
          · THEREFORE 글 (바깥 궤도의 점, 시리즈끼리 가는 선)
       ·      ·
    ╭──────────────╮
    │  ELSEWHERE   │  ← 지구본 표면: 해외 여행지 핀
    │     · HERE   │  ← 한국으로 확대하면 국내 장소
    ╰──────────────╯
   글에 place나 related가 있으면 궤도의 점에서 표면의 장소로 선을 긋는다
```

- 바탕은 ELSEWHERE 지구본(three.js)이다. THEREFORE '생각의 구' 아이디어는 이 화면의 궤도 층으로 쓴다.
- 통합 화면의 위치(네 번째 사이트인지, 세 사이트 중 한 곳의 페이지인지): **[확인 필요]** (사용자: 아직 미정)
- HERE는 나중에 공개로 전환한다(사용자 결정). 그 전까지 HERE 데이터는 통합 화면에 넣지 않는다.

## 2. 데이터 형식 — `/feed.json` (v0 초안)

세 사이트가 같은 모양의 공개 목록을 내보낸다. 통합 화면은 빌드할 때 세 목록을 읽는다.

```json
{
  "version": 0,
  "site": "therefore",
  "items": [
    {
      "id": "notes/example-slug",
      "title": "예시 글 제목",
      "date": "2026-11-19",
      "url": "https://example.invalid/notes/example-slug/",
      "series": "example-series",
      "place": { "name": "예시 도시", "lat": 35.0, "lng": 135.0 },
      "related": ["https://example.invalid/journal/example-trip/"]
    }
  ]
}
```

| 항목 | 필수 | 설명 |
|---|---|---|
| `site` | 필수 | `elsewhere` / `here` / `therefore` |
| `id` | 필수 | 사이트 안에서 바뀌지 않는 값. 주소 경로를 그대로 쓴다 |
| `title`, `date`, `url` | 필수 | `date`는 `YYYY-MM-DD` |
| `series` | 선택 | THEREFORE 시리즈 슬러그. HERE의 '잇기'(경로)에도 같은 자리를 쓸 수 있다 **[확인 필요]** |
| `place` | 선택 | 위도·경도는 도시·지역 단위로만. ELSEWHERE의 원칙("위치는 도시·지역 단위로만 표시")을 따른다 |
| `related` | 선택 | 다른 사이트 글의 전체 주소 목록. 통합 화면에서 선으로 잇는 근거 |

- THEREFORE MDX 머리말에도 처음부터 `place`, `related`를 선택 항목으로 둔다. 비워 둬도 된다.
- 좌표를 3D로 바꿀 때는 ELSEWHERE `src/scripts/globe.ts`의 `position(lat, lng, r)`을 그대로 쓴다(경도 0°가 +X).
- ELSEWHERE·HERE에 `/feed.json`을 추가하는 일은 두 저장소를 수정해야 하므로 **사용자 허락을 받은 뒤** 진행한다.

## 3. 3D 문법

ELSEWHERE 지구본(`src/scripts/globe.ts`)의 설정을 기준으로 한다. 세 사이트의 3D 장면은 같은 손맛으로 움직여야 한다.

| 항목 | 값 |
|---|---|
| 라이브러리 | three.js (ELSEWHERE `^0.186.1`) + `OrbitControls` |
| 카메라 | `PerspectiveCamera` 시야각 35 |
| 렌더러 | 투명 바탕(`alpha`), `antialias`, 픽셀 비율 최대 2, 캔버스는 `aria-hidden` |
| 조작 | 이동(pan) 끔, 확대(zoom) 끔, 관성 0.07, 회전 감도 0.55 |
| 자동 회전 | 속도 0.45. 손으로 조작한 뒤 잠시 쉬면 다시 돈다 |
| 시작 장면 | 멀리서 다가오며 자리 잡는 짧은 도입 |
| 애니메이션 줄이기 | 자동 회전·도입·반짝임을 끄고, 완성된 장면을 바로 보여 준다. 조작은 그대로 가능 |
| 화면 밖 | `IntersectionObserver`로 보이지 않을 때 렌더링을 멈춘다 |
| 대체 화면 | WebGL이 안 되면 2D 화면을 보여 준다. 3D가 준비되면 대체 화면을 숨긴다 |
| 그림자 | 쓰지 않는다. 깊이는 선과 겹침으로만 표현한다 |

코드는 지금 공용 패키지로 떼지 않는다. 같은 구조로 복사해 쓰고, 통합 화면을 만들 때 공용화한다.

## 4. 디자인 기준 — 갈림길

| | ELSEWHERE | HERE | THEREFORE |
|---|---|---|---|
| 바탕 | Paper `#F6F3ED` | 한지 `#F4F4F1` | Paper `#F6F3ED` (시안 C) |
| 제목 | Noto Serif KR | 함렛(Hahmlet) | Noto Serif KR |
| 본문 | Pretendard | Pretendard | Pretendard |
| 영문 | Manrope | Manrope | Manrope |

- 공통: 가는 선, 명조 제목, 표 형식 숫자, 인덱스 번호, 그림자·알약 버튼·굵은 글자 쓰지 않기.
- 통합 화면에서 바탕과 제목 글꼴을 무엇으로 할지: **[확인 필요]**

## 5. 순서

1. 이 문서 (완료)
2. THEREFORE 첫 화면 3D 시제품: 흩어진 글자가 원고지로 모이는 장면
3. THEREFORE 사이트 제작(Astro, 시리즈 구조, `/feed.json`)
4. ELSEWHERE·HERE에 `/feed.json` 추가 (허락 후. HERE는 공개 전환 후)
5. 통합 화면 시제품
