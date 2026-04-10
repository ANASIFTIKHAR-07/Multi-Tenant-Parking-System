import React, { useEffect } from 'react';

const SIZES = {
  small:  'max-w-sm',
  medium: 'max-w-lg',
  large:  'max-w-2xl',
  xl:     'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'medium', closeOnOverlayClick = true }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={closeOnOverlayClick ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeOnOverlayClick ? onClose : undefined} />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div
        className={`
          relative w-full bg-white shadow-2xl z-10 flex flex-col
          rounded-t-2xl sm:rounded-2xl
          max-h-[92vh] sm:max-h-[85vh]
          ${SIZES[size] || SIZES.medium}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
