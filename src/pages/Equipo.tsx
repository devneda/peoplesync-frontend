import { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Fingerprint,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Clock,
  ArrowLeft,
  UserCircle,
  Edit,
  Save,
  Briefcase,
  CalendarDays,
} from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { fichajeService } from '../services/fichajeService';
import { getRolFromToken } from '../utils/auth';
import type { Usuario, ReporteHoras, Fichaje } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Equipo() {
  const userRole = getRolFromToken();
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del Modal
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Usuario | null>(null);
  const [reporteModal, setReporteModal] = useState<ReporteHoras | null>(null);
  const [fichajesModal, setFichajesModal] = useState<Fichaje[]>([]);
  const [cargandoModal, setCargandoModal] = useState(false);

  const [tabActiva, setTabActiva] = useState<'HORARIO' | 'PERFIL'>('HORARIO');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Usuario>>({});

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

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const verDetalles = async (empleado: Usuario) => {
    setEmpleadoSeleccionado(empleado);
    setTabActiva('HORARIO');
    setModoEdicion(false);
    setFormData(empleado);
    setCargandoModal(true);

    try {
      const hoyStr = new Date().toISOString().split('T')[0];
      const haceSieteDias = new Date();
      haceSieteDias.setDate(haceSieteDias.getDate() - 7);
      const inicioSemanaStr = haceSieteDias.toISOString().split('T')[0];

      const [reporteSemana, fichajesHoy] = await Promise.all([
        fichajeService.obtenerReporteEmpleado(empleado.id, inicioSemanaStr, hoyStr),
        fichajeService.obtenerFichajesEmpleado(empleado.id, hoyStr, hoyStr),
      ]);

      setReporteModal(reporteSemana);
      setFichajesModal(fichajesHoy);
    } catch (error) {
      console.error('Error al obtener datos del empleado:', error);
      toast.error('Error al cargar la información');
      cerrarModal();
    } finally {
      setCargandoModal(false);
    }
  };

  const cerrarModal = () => {
    setEmpleadoSeleccionado(null);
    setReporteModal(null);
    setFichajesModal([]);
    setModoEdicion(false);
  };

  const handleGuardarEdicion = async () => {
    if (!empleadoSeleccionado) return;
    try {
      await usuarioService.actualizarUsuario(empleadoSeleccionado.id, formData);
      toast.success('Perfil actualizado correctamente');
      setModoEdicion(false);
      cargarEmpleados();
      setEmpleadoSeleccionado({ ...empleadoSeleccionado, ...formData } as Usuario);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar los cambios');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Mi Equipo
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestiona y visualiza a los empleados a tu cargo.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Empleados:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 ml-3">
            {empleados.length}
          </span>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Contacto
                </th>
                <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    Cargando equipo...
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-xl"
                  >
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      No tienes empleados a tu cargo
                    </p>
                  </td>
                </tr>
              ) : (
                empleados.map((emp) => (
                  <tr
                    key={emp.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors group"
                  >
                    <td className="px-4 py-4 rounded-l-xl">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {emp.nombreCompleto}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                          <Fingerprint className="w-3 h-3" /> <span>{emp.dni}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
                        <Mail className="w-4 h-4 text-slate-400" /> {emp.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield
                          className={`w-4 h-4 ${emp.rol === 'ADMIN' ? 'text-purple-500' : emp.rol === 'MANAGER' ? 'text-blue-500' : 'text-slate-400'}`}
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {emp.rol}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {emp.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right rounded-r-xl">
                      <button
                        onClick={() => verDetalles(emp)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                        title="Ver Detalles"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 transition-colors">
            {/* Cabecera del Modal */}
            <div className="px-6 pt-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                    {empleadoSeleccionado.nombreCompleto.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {empleadoSeleccionado.nombreCompleto}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <Briefcase className="w-4 h-4" /> {empleadoSeleccionado.rol}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Selector de Pestañas */}
              <div className="flex gap-6 mt-2">
                <button
                  onClick={() => setTabActiva('HORARIO')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${tabActiva === 'HORARIO' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Control Horario
                  </span>
                </button>
                <button
                  onClick={() => setTabActiva('PERFIL')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${tabActiva === 'PERFIL' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Ficha del Empleado
                  </span>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-slate-900">
              {/* PESTAÑA 1: HORARIO */}
              {tabActiva === 'HORARIO' &&
                (cargandoModal ? (
                  <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Cargando registros...
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5 flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Horas trabajadas (últimos 7 días)
                        </p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                          {reporteModal?.tiempoFormateado || '0h 0m'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-lg">
                        Registros de Hoy
                      </h4>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs">
                                Entrada
                              </th>
                              <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs">
                                Salida
                              </th>
                              <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {fichajesModal.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                  Sin registros hoy
                                </td>
                              </tr>
                            ) : (
                              fichajesModal.map((f) => (
                                <tr key={f.id} className="bg-white dark:bg-slate-900">
                                  <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">
                                    {new Date(f.fechaHoraEntrada).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-400">
                                    {f.fechaHoraSalida ? (
                                      new Date(f.fechaHoraSalida).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    ) : (
                                      <span className="text-slate-400">---</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    {!f.fechaHoraSalida ? (
                                      <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg">
                                        Activo
                                      </span>
                                    ) : (
                                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg">
                                        Finalizado
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
                ))}

              {/* PESTAÑA 2: FICHA DEL EMPLEADO */}
              {tabActiva === 'PERFIL' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  {userRole === 'ADMIN' && !modoEdicion && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setModoEdicion(true)}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Editar Ficha
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCircle className="w-4 h-4" /> Nombre Completo
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          value={formData.nombreCompleto || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, nombreCompleto: e.target.value })
                          }
                          className="w-full border border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {empleadoSeleccionado.nombreCompleto}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-4 h-4" /> Correo Electrónico
                      </label>
                      {modoEdicion ? (
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {empleadoSeleccionado.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4" /> Documento Identidad
                      </label>
                      {modoEdicion ? (
                        <input
                          type="text"
                          value={formData.dni || ''}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                          className="w-full border border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {empleadoSeleccionado.dni}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" /> Días Vacaciones / Año
                      </label>
                      {modoEdicion ? (
                        <input
                          type="number"
                          value={formData.diasVacacionesAnuales || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diasVacacionesAnuales: parseInt(e.target.value),
                            })
                          }
                          className="w-full border border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {empleadoSeleccionado.diasVacacionesAnuales} días
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Edición */}
                  {modoEdicion && (
                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setModoEdicion(false);
                          setFormData(empleadoSeleccionado);
                        }}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleGuardarEdicion}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                      >
                        <Save className="w-4 h-4" /> Guardar Cambios
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
