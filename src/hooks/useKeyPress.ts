import { useContext, useEffect, useState } from "react";
import { KeyboardShortcutContext } from "../contexts/KeyboardShortcutContext";

export type EnableMode = 'inverted' | 'default' | 'external';

export function useKeyPress(targetKey: string, enableMode: EnableMode = 'default', isExternallyEnabled: boolean = false) {
    const { areShortcutsEnabled } = useContext(KeyboardShortcutContext);
    const [isKeyPressed, setIsKeyPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                setIsKeyPressed(true);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                setIsKeyPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [targetKey]);

    return isKeyPressed && ((enableMode === 'inverted' && !areShortcutsEnabled) || (enableMode === 'default' && areShortcutsEnabled) || (enableMode === 'external' && isExternallyEnabled));
}