import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { useContext, useEffect, useState } from 'react';
import { colorMap, GCalContext } from '../contexts/GCalContext';

import { generateFCConfig } from '../handlers/fullCalendarConfigHandler';
import { DateSelectArg, EventAddArg, EventChangeArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import Popup from 'reactjs-popup';
import ToolBarDrawer, { ToolbarMode } from '../components/ToolBarDrawer';
import { EventContext } from '../contexts/EventContext';
import { DateTime } from 'luxon';
import EventTemplateDrawer from '../components/EventTemplateDrawer';
import { Card, } from 'react-bootstrap';
import AddEventPopover from '../components/AddEventPopover';
import EditEventPopover from '../components/EditEventPopover';
import { EventDragStopArg, EventResizeStopArg } from '@fullcalendar/interaction';

export interface ICalendarPageProps { }

export type PopoverMode = 'add' | 'add-template' | 'edit' | 'none';

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, isCurrentlyLoading, loadEvents, deleteEvent, editEvent, addEvent } = useContext(GCalContext);
    const { currentEvents, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent } = useContext(EventContext);
    const [selectedColor, setSelectedColor] = useState<number>(0);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverMode, setPopoverMode] = useState<PopoverMode>('none');
    const [date, setDate] = useState(DateTime.now());

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents(date);
    }, []);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();

        switch (toolbarMode) {
            case 'none':
                if (popoverMode === 'none') {
                    setCurrentEvents([info.event]);
                    setPopoverMode('edit');
                    setPopoverOpen(true);
                    break;
                }
                break;
            case 'select':
                if (currentEvents.filter((e) => e.id === info.event.id).length > 0) {
                    setRemoveCurrentEvent(info.event);
                    break;
                }
                setAddCurrentEvent(info.event);
                break;
            case 'duplicate':
                setAddCurrentEvent(info.event);
                addEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: colorMap.indexOf(info.event.backgroundColor) === -1 ? 0 : colorMap.indexOf(info.event.backgroundColor),
                    extendedProps: {
                        ...info.event.extendedProps,
                        description: info.event.extendedProps?.description,
                    },
                }, info.event.allDay).then(_ => {
                    setRemoveCurrentEvent(info.event);
                });
                break;
            case 'delete':
                setAddCurrentEvent(info.event);
                deleteEvent(info.event.id).then(_ => {
                    setRemoveCurrentEvent(info.event);
                });
                break;
            case 'color':
                setAddCurrentEvent(info.event);
                editEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: selectedColor,
                    extendedProps: {
                        ...info.event.extendedProps,
                        description: info.event.extendedProps?.description,
                    },

                }, info.event.id, info.event.allDay).then(_ => {
                    setRemoveCurrentEvent(info.event);
                });
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
                        startDate={selectedStartDate}
                        endDate={selectedEndDate}
                        isAllDay={isAllDay}
                        closePopover={() => {
                            setSelectedStartDate(undefined);
                            setSelectedEndDate(undefined);
                            setPopoverMode('none');
                            setPopoverOpen(false);
                        }}
                    />
                );
            case 'edit':
                return (
                    <EditEventPopover
                        closePopover={() => {
                            setPopoverMode('none');
                            setPopoverOpen(false);
                        }}
                    />
                );

            case 'none':
                return <Card className={['popover', 'none-popover'].join(' ')}>
                    Why is this open?
                </Card>
        }
    }

    function eventAdd(info: EventAddArg) {
        setAddCurrentEvent(info.event);
        console.log('ADD:', info.event);
    }

    function eventResizeStop(info: EventResizeStopArg) {
        console.log('RESIZE:', info.event);
    }

    function eventChange(info: EventChangeArg) {
        setAddCurrentEvent(info.event);
        editEvent({
            title: info.event.title,
            start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
            end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
            colorId: colorMap.indexOf(info.event.backgroundColor) === -1 ? 0 : colorMap.indexOf(info.event.backgroundColor),
            extendedProps: {
                ...info.event.extendedProps,
                description: info.event.extendedProps?.description,
            },
        }, info.event.id).then(_ => {
            setRemoveCurrentEvent(info.event);
        });
    }

    function eventDragStop(info: EventDragStopArg) {
        console.log('DRAG:', info.event);
    }

    function eventDrop(info: EventDropArg) {
        console.log('DROP:', info.event);
    }

    function select(info: DateSelectArg) {
        setSelectedStartDate(info.start);
        setSelectedEndDate(info.end);
        setPopoverMode('add');
        setPopoverOpen(true);
    }

    return (
        <div className={'fcPage'}>
            <ToolBarDrawer
                selectedMode={toolbarMode}
                selectedColor={selectedColor}
                selectColor={(colorId: number) => {
                    setSelectedColor(colorId);
                }}
                onAddClick={() => {
                    setPopoverMode('add');
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
            <div className='calendar-container'>
                <div className='calendar-left-button calendar-nav-button' onClick={() => {
                    if (isCurrentlyLoading) return;

                    const prevWeek = date.minus({ weeks: 1 });
                    setDate(prevWeek);
                    loadEvents(prevWeek);
                    (document.getElementsByClassName('fc-prev-button')[0] as HTMLButtonElement)?.click();
                }}>
                    <i className='bi-chevron-double-left'></i>
                </div>
                {
                    areEventsLoaded
                        ? <FullCalendar {...generateFCConfig({
                            events,
                            eventClick,
                            eventAdd,
                            eventResizeStop,
                            eventChange,
                            eventDrop,
                            eventDragStop,
                            select,
                            date
                        })}
                        />
                        : <div>Loading...</div>
                }
                <div className='calendar-right-button calendar-nav-button' onClick={() => {
                    if (isCurrentlyLoading) return;
                    const nextWeek = date.plus({ weeks: 1 });
                    setDate(nextWeek);
                    loadEvents(nextWeek);
                    (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement).click();
                }}>
                    <i className='bi-chevron-double-right'></i>
                </div>

            </div>
            <EventTemplateDrawer onAddClick={() => {
                setPopoverMode('add-template');
                setPopoverOpen(true);
            }} />
            {popoverOpen && (
                <Popup
                    onClose={() => {
                        setCurrentEvents([]);
                        setPopoverMode('none');
                        setPopoverOpen(false)
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
