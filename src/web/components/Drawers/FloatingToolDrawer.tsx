import { DropdownButton, ButtonGroup, Button } from 'react-bootstrap/esm';
import ColorSelector, { getColorFromColorId } from '../ColorSelector';
import './FloatingToolDrawer.css';
import { ToolbarMode } from './EventTemplateDrawer';
import { useState } from 'react';
import SettingsPopover from '../Popovers/SettingsPopover';

export interface IFloatingToolDrawerProps {
    selectedColor: number;
    selectedMode: ToolbarMode;
    isTemplateDrawerOpen: boolean;
    selectColor: (colorId: number) => void;
    onAddClick: () => void;
    onModeChange: (mode: ToolbarMode) => void;
}

function FloatingToolDrawer(props: IFloatingToolDrawerProps) {
    const [isMoreToolsDrawerOpen, setIsMoreToolsDrawerOpen] = useState(false);
    const [areSettingsOpen, setAreSettingsOpen] = useState(false);

    return (
        <div className={['floatingToolDrawer', props.isTemplateDrawerOpen ? 'isOpen' : ''].join(' ')}>
            <Button
                variant='primary'
                className={['moreToolsDrawerButton', isMoreToolsDrawerOpen ? 'isOpen' : ''].join(' ')}
                onClick={() => {
                    setIsMoreToolsDrawerOpen(!isMoreToolsDrawerOpen);
                }}
            >
                <i className={[`bi-chevron-left`, 'moreToolsDrawerIcon', isMoreToolsDrawerOpen ? 'isOpen' : ''].join(' ')} />
                <i className={[`bi-tools`].join(' ')} />
            </Button>
            <div className={['moreToolsDrawer', isMoreToolsDrawerOpen ? 'isOpen' : ''].join(' ')}>
                <Button variant="primary" className='open-settings-button' onClick={() => {
                    setAreSettingsOpen(!areSettingsOpen);
                }}>
                    <i className={`bi-gear`}></i>
                </Button>
                <DropdownButton
                    id={`dropdown-variants-${'Primary'}`}
                    variant={'Primary'.toLowerCase()}
                    className='color-event-button'
                    drop={'up'}
                    title={
                        <div className={['color-swatch',].join(' ')} style={{ backgroundColor: getColorFromColorId(props.selectedColor) }}></div>
                    }
                >
                    <ColorSelector
                        selectedColor={props.selectedColor}
                        swatchesPerRow={6}
                        onColorChange={(colorId) => {
                            props.selectColor(colorId);
                        }}
                    />
                </DropdownButton>
                <ButtonGroup>
                    <Button
                        variant='primary'
                        active={props.selectedMode === 'color'}
                        className={"color-event-button"}
                        onClick={() => {
                            props.onModeChange && props.onModeChange('color')
                        }}
                    >
                        <i className={`bi-palette`}></i>
                    </Button>
                    <Button
                        variant="primary" active={props.selectedMode === 'delete'}
                        className='delete-event-button'
                        onClick={() => {
                            props.onModeChange && props.onModeChange('delete')
                        }}
                    >
                        <i className={`bi-trash`}></i>
                    </Button>
                    <Button
                        variant="primary"
                        active={props.selectedMode === 'duplicate'}
                        className='duplicate-event-button'
                        onClick={() => {
                            props.onModeChange && props.onModeChange('duplicate')
                        }}
                    >
                        <i className={`bi-copy`}></i>
                    </Button>
                    <Button
                        variant="primary"
                        active={props.selectedMode === 'split'}
                        className='split-event-button'
                        onClick={() => {
                            props.onModeChange && props.onModeChange('split')
                        }}
                    >
                        <i className={`bi-hr`}></i>
                    </Button>
                </ButtonGroup>

            </div>
            <Button variant="primary" className='add-event-button' onClick={() => { props.onAddClick && props.onAddClick() }}>
                <i className={`bi-calendar2-plus`}></i>
            </Button>
            {areSettingsOpen &&
                <SettingsPopover
                    open={areSettingsOpen}
                    closePopover={() => {
                        setAreSettingsOpen(false);
                    }}
                />
            }
        </div>
    );
};

export default FloatingToolDrawer;