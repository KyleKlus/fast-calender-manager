import { createContext, useContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { DateInViewContext } from './DateInViewContext';

interface IWeatherContext {
    sunrise: DateTime | null;
    sunset: DateTime | null;
    showWeather: boolean;
    dailyWeather: IDailyWeather[];
    setShowWeather: (showWeather: boolean) => void;
    hourlyWeather: IHourlyWeather[];
    isLoadingWeather: boolean;
    reloadWeather: () => void;
    insertWeather: () => void;
}

export interface IHourlyWeather {
    conditionIcon: string;
    condition: string;
    temperature: number;
}

export interface IDailyWeather {
    hourlyWeather: IHourlyWeather[];
    sunrise: DateTime | null;
    sunset: DateTime | null;
}

const WeatherContext = createContext<IWeatherContext>({
    sunrise: null,
    sunset: null,
    hourlyWeather: [],
    isLoadingWeather: false,
    showWeather: false,
    dailyWeather: [],
    setShowWeather: (showWeather: boolean) => { },
    reloadWeather: () => { },
    insertWeather: () => { },
});

export const nightWeatherColor = '#dce4fe';
export const dayWeatherColor = '#fef7dc';

function WeatherProvider(props: React.PropsWithChildren<{}>) {
    const [showWeather, setShowWeather] = useState(false);
    const [sunrise, setSunrise] = useState<DateTime | null>(null);
    const [sunset, setSunset] = useState<DateTime | null>(null);
    const [hourlyWeather, setHourlyWeather] = useState<IHourlyWeather[]>([]);
    const [dailyWeather, setDailyWeather] = useState<IDailyWeather[]>([]);
    const [reload, setReload] = useState(true);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!reload || isLoadingWeather) { return }
        fetchWeather();
    }, [reload]);

    useEffect(() => {
        if (isLoadingWeather) { return }
        intervalRef.current = setInterval(() => {
            fetchWeather();
        }, 1000 * 60 * 10);

        return () => {
            if (intervalRef.current === null) { return }
            clearInterval(intervalRef.current);
        }
    });

    function reloadWeather() {
        setReload(true);
    }

    function fetchWeather() {
        setIsLoadingWeather(true);
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=f26c7c1bc9fc4e7bb20184029251908&q=52.3,9.7&days=14&aqi=no&alerts=no`)
            .then(async (response) => {
                if (!response.ok) {
                    setIsLoadingWeather(false);
                    setReload(false);
                    return;
                }

                const data = await response.json();
                const dailyWeather: IDailyWeather[] = data.forecast.forecastday.map((d: any) => {
                    return {
                        hourlyWeather: d.hour.map((h: any) => {
                            return {
                                conditionIcon: h.condition.icon,
                                condition: h.condition.text,
                                temperature: h.temp_c,
                            }
                        }),
                        sunrise: DateTime.fromFormat(d.astro.sunrise, 'hh:mm a'),
                        sunset: DateTime.fromFormat(d.astro.sunset, 'hh:mm a'),
                    }
                });

                setHourlyWeather(dailyWeather[0].hourlyWeather);
                setSunrise(dailyWeather[0].sunrise);
                setSunset(dailyWeather[0].sunset);
                setDailyWeather(dailyWeather);

                setIsLoadingWeather(false);
                setReload(false);
            });
    }

    function insertWeather() {
        const timeslotLanes = document.getElementsByClassName('fc-timegrid-slot-lane')
        const timeslots = document.getElementsByClassName('fc-timegrid-slot-label')
        let timeIndex = -1;

        for (let i = 0; i < timeslots.length; i++) {
            const timeSlot = timeslots[i] as HTMLElement;
            const timeSlotLane = timeslotLanes[i] as HTMLElement;
            const isMinorSlot = timeSlot.className.includes('slot-minor');

            const dataTime = timeSlot.getAttribute('data-time') as string;
            const time = DateTime.fromFormat(dataTime, 'HH:mm:ss');

            const isAtNight = sunrise !== null && sunset !== null && (time.diff(sunrise).as('hours') <= 0 || time.diff(sunset).as('hours') >= 0);

            if (isAtNight) {
                timeSlotLane.className = `${timeSlotLane.className} night`;
                timeSlot.className = `${timeSlot.className} night`;
            }

            if (isMinorSlot) {
                timeSlot.innerHTML = `${hourlyWeather[timeIndex].condition.length > 7 ? hourlyWeather[timeIndex].condition.substring(0, 4) + '...' : hourlyWeather[timeIndex].condition} ${Math.round(hourlyWeather[timeIndex].temperature)}°`;
            } else {
                // timeSlot.innerText = timeSlot.innerText.replace(' Uhr', '');
                timeIndex += 1;
            }
        }
    }

    return (
        <WeatherContext.Provider value={{ sunrise, sunset, hourlyWeather, isLoadingWeather, dailyWeather, reloadWeather, showWeather, setShowWeather, insertWeather }}>
            {props.children}
        </WeatherContext.Provider>
    );
};

export { WeatherContext, WeatherProvider };