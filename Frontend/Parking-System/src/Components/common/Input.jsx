import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  variant = 'default',
  size = 'medium',
  icon = null,
  className = '',
  ...props
}) => {
  const baseInput = 'w-full bg-white dark:bg-slate-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-200';
  
  const variants = {
    // Original variant
    default: 'rounded-md border border-gray-300 focus:ring-blue-500 focus:border-slate-800',
    
    // New theme variants
    glass: 'rounded-xl border border-white border-opacity-30 bg-white dark:bg-slate-900 bg-opacity-90 backdrop-blur-sm focus:ring-blue-500 focus:border-slate-800 focus:bg-opacity-100',
    glassDark: 'rounded-xl border border-gray-600 border-opacity-40 bg-gray-900 bg-opacity-20 backdrop-blur-sm text-white placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500',
    soft: 'rounded-xl border-2 border-blue-100 dark:border-slate-800/20 bg-slate-50 dark:bg-blue-500/10 focus:ring-blue-500 focus:border-blue-300 focus:bg-white dark:bg-slate-900',
    premium: 'rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-50 to-purple-50 focus:ring-purple-500 focus:from-white focus:to-white shadow-lg',
    outline: 'rounded-lg border-2 border-gray-200 bg-transparent focus:ring-blue-500 focus:border-slate-800 hover:border-gray-300'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };
  
  const labelVariants = {
    default: 'text-gray-700',
    glass: 'text-white font-medium',
    glassDark: 'text-gray-200 font-medium',
    soft: 'text-blue-700 dark:text-blue-400 font-medium',
    premium: 'text-gray-700 font-semibold',
    outline: 'text-gray-700'
  };

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label className={`text-sm ${labelVariants[variant] ?? labelVariants.default}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5">
              {icon}
            </div>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            ${baseInput} 
            ${variants[variant] ?? variants.default} 
            ${sizes[size] ?? sizes.medium}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `}
          {...props}
        />
        {/* Focus ring for premium variant */}
        {variant === 'premium' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 focus-within:opacity-20 transition-opacity duration-200 pointer-events-none" />
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;