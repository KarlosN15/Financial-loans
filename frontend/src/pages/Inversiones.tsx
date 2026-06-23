import { formatDOP } from '../utils/format';

const Inversiones = () => {
  const investments = [
    { id: 1, investorName: 'Juan Pérez', amount: 500000, interestRate: 3, status: 'ACTIVE' },
    { id: 2, investorName: 'Inversiones XYZ', amount: 1000000, interestRate: 4, status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Inversiones</h2>
          <p className="text-slate-500 mt-1">Control de capital de inversores externos y cálculo de retornos.</p>
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Nuevo Inversor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen */}
        <div className="bg-emerald-500 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Capital Total Captado</p>
            <h3 className="text-4xl font-black tracking-tighter">${formatDOP(1500000)}</h3>
          </div>
          <div className="relative z-10 mt-6 flex gap-2 text-xs font-bold bg-black/10 w-fit px-3 py-1 rounded-lg">
            2 Inversores Activos
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10">trending_up</span>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-primary uppercase tracking-tighter">Cartera de Inversiones</h3>
          </div>
          <div className="space-y-3">
            {investments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm uppercase">{inv.investorName}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tasa: {inv.interestRate}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600">${formatDOP(inv.amount)}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">ACTIVO</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inversiones;
