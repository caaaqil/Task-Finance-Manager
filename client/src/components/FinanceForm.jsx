import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const FinanceForm = ({ onClose }) => {
  const { createFinance } = useFinance();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food', // Start with first expense category
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    
    // Reset category when type changes
    if (e.target.name === 'type') {
      const categories = e.target.value === 'income' 
        ? ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
        : ['Food', 'Rent', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];
      newFormData.category = categories[0]; // Set to first category of the new type
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFinance({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Food', // Reset to first expense category
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (error) {
      console.error('Error creating finance entry:', error);
    }
  };

  const getCategories = () => {
    if (formData.type === 'income') {
      return ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
    } else {
      return ['Food', 'Rent', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];
    }
  };

  return (
    <div className="card">
      <h3>Add New Finance Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
          />
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
        
        <button type="submit" className="btn">
          Add {formData.type === 'income' ? 'Income' : 'Expense'}
        </button>
        <button type="button" className="btn btn-danger" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default FinanceForm;

