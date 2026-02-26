import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../api';
import { getCategoryInfo, CATEGORIES, PAYMENT_METHODS } from '../utils/categoryIcons';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', paymentMethod: '', sortBy: 'date' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { loadExpenses(); }, []);
  useEffect(() => { applyFilters(); }, [expenses, search, filters]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await expensesAPI.getAll();
      setExpenses(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let list = [...expenses];
    if (search) list = list.filter(e =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.category) list = list.filter(e => e.category === filters.category);
    if (filters.paymentMethod) list = list.filter(e => e.paymentMethod === filters.paymentMethod);
    list.sort((a, b) => filters.sortBy === 'amount'
      ? b.amount - a.amount
      : new Date(b.date) - new Date(a.date)
    );
    setFiltered(list);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      setExpenses(p => p.filter(e => e._id !== id));
    } catch (e) { alert('Failed to delete'); }
  };

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Category', 'Amount', 'Payment Method']];
    filtered.forEach(e => rows.push([
      new Date(e.date).toLocaleDateString('en-IN'),
      e.description, e.category, e.amount, e.paymentMethod
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'finzee-expenses.csv';
    a.click();
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            {filtered.length} transactions · Total: <strong style={{ color: 'var(--color-danger)' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      {/* Filters */}
      <div className="expenses-filters">
        <input
          className="form-input expenses-search"
          placeholder="🔍 Search description or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-input filter-select" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
        </select>
        <select className="form-input filter-select" value={filters.paymentMethod} onChange={e => setFilters(p => ({ ...p, paymentMethod: e.target.value }))}>
          <option value="">All Payments</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="form-input filter-select" value={filters.sortBy} onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))}>
          <option value="date">Sort: Newest</option>
          <option value="amount">Sort: Amount</option>
        </select>
      </div>

      {/* Table */}
      <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
            No transactions found
          </div>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => {
                const cat = getCategoryInfo(tx.category);
                return (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: `${cat.color}18`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                          {cat.emoji}
                        </div>
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{tx.category}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{tx.description}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{tx.paymentMethod}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--color-danger)' }}>
                        -₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <button className="btn-icon btn-sm" onClick={() => handleDelete(tx._id)} title="Delete"
                          style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>

      <style>{`
        .expenses-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .expenses-search { flex: 1; min-width: 200px; }
        .filter-select { width: auto; }

        .expenses-table {
          width: 100%;
          border-collapse: collapse;
        }
        .expenses-table th {
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
          text-align: left;
        }
        .expenses-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .expenses-table tbody tr:last-child td {
          border-bottom: none;
        }
        .expenses-table tbody tr:hover {
          background: var(--bg-glass);
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}

export default Expenses;