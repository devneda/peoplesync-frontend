import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarX,
  Settings,
  LogOut,
  Sun,
  Moon,
  Layers,
  X,
  FileText, // <-- IMPORTANTE: Añadido el icono para Informes
} from 'lucide-react';
import { getUsuarioFromToken, getRolFromToken } from '../utils/auth';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ darkMode, setDarkMode, isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const userRole = getRolFromToken();
  const user = getUsuarioFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (identificador: string) => {
    if (!identificador) return '??';
    if (identificador.includes('@')) return identificador.substring(0, 2).toUpperCase();
    const partes = identificador.split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return identificador.substring(0, 2).toUpperCase();
  };

  // Elementos base para todo el mundo
  const menuItems = [{ icon: LayoutDashboard, label: 'Inicio', path: '/dashboard' }];

  // Si es Manager o Admin, le añadimos "Mi Equipo" e "Informes"
  if (userRole === 'MANAGER' || userRole === 'ADMIN') {
    menuItems.push(
      { icon: Users, label: 'Mi Equipo', path: '/equipo' },
      { icon: FileText, label: 'Informes', path: '/informes' } // <-- AÑADIDO AQUÍ
    );
  }

  // Fichajes y Ausencias para todos
  menuItems.push(
    { icon: Clock, label: 'Fichajes', path: '/fichajes' },
    { icon: CalendarX, label: 'Ausencias', path: '/ausencias' }
  );

  // Solo si es Admin, añadimos "Administración"
  if (userRole === 'ADMIN') {
    menuItems.push({ icon: Settings, label: 'Administración', path: '/admin' });
  }

  return (
    <>
      {/* Overlay oscuro para móvil cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`
        fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-all duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              PeopleSync
            </span>
          </div>
          {/* Botón de cerrar solo visible en móvil */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-4">
            Menu Principal
          </p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center rounded-full font-bold text-sm">
                {user ? getInitials(user.sub || 'User') : '??'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.sub?.split('@')[0]}
                </p>
                <p className="text-xs font-medium text-slate-400 capitalize">
                  {userRole?.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-3">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
