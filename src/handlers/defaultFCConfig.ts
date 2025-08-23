import { CalendarOptions } from "@fullcalendar/core";
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { defaultEventColor } from "../components/ColorSelector";

export function getDefaultConfig(): CalendarOptions {
    return {
        plugins: [timeGridPlugin, interactionPlugin, bootstrap5Plugin],
        initialView: "timeGridWeek",
        headerToolbar: {
            left: 'prev,next today',
        },
        eventColor: defaultEventColor,
        editable: true,
        selectable: true,
        selectMirror: true,
        selectOverlap: true,
        eventOverlap: true,
        firstDay: 1,
        dateAlignment: '',
        locale: 'de',
        nowIndicator: true,
        droppable: true,
        dragScroll: true,
        scrollTime: '07:30:00',
        snapDuration: '00:15:00',
        slotDuration: '00:30:00',
        themeSystem: 'bootstrap5',
        nowIndicatorClassNames: 'CustomNowIndicator',
    };
}