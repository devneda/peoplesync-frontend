import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  UploadCloud,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { ausenciaService } from '../services/ausenciaService';
import type { Ausencia } from '../types';
import toast from 'react-hot-toast';

export default function Ausencias() {
  const [misAusencias, setMisAusencias] = useState<Ausencia[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del Formulario
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          Ausencias y Vacaciones
        </h1>
        <p className="text-slate-500 mt-1">Solicita días libres o notifica bajas médicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: Formulario de Solicitud */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 self-start">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Nueva Solicitud</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Ausencia</label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                <label className="text-sm font-medium text-slate-700">Desde</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hasta</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Comentarios (Opcional)</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Motivo o detalles adicionales..."
              />
            </div>

            {/* Zona de Subida de Archivos */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Justificante (PDF/IMG)</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-600 font-medium">
                    {archivo ? archivo.name : 'Haz clic o arrastra tu archivo aquí'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2"
            >
              Enviar Solicitud
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Historial de Ausencias */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800">Mi Historial</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Justificante
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Cargando datos...
                    </td>
                  </tr>
                ) : misAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No tienes ausencias registradas
                    </td>
                  </tr>
                ) : (
                  misAusencias.map((aus) => (
                    <tr key={aus.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(aus.fechaInicio).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          al {new Date(aus.fechaFin).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">
                          {aus.tipo === 'BAJA_MEDICA'
                            ? 'Baja Médica'
                            : aus.tipo === 'ASUNTOS_PROPIOS'
                              ? 'Asuntos Propios'
                              : 'Vacaciones'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {aus.rutaJustificante ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-max">
                            <FileText className="w-3.5 h-3.5" /> Adjunto
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {aus.estado === 'APROBADA' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada
                          </span>
                        )}
                        {aus.estado === 'RECHAZADA' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
                            <XCircle className="w-3.5 h-3.5" /> Rechazada
                          </span>
                        )}
                        {aus.estado === 'PENDIENTE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
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
