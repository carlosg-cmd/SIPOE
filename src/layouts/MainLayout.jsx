import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { LayoutDashboard, Users, FileText, ClipboardList, Settings, LogOut, Menu, Calendar, Bot, PenTool, Contact, Search, CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../components/GlobalSearch';
import { useSync } from '../contexts/SyncContext';

export default function MainLayout() {
  const { session, userProfile, permisos } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isOnline, isSyncing, pendingCount } = useSync();

  // Saludo logic
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingMsg, setGreetingMsg] = useState('');

  useEffect(() => {
    if (userProfile?.nombre) {
      const hour = new Date().getHours();
      let msg = '';
      if (hour < 12) msg = `Buenos días, ${userProfile.nombre}`;
      else if (hour < 19) msg = `Buenas tardes, ${userProfile.nombre}`;
      else msg = `Buenas noches, ${userProfile.nombre}`;
      
      setGreetingMsg(msg);
      
      // Desaparecer después de 6 segundos
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setShowGreeting(false);
    }
  }, [userProfile]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, visible: true },
    { name: 'Estudiantes', path: '/estudiantes', icon: Users, visible: permisos?.can_view_estudiantes },
    { name: 'Agenda', path: '/agenda', icon: Calendar, visible: permisos?.can_view_agenda },
    { name: 'Atenciones', path: '/atenciones', icon: FileText, visible: true },
    { name: 'Seguimientos', path: '/seguimientos', icon: ClipboardList, visible: true },
    { name: 'Directorios', path: '/directorios', icon: Contact, visible: permisos?.can_view_estudiantes },
    { name: 'Asistente IA', path: '/ia', icon: Bot, visible: permisos?.can_view_ia },
    { name: 'Historial Firmas', path: '/firmas', icon: PenTool, visible: permisos?.can_edit },
    { name: 'Configuración', path: '/configuracion', icon: Settings, visible: true },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block flex flex-col shadow-sm`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">SIPOE</span>
          </div>

          <div className="px-4 pt-6 pb-2">
            <GlobalSearch />
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <nav className="space-y-1">
              {navItems.filter(item => item.visible).map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-indigo-400'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Saludo Integrado en Sidebar */}
            {showGreeting && greetingMsg && (
              <div className="mt-6 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm animate-fade-in-up transition-opacity duration-500">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                  👋 {greetingMsg}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-3">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {userProfile?.nombre || session.user.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.rol || 'Orientadora'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Cerrar Sesión
            </button>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                Copyright © Todos los derechos reservados.<br/>Desarrollado por<br/>Carlos Andrés Jiménez Murillo
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar Mobile */}
        <header className="h-16 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-4 md:hidden z-10 sticky top-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-slate-900 dark:text-white">SIPOE</span>
        </header>

        <div className="flex-1 p-2 sm:p-4 lg:p-4 flex flex-col overflow-hidden min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="h-full flex flex-col overflow-hidden w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Premium Offline Sync Indicator */}
          <AnimatePresence>
            {(!isOnline || isSyncing || pendingCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border font-medium text-sm transition-colors"
                style={{
                  backgroundColor: !isOnline ? 'rgba(239, 68, 68, 0.1)' : isSyncing ? 'rgba(99, 102, 241, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  borderColor: !isOnline ? 'rgba(239, 68, 68, 0.2)' : isSyncing ? 'rgba(99, 102, 241, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  color: !isOnline ? '#ef4444' : isSyncing ? '#6366f1' : '#22c55e'
                }}
              >
                {!isOnline ? (
                  <>
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <CloudOff className="w-5 h-5" />
                    <span className="flex flex-col">
                      <span className="font-bold">Modo Offline</span>
                      {pendingCount > 0 && <span className="text-xs opacity-80">{pendingCount} en cola secreta</span>}
                    </span>
                  </>
                ) : isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Sincronizando {pendingCount} datos con la Nube...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    <span>{pendingCount} Pendientes de Sync</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
