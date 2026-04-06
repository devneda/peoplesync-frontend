import { api } from './api';
import type { Usuario, UsuarioRequest, Delegacion } from '../types';

export const usuarioService = {
  obtenerMisEmpleados: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios/mis-empleados');
    return response.data;
  },

  obtenerTodos: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  crearUsuario: async (datos: UsuarioRequest): Promise<Usuario> => {
    const response = await api.post('/usuarios', datos);
    return response.data;
  },

  obtenerDelegaciones: async (): Promise<Delegacion[]> => {
    const response = await api.get('/delegaciones');
    return response.data;
  }
};