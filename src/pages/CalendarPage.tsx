import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventChangeArg, EventClickArg } from '@fullcalendar/core';
import { EventDragStartArg, EventDragStopArg, EventReceiveArg } from '@fullcalendar/interaction';
import { useContext, useEffect, useState } from 'react';
import { Card, } from 'react-bootstrap';
import { DateTime } from 'luxon';
import Popup from 'reactjs-popup';

import { generateFCConfig } from '../handlers/fullCalendarConfigHandler';
import ToolBarDrawer, { ToolbarMode } from '../components/Drawers/ToolBarDrawer';
import { convertEventImplToEventInput, EventContext, SimplifiedEvent } from '../contexts/EventContext';
import EventTemplateDrawer from '../components/Drawers/EventTemplateDrawer';
import AddEventPopover from '../components/Popovers/AddEventPopover';
import EditEventPopover from '../components/Popovers/EditEventPopover';
import { useKeyPress } from '../hooks/useKeyPress';
import { GCalContext } from '../contexts/GCalContext';
import { defaultColorId, getColorIdFromColor } from '../components/ColorSelector';
import { KeyboardShortcutContext } from '../contexts/KeyboardShortcutContext';

export interface ICalendarPageProps { }

export type PopoverMode = 'add' | 'add-template' | 'edit' | 'edit-template' | 'none';

function CalendarPage(props: ICalendarPageProps) {
    const { setShortcutsEnabled } = useContext(KeyboardShortcutContext);

    const { isCurrentlyLoading, loadEvents, deleteEvent, editEvent, addEvent } = useContext(GCalContext);
    const { events, date, setDate, setCurrentEvents } = useContext(EventContext);
    const [selectedColor, setSelectedColor] = useState<number>(defaultColorId);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [selectedEventTemplate, setSelectedEventTemplate] = useState<SimplifiedEvent | undefined>(undefined);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [shouldReloadTemplates, setShouldReloadTemplates] = useState(false);
    const [popoverMode, setPopoverMode] = useState<PopoverMode>('none');

    const isRightArrowKeyPressed = useKeyPress('ArrowRight');
    const isLeftArrowKeyPressed = useKeyPress('ArrowLeft');

    useEffect(() => {
        if (isLeftArrowKeyPressed) {
            if (isCurrentlyLoading) return;

            const prevWeek = date.minus({ weeks: 1 });
            setDate(prevWeek);
            loadEvents(prevWeek);
            (document.getElementsByClassName('fc-prev-button')[0] as HTMLButtonElement)?.click();
        }
    }, [isLeftArrowKeyPressed]);

    useEffect(() => {
        if (isRightArrowKeyPressed) {
            if (isCurrentlyLoading) return;

            const nextWeek = date.plus({ weeks: 1 });
            setDate(nextWeek);
            loadEvents(nextWeek);
            (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement)?.click();
        }
    }, [isRightArrowKeyPressed]);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();
        const colorId = getColorIdFromColor(info.event.backgroundColor);

        if (info.event.extendedProps?.isTask) {

            return;
        }

        switch (toolbarMode) {
            case 'none':
                if (popoverMode === 'none') {
                    setCurrentEvents([convertEventImplToEventInput(info.event)]);
                    setShortcutsEnabled(false);
                    setPopoverMode('edit');
                    setPopoverOpen(true);
                    break;
                }
                break;
            case 'duplicate':
                addEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: colorId,
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
                            setShortcutsEnabled(true);
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
                            setShortcutsEnabled(true);
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
            colorId: getColorIdFromColor(info.event.backgroundColor),
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
        setShortcutsEnabled(false);
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
            colorId: getColorIdFromColor(droppedEvent.backgroundColor),
            extendedProps: {
                ...droppedEvent.extendedProps,
                description: droppedEvent.extendedProps?.description,
            },
        }, droppedEvent.allDay);
    };

    function switchWeek(direction: 'prev' | 'next' | 'today') {
        if (isCurrentlyLoading) return;
        const newWeek = direction === 'today'
            ? DateTime.now()
            : date.plus({ weeks: direction === 'prev' ? -1 : 1 });

        setDate(newWeek);
        loadEvents(newWeek);

        if (direction === 'today') {
            (document.getElementsByClassName('fc-today-button')[0] as HTMLButtonElement).click();
            return;
        }
        (document.getElementsByClassName(`fc-${direction}-button`)[0] as HTMLButtonElement).click();
    }

    return (<div className={'fcPage'}>
        < ToolBarDrawer
            selectedMode={toolbarMode}
            selectedColor={selectedColor}
            selectColor={(colorId: number) => {
                setSelectedColor(colorId);
            }
            }
            onAddClick={() => {
                setPopoverMode('add');
                setShortcutsEnabled(false);
                setPopoverOpen(true);
            }}
            onModeChange={(mode) => {
                setToolbarMode(toolbarMode === mode ? 'none' : mode);
            }}
            onPrevWeekClick={() => {
                switchWeek('prev');
            }}
            onNextWeekClick={() => {
                switchWeek('next');
            }}
            onTodayClick={() => {
                switchWeek('today');
            }}
        />
        < div className='calendar-container' >
            <div
                className='calendar-left-button calendar-nav-button'
                onMouseEnter={() => {
                    if (isDragging && !isCurrentlyLoading) {
                        switchWeek('prev');
                    }
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
                        switchWeek('next');
                    }
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
                setShortcutsEnabled(false);
                setPopoverOpen(true);
            }}
            onEditClick={(eventTemplate: SimplifiedEvent) => {
                setPopoverMode('edit-template');
                setSelectedEventTemplate(eventTemplate);
                setShortcutsEnabled(false);
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
                        setShortcutsEnabled(true);
                    }}
                    open={popoverOpen}
                    modal
                >
                    {getCorrectPopoverDisplay(popoverMode)}
                </Popup>
            )
        }
    </div >
    );
};

export default CalendarPage;
