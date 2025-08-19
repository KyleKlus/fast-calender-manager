import { EventInput } from '@fullcalendar/core';
import { createContext, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';

interface IEventContext {
    events: EventInput[];
    areEventsLoaded: boolean;
    dateInView: DateTime;
    selectedEvents: EventInput[];
    areBGEventsEditable: boolean;
    setEvents: (events: EventInput[]) => void;
    setAreEventsLoaded: (areEventsLoaded: boolean) => void;
    setDateInView: (date: DateTime) => void;
    setBGEventsEditable: (editable: boolean) => void;
    setSelectedEvents: (selectedEvents: EventInput[]) => void;
    setAddSelectedEvent: (selectedEvent: EventInput) => void;
    setRemoveSelectedEvent: (selectedEvent: EventInput) => void;
}

const EventContext = createContext<IEventContext>({
    selectedEvents: [],
    events: [],
    areEventsLoaded: false,
    dateInView: DateTime.now(),
    areBGEventsEditable: false,
    setEvents: (events: EventInput[]) => { },
    setAreEventsLoaded: (areEventsLoaded: boolean) => { },
    setDateInView: (date: DateTime) => { },
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
    const [dateInView, setDateInView] = useState(DateTime.now());

    function setAddSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents([...selectedEvents, selectedEvent]);
    }

    function setRemoveSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents(selectedEvents.filter((e) => e !== selectedEvent));
    }

    return (
        <EventContext.Provider value={{ events, areEventsLoaded, dateInView: dateInView, setEvents, setAreEventsLoaded, setDateInView, selectedEvents, areBGEventsEditable, setBGEventsEditable, setSelectedEvents, setAddSelectedEvent, setRemoveSelectedEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };