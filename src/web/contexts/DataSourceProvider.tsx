import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import IDataSource from '../handlers/IDataSource';
import { DateInViewContext } from './DateInViewContext';
import { EventContext, phases } from './EventContext';
import GoogleDataSource from '../handlers/GoogleDataSource';
import { DateTime } from 'luxon';
import { defaultColorId, defaultEventColor, getColorFromColorId } from '../components/ColorSelector';

export interface IDataSourceProviderProps {
    externalDataSource?: IDataSource;
}

interface IDataSourceContext {
    isLoggedIn: boolean;
    isTryingToAutoLogin: boolean;
    isCurrentlyLoading: boolean;
    isSyncOn: boolean;
    isAuthLoading: boolean;
    login: () => Promise<void>;
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

const DataSourceContext = createContext<IDataSourceContext>({
    isLoggedIn: false,
    isTryingToAutoLogin: true,
    isCurrentlyLoading: false,
    isSyncOn: false,
    isAuthLoading: true,
    setIsSyncOn: (isSyncOn: boolean) => { },
    setIsLoggedIn: (isLoggedIn: boolean) => { },
    loadEvents: async (date: DateTime = DateTime.now()) => { },
    login: async () => { },
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
    ) => { },
});

function DataSourceProvider(props: React.PropsWithChildren<IDataSourceProviderProps>) {
    const dataSource = props.externalDataSource ? props.externalDataSource : new GoogleDataSource();

    const { events, setEvents, setAreEventsLoaded, areBGEventsEditable } = useContext(EventContext);
    const { dateInView, setDateInView } = useContext(DateInViewContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);
    const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);
    const [isSyncOn, setIsSyncOn] = useState(false);

    useEffect(() => {
        if (isTryingToAutoLogin) {
            setTimeout(() => {
                login();
            }, 1000);
        }
    });

    useEffect(() => {
        if (isLoggedIn && !isCurrentlyLoading && isSyncOn) {
            loadEvents(dateInView);
        }
    }, [isSyncOn]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isLoggedIn && !isCurrentlyLoading && isSyncOn) {
                clearInterval(interval);
                loadEvents(dateInView);
            }
        }, 20000);
        return () => {
            clearInterval(interval);
        }
    });

    async function login(): Promise<void> {
        const result = await dataSource.login();
        if (result) {
            setIsLoggedIn(true);
            setIsAuthLoading(false);
            setIsTryingToAutoLogin(false);
        }
    }

    async function loadEvents(date?: DateTime): Promise<void> {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);
        const events = await dataSource.loadEvents(date ?? DateTime.now(), (isAuthValid: boolean) => {
            setIsAuthValid(isAuthValid);
        });
        setIsCurrentlyLoading(false);
        setEvents(events);
        setAreEventsLoaded(true);
    }

    function setIsAuthValid(isAuthValid: boolean) {
        setIsAuthLoading(!isAuthValid);
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
        }, setIsAuthValid).then((res: any) => {
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

        gcal.deleteEvent(eventId, setIsAuthValid).then((res: any) => {
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
        }, eventId, setIsAuthValid).then((res: any) => {
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
        <DataSourceContext.Provider value={{ login, loadEvents, addEvent, deleteEvent, editEvent, isLoggedIn, isTryingToAutoLogin, isCurrentlyLoading, isSyncOn, isAuthLoading }}>
            {props.children}
        </DataSourceContext.Provider>
    );
};

export { DataSourceContext, DataSourceProvider };