import { useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { SimplifiedEvent } from '../../contexts/EventContext';
import { useKeyPress } from '../../hooks/useKeyPress';

export interface IEventTemplateDrawerProps {
    onAddClick: () => void;
    onEditClick: (eventTemplate: SimplifiedEvent) => void;
    shouldReload: boolean;
    confirmReload: () => void;
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const [isEventTemplateOpen, setEventTemplateOpen] = useState(false);
    const [eventTemplates, setEventTemplates] = useState<SimplifiedEvent[]>([]);
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
                onClick={() => {
                    props.onEditClick(eventTemplates[i]);
                }}
            />);
        }
        return templateElements;
    }

    return (
        <div className={['event-template-drawer-container', isEventTemplateOpen ? 'isOpen' : ''].join(' ')}>
            <div className='event-template-drawer-handle'
                onClick={() => { setEventTemplateOpen(!isEventTemplateOpen) }}
            >
                <i className="bi-chevron-up"></i>
            </div>
            <div className='event-template-drawer'>
                <div className='event-template-container'>
                    {createTemplateElements(eventTemplates)}
                </div>
                <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                    <i className={`bi-plus-circle`}></i>
                </Button>
            </div>

        </div>
    );
};

export default EventTemplateDrawer;