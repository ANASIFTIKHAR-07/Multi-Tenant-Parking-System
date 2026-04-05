import React from 'react';

export default function Alert({ type = 'error', message, onDismiss }) {
  if (!message) return null;
  const cfg = {
    error:   { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   icon: 'text-red-500' },
    success: { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-800',icon: 'text-emerald-500' },
    warning: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
    info:    { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  icon: 'text-blue-500' },
  }[type];

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.icon}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <p className={`text-sm font-medium flex-1 ${cfg.text}`}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className={`${cfg.icon} hover:opacity-70 transition-opacity`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
