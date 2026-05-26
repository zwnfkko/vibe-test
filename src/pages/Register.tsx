import { useState, type ReactElement, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signUp } from '../utils/auth';

const Register = (): ReactElement | null => {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError(t('auth.passwordMismatch')); return; }
    if (form.password.length < 6) { setError(t('auth.passwordTooShort')); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.displayName);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="auth-fullpage">
        <div className="auth-center-wrapper">
          <div className="auth-card-google">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 className="auth-heading">{t('auth.signUpSuccess')}</h2>
              <p className="auth-sub" style={{ marginBottom: '24px' }}>{t('auth.checkEmail')}</p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>{t('auth.goToLogin')}</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-fullpage">
      <div className="auth-center-wrapper">
        <div className="auth-card-google">
          <div className="auth-logo-area">
            <span className="brand-dream">Vibe</span>
            <span className="brand-it"> Coding</span>{' '}
            <span className="brand-biz">Community</span>
          </div>
          <h2 className="auth-heading">{t('auth.signUpTitle')}</h2>
          <p className="auth-sub">{t('auth.signUpSubtitle')}</p>

          <form onSubmit={handleSubmit} className="auth-email-form">
            <div className="auth-input-group">
              <input type="text" placeholder={t('auth.displayNamePlaceholder')} value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required autoFocus />
            </div>
            <div className="auth-input-group">
              <input type="email" placeholder={t('auth.emailPlaceholder')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder={t('auth.passwordPlaceholder')} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder={t('auth.passwordConfirmPlaceholder')} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-form-actions">
              <button type="submit" className="auth-next-btn" disabled={loading} style={{ width: '100%' }}>
                {loading ? t('auth.signingUp') : t('auth.signUp')}
              </button>
            </div>
          </form>

          <div className="auth-bottom-link">
            <span>{t('auth.hasAccount')}</span>
            <Link to="/login">{t('auth.login')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
