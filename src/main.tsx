import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n'; // Must run first — reads cookie, syncs localStorage, inits i18n
import './index.css';
import App from './App';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// ── Theme: cookie is authoritative ──
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

// ── Language direction: read from what i18n already resolved ──
const lang = localStorage.getItem('i18nextLng') || 'ar';
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
