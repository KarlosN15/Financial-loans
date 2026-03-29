import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Actualiza al cambiar de pestaña
      staleTime: 30 * 1000,       // Considera los datos frescos por 30s
      retry: 1,                    // Un solo reintento si falla (más rápido)
    },
    mutations: {
      onSettled: () => {
        // Al terminar cualquier cambio, refresca el resumen global (Dashboard)
        queryClient.invalidateQueries({ queryKey: ['summary'] });
      }
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

