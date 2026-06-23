import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanks, createBank, addBankTransaction } from '../api/api';
import { formatDOP } from '../utils/format';
import { LoansSkeleton } from '../components/Skeleton';

const Bancos = () => {
  const queryClient = useQueryClient();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    balance: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    bankAccountId: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: ''
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: getBanks
  });

  const createAccountMutation = useMutation({
    mutationFn: createBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      setIsAccountModalOpen(false);
      setAccountForm({ bankName: '', accountNumber: '', balance: '' });
    }
  });

  const transactionMutation = useMutation({
    mutationFn: (data: any) => addBankTransaction(data.bankAccountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      setIsTransactionModalOpen(false);
      setTransactionForm({ bankAccountId: '', type: 'INCOME', amount: '', description: '' });
    }
  });

  if (isLoading) return <LoansSkeleton />;

  const formatAmountInput = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return val;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceVal = parseFloat(accountForm.balance.replace(/,/g, ''));
    if (isNaN(balanceVal) || !accountForm.bankName || !accountForm.accountNumber) return;
    createAccountMutation.mutate({
      bankName: accountForm.bankName,
      accountNumber: accountForm.accountNumber,
      balance: balanceVal
    });
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(transactionForm.amount.replace(/,/g, ''));
    if (isNaN(amountVal) || !transactionForm.bankAccountId || !transactionForm.description) return;
    transactionMutation.mutate({
      bankAccountId: parseInt(transactionForm.bankAccountId),
      type: transactionForm.type,
      amount: amountVal,
      description: transactionForm.description
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Bancos y Cuentas</h2>
          <p className="text-slate-500 mt-1">Gestión de cuentas bancarias y conciliaciones de transferencias.</p>
        </div>
        <button 
          onClick={() => setIsAccountModalOpen(true)}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Nueva Cuenta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc: any) => (
          <div key={acc.id} className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-9xl">account_balance</span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
              <div>
                <p className="font-black tracking-widest text-blue-200 text-xs uppercase mb-1">{acc.bankName}</p>
                <p className="text-xl font-mono tracking-widest opacity-80">{acc.accountNumber}</p>
              </div>
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-black">Balance Disponible</p>
                <p className="text-3xl font-black">${formatDOP(acc.balance)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Añadir Transacción (Atajo) */}
        {accounts.length > 0 && (
          <div 
            onClick={() => setIsTransactionModalOpen(true)}
            className="bg-white border border-slate-100 shadow-sm p-6 rounded-[2rem] flex flex-col justify-center items-center text-center hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group active:scale-95 min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-primary/5 flex items-center justify-center mb-4 transition-colors">
              <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">swap_horiz</span>
            </div>
            <h3 className="font-extrabold text-primary uppercase tracking-tighter">Registrar Transacción</h3>
            <p className="text-xs text-slate-500 mt-1">Ingreso o retiro bancario</p>
          </div>
        )}
      </div>

      {/* MODAL: Nueva Cuenta */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAccountModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-white text-2xl">account_balance</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase">Nueva Cuenta</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Registro Bancario</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="p-8 space-y-6 bg-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre del Banco</label>
                <input 
                  required
                  className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-sm font-bold transition-all"
                  placeholder="Ej: Banco Popular"
                  type="text"
                  value={accountForm.bankName}
                  onChange={e => setAccountForm({ ...accountForm, bankName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Número de Cuenta</label>
                <input 
                  required
                  className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-sm font-bold transition-all"
                  placeholder="Ej: 1234567890"
                  type="text"
                  value={accountForm.accountNumber}
                  onChange={e => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Balance Inicial (RD$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                  <input 
                    required
                    className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 pl-8 pr-4 text-sm font-black transition-all"
                    placeholder="0.00"
                    type="text"
                    value={accountForm.balance}
                    onChange={e => setAccountForm({ ...accountForm, balance: formatAmountInput(e.target.value) })}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={createAccountMutation.isPending}
                className="w-full bg-primary text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {createAccountMutation.isPending ? 'Guardando...' : 'Crear Cuenta'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Transacción Bancaria */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTransactionModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="material-symbols-outlined text-white text-2xl">swap_horiz</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase">Transacción</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Ingreso o Retiro</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransactionModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-8 space-y-6 bg-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cuenta Bancaria</label>
                <select 
                  required
                  className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-sm font-bold transition-all outline-none"
                  value={transactionForm.bankAccountId}
                  onChange={e => setTransactionForm({ ...transactionForm, bankAccountId: e.target.value })}
                >
                  <option value="" disabled>Seleccione una cuenta...</option>
                  {accounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo de Transacción</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionForm({ ...transactionForm, type: 'INCOME' })}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${transactionForm.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionForm({ ...transactionForm, type: 'EXPENSE' })}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${transactionForm.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    Retiro
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción</label>
                <input 
                  required
                  className="w-full bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-sm font-bold transition-all"
                  placeholder="Ej: Depósito de nómina..."
                  type="text"
                  value={transactionForm.description}
                  onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })}
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
                    value={transactionForm.amount}
                    onChange={e => setTransactionForm({ ...transactionForm, amount: formatAmountInput(e.target.value) })}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={transactionMutation.isPending}
                className={`w-full text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50 ${transactionForm.type === 'INCOME' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
              >
                {transactionMutation.isPending ? 'Procesando...' : 'Confirmar Transacción'}
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bancos;
