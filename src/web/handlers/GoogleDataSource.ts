import { DateTime } from "luxon";
import IDataSource from "./IDataSource";
import GCal from "./gcalHandler";
import { EventInput } from "@fullcalendar/core";
import { defaultColorId, defaultEventColor, getColorFromColorId } from "../components/ColorSelector";
import { phases } from "../contexts/EventContext";

let config: {
    clientId: string;
    apiKey: string;
    scope: string;
    discoveryDocs: string[];
} | undefined = undefined;

let gcal: GCal | undefined = undefined;

async function initGCal(): Promise<void> {
    await fetch('env.json')
        .then((res) => {
            return res.json()
        })
        .then((env) => {
            env.CLIENT_ID = env.CLIENT_ID || '';
            env.API_KEY = env.API_KEY || '';
            config = {
                clientId: env.CLIENT_ID,
                apiKey: env.API_KEY,
                scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks",
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
                ],
            };
            gcal = new GCal(config);
        });
}

initGCal();

export default class GoogleDataSource implements IDataSource {
    init(): Promise<void> {
        return initGCal();
    }

    isInitialized(): boolean {
        return gcal !== undefined;
    }

    async login(): Promise<boolean> {
        if (gcal === undefined) { return false; }
        return await gcal.handleAuthClick().then((res) => {
            localStorage.setItem("u_token", JSON.stringify(gapi.client.getToken()));
            return true;
        });
    }

    async loadEvents(date: DateTime, setIsAuthValid: (isAuthValid: boolean) => void): Promise<EventInput[]> {
        if (gcal === undefined) { return new Promise((resolve, reject) => { return reject([]) }); }

        let events: EventInput[] = (await gcal.listEvents({
            calendarId: 'primary',
            timeMin: date.startOf('week').minus({ weeks: 1 }).toISO(),
            timeMax: date.endOf('week').plus({ weeks: 1 }).toISO(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
        }, setIsAuthValid)).result.items.map((e: any) => {
            const color: string = getColorFromColorId(e.colorId as number) || defaultEventColor;
            const title: string = e.summary || 'No Title';
            const isBackgroundEvent = title.startsWith('Arbeitszeit') || title.startsWith('Unizeit') || title.startsWith('Freizeit') || title.startsWith('Urlaub');

            return {
                id: e.id,
                title: e.summary,
                start: e.start.dateTime || e.start.date, // try timed. will fall back to all-day
                end: e.end.dateTime || e.end.date, // same
                allDay: e.start.date !== undefined,
                // url: e.htmlLink,
                location: e.location,
                description: e.description,
                attachments: e.attachments || [],
                extendedProps: {
                    description: e.description,
                },
                display: isBackgroundEvent ? 'background' : 'auto',
                backgroundColor: color,
                borderColor: color,
            }
        });

        const tasks = (await gcal.listTasks({
            tasklist: '@default',
            showCompleted: false,
            showDeleted: false,
            showDue: true,
        }, setIsAuthValid)).result.items.filter((e: any) => e.due !== undefined).map((e: any) => {
            return {
                id: e.id,
                title: '[ ]: ' + e.title,
                start: DateTime.fromISO(e.due ? e.due : DateTime.now().toISO()).toFormat('yyyy-MM-dd'),
                end: DateTime.fromISO(e.due ? e.due : DateTime.now().toISO()).toFormat('yyyy-MM-dd'), // same
                allDay: true,
                url: e.webViewLink,
                description: e.description,
                backgroundColor: '#1c70e6ff',
                borderColor: '#1c70e6ff',
                extendedProps: {
                    taskStatus: e.status,
                    isTask: true,
                },
            }
        });
        events = events.concat(tasks);

        return events;
    }

    async addEvent(event: {
        title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: {
            description?: string
        }
    }, setIsAuthValid: (isAuthValid: boolean) => void, isAllDay?: boolean): Promise<EventInput | undefined> {
        if (gcal === undefined) { return new Promise((resolve, reject) => { return reject(undefined) }); }

        const start = event.start.toISO();
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const startZone = event.start.zoneName;
        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');
        const endZone = event.end.zoneName;

        return await gcal.createEvent({
            summary: event.title,
            description: event.extendedProps?.description,
            start: isAllDay
                ? {
                    date: startDate,
                }
                : {
                    dateTime: start === null ? undefined : start,
                    timeZone: startZone === null ? DateTime.now().zoneName : startZone,
                },
            end: isAllDay
                ? { date: endDate }
                : {
                    dateTime: end === null ? undefined : end,
                    timeZone: endZone === null ? DateTime.now().zoneName : endZone,
                },
            colorId: (event.colorId === -1 || event.colorId === undefined ? 0 : event.colorId).toString(),
        }, setIsAuthValid).then((res: any) => {
            const e = res.result;
            const color: string = getColorFromColorId(e.colorId as number) || defaultEventColor;
            const title: string = e.summary || 'No Title';
            const isBackgroundEvent = (phases.filter((phase: string) => title.startsWith(phase)).length > 0);
            return {
                id: e.id,
                title: e.summary,
                start: e.start.dateTime || e.start.date, // try timed. will fall back to all-day
                end: e.end.dateTime || e.end.date, // same
                allDay: e.start.date !== undefined,
                // url: e.htmlLink,
                location: e.location,
                description: e.description,
                attachments: e.attachments || [],
                extendedProps: {
                    description: e.description,
                },
                display: isBackgroundEvent ? 'background' : 'auto',
                backgroundColor: color,
                borderColor: color,
            };
        });
    }

    async deleteEvent(eventId: string, setIsAuthValid: (isAuthValid: boolean) => void): Promise<boolean> {
        if (gcal === undefined) { return new Promise((resolve, reject) => { return reject(false) }); }
        return await gcal.deleteEvent(eventId, setIsAuthValid).then((res: any) => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    async editEvent(event: {
        title: string;
        start: DateTime;
        end: DateTime;
        colorId: number;
        extendedProps?: { description?: string }
    },
        eventId: string, setIsAuthValid: (isAuthValid: boolean) => void,
        isAllDay?: boolean
    ): Promise<boolean> {
        if (gcal === undefined) { return new Promise((resolve, reject) => { return reject(false) }); }

        const start = event.start.toISO();
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const startZone = event.start.zoneName;
        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');
        const endZone = event.end.zoneName;

        return await gcal.updateEvent({
            summary: event.title,
            description: event.extendedProps?.description,
            start: isAllDay
                ? {
                    date: startDate,
                }
                : {
                    dateTime: start === null ? undefined : start,
                    timeZone: startZone === null ? DateTime.now().zoneName : startZone,
                },
            end: isAllDay
                ? { date: endDate }
                : {
                    dateTime: end === null ? undefined : end,
                    timeZone: endZone === null ? DateTime.now().zoneName : endZone,
                },
            colorId: (event.colorId === -1 || event.colorId === undefined ? defaultColorId : event.colorId).toString(),
        }, eventId, setIsAuthValid).then((res: any) => {
            return true;
        }).catch(() => {
            return false;
        });
    }
}