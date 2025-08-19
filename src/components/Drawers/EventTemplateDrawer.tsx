import { useContext, useEffect, useState } from 'react';
import './EventTemplateDrawer.css';
import { Button } from 'react-bootstrap';
import DraggableEvent from '../DraggableEvent';
import { useKeyPress } from '../../hooks/useKeyPress';
import Drawer from './Drawer';
import { SimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';

export interface IEventTemplateDrawerProps {
    onAddClick: () => void;
    onEditClick: (eventTemplate: SimplifiedEvent, eventTemplateIndex: number) => void;
}

const EventTemplateDrawer: React.FC<IEventTemplateDrawerProps> = (props: IEventTemplateDrawerProps) => {
    const { templates, areTemplatesLoaded, selectedTemplate, setSelectedTemplate, swapTemplates, resetSelectedTemplate } = useContext(TemplateContext);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const isSpaceKeyPressed = useKeyPress(' ');

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
            className={['event-template-drawer', templates.length > 0 && areTemplatesLoaded ? '' : 'isEmpty'].join(' ')}
            drawerClassName='event-template-drawer-content'
            drawerHandleClassName='event-template-drawer-handle'
            setIsOpen={() => { setDrawerOpen(!isDrawerOpen) }}
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