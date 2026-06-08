import { useState, useEffect } from 'react';
import {
  UserPlus,
  MapPin,
  CalendarDays,
  Clock,
  Repeat,
  Settings,
} from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import { estructuraService } from '../services/estructuraService';
import type {
  Delegacion,
  Horario,
  Calendario,
  PatronRotacion,
  Usuario,
} from '../types';
import toast from 'react-hot-toast';

import TabEmpleados from '../components/admin/TabEmpleados';
import TabDelegaciones from '../components/admin/TabDelegaciones';
import TabHorarios from '../components/admin/TabHorarios';
import TabCalendarios from '../components/admin/TabCalendarios';
import TabPatrones from '../components/admin/TabPatrones';

type AdminTab = 'EMPLEADOS' | 'DELEGACIONES' | 'CALENDARIOS' | 'HORARIOS' | 'PATRONES';

export default function AdminUsuarios() {
  const [tabActiva, setTabActiva] = useState<AdminTab>('EMPLEADOS');

  const [delegaciones, setDelegaciones] = useState<Delegacion[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [calendarios, setCalendarios] = useState<Calendario[]>([]);
  const [patrones, setPatrones] = useState<PatronRotacion[]>([]);
  const [managers, setManagers] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

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
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al cargar la configuración');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosGlobales();
  }, []);

  if (cargando) return <div className="p-12 text-center text-slate-500 font-bold">Cargando configuración...</div>;

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
            <TabEmpleados
              delegaciones={delegaciones}
              horarios={horarios}
              calendarios={calendarios}
              patrones={patrones}
              managers={managers}
              onRefresh={cargarDatosGlobales}
            />
          )}
          {tabActiva === 'DELEGACIONES' && (
            <TabDelegaciones
              delegaciones={delegaciones}
              onRefresh={cargarDatosGlobales}
            />
          )}
          {tabActiva === 'HORARIOS' && (
            <TabHorarios
              horarios={horarios}
              onRefresh={cargarDatosGlobales}
            />
          )}
          {tabActiva === 'CALENDARIOS' && (
            <TabCalendarios
              calendarios={calendarios}
              delegaciones={delegaciones}
              onRefresh={cargarDatosGlobales}
            />
          )}
          {tabActiva === 'PATRONES' && (
            <TabPatrones
              patrones={patrones}
              horarios={horarios}
              onRefresh={cargarDatosGlobales}
            />
          )}
        </div>
      </div>
    </div>
  );
}
