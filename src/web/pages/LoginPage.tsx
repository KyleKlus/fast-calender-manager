import { DataSourceContext } from '../contexts/DataSourceProvider';
import './LoginPage.css';
import { useContext } from 'react';

function LoginPage() {
    const { login } = useContext(DataSourceContext);

    return (
        <div className={['login-page'].join(' ')}>
            <button onClick={() => { login(); }}>
                Log in
            </button >
        </div>
    );
};

export default LoginPage;
