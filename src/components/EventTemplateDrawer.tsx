import { useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';

export interface IEventTemplateDrawerProps {
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const [isEventTemplateOpen, setEventTemplateOpen] = useState(false);
    return (
        <div className={['event-template-drawer-container', isEventTemplateOpen ? 'isOpen' : ''].join(' ')}>
            <div className='event-template-drawer-handle'
                onClick={() => { setEventTemplateOpen(!isEventTemplateOpen) }}
            >
                <i className="bi-chevron-up"></i>
            </div>
            <div className='event-template-drawer'>
                <Button variant="primary" className='add-event-button' onClick={() => { }}>
                    <i className={`bi-plus-circle${'-fill'}`}></i>
                </Button>
            </div>

        </div>
    );
};

export default EventTemplateDrawer;