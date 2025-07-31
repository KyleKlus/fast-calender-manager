import { CalendarOptions, EventAddArg, EventClickArg, EventContentArg, EventDropArg, EventSourceInput } from "@fullcalendar/core";
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventDragStopArg, EventResizeStopArg } from '@fullcalendar/interaction';
import { DateTime } from 'luxon';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

export const defaultEventColor = '#b74f4f';

export interface IFCConfigProps {
    events: EventSourceInput;
    date: DateTime;
    eventClick?: (info: EventClickArg) => void;
    eventContent?: (info: EventContentArg) => void;
    addEvent?: (info: EventContentArg) => void;
    eventDrop?: (info: EventDropArg) => void;
    eventResizeStop?: (info: EventResizeStopArg) => void;
    eventDragStop?: (info: EventDragStopArg) => void;
    eventAdd?: (info: EventAddArg) => void;
}

export function generateFCConfig(props: IFCConfigProps): CalendarOptions {
    return {
        plugins: [timeGridPlugin, interactionPlugin, bootstrap5Plugin],
        initialView: "timeGridWeek",
        headerToolbar: {
            left: 'prev,next today',
        },
        eventColor: '#b74f4f',
        initialDate: props.date.toFormat('yyyy-MM-dd'),
        editable: true,
        selectable: true,
        selectMirror: true,
        selectOverlap: true,
        eventOverlap: true,
        firstDay: 1,
        dateAlignment: '',
        events: props.events,
        locale: 'de',
        nowIndicator: true,
        droppable: true,
        dragScroll: true,
        scrollTime: '07:30:00',
        snapDuration: '00:15:00',
        slotDuration: '00:15:00',
        themeSystem: 'bootstrap5',
        eventClick: props.eventClick,
        eventAdd: props.eventAdd,
        eventDrop: props.eventDrop,
        eventResizeStop: props.eventResizeStop,
        eventDragStop: props.eventDragStop,
    };
}