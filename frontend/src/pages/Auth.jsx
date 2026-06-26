import { useState } from 'react';
import '../styles.css';
import '../auth.css';
import API from '../config.js';

function validate(form, isLogin) {
  const errs = {};
  if (!isLogin && !form.name.trim()) errs.name = 'Full name is required.';
  if (!form.email.trim()) errs.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
  if (!form.password) errs.password = 'Password is required.';
  else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
  if (!isLogin && form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
  return errs;
}

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  function switchMode() {
    setIsLogin(p => !p);
    setErrors({});
    setServerError('');
    setForm({ name: '', email: '', password: '', confirm: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, isLogin);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Something went wrong. Please try again.');
      } else {
        if (data.token) {
          localStorage.setItem('bb_token', data.token);
          localStorage.setItem('bb_user', JSON.stringify(data.user));
        }
        window.location.hash = '#/dashboard';
      }
    } catch {
      setServerError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const passStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', level: 1 };
    if (p.length < 10 || !/[0-9]/.test(p)) return { label: 'Fair', level: 2 };
    if (/[A-Z]/.test(p) && /[^A-Za-z0-9]/.test(p)) return { label: 'Strong', level: 3 };
    return { label: 'Good', level: 2 };
  })();

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <a href="#/" className="auth-logo">BlockBridge ScamGuard AI</a>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin
            ? 'Login to continue protecting yourself from online scams.'
            : 'Start protecting yourself with AI-powered scam detection.'
          }</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="auth-error-banner">{serverError}</div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name" type="text" placeholder="Your full name"
                value={form.name} onChange={set('name')}
                className={errors.name ? 'input-error' : ''}
                autoComplete="name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="auth-password">Password</label>
              {isLogin && <a href="#/" className="forgot-link">Forgot password?</a>}
            </div>
            <div className="input-wrap">
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                placeholder={isLogin ? 'Your password' : 'Min. 8 characters'}
                value={form.password} onChange={set('password')}
                className={errors.password ? 'input-error' : ''}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)} aria-label="Toggle password visibility">
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
            {!isLogin && passStrength && (
              <div className="pass-strength">
                <div className="strength-bar">
                  <div className={`strength-fill level-${passStrength.level}`} />
                </div>
                <span className={`strength-label s${passStrength.level}`}>{passStrength.label}</span>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <input
                id="auth-confirm" type={showPass ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirm} onChange={set('confirm')}
                className={errors.confirm ? 'input-error' : ''}
                autoComplete="new-password"
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          )}

          {isLogin && (
            <label className="remember-row">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
          )}

          <button type="submit" className="button button-primary auth-submit" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : isLogin ? 'Login to Dashboard' : 'Create Account'
            }
          </button>
        </form>

        {/* Switch */}
        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button className="switch-link" onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;




