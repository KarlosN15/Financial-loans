import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Refined Topbar with integrated navigation */}
      <Topbar />
      
      <main className="flex-1 p-4 pb-20 md:p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        <Outlet />
      </main>

      {/* Footer / Info */}
      <footer className="py-8 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm no-print">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Préstamo Pro System v2.0 • 2026</p>
      </footer>
    </div>
  );
};

export default Layout;
