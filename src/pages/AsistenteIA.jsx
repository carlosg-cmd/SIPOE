import { useState } from 'react';
import { Bot, Sparkles, Copy, ExternalLink, ChevronRight, MessageSquare, Scale, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import DictationButton from '../components/DictationButton';

export default function AsistenteIA() {
  const [tipoPrompt, setTipoPrompt] = useState('remision');
  const [contexto, setContexto] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const IAs = [
    {
      nombre: 'ChatGPT',
      desc: 'Ideal para redacción general y análisis.',
      url: 'https://chat.openai.com',
      color: 'bg-[#10a37f]',
      icon: MessageSquare
    },
    {
      nombre: 'Claude',
      desc: 'Excelente para documentos largos y leyes.',
      url: 'https://claude.ai',
      color: 'bg-[#d97757]',
      icon: BookOpen
    },
    {
      nombre: 'Gemini',
      desc: 'Conectado a internet, datos recientes.',
      url: 'https://gemini.google.com',
      color: 'bg-[#4285f4]',
      icon: Sparkles
    }
  ];

  const generarPrompt = () => {
    if (!contexto.trim()) {
      toast.error('Por favor ingresa algunos detalles para generar el prompt');
      return;
    }

    let prompt = '';
    
    switch (tipoPrompt) {
      case 'remision':
        prompt = `ACTÚA COMO un experto Asesor y Orientador Escolar en una Institución Educativa en Colombia. Tu objetivo es redactar un acta de remisión (disciplinaria, psicológica o externa) altamente formal, empática y pedagógica.
        
A continuación te presento los hechos del caso narrados de forma informal:
"${contexto}"

Por favor, transforma estos hechos y estructura el acta oficial con:
1. Descripción clara y objetiva de la situación (sin juicios de valor, en lenguaje profesional).
2. Marco legal aplicable en el entorno escolar (Ley 1620, manual de convivencia, ruta de atención).
3. Recomendaciones pedagógicas a seguir y compromisos familiares/estudiantiles.`;
        break;
      
      case 'leyes':
        prompt = `ACTÚA COMO un experto en Legislación Educativa Colombiana y Derecho de Familia, enfocado en Orientación Escolar. Conoces a la perfección el Manual de Convivencia, la Ley de Infancia y Adolescencia (Ley 1098), y la Ley 1620 de convivencia escolar.
        
Tengo la siguiente situación dentro de la Institución Educativa:
"${contexto}"

Responde: ¿Cuáles son mis obligaciones legales como Orientador(a) Escolar en este caso? ¿Cuál es la ruta de atención integral (Promoción, Prevención, Atención, Seguimiento) exacta que debo activar institucionalmente? Cita artículos específicos si aplican.`;
        break;
        
      case 'seguimiento':
        prompt = `ACTÚA COMO un Psicólogo Educativo y Orientador Escolar. Estoy llevando el caso de un estudiante de la Institución Educativa y necesito escribir las actas de seguimiento y acuerdos pedagógicos.
        
Esto fue lo que se habló en la sesión de orientación:
"${contexto}"

Transforma estas notas en un registro formal, enfocado en el desarrollo integral del estudiante, listo para la carpeta institucional. Organízalo en:
- Motivo principal de la sesión
- Observaciones desde la orientación escolar
- Acuerdos pedagógicos y formativos pactados
- Próximos pasos a nivel institucional`;
        break;
      default:
        prompt = `Analiza la siguiente situación estrictamente desde la perspectiva de la Orientación Escolar y la Pedagogía Institucional: ${contexto}`;
    }

    setGeneratedPrompt(prompt);
  };

  const copiarPrompt = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('¡Prompt copiado! Ahora pégalo en la IA de tu preferencia.');
  };

  return (
    <div className="max-w-7xl mx-auto h-full w-full flex flex-col min-h-0">
      <div className="mb-2 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
          <Bot className="w-6 h-6 mr-3 text-indigo-600" />
          Asistente de Inteligencia Artificial
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Usa estas herramientas para redactar mejores actas, consultar rutas de atención y facilitar tu trabajo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* Enlaces a IA */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Plataformas Recomendadas</h2>
          {IAs.map((ia) => (
            <a
              key={ia.nombre}
              href={ia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${ia.color} text-white flex items-center justify-center mr-3 shadow-inner`}>
                    <ia.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{ia.nombre}</h3>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-sm text-slate-500">{ia.desc}</p>
            </a>
          ))}
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mt-4">
            <h4 className="font-bold text-indigo-900 mb-1 text-sm flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              ¿Cómo usar esto?
            </h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              1. Usa el generador de la derecha para crear las "instrucciones perfectas" (prompt).<br/>
              2. Cópialo.<br/>
              3. Abre una de las IAs aquí listadas, pega el texto y sorpréndete con los resultados.
            </p>
          </div>
        </div>

        {/* Generador de Prompts */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
              Generador Inteligente de Textos
            </h2>

            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">¿En qué necesitas ayuda hoy?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setTipoPrompt('remision')}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border text-left transition-all ${tipoPrompt === 'remision' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <FileText className="w-4 h-4 mb-2" />
                    Redactar Remisión
                  </button>
                  <button 
                    onClick={() => setTipoPrompt('seguimiento')}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border text-left transition-all ${tipoPrompt === 'seguimiento' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <MessageSquare className="w-4 h-4 mb-2" />
                    Acta de Seguimiento
                  </button>
                  <button 
                    onClick={() => setTipoPrompt('leyes')}
                    className={`px-4 py-3 text-sm font-medium rounded-xl border text-left transition-all ${tipoPrompt === 'leyes' ? 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Scale className="w-4 h-4 mb-2" />
                    Consulta de Leyes/Rutas
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Escribe un resumen rápido del caso (con tus propias palabras)
                  </label>
                  <DictationButton 
                    onAppendText={(text) => setContexto(prev => prev + (prev.endsWith(' ') ? '' : ' ') + text)} 
                  />
                </div>
                <textarea
                  rows="3"
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  placeholder="Ej: El estudiante de grado 8vo se peleó en el descanso. Llamamos a los padres pero no contestan..."
                  className="flex-1 min-h-0 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 resize-none transition-shadow text-sm"
                ></textarea>
              </div>

              <button
                onClick={generarPrompt}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex justify-center items-center text-sm flex-shrink-0"
              >
                Generar Instrucción Profesional <ChevronRight className="w-5 h-5 ml-2" />
              </button>

              {generatedPrompt && (
                <div className="mt-4 animate-fade-in-up flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <label className="block text-sm font-bold text-indigo-700">Tu texto listo para la IA:</label>
                    <button 
                      onClick={copiarPrompt}
                      className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Texto
                    </button>
                  </div>
                  <div className="relative flex-1 flex flex-col min-h-0">
                    <textarea
                      readOnly
                      value={generatedPrompt}
                      className="flex-1 min-h-0 w-full p-3 bg-white border border-indigo-200 rounded-xl text-slate-700 text-sm shadow-inner resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
// Un pequeño hack para importar FileText que faltó arriba
import { FileText } from 'lucide-react';
