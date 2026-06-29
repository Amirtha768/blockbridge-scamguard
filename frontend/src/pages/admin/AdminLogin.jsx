import { useState } from 'react';
import '../../admin-login.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://blockbridge-scamguard.onrender.com';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        window.location.hash = '#/admin/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <h1>🔐 Admin Login</h1>
          <p>BlockBridge ScamGuard AI - Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@blockbridge.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter admin password"
              className="form-input"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="back-link">
          <button onClick={() => window.location.hash = '#/'} className="link-button">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
