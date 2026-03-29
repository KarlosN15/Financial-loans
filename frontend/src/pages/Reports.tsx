import { useQuery } from '@tanstack/react-query';
import { formatDOP } from '../utils/format';
import { getLoansSummary, getLoans } from '../api/api';

const Reports = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: getLoansSummary,
    staleTime: 30_000,
  });

  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
    staleTime: 30_000,
  });

  const isLoading = loadingSummary || loadingLoans;

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <span className="material-symbols-outlined animate-spin">progress_activity</span>
      <span className="text-sm font-bold">Analizando cartera...</span>
    </div>
  );

  const completedLoans = loans.filter((l: any) => l.status === 'COMPLETED').length;
  const totalLoans = (summary?.activeLoans || 0) + (summary?.arrearsLoans || 0) + completedLoans;
  const avgRate = loans.length > 0
    ? (loans.reduce((acc: number, l: any) => acc + l.interestRate, 0) / loans.length).toFixed(2)
    : '0.00';

  const recoveryPct = (summary?.totalCollected || 0) + (summary?.expectedCollections || 0) > 0
    ? Math.min(100, ((summary?.totalCollected || 0) / ((summary?.totalCollected || 0) + (summary?.expectedCollections || 0))) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-primary font-headline tracking-tighter">Reportes de Cartera</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Análisis en tiempo real de rentabilidad y salud financiera.</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm">
          <span className="material-symbols-outlined text-base">download</span>
          Exportar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Patrimonio</span>
          </div>
          <div className="mt-8">
            <p className="text-sm font-bold text-slate-500 mb-2">Total en Préstamos</p>
            <h3 className="text-4xl font-black text-primary group-hover:scale-105 transition-transform origin-left duration-300">
              RD$ {formatDOP(summary?.totalLent || 0)}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">{totalLoans} préstamo(s) en cartera</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 opacity-20 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Facturación</span>
          </div>
          <div className="relative z-10 mt-8">
            <p className="text-sm font-bold text-slate-400 mb-2">Total Recaudado</p>
            <h3 className="text-4xl font-black text-white">
              RD$ {formatDOP(summary?.totalCollected || 0)}
            </h3>
            <p className="text-xs text-white/40 mt-3 font-bold uppercase tracking-widest">Capital e intereses cobrados</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Cobranza</span>
          </div>
          <div className="mt-8">
            <p className="text-sm font-bold text-slate-500 mb-2">Proyectado a Cobrar</p>
            <h3 className="text-4xl font-black text-slate-800">
              RD$ {formatDOP(summary?.expectedCollections || 0)}
            </h3>
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${recoveryPct.toFixed(0)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{recoveryPct.toFixed(0)}% recuperado</p>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-primary mb-8 font-headline">Distribución de Cartera</h3>

        {totalLoans === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30">
            <span className="material-symbols-outlined text-5xl mb-3">pie_chart</span>
            <p className="text-sm font-bold">Sin préstamos registrados aún.</p>
          </div>
        ) : (
          <>
            <div className="h-14 flex w-full rounded-2xl overflow-hidden shadow-inner gap-[2px]">
              {(summary?.activeLoans || 0) > 0 && (
                <div
                  className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white transition-all hover:brightness-110 cursor-pointer"
                  style={{ flex: summary?.activeLoans }}
                >
                  ACTIVOS ({summary?.activeLoans})
                </div>
              )}
              {(summary?.arrearsLoans || 0) > 0 && (
                <div
                  className="h-full bg-rose-500 flex items-center justify-center text-[10px] font-black text-white transition-all hover:brightness-110 cursor-pointer"
                  style={{ flex: summary?.arrearsLoans }}
                >
                  MORA ({summary?.arrearsLoans})
                </div>
              )}
              {completedLoans > 0 && (
                <div
                  className="h-full bg-slate-400 flex items-center justify-center text-[10px] font-black text-white transition-all hover:brightness-110 cursor-pointer"
                  style={{ flex: completedLoans }}
                >
                  COMPLETADOS ({completedLoans})
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">percent</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasa Promedio</p>
                  <p className="text-lg font-black text-slate-700">{avgRate}% mensual</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Al Corriente</p>
                  <p className="text-lg font-black text-slate-700">{summary?.activeLoans || 0} préstamo(s)</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <span className="material-symbols-outlined text-lg">warning</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Mora</p>
                  <p className="text-lg font-black text-slate-700">{summary?.arrearsLoans || 0} préstamo(s)</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
