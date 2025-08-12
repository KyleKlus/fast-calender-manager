import { useContext, useEffect, useState } from 'react';
import './Popover.css';
import './AddEventPopover.css';
import { Card, Form, Button } from "react-bootstrap";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SimplifiedEvent } from '../../contexts/EventContext';
import { GCalContext } from '../../contexts/GCalContext';
import ColorSelector, { defaultColorId } from '../ColorSelector';
import { useKeyPress } from '../../hooks/useKeyPress';

export interface IAddEventPopoverProps {
    popoverMode: 'add' | 'add-template';
    selectedColor?: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isAllDay: boolean | undefined;
    closePopover: () => void;
}

const AddEventPopover: React.FC<IAddEventPopoverProps> = (props: IAddEventPopoverProps) => {
    const { addEvent } = useContext(GCalContext);
    const [isAllDay, setIsAllDay] = useState(props.isAllDay || false);
    const [eventName, setEventName] = useState('');
    const [startDate, setStartDate] = useState(props.startDate || DateTime.now().toJSDate());
    const [endDate, setEndDate] = useState(props.endDate || DateTime.now().plus({ hour: 1 }).toJSDate());
    const [eventDescription, setEventDescription] = useState('');
    const [eventColor, setEventColor] = useState(props.selectedColor || defaultColorId);
    const isEnterKeyPressed = useKeyPress('Enter', 'inverted');

    useEffect(() => {
        if (isEnterKeyPressed) {
            handleAddEventClick();
        }
    }, [isEnterKeyPressed]);

    function handleAddEventClick() {
        if (eventName === '') { return }

        if (props.popoverMode !== 'add') {
            const loadedEventTemplates = localStorage.getItem('eventTemplates');
            let eventTemplates: SimplifiedEvent[] = [];
            if (loadedEventTemplates) {
                eventTemplates = JSON.parse(loadedEventTemplates);
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
            props.closePopover();
        });
    }

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
            <Form.Label htmlFor="">Is Allday:</Form.Label>
            <Form.Check
                type="checkbox"
                id="isAllDayCheckbox"
                label="Is Allday"
                defaultChecked={isAllDay}
                onChange={() => { setIsAllDay(!isAllDay) }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'wrap', minWidth: '100%' }}>
                <ColorSelector
                    selectedColor={eventColor}
                    onColorChange={(colorId) => {
                        setEventColor(colorId);
                    }}
                />
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
                        handleAddEventClick();
                    }}>Confirm</Button>
            </div>
        </Card >
    );
};

export default AddEventPopover;