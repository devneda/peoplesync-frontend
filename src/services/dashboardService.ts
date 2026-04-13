import { api } from './api';

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
};
