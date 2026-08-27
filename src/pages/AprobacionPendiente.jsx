import { LogOut, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function AprobacionPendiente() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <Clock size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Cuenta Pendiente</h1>
        <p className="text-slate-600 mb-8">
          Tu cuenta ha sido creada exitosamente, pero está a la espera de ser aprobada por el Administrador. 
          Te notificaremos cuando tengas acceso al sistema SIPOE.
        </p>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
