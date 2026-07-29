import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getPayments } from '../api/api';
import { Link } from 'react-router-dom';
import { formatDOP } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<'7D' | '15D' | '1M' | '3M' | '1Y'>('7D');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const response = await api.get('/loans/summary');
      return response.data;
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  const getDateRangeText = (range: string) => {
    const end = new Date();
    const start = new Date();
    if (range === '7D') start.setDate(end.getDate() - 7);
    else if (range === '15D') start.setDate(end.getDate() - 15);
    else if (range === '1M') start.setMonth(end.getMonth() - 1);
    else if (range === '3M') start.setMonth(end.getMonth() - 3);
    else if (range === '1Y') start.setFullYear(end.getFullYear() - 1);

    const startStr = start.toLocaleDateString('es-DO', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('es-DO', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  if (isLoading) return <DashboardSkeleton />;

  // Group payments by date for the chart
  const paymentsByDate = payments.reduce((acc: any, p: any) => {
    const date = new Date(p.date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
    acc[date] = (acc[date] || 0) + Number(p.amount);
    return acc;
  }, {});
  
  const daysLimit = timeRange === '7D' ? 7 : timeRange === '15D' ? 15 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 365;
  const chartData = Object.keys(paymentsByDate).slice(-daysLimit).map(date => ({
    name: date,
    total: paymentsByDate[date],
  }));

  return (
    <div className="space-y-8">
      {/* Modern Dashboard Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-950 dark:bg-slate-800 text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-headline">Panel</h2>
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[11px] font-black tracking-wider flex items-center gap-2 border border-emerald-200/50 dark:border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                EN VIVO
              </span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-0.5">
              Visión en tiempo real del rendimiento de tu negocio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Date Picker Display */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold shadow-inner">
            <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
            <span className="material-symbols-outlined text-base text-slate-500">calendar_today</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{getDateRangeText(timeRange)}</span>
            <button 
              onClick={() => setTimeRange('7D')} 
              className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Restablecer periodo"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            {(['7D', '15D', '1M', '3M', '1Y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === period
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-md scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            title="Actualizar datos"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => Swal.fire({
              title: 'Panel en Tiempo Real',
              text: 'Visualiza la evolución de los cobros y préstamos de tu negocio filtrados por rangos de fecha.',
              icon: 'info',
              confirmButtonColor: '#0284c7'
            })}
            className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
            title="Ayuda del panel"
          >
            <span className="material-symbols-outlined text-lg">help</span>
          </button>
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
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="h-48 md:h-64 flex flex-col justify-center items-center opacity-30 italic text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4">insights</span>
                <p className="text-sm font-black uppercase tracking-widest">Sin datos hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">stat_1</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-tighter">{p.clientName || p.loan?.client?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cobro Recibido</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">RD$ {formatDOP(p.amount)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {payments.length > 5 && (
                  <Link to="/billing" className="block text-center text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">
                    Ver todos los movimientos
                  </Link>
                )}
              </div>
            )}
          </div>

          {chartData.length > 0 && (
            <div className="mt-8 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dx={-10} tickFormatter={(val) => `RD$${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`RD$ ${formatDOP(value)}`, 'Cobrado']}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
              <p className="text-xs text-slate-500 italic font-medium leading-relaxed">"Bienvenido {user?.name?.split(' ')[0] || 'Usuario'}. Registra un nuevo cliente para activar las proyecciones de cobro hoy."</p>
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
