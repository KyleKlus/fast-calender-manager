import { DateTime } from "luxon";
import IDataSource from "./IDataSource";
import GCal from "./gcalHandler";
import { EventInput } from "@fullcalendar/core";
import { defaultEventColor, getColorFromColorId } from "../components/ColorSelector";

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

    addEvent(event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description: string } }, isAllDay?: boolean): Promise<void> {
        return Promise.resolve();
    }

    deleteEvent(eventId: string): Promise<void> {
        return Promise.resolve();
    }

    editEvent(event: {
        title: string;
        start: DateTime;
        end: DateTime;
        colorId: number;
        extendedProps: { description?: string }
    },
        eventId: string,
        isAllDay?: boolean
    ): Promise<void> {
        return Promise.resolve();
    }
}