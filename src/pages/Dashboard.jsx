import { useState, useEffect } from 'react';
import { Users, FileText, ClipboardList, Activity, Clock, BarChart3, PieChart as PieChartIcon, TrendingUp, Bell, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, Label
} from 'recharts';

export default function Dashboard() {
  const { userProfile, permisos } = useAuth();
  const [stats, setStats] = useState({
    estudiantesEnControl: 0,
    atencionesMes: 0,
    seguimientosActivos: 0
  });
  const [actividadReciente, setActividadReciente] = useState([]);
  const [datosGrados, setDatosGrados] = useState([]);
  const [datosEstados, setDatosEstados] = useState([]);
  const [datosMeses, setDatosMeses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greetingShown, setGreetingShown] = useState(false);

  const [alertCitas, setAlertCitas] = useState(null);

  // Alerta de Agenda (Mañana)
  useEffect(() => {
    const checkAgenda = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const localISOTime = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      // Verificar si ya fue descartada hoy
      const dismissed = localStorage.getItem(`agenda_dismissed_${localISOTime}`);
      if (dismissed) return;

      const { data } = await supabase
        .from('agenda')
        .select('*')
        .gte('fecha_cita', `${localISOTime}T00:00:00`)
        .lte('fecha_cita', `${localISOTime}T23:59:59`)
        .or('estado.neq.Completada,estado.is.null');

      if (data && data.length > 0) {
        setAlertCitas({
          count: data.length,
          dateKey: localISOTime
        });
      }
    };
    if (permisos?.can_view_agenda) {
      checkAgenda();
    }
  }, [permisos?.can_view_agenda]);

  const handleDismissAlert = () => {
    if (alertCitas) {
      localStorage.setItem(`agenda_dismissed_${alertCitas.dateKey}`, 'true');
      setAlertCitas(null);
    }
  };

  const COLORES_ESTADO = {
    'En proceso': '#fbbf24',
    'Resuelto': '#34d399',
    'Pendiente': '#f87171',
    'Remitido': '#60a5fa'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Estudiantes en Control
      const { data: atencionesEstudiantes } = await supabase.from('atenciones').select('estudiante_id, estudiantes(grado)');
      const { data: seguimientosEstudiantes } = await supabase.from('seguimientos').select('estudiante_id, estado');
      
      const estudiantesUnicos = new Set();
      const conteoGrados = {};
      let atencionesMes = 0;
      let seguimientosActivos = 0;
      const conteoEstados = {};

      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth();
      const añoActual = fechaActual.getFullYear();
      
      const { data: todasAtenciones } = await supabase.from('atenciones').select('created_at, estudiante_id, estudiantes(grado)');
      
      if (todasAtenciones) {
        todasAtenciones.forEach(atencion => {
          estudiantesUnicos.add(atencion.estudiante_id);
          const d = new Date(atencion.created_at);
          if (d.getMonth() === mesActual && d.getFullYear() === añoActual) {
            atencionesMes++;
          }
          const grado = atencion.estudiantes?.grado || 'Sin Grado';
          conteoGrados[grado] = (conteoGrados[grado] || 0) + 1;
        });
      }

      if (seguimientosEstudiantes) {
        seguimientosEstudiantes.forEach(seg => {
          estudiantesUnicos.add(seg.estudiante_id);
          const estado = seg.estado || 'Pendiente';
          conteoEstados[estado] = (conteoEstados[estado] || 0) + 1;
          if (estado === 'En proceso') seguimientosActivos++;
        });
      }

      const chartGrados = Object.keys(conteoGrados).map(key => ({
        name: key,
        casos: conteoGrados[key]
      })).sort((a, b) => b.casos - a.casos).slice(0, 5);

      const chartEstados = Object.keys(conteoEstados).map(key => ({
        name: key,
        value: conteoEstados[key]
      }));

      // Gráfico Meses
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const conteoMeses = {};
      if (todasAtenciones) {
        todasAtenciones.forEach(atencion => {
          const date = new Date(atencion.created_at);
          const mes = `${mesesNombres[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
          conteoMeses[mes] = (conteoMeses[mes] || 0) + 1;
        });
      }
      
      const chartMeses = Object.keys(conteoMeses).map(key => ({
        name: key,
        atenciones: conteoMeses[key]
      }));

      setStats({
        estudiantesEnControl: estudiantesUnicos.size,
        atencionesMes: atencionesMes,
        seguimientosActivos: seguimientosActivos
      });

      setDatosGrados(chartGrados);
      setDatosMeses(chartMeses);
      setDatosEstados(chartEstados);

      // Actividad Reciente
      const { data: ultimasAtenciones } = await supabase.from('atenciones').select('id, fecha, created_at, estudiante_id, estudiantes(nombres, apellidos, grado)').order('created_at', { ascending: false }).limit(3);
      const { data: ultimosSeguimientos } = await supabase.from('seguimientos').select('id, fecha, created_at, tipo_seguimiento, estudiante_id, estudiantes(nombres, apellidos, grado)').order('created_at', { ascending: false }).limit(3);

      let combinados = [];
      if (ultimasAtenciones) combinados = [...combinados, ...ultimasAtenciones.map(a => ({...a, tipo: 'Atención'}))];
      if (ultimosSeguimientos) combinados = [...combinados, ...ultimosSeguimientos.map(s => ({...s, tipo: `Seguimiento: ${s.tipo_seguimiento}`}))];

      combinados.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActividadReciente(combinados.slice(0, 4));

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col min-w-0 overflow-hidden">
      <div className="mb-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Panel de Control</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Resumen analítico del Sistema de Orientación Escolar.
          </p>
        </div>
        <button onClick={fetchDashboardData} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-xs transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 w-fit">
          Actualizar Datos
        </button>
      </div>

      {/* Alerta Persistente de Agenda */}
      {alertCitas && (
        <div className="mb-1 bg-indigo-50 border border-indigo-200 rounded-xl p-1 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <div className="p-1 bg-indigo-100 text-indigo-600 rounded-full mr-4">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 text-sm sm:text-base">Recordatorio de Agenda</h3>
              <p className="text-indigo-700 text-xs sm:text-sm mt-0.5">
                Tienes <strong>{alertCitas.count} cita(s)</strong> programada(s) para mañana. Por favor verifica para avisar a los estudiantes.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismissAlert}
            className="flex flex-col items-center justify-center p-1 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors group ml-4"
            title="Marcar como notificado"
          >
            <CheckCircle2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">¡Listo!</span>
          </button>
        </div>
      )}

      {/* Stats Cards - Más pequeñas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex items-center hover:scale-[1.02] transition-transform">
          <div className="p-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Users size={20} />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Estudiantes en Control</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {loading ? <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div> : stats.estudiantesEnControl}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex items-center hover:scale-[1.02] transition-transform">
          <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <FileText size={20} />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Atenciones (Este Mes)</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {loading ? <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div> : stats.atencionesMes}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex items-center hover:scale-[1.02] transition-transform">
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <ClipboardList size={20} />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Casos en Proceso</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {loading ? <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div> : stats.seguimientosActivos}
            </h3>
          </div>
        </div>
      </div>

      {/* Gráficos en una sola fila */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 mb-1 flex-shrink-0">
        {/* Atenciones por Mes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex flex-col min-w-0 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-indigo-500" />
            Evolución de Atenciones
          </h2>
          <div className="flex-1 w-full min-h-[5rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosMeses}>
                <defs>
                  <linearGradient id="colorAtenciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="atenciones" stroke="#6366f1" fillOpacity={1} fill="url(#colorAtenciones)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Casos por Grado */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex flex-col min-w-0 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center">
            <BarChart3 className="w-4 h-4 mr-1 text-indigo-500" />
            Casos por Grado (Top 5)
          </h2>
          <div className="flex-1 w-full pt-1">
            <div className="flex flex-col justify-center h-full space-y-1.5 px-1">
              {datosGrados.map((grado, index) => {
                const maxCasos = Math.max(...datosGrados.map(g => g.casos), 1);
                const width = `${(grado.casos / maxCasos) * 100}%`;
                return (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate pr-2 leading-none">{grado.name}</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-none">{grado.casos}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width }}></div>
                    </div>
                  </div>
                );
              })}
              {datosGrados.length === 0 && (
                <p className="text-xs text-slate-500 text-center">No hay datos</p>
              )}
            </div>
          </div>
        </div>

        {/* Estado de Seguimientos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex flex-col min-w-0 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center">
            <PieChartIcon className="w-4 h-4 mr-1 text-indigo-500" />
            Estado de Seguimientos
          </h2>
          <div className="flex-1 w-full min-h-[5rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosEstados}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Label 
                    value={datosEstados.reduce((acc, curr) => acc + curr.value, 0)} 
                    position="center" 
                    fill="#334155"
                    style={{ fontSize: '16px', fontWeight: 'bold' }} 
                  />
                  {datosEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_ESTADO[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actividad Reciente - Más compacta */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center">
          <Activity className="w-4 h-4 mr-1 text-indigo-500" />
          Actividad Reciente
        </h2>
        
        {loading ? (
          <div className="space-y-3 flex-1 px-2 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : actividadReciente.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-2 opacity-80">
            <ClipboardList className="w-8 h-8 text-indigo-300 dark:text-indigo-700 mb-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Todo tranquilo por aquí</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[200px]">
              No hay actividad reciente.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-hidden flex-1">
            {actividadReciente.map((actividad, index) => (
              <div key={index} className="flex items-start border-l-2 border-indigo-100 dark:border-indigo-900/50 pl-3 py-1">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-3">
                  <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {actividad.tipo} - {actividad.estudiantes?.nombres} {actividad.estudiantes?.apellidos}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {actividad.estudiantes?.grado} • {new Date(actividad.fecha || actividad.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
