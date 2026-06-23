import { useState } from 'react';
import { formatDOP } from '../utils/format';

const Caja = () => {
  const [isOpen, setIsOpen] = useState(false);
  const balance = 0;

  // Mocks para diseño
  const transactions = [
    { id: 1, type: 'INCOME', amount: 5000, description: 'Apertura de caja', date: new Date().toISOString() },
    { id: 2, type: 'EXPENSE', amount: 500, description: 'Compra de agua', date: new Date().toISOString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Caja y Cuadre</h2>
          <p className="text-slate-500 mt-1">Gestión de aperturas, cierres y movimientos diarios.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm tracking-wide ${isOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {isOpen ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
          </div>
          {isOpen ? (
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Cerrar Caja
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(true)}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Balance */}
        <div className="md:col-span-1 bg-primary text-white rounded-[2rem] p-8 shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-widest opacity-70 mb-2">Balance Actual</p>
            <h3 className="text-4xl font-black tracking-tighter">${formatDOP(balance || 4500)}</h3>
          </div>
          <div className="relative z-10 mt-6 flex gap-2">
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Ingreso
            </button>
            <button className="flex-1 bg-black/20 hover:bg-black/30 transition-colors py-2 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px]">remove</span>
              Egreso
            </button>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10">point_of_sale</span>
        </div>

        {/* Lista de Movimientos */}
        <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-primary uppercase tracking-tighter">Movimientos de Hoy</h3>
            <button className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          
          <div className="flex-1 space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <span className="material-symbols-outlined text-xl">
                      {tx.type === 'INCOME' ? 'south_west' : 'north_east'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">{tx.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`font-black text-right ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}${formatDOP(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caja;
