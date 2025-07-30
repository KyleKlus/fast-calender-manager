import './App.css';
import { useContext } from 'react';
import CalendarPage from './pages/CalendarPage';
import { GCalContext } from './contexts/GCalContext';
import LoginPage from './pages/LoginPage';

function App() {
  const { isLoggedIn } = useContext(GCalContext);

  return (
    <>{isLoggedIn
      ? <CalendarPage />
      : <LoginPage />
    }</>
  );
};

export default App;