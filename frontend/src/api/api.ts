import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Add a request interceptor to include the Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

export const createClient = async (data: { name: string; email?: string; identification: string; phone?: string; address?: string; guarantorName?: string; guarantorPhone?: string; routeId?: number }) => {
  const response = await api.post('/clients', data);
  return response.data;
};

export const deleteClient = async (id: number) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

export const getLoans = async () => {
  const response = await api.get('/loans');
  return response.data;
};

export const createLoan = async (data: any) => {
  const response = await api.post('/loans', data);
  return response.data;
};

export const deleteLoan = async (id: number) => {
  const response = await api.delete(`/loans/${id}`);
  return response.data;
};

export const getPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const createPayment = async (data: { loanId: number; amount: number; method: 'CASH' | 'TRANSFER' }) => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const getUpcomingInstallments = async () => {
  const response = await api.get('/payments/upcoming');
  return response.data;
};

export const getLoansSummary = async () => {
  const response = await api.get('/loans/summary');
  return response.data;
};

export const getAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

export const createAgent = async (data: any) => {
  const response = await api.post('/agents', data);
  return response.data;
};

export const deleteAgent = async (id: number) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};

// --- Expenses ---
export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const createExpense = async (data: { amount: number; description: string; status?: 'PAID' | 'PENDING' }) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const markExpenseAsPaid = async (id: number) => {
  const response = await api.patch(`/expenses/${id}/pay`);
  return response.data;
};

// --- Banks ---
export const getBanks = async () => {
  const response = await api.get('/banks');
  return response.data;
};

export const createBank = async (data: { bankName: string; accountNumber: string; balance: number }) => {
  const response = await api.post('/banks', data);
  return response.data;
};

export const addBankTransaction = async (bankId: number, data: { type: 'INCOME' | 'EXPENSE'; amount: number; description: string }) => {
  const response = await api.post(`/banks/${bankId}/transaction`, data);
  return response.data;
};

// --- Config ---
export const getBranches = async () => {
  const response = await api.get('/config/branches');
  return response.data;
};
export const createBranch = async (data: { name: string, address?: string }) => {
  const response = await api.post('/config/branches', data);
  return response.data;
};
export const updateBranch = async (id: number, data: { name: string, address?: string }) => {
  const response = await api.put(`/config/branches/${id}`, data);
  return response.data;
};
export const deleteBranch = async (id: number) => {
  const response = await api.delete(`/config/branches/${id}`);
  return response.data;
};

export const getRoutes = async () => {
  const response = await api.get('/config/routes');
  return response.data;
};
export const createRoute = async (data: { name: string }) => {
  const response = await api.post('/config/routes', data);
  return response.data;
};
export const updateRoute = async (id: number, data: { name: string }) => {
  const response = await api.put(`/config/routes/${id}`, data);
  return response.data;
};
export const deleteRoute = async (id: number) => {
  const response = await api.delete(`/config/routes/${id}`);
  return response.data;
};

export const getPortfolios = async () => {
  const response = await api.get('/config/portfolios');
  return response.data;
};
export const createPortfolio = async (data: { name: string }) => {
  const response = await api.post('/config/portfolios', data);
  return response.data;
};
export const updatePortfolio = async (id: number, data: { name: string }) => {
  const response = await api.put(`/config/portfolios/${id}`, data);
  return response.data;
};
export const deletePortfolio = async (id: number) => {
  const response = await api.delete(`/config/portfolios/${id}`);
  return response.data;
};

// --- SaaS / SuperAdmin ---
export const getSaasUsers = async () => {
  const response = await api.get('/saas/users');
  return response.data;
};

export const updateUserPlan = async (id: number, plan: string) => {
  const response = await api.patch(`/saas/users/${id}/plan`, { plan });
  return response.data;
};

export default api;
