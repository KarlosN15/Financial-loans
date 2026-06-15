import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN'] },
    { path: '/clients', label: 'Clientes', icon: 'group', roles: ['ADMIN'] },
    { path: '/loans', label: 'Préstamos', icon: 'payments', roles: ['ADMIN'] },
    { path: '/billing', label: 'Pagos', icon: 'receipt_long', roles: ['ADMIN', 'AGENT'] },
    { path: '/reports', label: 'Reportes', icon: 'bar_chart', roles: ['ADMIN'] },
    { path: '/agents', label: 'Equipo', icon: 'badge', roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <header className="sticky top-0 z-[50] bg-primary text-white shadow-xl shadow-primary/10 border-b border-white/10 no-print">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10 rotate-3 group-hover:rotate-0 transition-all duration-300">
            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">account_balance</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black text-white font-headline tracking-tighter uppercase leading-none">Préstamo Pro</h1>
            <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] mt-1">Management SaaS</p>
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
                ? 'bg-white/20 text-white shadow-lg shadow-black/5' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white border border-white/20 hover:bg-white hover:text-primary transition-all shadow-sm active:scale-90"
            title={isDarkMode ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{user?.name || 'Usuario'}</span>
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">{user?.role === 'ADMIN' ? 'Administrador' : 'Agente Pro'}</span>
          </div>
          
          <div className="relative">
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden shadow-sm border ${
                    isProfileOpen ? 'bg-white text-primary border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white hover:text-primary'
                }`}
            >
                <span className="material-symbols-outlined">person</span>
            </button>
            <div className={`absolute right-0 top-full pt-2 transition-all duration-300 z-[100] ${
                isProfileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 min-w-[200px]">
                        <div className="pb-4 mb-4 border-b border-slate-50 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conectado como</p>
                            <p className="text-sm font-black text-primary dark:text-white tracking-tight">{user?.email}</p>
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
