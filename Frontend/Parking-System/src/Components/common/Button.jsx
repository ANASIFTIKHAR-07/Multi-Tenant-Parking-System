import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary:   'bg-slate-900 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus:ring-slate-700 dark:focus:ring-slate-300 rounded-xl shadow-sm',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:ring-slate-400 rounded-xl',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 focus:ring-emerald-500 rounded-xl shadow-sm',
    danger:    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 focus:ring-red-500 rounded-xl shadow-sm',
    outline:   'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:ring-slate-400 rounded-xl',
    gradient:  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-blue-500 rounded-2xl border-0',
    gradientOutline: 'bg-transparent text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent bg-origin-border hover:shadow-lg transform hover:scale-105 focus:ring-blue-500 rounded-2xl',
    soft:    'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:ring-slate-400 rounded-xl',
    premium: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-purple-500 rounded-2xl border-0',
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Special handling for gradient outline — uses CSS var so it works in both themes
  const isGradientOutline = variant === 'gradientOutline';
  const gradientOutlineStyle = isGradientOutline ? {
    background: 'linear-gradient(var(--go-bg, white), var(--go-bg, white)) padding-box, linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)) border-box'
  } : {};

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.medium} ${className}`}
      style={gradientOutlineStyle}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;