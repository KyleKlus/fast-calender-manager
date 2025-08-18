// DraggableEvent.tsx
import React, { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import './DraggableEvent.css';
import { DateTime } from 'luxon';
import { SimplifiedEvent } from '../contexts/EventContext';
import { getColorFromColorId } from './ColorSelector';

interface DraggableEventProps {
    eventTemplate: SimplifiedEvent;
    className?: string;
    isSelected?: boolean;
    onEditClick?: () => void;
    onTemplateClick?: () => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ eventTemplate, onEditClick, onTemplateClick, className, isSelected }) => {
    const eventRef = useRef<HTMLDivElement>(null);
    const durationInMinutes = DateTime.fromISO(eventTemplate.end).diff(DateTime.fromISO(eventTemplate.start)).as('minutes');
    const durationInHours = Math.floor((durationInMinutes / 60) * 100) / 100;

    const [isHovered, setIsHovered] = React.useState(false);

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
            className={['draggable-event', 'fc-event', className, isSelected ? 'is-selected' : ''].join(' ')}
            style={{ backgroundColor: getColorFromColorId(eventTemplate.colorId) }}
            onClick={() => { onTemplateClick && onTemplateClick() }}
            onMouseOver={() => { setIsHovered(true) }}
            onMouseOut={() => { setIsHovered(false) }}
        >
            <div className='duration'>{durationInHours}h</div>
            <div className='title'>{eventTemplate.title}</div>
            {isHovered &&
                <button className='edit-template-button' onClick={() => { onEditClick && onEditClick() }}>
                    <i className='bi bi-pencil-square'></i>
                </button>
            }
        </div>
    );
};

export default DraggableEvent;
