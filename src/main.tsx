import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';

// Restore saved theme before first paint (default: light)
const saved = localStorage.getItem('theme');
if (saved === 'dark') {
  document.documentElement.classList.add('dark');
}

// Restore saved language direction
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
