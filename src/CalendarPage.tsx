import './App.css';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { DateTime } from 'luxon';
import { useContext, useEffect, useState } from 'react';
import { GCalContext } from './GCalContext';

interface ICalendarPageProps { }

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, events, loadEvents } = useContext(GCalContext);
    const [areEventsLoaded, setAreEventsLoaded] = useState(false);

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents();
        setAreEventsLoaded(true);
    }, []);

    return (
        <>
            {
                areEventsLoaded
                    ? <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        customButtons={{
                            addEventButton: {
                                text: 'Add Event',
                                click: () => alert('Custom button clicked!'),

                            },
                            selectRangeButton: {
                                text: 'Select Range',
                                click: () => alert('Custom button clicked!'),

                            },
                        }
                        }
                        headerToolbar={{
                            right: 'addEventButton selectRangeButton',
                            center: 'title',
                            left: 'prev,today,next',
                        }
                        }
                        initialDate={DateTime.now().toFormat('yyyy-MM-dd')}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        selectOverlap={true}
                        eventOverlap={true}
                        events={events}
                        locale={'de'}
                        nowIndicator={true}
                        droppable={true}
                        dragScroll={true}
                        snapDuration={'00:15:00'}
                        slotDuration={'00:15:00'}
                    />
                    : <div>Loading...</div>
            }
        </>
    );
};

export default CalendarPage;
