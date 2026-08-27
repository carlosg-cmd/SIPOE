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
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    padding: 3,
    backgroundColor: '#f1f5f9',
  },
  tableCellValue: {
    fontSize: 9,
    padding: 3,
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
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', backgroundColor: '#e2e8f0', textAlign: 'center', padding: 4, borderWidth: 1, borderColor: '#000', marginBottom: 5 },
  subTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', backgroundColor: '#9EB9E6', textAlign: 'center', padding: 3, borderBottomWidth: 1, borderColor: '#000' },
  signaturesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, position: 'relative' },
  signatureCol: { width: '45%', alignItems: 'center', justifyContent: 'flex-end' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderColor: '#000', paddingTop: 5, alignItems: 'center' },
  signatureText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  signatureValue: { fontSize: 9, marginBottom: 2 },
  signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2 },
  watermark: { position: 'absolute', top: -50, left: 100, width: 300, height: 300, opacity: 0.1 },
  paragraph: { fontSize: 9, textAlign: 'justify', lineHeight: 1.5, marginBottom: 10, marginTop: 10 },
  largeTextBox: { minHeight: 60, padding: 5, fontSize: 9 }
});

const Header = () => (
  <View style={{ marginBottom: 5 }} fixed>
    <View style={styles.headerContainer}>
      <View style={styles.logoBox}>
        <Image src="/logo.jpg" style={{ width: 50, height: 50, objectFit: 'contain' }} />
      </View>
      <View style={styles.titleBox}>
        <Text style={styles.headerTitle}>INSTITUCIÓN EDUCATIVA DIVINO NIÑO</Text>
        <Text style={styles.headerSubtitle}>Resolución de Aprobación 9430 DEL 23/Noviembre/2004</Text>
        <Text style={styles.headerQuote}>"FE, ESPERANZA Y AMOR"</Text>
      </View>
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>AD - 01</Text>
        <Text style={styles.versionText}>Versión 01</Text>
        <Text style={styles.versionText}>Fecha: 03/09/2021</Text>
      </View>
    </View>
    <Text style={styles.sectionTitle}>FORMATO REMISIÓN A ENTIDADES</Text>
  </View>
);

export default function PdfRemisionEntidades({ data, firmas }) {
  const dataArray = Array.isArray(data) ? data : [data || {}];

  return (
    <Document>
      {dataArray.map((item, index) => {
        const data = item || {};
        const nombresArr = (data.nombres || '').split(' ');
        const nom1 = nombresArr[0] || '';
        const nom2 = nombresArr.slice(1).join(' ') || '';

        return (
          <React.Fragment key={index}>
            <Page size="A4" style={styles.page}>
        <Header />
        
        {/* INSTITUCION */}
        <View style={styles.table}>
          <Text style={styles.subTitle}>DATOS DE LA INSTITUCIÓN QUE REMITE</Text>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Fecha:</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellValue}>{data.fecha}</Text></View>
            <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCellLabel}>Institución que Remite:</Text></View>
            <View style={[styles.tableCol, { width: '30%', borderRightWidth: 0 }]}><Text style={[styles.tableCellValue, styles.textCenter]}>I.E. Divino Niño</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Grado:</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellValue}>{data.grado}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Sede:</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellValue}>{data.sede}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellLabel}>Jornada:</Text></View>
            <View style={[styles.tableCol, { width: '15%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.jornada}</Text></View>
          </View>
        </View>

        {/* DATOS DEL REMITIDO */}
        <View style={styles.table}>
          <Text style={styles.subTitle}>DATOS DEL REMITIDO</Text>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellLabel, styles.textCenter]}>Primer Nombre</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellLabel, styles.textCenter]}>Segundo Nombre</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellLabel, styles.textCenter]}>Primer Apellido</Text></View>
            <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text style={[styles.tableCellLabel, styles.textCenter]}>Segundo Apellido</Text></View>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellValue, styles.textCenter]}>{nom1}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellValue, styles.textCenter]}>{nom2}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={[styles.tableCellValue, styles.textCenter]}>{data.apellido1 || ''}</Text></View>
            <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text style={[styles.tableCellValue, styles.textCenter]}>{data.apellido2 || ''}</Text></View>
          </View>
          
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellLabel}>Sexo:</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellValue}>{data.sexo}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellLabel}>Tipo de documento:</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellValue}>{data.tipo_documento}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>N° identif.:</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.numero_documento}</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Fecha de Nacimiento:</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellValue}>{data.fecha_nacimiento}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellLabel}>Edad:</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellValue}>{data.edad}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellLabel}>EPS:</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.eps}</Text></View>
          </View>
        </View>

        {/* DATOS DEL PADRE DE FAMILIA */}
        <View style={styles.table}>
          <Text style={styles.subTitle}>DATOS DEL PADRE DE FAMILIA O ACUDIENTE</Text>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellLabel}>Nombre del Padre/Madre/Acudiente:</Text></View>
            <View style={[styles.tableCol, { width: '60%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.acudiente_nombre}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Dirección:</Text></View>
            <View style={[styles.tableCol, { width: '45%' }]}><Text style={styles.tableCellValue}>{data.direccion_residencia}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Teléfono:</Text></View>
            <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.acudiente_telefono}</Text></View>
          </View>
        </View>

        {/* DATOS DE LA REMISION */}
        <View style={styles.table}>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderColor: '#000' }]}>
            <View style={[styles.tableCol, { width: '30%', backgroundColor: '#f1f5f9' }]}><Text style={styles.tableCellLabel}>Entidad a la que se remite:</Text></View>
            <View style={[styles.tableCol, { width: '70%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.entidad_remite}</Text></View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%', backgroundColor: '#f1f5f9' }]}><Text style={styles.tableCellLabel}>Tipo de Atención:</Text></View>
            <View style={[styles.tableCol, { width: '70%', borderRightWidth: 0 }]}><Text style={styles.tableCellValue}>{data.tipo_atencion}</Text></View>
          </View>
        </View>

        {/* TEXTO DE LEY */}
        <Text style={styles.paragraph}>
          Acorde a lo establecido en la Ley 1098 de 2006, Ley 1620 de 2013 y normas concordantes, solicitamos la atención integral del presente caso, teniendo en cuenta su competencia y considerando que la Institución Educativa, siendo garante de los derechos de los niños, niñas, adolescentes y jóvenes da cumplimiento a los procesos pedagógicos y convivenciales a su cargo.
        </Text>

        {/* MOTIVO Y SOLICITUD */}
        <View style={styles.table}>
          <Text style={styles.subTitle}>Motivo de la Remisión</Text>
          <View style={{ borderBottomWidth: 1, borderColor: '#000' }}>
            <Text style={styles.largeTextBox}>{data.motivo_remision}</Text>
          </View>
          <Text style={styles.subTitle}>SOLICITUD:</Text>
          <View>
            <Text style={styles.largeTextBox}>{data.solicitud}</Text>
          </View>
        </View>

        {/* FIRMAS */}
        <View style={styles.signaturesContainer} wrap={false}>
          <View style={styles.signatureCol}>
            {firmas.orientador ? <Image src={firmas.orientador} style={styles.signatureImage} /> : <View style={{ height: 40 }} />}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Nombre de quien remite</Text>
              <Text style={styles.signatureValue}>{data.nombre_remite}</Text>
              <Text style={styles.signatureText}>Cargo</Text>
              <Text style={styles.signatureValue}>{data.cargo_remite}</Text>
              <Text style={styles.signatureText}>Fecha</Text>
              <Text style={styles.signatureValue}>{data.fecha}</Text>
            </View>
          </View>
          <View style={styles.signatureCol}>
            <View style={{ height: 40 }} />
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Nombre de quien recibe</Text>
              <Text style={styles.signatureValue}>{data.nombre_recibe}</Text>
              <Text style={styles.signatureText}>Cargo</Text>
              <Text style={styles.signatureValue}>{data.cargo_recibe}</Text>
              <Text style={styles.signatureText}>Fecha recibida</Text>
              <Text style={styles.signatureValue}>{data.fecha_recibida}</Text>
            </View>
          </View>
        </View>

      </Page>
          </React.Fragment>
        );
      })}
    </Document>
  );
}
