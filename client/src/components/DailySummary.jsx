import React, { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';

const DailySummary = () => {
  const { tasks } = useTasks();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
  }, []);

  const todayTasks = useMemo(() => {
    const today = new Date(todayStr);
    return tasks.filter(t => {
      const include = t.dailySummary !== false;
      if (!include) return false;
      const td = new Date(t.date);
      const tOnly = new Date(td.getFullYear(), td.getMonth(), td.getDate());
      return tOnly.getTime() === today.getTime();
    });
  }, [tasks, todayStr]);

  const completed = todayTasks.filter(t => t.status === 'completed').length;
  const pending = todayTasks.filter(t => t.status !== 'completed').length;
  const total = todayTasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const isAfterNine = now.getHours() >= 21; // 9pm

  return (
    <div className="card">
      <h3>Daily Summary</h3>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        Today: {new Date().toLocaleDateString()}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div><strong>Total:</strong> {total}</div>
        <div><strong>Completed:</strong> {completed}</div>
        <div><strong>Pending:</strong> {pending}</div>
        <div><strong>Completion:</strong> {percent}%</div>
      </div>
      {isAfterNine && (
        <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>9pm Report</div>
          <div>Completed {completed} of {total} tasks ({percent}%).</div>
        </div>
      )}
    </div>
  );
};

export default DailySummary;


