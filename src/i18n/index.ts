import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

// Cookie is the single source of truth for cross-subdomain language sync.
// Read it FIRST, before any localStorage fallback.
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const cookieLang = getCookie('njd-lang');
if (cookieLang) {
  localStorage.setItem('njd-lang', cookieLang);
  localStorage.setItem('i18nextLng', cookieLang);
}

const lang = cookieLang || localStorage.getItem('i18nextLng') || 'ar';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: lang,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
