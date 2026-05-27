import { useState, useEffect, useRef, type ReactElement, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import site from '../../config/site';
import type { MenuItem } from '../../types';

interface ResolvedMenuItem extends MenuItem {
  label: string;
  dropdown?: (MenuItem & { label: string })[];
}

const Navbar = (): ReactElement => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isLoggedIn, isAdmin, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowUserMenu(false);
    setShowSearch(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/board?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const menuItems: ResolvedMenuItem[] = site.menuItems.map((item) => ({
    ...item,
    label: t(item.labelKey),
    dropdown: item.dropdown
      ? item.dropdown.map((sub) => ({ ...sub, label: t(sub.labelKey) }))
      : undefined
  }));

  const isActive = (item: ResolvedMenuItem): boolean => {
    const checkPath = item.activePath || item.path;
    if (checkPath === '/') return location.pathname === '/';
    return location.pathname.startsWith(checkPath);
  };

  const userInitial = (profile?.display_name || profile?.email || '?')[0].toUpperCase();

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span className="topbar-tag">바이브코딩 커뮤니티</span>
          </div>
          <div className="topbar-right">
            <button onClick={toggleLanguage}>{language === 'ko' ? 'KR / EN' : 'EN / KR'}</button>
          </div>
        </div>
      </div>

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <Link to="/">
                <span className="brand-mark">
                  Vibe<span className="brand-accent"> Coding</span>
                  <span style={{ fontWeight: 400, opacity: 0.7 }}> Community</span>
                </span>
              </Link>
            </div>

            <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`${item.dropdown ? 'nav-item-dropdown' : ''} ${activeDropdown === index ? 'active' : ''}`}
                  onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                  onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                >
                  {item.dropdown ? (
                    <>
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive(item) ? 'active' : ''}`}
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                          if (window.innerWidth <= 1100) {
                            e.preventDefault();
                            setActiveDropdown(activeDropdown === index ? null : index);
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                      <ul className={`dropdown-menu ${activeDropdown === index ? 'active' : ''}`}>
                        {item.dropdown.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link to={subItem.path}>{subItem.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link to={item.path} className={`nav-link ${isActive(item) ? 'active' : ''}`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="nav-actions">
              {/* 검색 */}
              {showSearch ? (
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="검색..."
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      width: '160px',
                      background: 'var(--bg-white)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button type="submit" className="nav-search-btn" aria-label="검색">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  <button type="button" className="nav-search-btn" onClick={() => setShowSearch(false)} aria-label="닫기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button className="nav-search-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}

              {/* 글쓰기 버튼 */}
              {isLoggedIn && (
                <Link to="/board/write" className="nav-login-btn" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  + 글쓰기
                </Link>
              )}

              {/* 다크 모드 */}
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Theme toggle">
                {mode === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* 유저 메뉴 */}
              {isLoggedIn ? (
                <div className="nav-user-menu" ref={userMenuRef}>
                  <button className="nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <span className="nav-user-avatar-placeholder">{userInitial}</span>
                  </button>
                  {showUserMenu && (
                    <div className="nav-user-dropdown">
                      <div className="dropdown-user-header">
                        <span className="dropdown-user-avatar">{userInitial}</span>
                        <div className="dropdown-user-info">
                          <span className="dropdown-user-name">{profile?.display_name || ''}</span>
                          <span className="dropdown-user-email">{profile?.email || ''}</span>
                        </div>
                      </div>
                      <div className="divider" />
                      <Link to="/mypage" className="dropdown-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        마이페이지
                      </Link>
                      <Link to="/board/write" className="dropdown-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        글쓰기
                      </Link>
                      {isAdmin && (
                        <a href={site.parentSite.url + '/admin'} className="dropdown-menu-item" target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                          </svg>
                          관리자
                        </a>
                      )}
                      <div className="divider" />
                      <button onClick={handleSignOut} className="dropdown-menu-item logout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="nav-login-btn">로그인</Link>
              )}

              <button
                className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="메뉴 토글"
              >
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
