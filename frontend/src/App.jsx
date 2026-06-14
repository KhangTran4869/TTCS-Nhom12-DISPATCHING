import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import DriversPage from './pages/DriversPage';
import VehiclesPage from './pages/VehiclesPage';
import OrdersPage from './pages/OrdersPage';
import DispatchPage from './pages/DispatchPage';
import LocationsPage from './pages/LocationsPage';
import IncidentsPage from './pages/IncidentsPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<OverviewPage />} />
          <Route path="orders" element={<RoleRoute allowedRoles={['manager', 'dispatcher']}><OrdersPage /></RoleRoute>} />
          <Route path="dispatch" element={<RoleRoute allowedRoles={['manager', 'dispatcher']}><DispatchPage /></RoleRoute>} />
          <Route path="locations" element={<RoleRoute allowedRoles={['manager', 'dispatcher', 'driver']}><LocationsPage /></RoleRoute>} />
          
          <Route path="drivers" element={<RoleRoute allowedRoles={['manager']}><DriversPage /></RoleRoute>} />
          <Route path="vehicles" element={<RoleRoute allowedRoles={['manager']}><VehiclesPage /></RoleRoute>} />
          
          <Route path="incidents" element={<RoleRoute allowedRoles={['manager', 'dispatcher', 'driver']}><IncidentsPage /></RoleRoute>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
