import React from 'react';

const COLORS = {
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-100',   icon: 'bg-blue-600',    text: 'text-blue-700',    sub: 'text-blue-500'   },
  green:  { bg: 'bg-emerald-50', border: 'border-emerald-100',icon: 'bg-emerald-600', text: 'text-emerald-700', sub: 'text-emerald-500' },
  purple: { bg: 'bg-violet-50',  border: 'border-violet-100', icon: 'bg-violet-600',  text: 'text-violet-700',  sub: 'text-violet-500'  },
  orange: { bg: 'bg-orange-50',  border: 'border-orange-100', icon: 'bg-orange-500',  text: 'text-orange-700',  sub: 'text-orange-500'  },
  red:    { bg: 'bg-red-50',     border: 'border-red-100',    icon: 'bg-red-600',     text: 'text-red-700',     sub: 'text-red-500'     },
  indigo: { bg: 'bg-indigo-50',  border: 'border-indigo-100', icon: 'bg-indigo-600',  text: 'text-indigo-700',  sub: 'text-indigo-500'  },
  slate:  { bg: 'bg-slate-100',  border: 'border-slate-200',  icon: 'bg-slate-600',   text: 'text-slate-700',   sub: 'text-slate-500'   },
  teal:   { bg: 'bg-teal-50',    border: 'border-teal-100',   icon: 'bg-teal-600',    text: 'text-teal-700',    sub: 'text-teal-500'    },
};

export default function StatCard({ label, value, icon, color = 'blue', sub, trend }) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${c.bg} ${c.border} flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-2xl font-bold mt-1 leading-none ${c.text}`}>{value ?? '—'}</p>
        {sub && <p className={`text-[11px] mt-1.5 font-medium ${c.sub}`}>{sub}</p>}
        {trend !== undefined && (
          <p className={`text-[11px] font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
}
