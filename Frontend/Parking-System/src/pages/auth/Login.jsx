import React, { useState } from 'react'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuth from '../../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      console.log('Attempting login with:', form.email)
      await login(form)
      console.log('Login successful, navigating to admin dashboard')
      const to = location.state?.from?.pathname || '/admin'
      console.log('Navigating to:', to)
      navigate(to, { replace: true })
    } catch (e) {
      console.error('Login error:', e)
      setError(e.message)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex flex-col'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/' className='flex items-center space-x-3 hover:opacity-80 transition-opacity'>
              <div className='w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>Parking Management</h1>
                <p className='text-xs text-gray-500'>Admin Portal</p>
              </div>
            </Link>
            <Link to='/' className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm'>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md'>
          {/* Header Section */}
          <div className='text-center mb-8'>
            <div className='inline-flex w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/25 ring-4 ring-blue-100'>
              <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2 tracking-tight'>Welcome Back</h2>
            <p className='text-gray-600 text-base'>Sign in to access your admin dashboard</p>
          </div>

          {/* Login Form Card */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
            <div className='p-8'>
              {/* Error Message */}
              {error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3'>
                  <div className='flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5'>
                    <svg className='w-3 h-3 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='text-red-800 text-sm font-semibold'>Authentication Failed</p>
                    <p className='text-red-600 text-sm mt-0.5'>{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form className='space-y-5' onSubmit={onSubmit}>
                {/* Email Input */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Email Address
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                      </svg>
                    </div>
                    <input
                      type='email'
                      value={form.email}
                      onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
                      required
                      placeholder='admin@example.com'
                      className='w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 outline-none bg-gray-50/50 focus:bg-white'
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                      </svg>
                    </div>
                    <input
                      type='password'
                      value={form.password}
                      onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
                      required
                      placeholder='••••••••'
                      className='w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 outline-none bg-gray-50/50 focus:bg-white'
                    />
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className='flex items-center justify-between pt-1'>
                  <label className='flex items-center space-x-2.5 cursor-pointer group'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer'
                    />
                    <span className='text-sm text-gray-600 group-hover:text-gray-800 transition-colors select-none'>
                      Remember me
                    </span>
                  </label>
                  <button
                    type='button'
                    className='text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors'
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button 
                  type='submit' 
                  disabled={loading}
                  className='w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 px-6 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transform hover:-translate-y-0.5 disabled:translate-y-0 active:translate-y-0 transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 outline-none disabled:cursor-not-allowed group border-0'
                >
                  {loading ? (
                    <div className='flex items-center justify-center space-x-3'>
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center space-x-2'>
                      <span>Sign In to Dashboard</span>
                      <svg className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                      </svg>
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Security Indicators */}
            <div className='relative px-8 py-4 bg-gray-50/50'>
              <div className='flex items-center justify-center space-x-6 text-xs text-gray-500'>
                <div className='flex items-center space-x-1.5'>
                  <svg className='w-3.5 h-3.5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z' clipRule='evenodd' />
                  </svg>
                  <span className='font-medium'>256-bit SSL</span>
                </div>
                <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                <div className='flex items-center space-x-1.5'>
                  <svg className='w-3.5 h-3.5 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                  </svg>
                  <span className='font-medium'>Secure Auth</span>
                </div>
                <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                <div className='flex items-center space-x-1.5'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='font-medium'>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Having trouble accessing your account?{' '}
              <button className='text-blue-600 hover:text-blue-700 font-semibold transition-colors'>
                Contact Support
              </button>
            </p>
          </div>

          {/* Trust Badge */}
          <div className='mt-6 flex justify-center'>
            <div className='inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm'>
              <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='text-gray-700 text-xs font-semibold'>Protected by Enterprise Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0'>
            <p className='text-gray-400 text-sm'>
              © 2024 Parking Management System. All rights reserved.
            </p>
            <div className='flex items-center space-x-6 text-sm text-gray-400'>
              <button className='hover:text-white transition-colors'>Privacy</button>
              <button className='hover:text-white transition-colors'>Terms</button>
              <button className='hover:text-white transition-colors'>Help</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}