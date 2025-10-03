import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const Reports = () => {
  const { tasks } = useTasks();
  const [range, setRange] = useState('weekly');

  const { start, end } = useMemo(() => {
    const today = startOfDay(new Date());
    if (range === 'weekly') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = addDays(start, 6);
      return { start, end };
    }
    // monthly
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start, end };
  }, [range]);

  const inRangeTasks = useMemo(() => {
    return tasks.filter(t => {
      const dt = startOfDay(new Date(t.date));
      return dt >= start && dt <= end;
    });
  }, [tasks, start, end]);

  const completed = inRangeTasks.filter(t => t.status === 'completed').length;
  const total = inRangeTasks.length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const byKind = useMemo(() => {
    const map = { static: 0, recurring: 0, periodic: 0, ad_hoc: 0 };
    inRangeTasks.forEach(t => { map[t.kind || 'ad_hoc'] = (map[t.kind || 'ad_hoc'] || 0) + 1; });
    return map;
  }, [inRangeTasks]);

  return (
    <div className="card">
      <h3>Reports</h3>
      <div className="form-group" style={{ marginBottom: '10px' }}>
        <label>Range</label>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div><strong>Total:</strong> {total}</div>
        <div><strong>Completed:</strong> {completed}</div>
        <div><strong>Pending:</strong> {pending}</div>
        <div><strong>Completion:</strong> {percent}%</div>
      </div>

      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>By Kind</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {Object.entries(byKind).map(([k, v]) => (
          <div key={k} style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', textTransform: 'capitalize' }}>
            {k.replace('_', ' ')}: <strong>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;


