import { EventInput } from '@fullcalendar/core';
import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { dayWeatherColor, nightWeatherColor, WeatherContext } from './WeatherContext';
import { DataSourceContext } from './DataSourceProvider';
import { DateInViewContext } from './DateInViewContext';
import { defaultEventColor, getColorFromColorId } from '../components/ColorSelector';
import { SettingsContext } from './SettingsContext';

interface IEventContext {
    events: EventInput[];
    areEventsLoaded: boolean;
    selectedEvents: EventInput[];
    areBGEventsEditable: boolean;
    isSyncOn: boolean;
    isCurrentlyLoading: boolean;
    setIsSyncOn: (isSyncOn: boolean) => void;
    addEvent: (event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, isAllDay?: boolean) => Promise<void>;
    removeEvent: (eventId: string) => Promise<void>;
    editEvent: (event: {
        title: string;
        start: DateTime;
        end: DateTime;
        colorId: number;
        extendedProps?: { description?: string }
    },
        eventId: string,
        isAllDay?: boolean
    ) => Promise<void>;
    loadEvents: (date?: DateTime) => Promise<void>;
    splitEvent: (event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, eventId: string, isAllDay?: boolean, percent?: number) => Promise<void>;
    switchWeek: (direction: 'prev' | 'next' | 'today', dontLoadEvents?: boolean) => void;
    setBGEventsEditable: (editable: boolean) => void;
    setSelectedEvents: (selectedEvents: EventInput[]) => void;
    setAddSelectedEvent: (selectedEvent: EventInput) => void;
    setRemoveSelectedEvent: (selectedEvent: EventInput) => void;
}

const EventContext = createContext<IEventContext>({
    selectedEvents: [],
    events: [],
    areEventsLoaded: false,
    areBGEventsEditable: false,
    isSyncOn: false,
    isCurrentlyLoading: true,
    loadEvents: async (date?: DateTime) => { },
    setIsSyncOn: (isSyncOn: boolean) => { },
    addEvent: async (event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, isAllDay?: boolean) => { return new Promise((resolve) => { resolve(undefined); }) },
    removeEvent: async (eventId: string) => { return new Promise((resolve) => { resolve(); }) },
    editEvent: async (event: {
        title: string;
        start: DateTime;
        end: DateTime;
        colorId: number;
        extendedProps?: { description?: string }
    },
        eventId: string,
        isAllDay?: boolean
    ) => { return new Promise((resolve) => { resolve(); }) },
    splitEvent: (event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, eventId: string, isAllDay?: boolean, percent?: number) => { return new Promise((resolve) => { resolve(); }) },
    switchWeek: (direction: 'prev' | 'next' | 'today', dontLoadEvents: boolean = false) => { },
    setBGEventsEditable: (editable: boolean) => { },
    setSelectedEvents: (selectedEvents: EventInput[]) => { },
    setAddSelectedEvent: (selectedEvent: EventInput) => { },
    setRemoveSelectedEvent: (selectedEvent: EventInput) => { },
});

function EventProvider(props: React.PropsWithChildren<{}>) {
    const { roundSplits, roundingValue, availablePhases } = useContext(SettingsContext);
    const { showWeather, dailyWeather } = useContext(WeatherContext);
    const { isLoggedIn, fetchEvents, saveEvent, deleteEvent, updateEvent } = useContext(DataSourceContext);
    const { dateInView, setDateInView } = useContext(DateInViewContext);
    const [selectedEvents, setSelectedEvents] = useState<EventInput[]>([]);
    const [areBGEventsEditable, enableBGEventsEditable] = useState<boolean>(false);
    const [isCurrentlyLoading, setIsCurrentlyLoading] = useState(false);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);
    const [isSyncOn, setIsSyncOn] = useState(false);

    useEffect(() => {
        if (isCurrentlyLoading || !isLoggedIn) return;
        setIsCurrentlyLoading(true);
        const modifiedEvents = events.map(event => {
            if (event.allDay) return event;

            let isBackgroundEvent = (availablePhases.filter((phase: string) => event.title?.startsWith(phase)).length > 0);

            if (areBGEventsEditable) {
                isBackgroundEvent = !isBackgroundEvent;
            }

            return {
                ...event,
                display: isBackgroundEvent ? 'background' : 'auto',
            };
        });
        setEvents(modifiedEvents);
        setIsCurrentlyLoading(false);
    }, [availablePhases]);

    useEffect(() => {
        if (areEventsLoaded || !isLoggedIn) return;
        loadEvents(dateInView);
    }, [isLoggedIn]);

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

    useEffect(() => {
        if (isLoggedIn && !isCurrentlyLoading && isSyncOn) {
            loadEvents(dateInView);
        }
    }, [isSyncOn]);

    useEffect(() => {
        if (showWeather) {
            enableBGEventsEditable(false);
            const newEvents: EventInput[] = [];

            for (let i = 0; i < dailyWeather.length; i++) {
                const dailyWeatherItem = dailyWeather[i];
                let currentDateTime = DateTime.now().plus({ days: i }).startOf('day');
                if (dailyWeatherItem.sunrise === null || dailyWeatherItem.sunset === null) { return }
                const sunrise = currentDateTime.set({ hour: dailyWeatherItem.sunrise.hour, minute: dailyWeatherItem.sunrise.minute });
                const sunset = currentDateTime.set({ hour: dailyWeatherItem.sunset.hour, minute: dailyWeatherItem.sunset.minute });

                for (let j = 0; j < dailyWeatherItem.hourlyWeather.length; j++) {
                    const hourlyWeatherItem = dailyWeatherItem.hourlyWeather[j];
                    let isAtNight = currentDateTime.diff(sunrise).as('hours') <= 0 || currentDateTime.diff(sunset).as('hours') >= 0;

                    let title = `${Math.round(hourlyWeatherItem.temperature)}°C ${hourlyWeatherItem.condition}`;
                    if (title.includes('nearby')) {
                        title = title.replace('nearby', '');
                    }

                    const newEvent = {
                        title: `${title}`,
                        start: currentDateTime.toISO(),
                        end: currentDateTime.plus({ minutes: 30 }).toISO(),
                        allDay: false,
                        description: hourlyWeatherItem.condition,
                        extendedProps: {
                            description: hourlyWeatherItem.condition,
                        },
                        display: 'background',
                        backgroundColor: isAtNight ? nightWeatherColor : dayWeatherColor,
                        borderColor: isAtNight ? nightWeatherColor : dayWeatherColor,
                    }
                    currentDateTime = currentDateTime.plus({ minutes: 30 });

                    newEvents.push(newEvent);

                    isAtNight = currentDateTime.diff(sunrise).as('hours') <= 0 || currentDateTime.diff(sunset).as('hours') >= 0;

                    newEvents.push({
                        ...newEvent,
                        title: ``,
                        start: currentDateTime.toISO(),
                        end: currentDateTime.plus({ minutes: 30 }).toISO(),
                        backgroundColor: isAtNight ? nightWeatherColor : dayWeatherColor,
                        borderColor: isAtNight ? nightWeatherColor : dayWeatherColor,
                    });
                    currentDateTime = currentDateTime.plus({ minutes: 30 });
                }
            }
            setEvents(newEvents);
        }
    }, [showWeather]);

    async function loadEvents(date?: DateTime): Promise<void> {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);
        const events = await fetchEvents(date);
        setEvents(events);
        setAreEventsLoaded(true);
        setIsCurrentlyLoading(false);
    }

    async function addEvent(event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, isAllDay?: boolean) {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);

        const e = await saveEvent(event, isAllDay);
        if (e === undefined) { return }

        e.display = e.display === 'background' && !areBGEventsEditable ? 'background' : 'auto';
        setEvents([...events, e]);
        setIsCurrentlyLoading(false);
    }

    async function removeEvent(eventId: string) {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);
        await deleteEvent(eventId).then((res: any) => {
            if (res === false) { return }
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
            extendedProps?: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);

        const start = event.start.toISO();
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');

        await updateEvent(event, eventId, isAllDay).then((res: any) => {
            if (res === false) { return }
            setEvents([...events.map((e: any) => {
                if (e.id === eventId) {
                    const color: string = getColorFromColorId(event.colorId as number) || defaultEventColor;
                    const title: string = event.title || 'No Title';
                    const isBackgroundEvent = (availablePhases.filter((phase: string) => title.startsWith(phase)).length > 0);
                    return {
                        ...e,
                        title: event.title,
                        description: event.extendedProps?.description,
                        extendedProps: event.extendedProps?.description,
                        display: isBackgroundEvent && !areBGEventsEditable ? 'background' : 'auto',
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

    function setBGEventsEditable(editable: boolean) {
        if (showWeather) return;
        const newEvents = (events as Array<EventInput>).map(event => {
            let isBackgroundEvent = event.display !== 'background' && !event.allDay;
            return {
                ...event,
                display: isBackgroundEvent ? 'background' : 'auto',
            };
        });
        setEvents(newEvents);
        enableBGEventsEditable(editable);
    }

    function setAddSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents([...selectedEvents, selectedEvent]);
    }

    function setRemoveSelectedEvent(selectedEvent: EventInput) {
        setSelectedEvents(selectedEvents.filter((e) => e !== selectedEvent));
    }

    function switchWeek(direction: 'prev' | 'next' | 'today', dontLoadEvents: boolean = false) {
        if (isCurrentlyLoading) return;
        const newWeek = direction === 'today'
            ? DateTime.now()
            : dateInView.plus({ weeks: direction === 'prev' ? -1 : 1 });

        setDateInView(newWeek);

        if (!dontLoadEvents) {
            loadEvents(newWeek);
        }

        if (direction === 'today') {
            (document.getElementsByClassName('fc-today-button')[0] as HTMLButtonElement).click();
            return;
        }
        (document.getElementsByClassName(`fc-${direction}-button`)[0] as HTMLButtonElement).click();
    }

    async function splitEvent(event: {
        title: string;
        start: DateTime;
        end: DateTime;
        colorId: number;
        extendedProps?: { description?: string }
    },
        eventId: string,
        isAllDay?: boolean,
        percent?: number
    ) {
        if (!isLoggedIn || isCurrentlyLoading) { return }
        setIsCurrentlyLoading(true);
        deleteEvent(eventId);
        if (percent === undefined) { percent = 50 }

        const start = event.start;

        const end = event.end;

        const durationInMinutes = event.end.diff(event.start).as('minutes');
        const firstHalfEndInMinutes = percent * durationInMinutes / 100;
        const secondHalfStartInMinutes = (100 - percent) * durationInMinutes / 100;

        const firstHalfEndRounded = roundingValue * Math.floor((firstHalfEndInMinutes / roundingValue) - 0.5);

        const secondHalfStartRounded = roundingValue * Math.floor((secondHalfStartInMinutes / roundingValue) - 0.5);

        const firstHalfEnd = start.plus({ minutes: roundSplits ? firstHalfEndRounded : firstHalfEndInMinutes });
        const secondHalfStart = start.plus({ minutes: roundSplits ? secondHalfStartRounded : secondHalfStartInMinutes });

        const firstEvent = await saveEvent({
            ...event,
            start: start,
            end: firstHalfEnd,
        }, isAllDay);

        if (firstEvent === undefined) { return }

        const secondEvent = await saveEvent({
            ...event,
            start: secondHalfStart,
            end: end,
        }, isAllDay);

        if (secondEvent === undefined) { return }

        setEvents([...events.filter(e => e.id !== eventId), firstEvent, secondEvent]);
        setIsCurrentlyLoading(false);
    }

    return (
        <EventContext.Provider value={{
            events, areEventsLoaded, isSyncOn, isCurrentlyLoading, loadEvents, setIsSyncOn, switchWeek, addEvent, removeEvent, editEvent, splitEvent, selectedEvents, areBGEventsEditable, setBGEventsEditable, setSelectedEvents, setAddSelectedEvent, setRemoveSelectedEvent
        }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };