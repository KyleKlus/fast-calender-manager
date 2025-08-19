import { createContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';

interface IWeatherContext {
    sunrise: DateTime | null;
    sunset: DateTime | null;
    hourlyWeather: any[];
    isLoadingWeather: boolean;
    reloadWeather: () => void;
    insertWeather: () => void;
}

const WeatherContext = createContext<IWeatherContext>({
    sunrise: null,
    sunset: null,
    hourlyWeather: [],
    isLoadingWeather: false,
    reloadWeather: () => { },
    insertWeather: () => { },
});

function WeatherProvider(props: React.PropsWithChildren<{}>) {
    const [sunrise, setSunrise] = useState<DateTime | null>(null);
    const [sunset, setSunset] = useState<DateTime | null>(null);
    const [hourlyWeather, setHourlyWeather] = useState<{ conditionIcon: string, condition: string, temperature: number }[]>([]);
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
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=f26c7c1bc9fc4e7bb20184029251908&q=52.3,9.7&days=1&aqi=no&alerts=no`)
            .then(async (response) => {
                if (!response.ok) {
                    setIsLoadingWeather(false);
                    setReload(false);
                    return;
                }

                const data = await response.json();

                setHourlyWeather(data.forecast.forecastday[0].hour.map((h: any) => {
                    return {
                        conditionIcon: h.condition.icon,
                        condition: h.condition.text,
                        temperature: h.temp_c,
                    }
                }));
                setSunrise(DateTime.fromFormat(data.forecast.forecastday[0].astro.sunrise, 'hh:mm a'));
                setSunset(DateTime.fromFormat(data.forecast.forecastday[0].astro.sunset, 'hh:mm a'));

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
        <WeatherContext.Provider value={{ sunrise, sunset, hourlyWeather, isLoadingWeather, reloadWeather, insertWeather }}>
            {props.children}
        </WeatherContext.Provider>
    );
};

export { WeatherContext, WeatherProvider };