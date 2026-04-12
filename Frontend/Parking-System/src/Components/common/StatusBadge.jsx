import React from 'react';

const CFG = {
  ACTIVE:       { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', ring: 'ring-emerald-200/60 dark:ring-emerald-500/20' },
  INACTIVE:     { bg: 'bg-slate-100 dark:bg-slate-800',  text: 'text-slate-500 dark:text-slate-400',   dot: 'bg-slate-400',   ring: 'ring-slate-200/60 dark:ring-slate-700/80'  },
  TERMINATED:   { bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-700 dark:text-red-400',     dot: 'bg-red-500',     ring: 'ring-red-200/60 dark:ring-red-500/20'    },
  CANCELLED:    { bg: 'bg-orange-50 dark:bg-orange-500/10',  text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-500',  ring: 'ring-orange-200/60 dark:ring-orange-500/20' },
  LOST:         { bg: 'bg-yellow-50 dark:bg-yellow-500/10',  text: 'text-yellow-700 dark:text-yellow-400',  dot: 'bg-yellow-500',  ring: 'ring-yellow-200/60 dark:ring-yellow-500/20' },
  ASSIGNED:     { bg: 'bg-slate-50 dark:bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-500',    ring: 'ring-blue-200/60 dark:ring-blue-500/20'   },
  POOL:         { bg: 'bg-violet-50 dark:bg-violet-500/10',  text: 'text-violet-700 dark:text-violet-400',  dot: 'bg-violet-500',  ring: 'ring-violet-200/60 dark:ring-violet-500/20' },
  RENTAL:       { bg: 'bg-indigo-50 dark:bg-indigo-500/10',  text: 'text-indigo-700 dark:text-indigo-400',  dot: 'bg-indigo-500',  ring: 'ring-indigo-200/60 dark:ring-indigo-500/20' },
  AVAILABLE:    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', ring: 'ring-emerald-200/60 dark:ring-emerald-500/20'},
  IN_USE:       { bg: 'bg-slate-50 dark:bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-500',    ring: 'ring-blue-200/60 dark:ring-blue-500/20'   },
  DEACTIVATED:  { bg: 'bg-slate-100 dark:bg-slate-800',  text: 'text-slate-500 dark:text-slate-400',   dot: 'bg-slate-400',   ring: 'ring-slate-200/60 dark:ring-slate-700/80'  },
  EXPIRED:      { bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-700 dark:text-red-400',     dot: 'bg-red-500',     ring: 'ring-red-200/60 dark:ring-red-500/20'    },
  NEAR_EXPIRED: { bg: 'bg-amber-50 dark:bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500',   ring: 'ring-amber-200/60 dark:ring-amber-500/20'  },
};

export default function StatusBadge({ status, pulse = false }) {
  const c = CFG[status] || CFG.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
