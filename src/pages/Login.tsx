import { User, Lock, AlertCircle, Layers } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    // Fondo general ligeramente gris para que la tarjeta blanca resalte
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* MITAD IZQUIERDA: Contenedor alineado */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 z-10 relative animate-in slide-in-from-left-12 fade-in duration-700">
        {/* LA TARJETA BLANCA QUE ECHABAS DE MENOS */}
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
          {/* Cabecera / Logo */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-200">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">PeopleSync</h1>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido de nuevo</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Inicia sesión en tu portal del empleado para continuar.
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                  placeholder="usuario@peoplesync.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 tracking-wide"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all duration-200 mt-2"
            >
              Entrar al Portal
            </button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-4">
            ¿Tienes problemas para acceder? <br className="sm:hidden" />
            Contacta con{' '}
            <a href="#" className="text-slate-800 font-bold hover:underline">
              Soporte IT
            </a>
          </div>
        </div>
      </div>

      {/* MITAD DERECHA: Imagen Corporativa */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 animate-in fade-in duration-1000 delay-150">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>

        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
          alt="Oficina moderna"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute bottom-12 left-12 right-12 z-20">
          <blockquote className="space-y-4">
            <p className="text-3xl font-bold text-white leading-tight">
              "La herramienta definitiva para sincronizar el talento de nuestra empresa."
            </p>
            <footer className="text-blue-200 font-medium flex items-center gap-3">
              <div className="w-10 h-[2px] bg-blue-500 rounded-full"></div>
              Equipo de Recursos Humanos
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
