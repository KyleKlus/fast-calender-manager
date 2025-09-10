import { useContext, useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { useKeyPress } from '../../hooks/useKeyPress';
import Drawer from './Drawer';
import { SimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';
import { GCalContext } from '../../contexts/GCalContext';
import { WeatherContext } from '../../contexts/WeatherContext';
import { EventInput } from '@fullcalendar/core';
import { EventContext } from '../../contexts/EventContext';

export interface IEventTemplateDrawerProps {
    onAddClick: () => void;
    onEditClick: (eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => void;
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const { templates, areTemplatesLoaded, selectedTemplate, setSelectedTemplate, swapTemplates, resetSelectedTemplate } = useContext(TemplateContext);
    const { events, setEvents, areBGEventsEditable, setBGEventsEditable } = useContext(EventContext);

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');

    const { isSyncOn, setIsSyncOn, switchWeek } = useContext(GCalContext);
    const { showWeather, setShowWeather } = useContext(WeatherContext);
    const isTKeyPressed = useKeyPress('t');

    const isRightArrowKeyPressed = useKeyPress('ArrowRight');
    const isLeftArrowKeyPressed = useKeyPress('ArrowLeft');

    useEffect(() => {
        if (isLeftArrowKeyPressed) {
            switchWeek('prev');
        }
    }, [isLeftArrowKeyPressed]);

    useEffect(() => {
        if (isRightArrowKeyPressed) {
            switchWeek('next');
        }
    }, [isRightArrowKeyPressed]);

    useEffect(() => {
        if (isTKeyPressed) {
            switchWeek('today');
        }
    }, [isTKeyPressed]);

    useEffect(() => {
        if (isSpaceKeyPressed) {
            setDrawerOpen(!isDrawerOpen);
        }
    }, [isSpaceKeyPressed]);

    function renderTemplates(templates: SimplifiedEvent[]) {
        const templateElements: React.ReactNode[] = [];

        for (let i = 0; i < templates.length; i++) {
            templateElements.push(<DraggableEvent
                key={templates[i].title + i}
                eventTemplate={templates[i]}
                isSelected={selectedTemplate.index === i}
                onEditClick={() => {
                    props.onEditClick(templates[i], i);
                }}
                onTemplateClick={() => {
                    if (selectedTemplate.index === i) {
                        resetSelectedTemplate();
                    } else if (selectedTemplate.index === -1) {
                        setSelectedTemplate({ template: templates[i], index: i });
                    } else {
                        swapTemplates(selectedTemplate.index, i);
                        resetSelectedTemplate();
                    }
                }}
            />);
        }
        return templateElements;
    }

    return (
        <Drawer
            isOpen={isDrawerOpen}
            location='bottom'
            disableHandle={showWeather}
            className={['event-template-drawer', templates.length > 0 && areTemplatesLoaded ? '' : 'isEmpty'].join(' ')}
            drawerClassName='event-template-drawer-content'
            drawerHandleClassName='event-template-drawer-handle'
            setIsOpen={() => { setDrawerOpen(!isDrawerOpen) }}
            childrenWithinHandleRight={
                <>
                    <div
                        className={['sync-button', isSyncOn ? 'active' : ''].join(' ')}
                        onClick={() => { setIsSyncOn(!isSyncOn) }}
                    >
                        <i className='bi-arrow-repeat'></i>
                    </div>
                    <div
                        className={['phase-button', areBGEventsEditable ? 'active' : ''].join(' ')}
                        onClick={() => {
                            const newEvents = (events as Array<EventInput>).map(event => {
                                let isBackgroundEvent = event.display !== 'background' && !event.allDay;
                                return {
                                    ...event,
                                    display: isBackgroundEvent ? 'background' : 'auto',
                                };
                            });
                            setEvents(newEvents);
                            setBGEventsEditable(!areBGEventsEditable);
                        }}
                    >
                        <i className='bi-layers-half'></i>
                    </div>
                    <div
                        className={['weather-button', showWeather ? 'active' : ''].join(' ')}
                        onClick={() => {
                            setShowWeather(!showWeather)
                            switchWeek('today', !showWeather);
                        }}
                    >
                        <i className='bi-cloud-sun'></i>
                    </div>
                    <div
                        className='toolbar-navigation-button left-button'
                        onClick={() => { switchWeek('prev', showWeather) }}
                    >
                        <i className='bi-chevron-double-left'></i>
                    </div>
                    <div className='today-button' onClick={() => { switchWeek('today', showWeather) }}>
                        <i className={`bi-calendar-event`}></i>
                    </div>
                    <div
                        className='toolbar-navigation-button right-button'
                        onClick={() => {
                            switchWeek('next', showWeather)
                        }}
                    >
                        <i className='bi-chevron-double-right'></i>
                    </div>
                </>
            }
        >
            {templates.length > 0 && areTemplatesLoaded &&
                <div className='event-template-container'>
                    {renderTemplates(templates)}
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