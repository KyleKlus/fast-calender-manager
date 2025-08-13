import { useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { SimplifiedEvent } from '../../contexts/EventContext';
import { useKeyPress } from '../../hooks/useKeyPress';
import Drawer from './Drawer';

export interface IEventTemplateDrawerProps {
    onAddClick: () => void;
    onEditClick: (eventTemplate: SimplifiedEvent) => void;
    shouldReload: boolean;
    confirmReload: () => void;
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const [isEventTemplateOpen, setEventTemplateOpen] = useState(false);
    const [eventTemplates, setEventTemplates] = useState<SimplifiedEvent[]>([]);
    const [draggedTemplate, setDraggedTemplate] = useState<{ event: SimplifiedEvent, index: number } | undefined>(undefined);
    const isSpaceKeyPressed = useKeyPress(' ');

    useEffect(() => {
        if (isSpaceKeyPressed) {
            setEventTemplateOpen(!isEventTemplateOpen);
        }
    }, [isSpaceKeyPressed]);

    useEffect(() => {
        loadedEventTemplates();
    }, []);

    useEffect(() => {
        loadedEventTemplates();
        props.confirmReload();
    }, [props.shouldReload]);

    function loadedEventTemplates() {
        const loadedEventTemplates = localStorage.getItem('eventTemplates');
        if (loadedEventTemplates) {
            setEventTemplates(JSON.parse(loadedEventTemplates));
        }
    }

    function createTemplateElements(eventTemplates: SimplifiedEvent[]) {
        const templateElements: React.ReactNode[] = [];

        for (let i = 0; i < eventTemplates.length; i++) {
            templateElements.push(<DraggableEvent
                key={eventTemplates[i].title + i}
                eventTemplate={eventTemplates[i]}
                setDraggedTemplate={(event) => {
                    if (event === undefined) {
                        setDraggedTemplate(undefined);
                        return;
                    }
                    setDraggedTemplate({ event: eventTemplates[i], index: i });
                }}
                onMouseOver={() => {
                    if (draggedTemplate === undefined) return;

                    const draggedEventString = draggedTemplate.event.title + draggedTemplate.event.start + draggedTemplate.event.end;
                    const indexEventString = eventTemplates[i].title + eventTemplates[i].start + eventTemplates[i].end;
                    // Prevent swapping with itself
                    if (draggedEventString === indexEventString) {
                        return;
                    }

                    const oldEventTemplates = eventTemplates.slice();
                    let newEventTemplates = [...oldEventTemplates];
                    newEventTemplates[draggedTemplate.index] = oldEventTemplates[i];
                    newEventTemplates[i] = oldEventTemplates[draggedTemplate.index];
                    localStorage.setItem('eventTemplates', JSON.stringify(newEventTemplates));
                    setEventTemplates(newEventTemplates);
                    setDraggedTemplate({ event: newEventTemplates[i], index: i });
                }}
                onClick={() => {
                    props.onEditClick(eventTemplates[i]);
                }}
            />);
        }
        return templateElements;
    }

    return (
        <Drawer
            isOpen={isEventTemplateOpen}
            location='bottom'
            className={['event-template-drawer', eventTemplates.length > 0 ? '' : 'isEmpty'].join(' ')}
            drawerClassName='event-template-drawer-content'
            drawerHandleClassName='event-template-drawer-handle'
            setIsOpen={() => { setEventTemplateOpen(!isEventTemplateOpen) }}
        >
            {eventTemplates.length > 0 &&
                <div className='event-template-container'>
                    {createTemplateElements(eventTemplates)}
                </div>
            }
            <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                <i className={`bi-plus-circle`}></i>
            </Button>

        </Drawer>
    );
};

export default EventTemplateDrawer;