import React, { useState, useEffect } from 'react';
import { insightsAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TYPE_CONFIG = {
  warning:  { bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)',  icon: '⚠️' },
  positive: { bg: 'var(--color-success-bg)',  color: 'var(--color-success)',  icon: '✅' },
  info:     { bg: 'rgba(124,92,255,0.08)',     color: 'var(--accent-primary)', icon: '💡' },
  danger:   { bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)',   icon: '🚨' },
};

function InsightCard({ insight }) {
  const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border-color)`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 'var(--border-radius-md)',
      padding: '18px 20px',
      display: 'flex',
      gap: 14,
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Syne' }}>
          {insight.title}
        </div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {insight.description}
        </div>
        {insight.action && (
          <a href={insight.actionLink || '#'} style={{
            display: 'inline-block', marginTop: 8,
            fontSize: '0.78rem', color: cfg.color,
            fontWeight: 600, textDecoration: 'none'
          }}>
            {insight.action} →
          </a>
        )}
      </div>
    </div>
  );
}

function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsAPI.get()
      .then(res => setData(res.data))
      .catch(() => setData(getMockInsights()))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
      </div>
    </div>
  );

  const insights = data?.insights || [];
  const forecast = data?.forecast || [];
  const recurring = data?.recurring || [];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">💡 Smart Insights</h1>
        <p className="page-subtitle">Your money's story — patterns, predictions, and what to watch</p>
      </div>

      {/* Insights feed */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
        {insights.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
            <div>Log a few expenses to unlock your insights!</div>
          </div>
        ) : insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 20 }}>
          <div className="chart-header">
            <div>
              <h3 className="chart-title">📈 Month-End Forecast</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Based on your current daily spending pace</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10 }} />
              {data?.budget > 0 && <ReferenceLine y={data.budget} stroke="var(--color-danger)" strokeDasharray="6 3" label={{ value: 'Budget', fill: 'var(--color-danger)', fontSize: 11 }} />}
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 20, height: 2, background: 'var(--chart-1)' }} /> Actual spending
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 20, height: 2, background: 'var(--color-warning)', borderTop: '2px dashed var(--color-warning)' }} /> Projected
            </div>
          </div>
        </div>
      )}

      {/* Recurring */}
      {recurring.length > 0 && (
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">🔄 Recurring Expenses Detected</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Auto-detected subscriptions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recurring.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-sm)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{r.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.frequency} · {r.category}</div>
                </div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--color-danger)', fontSize: '0.95rem' }}>
                  ₹{r.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--color-danger-bg)', borderRadius: 'var(--border-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total recurring/month</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--color-danger)' }}>
                ₹{recurring.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMockInsights() {
  return {
    insights: [
      { type: 'info', title: 'Start logging to unlock insights', description: 'Add at least 10 expenses across different categories to see your personalized spending story.' },
    ],
    forecast: [],
    recurring: [],
  };
}

export default Insights;