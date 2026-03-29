import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '' 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-xl',
    large: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl'
  };

  const overlayVariants = {
    default: 'bg-black/50',
    glass: 'bg-black/30 backdrop-blur-sm',
    dark: 'bg-black/70',
    light: 'bg-white/80 backdrop-blur-sm'
  };

  const modalVariants = {
    default: 'bg-white shadow-xl rounded-lg',
    glass: 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl',
    glassDark: 'backdrop-blur-xl bg-gray-900/90 border border-gray-700/30 shadow-2xl rounded-3xl text-white',
    premium: 'bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-2xl rounded-3xl border border-blue-100',
    elegant: 'bg-white shadow-2xl rounded-2xl border border-gray-100'
  };

  const headerVariants = {
    default: 'border-b px-6 py-4',
    glass: 'border-b border-white/20 px-6 py-4',
    glassDark: 'border-b border-gray-700/30 px-6 py-4',
    premium: 'border-b border-blue-200/50 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50',
    elegant: 'border-b border-gray-100 px-6 py-4 bg-gray-50/30'
  };

  const titleVariants = {
    default: 'text-gray-900',
    glass: 'text-white font-semibold',
    glassDark: 'text-white font-semibold',
    premium: 'text-gray-900 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    elegant: 'text-gray-900 font-semibold'
  };

  const closeButtonVariants = {
    default: 'text-gray-500 hover:bg-gray-100 rounded',
    glass: 'text-white/80 hover:bg-white/20 rounded-full backdrop-blur-sm',
    glassDark: 'text-white/80 hover:bg-white/20 rounded-full backdrop-blur-sm',
    premium: 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 rounded-full',
    elegant: 'text-gray-500 hover:bg-gray-100 rounded-full'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-5 transition-all duration-300 ${overlayVariants[variant] ?? overlayVariants.default}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          w-full overflow-hidden transform transition-all duration-300 scale-100 opacity-100
          ${sizeClasses[size] ?? sizeClasses.medium} 
          ${modalVariants[variant] ?? modalVariants.default} 
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={`flex items-center justify-between ${headerVariants[variant] ?? headerVariants.default}`}>
            <h2 className={`text-lg font-semibold ${titleVariants[variant] ?? titleVariants.default}`}>
              {title}
            </h2>
            {showCloseButton && (
              <button 
                className={`inline-flex h-8 w-8 items-center justify-center text-2xl transition-all duration-200 ${closeButtonVariants[variant] ?? closeButtonVariants.default}`}
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Decorative elements for premium variants */}
        {variant === 'glass' && (
          <>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-40 animate-pulse"></div>
          </>
        )}
        
        {variant === 'premium' && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default Modal;