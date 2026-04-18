import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Play,
  Square,
  Clock,
  Calendar,
  AlertCircle,
  Building2,
  Home,
  Coffee,
  PlusCircle,
} from 'lucide-react';
import { fichajeService } from '../services/fichajeService';
import { type Fichaje } from '../types';

export default function Fichajes() {
  const [estaTrabajando, setEstaTrabajando] = useState(false);
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [horasHoy, setHorasHoy] = useState('0h 0m');
  const [horasSemana, setHorasSemana] = useState('0h 0m');
  const [horaActual, setHoraActual] = useState(new Date());

  // NUEVO: Estado para el contador en vivo
  const [minutosActivos, setMinutosActivos] = useState(0);

  const [tipoFichaje, setTipoFichaje] = useState<'PRESENCIAL' | 'TELETRABAJO'>('PRESENCIAL');
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const formatearFechaLocal = (fecha: Date) => {
        const offset = fecha.getTimezoneOffset() * 60000;
        return new Date(fecha.getTime() - offset).toISOString().split('T')[0];
      };

      const hoyStr = formatearFechaLocal(new Date());
      const estado = await fichajeService.obtenerEstado();
      setEstaTrabajando(estado);

      const lista = await fichajeService.obtenerFichajesHoy();
      setFichajesHoy(lista);

      const reporteHoy = await fichajeService.obtenerReporte(hoyStr, hoyStr);
      setHorasHoy(reporteHoy.tiempoFormateado);

      const haceSieteDias = new Date();
      haceSieteDias.setDate(haceSieteDias.getDate() - 7);
      const inicioSemana = formatearFechaLocal(haceSieteDias);

      const reporteSemana = await fichajeService.obtenerReporte(inicioSemana, hoyStr);
      setHorasSemana(reporteSemana.tiempoFormateado);
    } catch (error) {
      console.error('Error cargando datos', error);
      toast.error('Error al sincronizar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // LÓGICA DEL CONTADOR EN VIVO
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (estaTrabajando) {
      interval = setInterval(() => {
        const turnoAbierto = fichajesHoy.find((f) => !f.fechaHoraSalida);
        if (turnoAbierto) {
          const entradaMs = new Date(turnoAbierto.fechaHoraEntrada).getTime();
          const ahoraMs = new Date().getTime();
          const diffMinutos = Math.floor((ahoraMs - entradaMs) / 60000);
          setMinutosActivos(diffMinutos);
        }
      }, 10000); // Actualiza cada 10 segundos para no saturar
    } else {
      setMinutosActivos(0);
    }
    return () => clearInterval(interval);
  }, [estaTrabajando, fichajesHoy]);

  // FUNCIÓN PARA CALCULAR EL TOTAL EN VIVO
  const obtenerTotalVisual = (textoBase: string) => {
    if (minutosActivos === 0) return textoBase;

    const match = textoBase.match(/(\d+)h\s*(\d+)m/);
    let horas = 0,
      minutos = 0;
    if (match) {
      horas = parseInt(match[1], 10);
      minutos = parseInt(match[2], 10);
    }

    const totalMinutos = horas * 60 + minutos + minutosActivos;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;

    return `${nuevasHoras}h ${nuevosMinutos}m`;
  };

  const handleFichar = async (esPausa: boolean = false) => {
    try {
      if (!estaTrabajando) {
        await fichajeService.ficharEntrada(tipoFichaje);
        setEstaTrabajando(true);
        toast.success(`¡Entrada registrada (${tipoFichaje.toLowerCase()})!`);
      } else {
        await fichajeService.ficharSalida();
        setEstaTrabajando(false);
        if (esPausa) {
          toast.success('¡Pausa registrada! Disfruta del café ☕');
        } else {
          toast.success('¡Salida registrada! Buen trabajo.');
        }
      }
      await cargarDatos();
      setMinutosActivos(0); // Reseteamos el contador en vivo
    } catch (error) {
      console.error('Error al fichar', error);
      toast.error('Hubo un error al registrar el fichaje.');
    }
  };

  if (cargando)
    return (
      <div className="animate-pulse h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl m-8"></div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Fichajes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestiona tu jornada laboral y revisa tus registros.
          </p>
        </div>
        <button
          onClick={() => toast('Función de fichaje manual en desarrollo', { icon: '🛠️' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Añadir Fichaje Olvidado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL DE CONTROL (Izquierda) */}
        <div className="col-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center relative overflow-hidden transition-colors">
          <div
            className={`absolute top-0 w-full h-2 ${estaTrabajando ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
          ></div>

          {!estaTrabajando && (
            <div className="mt-4 mb-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl flex items-center w-full max-w-[240px] transition-colors">
              <button
                onClick={() => setTipoFichaje('PRESENCIAL')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${tipoFichaje === 'PRESENCIAL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                <Building2 className="w-4 h-4" /> Oficina
              </button>
              <button
                onClick={() => setTipoFichaje('TELETRABAJO')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${tipoFichaje === 'TELETRABAJO' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                <Home className="w-4 h-4" /> Remoto
              </button>
            </div>
          )}

          <div className={`${estaTrabajando ? 'mb-8 mt-6' : 'mb-8 mt-4'}`}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              {estaTrabajando ? 'Turno en curso' : 'Fuera de turno'}
            </h2>
            <div className="text-6xl font-light text-slate-800 dark:text-white font-mono tracking-tighter">
              {horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {horaActual.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            {/* Pequeño indicador del tiempo actual de esta sesión */}
            {estaTrabajando && minutosActivos > 0 && (
              <div className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                + {minutosActivos} min. en esta sesión
              </div>
            )}
          </div>

          {/* BOTONERA DINÁMICA */}
          <div className="flex items-center justify-center gap-4 w-full h-48">
            {!estaTrabajando ? (
              <button
                onClick={() => handleFichar(false)}
                className="group flex flex-col items-center justify-center w-48 h-48 rounded-full text-white bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Play className="w-14 h-14 mb-2 fill-current pl-2 transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold tracking-wide">Iniciar</span>
              </button>
            ) : (
              <div className="flex gap-4 w-full justify-center px-4 animate-in zoom-in duration-300">
                <button
                  onClick={() => handleFichar(true)}
                  className="group flex flex-col items-center justify-center w-full aspect-square max-w-[140px] rounded-3xl text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 shadow-lg transition-all duration-300 active:scale-95"
                >
                  <Coffee className="w-10 h-10 mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                  <span className="text-sm font-bold tracking-wide">Pausar</span>
                </button>
                <button
                  onClick={() => handleFichar(false)}
                  className="group flex flex-col items-center justify-center w-full aspect-square max-w-[140px] rounded-3xl text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all duration-300 active:scale-95"
                >
                  <Square className="w-10 h-10 mb-2 fill-current transition-transform group-hover:scale-110" />
                  <span className="text-sm font-bold tracking-wide">Finalizar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN Y TABLA (Derecha) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5 transition-colors">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Horas hoy
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                  {obtenerTotalVisual(horasHoy)}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5 transition-colors">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Esta semana
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                  {obtenerTotalVisual(horasSemana)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden transition-colors">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Registro Diario</h3>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tipo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fichajesHoy.map((f) => (
                    <tr
                      key={f.id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-bold rounded-l-xl">
                        {new Date(f.fechaHoraEntrada).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {f.fechaHoraSalida ? (
                          new Date(f.fechaHoraSalida).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            En curso
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 rounded-r-xl">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${f.tipo === 'TELETRABAJO' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}
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
                      <td
                        colSpan={3}
                        className="px-4 py-12 text-center rounded-xl bg-slate-50 dark:bg-slate-800/20"
                      >
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                          <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                          <p className="font-medium">No hay registros de hoy</p>
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
