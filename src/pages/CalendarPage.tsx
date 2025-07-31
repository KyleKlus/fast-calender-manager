import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import { useContext, useEffect, useState } from 'react';
import { GCalContext } from '../contexts/GCalContext';

import { generateFCConfig } from '../handlers/fullCalendarConfigHandler';
import { EventClickArg } from '@fullcalendar/core';
import Popup from 'reactjs-popup';
import ToolBarDrawer, { ToolbarMode } from '../components/ToolBarDrawer';
import { EventContext } from '../contexts/EventContext';

interface ICalendarPageProps { }

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, loadEvents, } = useContext(GCalContext);
    const { currentEvent, setCurrentEvent } = useContext(EventContext);
    const [toolbarMode, setToolbarMode] = useState<ToolbarMode>('none');
    const [popoverOpen, setPopoverOpen] = useState(false);

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
            />
            <div className='calendar-container'>
                {
                    areEventsLoaded
                        ? <FullCalendar {...generateFCConfig({
                            events,
                            eventClick,
                        })} />
                        : <div>Loading...</div>
                }
            </div>
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
