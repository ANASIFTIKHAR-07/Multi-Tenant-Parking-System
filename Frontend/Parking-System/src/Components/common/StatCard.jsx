import React from 'react';

const COLORS = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',    border: 'border-blue-100 dark:border-blue-500/20',   icon: 'bg-blue-600',    text: 'text-blue-700 dark:text-blue-400',    sub: 'text-blue-500 dark:text-blue-400/80' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20',icon: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-400', sub: 'text-emerald-500 dark:text-emerald-400/80' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-500/10',  border: 'border-violet-100 dark:border-violet-500/20', icon: 'bg-violet-600',  text: 'text-violet-700 dark:text-violet-400',  sub: 'text-violet-500 dark:text-violet-400/80' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10',  border: 'border-orange-100 dark:border-orange-500/20', icon: 'bg-orange-500',  text: 'text-orange-700 dark:text-orange-400',  sub: 'text-orange-500 dark:text-orange-400/80' },
  red:    { bg: 'bg-red-50 dark:bg-red-500/10',     border: 'border-red-100 dark:border-red-500/20',    icon: 'bg-red-600',     text: 'text-red-700 dark:text-red-400',     sub: 'text-red-500 dark:text-red-400/80' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10',  border: 'border-indigo-100 dark:border-indigo-500/20', icon: 'bg-indigo-600',  text: 'text-indigo-700 dark:text-indigo-400',  sub: 'text-indigo-500 dark:text-indigo-400/80' },
  slate:  { bg: 'bg-slate-100 dark:bg-slate-800',  border: 'border-slate-200 dark:border-slate-700/80',  icon: 'bg-slate-600',   text: 'text-slate-700 dark:text-slate-300',   sub: 'text-slate-500 dark:text-slate-400' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-500/10',    border: 'border-teal-100 dark:border-teal-500/20',   icon: 'bg-teal-600',    text: 'text-teal-700 dark:text-teal-400',    sub: 'text-teal-500 dark:text-teal-400/80' },
};

export default function StatCard({ label, value, icon, color = 'blue', sub, trend }) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${c.bg} ${c.border} flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-2xl font-bold mt-1 leading-none ${c.text}`}>{value ?? '—'}</p>
        {sub && <p className={`text-[11px] mt-1.5 font-medium ${c.sub}`}>{sub}</p>}
        {trend !== undefined && (
          <p className={`text-[11px] font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
}
