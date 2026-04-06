import { useState, useEffect } from 'react';
import { Users, Mail, Fingerprint, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { type Usuario } from '../types';
import toast from 'react-hot-toast';

export default function Equipo() {
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const data = await usuarioService.obtenerMisEmpleados();
        setEmpleados(data);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        toast.error('No se pudo cargar la lista del equipo');
      } finally {
        setCargando(false);
      }
    };

    cargarEmpleados();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Mi Equipo
          </h1>
          <p className="text-slate-500 mt-1">Gestiona y visualiza a los empleados a tu cargo.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Empleados: </span>
          <span className="text-lg font-bold text-blue-600 ml-2">{empleados.length}</span>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {cargando ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Cargando equipo...
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No tienes empleados a tu cargo</p>
                    <p className="text-sm mt-1">Cuando se te asignen trabajadores, aparecerán aquí.</p>
                  </td>
                </tr>
              ) : (
                empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Nombre y DNI */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{emp.nombreCompleto}</span>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                          <Fingerprint className="w-3 h-3" />
                          <span>{emp.dni}</span>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {emp.email}
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`w-4 h-4 ${emp.rol === 'ADMIN' ? 'text-purple-500' : emp.rol === 'MANAGER' ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">{emp.rol}</span>
                      </div>
                    </td>

                    {/* Estado (Activo/Inactivo) */}
                    <td className="px-6 py-4">
                      {emp.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}