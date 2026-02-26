.auth-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.auth-bg-shapes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(124, 92, 255, 0.15) 0%, transparent 70%);
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 229, 160, 0.08) 0%, transparent 70%);
  bottom: -80px;
  left: -80px;
}

[data-theme='light'] .shape-1 {
  background: radial-gradient(circle, rgba(108, 63, 255, 0.1) 0%, transparent 70%);
}

[data-theme='light'] .shape-2 {
  background: radial-gradient(circle, rgba(0, 166, 118, 0.06) 0%, transparent 70%);
}

.auth-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
}

.landing-logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-primary), #B39DFF);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  color: #fff;
  box-shadow: 0 4px 12px var(--accent-glow);
}

.theme-btn {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn:hover {
  border-color: var(--accent-primary);
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(124, 92, 255, 0.08);
  animation: fadeInUp 0.4s ease;
}

[data-theme='light'] .auth-card {
  box-shadow: 0 8px 40px rgba(100, 70, 200, 0.12);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-card-header {
  margin-bottom: 28px;
  text-align: center;
}

.auth-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-error-banner {
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: var(--border-radius-sm);
  padding: 10px 14px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 20px;
}

.pw-field {
  position: relative;
}

.pw-field .form-input {
  padding-right: 44px;
}

.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.auth-switch a {
  color: var(--accent-primary);
  font-weight: 600;
}

.auth-switch a:hover {
  color: var(--accent-primary-hover);
}
