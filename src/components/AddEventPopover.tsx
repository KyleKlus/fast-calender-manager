import { useContext, useState } from 'react';
import './Popover.css';
import './AddEventPopover.css';
import { Card, Form, Button } from "react-bootstrap";
import { colorMap, GCalContext } from '../contexts/GCalContext';
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export interface IAddEventPopoverProps {
    popoverMode: 'add' | 'add-template';
    closePopover: () => void;
}

const AddEventPopover: React.FC<IAddEventPopoverProps> = (props: IAddEventPopoverProps) => {
    const { addEvent } = useContext(GCalContext);
    const [isAllDay, setIsAllDay] = useState(false);
    const [eventName, setEventName] = useState('');
    const [startDate, setStartDate] = useState(DateTime.now().toJSDate());
    const [endDate, setEndDate] = useState(DateTime.now().plus({ hour: 1 }).toJSDate());
    const [eventDescription, setEventDescription] = useState('');
    const [eventColor, setEventColor] = useState(0);

    return (
        <Card className={['popover', props.popoverMode === 'add' ? 'add-popover' : 'add-template-popover', isAllDay ? 'allday' : ''].join(' ')}>
            <Form.Label htmlFor="">Event Name:</Form.Label>
            <Form.Control
                type="text"
                id="eventNameInput"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => { setEventName(e.target.value) }}
            />
            <div className='add-popover-date-input'>
                <div>
                    <Form.Label htmlFor="">Event Start:</Form.Label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => {
                            if (date === null) { return }
                            setStartDate(date)
                        }}
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
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
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        locale="de" // Or any other locale you support
                    />
                </div>
            </div>
            <Form.Label htmlFor="">Is Allday:</Form.Label>
            <Form.Check
                type="checkbox"
                id="isAllDayCheckbox"
                label="Is Allday"
                defaultChecked={isAllDay}
                onChange={() => { setIsAllDay(!isAllDay) }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'wrap', minWidth: '100%' }}>
                {colorMap.filter((color, index) => color !== '').map((color, index) => (
                    <div
                        className={['color-swatch',].join(' ')}
                        style={{ backgroundColor: color, borderWidth: eventColor === index ? '2px' : '1px' }}
                        key={index}
                        onClick={() => { setEventColor(index) }}
                    ></div>
                ))}
            </div>
            <Form.Label htmlFor="">Event Description:</Form.Label>
            <Form.Control
                type="text"
                as={'textarea'}
                id="eventDescriptionInput"
                placeholder="Event Description"
                value={eventDescription}
                onChange={(e) => { setEventDescription(e.target.value) }}
            />
            <div className='add-popover-buttons'>
                <Button onClick={() => {
                    props.closePopover();
                }}>Cancel</Button>
                <Button
                    onClick={() => {
                        if (props.popoverMode !== 'add') { return }
                        if (eventName === '') { return }
                        addEvent({
                            title: eventName,
                            start: DateTime.fromJSDate(startDate),
                            end: DateTime.fromJSDate(endDate),
                            colorId: eventColor,
                            extendedProps: {
                                description: eventDescription,
                            },
                        }).then(_ => {
                            props.closePopover();
                        });
                    }}
                >Confirm</Button>
            </div>
        </Card>
    );
};

export default AddEventPopover;