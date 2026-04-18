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
import Inicio from './pages/Inicio'; // Importante tener esta línea
import Informes from './pages/Informes';

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Inicio />} />
              <Route path="/fichajes" element={<Fichajes />} />
              <Route path="/equipo" element={<Equipo />} />
              <Route path="/admin" element={<AdminUsuarios />} />
              <Route path="/ausencias" element={<Ausencias />} />
              <Route path="/gestion-ausencias" element={<GestionAusencias />} />
              <Route path="/informes" element={<Informes />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
