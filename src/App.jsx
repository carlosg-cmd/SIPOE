import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Atenciones from './pages/Atenciones';
import Seguimientos from './pages/Seguimientos';
import NuevaAtencion from './pages/NuevaAtencion';
import Configuracion from './pages/Configuracion';
import AprobacionPendiente from './pages/AprobacionPendiente';
import Agenda from './pages/Agenda';
import AsistenteIA from './pages/AsistenteIA';
import Firmas from './pages/Firmas';
import Directorios from './pages/Directorios';
import TestPdf from './pages/TestPdf';

function ProtectedRoute({ children }) {
  const { session, userProfile, loading } = useAuth();
  
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  
  // BYPASS TEMPORAL: Comento el bloqueo para que puedas entrar y asignarte permisos.
  // if (userProfile && userProfile.rol === 'Pendiente') return <Navigate to="/pendiente" replace />;
  
  return children;
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pendiente" element={<AprobacionPendiente />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="estudiantes" element={<Estudiantes />} />
          <Route path="atenciones" element={<Atenciones />} />
          <Route path="atenciones/nueva" element={<NuevaAtencion />} />
          <Route path="seguimientos" element={<Seguimientos />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="ia" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="firmas" element={<Firmas />} />
          <Route path="directorios" element={<Directorios />} />
          <Route path="test-pdf" element={<TestPdf />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
