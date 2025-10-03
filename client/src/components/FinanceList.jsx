import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const FinanceList = () => {
  const { finance, deleteFinance, loading } = useFinance();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteFinance(id);
      } catch (error) {
        console.error('Error deleting finance entry:', error);
      }
    }
  };

  const filteredFinance = finance.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="card">Loading finance data...</div>;
  }

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h3>Finance Entries</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search entries..."
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
            className={`btn ${filter === 'income' ? 'btn-success' : ''}`}
            onClick={() => setFilter('income')}
          >
            Income
          </button>
          <button
            className={`btn ${filter === 'expense' ? 'btn-success' : ''}`}
            onClick={() => setFilter('expense')}
          >
            Expenses
          </button>
        </div>
      </div>

      {filteredFinance.length === 0 ? (
        <p>No finance entries found.</p>
      ) : (
        filteredFinance.map(item => (
          <div key={item._id} className="finance-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ 
                    color: item.type === 'income' ? '#28a745' : '#dc3545',
                    margin: 0 
                  }}>
                    {item.type === 'income' ? '+' : '-'}${item.amount % 1 === 0 ? item.amount : item.amount.toFixed(2)}
                  </h4>
                  <span style={{ 
                    background: item.type === 'income' ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {item.type}
                  </span>
                </div>
                
                {item.description && (
                  <p style={{ margin: '5px 0', color: '#666' }}>{item.description}</p>
                )}
                
                <div style={{ fontSize: '14px', color: '#888' }}>
                  <span style={{ marginRight: '15px' }}>
                    Category: <strong>{item.category}</strong>
                  </span>
                  <span>
                    Date: <strong>{new Date(item.date).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>
              
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(item._id)}
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FinanceList;

