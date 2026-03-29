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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-2 py-2 flex justify-around items-center z-50 lg:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = item.path === '/' 
          ? location.pathname === '/' 
          : location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-300 ${
              isActive 
                ? 'text-primary' 
                : 'text-slate-400'
            }`}
          >
            <span 
              className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {item.name}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-pulse"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
