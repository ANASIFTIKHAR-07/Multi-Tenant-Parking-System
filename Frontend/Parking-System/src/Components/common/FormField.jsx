import React from 'react';

export default function FormField({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ label, required, error, hint, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <input
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
          hover:border-slate-300 ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function SelectInput({ label, required, error, hint, children, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <select
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white transition-all outline-none appearance-none
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
          hover:border-slate-300 ${className}`}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
}

export function TextareaInput({ label, required, error, hint, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <textarea
        rows={3}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none resize-none
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
          hover:border-slate-300 ${className}`}
        {...props}
      />
    </FormField>
  );
}
