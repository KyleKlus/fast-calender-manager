import './App.css';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateTime } from 'luxon';

const App = () => {
  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      customButtons={{
        addEventButton: {
          text: 'Add Event',
          click: () => alert('Custom button clicked!'),

        },
        selectRangeButton: {
          text: 'Select Range',
          click: () => alert('Custom button clicked!'),

        },
      }}
      headerToolbar={{
        right: 'addEventButton selectRangeButton',
        center: 'title',
        left: 'prev,today,next',
      }}
      initialDate={DateTime.now().toFormat('yyyy-MM-dd')}
      editable={true}
      selectable={true}
      selectMirror={true}
      selectOverlap={true}
      eventOverlap={true}
      events={[]}
      locale={'de'}
      nowIndicator={true}
      droppable={true}
      dragScroll={true}
      snapDuration={'00:15:00'}
      slotDuration={'00:15:00'}
    />
  );
};

export default App;
