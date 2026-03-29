import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const allNavItems = [
    { name: 'Inicio', icon: 'dashboard', path: '/', roles: ['ADMIN'] },
    { name: 'Préstamos', icon: 'payments', path: '/loans', roles: ['ADMIN'] },
    { name: 'Facturación', icon: 'receipt_long', path: '/billing', roles: ['ADMIN', 'AGENT'] },
    { name: 'Clientes', icon: 'group', path: '/clients', roles: ['ADMIN'] },
    { name: 'Reportes', icon: 'more_horiz', path: '/reports', roles: ['ADMIN'] },
  ];

  // Filtramos según el rol del usuario conectado
  const navItems = allNavItems.filter(item => 
    item.roles.includes(user?.role || 'ADMIN')
  );

  return (
    <nav className="fixed bottom-6 left-6 right-6 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] px-4 py-3 flex justify-around items-center z-50 lg:hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] ring-1 ring-slate-900/5 transition-all duration-500 hover:scale-[1.01]">
      {navItems.map((item) => {
        const isActive = item.path === '/' 
          ? location.pathname === '/' 
          : location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-3xl transition-all duration-500 relative ${
              isActive 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span 
              className={`material-symbols-outlined text-[26px] transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.name}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,52,97,0.4)]"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
