const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.directorios (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL,
        cargo_descripcion TEXT,
        telefono TEXT,
        correo TEXT,
        direccion TEXT,
        notas TEXT
      );
    `
  });
  console.log('Result:', data, error);
}
run();
