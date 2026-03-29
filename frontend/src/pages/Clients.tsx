import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, deleteClient } from '../api/api';
import { useState } from 'react';
import { formatDOP } from '../utils/format';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', identification: '', phone: '' });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.identification.includes(searchTerm)
  );

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', identification: '', phone: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleDelete = (id: number, debt: number) => {
    const message = debt > 0 
      ? `Este cliente tiene una deuda pendiente de RD$ ${formatDOP(debt)}. ¿Está seguro de que desea eliminarlo? Se borrarán TODOS sus préstamos y pagos.`
      : '¿Está seguro de que desea eliminar este cliente? Se borrará todo su historial.';
    
    if (window.confirm(message)) {
      deleteMutation.mutate(id);
    }
  };

  const calculateDebt = (loans: any[]) => {
    return loans.reduce((total, loan) => {
       const pending = loan.installments?.filter((i: any) => i.status === 'PENDING')
                                        .reduce((acc: number, i: any) => acc + i.amount, 0) || 0;
       return total + pending;
    }, 0);
  };

  const totalPortfolioDebt = clients.reduce((acc: number, c: any) => acc + calculateDebt(c.loans || []), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(newClient);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center py-24 gap-3 text-primary animate-pulse">
        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
        <p className="text-xs font-black uppercase tracking-[0.3em]">Cargando Cartera...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      {/* SaaS Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 text-left">
        <div className="space-y-1">
          <p className="text-secondary font-black text-[10px] tracking-[0.2em] uppercase opacity-60 italic">Gestión de Cobros v2</p>
          <h3 className="text-2xl md:text-4xl font-black text-primary leading-tight font-headline tracking-tighter uppercase">Directorio de Clientes</h3>
          <p className="text-slate-400 max-w-lg text-[10px] md:text-sm font-medium italic hidden md:block">Base de datos centralizada de prestatarios y titulares.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
           <div className="hidden lg:flex flex-col items-end pr-6 border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Cuentas por Cobrar</p>
              <h4 className="text-xl font-black text-primary">RD$ {formatDOP(totalPortfolioDebt)}</h4>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-primary text-white px-8 py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 w-full md:w-auto"
           >
             <span className="material-symbols-outlined text-lg md:text-xl font-black">person_add</span>
             Alta de Cliente
           </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
         <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
               <span className="material-symbols-outlined">group</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Clientes</p>
               <p className="text-xl font-black text-primary">{clients.length}</p>
            </div>
         </div>
         <div className="bg-slate-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-white flex items-center gap-5 shadow-xl shadow-slate-900/10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center">
               <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Préstamos Activos</p>
               <p className="text-xl font-black">
                 {clients.reduce((acc: number, c: any) => acc + (c.loans?.filter((l: any) => l.status === 'ACTIVE').length || 0), 0)}
               </p>
            </div>
         </div>
         <div className="bg-emerald-50 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-100 flex items-center gap-5 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
               <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cartera en Riesgo</p>
               <p className="text-xl font-black text-emerald-700">0.0% <span className="text-[10px] font-medium opacity-50 ml-1">LTD</span></p>
            </div>
         </div>
      </section>

      {/* Main Directory Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-50/20">
           <div className="relative group max-w-sm w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-primary/10 rounded-xl md:rounded-2xl py-3.5 md:py-3 pl-12 pr-4 text-sm font-bold transition-all shadow-sm"
                placeholder="Buscar cliente o cédula..." 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {filteredClients.length} EXPEDIENTES SINCRONIZADOS
           </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Perfil Clientes</th>
                <th className="px-8 py-6">Documentación</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Saldo Deudor</th>
                <th className="px-8 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center opacity-30">
                    <span className="material-symbols-outlined text-7xl mb-4 block">person_cancel</span>
                    <p className="text-sm font-black uppercase tracking-widest font-headline">No se encontraron clientes</p>
                  </td>
                </tr>
              ) : filteredClients.map((client: any) => {
                const debt = calculateDebt(client.loans || []);
                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <td className="px-8 py-6 min-w-[250px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/10">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-black text-primary text-sm tracking-tight">{client.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{client.email || '— Sin Correo —'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-black text-slate-500 font-mono tracking-tighter uppercase">{client.identification}</p>
                       <p className="text-[10px] text-slate-400 font-bold mt-1">ID VALIDADO</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Activo
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="text-base font-black text-primary">RD$ {formatDOP(debt)}</p>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Pendiente por Recaudar</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center gap-2">
                           <button 
                             onClick={() => navigate('/billing')}
                             className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                           >
                              <span className="material-symbols-outlined text-sm">payments</span>
                              Realizar Pago
                           </button>
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleDelete(client.id, debt);
                            }}
                            disabled={deleteMutation.isPending}
                            className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm disabled:opacity-50"
                          >
                             <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Nuevo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">

            {/* Header */}
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">person_add</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-headline tracking-tighter">Nuevo Cliente</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Apertura de Expediente · Préstamo Pro</p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">badge</span>
                  Nombre Completo
                </label>
                <div className="relative">
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ej: Juan Pérez"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Cédula + Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-primary">id_card</span>
                    Cédula
                  </label>
                  <input
                    required
                    maxLength={13}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono tracking-wider"
                    placeholder="000-0000000-0"
                    value={newClient.identification}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = digits;
                      if (digits.length > 3) formatted = digits.slice(0, 3) + '-' + digits.slice(3);
                      if (digits.length > 10) formatted = formatted.slice(0, 11) + '-' + digits.slice(10);
                      setNewClient({ ...newClient, identification: formatted });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-primary">phone_iphone</span>
                    WhatsApp / Tel
                  </label>
                  <input
                    maxLength={12}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono tracking-wider"
                    placeholder="809-000-0000"
                    value={newClient.phone}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      let formatted = digits;
                      if (digits.length > 3) formatted = digits.slice(0, 3) + '-' + digits.slice(3);
                      if (digits.length > 6) formatted = formatted.slice(0, 7) + '-' + digits.slice(6);
                      setNewClient({ ...newClient, phone: formatted });
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">mail</span>
                  Correo Electrónico <span className="text-slate-300 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="email@dominio.com"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 active:scale-95 transition-all border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-[2] py-3.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Guardando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">check_circle</span> Crear Expediente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;
