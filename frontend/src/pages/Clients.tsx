import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, deleteClient, updateClient } from '../api/api';
import { useState } from 'react';
import { formatDOP } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Clients = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocClient, setSelectedDocClient] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.identification && c.identification.includes(searchTerm))
  );

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedDocClient(null);
      Swal.fire({
        icon: 'success',
        title: 'Expediente Actualizado',
        text: 'Los documentos del cliente se han guardado con éxito.',
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: () => {
      Swal.fire('Error', 'No se pudieron actualizar los documentos.', 'error');
    }
  });

  const handleDocUpload = (field: 'cedulaFrontUrl' | 'cedulaBackUrl' | 'guarantorDocUrl', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Archivo muy grande', 'Por favor selecciona una imagen menor a 5MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedDocClient((prev: any) => ({ ...prev, [field]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number, debt: number) => {
    const message = debt > 0 
      ? `Este cliente tiene una deuda pendiente de RD$ ${formatDOP(debt)}. ¿Está seguro de que desea eliminarlo? Se borrarán TODOS sus préstamos y pagos.`
      : '¿Está seguro de que desea eliminar este cliente? Se borrará todo su historial.';
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: message,
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

  const calculateDebt = (loans: any[]) => {
    return loans.reduce((total, loan) => {
       const pending = loan.installments?.filter((i: any) => i.status === 'PENDING')
                                        .reduce((acc: number, i: any) => acc + Number(i.amount), 0) || 0;
       return total + pending;
    }, 0);
  };

  const totalPortfolioDebt = clients.reduce((acc: number, c: any) => acc + calculateDebt(c.loans || []), 0);



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
             onClick={() => navigate('/clients/new')}
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
                <th className="px-8 py-6 text-center">Score / Buró</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Saldo Deudor</th>
                <th className="px-8 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <span className="material-symbols-outlined text-7xl mb-4 block opacity-30 text-slate-400">person_cancel</span>
                    <p className="text-sm font-black uppercase tracking-widest font-headline opacity-30 text-slate-400 mb-6">No se encontraron clientes</p>
                    {searchTerm && (
                      <button
                        onClick={() => navigate('/clients/new', { state: { initialName: searchTerm } })}
                        className="mx-auto px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Registrar "{searchTerm}"
                      </button>
                    )}
                  </td>
                </tr>
              ) : filteredClients.map((client: any) => {
                const debt = calculateDebt(client.loans || []);
                const docsCount = [client.cedulaFrontUrl, client.cedulaBackUrl, client.guarantorDocUrl].filter(Boolean).length;
                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <td className="px-8 py-6 min-w-[250px]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/10">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-black text-primary text-sm tracking-tight">{client.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                              CLI-{String(client.id).padStart(4, '0')}
                            </span>
                            {client.route && (
                               <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">route</span>
                                  {client.route.name}
                               </span>
                            )}
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{client.email || '— Sin Correo —'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-xs font-black text-slate-500 font-mono tracking-tighter uppercase">{client.identification || '— Sin Cédula —'}</p>
                       <p className="text-[10px] text-slate-400 font-bold mt-1">
                         {client.identification ? 'ID VALIDADO' : 'NO REGISTRADA'}
                       </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          client.rating === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          client.rating === 'REGULAR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            client.rating === 'EXCELLENT' ? 'bg-emerald-500' :
                            client.rating === 'REGULAR' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {client.rating === 'EXCELLENT' ? 'Excelente' : client.rating === 'REGULAR' ? 'Regular' : 'Riesgo'}
                        </span>
                        <span className="text-[9px] font-mono font-black text-slate-400 mt-1">{client.score ?? 100}/100 pts</span>
                      </div>
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
                             onClick={() => navigate('/billing', { state: { autoOpenModal: true, clientId: client.id } })}
                             className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                           >
                              <span className="material-symbols-outlined text-sm">payments</span>
                              Cobrar
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedDocClient(client);
                             }}
                             className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-primary hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm relative"
                             title="Expediente Digital"
                           >
                              <span className="material-symbols-outlined text-lg">folder_open</span>
                              {docsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
                                  {docsCount}
                                </span>
                              )}
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

      {/* MODAL EXPEDIENTE DIGITAL */}
      {selectedDocClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedDocClient(null)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl relative z-10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="relative bg-slate-900 px-8 pt-8 pb-10 overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">folder_shared</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white font-headline tracking-tighter uppercase">{selectedDocClient.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        {selectedDocClient.identification ? `Cédula: ${selectedDocClient.identification}` : 'Sin cédula'}
                      </span>
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        Score: {selectedDocClient.score || 100}/100 ({selectedDocClient.rating || 'EXCELLENT'})
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDocClient(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Info Garante si existe */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Garante / Fiador Asociado</span>
                  <span className="text-sm font-bold text-slate-800">{selectedDocClient.guarantorName || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Teléfono Garante</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{selectedDocClient.guarantorPhone || 'N/A'}</span>
                </div>
              </div>

              {/* Grid 3 Document Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Cédula Frente */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Cédula (Frente)</span>
                      <span className="material-symbols-outlined text-primary text-base">badge</span>
                    </div>
                    {selectedDocClient.cedulaFrontUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group cursor-pointer" onClick={() => setPreviewImage(selectedDocClient.cedulaFrontUrl)}>
                        <img src={selectedDocClient.cedulaFrontUrl} alt="Cédula Frente" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span className="material-symbols-outlined text-sm">zoom_in</span> Ver Ampliada
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2">
                        <span className="material-symbols-outlined text-3xl mb-1">image_not_supported</span>
                        <span className="text-[10px] font-bold uppercase">Sin Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <label className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 cursor-pointer shadow-sm">
                      <span>{selectedDocClient.cedulaFrontUrl ? 'Cambiar' : 'Subir'}</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleDocUpload('cedulaFrontUrl', e.target.files[0])} />
                    </label>
                    {selectedDocClient.cedulaFrontUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocClient({ ...selectedDocClient, cedulaFrontUrl: '' })}
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        title="Borrar foto"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cédula Reverso */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Cédula (Reverso)</span>
                      <span className="material-symbols-outlined text-primary text-base">flip_to_back</span>
                    </div>
                    {selectedDocClient.cedulaBackUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group cursor-pointer" onClick={() => setPreviewImage(selectedDocClient.cedulaBackUrl)}>
                        <img src={selectedDocClient.cedulaBackUrl} alt="Cédula Reverso" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span className="material-symbols-outlined text-sm">zoom_in</span> Ver Ampliada
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2">
                        <span className="material-symbols-outlined text-3xl mb-1">image_not_supported</span>
                        <span className="text-[10px] font-bold uppercase">Sin Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <label className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 cursor-pointer shadow-sm">
                      <span>{selectedDocClient.cedulaBackUrl ? 'Cambiar' : 'Subir'}</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleDocUpload('cedulaBackUrl', e.target.files[0])} />
                    </label>
                    {selectedDocClient.cedulaBackUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocClient({ ...selectedDocClient, cedulaBackUrl: '' })}
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        title="Borrar foto"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pagaré / Garantía */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Pagaré / Garantía</span>
                      <span className="material-symbols-outlined text-primary text-base">description</span>
                    </div>
                    {selectedDocClient.guarantorDocUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group cursor-pointer" onClick={() => setPreviewImage(selectedDocClient.guarantorDocUrl)}>
                        <img src={selectedDocClient.guarantorDocUrl} alt="Pagaré Notarial" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <span className="material-symbols-outlined text-sm">zoom_in</span> Ver Ampliada
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2">
                        <span className="material-symbols-outlined text-3xl mb-1">image_not_supported</span>
                        <span className="text-[10px] font-bold uppercase">Sin Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <label className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 cursor-pointer shadow-sm">
                      <span>{selectedDocClient.guarantorDocUrl ? 'Cambiar' : 'Subir'}</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleDocUpload('guarantorDocUrl', e.target.files[0])} />
                    </label>
                    {selectedDocClient.guarantorDocUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocClient({ ...selectedDocClient, guarantorDocUrl: '' })}
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        title="Borrar foto"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDocClient(null)}
                className="px-6 py-3 bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 border border-slate-200"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({
                  id: selectedDocClient.id,
                  data: {
                    cedulaFrontUrl: selectedDocClient.cedulaFrontUrl || null,
                    cedulaBackUrl: selectedDocClient.cedulaBackUrl || null,
                    guarantorDocUrl: selectedDocClient.guarantorDocUrl || null,
                  }
                })}
                className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Guardando...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">save</span> Guardar Expediente</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <img src={previewImage} alt="Documento Ampliado" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}



    </div>
  );
};

export default Clients;
