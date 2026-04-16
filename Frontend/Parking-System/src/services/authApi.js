import { http } from './http.js'

export const login = (payload, onSlow) =>
  http.post('/auth/login', payload, { onSlow })

export const logout = () =>
  http.post('/auth/logout')

export const me = () =>
  http.get('/auth/me')

export const refresh = () =>
  http.post('/auth/refresh-token')

export const changePassword = (payload) =>
  http.patch('/auth/change-password', payload)