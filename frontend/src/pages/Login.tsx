import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data.access_token, data.user);
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-3xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 rotate-12 hover:rotate-0 transition-transform duration-500">
               <span className="material-symbols-outlined text-4xl text-white">account_balance</span>
            </div>
            <h1 className="text-3xl font-black text-white font-headline tracking-tighter uppercase mb-2">Préstamo Pro</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Financial Management SaaS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Corporativo</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors">mail</span>
                <input 
                  required
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  placeholder="admin@prestamopro.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors">lock</span>
                <input 
                  required
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
               <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</p>
               </div>
            )}

            <button 
              disabled={mutation.isPending}
              className="w-full bg-primary text-white font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending ? (
                 <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  INICIAR SISTEMA
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Acceso restringido a personal autorizado
             </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] italic">Préstamo Pro Software © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
