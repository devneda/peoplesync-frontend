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
  X,
  Save,
} from 'lucide-react';
import { fichajeService } from '../services/fichajeService';
import { type Fichaje } from '../types';

export default function Fichajes() {
  const [estaTrabajando, setEstaTrabajando] = useState(false);
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [horasHoy, setHorasHoy] = useState('0h 0m');
  const [horasSemana, setHorasSemana] = useState('0h 0m');
  const [horaActual, setHoraActual] = useState(new Date());

  // Estado para el contador en vivo
  const [minutosActivos, setMinutosActivos] = useState(0);

  const [tipoFichaje, setTipoFichaje] = useState<'PRESENCIAL' | 'TELETRABAJO'>('PRESENCIAL');
  const [cargando, setCargando] = useState(true);

  // ESTADOS PARA FICHAJE MANUAL
  const [mostrarModalManual, setMostrarModalManual] = useState(false);
  const [fechaManual, setFechaManual] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntradaManual, setHoraEntradaManual] = useState('09:00');
  const [horaSalidaManual, setHoraSalidaManual] = useState('18:00');
  const [tipoManual, setTipoManual] = useState<'PRESENCIAL' | 'TELETRABAJO'>('PRESENCIAL');
  const [enviandoManual, setEnviandoManual] = useState(false);

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
      }, 10000);
    } else {
      setMinutosActivos(0);
    }
    return () => clearInterval(interval);
  }, [estaTrabajando, fichajesHoy]);

  const obtenerTotalVisual = (textoBase: string) => {
    if (minutosActivos === 0) return textoBase;
    const match = textoBase.match(/(\d+)h\s*(\d+)m/);
    let horas = 0, minutos = 0;
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
      setMinutosActivos(0);
    } catch (error) {
      console.error('Error al fichar', error);
      toast.error('Hubo un error al registrar el fichaje.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoManual(true);
    try {
      const entrada = `${fechaManual}T${horaEntradaManual}:00`;
      const salida = `${fechaManual}T${horaSalidaManual}:00`;
      
      await fichajeService.registrarManual(entrada, salida, tipoManual);
      
      toast.success('Fichaje manual registrado correctamente');
      setMostrarModalManual(false);
      cargarDatos();
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar el fichaje manual. Revisa las horas.');
    } finally {
      setEnviandoManual(false);
    }
  };

  if (cargando)
    return (
      <div className="animate-pulse h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl m-8"></div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            Control de Fichajes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Registra tu jornada y mantén tu historial al día.
          </p>
        </div>
        <button
          onClick={() => setMostrarModalManual(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" /> Añadir Fichaje Olvidado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL DE CONTROL (Izquierda) */}
        <div className="col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center relative overflow-hidden transition-colors">
          <div
            className={`absolute top-0 w-full h-2 ${estaTrabajando ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-800'}`}
          ></div>

          {!estaTrabajando && (
            <div className="mt-4 mb-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center w-full max-w-[240px] transition-colors border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTipoFichaje('PRESENCIAL')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${tipoFichaje === 'PRESENCIAL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                <Building2 className="w-4 h-4" /> Oficina
              </button>
              <button
                onClick={() => setTipoFichaje('TELETRABAJO')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${tipoFichaje === 'TELETRABAJO' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                <Home className="w-4 h-4" /> Remoto
              </button>
            </div>
          )}

          <div className={`${estaTrabajando ? 'mb-8 mt-6' : 'mb-8 mt-4'}`}>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              {estaTrabajando ? 'Turno en curso' : 'Fuera de turno'}
            </h2>
            <div className="text-7xl font-light text-slate-800 dark:text-white font-mono tracking-tighter">
              {horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-2 font-bold bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full inline-block text-sm">
              {horaActual.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            {estaTrabajando && minutosActivos > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Sincronizando: +{minutosActivos} min
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 w-full h-48">
            {!estaTrabajando ? (
              <button
                onClick={() => handleFichar(false)}
                className="group flex flex-col items-center justify-center w-48 h-48 rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-200 dark:shadow-none transition-all duration-500 hover:scale-105 active:scale-95 border-8 border-white dark:border-slate-800"
              >
                <Play className="w-16 h-16 mb-1 fill-current pl-2 transition-transform group-hover:scale-110" />
                <span className="text-xl font-black tracking-widest uppercase">Entrada</span>
              </button>
            ) : (
              <div className="flex gap-6 w-full justify-center px-4 animate-in zoom-in duration-300">
                <button
                  onClick={() => handleFichar(true)}
                  className="group flex flex-col items-center justify-center w-full aspect-square max-w-[140px] rounded-[2rem] text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 shadow-xl border border-amber-200/50 dark:border-amber-800/50 transition-all duration-300 active:scale-95"
                >
                  <Coffee className="w-12 h-12 mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                  <span className="text-sm font-black tracking-widest uppercase">Pausa</span>
                </button>
                <button
                  onClick={() => handleFichar(false)}
                  className="group flex flex-col items-center justify-center w-full aspect-square max-w-[140px] rounded-[2rem] text-white bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 dark:shadow-none transition-all duration-300 active:scale-95 border-4 border-white dark:border-slate-800"
                >
                  <Square className="w-12 h-12 mb-2 fill-current transition-transform group-hover:scale-110" />
                  <span className="text-sm font-black tracking-widest uppercase">Salida</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN Y TABLA (Derecha) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6 transition-all hover:shadow-md">
              <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl">
                <Clock className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Horas hoy
                </p>
                <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">
                  {obtenerTotalVisual(horasHoy)}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6 transition-all hover:shadow-md">
              <div className="p-5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-3xl">
                <Calendar className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Esta semana
                </p>
                <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">
                  {obtenerTotalVisual(horasSemana)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden transition-colors">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-white text-xl">Actividad Reciente</h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Solo Hoy
              </span>
            </div>

            <div className="overflow-x-auto p-6">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Entrada
                    </th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Salida
                    </th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Modalidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fichajesHoy.map((f) => (
                    <tr
                      key={f.id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-5 text-base text-slate-800 dark:text-slate-200 font-black rounded-l-2xl border-y border-l border-transparent">
                        {new Date(f.fechaHoraEntrada).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-5 text-base text-slate-600 dark:text-slate-400 font-bold border-y border-transparent">
                        {f.fechaHoraSalida ? (
                          new Date(f.fechaHoraSalida).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            En curso
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 rounded-r-2xl border-y border-r border-transparent">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl ${f.tipo === 'TELETRABAJO' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}
                        >
                          {f.tipo === 'TELETRABAJO' ? (
                            <Home className="w-4 h-4" />
                          ) : (
                            <Building2 className="w-4 h-4" />
                          )}
                          {f.tipo === 'TELETRABAJO' ? 'REMOTO' : 'OFICINA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {fichajesHoy.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-16 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                          <p className="font-bold text-lg">No se han registrado turnos hoy</p>
                          <p className="text-sm font-medium opacity-60">Usa el botón central para empezar</p>
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

      {/* MODAL FICHAJE MANUAL (Estilo Premium) */}
      {mostrarModalManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 transition-all scale-in-center">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Registro Manual</h3>
                  <p className="text-sm font-bold text-slate-400">Corrige un olvido en tu historial</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalManual(false)}
                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha del registro</label>
                <input
                  type="date"
                  required
                  value={fechaManual}
                  onChange={(e) => setFechaManual(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Entrada</label>
                  <input
                    type="time"
                    required
                    value={horaEntradaManual}
                    onChange={(e) => setHoraEntradaManual(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Salida</label>
                  <input
                    type="time"
                    required
                    value={horaSalidaManual}
                    onChange={(e) => setHoraSalidaManual(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Modalidad de trabajo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoManual('PRESENCIAL')}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border-2 transition-all ${tipoManual === 'PRESENCIAL' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                  >
                    <Building2 className="w-5 h-5" /> Oficina
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoManual('TELETRABAJO')}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border-2 transition-all ${tipoManual === 'TELETRABAJO' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-600 dark:text-purple-400' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                  >
                    <Home className="w-5 h-5" /> Remoto
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={enviandoManual}
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {enviandoManual ? 'Procesando...' : <><Save className="w-6 h-6" /> Guardar Fichaje</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
