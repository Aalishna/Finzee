import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="chart-card" style={{ padding: 28, marginBottom: 16 }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [currency, setCurrency] = useState('₹');
  const [emailDigest, setEmailDigest] = useState(false);
  const [saving, setSaving] = useState({});
  const [messages, setMessages] = useState({});
  const [pwErrors, setPwErrors] = useState({});

  const setMsg = (key, msg, type = 'success') => {
    setMessages(p => ({ ...p, [key]: { msg, type } }));
    setTimeout(() => setMessages(p => ({ ...p, [key]: null })), 3000);
  };

  const handleProfileSave = async () => {
    setSaving(p => ({ ...p, profile: true }));
    try {
      await api.put('/auth/profile', profile);
      setMsg('profile', '✓ Profile updated successfully');
    } catch (err) {
      setMsg('profile', err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(p => ({ ...p, profile: false }));
    }
  };

  const handlePasswordSave = async () => {
    const errs = {};
    if (!passwords.current) errs.current = 'Required';
    if (!passwords.newPw || passwords.newPw.length < 6) errs.newPw = 'Min 6 characters';
    if (passwords.newPw !== passwords.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setSaving(p => ({ ...p, password: true }));
    try {
      await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.newPw });
      setMsg('password', '✓ Password changed successfully');
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setMsg('password', err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(p => ({ ...p, password: false }));
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.prompt('Type DELETE to confirm account deletion:');
    if (confirm !== 'DELETE') return;
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/');
    } catch { alert('Failed to delete account'); }
  };

  const msgStyle = (key) => messages[key] ? {
    padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', marginTop: 12,
    background: messages[key].type === 'error' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
    color: messages[key].type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
    border: `1px solid ${messages[key].type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'}40`
  } : { display: 'none' };

  return (
    <div className="page-wrapper" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="👤 Profile Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleProfileSave} disabled={saving.profile}>
            {saving.profile ? 'Saving...' : 'Save Changes'}
          </button>
          <div style={msgStyle('profile')}>{messages.profile?.msg}</div>
        </div>
      </Section>

      {/* Password */}
      <Section title="🔒 Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['current', 'newPw', 'confirm'].map((key, i) => (
            <div className="form-group" key={key}>
              <label className="form-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
              <input className={`form-input ${pwErrors[key] ? 'error' : ''}`} type="password"
                placeholder={['Enter current password', 'Min 6 characters', 'Repeat new password'][i]}
                value={passwords[key]}
                onChange={e => { setPasswords(p => ({ ...p, [key]: e.target.value })); setPwErrors(p => ({ ...p, [key]: '' })); }}
              />
              {pwErrors[key] && <div className="form-error">{pwErrors[key]}</div>}
            </div>
          ))}
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handlePasswordSave} disabled={saving.password}>
            {saving.password ? 'Updating...' : 'Update Password'}
          </button>
          <div style={msgStyle('password')}>{messages.password?.msg}</div>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="⚙️ Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {isDark ? 'Professional futuristic dark theme' : 'Clean aesthetic light theme'}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                width: 48, height: 26, borderRadius: 100,
                background: isDark ? 'var(--accent-primary)' : 'var(--border-color)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, left: isDark ? 25 : 3, transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            </button>
          </div>

          {/* Currency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Currency</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Display currency symbol</div>
            </div>
            <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 'auto' }}>
              <option value="₹">₹ Indian Rupee</option>
              <option value="$">$ US Dollar</option>
              <option value="€">€ Euro</option>
              <option value="£">£ British Pound</option>
            </select>
          </div>

          {/* Email digest */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Weekly Email Digest</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Get a weekly summary of your spending</div>
            </div>
            <button
              onClick={() => setEmailDigest(p => !p)}
              style={{
                width: 48, height: 26, borderRadius: 100,
                background: emailDigest ? 'var(--accent-primary)' : 'var(--border-color)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, left: emailDigest ? 25 : 3, transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            </button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="⚠️ Danger Zone">
        <div style={{ padding: '16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-danger)' }}>Delete Account</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Permanently delete all your data. This cannot be undone.</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      </Section>
    </div>
  );
}

export default Settings;