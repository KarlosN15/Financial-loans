import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const allMenuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/', roles: ['ADMIN'] },
    { name: 'Préstamos', icon: 'payments', path: '/loans', roles: ['ADMIN'] },
    { name: 'Clientes', icon: 'group', path: '/clients', roles: ['ADMIN'] },
    { name: 'Facturación', icon: 'receipt_long', path: '/billing', roles: ['ADMIN', 'AGENT'] },
    { name: 'Reportes', icon: 'analytics', path: '/reports', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role || 'ADMIN')
  );

  return (
    <div className="h-full flex flex-col py-4 font-['Inter'] text-sm font-medium border-r border-slate-100 dark:border-slate-800">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-blue-900 dark:text-white font-['Manrope'] leading-tight tracking-tighter">Préstamo Pro</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold italic">Financial Solutions</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg">
           <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`mx-2 my-1 px-4 py-2 flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-4">
        {user?.role === 'ADMIN' && (
          <Link to="/loans/new" className="w-full bg-secondary text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Nuevo Préstamo</span>
          </Link>
        )}
        
        <div className="pt-4 border-t border-slate-200/50">
          <button 
            onClick={logout}
            className="w-full text-red-500 mx-0 my-1 px-4 py-2 flex items-center gap-3 hover:bg-red-50 rounded-lg transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
