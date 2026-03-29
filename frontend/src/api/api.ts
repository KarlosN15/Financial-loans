import axios from 'axios';

const api = axios.create({
  baseURL: 'https://financial-loans.onrender.com',
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

export const createClient = async (data: any) => {
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

export default api;
