import { useContext, useEffect, useRef, useState } from 'react';
import './ToolBarDrawer.css';
import { DropdownButton, ButtonGroup, Button } from 'react-bootstrap';
import { useKeyPress } from '../hooks/useKeyPress';
import { GCalContext } from '../contexts/GCalContext';
import ColorSelector, { getColorFromColorId } from './ColorSelector';
import { EventInput } from '@fullcalendar/core';
import { EventContext } from '../contexts/EventContext';

export type ToolbarMode = 'color' | 'delete' | 'duplicate' | 'select' | 'none';

export interface IToolBarDrawerProps {
    selectedColor: number;
    selectedMode: ToolbarMode;
    lockShortcuts: boolean;
    selectColor: (colorId: number) => void;
    onAddClick: () => void;
    onModeChange: (mode: ToolbarMode) => void;
    onTodayClick: () => void;
}

const ToolBarDrawer: React.FC<IToolBarDrawerProps> = (props: IToolBarDrawerProps) => {
    const { isSyncOn, setIsSyncOn } = useContext(GCalContext);
    const { events, setEvents, areBGEventsEditable, setBGEventsEditable } = useContext(EventContext);
    const [isToolbarOpen, setToolbarOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');
    const isTKeyPressed = useKeyPress('t');
    const isXKeyPressed = useKeyPress('x');
    const isCKeyPressed = useKeyPress('c');
    const isDKeyPressed = useKeyPress('d');
    const isSKeyPressed = useKeyPress('s');
    const isAKeyPressed = useKeyPress('a');

    useEffect(() => {
        if (isSpaceKeyPressed && !props.lockShortcuts) {
            setToolbarOpen(!isToolbarOpen);
        }
    }, [isSpaceKeyPressed]);

    useEffect(() => {
        if (isTKeyPressed && !props.lockShortcuts) {
            props.onTodayClick();
        }
    }, [isTKeyPressed]);


    useEffect(() => {
        if (isXKeyPressed && isToolbarOpen && !props.lockShortcuts) {
            props.onModeChange && props.onModeChange('delete');
        }
    }, [isXKeyPressed]);

    useEffect(() => {
        if (isCKeyPressed && isToolbarOpen && !props.lockShortcuts) {
            props.onModeChange && props.onModeChange('color');
        }
    }, [isCKeyPressed]);

    useEffect(() => {
        if (isDKeyPressed && isToolbarOpen && !props.lockShortcuts) {
            props.onModeChange && props.onModeChange('duplicate');
        }
    }, [isDKeyPressed]);

    useEffect(() => {
        if (isSKeyPressed && isToolbarOpen && !props.lockShortcuts) {
            props.onModeChange && props.onModeChange('select');
        }
    }, [isSKeyPressed]);

    useEffect(() => {
        if (isAKeyPressed && !props.lockShortcuts) {
            props.onAddClick();
        }
    }, [isAKeyPressed]);

    return (
        <div className={['toolbar-container', isToolbarOpen ? 'isOpen' : ''].join(' ')}>
            <div className='toolbar'>
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
                <div className='toolbar-divider'></div>
                <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                    <i className={`bi-plus`}></i>
                    Event
                </Button>
                <Button variant="primary" active={isSyncOn} className='sync-event-button' onClick={() => { setIsSyncOn(!isSyncOn) }}>
                    <i className={`bi-arrow-repeat`}></i>
                    Sync
                </Button>
                <Button variant="primary" active={areBGEventsEditable} className='sync-event-button' onClick={() => {
                    const newEvents = (events as Array<EventInput>).map(event => {
                        let isBackgroundEvent = event.display !== 'background' && !event.allDay;
                        return {
                            ...event,
                            display: isBackgroundEvent ? 'background' : 'auto',
                        };
                    });
                    setEvents(newEvents);
                    setBGEventsEditable(!areBGEventsEditable);
                }}>
                    <i className={`bi-pencil-square`}></i>
                    Phases
                </Button>
                <Button variant="primary" className='today-button' onClick={() => { props.onTodayClick && props.onTodayClick() }}>
                    <i className={`bi-calendar-event`}></i>
                    Today
                </Button>
            </div>
            <div className='toolbar-handle'
                onClick={() => {
                    if (isToolbarOpen) {
                        props.onModeChange && props.onModeChange('none')
                    }
                    setToolbarOpen(!isToolbarOpen)
                }
                }
            >
                <i className="bi-chevron-down"></i>
            </div>
        </div >
    );
};

export default ToolBarDrawer;