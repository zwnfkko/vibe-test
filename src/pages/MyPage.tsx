import { useState, useEffect, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../utils/auth';

const MyPage = (): ReactElement => {
  const { t } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.display_name || '' });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (user) {
        await updateProfile(user.id, { display_name: form.displayName });
        await refreshProfile();
        setMessage(t('auth.profileUpdated'));
        setEditing(false);
      }
    } catch {
      setMessage('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitial = (profile?.display_name || profile?.email || '?')[0].toUpperCase();

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 40px) 0 80px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px', color: 'var(--text-primary)' }}>
          {t('auth.myPage')}
        </h1>

        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          {/* 아바타 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--primary-blue)', color: '#fff',
              fontSize: '28px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {userInitial}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile?.display_name || t('auth.noName')}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>{profile?.email}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                {profile?.provider === 'google' ? 'Google 계정' : profile?.provider === 'kakao' ? 'Kakao 계정' : '이메일 계정'}
              </div>
            </div>
          </div>

          {/* 프로필 편집 */}
          {editing ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  표시 이름
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '15px', color: 'var(--text-primary)', background: 'var(--bg-white)' }}
                />
              </div>
              {message && <p style={{ fontSize: '13px', color: '#16a34a', marginBottom: '12px' }}>{message}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSave} disabled={saving} className="board-btn primary">
                  {saving ? '저장 중...' : t('auth.save')}
                </button>
                <button onClick={() => { setEditing(false); setMessage(''); }} className="board-btn">취소</button>
              </div>
            </div>
          ) : (
            <div>
              {message && <p style={{ fontSize: '13px', color: '#16a34a', marginBottom: '12px' }}>{message}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(true)} className="board-btn">{t('auth.editProfile')}</button>
                <Link to="/board/write" className="board-btn primary">글쓰기</Link>
                <Link to="/board" className="board-btn">게시판 보기</Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-light)', fontSize: '14px', textDecoration: 'none' }}>← 홈으로</Link>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '14px' }}>
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
