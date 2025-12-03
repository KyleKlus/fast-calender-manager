import { useEffect } from 'react';
import './Popover.css';
import './SettingsPopover.css';
import { Card, Button, Form } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { useKeyPress } from '../../hooks/useKeyPress';
import Popup from 'reactjs-popup';
import { getBgHoverAndActiveColor } from '../ColorSelector';
import { SimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';
import { useContext } from 'react';
import { defaultBgColor, defaultRoundingValue, SettingsContext } from '../../contexts/SettingsContext';
import { exportData, importData } from '../../handlers/settingsHandler';
import { IDataExport } from '../../handlers/IDataExport';

export interface ISettingsPopoverProps {
    closePopover: () => void;
    open: boolean;
}

const SettingsPopover: React.FC<ISettingsPopoverProps> = (props: ISettingsPopoverProps) => {
    const { templates, addTemplate } = useContext(TemplateContext);
    const { backgroundColor, setBackgroundColor, setRoundSplits, roundSplits, setRoundingValue, roundingValue, availablePhases, setAvailablePhases } = useContext(SettingsContext);
    const isEnterKeyPressed = useKeyPress('Enter', 'inverted');

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
                    <input className='background-color-input' type="color" value={backgroundColor} onChange={(e) => {
                        setBackgroundColor(e.target.value);
                    }} />
                    <button className='reset-background-color-button' onClick={() => {
                        setBackgroundColor(defaultBgColor);
                    }}><i className='bi-arrow-counterclockwise'></i></button>
                </div>
                <div className='settings-popover-item'>
                    <span>Round to:</span>
                    <Form.Control
                        type="number"
                        id="roundingValueInput"
                        placeholder="Rounding Value"
                        value={roundingValue}
                        onChange={(e) => {
                            setRoundingValue(parseInt(e.target.value));
                        }}
                    />
                    <span>min</span>
                </div>
                <div className='settings-popover-item'>
                    <span>Round split:</span>
                    <Form.Check
                        type="checkbox"
                        id="roundSplitsCheckbox"
                        checked={roundSplits}
                        onChange={() => {
                            setRoundSplits(!roundSplits);
                        }}
                    />
                </div>
                <div className='settings-popover-item'>
                    <span>Import/Export Data:</span>
                    <input id='template-import' hidden type='file' accept='.json' className='import-templates-input' onChange={async (e) => {
                        if (!e.target.files) return;
                        const file = e.target.files[0];
                        const dataExport = await importData(file, templates);

                        setBackgroundColor(dataExport.backgroundColor);
                        setRoundingValue(dataExport.roundingValue);
                        setRoundSplits(dataExport.roundSplits);
                        setAvailablePhases(dataExport.availablePhases);

                        dataExport.templates.forEach((template) => {
                            addTemplate(template);
                        });
                    }} />
                    <Button variant="primary" className='import--templates-button' onClick={() => {
                        document.getElementById('template-import')?.click();
                    }}><i className='bi-file-earmark-arrow-down'></i>Import</Button>
                    <Button variant="primary" className='export-templates-button' onClick={async () => {
                        const dataExport: IDataExport = {
                            backgroundColor,
                            roundingValue,
                            roundSplits,
                            availablePhases,
                            templates,
                        };
                        await exportData(dataExport);
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