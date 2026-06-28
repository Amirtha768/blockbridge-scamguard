import { useState, useEffect } from 'react';
import '../styles.css';
import '../product.css';
import API from '../config.js';

function useAuth() {
  const token = localStorage.getItem('bb_token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('bb_user')); } catch { return null; } })();
  return { token, user };
}

const FEATURES = [
  { id: 'url',       icon: '🔍', title: 'URL Scanner',             desc: 'Detect phishing and malicious links instantly.',           field: 'url',     placeholder: 'https://suspicious-site.com', premium: false },
  { id: 'whatsapp',  icon: '💬', title: 'WhatsApp Scam Analyzer',  desc: 'Analyze message text for scam patterns and fake links.',   field: 'message', placeholder: 'Paste WhatsApp message here…', premium: false },
  { id: 'email',     icon: '📧', title: 'Email Phishing Detector',  desc: 'Detect spoofing, phishing links, and malicious content.',  field: 'content', placeholder: 'Paste email content here…',     premium: false },
  { id: 'qr',        icon: '📷', title: 'QR Code Scanner',          desc: 'Decode and verify QR code safety before scanning.',        field: 'file',    placeholder: null,                           premium: false },
  { id: 'image',     icon: '🖼', title: 'Screenshot Analyzer',      desc: 'AI detects scam text and links in uploaded screenshots.',  field: 'file',    placeholder: null,                           premium: false },
  { id: 'job',       icon: '💼', title: 'Fake Job Detector',         desc: 'Detect fraudulent job offers and fake recruiters.',        field: 'content', placeholder: 'Paste job offer text here…',   premium: true  },
  { id: 'invest',    icon: '💰', title: 'Investment Scam Detector',  desc: 'Identify fraudulent investment schemes and Ponzi traps.',  field: 'content', placeholder: 'Paste investment offer here…', premium: true  },
];

const DEMO = [
  { label: 'Safe Example',      url: 'https://blockbridge.ai',       score: 4,  status: 'safe',   note: 'Trusted domain, valid SSL, clean reputation.' },
  { label: 'Dangerous Example', url: 'http://free-login-secure.com', score: 91, status: 'danger', note: 'Phishing indicators, suspicious redirect, credential theft risk.' },
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

function FeatureCard({ feature, token, userPlan }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const locked = feature.premium && userPlan === 'FREE';

  async function handleScan(e) {
    e.preventDefault();
    if (!token) { window.location.hash = '#/login'; return; }
    if (locked) { window.location.hash = '#/pricing'; return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const body = feature.field === 'file'
        ? (() => { const fd = new FormData(); fd.append('file', e.target.querySelector('input[type=file]').files[0]); return fd; })()
        : JSON.stringify({ [feature.field]: input });
      const headers = feature.field === 'file'
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch(`${API}/api/scan/${feature.id}`, { method: 'POST', headers, body });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Scan failed.');
      else setResult(data);
    } catch { setError('Unable to connect to server.'); }
    finally { setLoading(false); }
  }

  return (
    <article className={`feature-scan-card${locked ? ' locked' : ''}`}>
      <div className="fsc-header">
        <span className="fsc-icon">{feature.icon}</span>
        <div>
          <h3>{feature.title} {locked && <span className="lock-badge">🔒 PRO</span>}</h3>
          <p>{feature.desc}</p>
        </div>
      </div>

      {locked ? (
        <div className="locked-overlay">
          <p>This feature requires a Pro plan.</p>
          <a href="#/pricing" className="button button-primary">Upgrade to Pro</a>
        </div>
      ) : (
        <form className="scan-form" onSubmit={handleScan}>
          {feature.field === 'file' ? (
            <div className="file-drop-sm">
              <input type="file" accept="image/*" required />
              <span>Click to upload image</span>
            </div>
          ) : (
            feature.id === 'whatsapp' || feature.id === 'email' || feature.id === 'job' || feature.id === 'invest'
              ? <textarea className="scan-input" rows={3} placeholder={feature.placeholder} value={input} onChange={e => setInput(e.target.value)} required />
              : <input className="scan-input" type="text" placeholder={feature.placeholder} value={input} onChange={e => setInput(e.target.value)} required />
          )}
          <button type="submit" className="button button-primary scan-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Scan Now'}
          </button>
        </form>
      )}

      {error && <p className="scan-error">{error}</p>}
      {result && (
        <div className={`scan-result ${result.status}`}>
          <div className="result-row">
            <span className={`result-badge ${result.status}`}>{result.status?.toUpperCase()}</span>
            {result.score !== undefined && <ScoreBar score={result.score} />}
          </div>
          {result.explanation && <p className="result-note">{result.explanation}</p>}
          {result.recommendation && <p className="result-rec">💡 {result.recommendation}</p>}
        </div>
      )}
    </article>
  );
}

function Product() {
  const { token, user } = useAuth();
  const plan = user?.plan || 'FREE';

  return (
    <>
      {/* Hero */}
      <section className="product-hero">
        <p className="eyebrow">AI Security Tools</p>
        <h1>AI-Powered Scam Detection Tools</h1>
        <p className="product-hero-sub">Scan, analyze, and protect yourself from phishing, fraud, and online scams in real-time.</p>
        <div className="hero-actions">
          {token
            ? <a href="#/dashboard" className="button button-primary">Go to Dashboard</a>
            : <a href="#/login" className="button button-primary">Start Free Scan</a>
          }
          <button 
            onClick={() => document.getElementById('scanners')?.scrollIntoView({ behavior: 'smooth' })} 
            className="button button-secondary"
          >
            View Scanners
          </button>
        </div>
        {!token && (
          <p className="login-notice">Please <a href="#/login">login</a> to use the scanners.</p>
        )}
      </section>

      {/* Scanners */}
      <section className="section" id="scanners">
        <div className="section-intro">
          <p className="section-label">Scanners</p>
          <h2>Seven AI-Powered Detection Tools</h2>
          <p>All tools connect to our live AI backend. Pro features are locked for free users.</p>
        </div>
        <div className="feature-scan-grid">
          {FEATURES.map(f => (
            <FeatureCard key={f.id} feature={f} token={token} userPlan={plan} />
          ))}
        </div>
      </section>

      {/* Demo */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">Demo preview</p>
          <h2>See How Risk Scoring Works</h2>
        </div>
        <div className="demo-grid">
          {DEMO.map(d => (
            <div key={d.label} className={`demo-card ${d.status}`}>
              <span className="demo-label">{d.label}</span>
              <h3>{d.url}</h3>
              <ScoreBar score={d.score} />
              <p className="demo-note">{d.note}</p>
              <span className={`result-badge ${d.status}`}>{d.status === 'safe' ? 'SAFE' : 'DANGEROUS'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">How it works</p>
          <h2>Four Steps to Instant Protection</h2>
        </div>
        <div className="process-grid">
          {[
            { n:'1', title:'Input suspicious content', desc:'Paste a URL, message, email, or upload a QR / screenshot.' },
            { n:'2', title:'AI scans in real-time',    desc:'Our engine checks domains, patterns, and scam indicators.' },
            { n:'3', title:'Risk score generated',     desc:'A 0–100 score tells you exactly how dangerous the content is.' },
            { n:'4', title:'Recommendation shown',     desc:'Get a clear, actionable next step to stay safe.' },
          ].map(s => (
            <article className="process-card" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      {plan === 'FREE' && (
        <section className="section">
          <div className="cta-card">
            <div>
              <p className="section-label">Unlock full protection</p>
              <h2>Get unlimited scans and all 7 scanners.</h2>
              <p>Upgrade to Pro for ₹199/month and protect yourself across every channel.</p>
            </div>
            <div className="cta-actions">
              <a href="#/pricing" className="button button-primary">Upgrade to Pro — ₹199/mo</a>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <span>© 2026 BlockBridge ScamGuard AI</span>
        <span>Designed for safer browsing</span>
      </footer>
    </>
  );
}

export default Product;




