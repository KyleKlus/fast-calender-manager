import ReactDOM from 'react-dom/client';
import App from './App';

import './theme.css';

// Setup react
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <App />
);
