import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import DailySummary from './DailySummary';

const Dashboard = () => {
  const { tasks, updateTask } = useTasks();

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.date).toISOString().split('T')[0];
    return taskDate === today;
  });

  const handleStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="container">
      <h2>Today's Overview</h2>
      
      {/* Daily Summary */}
      <DailySummary />
      
      {/* Today's Tasks Summary */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>📅 Today's Schedule Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Tasks</h3>
            <div className="amount">{todaysTasks.length}</div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              Scheduled for today
            </div>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <div className="amount positive">{todaysTasks.filter(task => task.status === 'completed').length}</div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              Tasks finished
            </div>
          </div>
          <div className="summary-card">
            <h3>Classes</h3>
            <div className="amount">{todaysTasks.filter(task => task.type === 'class').length}</div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              Lectures today
            </div>
          </div>
          <div className="summary-card">
            <h3>Meetings</h3>
            <div className="amount">{todaysTasks.filter(task => task.type === 'meeting').length}</div>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              Scheduled meetings
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Detail */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>📋 Today's Tasks</h3>
        {todaysTasks.length === 0 ? (
          <p>No tasks scheduled for today. Enjoy your free time! 🎉</p>
        ) : (
          todaysTasks.map(task => (
            <div
              key={task._id}
              className={`task-item ${task.status === 'completed' ? 'task-completed' : ''}`}
              style={{ marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0 }}>{task.lectureDetails?.className || task.title}</h4>
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
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    <span style={{ marginRight: '15px' }}>
                      <strong>🕐 {task.startTime} - {task.endTime}</strong>
                    </span>
                    {task.lectureDetails?.hallNumber && (
                      <span style={{ marginRight: '15px' }}>
                        <strong>🏛️ {task.lectureDetails.hallNumber}</strong>
                      </span>
                    )}
                    {task.location && !task.lectureDetails?.hallNumber && (
                      <span>
                        <strong>📍 {task.location}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  className={`btn ${task.status === 'completed' ? 'btn-success' : ''}`}
                  onClick={() => handleStatusChange(task._id, task.status)}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  {task.status === 'completed' ? '✓ Done' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

