const Configuracion = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Configuración de Estructura</h2>
          <p className="text-slate-500 mt-1">Administración de Sucursales, Rutas y Carteras operativas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sucursales */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">store</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary tracking-tighter">Sucursales</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Puntos de venta</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm">
            + Añadir Sucursal
          </button>
        </div>

        {/* Rutas */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">route</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary tracking-tighter">Rutas</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Zonas de cobro</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm">
            + Añadir Ruta
          </button>
        </div>

        {/* Carteras */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">cases</span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary tracking-tighter">Carteras</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Agrupación de clientes</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm">
            + Añadir Cartera
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
