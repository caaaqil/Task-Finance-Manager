import React, { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import { FinanceProvider } from './context/FinanceContext';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import FinancialDashboard from './pages/FinancialDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Home />;
      case 'tasks':
        return <Tasks />;
      case 'finance':
        return <Finance />;
      case 'financial-dashboard':
        return <FinancialDashboard />;
      default:
        return <Home />;
    }
  };

  return (
    <TaskProvider>
      <FinanceProvider>
        <div>
          <nav className="navbar">
            <h1>Task & Finance Manager</h1>
          </nav>
          
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📅 Schedule
            </button>
            <button
              className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              📋 Tasks
            </button>
            <button
              className={`nav-tab ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
            >
              💰 Add Finance
            </button>
            <button
              className={`nav-tab ${activeTab === 'financial-dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('financial-dashboard')}
            >
              📊 Finance Dashboard
            </button>
          </div>
          
          {renderContent()}
        </div>
      </FinanceProvider>
    </TaskProvider>
  );
}

export default App;

