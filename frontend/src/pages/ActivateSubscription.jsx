import { useState } from 'react';
import '../activate-subscription.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://blockbridge-scamguard.onrender.com';

export default function ActivateSubscription() {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const [activationKey, setActivationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const formatActivationKey = (value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Add dashes after every 4 characters
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  const handleKeyChange = (e) => {
    const formatted = formatActivationKey(e.target.value);
    setActivationKey(formatted);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Add BBSG- prefix if not present
    let fullKey = activationKey;
    if (!fullKey.startsWith('BBSG-')) {
      fullKey = `BBSG-${activationKey}`;
    }

    // Validate format
    const keyPattern = /^BBSG-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
    if (!keyPattern.test(fullKey)) {
      setError('Invalid activation key format. Please check and try again.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/activation/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activationKey: fullKey })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.subscription);
        setTimeout(() => {
          window.location.hash = '#/dashboard';
        }, 3000);
      } else {
        setError(data.message || 'Failed to activate subscription');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="activate-container">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2>Subscription Activated!</h2>
          <div className="success-details">
            <p><strong>Plan:</strong> {success.plan}</p>
            <p><strong>Activated:</strong> {new Date(success.activatedAt).toLocaleDateString()}</p>
            <p><strong>Expires:</strong> {new Date(success.expiryDate).toLocaleDateString()}</p>
          </div>
          <p className="redirect-text">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activate-container">
      <div className="activate-card">
        <h1>Activate Your Subscription</h1>
        <p className="subtitle">Enter the activation key you received from the admin</p>

        <form onSubmit={handleSubmit} className="activate-form">
          <div className="form-group">
            <label htmlFor="activationKey">Activation Key</label>
            <div className="key-input-wrapper">
              <span className="key-prefix">BBSG-</span>
              <input
                type="text"
                id="activationKey"
                value={activationKey}
                onChange={handleKeyChange}
                placeholder="XXXX-XXXX-XXXX"
                className="key-input"
                maxLength={14} // 12 characters + 2 dashes
                required
              />
            </div>
            <p className="input-help">Format: BBSG-XXXX-XXXX-XXXX</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="activate-button" 
            disabled={loading || activationKey.length < 14}
          >
            {loading ? 'Activating...' : 'Activate Subscription'}
          </button>
        </form>

        <div className="help-section">
          <h3>Don't have an activation key?</h3>
          <p>1. Submit your payment proof from the pricing page</p>
          <p>2. Wait for admin verification</p>
          <p>3. You'll receive your activation key once approved</p>
          <button onClick={() => window.location.hash = '#/pricing'} className="link-button">
            Go to Pricing →
          </button>
        </div>

        <div className="back-link">
          <button onClick={() => window.location.hash = '#/dashboard'} className="link-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
