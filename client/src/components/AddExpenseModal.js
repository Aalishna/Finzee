import React, { useState } from 'react';
import { expensesAPI } from '../api';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/categoryIcons';
import './AddExpenseModal.css';

const today = () => new Date().toISOString().split('T')[0];

const defaultForm = {
  amount: '',
  category: 'Food',
  date: today(),
  description: '',
  paymentMethod: 'UPI',
};

function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [nlMode, setNlMode] = useState(false);
  const [nlText, setNlText] = useState('');
  const [parsing, setParsing] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const handleParseNL = async () => {
    if (!nlText.trim()) return;
    setParsing(true);
    try {
      const res = await expensesAPI.parseNatural(nlText);
      setForm(p => ({ ...p, ...res.data }));
      setNlMode(false);
    } catch {
      // fallback: basic parse
      const amountMatch = nlText.match(/(\d+(\.\d+)?)/);
      if (amountMatch) setForm(p => ({ ...p, amount: amountMatch[1] }));
      setNlMode(false);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await expensesAPI.create({ ...form, amount: Number(form.amount) });
      onSuccess?.();
      onClose();
      setForm(defaultForm);
      setNlText('');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to add expense' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const selectedCat = CATEGORIES.find(c => c.name === form.category) || CATEGORIES[0];

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Log Expense</h2>
            <p className="modal-sub">Add a new transaction</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* NL toggle */}
        <div className="nl-toggle-bar">
          <button
            className={`nl-tab ${!nlMode ? 'active' : ''}`}
            onClick={() => setNlMode(false)}
          >Manual</button>
          <button
            className={`nl-tab ${nlMode ? 'active' : ''}`}
            onClick={() => setNlMode(true)}
          >✨ Smart Input</button>
        </div>

        {nlMode ? (
          <div className="nl-mode">
            <p className="nl-hint">Try: <em>"spent 500 on lunch yesterday"</em> or <em>"paid 1200 for electricity last Friday"</em></p>
            <textarea
              className="form-input nl-textarea"
              value={nlText}
              onChange={e => setNlText(e.target.value)}
              placeholder="Describe your expense naturally..."
              rows={3}
            />
            <button
              className="btn btn-primary"
              onClick={handleParseNL}
              disabled={parsing || !nlText.trim()}
              style={{ width: '100%', marginTop: 8 }}
            >
              {parsing ? 'Parsing...' : '✨ Parse & Fill'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {errors.general && (
              <div className="form-error" style={{ marginBottom: 12 }}>{errors.general}</div>
            )}

            {/* Amount — hero field */}
            <div className="amount-field">
              <span className="currency-symbol">₹</span>
              <input
                className={`amount-input ${errors.amount ? 'error' : ''}`}
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => handleChange('amount', e.target.value)}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            {errors.amount && <div className="form-error">{errors.amount}</div>}

            {/* Category */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.name}
                      className={`cat-chip ${form.category === cat.name ? 'active' : ''}`}
                      onClick={() => handleChange('category', cat.name)}
                      style={{ '--cat-color': cat.color }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className={`form-input ${errors.description ? 'error' : ''}`}
                type="text"
                placeholder="What did you spend on?"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Date + Payment Method */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment</label>
                <select
                  className="form-input"
                  value={form.paymentMethod}
                  onChange={e => handleChange('paymentMethod', e.target.value)}
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Logging...' : `Log Expense ${selectedCat.emoji}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddExpenseModal;