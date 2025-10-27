import { EventInput } from '@fullcalendar/core';
import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { dayWeatherColor, nightWeatherColor, WeatherContext } from './WeatherContext';
import { DataSourceContext } from './DataSourceProvider';
import { DateInViewContext } from './DateInViewContext';

export const phases: string[] = ['Arbeitszeit', 'Unizeit', 'Freizeit'];

interface IEventContext {
    events: EventInput[];
    areEventsLoaded: boolean;
    selectedEvents: EventInput[];
    areBGEventsEditable: boolean;
    setEvents: (events: EventInput[]) => void;
    setAreEventsLoaded: (areEventsLoaded: boolean) => void;
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
    setEvents: (events: EventInput[]) => { },
    setAreEventsLoaded: (areEventsLoaded: boolean) => { },
    setBGEventsEditable: (editable: boolean) => { },
    setSelectedEvents: (selectedEvents: EventInput[]) => { },
    setAddSelectedEvent: (selectedEvent: EventInput) => { },
    setRemoveSelectedEvent: (selectedEvent: EventInput) => { },
});

function EventProvider(props: React.PropsWithChildren<{ externalEventHandler?: IEventContext }>) {
    const { showWeather, dailyWeather } = useContext(WeatherContext);
    const { isCurrentlyLoading, setIsCurrentlyLoading, loadEvents, addEvent, deleteEvent, editEvent } = useContext(DataSourceContext);
    const { dateInView, setDateInView } = useContext(DateInViewContext);
    const [selectedEvents, setSelectedEvents] = useState<EventInput[]>([]);
    const [areBGEventsEditable, setBGEventsEditable] = useState<boolean>(false);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);


    useEffect(() => {
        if (showWeather) {
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
        extendedProps: { description?: string }
    },
        eventId: string,
        isAllDay?: boolean,
        percent: number = 50
    ) {
        if (!isLoggedIn || isCurrentlyLoading || gcal === undefined) { return }
        setIsCurrentlyLoading(true);
        deleteEvent(eventId);

        const start = event.start.toISO() as string;
        const startDate = event.start.toFormat('yyyy-MM-dd');
        const startZone = event.start.zoneName;

        const end = event.end.toISO();
        const endDate = event.end.toFormat('yyyy-MM-dd');
        const endZone = event.end.zoneName;

        const durationInMinutes = event.end.diff(event.start).as('minutes');

        const firstHalfEnd = DateTime.fromISO(start).plus({ minutes: percent * durationInMinutes / 100 });
        const firstHalfEndIso = firstHalfEnd.toISO();
        const firstHalfEndDate = firstHalfEnd.toFormat('yyyy-MM-dd');
        const secondHalfStart = DateTime.fromISO(start).plus({ minutes: (100 - percent) * durationInMinutes / 100 });
        const secondHalfStartIso = secondHalfStart.toISO();
        const secondHalfStartDate = secondHalfStart.toFormat('yyyy-MM-dd');

        const firstEvent = await gcal.createEvent({
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
                ? { date: firstHalfEndDate }
                : {
                    dateTime: firstHalfEndIso === null ? undefined : firstHalfEndIso,
                    timeZone: endZone === null ? DateTime.now().zoneName : endZone,
                },
            colorId: (event.colorId === -1 || event.colorId === undefined ? defaultColorId : event.colorId).toString(),
        }, setIsAuthValid).then((res: any) => {
            const e = res.result;
            const color: string = getColorFromColorId(e.colorId as number) || defaultEventColor;
            const title: string = e.summary || 'No Title';
            const isBackgroundEvent = (phases.filter((phase: string) => title.startsWith(phase)).length > 0) && !areBGEventsEditable;
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

        const secondEvent = await gcal.createEvent({
            summary: event.title,
            description: event.extendedProps?.description,
            start: isAllDay
                ? {
                    date: secondHalfStartDate,
                }
                : {
                    dateTime: secondHalfStartIso === null ? undefined : secondHalfStartIso,
                    timeZone: startZone === null ? DateTime.now().zoneName : startZone,
                },
            end: isAllDay
                ? { date: endDate }
                : {
                    dateTime: end === null ? undefined : end,
                    timeZone: endZone === null ? DateTime.now().zoneName : endZone,
                },
            colorId: (event.colorId === -1 || event.colorId === undefined ? defaultColorId : event.colorId).toString(),
        }, setIsAuthValid).then((res: any) => {
            const e = res.result;
            const color: string = getColorFromColorId(e.colorId as number) || defaultEventColor;
            const title: string = e.summary || 'No Title';
            const isBackgroundEvent = (phases.filter((phase: string) => title.startsWith(phase)).length > 0) && !areBGEventsEditable;
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

        setEvents([...events.filter(e => e.id !== eventId), firstEvent, secondEvent]);

        setIsCurrentlyLoading(false);
    }


    return (
        <EventContext.Provider value={
            showWeather || !props.externalEventHandler
                ? { events, areEventsLoaded, setEvents, setAreEventsLoaded, selectedEvents, areBGEventsEditable, setBGEventsEditable, setSelectedEvents, setAddSelectedEvent, setRemoveSelectedEvent }
                : props.externalEventHandler
        }>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };