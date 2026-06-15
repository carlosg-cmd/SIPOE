import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontFamily: 'Helvetica',
  },
  table: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  tableCellHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    padding: 3,
    backgroundColor: '#9EB9E6',
    textAlign: 'center',
  },
  tableCellLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    padding: 2,
    backgroundColor: '#f1f5f9',
  },
  tableCellValue: {
    fontSize: 8,
    padding: 2,
  },
  textCenter: { textAlign: 'center' },
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 5,
  },
  logoBox: { width: 80, padding: 5, justifyContent: 'center', alignItems: 'center' },
  titleBox: { flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#000', padding: 5, justifyContent: 'center', alignItems: 'center' },
  versionBox: { width: 100, padding: 5, justifyContent: 'center' },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 8, fontFamily: 'Helvetica-Oblique', marginBottom: 4 },
  headerQuote: { fontSize: 8, fontFamily: 'Helvetica-Oblique' },
  versionText: { fontSize: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', backgroundColor: '#e2e8f0', textAlign: 'center', padding: 3, borderWidth: 1, borderColor: '#000', marginBottom: 5 },
  subTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', backgroundColor: '#9EB9E6', textAlign: 'center', padding: 3, borderBottomWidth: 1, borderColor: '#000' },
  checkBoxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  checkBox: { width: 12, height: 12, borderWidth: 1, borderColor: '#000', marginRight: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkBoxText: { fontSize: 8 },
  signaturesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, position: 'relative' },
  signatureCol: { width: '40%', alignItems: 'center', justifyContent: 'flex-end' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderColor: '#000', paddingTop: 5, alignItems: 'center' },
  signatureText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2 }
});

const CheckBox = ({ checked, label }) => (
  <View style={styles.checkBoxContainer}>
    <View style={styles.checkBox}>
      {checked ? <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#000', marginTop: -1 }}>X</Text> : null}
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
        <Text style={styles.versionText}>Fecha: 03/09/2021</Text>
      </View>
    </View>
    <Text style={styles.sectionTitle}>SEGUIMIENTO CONVIVENCIA ESCOLAR</Text>
  </View>
);

export default function PdfSeguimientoConvivencia({ data, firmas }) {
  const f = data || {};
  const t = (val) => (val === undefined || val === null || val === '' ? ' ' : String(val));
  
  const encuentros = f.encuentros || Array(4).fill({ fecha: '', resultado: '', observacion: '' });
  const decisiones = f.decisiones || [];

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

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header />

        <View style={styles.table}>
          <Text style={styles.subTitle}>DATOS BÁSICOS</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '70%' }]}><Text style={styles.tableCellLabel}>Estudiante:</Text><Text style={styles.tableCellValue}>{t(f.estudiante_nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '30%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Grado:</Text><Text style={styles.tableCellValue}>{t(f.grado)}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCellLabel}>Mes / Año:</Text><Text style={styles.tableCellValue}>{t(f.mes_ano)}</Text></View>
            <View style={[styles.tableCol, { width: '70%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Responsable:</Text><Text style={styles.tableCellValue}>{t(f.responsable)}</Text></View>
          </View>

          <Text style={styles.subTitle}>COMPROMISOS A SEGUIR</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={[styles.tableCellValue, { minHeight: 40 }]}>{t(f.compromisos)}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>SEGUIMIENTO</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0, padding: 4, backgroundColor: '#f8fafc' }]}>
              <Text style={{ fontSize: 8, fontStyle: 'italic', textAlign: 'center' }}>
                Se realizan encuentros periódicos de manera quincenal (con posibles modificaciones según sea necesario)
              </Text>
            </View>
          </View>

          {encuentros.map((enc, idx) => {
            const numText = idx === 0 ? 'Primer' : idx === 1 ? 'Segundo' : idx === 2 ? 'Tercer' : 'Cuarto';
            return (
              <View key={idx} style={{ borderBottomWidth: idx < 3 ? 1 : 0, borderColor: '#000', paddingBottom: 5, paddingTop: 5 }}>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.tableCol, { width: '40%', borderRightWidth: 0, borderBottomWidth: 0, borderTopWidth: 0 }]}><Text style={styles.tableCellLabel}>{numText} encuentro:</Text><Text style={styles.tableCellValue}>{t(enc.fecha)}</Text></View>
                  <View style={[styles.tableCol, { width: '60%', borderRightWidth: 0, borderBottomWidth: 0, borderTopWidth: 0, padding: 2 }]}>
                    <Text style={[styles.tableCellLabel, {marginBottom: 2}]}>Resultado:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      <View style={{ marginRight: 15 }}><CheckBox checked={enc.resultado === 'Cumple'} label="Cumple" /></View>
                      <View style={{ marginRight: 15 }}><CheckBox checked={enc.resultado === 'Cumple parcialmente'} label="Cumple parcialmente" /></View>
                      <View style={{ marginRight: 15 }}><CheckBox checked={enc.resultado === 'No cumple'} label="No cumple" /></View>
                    </View>
                  </View>
                </View>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0, borderBottomWidth: 0, borderTopWidth: 0 }]}>
                    <Text style={styles.tableCellLabel}>Observación breve:</Text>
                    <Text style={styles.tableCellValue}>{t(enc.observacion)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.table} wrap={false}>
          <Text style={styles.subTitle}>VALORACIÓN FINAL DEL PROCESO (DOS MESES)</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0, padding: 4 }]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
                <View style={{ marginRight: 15 }}><CheckBox checked={f.valoracion_final_resultado === 'Avance positivo'} label="Avance positivo" /></View>
                <View style={{ marginRight: 15 }}><CheckBox checked={f.valoracion_final_resultado === 'Avance parcial'} label="Avance parcial" /></View>
                <View style={{ marginRight: 15 }}><CheckBox checked={f.valoracion_final_resultado === 'Sin avance'} label="Sin avance" /></View>
              </View>
              <Text style={styles.tableCellLabel}>Observación breve:</Text>
              <Text style={styles.tableCellValue}>{t(f.valoracion_final_observacion)}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>DECISIÓN</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0, padding: 4, flexDirection: 'row' }]}>
              <View style={{ width: '50%' }}>
                <View style={{ marginBottom: 4 }}><CheckBox checked={decisiones.includes('Continúa seguimiento pedagógico')} label="Continúa seguimiento pedagógico" /></View>
                <View style={{ marginBottom: 4 }}><CheckBox checked={decisiones.includes('Ajuste de compromisos')} label="Ajuste de compromisos" /></View>
              </View>
              <View style={{ width: '50%' }}>
                <View style={{ marginBottom: 4 }}><CheckBox checked={decisiones.includes('Remisión a Orientación / Coordinación')} label="Remisión a Orientación / Coordinación" /></View>
                <View style={{ marginBottom: 4 }}><CheckBox checked={decisiones.includes('Remisión a Comité Escolar de Convivencia')} label="Remisión a Comité Escolar de Convivencia" /></View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.signaturesContainer}>
          <View style={styles.signatureCol}>
            {getFirmaUrl('orientador') && (
              <Image src={getFirmaUrl('orientador')} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{getFirmaNombre('orientador') || 'Docente orientador'}</Text>
              <Text style={{ fontSize: 7, marginTop: 2 }}>Docente orientador</Text>
            </View>
          </View>
          
          <View style={styles.signatureCol}>
            {getFirmaUrl('acudiente') && (
              <Image src={getFirmaUrl('acudiente')} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{getFirmaNombre('acudiente') || 'Acudiente'}</Text>
              <Text style={{ fontSize: 7, marginTop: 2 }}>Acudiente</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
