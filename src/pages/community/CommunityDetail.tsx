import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getPost, deletePost, incrementViews, toggleLike, type Post } from '../../utils/community';
import CommentSection from '../../components/CommentSection';

const categoryLabel: Record<string, string> = {
  study: '공부일지', practice: '실습공유', qna: '질문/답변', free: '자유토론', notice: '공지'
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const CommunityDetail = (): ReactElement => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const loadPost = useCallback(async () => {
    if (!id) return;
    const data = await getPost(Number(id));
    if (!data) {
      showToast('게시글을 찾을 수 없습니다.', 'error');
      navigate('/board');
      return;
    }
    setPost(data);
    setLoading(false);
    await incrementViews(Number(id));
  }, [id, navigate, showToast]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    const success = await deletePost(Number(id));
    if (success) {
      showToast('게시글이 삭제되었습니다.', 'success');
      navigate('/board');
    } else {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const handleLike = async () => {
    if (!user) { showToast('좋아요는 로그인 후 가능합니다.', 'info'); return; }
    if (liking || !post) return;
    setLiking(true);
    try {
      const newLikes = await toggleLike(post.id, user.id);
      setPost(prev => prev ? { ...prev, likes: newLikes } : prev);
      setLiked(!liked);
    } catch {
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setLiking(false);
    }
  };

  const canEdit = post && user && (post.author_id === user.id || isAdmin);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!post) return <></>;

  return (
    <div style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* 뒤로가기 */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/board" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            게시판으로 돌아가기
          </Link>
        </div>

        <div className="board-detail">
          <div className="board-detail-header">
            <div className="board-detail-category">
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                fontSize: '12px', fontWeight: 700,
                background: post.category === 'notice' ? '#FEF2F2' : 'rgba(27,42,74,0.08)',
                color: post.category === 'notice' ? '#DC2626' : 'var(--primary-blue)'
              }}>
                {categoryLabel[post.category] || post.category}
              </span>
            </div>
            <h1 className="board-detail-title">{post.title}</h1>
            <div className="board-detail-meta">
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {post.author_name}
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatDate(post.created_at)}
              </span>
              <span>조회 {post.views}</span>
              <span>좋아요 {post.likes}</span>
              <span>댓글 {post.comment_count}</span>
            </div>
          </div>

          <div className="board-detail-body">
            <div className="markdown-body" style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          <div className="board-detail-footer">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLike}
              disabled={liking}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${liked ? 'var(--primary-blue)' : 'var(--border-light)'}`,
                background: liked ? 'rgba(27,42,74,0.08)' : 'var(--bg-white)',
                color: liked ? 'var(--primary-blue)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s'
              }}
            >
              <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              좋아요 {post.likes}
            </button>

            {/* 수정/삭제 */}
            {canEdit && (
              <div className="board-detail-actions">
                <Link to={`/board/${post.id}/edit`} className="board-btn">수정</Link>
                <button className="board-btn danger" onClick={handleDelete}>삭제</button>
              </div>
            )}
          </div>
        </div>

        {/* 댓글 */}
        <CommentSection postId={post.id} postType="community" />

        {/* 목록으로 */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link to="/board" className="board-btn">목록으로</Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
