import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as auth from '../services/authApi.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try { 
        setLoading(true)
        const response = await auth.me()
        console.log('Auth check - Full response:', response)
        
        // Now response is the full response object from your backend
        let adminData = null
        if (response?.message?.loggedInAdmin) {
          adminData = response.message.loggedInAdmin
        } else if (response?.data) {
          adminData = response.data
        }
        
        setAdmin(adminData)
        console.log('Auth check successful, admin set to:', adminData)
      } catch (error) {
        console.log('No existing session:', error.message)
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth();
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError('')
      console.log('AuthContext: Starting login process')
      const response = await auth.login(credentials)
      console.log('AuthContext: Full login response:', response)
      
      // Now response is the full response object from your backend
      let adminData = null
      let accessToken = null
      let refreshToken = null
      
      if (response?.message) {
        adminData = response.message.loggedInAdmin
        accessToken = response.message.accessToken
        refreshToken = response.message.refreshToken
      }
      
      console.log('Extracted admin data:', adminData)
      console.log('Extracted access token:', accessToken)
      
      setAdmin(adminData || null)
      
      if (accessToken) {
        localStorage.setItem('token', accessToken)
        console.log('Token stored in localStorage')
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
        console.log('Refresh token stored in localStorage')
      }
      
      console.log('AuthContext: Admin state set to:', adminData)
      return response
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  const value = useMemo(() => ({ 
    admin, 
    setAdmin, 
    loading, 
    error, 
    setError, 
    login, 
    logout 
  }), [admin, loading, error])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Fixed export structure to avoid Fast Refresh issues
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Keep the default export for compatibility
export default useAuth