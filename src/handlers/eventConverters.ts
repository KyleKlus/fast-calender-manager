import { EventInput } from "@fullcalendar/core";
import { colorMap, defaultColorId } from "../components/ColorSelector";
import { EventImpl } from "@fullcalendar/core/internal";

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