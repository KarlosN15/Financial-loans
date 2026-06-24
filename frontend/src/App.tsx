import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { lazy, Suspense } from 'react';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const NewClient = lazy(() => import('./pages/NewClient'));
const NewLoan = lazy(() => import('./pages/NewLoan'));
const Loans = lazy(() => import('./pages/Loans'));
const Reports = lazy(() => import('./pages/Reports'));
const Billing = lazy(() => import('./pages/Billing'));
const Agents = lazy(() => import('./pages/Agents'));
const Login = lazy(() => import('./pages/Login'));
const Caja = lazy(() => import('./pages/Caja'));
const Gastos = lazy(() => import('./pages/Gastos'));
const Inversiones = lazy(() => import('./pages/Inversiones'));
const Bancos = lazy(() => import('./pages/Bancos'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const Register = lazy(() => import('./pages/Register'));
const SaasPanel = lazy(() => import('./pages/SaasPanel'));
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
  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@presprosystems.com';
  const legacyAdminEmail = 'admin@prestamopro.com';
  
  if (user?.email?.toLowerCase() !== superAdminEmail.toLowerCase() && user?.email?.toLowerCase() !== legacyAdminEmail) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
             <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-4"></div>
             <p className="text-white font-bold tracking-widest text-xs uppercase animate-pulse">Cargando...</p>
          </div>
        }>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
