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

interface ICalendarPageProps { }

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, loadEvents, } = useContext(GCalContext);
    const { currentEvent, setCurrentEvent } = useContext(EventContext);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [date, setDate] = useState(DateTime.now());

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents();
    }, []);

    function eventClick(info: EventClickArg) {
        info.jsEvent.preventDefault();
        setCurrentEvent(info.event);
        setPopoverOpen(true);
    }

    return (
        <div className={'fcPage'}>
            <ToolBarDrawer
                selectedMode={toolbarMode}
                onModeChange={(mode) => setToolbarMode(mode)}
                onTodayClick={() => {
                    setDate(DateTime.now());
                    (document.getElementsByClassName('fc-today-button')[0] as HTMLButtonElement).click();
                }}
            />
            <div className='calendar-container'>
                <div className='calendar-left-button calendar-nav-button' onClick={() => {
                    setDate(date.minus({ weeks: 1 }));
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
                    setDate(date.plus({ weeks: 1 }));
                    (document.getElementsByClassName('fc-next-button')[0] as HTMLButtonElement).click();
                }}>
                    <i className='bi-chevron-double-right'></i>
                </div>

            </div>
            <EventTemplateDrawer />
            {popoverOpen && (
                <Popup
                    onClose={() => setPopoverOpen(false)}
                    open={popoverOpen}
                    modal
                >
                    <div style={{ backgroundColor: '#dddd' }}>
                        <div>
                            <div>{currentEvent?.title}</div>
                            <button onClick={() => setPopoverOpen(false)}>close</button>
                        </div>
                        <div>{currentEvent?.title}</div>
                        <div>{currentEvent?.extendedProps?.description}</div>

                    </div>
                </Popup>
            )}
        </div>
    );
};

export default CalendarPage;
