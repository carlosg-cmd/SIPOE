import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SyncProvider } from './contexts/SyncContext'
import App from './App.jsx'
import './index.css'

// Limpiar service workers viejos para evitar conflictos de caché
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    // Solo limpia si hay más de uno (el viejo)
    if (registrations.length > 1) {
      registrations.forEach(r => r.unregister());
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ThemeProvider>
      <SyncProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </SyncProvider>
    </ThemeProvider>
  </AuthProvider>
);
