import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NoOpReporter, registerBrowserDiagnostics, setReporter } from './lib/diagnostics'
setReporter(new NoOpReporter())
if (typeof window !== 'undefined') registerBrowserDiagnostics()
const root = document.getElementById('root')!
if (root.hasChildNodes()) {
  hydrateRoot(root, <StrictMode><App /></StrictMode>)
} else {
  createRoot(root).render(<StrictMode><App /></StrictMode>)
}
