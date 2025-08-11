import { useContext, useState } from 'react';
import './EditEventPopover.css';
import './Popover.css';
import { Card, Form, Button } from "react-bootstrap";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { convertEventInputToSimplifiedEvent, EventContext, SimplifiedEvent } from '../contexts/EventContext';
import { PopoverMode } from '../pages/CalendarPage';
import ColorSelector from './ColorSelector';
import { GCalContext } from '../contexts/GCalContext';

export interface IEditEventPopoverProps {
    closePopover: () => void;
    selectedEventTemplate?: SimplifiedEvent;
    reloadTemplates: () => void;
    popoverMode: PopoverMode;
}

const EditEventPopover: React.FC<IEditEventPopoverProps> = (props: IEditEventPopoverProps) => {
    const { editEvent, addEvent, deleteEvent } = useContext(GCalContext);
    const { currentEvents } = useContext(EventContext);

    const editableEvent: SimplifiedEvent = props.popoverMode === 'edit-template' && props.selectedEventTemplate !== undefined
        ? props.selectedEventTemplate
        : convertEventInputToSimplifiedEvent(currentEvents[0]);

    const [isAllDay, setIsAllDay] = useState(editableEvent.allDay || false);
    const [eventName, setEventName] = useState(editableEvent.title);
    const [startDate, setStartDate] = useState<Date>(DateTime.fromISO(editableEvent.start).toJSDate());
    const [endDate, setEndDate] = useState<Date>(DateTime.fromISO(editableEvent.end).toJSDate());
    const [eventDescription, setEventDescription] = useState(editableEvent.description);
    const [eventColor, setEventColor] = useState<number>(editableEvent.colorId);

    return (
        <Card className={['popover', 'edit-popover', isAllDay ? 'allday' : ''].join(' ')}>
            <div className='edit-popover-quick-actions'>
                <ColorSelector
                    selectedColor={eventColor}
                    onColorChange={(colorId) => {
                        setEventColor(colorId);
                        if (props.popoverMode === 'edit-template') {
                            const loadedEventTemplates = localStorage.getItem('eventTemplates');
                            let eventTemplates: SimplifiedEvent[] = [];
                            if (loadedEventTemplates) {
                                eventTemplates = JSON.parse(loadedEventTemplates);
                            }

                            if (eventTemplates.findIndex((e) => e.title === editableEvent.title) !== -1) {
                                eventTemplates.splice(eventTemplates.findIndex((e) => e.title === editableEvent.title), 1);
                            }
                            eventTemplates.push({
                                title: eventName,
                                start: startDate.toISOString(),
                                end: endDate.toISOString(),
                                allDay: isAllDay,
                                description: eventDescription,
                                colorId: colorId,
                            });

                            localStorage.setItem('eventTemplates', JSON.stringify(eventTemplates));
                            props.reloadTemplates();
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
                <Button
                    onClick={() => {
                        if (props.popoverMode === 'edit-template') {
                            const loadedEventTemplates = localStorage.getItem('eventTemplates');
                            let eventTemplates: SimplifiedEvent[] = [];
                            if (loadedEventTemplates) {
                                eventTemplates = JSON.parse(loadedEventTemplates);
                            }
                            eventTemplates.splice(eventTemplates.findIndex((e) => e.title === editableEvent.title), 1);
                            localStorage.setItem('eventTemplates', JSON.stringify(eventTemplates));
                            props.reloadTemplates();
                            props.closePopover();
                            return;
                        }

                        deleteEvent((editableEvent.id as string)).then(_ => {
                            props.closePopover();
                        });
                    }}
                ><i className='bi-trash' /></Button>
                <Button
                    onClick={() => {
                        if (eventName === '') { return }
                        if (props.popoverMode === 'edit-template') {
                            if (props.selectedEventTemplate === undefined) { return }
                            const loadedEventTemplates = localStorage.getItem('eventTemplates');
                            let eventTemplates: SimplifiedEvent[] = [];
                            if (loadedEventTemplates) {
                                eventTemplates = JSON.parse(loadedEventTemplates);
                            }
                            eventTemplates.push({
                                title: props.selectedEventTemplate.title,
                                start: props.selectedEventTemplate.start,
                                end: props.selectedEventTemplate.end,
                                allDay: props.selectedEventTemplate.allDay,
                                description: props.selectedEventTemplate.description,
                                colorId: props.selectedEventTemplate.colorId,
                            });

                            localStorage.setItem('eventTemplates', JSON.stringify(eventTemplates));
                            props.reloadTemplates();
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
            </div>
            <hr />
            <Form.Label htmlFor="">Title:</Form.Label>
            <Form.Control
                type="text"
                id="eventNameInput"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => { setEventName(e.target.value) }}
            />
            <div className='edit-popover-date-input'>
                <div>
                    <Form.Label htmlFor="">Event Start:</Form.Label>
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
                </div>
                <div>
                    <Form.Label htmlFor="">Event End:</Form.Label>
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
                </div>
            </div>
            <div>
                <Form.Label htmlFor="">Is allday:</Form.Label>
                <Form.Check
                    type="checkbox"
                    id="isAllDayCheckbox"
                    label="Is allday"
                    defaultChecked={isAllDay}
                    onChange={() => { setIsAllDay(!isAllDay) }}
                />
            </div>
            <Form.Label htmlFor="">Description:</Form.Label>
            <Form.Control
                type="text"
                as={'textarea'}
                id="eventDescriptionInput"
                placeholder="Event Description"
                value={eventDescription}
                onChange={(e) => { setEventDescription(e.target.value) }}
            />
            <div className='edit-popover-buttons'>
                <Button onClick={() => {
                    props.closePopover();
                }}>Cancel</Button>
                <Button
                    onClick={() => {
                        if (eventName === '') { return }
                        if (props.popoverMode === 'edit-template') {
                            const loadedEventTemplates = localStorage.getItem('eventTemplates');
                            let eventTemplates: SimplifiedEvent[] = [];
                            if (loadedEventTemplates) {
                                eventTemplates = JSON.parse(loadedEventTemplates);
                            }
                            if (eventTemplates.findIndex((e) => e.title === editableEvent.title) !== -1) {
                                eventTemplates.splice(eventTemplates.findIndex((e) => e.title === editableEvent.title), 1);
                            }
                            eventTemplates.push({
                                title: eventName,
                                start: startDate.toISOString(),
                                end: endDate.toISOString(),
                                allDay: isAllDay,
                                description: eventDescription,
                                colorId: eventColor,
                            });

                            localStorage.setItem('eventTemplates', JSON.stringify(eventTemplates));
                            props.reloadTemplates();
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
                    }}
                >Confirm</Button>
            </div>
        </Card >
    );
};

export default EditEventPopover;