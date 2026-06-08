import { api } from './api';
import type { Anuncio } from '../types';

export const anuncioService = {
  obtenerAnuncios: async (): Promise<Anuncio[]> => {
    const response = await api.get('/anuncios');
    return response.data;
  },

  crearAnuncio: async (titulo: string, contenido: string, categoria: string): Promise<Anuncio> => {
    const response = await api.post(`/anuncios?titulo=${titulo}&contenido=${contenido}&categoria=${categoria}`);
    return response.data;
  },

  eliminarAnuncio: async (id: string): Promise<void> => {
    await api.delete(`/anuncios/${id}`);
  }
};
