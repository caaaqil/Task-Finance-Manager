import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const WeeklySchedule = () => {
  const { tasks } = useTasks();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Get the start and end of the current week
  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start from Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End on Saturday
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(currentWeek);

  // Get tasks for the current week (expand by kind)
  const getWeekTasks = () => {
    const weekTasks = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Initialize empty arrays for each day
    dayNames.forEach(day => {
      weekTasks[day] = [];
    });

    const weekStartOnly = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const weekEndOnly = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

    const addOccurrence = (task, dateObj) => {
      if (dateObj < weekStartOnly || dateObj > weekEndOnly) return;
      const copy = { ...task, date: dateObj.toISOString() };
      const dayName = dayNames[dateObj.getDay()];
      weekTasks[dayName].push(copy);
    };

    const normalizeDate = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    };

    const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));

    tasks.forEach(task => {
      const kind = task.kind || 'ad_hoc';
      const taskDateOnly = normalizeDate(task.date);

      if (kind === 'ad_hoc') {
        if (taskDateOnly) addOccurrence(task, taskDateOnly);
        return;
      }

      if (kind === 'static') {
        const allowedDaysRaw = Array.isArray(task?.staticDays) 
          ? task.staticDays 
          : (Array.isArray(task?.recurrence?.daysOfWeek) ? task.recurrence.daysOfWeek : []);
        // Normalize: accept [0-6] (Sun..Sat) or [1-7] (Mon..Sun where 7->Sun)
        const allowedDays = allowedDaysRaw
          .map(n => Number(n))
          .map(n => (n === 7 ? 0 : n))
          .filter(n => n >= 0 && n <= 6);
        if (allowedDays.length === 0) {
          return; // no selected days → do not render
        }
        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStartOnly);
          d.setDate(weekStartOnly.getDate() + i);
          if (allowedDays.length === 0 || allowedDays.includes(d.getDay())) {
            addOccurrence(task, d);
          }
        }
        return;
      }

      if (kind === 'periodic') {
        const startDate = normalizeDate(task?.period?.startDate) || taskDateOnly || weekStartOnly;
        const endDate = normalizeDate(task?.period?.endDate) || weekEndOnly;
        const from = startDate > weekStartOnly ? startDate : weekStartOnly;
        const to = endDate < weekEndOnly ? endDate : weekEndOnly;
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          addOccurrence(task, new Date(d));
        }
        return;
      }

      if (kind === 'recurring') {
        const anchor = taskDateOnly || weekStartOnly; // anchor date to compute intervals
        const interval = Math.max(1, Number(task?.recurrence?.intervalWeeks || 1));
        const allowedDays = Array.isArray(task?.recurrence?.daysOfWeek) ? task.recurrence.daysOfWeek : [];
        const repeatEnd = normalizeDate(task?.recurrence?.repeatEndDate) || null;

        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStartOnly);
          d.setDate(weekStartOnly.getDate() + i);

          if (repeatEnd && d > repeatEnd) continue;
          if (allowedDays.length > 0 && !allowedDays.includes(d.getDay())) continue;

          // check interval alignment in weeks from anchor
          const diffDays = daysBetween(normalizeDate(anchor), d);
          const weeks = Math.floor(diffDays / 7);
          if (weeks % interval === 0 && diffDays >= 0) {
            addOccurrence(task, d);
          }
        }
      }
    });

    // Sort tasks by start time for each day
    dayNames.forEach(day => {
      weekTasks[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return weekTasks;
  };

  const weekTasks = getWeekTasks();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Generate time slots (8 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const TIME_COL_WIDTH = 80; // px, matches grid first column
  const HEADER_HEIGHT = 60; // px, approximate day header row height

  // Get the height for a time slot
  const getTimeSlotHeight = (startTime, endTime) => {
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const duration = endMinutes - startMinutes;
    return (duration / 60) * 60; // 60px per hour
  };

  // Get the top position for a task
  const getTaskTop = (startTime) => {
    const start = startTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const hoursFrom8AM = (startMinutes - (8 * 60)) / 60;
    return hoursFrom8AM * 60; // 60px per hour
  };

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayDate = (dayIndex) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    return dayDate;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Weekly Schedule</h3>
        <div>
          <button className="btn" onClick={goToPreviousWeek}>← Previous Week</button>
          <button className="btn" onClick={goToCurrentWeek}>This Week</button>
          <button className="btn" onClick={goToNextWeek}>Next Week →</button>
        </div>
      </div>

      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <strong>
          Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
        </strong>
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>
          Showing {Object.values(weekTasks).flat().length} tasks this week
        </div>
      </div>

      {/* Debug panel removed */}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '80px repeat(7, 1fr)', 
        gap: '1px',
        background: '#ddd',
        border: '1px solid #ddd',
        position: 'relative'
      }}>
        {/* Time column header */}
        <div style={{ background: '#F3F4F6', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          Time
        </div>
        
        {/* Day headers */}
        {days.map((day, index) => (
          <div key={day} style={{ background: '#F3F4F6', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
            <div>{day}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {formatDate(getDayDate(index + 1))}
            </div>
          </div>
        ))}

        {/* Time slots and schedule */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            {/* Time label */}
            <div style={{ 
              background: '#F3F4F6', 
              padding: '5px', 
              textAlign: 'center', 
              fontSize: '12px',
              borderBottom: '1px solid #ddd'
            }}>
              {time}
            </div>
            
            {/* Day columns */}
            {days.map(day => (
              <div 
                key={`${day}-${time}`} 
                style={{ 
                  background: 'white', 
                  minHeight: '60px',
                  borderBottom: '1px solid #ddd',
                  position: 'relative'
                }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Schedule items overlay */}
        {days.map((day, dayIndex) => 
          weekTasks[day].map((task) => {
            const left = `calc(${TIME_COL_WIDTH}px + (${dayIndex}) * ((100% - ${TIME_COL_WIDTH}px) / 7))`;
            const width = `calc((100% - ${TIME_COL_WIDTH}px) / 7 - 2px)`; // minus grid gaps
            return (
              <div
                key={`${day}-${task._id}`}
                style={{
                  position: 'absolute',
                  left,
                  top: `${HEADER_HEIGHT + getTaskTop(task.startTime)}px`,
                  width,
                  height: `${getTimeSlotHeight(task.startTime, task.endTime)}px`,
                  background: task.type === 'class' ? '#7C3AED' : 
                             task.type === 'meeting' ? '#10B981' :
                             task.type === 'office_hours' ? '#64748B' :
                             task.type === 'preparation' ? '#7C3AED' :
                             task.type === 'research' ? '#64748B' : '#64748B',
                  color: 'white',
                  padding: '5px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                title={`${task.title}\n${task.startTime} - ${task.endTime}\n${task.location || 'No location'}`}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {task.lectureDetails?.className || task.title}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                  {task.startTime} - {task.endTime}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.95 }}>
                  {task.lectureDetails?.hallNumber ? `Hall: ${task.lectureDetails.hallNumber}` : (task.location || '')}
                </div>
                {task.lectureDetails?.hours && (
                  <div style={{ fontSize: '9px', opacity: 0.95 }}>
                    Hours: {task.lectureDetails.hours}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', background: '#007bff', borderRadius: '3px' }}></div>
          <span style={{ fontSize: '12px' }}>Class/Lecture</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', background: '#28a745', borderRadius: '3px' }}></div>
          <span style={{ fontSize: '12px' }}>Meeting</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', background: '#ffc107', borderRadius: '3px' }}></div>
          <span style={{ fontSize: '12px' }}>Office Hours</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', background: '#17a2b8', borderRadius: '3px' }}></div>
          <span style={{ fontSize: '12px' }}>Preparation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', background: '#6f42c1', borderRadius: '3px' }}></div>
          <span style={{ fontSize: '12px' }}>Research</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
