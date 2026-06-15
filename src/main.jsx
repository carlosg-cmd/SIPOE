import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SyncProvider } from './contexts/SyncContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SyncProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SyncProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
