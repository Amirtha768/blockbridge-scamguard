import { useState } from 'react';
import '../styles.css';
import '../pricing.css';
import API from '../config.js';

const plans = [
  {
    id: 'free',
    title: 'Free',
    price: '₹0',
    period: '',
    badge: null,
    features: ['5 scans per day', 'URL scanner only', 'Basic scam alerts', 'Limited history'],
    target: 'Students & first-time users',
    btn: 'Start Free',
    btnClass: 'button-secondary',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '₹199',
    period: '/ month',
    badge: '⭐ Most Popular',
    features: [
      'Unlimited scans daily',
      '5 scanner types (URL, WhatsApp, Email, QR, Screenshot)',
      'AI-powered risk analysis',
      '30 days scan history',
      'Email support'
    ],
    target: 'Regular users, job seekers & professionals',
    btn: 'Upgrade to Pro',
    btnClass: 'button-primary',
  },
  {
    id: 'business',
    title: 'Business',
    price: '₹499',
    period: '/ month',
    badge: '🏆 Best Value',
    features: [
      'Everything in Pro',
      'Job scam detector',
      'Investment fraud detector',
      'Team dashboard & collaboration',
      'API access for integration',
      'Bulk scanning (100+ scans)',
      'Priority 24/7 support',
      'Advanced AI protection',
      '90 days scan history'
    ],
    target: 'Startups, companies & institutions',
    btn: 'Go Business',
    btnClass: 'button-secondary',
  },
];

const steps = [
  { n: '1', title: 'Select a plan', desc: 'Choose Free, Pro, or Business based on your needs.' },
  { n: '2', title: 'Submit payment proof', desc: 'Make a UPI payment and upload your payment screenshot with transaction ID.' },
  { n: '3', title: 'Admin verification', desc: 'Our team verifies your payment and generates your unique activation key.' },
  { n: '4', title: 'Activate & enjoy', desc: 'Enter your activation key in the dashboard to unlock all features instantly.' },
];

const faqs = [
  { q: 'What\'s the difference between Pro and Business?', a: 'Pro (₹199/mo) includes 5 scanners and unlimited scans - perfect for individuals. Business (₹499/mo) adds Job & Investment fraud detectors, Team dashboard, API access, and Priority support - ideal for teams and companies.' },
  { q: 'How long does activation take?', a: 'Once you submit your payment proof, our admin team verifies it within 24 hours and generates your activation key. You\'ll receive the key and can activate your subscription immediately.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Subscriptions are valid for the purchased period (30 days for Pro, 180 days for Business). No auto-renewal - you can choose to renew or not.' },
  { q: 'Is payment secure?', a: 'Yes. All payments are made via UPI which is secure and encrypted. We only require you to upload a screenshot for verification purposes.' },
  { q: 'What if my payment is not verified?', a: 'If there\'s an issue with your payment proof, our admin team will reject it with a reason. You can resubmit with the correct information.' },
];

const comparison = [
  { feature: 'Daily scans',            free: '5 scans',  pro: 'Unlimited', biz: 'Unlimited' },
  { feature: 'URL Scanner',            free: '✓',        pro: '✓',         biz: '✓' },
  { feature: 'WhatsApp Scanner',       free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Email Scanner',          free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'QR Scanner',             free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Screenshot Scanner',     free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Job Scam Detector',      free: '—',        pro: '—',         biz: '✓' },
  { feature: 'Investment Detector',    free: '—',        pro: '—',         biz: '✓' },
  { feature: 'AI Risk Explanation',    free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Scan History',           free: 'Limited',  pro: '30 days',   biz: '90 days' },
  { feature: 'Team Dashboard',         free: '—',        pro: '—',         biz: '✓' },
  { feature: 'API Access',             free: '—',        pro: '—',         biz: '✓' },
  { feature: 'Bulk Scanning (100+)',   free: '—',        pro: '—',         biz: '✓' },
  { feature: 'Support',                free: 'Email',    pro: 'Email',     biz: 'Priority 24/7' },
];

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [loading, setLoading] = useState('');

  async function handlePlanClick(plan) {
      if (plan.id === 'free') {
        window.location.hash = '#/login';
        return;
      }

      // For Pro and Business plans - redirect to payment upload
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login first
        window.location.hash = '#/login';
        return;
      }

      // Redirect to payment upload page
      window.location.hash = '#/payment-upload';
    }


  return (
    <>
      {/* Payment success modal */}
      {paySuccess && (
        <div className="pay-overlay">
          <div className="pay-modal">
            <div className="pay-icon">🎉</div>
            <h2>Payment Successful</h2>
            <p>Your plan is now <strong>ACTIVE</strong>. Welcome to BlockBridge Pro.</p>
            <a href="#/dashboard" className="button button-primary" onClick={() => setPaySuccess(false)}>
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      {/* 1. Hero */}
      <section className="pricing-hero">
        <p className="eyebrow">Pricing</p>
        <h1>Choose Your Protection Plan</h1>
        <p className="pricing-hero-sub">Simple pricing for individuals, professionals, and businesses to stay safe online.</p>
        <p className="pricing-trust-line">Cancel anytime &nbsp;•&nbsp; Secure payments &nbsp;•&nbsp; Instant activation</p>
      </section>

      {/* 2. Pricing Cards */}
      <section className="section">
        <div className="plans-grid">
          {plans.map(plan => (
            <article key={plan.id} className={`plan-card${plan.id === 'pro' ? ' plan-popular' : ''}`}>
              {plan.badge && <span className="plan-badge-pill">{plan.badge}</span>}
              <h2 className="plan-title">{plan.title}</h2>
              <div className="plan-price">
                <span className="plan-amount">{plan.price}</span>
                {plan.period && <span className="plan-period">{plan.period}</span>}
              </div>
              <p className="plan-target">{plan.target}</p>
              <ul className="plan-features">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button
                className={`button ${plan.btnClass} plan-btn`}
                onClick={() => handlePlanClick(plan)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? <span className="spinner" /> : plan.btn}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 3. How Subscription Works */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">How it works</p>
          <h2>How Subscription Works</h2>
          <p>Simple payment submission & activation process.</p>
        </div>
        <div className="process-grid">{steps.map(s => (
            <article className="process-card" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>

        {/* Payment Instructions */}
        <div className="payment-info-box">
          <h3>Payment Information</h3>
          <div className="payment-details">
            <p><strong>UPI ID:</strong> blockbridge@upi</p>
            <p><strong>Phone Number:</strong> +91 9876543210</p>
            <p className="payment-note">After making payment, click "Upgrade to Pro" or "Go Business" to submit your proof</p>
          </div>
        </div>
      </section>

      {/* 4. Trust */}
      <section className="section">
        <div className="trust-grid">
          <article className="trust-card">
            <h3>Secure Process</h3>
            <p>Verified payment submission process with secure screenshot upload and admin verification.</p>
          </article>
          <article className="trust-card">
            <h3>Quick Activation</h3>
            <p>Receive your activation key within 24 hours of payment verification and activate instantly.</p>
          </article>
          <article className="trust-card">
            <h3>1,00,000+ Users</h3>
            <p>Trusted by users worldwide for real-time AI-powered scam protection.</p>
          </article>
        </div>
      </section>

      {/* 5. Comparison Table */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">Compare plans</p>
          <h2>Free vs Pro vs Business</h2>
        </div>
        <div className="table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th className="col-pro">Pro</th>
                <th>Business</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(row => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.free}</td>
                  <td className="col-pro">{row.pro}</td>
                  <td>{row.biz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">FAQ</p>
          <h2>Pricing Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA */}
      <section className="section">
        <div className="cta-card">
          <div>
            <p className="section-label">Get started</p>
            <h2>Start protecting yourself today.</h2>
            <p>Join over 1,00,000 users who trust BlockBridge to keep them safe online.</p>
          </div>
          <div className="cta-actions">
            <a href="#/" className="button button-primary">Start Free Scan</a>
            <a href="#/login" className="button button-secondary">Login &amp; Upgrade</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© 2026 BlockBridge ScamGuard AI</span>
        <span>Designed for safer browsing</span>
      </footer>
    </>
  );
}

export default Pricing;



