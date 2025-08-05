import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { useContext, useEffect, useState } from 'react';
import { colorMap, GCalContext } from '../contexts/GCalContext';

import { generateFCConfig } from '../handlers/fullCalendarConfigHandler';
import { DateSelectArg, EventChangeArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import Popup from 'reactjs-popup';
import ToolBarDrawer, { ToolbarMode } from '../components/ToolBarDrawer';
import { convertEventImplToEventInput, EventContext, SimplifiedEvent } from '../contexts/EventContext';
import { DateTime } from 'luxon';
import EventTemplateDrawer from '../components/EventTemplateDrawer';
import { Card, } from 'react-bootstrap';
import AddEventPopover from '../components/AddEventPopover';
import EditEventPopover from '../components/EditEventPopover';
import { EventDragStartArg, EventDragStopArg, EventReceiveArg } from '@fullcalendar/interaction';
import { useKeyPress } from '../hooks/useKeyPress';

export interface ICalendarPageProps { }

export type PopoverMode = 'add' | 'add-template' | 'edit' | 'edit-template' | 'none';

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, isCurrentlyLoading, loadEvents, deleteEvent, editEvent, addEvent } = useContext(GCalContext);
    const { currentEvents, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent } = useContext(EventContext);
    const [selectedColor, setSelectedColor] = useState<number>(0);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [selectedEventTemplate, setSelectedEventTemplate] = useState<SimplifiedEvent | undefined>(undefined);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [lockShortcuts, setLockShortcuts] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [shouldReloadTemplates, setShouldReloadTemplates] = useState(false);
    const [popoverMode, setPopoverMode] = useState<PopoverMode>('none');
    const [date, setDate] = useState(DateTime.now());

    const isRightArrowKeyPressed = useKeyPress('ArrowRight');
    const isLeftArrowKeyPressed = useKeyPress('ArrowLeft');

    useEffect(() => {
        if (isLeftArrowKeyPressed && !lockShortcuts) {
            if (isCurrentlyLoading) return;

            const prevWeek = date.minus({ weeks: 1 });
            setDate(prevWeek);
            loadEvents(prevWeek);
            (document.getElementsByClassName('fc-prev-button')[0] as HTMLButtonElement)?.click();
        }
    }, [isLeftArrowKeyPressed]);

    useEffect(() => {
        if (isRightArrowKeyPressed && !lockShortcuts) {
            if (isCurrentlyLoading) return;

            const nextWeek = date.plus({ weeks: 1 });
            setDate(nextWeek);
            loadEvents(nextWeek);
            (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement)?.click();
        }
    }, [isRightArrowKeyPressed]);

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents(date);
    }, []);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();

        switch (toolbarMode) {
            case 'none':
                if (popoverMode === 'none') {
                    setCurrentEvents([convertEventImplToEventInput(info.event)]);
                    setLockShortcuts(true);
                    setPopoverMode('edit');
                    setPopoverOpen(true);
                    break;
                }
                break;
            case 'select':
                if (currentEvents.filter((e) => e.id === info.event.id).length > 0) {
                    setRemoveCurrentEvent(convertEventImplToEventInput(info.event));
                    break;
                }
                setAddCurrentEvent(convertEventImplToEventInput(info.event));
                break;
            case 'duplicate':
                addEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: colorMap.indexOf(info.event.backgroundColor) === -1 ? 0 : colorMap.indexOf(info.event.backgroundColor),
                    extendedProps: {
                        ...info.event.extendedProps,
                        description: info.event.extendedProps?.description,
                    },
                }, info.event.allDay)
                break;
            case 'delete':
                deleteEvent(info.event.id)
                break;
            case 'color':
                editEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: selectedColor,
                    extendedProps: {
                        ...info.event.extendedProps,
                        description: info.event.extendedProps?.description,
                    },

                }, info.event.id, info.event.allDay)
                break;
        }
    }

    function getCorrectPopoverDisplay(popoverMode: PopoverMode) {
        switch (popoverMode) {
            case 'add':
            case 'add-template':
                let isAllDay = undefined;
                if (selectedStartDate && selectedEndDate) {
                    const start = DateTime.fromJSDate(selectedStartDate);
                    const end = DateTime.fromJSDate(selectedEndDate);

                    isAllDay = start.toFormat('HH:mm') === end.toFormat('HH:mm');
                }

                return (
                    <AddEventPopover
                        popoverMode={popoverMode}
                        selectedColor={selectedColor}
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        isAllDay={isAllDay}
                        closePopover={() => {
                            if (popoverMode === 'add-template') {
                                setShouldReloadTemplates(true);
                            }
                            setSelectedStartDate(undefined);
                            setSelectedEndDate(undefined);
                            setPopoverMode('none');
                            setPopoverOpen(false);
                            setLockShortcuts(false);
                        }}
                    />
                );
            case 'edit-template':
            case 'edit':
                return (
                    <EditEventPopover
                        selectedEventTemplate={selectedEventTemplate}
                        popoverMode={popoverMode}
                        reloadTemplates={() => { setShouldReloadTemplates(true) }}
                        closePopover={() => {
                            setPopoverMode('none');
                            setPopoverOpen(false);
                            setLockShortcuts(false);
                            setSelectedEventTemplate(undefined);
                        }}
                    />
                );

            case 'none':
                return <Card className={['popover', 'none-popover'].join(' ')}>
                    Why is this open?
                </Card>
        }
    }

    function eventChange(info: EventChangeArg) {
        const isAllDay = info.event.allDay;

        editEvent({
            title: info.event.title,
            start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
            end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
            colorId: colorMap.indexOf(info.event.backgroundColor) === -1 ? 0 : colorMap.indexOf(info.event.backgroundColor),
            extendedProps: {
                ...info.event.extendedProps,
                description: info.event.extendedProps?.description,
            },
        }, info.event.id, isAllDay)
    }

    function select(info: DateSelectArg) {
        setSelectedStartDate(info.start);
        setSelectedEndDate(info.end);
        setPopoverMode('add');
        setLockShortcuts(true);
        setPopoverOpen(true);
    }

    function eventDragStart(info: EventDragStartArg) {
        setIsDragging(true);
    }

    function eventDragStop(info: EventDragStopArg) {
        setIsDragging(false);
    }

    const handleEventReceive = (info: EventReceiveArg) => {
        const droppedEvent = info.event;
        addEvent({
            title: droppedEvent.title,
            start: DateTime.fromJSDate(droppedEvent.start ? droppedEvent.start : DateTime.now().toJSDate()),
            end: DateTime.fromJSDate(droppedEvent.end ? droppedEvent.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
            colorId: colorMap.indexOf(droppedEvent.backgroundColor) === -1 ? 0 : colorMap.indexOf(droppedEvent.backgroundColor),
            extendedProps: {
                ...droppedEvent.extendedProps,
                description: droppedEvent.extendedProps?.description,
            },
        }, droppedEvent.allDay);
    };

    return (
        <>
            {areEventsLoaded
                ? <div className={'fcPage'}>
                    < ToolBarDrawer
                        selectedMode={toolbarMode}
                        selectedColor={selectedColor}
                        lockShortcuts={lockShortcuts}
                        selectColor={(colorId: number) => {
                            setSelectedColor(colorId);
                        }
                        }
                        onAddClick={() => {
                            setPopoverMode('add');
                            setLockShortcuts(true);
                            setPopoverOpen(true);
                        }}
                        onModeChange={(mode) => {
                            setToolbarMode(toolbarMode === mode ? 'none' : mode);
                        }}
                        onTodayClick={() => {
                            if (isCurrentlyLoading) return;

                            const currentWeek = DateTime.now();
                            setDate(currentWeek);
                            loadEvents(currentWeek);
                            (document.getElementsByClassName('fc-today-button')[0] as HTMLButtonElement).click();
                        }}
                    />
                    < div className='calendar-container' >
                        <div
                            className='calendar-left-button calendar-nav-button'
                            onMouseEnter={() => {
                                if (isDragging && !isCurrentlyLoading) {

                                    const prevWeek = date.minus({ weeks: 1 });
                                    setDate(prevWeek);
                                    loadEvents(prevWeek);
                                    (document.getElementsByClassName('fc-prev-button')[0] as HTMLButtonElement)?.click();
                                }
                            }}
                            onClick={() => {
                                if (isCurrentlyLoading) return;

                                const prevWeek = date.minus({ weeks: 1 });
                                setDate(prevWeek);
                                loadEvents(prevWeek);
                                (document.getElementsByClassName('fc-prev-button')[0] as HTMLButtonElement)?.click();
                            }}
                        >
                            <i className='bi-chevron-double-left'></i>
                        </div>

                        <FullCalendar {...generateFCConfig({
                            events,
                            eventClick,
                            eventChange,
                            eventDragStart,
                            eventDragStop,
                            eventReceive: handleEventReceive,
                            select,
                            date
                        })}
                        />

                        <div
                            className='calendar-right-button calendar-nav-button'
                            onMouseEnter={() => {

                                if (isDragging && !isCurrentlyLoading) {
                                    const nextWeek = date.plus({ weeks: 1 });
                                    setDate(nextWeek);
                                    loadEvents(nextWeek);
                                    (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement).click();
                                }
                            }}
                            onClick={() => {
                                if (isCurrentlyLoading) return;
                                const nextWeek = date.plus({ weeks: 1 });
                                setDate(nextWeek);
                                loadEvents(nextWeek);
                                (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement).click();
                            }}
                        >
                            <i className='bi-chevron-double-right'></i>
                        </div>

                    </div >
                    <EventTemplateDrawer
                        shouldReload={shouldReloadTemplates}
                        confirmReload={() => { setShouldReloadTemplates(false) }}
                        onAddClick={() => {
                            setPopoverMode('add-template');
                            setLockShortcuts(true);
                            setPopoverOpen(true);
                        }}
                        onEditClick={(eventTemplate: SimplifiedEvent) => {
                            console.log(eventTemplate);
                            setPopoverMode('edit-template');
                            setSelectedEventTemplate(eventTemplate);
                            setLockShortcuts(true);
                            setPopoverOpen(true);
                        }}
                    />
                    {
                        popoverOpen && (
                            <Popup
                                onClose={() => {
                                    setCurrentEvents([]);
                                    setPopoverMode('none');
                                    setPopoverOpen(false)
                                    setLockShortcuts(false);
                                }}
                                open={popoverOpen}
                                modal
                            >
                                {getCorrectPopoverDisplay(popoverMode)}
                            </Popup>
                        )
                    }
                </div >
                : <div>Loading...</div>
            }
        </>
    );
};

export default CalendarPage;
