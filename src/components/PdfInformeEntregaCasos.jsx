import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
  },
  logoBox: { width: 80, padding: 5, justifyContent: 'center', alignItems: 'center' },
  titleBox: { flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#000', padding: 5, justifyContent: 'center', alignItems: 'center' },
  versionBox: { width: 100, padding: 5, justifyContent: 'center' },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 8, fontFamily: 'Helvetica-Oblique', marginBottom: 4 },
  headerQuote: { fontSize: 8, fontFamily: 'Helvetica-Oblique' },
  versionText: { fontSize: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', backgroundColor: '#dce6f1', textAlign: 'center', padding: 3, borderWidth: 1, borderTopWidth: 0, borderColor: '#000', marginBottom: 20 },
  
  mainTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 20 },
  
  textLineContainer: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-end', flexWrap: 'wrap' },
  label: { fontSize: 10, fontFamily: 'Helvetica', marginRight: 4 },
  valueLine: { borderBottomWidth: 1, borderColor: '#000', flex: 1, minWidth: 50 },
  valueText: { fontSize: 10, fontFamily: 'Helvetica', marginBottom: -2 },
  
  subTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 15, marginBottom: 10 },
  
  checkBoxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkBox: { width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 6, justifyContent: 'center', alignItems: 'center' },
  checkBoxText: { fontSize: 10, fontFamily: 'Helvetica' },
  
  textAreaContainer: { minHeight: 60, marginTop: 5 },
  textAreaText: { fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5 },
  
  footerText: { fontSize: 10, fontFamily: 'Helvetica', marginTop: 20, lineHeight: 1.4, textAlign: 'justify' },
  
  signatureLine: { width: 200, borderTopWidth: 1, borderColor: '#000', paddingTop: 5, marginTop: 40 },
  signatureText: { fontSize: 10, fontFamily: 'Helvetica' },
  signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2 }
});

const CheckBox = ({ checked, label }) => (
  <View style={styles.checkBoxContainer}>
    <View style={styles.checkBox}>
      {checked ? <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginTop: -1 }}>X</Text> : null}
    </View>
    <Text style={styles.checkBoxText}>{label}</Text>
  </View>
);

const Header = () => (
  <View style={{ marginBottom: 5 }} fixed>
    <View style={styles.headerContainer}>
      <View style={styles.logoBox}>
        <Image src="/logo.jpg" style={{ width: 50, height: 50, objectFit: 'contain' }} />
      </View>
      <View style={styles.titleBox}>
        <Text style={styles.headerTitle}>INSTITUCION EDUCATIVA DIVINO NIÑO</Text>
        <Text style={styles.headerSubtitle}>Resolución de Aprobación 9430 DEL 23/Noviembre/2004</Text>
        <Text style={styles.headerQuote}>"FE, ESPERANZA Y AMOR"</Text>
      </View>
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>AD - 01</Text>
        <Text style={styles.versionText}>Versión 01</Text>
      </View>
    </View>
    <Text style={styles.sectionTitle}>INFORME PARA ENTREGA DE CASOS</Text>
  </View>
);

export default function PdfInformeEntregaCasos({ data, firmas }) {
  const f = data || {};
  const t = (val) => (val === undefined || val === null || val === '' ? '' : String(val));
  
  const getFirmaUrl = (tipo) => {
    if (!firmas) return null;
    const firma = firmas.find(f => f.tipo === tipo);
    return firma ? firma.imagen_url : null;
  };

  const getFirmaNombre = (tipo) => {
    if (!firmas) return '';
    const firma = firmas.find(f => f.tipo === tipo);
    return firma ? firma.nombre_completo : '';
  };

  const motivosList = f.motivos_activacion || [];
  const accionesList = f.acciones_realizadas || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header />

        <Text style={styles.mainTitle}>INFORME PARA ENTREGA DEL CASO A LA SECRETARÍA DE SALUD</Text>

        {/* INFO BÁSICA */}
        <View style={styles.textLineContainer}>
          <Text style={styles.label}>Institución Educativa:</Text>
          <View style={styles.valueLine}><Text style={styles.valueText}>{t(f.institucion_educativa)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Fecha:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 80 }]}><Text style={styles.valueText}>{t(f.fecha)}</Text></View>
        </View>

        <View style={styles.textLineContainer}>
          <Text style={styles.label}>Nombre del estudiante:</Text>
          <View style={styles.valueLine}><Text style={styles.valueText}>{t(f.nombre_estudiante)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Grado:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 60 }]}><Text style={styles.valueText}>{t(f.grado)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Edad:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 40 }]}><Text style={styles.valueText}>{t(f.edad)}</Text></View>
        </View>

        <View style={styles.textLineContainer}>
          <Text style={styles.label}>Tipo de documento:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 25, minWidth: 20 }]}><Text style={styles.valueText}>{t(f.tipo_documento)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Número de documento:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 80, minWidth: 80 }]}><Text style={styles.valueText}>{t(f.numero_documento)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Ciudad de nacimiento:</Text>
          <View style={[styles.valueLine, { flex: 1 }]}><Text style={styles.valueText}>{t(f.ciudad_nacimiento)}</Text></View>
        </View>

        <View style={styles.textLineContainer}>
          <Text style={styles.label}>Nombre del acudiente:</Text>
          <View style={styles.valueLine}><Text style={styles.valueText}>{t(f.nombre_acudiente)}</Text></View>
          <Text style={[styles.label, { marginLeft: 10 }]}>Teléfono de contacto:</Text>
          <View style={[styles.valueLine, { flex: 0, width: 100 }]}><Text style={styles.valueText}>{t(f.telefono_contacto)}</Text></View>
        </View>

        {/* MOTIVO DE ACTIVACIÓN DE RUTA */}
        <Text style={styles.subTitle}>MOTIVO DE ACTIVACIÓN DE RUTA</Text>
        <CheckBox checked={motivosList.includes('Ideación suicida')} label="Ideación suicida" />
        <CheckBox checked={motivosList.includes('Intento de suicidio')} label="Intento de suicidio" />
        <CheckBox checked={motivosList.includes('Autolesiones o comportamientos autodestructivos')} label="Autolesiones o comportamientos autodestructivos" />
        <CheckBox checked={motivosList.includes('Alteraciones del comportamiento con sospecha de trastorno mental')} label="Alteraciones del comportamiento con sospecha de trastorno mental" />
        <CheckBox checked={motivosList.includes('Episodios de ansiedad o crisis de pánico')} label="Episodios de ansiedad o crisis de pánico" />
        <CheckBox checked={motivosList.includes('Conductas depresivas prolongadas')} label="Conductas depresivas prolongadas" />
        <CheckBox checked={motivosList.includes('Consumo de sustancias psicoactivas')} label="Consumo de sustancias psicoactivas" />
        <CheckBox checked={motivosList.includes('Situaciones de violencia intrafamiliar o abuso')} label="Situaciones de violencia intrafamiliar o abuso" />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }}>
          <CheckBox checked={motivosList.includes('Otros')} label="Otros:" />
          <View style={[styles.valueLine, { marginLeft: 5 }]}><Text style={styles.valueText}>{t(f.motivo_otro)}</Text></View>
        </View>

        {/* DESCRIPCIÓN DE LA SITUACIÓN */}
        <Text style={styles.subTitle}>DESCRIPCIÓN DE LA SITUACIÓN:</Text>
        <View style={styles.textAreaContainer}>
          <Text style={styles.textAreaText}>{t(f.descripcion_situacion)}</Text>
        </View>

        {/* PAGE 2 */}
        <Text style={styles.subTitle} break>ACCIONES REALIZADAS POR LA INSTITUCIÓN EDUCATIVA</Text>
        <CheckBox checked={accionesList.includes('Observación y seguimiento del estudiante en el contexto escolar.')} label="Observación y seguimiento del estudiante en el contexto escolar." />
        <CheckBox checked={accionesList.includes('Entrevista individual con el estudiante.')} label="Entrevista individual con el estudiante." />
        <CheckBox checked={accionesList.includes('Comunicación con los padres o acudientes.')} label="Comunicación con los padres o acudientes." />
        <CheckBox checked={accionesList.includes('Orientación sobre la situación y recomendación de atención médica.')} label="Orientación sobre la situación y recomendación de atención médica." />
        <CheckBox checked={accionesList.includes('Registro del caso en el protocolo de protección escolar.')} label="Registro del caso en el protocolo de protección escolar." />

        {/* OBSERVACIONES ADICIONALES */}
        <Text style={styles.subTitle}>OBSERVACIONES ADICIONALES</Text>
        <View style={styles.textAreaContainer}>
          <Text style={styles.textAreaText}>{t(f.observaciones_adicionales)}</Text>
        </View>

        <Text style={styles.footerText}>
          Reiteramos nuestra disposición para brindar acompañamiento durante este proceso y agradecemos su colaboración para proteger la integridad y bienestar emocional de la menor.{"\n\n"}
          Quedamos atentos ante cualquier inquietud o situación adicional.{"\n\n"}
          Atentamente.
        </Text>

        <View style={{ marginTop: 40, width: 200 }}>
          {getFirmaUrl('orientador') && (
            <Image src={getFirmaUrl('orientador')} style={{ width: 120, height: 50, objectFit: 'contain', marginBottom: 2 }} />
          )}
          <View style={{ borderTopWidth: 1, borderColor: '#000', paddingTop: 5 }}>
            <Text style={styles.signatureText}>{getFirmaNombre('orientador') || 'Orientadora Escolar'}</Text>
            <Text style={styles.signatureText}>Ins.Edu.</Text>
            <Text style={[styles.signatureText, { color: 'blue', textDecoration: 'underline' }]}>{t(f.correo_ins_edu)}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
