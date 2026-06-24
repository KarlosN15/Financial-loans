import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import NewClient from './pages/NewClient';
import NewLoan from './pages/NewLoan';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import Agents from './pages/Agents';
import Login from './pages/Login';
import Caja from './pages/Caja';
import Gastos from './pages/Gastos';
import Inversiones from './pages/Inversiones';
import Bancos from './pages/Bancos';
import Configuracion from './pages/Configuracion';
import Register from './pages/Register';
import SaasPanel from './pages/SaasPanel';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Admin-only route: redirect agents to /billing
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role === 'AGENT') return <Navigate to="/billing" replace />;
  return <>{children}</>;
};

// Saas Route: Only the SuperAdmin email can access it
const SaasRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@prestamopro.com';
  
  if (user?.email?.toLowerCase() !== superAdminEmail.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="clients" element={
              <AdminRoute><Clients /></AdminRoute>
            } />
            <Route path="clients/new" element={
              <AdminRoute><NewClient /></AdminRoute>
            } />
            <Route path="loans" element={
              <AdminRoute><Loans /></AdminRoute>
            } />
            <Route path="loans/new" element={
              <AdminRoute><NewLoan /></AdminRoute>
            } />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={
              <AdminRoute><Reports /></AdminRoute>
            } />
            <Route path="agents" element={
              <AdminRoute><Agents /></AdminRoute>
            } />
            <Route path="caja" element={
              <AdminRoute><Caja /></AdminRoute>
            } />
            <Route path="gastos" element={
              <AdminRoute><Gastos /></AdminRoute>
            } />
            <Route path="inversiones" element={
              <AdminRoute><Inversiones /></AdminRoute>
            } />
            <Route path="bancos" element={
              <AdminRoute><Bancos /></AdminRoute>
            } />
            <Route path="configuracion" element={
              <AdminRoute><Configuracion /></AdminRoute>
            } />
            <Route path="saas" element={
              <SaasRoute><SaasPanel /></SaasRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
