import './ColorSelector.css';

// Color mapping for event colors (Based on Google Calendar colors)
export const colorMap = [
    '#cf4b4bff',
    '#2468a0ff',
    '#33b670ff',
    '#8e24aaff',
    '#ca469cff',
    '#f9b01eff',
    '#f4511eff',
    '#038be5ff',
    '#605F5E',
    '#394bb4ff',
    '#0b8043',
    '#FB3640',
    '#000000',
];

export const defaultColorId = 0 // Default color ID for eventx

export const defaultEventColor = colorMap[defaultColorId];

export const defaultAmountOfColors = 12;

export const defaultOutOfRangeColorId = colorMap.length - 1;

export function getColorIdFromColor(color: string): number {
    return colorMap.indexOf(color) === -1 ? defaultColorId : colorMap.indexOf(color);
}

export function getColorFromColorId(colorId: number): string {
    if (colorId >= defaultOutOfRangeColorId || colorId < 0) {
        console.warn(`Color ID ${colorId} is out of range. Returning default out of range color.`);
        return colorMap[defaultColorId];
    }
    return colorMap[colorId];
}

export interface IHsl {
    h: number;
    s: number;
    l: number;
}

export function hexToHsl(hex: string): IHsl {
    // Remove the '#' character if present
    hex = hex.replace(/^#/, '');

    // Convert hex to RGB
    const r: number = parseInt(hex.slice(0, 2), 16) / 255;
    const g: number = parseInt(hex.slice(2, 4), 16) / 255;
    const b: number = parseInt(hex.slice(4, 6), 16) / 255;

    // Calculate max and min values
    const max: number = Math.max(r, g, b);
    const min: number = Math.min(r, g, b);
    let h: number, s: number, l: number = (max + min) / 2;

    // Calculate Hue
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d: number = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0; // Default case (not expected to reach here)
        }
        h /= 6;
    }

    // Convert H, S, and L to percentage
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l };
}

export function getBgHoverAndActiveColor(bgColor: string): { hover: string, active: string } {
    const hslBgColor = hexToHsl(bgColor);
    const bgHoverColor = `hsl(${hslBgColor.h}, ${hslBgColor.s}%, ${hslBgColor.l - 7}%)`;
    const bgActiveColor = `hsl(${hslBgColor.h}, ${hslBgColor.s}%, ${hslBgColor.l - 17}%)`;
    return { hover: bgHoverColor, active: bgActiveColor };
}

export interface IColorSelectorProps {
    selectedColor: number;
    swatchesPerRow?: number;
    onColorChange: (colorId: number) => void;
}

/**
 * ColorSelector Component
 *
 * This component is responsible for rendering a color selector.
 *
 * @param props
 * @returns JSX.Element
 */
const ColorSelector: React.FC<IColorSelectorProps> = (props: IColorSelectorProps) => {
    return (
        <div className='color-selector' style={{
            gridTemplateColumns: `repeat(${props.swatchesPerRow || defaultAmountOfColors}, 1fr)`
        }}>
            {colorMap.filter((color, index) => color !== '' && index !== defaultOutOfRangeColorId).map((color, index) => (
                <button
                    className={['color-selector-swatch', props.selectedColor === index ? 'selected' : ''].join(' ')}
                    role='button'
                    style={{ backgroundColor: color }}
                    key={index}
                    onClick={() => {
                        if (props.selectedColor === index) { return }
                        props.onColorChange(index);
                    }}
                ></button>
            ))}
        </div>
    );
};

export default ColorSelector;