import { useQuery } from '@tanstack/react-query';
import { formatDOP } from '../utils/format';
import { getLoansSummary, getLoans } from '../api/api';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
    ? (loans.reduce((acc: number, l: any) => acc + Number(l.interestRate || 0), 0) / loans.length).toFixed(2)
    : '0.00';

  const recoveryPct = (summary?.totalCollected || 0) + (summary?.expectedCollections || 0) > 0
    ? Math.min(100, ((summary?.totalCollected || 0) / ((summary?.totalCollected || 0) + (summary?.expectedCollections || 0))) * 100)
    : 0;

  // AGING REPORT CALCULATIONS
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const agingBuckets = {
    current: { label: '0 - 15 días (Al día / Leve)', shortLabel: '0-15 Días', loans: [] as any[], amount: 0, barColor: 'bg-emerald-500', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200' },
    early: { label: '16 - 30 días (Mora Temprana)', shortLabel: '16-30 Días', loans: [] as any[], amount: 0, barColor: 'bg-amber-400', textColor: 'text-amber-700', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200' },
    medium: { label: '31 - 60 días (Mora Media)', shortLabel: '31-60 Días', loans: [] as any[], amount: 0, barColor: 'bg-orange-500', textColor: 'text-orange-700', badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-200' },
    serious: { label: '61 - 90 días (Mora Grave)', shortLabel: '61-90 Días', loans: [] as any[], amount: 0, barColor: 'bg-rose-500', textColor: 'text-rose-700', badgeBg: 'bg-rose-50', badgeBorder: 'border-rose-200' },
    critical: { label: '+90 días (Pérdida / Castigo)', shortLabel: '+90 Días', loans: [] as any[], amount: 0, barColor: 'bg-purple-900', textColor: 'text-purple-900', badgeBg: 'bg-purple-50', badgeBorder: 'border-purple-200' },
  };

  loans.filter((l: any) => l.status !== 'COMPLETED').forEach((loan: any) => {
    const pendingInst = (loan.installments || []).filter((i: any) => i.status === 'PENDING');
    if (pendingInst.length === 0) return;

    const pendingDebt = pendingInst.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const overdueInst = pendingInst.filter((i: any) => new Date(i.dueDate).getTime() < today.getTime());
    
    let maxDaysOverdue = 0;
    if (overdueInst.length > 0) {
      const oldestDueDate = new Date(Math.min(...overdueInst.map((i: any) => new Date(i.dueDate).getTime())));
      maxDaysOverdue = Math.floor((today.getTime() - oldestDueDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const item = {
      ...loan,
      pendingDebt,
      maxDaysOverdue,
      overdueCount: overdueInst.length
    };

    if (maxDaysOverdue <= 15) {
      agingBuckets.current.loans.push(item);
      agingBuckets.current.amount += pendingDebt;
    } else if (maxDaysOverdue <= 30) {
      agingBuckets.early.loans.push(item);
      agingBuckets.early.amount += pendingDebt;
    } else if (maxDaysOverdue <= 60) {
      agingBuckets.medium.loans.push(item);
      agingBuckets.medium.amount += pendingDebt;
    } else if (maxDaysOverdue <= 90) {
      agingBuckets.serious.loans.push(item);
      agingBuckets.serious.amount += pendingDebt;
    } else {
      agingBuckets.critical.loans.push(item);
      agingBuckets.critical.amount += pendingDebt;
    }
  });

  const totalAgingDebt = Object.values(agingBuckets).reduce((s, b) => s + b.amount, 0);

  const handleExportExcel = () => {
    if (loans.length === 0) return;
    
    const rows = loans.map((l: any) => ({
      'ID Préstamo': `PR-${l.id.toString().padStart(4, '0')}`,
      'Cliente': l.client?.name,
      'Cédula': l.client?.identification || 'N/A',
      'Monto Principal': l.amount,
      'Tasa Interés': `${l.interestRate}%`,
      'Cuotas': l.term,
      'Frecuencia': l.frequency === 'MONTHLY' ? 'Mensual' : l.frequency === 'BIWEEKLY' ? 'Quincenal' : 'Semanal',
      'Estado': l.status,
      'Fecha Registro': new Date(l.createdAt).toLocaleDateString()
    }));

    const agingRows = Object.entries(agingBuckets).flatMap(([_, bucket]) => {
      return bucket.loans.map(l => ({
        'Tramo de Antigüedad': bucket.label,
        'Días de Atraso': l.maxDaysOverdue,
        'Cuotas Vencidas': l.overdueCount,
        'ID Préstamo': `PR-${l.id.toString().padStart(4, '0')}`,
        'Cliente': l.client?.name,
        'Teléfono': l.client?.phone || 'N/A',
        'Saldo Deudor': l.pendingDebt,
        'Estado': l.status
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const agingWorksheet = XLSX.utils.json_to_sheet(agingRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cartera");
    XLSX.utils.book_append_sheet(workbook, agingWorksheet, "Antiguedad de Saldos");
    XLSX.writeFile(workbook, `Cartera_Pro_${new Date().toLocaleDateString('es-DO').replace(/\//g, '-')}.xlsx`);
  };

  const handleExportPDF = () => {
    if (loans.length === 0) return;

    const doc = new jsPDF();
    doc.text("Reporte de Cartera", 14, 15);
    
    const tableColumn = ["ID Préstamo", "Cliente", "Cédula", "Monto", "Interés", "Estado"];
    const tableRows: any[] = [];

    loans.forEach((l: any) => {
      const rowData = [
        `PR-${l.id.toString().padStart(4, '0')}`,
        l.client?.name,
        l.client?.identification || 'N/A',
        `RD$ ${l.amount}`,
        `${l.interestRate}%`,
        l.status
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`Cartera_Pro_${new Date().toLocaleDateString('es-DO').replace(/\//g, '-')}.pdf`);
  };

  const pieData = [
    { name: 'Activos', value: summary?.activeLoans || 0, color: '#10b981' },
    { name: 'En Mora', value: summary?.arrearsLoans || 0, color: '#f43f5e' },
    { name: 'Completados', value: completedLoans, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-primary font-headline tracking-tighter">Reportes de Cartera</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Análisis en tiempo real de rentabilidad y salud financiera.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-base">table_chart</span>
            Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-rose-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 active:scale-95 transition-all shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            PDF
          </button>
        </div>
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
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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

      {/* AGING REPORT / ANTIGÜEDAD DE SALDOS */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-rose-500 text-2xl">event_busy</span>
              <h3 className="text-xl md:text-2xl font-black text-primary font-headline tracking-tight uppercase">
                Antigüedad de Saldos (Aging Report)
              </h3>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Distribución de morosidad por antigüedad de vencimiento
            </p>
          </div>
          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black">
            Total Cartera en Riesgo: <span className="text-rose-600">RD$ {formatDOP(totalAgingDebt)}</span>
          </div>
        </div>

        {/* Segmented Color Bar */}
        {totalAgingDebt > 0 && (
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {Object.entries(agingBuckets).map(([key, bucket]) => {
                const pct = totalAgingDebt > 0 ? (bucket.amount / totalAgingDebt) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={key}
                    style={{ width: `${pct}%` }}
                    className={`${bucket.barColor} transition-all duration-700 relative group cursor-pointer`}
                    title={`${bucket.label}: RD$ ${formatDOP(bucket.amount)} (${pct.toFixed(1)}%)`}
                  ></div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between text-[10px] font-bold text-slate-400 gap-2">
              <span>🟢 0-15d (Al día)</span>
              <span>🟡 16-30d (Temprana)</span>
              <span>🟠 31-60d (Media)</span>
              <span>🔴 61-90d (Grave)</span>
              <span>🟣 +90d (Pérdida)</span>
            </div>
          </div>
        )}

        {/* 5 Bucket Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(agingBuckets).map(([key, bucket]) => {
            const pct = totalAgingDebt > 0 ? ((bucket.amount / totalAgingDebt) * 100).toFixed(1) : '0';
            return (
              <div key={key} className={`p-5 rounded-2xl border ${bucket.badgeBorder} ${bucket.badgeBg} flex flex-col justify-between`}>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${bucket.textColor}`}>
                    {bucket.shortLabel}
                  </span>
                  <p className="text-lg font-black text-slate-800">RD$ {formatDOP(bucket.amount)}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>{bucket.loans.length} préstamo(s)</span>
                  <span className="font-mono font-black">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table of Delinquent Loans */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">
              Detalle de Clientes con Atraso ({Object.values(agingBuckets).reduce((s, b) => s + (b.label.includes('Al día') ? 0 : b.loans.length), 0)} préstamos en mora)
            </h4>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Préstamo</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 text-center">Días de Atraso</th>
                  <th className="px-6 py-4 text-center">Tramo de Riesgo</th>
                  <th className="px-6 py-4 text-right">Saldo Pendiente</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.entries(agingBuckets)
                  .filter(([key]) => key !== 'current') // Only show overdue loans
                  .flatMap(([_, b]) => b.loans)
                  .sort((a, b) => b.maxDaysOverdue - a.maxDaysOverdue)
                  .map((loan: any) => {
                    const days = loan.maxDaysOverdue;
                    const phone = loan.client?.phone ? loan.client.phone.replace(/\D/g, '') : '';
                    const waText = encodeURIComponent(`Hola ${loan.client?.name}, le escribimos de la administración para recordarle su cuota atrasada con ${days} días de vencimiento. Agradecemos ponerse al día.`);
                    const waLink = phone ? `https://wa.me/1${phone}?text=${waText}` : null;

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-slate-400">
                          #PR-{1000 + loan.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-slate-900">{loan.client?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{loan.client?.phone || 'Sin teléfono'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-black font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                            {days} días
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            days <= 30 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            days <= 60 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            days <= 90 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-purple-50 text-purple-900 border border-purple-200'
                          }`}>
                            {days <= 30 ? '16-30 Días' : days <= 60 ? '31-60 Días' : days <= 90 ? '61-90 Días' : '+90 Días (Pérdida)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-black text-slate-900">RD$ {formatDOP(loan.pendingDebt)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm"
                                title="Enviar Recordatorio por WhatsApp"
                              >
                                <span className="material-symbols-outlined text-sm">chat</span>
                              </a>
                            ) : null}
                            <a
                              href={`/billing`}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-600 flex items-center justify-center"
                              title="Ir a Cobrar"
                            >
                              <span className="material-symbols-outlined text-sm">payments</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {Object.entries(agingBuckets).filter(([key]) => key !== 'current').flatMap(([_, b]) => b.loans).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      ¡Felicidades! No hay préstamos con mora superior a 15 días en la cartera.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
