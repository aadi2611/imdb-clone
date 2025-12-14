import React from 'react'
import ReactDOM from 'react-dom/client'
import NotesApp from './NotesApp'
import { ThemeProvider } from './ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotesApp />
    </ThemeProvider>
  </React.StrictMode>,
)
