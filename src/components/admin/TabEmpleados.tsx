import { useState } from 'react';
import { Camera, Loader2, Plus, Save } from 'lucide-react';
import { usuarioService } from '../../services/usuarioService';
import { cloudinaryService } from '../../services/cloudinaryService';
import type { Delegacion, Horario, Calendario, PatronRotacion, Usuario, UsuarioRequest } from '../../types';
import toast from 'react-hot-toast';

interface TabEmpleadosProps {
  delegaciones: Delegacion[];
  horarios: Horario[];
  calendarios: Calendario[];
  patrones: PatronRotacion[];
  managers: Usuario[];
  onRefresh: () => void;
}

export default function TabEmpleados({
  delegaciones,
  horarios,
  calendarios,
  patrones,
  managers,
  onRefresh,
}: TabEmpleadosProps) {
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [tipoTurno, setTipoTurno] = useState<'FIJO' | 'ROTATIVO'>('FIJO');

  const [formEmpleado, setFormEmpleado] = useState({
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
        } catch {
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
      onRefresh();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al crear empleado');
    }
  };

  return (
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
                  <img src={previewFoto} alt="Vista previa" className="w-full h-full object-cover" />
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
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Foto de Perfil</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Sube una imagen cuadrada para mejores resultados (JPG, PNG).</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="foto-input" />
              <label htmlFor="foto-input" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <Plus className="w-4 h-4" /> Seleccionar Imagen
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre Completo</label>
            <input type="text" required value={formEmpleado.nombreCompleto} onChange={(e) => setFormEmpleado({ ...formEmpleado, nombreCompleto: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Juan Pérez" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">DNI / Documento</label>
            <input type="text" required value={formEmpleado.dni} onChange={(e) => setFormEmpleado({ ...formEmpleado, dni: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="12345678X" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Corporativo</label>
            <input type="email" required value={formEmpleado.email} onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="juan@empresa.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Contraseña Temporal</label>
            <input type="password" required value={formEmpleado.password} onChange={(e) => setFormEmpleado({ ...formEmpleado, password: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>

          <h3 className="md:col-span-2 text-sm font-bold text-slate-400 uppercase tracking-wider mt-6">2. Organización y Jornada</h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Rol de Usuario</label>
            <select value={formEmpleado.rol} onChange={(e) => setFormEmpleado({ ...formEmpleado, rol: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="USER">Empleado (User)</option>
              <option value="MANAGER">Responsable (Manager)</option>
              <option value="ADMIN">Administrador (Admin)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Sede / Delegación</label>
            <select required value={formEmpleado.delegacionId} onChange={(e) => setFormEmpleado({ ...formEmpleado, delegacionId: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar Sede...</option>
              {delegaciones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Responsable Directo (Manager)</label>
            <select value={formEmpleado.managerId} onChange={(e) => setFormEmpleado({ ...formEmpleado, managerId: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin Responsable (Admin/Manager Superior)</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.nombreCompleto}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Calendario Laboral</label>
            <select required value={formEmpleado.calendarioId} onChange={(e) => setFormEmpleado({ ...formEmpleado, calendarioId: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar Calendario...</option>
              {calendarios.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.anio})</option>)}
            </select>
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Configuración de Horario</label>
            <div className="flex gap-4 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit">
              <button type="button" onClick={() => setTipoTurno('FIJO')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tipoTurno === 'FIJO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>Horario Fijo</button>
              <button type="button" onClick={() => setTipoTurno('ROTATIVO')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tipoTurno === 'ROTATIVO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>Turno Rotativo</button>
            </div>

            {tipoTurno === 'FIJO' ? (
              <select required value={formEmpleado.horarioId} onChange={(e) => setFormEmpleado({ ...formEmpleado, horarioId: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 animate-in slide-in-from-left-2">
                <option value="">Seleccionar Horario Base...</option>
                {horarios.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
              </select>
            ) : (
              <select required value={formEmpleado.patronId} onChange={(e) => setFormEmpleado({ ...formEmpleado, patronId: e.target.value })} className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 animate-in slide-in-from-right-2">
                <option value="">Seleccionar Patrón de Rotación...</option>
                {patrones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button type="submit" disabled={subiendoFoto} className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {subiendoFoto ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo Foto...</> : <><Save className="w-5 h-5" /> Registrar Empleado</>}
          </button>
        </div>
      </form>
    </div>
  );
}
