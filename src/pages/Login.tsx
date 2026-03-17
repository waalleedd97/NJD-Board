import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle, Languages, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export function Login() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { login, loginError, clearError } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    clearError();
  }, [username, password, clearError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      login(username.trim(), password);
      setIsLoading(false);
    }, 600);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE] dark:from-night dark:via-night dark:to-[#1A1040] p-4 relative">
      {/* Background decorations */}
      <div className="absolute top-0 start-0 w-96 h-96 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 end-0 w-80 h-80 rounded-full bg-purple-300/10 dark:bg-purple-500/5 blur-3xl" />

      {/* Top controls */}
      <div className="absolute top-4 end-4 flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-muted hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
          aria-label={isDark ? (isAr ? 'الوضع الفاتح' : 'Light mode') : (isAr ? 'الوضع الداكن' : 'Dark mode')}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
          aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Languages size={16} />
          {i18n.language === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 mb-4"
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img src="/njd-logo.png" alt="NJD Games" className="w-20 h-20 object-contain" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-white">NJD Board</h1>
          <p className="text-sm text-muted dark:text-gray-400 mt-1">
            {isAr ? 'منصة إدارة المشاريع الداخلية' : 'Internal Project Management Platform'}
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl p-8 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-lg font-bold text-ink dark:text-white mb-6">
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ink dark:text-white mb-1.5">
                {isAr ? 'اسم المستخدم' : 'Username'}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isAr ? 'أدخل اسم المستخدم' : 'Enter your username'}
                className="
                  w-full h-11 px-4 rounded-xl text-sm
                  bg-gray-50 dark:bg-white/5
                  border border-gray-200 dark:border-white/10
                  focus:border-primary dark:focus:border-night-accent
                  focus:ring-2 focus:ring-primary/20 dark:focus:ring-night-accent/20
                  text-ink dark:text-white
                  placeholder:text-muted
                  outline-none transition-all duration-200
                "
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink dark:text-white mb-1.5">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className="
                    w-full h-11 px-4 pe-11 rounded-xl text-sm
                    bg-gray-50 dark:bg-white/5
                    border border-gray-200 dark:border-white/10
                    focus:border-primary dark:focus:border-night-accent
                    focus:ring-2 focus:ring-primary/20 dark:focus:ring-night-accent/20
                    text-ink dark:text-white
                    placeholder:text-muted
                    outline-none transition-all duration-200
                  "
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {loginError && (
              <motion.div
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  {isAr ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password'}
                </span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="
                w-full h-11 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-primary to-primary-dark
                hover:shadow-lg hover:shadow-primary/25
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <LogIn size={18} />
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

