import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import PdfRelacionEstudiantes from '../components/PdfRelacionEstudiantes';

export default function TestPdf() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
      <h1 className="text-2xl font-bold mb-4">Vista Previa del PDF Nativo (Vectorial)</h1>
      <p className="text-slate-600 mb-4">
        Este formato ha sido construido usando React-PDF. A diferencia de las vistas HTML, este documento se renderiza con vectores matemáticos exactos. 
        Prueba hacer zoom: notarás que las líneas jamás se verán borrosas ni dobles, sin importar la impresora.
      </p>
      <div className="flex-1 w-full bg-slate-100 rounded-lg shadow-inner overflow-hidden border border-slate-300">
        <PDFViewer width="100%" height="100%" className="border-none rounded-lg">
          <PdfRelacionEstudiantes />
        </PDFViewer>
      </div>
    </div>
  );
}
