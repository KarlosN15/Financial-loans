import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import NewLoan from './pages/NewLoan';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import Login from './pages/Login';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Root: admins go to Dashboard, agents go to Billing */}
            <Route index element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="clients" element={
              <AdminRoute><Clients /></AdminRoute>
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
