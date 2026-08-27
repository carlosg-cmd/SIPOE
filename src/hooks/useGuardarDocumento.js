import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

// Mapeo de tipo_formato → nombre legible
const NOMBRES_FORMATO = {
  consentimiento: '1. Consentimiento Informado',
  atencion: '2. Atención Orientación Escolar',
  padres_acudientes: '3. Atención a Padres/Acudientes',
  convivencia: '4. Seguimiento Convivencia Escolar',
  remision_coord: '5. Remisión Caso a Coordinación',
  intervencion_grupal: '6. Intervenciones Grupales',
  informe_entrega_casos: '7. Informe de Entrega de Casos',
  remision_entidades: '8. Remisión a Entidades',
};

/**
 * Guarda un registro de documento generado en la tabla `documentos_generados`.
 * Si ya existe un documento para el mismo estudiante y tipo de formato, añade la página/snapshot al documento existente (Opción B: Documento Multi-página).
 * @param {object} atencionData - El objeto de atención (con .estudiantes, .id, etc.)
 * @param {string} tipoFormato  - Clave del formato (ej: 'consentimiento')
 * @param {object} [extra]      - Datos extra opcionales (campos del formulario editado)
 * @returns {Promise<boolean>}  - true si se guardó, false si hubo error
 */
export async function guardarDocumento(atencionData, tipoFormato, extra = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const est = atencionData?.estudiantes || atencionData?.estudiante || {};
    const nombreEstudiante = est.nombres && est.apellidos
      ? `${est.nombres} ${est.apellidos}`.trim()
      : (est.nombres || atencionData?.nombre_estudiante || 'Estudiante desconocido');

    const estudianteId = est?.id || atencionData?.estudiante_id || null;

    // Construir el snapshot de esta página/atención
    const nuevoSnapshot = {
      fecha: atencionData?.fecha || new Date().toLocaleDateString('es-CO'),
      grado: est?.grado || atencionData?.grado || '',
      documento: est?.documento || atencionData?.documento || '',
      motivos: atencionData?.motivos || [],
      ...atencionData,
      ...extra,
    };

    // Buscar si ya existe un documento para este estudiante y formato
    let existingDoc = null;
    if (estudianteId) {
      const { data: found } = await supabase
        .from('documentos_generados')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .eq('tipo_formato', tipoFormato)
        .order('created_at', { ascending: false })
        .limit(1);

      if (found && found.length > 0) {
        existingDoc = found[0];
      }
    } else if (nombreEstudiante && nombreEstudiante !== 'Estudiante desconocido') {
      const { data: found } = await supabase
        .from('documentos_generados')
        .select('*')
        .eq('nombre_estudiante', nombreEstudiante)
        .eq('tipo_formato', tipoFormato)
        .order('created_at', { ascending: false })
        .limit(1);

      if (found && found.length > 0) {
        existingDoc = found[0];
      }
    }

    if (existingDoc) {
      // Ya existe: añadir página al array de snapshots
      const currentSnapshots = Array.isArray(existingDoc.datos_snapshot)
        ? [...existingDoc.datos_snapshot]
        : (existingDoc.datos_snapshot ? [existingDoc.datos_snapshot] : []);

      currentSnapshots.push(nuevoSnapshot);

      const { error: updateError } = await supabase
        .from('documentos_generados')
        .update({
          datos_snapshot: currentSnapshots,
          fecha_generacion: new Date().toISOString(),
        })
        .eq('id', existingDoc.id);

      if (updateError) throw updateError;

      toast.success(`✅ Página añadida al documento de ${nombreEstudiante} (Total: ${currentSnapshots.length} páginas)`, {
        duration: 3500,
        style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
      });
      return true;
    } else {
      // No existe: crear nuevo documento con array de 1 snapshot
      const registro = {
        atencion_id: atencionData?.id || null,
        estudiante_id: estudianteId,
        orientador_id: user.id,
        tipo_formato: tipoFormato,
        nombre_formato: NOMBRES_FORMATO[tipoFormato] || tipoFormato,
        nombre_estudiante: nombreEstudiante,
        datos_snapshot: [nuevoSnapshot],
      };

      const { error: insertError } = await supabase
        .from('documentos_generados')
        .insert([registro]);

      if (insertError) throw insertError;

      toast.success('✅ Documento guardado en la Biblioteca', {
        duration: 3000,
        style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
      });
      return true;
    }
  } catch (err) {
    console.error('Error guardando documento:', err);
    toast.error('No se pudo guardar en la Biblioteca');
    return false;
  }
}
