import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient, getRoutes } from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const NewClient = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('personales');

  const [formData, setFormData] = useState({
    name: location.state?.initialName || '',
    identification: '',
    phone: '',
    email: '',
    address: '',
    routeId: '' as string | number,
    guarantorName: '',
    guarantorPhone: '',
    cedulaFrontUrl: '',
    cedulaBackUrl: '',
    guarantorDocUrl: '',
  });

  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });

  const handleFileUpload = (field: 'cedulaFrontUrl' | 'cedulaBackUrl' | 'guarantorDocUrl', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Archivo muy grande', 'Por favor selecciona una imagen menor a 5MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/clients');
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear el cliente. Verifique la cédula.',
        confirmButtonColor: '#2563eb'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...formData };
    if (!payload.identification?.trim()) delete payload.identification;
    if (!payload.email?.trim()) delete payload.email;
    if (!payload.address?.trim()) delete payload.address;
    if (!payload.guarantorName?.trim()) delete payload.guarantorName;
    if (!payload.guarantorPhone?.trim()) delete payload.guarantorPhone;
    if (!payload.cedulaFrontUrl?.trim()) delete payload.cedulaFrontUrl;
    if (!payload.cedulaBackUrl?.trim()) delete payload.cedulaBackUrl;
    if (!payload.guarantorDocUrl?.trim()) delete payload.guarantorDocUrl;
    if (!payload.routeId) delete payload.routeId;
    else payload.routeId = Number(payload.routeId);
    
    mutation.mutate(payload);
  };

  const tabs = [
    { id: 'personales', icon: 'person', label: 'Datos Personales', desc: 'Información básica' },
    { id: 'documentos', icon: 'folder_open', label: 'Documentos', desc: 'Archivos adjuntos' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary font-headline tracking-tighter uppercase">Registro de Cliente</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Apertura de Expediente</p>
        </div>
        <button 
          onClick={() => navigate('/clients')}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 md:p-6 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left group relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-200/50 text-slate-500'
              }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-primary'}`}>
                  {tab.label}
                </p>
                <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'personales' && (
                <motion.div 
                  key="personales"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="mb-8">
                    <h3 className="text-lg font-black text-primary uppercase tracking-tighter">Información Personal</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Datos obligatorios del cliente</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Ej: Juan Pérez"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula (Opcional)</label>
                      <input
                        maxLength={13}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="000-0000000-0 (Opcional)"
                        value={formData.identification}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                          let formatted = digits;
                          if (digits.length > 3) formatted = digits.slice(0, 3) + '-' + digits.slice(3);
                          if (digits.length > 10) formatted = formatted.slice(0, 11) + '-' + digits.slice(10);
                          setFormData({ ...formData, identification: formatted });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono / Celular</label>
                      <input
                        required
                        maxLength={12}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="809-000-0000"
                        value={formData.phone}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          let formatted = digits;
                          if (digits.length > 3) formatted = digits.slice(0, 3) + '-' + digits.slice(3);
                          if (digits.length > 6) formatted = formatted.slice(0, 7) + '-' + digits.slice(6);
                          setFormData({ ...formData, phone: formatted });
                        }}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="email@dominio.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección Residencial</label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        placeholder="Calle, Número, Sector, Ciudad..."
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruta (Opcional)</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                        value={formData.routeId}
                        onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                      >
                        <option value="">Ninguna</option>
                        {routes.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garante / Fiador (Opcional)</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Nombre del fiador"
                        value={formData.guarantorName}
                        onChange={e => setFormData({ ...formData, guarantorName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono Garante (Opcional)</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="809-000-0000"
                        value={formData.guarantorPhone}
                        onChange={e => setFormData({ ...formData, guarantorPhone: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('documentos')}
                        className="px-6 py-3 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                      >
                        <span>Siguiente: Fotos de Documentos</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'documentos' && (
                <motion.div 
                  key="documentos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 max-w-3xl"
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-primary uppercase tracking-tighter">Expediente Digital</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fotos de Cédula de Identidad y Garantías</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cédula Frente */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cédula (Frente)</span>
                        <span className="material-symbols-outlined text-sm text-primary">badge</span>
                      </div>
                      
                      {formData.cedulaFrontUrl ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group mb-3">
                          <img src={formData.cedulaFrontUrl} alt="Cédula Frente" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cedulaFrontUrl: '' })}
                            className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer mb-3 p-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">add_a_photo</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Subir Frente</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleFileUpload('cedulaFrontUrl', e.target.files[0])}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium">Foto nítida del frente con datos legibles</p>
                    </div>

                    {/* Cédula Reverso */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cédula (Reverso)</span>
                        <span className="material-symbols-outlined text-sm text-primary">flip_to_back</span>
                      </div>
                      
                      {formData.cedulaBackUrl ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group mb-3">
                          <img src={formData.cedulaBackUrl} alt="Cédula Reverso" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cedulaBackUrl: '' })}
                            className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer mb-3 p-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">add_a_photo</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Subir Reverso</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleFileUpload('cedulaBackUrl', e.target.files[0])}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium">Reverso con código de barras y firma</p>
                    </div>

                    {/* Garantía / Pagaré */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Pagaré / Garantía</span>
                        <span className="material-symbols-outlined text-sm text-primary">description</span>
                      </div>
                      
                      {formData.guarantorDocUrl ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-300 bg-white group mb-3">
                          <img src={formData.guarantorDocUrl} alt="Garantía" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, guarantorDocUrl: '' })}
                            className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md active:scale-90"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      ) : (
                        <label className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer mb-3 p-4">
                          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">upload_file</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Subir Pagaré</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleFileUpload('guarantorDocUrl', e.target.files[0])}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium">Contrato firmado, pagaré notarial o foto</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 md:px-10 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'documentos') setActiveTab('personales');
              }}
              className={`text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-2 ${activeTab === 'personales' ? 'invisible' : ''}`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Atrás
            </button>

            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={() => navigate('/clients')}
                  className="px-6 py-3.5 bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 active:scale-95 transition-all border border-slate-200 shadow-sm"
                >
                  Cancelar
                </button>
               <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8 py-3.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {mutation.isPending ? (
                    <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Guardando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">save</span> Guardar Expediente</>
                  )}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClient;
