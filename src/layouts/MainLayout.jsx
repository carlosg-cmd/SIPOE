import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { LogOut, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

export default function MainLayout() {
  const { session, userProfile } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuConfig = [
    { name: 'Inicio', path: '/', icon: '■' },
    { 
      name: 'Estudiantes', icon: '👤',
      subItems: [
        { name: 'Directorio', path: '/estudiantes' }
      ]
    },
    { 
      name: 'Formatos', icon: '■',
      subItems: [
        { name: 'Consentimiento informado', path: '/formatos/consentimiento' },
        { name: 'At. orientación escolar', path: '/atenciones' },
        { name: 'At. con padres', path: '/formatos/padres' },
        { name: 'Convivencia', path: '/seguimientos' },
        { name: 'Rem. coordinación', path: '/formatos/coordinacion' },
        { name: 'Intervenciones grupales', path: '/intervenciones-grupales' },
        { name: 'Inf. entrega de caso', path: '/formatos/entrega' },
        { name: 'Rem. entidad', path: '/formatos/entidad' }
      ]
    },
    { 
      name: 'Informes', icon: '📄',
      subItems: [
        { name: 'Casos por género', path: '/informes/genero' },
        { name: 'Estudiantes por sede', path: '/informes/sede' },
        { name: 'Historial de casos por año', path: '/informes/historial' }
      ]
    },
    { name: 'Biblioteca de documentos', path: '/biblioteca-documentos', icon: '📁' },
    { name: 'Agenda', path: '/agenda', icon: '■' },
    { name: 'Historial de firmas', path: '/firmas', icon: '✍' },
    { name: 'Asistente IA', path: '/ia', icon: '💡' },
    { 
      name: 'Configuración', icon: '⚙',
      subItems: [
        { name: 'Administrar perfil', path: '/configuracion?tab=perfil' },
        { name: 'Institución', path: '/configuracion?tab=institucion' },
        { name: 'Apariencia', path: '/configuracion?tab=apariencia' }
      ]
    },
    { name: 'Soporte en línea', path: '/soporte', icon: '💬' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-sans text-slate-700">
      
      {/* Sidebar Desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block shadow-xl`}
        style={{ backgroundColor: '#185FA5' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-[72px] flex items-center px-6 border-b border-white/10 shrink-0">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mr-3">
               <div className="w-3.5 h-3.5 rounded-full bg-[#185FA5]" />
            </div>
            <span className="text-xl font-bold tracking-wide">SIPOE</span>
          </div>

          {/* Menú de Navegación */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20">
            <nav className="space-y-1">
              {menuConfig.map((item) => {
                const isAccordion = !!item.subItems;
                const isActive = item.path ? location.pathname === item.path : false;
                const isExpanded = expandedMenus[item.name];
                
                // Si la ruta actual coincide con algún subítem
                const hasActiveSub = isAccordion && item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path));

                return (
                  <div key={item.name}>
                    {isAccordion ? (
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${hasActiveSub ? 'bg-[#1E4D8C] border-l-4 border-white' : 'border-l-4 border-transparent'}`}
                      >
                        <div className="flex items-center">
                          <span className="w-6 text-center mr-2 opacity-80">{item.icon}</span>
                          {item.name}
                        </div>
                        {isExpanded ? <ChevronDown size={16} className="opacity-70" /> : <ChevronRight size={16} className="opacity-70" />}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${isActive ? 'bg-[#1E4D8C] border-l-4 border-white' : 'border-l-4 border-transparent'}`}
                      >
                        <span className="w-6 text-center mr-2 opacity-80">{item.icon}</span>
                        {item.name}
                      </Link>
                    )}

                    {/* Submenús */}
                    {isAccordion && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-[#124982] shadow-inner"
                          >
                            {item.subItems.map(sub => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`block w-full text-left pl-14 pr-6 py-2.5 text-sm transition-colors hover:bg-white/10 ${location.pathname === sub.path ? 'text-white font-semibold' : 'text-white/70'}`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Botón de Cerrar Sesión */}
          <div className="shrink-0 p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white/80 hover:bg-white/10 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Topbar Desktop & Mobile */}
        <header className="h-[72px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-3 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block text-slate-800 font-semibold text-lg">
              {settings?.institucion || 'I.E. Divino Niño'} <span className="text-slate-400 font-normal">/ Sede: {settings?.sedes?.[0] || 'Principal'}</span>
            </div>
            <div className="sm:hidden text-slate-800 font-bold text-lg">SIPOE</div>
          </div>
          
          <div className="flex items-center text-sm font-medium text-slate-600">
            Año lectivo: <span className="ml-1 font-bold">{currentYear}</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto w-full relative bg-[#f8fafc]">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
