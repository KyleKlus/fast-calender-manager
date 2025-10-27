import { EventInput } from "@fullcalendar/core";
import { DateTime } from "luxon";

export default interface IDataSource {
    init(): Promise<void>;
    login: () => Promise<boolean>;
    loadEvents: (date: DateTime, setIsAuthValid: (isAuthValid: boolean) => void) => Promise<EventInput[]>;
    addEvent: (
        event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description: string } },
        isAllDay?: boolean) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    editEvent: (
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) => Promise<void>;
}