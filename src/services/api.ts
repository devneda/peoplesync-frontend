import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };

      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        if (window.location.pathname !== '/login') {
          console.warn('Sesión caducada, redirigiendo al login...');

          localStorage.removeItem('token');

          toast.error('Tu sesión ha caducado. Vuelve a entrar.');

          window.location.href = '/login';
        }
      }
    }

    // Devolvemos el error para que los catch de los componentes sigan funcionando si es otro tipo de error
    return Promise.reject(error);
  }
);
