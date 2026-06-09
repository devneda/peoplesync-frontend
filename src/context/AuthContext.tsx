import React, { createContext, useContext, useState, useEffect } from 'react';
import { usuarioService } from '../services/usuarioService';
import { getUsuarioFromToken } from '../utils/auth';
import type { Usuario } from '../types';

interface AuthContextType {
  perfil: Usuario | null;
  loading: boolean;
  actualizarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const actualizarPerfil = async () => {
    const userToken = getUsuarioFromToken();
    if (!userToken) {
      setPerfil(null);
      setLoading(false);
      return;
    }

    try {
      const data = await usuarioService.obtenerMiPerfil();
      setPerfil(data);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    actualizarPerfil();
  }, []);

  return (
    <AuthContext.Provider value={{ perfil, loading, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
