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
  { n: '2', title: 'Complete secure payment', desc: 'Pay safely via UPI (GPay, PhonePe), card, or net banking through Razorpay.' },
  { n: '3', title: 'Account activated instantly', desc: 'Your plan is live the moment payment is confirmed.' },
  { n: '4', title: 'Access unlocked in dashboard', desc: 'All features are immediately available in your account.' },
];

const faqs = [
  { q: 'What\'s the difference between Pro and Business?', a: 'Pro (₹199/mo) includes 5 scanners and unlimited scans - perfect for individuals. Business (₹499/mo) adds Job & Investment fraud detectors, Team dashboard, API access, and Priority support - ideal for teams and companies.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your dashboard. No questions asked.' },
  { q: 'Will I get a refund?', a: 'Refunds are available within 7 days of payment if paid features haven\'t been used.' },
  { q: 'Is payment secure?', a: 'All payments are processed via Razorpay with 256-bit SSL encryption. We never store your card details.' },
  { q: 'What happens after payment?', a: 'Your account is upgraded instantly. All plan features become available in your dashboard.' },
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

      // PRO and BUSINESS plans temporarily disabled - will be enabled after Razorpay KYC
      alert('Premium plans coming soon! 🚀\n\nCurrently accepting FREE plan registrations only.\nPayment gateway will be activated after KYC completion.\n\nFor early access, contact support@blockbridge.ai');
      return;
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
          <p>No keys required. Everything is automatic.</p>
        </div>
        <div className="process-grid">
          {steps.map(s => (
            <article className="process-card" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Trust */}
      <section className="section">
        <div className="trust-grid">
          <article className="trust-card">
            <h3>Secure Payments</h3>
            <p>Powered by Razorpay with 256-bit SSL encryption on every transaction.</p>
          </article>
          <article className="trust-card">
            <h3>Instant Activation</h3>
            <p>Your plan goes live the moment payment is confirmed — no waiting, no manual steps.</p>
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



