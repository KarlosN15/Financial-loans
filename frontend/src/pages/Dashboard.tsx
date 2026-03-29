import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { formatDOP } from '../utils/format';

const Dashboard = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const response = await api.get('/loans/summary');
      return response.data;
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Analizando cartera...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between mb-2 md:mb-6">
        <div className="hidden md:block">
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Dashboard Principal</h2>
          <p className="text-slate-500 mt-1">Resumen operacional de hoy 25 Mar 2026.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-primary p-5 md:p-6 rounded-[1.5rem] text-white shadow-2xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group min-h-[140px]">
          <div className="relative z-10">
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-60 mb-1">Total Prestado</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">${formatDOP(summary?.totalLent || 0)}</h3>
            <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 w-fit px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>Cartera Total</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl md:text-9xl opacity-10 group-hover:scale-110 transition-transform duration-500">payments</span>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Cobros Pendientes</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-primary">${formatDOP(summary?.expectedCollections || 0)}</h3>
            <div className={`mt-3 md:mt-4 flex items-center gap-2 text-[10px] font-black uppercase ${summary?.arrearsLoans > 0 ? 'text-error' : 'text-emerald-500'}`}>
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>{summary?.arrearsLoans} casos en mora</span>
            </div>
          </div>
          <div className="absolute right-4 md:right-6 top-4 md:top-6 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-error/5 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden min-h-[140px]">
          <div>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Préstamos Activos</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-primary">{summary?.activeLoans || '0'}</h3>
            <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-secondary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Contabilidad Diaria</span>
            </div>
          </div>
          <div className="absolute right-4 md:right-6 top-4 md:top-6 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
        </div>

        <div className="bg-secondary p-5 md:p-6 rounded-[1.5rem] text-white shadow-2xl shadow-secondary/20 flex flex-col justify-between relative overflow-hidden group min-h-[140px]">
          <div className="relative z-10">
            <p className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-60 mb-1">Total Cobrado</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">${formatDOP(summary?.totalCollected || 0)}</h3>
            <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] font-black uppercase bg-black/10 w-fit px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Capital + Interés</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl md:text-9xl opacity-10 group-hover:scale-110 transition-transform duration-500">auto_graph</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-primary font-headline tracking-tighter uppercase">Flujo Operacional</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Últimos movimientos de cartera</p>
            </div>
          </div>
          <div className="h-48 md:h-64 flex flex-col justify-center items-center opacity-30 italic text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4">insights</span>
            <p className="text-sm font-black uppercase tracking-widest">Sin datos hoy</p>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-primary font-headline tracking-tighter uppercase">Asistente Pro</h2>
          </div>
          <div className="space-y-6 flex-1">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <p className="text-sm font-black text-primary uppercase tracking-tighter">Sistema Listo</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5">ESTADO: EN LÍNEA</p>
              </div>
            </div>
            <div className="mt-auto px-4 py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-300 mb-4">Motor de Inteligencia</p>
              <p className="text-xs text-slate-500 italic font-medium leading-relaxed">"Bienvenido Pablo. Registra un nuevo cliente para activar las proyecciones de cobro hoy."</p>
            </div>
            <Link to="/loans/new" className="mt-6 w-full py-4 bg-primary text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Nuevo Registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
