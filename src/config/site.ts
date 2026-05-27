import type { SiteConfig } from '../types';

const site: SiteConfig = {
  id: 'vibe-community',

  name: 'Vibe Coding Community',
  nameKo: '바이브코딩 커뮤니티',
  description: '바이브코딩 공부·실습을 공유하고 의견을 나누는 커뮤니티',
  url: 'https://vibe-community.dreamitbiz.com',

  dbPrefix: 'vibe_',

  parentSite: {
    name: 'DreamIT Biz',
    url: 'https://www.dreamitbiz.com'
  },

  brand: {
    parts: [
      { text: 'Vibe', className: 'brand-dream' },
      { text: ' Coding', className: 'brand-it' },
      { text: ' Community', className: 'brand-biz' }
    ]
  },

  themeColor: '#1B2A4A',

  company: {
    name: '드림아이티비즈(DreamIT Biz)',
    ceo: '이애본',
    bizNumber: '601-45-20154',
    salesNumber: '제2024-수원팔달-0584호',
    publisherNumber: '제2026-000026호',
    address: '경기도 수원시 팔달구 매산로 45, 419호',
    email: 'aebon@dreamitbiz.com',
    phone: '010-3700-0629',
    kakao: 'aebon',
    businessHours: '평일: 09:00 ~ 18:00',
  },

  features: {
    shop: false,
    community: true,
    search: true,
    auth: true,
    license: false,
  },

  colors: [
    { name: 'blue', color: '#1B2A4A' },
    { name: 'red', color: '#C8102E' },
    { name: 'green', color: '#00855A' },
    { name: 'purple', color: '#5B2C8B' },
    { name: 'orange', color: '#D4760A' },
  ],

  menuItems: [
    { path: '/', labelKey: 'site.nav.home', activePath: '/' },
    {
      labelKey: 'site.nav.community',
      path: '/board',
      activePath: '/board',
      dropdown: [
        { path: '/board', labelKey: 'site.nav.boardAll' },
        { path: '/board?category=study', labelKey: 'site.nav.boardStudy' },
        { path: '/board?category=practice', labelKey: 'site.nav.boardPractice' },
        { path: '/board?category=qna', labelKey: 'site.nav.boardQna' },
        { path: '/board?category=free', labelKey: 'site.nav.boardFree' },
      ]
    },
    { path: '/board/write', labelKey: 'site.nav.write', activePath: '/board/write' },
  ],

  footerLinks: [
    { path: '/', labelKey: 'site.nav.home' },
    { path: '/board', labelKey: 'site.nav.community' },
    { path: '/board/write', labelKey: 'site.nav.write' },
  ],

  familySites: [
    { name: 'KDN 바이브코딩 교육', url: 'https://kdn.dreamitbiz.com' },
    { name: 'AI 프롬프트 교육', url: 'https://ai-prompt.dreamitbiz.com' },
    { name: 'Claude Code 교육', url: 'https://claude-code.dreamitbiz.com' }
  ]
};

export default site;
