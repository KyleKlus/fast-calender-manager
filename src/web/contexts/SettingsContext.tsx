import { createContext, useState } from 'react';
import React from 'react';

export const defaultBgColor = '#ebf1e4ff';
export const defaultRoundingValue = 5;
export const defaultRoundSplits = false;

export interface ISettingsContext {
    backgroundColor: string;
    roundingValue: number;
    roundSplits: boolean;
    setRoundingValue: (roundingValue: number) => void;
    setRoundSplits: (roundSplits: boolean) => void;
    setBackgroundColor: (backgroundColor: string) => void;
}

const SettingsContext = createContext<ISettingsContext>({
    backgroundColor: defaultBgColor,
    roundingValue: defaultRoundingValue,
    roundSplits: defaultRoundSplits,
    setRoundingValue: (roundingValue: number) => { },
    setRoundSplits: (roundSplits: boolean) => { },
    setBackgroundColor: (backgroundColor: string) => { },
});

function SettingsProvider(props: React.PropsWithChildren<{}>) {
    const [backgroundColor, setBackgroundColor] = useState(defaultBgColor);
    const [roundingValue, setRoundingValue] = useState(defaultRoundingValue);
    const [roundSplits, setRoundSplits] = useState(defaultRoundSplits);

    return (
        <SettingsContext.Provider value={{
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