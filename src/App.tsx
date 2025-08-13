import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!
import { useContext, useEffect } from 'react';
import CalendarPage from './pages/CalendarPage';
import { GCalContext } from './contexts/GCalContext';
import LoginPage from './pages/LoginPage';
import { EventContext } from './contexts/EventContext';

function App() {
  const { isLoggedIn, loadEvents } = useContext(GCalContext);
  const { areEventsLoaded, date } = useContext(EventContext);

  useEffect(() => {
    if (areEventsLoaded && isLoggedIn) return;
    loadEvents(date);
  }, [isLoggedIn]);

  return (
    <>{isLoggedIn
      ? areEventsLoaded
        ? <CalendarPage />
        : <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw',
        }}>
          <div>Loading events...</div>
        </div>
      : <LoginPage />
    }</>
  );
};

export default App;