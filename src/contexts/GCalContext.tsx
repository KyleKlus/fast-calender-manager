import { createContext, useEffect, useState } from 'react';
import GCal from '../handlers/gcal';
import { DateTime } from 'luxon';
import React from 'react';
import { EventInput, EventSourceInput } from '@fullcalendar/core';

let config: {
    clientId: string;
    apiKey: string;
    scope: string;
    discoveryDocs: string[];
} | undefined = undefined;

export const colorMap = [
    '#b74f4f',
    '#7986cbff',
    '#33b679',
    '#8e24aaff',
    '#e67c73ff',
    '#f6bf26ff',
    '#f4511eff',
    '#039be5',
    '#616161',
    '#3f51b5',
    '#0b8043',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
];

export const defaultColor: string = colorMap[0];

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

interface IGCalContext {
    isLoggedIn: boolean;
    areEventsLoaded: boolean;
    isTryingToAutoLogin: boolean;
    isCurrentlyLoading: boolean;
    gcal: GCal | undefined;
    events: EventSourceInput;
    isSyncOn: boolean;
    date: DateTime;
    setDate: (date: DateTime) => void;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    setIsSyncOn: (isSyncOn: boolean) => void;
    loadEvents: (date?: DateTime) => Promise<void>;
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

const GCalContext = createContext<IGCalContext>({
    isLoggedIn: false,
    areEventsLoaded: false,
    isTryingToAutoLogin: true,
    isCurrentlyLoading: false,
    isSyncOn: false,
    gcal,
    events: [],
    date: DateTime.now(),
    setDate: (date: DateTime) => { },
    setIsSyncOn: (isSyncOn: boolean) => { },
    setIsLoggedIn: (isLoggedIn: boolean) => { },
    loadEvents: async (date: DateTime = DateTime.now()) => { },
    addEvent: async (
        event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description: string } },
        isAllDay?: boolean) => { },
    deleteEvent: async (eventId: string) => { },
    editEvent: async (
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) => { }
});

function GCalProvider(props: React.PropsWithChildren<{}>) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);
    const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);
    const [isSyncOn, setIsSyncOn] = useState(false);
    const [date, setDate] = useState(DateTime.now());
    const [autoLoginAttempts, setAutoLoginAttempts] = useState(1);

    async function login(): Promise<void> {
        if (gcal === undefined) { return }
        await gcal.handleAuthClick().then((res) => {
            setIsLoggedIn(true);
            setIsTryingToAutoLogin(false);
        });
    }

    useEffect(() => {
        if (isTryingToAutoLogin) {
            setTimeout(() => {
                login();
            }, 1000);
        }
    });

    useEffect(() => {
        if (isLoggedIn && !isCurrentlyLoading && isSyncOn) {
            loadEvents(date);
        }
    }, [isSyncOn]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isLoggedIn && !isCurrentlyLoading && isSyncOn) {
                clearInterval(interval);
                loadEvents(date);
            }
        }, 20000);
        return () => {
            clearInterval(interval);
        }
    });

    async function loadEvents(date: DateTime = DateTime.now()): Promise<void> {
        if (!isLoggedIn || isCurrentlyLoading || gcal === undefined) { return }
        setIsCurrentlyLoading(true);

        let events: EventInput[] = (await gcal.listEvents({
            calendarId: 'primary',
            timeMin: date.startOf('week').minus({ weeks: 1 }).toISO(),
            timeMax: date.endOf('week').plus({ weeks: 1 }).toISO(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
        })).result.items.map((e: any) => {
            setIsCurrentlyLoading(false);
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
                backgroundColor: colorMap[e.colorId as number] || colorMap[0] as string,
                borderColor: colorMap[e.colorId as number] || colorMap[0] as string,
            }
        });

        // const tasks = (await gcal.listTasks({
        //     tasklist: '@default',
        //     showCompleted: false,
        //     showDeleted: false,
        //     showDue: true,
        // })).result.items.filter((e: any) => e.due !== undefined).map((e: any) => {
        //     console.log(e);
        //     return {
        //         id: e.id,
        //         title: e.title,
        //         start: e.due, // try timed. will fall back to all-day
        //         end: e.due, // same
        //         isAllDay: true,
        //         url: e.webViewLink,
        //         description: e.description,
        //         backgroundColor: colorMap[7] as string,
        //         borderColor: colorMap[7] as string,
        //         extendedProps: {
        //             taskStatus: e.status,
        //         },
        //     }
        // });
        // events = events.concat(tasks);

        setEvents(events);
        setAreEventsLoaded(true);
    }

    async function addEvent(event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description: string } }, isAllDay?: boolean) {
        if (!isLoggedIn || isCurrentlyLoading || gcal === undefined) { return }

        setIsCurrentlyLoading(true);

        const start = event.start.toISO();
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const startZone = event.start.zoneName;
        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');
        const endZone = event.end.zoneName;

        await gcal.createEvent({
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
        }).then((res: any) => {
            const e = res.result;
            setEvents([...events, {
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
                backgroundColor: colorMap[e.colorId as number] || colorMap[0] as string,
                borderColor: colorMap[e.colorId as number] || colorMap[0] as string,
            }]);
            setIsCurrentlyLoading(false);
        });
    }

    async function deleteEvent(eventId: string) {
        if (!isLoggedIn || isCurrentlyLoading || gcal === undefined) { return }

        setIsCurrentlyLoading(true);

        gcal.deleteEvent(eventId).then((res: any) => {
            setEvents([...events.filter((e) => e.id !== eventId)]);
            setIsCurrentlyLoading(false);
        });
    }

    async function editEvent(
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) {
        if (!isLoggedIn || isCurrentlyLoading || gcal === undefined) { return }

        setIsCurrentlyLoading(true);

        const start = event.start.toISO();
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const startZone = event.start.zoneName;
        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');
        const endZone = event.end.zoneName;

        gcal.updateEvent({
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
        }, eventId).then((res: any) => {
            setEvents([...events.map((e: any) => {
                if (e.id === eventId) {
                    return {
                        ...e,
                        title: event.title,
                        extendedProps: {
                            description: event.extendedProps?.description,
                        },
                        backgroundColor: colorMap[event.colorId as number] || colorMap[0] as string,
                        borderColor: colorMap[event.colorId as number] || colorMap[0] as string,
                        start: isAllDay ? startDate : start, // try timed. will fall back to all-day
                        end: isAllDay ? endDate : end, // same
                        allDay: isAllDay,
                    };
                }
                return e;
            })]);
            setIsCurrentlyLoading(false);
        });
    }

    return (
        <GCalContext.Provider value={{ isLoggedIn, date, setDate, isSyncOn, setIsSyncOn, areEventsLoaded, isTryingToAutoLogin, isCurrentlyLoading, gcal, events, loadEvents, addEvent, editEvent, deleteEvent, setIsLoggedIn }}>
            {props.children}
        </GCalContext.Provider>
    );
};

export { GCalContext, GCalProvider };
