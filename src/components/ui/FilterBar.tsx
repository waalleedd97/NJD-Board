import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  labelEn: string;
  labelAr: string;
}

interface FilterSelectProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder: string;
}

function FilterSelect({ value, options, onChange, placeholder }: FilterSelectProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-10 px-3 pe-8
        rounded-xl text-sm
        bg-gray-100 dark:bg-white/5
        border border-transparent
        focus:border-primary dark:focus:border-night-accent
        text-ink dark:text-white
        outline-none transition-all duration-200
        appearance-none
        cursor-pointer
      "
      title={placeholder}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {isAr ? opt.labelAr : opt.labelEn}
        </option>
      ))}
    </select>
  );
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    placeholder: string;
  }[];
  searchPlaceholder?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filters = [],
  searchPlaceholder,
}: FilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={16}
          className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? t('common.search')}
          className="
            w-full h-10 ps-9 pe-4
            rounded-xl text-sm
            bg-gray-100 dark:bg-white/5
            border border-transparent
            focus:border-primary dark:focus:border-night-accent
            focus:bg-white dark:focus:bg-white/10
            text-ink dark:text-white
            placeholder:text-muted
            outline-none transition-all duration-200
          "
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted" />
          {filters.map((filter, i) => (
            <FilterSelect key={i} {...filter} />
          ))}
        </div>
      )}
    </div>
  );
}
