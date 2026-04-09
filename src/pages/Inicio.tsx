import { Megaphone, Inbox, Clock, Calendar, Users, FileText, ChevronRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getRolFromToken } from '../utils/auth';
import { Link } from 'react-router-dom';

const datosHoras = [
  { dia: 'Lun', horas: 8.2 },
  { dia: 'Mar', horas: 7.8 },
  { dia: 'Mié', horas: 8.5 },
  { dia: 'Jue', horas: 8.0 },
  { dia: 'Vie', horas: 6.5 },
];

export default function Inicio() {
  const userRole = getRolFromToken();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pt-2 min-w-0">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Bienvenido a tu portal</h1>
        <p className="text-slate-500 mt-1">Aquí tienes un resumen de tu actividad en PeopleSync.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-blue-50/50">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">Anuncios</h2>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                2
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                <p className="text-xs text-slate-400 mb-1">Hace 2 horas</p>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Cierre de Nóminas - Abril
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Recuerda revisar tus fichajes antes del día 25.
                </p>
              </div>
              <div className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                <p className="text-xs text-slate-400 mb-1">Ayer</p>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Bienvenida a los nuevos fichajes
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2">
                  Demos una cálida bienvenida a los 3 nuevos ingenieros.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/50">
              <Inbox className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Tareas Pendientes</h2>
              <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                1
              </span>
            </div>
            <div className="p-5">
              {userRole === 'MANAGER' || userRole === 'ADMIN' ? (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Revisión de Ausencias</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tienes solicitudes pendientes.</p>
                    <Link
                      to="/gestion-ausencias"
                      className="text-emerald-600 text-xs font-semibold mt-2 flex items-center hover:text-emerald-700"
                    >
                      Ir a Gestionar <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Justificante Médico</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recuerda subir tu último justificante.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">Control Horario Semanal</h2>
                <p className="text-sm text-slate-500">Horas trabajadas en los últimos 5 días.</p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100 w-fit">
                Total: 38.5h
              </div>
            </div>

            <div className="h-72 w-full min-w-0 overflow-hidden mt-4">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={datosHoras} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="dia"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="horas"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHoras)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="font-bold text-slate-800 text-xl mb-6">Mis Aplicaciones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Link
                to="/fichajes"
                className="group flex flex-col items-center p-4 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8" />
                </div>
                <span className="text-base font-semibold text-slate-700 text-center">Fichajes</span>
              </Link>
              <Link
                to="/ausencias"
                className="group flex flex-col items-center p-4 rounded-2xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100"
              >
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8" />
                </div>
                <span className="text-base font-semibold text-slate-700 text-center">
                  Ausencias
                </span>
              </Link>
              {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                <Link
                  to="/equipo"
                  className="group flex flex-col items-center p-4 rounded-2xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8" />
                  </div>
                  <span className="text-base font-semibold text-slate-700 text-center">
                    Mi Equipo
                  </span>
                </Link>
              )}
              {/* Resto de botones mock */}
              <button className="group flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 opacity-60">
                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-base font-semibold text-slate-700 text-center">
                  Nóminas <span className="block text-[10px] text-slate-400">Próximamente</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
