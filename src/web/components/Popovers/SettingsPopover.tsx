import './Popover.css';
import './SettingsPopover.css';
import { Card, Button, Form } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import Popup from 'reactjs-popup';
import { TemplateContext } from '../../contexts/TemplateContext';
import { useContext } from 'react';
import { defaultBgColor, SettingsContext } from '../../contexts/SettingsContext';
import { exportData, importData } from '../../handlers/settingsHandler';
import { IDataExport } from '../../handlers/IDataExport';
import PhaseList from './PhaseList';

export interface ISettingsPopoverProps {
    closePopover: () => void;
    open: boolean;
}

const SettingsPopover: React.FC<ISettingsPopoverProps> = (props: ISettingsPopoverProps) => {
    const { templates, addTemplate } = useContext(TemplateContext);
    const { backgroundColor, setBackgroundColor, setRoundSplits, roundSplits, setRoundingValue, roundingValue, availablePhases, setAvailablePhases, addPhase, removePhase } = useContext(SettingsContext);

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
                <div className='settings-popover-item'>
                    <h4>Settings</h4>
                    <div className='divider' style={{ flexGrow: 1 }} />
                    <button className={'close-settings-btn'} onClick={() => { props.closePopover() }}>
                        <i className='bi-x'></i>
                    </button>
                </div>
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
                    <PhaseList phases={availablePhases} addPhase={addPhase} removePhase={removePhase} />
                </div>
                <h4>Data</h4>
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
            </Card >
        </Popup>
    );
};

export default SettingsPopover;