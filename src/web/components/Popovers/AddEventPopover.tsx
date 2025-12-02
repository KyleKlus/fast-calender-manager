import { useContext, useEffect, useState } from 'react';
import './Popover.css';
import './AddEventPopover.css';
import { Card, Form, Button, Dropdown } from "react-bootstrap";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ColorSelector, { defaultColorId } from '../ColorSelector';
import { useKeyPress } from '../../hooks/useKeyPress';
import Popup from 'reactjs-popup';
import { TemplateContext } from '../../contexts/TemplateContext';
import { EventContext, phases } from '../../contexts/EventContext';

export interface IAddEventPopoverProps {
    popoverMode: 'add' | 'add-template';
    open: boolean;
    selectedColor?: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    closePopover: () => void;
}

const AddEventPopover: React.FC<IAddEventPopoverProps> = (props: IAddEventPopoverProps) => {
    const { addEvent, areBGEventsEditable } = useContext(EventContext);
    const { selectedTemplate, resetSelectedTemplate, addTemplate } = useContext(TemplateContext);
    const [isAllDay, setIsAllDay] = useState(getIsAllDay(props.startDate, props.endDate));
    const [eventName, setEventName] = useState(selectedTemplate.template !== null
        ? selectedTemplate.template.title
        : areBGEventsEditable ? 'BG Event Name' : ''
    );
    const [startDate, setStartDate] = useState(props.startDate || DateTime.now().toJSDate());
    const [endDate, setEndDate] = useState(props.endDate || DateTime.now().plus({ hour: 1 }).toJSDate()
    );
    const [eventDescription, setEventDescription] = useState(selectedTemplate.template !== null
        ? selectedTemplate.template.description
        : ''
    );
    const [eventColor, setEventColor] = useState(selectedTemplate.template !== null
        ? selectedTemplate.template.colorId
        : props.selectedColor || defaultColorId
    );
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const isEnterKeyPressed = useKeyPress('Enter', 'inverted');

    useEffect(() => {
        if (isEnterKeyPressed && !isTextareaFocused) {
            handleAddEventClick();
        }
    }, [isEnterKeyPressed]);

    function handleAddEventClick() {
        if (eventName === '') { return }

        if (props.popoverMode !== 'add') {
            addTemplate({
                title: eventName,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay: isAllDay,
                description: eventDescription,
                colorId: eventColor,
            });
            props.closePopover();
            return;
        }

        addEvent(
            {
                title: eventName,
                start: DateTime.fromJSDate(startDate),
                end: DateTime.fromJSDate(endDate),
                colorId: eventColor,
                extendedProps: {
                    description: eventDescription,
                },
            },
            isAllDay
        ).then(_ => {
            if (selectedTemplate.template !== null) {
                resetSelectedTemplate();
            }
            props.closePopover();
        });
    }

    function getIsAllDay(startDate: Date | undefined, endDate: Date | undefined) {
        if (startDate && endDate) {
            const start = DateTime.fromJSDate(startDate);
            const end = DateTime.fromJSDate(endDate);
            return start.toFormat('HH:mm') === end.toFormat('HH:mm');
        }
        return false;
    }

    return (
        <Popup
            open={props.open}
            modal
            onClose={() => {
                props.closePopover();
            }}
        >
            <Card className={['popover', props.popoverMode === 'add' ? 'add-popover' : 'add-template-popover', isAllDay ? 'allday' : ''].join(' ')}>
                {areBGEventsEditable &&
                    <Dropdown onSelect={((p) => {
                        setEventName(p as string);
                    })}>
                        <Dropdown.Toggle variant="primary" id="dropdown-bg-events">
                            {eventName}

                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {...phases.map(p => <Dropdown.Item eventKey={p} key={p}>{p}</Dropdown.Item>)}
                        </Dropdown.Menu>
                    </Dropdown>
                }
                {!areBGEventsEditable &&
                    <Form.Control
                        type="text"
                        id="eventNameInput"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => { setEventName(e.target.value) }}
                    />
                }
                <div className='add-popover-date-input'>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => {
                            if (date === null) { return }
                            const newStartDate = DateTime.fromJSDate(date);
                            const prevStartDate = DateTime.fromJSDate(startDate);
                            const diff = newStartDate.diff(prevStartDate, 'seconds').seconds;
                            const currentEndDate = DateTime.fromJSDate(endDate);
                            setEndDate(currentEndDate.plus({ second: diff }).toJSDate());
                            setStartDate(date);
                        }}
                        showTimeSelect={!isAllDay}
                        dateFormat={isAllDay ? 'dd.MM.yyyy' : 'dd.MM.yyyy | HH:mm'}
                        locale="de" // Or any other locale you support
                    />
                    <i className='bi-arrow-right' style={{ fontSize: '1.5rem' }}></i>
                    <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => {
                            if (date === null) { return }
                            const newEndDate = DateTime.fromJSDate(date);
                            const currentStartDate = DateTime.fromJSDate(startDate);
                            if (newEndDate <= currentStartDate) {
                                return
                            }
                            setEndDate(date)
                        }}
                        showTimeSelect={!isAllDay}
                        dateFormat={isAllDay ? 'dd.MM.yyyy' : 'dd.MM.yyyy | HH:mm'}
                        locale="de" // Or any other locale you support
                    />
                    <Form.Check
                        type="checkbox"
                        id="isAllDayCheckbox"
                        label="All Day"
                        defaultChecked={isAllDay}
                        onChange={() => { setIsAllDay(!isAllDay) }}
                    />
                </div>
                <ColorSelector
                    selectedColor={eventColor}
                    onColorChange={(colorId) => {
                        setEventColor(colorId);
                    }}
                />
                <Form.Control
                    type="text"
                    as={'textarea'}
                    id="eventDescriptionInput"
                    placeholder="Event Description"
                    value={eventDescription}
                    onFocus={() => { setIsTextareaFocused(true) }}
                    onBlur={() => { setIsTextareaFocused(false) }}
                    onChange={(e) => { setEventDescription(e.target.value) }}
                />
                <hr />
                <div className='add-popover-buttons'>
                    <Button onClick={() => {
                        props.closePopover();
                    }}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleAddEventClick();
                        }}>Save</Button>
                </div>
            </Card >
        </Popup>
    );
};

export default AddEventPopover;
