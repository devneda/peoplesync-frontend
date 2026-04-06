// src/pages/AdminUsuarios.tsx
import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import type { Delegacion, UsuarioRequest, Usuario } from '../types';
import toast from 'react-hot-toast';

export default function AdminUsuarios() {
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);
  const [managers, setManagers] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<UsuarioRequest>({
    dni: '',
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'USER',
    delegacionId: '',
    diasVacacionesAnuales: 22
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dels, users] = await Promise.all([
          usuarioService.obtenerDelegaciones(),
          usuarioService.obtenerTodos()
        ]);
        setDelegaciones(dels);
        
        const posiblesManagers = users.filter(u => u.rol === 'MANAGER' || u.rol === 'ADMIN');
        setManagers(posiblesManagers);
      } catch (error) {
        console.error('Error al cargar datos para el formulario:', error);
        toast.error("Error al cargar los datos del formulario");
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usuarioService.crearUsuario(formData);
      toast.success('¡Usuario creado correctamente!');
      // Limpiar formulario
      setFormData({ dni: '', nombreCompleto: '', email: '', password: '', rol: 'USER', delegacionId: '', diasVacacionesAnuales: 22, managerId: null });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || 'Error al crear usuario');
      } else {
        toast.error('Error al crear usuario');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 mt-1">Alta de nuevos empleados en PeopleSync.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Crear Nuevo Usuario</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre Completo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.nombreCompleto}
              onChange={e => setFormData({...formData, nombreCompleto: e.target.value})}
            />
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">DNI / NIE</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.dni}
              onChange={e => setFormData({...formData, dni: e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Corporativo</label>
            <input 
              type="email" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña Temporal</label>
            <input 
              type="password" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rol de Acceso</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.rol}
              onChange={e => setFormData({...formData, rol: e.target.value as UsuarioRequest['rol']})}
            >
              <option value="USER">Empleado (USER)</option>
              <option value="MANAGER">Responsable (MANAGER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
          </div>

          {/* Delegación */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Delegación / Oficina</label>
            <select 
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.delegacionId}
              onChange={e => setFormData({...formData, delegacionId: e.target.value})}
            >
              <option value="">Selecciona oficina...</option>
              {delegaciones.map(d => (
                <option key={d.id} value={d.id}>{d.nombre} ({d.direccion})</option>
              ))}
            </select>
          </div>

          {/* Manager Asignado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Responsable Asignado (Opcional)</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.managerId || ''}
              onChange={e => setFormData({...formData, managerId: e.target.value || null})}
            >
              <option value="">Ninguno (Directivo / Sin Jefe)</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombreCompleto} ({m.rol})
                </option>
              ))}
            </select>
          </div>
          
          {/* Días de Vacaciones */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Días de Vacaciones Anuales</label>
            <input 
              type="number" 
              min="0"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.diasVacacionesAnuales}
              onChange={e => setFormData({...formData, diasVacacionesAnuales: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Registrar Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}