import React from 'react';
import { DateInViewProvider } from './DateInViewContext';
import { EventProvider } from './EventContext';
import { GCalProvider } from './GCalContext';
import { KeyboardShortcutProvider } from './KeyboardShortcutContext';
import { TemplateProvider } from './TemplateContext';
import { WeatherProvider } from './WeatherContext';

export default function AppProviders(props: React.PropsWithChildren<{}>) {

    return (
        <KeyboardShortcutProvider>
            <DateInViewProvider>
                <WeatherProvider>
                    <TemplateProvider>
                        <EventProvider>
                            <GCalProvider>
                                {props.children}
                            </GCalProvider>
                        </EventProvider>
                    </TemplateProvider>
                </WeatherProvider>
            </DateInViewProvider>
        </KeyboardShortcutProvider>
    );
};