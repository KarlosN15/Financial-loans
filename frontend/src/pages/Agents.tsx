import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgents, createAgent, deleteAgent, getPayments } from '../api/api';
import { useState } from 'react';
import { formatDOP } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const Agents = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments
  });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: getAgents
  });

  const { user } = useAuth();
  const isLimitReached = (user?.plan === 'inicio') || (user?.plan === 'estandar' && agents.length >= 1);

  const filteredAgents = agents.filter((a: any) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setIsModalOpen(false);
      setNewAgent({ name: '', email: '', password: '' });
    },
    onError: (error: any) => {
      alert('⚠️ ' + (error.response?.data?.message || 'Error al crear el agente'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de que desea revocar el acceso de este agente?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(newAgent);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center py-24 gap-3 text-primary animate-pulse">
        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
        <p className="text-xs font-black uppercase tracking-[0.3em]">Cargando Equipo...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      {/* SaaS Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 text-left">
        <div className="space-y-1">
          <p className="text-secondary font-black text-[10px] tracking-[0.2em] uppercase opacity-60 italic">Administración</p>
          <h3 className="text-2xl md:text-4xl font-black text-primary leading-tight font-headline tracking-tighter uppercase">Gestión de Equipo</h3>
          <p className="text-slate-400 max-w-lg text-[10px] md:text-sm font-medium italic hidden md:block">Gestión de cobradores y accesos al sistema.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
           {isLimitReached ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-500 px-6 py-3 rounded-xl md:rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 w-full md:w-auto">
                 <span className="material-symbols-outlined text-sm">lock</span>
                 Límite de Agentes Alcanzado
              </div>
           ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-8 py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 w-full md:w-auto"
              >
                <span className="material-symbols-outlined text-lg md:text-xl font-black">person_add</span>
                Alta de Agente
              </button>
           )}
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-slate-50/20">
           <div className="relative group max-w-sm w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-primary/10 rounded-xl md:rounded-2xl py-3.5 md:py-3 pl-12 pr-4 text-sm font-bold transition-all shadow-sm"
                placeholder="Buscar por nombre o correo..." 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {filteredAgents.length} AGENTES ACTIVOS
           </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Agente</th>
                <th className="px-8 py-6 text-center">Rol de Sistema</th>
                <th className="px-8 py-6 text-center">Fecha de Alta</th>
                <th className="px-8 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center opacity-30">
                    <span className="material-symbols-outlined text-7xl mb-4 block">group_off</span>
                    <p className="text-sm font-black uppercase tracking-widest font-headline">No se encontraron agentes</p>
                  </td>
                </tr>
              ) : filteredAgents.map((agent: any) => {
                return (
                  <tr key={agent.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <td className="px-8 py-6 min-w-[250px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-900/10">
                          {getInitials(agent.name)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{agent.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                              AGN-{String(agent.id).padStart(4, '0')}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{agent.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Cobrador
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <p className="text-xs font-black text-slate-500 font-mono tracking-tighter">{new Date(agent.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center gap-2">
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent);
                             }}
                             className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm"
                             title="Ver Cobros"
                           >
                              <span className="material-symbols-outlined text-xl">receipt_long</span>
                           </button>
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(agent.id);
                             }}
                             disabled={deleteMutation.isPending}
                             className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm disabled:opacity-50"
                             title="Revocar Acceso"
                           >
                              <span className="material-symbols-outlined text-xl">person_remove</span>
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

      {/* Modal para Nuevo Agente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">

            {/* Header */}
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl">person_add</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-headline tracking-tighter">Nuevo Agente</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Crear acceso de cobrador</p>
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
              
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                 <span className="material-symbols-outlined text-amber-500 text-lg">info</span>
                 <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest">
                    El agente solo tendrá acceso a la pantalla de "Cobros" para registrar pagos. No podrá ver el Dashboard ni eliminar registros.
                 </p>
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">badge</span>
                  Nombre del Agente
                </label>
                <div className="relative">
                  <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ej: Pedro Martínez"
                    value={newAgent.name}
                    onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">mail</span>
                  Correo de Acceso
                </label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="pedro@tudominio.com"
                  value={newAgent.email}
                  onChange={e => setNewAgent({ ...newAgent, email: e.target.value })}
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">key</span>
                  Contraseña Temporal
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Mínimo 6 caracteres"
                  value={newAgent.password}
                  onChange={e => setNewAgent({ ...newAgent, password: e.target.value })}
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
                  className="flex-[2] py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-black/20 hover:shadow-black/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Creando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">check_circle</span> Crear Cuenta</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cobros del Agente */}
      {selectedAgent && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedAgent(null)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
               <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                  <div className="relative flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0">
                         <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
                       </div>
                       <div>
                         <h3 className="text-xl md:text-2xl font-black text-white font-headline tracking-tighter">Cobros de {selectedAgent.name}</h3>
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">Historial de Recaudación</p>
                       </div>
                     </div>
                     <button onClick={() => setSelectedAgent(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">close</span>
                     </button>
                  </div>
               </div>

               <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                  {(() => {
                     const agentPayments = allPayments.filter((p: any) => p.userId === selectedAgent.id);
                     const totalAgent = agentPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

                     if (agentPayments.length === 0) {
                        return (
                           <div className="text-center py-20 opacity-40">
                              <span className="material-symbols-outlined text-5xl mb-3 block">receipt_long</span>
                              <p className="text-xs font-black uppercase tracking-widest">Aún no ha registrado cobros</p>
                           </div>
                        );
                     }

                     return (
                        <div className="space-y-6">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recaudado</p>
                              <p className="text-3xl font-black text-emerald-600">RD$ {formatDOP(totalAgent)}</p>
                           </div>
                           
                           <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-50/50">
                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                       <th className="px-6 py-4">Recibo</th>
                                       <th className="px-6 py-4">Cliente</th>
                                       <th className="px-6 py-4">Fecha</th>
                                       <th className="px-6 py-4 text-right">Monto</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {agentPayments.map((p: any) => (
                                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4">
                                             <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">#{p.id.toString().padStart(4, '0')}</span>
                                          </td>
                                          <td className="px-6 py-4 text-xs font-bold">{p.clientName || p.loan?.client?.name}</td>
                                          <td className="px-6 py-4 text-[10px] font-black text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">RD$ {formatDOP(p.amount)}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     );
                  })()}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Agents;
