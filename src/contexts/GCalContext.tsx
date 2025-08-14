import { createContext, useContext, useEffect, useState } from 'react';
import GCal from '../handlers/gcal';
import { DateTime } from 'luxon';
import React from 'react';
import { EventInput } from '@fullcalendar/core';
import { defaultColorId, defaultEventColor, getColorFromColorId } from '../components/ColorSelector';
import { EventContext } from './EventContext';

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

export const phases: string[] = ['Arbeitszeit', 'Unizeit', 'Freizeit'];

interface IGCalContext {
    isLoggedIn: boolean;
    isTryingToAutoLogin: boolean;
    isCurrentlyLoading: boolean;
    gcal: GCal | undefined;
    isSyncOn: boolean;
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
    isTryingToAutoLogin: true,
    isCurrentlyLoading: false,
    isSyncOn: false,
    gcal,
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
    const { events, setEvents, setAreEventsLoaded, date, areBGEventsEditable } = useContext(EventContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);
    const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);
    const [isSyncOn, setIsSyncOn] = useState(false);

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
        })).result.items.filter((e: any) => e.due !== undefined).map((e: any) => {
            return {
                id: e.id,
                title: e.title,
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
            const color: string = getColorFromColorId(e.colorId as number) || defaultEventColor;
            const title: string = e.summary || 'No Title';
            const isBackgroundEvent = (phases.filter((phase: string) => title.startsWith(phase)).length > 0) && !areBGEventsEditable;
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
                display: isBackgroundEvent ? 'background' : 'auto',
                backgroundColor: color,
                borderColor: color,
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
            colorId: (event.colorId === -1 || event.colorId === undefined ? defaultColorId : event.colorId).toString(),
        }, eventId).then((res: any) => {
            setEvents([...events.map((e: any) => {
                if (e.id === eventId) {
                    const color: string = getColorFromColorId(event.colorId as number) || defaultEventColor;
                    const title: string = event.title || 'No Title';
                    const isBackgroundEvent = (phases.filter((phase: string) => title.startsWith(phase)).length > 0) && !areBGEventsEditable;
                    return {
                        ...e,
                        title: event.title,
                        extendedProps: {
                            description: event.extendedProps?.description,
                        },
                        display: isBackgroundEvent ? 'background' : 'auto',
                        backgroundColor: color,
                        borderColor: color,
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
        <GCalContext.Provider value={{ isLoggedIn, isSyncOn, setIsSyncOn, isTryingToAutoLogin, isCurrentlyLoading, gcal, loadEvents, addEvent, editEvent, deleteEvent, setIsLoggedIn }}>
            {props.children}
        </GCalContext.Provider>
    );
};

export { GCalContext, GCalProvider };
