import { useState } from 'react';
import { formatDOP } from '../utils/format';

const Bancos = () => {
  const accounts = [
    { id: 1, bankName: 'Banco Popular', accountNumber: '****-1234', balance: 150000 },
    { id: 2, bankName: 'Banreservas', accountNumber: '****-5678', balance: 85000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Bancos y Cuentas</h2>
          <p className="text-slate-500 mt-1">Gestión de cuentas bancarias y conciliaciones de transferencias.</p>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Nueva Cuenta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">account_balance</span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
              <div>
                <p className="font-black tracking-widest text-blue-200 text-xs uppercase mb-1">{acc.bankName}</p>
                <p className="text-xl font-mono tracking-widest opacity-80">{acc.accountNumber}</p>
              </div>
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-black">Balance Disponible</p>
                <p className="text-3xl font-black">${formatDOP(acc.balance)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Añadir Transacción (Atajo) */}
        <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-[2rem] flex flex-col justify-center items-center text-center hover:border-primary/20 transition-all cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-primary/5 flex items-center justify-center mb-4 transition-colors">
            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">swap_horiz</span>
          </div>
          <h3 className="font-extrabold text-primary uppercase tracking-tighter">Registrar Transacción</h3>
          <p className="text-xs text-slate-500 mt-1">Ingreso o retiro bancario</p>
        </div>
      </div>
    </div>
  );
};

export default Bancos;
