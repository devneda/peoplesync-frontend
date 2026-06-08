import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Lock, AlertCircle, Save } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';
import toast from 'react-hot-toast';

export default function CambiarPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const tempPassword = location.state?.tempPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tempPassword) {
      setError('Sesión inválida. Por favor, vuelve a iniciar sesión.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await usuarioService.cambiarMiPassword({
        passwordActual: tempPassword,
        passwordNueva: password
      });
      
      toast.success('Contraseña actualizada correctamente');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const mensaje = axiosError.response?.data?.message || 'Error al actualizar la contraseña. Inténtalo de nuevo.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Actualiza tu contraseña</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Actualizando...' : <><Save className="w-5 h-5" /> Guardar y Continuar</>}
          </button>
        </form>
      </div>
    </div>
  );
}
