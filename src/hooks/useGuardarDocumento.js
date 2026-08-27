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
      : (est.nombres || 'Estudiante desconocido');

    const registro = {
      atencion_id: atencionData?.id || null,
      estudiante_id: est?.id || atencionData?.estudiante_id || null,
      orientador_id: user.id,
      tipo_formato: tipoFormato,
      nombre_formato: NOMBRES_FORMATO[tipoFormato] || tipoFormato,
      nombre_estudiante: nombreEstudiante,
      datos_snapshot: {
        fecha: atencionData?.fecha,
        grado: est?.grado,
        documento: est?.documento,
        motivos: atencionData?.motivos,
        ...extra,
      },
    };

    const { error } = await supabase
      .from('documentos_generados')
      .insert([registro]);

    if (error) throw error;

    toast.success('✅ Documento guardado en la Biblioteca', {
      duration: 3000,
      style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' },
    });
    return true;
  } catch (err) {
    console.error('Error guardando documento:', err);
    toast.error('No se pudo guardar en la Biblioteca');
    return false;
  }
}
