import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

// Self-hosted font files (bundled with the site, no requests to Google).
// Only Cyrillic (Bulgarian letters) and Latin (digits, punctuation like „ “ –).
import '@fontsource/noto-sans/cyrillic-400.css';
import '@fontsource/noto-sans/cyrillic-700.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-700.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';

import { App } from './App';
import { applyDisplaySettings, loadDisplaySettings } from './settings/displaySettings';

// Apply saved display settings before the first paint to avoid a visible jump.
applyDisplaySettings(loadDisplaySettings());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter: GitHub Pages cannot route /about to index.html, but #/about always works. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
