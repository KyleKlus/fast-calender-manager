import { useContext, useState } from 'react';
import './EditEventPopover.css';
import './Popover.css';
import { Card, Form, Button } from "react-bootstrap";
import { colorMap, GCalContext } from '../contexts/GCalContext';
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { EventContext } from '../contexts/EventContext';

export interface IEditEventPopoverProps {
    closePopover: () => void;
}

const EditEventPopover: React.FC<IEditEventPopoverProps> = (props: IEditEventPopoverProps) => {
    const { editEvent, addEvent, deleteEvent } = useContext(GCalContext);
    const { currentEvents } = useContext(EventContext);
    const [isAllDay, setIsAllDay] = useState(currentEvents[0].allDay || false);
    const [eventName, setEventName] = useState(currentEvents[0].title);
    const [startDate, setStartDate] = useState(currentEvents[0].start ? currentEvents[0].start : DateTime.now().toJSDate());
    const [endDate, setEndDate] = useState(currentEvents[0].end ? currentEvents[0].end : DateTime.now().plus({ hour: 1 }).toJSDate());
    const [eventDescription, setEventDescription] = useState(currentEvents[0].extendedProps?.description);
    const [eventColor, setEventColor] = useState<number>(colorMap.indexOf(currentEvents[0].backgroundColor) === -1 ? 0 : colorMap.indexOf(currentEvents[0].backgroundColor));

    return (
        <Card className={['popover', 'edit-popover', isAllDay ? 'allday' : ''].join(' ')}>
            <h5>Quick Actions:</h5>
            <div className='edit-popover-quick-actions'>
                <div className='color-menu'>
                    {colorMap.filter((color, index) => color !== '').map((color, index) => (
                        <div
                            className={['color-swatch',].join(' ')}
                            style={{ backgroundColor: color, borderWidth: eventColor === index ? '2px' : '1px' }}
                            key={index}
                            onClick={() => {
                                if (eventColor === index) { return }

                                editEvent({
                                    title: currentEvents[0].title,
                                    start: DateTime.fromJSDate(startDate),
                                    end: DateTime.fromJSDate(endDate),
                                    colorId: index,
                                    extendedProps: currentEvents[0].extendedProps,
                                },
                                    currentEvents[0].id,
                                    isAllDay
                                ).then(_ => {
                                    setEventColor(index)
                                });
                            }}
                        ></div>
                    ))}
                </div>
                <Button
                    onClick={() => {
                        deleteEvent(currentEvents[0].id).then(_ => {
                            props.closePopover();
                        });
                    }}
                ><i className='bi-trash' /></Button>
                <Button
                    onClick={() => {
                        if (eventName === '') { return }
                        addEvent(
                            {
                                title: eventName,
                                start: DateTime.fromJSDate(startDate),
                                end: DateTime.fromJSDate(endDate),
                                colorId: eventColor,
                                extendedProps: {
                                    ...currentEvents[0].extendedProps,
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
            <br />
            <h5>Edit Event:</h5>
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
                    <Form.Label htmlFor="">Is allday:</Form.Label>
                    <Form.Check
                        type="checkbox"
                        id="isAllDayCheckbox"
                        label="Is allday"
                        defaultChecked={isAllDay}
                        onChange={() => { setIsAllDay(!isAllDay) }}
                    />
                </div>
                <div>
                    <Form.Label htmlFor="">Event Start:</Form.Label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => {
                            if (date === null) { return }
                            setStartDate(date)
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
                            setEndDate(date)
                        }}
                        showTimeSelect={!isAllDay}
                        dateFormat={isAllDay ? 'dd.MM.yyyy' : 'dd.MM.yyyy | HH:mm'}
                        locale="de" // Or any other locale you support
                    />
                </div>
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
                        editEvent(
                            {
                                title: eventName,
                                start: DateTime.fromJSDate(startDate),
                                end: DateTime.fromJSDate(endDate),
                                colorId: eventColor,
                                extendedProps: {
                                    ...currentEvents[0].extendedProps,
                                    description: eventDescription,
                                },
                            },
                            currentEvents[0].id,
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