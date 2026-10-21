import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-rose-950/20">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 animate-pulse">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <h1 className="text-xl font-bold text-white mb-2">Algo salió inesperadamente</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Ocurrió un error al procesar esta vista. Tus datos financieros siguen a salvo en la base de datos.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/60 rounded-xl p-3 mb-6 text-left border border-slate-800 text-xs text-rose-300/80 font-mono overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/25 cursor-pointer"
              >
                Recargar página
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all border border-slate-600/50 cursor-pointer"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
