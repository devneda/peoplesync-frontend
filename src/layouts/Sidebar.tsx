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
  FileText,
  Megaphone,
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/dashboard' },
    { icon: Megaphone, label: 'Anuncios', path: '/publicaciones' },
  ];

  if (userRole === 'MANAGER' || userRole === 'ADMIN') {
    menuItems.push(
      { icon: Users, label: 'Mi Equipo', path: '/equipo' },
      { icon: FileText, label: 'Informes', path: '/informes' }
    );
  }

  menuItems.push(
    { icon: Clock, label: 'Fichajes', path: '/fichajes' },
    { icon: CalendarX, label: 'Ausencias', path: '/ausencias' }
  );

  if (userRole === 'ADMIN') {
    menuItems.push({ icon: Settings, label: 'Administración', path: '/admin' });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-all duration-500 z-50 shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
              PeopleSync
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 mt-2 opacity-70">
            Navegación
          </p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold text-sm transition-all duration-300 relative group
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:text-slate-400 hover:translate-x-1'
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110`} />
              <span className="tracking-tight">{item.label}</span>
              <div className="absolute left-0 w-1 h-0 bg-white rounded-full transition-all duration-500 opacity-0 active-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-4 px-2">
            <div className="relative">
              {user?.fotoUrl ? (
                <img
                  src={user.fotoUrl.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face,q_auto:best,f_auto/')}
                  alt={user.sub}
                  className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-slate-800"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center rounded-2xl font-black text-sm shadow-lg">
                  {user ? getInitials(user.sub || 'User') : '??'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate tracking-tight">
                {user?.sub?.split('@')[0]}
              </p>
              <span className="inline-block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-md mt-1">
                {userRole}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-[1.25rem] text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                {darkMode ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
