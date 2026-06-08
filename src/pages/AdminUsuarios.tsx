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
  Settings,
  Camera,
  Loader2,
} from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { estructuraService } from '../services/estructuraService';
import { cloudinaryService } from '../services/cloudinaryService';
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
  fotoUrl: string;
}

export default function AdminUsuarios() {
  const [tabActiva, setTabActiva] = useState<AdminTab>('EMPLEADOS');

  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [calendarios, setCalendarios] = useState<Calendario[]>([]);
  const [patrones, setPatrones] = useState<PatronRotacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [creandoDelegacion, setCreandoDelegacion] = useState(false);
  const [creandoHorario, setCreandoHorario] = useState(false);
  const [creandoCalendario, setCreandoCalendario] = useState(false);
  const [creandoPatron, setCreandoPatron] = useState(false);

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
    fotoUrl: '',
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar la configuración');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosGlobales();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoSeleccionada(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalFotoUrl = formEmpleado.fotoUrl;

      if (fotoSeleccionada) {
        setSubiendoFoto(true);
        try {
          finalFotoUrl = await cloudinaryService.uploadImage(fotoSeleccionada);
        } catch (err) {
          toast.error('Error al subir la imagen');
          setSubiendoFoto(false);
          return;
        }
        setSubiendoFoto(false);
      }

      const datosAEnviar = {
        ...formEmpleado,
        fotoUrl: finalFotoUrl,
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
        fotoUrl: '',
      });
      setFotoSeleccionada(null);
      setPreviewFoto(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear empleado');
    }
  };

  const handleCrearDelegacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearDelegacion(formDelegacion);
      toast.success('Delegación creada');
      setCreandoDelegacion(false);
      setFormDelegacion({ nombre: '', direccion: '' });
      cargarDatosGlobales();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear delegación');
    }
  };

  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearHorario(formHorario);
      toast.success('Horario creado');
      setCreandoHorario(false);
      setFormHorario({
        nombre: '',
        horaEntradaEsperada: '08:00',
        horaSalidaEsperada: '16:00',
        horasSemanales: 40,
        minutosDescanso: 30,
      });
      cargarDatosGlobales();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear horario');
    }
  };

  const handleCrearCalendario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearCalendario(formCalendario);
      toast.success('Calendario creado');
      setCreandoCalendario(false);
      cargarDatosGlobales();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear calendario');
    }
  };

  const handleCrearPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearPatron(formPatron);
      toast.success('Patrón de rotación creado');
      setCreandoPatron(false);
      cargarDatosGlobales();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear patrón');
    }
  };

  if (cargando) return <div className="p-12 text-center text-slate-500">Cargando configuración...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <Settings className="w-10 h-10 text-blue-600" /> Centro de Control
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Gestiona la infraestructura, horarios y equipo de tu organización.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] w-fit mb-12">
          {[
            { id: 'EMPLEADOS', label: 'Altas y Empleados', icon: UserPlus },
            { id: 'DELEGACIONES', label: 'Delegaciones', icon: MapPin },
            { id: 'CALENDARIOS', label: 'Calendarios', icon: CalendarDays },
            { id: 'HORARIOS', label: 'Horarios Base', icon: Clock },
            { id: 'PATRONES', label: 'Rotaciones', icon: Repeat },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as AdminTab)}
              className={`
                flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] text-sm font-black transition-all
                ${tabActiva === tab.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-500">
          {tabActiva === 'EMPLEADOS' && (
            <div className="space-y-8">
              <form onSubmit={handleSubmitEmpleado} className="bg-slate-50 dark:bg-slate-800/30 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    1. Datos Personales
                  </h3>

                  <div className="md:col-span-2 flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center">
                        {previewFoto ? (
                          <img
                            src={previewFoto}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-slate-400" />
                        )}
                        {subiendoFoto && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Foto de Perfil
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Sube una imagen cuadrada para mejores resultados (JPG, PNG).
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="foto-input"
                      />
                      <label
                        htmlFor="foto-input"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Seleccionar Imagen
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formEmpleado.nombreCompleto}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, nombreCompleto: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">DNI / Documento</label>
                    <input
                      type="text"
                      required
                      value={formEmpleado.dni}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, dni: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678X"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Corporativo</label>
                    <input
                      type="email"
                      required
                      value={formEmpleado.email}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="juan@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Contraseña Temporal</label>
                    <input
                      type="password"
                      required
                      value={formEmpleado.password}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, password: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider mt-6">
                    2. Organización y Jornada
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Rol de Usuario</label>
                    <select
                      value={formEmpleado.rol}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, rol: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">Empleado (User)</option>
                      <option value="MANAGER">Responsable (Manager)</option>
                      <option value="ADMIN">Administrador (Admin)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Sede / Delegación</label>
                    <select
                      required
                      value={formEmpleado.delegacionId}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, delegacionId: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Sede...</option>
                      {delegaciones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Responsable Directo (Manager)</label>
                    <select
                      value={formEmpleado.managerId}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, managerId: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sin Responsable (Admin/Manager Superior)</option>
                      {managers.map(m => <option key={m.id} value={m.id}>{m.nombreCompleto}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Calendario Laboral</label>
                    <select
                      required
                      value={formEmpleado.calendarioId}
                      onChange={(e) => setFormEmpleado({ ...formEmpleado, calendarioId: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Calendario...</option>
                      {calendarios.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.anio})</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Configuración de Horario</label>
                    <div className="flex gap-4 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit">
                      <button
                        type="button"
                        onClick={() => setTipoTurno('FIJO')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tipoTurno === 'FIJO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}
                      >
                        Horario Fijo
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoTurno('ROTATIVO')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tipoTurno === 'ROTATIVO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}
                      >
                        Turno Rotativo
                      </button>
                    </div>

                    {tipoTurno === 'FIJO' ? (
                      <select
                        required
                        value={formEmpleado.horarioId}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, horarioId: e.target.value })}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 animate-in slide-in-from-left-2"
                      >
                        <option value="">Seleccionar Horario Base...</option>
                        {horarios.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                      </select>
                    ) : (
                      <select
                        required
                        value={formEmpleado.patronId}
                        onChange={(e) => setFormEmpleado({ ...formEmpleado, patronId: e.target.value })}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 animate-in slide-in-from-right-2"
                      >
                        <option value="">Seleccionar Patrón de Rotación...</option>
                        {patrones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button
                    type="submit"
                    disabled={subiendoFoto}
                    className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subiendoFoto ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo Foto...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Registrar Empleado</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tabActiva === 'DELEGACIONES' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <form onSubmit={handleCrearDelegacion} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 space-y-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <Plus className="w-5 h-5 text-blue-600" /> Nueva Sede
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    value={formDelegacion.nombre}
                    onChange={(e) => setFormDelegacion({ ...formDelegacion, nombre: e.target.value })}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la Sede (Ej. Madrid Central)"
                  />
                  <input
                    type="text"
                    required
                    value={formDelegacion.direccion}
                    onChange={(e) => setFormDelegacion({ ...formDelegacion, direccion: e.target.value })}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección Física"
                  />
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">
                    Guardar Delegación
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {delegaciones.map(d => (
                  <div key={d.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white">{d.nombre}</h4>
                      <p className="text-sm text-slate-500">{d.direccion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabActiva === 'HORARIOS' && (
            <div className="space-y-8">
              <form onSubmit={handleCrearHorario} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre del Horario</label>
                    <input
                      type="text"
                      required
                      value={formHorario.nombre}
                      onChange={(e) => setFormHorario({ ...formHorario, nombre: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none"
                      placeholder="Ej. Jornada Partida"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Entrada</label>
                    <input
                      type="time"
                      required
                      value={formHorario.horaEntradaEsperada}
                      onChange={(e) => setFormHorario({ ...formHorario, horaEntradaEsperada: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Salida</label>
                    <input
                      type="time"
                      required
                      value={formHorario.horaSalidaEsperada}
                      onChange={(e) => setFormHorario({ ...formHorario, horaSalidaEsperada: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>
                  <button type="submit" className="md:col-span-2 lg:col-span-4 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg mt-4">
                    Crear Horario Base
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {horarios.map(h => (
                  <div key={h.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.horasSemanales}h / Semana</span>
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white text-lg">{h.nombre}</h4>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Entrada</span>
                        <span className="font-black text-slate-700 dark:text-slate-300">{h.horaEntradaEsperada.substring(0,5)}</span>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Salida</span>
                        <span className="font-black text-slate-700 dark:text-slate-300">{h.horaSalidaEsperada.substring(0,5)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabActiva === 'CALENDARIOS' && (
            <div className="space-y-8">
              <form onSubmit={handleCrearCalendario} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formCalendario.nombre}
                      onChange={(e) => setFormCalendario({ ...formCalendario, nombre: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                      placeholder="Ej. Calendario Madrid 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Sede Asociada</label>
                    <select
                      required
                      value={formCalendario.delegacionId}
                      onChange={(e) => setFormCalendario({ ...formCalendario, delegacionId: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    >
                      <option value="">Seleccionar Sede...</option>
                      {delegaciones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Año</label>
                    <input
                      type="number"
                      required
                      value={formCalendario.anio}
                      onChange={(e) => setFormCalendario({ ...formCalendario, anio: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>
                  <button type="submit" className="md:col-span-3 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg mt-4">
                    Generar Calendario Anual
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {calendarios.map(c => (
                  <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white">{c.nombre}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.anio} • {delegaciones.find(d => d.id === c.delegacionId)?.nombre || 'Sede Local'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tabActiva === 'PATRONES' && (
            <div className="space-y-8">
              <form onSubmit={handleCrearPatron} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre del Patrón</label>
                    <input
                      type="text"
                      required
                      value={formPatron.nombre}
                      onChange={(e) => setFormPatron({ ...formPatron, nombre: e.target.value })}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                      placeholder="Ej. Mañana/Tarde/Noche"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Semanas del Ciclo</label>
                    <input
                      type="number"
                      required
                      min="2"
                      max="4"
                      value={formPatron.semanasCiclo}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 2;
                        const newTurnos = Array.from({ length: count }, (_, i) => ({
                          semanaOrden: i + 1,
                          horarioId: formPatron.turnos[i]?.horarioId || ''
                        }));
                        setFormPatron({ ...formPatron, semanasCiclo: count, turnos: newTurnos });
                      }}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {formPatron.turnos.map((t, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <label className="text-[10px] font-black text-blue-600 uppercase mb-3 block">Semana {t.semanaOrden}</label>
                        <select
                          required
                          value={t.horarioId}
                          onChange={(e) => {
                            const newTurnos = [...formPatron.turnos];
                            newTurnos[idx].horarioId = e.target.value;
                            setFormPatron({ ...formPatron, turnos: newTurnos });
                          }}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="">Elegir Horario...</option>
                          {horarios.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="md:col-span-2 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg mt-4">
                    Guardar Configuración de Rotación
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {patrones.map(p => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                        <Repeat className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.semanasCiclo} Semanas</span>
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white text-lg">{p.nombre}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
