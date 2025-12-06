import { createContext, useEffect, useState } from 'react';
import React from 'react';
import { getBgHoverAndActiveColor } from '../components/ColorSelector';

export const defaultBgColor = '#ebf1e4ff';
export const defaultRoundingValue = 5;
export const defaultRoundSplits = false;
export const defaultPhases = ['Arbeitszeit', 'Unizeit', 'Freizeit'];

export interface ISettingsContext {
    backgroundColor: string;
    roundingValue: number;
    roundSplits: boolean;
    availablePhases: string[];
    addPhase: (phase: string) => void;
    removePhase: (phase: string) => void;
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
    addPhase: (phase: string) => { },
    removePhase: (phase: string) => { },
    setAvailablePhases: (availablePhases: string[]) => { },
    setRoundingValue: (roundingValue: number) => { },
    setRoundSplits: (roundSplits: boolean) => { },
    setBackgroundColor: (backgroundColor: string) => { },
});

function SettingsProvider(props: React.PropsWithChildren<{}>) {
    const [backgroundColor, setBackgroundColorLocal] = useState(defaultBgColor);
    const [roundingValue, setRoundingValueLocal] = useState(defaultRoundingValue);
    const [roundSplits, setRoundSplitsLocal] = useState(defaultRoundSplits);
    const [availablePhases, setAvailablePhasesLocal] = useState(defaultPhases);

    useEffect(() => {
        const savedBgColor = window.localStorage.getItem('bgColor');
        const savedRoundingValue = window.localStorage.getItem('roundingValue');
        const savedRoundSplits = window.localStorage.getItem('roundSplits');
        const savedAvailablePhases = window.localStorage.getItem('availablePhases');
        if (savedAvailablePhases) {
            setAvailablePhasesLocal(JSON.parse(savedAvailablePhases));
        } else {
            window.localStorage.setItem('availablePhases', JSON.stringify(defaultPhases));
        }

        if (savedRoundingValue) {
            setRoundingValueLocal(parseInt(savedRoundingValue));
        } else {
            window.localStorage.setItem('roundingValue', defaultRoundingValue.toString());
        }
        if (savedRoundSplits) {
            setRoundSplitsLocal(savedRoundSplits === 'true');
        } else {
            window.localStorage.setItem('roundSplits', 'false');
        }
        if (savedBgColor) {
            setBackgroundColorLocal(savedBgColor);
        } else {
            const cssBgColor = getComputedStyle(document.body).getPropertyValue('--bs-body-bg');
            setBackgroundColorLocal(cssBgColor);
            window.localStorage.setItem('bgColor', cssBgColor);
        }
    }, []);

    function setRoundSplits(roundSplits: boolean) {
        localStorage.setItem('roundSplits', roundSplits.toString());
        setRoundSplitsLocal(roundSplits);
    }

    function setBackgroundColor(backgroundColor: string) {
        setBackgroundColorLocal(backgroundColor);
        localStorage.setItem('bgColor', backgroundColor);
        document.body.style.setProperty('--bs-body-bg', backgroundColor);
        const bgHoverAndActiveColor = getBgHoverAndActiveColor(backgroundColor);
        document.body.style.setProperty('--bs-body-bg-hover', bgHoverAndActiveColor.hover);
        document.body.style.setProperty('--bs-body-bg-active', bgHoverAndActiveColor.active);
    }

    function setRoundingValue(roundingValue: number) {
        localStorage.setItem('roundingValue', roundingValue.toString());
        setRoundingValueLocal(roundingValue);
    }

    function setAvailablePhases(availablePhases: string[]) {
        localStorage.setItem('availablePhases', JSON.stringify(availablePhases));
        setAvailablePhasesLocal(availablePhases);
    }

    function addPhase(phase: string) {
        setAvailablePhases([...availablePhases, phase]);
    }

    function removePhase(phase: string) {
        setAvailablePhases(availablePhases.filter((p) => p !== phase));
    }

    return (
        <SettingsContext.Provider value={{
            addPhase,
            removePhase,
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