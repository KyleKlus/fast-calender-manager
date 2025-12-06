import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventChangeArg, EventClickArg } from '@fullcalendar/core';
import { EventDragStartArg, EventDragStopArg, EventReceiveArg } from '@fullcalendar/interaction';
import { useContext, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';

import { getDefaultConfig } from '../handlers/defaultFCConfig';
import EventTemplateDrawer, { ToolbarMode } from '../components/Drawers/EventTemplateDrawer';
import AddEventPopover from '../components/Popovers/AddEventPopover';
import EditEventPopover from '../components/Popovers/EditEventPopover';
import { defaultColorId, getColorIdFromColor } from '../components/ColorSelector';
import { KeyboardShortcutContext } from '../contexts/KeyboardShortcutContext';
import { EventContext } from '../contexts/EventContext';
import { SimplifiedEvent, convertEventImplToEventInput } from '../handlers/eventConverters';
import { TemplateContext } from '../contexts/TemplateContext';
import { WeatherContext } from '../contexts/WeatherContext';
import { DateInViewContext } from '../contexts/DateInViewContext';

export interface ICalendarPageProps { }

/**
 * PopoverMode type
 *
 * This type represents the different modes of the popover, which determines what content is shown in the popover.
 */
export type PopoverMode = 'add' | 'add-template' | 'edit' | 'edit-template' | 'none';

/**
 * CalendarPage Component
 *
 * This component is responsible for rendering the calendar and handling all user interactions.
 *
 * @param props
 * @returns
 */
function CalendarPage(props: ICalendarPageProps) {
    const { setShortcutsEnabled } = useContext(KeyboardShortcutContext);
    const { selectedTemplate, setSelectedTemplate, getTemplateDuration } = useContext(TemplateContext);
    const { hourlyWeather, insertWeather, showWeather } = useContext(WeatherContext);
    const { events, isCurrentlyLoading, removeEvent, editEvent, addEvent, switchWeek, splitEvent, setSelectedEvents } = useContext(EventContext);
    const { dateInView } = useContext(DateInViewContext);

    const [selectedColor, setSelectedColor] = useState<number>(defaultColorId);

    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);

    const [popoverMode, setPopoverMode] = useState<PopoverMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');

    const [showAddPopoverWithTemplate, setShowAddPopoverWithTemplate] = useState(false);

    const pendingNextWeekSwitch = useRef(undefined as NodeJS.Timeout | undefined);
    const pendingPrevWeekSwitch = useRef(undefined as NodeJS.Timeout | undefined);

    useEffect(() => {
        // Done in this way, because one cant modify the calendar in any other way
        if (hourlyWeather.length > 0) {
            insertWeather()
        }
    }, []);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();

        if (showWeather) { return } // Disables all interactions when weather is shown
        const colorId = getColorIdFromColor(info.event.backgroundColor);

        // Opens the google task list if the event is a task
        if (info.event.extendedProps?.isTask) {
            window.open('https://calendar.google.com/calendar/u/0/r/tasks', '_blank');
            return;
        }

        // Handles all modes, which are selected from the toolbar
        switch (toolbarMode) {
            case 'none':
                if (popoverMode === 'none') {
                    setSelectedEvents([convertEventImplToEventInput(info.event)]);
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
                removeEvent(info.event.id)
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
        if (showWeather) { return } // Disables all interactions when weather is shown

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

    const eventReceive = (info: EventReceiveArg) => {
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

    return (
        <div className={['calendar-page', showWeather ? 'show-weather' : '', `toolbar-mode-${toolbarMode}`].join(' ')}>
            <div className='calendar-container' >
                {isDragging &&
                    <div
                        className='calendar-nav-button left'
                        onMouseLeave={() => {
                            if (pendingPrevWeekSwitch.current !== undefined) {
                                clearTimeout(pendingPrevWeekSwitch.current);
                                pendingPrevWeekSwitch.current = undefined;
                            }
                        }}
                        onMouseEnter={() => {
                            if (isDragging && !isCurrentlyLoading) {
                                pendingPrevWeekSwitch.current = setTimeout(() => {
                                    switchWeek('prev');
                                    pendingPrevWeekSwitch.current = undefined;
                                }, 1000);
                            }
                        }}
                    >
                        <i className='bi-chevron-double-left' />
                    </div>
                }
                <FullCalendar {...getDefaultConfig()}
                    events={events}
                    eventClick={eventClick}
                    eventChange={eventChange}
                    eventDragStart={eventDragStart}
                    eventDragStop={eventDragStop}
                    eventReceive={eventReceive}
                    select={select}
                    initialDate={dateInView.toFormat('yyyy-MM-dd')}
                />
                {isDragging &&
                    <div
                        className='calendar-nav-button right'
                        onMouseLeave={() => {
                            if (pendingNextWeekSwitch.current !== undefined) {
                                clearTimeout(pendingNextWeekSwitch.current);
                                pendingNextWeekSwitch.current = undefined;
                            }
                        }}
                        onMouseEnter={() => {
                            if (isDragging && !isCurrentlyLoading) {
                                pendingNextWeekSwitch.current = setTimeout(() => {
                                    switchWeek('next');
                                    pendingNextWeekSwitch.current = undefined;
                                }, 1000);
                            }
                        }}
                    >
                        <i className='bi-chevron-double-right' />
                    </div>
                }
            </div >
            {/* Also a toolbar now */}
            <EventTemplateDrawer
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
                    if (toolbarMode === 'paste-template') {
                        setSelectedTemplate({ template: null, index: -1 });
                    }
                    setToolbarMode(toolbarMode === mode ? 'none' : mode);
                }}
                onAddTemplateClick={() => {
                    setPopoverMode('add-template');
                    setShortcutsEnabled(false);
                    setPopoverOpen(true);
                }}
                onEditTemplateClick={(eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => {
                    const newTemplate = { template: eventTemplate, index: eventTemplateIndex }
                    setSelectedTemplate(newTemplate);
                    setPopoverMode('edit-template');
                    setShortcutsEnabled(false);
                    setPopoverOpen(true);
                }}
            />
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
