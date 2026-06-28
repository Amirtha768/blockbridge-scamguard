import { useState, useEffect } from 'react';
import '../../admin-dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.hash = '#/admin/login';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    
    try {
      const [statsRes, paymentsRes, keysRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/payment-requests?status=PENDING`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/activation-keys`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const paymentsData = await paymentsRes.json();
      const keysData = await keysRes.json();

      if (statsRes.ok) setStats(statsData.stats);
      if (paymentsRes.ok) setPayments(paymentsData.requests);
      if (keysRes.ok) setKeys(keysData.keys);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (requestId) => {
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch(`${API_URL}/api/admin/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedKey(data.activationKey);
        alert(`Payment verified! Activation Key: ${data.activationKey}`);
        fetchData();
      } else {
        alert(data.message || 'Failed to verify payment');
      }
    } catch (err) {
      alert('Error verifying payment');
    }
  };

  const handleRejectPayment = async (requestId) => {
    const notes = prompt('Rejection reason:');
    if (!notes) return;

    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch(`${API_URL}/api/admin/reject-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, notes })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment request rejected');
        fetchData();
      } else {
        alert(data.message || 'Failed to reject payment');
      }
    } catch (err) {
      alert('Error rejecting payment');
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this key?')) return;

    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch(`${API_URL}/api/admin/revoke-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keyId })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Key revoked successfully');
        fetchData();
      } else {
        alert(data.message || 'Failed to revoke key');
      }
    } catch (err) {
      alert('Error revoking key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.hash = '#/admin/login';
  };

  if (loading) {
    return <div className="admin-container"><div className="loading">Loading admin panel...</div></div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🔐 Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === 'overview' ? 'tab active' : 'tab'} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'payments' ? 'tab active' : 'tab'} onClick={() => setActiveTab('payments')}>Payments ({payments.length})</button>
        <button className={activeTab === 'keys' ? 'tab active' : 'tab'} onClick={() => setActiveTab('keys')}>Keys ({keys.length})</button>
      </nav>

      {activeTab === 'overview' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <div className="stat-number">{stats.pendingPayments}</div>
            </div>
            <div className="stat-card">
              <h3>Active Subscriptions</h3>
              <div className="stat-number">{stats.activeSubscriptions}</div>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <div className="stat-number">₹{stats.totalRevenue}</div>
            </div>
          </div>

          <h3>Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <span>{activity.user_email}</span>
                <span>{activity.plan} - ₹{activity.amount}</span>
                <span>{new Date(activity.verified_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="admin-content">
          <h2>Pending Payment Requests</h2>
          {payments.length === 0 ? (
            <p>No pending payments</p>
          ) : (
            <div className="payments-grid">
              {payments.map(payment => (
                <div key={payment.id} className="payment-card">
                  <h4>{payment.user_name} ({payment.user_email})</h4>
                  <p><strong>Plan:</strong> {payment.plan} - ₹{payment.amount}</p>
                  <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
                  <p><strong>Submitted:</strong> {new Date(payment.created_at).toLocaleString()}</p>
                  
                  <button onClick={() => window.open(`${API_URL}${payment.screenshot_url}`, '_blank')} className="view-screenshot-button">
                    View Screenshot
                  </button>

                  <div className="payment-actions">
                    <button onClick={() => handleVerifyPayment(payment.id)} className="verify-button">
                      ✓ Verify & Generate Key
                    </button>
                    <button onClick={() => handleRejectPayment(payment.id)} className="reject-button">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {generatedKey && (
            <div className="generated-key-modal">
              <div className="modal-content">
                <h3>Activation Key Generated!</h3>
                <div className="key-display">{generatedKey}</div>
                <button onClick={() => copyToClipboard(generatedKey)} className="copy-button">Copy Key</button>
                <button onClick={() => setGeneratedKey('')} className="close-button">Close</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="admin-content">
          <h2>Activation Keys</h2>
          <div className="keys-table">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(key => (
                  <tr key={key.id}>
                    <td>
                      <code>{key.activation_key}</code>
                      <button onClick={() => copyToClipboard(key.activation_key)} className="copy-icon">📋</button>
                    </td>
                    <td>{key.user_email}</td>
                    <td>{key.plan}</td>
                    <td><span className={`status-badge status-${key.status.toLowerCase()}`}>{key.status}</span></td>
                    <td>{new Date(key.generated_at).toLocaleDateString()}</td>
                    <td>
                      {key.status === 'UNUSED' && (
                        <button onClick={() => handleRevokeKey(key.id)} className="revoke-button">Revoke</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
