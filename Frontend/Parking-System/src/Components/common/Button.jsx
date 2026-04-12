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
    // Original variants
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 rounded-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600 rounded-md',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 rounded-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 rounded-md',
    outline: 'bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400 rounded-md',
    
    // New theme variants
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-blue-500 rounded-2xl border-0',
    gradientOutline: 'bg-transparent text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent bg-gradient-to-r bg-origin-border hover:shadow-lg transform hover:scale-105 focus:ring-blue-500 rounded-2xl',
    glass: 'backdrop-blur-xl bg-white dark:bg-slate-900 bg-opacity-10 border border-white border-opacity-20 text-white hover:bg-opacity-20 focus:ring-white focus:ring-opacity-50 rounded-2xl shadow-lg',
    glassDark: 'backdrop-blur-xl bg-black bg-opacity-10 border border-gray-700 border-opacity-30 text-gray-800 hover:bg-opacity-20 focus:ring-gray-500 rounded-2xl shadow-lg',
    soft: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 focus:ring-blue-500 rounded-xl',
    premium: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-purple-500 rounded-2xl border-0'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Special handling for gradient outline
  const isGradientOutline = variant === 'gradientOutline';
  const gradientOutlineStyle = isGradientOutline ? {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)) border-box'
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