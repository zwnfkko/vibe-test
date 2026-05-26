import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import site from '../../config/site';
import type { ReactElement, ChangeEvent } from 'react';

const Footer = (): ReactElement => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-mark">Vibe Coding Community</div>
            <p className="footer-tag">
              바이브코딩 공부·실습을 함께 나누는 커뮤니티
            </p>
          </div>
          <div>
            <h5>{t('footer.quickLinks')}</h5>
            <ul>
              {site.footerLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.path}>{t(link.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>패밀리 사이트</h5>
            <ul>
              <li><a href={site.parentSite.url} target="_blank" rel="noopener noreferrer">{site.parentSite.name}</a></li>
              {site.familySites.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Family Site</h5>
            <div className="footer-family">
              <select
                defaultValue=""
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  if (e.target.value) window.open(e.target.value, '_blank');
                  e.target.value = '';
                }}
              >
                <option value="" disabled>바로가기</option>
                <option value={site.parentSite.url}>{site.parentSite.name}</option>
                {site.familySites.map((s, i) => (
                  <option key={i} value={s.url}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Vibe Coding Community &middot; All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
