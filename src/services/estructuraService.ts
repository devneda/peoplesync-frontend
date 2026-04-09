import { api } from './api';
import type { Calendario, Delegacion, Horario, PatronRotacion } from '../types';

export const estructuraService = {
  // --- DELEGACIONES ---
  obtenerDelegaciones: async (): Promise<Delegacion[]> => {
    const response = await api.get('/delegaciones');
    return response.data;
  },

  crearDelegacion: async (data: { nombre: string; direccion: string }): Promise<Delegacion> => {
    const response = await api.post('/delegaciones', data);
    return response.data;
  },

  // --- HORARIOS ---
  obtenerHorarios: async (): Promise<Horario[]> => {
    const response = await api.get('/horarios');
    return response.data;
  },

  crearHorario: async (data: Omit<Horario, 'id'>): Promise<Horario> => {
    const response = await api.post('/horarios', data);
    return response.data;
  },

  // --- CALENDARIOS ---
  obtenerCalendarios: async (): Promise<Calendario[]> => {
    const response = await api.get('/calendarios');
    return response.data;
  },

  crearCalendario: async (
    delegacionId: string,
    data: Omit<Calendario, 'id' | 'delegacionId'>
  ): Promise<Calendario> => {
    const response = await api.post(`/calendarios/delegacion/${delegacionId}`, data);
    return response.data;
  },
  // --- PATRONES DE ROTACIÓN ---
  obtenerPatrones: async (): Promise<PatronRotacion[]> => {
    const response = await api.get('/patrones');
    return response.data;
  },

  crearPatron: async (data: {
    nombre: string;
    descripcion: string;
    semanasCiclo: number;
    turnos: { semanaOrden: number; horarioId: string }[];
  }): Promise<PatronRotacion> => {
    const response = await api.post('/patrones', data);
    return response.data;
  },
};
