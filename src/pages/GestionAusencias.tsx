import { useState, useEffect } from 'react';
import { CalendarCheck, Check, X, FileText, User, MessageSquare } from 'lucide-react';
import { ausenciaService } from '../services/ausenciaService';
import type { Ausencia } from '../types';
import toast from 'react-hot-toast';

export default function GestionAusencias() {
  const [pendientes, setPendientes] = useState<Ausencia[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarPendientes = async () => {
    try {
      const data = await ausenciaService.obtenerPendientes();
      setPendientes(data);
    } catch (error) {
      console.error('Error al cargar ausencias pendientes:', error);
      toast.error('Error al cargar solicitudes pendientes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const handleDecision = async (id: string, estado: 'APROBADA' | 'RECHAZADA') => {
    try {
      await ausenciaService.actualizarEstado(id, estado);
      toast.success(estado === 'APROBADA' ? 'Solicitud aprobada' : 'Solicitud rechazada');
      cargarPendientes();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('No se pudo procesar la decisión');
    }
  };

  const verDocumento = async (id: string) => {
    try {
      const toastId = toast.loading('Abriendo documento...');

      // 1. Descargamos el archivo seguro con nuestro token JWT
      const blob = await ausenciaService.descargarDocumento(id);

      // 2. Creamos una URL temporal en la memoria del navegador
      const urlTemporal = window.URL.createObjectURL(blob);

      toast.dismiss(toastId);

      // 3. Abrimos esa URL temporal en una pestaña nueva
      window.open(urlTemporal, '_blank');

      // 4. Limpiamos la memoria después de un ratito
      setTimeout(() => window.URL.revokeObjectURL(urlTemporal), 10000);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      toast.error('No se pudo cargar el documento justificativo');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-blue-600" />
          Gestión de Ausencias
        </h1>
        <p className="text-slate-500 mt-1">Revisa y procesa las solicitudes de tu equipo.</p>
      </div>

      <div className="grid gap-4">
        {cargando ? (
          <div className="text-center py-12 text-slate-400">Cargando solicitudes...</div>
        ) : pendientes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Check className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <p className="text-lg font-medium text-slate-600">¡Todo al día!</p>
            <p className="text-slate-400">No hay solicitudes pendientes de revisión.</p>
          </div>
        ) : (
          pendientes.map((aus) => (
            <div
              key={aus.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-lg">
                      {aus.usuarioNombre || 'Empleado Desconocido'}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md uppercase">
                      Nuevo
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">
                    Solicitud de {aus.tipo.replace('_', ' ')}
                  </p>
                  <p className="text-slate-600 font-medium mt-1">
                    Del{' '}
                    <span className="text-slate-900">
                      {new Date(aus.fechaInicio).toLocaleDateString()}
                    </span>{' '}
                    al{' '}
                    <span className="text-slate-900">
                      {new Date(aus.fechaFin).toLocaleDateString()}
                    </span>
                  </p>
                  {aus.comentarios && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-2">
                      <MessageSquare className="w-4 h-4" /> "{aus.comentarios}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {aus.rutaJustificante && (
                  <button
                    onClick={() => verDocumento(aus.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
                  >
                    <FileText className="w-4 h-4" /> Justificante
                  </button>
                )}
                <button
                  onClick={() => handleDecision(aus.id, 'RECHAZADA')}
                  className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  title="Rechazar"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleDecision(aus.id, 'APROBADA')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200"
                >
                  <Check className="w-5 h-5" /> Aprobar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
