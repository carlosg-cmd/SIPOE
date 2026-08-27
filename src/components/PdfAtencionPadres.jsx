import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.2,
  },
  
  /* -------- HEADER -------- */
  headerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
  },
  logoBox: {
    width: 70,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  titleBox: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 7,
    marginBottom: 2,
    textAlign: 'center',
  },
  headerMotto: {
    fontSize: 7,
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'center',
  },
  versionBox: {
    width: 80,
    borderLeftWidth: 1,
    borderColor: '#000',
    padding: 4,
    justifyContent: 'center',
    fontSize: 7,
  },
  areaHeader: {
    backgroundColor: '#e6e6e6',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 3,
    alignItems: 'center',
  },
  areaTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },

  /* -------- TABLA UNIFICADA -------- */
  tableContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    marginTop: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 18,
  },
  tableHeaderCol: {
    width: '25%',
    backgroundColor: '#e6e6e6',
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 3,
    justifyContent: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tableDataCol: {
    flex: 1,
    padding: 3,
    justifyContent: 'center',
    fontSize: 8,
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
    backgroundColor: '#fcfcfc',
  },
  legalText: {
    fontSize: 7,
    textAlign: 'justify',
    color: '#333',
    lineHeight: 1.15,
  },
  legalBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#000',
  },

  /* -------- FIRMAS -------- */
  signatureRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
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
        const est = item?.estudiantes || item?.estudiante || {};
        const studentName = item?.nombre_estudiante || `${est.nombres || ''} ${est.apellidos || ''}`.trim();
        const gradoStr = item?.grado || est.grado || '';
        const acu = est.datos_acudiente || {};
        const parentName = item?.nombre_acudiente || `${acu.nombres || ''} ${acu.apellidos || ''}`.trim();
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
                  <Text>FECHA</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{item?.fecha || ''}</Text>
                </View>
              </View>

              {/* FILA: LUGAR */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>LUGAR</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{item?.lugar || 'ORIENTACIÓN ESCOLAR'}</Text>
                </View>
              </View>

              {/* FILA: RESPONSABLE */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>RESPONSABLE</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{item?.nombre_orientador || ''}</Text>
                </View>
              </View>

              {/* FILA: ACUDIENTE(S) */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>ACUDIENTE(S)</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{parentName}</Text>
                </View>
              </View>

              {/* FILA: ESTUDIANTE / GRADO */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>ESTUDIANTE</Text>
                </View>
                <View style={[styles.tableDataCol, styles.tableCellBorderRight, { width: '40%', flex: 'none' }]}>
                  <Text>{studentName}</Text>
                </View>
                <View style={[styles.tableHeaderCol, { width: '15%', flex: 'none' }]}>
                  <Text>GRADO</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{gradoStr}</Text>
                </View>
              </View>

              {/* FILA: PROPÓSITO */}
              <View style={styles.tableRow}>
                <View style={styles.tableHeaderCol}>
                  <Text>PROPÓSITO</Text>
                </View>
                <View style={styles.tableDataCol}>
                  <Text>{item?.proposito || item?.objetivo || ''}</Text>
                </View>
              </View>

              {/* SECCIÓN: DESARROLLO DEL ENCUENTRO */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>DESARROLLO DEL ENCUENTRO</Text>
              </View>
              <View style={[styles.contentBox, { minHeight: 150 }]}>
                <Text>{item?.desarrollo || item?.descripcion || ''}</Text>
              </View>

              {/* SECCIÓN: OBSERVACIONES Y/O ACUERDOS */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleText}>OBSERVACIONES Y/O ACUERDOS</Text>
              </View>
              <View style={[styles.contentBox, { minHeight: 120 }]}>
                <Text>{item?.observaciones || item?.compromisos || item?.acuerdos || ''}</Text>
              </View>

              {/* TEXTO LEGAL ACLARATORIO */}
              <View style={styles.legalTextContainer}>
                <Text style={styles.legalText}>
                  <Text style={styles.legalBold}>ACLARACIÓN SOBRE FIRMA DIGITAL: </Text>
                  La presente acta se firma de manera digital, contando con la <Text style={styles.legalBold}>autorización expresa del 
                  acudiente para el uso de la firma registrada en el listado de asistencia</Text>, la cual se adopta como válida para efectos de 
                  constancia, seguimiento institucional y archivo del presente documento, de conformidad con los procedimientos internos de 
                  la institución educativa.
                </Text>
              </View>

              {/* BLOQUE FIRMAS UNIFICADO */}
              <View wrap={false}>
                {/* TÍTULO FIRMAN */}
                <View style={[styles.sectionTitleRow, { borderBottomWidth: 1 }]}>
                  <Text style={styles.sectionTitleText}>FIRMAN</Text>
                </View>

                {/* CAJAS DE FIRMA */}
                <View style={styles.signatureRow}>
                  <View style={styles.signatureCol}>
                    {firmas?.orientador && (
                      <Image src={firmas.orientador} style={styles.signatureImage} />
                    )}
                  </View>
                  <View style={styles.signatureCol}>
                    {firmas?.acudiente && (
                      <Image src={firmas.acudiente} style={styles.signatureImage} />
                    )}
                  </View>
                  <View style={styles.signatureColLast}>
                    {firmas?.estudiante && (
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
