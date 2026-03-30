import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createLoan } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { formatDOP } from '../utils/format';
import SearchableSelect from '../components/SearchableSelect';

const NewLoan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    interestRate: '',
    term: '',
    frequency: 'MONTHLY' as 'MONTHLY' | 'WEEKLY'
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const clientOptions = useMemo(() => 
    clients.map((c: any) => ({
      id: c.id,
      label: c.name,
      sublabel: `Cédula: ${c.identification}`,
      original: c
    })), [clients]);

  const mutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      navigate('/loans');
    },
  });

  // Utility to handle amounts with commas
  const formatAmountInput = (val: string) => {
    // Remove all non-digits except decimals
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return val; // Invalid input
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const parseAmountInput = (val: string) => {
    return val.replace(/,/g, '');
  };

  // Dynamic Amortization Calculation
  const amortization = useMemo(() => {
    const amount = parseFloat(parseAmountInput(formData.amount));
    const monthlyRate = parseFloat(formData.interestRate);
    const term = parseInt(formData.term);

    if (!amount || isNaN(monthlyRate) || !term) return [];

    // Adjust rate and installments based on frequency
    const ratePerPeriod = (formData.frequency === 'MONTHLY' ? monthlyRate : monthlyRate / 4) / 100;
    
    // Monthly installment (French Amortization)
    const installment = ratePerPeriod === 0 
      ? amount / term 
      : amount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, term)) / (Math.pow(1 + ratePerPeriod, term) - 1);
    
    let currentBalance = amount;
    const schedule = [];

    for (let i = 1; i <= term; i++) {
      const interest = currentBalance * ratePerPeriod;
      const capital = installment - interest;
      currentBalance -= capital;
      
      schedule.push({
        no: i.toString().padStart(2, '0'),
        installment,
        capital,
        interest,
        balance: Math.max(0, currentBalance)
      });
    }

    return schedule;
  }, [formData]);

  const totals = useMemo(() => {
    const amountVal = parseFloat(parseAmountInput(formData.amount));
    if (amortization.length === 0 || isNaN(amountVal)) return { installment: 0, total: 0, interest: 0 };
    const installment = amortization[0].installment;
    const total = installment * amortization.length;
    return {
      installment,
      total,
      interest: total - amountVal
    };
  }, [amortization, formData.amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(parseAmountInput(formData.amount));
    if (!formData.clientId || isNaN(amountVal) || !formData.interestRate || !formData.term) return;
    
    mutation.mutate({
      clientId: parseInt(formData.clientId),
      amount: amountVal,
      interestRate: parseFloat(formData.interestRate),
      term: parseInt(formData.term),
      frequency: formData.frequency
    });
  };

  return (
    <div className="space-y-8 text-left animate-in slide-in-from-bottom-5 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-slate-100 border border-slate-50">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-primary mb-2 font-headline tracking-tighter">Suscripción de Crédito</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Préstamo Pro SaaS - Módulo de Originación</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <SearchableSelect 
                label="Titular del Préstamo"
                placeholder={loadingClients ? "Buscando clientes..." : "Escribir nombre o cédula..."}
                options={clientOptions}
                value={formData.clientId}
                onChange={val => setFormData({ ...formData, clientId: val })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monto Principal</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                    <input 
                      required
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 pl-6 pr-0 text-sm font-black transition-all"
                      placeholder="0.00" 
                      type="text"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: formatAmountInput(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tasa del Préstamo (%)</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 px-0 text-sm font-black transition-all"
                    placeholder="Ej: 3.5" 
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Número de Cuotas ({formData.frequency === 'MONTHLY' ? 'Meses' : 'Semanas'})</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 px-0 text-sm font-black transition-all"
                    placeholder={formData.frequency === 'MONTHLY' ? "Ej: 12" : "Ej: 12"}
                    type="number"
                    value={formData.term}
                    onChange={e => setFormData({ ...formData, term: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Frecuencia de Cobro</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: 'MONTHLY' })}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.frequency === 'MONTHLY' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      Meses
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: 'WEEKLY' })}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.frequency === 'WEEKLY' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      Semanas
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 bg-primary text-white p-8 rounded-3xl relative overflow-hidden group shadow-2xl shadow-primary/20 border border-white/5">
                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Cuota por {formData.frequency === 'MONTHLY' ? 'Mes' : 'Semana'}</p>
                         <h3 className="text-4xl font-black font-headline tracking-tighter">${formatDOP(totals.installment)}</h3>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Total Crédito</p>
                         <h4 className="text-xl font-black">${formatDOP(totals.total)}</h4>
                      </div>
                   </div>
                   <div className="h-[2px] w-full bg-white/10"></div>
                   <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Intereses Totales: ${formatDOP(totals.interest)}</p>
                      <button 
                        disabled={mutation.isPending}
                        className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-900/40"
                      >
                        {mutation.isPending ? 'Procesando...' : 'Desembolsar Ahora'}
                      </button>
                   </div>
                </div>
                {/* Visual Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full transition-transform group-hover:scale-125 duration-1000"></div>
              </div>
            </form>
          </div>
        </section>

        {/* Amortization Column */}
        <section className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl h-[800px] flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600 opacity-[0.03] backdrop-blur-3xl"></div>
              <div className="p-10 relative z-10 border-b border-white/5">
                 <h2 className="text-xl font-black text-white font-headline tracking-tight">Tabla de Amortización</h2>
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">{formData.frequency === 'MONTHLY' ? 'Meses' : 'Semanas'} a proyectar: {amortization.length}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
                 {amortization.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-white italic text-center px-10">
                       <span className="material-symbols-outlined text-6xl mb-4">calculate</span>
                       <p className="text-sm font-bold">Ingrese los datos del crédito para proyectar el calendario de pagos.</p>
                    </div>
                 ) : amortization.map((row) => (
                    <div key={row.no} className="bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all p-5 rounded-2xl flex items-center justify-between group/row">
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-600 group-hover/row:text-primary transition-colors">{row.no}</span>
                          <div className="h-8 w-[2px] bg-white/10"></div>
                          <div>
                              <p className="text-xs font-black text-white tracking-tight">${formatDOP(row.installment)}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cuota Fija</p>
                          </div>
                       </div>
                       <div className="text-right">
                           <p className="text-xs font-extrabold text-blue-400 font-mono italic">${formatDOP(row.balance)}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saldo Restante</p>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-8 relative z-10 bg-black/40 border-t border-white/5">
                 <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Proyección generada por el motor de cálculo Pro
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default NewLoan;
