-- 1. Tabla de Perfiles de Usuarios (Perfiles extendidos vinculados a la autenticación de Supabase)
CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    rol TEXT CHECK (rol IN ('Administrador', 'Orientador', 'Lector', 'Pendiente')) NOT NULL DEFAULT 'Orientador',
    estado BOOLEAN DEFAULT true,
    firma_digital_url TEXT,
    permisos JSONB DEFAULT '{}'::jsonb,
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
    orientador_id UUID REFERENCES public.perfiles(id),
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
    responsable UUID REFERENCES public.perfiles(id),
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
    responsable UUID REFERENCES public.perfiles(id),
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
    responsable UUID REFERENCES public.perfiles(id),
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
    orientadora_id UUID REFERENCES public.perfiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Sincronización Offline (Cola de peticiones)
CREATE TABLE public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.perfiles(id),
    accion TEXT,
    tabla_afectada TEXT,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Tabla de Directorios
CREATE TABLE public.directorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    cargo_descripcion TEXT,
    telefono TEXT,
    correo TEXT,
    direccion TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Tabla de Firmas
CREATE TABLE public.firmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    documento TEXT,
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Tabla de Agenda
CREATE TABLE public.agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE SET NULL,
    orientador_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 🔒 ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) - REQUISITO DE LEY 1581 DE 2012
-- ==============================================================================

-- Habilitamos RLS en todas las tablas para garantizar la seguridad
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.directorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 🔑 FUNCIÓN AUXILIAR: Obtener rol del usuario actual
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$;

-- ==============================================================================
-- 📋 POLÍTICAS DE SEGURIDAD - SEGREGACIÓN POR ORIENTADORA
-- ==============================================================================
-- Regla general:
--   • Administradores ven TODO.
--   • Orientadores ven solo sus propios registros (donde ellos son el responsable/orientador_id).
--   • Estudiantes son visibles para todos los autenticados (para atenciones cruzadas de sedes).
--   • Tablas de referencia (sedes, configuración, directorios) son de lectura abierta.

-- ── PERFILES ──────────────────────────────────────────────────────────────────
CREATE POLICY "perfiles_select" ON public.perfiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "perfiles_insert" ON public.perfiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "perfiles_update" ON public.perfiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.get_my_role() = 'Administrador')
  WITH CHECK (id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "perfiles_delete" ON public.perfiles FOR DELETE TO authenticated
  USING (public.get_my_role() = 'Administrador');

-- ── CONFIGURACIÓN INSTITUCIONAL ───────────────────────────────────────────────
CREATE POLICY "config_select" ON public.configuracion_institucional FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_modify" ON public.configuracion_institucional FOR ALL TO authenticated
  USING (public.get_my_role() = 'Administrador') WITH CHECK (public.get_my_role() = 'Administrador');

-- ── SEDES ─────────────────────────────────────────────────────────────────────
CREATE POLICY "sedes_select" ON public.sedes FOR SELECT TO authenticated USING (true);
CREATE POLICY "sedes_modify" ON public.sedes FOR ALL TO authenticated
  USING (public.get_my_role() = 'Administrador') WITH CHECK (public.get_my_role() = 'Administrador');

-- ── ESTUDIANTES (visibles para todos los autenticados) ────────────────────────
CREATE POLICY "estudiantes_select" ON public.estudiantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "estudiantes_insert" ON public.estudiantes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estudiantes_update" ON public.estudiantes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estudiantes_delete" ON public.estudiantes FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('Administrador', 'Orientador'));

-- ── CONSENTIMIENTOS ───────────────────────────────────────────────────────────
CREATE POLICY "consentimientos_all" ON public.consentimientos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── ATENCIONES (segregadas por orientador_id) ─────────────────────────────────
CREATE POLICY "atenciones_select" ON public.atenciones FOR SELECT TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "atenciones_insert" ON public.atenciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "atenciones_update" ON public.atenciones FOR UPDATE TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "atenciones_delete" ON public.atenciones FOR DELETE TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');

-- ── SEGUIMIENTOS (segregados: el responsable o admin) ─────────────────────────
CREATE POLICY "seguimientos_select" ON public.seguimientos FOR SELECT TO authenticated
  USING (
    responsable = auth.uid()
    OR public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );
CREATE POLICY "seguimientos_insert" ON public.seguimientos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "seguimientos_update" ON public.seguimientos FOR UPDATE TO authenticated
  USING (
    responsable = auth.uid()
    OR public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );
CREATE POLICY "seguimientos_delete" ON public.seguimientos FOR DELETE TO authenticated
  USING (
    responsable = auth.uid()
    OR public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );

-- ── REMISIONES ────────────────────────────────────────────────────────────────
CREATE POLICY "remisiones_select" ON public.remisiones FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR seguimiento_id IN (
      SELECT s.id FROM public.seguimientos s
      WHERE s.responsable = auth.uid()
         OR s.atencion_id IN (SELECT a.id FROM public.atenciones a WHERE a.orientador_id = auth.uid())
    )
  );
CREATE POLICY "remisiones_insert" ON public.remisiones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "remisiones_update" ON public.remisiones FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR seguimiento_id IN (
      SELECT s.id FROM public.seguimientos s
      WHERE s.responsable = auth.uid()
         OR s.atencion_id IN (SELECT a.id FROM public.atenciones a WHERE a.orientador_id = auth.uid())
    )
  );
CREATE POLICY "remisiones_delete" ON public.remisiones FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR seguimiento_id IN (
      SELECT s.id FROM public.seguimientos s
      WHERE s.responsable = auth.uid()
         OR s.atencion_id IN (SELECT a.id FROM public.atenciones a WHERE a.orientador_id = auth.uid())
    )
  );

-- ── ACTIVACIÓN DE RUTA ───────────────────────────────────────────────────────
CREATE POLICY "activacion_ruta_select" ON public.activacion_ruta FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );
CREATE POLICY "activacion_ruta_insert" ON public.activacion_ruta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "activacion_ruta_update" ON public.activacion_ruta FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );
CREATE POLICY "activacion_ruta_delete" ON public.activacion_ruta FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'Administrador'
    OR atencion_id IN (SELECT id FROM public.atenciones WHERE orientador_id = auth.uid())
  );

-- ── ATENCIÓN A PADRES (segregada por responsable) ─────────────────────────────
CREATE POLICY "atencion_padres_select" ON public.atencion_padres FOR SELECT TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "atencion_padres_insert" ON public.atencion_padres FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "atencion_padres_update" ON public.atencion_padres FOR UPDATE TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "atencion_padres_delete" ON public.atencion_padres FOR DELETE TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');

-- ── INTERVENCIONES GRUPALES (segregadas por responsable) ──────────────────────
CREATE POLICY "intervenciones_select" ON public.intervenciones_grupales FOR SELECT TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "intervenciones_insert" ON public.intervenciones_grupales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "intervenciones_update" ON public.intervenciones_grupales FOR UPDATE TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "intervenciones_delete" ON public.intervenciones_grupales FOR DELETE TO authenticated
  USING (responsable = auth.uid() OR public.get_my_role() = 'Administrador');

-- ── NOTIFICACIONES (segregadas por orientadora_id) ────────────────────────────
CREATE POLICY "notificaciones_select" ON public.notificaciones FOR SELECT TO authenticated
  USING (orientadora_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "notificaciones_insert" ON public.notificaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notificaciones_update" ON public.notificaciones FOR UPDATE TO authenticated
  USING (orientadora_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "notificaciones_delete" ON public.notificaciones FOR DELETE TO authenticated
  USING (orientadora_id = auth.uid() OR public.get_my_role() = 'Administrador');

-- ── SYNC LOGS ─────────────────────────────────────────────────────────────────
CREATE POLICY "sync_logs_all" ON public.sync_logs FOR ALL TO authenticated
  USING (usuario_id = auth.uid() OR public.get_my_role() = 'Administrador')
  WITH CHECK (usuario_id = auth.uid() OR public.get_my_role() = 'Administrador');

-- ── DIRECTORIOS (lectura abierta, escritura para orientadores y admins) ───────
CREATE POLICY "directorios_select" ON public.directorios FOR SELECT TO authenticated USING (true);
CREATE POLICY "directorios_insert" ON public.directorios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "directorios_update" ON public.directorios FOR UPDATE TO authenticated USING (true);
CREATE POLICY "directorios_delete" ON public.directorios FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('Administrador', 'Orientador'));

-- ── FIRMAS ────────────────────────────────────────────────────────────────────
CREATE POLICY "firmas_all" ON public.firmas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── AGENDA (segregada por orientador_id) ──────────────────────────────────────
CREATE POLICY "agenda_select" ON public.agenda FOR SELECT TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "agenda_insert" ON public.agenda FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agenda_update" ON public.agenda FOR UPDATE TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "agenda_delete" ON public.agenda FOR DELETE TO authenticated
  USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');


-- ==============================================================================
-- 🤖 TRIGGER: Crear perfil automáticamente al registrarse (email o Google OAuth)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, correo, rol, estado)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',   -- nombre provisto por Google OAuth
      NEW.raw_user_meta_data ->> 'name',         -- alternativa
      split_part(NEW.email, '@', 1)              -- fallback: parte local del email
    ),
    NEW.email,
    'Pendiente',  -- Los nuevos usuarios requieren aprobación del administrador
    false         -- Inactivo hasta que un admin lo habilite
  );
  RETURN NEW;
END;
$$;

-- Vincular el trigger al evento de creación de usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BIBLIOTECA DE DOCUMENTOS
CREATE TABLE public.documentos_generados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id UUID REFERENCES public.atenciones(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES public.estudiantes(id) ON DELETE CASCADE,
    orientador_id UUID REFERENCES public.perfiles(id),
    tipo_formato TEXT NOT NULL,
    nombre_formato TEXT NOT NULL,
    nombre_estudiante TEXT,
    fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
    datos_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.documentos_generados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_select" ON public.documentos_generados FOR SELECT TO authenticated USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "docs_insert" ON public.documentos_generados FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "docs_update" ON public.documentos_generados FOR UPDATE TO authenticated USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador') WITH CHECK (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
CREATE POLICY "docs_delete" ON public.documentos_generados FOR DELETE TO authenticated USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
