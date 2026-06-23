import { formatDOP } from '../utils/format';

const Gastos = () => {
  // Mocks para diseño
  const pendingExpenses = [
    { id: 1, amount: 2500, description: 'Pago de Internet', dueDate: '2026-06-25' },
    { id: 2, amount: 1500, description: 'Material de oficina', dueDate: '2026-06-26' },
  ];

  const paidExpenses = [
    { id: 3, amount: 800, description: 'Combustible Ruta Sur', date: '2026-06-22' },
    { id: 4, amount: 450, description: 'Almuerzo equipo', date: '2026-06-21' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Gastos y Cuentas por Pagar</h2>
          <p className="text-slate-500 mt-1">Administración de gastos menores y facturas pendientes.</p>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Registrar Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cuentas por Pagar (Pendientes) */}
        <div className="bg-white rounded-[2rem] border border-rose-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] -z-10"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-rose-600 uppercase tracking-tighter">Por Pagar</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Facturas pendientes</p>
            </div>
            <span className="material-symbols-outlined text-rose-200 text-4xl">receipt_long</span>
          </div>
          
          <div className="flex-1 space-y-3">
            {pendingExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-rose-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">warning</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{expense.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Vence: {new Date(expense.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-rose-600">${formatDOP(expense.amount)}</p>
                  <button className="text-[10px] uppercase font-bold text-primary hover:underline mt-1">Pagar Ahora</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos Pagados */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-bl-[100px] -z-10"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-primary uppercase tracking-tighter">Historial de Gastos</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Últimos pagos realizados</p>
            </div>
            <span className="material-symbols-outlined text-slate-200 text-4xl">history</span>
          </div>
          
          <div className="flex-1 space-y-3">
            {paidExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{expense.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Pagado: {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right font-black text-slate-600">
                  ${formatDOP(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gastos;
