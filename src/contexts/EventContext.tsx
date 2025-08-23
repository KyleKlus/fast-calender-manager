import { EventInput } from '@fullcalendar/core';
import { createContext, useContext, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { DateInViewContext } from './DateInViewContext';

interface IEventContext {
    events: EventInput[];
    areEventsLoaded: boolean;
    selectedEvents: EventInput[];
    areBGEventsEditable: boolean;
    setEvents: (events: EventInput[]) => void;
    setAreEventsLoaded: (areEventsLoaded: boolean) => void;
    setBGEventsEditable: (editable: boolean) => void;
    setSelectedEvents: (selectedEvents: EventInput[]) => void;
    setAddSelectedEvent: (selectedEvent: EventInput) => void;
    setRemoveSelectedEvent: (selectedEvent: EventInput) => void;
}

const EventContext = createContext<IEventContext>({
    selectedEvents: [],
    events: [],
    areEventsLoaded: false,
    areBGEventsEditable: false,
    setEvents: (events: EventInput[]) => { },
    setAreEventsLoaded: (areEventsLoaded: boolean) => { },
    setBGEventsEditable: (editable: boolean) => { },
    setSelectedEvents: (selectedEvents: EventInput[]) => { },
    setAddSelectedEvent: (selectedEvent: EventInput) => { },
    setRemoveSelectedEvent: (selectedEvent: EventInput) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const [selectedEvents, setSelectedEvents] = useState<EventInput[]>([]);
    const [areBGEventsEditable, setBGEventsEditable] = useState<boolean>(false);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);

    function setAddSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents([...selectedEvents, selectedEvent]);
    }

    function setRemoveSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents(selectedEvents.filter((e) => e !== selectedEvent));
    }

    return (
        <EventContext.Provider value={{ events, areEventsLoaded, setEvents, setAreEventsLoaded, selectedEvents, areBGEventsEditable, setBGEventsEditable, setSelectedEvents, setAddSelectedEvent, setRemoveSelectedEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };