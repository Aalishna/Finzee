import React, { useState, useEffect } from 'react';
import { healthScoreAPI } from '../api';

function ScoreRingLarge({ score, color }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const radius = 80;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(animated / 100, 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: 200, height: 200 }}>
      <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="12" />
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
        {/* Glow */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" opacity="0.3"
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: 'blur(4px)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '3rem', color, lineHeight: 1 }}>{animated}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>out of 100</div>
      </div>
    </div>
  );
}

function ComponentBar({ label, score, max, color, description }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>{description}</span>
        </div>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, color, fontSize: '0.95rem' }}>{score}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>/{max}</span></span>
      </div>
      <div style={{ background: 'var(--bg-input)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: 100, transition: 'width 1.2s ease',
          boxShadow: `0 0 8px ${color}60`
        }} />
      </div>
    </div>
  );
}

const GRADE_MAP = { A: 'Excellent', B: 'Good', C: 'Fair', D: 'Needs Work', F: 'Critical' };

function getGrade(score) {
  if (score >= 85) return { grade: 'A', label: 'Excellent', color: 'var(--color-success)' };
  if (score >= 70) return { grade: 'B', label: 'Good', color: 'var(--color-success)' };
  if (score >= 55) return { grade: 'C', label: 'Fair', color: 'var(--color-warning)' };
  if (score >= 40) return { grade: 'D', label: 'Needs Work', color: 'var(--color-warning)' };
  return { grade: 'F', label: 'Critical', color: 'var(--color-danger)' };
}

function HealthScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthScoreAPI.get()
      .then(r => setData(r.data))
      .catch(() => setData({ total: 0, budgetAdherence: 0, savingsRate: 0, spendingConsistency: 0, tips: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrapper"><div style={{ color: 'var(--text-muted)' }}>Computing your health score...</div></div>;

  const score = data.total || 0;
  const scoreColor = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  const { grade, label } = getGrade(score);

  const defaultTips = [
    '💡 Start tracking all your expenses consistently',
    '💰 Set a budget for each spending category',
    '🎯 Create at least one savings goal',
    '📉 Aim to spend less than your monthly budget',
    '🔄 Review your recurring expenses monthly',
  ];
  const tips = data.tips?.length ? data.tips : defaultTips;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Financial Health Score</h1>
        <p className="page-subtitle">A holistic view of your financial wellness</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Score display */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
          <ScoreRingLarge score={score} color={scoreColor} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: scoreColor, lineHeight: 1 }}>{grade}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>{label}</div>
          </div>
          <div style={{ padding: '10px 20px', background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`, borderRadius: 100, fontSize: '0.82rem', color: scoreColor, fontWeight: 600, textAlign: 'center' }}>
            {score >= 70 ? '🎉 Great financial health!' : score >= 40 ? '📈 Room to improve' : '⚠️ Needs attention'}
          </div>
        </div>

        {/* Breakdown */}
        <div className="chart-card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: 24 }}>Score Breakdown</h3>
          <ComponentBar
            label="Budget Adherence"
            score={data.budgetAdherence || 0}
            max={40}
            color={data.budgetAdherence >= 28 ? 'var(--color-success)' : data.budgetAdherence >= 16 ? 'var(--color-warning)' : 'var(--color-danger)'}
            description="Staying within category limits"
          />
          <ComponentBar
            label="Savings Rate"
            score={data.savingsRate || 0}
            max={30}
            color={data.savingsRate >= 21 ? 'var(--color-success)' : data.savingsRate >= 12 ? 'var(--color-warning)' : 'var(--color-danger)'}
            description="% of income saved"
          />
          <ComponentBar
            label="Spending Consistency"
            score={data.spendingConsistency || 0}
            max={30}
            color={data.spendingConsistency >= 21 ? 'var(--color-success)' : data.spendingConsistency >= 12 ? 'var(--color-warning)' : 'var(--color-danger)'}
            description="Predictability of your spending"
          />
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Score updates daily based on your real transactions and budget data.
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="chart-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: 16 }}>💡 Tips to Improve Your Score</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              {tip}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .health-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default HealthScore;