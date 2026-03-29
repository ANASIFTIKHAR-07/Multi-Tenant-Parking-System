import './index.css'
import HomePage from './pages/HomePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'
import Companies from './pages/admin/Companies.jsx'
import Floors from './pages/admin/Floors.jsx'
import Slots from './pages/admin/Slots.jsx'
import Logs from './pages/admin/Logs.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import Login from './pages/auth/Login.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path='/login' element={<Login/>} />
          <Route element={<ProtectedRoute/>}>
            <Route path='/admin' element={<AdminLayout/>}>
              <Route index element={<Navigate to='companies' replace />} />
              <Route path='companies' element={<Companies/>} />
              <Route path='floors' element={<Floors/>} />
              <Route path='slots' element={<Slots/>} />
              <Route path='logs' element={<Logs/>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
