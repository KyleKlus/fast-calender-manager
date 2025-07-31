import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { useContext, useEffect, useState } from 'react';
import { GCalContext } from '../contexts/GCalContext';

import { generateFCConfig } from '../handlers/fullCalendarConfigHandler';
import { EventClickArg } from '@fullcalendar/core';
import Popup from 'reactjs-popup';
import ToolBarDrawer, { ToolbarMode } from '../components/ToolBarDrawer';
import { EventContext } from '../contexts/EventContext';
import { DateTime } from 'luxon';
import EventTemplateDrawer from '../components/EventTemplateDrawer';
import { Button, Card, Form, FormText } from 'react-bootstrap';
import AddEventPopover from '../components/AddEventPopover';

export interface ICalendarPageProps { }

export type PopoverMode = 'add' | 'add-template' | 'edit' | 'none';

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, isCurrentlyLoading, loadEvents, } = useContext(GCalContext);
    const { currentEvents, setCurrentEvents, setAddCurrentEvent, setRemoveCurrentEvent } = useContext(EventContext);
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
                    setAddCurrentEvent(info.event);
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
                // TODO: duplicate event
                setRemoveCurrentEvent(info.event);
                break;
            case 'delete':
                setAddCurrentEvent(info.event);
                // TODO: delete event
                setRemoveCurrentEvent(info.event);
                break;
            case 'color':
                setAddCurrentEvent(info.event);
                // TODO: delete event
                setRemoveCurrentEvent(info.event);
                break;
        }
    }

    function getCorrectPopoverDisplay(popoverMode: PopoverMode) {
        switch (popoverMode) {
            case 'add':
            case 'add-template':
                return (
                    <AddEventPopover
                        popoverMode={popoverMode}
                        closePopover={() => {
                            setPopoverMode('none');
                            setPopoverOpen(false);
                        }}
                    />
                );
            case 'edit':
                return <Card className={['popover', 'edit-event-popover'].join(' ')}>
                    Edit
                </Card>
            case 'none':
                return <Card className={['popover', 'none-popover'].join(' ')}>
                    Why is this open?
                </Card>
        }
    }

    return (
        <div className={'fcPage'}>
            <ToolBarDrawer
                selectedMode={toolbarMode}
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
                    onClose={() => setPopoverOpen(false)}
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
