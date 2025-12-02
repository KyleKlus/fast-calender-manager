import { useContext, useEffect, useState } from 'react';
import './EditEventPopover.css';
import './Popover.css';
import { Card, Form, Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PopoverMode } from '../../pages/CalendarPage';
import ColorSelector from '../ColorSelector';
import { useKeyPress } from '../../hooks/useKeyPress';
import Popup from 'reactjs-popup';
import { EventContext, phases } from '../../contexts/EventContext';
import { SimplifiedEvent, convertEventInputToSimplifiedEvent } from '../../handlers/eventConverters';
import { TemplateContext } from '../../contexts/TemplateContext';

export interface IEditEventPopoverProps {
    closePopover: () => void;
    open: boolean;
    popoverMode: PopoverMode;
}

const EditEventPopover: React.FC<IEditEventPopoverProps> = (props: IEditEventPopoverProps) => {
    const { selectedTemplate, resetSelectedTemplate, editTemplate, switchSelectedTemplate, deleteTemplate, addTemplate } = useContext(TemplateContext);
    const { selectedEvents, editEvent, addEvent, removeEvent, splitEvent, areBGEventsEditable } = useContext(EventContext);

    const [editableEvent, setEditableEvent] = useState<SimplifiedEvent>(props.popoverMode === 'edit-template' && selectedTemplate.template !== null
        ? selectedTemplate.template
        : convertEventInputToSimplifiedEvent(selectedEvents[0])
    );

    const [isAllDay, setIsAllDay] = useState(editableEvent.allDay || false);
    const [eventName, setEventName] = useState(editableEvent.title);
    const [startDate, setStartDate] = useState<Date>(DateTime.fromISO(editableEvent.start).toJSDate());
    const [endDate, setEndDate] = useState<Date>(DateTime.fromISO(editableEvent.end).toJSDate());
    const [eventDescription, setEventDescription] = useState(editableEvent.description);
    const [eventColor, setEventColor] = useState<number>(editableEvent.colorId);
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    const isEnterKeyPressed = useKeyPress('Enter', 'inverted');

    useEffect(() => {
        if (isEnterKeyPressed && !isTextareaFocused) {
            handleEditClick();
        }
    }, [isEnterKeyPressed]);

    function handleEditClick() {
        if (eventName === '') { return }
        if (props.popoverMode === 'edit-template') {
            editTemplate({
                ...editableEvent,
                title: eventName,
                description: eventDescription,
                colorId: eventColor,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay: isAllDay,
            }, selectedTemplate.index);
            resetSelectedTemplate();
            props.closePopover();
            return;
        }

        editEvent(
            {
                title: eventName,
                start: DateTime.fromJSDate(startDate),
                end: DateTime.fromJSDate(endDate),
                colorId: eventColor,
                extendedProps: {
                    ...editableEvent.extendedProps,
                    description: eventDescription,
                },
            },
            (editableEvent.id as string), // is always defined
            isAllDay
        ).then(_ => {
            props.closePopover();
        });
    }

    return (
        <Popup
            open={props.open}
            modal
            onClose={() => {
                if (selectedTemplate.template !== null && editableEvent.title === selectedTemplate.template.title && editableEvent.start === selectedTemplate.template.start && editableEvent.end === selectedTemplate.template.end && editableEvent.allDay === selectedTemplate.template.allDay) {
                    resetSelectedTemplate();
                }
                props.closePopover();
            }}
        >
            <Card className={['popover', 'edit-popover', isAllDay ? 'allday' : ''].join(' ')}>
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
                <div className='edit-popover-date-input'>
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
                <Form.Control
                    type="text"
                    as={'textarea'}
                    id="eventDescriptionInput"
                    placeholder="Event Description"
                    onFocus={() => { setIsTextareaFocused(true) }}
                    onBlur={() => { setIsTextareaFocused(false) }}
                    value={eventDescription}
                    onChange={(e) => { setEventDescription(e.target.value) }}
                />
                <hr />
                <ColorSelector
                    selectedColor={eventColor}
                    onColorChange={(colorId) => {
                        setEventColor(colorId);
                        if (props.popoverMode === 'edit-template') {
                            editTemplate({
                                ...editableEvent,
                                colorId: colorId,
                            }, selectedTemplate.index);
                            setEventColor(colorId)
                            return;
                        }

                        editEvent({
                            title: editableEvent.title,
                            start: DateTime.fromJSDate(startDate),
                            end: DateTime.fromJSDate(endDate),
                            colorId: colorId,
                            extendedProps: { description: eventDescription },
                        },
                            (editableEvent.id as string), // is always defined
                            isAllDay
                        ).then(_ => {
                            setEventColor(colorId)
                        });
                    }}
                />
                <div className='edit-popover-buttons'>
                    {props.popoverMode === 'edit-template' &&
                        <ButtonGroup>
                            <Button className={'switch-template-left-button'} onClick={() => { switchSelectedTemplate('prev') }}><i className='bi-chevron-left' /></Button>
                            <Button className={'switch-template-right-button'} onClick={() => { switchSelectedTemplate('next') }}><i className='bi-chevron-right' /></Button>
                        </ButtonGroup>
                    }
                    <Button
                        onClick={() => {
                            if (props.popoverMode === 'edit-template') {
                                deleteTemplate(selectedTemplate.index);
                                resetSelectedTemplate();
                                props.closePopover();
                                return;
                            }

                            removeEvent((editableEvent.id as string)).then(_ => {
                                props.closePopover();
                            });
                        }}
                    ><i className='bi-trash' /></Button>
                    <Button
                        onClick={() => {
                            if (eventName === '') { return }
                            if (props.popoverMode === 'edit-template') {
                                addTemplate({
                                    ...editableEvent,
                                });
                                resetSelectedTemplate();
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
                                        ...editableEvent.extendedProps,
                                        description: eventDescription,
                                    },
                                },
                                isAllDay
                            ).then(_ => {
                                props.closePopover();
                            });
                        }}
                    ><i className='bi-copy' /></Button>
                    {props.popoverMode !== 'edit-template' &&
                        <Button
                            onClick={() => {
                                if (eventName === '') { return }
                                splitEvent(
                                    {
                                        title: eventName,
                                        start: DateTime.fromJSDate(startDate),
                                        end: DateTime.fromJSDate(endDate),
                                        colorId: eventColor,
                                        extendedProps: {
                                            ...editableEvent.extendedProps,
                                            description: eventDescription,
                                        },
                                    },
                                    (editableEvent.id as string), // is always defined
                                    isAllDay
                                ).then(_ => {
                                    props.closePopover();
                                });
                            }}
                        ><i className='bi-hr' /></Button>
                    }
                    <div className='divider' style={{ flexGrow: 1 }} />
                    <Button onClick={() => {
                        props.closePopover();
                    }}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleEditClick();
                        }}
                    >Save</Button>
                </div>
            </Card >
        </Popup>
    );
};

export default EditEventPopover;