import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SyncProvider } from './contexts/SyncContext'
import { SettingsProvider } from './contexts/SettingsContext'
import App from './App.jsx'
import './index.css'

// Manejo de errores de carga de chunks desactualizados por nuevas versiones
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Limpiar o actualizar service workers viejos para evitar conflictos de caché
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const r of registrations) {
      r.update();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SettingsProvider>
      <ThemeProvider>
        <SyncProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </SyncProvider>
      </ThemeProvider>
    </SettingsProvider>
  </AuthProvider>
);
