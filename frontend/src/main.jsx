import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import './styles/responsive.css'

const GlobalStyles = () => (
  <style>{`
        :root {
            --font-main: 'Inter', system-ui, -apple-system, sans-serif;
            --bg-page: #ffffff;
            --bg-sidebar: #2b3445;
            --bg-card: #ffffff;
            --bg-hover: #f5f6f8;
            --bg-modal: #ffffff;
            --text-main: #323338;
            --text-secondary: #676879;
            --text-muted: #9fa2b2;
            --border-color: #e1e1e1;
            --primary-color: #0085ff;
            --primary-hover: #0073e6;
            --success-color: #00ca72;
            --danger-color: #e2445c;
            --warning-color: #fdab3d;
            --sidebar-text: #cbd5e0;
            --sidebar-active-bg: rgba(0, 133, 255, 0.1);
        }

        [data-theme='dark'] {
            --bg-page: #101217;
            --bg-sidebar: #1c222d;
            --bg-card: #1c222d;
            --bg-hover: #2b3445;
            --bg-modal: #1c222d;
            --text-main: #e1e1e1;
            --text-secondary: #a0a0a0;
            --text-muted: #676879;
            --border-color: #2b3445;
            --sidebar-text: #a0a0a0;
        }

        * {
            box-sizing: border-box;
            transition: background-color 0.2s ease, color 0.1s ease, border-color 0.2s ease;
        }

        :root {
            font-family: var(--font-main);
            line-height: 1.5;
            font-weight: 400;
            color: var(--text-main);
            background-color: var(--bg-page);
            -webkit-font-smoothing: antialiased;
        }

        body {
            margin: 0;
            display: flex;
            min-width: 320px;
            min-height: 100vh;
            overflow: hidden;
            background-color: var(--bg-page);
            color: var(--text-main);
        }

        #root { width: 100%; }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-page); }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GlobalStyles />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
