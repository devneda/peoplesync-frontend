import { api } from './api';
import type { Ausencia } from '../types';

export const ausenciaService = {
  solicitar: async (datos: FormData): Promise<Ausencia> => {
    const response = await api.post('/ausencias', datos, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  obtenerMisAusencias: async (): Promise<Ausencia[]> => {
    const response = await api.get('/ausencias/mis-ausencias');
    return response.data;
  },
  obtenerPendientes: async (): Promise<Ausencia[]> => {
    const response = await api.get('/ausencias/pendientes');
    return response.data;
  },

  actualizarEstado: async (
    id: string,
    nuevoEstado: 'APROBADA' | 'RECHAZADA'
  ): Promise<Ausencia> => {
    const response = await api.put(`/ausencias/${id}/estado`, { estado: nuevoEstado });
    return response.data;
  },

  // Método para obtener la URL del documento
  descargarDocumento: async (id: string): Promise<Blob> => {
    const response = await api.get(`/ausencias/${id}/documento`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
