import { api } from './api';
import type { Usuario, UsuarioRequest, Delegacion } from '../types';

export const usuarioService = {
  obtenerMisEmpleados: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios/mis-empleados');
    return response.data;
  },

  obtenerUsuarioPorId: async (id: string): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  crearUsuario: async (data: UsuarioRequest): Promise<Usuario> => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  actualizarUsuario: async (id: string, data: Partial<UsuarioRequest>): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  obtenerManagers: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios/managers');
    return response.data;
  },

  cambiarMiPassword: async (data: { passwordActual: string; passwordNueva: string }) => {
    const response = await api.put('/usuarios/me/password', data);
    return response.data;
  },
};
