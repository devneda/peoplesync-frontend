import { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Users, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { fichajeService } from '../services/fichajeService';
import { exportUtils } from '../utils/exportUtils';
import type { Usuario } from '../types';
import toast from 'react-hot-toast';

export default function Informes() {
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('');
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(''); // Formato YYYY-MM
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Cargamos los empleados que el usuario puede ver (su equipo o todos si es admin)
    usuarioService
      .obtenerMisEmpleados()
      .then(setEmpleados)
      .catch(() => toast.error('Error cargando empleados'));

    // Por defecto seleccionamos el mes actual
    const hoy = new Date();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    setMesSeleccionado(`${hoy.getFullYear()}-${mes}`);
  }, []);

  const manejarExportacion = async (formato: 'PDF' | 'EXCEL') => {
    if (!empleadoSeleccionado || !mesSeleccionado) {
      return toast.error('Selecciona un empleado y un mes');
    }

    setCargando(true);
    const toastId = toast.loading(`Generando ${formato}...`);

    try {
      const emp = empleados.find((e) => e.id === empleadoSeleccionado);
      if (!emp) throw new Error('Empleado no encontrado');

      // Calculamos el inicio y fin del mes seleccionado
      const [year, month] = mesSeleccionado.split('-');
      const fechaInicio = `${year}-${month}-01`;
      const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate();
      const fechaFin = `${year}-${month}-${ultimoDia}`;

      // Pedimos los fichajes al backend
      const fichajes = await fichajeService.obtenerFichajesEmpleado(emp.id, fechaInicio, fechaFin);

      if (fichajes.length === 0) {
        toast.dismiss(toastId);
        return toast.error(`No hay registros para ${emp.nombreCompleto} en este mes.`);
      }

      if (formato === 'PDF') {
        exportUtils.generarPDFRegistroHorario(emp, fichajes, mesSeleccionado);
      } else {
        exportUtils.generarExcelRegistroHorario(emp, fichajes, mesSeleccionado);
      }

      toast.success(`${formato} generado con éxito`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el informe', { id: toastId });
    } finally {
      setCargando(false);
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" /> Centro de Informes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Exporta registros legales de jornada para inspecciones o nóminas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* TARJETA DE EXPORTACIÓN DE JORNADA */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Registro de Jornada
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4" /> Seleccionar Empleado
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                value={empleadoSeleccionado}
                onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
              >
                <option value="">Elige un empleado de tu equipo...</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombreCompleto} ({emp.dni})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Mes del Reporte
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={cargando}
                onClick={() => manejarExportacion('PDF')}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 font-bold transition-all disabled:opacity-50 active:scale-95"
              >
                <Download className="w-6 h-6" /> Exportar PDF
              </button>
              <button
                disabled={cargando}
                onClick={() => manejarExportacion('EXCEL')}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-bold transition-all disabled:opacity-50 active:scale-95"
              >
                <FileSpreadsheet className="w-6 h-6" /> Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* FUTURA TARJETA PARA EXPORTAR LISTA DE EMPLEADOS */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Listado de Equipo</h2>
          </div>
          <p className="text-slate-500 font-medium">
            Exporta un resumen completo con los datos de contacto y estado de tu plantilla.
            (Próximamente)
          </p>
        </div>
      </div>
    </div>
  );
}
