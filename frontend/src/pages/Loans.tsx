import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans, deleteLoan, refinanceLoan, getBanks } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatDOP } from '../utils/format';
import Swal from 'sweetalert2';

import { LoansSkeleton } from '../components/Skeleton';

const Loans = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [refinanceModalLoan, setRefinanceModalLoan] = useState<any>(null);
  const [refinanceData, setRefinanceData] = useState<any>({
    additionalAmount: '0',
    interestRate: '10',
    term: '3',
    frequency: 'MONTHLY',
    loanType: 'INSTALLMENT',
    interestType: 'SIMPLE',
    bankAccountId: '',
    lateFeeType: 'PERCENT',
    lateFeeValue: '5',
    graceDays: '2',
    notes: ''
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'STATEMENT' | 'RECEIPT'>('STATEMENT');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: getBanks,
  });

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  });

  const refinanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => refinanceLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setRefinanceModalLoan(null);
      Swal.fire({
        icon: 'success',
        title: '¡Préstamo Refinanciado!',
        text: 'La deuda previa ha sido cancelada y se ha aperturado el nuevo crédito reestructurado.',
        confirmButtonColor: '#2563eb'
      });
    },
    onError: (err: any) => {
      Swal.fire('Error', err.response?.data?.message || 'Error al refinanciar el préstamo.', 'error');
    }
  });

  const filteredLoans = loans.filter((l: any) => 
    l.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.client?.identification && l.client.identification.includes(searchTerm)) ||
    (`#PR-${1000 + l.id}`).includes(searchTerm)
  );

  const deleteMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  if (isLoading) return <LoansSkeleton />;

  const handleDelete = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Desea eliminar este préstamo? Esta acción también eliminará todas las cuotas y pagos asociados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const openDetails = (loan: any) => {
    setSelectedLoan(loan);
    setIsDetailModalOpen(true);
  };

  const openPrint = (loan: any) => {
    setSelectedLoan(loan);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500">
      {/* Header section remain consistent */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 text-left no-print">
        <div className="max-w-2xl">
          <span className="text-primary font-black tracking-[0.2em] text-[10px] uppercase mb-1 md:mb-2 block italic opacity-50">Sistema Pro v2.5</span>
          <h2 className="text-2xl md:text-4xl font-black text-primary leading-tight font-headline tracking-tighter uppercase">Control de Préstamos</h2>
          <p className="text-slate-400 mt-1 md:mt-2 text-[10px] md:text-sm font-medium italic hidden md:block">Supervisión integral de la cartera activa y cobranza.</p>
        </div>
        <Link to="/loans/new" className="w-full md:w-auto px-6 md:px-10 py-4 bg-primary text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest">
           <span className="material-symbols-outlined font-black">add_circle</span>
           Nuevo Préstamo
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden no-print">
        <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="relative group max-w-md w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full bg-slate-50/50 border border-slate-100 focus:ring-2 focus:ring-primary/10 rounded-xl md:rounded-2xl py-3.5 md:py-3 pl-12 pr-4 text-sm font-bold transition-all shadow-inner"
              placeholder="Buscar cliente o ID..." 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center justify-between">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{filteredLoans.length} Préstamos registrados</p>
          </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                <th className="px-8 py-6">Referencia</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6 text-right">Monto Principal</th>
                <th className="px-8 py-6">Interés</th>
                <th className="px-8 py-6">Plazo</th>
                <th className="px-8 py-6">Estado</th>
                <th className="px-8 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLoans.length === 0 ? (
                <tr>
                   <td colSpan={7} className="py-24 text-center">
                     <p className="opacity-30 italic font-medium mb-6">Buscando expedientes...</p>
                     {searchTerm && (
                       <button
                         onClick={() => navigate('/clients/new', { state: { initialName: searchTerm } })}
                         className="mx-auto px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                       >
                         <span className="material-symbols-outlined text-sm">person_add</span>
                         Registrar Cliente "{searchTerm}"
                       </button>
                     )}
                   </td>
                </tr>
              ) : filteredLoans.map((loan: any) => (
                <tr key={loan.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6 text-xs font-black text-slate-400 group-hover:text-primary tracking-tighter">
                    <p>#PR-{1000 + loan.id}</p>
                    {loan.portfolio && (
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase inline-flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[10px]">folder</span>
                        {loan.portfolio.name}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary text-[10px] font-black">
                        {loan.client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary leading-none mb-1">{loan.client.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{loan.client.identification || 'Sin cédula'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-primary">RD$ {formatDOP(loan.amount)}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">
                    {loan.interestRate}% <span className="text-[10px] text-slate-400 uppercase ml-1 block font-black">{loan.frequency === 'MONTHLY' ? 'Mensual' : loan.frequency === 'BIWEEKLY' ? 'Quincenal' : 'Semanal'}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">
                    {loan.term} <span className="text-[10px] text-slate-400 uppercase ml-1 font-black">{loan.term === 1 ? 'Cuota' : 'Cuotas'}</span>
                    <p className="text-[10px] text-slate-400 uppercase italic font-bold">{loan.frequency === 'MONTHLY' ? 'Mensual' : loan.frequency === 'BIWEEKLY' ? 'Quincenal' : 'Semanal'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        loan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        loan.status === 'ARREARS' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {loan.status === 'ACTIVE' ? 'Al Corriente' : 
                         loan.status === 'ARREARS' ? 'En Mora' : 
                         'Completado'}
                      </span>
                      {loan.isRefinanced && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">sync</span>
                          Refinanciado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                       <button 
                         onClick={() => openDetails(loan)}
                         className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-slate-400 transition-all flex items-center justify-center border border-slate-100 active:scale-90"
                         title="Ver Cuotas"
                       >
                         <span className="material-symbols-outlined text-xl">visibility</span>
                       </button>
                       <button 
                         onClick={() => openPrint(loan)}
                         className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-slate-400 transition-all flex items-center justify-center border border-slate-100 active:scale-90"
                         title="Imprimir Pagaré / Recibo"
                       >
                         <span className="material-symbols-outlined text-xl">receipt_long</span>
                       </button>
                       {loan.status !== 'COMPLETED' && !loan.isRefinanced && (
                         <button 
                           onClick={() => {
                             setRefinanceModalLoan(loan);
                             setRefinanceData({
                               additionalAmount: '0',
                               interestRate: String(loan.interestRate || '10'),
                               term: String(loan.term || '3'),
                               frequency: loan.frequency || 'MONTHLY',
                               loanType: loan.loanType || 'INSTALLMENT',
                               interestType: loan.interestType || 'SIMPLE',
                               bankAccountId: banks[0]?.id || '',
                               lateFeeType: loan.lateFeeType || 'PERCENT',
                               lateFeeValue: String(loan.lateFeeValue || '5'),
                               graceDays: String(loan.graceDays || '2'),
                               notes: `Refinanciamiento del préstamo #PR-${1000 + loan.id}`
                             });
                           }}
                           className="w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 transition-all flex items-center justify-center border border-purple-100 active:scale-90"
                           title="Refinanciar / Reestructurar Deuda"
                         >
                           <span className="material-symbols-outlined text-xl">published_with_changes</span>
                         </button>
                       )}
                       <button 
                         onClick={() => handleDelete(loan.id)}
                         disabled={deleteMutation.isPending}
                         className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-400 transition-all flex items-center justify-center border border-rose-100 active:scale-90 disabled:opacity-50"
                         title="Eliminar"
                       >
                         <span className="material-symbols-outlined text-xl">delete</span>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL: "OJO" BUTTON */}
      {isDetailModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  <div className="relative flex items-center gap-4 text-left">
                     <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">visibility</span>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase whitespace-normal break-words">Calendario de Pagos</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5 break-words">#PR-{1000 + selectedLoan.id} · {selectedLoan.client.name}</p>
                     </div>
                  </div>
                  <button
                     type="button"
                     onClick={() => setIsDetailModalOpen(false)}
                     className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                  >
                     <span className="material-symbols-outlined text-lg">close</span>
                  </button>
               </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    {selectedLoan.installments?.map((inst: any) => (
                       <div key={inst.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all text-left">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${inst.status === 'PAID' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                {inst.number.toString().padStart(2, '0')}
                             </div>
                             <div>
                                <p className="text-sm font-black text-primary">Vence: {new Date(inst.dueDate).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">RD$ {formatDOP(inst.amount)}</p>
                             </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                             {inst.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="p-8 bg-slate-50 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Restante: RD$ {formatDOP(selectedLoan.installments?.filter((i:any) => i.status === 'PENDING').reduce((acc:number, i:any) => acc + Number(i.amount), 0) || 0)}</p>
              </div>
           </div>
        </div>
      )}

      {/* PRINT MODAL: "RECIBO" BUTTON */}
      {isPrintModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPrintModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  <div className="relative flex items-center gap-4 text-left">
                     <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">description</span>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase whitespace-normal break-words">Estado de Cuenta</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5 break-words">Generación de documento formal · PresPro Systems</p>
                     </div>
                  </div>
                  <button
                     type="button"
                     onClick={() => setIsPrintModalOpen(false)}
                     className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                  >
                     <span className="material-symbols-outlined text-lg">close</span>
                  </button>
               </div>

              {/* Document Preview */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                 <div className="flex justify-between border-b pb-6">
                    <div className="space-y-1">
                       <h4 className="text-lg font-black text-primary uppercase font-headline">PRESPRO SYSTEMS</h4>
                       <p className="text-[10px] font-bold text-slate-400">RNC: 123-45678-9</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-slate-400">Cód. Archivo</p>
                       <p className="text-sm font-black text-primary">#{1000 + selectedLoan.id}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Titular</p>
                       <p className="font-black text-primary uppercase leading-none">{selectedLoan.client.name}</p>
                       <p className="text-[10px] text-slate-500 font-bold mt-1">{selectedLoan.client.identification || 'Sin cédula'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Inversión Original</p>
                       <p className="font-black text-primary">RD$ {formatDOP(selectedLoan.amount)}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{selectedLoan.interestRate}% Tasa Mensual</p>
                    </div>
                 </div>

                 <div className="space-y-3 py-4 border-y border-slate-100">
                    <div className="flex justify-between text-xs font-black">
                       <span className="text-slate-400 uppercase">Capital Recuperado</span>
                       <span className="text-primary">RD$ {formatDOP(selectedLoan.installments?.filter((i:any) => i.status === 'PAID').reduce((acc:number, i:any) => acc + Number(i.capital), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black">
                       <span className="text-slate-400 uppercase">Interés Devengado</span>
                       <span className="text-primary">RD$ {formatDOP(selectedLoan.installments?.filter((i:any) => i.status === 'PAID').reduce((acc:number, i:any) => acc + Number(i.interest), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-3 border-t-2 border-emerald-500/20 text-emerald-600">
                       <span className="uppercase tracking-tight">Total Retornado</span>
                       <span className="underline decoration-2">RD$ {formatDOP(selectedLoan.installments?.filter((i:any) => i.status === 'PAID').reduce((acc:number, i:any) => acc + Number(i.amount), 0) || 0)}</span>
                    </div>
                 </div>

                 <div className="pt-2 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Saldo Exigible</p>
                    <p className="text-3xl font-black text-primary font-headline italic">RD$ {formatDOP(selectedLoan.installments?.filter((i:any) => i.status === 'PENDING').reduce((acc:number, i:any) => acc + Number(i.amount), 0) || 0)}</p>
                 </div>
              </div>

               <div className="p-8 bg-slate-50 border-t border-slate-100 flex-shrink-0 no-print flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => { setPrintType('STATEMENT'); setTimeout(() => window.print(), 100); }}
                    className="flex-1 bg-slate-100 text-primary font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                  >
                     <span className="material-symbols-outlined text-[18px]">article</span>
                     <span className="tracking-widest uppercase text-[10px]">Estado de Cuenta</span>
                  </button>
                  <button 
                    onClick={() => { setPrintType('RECEIPT'); setTimeout(() => window.print(), 100); }}
                    className="flex-1 bg-primary text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                     <span className="material-symbols-outlined text-[18px]">print</span>
                     <span className="tracking-widest uppercase text-[10px]">Imprimir Recibo</span>
                  </button>
               </div>
            </div>
        </div>
      )}

      {/* PRINT VIEW (Only visible when printing) */}
      {/* PRINT VIEW (Only visible when printing) */}
      <div className="print-only hidden" id="printable-receipt">
          {printType === 'STATEMENT' ? (
            <>
              <div className="text-center mb-6 space-y-1">
                 <h4 className="text-xl font-black text-black font-headline uppercase">ESTADO DE CUENTA</h4>
                 <p className="text-[10px] font-bold text-black uppercase tracking-widest border-b border-black pb-2">PRESPRO SYSTEMS - SISTEMAFAC</p>
              </div>
              
              <div className="mb-6 space-y-1 text-xs text-black font-bold uppercase">
                 <p><span className="font-black">CLIENTE:</span> {selectedLoan?.client?.name}</p>
                 <p><span className="font-black">CEDULA:</span> {selectedLoan?.client?.identification || 'N/A'}</p>
                 <p><span className="font-black">PRESTAMO:</span> #PR-{1000 + (selectedLoan?.id || 0)}</p>
                 <div className="border-t border-black mt-2 pt-2">
                     <p><span className="font-black">CAPITAL:</span> RD$ {formatDOP(selectedLoan?.amount || 0)}</p>
                     <p><span className="font-black">TASA:</span> {selectedLoan?.interestRate}%</p>
                     <p><span className="font-black">PLAZO:</span> {selectedLoan?.term} {selectedLoan?.frequency === 'MONTHLY' ? 'Meses' : selectedLoan?.frequency === 'BIWEEKLY' ? 'Quincenas' : 'Semanas'}</p>
                 </div>
              </div>

              <h2 className="text-[10px] font-black uppercase tracking-widest mt-6 mb-2 border-b border-black pb-1">Cronograma de Pagos</h2>
              <table className="w-full text-[9px] mb-6">
                 <thead className="border-b border-black">
                     <tr className="text-left font-black uppercase">
                         <th className="py-2">No.</th>
                         <th className="py-2">Fecha</th>
                         <th className="py-2">Cuota</th>
                         <th className="py-2 text-right">Balance</th>
                         <th className="py-2 text-right">Status</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y border-b border-black text-black font-bold">
                     {selectedLoan?.installments?.map((inst: any) => (
                         <tr key={inst.id}>
                             <td className="py-2 font-black">{inst.number}</td>
                             <td className="py-2">{new Date(inst.dueDate).toLocaleDateString('es-DO')}</td>
                             <td className="py-2 font-bold">${formatDOP(inst.amount)}</td>
                             <td className="py-2 text-right">${formatDOP(inst.balance)}</td>
                             <td className="py-2 text-right font-black uppercase italic">{inst.status === 'PAID' ? 'LIQ' : 'PEND'}</td>
                         </tr>
                     ))}
                 </tbody>
              </table>
            </>
          ) : (
            <div className="space-y-6 text-black">
               <div className="text-center mb-6 space-y-1">
                  <h4 className="text-xl font-black font-headline uppercase">VALE DE DESEMBOLSO</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2">PRESPRO SYSTEMS - SISTEMAFAC</p>
               </div>

               <div className="space-y-4 text-xs font-bold uppercase">
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] font-black uppercase">NRO. OPERACION: {String(selectedLoan?.id || 0).padStart(5, '0')}</p>
                     <p className="text-[10px] font-black uppercase">VALE NO: DIS-{String(selectedLoan?.id || 0).padStart(4, '0')}</p>
                  </div>

                  <div className="border-t border-black pt-2 flex flex-col gap-1">
                     <p><span className="font-black">DESTINATARIO:</span> {selectedLoan?.client?.name}</p>
                     <p><span className="font-black">CEDULA:</span> {selectedLoan?.client?.identification || 'N/A'}</p>
                  </div>

                  <div className="border-t border-black pt-2 flex flex-col gap-1">
                     <p><span className="font-black">REMITENTE:</span> ADMINISTRACION PRO</p>
                     <p><span className="font-black">CONCEPTO:</span> DESEMBOLSO DE CAPITAL</p>
                     <p><span className="font-black">PLAZO:</span> {selectedLoan?.term} {selectedLoan?.frequency === 'MONTHLY' ? 'MESES' : selectedLoan?.frequency === 'BIWEEKLY' ? 'QUINCENAS' : 'SEMANAS'}</p>
                     <p><span className="font-black">TASA:</span> {selectedLoan?.interestRate}%</p>
                  </div>

                  <div className="border-t border-black pt-2">
                     <div className="flex justify-between items-center bg-black/5 p-3 border border-black">
                        <span className="font-black uppercase tracking-tighter text-[10px]">MONTO NETO ENTREGADO:</span>
                        <span className="text-2xl font-black italic">RD$ {formatDOP(selectedLoan?.amount || 0)}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 pt-16">
                     <div className="text-center">
                        <div className="border-b border-black h-8"></div>
                        <p className="text-[8px] font-black uppercase mt-1">Firma Entregado</p>
                     </div>
                     <div className="text-center">
                        <div className="border-b border-black h-8"></div>
                        <p className="text-[8px] font-black uppercase mt-1">Firma Recibido</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="mt-10 border-t border-dashed border-black pt-4 text-center text-black">
             <p className="text-[9px] font-black uppercase">LA ROMANA, REP. DOM.</p>
             <p className="text-[9px] font-medium italic mt-2">Este documento representa la entrega formal de valores. Validado por SistemaFac Pro.</p>
          </div>
       </div>

      {/* MODAL REFINANCIAMIENTO */}
      {refinanceModalLoan && (() => {
        const pendingBalance = refinanceModalLoan.installments?.filter((i: any) => i.status === 'PENDING').reduce((acc: number, i: any) => acc + Number(i.amount), 0) || 0;
        const additional = parseFloat(refinanceData.additionalAmount) || 0;
        const totalNewPrincipal = pendingBalance + additional;
        const rate = parseFloat(refinanceData.interestRate) || 0;
        const term = parseInt(refinanceData.term) || 1;
        
        let estInstallment = 0;
        if (refinanceData.loanType === 'REDITO') {
          estInstallment = totalNewPrincipal * (rate / 100);
        } else {
          const totalInterest = totalNewPrincipal * (rate / 100) * term;
          estInstallment = (totalNewPrincipal + totalInterest) / term;
        }

        const handleConfirmRefinance = (e: React.FormEvent) => {
          e.preventDefault();
          if (!refinanceData.interestRate || !refinanceData.term) {
            Swal.fire('Campos requeridos', 'Por favor indique la tasa de interés y el plazo.', 'warning');
            return;
          }
          if (additional > 0 && !refinanceData.bankAccountId) {
            Swal.fire('Cuenta requerida', 'Debe seleccionar una cuenta bancaria para el desembolso adicional en efectivo.', 'warning');
            return;
          }
          refinanceMutation.mutate({
            id: refinanceModalLoan.id,
            data: {
              additionalAmount: additional,
              newInterestRate: rate,
              newTerm: term,
              newFrequency: refinanceData.frequency,
              newLoanType: refinanceData.loanType,
              newInterestType: refinanceData.interestType,
              bankAccountId: refinanceData.bankAccountId ? parseInt(String(refinanceData.bankAccountId)) : banks[0]?.id,
              lateFeeType: refinanceData.lateFeeType,
              lateFeeValue: parseFloat(refinanceData.lateFeeValue || '0'),
              graceDays: parseInt(refinanceData.graceDays || '0'),
              notes: refinanceData.notes || `Refinanciamiento del préstamo PR-${1000 + refinanceModalLoan.id}`
            }
          });
        };

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setRefinanceModalLoan(null)}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 flex-shrink-0 text-white">
                      <span className="material-symbols-outlined text-2xl">published_with_changes</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase">Refinanciar Préstamo</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">
                        #PR-{1000 + refinanceModalLoan.id} · {refinanceModalLoan.client.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRefinanceModalLoan(null)}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmRefinance} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-left">
                {/* Deuda a Cancelar vs Deuda Nueva */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Deuda Pendiente Actual</span>
                    <p className="text-lg font-black text-rose-600">RD$ {formatDOP(pendingBalance)}</p>
                    <span className="text-[8px] font-bold text-slate-400">Se cancelará automáticamente</span>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 block mb-1">Efectivo Adicional (+)</span>
                    <div className="flex items-center">
                      <span className="text-sm font-black text-purple-700 mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-white border border-purple-200 rounded-lg py-1 px-2 text-sm font-black text-purple-900 focus:outline-none"
                        value={refinanceData.additionalAmount}
                        onChange={e => setRefinanceData({ ...refinanceData, additionalAmount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-[8px] font-bold text-purple-500">Monto extra en mano</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Nuevo Capital Total</span>
                    <p className="text-lg font-black text-emerald-700">RD$ {formatDOP(totalNewPrincipal)}</p>
                    <span className="text-[8px] font-bold text-emerald-600">Monto nuevo crédito</span>
                  </div>
                </div>

                {/* Modalidad y Frecuencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Modalidad</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRefinanceData({ ...refinanceData, loanType: 'INSTALLMENT' })}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          refinanceData.loanType === 'INSTALLMENT' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        Cuotas
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefinanceData({ ...refinanceData, loanType: 'REDITO' })}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          refinanceData.loanType === 'REDITO' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        Rédito
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Frecuencia</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['MONTHLY', 'BIWEEKLY', 'WEEKLY'] as const).map(freq => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setRefinanceData({ ...refinanceData, frequency: freq })}
                          className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${
                            refinanceData.frequency === freq ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {freq === 'MONTHLY' ? 'Mensual' : freq === 'BIWEEKLY' ? 'Quincenal' : 'Semanal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasa y Plazo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Nueva Tasa Mensual (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-black text-slate-800"
                      value={refinanceData.interestRate}
                      onChange={e => setRefinanceData({ ...refinanceData, interestRate: e.target.value })}
                      placeholder="Ej: 10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Nuevo Plazo (Cuotas)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-black text-slate-800"
                      value={refinanceData.term}
                      onChange={e => setRefinanceData({ ...refinanceData, term: e.target.value })}
                      placeholder="Ej: 3"
                    />
                  </div>
                </div>

                {/* Cuenta de Banco para desembolso */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Cuenta Bancaria de Registro</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 appearance-none"
                    value={refinanceData.bankAccountId}
                    onChange={e => setRefinanceData({ ...refinanceData, bankAccountId: e.target.value })}
                  >
                    <option value="">Seleccione cuenta</option>
                    {banks.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - Cuenta {b.accountNumber} (Disp: RD$ {formatDOP(b.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimación de cuota */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Cuota Estimada Reestructurada</span>
                    <span className="text-xl font-black text-emerald-400">RD$ {formatDOP(estInstallment)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Plazo Total</span>
                    <span className="text-xs font-bold text-white">{term} {refinanceData.frequency === 'MONTHLY' ? 'Meses' : refinanceData.frequency === 'BIWEEKLY' ? 'Quincenas' : 'Semanas'}</span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRefinanceModalLoan(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={refinanceMutation.isPending}
                    className="flex-[2] py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {refinanceMutation.isPending ? (
                      <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Refinanciando...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">published_with_changes</span> Aprobar y Refinanciar</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Loans;
