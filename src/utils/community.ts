import getSupabase, { TABLES } from './supabase';

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author_id: string;
  author_name: string;
  views: number;
  likes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostInput {
  title: string;
  content: string;
  category: string;
  author_id: string;
  author_name: string;
}

// 로컬 폴백 (Supabase 미설정 시)
let _localPosts: Post[] = [
  {
    id: 1,
    title: '[공지] 바이브코딩 커뮤니티에 오신 것을 환영합니다!',
    content: '바이브코딩 커뮤니티에 오신 것을 환영합니다.\n\n이 곳은 바이브코딩 공부·실습 경험을 공유하고 질문을 나누는 공간입니다.\n\n- 공부일지: 학습 내용 기록\n- 실습공유: 만든 프로젝트 공유\n- 질문/답변: 모르는 것 질문\n- 자유토론: 자유롭게 이야기',
    category: 'notice',
    author_id: 'admin',
    author_name: '운영자',
    views: 0,
    likes: 0,
    comment_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
let _nextId = 2;

export const getPosts = async (category?: string): Promise<Post[]> => {
  const client = getSupabase();
  if (!client) {
    if (category && category !== 'all') {
      return _localPosts.filter(p => p.category === category);
    }
    return [..._localPosts].reverse();
  }
  let query = client.from(TABLES.posts).select('*').order('created_at', { ascending: false });
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Post[];
};

export const getPost = async (id: number): Promise<Post | null> => {
  const client = getSupabase();
  if (!client) {
    return _localPosts.find(p => p.id === id) || null;
  }
  const { data, error } = await client.from(TABLES.posts).select('*').eq('id', id).single();
  if (error) return null;
  return data as Post;
};

export const createPost = async (input: PostInput): Promise<Post> => {
  const client = getSupabase();
  if (!client) {
    const post: Post = {
      id: _nextId++,
      ...input,
      views: 0,
      likes: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _localPosts.push(post);
    return post;
  }
  const { data, error } = await client.from(TABLES.posts).insert(input).select().single();
  if (error) throw error;
  return data as Post;
};

export const updatePost = async (id: number, input: Partial<PostInput>): Promise<Post | null> => {
  const client = getSupabase();
  if (!client) {
    const idx = _localPosts.findIndex(p => p.id === id);
    if (idx < 0) return null;
    _localPosts[idx] = { ..._localPosts[idx], ...input, updated_at: new Date().toISOString() };
    return _localPosts[idx];
  }
  const { data, error } = await client
    .from(TABLES.posts)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Post;
};

export const deletePost = async (id: number): Promise<boolean> => {
  const client = getSupabase();
  if (!client) {
    const before = _localPosts.length;
    _localPosts = _localPosts.filter(p => p.id !== id);
    return _localPosts.length < before;
  }
  const { error } = await client.from(TABLES.posts).delete().eq('id', id);
  return !error;
};

export const incrementViews = async (id: number): Promise<void> => {
  const client = getSupabase();
  if (!client) {
    const post = _localPosts.find(p => p.id === id);
    if (post) post.views += 1;
    return;
  }
  try { await client.rpc('increment_post_views', { post_id: id }); } catch { /* ignore */ }
};

export const toggleLike = async (postId: number, userId: string): Promise<number> => {
  const client = getSupabase();
  if (!client) {
    const post = _localPosts.find(p => p.id === postId);
    if (post) post.likes = (post.likes || 0) + 1;
    return post?.likes || 0;
  }
  const { data: existing } = await client
    .from(TABLES.likes)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  const { data: currentPost } = await client.from(TABLES.posts).select('likes').eq('id', postId).single();
  const currentLikes = (currentPost as Pick<Post, 'likes'> | null)?.likes || 0;

  if (existing) {
    await client.from(TABLES.likes).delete().eq('post_id', postId).eq('user_id', userId);
    await client.from(TABLES.posts).update({ likes: Math.max(0, currentLikes - 1) }).eq('id', postId);
    return Math.max(0, currentLikes - 1);
  } else {
    await client.from(TABLES.likes).insert({ post_id: postId, user_id: userId });
    await client.from(TABLES.posts).update({ likes: currentLikes + 1 }).eq('id', postId);
    return currentLikes + 1;
  }
};
