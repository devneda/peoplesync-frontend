import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { estructuraService } from '../../services/estructuraService';
import type { Delegacion } from '../../types';
import toast from 'react-hot-toast';

interface TabDelegacionesProps {
  delegaciones: Delegacion[];
  onRefresh: () => void;
}

export default function TabDelegaciones({ delegaciones, onRefresh }: TabDelegacionesProps) {
  const [formDelegacion, setFormDelegacion] = useState({ nombre: '', direccion: '' });

  const handleCrearDelegacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearDelegacion(formDelegacion);
      toast.success('Delegación creada');
      setFormDelegacion({ nombre: '', direccion: '' });
      onRefresh();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al crear delegación');
    }
  };

  return (
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
        {delegaciones.map((d) => (
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
  );
}
