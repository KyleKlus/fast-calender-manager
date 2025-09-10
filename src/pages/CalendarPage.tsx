import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventChangeArg, EventClickArg } from '@fullcalendar/core';
import { EventDragStartArg, EventDragStopArg, EventReceiveArg } from '@fullcalendar/interaction';
import { useContext, useEffect, useState } from 'react';
import { DateTime } from 'luxon';

import { getDefaultConfig } from '../handlers/defaultFCConfig';
import ToolBarDrawer, { ToolbarMode } from '../components/Drawers/ToolBarDrawer';
import EventTemplateDrawer from '../components/Drawers/EventTemplateDrawer';
import AddEventPopover from '../components/Popovers/AddEventPopover';
import EditEventPopover from '../components/Popovers/EditEventPopover';
import { GCalContext } from '../contexts/GCalContext';
import { defaultColorId, getColorIdFromColor } from '../components/ColorSelector';
import { KeyboardShortcutContext } from '../contexts/KeyboardShortcutContext';
import { EventContext } from '../contexts/EventContext';
import { SimplifiedEvent, convertEventImplToEventInput } from '../handlers/eventConverters';
import { TemplateContext } from '../contexts/TemplateContext';
import { WeatherContext } from '../contexts/WeatherContext';
import { DateInViewContext } from '../contexts/DateInViewContext';

export interface ICalendarPageProps { }

export type PopoverMode = 'add' | 'add-template' | 'edit' | 'edit-template' | 'none';

function CalendarPage(props: ICalendarPageProps) {
    const { setShortcutsEnabled } = useContext(KeyboardShortcutContext);
    const { selectedTemplate, setSelectedTemplate, getTemplateDuration } = useContext(TemplateContext);
    const { hourlyWeather, insertWeather, showWeather } = useContext(WeatherContext);

    const { isCurrentlyLoading, deleteEvent, editEvent, addEvent, switchWeek, splitEvent } = useContext(GCalContext);
    const { events, setSelectedEvents: setCurrentEvents } = useContext(EventContext);
    const { dateInView } = useContext(DateInViewContext);
    const [selectedColor, setSelectedColor] = useState<number>(defaultColorId);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [popoverMode, setPopoverMode] = useState<PopoverMode>('none');

    const [showAddPopoverWithTemplate, setShowAddPopoverWithTemplate] = useState(false);

    useEffect(() => {
        if (hourlyWeather.length > 0) {
            insertWeather()
        }
    }, []);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();
        if (showWeather) { return }
        const colorId = getColorIdFromColor(info.event.backgroundColor);

        if (info.event.extendedProps?.isTask) {
            window.open('https://calendar.google.com/calendar/u/0/r/tasks', '_blank');
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
            case 'split':
                splitEvent({
                    title: info.event.title,
                    start: DateTime.fromJSDate(info.event.start ? info.event.start : DateTime.now().toJSDate()),
                    end: DateTime.fromJSDate(info.event.end ? info.event.end : DateTime.now().plus({ hour: 1 }).toJSDate()),
                    colorId: colorId,
                    extendedProps: {
                        ...info.event.extendedProps,
                        description: info.event.extendedProps?.description,
                    },

                }, info.event.id, info.event.allDay)
        }
    }

    function eventChange(info: EventChangeArg) {
        if (showWeather) { return }

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
        if (showWeather) { return }

        if (!showAddPopoverWithTemplate && selectedTemplate.template !== null) {
            const start = DateTime.fromJSDate(info.start);
            const duration = getTemplateDuration(selectedTemplate.template);
            const end = DateTime.fromJSDate(info.start).plus({ minute: duration });

            const isAllDay = start.toFormat('HH:mm') === end.toFormat('HH:mm');

            addEvent({
                title: selectedTemplate.template.title,
                start: start,
                end: end,
                colorId: selectedTemplate.template.colorId,
                extendedProps: {
                    description: selectedTemplate.template.description,
                },
            }, isAllDay);
            (document.getElementsByClassName('fc')[0] as HTMLElement).click();

            return;
        }

        setSelectedStartDate(info.start);
        if (showAddPopoverWithTemplate && selectedTemplate.template !== null) {
            const duration = getTemplateDuration(selectedTemplate.template);
            const end = DateTime.fromJSDate(info.start).plus({ minute: duration });
            setSelectedEndDate(end.toJSDate());
            setSelectedColor(selectedTemplate.template.colorId);
        } else {
            setSelectedEndDate(info.end);
        }
        setPopoverMode('add');
        setShortcutsEnabled(false);
        setPopoverOpen(true);
    }

    function eventDragStart(info: EventDragStartArg) {
        if (showWeather) { return }

        setIsDragging(true);
    }

    function eventDragStop(info: EventDragStopArg) {
        if (showWeather) { return }

        setIsDragging(false);
    }

    const handleEventReceive = (info: EventReceiveArg) => {
        if (showWeather) { return }

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

    return (<div className={['fcPage', showWeather ? 'fcPageWeather' : ''].join(' ')}>
        < ToolBarDrawer
            selectedMode={toolbarMode}
            selectedColor={selectedColor}
            selectColor={(colorId: number) => {
                setSelectedColor(colorId);
            }
            }
            onAddClick={() => {
                if (showWeather) { return }
                setPopoverMode('add');
                setShortcutsEnabled(false);
                setPopoverOpen(true);
            }}
            onModeChange={(mode) => {
                setToolbarMode(toolbarMode === mode ? 'none' : mode);
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

            <FullCalendar {...getDefaultConfig()}
                events={events}
                eventClick={eventClick}
                eventChange={eventChange}
                eventDragStart={eventDragStart}
                eventDragStop={eventDragStop}
                eventReceive={handleEventReceive}
                select={select}
                initialDate={dateInView.toFormat('yyyy-MM-dd')}
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
        {/* {!showWeather && */}
        <EventTemplateDrawer
            onAddClick={() => {
                setPopoverMode('add-template');
                setShortcutsEnabled(false);
                setPopoverOpen(true);
            }}
            onEditClick={(eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => {
                const newTemplate = { template: eventTemplate, index: eventTemplateIndex }
                setSelectedTemplate(newTemplate);
                setPopoverMode('edit-template');
                setShortcutsEnabled(false);
                setPopoverOpen(true);
            }}
        />
        {/* } */}
        {popoverOpen &&
            (popoverMode === 'add-template' || popoverMode === 'add'
                ? <AddEventPopover
                    popoverMode={popoverMode}
                    open={popoverOpen}
                    selectedColor={selectedColor}
                    startDate={selectedStartDate}
                    endDate={selectedEndDate}
                    closePopover={() => {
                        setSelectedStartDate(undefined);
                        setSelectedEndDate(undefined);
                        setPopoverMode('none');
                        setPopoverOpen(false);
                        setShortcutsEnabled(true);
                    }}
                />
                : <EditEventPopover
                    open={popoverOpen}
                    popoverMode={popoverMode}
                    closePopover={() => {
                        setPopoverMode('none');
                        setPopoverOpen(false);
                        setShortcutsEnabled(true);
                    }}
                />
            )
        }
    </div >
    );
};

export default CalendarPage;
