import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Check, CheckCircle, AlertTriangle,
  FolderKanban, Columns3, Palette, Users, Timer,
  Trash2, ArrowRight, ArrowLeft, RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { parseCSV, readFileAsText } from '../lib/csvParser';
import { processImport } from '../lib/hacknplanMapper';
import { useDataStore } from '../store/useDataStore';
import type { ParsedCSV } from '../lib/csvParser';
import type { ImportResult } from '../lib/hacknplanMapper';

export function Import() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { projects, tasks, designItems, teamMembers, sprints, importData, clearAll } = useDataStore();

  const handleFile = useCallback(
    async (f: File) => {
      setError('');
      if (!f.name.toLowerCase().endsWith('.csv')) {
        setError(isAr ? 'يرجى تحميل ملف CSV فقط' : 'Please upload a CSV file');
        return;
      }
      try {
        const text = await readFileAsText(f);
        const csv = parseCSV(text);
        if (csv.rows.length === 0) {
          setError(isAr ? 'الملف فارغ أو غير صالح' : 'File is empty or invalid');
          return;
        }
        setFile(f);
        setParsed(csv);
        setResult(processImport(csv.rows, csv.headers, projects, teamMembers));
        setStep(2);
      } catch {
        setError(isAr ? 'خطأ في قراءة الملف' : 'Error reading file');
      }
    },
    [isAr, projects, teamMembers],
  );

  const handleImport = useCallback(() => {
    if (!result) return;
    importData({
      projects: result.projects,
      tasks: result.tasks,
      designItems: result.designItems,
      teamMembers: result.teamMembers,
      sprints: result.sprints,
    });
    setStep(3);
  }, [result, importData]);

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsed(null);
    setResult(null);
    setError('');
  };

  const totalExisting = projects.length + tasks.length + designItems.length + teamMembers.length + sprints.length;

  return (
    <div className="min-h-screen">


      <div className="p-6 space-y-6 max-w-[900px]">
        <StepIndicator current={step} isAr={isAr} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <UploadStep isAr={isAr} error={error} isDragging={isDragging} setIsDragging={setIsDragging} onFile={handleFile} />
            </motion.div>
          )}
          {step === 2 && parsed && result && (
            <motion.div key="preview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <PreviewStep isAr={isAr} file={file!} parsed={parsed} result={result} onBack={handleReset} onImport={handleImport} />
            </motion.div>
          )}
          {step === 3 && result && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CompleteStep isAr={isAr} result={result} onReset={handleReset} onNavigate={navigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {totalExisting > 0 && step === 1 && (
          <GlassCard delay={0.3}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-ink dark:text-white mb-1">
                  {isAr ? 'البيانات الحالية' : 'Existing Data'}
                </h4>
                <p className="text-xs text-muted dark:text-gray-400">
                  {projects.length} {isAr ? 'مشاريع' : 'projects'} · {tasks.length} {isAr ? 'مهام' : 'tasks'} · {designItems.length} {isAr ? 'عناصر تصميم' : 'design items'} · {teamMembers.length} {isAr ? 'أعضاء' : 'members'}
                </p>
              </div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500">{isAr ? 'هل أنت متأكد؟' : 'Are you sure?'}</span>
                  <button
                    onClick={() => { clearAll(); setShowClearConfirm(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    {isAr ? 'نعم، احذف' : 'Yes, clear'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  {isAr ? 'مسح الكل' : 'Clear All'}
                </button>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────

function StepIndicator({ current, isAr }: { current: number; isAr: boolean }) {
  const steps = [
    { en: 'Upload', ar: 'رفع الملف' },
    { en: 'Preview', ar: 'معاينة' },
    { en: 'Complete', ar: 'اكتمال' },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((s, i) => {
        const num = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <div key={num} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-gray-200 dark:bg-white/10 text-muted'
                }`}
              >
                {done ? <Check size={16} /> : num}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${active ? 'text-ink dark:text-white' : 'text-muted'}`}>
                {isAr ? s.ar : s.en}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 rounded-full ${current > num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Upload Step ───────────────────────────────────────

function UploadStep({
  isAr, error, isDragging, setIsDragging, onFile,
}: {
  isAr: boolean;
  error: string;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <GlassCard delay={0.1}>
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          <motion.div animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}>
            <Upload size={48} className={`mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted'}`} />
          </motion.div>
          <h3 className="text-lg font-bold text-ink dark:text-white mb-2">
            {isAr ? 'اسحب ملف CSV هنا' : 'Drop your CSV file here'}
          </h3>
          <p className="text-sm text-muted dark:text-gray-400 mb-1">
            {isAr ? 'أو انقر لاختيار ملف من جهازك' : 'or click to browse from your device'}
          </p>
          <p className="text-xs text-muted/60 dark:text-gray-500">
            {isAr ? 'ملفات CSV من HacknPlan مدعومة' : 'HacknPlan CSV exports supported'}
          </p>
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-center gap-2 text-red-500">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard delay={0.15}>
          <div className="flex items-center gap-3 mb-2">
            <Icon3D icon={Columns3} color="blue" size="sm" />
            <h4 className="text-sm font-bold text-ink dark:text-white">
              {isAr ? 'المهام' : 'Work Items / Tasks'}
            </h4>
          </div>
          <p className="text-xs text-muted dark:text-gray-400">
            {isAr ? 'استيراد المهام مع الحالات والأولويات والمسؤولين والمواعيد' : 'Import tasks with statuses, priorities, assignees, and due dates'}
          </p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3 mb-2">
            <Icon3D icon={Palette} color="pink" size="sm" />
            <h4 className="text-sm font-bold text-ink dark:text-white">
              {isAr ? 'عناصر التصميم' : 'Design Documents'}
            </h4>
          </div>
          <p className="text-xs text-muted dark:text-gray-400">
            {isAr ? 'استيراد عناصر التصميم مع الفئات والحالات والمسؤولين' : 'Import design items with categories, statuses, and assignees'}
          </p>
        </GlassCard>
      </div>

      <GlassCard delay={0.25}>
        <h4 className="text-sm font-bold text-ink dark:text-white mb-3">
          {isAr ? 'يتم استخراجه تلقائياً من بياناتك' : 'Auto-extracted from your data'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-400">
            <FolderKanban size={14} className="text-primary shrink-0" />
            {isAr ? 'المشاريع (من عمود Board)' : 'Projects (from Board column)'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-400">
            <Users size={14} className="text-primary shrink-0" />
            {isAr ? 'الأعضاء (من Assigned User)' : 'Members (from Assigned User)'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-400">
            <Timer size={14} className="text-primary shrink-0" />
            {isAr ? 'السبرينتات (من Milestone)' : 'Sprints (from Milestone)'}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Preview Step ──────────────────────────────────────

function PreviewStep({
  isAr, file, parsed, result, onBack, onImport,
}: {
  isAr: boolean;
  file: File;
  parsed: ParsedCSV;
  result: ImportResult;
  onBack: () => void;
  onImport: () => void;
}) {
  const typeIcon = result.type === 'tasks' ? Columns3 : Palette;
  const typeColor = result.type === 'tasks' ? 'blue' : 'pink';

  return (
    <div className="space-y-6">
      <GlassCard delay={0.05}>
        <div className="flex items-center gap-3">
          <Icon3D icon={typeIcon} color={typeColor} size="md" />
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-white">
              {result.type === 'tasks' ? (isAr ? 'مهام' : 'Tasks') : (isAr ? 'عناصر تصميم' : 'Design Items')}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-400">
              <FileText size={12} />
              <span>{file.name}</span>
              <span>·</span>
              <span>{parsed.rows.length} {isAr ? 'صف' : 'rows'}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {result.projects.length > 0 && <MiniStat icon={FolderKanban} label={isAr ? 'مشاريع جديدة' : 'New Projects'} value={result.projects.length} color="purple" />}
        {result.teamMembers.length > 0 && <MiniStat icon={Users} label={isAr ? 'أعضاء جدد' : 'New Members'} value={result.teamMembers.length} color="green" />}
        {result.tasks.length > 0 && <MiniStat icon={Columns3} label={isAr ? 'مهام' : 'Tasks'} value={result.tasks.length} color="blue" />}
        {result.designItems.length > 0 && <MiniStat icon={Palette} label={isAr ? 'عناصر تصميم' : 'Design Items'} value={result.designItems.length} color="pink" />}
        {result.sprints.length > 0 && <MiniStat icon={Timer} label={isAr ? 'سبرينتات' : 'Sprints'} value={result.sprints.length} color="amber" />}
      </div>

      <GlassCard delay={0.1}>
        <h4 className="text-sm font-bold text-ink dark:text-white mb-3">
          {isAr ? 'معاينة البيانات' : 'Data Preview'}
        </h4>
        <div className="rounded-xl border border-gray-200/50 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5">
                  {parsed.headers.slice(0, 6).map((h) => (
                    <th key={h} className="text-start px-4 py-2.5 text-xs font-semibold text-muted dark:text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                  {parsed.headers.length > 6 && (
                    <th className="text-start px-4 py-2.5 text-xs font-semibold text-muted dark:text-gray-400">+{parsed.headers.length - 6}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-gray-200/30 dark:border-white/5">
                    {parsed.headers.slice(0, 6).map((h) => (
                      <td key={h} className="px-4 py-2.5 text-xs text-ink dark:text-gray-300 whitespace-nowrap max-w-[200px] truncate">
                        {row[h] || <span className="text-muted/40">—</span>}
                      </td>
                    ))}
                    {parsed.headers.length > 6 && <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > 5 && (
            <div className="px-4 py-2 text-[11px] text-muted dark:text-gray-500 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-200/30 dark:border-white/5">
              {isAr ? `و ${parsed.rows.length - 5} صف آخر...` : `and ${parsed.rows.length - 5} more rows...`}
            </div>
          )}
        </div>
      </GlassCard>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} />
          {isAr ? 'رجوع' : 'Back'}
        </button>
        <motion.button
          onClick={onImport}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAr ? 'استيراد البيانات' : 'Import Data'}
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Complete Step ─────────────────────────────────────

function CompleteStep({
  isAr, result, onReset, onNavigate,
}: {
  isAr: boolean;
  result: ImportResult;
  onReset: () => void;
  onNavigate: (path: string) => void;
}) {
  const total = result.tasks.length + result.designItems.length;

  return (
    <div className="space-y-6">
      <GlassCard delay={0.05}>
        <div className="text-center py-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-ink dark:text-white mb-2">
            {isAr ? 'تم الاستيراد بنجاح!' : 'Import Complete!'}
          </h3>
          <p className="text-sm text-muted dark:text-gray-400">
            {isAr ? `تم استيراد ${total} عنصر بنجاح` : `Successfully imported ${total} items`}
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {result.projects.length > 0 && <SummaryCard icon={FolderKanban} label={isAr ? 'مشاريع' : 'Projects'} value={result.projects.length} color="purple" />}
        {result.tasks.length > 0 && <SummaryCard icon={Columns3} label={isAr ? 'مهام' : 'Tasks'} value={result.tasks.length} color="blue" />}
        {result.designItems.length > 0 && <SummaryCard icon={Palette} label={isAr ? 'عناصر تصميم' : 'Design Items'} value={result.designItems.length} color="pink" />}
        {result.teamMembers.length > 0 && <SummaryCard icon={Users} label={isAr ? 'أعضاء فريق' : 'Team Members'} value={result.teamMembers.length} color="green" />}
        {result.sprints.length > 0 && <SummaryCard icon={Timer} label={isAr ? 'سبرينتات' : 'Sprints'} value={result.sprints.length} color="amber" />}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {result.tasks.length > 0 && <NavBtn onClick={() => onNavigate('/board')} icon={Columns3} label={isAr ? 'عرض اللوحة' : 'View Board'} />}
        {result.projects.length > 0 && <NavBtn onClick={() => onNavigate('/projects')} icon={FolderKanban} label={isAr ? 'عرض المشاريع' : 'View Projects'} />}
        {result.designItems.length > 0 && <NavBtn onClick={() => onNavigate('/design-items')} icon={Palette} label={isAr ? 'عرض التصميم' : 'View Design'} />}
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          <RotateCcw size={16} />
          {isAr ? 'استيراد ملف آخر' : 'Import Another'}
        </button>
      </div>
    </div>
  );
}

// ─── Small Components ──────────────────────────────────

function MiniStat({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: number; color: string }) {
  return (
    <GlassCard delay={0.08}>
      <div className="flex items-center gap-2">
        <Icon3D icon={Icon} color={color} size="sm" />
        <div>
          <p className="text-xl font-bold text-ink dark:text-white">{value}</p>
          <p className="text-[11px] text-muted dark:text-gray-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: number; color: string }) {
  return (
    <GlassCard delay={0.1}>
      <div className="flex items-center gap-3">
        <Icon3D icon={Icon} color={color} size="sm" />
        <div>
          <p className="text-2xl font-bold text-ink dark:text-white">{value}</p>
          <p className="text-xs text-muted dark:text-gray-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function NavBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary dark:text-night-accent bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
}
