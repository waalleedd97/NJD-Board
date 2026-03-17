import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ClipboardList, CheckCircle2, Timer, AlertTriangle } from 'lucide-react';
import { Icon3D } from '../icons/Icon3D';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import type { KPI } from '../../data/mockData';

const iconMap: Record<string, typeof ClipboardList> = {
  clipboard: ClipboardList,
  'check-circle': CheckCircle2,
  timer: Timer,
  'alert-triangle': AlertTriangle,
};

const colorMap: Record<string, string> = {
  '#7C3AED': 'purple',
  '#10B981': 'green',
  '#3B82F6': 'blue',
  '#EF4444': 'red',
};

interface KPICardProps extends KPI {
  delay?: number;
}

export function KPICard({ labelEn, labelAr, value, change, color, icon, delay = 0 }: KPICardProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const animatedValue = useAnimatedNumber(value);

  const IconComp = iconMap[icon] ?? ClipboardList;
  const iconColor = colorMap[color] ?? 'purple';

  return (
    <motion.div
      className="
        rounded-[20px] p-5
        bg-white/80 dark:bg-surface/80
        backdrop-blur-xl
        border border-white/40 dark:border-white/5
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_40px_rgba(124,58,237,0.1)]
        transition-shadow duration-300
      "
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon3D icon={IconComp} color={iconColor} size="md" />
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            change >= 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change}
        </span>
      </div>

      <p className="text-3xl font-bold text-ink dark:text-white mb-1">
        {animatedValue}
      </p>
      <p className="text-sm text-muted dark:text-gray-400">
        {isAr ? labelAr : labelEn}
      </p>
    </motion.div>
  );
}
