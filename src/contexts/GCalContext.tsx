import { createContext, useEffect, useState } from 'react';
import GCal from '../handlers/gcal';
import env from '../env.json';
import { DateTime } from 'luxon';
import React from 'react';

const config = {
    clientId: env.CLIENT_ID,
    apiKey: env.API_KEY,
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks",
    discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
    ],
};

const gcal = new GCal(config);

const GCalContext = createContext({
    isLoggedIn: false,
    areEventsLoaded: false,
    isTryingToAutoLogin: true,
    gcal,
    events: [],
    setIsLoggedIn: (isLoggedIn: boolean) => { },
    loadEvents: () => { },
});

function GCalProvider(props: React.PropsWithChildren<{}>) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);
    const [events, setEvents] = useState([]);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);

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

        const colorMap = [
            '#525279ff', '#DC3912', '#33b679',
            '#109618', '#990099', '#7595a0ff',
            '#DD4477', '#039be5', '#616161',
            '#3f51b5',
            '#0b8043',
            '#92a075ff',
            '#a07575ff',
            '#a09e75ff',
            '#dbababff',
            '#3af025ff',
            '#992222ff',
            '#2e0881ff',
            '#64e59eff',
            '#134d60ff',
            '#c17615ff',
            '#63105fff',
            '#a4e10cff',
            '#9690edff',
            '#236a0eff',
            '#5b1142ff',
        ];

        let events = (await gcal.listEvents({
            calendarId: 'primary',
            timeMin: DateTime.now().startOf('week').toISO(),
            timeMax: DateTime.now().endOf('week').toISO(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
        })).result.items.map((e: any) => {
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
                backgroundColor: colorMap[e.colorId as number] as string,
                borderColor: colorMap[e.colorId as number] as string,
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

    return (
        <GCalContext.Provider value={{ isLoggedIn, areEventsLoaded, isTryingToAutoLogin, gcal, events, loadEvents, setIsLoggedIn }}>
            {props.children}
        </GCalContext.Provider>
    );
};

export { GCalContext, GCalProvider };
