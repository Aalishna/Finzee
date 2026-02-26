import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { expensesAPI, budgetAPI, healthScoreAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo, CHART_COLORS } from '../utils/categoryIcons';
import './Dashboard.css';

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ title, value, subtitle, icon, color, prefix = '₹', suffix = '' }) {
  const animated = useCounter(typeof value === 'number' ? value : 0);
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <div className="stat-trend">{subtitle}</div>
      </div>
      <div className="stat-value">
        {prefix}{typeof value === 'number' ? animated.toLocaleString('en-IN') : value}{suffix}
      </div>
      <div className="stat-title">{title}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <div className="tooltip-label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: </span>
          <span className="tooltip-val">₹{Number(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const [expRes, budgetRes, scoreRes] = await Promise.allSettled([
        expensesAPI.getAll({ month: now.getMonth() + 1, year: now.getFullYear() }),
        budgetAPI.get(),
        healthScoreAPI.get(),
      ]);

      const expenses = expRes.status === 'fulfilled' ? expRes.value.data : [];
      const budget = budgetRes.status === 'fulfilled' ? budgetRes.value.data : null;
      const score = scoreRes.status === 'fulfilled' ? scoreRes.value.data : null;

      // Compute stats
      const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
      const totalBudget = budget?.categories?.reduce((s, c) => s + c.limit, 0) || 0;
      const remaining = totalBudget - totalSpent;

      // Category breakdown
      const catMap = {};
      expenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      const categoryData = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const biggestCat = categoryData[0] || { name: 'None', value: 0 };

      // Weekly data (last 2 weeks)
      const weeklyData = buildWeeklyData(expenses);

      // Monthly trend (daily)
      const monthlyTrend = buildMonthlyTrend(expenses);

      // Recent transactions
      const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

      setData({ totalSpent, totalBudget, remaining, categoryData, biggestCat, weeklyData, monthlyTrend, recent, score, budget });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="dashboard-skeleton">
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
      </div>
    </div>
  );

  const remainingColor = !data.totalBudget ? 'var(--color-success)'
    : data.remaining < 0 ? 'var(--color-danger)'
    : (data.remaining / data.totalBudget) < 0.2 ? 'var(--color-warning)'
    : 'var(--color-success)';

  const scoreColor = !data.score ? 'var(--text-muted)'
    : data.score.total >= 70 ? 'var(--color-success)'
    : data.score.total >= 40 ? 'var(--color-warning)'
    : 'var(--color-danger)';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">Here's your financial snapshot for {getMonthName()}</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Spent This Month"
          value={data.totalSpent}
          subtitle={<span style={{ color: 'var(--color-danger)', fontSize: '0.78rem' }}>↑ This month</span>}
          icon="💸"
          color="var(--accent-primary)"
        />
        <StatCard
          title="Remaining Budget"
          value={Math.abs(data.remaining)}
          prefix={data.remaining < 0 ? '-₹' : '₹'}
          subtitle={<span style={{ color: remainingColor, fontSize: '0.78rem' }}>
            {data.totalBudget ? `of ₹${data.totalBudget.toLocaleString('en-IN')}` : 'No budget set'}
          </span>}
          icon="🎯"
          color={remainingColor}
        />
        <StatCard
          title="Biggest Category"
          value={data.biggestCat.value}
          subtitle={<span style={{ fontSize: '0.78rem' }}>
            {getCategoryInfo(data.biggestCat.name).emoji} {data.biggestCat.name}
          </span>}
          icon="📊"
          color="var(--color-warning)"
        />
        <div className="stat-card score-card" style={{ '--card-color': scoreColor }}>
          <div className="stat-card-top">
            <span className="stat-icon">❤️</span>
            <div className="stat-trend" style={{ color: scoreColor, fontSize: '0.78rem' }}>Financial Health</div>
          </div>
          <ScoreRing score={data.score?.total || 0} color={scoreColor} />
          <div className="stat-title">Health Score</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Spending by Category</h3>
            <span className="chart-subtitle">{getMonthName()}</span>
          </div>
          {data.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.categoryData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="No expenses logged yet" />}
          <div className="pie-legend">
            {data.categoryData.slice(0, 5).map((item, i) => (
              <div key={i} className="legend-item">
                <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="legend-name">{item.name}</span>
                <span className="legend-val">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Weekly Spending</h3>
            <span className="chart-subtitle">This week vs last</span>
          </div>
          {data.weeklyData.some(d => d.thisWeek > 0 || d.lastWeek > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                  tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} />
                <Bar dataKey="thisWeek" name="This Week" fill="var(--chart-1)" radius={[4,4,0,0]} />
                <Bar dataKey="lastWeek" name="Last Week" fill="var(--chart-2)" radius={[4,4,0,0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Not enough data yet" />}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="chart-card full-width-chart">
        <div className="chart-header">
          <h3 className="chart-title">Daily Spending Trend</h3>
          <span className="chart-subtitle">{getMonthName()} — day by day</span>
        </div>
        {data.monthlyTrend.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.monthlyTrend}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" name="Spent" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyChart text="Log expenses to see your spending trend" />}
      </div>

      {/* Recent Transactions */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Recent Transactions</h3>
          <a href="/expenses" className="chart-link">View All →</a>
        </div>
        {data.recent.length > 0 ? (
          <div className="transactions-list">
            {data.recent.map((tx) => {
              const cat = getCategoryInfo(tx.category);
              return (
                <div key={tx._id} className="tx-row">
                  <div className="tx-icon" style={{ background: `${cat.color}18` }}>
                    <span>{cat.emoji}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-desc">{tx.description}</span>
                    <span className="tx-meta">{tx.category} · {formatDate(tx.date)} · <span className="tx-method">{tx.paymentMethod}</span></span>
                  </div>
                  <div className="tx-amount">-₹{tx.amount.toLocaleString('en-IN')}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart text="No transactions yet. Add your first expense!" />
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score, color }) {
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / 100, 1);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color }}>{score}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/100</span>
      </div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
      {text}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getMonthName() {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function buildWeeklyData(expenses) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const thisWeek = {}; const lastWeek = {};
  days.forEach(d => { thisWeek[d] = 0; lastWeek[d] = 0; });

  expenses.forEach(e => {
    const d = new Date(e.date);
    const diff = Math.floor((now - d) / 86400000);
    const dow = days[(d.getDay() + 6) % 7];
    if (diff < 7) thisWeek[dow] = (thisWeek[dow] || 0) + e.amount;
    else if (diff < 14) lastWeek[dow] = (lastWeek[dow] || 0) + e.amount;
  });

  return days.map(d => ({ day: d, thisWeek: thisWeek[d], lastWeek: lastWeek[d] }));
}

function buildMonthlyTrend(expenses) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const data = {};
  for (let i = 1; i <= daysInMonth; i++) data[i] = 0;

  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      data[d.getDate()] = (data[d.getDate()] || 0) + e.amount;
    }
  });

  return Object.entries(data).map(([day, amount]) => ({ day, amount }));
}

export default Dashboard;