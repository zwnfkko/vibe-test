-- ============================================================
-- Vibe Coding Community - Supabase Setup SQL
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================================


-- ────────────────────────────────────────
-- 1. user_profiles
-- ────────────────────────────────────────
create table if not exists user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null default '',
  name            text not null default '',
  display_name    text not null default '',
  avatar_url      text not null default '',
  phone           text not null default '',
  provider        text not null default 'email',
  role            text not null default 'member',
  signup_domain   text not null default '',
  visited_sites   text[] not null default '{}',
  last_sign_in_at timestamptz,
  updated_at      timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

create policy "users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);


-- ────────────────────────────────────────
-- 2. vibe_posts
-- ────────────────────────────────────────
create table if not exists vibe_posts (
  id            bigserial primary key,
  title         text not null,
  content       text not null,
  category      text not null default 'free',
  author_id     uuid references auth.users(id) on delete set null,
  author_name   text not null,
  views         integer not null default 0,
  likes         integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table vibe_posts enable row level security;

create policy "anyone can read posts"
  on vibe_posts for select
  using (true);

create policy "auth users can insert posts"
  on vibe_posts for insert
  with check (auth.uid() = author_id);

create policy "authors can update posts"
  on vibe_posts for update
  using (auth.uid() = author_id);

create policy "authors can delete posts"
  on vibe_posts for delete
  using (auth.uid() = author_id);


-- ────────────────────────────────────────
-- 3. vibe_comments
-- ────────────────────────────────────────
create table if not exists vibe_comments (
  id          bigserial primary key,
  post_id     bigint not null references vibe_posts(id) on delete cascade,
  post_type   text not null default 'vibe',
  author_id   uuid references auth.users(id) on delete set null,
  author_name text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table vibe_comments enable row level security;

create policy "anyone can read comments"
  on vibe_comments for select
  using (true);

create policy "auth users can insert comments"
  on vibe_comments for insert
  with check (auth.uid() = author_id);

create policy "authors can delete comments"
  on vibe_comments for delete
  using (auth.uid() = author_id);


-- ────────────────────────────────────────
-- 4. vibe_likes
-- ────────────────────────────────────────
create table if not exists vibe_likes (
  id         bigserial primary key,
  post_id    bigint not null references vibe_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table vibe_likes enable row level security;

create policy "auth users can read likes"
  on vibe_likes for select
  using (auth.uid() = user_id);

create policy "auth users can insert likes"
  on vibe_likes for insert
  with check (auth.uid() = user_id);

create policy "auth users can delete likes"
  on vibe_likes for delete
  using (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 5. comment_count 자동 갱신 트리거
-- ────────────────────────────────────────
create or replace function sync_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update vibe_posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update vibe_posts set comment_count = greatest(0, comment_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger trg_comment_count
after insert or delete on vibe_comments
for each row execute function sync_comment_count();


-- ────────────────────────────────────────
-- 6. 조회수 증가 RPC
-- ────────────────────────────────────────
create or replace function increment_post_views(post_id bigint)
returns void language sql security definer as $$
  update vibe_posts set views = views + 1 where id = post_id;
$$;


-- ────────────────────────────────────────
-- 7. 사용자 상태 확인 RPC (계정 정지 기능용, 선택사항)
-- ────────────────────────────────────────
create or replace function check_user_status(target_user_id uuid, current_domain text)
returns json language sql security definer as $$
  select json_build_object('status', 'active');
$$;
