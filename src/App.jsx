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
import IntervencionesGrupales from './pages/IntervencionesGrupales';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-xs text-cyan-300 font-semibold tracking-widest uppercase mt-4 animate-pulse">
          Iniciando SIPOE...
        </p>
      </div>
    );
  }
  
  if (!session) return <Navigate to="/login" replace />;
  
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
          <Route path="intervenciones-grupales" element={<IntervencionesGrupales />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="ia" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="firmas" element={<Firmas />} />
          <Route path="directorios" element={<Directorios />} />
          <Route path="test-pdf" element={<TestPdf />} />
        </Route>
        {/* Capturar rutas no encontradas o retornos OAuth y redirigir al home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
