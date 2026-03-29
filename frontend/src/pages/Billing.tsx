import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, getUpcomingInstallments, createPayment, getLoans } from '../api/api';
import { formatDOP } from '../utils/format';
import SearchableSelect from '../components/SearchableSelect';

const Billing = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [recentPayment, setRecentPayment] = useState<any>(null);

  const [formData, setFormData] = useState({
    loanId: '',
    numInstallments: 1,
    amount: '',
    method: 'CASH' as 'CASH' | 'TRANSFER',
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ['upcoming-installments'],
    queryFn: getUpcomingInstallments,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  });

  // Utility to handle amounts with commas
  const formatAmountInput = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return val;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const parseAmountInput = (val: string) => {
    return val.replace(/,/g, '');
  };

  const loanOptions = useMemo(() => 
    loans.filter((l: any) => l.status === 'ACTIVE' || l.status === 'ARREARS').map((l: any) => ({
      id: l.id,
      label: l.client.name,
      sublabel: `PR-${l.id.toString().padStart(4, '0')} - Balance: RD$ ${formatDOP(l.amount)}`,
      original: l
    })), [loans]);

  // Calculate info for the selected loan
  const loanInfo = useMemo(() => {
    if (!formData.loanId) return null;
    const loan = loans.find((l: any) => l.id === parseInt(formData.loanId));
    if (!loan) return null;

    const pending = loan.installments.filter((i: any) => i.status === 'PENDING').sort((a: any, b: any) => a.number - b.number);
    const nextInst = pending[0];
    const perInst = nextInst?.amount || 0;
    const totalRemaining = pending.reduce((acc: number, i: any) => acc + i.amount, 0);

    return {
      loan,
      perInst,
      totalRemaining,
      nextDueDate: nextInst?.dueDate,
      pendingCount: pending.length,
    };
  }, [formData.loanId, loans]);

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-installments'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setRecentPayment(data);
      setShowModal(false);
      setShowReceipt(true);
      setFormData({ loanId: '', numInstallments: 1, amount: '', method: 'CASH' });
    },
  });

  const totalPaidGlobal = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(parseAmountInput(formData.amount));
    if (!formData.loanId || isNaN(amountVal)) return;
    mutation.mutate({
      loanId: parseInt(formData.loanId),
      amount: amountVal,
      method: formData.method,
    });
  };

  const updateInstallments = (count: number) => {
    if (!loanInfo) return;
    setFormData({ 
      ...formData, 
      numInstallments: count, 
      amount: formatAmountInput((loanInfo.perInst * count).toFixed(2)) 
    });
  };

  const isOverdue = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="space-y-6 md:space-y-10 text-left animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 no-print">
        <div>
          <span className="text-emerald-600 font-black tracking-[0.2em] text-[10px] uppercase mb-1 block">Finanzas Pro</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary leading-tight font-headline tracking-tighter">Facturación y Pagos</h2>
          <p className="text-slate-400 mt-1 md:mt-2 text-[10px] md:text-sm font-medium italic hidden md:block">Gestión automatizada de recaudaciones y estados de cuenta.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto px-6 md:px-10 py-4 bg-primary text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg md:text-xl font-black">add_card</span>
          Registrar Pago
        </button>
      </div>

      {/* KPI Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 no-print">
         <div className="sm:col-span-2 bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Cartera Recaudada</p>
               <h3 className="text-3xl md:text-5xl font-black tracking-tighter font-headline text-emerald-400">
                  RD$ {formatDOP(totalPaidGlobal)}
               </h3>
            </div>
            <div className="mt-6 md:mt-8 flex items-center gap-2 z-10">
               <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest flex items-center gap-2 border border-emerald-500/30 uppercase">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Sistema Sincronizado
               </span>
            </div>
            <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-emerald-500/10 rounded-full blur-[100px] md:blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         </div>

         <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden min-h-[140px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 relative z-10">Pagos Realizados</p>
              <h4 className="text-2xl md:text-4xl font-black text-emerald-600 relative z-10">{payments.length}</h4>
            </div>
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">receipt_long</span>
         </div>

         <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden min-h-[140px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 relative z-10">Cuotas en Mora</p>
              <h4 className="text-2xl md:text-4xl font-black text-rose-600 relative z-10">{upcoming.filter((i: any) => isOverdue(i.dueDate)).length}</h4>
            </div>
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">warning</span>
         </div>
      </section>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 lg:p-10 shadow-sm border border-slate-100 no-print overflow-hidden">
         <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
               <h3 className="font-black text-xl md:text-2xl text-primary font-headline tracking-tighter uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-4">Historial Transaccional</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Personal Loans Intelligence Ledger</p>
            </div>
         </div>
         <div className="overflow-x-auto min-w-full -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                     <th className="pb-6 pr-4">ID</th>
                     <th className="pb-6">Cliente</th>
                     <th className="pb-6 hidden sm:table-cell">Método</th>
                     <th className="pb-6 text-right">Monto</th>
                     <th className="pb-6 text-right">Fecha</th>
                     <th className="pb-6 text-center">Docs</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loadingPayments ? (
                     <tr><td colSpan={6} className="py-20 text-center text-slate-400 italic font-medium">Sincronizando con el servidor...</td></tr>
                  ) : payments.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="py-32 text-center opacity-20">
                           <span className="material-symbols-outlined text-7xl block mb-4">move_to_inbox</span>
                           <p className="text-lg font-black uppercase tracking-widest">Sin datos</p>
                        </td>
                     </tr>
                  ) : payments.map((p: any) => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="py-6">
                           <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">#{p.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="py-6">
                           <p className="text-sm font-black text-primary tracking-tight">{p.clientName || p.loan?.client?.name}</p>
                        </td>
                        <td className="py-6 hidden sm:table-cell">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${p.method === 'CASH' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                              {p.method === 'CASH' ? 'Efectivo' : 'Transferencia'}
                           </span>
                        </td>
                        <td className="py-6 text-right text-sm font-black text-emerald-600">RD$ {formatDOP(p.amount)}</td>
                        <td className="py-6 text-right">
                           <p className="text-xs font-bold text-slate-500 uppercase">{new Date(p.date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })}</p>
                        </td>
                        <td className="py-6">
                           <div className="flex justify-center">
                              <button 
                                onClick={() => { setRecentPayment(p); setShowReceipt(true); }}
                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-slate-100"
                              >
                                 <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
               
               {/* Header */}
               <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  <div className="relative flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">payments</span>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white font-headline tracking-tighter">Registrar Pago</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Liquidación de Cuotas · Préstamo Pro</p>
                     </div>
                  </div>
                  <button
                     type="button"
                     onClick={() => setShowModal(false)}
                     className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                  >
                     <span className="material-symbols-outlined text-lg">close</span>
                  </button>
               </div>

               <form onSubmit={handleRegisterPayment} className="p-8 space-y-5 bg-white overflow-y-auto custom-scrollbar">
                  <SearchableSelect 
                     label="Seleccionar Cliente / Préstamo"
                     placeholder="Buscar en cartera activa..."
                     options={loanOptions}
                     value={formData.loanId}
                     onChange={val => setFormData({ ...formData, loanId: val })}
                  />

                  {loanInfo && (
                     <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Información de Deuda</p>
                           <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">Activo</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Cuota Mensual</p>
                              <p className="text-base font-black text-primary italic underline underline-offset-4">RD$ {formatDOP(loanInfo.perInst)}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Pendiente Total</p>
                              <p className="text-base font-black text-slate-600">RD$ {formatDOP(loanInfo.totalRemaining)}</p>
                           </div>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 bg-white/50 p-2 rounded-xl flex items-center gap-2">
                           <span className="material-symbols-outlined text-[14px]">event</span>
                           Vence el {new Date(loanInfo.nextDueDate).toLocaleDateString('es-DO', { day: '2-digit', month: 'long' })}
                        </div>
                     </div>
                  )}

                  {loanInfo && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meses a Liquidar</label>
                        <div className="flex gap-2">
                           {[1, 2, 3].map(q => (
                              <button 
                                 key={q}
                                 type="button"
                                 onClick={() => updateInstallments(q)}
                                 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${formData.numInstallments === q ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                              >
                                 {q} Mes{q > 1 ? 'es' : ''}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monto Final a Recibir (RD$)</label>
                     <input 
                        required
                        type="text"
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-primary focus:ring-0 rounded-none py-4 px-0 text-xl font-black transition-all"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: formatAmountInput(e.target.value), numInstallments: 0 })}
                     />
                  </div>

                  <div className="flex gap-3">
                     <button type="button" onClick={() => setFormData({...formData, method: 'CASH'})} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${formData.method === 'CASH' ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>EFECTIVO</button>
                     <button type="button" onClick={() => setFormData({...formData, method: 'TRANSFER'})} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${formData.method === 'TRANSFER' ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>TRANSFERENCIA</button>
                  </div>

                  <button 
                     disabled={mutation.isPending}
                     className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl mt-4 flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                     {mutation.isPending ? (
                        <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Sincronizando...</>
                     ) : (
                        <><span className="material-symbols-outlined">verified</span> FINALIZAR COBRO</>
                     )}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceipt && recentPayment && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md no-print" onClick={() => setShowReceipt(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[95vh]">
               
               {/* Receipt Toast Header - No Print */}
               <div className="bg-emerald-500 px-8 py-5 flex items-center justify-between flex-shrink-0 no-print">
                  <div className="flex items-center gap-3 text-white">
                     <span className="material-symbols-outlined font-black">verified</span>
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">Recibo de Transacción Generado</p>
                  </div>
                  <button onClick={() => setShowReceipt(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                     <span className="material-symbols-outlined text-lg">close</span>
                  </button>
               </div>

               {/* Scrollable Receipt Area */}
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Printable Area - ID used by browser print */}
                  <div className="p-8 md:p-10 text-left bg-white" id="printable-receipt">
                      <div className="text-center mb-10">
                          <h4 className="text-2xl font-black text-primary font-headline tracking-tighter uppercase underline decoration-emerald-500 decoration-4 underline-offset-4">PRÉSTAMO PRO</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Personal Loan Management Systems</p>
                      </div>

                      <div className="space-y-6">
                          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
                              <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cliente Beneficiario</p>
                                  <p className="text-lg font-black text-primary uppercase">{recentPayment.clientName || recentPayment.loan?.client?.name}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Recibo No.</p>
                                  <p className="font-black text-primary">PAY-{String(recentPayment.id).padStart(4, '0')}</p>
                              </div>
                          </div>

                          <div className="py-6 space-y-4">
                              <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Monto Recibido:</span>
                                  <span className="text-3xl font-black text-emerald-600 font-headline italic">RD$ {formatDOP(recentPayment.amount)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Método de Pago:</span>
                                  <span className="font-black text-primary bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 uppercase">{recentPayment.method === 'CASH' ? 'Efectivo' : 'Transferencia'}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Fecha del Cobro:</span>
                                  <span className="font-bold text-slate-600 tracking-tight">{new Date(recentPayment.date).toLocaleDateString('es-DO', { dateStyle: 'full' })}</span>
                              </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 border-b-2 border-white pb-2">Desglose del Crédito (#PR-{1000 + (recentPayment.loan?.id || 0)})</p>
                              
                              <div className="flex justify-between items-center text-xs font-black">
                                  <span className="text-slate-400">MONTO DEL PRÉSTAMO:</span>
                                  <span className="text-primary italic">RD$ {formatDOP(recentPayment.loan?.amount || 0)}</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs font-black border-t border-white pt-2">
                                  <span className="text-slate-400 uppercase">PRÓXIMA CUOTA:</span>
                                  <span className="text-rose-500 font-bold underline underline-offset-4">
                                      RD$ {formatDOP(recentPayment.loan?.installments?.find((i:any) => i.status === 'PENDING')?.amount || 0)}
                                  </span>
                              </div>

                              <div className="flex justify-between items-center text-xs font-black border-t-2 border-primary/10 pt-4 bg-primary/[0.03] -mx-4 px-4 py-2 rounded-xl">
                                  <span className="text-primary uppercase tracking-tighter">SALDO RESTANTE ACTUAL:</span>
                                  <span className="text-primary text-lg font-black tracking-tight">
                                      RD$ {formatDOP(recentPayment.loan?.installments?.filter((i:any) => i.status === 'PENDING').reduce((acc:number, i:any) => acc + i.amount, 0) || 0)}
                                  </span>
                              </div>
                          </div>

                          <div className="text-center pt-8 border-t-2 border-dashed border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 italic">"Gracias por su puntualidad. Préstamo Pro, seriedad y confianza."</p>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Action Footer - No Print */}
               <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-3 flex-shrink-0 no-print">
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-black shadow-xl shadow-slate-200"
                  >
                        <span className="material-symbols-outlined text-xl">print</span>
                        <span className="tracking-widest uppercase text-[12px]">Imprimir Recibo Pro</span>
                  </button>
                  <button 
                     onClick={() => setShowReceipt(false)}
                     className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                      Cerrar Vista
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Billing;
