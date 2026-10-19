import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createLoan, getLoans, getPortfolios, getBanks } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDOP } from '../utils/format';
import SearchableSelect from '../components/SearchableSelect';
import Swal from 'sweetalert2';

const NewLoan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loanType, setLoanType] = useState<'INSTALLMENT' | 'REDITO'>('INSTALLMENT');
  const [interestType, setInterestType] = useState<'SIMPLE' | 'FRENCH'>('SIMPLE');

  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    interestRate: '',
    term: '',
    frequency: 'MONTHLY' as 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY',
    portfolioId: '' as string | number,
    bankAccountId: '' as string | number
  });

  const { data: portfolios = [] } = useQuery({ queryKey: ['portfolios'], queryFn: getPortfolios });
  const { data: banks = [] } = useQuery({ queryKey: ['banks'], queryFn: getBanks });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const { user } = useAuth();
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans
  });

  const clientOptions = useMemo(() => 
    clients.map((c: any) => ({
      id: c.id,
      label: c.name,
      sublabel: c.identification ? `Cédula: ${c.identification}` : 'Sin cédula registrada',
      original: c
    })), [clients]);

  const mutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      navigate('/loans');
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Ocurrió un error al crear el préstamo.',
        confirmButtonColor: '#2563eb'
      });
    }
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

  // Dynamic Calculation
  const defaultTerm = formData.frequency === 'WEEKLY' ? 4 : formData.frequency === 'BIWEEKLY' ? 2 : 1;
  const effectiveTerm = loanType === 'REDITO' ? 1 : (formData.term ? parseInt(formData.term) : defaultTerm);

  const calculations = useMemo(() => {
    const amount = parseFloat(parseAmountInput(formData.amount));
    const monthlyRate = parseFloat(formData.interestRate);

    if (!amount || isNaN(monthlyRate) || !effectiveTerm || effectiveTerm <= 0) {
      return {
        schedule: [],
        installment: 0,
        total: 0,
        interest: 0,
        periodicRedito: 0,
      };
    }

    let ratePerPeriod = 0;
    if (formData.frequency === 'MONTHLY') {
      ratePerPeriod = monthlyRate / 100;
    } else if (formData.frequency === 'BIWEEKLY') {
      ratePerPeriod = (monthlyRate / 2) / 100;
    } else {
      ratePerPeriod = (monthlyRate / 4) / 100;
    }

    if (loanType === 'REDITO') {
      const periodicRedito = amount * ratePerPeriod;
      return {
        schedule: [
          {
            no: '01',
            installment: periodicRedito,
            capital: 0,
            interest: periodicRedito,
            balance: amount
          }
        ],
        installment: periodicRedito,
        capitalPerInst: 0,
        interestPerInst: periodicRedito,
        total: amount,
        interest: periodicRedito,
        periodicRedito,
      };
    }

    if (interestType === 'FRENCH') {
      // Amortización francesa
      const installment = ratePerPeriod === 0 
        ? amount / effectiveTerm 
        : amount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, effectiveTerm)) / (Math.pow(1 + ratePerPeriod, effectiveTerm) - 1);
      
      let currentBalance = amount;
      const schedule = [];
      let totalInterest = 0;

      for (let i = 1; i <= effectiveTerm; i++) {
        const interest = currentBalance * ratePerPeriod;
        const capital = installment - interest;
        currentBalance -= capital;
        totalInterest += interest;
        
        schedule.push({
          no: i.toString().padStart(2, '0'),
          installment,
          capital,
          interest,
          balance: Math.max(0, currentBalance)
        });
      }

      return {
        schedule,
        installment,
        capitalPerInst: installment - (totalInterest / effectiveTerm),
        interestPerInst: totalInterest / effectiveTerm,
        total: installment * effectiveTerm,
        interest: totalInterest,
        periodicRedito: amount * ratePerPeriod,
      };
    } else {
      // Interés Simple / Directo (Práctica estándar informal y callejera)
      const durationInMonths = formData.frequency === 'WEEKLY' ? effectiveTerm / 4 : formData.frequency === 'BIWEEKLY' ? effectiveTerm / 2 : effectiveTerm;
      const totalInterest = amount * (monthlyRate / 100) * durationInMonths;
      const totalCredit = amount + totalInterest;
      const installment = totalCredit / effectiveTerm;
      const capitalPerInst = amount / effectiveTerm;
      const interestPerInst = totalInterest / effectiveTerm;

      let currentBalance = amount;
      const schedule = [];

      for (let i = 1; i <= effectiveTerm; i++) {
        currentBalance -= capitalPerInst;
        schedule.push({
          no: i.toString().padStart(2, '0'),
          installment,
          capital: capitalPerInst,
          interest: interestPerInst,
          balance: Math.max(0, currentBalance)
        });
      }

      return {
        schedule,
        installment,
        capitalPerInst,
        interestPerInst,
        total: totalCredit,
        interest: totalInterest,
        periodicRedito: amount * ratePerPeriod,
      };
    }
  }, [formData, effectiveTerm, loanType, interestType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(parseAmountInput(formData.amount));
    if (!formData.clientId || isNaN(amountVal) || !formData.interestRate || !formData.bankAccountId) {
      Swal.fire('Error', 'Por favor complete los campos requeridos (Cliente, Monto, Tasa y Cuenta de fondeo).', 'warning');
      return;
    }
    
    mutation.mutate({
      clientId: parseInt(formData.clientId),
      amount: amountVal,
      interestRate: parseFloat(formData.interestRate),
      term: effectiveTerm,
      frequency: formData.frequency,
      bankAccountId: parseInt(String(formData.bankAccountId)),
      loanType,
      interestType,
      ...(formData.portfolioId && { portfolioId: parseInt(String(formData.portfolioId)) })
    });
  };

  if (loadingLoans) {
     return <div className="py-24 text-center text-slate-400 font-bold animate-pulse">Verificando límites de cuenta...</div>;
  }

  const isLimitReached = (user?.plan === 'inicio' && loans.length >= 3) || (user?.plan === 'estandar' && loans.length >= 50);

  if (isLimitReached) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
         <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl">lock</span>
         </div>
         <h2 className="text-3xl font-black text-slate-800 mb-2 font-headline">Límite Alcanzado</h2>
         <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            Tu plan actual ({user?.plan === 'inicio' ? 'PRUEBA' : user?.plan?.toUpperCase()}) permite un máximo de {user?.plan === 'inicio' ? '3' : '50'} préstamos y ya has alcanzado este límite.
         </p>
         <a href="https://wa.me/8492705770?text=Hola,%20quiero%20mejorar%20mi%20plan" target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/30 inline-block mt-6">
            Mejorar mi Plan
         </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left animate-in slide-in-from-bottom-5 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-slate-100 border border-slate-50">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-primary mb-2 font-headline tracking-tighter">Suscripción de Crédito</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">PresPro Systems SaaS - Módulo de Originación</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* MODALIDAD DE PRÉSTAMO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Modalidad del Crédito</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setLoanType('INSTALLMENT')}
                    className={`py-3.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                      loanType === 'INSTALLMENT'
                        ? 'bg-white text-primary shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    Rédito y Capital (Cuotas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanType('REDITO')}
                    className={`py-3.5 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                      loanType === 'REDITO'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 font-black'
                        : 'text-slate-500 hover:text-amber-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">percent</span>
                    Solo Rédito (Interés Fijo)
                  </button>
                </div>
              </div>

              <SearchableSelect 
                label="Titular del Préstamo"
                placeholder={loadingClients ? "Buscando clientes..." : "Escribir nombre o cédula..."}
                options={clientOptions}
                value={formData.clientId}
                onChange={val => setFormData({ ...formData, clientId: val })}
                emptyAction={{
                  label: 'Registrar Cliente Nuevo',
                  onClick: (term) => navigate('/clients/new', { state: { initialName: term } })
                }}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cartera (Opcional)</label>
                <select
                  className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 text-sm font-black transition-all appearance-none"
                  value={formData.portfolioId}
                  onChange={e => setFormData({ ...formData, portfolioId: e.target.value })}
                >
                  <option value="">Seleccione una Cartera</option>
                  {portfolios.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cuenta de Origen (Fondeo)</label>
                <select
                  required
                  className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 text-sm font-black transition-all appearance-none"
                  value={formData.bankAccountId}
                  onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}
                >
                  <option value="">Seleccione cuenta de desembolso</option>
                  {banks.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - Cuenta {b.accountNumber} (Disponible: RD$ {formatDOP(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Frecuencia de Cobro</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: 'MONTHLY' })}
                      className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.frequency === 'MONTHLY' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      Mensual
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: 'BIWEEKLY' })}
                      className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.frequency === 'BIWEEKLY' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      Quincenal
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: 'WEEKLY' })}
                      className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.frequency === 'WEEKLY' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      Semanal
                    </button>
                  </div>
                </div>

                {loanType === 'INSTALLMENT' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Plazo / Cuotas <span className="text-emerald-600 font-bold lowercase">(opcional)</span>
                      </label>
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        {formData.term 
                          ? `${formData.term} ${parseInt(formData.term) === 1 ? 'cuota' : 'cuotas'}` 
                          : `Auto: ${formData.frequency === 'WEEKLY' ? '4 semanas' : formData.frequency === 'BIWEEKLY' ? '2 quincenas' : '1 mes'}`}
                      </span>
                    </div>
                    <input 
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus:border-primary focus:ring-0 rounded-none py-4 px-0 text-sm font-black transition-all"
                      placeholder={`Vacío = ${formData.frequency === 'WEEKLY' ? '4 cuotas semanales' : formData.frequency === 'BIWEEKLY' ? '2 cuotas quincenales' : '1 cuota mensual'}`}
                      type="number"
                      min="1"
                      value={formData.term}
                      onChange={e => setFormData({ ...formData, term: e.target.value })}
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, term: '' })}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          !formData.term 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Auto (1 Mes)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const count = formData.frequency === 'WEEKLY' ? 8 : formData.frequency === 'BIWEEKLY' ? 4 : 2;
                          setFormData({ ...formData, term: String(count) });
                        }}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          formData.term === String(formData.frequency === 'WEEKLY' ? 8 : formData.frequency === 'BIWEEKLY' ? 4 : 2)
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        2 Meses
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const count = formData.frequency === 'WEEKLY' ? 12 : formData.frequency === 'BIWEEKLY' ? 6 : 3;
                          setFormData({ ...formData, term: String(count) });
                        }}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          formData.term === String(formData.frequency === 'WEEKLY' ? 12 : formData.frequency === 'BIWEEKLY' ? 6 : 3)
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        3 Meses
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const count = formData.frequency === 'WEEKLY' ? 24 : formData.frequency === 'BIWEEKLY' ? 12 : 6;
                          setFormData({ ...formData, term: String(count) });
                        }}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                          formData.term === String(formData.frequency === 'WEEKLY' ? 24 : formData.frequency === 'BIWEEKLY' ? 12 : 6)
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        6 Meses
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest pl-1">Modalidad de Tiempo</label>
                    <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">info</span>
                      <p className="text-[11px] font-bold text-amber-900 leading-tight">
                        <strong>Tiempo Abierto:</strong> El cliente paga solo el rédito ({formData.frequency === 'MONTHLY' ? 'mensual' : formData.frequency === 'BIWEEKLY' ? 'quincenal' : 'semanal'}) sin límite de fechas. El capital se salda cuando lo devuelva.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* TIPO DE CÁLCULO (Solo en modalidad con plazo) */}
              {loanType === 'INSTALLMENT' && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">Fórmula de Cálculo:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInterestType('SIMPLE')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${
                        interestType === 'SIMPLE'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Directo / Simple (Callejero)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestType('FRENCH')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${
                        interestType === 'FRENCH'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Amortización Francesa
                    </button>
                  </div>
                </div>
              )}

              {/* TARJETA DINÁMICA: "TIENE QUE PAGAR" */}
              <div className={`p-8 rounded-3xl relative overflow-hidden group shadow-2xl border transition-all ${
                loanType === 'REDITO' 
                  ? 'bg-slate-900 text-white border-amber-500/30 shadow-amber-950/20' 
                  : 'bg-primary text-white border-white/5 shadow-primary/20'
              }`}>
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          loanType === 'REDITO' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-400 text-slate-900'
                        }`}>
                          {loanType === 'REDITO' ? 'Modo Solo Rédito' : 'Modo Con Plazo'}
                        </span>
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                          {loanType === 'REDITO' ? 'Pago Recurrente' : `${calculations.schedule.length} Cuotas para saldar`}
                        </span>
                      </div>

                      <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-1">
                        Tiene que pagar:
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h3 className={`text-4xl md:text-5xl font-black font-headline tracking-tighter ${
                          loanType === 'REDITO' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          RD$ {formatDOP(calculations.installment)}
                        </h3>
                        <span className="text-sm font-black uppercase text-white/90 tracking-wide">
                          {formData.frequency === 'MONTHLY' ? 'Mensual' : formData.frequency === 'BIWEEKLY' ? 'Quincenal' : 'Semanal'}
                          {loanType === 'REDITO' ? ' (Solo Interés)' : ''}
                        </span>
                      </div>

                      {loanType === 'INSTALLMENT' && (
                        <>
                          <div className="mt-3 bg-white/10 p-3 rounded-xl border border-white/10 flex flex-wrap items-center justify-between text-xs font-bold text-white gap-2">
                            <span className="text-white/80">Desglose de cada pago:</span>
                            <span className="font-mono">
                              Capital: <strong>RD$ {formatDOP(calculations.capitalPerInst)}</strong> + Rédito: <strong className="text-emerald-300">RD$ {formatDOP(calculations.interestPerInst)}</strong>
                            </span>
                          </div>
                          <p className="text-[11px] text-white/60 font-bold mt-2">
                            Durante {calculations.schedule.length} cuotas ({formData.frequency === 'MONTHLY' ? `${calculations.schedule.length} meses` : formData.frequency === 'BIWEEKLY' ? `${calculations.schedule.length / 2} meses` : `${calculations.schedule.length / 4} meses`}) para saldar capital e intereses.
                          </p>
                        </>
                      )}
                      {loanType === 'REDITO' && (
                        <p className="text-[11px] text-amber-200/90 font-bold mt-1.5">
                          Pago periódico de rédito. El capital de RD$ {formatDOP(parseAmountInput(formData.amount) || '0')} se mantiene intacto.
                        </p>
                      )}
                   </div>

                   <div className="h-[2px] w-full bg-white/10"></div>

                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                         <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                           {loanType === 'REDITO' ? 'Capital a Devolver' : 'Total a Devolver'}
                         </p>
                         <h4 className="text-xl font-black text-white">RD$ {formatDOP(calculations.total)}</h4>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                           {loanType === 'REDITO' ? 'Rédito por Período' : 'Intereses Totales'}
                         </p>
                         <h4 className={`text-xl font-black ${loanType === 'REDITO' ? 'text-amber-400' : 'text-emerald-300'}`}>
                           RD$ {formatDOP(calculations.interest)}
                         </h4>
                      </div>
                   </div>

                   <div className="flex justify-end pt-2">
                      <button 
                        disabled={mutation.isPending}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 ${
                          loanType === 'REDITO' 
                            ? 'bg-amber-500 text-white shadow-amber-900/40' 
                            : 'bg-emerald-500 text-white shadow-emerald-900/40'
                        }`}
                      >
                        {mutation.isPending ? (
                          <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Procesando...</>
                        ) : (
                          <><span className="material-symbols-outlined text-base">verified</span> Desembolsar Préstamo Ahora</>
                        )}
                      </button>
                   </div>
                </div>
                {/* Visual Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full transition-transform group-hover:scale-125 duration-1000"></div>
              </div>
            </form>
          </div>
        </section>

        {/* Amortization / Projection Column */}
        <section className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl h-[800px] flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600 opacity-[0.03] backdrop-blur-3xl"></div>
              <div className="p-10 relative z-10 border-b border-white/5">
                 <h2 className="text-xl font-black text-white font-headline tracking-tight">
                   {loanType === 'REDITO' ? 'Proyección de Rédito' : 'Tabla de Amortización'}
                 </h2>
                 <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">
                   {loanType === 'REDITO' 
                     ? `Pago recurrente: cada ${formData.frequency === 'MONTHLY' ? 'mes' : formData.frequency === 'BIWEEKLY' ? 'quincena' : 'semana'}`
                     : `${formData.frequency === 'MONTHLY' ? 'Meses' : formData.frequency === 'BIWEEKLY' ? 'Quincenas' : 'Semanas'} a proyectar: ${calculations.schedule.length}`}
                 </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
                 {calculations.schedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-white italic text-center px-10">
                       <span className="material-symbols-outlined text-6xl mb-4">calculate</span>
                       <p className="text-sm font-bold">Ingrese el monto y la tasa para proyectar el crédito.</p>
                    </div>
                 ) : loanType === 'REDITO' ? (
                    <div className="space-y-4 p-4 text-left">
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                          <div className="flex justify-between items-center border-b border-white/10 pb-3">
                             <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Modalidad</span>
                             <span className="text-xs font-black text-white uppercase">Solo Rédito (Interés Puro)</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/10 pb-3">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Capital Prestado</span>
                             <span className="text-base font-black text-white">RD$ {formatDOP(parseAmountInput(formData.amount) || '0')}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/10 pb-3">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tasa Acordada</span>
                             <span className="text-base font-black text-amber-400">{formData.interestRate || '0'}% mensual</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/10 pb-3">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cobro Periódico</span>
                             <span className="text-xl font-black text-amber-400">RD$ {formatDOP(calculations.installment)} / {formData.frequency === 'MONTHLY' ? 'Mes' : formData.frequency === 'BIWEEKLY' ? 'Quincena' : 'Semana'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Plazo</span>
                             <span className="text-xs font-black text-emerald-400 uppercase">Indefinido (Hasta saldar capital)</span>
                          </div>
                       </div>
                       
                       <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                          <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5">verified_user</span>
                          <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                             Cada vez que cobres el rédito en <strong>Facturación</strong>, la fecha de vencimiento se renovará automáticamente al siguiente ciclo sin alterar el capital.
                          </p>
                       </div>
                    </div>
                 ) : (
                    calculations.schedule.map((row) => (
                      <div key={row.no} className="bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all p-5 rounded-2xl flex items-center justify-between group/row">
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-600 group-hover/row:text-primary transition-colors">{row.no}</span>
                            <div className="h-8 w-[2px] bg-white/10"></div>
                            <div>
                                <p className="text-xs font-black text-white tracking-tight">RD$ {formatDOP(row.installment)}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                 Cap: ${formatDOP(row.capital)} · Int: ${formatDOP(row.interest)}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs font-extrabold text-blue-400 font-mono italic">RD$ {formatDOP(row.balance)}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saldo Restante</p>
                         </div>
                      </div>
                    ))
                 )}
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
