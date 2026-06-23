import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NewClient = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personales');

  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    phone: '',
    email: '',
    address: '',
  });

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/clients');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al crear el cliente. Verifique la cédula.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...formData };
    if (!payload.email?.trim()) delete payload.email;
    if (!payload.address?.trim()) delete payload.address;
    
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</label>
                      <input
                        required
                        maxLength={13}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="000-0000000-0"
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
                  className="space-y-6 max-w-2xl h-full flex flex-col justify-center"
                >
                  <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">cloud_upload</span>
                    <h3 className="text-lg font-black text-primary uppercase tracking-tighter">Adjuntar Documentos</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Esta función estará disponible en una próxima actualización del sistema.</p>
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
