import './LoginPage.css';
import { useContext } from 'react';
import { GCalContext } from '../contexts/GCalContext';

interface ILoginPageProps { }

function LoginPage(props: ILoginPageProps) {
    const { isTryingToAutoLogin, gcal, setIsLoggedIn } = useContext(GCalContext);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw',
        }}>
            {!isTryingToAutoLogin
                ? <button onClick={() => {
                    if (gcal === undefined) { return }
                    gcal.handleAuthClick().then((res) => {
                        setIsLoggedIn(true);
                        localStorage.setItem("u_token", JSON.stringify(gapi.client.getToken()));
                    });
                }}>
                    Log in
                </button>
                : <div>Logging in...</div>
            }
        </div >
    );
};

export default LoginPage;
