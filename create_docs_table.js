import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Usamos anon key localmente para testing o supabase-js

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.documentos_generados (
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

    DROP POLICY IF EXISTS "docs_select" ON public.documentos_generados;
    CREATE POLICY "docs_select" ON public.documentos_generados FOR SELECT TO authenticated 
      USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');

    DROP POLICY IF EXISTS "docs_insert" ON public.documentos_generados;
    CREATE POLICY "docs_insert" ON public.documentos_generados FOR INSERT TO authenticated WITH CHECK (true);

    DROP POLICY IF EXISTS "docs_delete" ON public.documentos_generados;
    CREATE POLICY "docs_delete" ON public.documentos_generados FOR DELETE TO authenticated 
      USING (orientador_id = auth.uid() OR public.get_my_role() = 'Administrador');
  `;

  // Workaround: Supabase JS client doesn't support raw SQL execution directly from the client.
  // We'll write this script, but the user usually manages the schema.
  console.log("SQL Schema to apply:");
  console.log(sql);
}

run();
