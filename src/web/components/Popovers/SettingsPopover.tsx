import { useEffect, useState } from 'react';
import './Popover.css';
import './SettingsPopover.css';
import { Card, Button } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { useKeyPress } from '../../hooks/useKeyPress';
import Popup from 'reactjs-popup';
import { getBgHoverAndActiveColor } from '../ColorSelector';
import { SimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';
import { useContext } from 'react';

export interface ISettingsPopoverProps {
    closePopover: () => void;
    open: boolean;
}

const SettingsPopover: React.FC<ISettingsPopoverProps> = (props: ISettingsPopoverProps) => {
    const { templates, addTemplate } = useContext(TemplateContext);
    const isEnterKeyPressed = useKeyPress('Enter', 'inverted');
    const [color, setColor] = useState("#ebf1e4");

    useEffect(() => {
        const bgColor = window.localStorage.getItem('bgColor');
        if (bgColor) {
            setColor(bgColor);
        } else {
            const cssBgColor = getComputedStyle(document.body).getPropertyValue('--bs-body-bg');
            setColor(cssBgColor);
            window.localStorage.setItem('bgColor', cssBgColor);
        }
    }, []);

    useEffect(() => {
        if (isEnterKeyPressed) {
            props.closePopover();
        }
    }, [isEnterKeyPressed]);


    return (
        <Popup
            open={props.open}
            modal
            arrow
            onClose={() => {
                props.closePopover();
            }}
        >
            <Card className={['popover', 'settings-popover'].join(' ')}>
                <h3>Settings</h3>
                <div className='settings-popover-item'>
                    <span>Background Color:</span>
                    <input className='background-color-input' type="color" value={color} onChange={(e) => {
                        setColor(e.target.value);
                        document.body.style.setProperty('--bs-body-bg', e.target.value);
                        window.localStorage.setItem('bgColor', e.target.value);
                        document.body.style.setProperty('--bs-body-bg', e.target.value);
                        const bgHoverAndActiveColor = getBgHoverAndActiveColor(e.target.value);
                        document.body.style.setProperty('--bs-body-bg-hover', bgHoverAndActiveColor.hover);
                        document.body.style.setProperty('--bs-body-bg-active', bgHoverAndActiveColor.active);
                    }} />
                    <button className='reset-background-color-button' onClick={() => {
                        const defaultColor = '#ebf1e4ff';
                        setColor(defaultColor);
                        document.body.style.setProperty('--bs-body-bg', defaultColor);
                        window.localStorage.setItem('bgColor', defaultColor);
                        document.body.style.setProperty('--bs-body-bg', defaultColor);
                        const bgHoverAndActiveColor = getBgHoverAndActiveColor(defaultColor);
                        document.body.style.setProperty('--bs-body-bg-hover', bgHoverAndActiveColor.hover);
                        document.body.style.setProperty('--bs-body-bg-active', bgHoverAndActiveColor.active);
                    }}><i className='bi-arrow-counterclockwise'></i></button>
                </div>
                <div className='settings-popover-item'>
                    <span>Import/Export Templates:</span>
                    <input id='template-import' hidden type='file' accept='.json' className='import-templates-input' onChange={(e) => {
                        if (!e.target.files) return;
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                if (e.target === null || e.target.result === null) return;
                                const templates: SimplifiedEvent[] = JSON.parse(e.target.result as string).templates;
                                console.log(templates);
                                templates.forEach((template) => {
                                    if (templates.filter((t) => t.title === template.title && t.start === template.start && t.end === template.end && t.allDay === template.allDay).length > 0) {
                                        return;
                                    }
                                    addTemplate(template);
                                });
                            };
                            reader.readAsText(file);
                        }
                    }} />
                    <Button variant="primary" className='import--templates-button' onClick={() => {
                        document.getElementById('template-import')?.click();
                    }}><i className='bi-file-earmark-arrow-down'></i>Import</Button>
                    <Button variant="primary" className='export-templates-button' onClick={() => {

                        const templatesObj = { templates: templates as SimplifiedEvent[] };
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templatesObj));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href", dataStr);
                        downloadAnchorNode.setAttribute("download", "templates.json");
                        document.body.appendChild(downloadAnchorNode); // required for firefox
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                    }}><i className='bi-file-earmark-arrow-up'></i>Export</Button>
                </div>
                <hr />
                <div className='settings-popover-buttons'>
                    <div className='divider' style={{ flexGrow: 1 }} />
                    <Button onClick={() => {
                        props.closePopover();
                    }}>Close</Button>
                </div>
            </Card >
        </Popup>
    );
};

export default SettingsPopover;