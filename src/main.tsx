import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BXAppProvider } from './lib/bx'
import './fonts.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><BXAppProvider><App /></BXAppProvider></StrictMode>)
