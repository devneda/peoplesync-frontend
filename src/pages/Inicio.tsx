import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { getUsuarioFromToken, getRolFromToken } from '../utils/auth';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  CheckCircle2,
  UserX,
  Building2,
  CalendarClock,
  Clock,
  CalendarDays,
  FileText,
  Settings,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inicio() {
  const usuario = getUsuarioFromToken();
  const rol = getRolFromToken();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cargando, setCargando] = useState(true);

  // Formateo de fecha robusto
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        // En un futuro, el backend debería devolver stats diferentes según el ID/Rol
        // Por ahora, usamos el endpoint global para Admin/Manager
        const data = await dashboardService.obtenerEstadisticas();
        setStats(data);
      } catch (error) {
        const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`No se pudieron cargar las estadísticas: ${mensajeError}`);
      } finally {
        setCargando(false);
      }
    };

    if (rol === 'ADMIN' || rol === 'MANAGER') {
      cargarEstadisticas();
    } else {
      setCargando(false);
    }
  }, [rol]);

  if (cargando) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. WIDGET DE BIENVENIDA (Común para todos) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors relative overflow-hidden">
        {/* Decoración sutil de fondo */}
        <div className="absolute -right-10 -top-10 bg-blue-50 dark:bg-blue-900/20 w-40 h-40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">
              {rol === 'ADMIN'
                ? 'Administrador'
                : rol === 'MANAGER'
                  ? 'Responsable de Equipo'
                  : 'Portal del Empleado'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            ¡Hola, {usuario?.sub?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Aquí tienes el resumen de tu actividad para hoy.
          </p>
        </div>
        <div className="relative z-10">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm shadow-sm">
            Hoy es {fechaHoy}
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD ESPECÍFICO SEGÚN ROL */}

      {/* VISTA: ADMINISTRADOR */}
      {rol === 'ADMIN' && stats && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" /> Resumen de Empresa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-max mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.totalEmpleados}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Total Plantilla
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl w-max mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.totalDelegaciones}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Oficinas Activas
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl w-max mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.empleadosActivosHoy}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Fichajes Hoy
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl w-max mb-4">
                <UserX className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.ausenciasHoy}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Ausencias Globales
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: MANAGER */}
      {rol === 'MANAGER' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Resumen de Mi Equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-max mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Tu Equipo</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Visita 'Mi Equipo' para gestionarlos
              </p>
              <Link
                to="/equipo"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ir a gestión <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl w-max mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Fichajes</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Actividad diaria
              </p>
              <Link
                to="/fichajes"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Revisar horarios <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl w-max mb-4">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Solicitudes</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                Ausencias pendientes
              </p>
              <Link
                to="/ausencias"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Ir a aprobar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: USER (Empleado Raso) */}
      {rol === 'USER' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserX className="w-5 h-5 text-emerald-500" /> Tu Resumen Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                  ¿Hora de trabajar?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                  No olvides registrar tu jornada de hoy.
                </p>
                <Link
                  to="/fichajes"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  <Clock className="w-4 h-4" /> Ir a Fichar
                </Link>
              </div>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm">
                <Clock className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                  ¿Necesitas un descanso?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                  Revisa tu saldo de vacaciones disponible.
                </p>
                <Link
                  to="/ausencias"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  <CalendarDays className="w-4 h-4" /> Solicitar Ausencia
                </Link>
              </div>
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm">
                <CalendarDays className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCESOS RÁPIDOS Y WIDGET DE NOTICIAS (Común) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Tablón de Anuncios
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Hace 2 horas
              </span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                Cierre de Nóminas - Abril
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Recuerda revisar tus fichajes antes del día 25 para evitar retrasos.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                Ayer
              </span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                Bienvenida a los nuevos fichajes
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Demos una cálida bienvenida a los 3 nuevos ingenieros que se incorporan a la
                delegación Central.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors h-fit">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Enlaces Rápidos</h3>
          <div className="space-y-3">
            <Link
              to="/ausencias"
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                  <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Solicitar Vacaciones
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>

            {(rol === 'MANAGER' || rol === 'ADMIN') && (
              <Link
                to="/equipo"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Aprobar Fichajes
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </Link>
            )}

            {rol === 'ADMIN' && (
              <Link
                to="/admin"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Configuración
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
