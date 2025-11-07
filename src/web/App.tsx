import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!
import { StrictMode } from 'react';
import CalendarPage from './pages/CalendarPage';
import ContextProviders from './contexts/ContextProviders';
import StateWrapper from './components/StateWrapper';
import IDataSource from './handlers/IDataSource';

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