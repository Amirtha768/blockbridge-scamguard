import { useState, useEffect } from 'react';
import '../styles.css';
import '../dashboard.css';
import API from '../config.js';

const FREE_LIMIT = 5;

function getUser() {
  try { return JSON.parse(localStorage.getItem('bb_user')); } catch { return null; }
}

const SCANNERS = [
  { id: 'url',      icon: '🔍', label: 'URL Scanner',         premium: false, field: 'url',     type: 'input',    placeholder: 'https://suspicious-site.com' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp Scanner',    premium: false, field: 'message', type: 'textarea', placeholder: 'Paste WhatsApp message here…' },
  { id: 'email',    icon: '📧', label: 'Email Scanner',       premium: false, field: 'content', type: 'textarea', placeholder: 'Paste email content here…' },
  { id: 'qr',       icon: '📷', label: 'QR Scanner',          premium: false, field: 'file',    type: 'file',     placeholder: null },
  { id: 'image',    icon: '🖼', label: 'Screenshot Analyzer', premium: false, field: 'file',    type: 'file',     placeholder: null },
  { id: 'job',      icon: '💼', label: 'Job Scam Detector',   premium: true,  field: 'content', type: 'textarea', placeholder: 'Paste job offer text here…' },
  { id: 'invest',   icon: '💰', label: 'Investment Detector', premium: true,  field: 'content', type: 'textarea', placeholder: 'Paste investment offer here…' },
  { id: 'api',      icon: '⚡', label: 'API Access',          premium: true,  field: null,      type: null,       placeholder: null },
];

const INSIGHTS = [
  'Phishing URLs are the most common threat detected.',
  'Most threats come from WhatsApp messages.',
  'Always verify sender before clicking email links.',
];

function ScoreBar({ score }) {
  const color = score < 30 ? '#42d8b1' : score < 65 ? '#f0b429' : '#ff6a6a';
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="score-num" style={{ color }}>{score}/100</span>
    </div>
  );
}

function UpgradeWall() {
  return (
    <div className="upgrade-wall">
      <div className="upgrade-wall-icon">🔒</div>
      <h3>Free Plan Limit Reached</h3>
      <p>You've used all {FREE_LIMIT} free scans for today. Upgrade to Pro for unlimited scans across all 7 scanners.</p>
      <div className="upgrade-wall-perks">
        <span>✓ Unlimited scans</span>
        <span>✓ All 7 scanners</span>
        <span>✓ AI risk reports</span>
        <span>✓ Priority support</span>
      </div>
      <a href="#/pricing" className="button button-primary upgrade-wall-btn">Upgrade to Pro — ₹199/mo</a>
      <p className="upgrade-wall-note">Free plan resets tomorrow at midnight.</p>
    </div>
  );
}

function ScannerView({ scanner, token, onBack, onScanDone, isPro }) {
  const [input, setInput]     = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [limitHit, setLimitHit] = useState(false);

  async function handleScan(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null); setLimitHit(false);

    let body, headers;
    if (scanner.type === 'file') {
      const fileInput = e.target.querySelector('input[type=file]');
      if (!fileInput?.files?.[0]) { setError('Please select a file.'); setLoading(false); return; }
      const fd = new FormData();
      fd.append('file', fileInput.files[0]);
      body    = fd;
      headers = { Authorization: `Bearer ${token}` };
    } else {
      body    = JSON.stringify({ [scanner.field]: input });
      headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    }

    try {
      const res  = await fetch(`${API}/api/scan/${scanner.id}`, { method: 'POST', headers, body });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgrade) setLimitHit(true);
        else setError(data.message || 'Scan failed.');
      } else {
        setResult(data);
        onScanDone();
      }
    } catch { setError('Unable to connect to server.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="scanner-view">
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      <div className="scanner-view-header">
        <span className="scanner-view-icon">{scanner.icon}</span>
        <div>
          <h2>{scanner.label}</h2>
          <p>Submit content below for instant AI analysis.</p>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: '20px' }}>
        {limitHit ? <UpgradeWall /> : (
          <>
            <form className="scan-form-full" onSubmit={handleScan}>
              {scanner.type === 'file' ? (
                <div className="file-drop-lg">
                  <input type="file" accept="image/*" />
                  <span>📎 Click to upload or drag image here</span>
                </div>
              ) : scanner.type === 'textarea' ? (
                <textarea className="scan-input-lg" rows={5} placeholder={scanner.placeholder} value={input} onChange={e => setInput(e.target.value)} required />
              ) : (
                <input className="scan-input-lg" type="text" placeholder={scanner.placeholder} value={input} onChange={e => setInput(e.target.value)} required />
              )}
              <button type="submit" className="button button-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Scan with AI'}
              </button>
            </form>
            {error && <p className="scan-error" style={{ marginTop: '12px' }}>{error}</p>}
            {result && (
              <div className={`scan-result ${result.status}`} style={{ marginTop: '16px' }}>
                <div className="result-row">
                  <span className={`result-badge ${result.status}`}>{result.status?.toUpperCase()}</span>
                  {result.score !== undefined && <ScoreBar score={result.score} />}
                </div>
                {result.explanation && <p className="result-note">{result.explanation}</p>}
                {result.recommendation && <p className="result-rec">💡 {result.recommendation}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const token = localStorage.getItem('bb_token');
  const user  = getUser();

  const [activeScanner, setActiveScanner] = useState(null);
  const [quota, setQuota]                 = useState(null);

  useEffect(() => {
    if (!token || !user) { window.location.hash = '#/login'; return; }
    refreshUserData();
    refreshQuota();
  }, []);

  async function refreshUserData() {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem('bb_user', JSON.stringify(userData));
        // Force re-render by updating state if needed
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }

  if (!token || !user) return null;

  const plan  = user.plan || 'FREE';
  const isPro = plan !== 'FREE';

  function refreshQuota() {
    fetch(`${API}/api/scan/quota`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setQuota({ ...data }))
      .catch(() => {});
  }

  function logout() {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
    window.location.hash = '#/login';
  }

  function openScanner(scanner) {
    if (scanner.type === null) { window.location.hash = '#/pricing'; return; }
    if (scanner.premium && !isPro) { window.location.hash = '#/pricing'; return; }
    setActiveScanner(scanner);
  }

  const Topbar = () => (
    <header className="dash-topbar">
      <a href="#/" className="brand">BlockBridge ScamGuard AI</a>
      <nav className="dash-nav">
        <a href="#/" className="nav-link">Home</a>
        <a href="#/pricing" className="nav-link">Upgrade</a>
        <button className="nav-link dash-logout" onClick={logout}>Logout</button>
      </nav>
    </header>
  );

  // Individual scanner view
  if (activeScanner) {
    return (
      <div className="dash-shell">
        <Topbar />
        <div className="dashboard">
          <ScannerView
            scanner={activeScanner}
            token={token}
            isPro={isPro}
            onBack={() => { setActiveScanner(null); refreshQuota(); }}
            onScanDone={refreshQuota}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-shell">
      <Topbar />
      <div className="dashboard">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user.name} 👋</h1>
            <p className="dash-sub">Your AI-powered scam protection dashboard</p>
          </div>
          <div className="dash-plan-badge">
            <span className={`plan-pill ${plan.toLowerCase()}`}>{plan}</span>
            <span className="dash-status">{isPro ? '✓ Active subscription' : 'Free plan — limited access'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="stat-pill">
            <span className="stat-val">{quota ? (quota.scansUsed ?? 0) : '—'}</span>
            <span className="stat-lbl">Scans Today</span>
          </div>
          <div className="stat-pill">
            <span className="stat-val">{isPro ? '∞' : (quota ? (quota.scansLeft ?? 0) : '—')}</span>
            <span className="stat-lbl">{isPro ? 'Unlimited' : 'Scans Left'}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-val">{plan}</span>
            <span className="stat-lbl">Current Plan</span>
          </div>
          <div className="stat-pill">
            <span className="stat-val">{isPro && user.expiry_date ? new Date(user.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : (isPro ? 'Active' : `${FREE_LIMIT}/day`)}</span>
            <span className="stat-lbl">{isPro && user.expiry_date ? 'Expires' : 'Daily Limit'}</span>
          </div>
        </div>

        <div className="dash-body">
          <div className="dash-main">

            {/* Scanners */}
            <div className="dash-card">
              <p className="section-label">All Scanners</p>
              <div className="scanner-grid">
                {SCANNERS.map(s => {
                  const locked = s.premium && !isPro;
                  return (
                    <button key={s.id} className={`scanner-tile${locked ? ' scanner-locked' : ''}`} onClick={() => openScanner(s)}>
                      <span className="scanner-icon">{s.icon}</span>
                      <span className="scanner-label">{s.label}</span>
                      {locked && <span className="lock-tag">PRO</span>}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="dash-side">
            <div className="dash-card plan-card-dash">
              <p className="section-label">Your Plan</p>
              <div className="plan-info">
                <span className={`plan-pill ${plan.toLowerCase()}`}>{plan}</span>
                {isPro && user.expiry_date && (
                  <span className="expiry">Expires: {new Date(user.expiry_date).toLocaleDateString()}</span>
                )}
              </div>
              {!isPro ? (
                <>
                  <p className="plan-note">Upgrade to unlock all scanners and unlimited daily scans.</p>
                  <a href="#/pricing" className="button button-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}>
                    Upgrade to Pro — ₹199/mo
                  </a>
                </>
              ) : plan === 'PRO' ? (
                <>
                  <ul className="plan-perks">
                    <li>✓ Unlimited scans</li>
                    <li>✓ 5 scanners unlocked</li>
                    <li>✓ AI risk explanation</li>
                    <li>✓ 30 days history</li>
                  </ul>
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                      <strong>Upgrade to Business (₹499/mo) for:</strong>
                    </p>
                    <ul style={{ fontSize: '12px', color: '#666', paddingLeft: '18px' }}>
                      <li>Team dashboard & collaboration</li>
                      <li>API access for integration</li>
                      <li>Bulk scanning capabilities</li>
                      <li>Priority 24/7 support</li>
                    </ul>
                    <a href="#/pricing" className="button button-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', fontSize: '13px' }}>
                      View Business Plan
                    </a>
                  </div>
                </>
              ) : (
                <ul className="plan-perks">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Team dashboard</li>
                  <li>✓ API access</li>
                  <li>✓ Bulk scanning</li>
                  <li>✓ Priority support</li>
                </ul>
              )}
            </div>

            <div className="dash-card">
              <p className="section-label">AI Insights</p>
              <div className="insights-list">
                {INSIGHTS.map((ins, i) => (
                  <div className="insight-item" key={i}>
                    <span className="insight-dot" />
                    <p>{ins}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <p className="section-label">Notifications</p>
              <div className="notif-list">
                {[
                  { icon: '🚨', text: 'New scam pattern detected in QR codes.' },
                  { icon: '🔐', text: 'Consider updating your password.' },
                  { icon: '🤖', text: 'New AI model deployed for email scanning.' },
                ].map((n, i) => (
                  <div className="notif-item" key={i}>
                    <span>{n.icon}</span>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="footer" style={{ marginTop: '40px' }}>
          <span>© 2026 BlockBridge ScamGuard AI</span>
          <span>Designed for safer browsing</span>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;



