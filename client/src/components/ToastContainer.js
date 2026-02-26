import React from 'react';

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
            background: toast.type === 'success' ? 'var(--color-success-bg)'
              : toast.type === 'error' ? 'var(--color-danger-bg)'
              : toast.type === 'warning' ? 'var(--color-warning-bg)'
              : 'rgba(124, 92, 255, 0.15)',
            color: toast.type === 'success' ? 'var(--color-success)'
              : toast.type === 'error' ? 'var(--color-danger)'
              : toast.type === 'warning' ? 'var(--color-warning)'
              : 'var(--accent-primary)',
          }}>
            {icons[toast.type]}
          </span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', flex: 1 }}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;