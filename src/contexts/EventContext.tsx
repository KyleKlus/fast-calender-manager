import { EventInput } from '@fullcalendar/core';
import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { DateInViewContext } from './DateInViewContext';
import { dayWeatherColor, IDailyWeather, nightWeatherColor, WeatherContext } from './WeatherContext';

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

function EventProvider(props: React.PropsWithChildren<{}>) {
    const { showWeather, dailyWeather } = useContext(WeatherContext);
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

    return (
        <EventContext.Provider value={{ events, areEventsLoaded, setEvents, setAreEventsLoaded, selectedEvents, areBGEventsEditable, setBGEventsEditable, setSelectedEvents, setAddSelectedEvent, setRemoveSelectedEvent }}>
            {props.children}
        </EventContext.Provider>
    );
};

export { EventContext, EventProvider };