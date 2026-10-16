import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('%c[InterviewBro AI]%c Build v2.4 (Safe Response Parser & Cloud Auth Active)', 'color: #3b82f6; font-weight: bold;', 'color: #10b981;');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
