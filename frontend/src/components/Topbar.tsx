import React from 'react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  
  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/15 dark:border-slate-800/15 shadow-sm dark:shadow-none flex items-center justify-between px-4 md:px-8 py-3 font-['Manrope'] antialiased">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-blue-900 dark:text-blue-100 truncate">{title}</h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
          <button className="hidden sm:flex p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        
        <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-primary leading-none uppercase tracking-tighter">{user?.role || 'Admin'}</p>
            <p className="text-sm font-medium text-on-surface">{user?.name || 'Usuario'}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs md:text-sm font-bold border-2 border-white shadow-sm uppercase">
            {user?.name?.substring(0, 2) || 'US'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
