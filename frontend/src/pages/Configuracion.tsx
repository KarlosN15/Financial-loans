import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { 
  getBranches, createBranch, 
  getRoutes, createRoute, 
  getPortfolios, createPortfolio 
} from '../api/api';

const Configuracion = () => {
  const queryClient = useQueryClient();

  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: getBranches });
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });
  const { data: portfolios = [] } = useQuery({ queryKey: ['portfolios'], queryFn: getPortfolios });

  const branchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] })
  });

  const routeMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] })
  });

  const portfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolios'] })
  });

  const handleAddBranch = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nueva Sucursal',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      inputValidator: (value) => !value ? 'Debe ingresar un nombre' : null
    });
    if (name) branchMutation.mutate({ name });
  };

  const handleAddRoute = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nueva Ruta',
      input: 'text',
      inputLabel: 'Nombre de la Ruta',
      showCancelButton: true,
      inputValidator: (value) => !value ? 'Debe ingresar un nombre' : null
    });
    if (name) routeMutation.mutate({ name });
  };

  const handleAddPortfolio = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nueva Cartera',
      input: 'text',
      inputLabel: 'Nombre de la Cartera',
      showCancelButton: true,
      inputValidator: (value) => !value ? 'Debe ingresar un nombre' : null
    });
    if (name) portfolioMutation.mutate({ name });
  };

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
          <button 
            onClick={handleAddBranch}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm mb-4"
          >
            + Añadir Sucursal
          </button>
          <div className="space-y-2">
             {branches.map((b: any) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-700">{b.name}</span>
                </div>
             ))}
          </div>
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
          <button 
            onClick={handleAddRoute}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm mb-4"
          >
            + Añadir Ruta
          </button>
          <div className="space-y-2">
             {routes.map((r: any) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-700">{r.name}</span>
                </div>
             ))}
          </div>
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
          <button 
            onClick={handleAddPortfolio}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-colors font-bold text-sm mb-4"
          >
            + Añadir Cartera
          </button>
          <div className="space-y-2">
             {portfolios.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-700">{p.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
