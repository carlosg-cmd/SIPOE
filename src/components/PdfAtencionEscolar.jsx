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
  footerText: { fontSize: 8, textAlign: 'justify', marginTop: 10, marginBottom: 40 },
  signaturesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, position: 'relative' },
  signatureCol: { width: '30%', alignItems: 'center', justifyContent: 'flex-end' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderColor: '#000', paddingTop: 5, alignItems: 'center' },
  signatureText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2 },
  watermark: { position: 'absolute', top: -50, left: 100, width: 300, height: 300, opacity: 0.1 }
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
    <Text style={styles.sectionTitle}>ORIENTACIÓN ESCOLAR</Text>
  </View>
);

export default function PdfAtencionEscolar({ data, firmas }) {
  const f = data || {};
  const segs = f.seguimientos || Array(4).fill({ fecha: '', descripcion: '', acuerdos: '' });
  
  const hasMotivo = (motivo) => f.motivos && f.motivos.includes(motivo);
  const viveCon = f.vive_con || {};
  const t = (val) => (val === undefined || val === null || val === '' ? ' ' : String(val));

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Header />

        <View style={styles.table}>
          <Text style={styles.subTitle}>ATENCIÓN ESCOLAR</Text>
          <Text style={styles.subTitle}>DATOS DE ESTUDIANTE</Text>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>FECHA:</Text><Text style={styles.tableCellValue}>{t(f.fecha)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellLabel}>SEDE:</Text><Text style={styles.tableCellValue}>{t(f.sede)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>JORNADA:</Text><Text style={styles.tableCellValue}>{t(f.jornada)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>GRADO:</Text><Text style={styles.tableCellValue}>{t(f.grado)}</Text></View>
            <View style={[styles.tableCol, { width: '30%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>DIRECTOR DE GRUPO:</Text><Text style={styles.tableCellValue}>{t(f.director_grupo)}</Text></View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellLabel}>Primer Apellido</Text><Text style={styles.tableCellValue}>{t(f.apellido1)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellLabel}>Segundo Apellido</Text><Text style={styles.tableCellValue}>{t(f.apellido2)}</Text></View>
            <View style={[styles.tableCol, { width: '50%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Nombres</Text><Text style={styles.tableCellValue}>{t(f.nombres)}</Text></View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Tipo de Documento</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.tipo_documento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Número del Documento</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.numero_documento)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellLabel}>Sexo</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.sexo)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Fecha de Nacimiento</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.fecha_nacimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellLabel}>Edad</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.edad)}</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Lugar de Nacimiento</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.lugar_nacimiento)}</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '33%' }]}><Text style={styles.tableCellLabel}>Teléfono de contacto</Text><Text style={styles.tableCellValue}>{t(f.telefono_contacto)}</Text></View>
            <View style={[styles.tableCol, { width: '34%' }]}><Text style={styles.tableCellLabel}>Dirección de Residencia</Text><Text style={styles.tableCellValue}>{t(f.direccion_residencia)}</Text></View>
            <View style={[styles.tableCol, { width: '33%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>EPS</Text><Text style={styles.tableCellValue}>{t(f.eps)}</Text></View>
          </View>

          <Text style={styles.subTitle}>DATOS DE ACUDIENTES</Text>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellLabel}>Nombre del Padre</Text><Text style={styles.tableCellValue}>{t(f.padre_nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Teléfono</Text><Text style={styles.tableCellValue}>{t(f.padre_telefono)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Ocupación</Text><Text style={styles.tableCellValue}>{t(f.padre_ocupacion)}</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Escolaridad</Text><Text style={styles.tableCellValue}>{t(f.padre_escolaridad)}</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellLabel}>Nombre de la Madre</Text><Text style={styles.tableCellValue}>{t(f.madre_nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Teléfono</Text><Text style={styles.tableCellValue}>{t(f.madre_telefono)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Ocupación</Text><Text style={styles.tableCellValue}>{t(f.madre_ocupacion)}</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Escolaridad</Text><Text style={styles.tableCellValue}>{t(f.madre_escolaridad)}</Text></View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellLabel}>Nombre de Acudiente</Text><Text style={styles.tableCellValue}>{t(f.acudiente_nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Teléfono</Text><Text style={styles.tableCellValue}>{t(f.acudiente_telefono)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellLabel}>Ocupación</Text><Text style={styles.tableCellValue}>{t(f.acudiente_ocupacion)}</Text></View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Parentesco / Vínculo</Text><Text style={styles.tableCellValue}>{t(f.acudiente_parentesco)}</Text></View>
          </View>

          <Text style={styles.subTitle}>DATOS FAMILIARES</Text>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%', justifyContent: 'center' }]}><Text style={[styles.tableCellLabel, {textAlign: 'center'}]}>No. de Hermanos</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.num_hermanos)}</Text></View>
            <View style={[styles.tableCol, { width: '15%', justifyContent: 'center' }]}><Text style={[styles.tableCellLabel, {textAlign: 'center'}]}>Lugar que ocupa entre los hermanos</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(f.lugar_hermanos)}</Text></View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text style={[styles.tableCellLabel, styles.textCenter]}>Con quien vive</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 2 }}>
                <CheckBox checked={viveCon['Mamá']} label="Mamá   " />
                <CheckBox checked={viveCon['Papá']} label="Papá   " />
                <CheckBox checked={viveCon['Hermanos']} label="Hermanos   " />
                <CheckBox checked={viveCon['Tíos']} label="Tíos   " />
                <CheckBox checked={viveCon['Primos']} label="Primos   " />
                <CheckBox checked={viveCon['Abuelos']} label="Abuelos   " />
                <CheckBox checked={viveCon['Otros']} label="Otros" />
              </View>
            </View>
            <View style={[styles.tableCol, { width: '20%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Cuales</Text><Text style={styles.tableCellValue}>{t(f.vive_con_otros)}</Text></View>
          </View>

          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={styles.subTitle}>DESCRIPCIÓN FAMILIAR</Text>
              <Text style={[styles.tableCellValue, { minHeight: 40 }]}>{t(f.descripcion_familiar)}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>REGISTRO DE LA SITUACIÓN</Text>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}><Text style={styles.tableCellLabel}>Nombre de quien remite</Text><Text style={styles.tableCellValue}>{t(f.nombre_remite)}</Text></View>
            <View style={[styles.tableCol, { width: '40%', borderRightWidth: 0 }]}><Text style={styles.tableCellLabel}>Cargo</Text><Text style={styles.tableCellValue}>{t(f.cargo_remite)}</Text></View>
          </View>

          <Text style={styles.subTitle}>MOTIVO DE REMISIÓN</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%', padding: 4 }]}>
              <CheckBox checked={hasMotivo('Desempeño Académico')} label="Desempeño Académico" />
              <CheckBox checked={hasMotivo('Convivencia escolar')} label="Convivencia escolar" />
              <CheckBox checked={hasMotivo('Dificultades Emocionales')} label="Dificultades Emocionales" />
              <CheckBox checked={hasMotivo('Problemas Familiares')} label="Problemas Familiares" />
              <CheckBox checked={hasMotivo('Sospecha de consumo de SPA')} label="Sospecha de consumo de SPA" />
              <CheckBox checked={hasMotivo('Sospecha de maltrato')} label="Sospecha de maltrato (físico, sexual, psicológico, negligencia)" />
            </View>
            <View style={[styles.tableCol, { width: '50%', padding: 4, borderRightWidth: 0 }]}>
              <CheckBox checked={hasMotivo('Sospecha de déficit cognitivo o sensorial')} label="Sospecha de déficit cognitivo o sensorial" />
              <CheckBox checked={hasMotivo('Dificultades de Aprendizaje')} label="Dificultades de Aprendizaje" />
              <CheckBox checked={hasMotivo('Embarazo en adolescente')} label="Embarazo en adolescente" />
              <CheckBox checked={hasMotivo('Riesgo de deserción escolar')} label="Riesgo de deserción escolar" />
              <CheckBox checked={hasMotivo('Orientación vocacional/profesional')} label="Orientación vocacional/profesional" />
              <CheckBox checked={hasMotivo('Autolesión e Ideación suicida')} label="Autolesión e Ideación suicida" />
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0, padding: 2 }]}>
              <Text style={{ fontSize: 8 }}>Otro ¿Cuál?: {f.motivo_otro || ''}</Text>
            </View>
          </View>

        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="LETTER" style={styles.page}>
        <Header />

        <View style={styles.table}>
          <Text style={styles.subTitle}>DESCRIPCIÓN DE LA SITUACIÓN ACTUAL</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={[styles.tableCellValue, { minHeight: 60 }]}>{t(f.descripcion_situacion)}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>OBSERVACIONES</Text>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={[styles.tableCellValue, { minHeight: 60 }]}>{t(f.observaciones)}</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>DATOS DE SEGUIMIENTO</Text>
          {segs.map((seg, idx) => (
            <View key={idx} wrap={false} break={idx > 0 && idx % 4 === 0}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '20%' }]}><Text style={[styles.tableCellLabel, styles.textCenter]}>FECHA</Text><Text style={[styles.tableCellValue, styles.textCenter]}>{t(seg.fecha)}</Text></View>
                <View style={[styles.tableCol, { width: '80%', borderRightWidth: 0 }]}>
                  <Text style={[styles.tableCellLabel, styles.textCenter]}>DESCRIPCION DE SEGUIMIENTO</Text>
                  <Text style={[styles.tableCellValue, { minHeight: 30 }]}>{t(seg.descripcion)}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '20%' }]}></View>
                <View style={[styles.tableCol, { width: '80%', borderRightWidth: 0 }]}>
                  <Text style={[styles.tableCellLabel, styles.textCenter]}>ACUERDOS / OBSERVACIONES</Text>
                  <Text style={[styles.tableCellValue, { minHeight: 30 }]}>{t(seg.acuerdos)}</Text>
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.subTitle}>ORIENTACIONES Y RECOMENDACIONES</Text>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={[styles.tableCellValue, { minHeight: 60 }]}>{t(f.orientaciones)}</Text>
            </View>
          </View>
        </View>

      </Page>

      {/* PAGE 3 */}
      <Page size="LETTER" style={styles.page}>
        <Header />
        
        <View style={styles.table}>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={[styles.tableCellValue, { minHeight: 100 }]}>{' '}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Nota: </Text>
          Al firmar el registro de asistencia, doy fe de que la atención recibida fue de calidad, respetuosa, pertinente y no constituyó intervención psicoterapéutica y/o clínica de algún tipo. Además, respecto a la confidencialidad, se garantiza solo en los casos en los que la situación no me ponga en riesgo. (Manual Deontológico y bioético del psicólogo, 2016).
        </Text>

        <View style={styles.signaturesContainer}>
          <Image src="/logo.jpg" style={styles.watermark} />
          
          <View style={styles.signatureCol}>
            {firmas?.orientador && (
              <Image src={firmas.orientador} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>DOCENTE ORIENTADORA</Text>
            </View>
          </View>

          <View style={styles.signatureCol}>
            {firmas?.acudiente && (
              <Image src={firmas.acudiente} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>PADRE DE FAMILIA O ACUDIENTE</Text>
            </View>
          </View>

          <View style={styles.signatureCol}>
            {firmas?.estudiante && (
              <Image src={firmas.estudiante} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>ESTUDIANTE</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
