// DraggableEvent.tsx
import React, { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import './DraggableEvent.css';
import { DateTime } from 'luxon';
import { SimplifiedEvent } from '../contexts/EventContext';
import { colorMap, getColorFromColorId } from './ColorSelector';

interface DraggableEventProps {
    eventTemplate: SimplifiedEvent;
    onClick?: () => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ eventTemplate, onClick }) => {
    const eventRef = useRef<HTMLDivElement>(null);
    const durationInMinutes = DateTime.fromISO(eventTemplate.end).diff(DateTime.fromISO(eventTemplate.start)).as('minutes');
    const durationInHours = Math.floor((durationInMinutes / 60) * 100) / 100;

    useEffect(() => {
        const element = eventRef.current;

        if (element) {
            const draggable = new Draggable(element, {
                eventData: {
                    title: eventTemplate.title,
                    duration: { minutes: durationInMinutes },
                    allday: eventTemplate.allDay,
                    backgroundColor: getColorFromColorId(eventTemplate.colorId),
                    borderColor: getColorFromColorId(eventTemplate.colorId),
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
            style={{ backgroundColor: getColorFromColorId(eventTemplate.colorId) }}
            onClick={() => { onClick && onClick() }}
        >
            {durationInHours}h - {eventTemplate.title}
        </div>
    );
};

export default DraggableEvent;
