import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyInitialTheme } from '@/lib/theme.js'

applyInitialTheme(
  typeof window !== 'undefined' ? window.localStorage : undefined,
  typeof window !== 'undefined' ? window.matchMedia : undefined,
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
