import { createContext, useState } from 'react';
import React from 'react';

export const defaultBgColor = '#ebf1e4ff';
export const defaultRoundingValue = 5;
export const defaultRoundSplits = false;
export const defaultPhases = ['Arbeitszeit', 'Unizeit', 'Freizeit'];

export interface ISettingsContext {
    backgroundColor: string;
    roundingValue: number;
    roundSplits: boolean;
    availablePhases: string[];
    setAvailablePhases: (availablePhases: string[]) => void;
    setRoundingValue: (roundingValue: number) => void;
    setRoundSplits: (roundSplits: boolean) => void;
    setBackgroundColor: (backgroundColor: string) => void;
}

const SettingsContext = createContext<ISettingsContext>({
    backgroundColor: defaultBgColor,
    roundingValue: defaultRoundingValue,
    roundSplits: defaultRoundSplits,
    availablePhases: defaultPhases,
    setAvailablePhases: (availablePhases: string[]) => { },
    setRoundingValue: (roundingValue: number) => { },
    setRoundSplits: (roundSplits: boolean) => { },
    setBackgroundColor: (backgroundColor: string) => { },
});

function SettingsProvider(props: React.PropsWithChildren<{}>) {
    const [backgroundColor, setBackgroundColor] = useState(defaultBgColor);
    const [roundingValue, setRoundingValue] = useState(defaultRoundingValue);
    const [roundSplits, setRoundSplits] = useState(defaultRoundSplits);
    const [availablePhases, setAvailablePhases] = useState(defaultPhases);

    return (
        <SettingsContext.Provider value={{
            availablePhases,
            setAvailablePhases,
            roundingValue,
            setRoundingValue,
            roundSplits,
            setRoundSplits,
            backgroundColor,
            setBackgroundColor,
        }}>
            {props.children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsProvider };