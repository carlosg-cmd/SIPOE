-- 1. Tabla de Usuarios (Perfiles extendidos vinculados a la autenticación de Supabase)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    rol TEXT CHECK (rol IN ('Administrador', 'Orientador')) NOT NULL DEFAULT 'Orientador',
    estado BOOLEAN DEFAULT true,
    firma_digital_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configuración Institucional
CREATE TABLE public.configuracion_institucional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_colegio TEXT NOT NULL,
    resolucion TEXT,
    lema TEXT,
    logo_url TEXT,
    nombre_orientadora TEXT,
    correo_institucional TEXT
);

-- 3. Tabla de Sedes
CREATE TABLE public.sedes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_sede TEXT NOT NULL,
    direccion TEXT
);

-- 4. Tabla de Estudiantes
CREATE TABLE public.estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento TEXT NOT NULL,
    documento TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    fecha_nacimiento DATE,
    edad INTEGER,
    sexo TEXT,
    lugar_nacimiento TEXT,
    sede_id UUID REFERENCES public.sedes(id),
    jornada TEXT,
    grado TEXT,
    director_grupo TEXT,
    telefono TEXT,
    direccion TEXT,
    eps TEXT,
    -- Datos Familiares agrupados (Se pueden guardar como JSONB para flexibilidad)
    datos_padre JSONB,
    datos_madre JSONB,
    datos_acudiente JSONB,
    descripcion_familiar TEXT,
    numero_hermanos INTEGER,
    lugar_hermanos INTEGER,
    con_quien_vive TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Consentimientos
CREATE TABLE public.consentimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    declaracion_acudiente BOOLEAN DEFAULT false,
    asentimiento_estudiante BOOLEAN DEFAULT false,
    observaciones TEXT,
    url_pdf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Atenciones (RF-03)
CREATE TABLE public.atenciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    orientador_id UUID REFERENCES public.usuarios(id),
    fecha DATE NOT NULL,
    nombre_remitente TEXT,
    cargo_remitente TEXT,
    motivos JSONB, -- Array de motivos (desempeño, convivencia, etc)
    descripcion TEXT,
    observaciones TEXT,
    orientaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Seguimientos (RF-04)
CREATE TABLE public.seguimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id UUID REFERENCES public.atenciones(id) ON DELETE CASCADE,
    mes TEXT,
    anio INTEGER,
    responsable UUID REFERENCES public.usuarios(id),
    compromisos TEXT,
    encuentro_1 JSONB, -- { fecha, resultado, observacion }
    encuentro_2 JSONB,
    encuentro_3 JSONB,
    encuentro_4 JSONB,
    valoracion_final TEXT,
    decision_final TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Remisiones a Coordinación (RF-05)
CREATE TABLE public.remisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seguimiento_id UUID REFERENCES public.seguimientos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    quien_remite TEXT,
    motivos JSONB,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Activación de Ruta (RF-06)
CREATE TABLE public.activacion_ruta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id UUID REFERENCES public.atenciones(id) ON DELETE CASCADE,
    entidad_destino TEXT,
    motivos JSONB,
    descripcion TEXT,
    acciones_realizadas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Atención a Padres (RF-07)
CREATE TABLE public.atencion_padres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    lugar TEXT,
    responsable UUID REFERENCES public.usuarios(id),
    proposito TEXT,
    desarrollo TEXT,
    acuerdos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Intervenciones Grupales (RF-08)
CREATE TABLE public.intervenciones_grupales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    grado TEXT,
    jornada TEXT,
    docente_titular TEXT,
    tematica TEXT,
    motivo TEXT,
    duracion_minutos INTEGER,
    nombre_actividad TEXT,
    objetivo TEXT,
    descripcion TEXT,
    recursos TEXT,
    responsable UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Notificaciones Internas (RF-10)
CREATE TABLE public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ciudad TEXT,
    fecha DATE NOT NULL,
    destinatario TEXT,
    cargo TEXT,
    asunto TEXT,
    cuerpo TEXT,
    orientadora_id UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Sincronización Offline (Cola de peticiones)
-- Esta tabla existe en el cliente local (IndexedDB) pero creamos una en Supabase 
-- por si necesitamos mantener un log de los eventos sincronizados (opcional).
CREATE TABLE public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id),
    accion TEXT,
    tabla_afectada TEXT,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 🔒 ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) - REQUISITO DE LEY 1581 DE 2012
-- ==============================================================================

-- Habilitamos RLS en todas las tablas para garantizar la seguridad
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_institucional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activacion_ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atencion_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervenciones_grupales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (Permitir acceso solo a usuarios autenticados)
-- NOTA: Como la orientadora debe iniciar sesión, todas las operaciones exigen estar autenticado.
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.configuracion_institucional FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.sedes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.estudiantes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.consentimientos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.atenciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.seguimientos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.remisiones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.activacion_ruta FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.atencion_padres FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.intervenciones_grupales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.notificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados" ON public.sync_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
