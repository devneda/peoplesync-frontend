import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { anuncioService } from '../services/anuncioService';
import { fichajeService } from '../services/fichajeService';
import { usuarioService } from '../services/usuarioService';
import { getUsuarioFromToken, getRolFromToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
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
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Layers,
  Megaphone,
  Settings,
  X,
} from 'lucide-react';
import type { Anuncio, Usuario } from '../types';

export default function Inicio() {
  const usuario = getUsuarioFromToken();
  const rol = getRolFromToken();
  const { perfil } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estaTrabajando, setEstaTrabajando] = useState(false);

  const [mostrarModalActivos, setMostrarModalActivos] = useState(false);
  const [usuariosActivos, setUsuariosActivos] = useState<Usuario[]>([]);
  const [cargandoActivos, setCargandoActivos] = useState(false);

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [statsData, anunciosData, estadoTrabajo] = await Promise.all([
          (rol === 'ADMIN' || rol === 'MANAGER') ? dashboardService.obtenerEstadisticas() : Promise.resolve(null),
          anuncioService.obtenerAnuncios(),
          (rol === 'USER' || rol === 'MANAGER') ? fichajeService.obtenerEstado() : Promise.resolve(false)
        ]);
        setStats(statsData);
        setAnuncios(anunciosData.slice(0, 3));
        setEstaTrabajando(estadoTrabajo);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargarTodo();
  }, [rol]);

  const nombreMostrar = perfil?.nombreCompleto?.split(' ')[0] || usuario?.sub?.split('@')[0];

  const calcularHaceCuanto = (fecha: string) => {
    const diff = new Date().getTime() - new Date(fecha).getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    if (horas < 1) return 'Recientemente';
    if (horas < 24) return `Hace ${horas} horas`;
    return `Hace ${Math.floor(horas / 24)} días`;
  };

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
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 -bottom-20 w-48 h-48 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200 dark:shadow-none">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                {rol === 'ADMIN'
                  ? 'Acceso Administrador'
                  : rol === 'MANAGER'
                    ? 'Panel de Responsable'
                    : 'Portal del Empleado'}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                ¡Hola, <span className="text-blue-600">{nombreMostrar}</span>! 👋
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md">
                Tu jornada hoy se ve excelente. Tienes todo listo para empezar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-200/50 dark:border-slate-700/50">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                {fechaHoy}
              </div>
              {estaTrabajando && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200 dark:shadow-none animate-in zoom-in duration-300">
                  <Clock className="w-4 h-4" />
                  Turno en curso
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-4 border-white dark:border-slate-800 shadow-xl relative animate-in zoom-in duration-700">
            <Layers className="w-32 h-32 text-blue-600 dark:text-blue-500 transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-6">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

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
            <div 
              onClick={async () => {
                setCargandoActivos(true);
                setMostrarModalActivos(true);
                try {
                  const activos = await dashboardService.obtenerActivosHoy();
                  setUsuariosActivos(activos);
                } catch (error) {
                  console.error(error);
                } finally {
                  setCargandoActivos(false);
                }
              }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer hover:ring-2 hover:ring-blue-500"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl w-max mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.empleadosActivosHoy}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-between">
                Turnos Abiertos <ArrowRight className="w-4 h-4" />
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

      {rol === 'USER' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <UserX className="w-5 h-5 text-emerald-500" /> Tu Resumen Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                  {estaTrabajando ? 'Turno Activo' : '¿Hora de trabajar?'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                  {estaTrabajando ? 'Recuerda registrar tu pausa o salida al terminar.' : 'No olvides registrar tu jornada de hoy.'}
                </p>
                <Link
                  to="/fichajes"
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white font-bold rounded-xl transition-colors shadow-lg dark:shadow-none ${estaTrabajando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                >
                  <Clock className="w-4 h-4" /> {estaTrabajando ? 'Ver mi turno' : 'Ir a Fichar'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-blue-600" /> Tablón de Anuncios
            </h3>
            <Link to="/publicaciones" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-4">
            {anuncios.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                No hay anuncios recientes
              </div>
            ) : (
              anuncios.map((anuncio) => (
                <div key={anuncio.id} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      anuncio.categoria === 'URGENTE' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {anuncio.categoria}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {calcularHaceCuanto(anuncio.fechaPublicacion)}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-lg group-hover:text-blue-600 transition-colors">
                    {anuncio.titulo}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium line-clamp-2">
                    {anuncio.contenido}
                  </p>
                </div>
              ))
            )}
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

      {mostrarModalActivos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 transition-all flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Activos Ahora</h3>
                  <p className="text-sm font-bold text-slate-400">Empleados trabajando en este momento</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalActivos(false)}
                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2">
              {cargandoActivos ? (
                <div className="p-12 text-center text-slate-400 font-bold">Cargando...</div>
              ) : usuariosActivos.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay empleados activos en este momento.</div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {usuariosActivos.map((u) => (
                    <li key={u.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl m-2">
                      {u.fotoUrl ? (
                        <img 
                          src={u.fotoUrl.replace('/upload/', '/upload/w_100,h_100,c_fill,g_face,q_auto:best,f_auto/')} 
                          alt={u.nombreCompleto} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold">
                          {u.nombreCompleto.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{u.nombreCompleto}</p>
                        <p className="text-xs font-medium text-slate-500">{u.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
