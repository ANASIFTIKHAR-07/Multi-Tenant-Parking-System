import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../context/AuthContext.jsx'

const navLinkClass = ({ isActive }) =>
  `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
    isActive 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`

export default function AdminLayout() {
  const navigate = useNavigate()
  const { logout, admin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const onLogout = async () => {
    try { 
      await logout() 
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login', { replace: true })
    }
  }

  const navItems = [
    { to: '/admin/companies', label: 'Companies', icon: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
      </svg>
    )},
    { to: '/admin/floors', label: 'Floors', icon: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
      </svg>
    )},
    { to: '/admin/slots', label: 'Slots', icon: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z' />
      </svg>
    )},
    { to: '/admin/logs', label: 'Reports', icon: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
      </svg>
    )},
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link to='/' className='flex items-center space-x-3 hover:opacity-80 transition-opacity'>
              <div className='w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>Parking Management</h1>
                <p className='text-xs text-gray-500 hidden lg:block'>Admin Dashboard</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className='hidden md:flex items-center space-x-2'>
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  <span className='flex items-center space-x-2'>
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </NavLink>
              ))}
            </nav>

            {/* User Menu */}
            <div className='flex items-center space-x-4'>
              {/* User Info */}
              <div className='hidden sm:flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50'>
                <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm'>
                  <span className='text-white font-bold text-xs'>
                    {admin?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className='font-semibold text-sm text-gray-700'>{admin?.email || 'Admin'}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className='flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 rounded-xl text-sm font-semibold transition-all duration-200 border border-red-200/50 shadow-sm hover:shadow'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                <span className='hidden sm:inline'>Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  ) : (
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className='md:hidden py-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-b-xl'>
              <nav className='space-y-2 px-2'>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className='flex items-center space-x-2'>
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}