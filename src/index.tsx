import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ContextProviders from './contexts/ContextProviders';

// Setup react
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <script src="https://accounts.google.com/gsi/client" async></script>
    <ContextProviders>
      <App />
    </ContextProviders>
  </React.StrictMode>,
);
