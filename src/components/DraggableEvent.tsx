// DraggableEvent.tsx
import React, { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import './DraggableEvent.css';
import { DateTime } from 'luxon';
import { SimplifiedEvent } from '../contexts/EventContext';
import { getColorFromColorId } from './ColorSelector';
import { PointerDragEvent } from '@fullcalendar/core/internal';

interface DraggableEventProps {
    eventTemplate: SimplifiedEvent;
    setDraggedTemplate?: (eventTemplate: SimplifiedEvent | undefined) => void;
    onMouseOver?: (eventTemplate: SimplifiedEvent) => void;
    onClick?: () => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ eventTemplate, onClick, setDraggedTemplate, onMouseOver }) => {
    const eventRef = useRef<HTMLDivElement>(null);
    const durationInMinutes = DateTime.fromISO(eventTemplate.end).diff(DateTime.fromISO(eventTemplate.start)).as('minutes');
    const durationInHours = Math.floor((durationInMinutes / 60) * 100) / 100;

    const timer = useRef<NodeJS.Timeout>(null);

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
            onMouseOver={(e) => {
                console.log('Mouse over event:', eventTemplate.title);
                onMouseOver && onMouseOver(eventTemplate)

            }}
            onMouseDown={(e) => {
                timer.current = setTimeout(() => {
                    setDraggedTemplate && setDraggedTemplate(eventTemplate);
                }, 1500);
            }}
            onMouseUp={(e) => {
                if (timer.current) {
                    clearTimeout(timer.current);
                    return;
                }
                setDraggedTemplate && setDraggedTemplate(undefined);
            }}
        >
            <div>{durationInHours}h</div>
            <div>|</div>
            <div>{eventTemplate.title}</div>
        </div>
    );
};

export default DraggableEvent;
