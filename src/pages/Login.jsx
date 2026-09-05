import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'recovery', 'register'
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

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
      redirectTo: window.location.origin + window.location.pathname + '#/reset-password',
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 font-sans text-white selection:bg-white/30"
      style={{ background: 'linear-gradient(135deg, #2C5F7C 0%, #3E93A8 50%, #9FD9C8 100%)' }}
    >
      
      {/* ── Contenedor Principal ── */}
      <div className="relative z-10 w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] p-8 sm:p-9 shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#4FB8CE' }}
        >
          
          {/* ── Encabezado & Logo Futurista ── */}
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div 
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #378ADD 0%, #1D9E75 100%)' }}
                >
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-extrabold tracking-wider text-white drop-shadow-sm">
                  SIPOE
                </h1>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-white/90 tracking-wider uppercase mt-1">
              SISTEMA DE INFORMACIÓN PARA ORIENTACIÓN ESCOLAR
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {view === 'login' && 'INICIAR SESIÓN'}
              {view === 'register' && 'SOLICITAR ACCESO'}
              {view === 'recovery' && 'RECUPERAR CONTRASEÑA'}
            </h2>
            <p className="text-xs text-white/80 mt-1">
              {view === 'login' && 'Accede a tu cuenta SIPOE'}
              {view === 'register' && 'Ingresa tus datos para crear una cuenta'}
              {view === 'recovery' && 'Te enviaremos las instrucciones a tu correo'}
            </p>
          </div>

          {/* Mensajes de Alerta / Éxito */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/20 border border-red-200 text-white flex items-start text-xs font-medium"
            >
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0 text-red-200" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-200 text-white flex items-start text-xs font-medium"
            >
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0 text-emerald-200" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* ── Formularios Animados ── */}
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Campo Correo */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors" style={{ color: '#4A4A48' }}>
                      <Mail size={17} />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-white/50 text-sm text-[#4A4A48] placeholder-[#4A4A48]/60 outline-none transition-all font-medium"
                      placeholder="Correo Electrónico"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors" style={{ color: '#4A4A48' }}>
                      <KeyRound size={17} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-white/50 text-sm text-[#4A4A48] placeholder-[#4A4A48]/60 outline-none transition-all font-medium"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:opacity-70 transition-opacity"
                      style={{ color: '#4A4A48' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => { setView('recovery'); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] text-white/90 hover:text-white underline underline-offset-2 transition-colors font-medium"
                    >
                      ¿Olvidé mi contraseña?
                    </button>
                  </div>
                </div>

                {/* Botón Principal */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#4A4A48' }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase text-white shadow-lg hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Procesando...
                    </>
                  ) : (
                    'INGRESAR AL SISTEMA'
                  )}
                </motion.button>

                {/* Botón de Google */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-[#4A4A48] bg-white hover:bg-slate-50 shadow-md disabled:opacity-60 transition-all flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar con Google
                </motion.button>

                {/* Enlace de Registro */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                    className="text-xs font-bold text-white/90 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors" style={{ color: '#4A4A48' }}>
                      <Mail size={17} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-white/50 text-sm text-[#4A4A48] placeholder-[#4A4A48]/60 outline-none transition-all font-medium"
                      placeholder="Correo Electrónico"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors" style={{ color: '#4A4A48' }}>
                      <KeyRound size={17} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-white/50 text-sm text-[#4A4A48] placeholder-[#4A4A48]/60 outline-none transition-all font-medium"
                      placeholder="Crear Contraseña (mínimo 6 carácteres)"
                      minLength={6}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#4A4A48' }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase text-white shadow-lg hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Registrando...
                    </>
                  ) : (
                    'REGISTRAR USUARIO'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="w-full py-2.5 text-xs font-bold text-white/80 hover:text-white transition-colors"
                >
                  ← Volver al Login
                </button>
              </motion.form>
            )}

            {view === 'recovery' && (
              <motion.form
                key="recovery"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRecovery}
                className="space-y-4"
              >
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors" style={{ color: '#4A4A48' }}>
                      <Mail size={17} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-white/50 text-sm text-[#4A4A48] placeholder-[#4A4A48]/60 outline-none transition-all font-medium"
                      placeholder="Correo Electrónico"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#4A4A48' }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase text-white shadow-lg hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Enviando enlace...
                    </>
                  ) : (
                    'RECIBIR ENLACE DE ACCESO'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="w-full py-2.5 text-xs font-bold text-white/80 hover:text-white transition-colors"
                >
                  ← Volver al Login
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Pie de Página ── */}
      <footer className="relative z-10 mt-8 text-center px-4">
        <p className="text-[11px] text-white/80 font-medium tracking-wide">
          SIPOE v1.0 | © 2026 Todos los derechos reservados | Desarrollado por Carlos Andrés Jiménez Murillo
        </p>
      </footer>
    </div>
  );
}
