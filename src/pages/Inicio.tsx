import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { getUsuarioFromToken } from '../utils/auth';
import {
  Users,
  MapPin,
  CheckCircle2,
  UserX,
  TrendingUp,
  Briefcase,
  CalendarClock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inicio() {
  const usuario = getUsuarioFromToken();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await dashboardService.obtenerEstadisticas();
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        toast.error('No se pudieron cargar las estadísticas');
      } finally {
        setCargando(false);
      }
    };

    // Solo cargamos si es admin o manager (según nuestro backend)
    if (usuario?.rol === 'ADMIN' || usuario?.rol === 'MANAGER') {
      cargarEstadisticas();
    } else {
      setCargando(false); // Si es usuario normal, no carga stats globales
    }
  }, [usuario]);

  // Si está cargando, mostramos un skeleton (placeholder)
  if (cargando) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Bienvenida */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            ¡Hola, {usuario?.sub?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Aquí tienes un resumen de la actividad en PeopleSync.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl text-blue-600 dark:text-blue-400 font-semibold text-sm">
            Hoy es{' '}
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>
      </div>

      {/* Widgets para ADMIN y MANAGER */}
      {stats && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Panorama General
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1: Total Empleados */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.totalEmpleados}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Total Plantilla
              </p>
            </div>

            {/* Tarjeta 2: Delegaciones */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.totalDelegaciones}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Delegaciones Activas
              </p>
            </div>

            {/* Tarjeta 3: Activos Hoy */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.empleadosActivosHoy}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Fichajes Hoy
              </p>
            </div>

            {/* Tarjeta 4: Ausencias */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <UserX className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.ausenciasHoy}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Ausencias Hoy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Inferior (Ejemplo de layout complejo) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Actividad Reciente
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 space-y-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <CalendarClock className="w-10 h-10 opacity-50" />
            <p>Los gráficos de evolución se mostrarán aquí.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Accesos Rápidos</h3>
          <div className="space-y-3">
            {['Solicitar Vacaciones', 'Aprobar Fichajes', 'Configuración de Oficina'].map(
              (item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                    →
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
