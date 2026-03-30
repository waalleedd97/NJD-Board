import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Palette,
  Languages,
  Sun,
  Moon,
  Check,
  Info,
  Shield,
} from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

type SettingsTab = 'appearance' | 'language' | 'about';

const tabs: { id: SettingsTab; icon: typeof Palette; labelEn: string; labelAr: string }[] = [
  { id: 'appearance', icon: Palette, labelEn: 'Appearance', labelAr: 'المظهر' },
  { id: 'language', icon: Languages, labelEn: 'Language', labelAr: 'اللغة' },
  { id: 'about', icon: Info, labelEn: 'About', labelAr: 'حول' },
];

export function Settings() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-[900px]">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar tabs */}
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-lavender dark:bg-primary/20 text-primary dark:text-night-accent'
                    : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                  }
                `}
              >
                <tab.icon size={18} />
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'language' && <LanguageSettings />}
            {activeTab === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const isAr = document.documentElement.lang === 'ar';
  const currentTheme = isDark ? 'dark' : 'light';

  const themes = [
    { id: 'light', icon: Sun, labelEn: 'Light', labelAr: 'فاتح' },
    { id: 'dark', icon: Moon, labelEn: 'Dark', labelAr: 'داكن' },
  ];

  return (
    <GlassCard delay={0.05}>
      <h3 className="text-lg font-bold text-ink dark:text-white mb-1">{t('settings.theme')}</h3>
      <p className="text-sm text-muted dark:text-gray-400 mb-5">
        {isAr ? 'اختر مظهر التطبيق المفضل لديك' : 'Choose your preferred app appearance'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => { if ((theme.id === 'dark') !== isDark) toggleTheme(); }}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200
                ${isActive
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              {isActive && (
                <span className="absolute top-3 end-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.id === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <theme.icon size={24} className={theme.id === 'dark' ? 'text-yellow-400' : 'text-amber-500'} />
              </div>
              <span className="text-sm font-medium text-ink dark:text-white">
                {isAr ? theme.labelAr : theme.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const languages = [
    { id: 'ar', label: 'العربية', desc: 'Arabic', flag: '🇸🇦' },
    { id: 'en', label: 'English', desc: 'الإنجليزية', flag: '🇺🇸' },
  ];

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <GlassCard delay={0.05}>
      <h3 className="text-lg font-bold text-ink dark:text-white mb-1">{t('settings.language')}</h3>
      <p className="text-sm text-muted dark:text-gray-400 mb-5">
        {isAr ? 'اختر لغة التطبيق' : 'Choose your app language'}
      </p>
      <div className="space-y-3">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => switchLanguage(lang.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${isActive
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex-1 text-start">
                <p className="text-sm font-semibold text-ink dark:text-white">{lang.label}</p>
                <p className="text-xs text-muted dark:text-gray-400">{lang.desc}</p>
              </div>
              {isActive && (
                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

function AboutSettings() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, role } = useAuthStore();

  return (
    <div className="space-y-4">
      {/* User Profile Card */}
      {user && (
        <GlassCard delay={0.05}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 flex items-center justify-center text-3xl">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink dark:text-white">
                {isAr ? user.nameAr : user.name}
              </h3>
              <p className="text-sm text-muted dark:text-gray-400">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield size={12} className="text-primary" />
                <span className="text-xs font-medium text-primary dark:text-night-accent capitalize">
                  {role === 'super_admin' ? (isAr ? 'مدير النظام' : 'Super Admin') : (isAr ? 'موظف' : 'Employee')}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* App Info */}
      <GlassCard delay={0.1}>
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="flex items-center justify-center w-14 h-14"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img src="/njd-logo.png" alt="NJD Games" className="w-14 h-14 object-contain" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-ink dark:text-white">NJD Board</h3>
            <p className="text-sm text-muted dark:text-gray-400">{t('settings.version')} 1.0.0</p>
          </div>
        </div>
        <p className="text-sm text-muted dark:text-gray-400">{t('settings.appDescription')}</p>
      </GlassCard>
    </div>
  );
}

