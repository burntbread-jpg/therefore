# 홈 화면 시안 (예시 글)

| 시안 | 파일 | 성격 |
|---|---|---|
| A 목차 | a-index.html | ELSEWHERE 계열. Paper 바탕, Noto Serif KR. 부제를 크게, 아래에 번호 붙은 글 목록 |
| B 시간표 | b-timetable.html | HERE 계열. 한지 바탕, 함렛. 최근 글을 '1교시–6교시'로, 옆에 과목·연재·알림장 |
| C 원고지 (선택됨) | c-manuscript.html | 부제를 12칸 원고지 두 줄에 쓴다(마침표 포함). 시리즈 중심: 연재 목록이 주인공, 아래에 최근 글 |

- 스크린샷: shots/*-1440.png, shots/*-390.png
- 글 제목·날짜·개수는 모두 예시다.
- 글꼴: Pretendard(SIL OFL 1.1, fonts/에 포함), Noto Serif KR·Hahmlet·Manrope(Google Fonts).

## 3D 시안 (C + 흩어진 글자가 원고지로 모이는 장면)

- `c-3d.html` + `manuscript3d.js`. three.js 0.186.1(ELSEWHERE와 같은 버전)을 `vendor/`에 두고 쓴다. `vendor/`는 커밋하지 않는다.
  - 받는 법: `npm pack three@0.186.1` 후 `build/three.module.js`, `build/three.core.js`, `examples/jsm/controls/OrbitControls.js`를 `vendor/`(컨트롤은 `vendor/addons/controls/`)에 복사.
- ES 모듈이라 `file://`로는 열리지 않는다. `python3 -m http.server`로 열 것.
- 스크린샷: `shots/c-3d-{scatter,mid,settled}-{1440,390}.png`. `window.__manuscript.set(0~1)`로 진행도를 정해 찍었다.
