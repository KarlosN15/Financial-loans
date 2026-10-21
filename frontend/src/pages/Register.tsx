import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, title: 'Información Personal' },
  { id: 2, title: 'Datos de Contacto' },
  { id: 3, title: 'Pago' },
  { id: 4, title: 'Confirmación' },
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    empresa: '',
    correo: '',
    telefono: '',
    direccion: '',
    direccion2: '',
    pais: 'República Dominicana',
    licencia: 'inicio', // default
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan && ['inicio', 'estandar', 'avanzado'].includes(plan)) {
      setFormData(prev => ({ ...prev, licencia: plan }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newPassword = generatePassword();
      const fullName = `${formData.nombre} ${formData.apellido}`.trim();

      // Call API
      await api.post('/auth/register', {
        name: fullName,
        email: formData.correo,
        password: newPassword,
        role: 'ADMIN',
        plan: formData.licencia
      });

      setGeneratedPassword(newPassword);
      setRegisteredEmail(formData.correo);
    } catch (error) {
      console.error('Error al registrar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: 'Hubo un error al crear la cuenta. Es posible que el correo ya esté en uso.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  if (generatedPassword && registeredEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">¡Cuenta Creada!</h2>
          <p className="text-slate-500 mb-8">Tu cuenta de Administrador ha sido creada con éxito. Aquí tienes tus credenciales de acceso temporal:</p>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 text-left">
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase">Usuario (Correo)</label>
              <div className="text-lg font-bold text-slate-800 break-all">{registeredEmail}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Contraseña Generada</label>
              <div className="text-2xl font-black text-blue-600 tracking-widest">{generatedPassword}</div>
            </div>
          </div>

          <p className="text-sm text-red-500 font-medium mb-8">⚠️ Guarda esta contraseña antes de continuar, no se volverá a mostrar.</p>

          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const renderStepper = () => {
    return (
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-4 ring-blue-100' :
                isCompleted ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border-2 border-slate-300 shadow-sm'
              }`}>
                {isCompleted ? <span className="material-symbols-outlined font-bold">check</span> : step.id}
              </div>
              <span className={`text-xs text-center w-24 font-bold transition-colors ${
                isActive ? 'text-blue-700 font-black' : isCompleted ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getLicenciaLabel = () => {
    switch (formData.licencia) {
      case 'inicio': return 'DEMO - 15 DIAS.';
      case 'estandar': return 'ESTÁNDAR - MENSUAL';
      case 'avanzado': return 'AVANZADO - MENSUAL';
      default: return 'Seleccione una licencia...';
    }
  };

  const getLicenciaPrice = () => {
    switch (formData.licencia) {
      case 'inicio': return 'US$0.00';
      case 'estandar': return 'US$30.00';
      case 'avanzado': return 'US$45.00';
      default: return 'US$0.00';
    }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"
      />

      {/* Header simple */}
      <header className="px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/login')}>
          <div className="w-9 h-9 rounded-xl bg-white/10 p-1.5 flex items-center justify-center border border-white/20">
            <img src="/logo-icon.png" alt="PresPro Systems" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight uppercase">PresPro Systems</span>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/login')}
          className="text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">login</span>
          ¿Ya tienes cuenta? <span className="font-black text-blue-400">Iniciar Sesión</span>
        </button>
      </header>

      <main className="flex-1 flex justify-center items-start pt-4 px-4 pb-20 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={scaleUp}
          className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl shadow-primary/20 p-10 border border-slate-100"
        >
          {renderStepper()}

          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-blue-600 mb-8">Información Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej. Pérez" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Nombre de la Empresa</label>
                  <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Inversiones Pérez S.A." className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext} disabled={!formData.nombre || !formData.apellido || !formData.empresa} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md">Siguiente</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-blue-600 mb-8">Datos de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Correo Electrónico</label>
                  <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="ejemplo@correo.com" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Teléfono (WhatsApp)</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+1 809 000 0000" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Dirección</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle Principal #123" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Dirección 2 (opcional)</label>
                  <input type="text" name="direccion2" value={formData.direccion2} onChange={handleChange} placeholder="Apto, Suite, Edificio" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">País</label>
                  <input type="text" name="pais" value={formData.pais} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 font-bold outline-none cursor-not-allowed shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Tipo de Licencia</label>
                  <select name="licencia" value={formData.licencia} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm transition-all">
                    <option value="inicio">Plan Prueba (Prueba Gratis)</option>
                    <option value="estandar">Plan Estándar ($30/mes)</option>
                    <option value="avanzado">Plan Avanzado ($45/mes)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={handlePrev} className="bg-white border border-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Atrás</button>
                <button onClick={handleNext} disabled={!formData.correo || !formData.telefono || !formData.direccion} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md">Siguiente</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in text-center py-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">Información de Pago</h2>
              <div className="max-w-md mx-auto bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-8 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-blue-500 mb-4">credit_card</span>
                <p className="text-slate-700 font-medium mb-4">
                  {formData.licencia === 'inicio' 
                    ? 'Has seleccionado el plan gratuito de prueba por 15 días. No se requiere método de pago.' 
                    : 'La integración con tarjeta de crédito estará disponible próximamente. Por ahora, tu cuenta se creará en modo de pago pendiente de confirmación.'}
                </p>
              </div>
              <div className="flex justify-between">
                <button onClick={handlePrev} className="bg-white border border-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Atrás</button>
                <button onClick={handleNext} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-md">Siguiente</button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-blue-600 mb-8">Confirmar Registro</h2>
              
              <div className="space-y-6 mb-8">
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-blue-600">Datos Personales</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-slate-700">Nombre completo:</span> <span className="font-semibold text-slate-900 ml-1">{formData.nombre} {formData.apellido}</span></div>
                    <div><span className="font-bold text-slate-700">Empresa:</span> <span className="font-semibold text-slate-900 ml-1">{formData.empresa}</span></div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-blue-600">Datos de Contacto</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-slate-700">Correo Electrónico:</span> <span className="font-semibold text-slate-900 ml-1">{formData.correo.toUpperCase()}</span></div>
                    <div><span className="font-bold text-slate-700">Teléfono:</span> <span className="font-semibold text-slate-900 ml-1">{formData.telefono}</span></div>
                    <div><span className="font-bold text-slate-700">Dirección:</span> <span className="font-semibold text-slate-900 ml-1">{formData.direccion}</span></div>
                    <div><span className="font-bold text-slate-700">País:</span> <span className="font-semibold text-slate-900 ml-1">{formData.pais}</span></div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-blue-600">Detalles de Licencia</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-slate-700">Tipo de Licencia:</span> <span className="font-semibold text-slate-900 ml-1">{getLicenciaLabel()}</span></div>
                    <div><span className="font-bold text-slate-700">Periodo de Pago:</span> <span className="font-semibold text-slate-900 ml-1">{formData.licencia === 'inicio' ? 'Prueba (15 días)' : 'Mensual'}</span></div>
                    <div><span className="font-bold text-slate-700">Total:</span> <span className="font-bold text-emerald-600 text-base ml-1">{getLicenciaPrice()}</span></div>
                    <div><span className="font-bold text-slate-700">Referencia de Pago:</span> <span className="font-semibold text-slate-900 ml-1">Pendiente de confirmación</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={handlePrev} className="bg-white border border-slate-300 text-slate-700 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors" disabled={loading}>Atrás</button>
                <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Confirmar Registro'}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
