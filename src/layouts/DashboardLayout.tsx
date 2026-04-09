import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Settings, Layers, ShieldCheck } from 'lucide-react';
import { getUsuarioFromToken, getRolFromToken } from '../utils/auth';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUsuarioFromToken();
  const userRole = getRolFromToken();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // FIX: Reiniciar el scroll al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const getInitials = (identificador: string) => {
    if (!identificador) return '??';
    if (identificador.includes('@')) return identificador.substring(0, 2).toUpperCase();
    const partes = identificador.split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return identificador.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
                <Layers className="w-6 h-6 text-white" />
              </div>
              {/* FIX: Quitamos el hidden para que el nombre se vea siempre en móvil */}
              <span className="text-xl font-bold text-slate-800 tracking-tight">PeopleSync</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-8">
              <Link
                to="/dashboard"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Inicio
              </Link>
              <Link
                to="/fichajes"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/fichajes') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Fichajes
              </Link>
              <Link
                to="/ausencias"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/ausencias') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Ausencias
              </Link>

              {userRole === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ShieldCheck className="w-4 h-4" /> Administración
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-sm border-2 border-white shadow-sm">
                  {user ? getInitials(user.sub || 'User') : '??'}
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        Sesión actual
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.sub}</p>
                      <p className="text-xs font-medium text-blue-600 mt-1 capitalize">
                        {userRole?.toLowerCase()}
                      </p>
                    </div>
                    <Link
                      to="/ajustes"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Ajustes y Perfil
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* FIX: Oculto en móvil (hidden md:block) */}
      <footer className="hidden md:block bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">PeopleSync HRIS</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            © {new Date().getFullYear()} Creado por Kenny Pineda. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Soporte
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Términos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
