// DraggableEvent.tsx
import React, { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import './DraggableEvent.css';
import { colorMap } from '../contexts/GCalContext';
import { DateTime } from 'luxon';
import { SimplifiedEvent } from '../contexts/EventContext';

interface DraggableEventProps {
    eventTemplate: SimplifiedEvent;
    onClick?: () => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ eventTemplate, onClick }) => {
    const eventRef = useRef<HTMLDivElement>(null);
    const durationInMinutes = DateTime.fromISO(eventTemplate.end).diff(DateTime.fromISO(eventTemplate.start)).as('minutes');
    const durationInHours = durationInMinutes / 60;

    useEffect(() => {
        const element = eventRef.current;

        if (element) {
            const draggable = new Draggable(element, {
                eventData: {
                    title: eventTemplate.title,
                    duration: { minutes: durationInMinutes },
                    allday: eventTemplate.allDay,
                    backgroundColor: colorMap[eventTemplate.colorId],
                    borderColor: colorMap[eventTemplate.colorId],
                    extendedProps: {
                        description: eventTemplate.description,
                    },
                },
            });

            return () => {
                draggable.destroy();
            };
        }
    }, [eventTemplate]);

    return (
        <div ref={eventRef}
            className="draggable-event fc-event"
            style={{ backgroundColor: colorMap[eventTemplate.colorId] }}
            onClick={() => { onClick && onClick() }}
        >
            {durationInHours}h - {eventTemplate.title}
        </div>
    );
};

export default DraggableEvent;
