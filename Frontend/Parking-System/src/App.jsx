import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './Components/routing/ProtectedRoute.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Units from './pages/admin/Units.jsx';
import Tenants from './pages/admin/Tenants.jsx';
import Employees from './pages/admin/Employees.jsx';
import Badges from './pages/admin/Badges.jsx';
import ParkingRecords from './pages/admin/ParkingRecords.jsx';
import RentalContracts from './pages/admin/RentalContracts.jsx';
import VisitorCards from './pages/admin/VisitorCards.jsx';
import Reports from './pages/admin/Reports.jsx';
import Profile from './pages/admin/Profile.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="units" element={<Units />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="employees" element={<Employees />} />
              <Route path="badges" element={<Badges />} />
              <Route path="parking" element={<ParkingRecords />} />
              <Route path="rental-contracts" element={<RentalContracts />} />
              <Route path="visitor-cards" element={<VisitorCards />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
