import React, { useState } from 'react';

// Enhanced Button Component
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
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 rounded-md',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-blue-500 rounded-2xl border-0',
    glass: 'backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white hover:bg-opacity-20 focus:ring-white focus:ring-opacity-50 rounded-2xl shadow-lg',
    soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 focus:ring-blue-500 rounded-xl',
    premium: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 focus:ring-purple-500 rounded-2xl border-0'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.medium} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Input Component
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
  const baseInput = 'w-full bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-200';
  
  const variants = {
    default: 'rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    glass: 'rounded-xl border border-white border-opacity-30 bg-white bg-opacity-90 backdrop-blur-sm focus:ring-blue-500 focus:border-blue-500 focus:bg-opacity-100',
    soft: 'rounded-xl border-2 border-blue-100 bg-blue-50 focus:ring-blue-500 focus:border-blue-300 focus:bg-white',
    premium: 'rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-50 to-purple-50 focus:ring-purple-500 focus:from-white focus:to-white shadow-lg'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };
  
  const labelVariants = {
    default: 'text-gray-700',
    glass: 'text-white font-medium',
    soft: 'text-blue-700 font-medium',
    premium: 'text-gray-700 font-semibold'
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
      </div>
      {error && (
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Modal Component
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
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-xl',
    large: 'max-w-3xl'
  };

  const overlayVariants = {
    default: 'bg-black/50',
    glass: 'bg-black/30 backdrop-blur-sm'
  };

  const modalVariants = {
    default: 'bg-white shadow-xl rounded-lg',
    glass: 'backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl',
    premium: 'bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-2xl rounded-3xl border border-blue-100'
  };

  const headerVariants = {
    default: 'border-b px-6 py-4',
    glass: 'border-b border-white/20 px-6 py-4',
    premium: 'border-b border-blue-200/50 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50'
  };

  const titleVariants = {
    default: 'text-gray-900',
    glass: 'text-white font-semibold',
    premium: 'text-gray-900 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
  };

  const closeButtonVariants = {
    default: 'text-gray-500 hover:bg-gray-100 rounded',
    glass: 'text-white/80 hover:bg-white/20 rounded-full backdrop-blur-sm',
    premium: 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 rounded-full'
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

        {variant === 'glass' && (
          <>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-40 animate-pulse"></div>
          </>
        )}
      </div>
    </div>
  );
};

// Demo Component
export default function ComponentThemeDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState('default');
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Enhanced Component Library</h1>
          <p className="text-blue-100 opacity-80">Beautiful theme variants for your parking management system</p>
        </div>

        {/* Button Variants */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="premium">Premium</Button>
            <Button variant="gradient" disabled>Disabled</Button>
          </div>
        </div>

        {/* Input Variants */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Input Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Default Input" 
              placeholder="Enter text..." 
              variant="default"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Glass Input" 
              placeholder="Glass style..." 
              variant="glass"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Soft Input" 
              placeholder="Soft theme..." 
              variant="soft"
            />
            <Input 
              label="Premium Input" 
              placeholder="Premium style..." 
              variant="premium"
              required
            />
          </div>
        </div>

        {/* Modal Variants */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Modal Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="soft" 
              onClick={() => { setModalVariant('default'); setIsModalOpen(true); }}
            >
              Default Modal
            </Button>
            <Button 
              variant="glass" 
              onClick={() => { setModalVariant('glass'); setIsModalOpen(true); }}
            >
              Glass Modal
            </Button>
            <Button 
              variant="premium" 
              onClick={() => { setModalVariant('premium'); setIsModalOpen(true); }}
            >
              Premium Modal
            </Button>
          </div>
        </div>

        {/* Usage Example */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Usage Examples</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/20 rounded-xl border border-gray-700/30">
              <h3 className="text-lg font-medium text-blue-300 mb-2">Login Form (Glass Theme)</h3>
              <div className="grid grid-cols-1 gap-4 max-w-md">
                <Input 
                  label="Email" 
                  type="email"
                  placeholder="admin@example.com" 
                  variant="glass"
                />
                <Input 
                  label="Password" 
                  type="password"
                  placeholder="Enter password" 
                  variant="glass"
                />
                <Button variant="gradient" className="w-full">Sign In</Button>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-lg font-medium text-purple-300 mb-2">Dashboard Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="soft" size="small">View Reports</Button>
                <Button variant="premium" size="small">Add Parking Spot</Button>
                <Button variant="glass" size="small">Settings</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Demo */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`${modalVariant.charAt(0).toUpperCase() + modalVariant.slice(1)} Modal`}
        variant={modalVariant}
      >
        <div className="space-y-4">
          <p className={modalVariant === 'glass' ? 'text-white/90' : 'text-gray-600'}>
            This is a {modalVariant} modal variant demonstrating the enhanced styling options.
          </p>
          <div className="space-y-3">
            <Input 
              label="Sample Input" 
              placeholder="Test the input styling..."
              variant={modalVariant === 'glass' ? 'glass' : modalVariant === 'premium' ? 'premium' : 'default'}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="soft" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant={modalVariant === 'glass' ? 'glass' : 'gradient'}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}