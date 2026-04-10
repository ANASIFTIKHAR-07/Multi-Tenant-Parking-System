import React from 'react';

const CFG = {
  ACTIVE:       { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200/60' },
  INACTIVE:     { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   ring: 'ring-slate-200/60'  },
  TERMINATED:   { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     ring: 'ring-red-200/60'    },
  CANCELLED:    { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500',  ring: 'ring-orange-200/60' },
  LOST:         { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-500',  ring: 'ring-yellow-200/60' },
  ASSIGNED:     { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    ring: 'ring-blue-200/60'   },
  POOL:         { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500',  ring: 'ring-violet-200/60' },
  RENTAL:       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  ring: 'ring-indigo-200/60' },
  AVAILABLE:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200/60'},
  IN_USE:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    ring: 'ring-blue-200/60'   },
  DEACTIVATED:  { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   ring: 'ring-slate-200/60'  },
  EXPIRED:      { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     ring: 'ring-red-200/60'    },
  NEAR_EXPIRED: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   ring: 'ring-amber-200/60'  },
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
