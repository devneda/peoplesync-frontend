import { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  MapPin,
  CalendarDays,
  Clock,
  Plus,
  Save,
  X,
  Repeat, // <-- NUEVO ICONO AÑADIDO
} from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { estructuraService } from '../services/estructuraService';
// IMPORTANTE: Asegúrate de tener PatronRotacion exportado en tu archivo de tipos
import type { Delegacion, UsuarioRequest, Horario, Calendario, PatronRotacion } from '../types';
import toast from 'react-hot-toast';

type AdminTab = 'EMPLEADOS' | 'DELEGACIONES' | 'CALENDARIOS' | 'HORARIOS' | 'PATRONES';

export default function AdminUsuarios() {
  const [tabActiva, setTabActiva] = useState<AdminTab>('EMPLEADOS');

  // Estados de datos
  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [calendarios, setCalendarios] = useState<Calendario[]>([]);
  const [patrones, setPatrones] = useState<PatronRotacion[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de "Modo Creación"
  const [creandoDelegacion, setCreandoDelegacion] = useState(false);
  const [creandoHorario, setCreandoHorario] = useState(false);
  const [creandoCalendario, setCreandoCalendario] = useState(false);
  const [creandoPatron, setCreandoPatron] = useState(false);

  // --- Formularios ---
  const [formEmpleado, setFormEmpleado] = useState<UsuarioRequest>({
    dni: '',
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'USER',
    delegacionId: '',
    diasVacacionesAnuales: 22,
  });

  const [formDelegacion, setFormDelegacion] = useState({ nombre: '', direccion: '' });

  const [formHorario, setFormHorario] = useState({
    nombre: '',
    horaEntradaEsperada: '08:00',
    horaSalidaEsperada: '16:00',
    horasSemanales: 40,
    minutosDescanso: 30,
  });

  const [formCalendario, setFormCalendario] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    incluyeSabados: false,
    incluyeDomingos: false,
    delegacionId: '',
  });

  const [formPatron, setFormPatron] = useState({
    nombre: '',
    descripcion: '',
    semanasCiclo: 2,
    turnos: [
      { semanaOrden: 1, horarioId: '' },
      { semanaOrden: 2, horarioId: '' },
    ],
  });

  const cargarDatosGlobales = async () => {
    setCargando(true);
    try {
      const [dels, hor, cals, pats] = await Promise.all([
        estructuraService.obtenerDelegaciones(),
        estructuraService.obtenerHorarios(),
        estructuraService.obtenerCalendarios(),
        estructuraService.obtenerPatrones(),
      ]);
      setDelegaciones(dels);
      setHorarios(hor);
      setCalendarios(cals);
      setPatrones(pats);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al cargar la configuración');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosGlobales();
  }, []);

  // --- Handlers (Manejadores de envíos) ---

  const handleSubmitEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usuarioService.crearUsuario(formEmpleado);
      toast.success('¡Empleado registrado correctamente!');
      setFormEmpleado({
        dni: '',
        nombreCompleto: '',
        email: '',
        password: '',
        rol: 'USER',
        delegacionId: '',
        diasVacacionesAnuales: 22,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear empleado');
    }
  };

  const handleSubmitDelegacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearDelegacion(formDelegacion);
      toast.success('Oficina creada con éxito');
      setFormDelegacion({ nombre: '', direccion: '' });
      setCreandoDelegacion(false);
      cargarDatosGlobales();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear la delegación');
    }
  };

  const handleSubmitHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formHorario,
        horaEntradaEsperada:
          formHorario.horaEntradaEsperada.length === 5
            ? `${formHorario.horaEntradaEsperada}:00`
            : formHorario.horaEntradaEsperada,
        horaSalidaEsperada:
          formHorario.horaSalidaEsperada.length === 5
            ? `${formHorario.horaSalidaEsperada}:00`
            : formHorario.horaSalidaEsperada,
      };

      await estructuraService.crearHorario(dataToSend);
      toast.success('Turno guardado correctamente');
      setCreandoHorario(false);
      cargarDatosGlobales();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar el horario');
    }
  };

  const handleSubmitCalendario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCalendario.delegacionId) {
      toast.error('Debes seleccionar una delegación');
      return;
    }
    try {
      const { delegacionId, ...datosCalendario } = formCalendario;
      await estructuraService.crearCalendario(delegacionId, datosCalendario);
      toast.success('Calendario base creado con éxito');
      setFormCalendario({
        nombre: '',
        anio: new Date().getFullYear(),
        incluyeSabados: false,
        incluyeDomingos: false,
        delegacionId: '',
      });
      setCreandoCalendario(false);
      cargarDatosGlobales();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar el calendario');
    }
  };

  const handleSubmitPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPatron.turnos.some((t) => !t.horarioId)) {
      toast.error('Debes asignar un horario a todas las semanas del ciclo');
      return;
    }
    try {
      await estructuraService.crearPatron(formPatron);
      toast.success('Patrón de rotación creado con éxito');
      setCreandoPatron(false);
      setFormPatron({
        nombre: '',
        descripcion: '',
        semanasCiclo: 2,
        turnos: [
          { semanaOrden: 1, horarioId: '' },
          { semanaOrden: 2, horarioId: '' },
        ],
      });
      cargarDatosGlobales();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar el patrón');
    }
  };

  const handleCambioSemanasCiclo = (semanas: number) => {
    const nuevosTurnos = Array.from({ length: semanas }, (_, i) => ({
      semanaOrden: i + 1,
      horarioId: formPatron.turnos[i]?.horarioId || '',
    }));
    setFormPatron({ ...formPatron, semanasCiclo: semanas, turnos: nuevosTurnos });
  };

  if (cargando)
    return <div className="p-8 text-center text-slate-500">Cargando Centro de Control...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* MENÚ LATERAL */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button
            onClick={() => setTabActiva('EMPLEADOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'EMPLEADOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <Users className="w-5 h-5" /> Gestión de Personal
          </button>
          <button
            onClick={() => setTabActiva('DELEGACIONES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'DELEGACIONES' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <MapPin className="w-5 h-5" /> Delegaciones
          </button>
          <button
            onClick={() => setTabActiva('HORARIOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'HORARIOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <Clock className="w-5 h-5" /> Turnos y Horarios
          </button>
          <button
            onClick={() => setTabActiva('PATRONES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'PATRONES' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <Repeat className="w-5 h-5" /> Rotaciones
          </button>
          <button
            onClick={() => setTabActiva('CALENDARIOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'CALENDARIOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
          >
            <CalendarDays className="w-5 h-5" /> Calendarios
          </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1">
          {/* PESTAÑA: EMPLEADOS */}
          {tabActiva === 'EMPLEADOS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Alta de Empleado</h2>
              </div>
              <form
                onSubmit={handleSubmitEmpleado}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.nombreCompleto}
                    onChange={(e) =>
                      setFormEmpleado({ ...formEmpleado, nombreCompleto: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">DNI / NIE</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.dni}
                    onChange={(e) => setFormEmpleado({ ...formEmpleado, dni: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.email}
                    onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Contraseña Temporal
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.password}
                    onChange={(e) => setFormEmpleado({ ...formEmpleado, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Delegación</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.delegacionId}
                    onChange={(e) =>
                      setFormEmpleado({ ...formEmpleado, delegacionId: e.target.value })
                    }
                  >
                    <option value="">Selecciona...</option>
                    {delegaciones.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Rol</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formEmpleado.rol}
                    onChange={(e) =>
                      setFormEmpleado({
                        ...formEmpleado,
                        rol: e.target.value as UsuarioRequest['rol'],
                      })
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
                  >
                    Registrar Empleado
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PESTAÑA: DELEGACIONES */}
          {tabActiva === 'DELEGACIONES' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Oficinas y Delegaciones</h2>
                  <p className="text-sm text-slate-500">
                    Gestiona las ubicaciones físicas de la empresa.
                  </p>
                </div>
                {!creandoDelegacion && (
                  <button
                    onClick={() => setCreandoDelegacion(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Nueva Oficina
                  </button>
                )}
              </div>

              {creandoDelegacion && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-900">Añadir nueva ubicación</h3>
                    <button
                      onClick={() => setCreandoDelegacion(false)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitDelegacion}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <input
                      type="text"
                      placeholder="Nombre (ej. Oficina Central)"
                      required
                      className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formDelegacion.nombre}
                      onChange={(e) =>
                        setFormDelegacion({ ...formDelegacion, nombre: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      required
                      className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formDelegacion.direccion}
                      onChange={(e) =>
                        setFormDelegacion({ ...formDelegacion, direccion: e.target.value })
                      }
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {delegaciones.length === 0 ? (
                  <p className="col-span-2 text-slate-500 p-4">No hay delegaciones registradas.</p>
                ) : (
                  delegaciones.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-slate-800 text-lg">{d.nombre}</h3>
                      </div>
                      <p className="text-slate-500 text-sm mb-4">{d.direccion}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: HORARIOS */}
          {tabActiva === 'HORARIOS' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gestión de Turnos</h2>
                  <p className="text-sm text-slate-500">
                    Define los bloques horarios de la empresa.
                  </p>
                </div>
                {!creandoHorario && (
                  <button
                    onClick={() => setCreandoHorario(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Nuevo Turno
                  </button>
                )}
              </div>

              {creandoHorario && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-900">Definir un nuevo turno</h3>
                    <button
                      onClick={() => setCreandoHorario(false)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitHorario}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  >
                    <div className="col-span-2 sm:col-span-4 space-y-1">
                      <label className="text-xs font-bold text-blue-800 uppercase">
                        Nombre del turno
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Turno Mañana"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-blue-200"
                        value={formHorario.nombre}
                        onChange={(e) => setFormHorario({ ...formHorario, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-800 uppercase">Entrada</label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-blue-200"
                        value={formHorario.horaEntradaEsperada}
                        onChange={(e) =>
                          setFormHorario({ ...formHorario, horaEntradaEsperada: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-800 uppercase">Salida</label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-blue-200"
                        value={formHorario.horaSalidaEsperada}
                        onChange={(e) =>
                          setFormHorario({ ...formHorario, horaSalidaEsperada: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-800 uppercase">
                        H/Semanales
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-blue-200"
                        value={formHorario.horasSemanales}
                        onChange={(e) =>
                          setFormHorario({
                            ...formHorario,
                            horasSemanales: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-800 uppercase">
                        Pausa (Mins)
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-blue-200"
                        value={formHorario.minutosDescanso}
                        onChange={(e) =>
                          setFormHorario({
                            ...formHorario,
                            minutosDescanso: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-4 mt-2">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" /> Guardar Turno
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {horarios.length === 0 ? (
                  <p className="col-span-3 text-slate-500 p-4">No hay horarios registrados.</p>
                ) : (
                  horarios.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-800 text-lg">{h.nombre}</h3>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-400 w-16 inline-block">
                            De:
                          </span>{' '}
                          {h.horaEntradaEsperada} a {h.horaSalidaEsperada}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-400 w-16 inline-block">
                            Contrato:
                          </span>{' '}
                          {h.horasSemanales}h / semana
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: PATRONES DE ROTACIÓN */}
          {tabActiva === 'PATRONES' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Patrones de Rotación</h2>
                  <p className="text-sm text-slate-500">
                    Agrupa turnos en ciclos repetitivos (ej. Mañana / Tarde).
                  </p>
                </div>
                {!creandoPatron && (
                  <button
                    onClick={() => setCreandoPatron(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Crear Rotación
                  </button>
                )}
              </div>

              {creandoPatron && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-emerald-900">Configurar ciclo de turnos</h3>
                    <button
                      onClick={() => setCreandoPatron(false)}
                      className="text-emerald-400 hover:text-emerald-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmitPatron} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-emerald-800 uppercase">
                          Nombre del Patrón
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Rotación Quincenal Almacén"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-emerald-200"
                          value={formPatron.nombre}
                          onChange={(e) => setFormPatron({ ...formPatron, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-800 uppercase">
                          Semanas del Ciclo
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-emerald-200"
                          value={formPatron.semanasCiclo}
                          onChange={(e) => handleCambioSemanasCiclo(parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Mapeo dinámico de las semanas */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">
                        Asignación de Turnos por Semana
                      </h4>
                      {formPatron.turnos.map((turno, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100"
                        >
                          <span className="font-bold text-emerald-600 w-24">
                            Semana {turno.semanaOrden}
                          </span>
                          <select
                            required
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none"
                            value={turno.horarioId}
                            onChange={(e) => {
                              const nuevosTurnos = [...formPatron.turnos];
                              nuevosTurnos[index].horarioId = e.target.value;
                              setFormPatron({ ...formPatron, turnos: nuevosTurnos });
                            }}
                          >
                            <option value="">
                              Selecciona el turno que trabajará esta semana...
                            </option>
                            {horarios.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.nombre} ({h.horaEntradaEsperada} - {h.horaSalidaEsperada})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" /> Guardar Patrón
                    </button>
                  </form>
                </div>
              )}

              {/* Lista de Patrones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patrones.length === 0 ? (
                  <p className="col-span-2 text-slate-500 p-4">No hay rotaciones configuradas.</p>
                ) : (
                  patrones.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Repeat className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-slate-800 text-lg">{p.nombre}</h3>
                      </div>
                      <p className="text-slate-500 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                        Ciclo de {p.semanasCiclo} semana{p.semanasCiclo > 1 ? 's' : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: CALENDARIOS */}
          {tabActiva === 'CALENDARIOS' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Calendarios Base</h2>
                  <p className="text-sm text-slate-500">
                    Define los días laborables anuales por oficina.
                  </p>
                </div>
                {!creandoCalendario && (
                  <button
                    onClick={() => setCreandoCalendario(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Crear Calendario
                  </button>
                )}
              </div>

              {creandoCalendario && (
                <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-purple-900">Configurar nuevo calendario</h3>
                    <button
                      onClick={() => setCreandoCalendario(false)}
                      className="text-purple-400 hover:text-purple-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitCalendario}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-800 uppercase">Nombre</label>
                      <input
                        type="text"
                        placeholder="Ej: Calendario Madrid 2026"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-purple-200"
                        value={formCalendario.nombre}
                        onChange={(e) =>
                          setFormCalendario({ ...formCalendario, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-800 uppercase">Año</label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-purple-200"
                        value={formCalendario.anio}
                        onChange={(e) =>
                          setFormCalendario({ ...formCalendario, anio: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-purple-800 uppercase">
                        Delegación asignada
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 rounded-lg border border-purple-200"
                        value={formCalendario.delegacionId}
                        onChange={(e) =>
                          setFormCalendario({ ...formCalendario, delegacionId: e.target.value })
                        }
                      >
                        <option value="">Selecciona la oficina...</option>
                        {delegaciones.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex gap-6 mt-2 bg-white p-4 rounded-lg border border-purple-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          checked={formCalendario.incluyeSabados}
                          onChange={(e) =>
                            setFormCalendario({
                              ...formCalendario,
                              incluyeSabados: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-medium text-slate-700">
                          Se trabaja los sábados
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          checked={formCalendario.incluyeDomingos}
                          onChange={(e) =>
                            setFormCalendario({
                              ...formCalendario,
                              incluyeDomingos: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-medium text-slate-700">
                          Se trabaja los domingos
                        </span>
                      </label>
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700"
                      >
                        <Save className="w-4 h-4" /> Guardar Calendario
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendarios.length === 0 ? (
                  <p className="col-span-3 text-slate-500 p-4">No hay calendarios registrados.</p>
                ) : (
                  calendarios.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-slate-800 text-lg">{c.nombre}</h3>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-400 w-24 inline-block">
                            Año:
                          </span>{' '}
                          {c.anio}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-400 w-24 inline-block">
                            Fines de semana:
                          </span>
                          {c.incluyeSabados ? 'Sábados ' : ''}
                          {c.incluyeDomingos
                            ? 'Domingos'
                            : !c.incluyeSabados && !c.incluyeDomingos
                              ? 'No'
                              : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
