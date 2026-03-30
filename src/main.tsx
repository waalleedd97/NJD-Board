import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// ── Sync shared cookies → localStorage before first paint ──

// Theme: cookie is authoritative (set by njd-navbar across subdomains)
const cookieTheme = getCookie('njd-theme');
if (cookieTheme) {
  localStorage.setItem('njd-theme', cookieTheme);
  localStorage.setItem('theme', cookieTheme);
}

const theme = cookieTheme || localStorage.getItem('njd-theme') || localStorage.getItem('theme');
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Language: cookie is authoritative
const cookieLang = getCookie('njd-lang');
if (cookieLang) {
  localStorage.setItem('njd-lang', cookieLang);
  localStorage.setItem('i18nextLng', cookieLang);
}

const lang = cookieLang || localStorage.getItem('i18nextLng') || 'ar';
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
