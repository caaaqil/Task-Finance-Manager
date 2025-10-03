import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Tasks</h2>
        <button 
          className="btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide Form' : 'Add New Task'}
        </button>
      </div>
      
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
      <TaskList />
    </div>
  );
};

export default Tasks;

