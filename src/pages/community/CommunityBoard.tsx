import { useState, useEffect, type ReactElement } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPosts, type Post } from '../../utils/community';
import Pagination from '../../components/Pagination';

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지' },
  { key: 'study', label: '공부일지' },
  { key: 'practice', label: '실습공유' },
  { key: 'qna', label: '질문/답변' },
  { key: 'free', label: '자유토론' },
];

const PAGE_SIZE = 15;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
};

const CommunityBoard = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    setPage(1);
    getPosts(category === 'all' ? undefined : category)
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const filteredPosts = searchQuery
    ? posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const pagedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (cat: string) => {
    const params: Record<string, string> = {};
    if (cat !== 'all') params.category = cat;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>커뮤니티 게시판</h2>
          <p>바이브코딩 학습 경험을 공유하고 함께 성장해요</p>
        </div>
      </div>

      <div style={{ padding: '48px 0', minHeight: '60vh' }}>
        <div className="container">
          {/* 상단: 카테고리 필터 + 글쓰기 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`gallery-filter-btn ${category === cat.key ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {isLoggedIn && (
              <Link to="/board/write" className="board-btn primary">+ 글쓰기</Link>
            )}
          </div>

          {/* 검색 결과 표시 */}
          {searchQuery && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--bg-light-gray)', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>"{searchQuery}"</strong> 검색 결과: {filteredPosts.length}건
              <button onClick={() => setSearchParams({})} style={{ marginLeft: '12px', color: 'var(--text-light)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                ✕ 검색 초기화
              </button>
            </div>
          )}

          {/* 게시글 목록 */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : pagedPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: '16px', marginBottom: '24px' }}>
                {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
              </p>
              {isLoggedIn && !searchQuery && (
                <Link to="/board/write" className="btn btn-primary">첫 번째 글 작성하기</Link>
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* 테이블 헤더 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px 80px 60px 80px',
                padding: '12px 20px',
                background: 'var(--bg-medium-gray)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <span>분류</span>
                <span>제목</span>
                <span>작성자</span>
                <span style={{ textAlign: 'center' }}>조회</span>
                <span style={{ textAlign: 'center' }}>좋아요</span>
                <span style={{ textAlign: 'right' }}>날짜</span>
              </div>

              {/* 게시글 행 */}
              {pagedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/board/${post.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 100px 80px 60px 80px',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-light)',
                    textDecoration: 'none',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--bg-light-gray)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <span>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                      fontSize: '11px', fontWeight: 700,
                      background: post.category === 'notice' ? '#FEF2F2' : 'rgba(27,42,74,0.08)',
                      color: post.category === 'notice' ? '#DC2626' : 'var(--primary-blue)'
                    }}>
                      {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
                    </span>
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '16px' }}>
                    {post.title}
                    {post.comment_count > 0 && (
                      <span style={{ marginLeft: '6px', fontSize: '12px', color: 'var(--primary-blue)' }}>
                        [{post.comment_count}]
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.author_name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'center' }}>{post.views}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'center' }}>{post.likes}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'right' }}>{formatDate(post.created_at)}</span>
                </Link>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityBoard;
