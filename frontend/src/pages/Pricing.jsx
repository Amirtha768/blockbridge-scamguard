import { useState } from 'react';
import '../styles.css';
import '../pricing.css';

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
    features: ['Unlimited URL scans', 'WhatsApp scam detection', 'Email phishing scanner', 'QR code scanner', 'Screenshot scanner', 'AI risk explanation', '30 days history'],
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
    features: ['Everything in Pro', 'Team dashboard', 'Real-time alerts', 'API access', 'Bulk scanning', 'Priority support', 'Advanced AI protection'],
    target: 'Startups, companies & institutions',
    btn: 'Go Business',
    btnClass: 'button-secondary',
  },
];

const steps = [
  { n: '1', title: 'Select a plan', desc: 'Choose Free, Pro, or Business based on your needs.' },
  { n: '2', title: 'Complete secure payment', desc: 'Pay safely via Razorpay with any UPI, card, or net banking.' },
  { n: '3', title: 'Account activated instantly', desc: 'Your plan is live the moment payment is confirmed.' },
  { n: '4', title: 'Access unlocked in dashboard', desc: 'All features are immediately available in your account.' },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your dashboard. No questions asked.' },
  { q: 'Will I get a refund?', a: 'Refunds are available within 7 days of payment if paid features haven\'t been used.' },
  { q: 'Is payment secure?', a: 'All payments are processed via Razorpay with 256-bit SSL encryption. We never store your card details.' },
  { q: 'What happens after payment?', a: 'Your account is upgraded instantly. All plan features become available in your dashboard.' },
];

const comparison = [
  { feature: 'Daily scans',        free: '5 scans',  pro: 'Unlimited', biz: 'Unlimited' },
  { feature: 'URL Scanner',        free: '✓',        pro: '✓',         biz: '✓' },
  { feature: 'WhatsApp Scanner',   free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Email Scanner',      free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'QR Scanner',         free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Screenshot Scanner', free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'AI Risk Explanation',free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'History',            free: 'Limited',  pro: '30 days',   biz: '90 days' },
  { feature: 'Team Dashboard',     free: '—',        pro: '—',         biz: '✓' },
  { feature: 'API Access',         free: '—',        pro: '—',         biz: '✓' },
  { feature: 'Priority Support',   free: '—',        pro: '—',         biz: '✓' },
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

    const token = localStorage.getItem('bb_token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    setLoading(plan.id);
    const loaded = await loadRazorpayScript();
    if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setLoading(''); return; }

    try {
      const res = await fetch('"http://localhost:5001"/api/payment/create-order', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading('');
        if (res.status === 503) {
          alert('Payment gateway is not configured yet. Please add your Razorpay API keys to the backend .env file to enable real payments.');
        } else {
          alert(data.message || 'Failed to create order.');
        }
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'BlockBridge ScamGuard AI',
        description: `${plan.title} Plan Subscription`,
        theme: { color: '#4f8cff' },
        handler: async function (response) {
          const verify = await fetch('"http://localhost:5001"/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
            }),
          });
          if (verify.ok) setPaySuccess(true);
          else alert('Payment verification failed. Contact support.');
        },
        modal: { ondismiss: () => setLoading('') },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading('');
    }
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



