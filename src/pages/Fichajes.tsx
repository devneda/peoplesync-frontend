import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Play, Square, Clock, Calendar, AlertCircle } from 'lucide-react';
import { fichajeService } from '../services/fichajeService';
import { type Fichaje } from '../types';

export default function Fichajes() {
  const [estaTrabajando, setEstaTrabajando] = useState(false);
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [horasHoy, setHorasHoy] = useState('0h 0m');
  const [horasSemana, setHorasSemana] = useState('0h 0m');
  const [horaActual, setHoraActual] = useState(new Date());

  const cargarDatos = async () => {
    try {
      const hoyStr = new Date().toISOString().split('T')[0];

      // 1. Obtener estado actual
      const estado = await fichajeService.obtenerEstado();
      setEstaTrabajando(estado);

      // 2. Obtener lista de fichajes de hoy
      const lista = await fichajeService.obtenerFichajesHoy();
      setFichajesHoy(lista);

      // 3. Obtener reporte de hoy
      const reporteHoy = await fichajeService.obtenerReporte(hoyStr, hoyStr);
      setHorasHoy(reporteHoy.tiempoFormateado);

      // 4. Obtener reporte de la semana (simplificado: últimos 7 días)
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
        await fichajeService.ficharEntrada('PRESENCIAL');
        setEstaTrabajando(true);
        toast.success('¡Entrada registrada con éxito!');
      } else {
        await fichajeService.ficharSalida();
        setEstaTrabajando(false);
        toast.success('¡Salida registrada!');
      }

      // ¡Recargamos los datos para que la tabla y las horas se actualicen al instante!
      await cargarDatos();
    } catch (error) {
      console.error('Error al fichar', error);
      toast.error('Hubo un error al registrar el fichaje.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Control Horario</h1>
        <p className="text-slate-500 mt-1">Gestiona tu jornada laboral y revisa tus registros.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: Botón y Reloj */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div
            className={`absolute top-0 w-full h-2 ${estaTrabajando ? 'bg-emerald-500' : 'bg-slate-200'}`}
          ></div>

          <div className="mb-8 mt-2">
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

        {/* COLUMNA DERECHA: Resumen y Tabla */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* Tarjetas de Resumen Dinámicas */}
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

          {/* Tabla de Fichajes de Hoy */}
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
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                          {f.tipo}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Mensaje si no hay fichajes */}
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
