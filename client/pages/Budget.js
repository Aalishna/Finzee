import React, { useState, useEffect } from 'react';
import { budgetAPI, expensesAPI } from '../api';
import { CATEGORIES, getCategoryInfo } from '../utils/categoryIcons';

function Budget() {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const now = new Date();
    try {
      const [budgetRes, expRes] = await Promise.allSettled([
        budgetAPI.get(),
        expensesAPI.getAll({ month: now.getMonth() + 1, year: now.getFullYear() })
      ]);
      if (budgetRes.status === 'fulfilled') setBudget(budgetRes.value.data);
      if (expRes.status === 'fulfilled') setExpenses(expRes.value.data);
    } finally { setLoading(false); }
  };

  const getSpent = (catName) => expenses.filter(e => e.category === catName).reduce((s, e) => s + e.amount, 0);
  const getLimit = (catName) => budget?.categories?.find(c => c.name === catName)?.limit || 0;

  const handleSave = async (catName) => {
    const val = Number(editValue);
    if (!val || val <= 0) return;
    setSaving(true);
    try {
      await budgetAPI.update(catName, { limit: val });
      await loadData();
      setEditCat(null);
    } catch {
      // Try create
      try {
        const cats = (budget?.categories || []).filter(c => c.name !== catName);
        cats.push({ name: catName, limit: val });
        await budgetAPI.set({ categories: cats });
        await loadData();
        setEditCat(null);
      } catch (e) { alert('Failed to save budget'); }
    } finally { setSaving(false); }
  };

  const exceeded = CATEGORIES.filter(cat => {
    const spent = getSpent(cat.name);
    const limit = getLimit(cat.name);
    return limit > 0 && spent > limit;
  });

  if (loading) return <div className="page-wrapper"><div style={{ color: 'var(--text-muted)' }}>Loading budget...</div></div>;

  const totalBudget = CATEGORIES.reduce((s, c) => s + getLimit(c.name), 0);
  const totalSpent = CATEGORIES.reduce((s, c) => s + getSpent(c.name), 0);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Budget Planner</h1>
        <p className="page-subtitle">Set monthly limits per category and track your spending</p>
      </div>

      {/* Alert banner */}
      {exceeded.length > 0 && (
        <div style={{
          background: 'var(--color-danger-bg)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--color-danger)',
          fontSize: '0.88rem',
          fontWeight: 500
        }}>
          ⚠️ Budget exceeded in: {exceeded.map(c => `${getCategoryInfo(c.name).emoji} ${c.name}`).join(', ')}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Budget', val: `₹${totalBudget.toLocaleString('en-IN')}`, color: 'var(--accent-primary)' },
          { label: 'Total Spent', val: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'var(--color-danger)' },
          { label: 'Remaining', val: `₹${Math.max(0, totalBudget - totalSpent).toLocaleString('en-IN')}`, color: 'var(--color-success)' },
        ].map(item => (
          <div key={item.label} className="chart-card" style={{ textAlign: 'center', padding: 18 }}>
            <div style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {CATEGORIES.map(cat => {
          const info = getCategoryInfo(cat.name);
          const spent = getSpent(cat.name);
          const limit = getLimit(cat.name);
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const overpct = limit > 0 ? Math.max(0, ((spent - limit) / limit) * 100) : 0;
          const barColor = !limit ? 'var(--text-muted)'
            : pct >= 100 ? 'var(--color-danger)'
            : pct >= 80 ? 'var(--color-warning)'
            : pct >= 60 ? 'var(--color-warning)'
            : 'var(--color-success)';
          const isEditing = editCat === cat.name;

          return (
            <div key={cat.name} className="chart-card" style={{
              padding: 18,
              borderColor: pct >= 100 ? 'var(--color-danger)' : 'var(--border-color)',
              transition: 'border-color 0.3s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: `${info.color}18`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    {info.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{cat.name}</div>
                    {pct >= 100 && <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>EXCEEDED</div>}
                    {pct >= 80 && pct < 100 && <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)', fontWeight: 600 }}>NEAR LIMIT</div>}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setEditCat(isEditing ? null : cat.name); setEditValue(limit || ''); }}
                >
                  {isEditing ? 'Cancel' : limit ? 'Edit' : '+ Set'}
                </button>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Monthly limit (₹)"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => handleSave(cat.name)} disabled={saving}>
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Progress bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ background: 'var(--bg-input)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: 100,
                    transition: 'width 1s ease',
                    boxShadow: pct >= 100 ? `0 0 8px ${barColor}` : 'none'
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Spent: <strong style={{ color: 'var(--text-primary)' }}>₹{spent.toLocaleString('en-IN')}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {limit ? <>Budget: <strong style={{ color: 'var(--text-primary)' }}>₹{limit.toLocaleString('en-IN')}</strong></> : 'No budget set'}
                </span>
                {limit > 0 && (
                  <span style={{ color: barColor, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Budget;