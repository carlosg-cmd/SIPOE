import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

/* ============================================================
   ESTILOS — Calco fiel del documento original Word
   ============================================================ */
const BLUE = '#1a3c6d';
const LIGHT_BLUE_BG = '#c5d9f0';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#000',
  },
  /* -------- HEADER / MEMBRETE -------- */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  logoBox: { width: 60, height: 60, marginRight: 8 },
  logo: { width: 55, height: 55, objectFit: 'contain' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerInst: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  headerRes: { fontSize: 8, marginTop: 1 },
  headerMotto: { fontSize: 8, fontFamily: 'Helvetica-BoldOblique', marginTop: 1 },
  headerRight: {
    width: 90,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    alignItems: 'center',
    fontSize: 8,
  },
  /* -------- BARRA AZUL -------- */
  blueBar: {
    backgroundColor: LIGHT_BLUE_BG,
    paddingVertical: 4,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  blueBarText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  /* -------- TITULO PRINCIPAL -------- */
  mainTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  /* -------- SECCIONES -------- */
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 5,
  },
  text: { textAlign: 'justify', marginBottom: 5, fontSize: 10 },
  textBold: { fontFamily: 'Helvetica-Bold' },
  textUnderline: { textDecoration: 'underline' },
  /* -------- LISTAS -------- */
  listItem: { flexDirection: 'row', marginBottom: 2, paddingLeft: 20 },
  bullet: { width: 14, fontSize: 10 },
  listText: { flex: 1, textAlign: 'justify', fontSize: 10 },
  /* -------- DECLARACION -------- */
  declTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 5,
  },
  declLine: { fontSize: 10, marginBottom: 2 },
  /* -------- FIRMAS -------- */
  signLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  signField: { fontSize: 10, marginBottom: 2 },
  signLine: { borderBottomWidth: 1, borderBottomColor: '#000', flex: 1 },
  signBlock: { marginBottom: 95 },
  signFieldRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2, fontSize: 10 },
  /* -------- OBSERVACIONES -------- */
  obsTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 5 },
  obsLine: { borderBottomWidth: 1, borderBottomColor: '#000', height: 18 },
  /* -------- FOOTER -------- */
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    fontSize: 7.5,
    color: '#333',
    textAlign: 'justify',
  },
  /* -------- DATA FIELDS (auto-completados) -------- */
  dataField: { fontFamily: 'Helvetica-Bold', textDecoration: 'underline' },
});

/* ============================================================
   COMPONENTES AUXILIARES
   ============================================================ */
const Header = () => (
  <View>
    <View style={styles.headerRow}>
      <View style={styles.logoBox}>
        <Image src="/logo.jpg" style={styles.logo} />
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerInst}>INSTITUCION EDUCATIVA DIVINO NINO</Text>
        <Text style={styles.headerRes}>Resolucion de Aprobacion 9430 DEL 23/Noviembre/2004</Text>
        <Text style={styles.headerMotto}>"FE, ESPERANZA Y AMOR"</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={{ fontFamily: 'Helvetica-Bold' }}>AD - 01</Text>
        <Text>Version 01</Text>
        <Text>Fecha: 03/09/2021</Text>
      </View>
    </View>
    <View style={styles.blueBar}>
      <Text style={styles.blueBarText}>ORIENTACION ESCOLAR</Text>
    </View>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>Al firmar este documento acepta el uso y tratamiento de datos personales de acuerdo a la Ley 1581 del 2012, dicha informacion sera resguardada durante el tiempo que establece la ley.</Text>
  </View>
);

const Bullet = ({ children }) => (
  <View style={styles.listItem}>
    <Text style={styles.bullet}>{'\u2022'}</Text>
    <Text style={styles.listText}>{children}</Text>
  </View>
);

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function PdfConsentimiento({ data }) {
  const est = data?.estudiantes || {};
  const acu = est.datos_acudiente || {};

  // Grado sin jornada
  let gradoStr = est.grado || '';
  if (!data?._gradoLimpio) {
    const gradoMatch = gradoStr.match(/(.*?)-(MA[ÑN]ANA|TARDE|NOCHE|SABATINA|UNICA)$/i);
    if (gradoMatch) gradoStr = gradoMatch[1];
  }

  // Datos auto-completados
  const studentName = `${est.nombres || ''} ${est.apellidos || ''}`.trim();
  const studentDoc = est.documento || '';
  const parentName = `${acu.nombres || ''} ${acu.apellidos || ''}`.trim();
  const parentDoc = acu.documento || '';
  const parentesco = (acu.parentesco || '').toLowerCase();

  // Firmas
  const firmas = data?.firmas || {};

  const dateStr = data?.fecha || new Date().toLocaleDateString('es-CO');

  // Linea de relleno
  const line = (text, width) => text || '_'.repeat(width || 30);

  return (
    <Document>
      {/* ==========================================
          PAGINA 1 — Contexto + Objetivo + Confidencialidad
          ========================================== */}
      <Page size="LETTER" style={styles.page}>
        <Header />
        <Footer />

        <Text style={styles.mainTitle}>CONSENTIMIENTO INFORMADO PARA ATENCION EN ORIENTACION ESCOLAR</Text>

        {/* 1. CONTEXTO */}
        <Text style={styles.sectionTitle}>    1.   CONTEXTO</Text>
        <Text style={styles.text}>
          El presente documento tiene como proposito informarle sobre los servicios de Orientacion Escolar y solicitar su consentimiento para la atencion psicopedagogica de su hijo/a o acudido/a, en el marco de la promocion del bienestar integral, el desarrollo de competencias socioemocionales y el acompanamiento en su proceso formativo. Garantizando el respeto, la confidencialidad y el tratamiento etico de la informacion personal y sensible compartida durante los procesos realizados en la Institucion Educativa Divino Nino en el marco de las funciones establecidas para el docente orientador.
        </Text>

        {/* 2. OBJETIVO DEL ACOMPANAMIENTO */}
        <Text style={styles.sectionTitle}>    2.   OBJETIVO DEL ACOMPANAMIENTO:</Text>
        <Text style={styles.text}>La atencion por parte del Docente Orientador tiene como finalidad:</Text>
        <Bullet>Brindar apoyo en procesos de desarrollo personal, emocional, academico y social.</Bullet>
        <Bullet>Promover la convivencia escolar, el bienestar y la prevencion de situaciones de riesgo.</Bullet>
        <Bullet>Prevenir situaciones de riesgo psicosocial (consumo de sustancias psicoactivas, violencias, acoso escolar)</Bullet>
        <Bullet>Facilitar la orientacion vocacional, familiar y psicosocial.</Bullet>
        <Bullet>Fortalecer el proceso de adquisicion de habilidades socioemocionales y resolucion pacifica de conflictos</Bullet>
        <Bullet>Acompanar procesos de intervencion y seguimiento cuando se presentan situaciones que afectan el desarrollo integral del estudiante.</Bullet>
        <Bullet>Remitir y articular procesos de acompanamiento con entidades externas de salud y proteccion cuando sea necesario</Bullet>

        {/* 3. CONFIDENCIALIDAD */}
        <Text style={styles.sectionTitle}>    3.   CONFIDENCIALIDAD Y MANEJO DE LA INFORMACION</Text>
        <Text style={styles.text}>
          Teniendo en cuenta la legislacion colombiana el docente orientador se compromete a manejar de manera <Text style={styles.textBold}>confidencial</Text> toda la informacion obtenida durante los procesos de orientacion, conforme a lo estipulado en: <Text style={styles.textBold}>Constitucion Politica De Colombia (1991)</Text>; Art. 15 (Derecho a la intimidad personal y familiar, y al buen nombre), <Text style={styles.textBold}>Art 44</Text> (Derechos fundamentales de los ninos, ninas y adolescentes, incluyendo la educacion y el desarrollo integral). <Text style={styles.textBold}>Ley 115 de 1994 (Ley General De Educacion):</Text> Art 40 (sobre el servicio de orientacion estudiantil). <Text style={styles.textBold}>Ley 1620 de 2013</Text> (sistema nacional de convivencia escolar y formacion para el ejercicio de los derechos humanos, la educacion para la sexualidad y la prevencion y mitigacion de la violencia escolar) y los <Text style={styles.textBold}>principios eticos de la Ley 1090 de 2006</Text> (Codigo Deontologico y Bioetico de la Psicologia en Colombia), la <Text style={styles.textBold}>Ley 1581 de 2012</Text> (Proteccion de Datos Personales) y el <Text style={styles.textBold}>Decreto 1377 de 2013</Text> (reglamentacion del tratamiento de
        </Text>


        <Text style={styles.text}>
          datos).   En base a dicha legislacion se debera guardar <Text style={styles.textBold}>secreto profesional</Text> sobre la informacion sensible compartida por el/la estudiante, salvo en las excepciones legales establecidas:
        </Text>

        <Bullet><Text style={styles.textBold}>Cuando el estudiante o su acudiente autoricen por escrito</Text> la comunicacion de dicha informacion a otros profesionales o instancias.</Bullet>

        <Text style={[styles.text, { marginTop: 6 }]}>
          En cumplimiento de la normatividad colombiana, el Docente Orientador tiene el <Text style={styles.textBold}>deber legal</Text> de reportar a las autoridades competentes (ICBF, Comisaria de Familia, Policia de Infancia y Adolescencia) cuando exista conocimiento, sospecha razonable o evidencia de:
        </Text>

        <Bullet><Text style={styles.textBold}>Maltrato infantil</Text> fisico, psicologico o negligencia (Ley 1098 de 2006, Art. 44, numeral 9)</Bullet>
        <Bullet><Text style={styles.textBold}>Abuso sexual</Text> o cualquier forma de violencia sexual contra ninos, ninas o adolescentes</Bullet>
        <Bullet><Text style={styles.textBold}>Ideacion suicida activa</Text> con plan estructurado o riesgo inminente de autolesion</Bullet>
        <Bullet><Text style={styles.textBold}>Riesgo de dano grave</Text> a terceras personas</Bullet>
        <Bullet><Text style={styles.textBold}>Situaciones que atenten contra la vida o integridad</Text> del estudiante o de otros</Bullet>
        <Bullet><Text style={styles.textBold}>Explotacion laboral, mendicidad o cualquier forma de explotacion</Text> (Ley 1098 de 2006)</Bullet>
        <Bullet>Cuando exista <Text style={styles.textBold}>orden judicial</Text> que asi lo requiera</Bullet>

        <Text style={[styles.text, { marginTop: 6 }]}>
          En estas situaciones, se priorizara siempre el <Text style={styles.textBold}>interes superior del nino, nina o adolescente</Text>, informando a los padres o acudientes y activando las rutas de atencion establecidas por la institucion y el Sistema Nacional de Bienestar Familiar.
        </Text>

        {/* 4. INFORMACION COMPARTIDA */}
        <Text style={styles.sectionTitle}>    4.   INFORMACION COMPARTIDA CON LA COMUNIDAD EDUCATIVA:</Text>
        <Text style={styles.text}>
          Con el proposito de garantizar un adecuado acompanamiento pedagogico, el Docente Orientador podra compartir con directivos y docentes informacion <Text style={styles.textBold}>estrictamente necesaria</Text> relacionada con:
        </Text>
        <Bullet>Estrategias pedagogicas para el acompanamiento del estudiante</Bullet>
        <Bullet>Ajustes razonables en caso de situaciones especiales</Bullet>
        <Bullet>Recomendaciones para la convivencia escolar</Bullet>
        <Text style={[styles.text, { marginTop: 4 }]}>
          Esta informacion se compartira <Text style={styles.textBold}>sin revelar detalles sensibles o confidenciales</Text> de las sesiones individuales, preservando siempre la dignidad y privacidad del estudiante.
        </Text>

        {/* 5. NATURALEZA VOLUNTARIA */}
        <Text style={styles.sectionTitle}>    5.   NATURALEZA VOLUNTARIA DEL PROCESO</Text>
        <Text style={styles.text}>
          La participacion en el proceso de orientacion es <Text style={styles.textBold}>voluntaria</Text> y puede ser suspendida o reanudada en cualquier momento por el estudiante o su acudiente.
        </Text>
        <Text style={styles.text}>
          El acompanamiento <Text style={styles.textBold}>no reemplaza la atencion psicologica o psiquiatrica especializada</Text>, en caso de requerirse, el orientador realizara la <Text style={[styles.textBold, styles.textUnderline]}>remision o articulacion con las entidades competentes</Text>.
        </Text>

        {/* 6. CONSENTIMIENTO (solo titulo) */}
        <Text style={styles.sectionTitle}>    6.   CONSENTIMIENTO</Text>


        <Text style={styles.declTitle}>DECLARACION DE CONSENTIMIENTO INFORMADO</Text>

        <Text style={[styles.text, { marginBottom: 10, lineHeight: 1.5 }]}>
          Yo, <Text style={styles.dataField}>{parentName || '________________________'}</Text>, identificado/a con CC/CE <Text style={styles.dataField}>{parentDoc || '_______________'}</Text>, en calidad de <Text style={styles.textBold}>{parentesco.charAt(0).toUpperCase() + parentesco.slice(1)}</Text> Acudiente legal del estudiante <Text style={styles.dataField}>{studentName || '________________________'}</Text> identificado con RC/TI/PEP: <Text style={styles.dataField}>{studentDoc || '_______________'}</Text> perteneciente al grado: <Text style={styles.dataField}>{gradoStr || '__________'}</Text>.
        </Text>

        <Text style={[styles.textBold, { marginBottom: 4, fontSize: 10 }]}>DECLARO QUE:</Text>
        <Text style={styles.declLine}>He leido completamente este documento y he comprendido la informacion presentada</Text>
        <Text style={styles.declLine}>He tenido la oportunidad de hacer preguntas y estas han sido respondidas satisfactoriamente</Text>
        <Text style={styles.declLine}>Comprendo la naturaleza de los servicios de Orientacion Escolar</Text>
        <Text style={styles.declLine}>Conozco el alcance y las limitaciones de la confidencialidad</Text>
        <Text style={styles.declLine}>Entiendo las obligaciones legales del Docente Orientador de reportar situaciones de riesgo</Text>
        <Text style={[styles.declLine, { marginBottom: 10 }]}>Autorizo el tratamiento de datos personales conforme a la legislacion vigente</Text>

        <Text style={[styles.text, { marginBottom: 12 }]}>
          <Text style={styles.textBold}>MANIFIESTO MI CONSENTIMIENTO</Text> para que mi hijo/a o acudido/a reciba atencion del Servicio de Orientacion Escolar de la institucion, bajo los terminos y condiciones descritos en este documento.
        </Text>

        {/* ASENTIMIENTO DEL ESTUDIANTE */}
        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 10 }}>
          ASENTIMIENTO DEL ESTUDIANTE <Text style={{ fontFamily: 'Helvetica' }}>(para estudiantes de 7 anos en adelante)</Text>
        </Text>

        <Text style={[styles.text, { marginBottom: 8 }]}>
          Yo, <Text style={styles.dataField}>{line(studentName, 40)}</Text>, estudiante de grado <Text style={styles.dataField}>{line(gradoStr, 8)}</Text>, he sido informado/a sobre el servicio de Orientacion Escolar de manera comprensible para mi edad.
        </Text>

        <Text style={[styles.text, { marginBottom: 3 }]}>Entiendo que:</Text>
        <Text style={styles.declLine}>Puedo hablar con el/la orientador/a sobre mis sentimientos, preocupaciones o situaciones que me afecten</Text>
        <Text style={styles.declLine}>Lo que hable sera confidencial, excepto si estoy en peligro o alguien mas lo esta</Text>
        <Text style={styles.declLine}>Puedo hacer preguntas en cualquier momento</Text>
        <Text style={[styles.declLine, { marginBottom: 8 }]}>Participar es voluntario y puedo decidir no asistir si no me siento comodo/a</Text>

        <Text style={styles.declLine}>{'\u2611'} Acepto recibir orientacion escolar</Text>

        {/* ESPACIO PARA OBSERVACIONES */}
        <Text style={styles.obsTitle}>ESPACIO PARA OBSERVACIONES O ACLARACIONES</Text>
        {data?.observaciones_extra ? (
          <View style={[styles.obsLine, { height: 'auto', paddingVertical: 4 }]}>
            <Text style={{ fontSize: 10 }}>{data.observaciones_extra}</Text>
          </View>
        ) : (
          <View>
            <View style={styles.obsLine}><Text> </Text></View>
            <View style={styles.obsLine}><Text> </Text></View>
            <View style={styles.obsLine}><Text> </Text></View>
          </View>
        )}


        {/* BLOQUE DE FIRMAS UNIFICADO */}
        <View wrap={false}>
          {/* Firma del estudiante */}
          <View style={[styles.signBlock, { marginTop: 50 }]}>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Firma del estudiante: </Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', flex: 1, marginBottom: 2, position: 'relative', height: 25 }}>
              {firmas.estudiante && (
                <Image src={firmas.estudiante} style={{ position: 'absolute', bottom: 2, left: 10, height: 45, objectFit: 'contain' }} />
              )}
            </View>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Nombre completo: </Text>
            <Text style={styles.signField}>{line(studentName, 50)}</Text>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Tipo de documento: </Text>
            <Text style={styles.signField}>{line(data?.tipo_doc_estudiante || 'TI', 6)}    </Text>
            <Text style={styles.signLabel}>Numero: </Text>
            <Text style={styles.signField}>{line(studentDoc, 35)}</Text>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Grado: </Text>
            <Text style={styles.signField}>{line(gradoStr, 12)}    </Text>
            <Text style={styles.signLabel}>Edad: </Text>
            <Text style={styles.signField}>{line(data?.edad_estudiante, 12)}    </Text>
            <Text style={styles.signLabel}>Fecha: </Text>
            <Text style={styles.signField}>{line(dateStr, 20)}</Text>
          </View>
        </View>

          {/* Firma del acudiente */}
          <View style={styles.signBlock}>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Firma del acudiente: </Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', flex: 1, marginBottom: 2, position: 'relative', height: 25 }}>
              {firmas.acudiente && (
                <Image src={firmas.acudiente} style={{ position: 'absolute', bottom: 2, left: 10, height: 45, objectFit: 'contain' }} />
              )}
            </View>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Nombre completo: </Text>
            <Text style={styles.signField}>{line(parentName, 50)}</Text>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Tipo de documento: </Text>
            <Text style={styles.signField}>{line(data?.tipo_doc_acudiente || 'CC', 6)}    </Text>
            <Text style={styles.signLabel}>Numero: </Text>
            <Text style={styles.signField}>{line(parentDoc, 18)}    </Text>
            <Text style={styles.signLabel}>Fecha: </Text>
            <Text style={styles.signField}>{line(dateStr, 12)}</Text>
          </View>
        </View>

          {/* Firma del docente orientador */}
          <View style={styles.signBlock}>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Firma del docente orientador: </Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', flex: 1, marginBottom: 2, position: 'relative', height: 25 }}>
              {firmas.orientador && (
                <Image src={firmas.orientador} style={{ position: 'absolute', bottom: 2, left: 10, height: 45, objectFit: 'contain' }} />
              )}
            </View>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Nombre completo: </Text>
            <Text style={styles.signField}>{line(data?.nombre_orientador, 50)}</Text>
          </View>
          <View style={styles.signFieldRow}>
            <Text style={styles.signLabel}>Tipo de documento: </Text>
            <Text style={styles.signField}>{line(data?.tipo_doc_orientador || 'CC', 6)}    </Text>
            <Text style={styles.signLabel}>Numero: </Text>
            <Text style={styles.signField}>{line(data?.doc_orientador, 19)}    </Text>
            <Text style={styles.signLabel}>Fecha: </Text>
            <Text style={styles.signField}>{line(dateStr, 12)}</Text>
          </View>
          <View style={[styles.signFieldRow, { marginTop: 8 }]}>
            <Text style={styles.signLabel}>Tarjeta profesional (si aplica): </Text>
            <Text style={styles.signField}>{line(data?.tp_orientador, 42)}</Text>
          </View>
        </View>
        </View>
      </Page>
    </Document>
  );
}
