import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/** 开发用 BrowserRouter，便于 Figma html-to-design 使用 /path#figmacapture=…；生产 base 为 ./ 时仍用 HashRouter */
const Router = import.meta.env.DEV ? BrowserRouter : HashRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
