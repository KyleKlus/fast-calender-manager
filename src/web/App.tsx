import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!
import { StrictMode } from 'react';
import CalendarPage from './pages/CalendarPage';
import ContextProviders from './contexts/ContextProviders';
import StateWrapper from './components/StateWrapper';
import IDataSource from './interfaces/IDataSource';
import { useEffect } from 'react';
import { getBgHoverAndActiveColor } from './components/ColorSelector';

export interface IAppProps {
  externalDataSource?: IDataSource;
}


/**
 * App Component
 *
 * This component is the main component of the application. All contexts are hidden away inside the ContextProviders component. And alle loading screens are handled by the StateWrapper component.
 *
 */
const App: React.FC<IAppProps> = (props) => {
  useEffect(() => {
    const bgColor = window.localStorage.getItem('bgColor');
    if (bgColor) {
      document.body.style.setProperty('--bs-body-bg', bgColor);
      const bgHoverAndActiveColor = getBgHoverAndActiveColor(bgColor);
      document.body.style.setProperty('--bs-body-bg-hover', bgHoverAndActiveColor.hover);
      document.body.style.setProperty('--bs-body-bg-active', bgHoverAndActiveColor.active);
    } else {
      const cssBgColor = getComputedStyle(document.body).getPropertyValue('--bs-body-bg');
      window.localStorage.setItem('bgColor', cssBgColor);
    }
  }, []);

  return (
    <StrictMode>
      <ContextProviders externalDataSource={props.externalDataSource}>
        {!props.externalDataSource &&
          <script src="https://accounts.google.com/gsi/client" async />
        }
        <StateWrapper>
          <CalendarPage />
        </StateWrapper>
      </ContextProviders>
    </StrictMode>
  );
};

export default App;