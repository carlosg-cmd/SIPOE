import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
  const { data, error } = await supabase
    .from('atenciones')
    .select(`
      *,
      estudiantes (
        nombres, apellidos, grado, jornada, director_grupo, telefono, datos_acudiente,
        sedes (nombre)
      )
    `)
    .order('fecha', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Data:", JSON.stringify(data, null, 2));
  }
}

testQuery();
