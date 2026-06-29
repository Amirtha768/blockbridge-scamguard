import { useState, useEffect } from 'react';
import '../my-payments.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://blockbridge-scamguard.onrender.com';

export default function MyPayments() {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/payment-requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPayments(data.requests);
      } else {
        setError(data.message || 'Failed to load payment requests');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('An error occurred while loading your payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'status-pending', text: 'Pending Review' },
      APPROVED: { class: 'status-approved', text: 'Approved' },
      REJECTED: { class: 'status-rejected', text: 'Rejected' }
    };
    const badge = badges[status] || { class: '', text: status };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-payments-container">
        <div className="loading">Loading your payment requests...</div>
      </div>
    );
  }

  return (
    <div className="my-payments-container">
      <div className="my-payments-header">
        <h1>My Payment Requests</h1>
        <button onClick={() => window.location.hash = '#/payment-upload'} className="new-payment-button">
          + New Payment Request
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No payment requests yet</p>
          <button onClick={() => window.location.hash = '#/payment-upload'} className="primary-button">
            Submit Your First Payment
          </button>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div>
                  <h3>{payment.plan} Plan</h3>
                  <p className="payment-id">Request #{payment.id}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{payment.transaction_id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatDate(payment.created_at)}</span>
                </div>
                {payment.verified_at && (
                  <div className="detail-row">
                    <span className="label">Verified:</span>
                    <span className="value">{formatDate(payment.verified_at)}</span>
                  </div>
                )}
              </div>

              {payment.status === 'APPROVED' && (
                <div className="approved-message">
                  <p>✓ Your payment has been approved!</p>
                  <p className="small">Check your email for the activation key</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="back-link">
        <button onClick={() => window.location.hash = '#/dashboard'} className="link-button">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
