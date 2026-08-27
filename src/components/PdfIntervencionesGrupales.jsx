import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: { width: 80, justifyContent: 'center', alignItems: 'center' },
  titleBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1a365d', marginBottom: 4 },
  headerQuote: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1a365d', marginBottom: 4 },
  headerSub: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 2 },
  
  table: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
  },
  tableTitleRow: {
    backgroundColor: '#dce6f1',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  tableTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 25,
  },
  tableRowNoBottomBorder: {
    flexDirection: 'row',
    minHeight: 25,
  },
  cellLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    textAlign: 'center',
  },
  cellValue: {
    fontSize: 9,
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
  },
  cellValueLast: {
    fontSize: 9,
    padding: 4,
    justifyContent: 'center',
    borderRightWidth: 0,
  },
  greyRow: {
    backgroundColor: '#dce6f1',
    height: 15,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  footerContainer: {
    marginTop: 50,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    textAlign: 'right',
    lineHeight: 1.4
  }
});

const Header = () => (
  <View style={styles.headerContainer} fixed>
    <View style={styles.logoBox}>
      <Image src="/logo.jpg" style={{ width: 65, height: 65, objectFit: 'contain' }} />
    </View>
    <View style={styles.titleBox}>
      <Text style={styles.headerTitle}>INSTITUCIÓN EDUCATIVA DIVINO NIÑO</Text>
      <Text style={styles.headerQuote}>" Fe, Esperanza y Amor "</Text>
      <Text style={styles.headerSub}>Resolución 18922 de 18-12-2002</Text>
      <Text style={styles.headerSub}>Res. 9430 de 23-11-2004, Res. 0018634 de 12-08-2009</Text>
    </View>
  </View>
);

export default function PdfIntervencionesGrupales({ data }) {
  const f = data || {};
  const t = (val) => (val === undefined || val === null || val === '' ? ' ' : String(val));
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header />

        <View style={styles.table}>
          {/* TITULO */}
          <View style={styles.tableTitleRow}>
            <Text style={styles.tableTitle}>INTERVENCIONES GRUPALES</Text>
          </View>

          {/* FILA 1 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '15%' }]}><Text>FECHA:</Text></View>
            <View style={[styles.cellValue, { width: '25%' }]}><Text>{t(f.fecha)}</Text></View>
            <View style={[styles.cellLabel, { width: '15%' }]}><Text>GRADO:</Text></View>
            <View style={[styles.cellValue, { width: '20%' }]}><Text>{t(f.grado)}</Text></View>
            <View style={[styles.cellLabel, { width: '15%' }]}><Text>JORNADA:</Text></View>
            <View style={[styles.cellValueLast, { width: '10%' }]}><Text>{t(f.jornada)}</Text></View>
          </View>

          {/* FILA 2 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>DOCENTE TITULAR:</Text></View>
            <View style={[styles.cellValue, { width: '45%' }]}><Text>{t(f.docente_titular)}</Text></View>
            <View style={[styles.cellLabel, { width: '15%' }]}><Text>TEMATICA:</Text></View>
            <View style={[styles.cellValueLast, { width: '20%' }]}><Text>{t(f.tematica)}</Text></View>
          </View>

          {/* FILA 3 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>MOTIVO:</Text></View>
            <View style={[styles.cellValue, { width: '45%' }]}><Text>{t(f.motivo)}</Text></View>
            <View style={[styles.cellLabel, { width: '15%' }]}><Text>DURACIÓN:</Text></View>
            <View style={[styles.cellValueLast, { width: '20%' }]}><Text>{t(f.duracion)}</Text></View>
          </View>

          {/* FILA 4 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>NOMBRE DE LA{"\n"}ACTIVIDAD:</Text></View>
            <View style={[styles.cellValueLast, { width: '80%' }]}><Text>{t(f.nombre_actividad)}</Text></View>
          </View>

          {/* FILA 5 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>OBJETIVO:</Text></View>
            <View style={[styles.cellValueLast, { width: '80%', minHeight: 40 }]}><Text>{t(f.objetivo)}</Text></View>
          </View>

          {/* FILA 6 - GREY SEPARATOR */}
          <View style={styles.greyRow}></View>

          {/* FILA 7 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>DESCRIPCIÓN DEL ENCUENTRO</Text></View>
            <View style={[styles.cellValueLast, { width: '80%', minHeight: 80 }]}><Text>{t(f.descripcion_encuentro)}</Text></View>
          </View>

          {/* FILA 8 */}
          <View style={styles.tableRow}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>RECURSOS</Text></View>
            <View style={[styles.cellValueLast, { width: '80%', minHeight: 40 }]}><Text>{t(f.recursos)}</Text></View>
          </View>

          {/* FILA 9 */}
          <View style={styles.tableRowNoBottomBorder}>
            <View style={[styles.cellLabel, { width: '20%' }]}><Text>RESPONSABLES</Text></View>
            <View style={[styles.cellValueLast, { width: '80%' }]}><Text>{t(f.responsables)}</Text></View>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>RESPONSABLE: MELISSA NUÑEZ SUAREZ</Text>
          <Text style={styles.footerText}>DOCENTE ORIENTADORA</Text>
        </View>
      </Page>
    </Document>
  );
}
