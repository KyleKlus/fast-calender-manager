import { EventInput } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import { createContext, useState } from 'react';
import React from 'react'; import { colorMap } from './GCalContext';
7

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

    return {
        id: event.id,
        title: (event.title as string),
        start: start,
        end: end,
        allDay: event.allDay || false,
        description: event.extendedProps?.description,
        extendedProps: event.extendedProps,
        colorId: event.backgroundColor === undefined || event.backgroundColor === '' || colorMap.indexOf(event.backgroundColor) === -1 ? 0 : colorMap.indexOf(event.backgroundColor),
        location: event.location,
    };
}

export function convertEventImplToSimplifiedEvent(event: EventImpl): SimplifiedEvent {
    return convertEventInputToSimplifiedEvent(convertEventImplToEventInput(event));
}

interface IEventContext {
    currentEvents: EventInput[];
    setCurrentEvents: (currentEvents: EventInput[]) => void;
    setAddCurrentEvent: (currentEvent: EventInput) => void;
    setRemoveCurrentEvent: (currentEvent: EventInput) => void;
}

const EventContext = createContext<IEventContext>({
    currentEvents: [],
    setCurrentEvents: (currentEvents: EventInput[]) => { },
    setAddCurrentEvent: (currentEvent: EventInput) => { },
    setRemoveCurrentEvent: (currentEvent: EventInput) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const [currentEvents, setCurrentEvents] = useState<EventInput[]>([]);

    function setAddCurrentEvent(currentEvent: EventInput) {
        setCurrentEvents([...currentEvents, currentEvent]);
    }

    function setRemoveCurrentEvent(currentEvent: EventInput) {
        setCurrentEvents(currentEvents.filter((e) => e !== currentEvent));
    }

    return (
        <EventContext.Provider value={{ currentEvents, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };