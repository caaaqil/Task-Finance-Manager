import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import WeeklySchedule from './WeeklySchedule';

const Dashboard = () => {
  const { tasks } = useTasks();

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => task.date.split('T')[0] === today);

  return (
    <div className="container">
      {/* Weekly Schedule Section */}
      <WeeklySchedule />
      
      {/* Today's Tasks Summary */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>📅 Today's Schedule Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Tasks</h3>
            <div className="amount">{todaysTasks.length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Scheduled for today
            </div>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <div className="amount positive">{todaysTasks.filter(task => task.status === 'completed').length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Tasks finished
            </div>
          </div>
          <div className="summary-card">
            <h3>Classes</h3>
            <div className="amount">{todaysTasks.filter(task => task.type === 'class').length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Lectures today
            </div>
          </div>
          <div className="summary-card">
            <h3>Meetings</h3>
            <div className="amount">{todaysTasks.filter(task => task.type === 'meeting').length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
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
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <span style={{ 
                      background: task.type === 'class' ? '#007bff' : 
                                 task.type === 'meeting' ? '#28a745' :
                                 task.type === 'office_hours' ? '#ffc107' :
                                 task.type === 'preparation' ? '#17a2b8' :
                                 task.type === 'research' ? '#6f42c1' : '#6c757d',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      textTransform: 'capitalize'
                    }}>
                      {task.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#888' }}>
                    <span style={{ marginRight: '15px' }}>
                      <strong>🕐 {task.startTime} - {task.endTime}</strong>
                    </span>
                    {task.location && (
                      <span>
                        <strong>📍 {task.location}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  background: task.status === 'completed' ? '#28a745' : '#ffc107',
                  color: 'white'
                }}>
                  {task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

