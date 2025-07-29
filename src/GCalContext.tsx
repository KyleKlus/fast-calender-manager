import { createContext, useEffect, useState } from 'react';
import GCal from './gcal';
import env from '../env.json';
import { DateTime } from 'luxon';
import { title } from 'process';

const config = {
    clientId: env.CLIENT_ID,
    apiKey: env.API_KEY,
    scope: "https://www.googleapis.com/auth/calendar",
    discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ],
};

const gcal = new GCal(config);

const GCalContext = createContext({
    isLoggedIn: false,
    isTryingToAutoLogin: true,
    gcal,
    events: [],
    setIsLoggedIn: (isLoggedIn: boolean) => { },
    loadEvents: () => { },
});

const GCalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (isTryingToAutoLogin) {
            setTimeout(() => {
                gcal.handleAuthClick().then((res) => {

                    setIsLoggedIn(true);
                    setIsTryingToAutoLogin(false);
                });
            }, 1000);
        }
    });

    async function loadEvents() {
        if (!isLoggedIn) { return }
        const response = await gcal.listEvents({
            calendarId: 'primary',
            timeMin: DateTime.now().startOf('week').toISO(),
            timeMax: DateTime.now().endOf('week').toISO(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const colorMap = {
            1: '#3366CC',
            2: '#DC3912',
            3: '#FF9900',
            4: '#109618',
            5: '#990099',
            6: '#0099CC',
            7: '#DD4477',
            8: '#3366CC',
            9: '#DC3912',
            10: '#FF9900'
        };


        setEvents(response.result.items.map(e => {
            return {
                id: e.id,
                title: e.summary,
                start: e.start.dateTime || e.start.date, // try timed. will fall back to all-day
                end: e.end.dateTime || e.end.date, // same
                url: e.htmlLink,
                location: e.location,
                description: e.description,
                attachments: e.attachments || [],
                extendedProps: (e.extendedProperties || {}).shared || {},
                backgroundColor: colorMap[e.colorId],
                borderColor: colorMap[e.colorId],
            }
        }));
    }

    return (
        <GCalContext.Provider value={{ isLoggedIn, isTryingToAutoLogin, gcal, events, loadEvents, setIsLoggedIn }}>
            {children}
        </GCalContext.Provider>
    );
};

export { GCalContext, GCalProvider };
