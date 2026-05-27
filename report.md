# Vibe Coding Community 사이트 현황 평가보고서

**평가일**: 2026-05-27  
**로컬 경로**: `C:\Users\User\ws\vibe-test`  
**GitHub**: https://github.com/zwnfkko/vibe-test  
**배포 URL**: https://zwnfkko.github.io/vibe-test

---

## 1. 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19 + TypeScript |
| Build | Vite 7.3.1 |
| Routing | React Router v7.13.0 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| Markdown | react-markdown 10.1.0 + remark-gfm |
| 배포 | GitHub Pages + GitHub Actions |

---

## 2. 구현 완료 현황

### 핵심 기능
- **커뮤니티 게시판**: 공부일지 / 실습공유 / 질문·답변 / 자유토론 / 공지 카테고리
- **글쓰기**: 마크다운 작성, 수정, 삭제
- **댓글 시스템**: Supabase 연동 CRUD
- **좋아요**: 중복 방지 (user별 추적)
- **인증**: 이메일 + Google OAuth + Kakao OAuth
- **검색**: 제목/내용/작성자 클라이언트 사이드 필터
- **페이지네이션**: 15개/페이지

### UX/UI
- 다크모드 지원
- 컬러 테마 5종 (Blue, Red, Green, Purple, Orange)
- 한국어/영어 실시간 전환
- 반응형 디자인
- Toast 알림
- 비활성 타임아웃 (`useIdleTimeout`)
- 스크롤 상단 이동 버튼

### 인프라
- GitHub Actions 자동 배포 (`main` 브랜치 push 시 gh-pages 배포)
- Supabase RLS 정책 (읽기: 전체 공개 / 쓰기: 작성자만)
- Supabase 미설정 시 로컬 인메모리 폴백 데이터

---

## 3. 발견된 버그 및 이슈

### [심각] 버그 1 - 댓글 테이블명 불일치 ✅ 수정 완료
**파일**: `src/utils/commentStorage.ts`

`community.ts`는 `TABLES.comments = 'vibe_comments'`를 사용하지만, `commentStorage.ts`는 하드코딩된 `'comments'` 테이블을 직접 참조했음. Supabase에서 `vibe_comments` 테이블을 생성해도 댓글 기능이 동작하지 않는 문제.

```ts
// 수정 전 (잘못됨)
.from('comments')

// 수정 후
import { TABLES } from './supabase';
.from(TABLES.comments)
```

---

### [심각] 버그 2 - 좋아요 카운트 업데이트 오류 ✅ 수정 완료
**파일**: `src/utils/community.ts`

`toggleLike` 함수에서 likes 카운트를 증감할 때 `client.rpc('decrement', {})` / `client.rpc('increment', {})` 를 column 값으로 사용. Supabase API 오용으로 실제로는 작동하지 않음.

```ts
// 수정 전 (잘못됨)
.update({ likes: client.rpc('decrement', {}) })

// 수정 후 — 현재 값 조회 후 ±1 계산
const { data: currentPost } = await client.from(TABLES.posts).select('likes').eq('id', postId).single();
const currentLikes = currentPost?.likes || 0;
.update({ likes: Math.max(0, currentLikes - 1) })
```

---

### [중간] 검색이 클라이언트 사이드에서만 동작
**파일**: `src/pages/community/CommunityBoard.tsx:51-57`

현재 검색은 이미 로드된 게시글 배열을 필터링. 게시글 수가 많아지면 전체 데이터를 내려받은 뒤 필터하므로 성능 저하 발생. Supabase에서 서버 사이드 검색(`ilike`)으로 전환 필요.

---

### [낮음] README Supabase 설정 불완전
`vibe_comments`, `vibe_likes`, `user_profiles` 테이블의 SQL이 누락. `vibe_posts`만 문서화되어 있음.

---

### [낮음] `shop.css` 데드 코드
`src/styles/shop.css`가 존재하지만 `site.ts`에서 `features.shop: false`로 비활성화되어 있고, 어디에도 사용되지 않음.

---

## 4. 아키텍처 평가

| 항목 | 평가 | 비고 |
|------|------|------|
| 컴포넌트 구조 | 양호 | 관심사 분리 잘 되어 있음 |
| Context API 활용 | 양호 | Auth/Theme/Language/Toast 분리 |
| Supabase 폴백 | 양호 | 환경변수 없어도 로컬 동작 가능 |
| 타입 안전성 | 양호 | TypeScript 전반 적용 |
| 검색 성능 | 개선 필요 | 클라이언트 사이드 한계 |
| 에러 핸들링 | 부분적 | 일부 try/catch만 처리, UI 피드백 없음 |
| DB 스키마 일관성 | 수정 완료 | 댓글 테이블명 불일치 해결 |

---

## 5. 추가 개발 권고사항 (우선순위 순)

1. **단기**: 서버 사이드 검색 전환, README Supabase 설정 완성
2. **중기**: 관리자 페이지(공지 작성, 게시글 관리), 프로필 이미지 업로드, 알림 기능
3. **장기**: 무한 스크롤 or 가상화(게시글 수 증가 대비), 실시간 알림(Supabase Realtime)
