import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!
import { useContext, useEffect } from 'react';
import CalendarPage from './pages/CalendarPage';
import { GCalContext } from './contexts/GCalContext';
import LoginPage from './pages/LoginPage';
import { EventContext } from './contexts/EventContext';
import { Spinner } from 'react-bootstrap';
import { DateInViewContext } from './contexts/DateInViewContext';

function App() {
  const { isLoggedIn, loadEvents, isAuthLoading } = useContext(GCalContext);
  const { areEventsLoaded } = useContext(EventContext);
  const { dateInView } = useContext(DateInViewContext);

  useEffect(() => {
    if (areEventsLoaded && isLoggedIn) return;
    loadEvents(dateInView);
  }, [isLoggedIn]);

  return (
    <>{isLoggedIn
      ? areEventsLoaded && !isAuthLoading
        ? <CalendarPage />
        : <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <Spinner animation="border" role="status" />
            <span>{isAuthLoading ? 'Reauthenticating...' : 'Loading Events...'}</span>
          </div>
        </div>
      : <LoginPage />
    }</>
  );
};

export default App;