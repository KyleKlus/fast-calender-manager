import { useContext } from "react";
import { EventContext } from "../contexts/EventContext";
import { Spinner } from "react-bootstrap/esm";
import LoginPage from "../pages/LoginPage";
import { DataSourceContext } from "../contexts/DataSourceProvider";

const BusySpinner: React.FC<{ message: string }> = (props) => {
    return (
        <div style={{
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
                <span>{props.message}</span>
            </div>
        </div>
    );
};

export interface IStateWrapperProps {
}

const StateWrapper: React.FC<React.PropsWithChildren<IStateWrapperProps>> = (props) => {
    const { isLoggedIn, isAuthLoading, isTryingToAutoLogin } = useContext(DataSourceContext);
    const { areEventsLoaded } = useContext(EventContext);

    return (
        <div className="state-wrapper">
            {isLoggedIn
                ? areEventsLoaded && !isAuthLoading
                    ? props.children
                    : <BusySpinner message={isAuthLoading ? 'Reauthenticating...' : 'Loading Events...'} />
                : isTryingToAutoLogin
                    ? <BusySpinner message="Logging in..." />
                    : <LoginPage />
            }
        </div>
    );
}

export default StateWrapper;
