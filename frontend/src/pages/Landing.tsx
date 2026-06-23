import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl" 
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex items-center justify-between px-6 md:px-12 py-5 bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 transition-all"
      >
        <motion.div variants={navItemVariants} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="material-symbols-outlined font-bold text-xl">account_balance</span>
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900 tracking-tight leading-none">Préstamo Pro</span>
            <span className="block text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Gestión Inteligente</span>
          </div>
        </motion.div>
        
        <motion.div variants={navItemVariants} className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
          <a href="#plataforma" className="hover:text-blue-600 transition-colors">Plataforma</a>
          <a href="#planes" className="hover:text-blue-600 transition-colors">Precios</a>
          <a href="#modulos" className="hover:text-blue-600 transition-colors">Módulos</a>
          <a href="https://wa.me/8492705770" target="_blank" className="hover:text-blue-600 transition-colors">Contacto</a>
        </motion.div>

        <motion.div variants={navItemVariants} className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5">
            Iniciar Sesión
          </Link>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col lg:flex-row items-center gap-16 relative">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex-1 space-y-8"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Software de Próxima Generación
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
            Centraliza tu <br className="hidden md:block"/>
            negocio de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">créditos</span>.
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl font-medium text-slate-500 leading-relaxed max-w-2xl">
            Optimiza la aprobación de préstamos, automatiza los cobros en terreno y obtén reportes financieros en tiempo real. Todo desde una plataforma en la nube segura y fácil de usar.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <a href="https://wa.me/8492705770?text=Hola,%20quiero%20comenzar%20una%20prueba%20gratuita." target="_blank" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Comenzar Prueba Gratuita
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
            <a href="#modulos" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 text-base font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Ver Módulos
            </a>
          </motion.div>
        </motion.div>
        
        {/* Floating Abstract Element */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={scaleUp}
          className="w-full lg:w-[500px] flex-shrink-0 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl transform rotate-3 opacity-10 blur-xl"></div>
          <motion.div 
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100/50 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hablemos de negocios</h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Nuestros asesores están listos.</p>
               </div>
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="material-symbols-outlined">headset_mic</span>
               </div>
            </div>

            <div className="space-y-4">
               <a href="https://wa.me/8492705770" target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-green-50 hover:text-green-700 border border-slate-100 transition-all group/item">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-green-500 group-hover/item:scale-110 transition-transform">
                   <span className="material-symbols-outlined">chat</span>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp Directo</p>
                    <p className="text-base font-bold text-slate-700 group-hover/item:text-green-700">+1 (849) 270 - 5770</p>
                 </div>
               </a>
               
               <a href="mailto:ventas@prestamopro.com" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-100 transition-all group/item">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform">
                   <span className="material-symbols-outlined">mail</span>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Correo Corporativo</p>
                    <p className="text-base font-bold text-slate-700 group-hover/item:text-blue-700">ventas@prestamopro.com</p>
                 </div>
               </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Info Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        id="plataforma" 
        className="bg-white py-24 border-y border-slate-100 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div variants={scaleUp} className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:rotate-3 transition-transform duration-500">
             <span className="material-symbols-outlined text-3xl">verified_user</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
            Control Financiero Absoluto
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed font-medium">
            Nuestra arquitectura permite dominar el ciclo de vida completo del crédito, desde el perfilamiento del cliente hasta el cuadre de bóveda. Automatiza pagarés, contratos, emisión de recibos y sincronización de cobradores móviles en tiempo real, garantizando máxima seguridad de la información.
          </motion.p>
        </div>
      </motion.section>

      {/* Modulos Section */}
      <section id="modulos" className="bg-slate-950 py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto relative z-10"
        >
          <motion.div variants={fadeInUp} className="text-center mb-20">
             <span className="text-blue-500 font-black uppercase tracking-widest text-sm mb-4 block">Ecosistema Completo</span>
             <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Herramientas que potencian <br/> tu crecimiento</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'real_estate_agent', title: 'Core de Créditos', desc: 'Motor de amortización avanzado. Gestiona desembolsos, reestructuraciones, pagos anticipados, cálculos de mora y generación automática de contratos legales.' },
              { icon: 'account_balance', title: 'Conciliación Bancaria', desc: 'Sincronización de transacciones corporativas. Control de depósitos en tránsito, emisión de cheques, transferencias y reportería de saldos disponibles.', gradient: true },
              { icon: 'receipt_long', title: 'Gastos & Compras', desc: 'Control estricto de egresos. Manejo de proveedores, órdenes de pago, reposición de caja chica y generación de reportes tributarios gubernamentales.' },
              { icon: 'recent_actors', title: 'CRM Integrado', desc: 'Expediente digital 360° del cliente. Historial crediticio, recordatorios de cobro, envío de notificaciones y calificación de buró interno.' },
            ].map((mod, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className={mod.gradient 
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-blue-900/50 group cursor-pointer" 
                  : "bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:bg-blue-600 group transition-colors duration-500 cursor-pointer hover:shadow-2xl hover:shadow-blue-600/20"
                }
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${mod.gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-slate-800 group-hover:bg-white/20'}`}>
                   <span className={`material-symbols-outlined text-2xl ${mod.gradient ? 'text-white' : 'text-blue-400 group-hover:text-white'}`}>{mod.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{mod.title}</h3>
                <p className={`text-sm leading-relaxed transition-colors ${mod.gradient ? 'text-blue-100' : 'text-slate-400 group-hover:text-blue-100'}`}>
                  {mod.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="bg-slate-50 py-32 px-6 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Escala sin límites</h2>
            <div className="inline-flex bg-slate-200/50 p-1 rounded-full items-center">
              <button className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold shadow-sm text-sm">Facturación Anual (Ahorra 20%)</button>
              <button className="px-6 py-2.5 rounded-full text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors">Facturación Mensual</button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1 */}
            <motion.div variants={fadeInUp} whileHover={{ y: -10 }} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3 className="text-sm font-black text-slate-400 mb-2 uppercase tracking-widest">INICIO</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black text-slate-900">$0</span>
                 <span className="text-slate-500 font-bold text-sm">/ 15 días</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 font-medium">Ideal para conocer el sistema operativo sin compromisos.</p>
              <a href="https://wa.me/8492705770?text=Me%20interesa%20probar%20gratis" target="_blank" className="block text-center w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl mb-8 hover:bg-slate-200 transition-colors">Probar Gratis</a>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Hasta 3 Préstamos</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Usuario Administrativo</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Sucursal Básica</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Soporte vía Email</li>
              </ul>
            </motion.div>

            {/* Plan 2 */}
            <motion.div variants={fadeInUp} whileHover={{ y: -10 }} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined">work</span>
              </div>
              <h3 className="text-sm font-black text-blue-600 mb-2 uppercase tracking-widest">ESTÁNDAR</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black text-slate-900">$30</span>
                 <span className="text-slate-500 font-bold text-sm">/ mes</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 font-medium">Para negocios en crecimiento que necesitan orden.</p>
              <a href="https://wa.me/8492705770?text=Quiero%20contratar%20el%20plan%20Est%C3%A1ndar" target="_blank" className="block text-center w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl mb-8 hover:bg-blue-600 transition-colors">Elegir Estándar</a>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Hasta 50 Préstamos</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Usuarios en total</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Cobrador de Ruta</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Impresión Bluetooth</li>
              </ul>
            </motion.div>

            {/* Plan 3 */}
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }} className="bg-gradient-to-b from-blue-900 to-indigo-950 p-8 rounded-3xl shadow-2xl shadow-blue-900/30 border border-blue-800 relative z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-lg">
                 Más Popular
              </div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined">domain</span>
              </div>
              <h3 className="text-sm font-black text-blue-300 mb-2 uppercase tracking-widest">AVANZADO</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black text-white">$45</span>
                 <span className="text-blue-200 font-bold text-sm">/ mes</span>
              </div>
              <p className="text-sm text-blue-100/80 mb-8 font-medium">Equipos profesionales con múltiples cobradores.</p>
              <a href="https://wa.me/8492705770?text=Quiero%20contratar%20el%20plan%20Avanzado" target="_blank" className="block text-center w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl mb-8 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all">Elegir Avanzado</a>
              <ul className="space-y-4 text-sm font-bold text-blue-50">
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> Créditos Ilimitados</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> Sucursales Ilimitadas</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> Cobradores Ilimitados</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> Infraestructura Dedicada</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> API de Integración</li>
                <li className="flex items-start gap-3"><span className="material-symbols-outlined text-blue-400 text-lg">check_circle</span> Soporte Prioritario 24/7</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-blue-600 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
            Digitaliza tu financiera hoy mismo.
          </h2>
          <a href="https://wa.me/8492705770?text=Hola,%20quiero%20crear%20mi%20cuenta" target="_blank" className="inline-block px-10 py-5 bg-white text-blue-700 text-lg font-black rounded-2xl hover:scale-105 shadow-2xl shadow-blue-900/50 transition-transform">
            Crear mi cuenta gratis
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 justify-center md:justify-start mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-sm">account_balance</span>
                </div>
                <span className="text-xl font-black text-white tracking-tighter">Préstamo Pro</span>
             </div>
             <p className="text-sm font-semibold text-slate-500 leading-relaxed">
               La plataforma más avanzada para la gestión de préstamos, cobros y administración financiera de Latinoamérica.
             </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Producto</h4>
            <ul className="space-y-3 text-sm font-semibold text-slate-400">
              <li><a href="#plataforma" className="hover:text-blue-400 transition-colors">Características</a></li>
              <li><a href="#planes" className="hover:text-blue-400 transition-colors">Precios</a></li>
              <li><a href="#modulos" className="hover:text-blue-400 transition-colors">Aplicación Móvil</a></li>
              <li><a href="#plataforma" className="hover:text-blue-400 transition-colors">Actualizaciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Recursos</h4>
            <ul className="space-y-3 text-sm font-semibold text-slate-400">
              <li><a href="https://wa.me/8492705770" target="_blank" className="hover:text-blue-400 transition-colors">Centro de Ayuda</a></li>
              <li><a href="https://wa.me/8492705770" target="_blank" className="hover:text-blue-400 transition-colors">Videotutoriales</a></li>
              <li><a href="https://wa.me/8492705770" target="_blank" className="hover:text-blue-400 transition-colors">API Docs</a></li>
              <li><a href="https://wa.me/8492705770" target="_blank" className="hover:text-blue-400 transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm font-semibold text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors cursor-not-allowed">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors cursor-not-allowed">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors cursor-not-allowed">Acuerdo de Seguridad</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-600">
            © {new Date().getFullYear()} Préstamo Pro Software. Creado con tecnología de vanguardia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
