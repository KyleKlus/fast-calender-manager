import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import IDataSource from '../interfaces/IDataSource';
import GoogleDataSource from '../handlers/GoogleDataSource';
import { DateTime } from 'luxon';
import { EventInput } from '@fullcalendar/core';
import { SettingsContext } from './SettingsContext';

export interface IDataSourceProviderProps {
    externalDataSource?: IDataSource;
}

interface IDataSourceContext {
    isLoggedIn: boolean;
    isTryingToAutoLogin: boolean;
    isAuthLoading: boolean;
    login: () => Promise<void>;
    fetchEvents: (date?: DateTime) => Promise<EventInput[]>;
    saveEvent: (
        event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } },
        isAllDay?: boolean) => Promise<EventInput | undefined>;
    deleteEvent: (eventId: string) => Promise<boolean>;
    updateEvent: (
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps?: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) => Promise<boolean>;
}

const DataSourceContext = createContext<IDataSourceContext>({
    isLoggedIn: false,
    isTryingToAutoLogin: true,
    isAuthLoading: true,
    fetchEvents: async (date: DateTime = DateTime.now()) => { return [] },
    login: async () => { },
    saveEvent: async (
        event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } },
        isAllDay?: boolean) => { return new Promise((resolve) => { resolve(undefined); }) },
    deleteEvent: async (eventId: string) => { return new Promise((resolve) => { resolve(false); }) },
    updateEvent: async (
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps?: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ) => { return new Promise((resolve) => { resolve(false); }) },
});

function DataSourceProvider(props: React.PropsWithChildren<IDataSourceProviderProps>) {
    const dataSource = props.externalDataSource ? props.externalDataSource : new GoogleDataSource();
    const { availablePhases } = useContext(SettingsContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isTryingToAutoLogin, setIsTryingToAutoLogin] = useState(true);

    useEffect(() => {
        if (isTryingToAutoLogin) {
            setTimeout(() => {
                login();
            }, 1000);
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

    async function fetchEvents(date?: DateTime): Promise<EventInput[]> {
        if (!isLoggedIn) { return [] }
        const events = await dataSource.loadEvents(date ?? DateTime.now(), (isAuthValid: boolean) => {
            setIsAuthValid(isAuthValid);
        }, availablePhases);
        return events
    }

    function setIsAuthValid(isAuthValid: boolean) {
        setIsAuthLoading(!isAuthValid);
    }

    async function saveEvent(event: { title: string; start: DateTime; end: DateTime; colorId: number; extendedProps?: { description?: string } }, isAllDay?: boolean): Promise<EventInput | undefined> {
        return await dataSource.addEvent(event, (isAuthValid: boolean) => {
            setIsAuthValid(isAuthValid);
        }, availablePhases, isAllDay);
    }

    async function deleteEvent(eventId: string): Promise<boolean> {
        return await dataSource.deleteEvent(eventId, (isAuthValid: boolean) => {
            setIsAuthValid(isAuthValid);
        });
    }

    async function updateEvent(
        event: {
            title: string;
            start: DateTime;
            end: DateTime;
            colorId: number;
            extendedProps?: { description?: string }
        },
        eventId: string,
        isAllDay?: boolean
    ): Promise<boolean> {
        return await dataSource.editEvent(event, eventId, (isAuthValid: boolean) => {
            setIsAuthValid(isAuthValid);
        }, isAllDay);
    }

    return (
        <DataSourceContext.Provider value={{ login, fetchEvents, saveEvent, deleteEvent, updateEvent, isLoggedIn, isTryingToAutoLogin, isAuthLoading }}>
            {props.children}
        </DataSourceContext.Provider>
    );
};

export { DataSourceContext, DataSourceProvider };