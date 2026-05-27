import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, type Post } from '../utils/community';

const CATEGORIES = [
  { key: 'study', label: '공부일지', icon: '📚', desc: '오늘 배운 내용을 기록해요' },
  { key: 'practice', label: '실습공유', icon: '💻', desc: '만든 프로젝트를 공유해요' },
  { key: 'qna', label: '질문/답변', icon: '❓', desc: '모르는 것을 함께 해결해요' },
  { key: 'free', label: '자유토론', icon: '💬', desc: '자유롭게 이야기해요' },
];

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return d.toLocaleDateString('ko-KR');
};

const categoryLabel: Record<string, string> = {
  study: '공부일지', practice: '실습공유', qna: '질문/답변', free: '자유토론', notice: '공지'
};

const Home = (): ReactElement => {
  const { isLoggedIn } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then((posts) => {
      setRecentPosts(posts.slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero-section" style={{ background: 'var(--hero-bg)', padding: 'calc(var(--nav-height) + 80px) 0 80px', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <div style={{ marginBottom: '16px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', fontSize: '14px', fontWeight: 600 }}>
              바이브코딩 학습 커뮤니티
            </span>
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Vibe Coding<br />
            <span style={{ background: 'linear-gradient(135deg, #93C5FD, #BFDBFE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Community
            </span>
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            바이브코딩 공부·실습 경험을 공유하고<br />
            함께 성장하는 커뮤니티입니다
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/board" className="btn btn-primary-large" style={{ fontSize: '16px', padding: '14px 32px' }}>
              게시판 보기
            </Link>
            {isLoggedIn ? (
              <Link to="/board/write" className="btn btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontSize: '16px', padding: '14px 32px' }}>
                글쓰기
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontSize: '16px', padding: '14px 32px' }}>
                회원가입
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리 카드 */}
      <section style={{ padding: '80px 0', background: 'var(--bg-light-gray)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '48px' }}>
            <h2 className="section-title">커뮤니티 게시판</h2>
            <p className="section-subtitle">다양한 주제로 바이브코딩 경험을 나눠보세요</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={`/board?category=${cat.key}`}
                className="home-category-card"
              >
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{cat.label}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: 1.5 }}>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 최근 게시글 */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>최근 게시글</h2>
            <Link to="/board" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
              전체 보기 →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : recentPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>아직 게시글이 없습니다.</p>
              {isLoggedIn && (
                <Link to="/board/write" className="btn btn-primary">첫 번째 글 작성하기</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/board/${post.id}`}
                  className="home-recent-post-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                      fontSize: '11px', fontWeight: 700, background: 'rgba(27,42,74,0.08)',
                      color: 'var(--primary-blue)'
                    }}>
                      {categoryLabel[post.category] || post.category}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                    marginBottom: '8px', lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {post.title}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)' }}>
                    <span>{post.author_name}</span>
                    <span style={{ display: 'flex', gap: '12px' }}>
                      <span>조회 {post.views}</span>
                      <span>댓글 {post.comment_count}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
