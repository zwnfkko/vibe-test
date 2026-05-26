import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createPost, updatePost, getPost } from '../../utils/community';

const CATEGORIES = [
  { key: 'study', label: '공부일지' },
  { key: 'practice', label: '실습공유' },
  { key: 'qna', label: '질문/답변' },
  { key: 'free', label: '자유토론' },
];

const CommunityWrite = (): ReactElement => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('study');
  const [submitting, setSubmitting] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPost(Number(id)).then((post) => {
      if (!post) {
        showToast('게시글을 찾을 수 없습니다.', 'error');
        navigate('/board');
        return;
      }
      if (post.author_id !== user?.id) {
        showToast('수정 권한이 없습니다.', 'error');
        navigate(`/board/${id}`);
        return;
      }
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setLoadingPost(false);
    });
  }, [id, isEdit, user, navigate, showToast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast('제목을 입력해주세요.', 'error'); return; }
    if (!content.trim()) { showToast('내용을 입력해주세요.', 'error'); return; }
    if (!user) { showToast('로그인이 필요합니다.', 'error'); return; }

    setSubmitting(true);
    try {
      const authorName = profile?.display_name || user.email?.split('@')[0] || '익명';

      if (isEdit) {
        await updatePost(Number(id), { title: title.trim(), content: content.trim(), category });
        showToast('게시글이 수정되었습니다.', 'success');
        navigate(`/board/${id}`);
      } else {
        const post = await createPost({
          title: title.trim(),
          content: content.trim(),
          category,
          author_id: user.id,
          author_name: authorName,
        });
        showToast('게시글이 등록되었습니다.', 'success');
        navigate(`/board/${post.id}`);
      }
    } catch (err) {
      console.error('Post submit error:', err);
      showToast('게시글 저장에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h2>{isEdit ? '게시글 수정' : '글쓰기'}</h2>
          <p>{isEdit ? '게시글을 수정합니다.' : '바이브코딩 경험을 공유해보세요.'}</p>
        </div>
      </div>

      <div style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <form className="board-write" onSubmit={handleSubmit}>
            <h2>{isEdit ? '게시글 수정' : '새 게시글 작성'}</h2>

            <div className="board-form-row">
              <div className="board-form-group">
                <label>카테고리</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="board-form-group" style={{ opacity: 0.6 }}>
                <label>작성자</label>
                <input
                  type="text"
                  value={profile?.display_name || user?.email?.split('@')[0] || ''}
                  readOnly
                  style={{ cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="board-form-group">
              <label>제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="board-form-group">
              <label>내용</label>
              <textarea
                placeholder="내용을 입력하세요. 마크다운 문법을 지원합니다.&#10;&#10;예시:&#10;**굵은 글씨** `코드` # 제목&#10;```&#10;코드 블록&#10;```"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                마크다운 문법을 지원합니다. **굵게**, *기울임*, `코드`, ## 제목, - 목록 등
              </p>
            </div>

            <div className="board-form-actions">
              <button type="button" className="board-btn" onClick={() => navigate(-1)}>취소</button>
              <button type="submit" className="board-btn primary" disabled={submitting}>
                {submitting
                  ? (isEdit ? '수정 중...' : '등록 중...')
                  : (isEdit ? '수정하기' : '등록하기')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CommunityWrite;
