import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  // Configuración predeterminada
  const defaultSettings = {
    institucion: 'I.E. Divino Niño',
    sedes: ['Principal', 'Sede A', 'Sede B'],
    tema: 'light' // o 'dark'
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sipoe_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('sipoe_settings', JSON.stringify(settings));
    
    // Aplicar tema (aunque el mockup es claro, dejamos la lógica por si acaso)
    if (settings.tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
