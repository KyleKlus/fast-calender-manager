import './LoginPage.css';
import { useContext } from 'react';
import { GCalContext } from '../contexts/GCalContext';

function LoginPage() {
    const { login } = useContext(GCalContext);

    return (
        <div className={['login-page'].join(' ')}>
            <button onClick={() => { login(); }}>
                Log in
            </button >
        </div>
    );
};

export default LoginPage;
