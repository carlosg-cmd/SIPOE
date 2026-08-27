import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
    height: '100%',
  },
  /* -------- HEADER -------- */
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#b19cd9',
    marginBottom: 5,
  },
  logoBox: {
    width: '20%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#b19cd9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    width: '60%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#b19cd9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBox: {
    width: '20%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 8,
  },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#666' },
  headerSub: { fontSize: 8, fontStyle: 'italic', color: '#666', marginTop: 3 },
  headerMotto: { fontSize: 7, fontStyle: 'italic', color: '#666', marginTop: 3 },
  areaHeader: {
    borderWidth: 1,
    borderColor: '#b19cd9',
    padding: 3,
    alignItems: 'center',
    marginBottom: 15,
  },
  areaTitle: { fontSize: 10, color: '#666' },
  
  /* -------- TABLA PRINCIPAL -------- */
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 18,
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 18,
  },
  tableHeaderCol: {
    width: '20%',
    borderRightWidth: 1,
    borderColor: '#000',
    backgroundColor: '#e6e6e6',
    padding: 3,
    justifyContent: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableDataCol: {
    flex: 1,
    padding: 3,
    justifyContent: 'center',
    fontSize: 9,
  },
  tableCellBorderRight: {
    borderRightWidth: 1,
    borderColor: '#000',
  },
  
  /* -------- SECCIONES -------- */
  sectionTitleRow: {
    backgroundColor: '#e6e6e6',
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 4,
    alignItems: 'center',
  },
  sectionTitleText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  contentBox: {
    padding: 5,
    minHeight: 100,
    borderBottomWidth: 1,
    borderColor: '#000',
    fontSize: 10,
    textAlign: 'justify',
  },
  
  /* -------- TEXTO LEGAL -------- */
  legalTextContainer: {
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  legalText: {
    fontSize: 8,
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  legalBold: {
    fontFamily: 'Helvetica-Bold',
  },
  
  /* -------- FIRMAS -------- */
  signatureRow: {
    flexDirection: 'row',
  },
  signatureCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
    position: 'relative',
  },
  signatureColLast: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
    position: 'relative',
  },
  signatureNameRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#000',
  },
  signatureNameCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 4,
    alignItems: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  signatureNameColLast: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  signatureImage: {
    position: 'absolute',
    bottom: 5,
    height: 50,
    width: 100,
    objectFit: 'contain',
  },
  
  /* -------- FOOTER OTHERS -------- */
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: '#666',
    textAlign: 'justify',
  },
});

/* ============================================================
   COMPONENTES AUXILIARES
   ============================================================ */
const Header = () => (
  <View style={{ marginBottom: 10 }} fixed>
    <View style={styles.headerContainer}>
      <View style={styles.logoBox}>
        <Image src="/logo.jpg" style={{ width: 45, height: 45, objectFit: 'contain' }} />
      </View>
      <View style={styles.titleBox}>
        <Text style={styles.headerTitle}>INSTITUCION EDUCATIVA DIVINO NIÑO</Text>
        <Text style={styles.headerSub}>Resolucion de Aprobacion 0488 DEL 23/Noviembre/2004</Text>
        <Text style={styles.headerMotto}>"FE, ESPERANZA Y AMOR"</Text>
      </View>
      <View style={styles.versionBox}>
        <Text>AD - 01</Text>
        <Text>Versión 01</Text>
        <Text>Fecha: 03/09/2021</Text>
      </View>
    </View>
    <View style={styles.areaHeader}>
      <Text style={styles.areaTitle}>ORIENTACION ESCOLAR</Text>
    </View>
  </View>
);

const Footer = () => (
  <Text style={styles.footer} fixed>
    La presente acta tiene carácter confidencial y se elabora para fines de acompañamiento y orientación institucional. 
    La atención brindada no constituye intervención psicoterapéutica ni clínica. La información será manejada 
    conforme a la normatividad vigente y al Manual de Convivencia Institucional.
  </Text>
);

/* ============================================================
   COMPONENTE PRINCIPAL DEL PDF
   ============================================================ */
export default function PdfAtencionPadres({ data }) {
  const dataArray = Array.isArray(data) ? data : [data || {}];

  return (
    <Document>
      {dataArray.map((item, index) => {
        const est = item?.estudiantes || {};
        const studentName = `${est.nombres || ''} ${est.apellidos || ''}`.trim();
        const gradoStr = est.grado || '';
        const firmas = item?.firmas || {};

        return (
          <Page key={index} size="LETTER" style={styles.page} wrap>
            <Header />
            
            {/* TABLA GLOBAL ENVOLVENTE */}
            <View style={styles.tableContainer}>
              
              {/* TÍTULO */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>ACTA DE ATENCIÓN A PADRES</Text>
              </View>

              {/* FILA: FECHA */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>FECHA:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueText}>{item?.fecha || ''}</Text>
                </View>
              </View>

              {/* FILA: LUGAR */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>LUGAR:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueText}>{item?.lugar || 'ORIENTACIÓN ESCOLAR'}</Text>
                </View>
              </View>

              {/* FILA: NOMBRE DEL ESTUDIANTE */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>NOMBRE DEL ESTUDIANTE:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueTextBold}>{item?.nombre_estudiante || studentName}</Text>
                </View>
              </View>

              {/* FILA: GRADO */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>GRADO:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueText}>{item?.grado || gradoStr}</Text>
                </View>
              </View>

              {/* FILA: NOMBRE DEL PADRE / ACUDIENTE */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>NOMBRE DEL PADRE / ACUDIENTE:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueTextBold}>{item?.nombre_acudiente || ''}</Text>
                </View>
              </View>

              {/* FILA: TELÉFONO */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text style={styles.labelText}>TELÉFONO DE CONTACTO:</Text>
                </View>
                <View style={styles.tableValueCol}>
                  <Text style={styles.valueText}>{item?.telefono || ''}</Text>
                </View>
              </View>

              {/* SECCIÓN: OBJETIVO */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>OBJETIVO DE LA ATENCIÓN</Text>
              </View>
              <View style={styles.contentBox}>
                <Text>{item?.objetivo || ''}</Text>
              </View>

              {/* SECCIÓN: DESCRIPCIÓN */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>DESCRIPCIÓN DE LA SITUACIÓN / MOTIVO</Text>
              </View>
              <View style={styles.contentBox}>
                <Text>{item?.descripcion || ''}</Text>
              </View>

              {/* SECCIÓN: COMPROMISOS / ACUERDOS */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>COMPROMISOS Y ACUERDOS ESTABLECIDOS</Text>
              </View>
              <View style={styles.contentBox}>
                <Text>{item?.compromisos || item?.acuerdos || ''}</Text>
              </View>

              {/* SECCIÓN: FIRMAS */}
              <View style={styles.signaturesContainer}>
                <View style={styles.signatureRow}>
                  <View style={styles.signatureCol}>
                    {firmas.orientador && (
                      <Image src={firmas.orientador} style={styles.signatureImage} />
                    )}
                  </View>
                  <View style={styles.signatureCol}>
                    {firmas.acudiente && (
                      <Image src={firmas.acudiente} style={styles.signatureImage} />
                    )}
                  </View>
                  <View style={styles.signatureColLast}>
                    {firmas.estudiante && (
                      <Image src={firmas.estudiante} style={styles.signatureImage} />
                    )}
                  </View>
                </View>

                {/* NOMBRES DE FIRMANTES */}
                <View style={styles.signatureNameRow}>
                  <View style={styles.signatureNameCol}>
                    <Text>DOCENTE ORIENTADORA</Text>
                  </View>
                  <View style={styles.signatureNameCol}>
                    <Text>ACUDIENTE</Text>
                  </View>
                  <View style={styles.signatureNameColLast}>
                    <Text>ESTUDIANTE</Text>
                  </View>
                </View>
              </View>
              
            </View>

            <Footer />
          </Page>
        );
      })}
    </Document>
  );
}
