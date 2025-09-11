import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppProviders from './contexts/AppProviders';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <script src="https://accounts.google.com/gsi/client" async></script>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
