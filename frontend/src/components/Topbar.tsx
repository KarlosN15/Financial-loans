import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        
        {/* Mobile Hamburger & Logo Section */}
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden w-10 h-10 md:w-12 md:h-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 border border-white/10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10 rotate-3 group-hover:rotate-0 transition-all duration-300">
              <span className="material-symbols-outlined text-primary text-xl md:text-2xl">account_balance</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black text-white font-headline tracking-tighter uppercase leading-none">Préstamo Pro</h1>
              <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] mt-1">Management SaaS</p>
            </div>
          </Link>
        </div>

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

      {/* Mobile Hamburger Overlay Menu */}
      <div className={`lg:hidden fixed inset-0 z-[200] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 w-[80%] max-w-[300px] h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-white font-headline tracking-tighter uppercase leading-none">Préstamo Pro</h1>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
               <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Menú Principal</p>
             <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                        isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                      <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
                    </Link>
                  );
                })}
             </nav>
          </div>
          <div className="p-6 border-t border-white/5 bg-black/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs">
                   {user?.name?.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <p className="text-xs font-black text-white uppercase">{user?.name}</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</p>
                </div>
             </div>
             <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Cerrar Sesión
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
