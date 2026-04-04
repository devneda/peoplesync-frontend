import { api } from './api';
import type { Fichaje, ReporteHoras } from '../types';

export const fichajeService = {
  ficharEntrada: async (tipo: string = 'PRESENCIAL') => {
    const response = await api.post('/fichajes/entrada', {
      tipo: tipo,
      ipRegistro: '192.168.1.1',
    });
    return response.data;
  },

  ficharSalida: async () => {
    const response = await api.put('/fichajes/salida');
    return response.data;
  },

  obtenerEstado: async () => {
    const response = await api.get('/fichajes/estado');
    return response.data;
  },

  obtenerFichajesHoy: async (): Promise<Fichaje[]> => {
    const response = await api.get('/fichajes/hoy');
    return response.data;
  },

  obtenerReporte: async (inicio: string, fin: string): Promise<ReporteHoras> => {
    const response = await api.get(`/fichajes/reporte?fechaInicio=${inicio}&fechaFin=${fin}`);
    return response.data;
  },
};
