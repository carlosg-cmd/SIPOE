import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 30, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  headerTable: { width: '100%', flexDirection: 'row', border: '1pt solid black', marginBottom: 10 },
  headerCol1: { width: '15%', borderRight: '1pt solid black', padding: 5, justifyContent: 'center', alignItems: 'center' },
  headerCol2: { width: '65%', borderRight: '1pt solid black', padding: 5, textAlign: 'center', justifyContent: 'center' },
  headerCol3: { width: '20%', padding: 5, textAlign: 'center', justifyContent: 'center' },
  
  title: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  subtitle: { fontSize: 8, fontStyle: 'italic', marginBottom: 3 },
  motto: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  docCode: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  
  mainTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 10 },
  
  // Table
  table: { width: '100%', borderTop: '1pt solid black', borderLeft: '1pt solid black' },
  tableRow: { flexDirection: 'row' },
  
  // Custom Headers for Complex Grid
  th: { 
    backgroundColor: '#f1f5f9', fontFamily: 'Helvetica-Bold', textAlign: 'center', 
    fontSize: 5, borderRight: '1pt solid black', borderBottom: '1pt solid black',
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2
  },
  thGroup: {
    borderRight: '1pt solid black', display: 'flex', flexDirection: 'column'
  },
  thGroupTitle: {
    backgroundColor: '#e2e8f0', fontFamily: 'Helvetica-Bold', textAlign: 'center', 
    fontSize: 5, borderBottom: '1pt solid black', padding: 2, flex: 1,
    display: 'flex', justifyContent: 'center'
  },
  thSubRow: {
    flexDirection: 'row', flex: 2
  },
  thSubCell: {
    backgroundColor: '#f1f5f9', fontFamily: 'Helvetica-Bold', textAlign: 'center', 
    fontSize: 4, borderRight: '1pt solid black', borderBottom: '1pt solid black',
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 1
  },
  
  td: { 
    fontSize: 5, borderRight: '1pt solid black', borderBottom: '1pt solid black',
    display: 'flex', justifyContent: 'center', padding: 2, textAlign: 'center'
  },

  // Column Widths
  c1: { width: '2%' },   // #
  c2: { width: '10%' },  // NOMBRE ESTUDIANTE
  c3: { width: '10%' },  // ACUDIENTE
  c4: { width: '5%' },   // TELEFONO
  c5: { width: '4%' },   // SEDE
  c6Group: { width: '9%' }, // REMISION (3 sub-cols)
  c6Sub: { width: '33.33%' },
  c7: { width: '7%' },   // MOTIVO
  c8: { width: '5%' },   // FECHA
  c9: { width: '5%' },   // DIR GRUPO
  c10: { width: '4%' },  // JORNADA
  c11: { width: '3%' },  // GRADO
  c12Group: { width: '6%' }, // ACOMPAÑAMIENTO (2 sub-cols)
  c12Sub: { width: '50%' },
  c13Group: { width: '12%' }, // ACTIVACIÓN RUTA (4 sub-cols)
  c13Sub: { width: '25%' },
  c14: { width: '6%' },  // FORMATO
  c15: { width: '12%' }, // OBSERVACIONES
});

export default function PdfRelacionEstudiantes({ data = [] }) {
  // Generate blank rows
  const rows = data.length > 0 ? data : Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    estudiante: '', acudiente: '', tel: '', sede: '',
    remDoc: '', remAcu: '', remAut: '', motivo: '', fecha: '', dirGrupo: '',
    jornada: '', grado: '',
    acompInd: '', acompAcu: '',
    rutaSalud: '', rutaIcbf: '', rutaComisaria: '', rutaPolicia: '',
    formato: '', obs: ''
  }));

  return (
    <Document>
      <Page size={[1008, 612]} orientation="landscape" style={styles.page}>
        
        {/* MEMBRETE */}
        <View style={styles.headerTable}>
          <View style={styles.headerCol1}>
            <Text style={{ fontSize: 8 }}>LOGO</Text>
          </View>
          <View style={styles.headerCol2}>
            <Text style={styles.title}>INSTITUCION EDUCATIVA DIVINO NIÑO</Text>
            <Text style={styles.subtitle}>Resolución de Aprobación 9430 DEL 23/Noviembre/2004</Text>
            <Text style={styles.motto}>"FE, ESPERANZA Y AMOR"</Text>
          </View>
          <View style={styles.headerCol3}>
            <Text style={styles.docCode}>AD – 01 Versión 01</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>Fecha: 23/01/2025</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>
          RELACIÓN ESTUDIANTES ATENDIDOS ORIENTACIÓN ESCOLAR
        </Text>

        <View style={styles.table}>
          {/* HEADER ROW */}
          <View style={[styles.tableRow, { height: 24 }]}>
            <View style={[styles.th, styles.c1]}><Text>#</Text></View>
            <View style={[styles.th, styles.c2]}><Text>NOMBRE Y APELLIDO ESTUDIANTE</Text></View>
            <View style={[styles.th, styles.c3]}><Text>NOMBRE Y APELLIDO ACUDIENTE</Text></View>
            <View style={[styles.th, styles.c4]}><Text>TELEFONO</Text></View>
            <View style={[styles.th, styles.c5]}><Text>SEDE</Text></View>
            
            {/* GRUPO REMISIÓN */}
            <View style={[styles.thGroup, styles.c6Group]}>
              <View style={styles.thGroupTitle}><Text>REMISIÓN</Text></View>
              <View style={styles.thSubRow}>
                <View style={[styles.thSubCell, styles.c6Sub]}><Text>DOCENTE</Text></View>
                <View style={[styles.thSubCell, styles.c6Sub]}><Text>ACUDIENTE</Text></View>
                <View style={[styles.thSubCell, styles.c6Sub, { borderRight: 0 }]}><Text>AUTÓNOMO</Text></View>
              </View>
            </View>

            <View style={[styles.th, styles.c7]}><Text>MOTIVO</Text></View>
            <View style={[styles.th, styles.c8]}><Text>FECHA ATENC.</Text></View>
            <View style={[styles.th, styles.c9]}><Text>DIR GRUPO</Text></View>
            <View style={[styles.th, styles.c10]}><Text>JORNADA</Text></View>
            <View style={[styles.th, styles.c11]}><Text>GRADO</Text></View>
            
            {/* GRUPO ACOMPAÑAMIENTO */}
            <View style={[styles.thGroup, styles.c12Group]}>
              <View style={styles.thGroupTitle}><Text>ACOMPAÑAMIENTO</Text></View>
              <View style={styles.thSubRow}>
                <View style={[styles.thSubCell, styles.c12Sub]}><Text>INDIVIDUAL</Text></View>
                <View style={[styles.thSubCell, styles.c12Sub, { borderRight: 0 }]}><Text>C. ACUDIENTES</Text></View>
              </View>
            </View>

            {/* GRUPO ACTIVACIÓN RUTA */}
            <View style={[styles.thGroup, styles.c13Group]}>
              <View style={styles.thGroupTitle}><Text>ACTIVACIÓN RUTA</Text></View>
              <View style={styles.thSubRow}>
                <View style={[styles.thSubCell, styles.c13Sub]}><Text>SALUD</Text></View>
                <View style={[styles.thSubCell, styles.c13Sub]}><Text>ICBF</Text></View>
                <View style={[styles.thSubCell, styles.c13Sub]}><Text>COMISARÍA</Text></View>
                <View style={[styles.thSubCell, styles.c13Sub, { borderRight: 0 }]}><Text>POLICÍA</Text></View>
              </View>
            </View>

            <View style={[styles.th, styles.c14]}><Text>FORMATO DE ATENCIÓN</Text></View>
            <View style={[styles.th, styles.c15, { borderRight: 0 }]}><Text>OBSERVACIONES</Text></View>
          </View>
          
          {/* BODY ROWS */}
          {rows.map((row, i) => (
            <View key={i} style={[styles.tableRow, { minHeight: 18 }]} wrap={false}>
              <View style={[styles.td, styles.c1]}><Text>{row.id}</Text></View>
              <View style={[styles.td, styles.c2, { textAlign: 'left' }]}><Text>{row.estudiante}</Text></View>
              <View style={[styles.td, styles.c3, { textAlign: 'left' }]}><Text>{row.acudiente}</Text></View>
              <View style={[styles.td, styles.c4]}><Text>{row.tel}</Text></View>
              <View style={[styles.td, styles.c5]}><Text>{row.sede}</Text></View>
              
              <View style={[styles.td, styles.c6Group, styles.c6Sub]}><Text>{row.remDoc}</Text></View>
              <View style={[styles.td, styles.c6Group, styles.c6Sub]}><Text>{row.remAcu}</Text></View>
              <View style={[styles.td, styles.c6Group, styles.c6Sub]}><Text>{row.remAut}</Text></View>

              <View style={[styles.td, styles.c7]}><Text>{row.motivo}</Text></View>
              <View style={[styles.td, styles.c8]}><Text>{row.fecha}</Text></View>
              <View style={[styles.td, styles.c9]}><Text>{row.dirGrupo}</Text></View>
              <View style={[styles.td, styles.c10]}><Text>{row.jornada}</Text></View>
              <View style={[styles.td, styles.c11]}><Text>{row.grado}</Text></View>

              <View style={[styles.td, styles.c12Group, styles.c12Sub]}><Text>{row.acompInd}</Text></View>
              <View style={[styles.td, styles.c12Group, styles.c12Sub]}><Text>{row.acompAcu}</Text></View>

              <View style={[styles.td, styles.c13Group, styles.c13Sub]}><Text>{row.rutaSalud}</Text></View>
              <View style={[styles.td, styles.c13Group, styles.c13Sub]}><Text>{row.rutaIcbf}</Text></View>
              <View style={[styles.td, styles.c13Group, styles.c13Sub]}><Text>{row.rutaComisaria}</Text></View>
              <View style={[styles.td, styles.c13Group, styles.c13Sub]}><Text>{row.rutaPolicia}</Text></View>

              <View style={[styles.td, styles.c14]}><Text>{row.formato}</Text></View>
              <View style={[styles.td, styles.c15, { borderRight: 0, textAlign: 'left' }]}><Text>{row.obs}</Text></View>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
}
