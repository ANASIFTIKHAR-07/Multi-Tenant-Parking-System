import React from 'react';

export default function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/25">
            <span className="text-white [&>svg]:w-4.5 [&>svg]:h-4.5">{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
