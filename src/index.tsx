import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GCalProvider } from './contexts/GCalContext';
import { EventProvider } from './contexts/EventContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { TemplateProvider } from './contexts/TemplateContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <script src="https://accounts.google.com/gsi/client" async></script>
    <KeyboardShortcutProvider>
      <TemplateProvider>
        <EventProvider>
          <GCalProvider>
            <App />
          </GCalProvider>
        </EventProvider>
      </TemplateProvider>
    </KeyboardShortcutProvider>
  </React.StrictMode>,
);
