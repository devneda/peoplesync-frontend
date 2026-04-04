import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, Home, Clock, Calendar, Users, Menu, X } from 'lucide-react';
import { getRolFromToken } from '../utils/auth';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userRole = getRolFromToken();

  // Estado para controlar el menú en versión móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Función para cerrar el menú al hacer clic en un enlace (muy útil en móviles)
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* CABECERA MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-30">
        <h2 className="text-xl font-bold text-blue-600">PeopleSync</h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* FONDO OSCURO PARA MÓVIL (Cuando el menú está abierto) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* MENÚ LATERAL (Sidebar) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl md:shadow-md transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="p-6 border-b hidden md:block">
          <h2 className="text-2xl font-bold text-blue-600">PeopleSync</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
          >
            <Home className="h-5 w-5" /> Inicio
          </Link>
          <Link
            to="/fichajes"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <Clock className="h-5 w-5" /> Fichajes
          </Link>
          <Link
            to="/ausencias"
            onClick={closeMenu}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <Calendar className="h-5 w-5" /> Ausencias
          </Link>

          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <Link
              to="/equipo"
              onClick={closeMenu}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
            >
              <Users className="h-5 w-5" /> Equipo
            </Link>
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (Donde cargan las páginas) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full h-[calc(100vh-73px)] md:h-screen">
        <Outlet />
      </main>
    </div>
  );
}
