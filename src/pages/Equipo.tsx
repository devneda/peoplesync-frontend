import { useState, useEffect } from 'react';
import { Users, Mail, Fingerprint, Shield, CheckCircle2, XCircle, Eye, X, Clock } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { fichajeService } from '../services/fichajeService';
import type { Usuario, ReporteHoras, Fichaje } from '../types';
import toast from 'react-hot-toast';

export default function Equipo() {
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Reporte
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Usuario | null>(null);
  const [reporteModal, setReporteModal] = useState<ReporteHoras | null>(null);
  const [fichajesModal, setFichajesModal] = useState<Fichaje[]>([]);
  const [cargandoModal, setCargandoModal] = useState(false);

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const data = await usuarioService.obtenerMisEmpleados();
        setEmpleados(data);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        toast.error('No se pudo cargar la lista del equipo');
      } finally {
        setCargando(false);
      }
    };
    cargarEmpleados();
  }, []);

  // Función para abrir el modal y pedir los datos de ese empleado
  const verReporte = async (empleado: Usuario) => {
    setEmpleadoSeleccionado(empleado);
    setCargandoModal(true);
    try {
      const hoyStr = new Date().toISOString().split('T')[0];
      const haceSieteDias = new Date();
      haceSieteDias.setDate(haceSieteDias.getDate() - 7);
      const inicioSemanaStr = haceSieteDias.toISOString().split('T')[0];

      const [reporteSemana, fichajesHoy] = await Promise.all([
        fichajeService.obtenerReporteEmpleado(empleado.id, inicioSemanaStr, hoyStr),
        fichajeService.obtenerFichajesEmpleado(empleado.id, hoyStr, hoyStr)
      ]);

      setReporteModal(reporteSemana);
      setFichajesModal(fichajesHoy);
    } catch (error) {
      console.error('Error al obtener datos del empleado:', error);
      toast.error('Error al obtener los fichajes del empleado');
      cerrarModal();
    } finally {
      setCargandoModal(false);
    }
  };

  const cerrarModal = () => {
    setEmpleadoSeleccionado(null);
    setReporteModal(null);
    setFichajesModal([]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Mi Equipo
          </h1>
          <p className="text-slate-500 mt-1">Gestiona y visualiza a los empleados a tu cargo.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Empleados: </span>
          <span className="text-lg font-bold text-blue-600 ml-2">{empleados.length}</span>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Cargando equipo...</td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-lg font-medium text-slate-600">No tienes empleados a tu cargo</p>
                  </td>
                </tr>
              ) : (
                empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{emp.nombreCompleto}</span>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                          <Fingerprint className="w-3 h-3" /> <span>{emp.dni}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" /> {emp.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`w-4 h-4 ${emp.rol === 'ADMIN' ? 'text-purple-500' : emp.rol === 'MANAGER' ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">{emp.rol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Botón Mágico */}
                      <button 
                        onClick={() => verReporte(emp)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Control Horario"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FLOTANTE --- */}
      {empleadoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Control Horario</h3>
                <p className="text-sm text-slate-500">{empleadoSeleccionado.nombreCompleto}</p>
              </div>
              <button onClick={cerrarModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {cargandoModal ? (
                <div className="py-12 text-center text-slate-500">Cargando datos...</div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Tarjeta de Resumen (Últimos 7 días) */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Horas trabajadas (últimos 7 días)</p>
                      <p className="text-2xl font-bold text-blue-900">{reporteModal?.tiempoFormateado || '0h 0m'}</p>
                    </div>
                  </div>

                  {/* Tabla de Fichajes de HOY */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Registros de Hoy</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-medium text-slate-500">Entrada</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Salida</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fichajesModal.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Sin registros hoy</td></tr>
                          ) : (
                            fichajesModal.map(f => (
                              <tr key={f.id}>
                                <td className="px-4 py-3">{new Date(f.fechaHoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-4 py-3">
                                  {f.fechaHoraSalida 
                                    ? new Date(f.fechaHoraSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : <span className="text-slate-400">---</span>
                                  }
                                </td>
                                <td className="px-4 py-3">
                                  {!f.fechaHoraSalida 
                                    ? <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Trabajando</span>
                                    : <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Finalizado</span>
                                  }
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}