import { createContext, useState } from 'react';
import React from 'react';
import { EventImpl } from '@fullcalendar/core/internal';

interface IEventContext {
    currentEvents: EventImpl[];
    setCurrentEvents: (currentEvent: EventImpl[]) => void;
    setAddCurrentEvent: (currentEvent: EventImpl) => void;
    setRemoveCurrentEvent: (currentEvent: EventImpl) => void;
}

const EventContext = createContext<IEventContext>({
    currentEvents: [],
    setCurrentEvents: (currentEvent: EventImpl[]) => { },
    setAddCurrentEvent: (currentEvent: EventImpl) => { },
    setRemoveCurrentEvent: (currentEvent: EventImpl) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const [currentEvents, setCurrentEvents] = useState<EventImpl[]>([]);

    function setAddCurrentEvent(currentEvent: EventImpl) {
        setCurrentEvents([...currentEvents]);
    }

    function setRemoveCurrentEvent(currentEvent: EventImpl) {
        setCurrentEvents(currentEvents.filter((e) => e !== currentEvent));
    }

    return (
        <EventContext.Provider value={{ currentEvents, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };