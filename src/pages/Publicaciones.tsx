import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { anuncioService } from '../services/anuncioService';
import { getRolFromToken } from '../utils/auth';
import type { Anuncio } from '../types';
import toast from 'react-hot-toast';

export default function Publicaciones() {
  const rol = getRolFromToken();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para nuevo anuncio
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('GENERAL');
  const [enviando, setEnviando] = useState(false);

  const cargarAnuncios = async () => {
    try {
      const data = await anuncioService.obtenerAnuncios();
      setAnuncios(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las publicaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAnuncios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await anuncioService.crearAnuncio(titulo, contenido, categoria);
      toast.success('¡Publicación creada con éxito!');
      setTitulo('');
      setContenido('');
      setMostrarForm(false);
      cargarAnuncios();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la publicación');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    try {
      await anuncioService.eliminarAnuncio(id);
      toast.success('Publicación eliminada');
      cargarAnuncios();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Tablón de Anuncios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Comunícate con toda la plantilla de forma directa.
          </p>
        </div>
        {(rol === 'ADMIN' || rol === 'MANAGER') && (
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {mostrarForm ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {mostrarForm ? 'Cancelar' : 'Nueva Publicación'}
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título del Anuncio</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Cierre de nóminas"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                >
                  <option value="GENERAL">General</option>
                  <option value="NOMINAS">Nóminas</option>
                  <option value="EVENTOS">Eventos</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contenido</label>
              <textarea
                required
                rows={4}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe aquí el mensaje para el equipo..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold resize-none"
              />
            </div>
            <button
              disabled={enviando}
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-6 h-6" /> {enviando ? 'Publicando...' : 'Lanzar Anuncio'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {cargando ? (
          <div className="text-center py-12 text-slate-400 font-bold">Cargando anuncios...</div>
        ) : anuncios.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-xl font-bold text-slate-600 dark:text-slate-400">No hay anuncios publicados</p>
            <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Sé el primero en comunicar algo al equipo.</p>
          </div>
        ) : (
          anuncios.map((anuncio) => (
            <div
              key={anuncio.id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 group hover:shadow-md transition-all duration-300"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    anuncio.categoria === 'URGENTE' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                    anuncio.categoria === 'NOMINAS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {anuncio.categoria}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(anuncio.fechaPublicacion).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  {anuncio.titulo}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {anuncio.contenido}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs text-blue-600">
                    {anuncio.autorNombre.substring(0,2).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Publicado por <span className="text-slate-800 dark:text-slate-200">{anuncio.autorNombre}</span>
                  </span>
                </div>
              </div>
              
              {(rol === 'ADMIN' || rol === 'MANAGER') && (
                <button
                  onClick={() => handleEliminar(anuncio.id)}
                  className="self-start p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
