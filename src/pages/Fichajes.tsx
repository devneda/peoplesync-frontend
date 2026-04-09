import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Play,
  Square,
  Clock,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Home,
  Building2,
} from 'lucide-react';
import { fichajeService } from '../services/fichajeService';
import { type Fichaje } from '../types';
import { Link } from 'react-router-dom';

export default function Fichajes() {
  const [estaTrabajando, setEstaTrabajando] = useState(false);
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [horasHoy, setHorasHoy] = useState('0h 0m');
  const [horasSemana, setHorasSemana] = useState('0h 0m');
  const [horaActual, setHoraActual] = useState(new Date());

  // NUEVO ESTADO: Para controlar el tipo de fichaje
  const [tipoFichaje, setTipoFichaje] = useState<'PRESENCIAL' | 'TELETRABAJO'>('PRESENCIAL');

  const cargarDatos = async () => {
    try {
      const hoyStr = new Date().toISOString().split('T')[0];
      const estado = await fichajeService.obtenerEstado();
      setEstaTrabajando(estado);
      const lista = await fichajeService.obtenerFichajesHoy();
      setFichajesHoy(lista);
      const reporteHoy = await fichajeService.obtenerReporte(hoyStr, hoyStr);
      setHorasHoy(reporteHoy.tiempoFormateado);
      const haceSieteDias = new Date();
      haceSieteDias.setDate(haceSieteDias.getDate() - 7);
      const inicioSemana = haceSieteDias.toISOString().split('T')[0];
      const reporteSemana = await fichajeService.obtenerReporte(inicioSemana, hoyStr);
      setHorasSemana(reporteSemana.tiempoFormateado);
    } catch (error) {
      console.error('Error cargando datos', error);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      await cargarDatos();
    };
    inicializar();
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFichar = async () => {
    try {
      if (!estaTrabajando) {
        // ENVIAMOS EL TIPO SELECCIONADO AL BACKEND
        await fichajeService.ficharEntrada(tipoFichaje);
        setEstaTrabajando(true);
        toast.success(`¡Entrada registrada (${tipoFichaje.toLowerCase()})!`);
      } else {
        await fichajeService.ficharSalida();
        setEstaTrabajando(false);
        toast.success('¡Salida registrada!');
      }
      await cargarDatos();
    } catch (error) {
      console.error('Error al fichar', error);
      toast.error('Hubo un error al registrar el fichaje.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Fichajes
          </h1>
          <p className="text-slate-500 mt-1">Gestiona tu jornada laboral y revisa tus registros.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div
            className={`absolute top-0 w-full h-2 ${estaTrabajando ? 'bg-emerald-500' : 'bg-slate-200'}`}
          ></div>

          {/* SELECTOR DE TIPO DE FICHAJE (Oculto si ya está trabajando) */}
          {!estaTrabajando && (
            <div className="mt-4 mb-2 bg-slate-100 p-1.5 rounded-xl flex items-center w-full max-w-[240px]">
              <button
                onClick={() => setTipoFichaje('PRESENCIAL')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${tipoFichaje === 'PRESENCIAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 className="w-4 h-4" /> Oficina
              </button>
              <button
                onClick={() => setTipoFichaje('TELETRABAJO')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${tipoFichaje === 'TELETRABAJO' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Home className="w-4 h-4" /> Remoto
              </button>
            </div>
          )}

          <div className={`${estaTrabajando ? 'mb-8 mt-2' : 'mb-8 mt-4'}`}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {estaTrabajando ? 'Turno en curso' : 'Fuera de turno'}
            </h2>
            <div className="text-5xl font-light text-slate-900 font-mono tracking-tighter">
              {horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-slate-500 mt-2">
              {horaActual.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>

          <button
            onClick={handleFichar}
            className={`group flex flex-col items-center justify-center w-48 h-48 rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
              estaTrabajando
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
            }`}
          >
            {estaTrabajando ? (
              <>
                <Square className="w-14 h-14 mb-2 fill-current transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold tracking-wide">Finalizar</span>
              </>
            ) : (
              <>
                <Play className="w-14 h-14 mb-2 fill-current transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold tracking-wide">Iniciar</span>
              </>
            )}
          </button>
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Horas hoy</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{horasHoy}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Horas esta semana</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{horasSemana}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Fichajes de hoy</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Salida
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Tipo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fichajesHoy.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {new Date(f.fechaHoraEntrada).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {f.fechaHoraSalida ? (
                          new Date(f.fechaHoraSalida).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                            En curso...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1.5 w-max px-2.5 py-1 text-xs font-bold rounded-md ${f.tipo === 'TELETRABAJO' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}
                        >
                          {f.tipo === 'TELETRABAJO' ? (
                            <Home className="w-3.5 h-3.5" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                          {f.tipo === 'TELETRABAJO' ? 'Remoto' : 'Oficina'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {fichajesHoy.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                          <p>No hay fichajes registrados hoy</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
