import { useContext, useEffect } from "react";
import { DateInViewContext } from "../contexts/DateInViewContext";
import { EventContext } from "../contexts/EventContext";
import { GCalContext } from "../contexts/GCalContext";
import { Spinner } from "react-bootstrap/esm";
import LoginPage from "../pages/LoginPage";

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
    areEventsLoaded?: boolean;
}

const StateWrapper: React.FC<React.PropsWithChildren<IStateWrapperProps>> = (props) => {
    const { isLoggedIn, loadEvents, isAuthLoading, isTryingToAutoLogin } = useContext(GCalContext);
    const { areEventsLoaded } = useContext(EventContext);
    const { dateInView } = useContext(DateInViewContext);

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents(dateInView);
    }, [isLoggedIn]);

    return (
        <div className="state-wrapper">
            {props.areEventsLoaded !== undefined && props.areEventsLoaded
                ? props.children
                : <BusySpinner message="Loading Events..." />
            }
            {isLoggedIn && props.areEventsLoaded === undefined
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
