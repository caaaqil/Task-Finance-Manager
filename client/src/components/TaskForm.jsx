import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const TaskForm = ({ onClose }) => {
  const { createTask } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'class',
    location: '',
    status: 'pending',
    kind: 'ad_hoc',
    recurrence: {
      daysOfWeek: [],
      intervalWeeks: 1,
      repeatEndDate: ''
    },
    period: {
      startDate: '',
      endDate: ''
    },
    subtasks: [],
    reminders: [],
    dailySummary: true,
    staticDays: [],
    lectureDetails: { className: '', hallNumber: '', hours: '' }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: 'class',
        location: '',
        status: 'pending',
        kind: 'ad_hoc',
        recurrence: { daysOfWeek: [], intervalWeeks: 1, repeatEndDate: '' },
        period: { startDate: '', endDate: '' },
        subtasks: [],
        reminders: [],
        dailySummary: true,
        staticDays: [],
        lectureDetails: { className: '', hallNumber: '', hours: '' }
      });
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleStaticDay = (dayIndex) => {
    const exists = formData.staticDays.includes(dayIndex);
    const staticDays = exists
      ? formData.staticDays.filter(d => d !== dayIndex)
      : [...formData.staticDays, dayIndex];
    setFormData({ ...formData, staticDays });
  };

  const toggleDayOfWeek = (dayIndex) => {
    const exists = formData.recurrence.daysOfWeek.includes(dayIndex);
    const daysOfWeek = exists
      ? formData.recurrence.daysOfWeek.filter(d => d !== dayIndex)
      : [...formData.recurrence.daysOfWeek, dayIndex];
    setFormData({
      ...formData,
      recurrence: { ...formData.recurrence, daysOfWeek }
    });
  };

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { title: '', status: 'pending' }]
    });
  };

  const updateSubtask = (index, value) => {
    const subtasks = formData.subtasks.map((s, i) => i === index ? { ...s, title: value } : s);
    setFormData({ ...formData, subtasks });
  };

  const removeSubtask = (index) => {
    const subtasks = formData.subtasks.filter((_, i) => i !== index);
    setFormData({ ...formData, subtasks });
  };

  const addReminder = () => {
    setFormData({
      ...formData,
      reminders: [...formData.reminders, { time: '21:00', method: 'notify' }]
    });
  };

  const updateReminder = (index, key, value) => {
    const reminders = formData.reminders.map((r, i) => i === index ? { ...r, [key]: value } : r);
    setFormData({ ...formData, reminders });
  };

  const removeReminder = (index) => {
    const reminders = formData.reminders.filter((_, i) => i !== index);
    setFormData({ ...formData, reminders });
  };

  return (
    <div className="card">
      <h3>Add New Schedule Item</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title/Class Name</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Advanced Programming Class"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="e.g., Lecture on Data Structures and Algorithms"
          />
        </div>

        {formData.kind === 'static' && (
          <div className="card" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Days (Static)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, auto)', gap: '10px' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={formData.staticDays.includes(idx)}
                    onChange={() => toggleStaticDay(idx)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="class">Class/Lecture</option>
            <option value="meeting">Meeting</option>
            <option value="office_hours">Office Hours</option>
            <option value="preparation">Preparation</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>
        </div>

        {(formData.type === 'class') && (
          <div className="card" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Lecture Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Subject/Class Name</label>
                <input
                  type="text"
                  value={formData.lectureDetails.className}
                  onChange={(e) => setFormData({ ...formData, lectureDetails: { ...formData.lectureDetails, className: e.target.value } })}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div className="form-group">
                <label>Hall Number</label>
                <input
                  type="text"
                  value={formData.lectureDetails.hallNumber}
                  onChange={(e) => setFormData({ ...formData, lectureDetails: { ...formData.lectureDetails, hallNumber: e.target.value } })}
                  placeholder="e.g., Hall 201"
                />
              </div>
              <div className="form-group">
                <label>Hours</label>
                <input
                  type="text"
                  value={formData.lectureDetails.hours}
                  onChange={(e) => setFormData({ ...formData, lectureDetails: { ...formData.lectureDetails, hours: e.target.value } })}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Administration">Administration</option>
            <option value="Research">Research</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Kind</label>
          <select
            name="kind"
            value={formData.kind}
            onChange={handleChange}
          >
            <option value="static">Static</option>
            <option value="recurring">Recurring</option>
            <option value="periodic">Periodic</option>
            <option value="ad_hoc">Ad-hoc</option>
          </select>
        </div>

        {formData.kind === 'recurring' && (
          <div className="card" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Recurrence</h4>
            <div className="form-group">
              <label>Days of Week</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn ${formData.recurrence.daysOfWeek.includes(idx) ? 'btn-success' : ''}`}
                    onClick={() => toggleDayOfWeek(idx)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Interval (weeks)</label>
              <input
                type="number"
                min="1"
                name="intervalWeeks"
                value={formData.recurrence.intervalWeeks}
                onChange={(e) => setFormData({
                  ...formData,
                  recurrence: { ...formData.recurrence, intervalWeeks: Number(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>Repeat End Date</label>
              <input
                type="date"
                value={formData.recurrence.repeatEndDate}
                onChange={(e) => setFormData({
                  ...formData,
                  recurrence: { ...formData.recurrence, repeatEndDate: e.target.value }
                })}
              />
            </div>
          </div>
        )}

        {formData.kind === 'periodic' && (
          <div className="card" style={{ marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Period</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.period.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    period: { ...formData.period, startDate: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.period.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    period: { ...formData.period, endDate: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>Subtasks</h4>
          {formData.subtasks.length === 0 && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>No subtasks yet.</div>
          )}
          {formData.subtasks.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder={`Subtask #${idx + 1}`}
                value={s.title}
                onChange={(e) => updateSubtask(idx, e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-danger" onClick={() => removeSubtask(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={addSubtask}>Add Subtask</button>
        </div>

        <div className="card" style={{ marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>Reminders</h4>
          {formData.reminders.length === 0 && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>No reminders yet.</div>
          )}
          {formData.reminders.map((r, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="time"
                value={r.time}
                onChange={(e) => updateReminder(idx, 'time', e.target.value)}
              />
              <select
                value={r.method}
                onChange={(e) => updateReminder(idx, 'method', e.target.value)}
              >
                <option value="notify">Notify</option>
                <option value="email">Email</option>
              </select>
              <button type="button" className="btn btn-danger" onClick={() => removeReminder(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={addReminder}>Add Reminder</button>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.dailySummary}
              onChange={(e) => setFormData({ ...formData, dailySummary: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Include in Daily Summary (9pm)
          </label>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Room 201, Building A"
          />
        </div>
        
        <button type="submit" className="btn">Add Schedule Item</button>
        <button type="button" className="btn btn-danger" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default TaskForm;

