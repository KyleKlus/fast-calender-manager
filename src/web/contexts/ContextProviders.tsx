import React from 'react';
import { DateInViewProvider } from './DateInViewContext';
import { EventProvider } from './EventContext';
import { KeyboardShortcutProvider } from './KeyboardShortcutContext';
import { TemplateProvider } from './TemplateContext';
import { WeatherProvider } from './WeatherContext';
import { DataSourceProvider } from './DataSourceProvider';
import IDataSource from '../handlers/IDataSource';
import { SettingsProvider } from './SettingsContext';

export interface IContextProvidersProps {
    externalDataSource?: IDataSource
}

/**
 * ContextProviders Component
 *
 * This component is responsible for providing all contexts to the rest of the application. It also handles any external data sources, if provided.
 *
 * @param props
 * @returns
 */
function ContextProviders(props: React.PropsWithChildren<IContextProvidersProps>) {
    return (
        <SettingsProvider>
            <KeyboardShortcutProvider>
                <DataSourceProvider externalDataSource={props.externalDataSource}>
                    <DateInViewProvider>
                        <WeatherProvider>
                            <TemplateProvider>
                                <EventProvider>
                                    {props.children}
                                </EventProvider>
                            </TemplateProvider>
                        </WeatherProvider>
                    </DateInViewProvider>
                </DataSourceProvider>
            </KeyboardShortcutProvider >
        </SettingsProvider>
    );
};

export default ContextProviders;