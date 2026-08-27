import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DictationButton({ onAppendText, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Inicializar Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'es-CO'; // Español Colombia por defecto

      rec.onstart = () => {
        setIsListening(true);
        toast.success('Micrófono activado. Te estoy escuchando...', { icon: '🎙️' });
      };

      let finalTranscript = '';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let newFinalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinalText += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (newFinalText) {
          onAppendText(newFinalText);
        }
      };

      rec.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Permiso de micrófono denegado.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onAppendText]);

  const toggleListening = useCallback((e) => {
    e.preventDefault(); // Prevenir submit si está en un form
    if (!recognition) {
      toast.error('Tu navegador no soporta el dictado por voz. Intenta con Chrome o Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        // En caso de que ya esté iniciado
        console.error(err);
      }
    }
  }, [recognition, isListening]);

  if (!recognition) {
    return null; // No renderizar si no es soportado
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center justify-center transition-all ${
        isListening 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 ring-2 ring-red-400 ring-offset-1 animate-pulse' 
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      } rounded-lg p-2 ${className}`}
      title={isListening ? "Detener dictado" : "Iniciar dictado por voz"}
    >
      {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 opacity-70" />}
    </button>
  );
}
