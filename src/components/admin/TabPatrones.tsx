import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { estructuraService } from '../../services/estructuraService';
import type { Horario, PatronRotacion } from '../../types';
import toast from 'react-hot-toast';

interface TabPatronesProps {
  patrones: PatronRotacion[];
  horarios: Horario[];
  onRefresh: () => void;
}

export default function TabPatrones({ patrones, horarios, onRefresh }: TabPatronesProps) {
  const [formPatron, setFormPatron] = useState({
    nombre: '',
    descripcion: '',
    semanasCiclo: 2,
    turnos: [
      { semanaOrden: 1, horarioId: '' },
      { semanaOrden: 2, horarioId: '' },
    ],
  });

  const handleCrearPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearPatron(formPatron);
      toast.success('Patrón de rotación creado');
      onRefresh();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al crear patrón');
    }
  };

  return (
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
                  horarioId: formPatron.turnos[i]?.horarioId || '',
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
                  {horarios.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombre}
                    </option>
                  ))}
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
        {patrones.map((p) => (
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
  );
}
