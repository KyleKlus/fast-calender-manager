import { EventInput } from "@fullcalendar/core";
import { DateTime } from "luxon";

export default interface IDataSource {
    init(): Promise<void>;
    login: () => Promise<boolean>;
    isInitialized: () => boolean;
    loadEvents: (date: DateTime, setIsAuthValid: (isAuthValid: boolean
    ) => void, availablePhases: string[]) => Promise<EventInput[]>;
    addEvent: (
        event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, setIsAuthValid: (isAuthValid: boolean) => void,
        availablePhases: string[],
        isAllDay?: boolean
    ) => Promise<EventInput | undefined>;
    deleteEvent: (eventId: string, setIsAuthValid: (isAuthValid: boolean) => void) => Promise<boolean>;
    editEvent: (
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps?: { description?: string }
        },
        eventId: string,
        setIsAuthValid: (isAuthValid: boolean) => void,
        isAllDay?: boolean
    ) => Promise<boolean>;
}