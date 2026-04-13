import { useState, useEffect } from 'react';
import {
  UserPlus,
  MapPin,
  CalendarDays,
  Clock,
  Plus,
  Save,
  X,
  Repeat,
  Settings, // <-- ICONO AÑADIDO
} from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { estructuraService } from '../services/estructuraService';
import type {
  Delegacion,
  Horario,
  Calendario,
  PatronRotacion,
  UsuarioRequest,
  Usuario,
} from '../types';
import toast from 'react-hot-toast';

type AdminTab = 'EMPLEADOS' | 'DELEGACIONES' | 'CALENDARIOS' | 'HORARIOS' | 'PATRONES';

interface FormEmpleadoData {
  dni: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: string;
  delegacionId: string;
  diasVacacionesAnuales: number;
  calendarioId: string;
  horarioId: string;
  patronId: string;
  managerId: string;
}

export default function AdminUsuarios() {
  const [tabActiva, setTabActiva] = useState<AdminTab>('EMPLEADOS');

  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [calendarios, setCalendarios] = useState<Calendario[]>([]);
  const [patrones, setPatrones] = useState<PatronRotacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [creandoDelegacion, setCreandoDelegacion] = useState(false);
  const [creandoHorario, setCreandoHorario] = useState(false);
  const [creandoCalendario, setCreandoCalendario] = useState(false);
  const [creandoPatron, setCreandoPatron] = useState(false);

  // NUEVA LÓGICA: Control del tipo de turno
  const [tipoTurno, setTipoTurno] = useState<'FIJO' | 'ROTATIVO'>('FIJO');

  const [formEmpleado, setFormEmpleado] = useState<FormEmpleadoData>({
    dni: '',
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'USER',
    delegacionId: '',
    diasVacacionesAnuales: 22,
    calendarioId: '',
    horarioId: '',
    patronId: '',
    managerId: '',
  });

  const [managers, setManagers] = useState<Usuario[]>([]);

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
      const mngrs = await usuarioService.obtenerManagers();
      setManagers(mngrs);
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

  const handleSubmitEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const datosAEnviar = {
        ...formEmpleado,
        patronId: tipoTurno === 'FIJO' ? null : formEmpleado.patronId,
        horarioId: tipoTurno === 'ROTATIVO' ? null : formEmpleado.horarioId,
      } as unknown as UsuarioRequest;

      await usuarioService.crearUsuario(datosAEnviar);
      toast.success('¡Empleado registrado correctamente!');
      setFormEmpleado({
        dni: '',
        nombreCompleto: '',
        email: '',
        password: '',
        rol: 'USER',
        delegacionId: '',
        diasVacacionesAnuales: 22,
        calendarioId: '',
        horarioId: '',
        patronId: '',
        managerId: '',
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" /> Centro de Control
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Gestiona la estructura organizativa y da de alta a tu equipo.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* MENÚ LATERAL */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button
            onClick={() => setTabActiva('EMPLEADOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'EMPLEADOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
          >
            <UserPlus className="w-5 h-5" /> Altas y Empleados
          </button>
          <button
            onClick={() => setTabActiva('DELEGACIONES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'DELEGACIONES' ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
          >
            <MapPin className="w-5 h-5" /> Oficinas
          </button>
          <button
            onClick={() => setTabActiva('CALENDARIOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'CALENDARIOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
          >
            <CalendarDays className="w-5 h-5" /> Calendarios
          </button>
          <button
            onClick={() => setTabActiva('HORARIOS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'HORARIOS' ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
          >
            <Clock className="w-5 h-5" /> Turnos (Horarios)
          </button>
          <button
            onClick={() => setTabActiva('PATRONES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tabActiva === 'PATRONES' ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
          >
            <Repeat className="w-5 h-5" /> Rotaciones
          </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1">
          {/* PESTAÑA: EMPLEADOS */}
          {tabActiva === 'EMPLEADOS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-in slide-in-from-right-4 transition-colors">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Alta de Empleado
                </h2>
              </div>

              <form onSubmit={handleSubmitEmpleado} className="space-y-8">
                {/* BLOQUE 1: DATOS PERSONALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    1. Datos Personales
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.nombreCompleto}
                      onChange={(e) =>
                        setFormEmpleado({ ...formEmpleado, nombreCompleto: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      DNI / NIE
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.dni}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, dni: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Email Corporativo
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.email}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Contraseña Temporal
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.password}
                      onChange={(e) =>
                        setFormEmpleado({ ...formEmpleado, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* BLOQUE 2: ESTRUCTURA ORGANIZATIVA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    2. Jerarquía y Ubicación
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Rol del Sistema
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-medium"
                      value={formEmpleado.rol}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, rol: e.target.value })}
                    >
                      <option value="USER">Empleado (USER)</option>
                      <option value="MANAGER">Responsable (MANAGER)</option>
                      <option value="ADMIN">Administrador (ADMIN)</option>
                    </select>
                    {formEmpleado.rol === 'USER' && (
                      <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Asignar Responsable (Manager)
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                          value={formEmpleado.managerId}
                          onChange={(e) =>
                            setFormEmpleado({ ...formEmpleado, managerId: e.target.value })
                          }
                        >
                          <option value="">Sin responsable directo...</option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombreCompleto}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Delegación
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.delegacionId}
                      onChange={(e) =>
                        setFormEmpleado({ ...formEmpleado, delegacionId: e.target.value })
                      }
                    >
                      <option value="">Selecciona oficina...</option>
                      {delegaciones.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* BLOQUE 3: CALENDARIO Y TURNOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    3. Asignación de Horarios
                  </h3>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Calendario Base Anual
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 dark:text-white"
                      value={formEmpleado.calendarioId}
                      onChange={(e) =>
                        setFormEmpleado({ ...formEmpleado, calendarioId: e.target.value })
                      }
                    >
                      <option value="">Asignar calendario...</option>
                      {calendarios.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.anio})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Modalidad de Turno
                    </label>
                    <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                      <button
                        type="button"
                        onClick={() => setTipoTurno('FIJO')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tipoTurno === 'FIJO' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Turno Fijo
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoTurno('ROTATIVO')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tipoTurno === 'ROTATIVO' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Rotación
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {tipoTurno === 'FIJO' ? 'Seleccionar Horario' : 'Seleccionar Patrón'}
                    </label>
                    {tipoTurno === 'FIJO' ? (
                      <select
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                        value={formEmpleado.horarioId}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, horarioId: e.target.value })
                        }
                      >
                        <option value="">Elegir turno...</option>
                        {horarios.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.nombre} ({h.horaEntradaEsperada} a {h.horaSalidaEsperada})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                        value={formEmpleado.patronId}
                        onChange={(e) =>
                          setFormEmpleado({ ...formEmpleado, patronId: e.target.value })
                        }
                      >
                        <option value="">Elegir patrón de rotación...</option>
                        {patrones.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (Ciclo: {p.semanasCiclo} sem)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.99]"
                  >
                    Registrar Empleado en el Sistema
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PESTAÑA: DELEGACIONES */}
          {tabActiva === 'DELEGACIONES' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Oficinas y Delegaciones
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
                <div className="bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 p-6 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-900 dark:text-white">
                      Añadir nueva ubicación
                    </h3>
                    <button
                      onClick={() => setCreandoDelegacion(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
                      className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formDelegacion.nombre}
                      onChange={(e) =>
                        setFormDelegacion({ ...formDelegacion, nombre: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      required
                      className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                      value={formDelegacion.direccion}
                      onChange={(e) =>
                        setFormDelegacion({ ...formDelegacion, direccion: e.target.value })
                      }
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {delegaciones.length === 0 ? (
                  <p className="col-span-2 text-slate-500 dark:text-slate-400 p-4">
                    No hay delegaciones registradas.
                  </p>
                ) : (
                  delegaciones.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {d.nombre}
                        </h3>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        {d.direccion}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: HORARIOS */}
          {tabActiva === 'HORARIOS' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Gestión de Turnos
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
                <div className="bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 p-6 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-900 dark:text-white">
                      Definir un nuevo turno
                    </h3>
                    <button
                      onClick={() => setCreandoHorario(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitHorario}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  >
                    <div className="col-span-2 sm:col-span-4 space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Nombre del turno
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Turno Mañana"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        value={formHorario.nombre}
                        onChange={(e) => setFormHorario({ ...formHorario, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Entrada
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        value={formHorario.horaEntradaEsperada}
                        onChange={(e) =>
                          setFormHorario({ ...formHorario, horaEntradaEsperada: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Salida
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        value={formHorario.horaSalidaEsperada}
                        onChange={(e) =>
                          setFormHorario({ ...formHorario, horaSalidaEsperada: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        H/Semanales
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
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
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Pausa (Mins)
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
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
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" /> Guardar Turno
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {horarios.length === 0 ? (
                  <p className="col-span-3 text-slate-500 dark:text-slate-400 p-4">
                    No hay horarios registrados.
                  </p>
                ) : (
                  horarios.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {h.nombre}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          <span className="font-semibold w-16 inline-block">De:</span>{' '}
                          {h.horaEntradaEsperada} a {h.horaSalidaEsperada}
                        </p>
                        <p>
                          <span className="font-semibold w-16 inline-block">Contrato:</span>{' '}
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
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Patrones de Rotación
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Agrupa turnos en ciclos repetitivos.
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
                <div className="bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-700 p-6 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-emerald-900 dark:text-white">
                      Configurar ciclo de turnos
                    </h3>
                    <button
                      onClick={() => setCreandoPatron(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmitPatron} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Nombre del Patrón
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Rotación Quincenal"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                          value={formPatron.nombre}
                          onChange={(e) => setFormPatron({ ...formPatron, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Semanas del Ciclo
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                          value={formPatron.semanasCiclo}
                          onChange={(e) => handleCambioSemanasCiclo(parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Asignación de Turnos por Semana
                      </h4>
                      {formPatron.turnos.map((turno, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                        >
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 w-24">
                            Semana {turno.semanaOrden}
                          </span>
                          <select
                            required
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                            value={turno.horarioId}
                            onChange={(e) => {
                              const nuevosTurnos = [...formPatron.turnos];
                              nuevosTurnos[index].horarioId = e.target.value;
                              setFormPatron({ ...formPatron, turnos: nuevosTurnos });
                            }}
                          >
                            <option value="">Selecciona el turno...</option>
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
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" /> Guardar Patrón
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patrones.length === 0 ? (
                  <p className="col-span-2 text-slate-500 dark:text-slate-400 p-4">
                    No hay rotaciones configuradas.
                  </p>
                ) : (
                  patrones.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Repeat className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {p.nombre}
                        </h3>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-block">
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
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Calendarios Base
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
                <div className="bg-purple-50 dark:bg-slate-900 border border-purple-100 dark:border-slate-700 p-6 rounded-3xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-purple-900 dark:text-white">
                      Configurar nuevo calendario
                    </h3>
                    <button
                      onClick={() => setCreandoCalendario(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleSubmitCalendario}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Calendario Madrid 2026"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        value={formCalendario.nombre}
                        onChange={(e) =>
                          setFormCalendario({ ...formCalendario, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Año
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                        value={formCalendario.anio}
                        onChange={(e) =>
                          setFormCalendario({ ...formCalendario, anio: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Delegación asignada
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
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

                    <div className="sm:col-span-2 flex gap-6 mt-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 rounded"
                          checked={formCalendario.incluyeSabados}
                          onChange={(e) =>
                            setFormCalendario({
                              ...formCalendario,
                              incluyeSabados: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Se trabaja los sábados
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 rounded"
                          checked={formCalendario.incluyeDomingos}
                          onChange={(e) =>
                            setFormCalendario({
                              ...formCalendario,
                              incluyeDomingos: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Se trabaja los domingos
                        </span>
                      </label>
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700"
                      >
                        <Save className="w-4 h-4" /> Guardar Calendario
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendarios.length === 0 ? (
                  <p className="col-span-3 text-slate-500 dark:text-slate-400 p-4">
                    No hay calendarios registrados.
                  </p>
                ) : (
                  calendarios.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                          {c.nombre}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          <span className="font-semibold w-24 inline-block">Año:</span> {c.anio}
                        </p>
                        <p>
                          <span className="font-semibold w-24 inline-block">Fines de semana:</span>
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
