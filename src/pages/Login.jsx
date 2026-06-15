import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, AlertCircle, Loader2, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'recovery', 'register'
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg('Cuenta creada exitosamente. Tu acceso está pendiente de aprobación por el Administrador.');
      setEmail('');
      setPassword('');
      setView('login');
    }
    setLoading(false);
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      setEmail('');
      setView('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Brillo Superior Elegante */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></div>
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 rotate-3"
            >
              <ShieldCheck className="text-white w-8 h-8 -rotate-3" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">SIPOE</h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Sistema de Orientación</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-start text-sm">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-start text-sm">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-800 font-medium"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Contraseña</label>
                    <button 
                      type="button" 
                      onClick={() => { setView('recovery'); setError(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-800 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all mt-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Ingresar al Sistema
                    </>
                  )}
                </motion.button>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    ¿No tienes cuenta? <span className="font-bold border-b border-indigo-200 pb-0.5">Regístrate aquí</span>
                  </button>
                </div>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister} 
                className="space-y-5"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-800 flex items-center justify-center">
                    <UserPlus className="mr-2 h-6 w-6 text-indigo-600" />
                    Solicitar Acceso
                  </h2>
                  <p className="text-xs font-medium text-slate-500 text-center mt-2 leading-relaxed">
                    Tu registro deberá ser aprobado por un administrador antes de ingresar.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Correo Institucional o Personal</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-800 font-medium"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Crear Contraseña</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-800 font-medium"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Enviando solicitud...
                    </>
                  ) : (
                    'Registrar Usuario'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all mt-4"
                >
                  Cancelar
                </button>
              </motion.form>
            )}

            {view === 'recovery' && (
              <motion.form 
                key="recovery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRecovery} 
                className="space-y-5"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-800 flex items-center justify-center mb-2">
                    Recuperar Acceso
                  </h2>
                  <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
                    Te enviaremos un enlace seguro para restablecer tu contraseña.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-800 font-medium"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Enviando instrucciones...
                    </>
                  ) : (
                    'Recibir Enlace'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all mt-4"
                >
                  Volver al Login
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        </div>
      <footer className="relative z-10 mt-12 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Sistema protegido por Ley 1581 de 2012 (Datos Personales)
        </p>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Copyright © Todos los derechos reservados. Desarrollado por Carlos Andrés Jiménez Murillo
        </p>
      </footer>
    </div>
  );
}
