import React, { useState, useEffect, useRef } from 'react';
import { goalsAPI } from '../api';

function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: -10,
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2,
      color: ['#00E5A0','#7C5CFF','#FFB547','#FF6B8A','#38BDF8'][Math.floor(Math.random()*5)],
      size: Math.random() * 8 + 4, rotation: Math.random() * 360, vr: (Math.random()-0.5)*6
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.y < canvas.height) { alive = true; }
        p.x += p.vx; p.y += p.vy; p.rotation += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size/2);
        ctx.restore();
      });
      if (alive) animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: 'inherit' }} />;
}

const GOAL_EMOJIS = ['🎯','🏖️','🚗','🏠','📱','✈️','💎','🎓','💻','🎸'];

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', savedAmount: '', targetDate: '', emoji: '🎯' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [updateGoal, setUpdateGoal] = useState(null);
  const [updateAmount, setUpdateAmount] = useState('');

  useEffect(() => {
    goalsAPI.getAll().then(r => setGoals(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name) errs.name = 'Required';
    if (!form.targetAmount || Number(form.targetAmount) <= 0) errs.targetAmount = 'Enter a valid amount';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const res = await goalsAPI.create({ ...form, name: `${form.emoji} ${form.name}`, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount) || 0 });
      setGoals(p => [...p, res.data]);
      setShowAdd(false);
      setForm({ name: '', targetAmount: '', savedAmount: '', targetDate: '', emoji: '🎯' });
    } catch { alert('Failed to create goal'); }
    finally { setSaving(false); }
  };

  const handleUpdateSavings = async (goalId) => {
    const amt = Number(updateAmount);
    if (!amt) return;
    try {
      const goal = goals.find(g => g._id === goalId);
      const newSaved = Math.min(goal.savedAmount + amt, goal.targetAmount);
      const res = await goalsAPI.update(goalId, { savedAmount: newSaved });
      setGoals(p => p.map(g => g._id === goalId ? res.data : g));
      setUpdateGoal(null);
      setUpdateAmount('');
    } catch { alert('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalsAPI.delete(id);
      setGoals(p => p.filter(g => g._id !== id));
    } catch { alert('Failed to delete'); }
  };

  if (loading) return <div className="page-wrapper"><div style={{ color: 'var(--text-muted)' }}>Loading goals...</div></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set targets, track progress, celebrate wins 🎉</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(p => !p)}>
          {showAdd ? '✕ Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="chart-card" style={{ marginBottom: 20, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16, fontSize: '1rem' }}>Create New Goal</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Emoji picker */}
            <div>
              <label className="form-label">Choose Icon</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {GOAL_EMOJIS.map(em => (
                  <button type="button" key={em} onClick={() => setForm(p => ({ ...p, emoji: em }))}
                    style={{ fontSize: '1.3rem', padding: '6px 10px', borderRadius: 10, border: `2px solid ${form.emoji === em ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: form.emoji === em ? 'rgba(124,92,255,0.1)' : 'var(--bg-input)', cursor: 'pointer' }}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Vacation Fund" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount (₹)</label>
                <input className={`form-input ${errors.targetAmount ? 'error' : ''}`} type="number" placeholder="50000" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} />
                {errors.targetAmount && <div className="form-error">{errors.targetAmount}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Already Saved (₹)</label>
                <input className="form-input" type="number" placeholder="0" value={form.savedAmount} onChange={e => setForm(p => ({ ...p, savedAmount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input className="form-input" type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', minWidth: 140 }}>
              {saving ? 'Creating...' : '+ Create Goal'}
            </button>
          </form>
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="chart-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
          <h3 style={{ fontFamily: 'Syne', marginBottom: 8 }}>No goals yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>Set your first savings goal and start building your future</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create Your First Goal</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
            const completed = pct >= 100;
            const remaining = goal.targetAmount - goal.savedAmount;
            const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000) : null;

            return (
              <div key={goal._id} className="chart-card" style={{
                padding: 22, position: 'relative', overflow: 'hidden',
                borderColor: completed ? 'var(--color-success)' : 'var(--border-color)',
                boxShadow: completed ? 'var(--shadow-success)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <Confetti active={completed} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{goal.name}</div>
                    {daysLeft !== null && (
                      <div style={{ fontSize: '0.75rem', color: daysLeft < 30 ? 'var(--color-warning)' : 'var(--text-muted)', marginTop: 2 }}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}
                      </div>
                    )}
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(goal._id)} style={{ color: 'var(--color-danger)', borderColor: 'transparent' }}>🗑</button>
                </div>

                {/* Amounts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: completed ? 'var(--color-success)' : 'var(--text-primary)' }}>
                      ₹{goal.savedAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>saved</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                      ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>target</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'var(--bg-input)', borderRadius: 100, height: 10, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 100,
                    background: completed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--accent-primary), var(--color-success))',
                    transition: 'width 1.2s ease',
                    boxShadow: completed ? '0 0 10px var(--color-success)' : 'none'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 12 }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{pct.toFixed(0)}% complete</span>
                  {!completed && <span style={{ color: 'var(--text-muted)' }}>₹{remaining.toLocaleString('en-IN')} to go</span>}
                </div>

                {completed ? (
                  <div style={{ textAlign: 'center', padding: '10px', background: 'var(--color-success-bg)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.88rem' }}>
                    🎉 Goal Achieved! Amazing work!
                  </div>
                ) : updateGoal === goal._id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" type="number" placeholder="Amount to add (₹)" value={updateAmount} onChange={e => setUpdateAmount(e.target.value)} style={{ flex: 1 }} autoFocus />
                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdateSavings(goal._id)}>Add</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setUpdateGoal(null)}>✕</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.82rem' }} onClick={() => { setUpdateGoal(goal._id); setUpdateAmount(''); }}>
                    + Add Savings
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;