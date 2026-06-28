import { useState } from 'react';
import '../payment-upload.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function PaymentUpload() {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const [formData, setFormData] = useState({
    plan: 'PRO',
    transactionId: '',
    screenshot: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const planDetails = {
    PRO: { name: 'Pro Plan', price: '₹199', duration: '30 days' },
    BUSINESS: { name: 'Business Plan', price: '₹499', duration: '180 days' }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PNG and JPEG images are allowed');
        return;
      }

      setFormData({ ...formData, screenshot: file });
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.screenshot) {
      setError('Please upload a payment screenshot');
      setLoading(false);
      return;
    }

    if (!formData.transactionId.trim()) {
      setError('Please enter a transaction ID');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      const submitData = new FormData();
      submitData.append('screenshot', formData.screenshot);
      submitData.append('transactionId', formData.transactionId);
      submitData.append('plan', formData.plan);

      const response = await fetch(`${API_URL}/api/payment-requests/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.hash = '#/my-payments';
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit payment proof');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-upload-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Payment Proof Submitted!</h2>
          <p>Your payment proof has been submitted successfully.</p>
          <p>You will receive an activation key once an admin verifies your payment.</p>
          <p className="redirect-text">Redirecting to your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-upload-container">
      <div className="payment-upload-card">
        <h1>Submit Payment Proof</h1>
        
        <div className="payment-instructions">
          <h3>Payment Instructions</h3>
          <div className="instruction-box">
            <p><strong>UPI ID:</strong> blockbridge@upi</p>
            <p><strong>Phone Number:</strong> +91 9876543210</p>
            <p className="note">Please make the payment and upload the screenshot below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="plan">Select Plan</label>
            <select
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="form-select"
            >
              <option value="PRO">
                {planDetails.PRO.name} - {planDetails.PRO.price} ({planDetails.PRO.duration})
              </option>
              <option value="BUSINESS">
                {planDetails.BUSINESS.name} - {planDetails.BUSINESS.price} ({planDetails.BUSINESS.duration})
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transactionId">Transaction ID / UPI Reference</label>
            <input
              type="text"
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="Enter your UPI transaction ID"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="screenshot">Payment Screenshot</label>
            <input
              type="file"
              id="screenshot"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="form-input-file"
              required
            />
            <p className="file-help">Max file size: 5MB. Formats: PNG, JPEG</p>
          </div>

          {preview && (
            <div className="preview-container">
              <p className="preview-label">Preview:</p>
              <img src={preview} alt="Payment screenshot preview" className="screenshot-preview" />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </form>

        <div className="back-link">
          <button onClick={() => window.location.hash = '#/pricing'} className="link-button">
            ← Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
