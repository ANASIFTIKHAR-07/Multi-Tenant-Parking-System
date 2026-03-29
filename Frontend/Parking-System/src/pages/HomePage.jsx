import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'

const HomePage = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <div className='w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>Parking Management</h1>
                <p className='text-xs text-gray-500 hidden sm:block'>Smart Parking Solutions</p>
              </div>
            </div>
            <Link to='/admin'>
              <Button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 border-0'>
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-20 bg-white/60 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6'>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2'></div>
            <span className='text-blue-700 text-sm font-semibold'>Next-Generation Parking Management</span>
          </div>
          
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight'>
            Parking Management
            <span className='block mt-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent'>
              Made Simple
            </span>
          </h1>
          
          <p className='text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed'>
            Efficiently manage companies, floors, and parking slot assignments for your organization with our intelligent system.
          </p>
          
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/admin'>
              <Button 
                size='large' 
                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 border-0 font-semibold text-base'
              >
                <span className='flex items-center space-x-2'>
                  <span>Get Started</span>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                  </svg>
                </span>
              </Button>
            </Link>
            <Button 
              variant='outline' 
              size='large' 
              className='border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 px-8 py-4 bg-white/50 backdrop-blur-sm font-semibold text-base transition-all duration-200'
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className='mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600'>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='font-medium'>Real-time Tracking</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='font-medium'>Secure & Reliable</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='font-medium'>Easy to Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gradient-to-b from-white/60 to-gray-50/60 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Powerful Features
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Everything you need to manage parking operations efficiently and effectively
            </p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>Company Management</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Manage company information and floor assignments with ease
              </p>
            </div>
            
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/25'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>Floor Management</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Create and manage parking floors with customizable slot capacity
              </p>
            </div>
            
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>Smart Assignments</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Assign employees to parking slots with intelligent RFID tracking
              </p>
            </div>
            
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>Reports & Analytics</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Generate comprehensive reports and export data to CSV format
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute inset-0' style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
            Ready to Get Started?
          </h2>
          <p className='text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed'>
            Start managing your parking operations efficiently today with our comprehensive solution.
          </p>
          <Link to='/admin'>
            <Button 
              size='large' 
              className='bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-base border-0'
            >
              <span className='flex items-center space-x-2'>
                <span>Start Managing Now</span>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                </svg>
              </span>
            </Button>
          </Link>
          
          {/* Additional Info */}
          <div className='mt-10 flex flex-wrap items-center justify-center gap-8 text-blue-100'>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium'>No credit card required</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium'>24/7 Support</span>
            </div>
            <div className='flex items-center space-x-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium'>Instant setup</span>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className='bg-gray-900 text-white py-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b border-gray-800'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg'>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className='text-lg font-bold'>Parking Management</span>
            </div>
            <div className='flex items-center space-x-6 text-sm text-gray-400'>
              <button className='hover:text-white transition-colors'>Privacy</button>
              <button className='hover:text-white transition-colors'>Terms</button>
              <button className='hover:text-white transition-colors'>Help</button>
              <button className='hover:text-white transition-colors'>Contact</button>
            </div>
          </div>
          <div className='pt-6 text-center text-gray-400 text-sm'>
            <p>© 2024 Parking Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage