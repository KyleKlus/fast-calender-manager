import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GCalProvider } from './contexts/GCalContext';
import { EventProvider } from './contexts/EventContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { DateInViewProvider } from './contexts/DateInViewContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <script src="https://accounts.google.com/gsi/client" async></script>
    <KeyboardShortcutProvider>
      <DateInViewProvider>
        <WeatherProvider>
          <TemplateProvider>
            <EventProvider>
              <GCalProvider>
                <App />
              </GCalProvider>
            </EventProvider>
          </TemplateProvider>
        </WeatherProvider>
      </DateInViewProvider>
    </KeyboardShortcutProvider>
  </React.StrictMode>,
);
