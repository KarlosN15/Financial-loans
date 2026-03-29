import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/clients', label: 'Clientes', icon: 'group' },
    { path: '/loans', label: 'Préstamos', icon: 'payments' },
    { path: '/billing', label: 'Pagos', icon: 'receipt_long' },
    { path: '/reports', label: 'Reportes', icon: 'bar_chart' },
  ];

  return (
    <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all duration-300">
            <span className="material-symbols-outlined text-white text-xl md:text-2xl">account_balance</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black text-primary font-headline tracking-tighter uppercase leading-none">Préstamo Pro</h1>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Management SaaS</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                location.pathname === item.path 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{user?.name || 'Usuario'}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user?.role === 'ADMIN' ? 'Administrador' : 'Agente Pro'}</span>
          </div>
          
          <div className="relative group">
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all overflow-hidden shadow-sm">
                <span className="material-symbols-outlined">person</span>
            </button>
            <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[200px]">
                    <div className="pb-4 mb-4 border-b border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conectado como</p>
                        <p className="text-sm font-black text-primary tracking-tight">{user?.email}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] px-4 py-3 flex items-center gap-2 shadow-2xl z-[100] w-[90%] max-w-sm border-t border-white">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
                location.pathname === item.path 
                ? 'text-primary scale-110' 
                : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: location.pathname === item.path ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </Link>
          ))}
      </nav>
    </header>
  );
};

export default Topbar;
