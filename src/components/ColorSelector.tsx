import './ColorSelector.css';

export const colorMap = [
    '#b74f4f',
    '#7986cbff',
    '#33b679',
    '#8e24aaff',
    '#e67c73ff',
    '#f6bf26ff',
    '#f4511eff',
    '#039be5',
    '#616161',
    '#3f51b5',
    '#0b8043',
    '#d50000ff',
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

export interface IColorSelectorProps {
    selectedColor: number;
    swatchesPerRow?: number;
    onColorChange: (colorId: number) => void;
}

const ColorSelector: React.FC<IColorSelectorProps> = (props: IColorSelectorProps) => {
    return (
        <div className='color-selector' style={{
            gridTemplateColumns: `repeat(${props.swatchesPerRow || defaultAmountOfColors}, 1fr)`
        }}>
            {colorMap.filter((color, index) => color !== '' && index !== defaultOutOfRangeColorId).map((color, index) => (
                <div
                    className={['color-selector-swatch', props.selectedColor === index ? 'selected' : ''].join(' ')}
                    style={{ backgroundColor: color }}
                    key={index}
                    onClick={() => {
                        if (props.selectedColor === index) { return }
                        props.onColorChange(index);
                    }}
                ></div>
            ))}
        </div>
    );
};

export default ColorSelector;