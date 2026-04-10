import React from 'react';

export default function FormField({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12px] font-semibold text-slate-600">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase = `w-full px-3.5 py-2.5 rounded-xl border text-[13px] text-slate-900 placeholder-slate-400 bg-white
  transition-all duration-150 outline-none hover:border-slate-300
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10`;

export function TextInput({ label, required, error, hint, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <input className={`${inputBase} ${error ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200'} ${className}`} {...props} />
    </FormField>
  );
}

export function SelectInput({ label, required, error, hint, children, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <select className={`${inputBase} ${error ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200'} appearance-none ${className}`} {...props}>
        {children}
      </select>
    </FormField>
  );
}

export function TextareaInput({ label, required, error, hint, className = '', ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <textarea rows={3} className={`${inputBase} ${error ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200'} resize-none ${className}`} {...props} />
    </FormField>
  );
}
