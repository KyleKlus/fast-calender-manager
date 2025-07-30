import './LoginPage.css';
import { useContext } from 'react';
import { GCalContext } from '../contexts/GCalContext';

interface ILoginPageProps { }

function LoginPage(props: ILoginPageProps) {
    const { isTryingToAutoLogin, gcal, setIsLoggedIn } = useContext(GCalContext);

    return (
        <div>
            {!isTryingToAutoLogin &&
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
    );
};

export default LoginPage;
