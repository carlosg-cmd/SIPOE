import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
  },
  table: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
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
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', backgroundColor: '#e2e8f0', textAlign: 'center', padding: 3, borderWidth: 1, borderTopWidth: 0, borderColor: '#000', marginBottom: 5 },
  subTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', padding: 3, marginBottom: 10 },
  sectionHeader: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 5 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  label: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginRight: 4 },
  valueUnderline: { fontSize: 9, borderBottomWidth: 1, borderColor: '#000', flex: 1, paddingBottom: 1, minHeight: 12 },
  checkBoxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkBox: { width: 10, height: 10, borderWidth: 1, borderColor: '#000', marginRight: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkBoxText: { fontSize: 9 },
  signaturesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, flexWrap: 'wrap' },
  signatureCol: { width: '30%', alignItems: 'flex-start', justifyContent: 'flex-end', marginBottom: 20 },
  signatureLine: { width: '100%', borderTopWidth: 1, borderColor: '#000', paddingTop: 5 },
  signatureText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2, alignSelf: 'center' },
  footerText: { fontSize: 8, fontStyle: 'italic', marginTop: 20, textAlign: 'justify' }
});

const CheckBox = ({ checked, label }) => (
  <View style={styles.checkBoxContainer}>
    <View style={styles.checkBox}>
      {checked ? <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#000', marginTop: -1 }}>X</Text> : null}
    </View>
    <Text style={styles.checkBoxText}>{label}</Text>
  </View>
);

const Header = () => (
  <View style={{ marginBottom: 15 }} fixed>
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
        <Text style={styles.versionText}>Fecha: 03/09/2021</Text>
      </View>
    </View>
    <Text style={styles.sectionTitle}>FORMATO DE ORIENTACIÓN ESCOLAR</Text>
    <Text style={styles.subTitle}>ACOMPAÑAMIENTO SEGUIMIENTO DE COMPROMISOS{"\n"}DE CONVIVENCIA ESCOLAR</Text>
  </View>
);

export default function PdfRemisionCoordinacion({ data, firmas }) {
  const f = data || {};
  const t = (val) => (val === undefined || val === null || val === '' ? ' ' : String(val));
  
  const motivos = f.motivos || [];
  const seguimiento = f.seguimiento_resumen || [];

  const getFirmaUrl = (tipo) => {
    if (!firmas) return null;
    const firma = firmas.find(fi => fi.tipo === tipo);
    return firma ? firma.imagen_url : null;
  };

  const getFirmaNombre = (tipo) => {
    if (!firmas) return '';
    const firma = firmas.find(fi => fi.tipo === tipo);
    return firma ? firma.nombre_completo : '';
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header />

        {/* 1. DATOS DEL ESTUDIANTE */}
        <Text style={styles.sectionHeader}>1. DATOS DEL ESTUDIANTE</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre del estudiante:</Text>
          <Text style={[styles.valueUnderline, { flex: 2, marginRight: 10 }]}>{t(f.estudiante_nombre)}</Text>
          <Text style={styles.label}>Grado / Grupo:</Text>
          <Text style={styles.valueUnderline}>{t(f.grado)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Acudiente:</Text>
          <Text style={[styles.valueUnderline, { flex: 2, marginRight: 10 }]}>{t(f.acudiente_nombre)}</Text>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.valueUnderline}>{t(f.telefono)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de remisión:</Text>
          <Text style={[styles.valueUnderline, { flex: 1, marginRight: 10 }]}>{t(f.fecha_remision)}</Text>
          <Text style={styles.label}>Remite:</Text>
          <Text style={[styles.valueUnderline, { flex: 2 }]}>{t(f.remite)}</Text>
        </View>

        {/* 2. MOTIVO DE REMISIÓN A COORDINACIÓN */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>2. MOTIVO DE REMISIÓN A COORDINACIÓN</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
          <View style={{ width: '50%' }}>
            <CheckBox checked={motivos.includes('Incumplimiento de compromisos')} label="Incumplimiento de compromisos" />
            <CheckBox checked={motivos.includes('Reincidencia en la conducta')} label="Reincidencia en la conducta" />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox checked={motivos.includes('Otro')} label="Otro:" />
              <Text style={{ borderBottomWidth: 1, borderColor: '#000', flex: 1, marginLeft: 4, height: 12, fontSize: 9 }}>{motivos.includes('Otro') ? t(f.motivo_otro) : ''}</Text>
            </View>
          </View>
          <View style={{ width: '50%' }}>
            <CheckBox checked={motivos.includes('Inasistencia a seguimientos quincenales')} label="Inasistencia a seguimientos quincenales" />
            <CheckBox checked={motivos.includes('Falta Tipo II')} label="Falta Tipo II" />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Descripción breve:</Text>
          <View style={{ minHeight: 60, marginTop: 5 }}>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{t(f.descripcion_breve)}</Text>
          </View>
        </View>

        {/* 3. COMPROMISOS PREVIOS ESTABLECIDOS */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>3. COMPROMISOS PREVIOS ESTABLECIDOS:</Text>
        <View style={{ minHeight: 60 }}>
          <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{t(f.compromisos_previos)}</Text>
        </View>

        {/* 4. SEGUIMIENTO REALIZADO (RESUMEN) */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>4. SEGUIMIENTO REALIZADO (RESUMEN)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
          <View style={{ marginRight: 20 }}><CheckBox checked={seguimiento.includes('Se realizó seguimiento completo (4 encuentros quincenales)')} label="Se realizó seguimiento completo (4 encuentros quincenales)" /></View>
          <View><CheckBox checked={seguimiento.includes('Seguimiento parcial')} label="Seguimiento parcial" /></View>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={styles.label}>Observaciones relevantes:</Text>
          <View style={{ minHeight: 40, marginTop: 5 }}>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{t(f.observaciones_relevantes)}</Text>
          </View>
        </View>

        {/* 5. FIRMAS */}
        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>5. FIRMAS</Text>
        <View style={styles.signaturesContainer} wrap={false}>
          <View style={[styles.signatureCol, { width: '100%', marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%' }}>
              <Text style={styles.signatureText}>• Coordinación de Convivencia: </Text>
              <Text style={{ borderBottomWidth: 1, borderColor: '#000', flex: 1, marginLeft: 5 }}></Text>
            </View>
          </View>
          <View style={[styles.signatureCol, { width: '100%', marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', height: 40 }}>
              <Text style={styles.signatureText}>• Orientador escolar: </Text>
              <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', marginLeft: 5, position: 'relative' }}>
                {getFirmaUrl('orientador') && (
                  <Image src={getFirmaUrl('orientador')} style={{ position: 'absolute', bottom: 0, left: 10, width: 100, height: 35, objectFit: 'contain' }} />
                )}
                <Text style={{ position: 'absolute', bottom: -12, left: 10, fontSize: 8 }}>{getFirmaNombre('orientador')}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.signatureCol, { width: '100%', marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', height: 40 }}>
              <Text style={styles.signatureText}>• Acudiente: </Text>
              <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', marginLeft: 5, position: 'relative' }}>
                {getFirmaUrl('acudiente') && (
                  <Image src={getFirmaUrl('acudiente')} style={{ position: 'absolute', bottom: 0, left: 10, width: 100, height: 35, objectFit: 'contain' }} />
                )}
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>
          Este formato da continuidad al proceso pedagógico y disciplinario, conforme a la Ley 1620 de 2013, el Decreto 1965 de 2013 y el Manual de Convivencia Institucional.
        </Text>
      </Page>
    </Document>
  );
}
