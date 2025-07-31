import { useState } from 'react';
import './ToolBarDrawer.css';
import { DropdownButton, ButtonGroup, Button } from 'react-bootstrap';
import { colorMap } from '../contexts/GCalContext';

export type ToolbarMode = 'color' | 'delete' | 'duplicate' | 'select' | 'none';

export interface IToolBarDrawerProps {
    selectedColor?: number;
    selectedMode?: ToolbarMode;
    onAddClick?: () => void;
    onModeChange?: (mode: ToolbarMode) => void;
    onTodayClick?: () => void;
}

const ToolBarDrawer: React.FC<IToolBarDrawerProps> = (props: IToolBarDrawerProps) => {
    const [isToolbarOpen, setToolbarOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<number>(props.selectedColor || 0);
    return (
        <div className={['toolbar-container', isToolbarOpen ? 'isOpen' : ''].join(' ')}>
            <div className='toolbar'>
                <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                    <i className={`bi-plus-circle`}></i>
                </Button>
                <DropdownButton
                    id={`dropdown-variants-${'Primary'}`}
                    variant={'Primary'.toLowerCase()}
                    className='color-event-button'
                    title={
                        <div className={['color-swatch',].join(' ')} style={{ backgroundColor: colorMap[selectedColor] }}></div>
                    }
                >
                    {colorMap.filter((color, index) => color !== '').map((color, index) => (
                        <div
                            className={['color-swatch',].join(' ')}
                            style={{ backgroundColor: color, borderWidth: selectedColor === index ? '2px' : '1px' }}
                            key={index}
                            onClick={() => { setSelectedColor(index) }}
                        ></div>
                    ))}
                </DropdownButton>
                <ButtonGroup>
                    <Button
                        variant='primary'
                        active={props.selectedMode === 'color'}
                        className={"color-event-button"}
                        onClick={() => {
                            if (props.selectedMode === 'select') {
                                // TODO: implement
                                return;
                            }
                            props.onModeChange && props.onModeChange('color')
                        }}
                    >
                        <i className={`bi-palette${props.selectedMode === 'color' ? '-fill' : ''}`}></i>
                    </Button>
                    <Button
                        variant="primary" active={props.selectedMode === 'delete'}
                        className='delete-event-button'
                        onClick={() => {
                            if (props.selectedMode === 'select') {
                                // TODO: implement
                                return;
                            }
                            props.onModeChange && props.onModeChange('delete')
                        }}
                    >
                        <i className={`bi-trash${props.selectedMode === 'delete' ? '-fill' : ''}`}></i>
                    </Button>
                    <Button
                        variant="primary"
                        active={props.selectedMode === 'duplicate'}
                        className='duplicate-event-button'
                        onClick={() => {
                            if (props.selectedMode === 'select') {
                                // TODO: implement
                                return;
                            }
                            props.onModeChange && props.onModeChange('duplicate')
                        }}
                    >
                        <i className={`bi-copy`}></i>
                    </Button>
                    <Button
                        variant="primary"
                        active={props.selectedMode === 'select'}
                        className='select-event-button'
                        onClick={() => { props.onModeChange && props.onModeChange('select') }}
                    >
                        <i className={`bi-check-square${props.selectedMode === 'select' ? '-fill' : ''}`}></i>
                    </Button>
                </ButtonGroup>
                <Button variant="primary" className='today-button' onClick={() => { props.onTodayClick && props.onTodayClick() }}>
                    Today
                </Button>
            </div>
            <div className='toolbar-handle'
                onClick={() => { setToolbarOpen(!isToolbarOpen) }}
            >
                <i className="bi-chevron-down"></i>
            </div>
        </div >
    );
};

export default ToolBarDrawer;