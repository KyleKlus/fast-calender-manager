import { useContext, useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { useKeyPress } from '../../hooks/useKeyPress';
import Drawer from './Drawer';
import { SimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';
import { WeatherContext } from '../../contexts/WeatherContext';
import { EventContext } from '../../contexts/EventContext';
import FloatingToolDrawer from './FloatingToolDrawer';

export type ToolbarMode = 'color' | 'delete' | 'duplicate' | 'split' | 'none';

export interface IEventTemplateDrawerProps {
    selectedColor: number;
    selectedMode: ToolbarMode;
    selectColor: (colorId: number) => void;
    onAddClick: () => void;
    onModeChange: (mode: ToolbarMode) => void;
    onAddTemplateClick: () => void;
    onEditTemplateClick: (eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => void;
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const { templates, areTemplatesLoaded, selectedTemplate, setSelectedTemplate, swapTemplates, resetSelectedTemplate } = useContext(TemplateContext);
    const { events, areBGEventsEditable, setBGEventsEditable, isSyncOn, setIsSyncOn, switchWeek } = useContext(EventContext);

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');

    const { showWeather, setShowWeather } = useContext(WeatherContext);
    const isTKeyPressed = useKeyPress('t');

    const isRightArrowKeyPressed = useKeyPress('ArrowRight');
    const isLeftArrowKeyPressed = useKeyPress('ArrowLeft');

    const isXKeyPressed = useKeyPress('x');
    const isCKeyPressed = useKeyPress('c');
    const isDKeyPressed = useKeyPress('d');
    const isSKeyPressed = useKeyPress('s');
    const isAKeyPressed = useKeyPress('a');

    useEffect(() => {
        if (isXKeyPressed && isDrawerOpen) {
            props.onModeChange && props.onModeChange('delete');
        }
    }, [isXKeyPressed]);

    useEffect(() => {
        if (isCKeyPressed && isDrawerOpen) {
            props.onModeChange && props.onModeChange('color');
        }
    }, [isCKeyPressed]);

    useEffect(() => {
        if (isDKeyPressed && isDrawerOpen) {
            props.onModeChange && props.onModeChange('duplicate');
        }
    }, [isDKeyPressed]);

    useEffect(() => {
        if (isSKeyPressed && isDrawerOpen) {
            props.onModeChange && props.onModeChange('split');
        }
    }, [isSKeyPressed]);

    useEffect(() => {
        if (isAKeyPressed) {
            props.onAddClick();
        }
    }, [isAKeyPressed]);

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
                    props.onEditTemplateClick(templates[i], i);
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
                        className={['phase-button', areBGEventsEditable ? 'active' : '', showWeather ? 'disabled' : ''].join(' ')}
                        aria-disabled={showWeather}
                        onClick={() => {
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
                <Button variant="primary" className='add-template-button' onClick={() => { props.onAddTemplateClick && props.onAddTemplateClick() }}>
                    <i className={`bi-clipboard-plus`}></i>
                </Button>

                <FloatingToolDrawer isTemplateDrawerOpen={isDrawerOpen} selectedColor={props.selectedColor} selectedMode={props.selectedMode} selectColor={props.selectColor} onAddClick={props.onAddClick} onModeChange={props.onModeChange} />
            </div>
        </Drawer>
    );
};

export default EventTemplateDrawer;