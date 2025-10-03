import React, { useState } from 'react';
import FinanceList from '../components/FinanceList';
import FinanceForm from '../components/FinanceForm';

const Finance = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Finance</h2>
        <button 
          className="btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide Form' : 'Add New Entry'}
        </button>
      </div>
      
      {showForm && <FinanceForm onClose={() => setShowForm(false)} />}
      <FinanceList />
    </div>
  );
};

export default Finance;

