import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ModalType = 
  | 'changelog' 
  | 'help' 
  | 'tutorials' 
  | 'api' 
  | 'blog' 
  | 'terms' 
  | 'privacy' 
  | 'security' 
  | null;

interface LandingModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export const LandingModals: React.FC<LandingModalsProps> = ({ activeModal, onClose }) => {
  // Help Center Search
  const [helpSearch, setHelpSearch] = useState('');
  // API Docs Active Tab
  const [apiEndpoint, setApiEndpoint] = useState<'auth' | 'loans' | 'payments' | 'clients'>('payments');
  const [copiedCode, setCopiedCode] = useState(false);
  // Blog Active Article
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!activeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined">
                  {activeModal === 'changelog' && 'history'}
                  {activeModal === 'help' && 'help'}
                  {activeModal === 'tutorials' && 'play_circle'}
                  {activeModal === 'api' && 'code'}
                  {activeModal === 'blog' && 'article'}
                  {activeModal === 'terms' && 'gavel'}
                  {activeModal === 'privacy' && 'shield_person'}
                  {activeModal === 'security' && 'lock'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {activeModal === 'changelog' && 'Registro de Actualizaciones (Changelog)'}
                  {activeModal === 'help' && 'Centro de Ayuda y Preguntas Frecuentes'}
                  {activeModal === 'tutorials' && 'Videotutoriales y Guías Paso a Paso'}
                  {activeModal === 'api' && 'Documentación API REST para Desarrolladores'}
                  {activeModal === 'blog' && 'Blog de Microfinanzas y Gestión de Créditos'}
                  {activeModal === 'terms' && 'Términos y Condiciones de Servicio'}
                  {activeModal === 'privacy' && 'Política de Privacidad y Protección de Datos'}
                  {activeModal === 'security' && 'Acuerdo de Seguridad e Infraestructura'}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  PresPro Systems • Plataforma Financiera en la Nube
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              title="Cerrar (Esc)"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            
            {/* 1. ACTUALIZACIONES (CHANGELOG) */}
            {activeModal === 'changelog' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-md inline-block mb-1">
                      Versión Actual
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">PresPro Systems v2.5.0</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Desplegado en producción con alta disponibilidad</p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">rocket_launch</span>
                </div>

                <div className="space-y-6">
                  {/* v2.5 */}
                  <div className="border-l-2 border-blue-600 pl-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">v2.5.0 - Motor de Rédito con Abonos Directos a Capital</span>
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">Última Novedad</span>
                    </div>
                    <p className="text-xs text-slate-400">Octubre 2026</p>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li><strong>Rédito Inteligente:</strong> Soporte completo para préstamos de interés periódico con abonos libres directos a reducción del capital principal.</li>
                      <li><strong>Cuotas Quincenales y Semanales:</strong> Flexibilidad total en periodos de cobro y recalculación automática del balance insoluto.</li>
                      <li><strong>Cuadre de Cobro Mixto:</strong> Al pagar un monto superior al rédito pendiente, el excedente se amortiza instantáneamente a capital.</li>
                      <li><strong>Tickets Térmicos Detallados:</strong> El recibo especifica el desglose exacto entre rédito cubierto y abono de capital aplicado.</li>
                    </ul>
                  </div>

                  {/* v2.4 */}
                  <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 space-y-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">v2.4.0 - Ecosistema de Impresión Bluetooth Móvil</span>
                    <p className="text-xs text-slate-400">Septiembre 2026</p>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li>Conexión nativa con impresoras térmicas portátiles ESC/POS de 58mm y 80mm vía Bluetooth Web API.</li>
                      <li>Inclusión de código QR criptográfico para verificación de recibos oficiales emitidos en la calle.</li>
                      <li>Generación automática de pagarés notariales y contratos en formato PDF listo para firmar.</li>
                    </ul>
                  </div>

                  {/* v2.3 */}
                  <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 space-y-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">v2.3.0 - Control de Bóveda Central y Cierre de Caja</span>
                    <p className="text-xs text-slate-400">Agosto 2026</p>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li>Arqueo diario ciego de cobradores en ruta para evitar fugas de capital.</li>
                      <li>Registro de gastos operativos, egresos de caja chica y depósitos bancarios directos.</li>
                      <li>Dashboard ejecutivo con gráficos de rentabilidad, cobrado vs proyectado y tasa de mora.</li>
                    </ul>
                  </div>

                  {/* v2.2 */}
                  <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-4 space-y-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">v2.2.0 - Seguridad Multi-Tenant y Doble Factor</span>
                    <p className="text-xs text-slate-400">Julio 2026</p>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li>Aislamiento estricto de base de datos por tenant (`tenantId`) para total confidencialidad.</li>
                      <li>Cifrado bancario TLS 1.3 / AES-256 en reposo y copias de seguridad continuas.</li>
                      <li>Soporte de autenticación de dos factores (2FA) para usuarios administradores.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CENTRO DE AYUDA (HELP) */}
            {activeModal === 'help' && (
              <div className="space-y-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    type="text"
                    value={helpSearch}
                    onChange={(e) => setHelpSearch(e.target.value)}
                    placeholder="Buscar tema de ayuda (ej. rédito, impresora, cobradores, caja)..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: '¿Cómo crear y emitir un nuevo préstamo?',
                      a: 'Accede al menú "Nuevo Préstamo", selecciona el cliente existente o créalo en el acto, define el monto, tasa de interés, frecuencia (diaria, semanal, quincenal, mensual) y el tipo de cálculo (Cuota Fija o Rédito). El sistema calcula la tabla de amortización al instante y genera el pagaré legal.',
                      tag: 'Préstamos'
                    },
                    {
                      q: '¿Cómo funciona el pago de Rédito con Abonos a Capital?',
                      a: 'En la modalidad de Rédito, el cliente paga periódicamente el interés generado por el capital. Si entrega una suma mayor a la cuota de rédito (por ejemplo, cuota de $500 y paga $1,200), PresPro aplica $500 para liquidar el rédito y los $700 restantes van directamente a reducir la deuda principal (capital), reduciendo los intereses de los periodos siguientes.',
                      tag: 'Rédito'
                    },
                    {
                      q: '¿Cómo conectar una impresora térmica Bluetooth portátil?',
                      a: 'Enciende tu impresora Bluetooth (58mm u 80mm) y vincúlala en los ajustes de tu celular o tablet. Al ingresar al panel de cobros de PresPro y presionar "Imprimir Ticket", el navegador solicitará permiso para enviar el recibo al dispositivo emparejado en formato ESC/POS estándar.',
                      tag: 'Impresoras'
                    },
                    {
                      q: '¿Cómo dar de alta a cobradores y asignarles permisos?',
                      a: 'Desde el módulo "Agentes", puedes crear usuarios con rol AGENT. Los cobradores solo tienen acceso a su cartera asignada, módulo de cobro rápido y emisión de recibos. No pueden alterar configuraciones contables ni tasas maestras de la empresa.',
                      tag: 'Cobradores'
                    },
                    {
                      q: '¿Cómo realizar el arqueo y cierre de caja al final del día?',
                      a: 'En la sección "Caja", el administrador visualiza el total recaudado en efectivo, transferencias y depósitos. Puede ingresar el monto físico contado para validar que coincida con el sistema. Si hay diferencias, el software permite documentar la observación y sellar el turno con firma digital.',
                      tag: 'Caja'
                    },
                    {
                      q: '¿Los datos de mi financiera están seguros?',
                      a: 'Totalmente. PresPro Systems utiliza arquitectura Multi-Tenant con cifrado AES-256 en reposo y certificados SSL TLS 1.3. Realizamos respaldos diarios automáticos en la nube y garantizamos un 99.9% de disponibilidad continua.',
                      tag: 'Seguridad'
                    }
                  ]
                    .filter((faq) => 
                      faq.q.toLowerCase().includes(helpSearch.toLowerCase()) || 
                      faq.a.toLowerCase().includes(helpSearch.toLowerCase()) ||
                      faq.tag.toLowerCase().includes(helpSearch.toLowerCase())
                    )
                    .map((faq, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{faq.q}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            {faq.tag}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                </div>

                {/* VIP Support Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-base">¿Necesitas soporte técnico asistido?</h4>
                    <p className="text-xs text-blue-100">Atención personalizada directa vía WhatsApp los 7 días de la semana.</p>
                  </div>
                  <a
                    href="https://wa.me/8492705770"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-white text-blue-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-900/40"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    WhatsApp VIP
                  </a>
                </div>
              </div>
            )}

            {/* 3. VIDEOTUTORIALES (TUTORIALS) */}
            {activeModal === 'tutorials' && (
              <div className="space-y-6">
                <p className="text-slate-500 dark:text-slate-400">
                  Aprende a dominar todas las herramientas operativas de PresPro Systems mediante nuestras guías visuales estructuradas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: '1. Puesta en Marcha y Configuración Inicial',
                      duration: '5:20 min',
                      desc: 'Configura tus tasas de interés, logo de empresa para los recibos y da de alta tus primeras sucursales y carteras.',
                      icon: 'settings_suggest'
                    },
                    {
                      title: '2. Emisión de Préstamos: Cuota Fija y Rédito',
                      duration: '8:45 min',
                      desc: 'Aprende a emitir créditos con amortización francesa, alemana o rédito puro con abonos directos al capital.',
                      icon: 'account_balance_wallet'
                    },
                    {
                      title: '3. Cobro Móvil en Calle e Impresión Térmica',
                      duration: '6:15 min',
                      desc: 'Descubre cómo los cobradores gestionan su ruta diaria desde el celular e imprimen tickets oficiales Bluetooth en 3 segundos.',
                      icon: 'print'
                    },
                    {
                      title: '4. Arqueo de Bóveda, Caja y Reportes Financieros',
                      duration: '7:30 min',
                      desc: 'Procedimiento de cierre diario de caja, conciliación bancaria, registro de gastos operativos y exportación a Excel.',
                      icon: 'bar_chart'
                    }
                  ].map((vid, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition-colors group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                            <span className="material-symbols-outlined">{vid.icon}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                            {vid.duration}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {vid.desc}
                        </p>
                      </div>

                      <a
                        href="https://wa.me/8492705770?text=Hola,%20deseo%20ver%20la%20capacitacion%20completa%20en%20video"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">play_circle</span>
                        Solicitar Demostración Guiada
                      </a>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-800 dark:text-blue-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-xl">contact_support</span>
                  <span>
                    ¿Prefieres una inducción personalizada para tu equipo de cobradores y cajeros? Ofrecemos sesiones de capacitación en vivo incluidas en tu suscripción.
                  </span>
                </div>
              </div>
            )}

            {/* 4. API DOCS (API) */}
            {activeModal === 'api' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Integración REST API v1</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Conecta PresPro Systems con tus pasarelas de pago, sistemas contables (SAP, QuickBooks), canales WhatsApp o aplicaciones móviles propias.
                  </p>
                </div>

                {/* Base URL */}
                <div className="bg-slate-900 text-slate-300 p-3.5 rounded-xl text-xs font-mono flex items-center justify-between">
                  <span>Base URL: <strong className="text-blue-400">https://financial-loans.onrender.com/api</strong></span>
                  <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">JSON REST</span>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  {[
                    { id: 'payments', label: 'POST /payments (Cobro de Cuota / Rédito)' },
                    { id: 'loans', label: 'GET /loans (Listar Préstamos)' },
                    { id: 'clients', label: 'POST /clients (Crear Cliente)' },
                    { id: 'auth', label: 'POST /auth/login (Autenticación)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setApiEndpoint(tab.id as any)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        apiEndpoint === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Snippets */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const code = apiEndpoint === 'payments'
                        ? `curl -X POST https://financial-loans.onrender.com/api/payments \\\n  -H "Authorization: Bearer <TU_JWT_TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "loanId": 1045,\n    "amount": 1000.00,\n    "paymentMethod": "CASH",\n    "notes": "Cobro de rédito $500 y abono a capital $500"\n  }'`
                        : apiEndpoint === 'loans'
                        ? `curl -X GET "https://financial-loans.onrender.com/api/loans?status=ACTIVE&limit=20" \\\n  -H "Authorization: Bearer <TU_JWT_TOKEN>"`
                        : apiEndpoint === 'clients'
                        ? `curl -X POST https://financial-loans.onrender.com/api/clients \\\n  -H "Authorization: Bearer <TU_JWT_TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "firstName": "Juan",\n    "lastName": "Pérez",\n    "documentId": "001-1234567-8",\n    "phone": "8095551234",\n    "address": "Calle Principal #10, Santo Domingo"\n  }'`
                        : `curl -X POST https://financial-loans.onrender.com/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "email": "admin@tu-financiera.com",\n    "password": "tu-password-segura"\n  }'`;
                      copyToClipboard(code);
                    }}
                    className="absolute right-3 top-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md font-semibold flex items-center gap-1 transition-colors z-10"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedCode ? 'check' : 'content_copy'}</span>
                    {copiedCode ? 'Copiado' : 'Copiar'}
                  </button>

                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    {apiEndpoint === 'payments' && `// Registrar pago o abono a capital (cURL)
curl -X POST https://financial-loans.onrender.com/api/payments \\
  -H "Authorization: Bearer <TU_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "loanId": 1045,
    "amount": 1000.00,
    "paymentMethod": "CASH",
    "notes": "Cobro de rédito $500 y abono a capital $500"
  }'

// Respuesta exitosa (201 Created):
{
  "success": true,
  "paymentId": 8940,
  "appliedToInterest": 500.00,
  "appliedToCapital": 500.00,
  "remainingBalance": 4500.00,
  "receiptNumber": "REC-2026-08940"
}`}

                    {apiEndpoint === 'loans' && `// Consultar préstamos activos (cURL)
curl -X GET "https://financial-loans.onrender.com/api/loans?status=ACTIVE&limit=20" \\
  -H "Authorization: Bearer <TU_JWT_TOKEN>"

// Respuesta exitosa (200 OK):
{
  "total": 48,
  "loans": [
    {
      "id": 1045,
      "clientName": "Juan Pérez",
      "amount": 5000.00,
      "rate": 10.0,
      "type": "REDITO",
      "balance": 4500.00,
      "nextDueDate": "2026-11-01"
    }
  ]
}`}

                    {apiEndpoint === 'clients' && `// Registrar un nuevo prestatario (cURL)
curl -X POST https://financial-loans.onrender.com/api/clients \\
  -H "Authorization: Bearer <TU_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentId": "001-1234567-8",
    "phone": "8095551234",
    "address": "Calle Principal #10, Santo Domingo"
  }'`}

                    {apiEndpoint === 'auth' && `// Obtener JWT Token (cURL)
curl -X POST https://financial-loans.onrender.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@tu-financiera.com",
    "password": "tu-password-segura"
  }'

// Respuesta (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": { "id": 1, "name": "Admin", "role": "ADMIN" }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* 5. BLOG (BLOG) */}
            {activeModal === 'blog' && (
              <div className="space-y-6">
                {selectedArticle === null ? (
                  <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400">
                      Estrategias financieras, consejos de cobranza en calle y mejores prácticas para prestamistas y financieras en crecimiento.
                    </p>

                    {[
                      {
                        id: 1,
                        title: '5 Claves para Reducir la Tasa de Morosidad en Préstamos de Calle',
                        date: '18 de Octubre, 2026',
                        readTime: '4 min lectura',
                        summary: 'Aprende cómo la frecuencia de visita, la emisión de tickets físicos instantáneos y los recordatorios por WhatsApp mantienen la mora por debajo del 3%.',
                        tag: 'Cobranza'
                      },
                      {
                        id: 2,
                        title: 'Rédito Puro vs. Amortización Capitalizable: ¿Cuál Deja Mayor Margen?',
                        date: '12 de Octubre, 2026',
                        readTime: '6 min lectura',
                        summary: 'Un desglose financiero de por qué el modelo de cobro de interés periódico con opción a abonos a capital es el preferido por comerciantes y prestamistas ágiles.',
                        tag: 'Finanzas'
                      },
                      {
                        id: 3,
                        title: 'Por Qué el Recibo Físico Bluetooth Sigue Superando a las Notificaciones Digitales',
                        date: '5 de Octubre, 2026',
                        readTime: '3 min lectura',
                        summary: 'El impacto psicológico de la entrega del comprobante impreso en la mano del deudor y cómo elimina al 100% las disputas por pagos no registrados.',
                        tag: 'Tecnología'
                      },
                      {
                        id: 4,
                        title: 'La Guía Definitiva del Cierre de Caja Ciego para Evitar Fugas de Dinero',
                        date: '28 de Septiembre, 2026',
                        readTime: '5 min lectura',
                        summary: 'Buenas prácticas para el cuadre diario de cobradores y cajeros: arqueos independientes, auditoría cruzada y conciliación bancaria.',
                        tag: 'Auditoría'
                      }
                    ].map((art) => (
                      <div
                        key={art.id}
                        onClick={() => setSelectedArticle(art.id)}
                        className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 cursor-pointer transition-all hover:-translate-y-0.5 group"
                      >
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                            {art.tag}
                          </span>
                          <span>•</span>
                          <span>{art.date}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {art.summary}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3 group-hover:gap-2 transition-all">
                          Leer artículo completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mb-2"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Volver a la lista de artículos
                    </button>

                    {selectedArticle === 1 && (
                      <div className="space-y-4">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full">Cobranza</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">5 Claves para Reducir la Tasa de Morosidad en Préstamos de Calle</h3>
                        <p className="text-xs text-slate-400">Por Equipo PresPro Systems • 18 de Octubre, 2026</p>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p>La morosidad es el enemigo número uno de la rentabilidad en cualquier cartera de crédito, especialmente en modelos de micropréstamos diarios o semanales. Implementar los siguientes cinco pilares transformará tu recuperación de capital:</p>
                          <h5 className="font-bold text-slate-900 dark:text-white">1. Entrega Inmediata de Recibo Oficial</h5>
                          <p>Cuando un cliente entrega efectivo a un cobrador y recibe un recibo térmico oficial con código de verificación QR, se crea una barrera psicológica que refuerza la seriedad del compromiso financiero y erradica las quejas de "yo pagué pero no me lo anotaron".</p>
                          <h5 className="font-bold text-slate-900 dark:text-white">2. Rutas Fijas y Horarios Consistentes</h5>
                          <p>El cobrador debe visitar al cliente a la misma hora todos los días o semanas. La predictibilidad genera el hábito en el comerciante de apartar la cuota antes de utilizar los fondos para compras operativas.</p>
                          <h5 className="font-bold text-slate-900 dark:text-white">3. Flexibilidad Inteligente con Abonos a Capital</h5>
                          <p>Si el deudor atraviesa una semana difícil, permitirle cubrir el rédito sin penalizarlo y habilitar abonos a capital cuando tenga liquidez evita que caiga en abandono de deuda.</p>
                          <h5 className="font-bold text-slate-900 dark:text-white">4. Alertas Tempranas de Vencimiento</h5>
                          <p>PresPro envía notificaciones automatizadas de recordatorio 24 horas antes de cada cuota, reduciendo el factor "se me olvidó".</p>
                          <h5 className="font-bold text-slate-900 dark:text-white">5. Arqueo Ciego Diario</h5>
                          <p>Auditar a cada cobrador al terminar el día con arqueos ciegos garantiza que el 100% de lo cobrado ingrese a la bóveda central de la financiera.</p>
                        </div>
                      </div>
                    )}

                    {selectedArticle === 2 && (
                      <div className="space-y-4">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full">Finanzas</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rédito Puro vs. Amortización Capitalizable: ¿Cuál Deja Mayor Margen?</h3>
                        <p className="text-xs text-slate-400">Por Equipo PresPro Systems • 12 de Octubre, 2026</p>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p>En el mercado de microcréditos de Latinoamérica, coexisten dos vertientes principales: la cuota fija amortizable y el rédito (interés periódico).</p>
                          <p>El <strong>Rédito Puro</strong> ofrece una ventaja clave: el prestamista mantiene el capital prestando y generando un flujo de caja recurrente mes a mes. Sin embargo, cuando el cliente desea amortizar, muchos programas colapsan por falta de soporte contable.</p>
                          <p>Con PresPro Systems v2.5, el modelo híbrido permite cobrar el rédito acordado y, si el prestatario entrega un excedente, se reduce automáticamente la deuda principal recalculando los réditos futuros sobre el nuevo saldo. Esto eleva la fidelidad del cliente y asegura un rendimiento sostenido.</p>
                        </div>
                      </div>
                    )}

                    {selectedArticle >= 3 && (
                      <div className="space-y-4">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full">Gestión de Cobro</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Automatización de Operaciones y Control de Bóveda</h3>
                        <p className="text-xs text-slate-400">Por Equipo PresPro Systems • Octubre 2026</p>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p>Digitalizar tu cartera de préstamos no solo ahorra horas en cuadres manuales con libretas de papel, sino que previene el fraude interno y te permite expandirte con sucursales y cobradores adicionales con total tranquilidad.</p>
                          <p>PresPro Systems centraliza cada peso desembolsado y cobrado en un solo lugar, accesible desde cualquier computadora o smartphone con conexión a internet.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. TÉRMINOS DE SERVICIO (TERMS) */}
            {activeModal === 'terms' && (
              <div className="space-y-5 text-justify">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-1">
                  <p><strong>Última Actualización:</strong> 20 de Octubre de 2026</p>
                  <p><strong>Razón Social:</strong> PresPro Systems SRL • Registro Nacional de Contribuyentes (RNC) de República Dominicana</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">1. Aceptación de los Términos</h4>
                    <p className="mt-1">
                      Al registrarse, acceder o utilizar la plataforma de software como servicio (SaaS) denominada PresPro Systems, usted (en adelante, "El Cliente" o "El Usuario") declara haber leído, comprendido y aceptado en su totalidad las presentes condiciones legales. Si no está de acuerdo con estos términos, deberá abstenerse de usar la plataforma.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">2. Objeto del Servicio</h4>
                    <p className="mt-1">
                      PresPro Systems proporciona una infraestructura tecnológica en la nube para la gestión de carteras de crédito, amortización de cuotas, emisión de recibos y contratos, liquidación de réditos, administración de cobradores y control de caja. PresPro Systems actúa exclusivamente como proveedor de software y no como intermediario financiero ni captador de depósitos del público.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">3. Propiedad de los Datos</h4>
                    <p className="mt-1">
                      El Cliente conserva la propiedad absoluta y exclusiva sobre toda la información, expedientes de deudores, historial crediticio y montos registrados en su cuenta. PresPro Systems no comercializa, transfiere ni cede bajo ninguna circunstancia los datos de clientes o prestatarios a entidades terceras o burós comerciales no autorizados expresamente por El Cliente.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">4. Disponibilidad y Nivel de Servicio (SLA)</h4>
                    <p className="mt-1">
                      PresPro Systems garantiza un compromiso de disponibilidad de servicio (Uptime) del 99.9% mensual, excluyendo periodos de mantenimiento programado debidamente notificados con 24 horas de antelación. La infraestructura cuenta con respaldos georredundantes diarios y mitigación de denegación de servicio.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">5. Suscripciones, Pagos y Cancelación</h4>
                    <p className="mt-1">
                      El acceso al software se suministra bajo planes de suscripción mensual o anual. El Cliente puede solicitar la cancelación de su suscripción en cualquier momento sin penalidades, conservando el derecho a exportar su base de datos completa en formatos abiertos (Excel/CSV) antes del cierre de su periodo activo.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">6. Cumplimiento Regulatorio y Ley Aplicable</h4>
                    <p className="mt-1">
                      El presente contrato se rige e interpretará bajo las leyes de la República Dominicana, en especial la <strong>Ley No. 126-02</strong> sobre Comercio Electrónico, Documentos y Firmas Digitales, y la <strong>Ley No. 172-13</strong> sobre la Protección de Datos de Carácter Personal. Cualquier controversia será dirimida en los tribunales competentes del Distrito Nacional, República Dominicana.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. POLÍTICA DE PRIVACIDAD (PRIVACY) */}
            {activeModal === 'privacy' && (
              <div className="space-y-5 text-justify">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-1">
                  <p><strong>Marco Normativo:</strong> Ley No. 172-13 sobre Protección Integral de Datos Personales</p>
                  <p><strong>Compromiso:</strong> Cifrado de grado bancario y estricta confidencialidad corporativa</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">1. Información Recopilada</h4>
                    <p className="mt-1">
                      PresPro Systems recopila únicamente los datos indispensables para la administración contable y operativa del negocio crediticio: nombre de la financiera, datos de contacto del administrador, perfiles de cobradores y los expedientes de préstamos introducidos por El Cliente (nombres de prestatarios, cédulas, números telefónicos, direcciones y registros de pagos).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">2. Finalidad del Tratamiento de Datos</h4>
                    <p className="mt-1">
                      Los datos almacenados se emplean exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                      <li>Ejecutar el motor de cálculo de cuotas, rédito y amortización.</li>
                      <li>Generar recibos térmicos, pagarés notariales y reportes de caja.</li>
                      <li>Proveer autenticación segura y prevenir accesos no autorizados.</li>
                      <li>Suministrar asistencia técnica y soporte cuando sea solicitado por El Cliente.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">3. Confidencialidad y No Venta de Información</h4>
                    <p className="mt-1">
                      PresPro Systems <strong>jamás vende, alquila, transfiere ni comercializa</strong> las listas de clientes, deudores ni saldos financieros de sus usuarios con anunciantes, entidades bancarias externas ni centrales de buró privadas. La base de datos es tratada bajo el más riguroso secreto profesional.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">4. Seguridad y Cifrado de Información</h4>
                    <p className="mt-1">
                      Implementamos protocolos criptográficos avanzados: todas las transmisiones web y móviles viajan cifradas con <strong>TLS 1.3 (SSL de 2048 bits)</strong>, y los datos confidenciales en reposo se encuentran encriptados mediante el algoritmo <strong>AES-256</strong> en servidores de infraestructura de clase mundial.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">5. Ejercicio de Derechos ARCO</h4>
                    <p className="mt-1">
                      En conformidad con la Ley No. 172-13, El Cliente y los titulares de los datos tienen derecho a solicitar el Acceso, Rectificación, Cancelación u Oposición de sus datos personales mediante comunicación a <strong>privacidad@presprosystems.com</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. ACUERDO DE SEGURIDAD (SECURITY) */}
            {activeModal === 'security' && (
              <div className="space-y-5 text-justify">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-1">
                  <p><strong>Estándar de Seguridad:</strong> ISO/IEC 27001 Ready • Multi-Tenant Data Isolation</p>
                  <p><strong>Cifrado Activo:</strong> TLS 1.3 en Tránsito & AES-256 en Reposo</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">1. Aislamiento Estricto de Datos Multi-Tenant</h4>
                    <p className="mt-1">
                      Cada empresa financiera que utiliza PresPro Systems posee un identificador único encriptado (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 font-mono text-xs">tenantId</code>). El motor de base de datos aplica filtrado obligatorio a nivel de servicio y consultas, impidiendo categóricamente que una financiera pueda visualizar o interceptar transacciones de otra entidad.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">2. Copias de Seguridad Continuas (Backups Georredundantes)</h4>
                    <p className="mt-1">
                      Se generan respaldos automáticos de la base de datos diariamente con almacenamiento replicado en múltiples zonas geográficas independientes. Nuestro objetivo de punto de recuperación (RPO) es menor a 24 horas y garantizamos una retención histórica de copias de seguridad de hasta 30 días continuos.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">3. Mitigación DDoS y Firewall de Aplicaciones (WAF)</h4>
                    <p className="mt-1">
                      La red de PresPro Systems está protegida por defensas de borde contra ataques distribuidos de denegación de servicio (DDoS), inspección profunda de paquetes y detección automática de intrusiones para salvaguardar la continuidad operativa de los cobradores en terreno.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">4. Bitácora Inmutable de Auditoría</h4>
                    <p className="mt-1">
                      Cada acción sensible realizada en el sistema (emisión de créditos, registro de cobro, anulación de recibos, transferencias de bóveda o modificación de tasas) queda registrada con marca temporal exacta (timestamp ISO), identificador de usuario y dirección IP para fines de auditoría forense interna.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">5. Control de Acceso y Sesiones Concurrentes</h4>
                    <p className="mt-1">
                      Se implementan tokens criptográficos JWT con caducidad estricta, invalidación de sesiones al cambiar contraseñas y soporte de autenticación multifactor (2FA) para roles con privilegios de administrador.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer of modal */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} PresPro Systems SRL • Todos los derechos reservados.</span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
