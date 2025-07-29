import { DateTime } from 'luxon';
import { useContext } from 'react';
import { GCalContext } from './GCalContext';
import CalendarPage from './CalendarPage';
function App() {
  const { isLoggedIn, gcal, isTryingToAutoLogin, setIsLoggedIn } = useContext(GCalContext);

  return (
    <>{isLoggedIn
      ?
      <CalendarPage />
      :
      <div>
        {isTryingToAutoLogin &&
          <button onClick={() => {
            gcal.handleAuthClick().then((res) => {
              setIsLoggedIn(true);
              localStorage.setItem("u_token", JSON.stringify(gapi.client.getToken()));
            });
          }}>
            Log in
          </button>
        }
      </div>
    }</>
  );
};

export default App;