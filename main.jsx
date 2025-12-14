import React from 'react'
import ReactDOM from 'react-dom/client'
import TodoApp from './TodoApp'
import { ThemeProvider } from './ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TodoApp />
    </ThemeProvider>
  </React.StrictMode>,
)
