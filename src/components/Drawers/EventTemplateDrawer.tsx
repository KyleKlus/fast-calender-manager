import { useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { SimplifiedEvent } from '../../contexts/EventContext';
import { useKeyPress } from '../../hooks/useKeyPress';
import Drawer from './Drawer';

export interface IEventTemplateDrawerProps {
    onAddClick: () => void;
    onEditClick: (eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => void;
    selectedEventTemplateIndex: number;
    setSelectedEventTemplate: (selectedEventTemplate: SimplifiedEvent | null, selectedEventTemplateIndex: number) => void;
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
        loadEventTemplates();
    }, []);

    useEffect(() => {
        loadEventTemplates();
        props.confirmReload();
    }, [props.shouldReload]);

    function loadEventTemplates() {
        const loadedEventTemplates = localStorage.getItem('eventTemplates');
        if (loadedEventTemplates) {
            setEventTemplates(JSON.parse(loadedEventTemplates));
        }
    }

    function switchTemplate(direction?: 'prev' | 'next', index?: number) {
        const selectedIndex = props.selectedEventTemplateIndex;
        if (selectedIndex === -1) { return }

        const loadedEventTemplates = localStorage.getItem('eventTemplates');
        let newEventTemplates: SimplifiedEvent[] = [];
        if (loadedEventTemplates) {
            newEventTemplates = JSON.parse(loadedEventTemplates);
        } else {
            return;
        }

        if ((direction === 'prev' && selectedIndex === 0) || (direction === 'next' && selectedIndex === newEventTemplates.length - 1)) {
            props.setSelectedEventTemplate(null, -1);
            return;
        }

        if (direction === 'prev' && index === undefined) {
            newEventTemplates.splice(selectedIndex, 1);
            newEventTemplates.splice(selectedIndex - 1, 0, eventTemplates[selectedIndex]);
        } else if (direction === 'next' && index === undefined) {
            newEventTemplates.splice(selectedIndex, 1);
            newEventTemplates.splice(selectedIndex + 1, 0, eventTemplates[selectedIndex]);
        } else if (index !== undefined) {
            newEventTemplates[selectedIndex] = eventTemplates[index];
            newEventTemplates[index] = eventTemplates[selectedIndex];
        }

        localStorage.setItem('eventTemplates', JSON.stringify(newEventTemplates));
        loadEventTemplates();
        props.setSelectedEventTemplate(null, -1);
    }

    function createTemplateElements(eventTemplates: SimplifiedEvent[]) {
        const templateElements: React.ReactNode[] = [];

        for (let i = 0; i < eventTemplates.length; i++) {
            templateElements.push(<DraggableEvent
                key={eventTemplates[i].title + i}
                eventTemplate={eventTemplates[i]}
                isSelected={props.selectedEventTemplateIndex === i}
                onEditClick={() => {
                    props.onEditClick(eventTemplates[i], i);
                }}
                onTemplateClick={() => {
                    if (props.selectedEventTemplateIndex === i) {
                        props.setSelectedEventTemplate(null, -1);
                    } else if (props.selectedEventTemplateIndex === -1) {
                        props.setSelectedEventTemplate(eventTemplates[i], i);
                    } else {
                        switchTemplate(undefined, i);
                    }
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
            <div className='event-template-buttons'>
                <Button variant="primary" className='add-template-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                    <i className={`bi-clipboard-plus`}></i>
                </Button>
            </div>
        </Drawer>
    );
};

export default EventTemplateDrawer;