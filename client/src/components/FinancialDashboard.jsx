import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';

const FinancialDashboard = () => {
  const { finance, summary, fetchSummary } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [budget, setBudget] = useState({
    income: 0,
    expenses: 0,
    categories: {
      'Food': 0,
      'Rent': 0,
      'Transport': 0,
      'Entertainment': 0,
      'Health': 0,
      'Shopping': 0,
      'Bills': 0,
      'Other': 0
    }
  });

  // Get current month's finance data
  const currentMonthFinance = finance.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
  });

  // Calculate totals
  const totalIncome = currentMonthFinance
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = currentMonthFinance
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  // Prepare chart data
  const categoryData = currentMonthFinance
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => {
      const existing = acc.find(cat => cat.name === item.category);
      if (existing) {
        existing.value += item.amount;
        existing.actual += item.amount;
      } else {
        acc.push({ 
          name: item.category, 
          value: item.amount,
          actual: item.amount,
          budget: budget.categories[item.category] || 0
        });
      }
      return acc;
    }, []);

  // Income vs Expenses comparison
  const incomeExpenseData = [
    {
      name: 'Income',
      amount: totalIncome,
      color: '#28a745'
    },
    {
      name: 'Expenses',
      amount: totalExpense,
      color: '#dc3545'
    }
  ];

  // Monthly trend data (last 6 months)
  const monthlyTrendData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthFinance = finance.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
    });
    
    const monthIncome = monthFinance
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const monthExpense = monthFinance
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    monthlyTrendData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpense,
      balance: monthIncome - monthExpense
    });
  }

  // Budget vs Actual comparison
  const budgetComparisonData = categoryData.map(item => ({
    category: item.name,
    budget: item.budget,
    actual: item.actual,
    difference: item.budget - item.actual
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  const formatCurrency = (amount) => {
    // Check if the amount is a whole number
    if (amount % 1 === 0) {
      return `$${amount}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const getBudgetStatus = (actual, budget) => {
    if (actual > budget) return { status: 'Over Budget', color: '#dc3545' };
    if (actual > budget * 0.9) return { status: 'Near Limit', color: '#ffc107' };
    return { status: 'On Track', color: '#28a745' };
  };

  return (
    <div className="container">
      <div className="card">
        <h2>💰 Financial Dashboard</h2>
        
        {/* Month/Year Selector */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{ padding: '8px' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px' }}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button className="btn" onClick={() => fetchSummary(selectedYear, selectedMonth)}>
            Refresh Data
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>💵 Total Income</h3>
            <div className="amount positive">{formatCurrency(totalIncome)}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {currentMonthFinance.filter(item => item.type === 'income').length} transactions
            </div>
          </div>
          <div className="summary-card">
            <h3>💸 Total Expenses</h3>
            <div className="amount negative">{formatCurrency(totalExpense)}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {currentMonthFinance.filter(item => item.type === 'expense').length} transactions
            </div>
          </div>
          <div className="summary-card">
            <h3>💳 Balance</h3>
            <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {balance >= 0 ? 'Surplus' : 'Deficit'}
            </div>
          </div>
          <div className="summary-card">
            <h3>📊 Savings Rate</h3>
            <div className="amount" style={{ color: balance >= 0 ? '#28a745' : '#dc3545' }}>
              {totalIncome > 0 ? `${((balance / totalIncome) * 100).toFixed(1)}%` : '0%'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {balance >= 0 ? 'Positive' : 'Negative'}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          {/* Income vs Expenses Bar Chart */}
          <div className="card">
            <h3>Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Categories Pie Chart */}
          <div className="card">
            <h3>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>📈 6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#28a745" fill="#28a745" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#dc3545" fill="#dc3545" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>🎯 Budget vs Actual Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Budget Status Table */}
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Budget</th>
                  <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Actual</th>
                  <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Difference</th>
                  <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetComparisonData.map((item, index) => {
                  const status = getBudgetStatus(item.actual, item.budget);
                  return (
                    <tr key={index}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.category}</td>
                      <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                        {formatCurrency(item.budget)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>
                        {formatCurrency(item.actual)}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'right', 
                        border: '1px solid #ddd',
                        color: item.difference >= 0 ? '#28a745' : '#dc3545'
                      }}>
                        {formatCurrency(item.difference)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          background: status.color,
                          color: 'white'
                        }}>
                          {status.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>📋 Recent Transactions</h3>
          {currentMonthFinance.length === 0 ? (
            <p>No transactions for this month.</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {currentMonthFinance.slice(0, 10).map(item => (
                <div 
                  key={item._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.description || item.category}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(item.date).toLocaleDateString()} • {item.category}
                    </div>
                  </div>
                  <div style={{ 
                    color: item.type === 'income' ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
