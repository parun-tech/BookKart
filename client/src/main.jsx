// ============================================================================
// BOOKKART CLIENT SIDE MAIN ENTRYPOINT (Bootloader)
// ============================================================================
// This is the core entry mount point for the React/Vite front-end application.
// It imports the global stylesheet, attaches the App root element to the DOM tree,
// and boots up React with StrictMode rendering safety audits enabled.

import { StrictMode } from 'react'; // Imports React StrictMode utility to audit rendering performance and flag warnings
import { createRoot } from 'react-dom/client'; // Imports React DOM rendering mount engine
import './index.css'; // Imports central Deep Space custom CSS variables, layout stylesheets, and animations
import App from './App.jsx'; // Imports the core App route controller tree

// Select the root DOM node in index.html, initialize React render hub, and mount the main App component
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
