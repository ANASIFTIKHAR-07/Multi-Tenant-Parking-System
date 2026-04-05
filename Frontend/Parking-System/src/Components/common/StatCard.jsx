import React from 'react';

export default function StatCard({ label, value, icon, color = 'blue', trend, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600',   text: 'text-blue-600',   ring: 'ring-blue-100' },
    green:  { bg: 'bg-emerald-50',icon: 'bg-emerald-600',text: 'text-emerald-600',ring: 'ring-emerald-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600', ring: 'ring-purple-100' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-100' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-600',    text: 'text-red-600',    ring: 'ring-red-100' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-600',  text: 'text-slate-600',  ring: 'ring-slate-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`rounded-2xl p-5 ${c.bg} ring-1 ${c.ring} flex items-start gap-4`}>
      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white w-5 h-5">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
}
