import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { admin, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute: loading =', loading, 'admin =', admin)

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Loading Dashboard</h2>
          <p className='text-gray-600'>Please wait while we verify your access...</p>
        </div>
      </div>
    )
  }
  
  if (!admin) {
    console.log('ProtectedRoute: No admin, redirecting to login')
    return <Navigate to='/login' replace state={{ from: location }} />
  }
  
  // RBAC: require role admin where available
  if (admin?.role && admin.role !== 'admin') {
    console.log('ProtectedRoute: Invalid role, redirecting to home')
    return <Navigate to='/' replace />
  }
  
  console.log('ProtectedRoute: Access granted, rendering outlet')
  return <Outlet /> 
}


