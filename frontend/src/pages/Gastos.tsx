import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, createExpense, markExpenseAsPaid } from '../api/api';
import { formatDOP } from '../utils/format';
import { LoansSkeleton } from '../components/Skeleton';

const Gastos = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    status: 'PENDING' as 'PAID' | 'PENDING'
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setFormData({ amount: '', description: '', status: 'PENDING' });
    }
  });

  const payMutation = useMutation({
    mutationFn: markExpenseAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  if (isLoading) return <LoansSkeleton />;

  const pendingExpenses = expenses.filter((e: any) => e.status === 'PENDING');
  const paidExpenses = expenses.filter((e: any) => e.status === 'PAID');

  const formatAmountInput = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return val;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formData.amount.replace(/,/g, ''));
    if (isNaN(amountVal) || !formData.description) return;
    createMutation.mutate({
      amount: amountVal,
      description: formData.description,
      status: formData.status
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Gastos y Cuentas por Pagar</h2>
          <p className="text-slate-500 mt-1">Administración de gastos menores y facturas pendientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
        >
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
            {pendingExpenses.length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-8">No hay cuentas por pagar</p>
            ) : pendingExpenses.map((expense: any) => (
              <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-rose-100 hover:shadow-md transition-all group gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">warning</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{expense.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Registrado: {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right flex flex-col sm:items-end">
                  <p className="font-black text-rose-600">${formatDOP(expense.amount)}</p>
                  <button 
                    onClick={() => payMutation.mutate(expense.id)}
                    disabled={payMutation.isPending}
                    className="text-[10px] uppercase font-bold text-primary hover:underline mt-1 disabled:opacity-50"
                  >
                    {payMutation.isPending ? 'Procesando...' : 'Pagar Ahora'}
                  </button>
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
            {paidExpenses.length === 0 ? (
              <p className="text-center text-slate-400 italic text-sm py-8">No hay historial de pagos</p>
            ) : paidExpenses.map((expense: any) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{expense.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Pagado: {new Date(expense.updatedAt || expense.createdAt).toLocaleDateString()}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase">Registrar Gasto</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Control de Egresos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción del Gasto / Factura</label>
                <input 
                  required
                  className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-sm font-bold transition-all"
                  placeholder="Ej: Pago de Internet, Suministros..."
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monto (RD$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                  <input 
                    required
                    className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 pl-8 pr-4 text-sm font-black transition-all"
                    placeholder="0.00"
                    type="text"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: formatAmountInput(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Estado del Gasto</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'PAID' })}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${formData.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    Ya Pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'PENDING' })}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${formData.status === 'PENDING' ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    Pendiente
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-primary text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Guardando...' : 'Confirmar Gasto'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gastos;

