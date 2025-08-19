import { useContext, useEffect, useRef, useState } from 'react';
import './ToolBarDrawer.css';
import { DropdownButton, ButtonGroup, Button } from 'react-bootstrap';
import { useKeyPress } from '../../hooks/useKeyPress';
import { GCalContext } from '../../contexts/GCalContext';
import ColorSelector, { getColorFromColorId } from '../ColorSelector';
import { EventInput } from '@fullcalendar/core';
import { EventContext } from '../../contexts/EventContext';
import { DateTime } from 'luxon';
import Drawer from './Drawer';

export type ToolbarMode = 'color' | 'delete' | 'duplicate' | 'none';

export interface IToolBarDrawerProps {
    selectedColor: number;
    selectedMode: ToolbarMode;
    selectColor: (colorId: number) => void;
    onAddClick: () => void;
    onModeChange: (mode: ToolbarMode) => void;
    onTodayClick: () => void;
    onPrevWeekClick: () => void;
    onNextWeekClick: () => void;
}

const ToolBarDrawer: React.FC<IToolBarDrawerProps> = (props: IToolBarDrawerProps) => {
    const { isSyncOn, setIsSyncOn, isCurrentlyLoading, loadEvents } = useContext(GCalContext);
    const { events, setEvents, areBGEventsEditable, setBGEventsEditable, dateInView: date, setDateInView: setDate } = useContext(EventContext);
    const [isToolbarOpen, setToolbarOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');
    const isTKeyPressed = useKeyPress('t');
    const isXKeyPressed = useKeyPress('x');
    const isCKeyPressed = useKeyPress('c');
    const isDKeyPressed = useKeyPress('d');
    const isSKeyPressed = useKeyPress('s');
    const isAKeyPressed = useKeyPress('a');
    const isPKeyPressed = useKeyPress('p');

    useEffect(() => {
        if (isSpaceKeyPressed) {
            setToolbarOpen(!isToolbarOpen);
        }
    }, [isSpaceKeyPressed]);

    useEffect(() => {
        if (isTKeyPressed) {
            props.onTodayClick();
        }
    }, [isTKeyPressed]);


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
            setIsSyncOn(!isSyncOn);
        }
    }, [isSKeyPressed]);

    useEffect(() => {
        if (isAKeyPressed) {
            props.onAddClick();
        }
    }, [isAKeyPressed]);

    useEffect(() => {
        if (isPKeyPressed) {
            setBGEventsEditable(!areBGEventsEditable);
            const newEvents = (events as Array<EventInput>).map(event => {
                let isBackgroundEvent = event.display !== 'background' && !event.allDay;
                return {
                    ...event,
                    display: isBackgroundEvent ? 'background' : 'auto',
                };
            });
            setEvents(newEvents);
        }
    }, [isPKeyPressed]);

    return (
        <Drawer
            isOpen={isToolbarOpen}
            location='top'
            className='toolbar-container'
            drawerHandleClassName='toolbar-handle'
            drawerClassName='toolbar'
            setIsOpen={(isOpen) => {
                if (isToolbarOpen) {
                    props.onModeChange && props.onModeChange('none')
                }
                setToolbarOpen(isOpen);
            }}
            childrenWithinHandleRight={
                <>
                    <div
                        className='toolbar-navigation-button left-button'
                        onClick={() => { props.onPrevWeekClick && props.onPrevWeekClick() }}
                    >
                        <i className='bi-chevron-double-left'></i>
                    </div>
                    <div className='today-button' onClick={() => { props.onTodayClick && props.onTodayClick() }}>
                        <i className={`bi-calendar-event`}></i>
                    </div>
                    <div
                        className='toolbar-navigation-button right-button'
                        onClick={() => { props.onNextWeekClick && props.onNextWeekClick() }}
                    >
                        <i className='bi-chevron-double-right'></i>
                    </div>
                </>
            }
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
            </ButtonGroup>
            <div className='toolbar-divider'></div>
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
            <div className='toolbar-divider'></div>
            <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                <i className={`bi-plus`}></i>
                Event
            </Button>
        </Drawer>
    );
};

export default ToolBarDrawer;