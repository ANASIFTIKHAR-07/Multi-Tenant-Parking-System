import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';

const CONFIG = {
  success: {
    bar:    'bg-emerald-500',
    icon:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    title:  'text-slate-900 dark:text-white',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bar:    'bg-red-500',
    icon:   'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    title:  'text-slate-900 dark:text-white',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bar:    'bg-amber-400',
    icon:   'bg-amber-50 text-amber-600',
    title:  'text-slate-900 dark:text-white',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    bar:    'bg-blue-500',
    icon:   'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    title:  'text-slate-900 dark:text-white',
    svg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIG[toast.type] || CONFIG.info;

  // Slide in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 w-full max-w-sm
        bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10
        border border-slate-200/80 overflow-hidden
        transition-all duration-300 ease-out
        ${visible && !leaving
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-8'
        }
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`} />

      {/* Icon */}
      <div className={`ml-4 mt-3.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
        {cfg.svg}
      </div>

      {/* Content */}
      <div className="flex-1 py-3.5 pr-2 min-w-0">
        <p className={`text-[13px] font-semibold leading-tight ${cfg.title}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="mt-3 mr-3 w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <Toast toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
