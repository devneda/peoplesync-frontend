import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { estructuraService } from '../../services/estructuraService';
import type { Calendario, Delegacion } from '../../types';
import toast from 'react-hot-toast';

interface TabCalendariosProps {
  calendarios: Calendario[];
  delegaciones: Delegacion[];
  onRefresh: () => void;
}

export default function TabCalendarios({ calendarios, delegaciones, onRefresh }: TabCalendariosProps) {
  const [formCalendario, setFormCalendario] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    incluyeSabados: false,
    incluyeDomingos: false,
    delegacionId: '',
  });

  const handleCrearCalendario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearCalendario(formCalendario);
      toast.success('Calendario creado');
      onRefresh();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al crear calendario');
    }
  };

  return (
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
              {delegaciones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
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
        {calendarios.map((c) => (
          <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white">{c.nombre}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {c.anio} • {delegaciones.find((d) => d.id === c.delegacionId)?.nombre || 'Sede Local'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
