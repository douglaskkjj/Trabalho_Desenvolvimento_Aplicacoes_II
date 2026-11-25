import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gestao_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error) {
  return error?.response?.data?.mensagem || error?.response?.data?.message || error?.response?.data?.erro || error.message || 'Não foi possível concluir a operação.';
}
export default api;
