import './LoginPage.css';
import { useContext } from 'react';
import { GCalContext } from '../contexts/GCalContext';
import { Spinner } from 'react-bootstrap';

interface ILoginPageProps { }

function LoginPage(props: ILoginPageProps) {
    const { isTryingToAutoLogin, login } = useContext(GCalContext);

    return (
        <div
            className={['login-page'].join(' ')}>
            {!isTryingToAutoLogin
                ? <button onClick={() => {
                    login();
                }}>
                    Log in
                </button>
                :
                <div className={['spinner-container'].join(' ')}>
                    <Spinner animation="border" role="status">
                    </Spinner>
                    <span>Logging in...</span>
                </div>
            }
        </div >
    );
};

export default LoginPage;
