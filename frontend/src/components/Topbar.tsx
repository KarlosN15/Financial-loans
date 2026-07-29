import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const isDarkMode = theme === 'dark';

  return (
    <header className="sticky top-0 z-[40] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm no-print">
      <div className="px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95"
            onClick={onMenuClick}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Empty space for desktop to push user actions to right */}
        <div className="hidden lg:block"></div>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white hover:text-primary transition-all shadow-sm active:scale-90"
            title={isDarkMode ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">{user?.name || 'Usuario'}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user?.role === 'ADMIN' ? 'Administrador' : 'Agente Pro'}</span>
          </div>
          
          <div className="relative">
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden shadow-sm border ${
                    isProfileOpen ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-primary'
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
