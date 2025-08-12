import { EventInput } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import { createContext, useState } from 'react';
import React from 'react';
import { colorMap, defaultColorId } from '../components/ColorSelector';
import { DateTime } from 'luxon';

export interface SimplifiedEvent {
    id?: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    description: string;
    colorId: number;
    location?: string;
    extendedProps?: { description?: string };
}

export function convertEventImplToEventInput(event: EventImpl): EventInput {
    const start = event.start === null ? undefined : event.start;
    const end = event.end === null ? undefined : event.end;

    return {
        id: event.id,
        title: event.title,
        start: start,
        end: end,
        allDay: event.allDay,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        extendedProps: {
            description: event.extendedProps?.description,
        },
    };
}

export function convertEventInputToSimplifiedEvent(event: EventInput): SimplifiedEvent {
    let start: string = '';
    let end: string = '';

    if (event.start !== undefined && typeof event.start === typeof new Date()) {
        start = (event.start as Date).toISOString();
    } else if (event.start !== undefined && typeof event.start === 'string') {
        start = event.start;
    }

    if (event.end !== undefined && typeof event.end === typeof new Date()) {
        end = (event.end as Date).toISOString();
    } else if (event.end !== undefined && typeof event.end === 'string') {
        end = event.end;
    }

    const colorId = event.backgroundColor === undefined || event.backgroundColor === '' ? defaultColorId : colorMap.indexOf(event.backgroundColor);

    return {
        id: event.id,
        title: (event.title as string),
        start: start,
        end: end,
        allDay: event.allDay || false,
        description: event.extendedProps?.description,
        extendedProps: event.extendedProps,
        colorId: colorId,
        location: event.location,
    };
}

export function convertEventImplToSimplifiedEvent(event: EventImpl): SimplifiedEvent {
    return convertEventInputToSimplifiedEvent(convertEventImplToEventInput(event));
}

interface IEventContext {
    events: EventInput[];
    areEventsLoaded: boolean;
    date: DateTime;
    setEvents: (events: EventInput[]) => void;
    setAreEventsLoaded: (areEventsLoaded: boolean) => void;
    setDate: (date: DateTime) => void;
    currentEvents: EventInput[];
    areBGEventsEditable: boolean;
    setBGEventsEditable: (editable: boolean) => void;
    setCurrentEvents: (currentEvents: EventInput[]) => void;
    setAddCurrentEvent: (currentEvent: EventInput) => void;
    setRemoveCurrentEvent: (currentEvent: EventInput) => void;
}

const EventContext = createContext<IEventContext>({
    currentEvents: [],
    events: [],
    areEventsLoaded: false,
    date: DateTime.now(),
    setEvents: (events: EventInput[]) => { },
    setAreEventsLoaded: (areEventsLoaded: boolean) => { },
    setDate: (date: DateTime) => { },
    areBGEventsEditable: false,
    setBGEventsEditable: (editable: boolean) => { },
    setCurrentEvents: (currentEvents: EventInput[]) => { },
    setAddCurrentEvent: (currentEvent: EventInput) => { },
    setRemoveCurrentEvent: (currentEvent: EventInput) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const [currentEvents, setCurrentEvents] = useState<EventInput[]>([]);
    const [areBGEventsEditable, setBGEventsEditable] = useState<boolean>(false);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);
    const [date, setDate] = useState(DateTime.now());


    function setAddCurrentEvent(currentEvent: EventInput) {
        setCurrentEvents([...currentEvents, currentEvent]);
    }

    function setRemoveCurrentEvent(currentEvent: EventInput) {
        setCurrentEvents(currentEvents.filter((e) => e !== currentEvent));
    }

    return (
        <EventContext.Provider value={{ events, areEventsLoaded, date, setEvents, setAreEventsLoaded, setDate, currentEvents, areBGEventsEditable, setBGEventsEditable, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };