import './CalendarPage.css';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateTime } from 'luxon';
import { useContext, useEffect, useState } from 'react';
import { GCalContext } from '../contexts/GCalContext';

interface ICalendarPageProps { }

function CalendarPage(props: ICalendarPageProps) {
    const { isLoggedIn, areEventsLoaded, events, loadEvents, } = useContext(GCalContext);

    useEffect(() => {
        if (areEventsLoaded && isLoggedIn) return;
        loadEvents();
    }, []);

    return (
        <div className={'fcPage'}>
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
                        eventColor='#b74f4f'
                        initialDate={DateTime.now().toFormat('yyyy-MM-dd')}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        selectOverlap={true}
                        eventOverlap={true}
                        firstDay={1}
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
        </div>
    );
};

export default CalendarPage;
