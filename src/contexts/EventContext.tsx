import { createContext, useState } from 'react';
import React from 'react';
import { EventImpl } from '@fullcalendar/core/internal';


interface IEventContext {
    currentEvent: EventImpl | undefined;
    setCurrentEvent: (currentEvent: EventImpl | undefined) => void;
}

const EventContext = createContext<IEventContext>({
    currentEvent: undefined,
    setCurrentEvent: (currentEvent: EventImpl | undefined) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const [currentEvent, setCurrentEvent] = useState<EventImpl | undefined>(undefined);

    return (
        <EventContext.Provider value={{ currentEvent, setCurrentEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };