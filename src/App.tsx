import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Fichajes from './pages/Fichajes';
import Equipo from './pages/Equipo';
import AdminUsuarios from './pages/AdminUsuarios';
import Ausencias from './pages/Ausencias';
import GestionAusencias from './pages/GestionAusencias';
import Inicio from './pages/Inicio';
import Informes from './pages/Informes';
import Publicaciones from './pages/Publicaciones';
import CambiarPassword from './pages/CambiarPassword';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cambiar-password" element={<CambiarPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Inicio />} />
                <Route path="/fichajes" element={<Fichajes />} />
                <Route path="/equipo" element={<Equipo />} />
                <Route path="/admin" element={<AdminUsuarios />} />
                <Route path="/ausencias" element={<Ausencias />} />
                <Route path="/gestion-ausencias" element={<GestionAusencias />} />
                <Route path="/informes" element={<Informes />} />
                <Route path="/publicaciones" element={<Publicaciones />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
