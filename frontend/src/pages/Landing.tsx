import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center font-bold text-lg">
            P
          </div>
          <span className="text-xl font-black text-blue-900 tracking-tighter">Préstamo Pro</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Inicio</a>
          <a href="#planes" className="hover:text-blue-600 transition-colors">Planes</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Soporte</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Guía de registro</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors">
            Registrarme
          </button>
          <Link to="/login" className="px-5 py-2.5 bg-[#0a1128] text-white text-sm font-bold rounded hover:bg-slate-800 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-blue-600 leading-[1.1] tracking-tight">
            SOFTWARE PARA <br/>
            PRÉSTAMOS <span className="bg-blue-600 text-white px-2 rounded-md">MOVIL</span>
          </h1>
          <p className="text-xl font-bold text-slate-800 leading-snug max-w-lg">
            Administra Tus Préstamos En La Computadora Y Cobra En Las Calles Con Dispositivos Moviles
          </p>
        </div>
        
        <div className="w-full md:w-[400px] flex-shrink-0 bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-xl font-black text-blue-600">SOLICITA INFORMACIÓN:</h3>
          <div className="flex items-center gap-3 text-lg font-bold text-slate-700">
            <span className="material-symbols-outlined text-green-500">chat</span>
            + 1 (809) 736 - 8555
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <span className="material-symbols-outlined text-blue-500">mail</span>
            SOPORTE@PRESTAMOPRO.COM
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="bg-slate-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-[#0a1128] mb-4">Planes</h2>
            <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-600">
              <span>Planes ordenador - Movil</span>
              <div className="w-10 h-5 bg-slate-300 rounded-full"></div>
              <span>Planes solo movil</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-[#0a1128] mb-4 uppercase">DEMO - 15 DIAS..</h3>
              <div className="text-4xl font-black text-[#0a1128] mb-6">US$0.00</div>
              <button className="w-full py-3 bg-[#0a1128] text-white font-bold rounded mb-8 hover:bg-slate-800 transition-colors">Contratar</button>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Demo por 15 días gratis</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Soporta: 50 Préstamos activos.</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Cobrador(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Sucursal(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Cartera(s).</li>
              </ul>
            </div>

            {/* Plan 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-[#0a1128] mb-4 uppercase">LC-100.</h3>
              <div className="text-4xl font-black text-[#0a1128] mb-6">US$30.00</div>
              <button className="w-full py-3 bg-[#0a1128] text-white font-bold rounded mb-8 hover:bg-slate-800 transition-colors">Contratar</button>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Soporta: 100 Préstamos activos.</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Cobrador(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Sucursal(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Cartera(s).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Usuarios.</li>
              </ul>
            </div>

            {/* Plan 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-[#0a1128] mb-4 uppercase">LC-200.</h3>
              <div className="text-4xl font-black text-[#0a1128] mb-6">US$35.00</div>
              <button className="w-full py-3 bg-blue-600 text-white font-bold rounded mb-8 hover:bg-blue-700 transition-colors">Contratar</button>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Cobrador(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Sucursal(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Cartera(s).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 4 Usuarios.</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 4 Rutas.</li>
              </ul>
            </div>

            {/* Plan 4 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-[#0a1128] mb-4 uppercase">LC-300.</h3>
              <div className="text-4xl font-black text-[#0a1128] mb-6">US$40.00</div>
              <button className="w-full py-3 bg-[#0a1128] text-white font-bold rounded mb-8 hover:bg-slate-800 transition-colors">Contratar</button>
              <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Soporta: 300 Préstamos activos.</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 2 Cobrador(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 Sucursal(es).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 5 Cartera(s).</li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 4 Usuarios.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-black text-blue-900 mb-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-red-500">cloud</span>
          Préstamo Pro
        </h2>
        <p className="text-slate-600 leading-relaxed font-medium">
          Sistema capaz de administrar y controlar toda la operación de Crédito desde un Prestamista hasta una financiera. Permite llevar el control absoluto e integrado de todas las áreas de la entidad, generando los documentos soportes tales como: Pagarés, solicitudes de crédito, comprobantes de egreso, notas contables, recibos de caja y en general cualquier documento que haya sido definido. Establece un ámbito de seguridad configurable y administrable desde cualquier parte, lo cual permite que cada profesional de la entidad tenga a su disponibilidad la información que sea relevante para su desempeño.
        </p>
      </section>

      {/* Modulos Section */}
      <section className="bg-[#0a1128] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-white text-center mb-16">Módulos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Préstamos */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">payments</span>
                Préstamos
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Este módulo permite gestionar toda la operación de préstamos, desde el registro de clientes hasta la apertura y administración de préstamos. Incluye la creación de pagarés, aplicación de pagos, ajustes de préstamos y gestión de rutas para cobradores.
              </p>
            </div>

            {/* Inversiones */}
            <div className="bg-white p-6 rounded-xl text-[#0a1128]">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">folder_open</span>
                Inversiones
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Para gestionar inversiones o certificados financieros. Permite registrar inversionistas, crear inversiones, calcular pagos, y registrar los pagos a los inversionistas. También permite cancelar inversiones y generar recibos para cada transacción.
              </p>
            </div>

            {/* Compras */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">storefront</span>
                Compras
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Gestiona el proceso de adquisición de bienes y servicios. Permite registrar órdenes de compra, gestionar proveedores, y controlar la recepción de los artículos. Además, genera reportes fiscales (como el 607) para asegurar el cumplimiento.
              </p>
            </div>

            {/* Gastos */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">receipt_long</span>
                Gastos
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Permite la administración de los gastos de la empresa, desde gastos menores hasta la gestión de caja chica. Este módulo registra todos los gastos y genera reportes para su análisis. También permite la reposición y pagos con caja chica.
              </p>
            </div>

            {/* Cajas */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">point_of_sale</span>
                Cajas
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                El módulo de cajas gestiona el flujo de efectivo, permitiendo registrar y monitorear todas las transacciones diarias para mantener el cuadre exacto en cada sucursal.
              </p>
            </div>

            {/* Bancos */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">account_balance</span>
                Bancos
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Gestiona las cuentas bancarias de la empresa, permitiendo registrar transacciones como depósitos, retiros y transferencias, así como realizar conciliaciones.
              </p>
            </div>

            {/* Contabilidad */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">monitoring</span>
                Contabilidad
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Integra todas las operaciones contables del sistema. Incluye la creación de asientos contables y reportes financieros completos para la toma de decisiones.
              </p>
            </div>

            {/* Agenda */}
            <div className="bg-[#111c40] p-6 rounded-xl hover:bg-white hover:text-[#0a1128] group transition-colors cursor-pointer">
              <h3 className="text-xl font-bold text-white group-hover:text-[#0a1128] flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined">contact_page</span>
                Agenda
              </h3>
              <p className="text-slate-400 group-hover:text-slate-600 text-sm leading-relaxed">
                Gestiona los contactos de la empresa, permitiendo registrar y consultar información de los clientes, proveedores y prospectos de manera unificada.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-slate-100 text-center">
        <p className="text-sm font-semibold text-slate-500">
          © 2026 Préstamo Pro. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
