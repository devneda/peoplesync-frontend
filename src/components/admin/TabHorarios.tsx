import { useState } from 'react';
import { Clock } from 'lucide-react';
import { estructuraService } from '../../services/estructuraService';
import type { Horario } from '../../types';
import toast from 'react-hot-toast';

interface TabHorariosProps {
  horarios: Horario[];
  onRefresh: () => void;
}

export default function TabHorarios({ horarios, onRefresh }: TabHorariosProps) {
  const [formHorario, setFormHorario] = useState({
    nombre: '',
    horaEntradaEsperada: '08:00',
    horaSalidaEsperada: '16:00',
    horasSemanales: 40,
    minutosDescanso: 30,
  });

  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estructuraService.crearHorario(formHorario);
      toast.success('Horario creado');
      setFormHorario({
        nombre: '',
        horaEntradaEsperada: '08:00',
        horaSalidaEsperada: '16:00',
        horasSemanales: 40,
        minutosDescanso: 30,
      });
      onRefresh();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al crear horario');
    }
  };

  return (
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
        {horarios.map((h) => (
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
                <span className="font-black text-slate-700 dark:text-slate-300">{h.horaEntradaEsperada.substring(0, 5)}</span>
              </div>
              <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                <span className="block text-[8px] font-black text-slate-400 uppercase">Salida</span>
                <span className="font-black text-slate-700 dark:text-slate-300">{h.horaSalidaEsperada.substring(0, 5)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
