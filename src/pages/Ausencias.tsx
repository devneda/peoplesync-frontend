import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  UploadCloud,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { ausenciaService } from '../services/ausenciaService';
import type { Ausencia } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Ausencias() {
  const [misAusencias, setMisAusencias] = useState<Ausencia[]>([]);
  const [cargando, setCargando] = useState(true);

  const [tipo, setTipo] = useState<'VACACIONES' | 'BAJA_MEDICA' | 'ASUNTOS_PROPIOS'>('VACACIONES');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const cargarAusencias = async () => {
    try {
      const data = await ausenciaService.obtenerMisAusencias();
      setMisAusencias(data);
    } catch (error) {
      console.error('Error al cargar ausencias:', error);
      toast.error('Error al cargar tu historial de ausencias');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAusencias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      toast.error('Las fechas son obligatorias');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('tipo', tipo);
      formData.append('fechaInicio', fechaInicio);
      formData.append('fechaFin', fechaFin);
      if (comentarios) formData.append('comentarios', comentarios);
      if (archivo) formData.append('documento', archivo);

      await ausenciaService.solicitar(formData);
      toast.success('¡Solicitud enviada correctamente!');

      setTipo('VACACIONES');
      setFechaInicio('');
      setFechaFin('');
      setComentarios('');
      setArchivo(null);
      cargarAusencias();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || 'Error al enviar la solicitud');
      } else {
        toast.error('Error al enviar la solicitud');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          Ausencias y Vacaciones
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Solicita días libres o notifica bajas médicas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 self-start transition-colors">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Nueva Solicitud</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tipo de Ausencia
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Ausencia['tipo'])}
              >
                <option value="VACACIONES">Vacaciones</option>
                <option value="BAJA_MEDICA">Baja Médica</option>
                <option value="ASUNTOS_PROPIOS">Asuntos Propios</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Desde
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Hasta
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Comentarios (Opcional)
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Motivo o detalles adicionales..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Justificante (PDF/IMG)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {archivo ? archivo.name : 'Haz clic o arrastra tu archivo aquí'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none mt-2 active:scale-[0.98]"
            >
              Enviar Solicitud
            </button>
          </form>
        </div>

        {/* HISTORIAL */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Mi Historial</h3>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Justificante
                  </th>
                  <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                      Cargando datos...
                    </td>
                  </tr>
                ) : misAusencias.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-xl"
                    >
                      No tienes ausencias registradas
                    </td>
                  </tr>
                ) : (
                  misAusencias.map((aus) => (
                    <tr
                      key={aus.id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <td className="px-4 py-4 rounded-l-xl">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {new Date(aus.fechaInicio).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          al {new Date(aus.fechaFin).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-bold">
                          {aus.tipo === 'BAJA_MEDICA'
                            ? 'Baja Médica'
                            : aus.tipo === 'ASUNTOS_PROPIOS'
                              ? 'Asuntos Propios'
                              : 'Vacaciones'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {aus.rutaJustificante ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg w-max">
                            <FileText className="w-3.5 h-3.5" /> Adjunto
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm font-bold">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 rounded-r-xl">
                        {aus.estado === 'APROBADA' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada
                          </span>
                        )}
                        {aus.estado === 'RECHAZADA' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Rechazada
                          </span>
                        )}
                        {aus.estado === 'PENDIENTE' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> Pendiente
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
    </div>
  );
}
