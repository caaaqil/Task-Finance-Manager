import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const TaskList = () => {
  const { tasks, updateTask, deleteTask, loading } = useTasks();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const toggleSubtask = async (task, subtaskIndex) => {
    try {
      const updatedSubtasks = task.subtasks.map((s, i) =>
        i === subtaskIndex ? { ...s, status: s.status === 'completed' ? 'pending' : 'completed' } : s
      );
      await updateTask(task._id, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="card">Loading tasks...</div>;
  }

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h3>Tasks</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginRight: '10px', padding: '8px', width: '200px' }}
          />
        </div>
        
        <div>
          <button
            className={`btn ${filter === 'all' ? 'btn-success' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-success' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-success' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        filteredTasks.map(task => (
          <div
            key={task._id}
            className={`task-item ${task.status === 'completed' ? 'task-completed' : ''}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <h4 style={{ margin: 0 }}>{task.title}</h4>
                  <span style={{ 
                    background: task.type === 'class' ? '#7C3AED' : 
                               task.type === 'meeting' ? '#10B981' :
                               task.type === 'office_hours' ? '#64748B' :
                               task.type === 'preparation' ? '#7C3AED' :
                               task.type === 'research' ? '#64748B' : '#64748B',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textTransform: 'capitalize'
                  }}>
                    {task.type.replace('_', ' ')}
                  </span>
                  {task.kind && (
                    <span style={{
                      background: '#111827',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      textTransform: 'capitalize'
                    }}>
                      {task.kind.replace('_', ' ')}
                    </span>
                  )}
                </div>
                
                {task.description && <p style={{ margin: '5px 0', color: '#6B7280' }}>{task.description}</p>}
                
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <span style={{ marginRight: '15px' }}>
                      <strong>📅 {new Date(task.date).toLocaleDateString()}</strong>
                    </span>
                    <span style={{ marginRight: '15px' }}>
                      <strong>🕐 {task.startTime} - {task.endTime}</strong>
                    </span>
                    {task.location && (
                      <span>
                        <strong>📍 {task.location}</strong>
                      </span>
                    )}
                  </div>
                  <div>
                    <span>
                      Category: <strong>{task.category}</strong>
                    </span>
                  </div>
                  {task.lectureDetails && (task.lectureDetails.className || task.lectureDetails.hallNumber || task.lectureDetails.hours) && (
                    <div style={{ marginTop: '4px' }}>
                      {task.lectureDetails.className && (
                        <span style={{ marginRight: '12px' }}>Subject: <strong>{task.lectureDetails.className}</strong></span>
                      )}
                      {task.lectureDetails.hallNumber && (
                        <span style={{ marginRight: '12px' }}>Hall: <strong>{task.lectureDetails.hallNumber}</strong></span>
                      )}
                      {task.lectureDetails.hours && (
                        <span>Hours: <strong>{task.lectureDetails.hours}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>Subtasks</div>
                    {task.subtasks.map((sub, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="checkbox"
                          checked={sub.status === 'completed'}
                          onChange={() => toggleSubtask(task, idx)}
                        />
                        <span style={{ textDecoration: sub.status === 'completed' ? 'line-through' : 'none', color: '#333' }}>
                          {sub.title || `Subtask #${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button
                  className={`btn ${task.status === 'completed' ? 'btn-success' : ''}`}
                  onClick={() => handleStatusChange(task._id, task.status)}
                >
                  {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(task._id)}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;

