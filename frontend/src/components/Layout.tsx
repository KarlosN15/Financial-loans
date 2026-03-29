import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Principal';
    if (path === '/clients') return 'Gestión de Clientes';
    if (path.startsWith('/loans/new')) return 'Nuevo Préstamo';
    if (path.startsWith('/loans')) return 'Control de Préstamos';
    if (path === '/billing') return 'Facturación y Pagos';
    if (path === '/reports') return 'Reportes de Cartera';
    return 'Préstamo Pro';
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container - Desktop Only */}
      <aside className="no-print hidden lg:block sticky top-0 h-screen w-72 bg-white border-r border-slate-100">
        <Sidebar isOpen={true} onClose={() => {}} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print sticky top-0 z-30 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[20px] border-b border-slate-100">
          <Topbar 
            title={getTitle()} 
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        </div>
        
        <main className="flex-1 p-4 pb-32 md:p-8 lg:p-12 max-w-full w-full animate-in fade-in duration-500">
          <Outlet />
        </main>

        <MobileNav />
      </div>
    </div>
  );
};

export default Layout;
