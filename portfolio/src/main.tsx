import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SabotageProvider } from './context/SabotageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SabotageProvider>
      <App />
    </SabotageProvider>
  </StrictMode>,
)
