import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { errorMonitoring } from './services/errorMonitoring'
import { ErrorBoundary } from './components/ErrorBoundary'

// Initialize privacy-respecting client error monitoring (Sentry)
errorMonitoring.init();

console.log('%c[InterviewBro AI]%c Build v2.5 (Sentry & Privacy Analytics Active)', 'color: #3b82f6; font-weight: bold;', 'color: #10b981;');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
