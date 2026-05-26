import { useState, type ReactElement, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { resetPassword } from '../utils/auth';

const ForgotPassword = (): ReactElement => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          <h2 className="auth-heading">{t('auth.forgotPasswordTitle')}</h2>
          <p className="auth-sub">{t('auth.forgotPasswordSubtitle')}</p>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>{t('auth.resetEmailSent')}</p>
              <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>{t('auth.checkEmailForReset')}</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>{t('auth.backToLogin')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-email-form">
              <div className="auth-input-group">
                <input type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-form-actions">
                <button type="submit" className="auth-next-btn" disabled={loading} style={{ width: '100%' }}>
                  {loading ? t('auth.sending') : t('auth.sendResetLink')}
                </button>
              </div>
              <div className="auth-bottom-link" style={{ justifyContent: 'center' }}>
                <Link to="/login">{t('auth.backToLogin')}</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
