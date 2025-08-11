import { createContext, useState } from 'react';
import React from 'react';

interface IKeyboardShortcutContext {
    areShortcutsEnabled: boolean;
    setShortcutsEnabled: (isShortcutsEnabled: boolean) => void;
}

const KeyboardShortcutContext = createContext<IKeyboardShortcutContext>({
    areShortcutsEnabled: true,
    setShortcutsEnabled: (isShortcutsEnabled: boolean) => {
        console.warn('setShortcutsEnabled not implemented');
    },
});

function KeyboardShortcutProvider(props: React.PropsWithChildren<{}>) {
    const [areShortcutsEnabled, setAreShortcutsEnabled] = useState(true);

    function setShortcutsEnabled(isShortcutsEnabled: boolean) {
        setAreShortcutsEnabled(isShortcutsEnabled);
    }

    return (
        <KeyboardShortcutContext.Provider value={{
            areShortcutsEnabled, setShortcutsEnabled
        }}>
            {props.children}
        </KeyboardShortcutContext.Provider>
    );
};

export { KeyboardShortcutContext, KeyboardShortcutProvider };