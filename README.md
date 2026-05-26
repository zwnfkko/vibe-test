# Vibe Coding Community

바이브코딩 공부·실습을 함께 나누는 커뮤니티 사이트

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend/Auth**: Supabase
- **Routing**: React Router v7
- **Markdown**: react-markdown + remark-gfm

## 주요 기능

- 게시판 (공부일지 / 실습공유 / 질문·답변 / 자유토론)
- 마크다운 글쓰기 & 게시글 수정/삭제
- 댓글 시스템
- 좋아요
- 회원가입 / 로그인 (이메일, Google, Kakao OAuth)
- 다크모드 & 컬러 테마
- 한국어/영어 지원
- 검색 기능

## 시작하기

### 1. 환경변수 설정

`.env.example`을 `.env`로 복사하고 Supabase 정보를 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 패키지 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5175` 접속

### 3. Supabase 데이터베이스 설정

Supabase에서 다음 테이블을 생성합니다:

#### vibe_posts
```sql
create table vibe_posts (
  id bigserial primary key,
  title text not null,
  content text not null,
  category text not null default 'free',
  author_id uuid references auth.users(id),
  author_name text not null,
  views integer default 0,
  likes integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table vibe_posts enable row level security;
create policy "anyone can read" on vibe_posts for select using (true);
create policy "auth users can insert" on vibe_posts for insert with check (auth.uid() = author_id);
create policy "authors can update" on vibe_posts for update using (auth.uid() = author_id);
create policy "authors can delete" on vibe_posts for delete using (auth.uid() = author_id);
```

#### comments (공용)
```sql
-- user_profiles 테이블도 kdn-main과 동일하게 사용
```

## GitHub 연동

```bash
cd C:\Users\User\ws\vibe-test
git init
git add .
git commit -m "init: vibe-test community site"
git remote add origin https://github.com/[username]/vibe-test.git
git push -u origin main
```

## 배포 (GitHub Pages)

```bash
npm install gh-pages --save-dev
# package.json에 homepage와 deploy 스크립트 추가 후:
npm run deploy
```
