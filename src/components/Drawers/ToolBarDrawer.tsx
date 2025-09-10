import { useContext, useEffect, useRef, useState } from 'react';
import './ToolBarDrawer.css';
import { DropdownButton, ButtonGroup, Button } from 'react-bootstrap';
import { useKeyPress } from '../../hooks/useKeyPress';
import { GCalContext } from '../../contexts/GCalContext';
import ColorSelector, { getColorFromColorId } from '../ColorSelector';
import { EventInput } from '@fullcalendar/core';
import { EventContext } from '../../contexts/EventContext';
import Drawer from './Drawer';
import { WeatherContext } from '../../contexts/WeatherContext';

export type ToolbarMode = 'color' | 'delete' | 'duplicate' | 'split' | 'none';

export interface IToolBarDrawerProps {
    selectedColor: number;
    selectedMode: ToolbarMode;
    selectColor: (colorId: number) => void;
    onAddClick: () => void;
    onModeChange: (mode: ToolbarMode) => void;
}

const ToolBarDrawer: React.FC<IToolBarDrawerProps> = (props: IToolBarDrawerProps) => {
    const { showWeather } = useContext(WeatherContext);
    const [isToolbarOpen, setToolbarOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');
    const isXKeyPressed = useKeyPress('x');
    const isCKeyPressed = useKeyPress('c');
    const isDKeyPressed = useKeyPress('d');
    const isSKeyPressed = useKeyPress('s');
    const isAKeyPressed = useKeyPress('a');

    useEffect(() => {
        if (isSpaceKeyPressed) {
            setToolbarOpen(!isToolbarOpen);
        }
    }, [isSpaceKeyPressed]);

    useEffect(() => {
        if (isXKeyPressed && isToolbarOpen) {
            props.onModeChange && props.onModeChange('delete');
        }
    }, [isXKeyPressed]);

    useEffect(() => {
        if (isCKeyPressed && isToolbarOpen) {
            props.onModeChange && props.onModeChange('color');
        }
    }, [isCKeyPressed]);

    useEffect(() => {
        if (isDKeyPressed && isToolbarOpen) {
            props.onModeChange && props.onModeChange('duplicate');
        }
    }, [isDKeyPressed]);

    useEffect(() => {
        if (isSKeyPressed && isToolbarOpen) {
            props.onModeChange && props.onModeChange('split');
        }
    }, [isSKeyPressed]);

    useEffect(() => {
        if (isAKeyPressed) {
            props.onAddClick();
        }
    }, [isAKeyPressed]);

    return (
        <Drawer
            isOpen={isToolbarOpen}
            location='top'
            className='toolbar-container'
            disableHandle={showWeather}
            drawerHandleClassName={'toolbar-handle'}
            drawerClassName='toolbar'
            setIsOpen={(isOpen) => {
                if (isToolbarOpen) {
                    props.onModeChange && props.onModeChange('none')
                }
                setToolbarOpen(isOpen);
            }}
        >
            <DropdownButton
                id={`dropdown-variants-${'Primary'}`}
                variant={'Primary'.toLowerCase()}
                className='color-event-button'
                title={
                    <div className={['color-swatch',].join(' ')} style={{ backgroundColor: getColorFromColorId(props.selectedColor) }}></div>
                }
            >
                <ColorSelector
                    selectedColor={props.selectedColor}
                    swatchesPerRow={6}
                    onColorChange={(colorId) => {
                        props.selectColor(colorId);
                    }}
                />
            </DropdownButton>
            <ButtonGroup>
                <Button
                    variant='primary'
                    active={props.selectedMode === 'color'}
                    className={"color-event-button"}
                    onClick={() => {
                        props.onModeChange && props.onModeChange('color')
                    }}
                >
                    <i className={`bi-palette${props.selectedMode === 'color' ? '-fill' : ''}`}></i>
                </Button>
                <Button
                    variant="primary" active={props.selectedMode === 'delete'}
                    className='delete-event-button'
                    onClick={() => {
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
                        props.onModeChange && props.onModeChange('duplicate')
                    }}
                >
                    <i className={`bi-copy`}></i>
                </Button>
                <Button
                    variant="primary"
                    active={props.selectedMode === 'split'}
                    className='split-event-button'
                    onClick={() => {
                        props.onModeChange && props.onModeChange('split')
                    }}
                >
                    <i className={`bi-hr`}></i>
                </Button>
            </ButtonGroup>
            <div className='toolbar-divider'></div>
            <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                <i className={`bi-plus`}></i>
                Event
            </Button>
        </Drawer >
    );
};

export default ToolBarDrawer;