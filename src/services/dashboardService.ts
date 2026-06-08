import { api } from './api';
import type { Usuario } from '../types';

export interface DashboardStats {
  totalEmpleados: number;
  totalDelegaciones: number;
  empleadosActivosHoy: number;
  ausenciasHoy: number;
}

export const dashboardService = {
  obtenerEstadisticas: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  obtenerActivosHoy: async (): Promise<Usuario[]> => {
    const response = await api.get('/dashboard/activos-hoy');
    return response.data;
  },
};
