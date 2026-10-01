import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadCatalog } from './data/catalog'
import StartupError from './components/StartupError'

try {
  await loadCatalog()
  const { default: App } = await import('./App.jsx')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
} catch {
  createRoot(document.getElementById('root')).render(<StartupError />)
}
