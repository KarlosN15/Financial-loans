import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSaasUsers, updateUserPlan, deleteSaasUser } from '../api/api';
import Swal from 'sweetalert2';

const SaasPanel = () => {
  const queryClient = useQueryClient();
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['saas_users'],
    queryFn: getSaasUsers
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, plan }: { id: number; plan: string }) => updateUserPlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas_users'] });
      setEditingPlanId(null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Plan actualizado con éxito',
        showConfirmButton: false,
        timer: 3000
      });
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Error al actualizar el plan', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSaasUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas_users'] });
      Swal.fire('Eliminado', 'La empresa y todos sus datos han sido borrados permanentemente.', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Error al eliminar el usuario', 'error');
    }
  });

  const handleDelete = (id: number, name: string) => {
    Swal.fire({
      title: `¿Eliminar a ${name}?`,
      text: "¡Esta acción no se puede deshacer! Se borrarán todos sus clientes, préstamos y pagos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse font-bold text-slate-400">Cargando Panel SaaS...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-primary font-headline tracking-tighter">Panel de Súper Administrador</h2>
        <p className="text-slate-500 mt-1 font-medium">Control general de empresas y límites de suscripción (SaaS).</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4 font-black">Empresa (Dueño)</th>
                <th className="px-6 py-4 font-black">Registro</th>
                <th className="px-6 py-4 font-black">Préstamos Creados</th>
                <th className="px-6 py-4 font-black">Plan Actual</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{user.name || 'Sin Nombre'}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                      {user._count.loans} Préstamos
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingPlanId === user.id ? (
                      <select
                        className="bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-700 p-2 focus:ring-primary"
                        defaultValue={user.plan}
                        onChange={(e) => updateMutation.mutate({ id: user.id, plan: e.target.value })}
                        disabled={updateMutation.isPending}
                      >
                        <option value="inicio">Inicio (Máx 3)</option>
                        <option value="estandar">Estándar (Máx 50)</option>
                        <option value="premium">Premium (Ilimitado)</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${
                        user.plan === 'premium' ? 'bg-amber-100 text-amber-600' :
                        user.plan === 'estandar' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {user.plan}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {editingPlanId === user.id ? (
                      <button
                        onClick={() => setEditingPlanId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingPlanId(user.id)}
                          className="text-xs font-bold text-primary hover:text-blue-800 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Modificar Plan
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name || 'Sin Nombre')}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                          disabled={deleteMutation.isPending}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SaasPanel;
