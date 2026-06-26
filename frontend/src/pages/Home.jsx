import '../styles.css';

const threats = [
  { title: 'Fake WhatsApp messages', description: 'Impersonation, malicious links, and social engineering attacks.' },
  { title: 'Phishing websites', description: 'Cloned login pages and hidden redirects that steal credentials.' },
  { title: 'Job scams', description: 'Fraudulent offers, fake recruiters, and advance-fee schemes.' },
  { title: 'QR frauds', description: 'Malicious QR codes that install malware or steal payment data.' }
];

const features = [
  { title: 'URL Scanner', description: 'Detect malicious and phishing links instantly.' },
  { title: 'WhatsApp Scanner', description: 'Analyze messages and unsafe links shared over chat.' },
  { title: 'Email Scanner', description: 'Spot spoofed senders, phishing attachments, and dangerous content.' },
  { title: 'QR Scanner', description: 'Verify QR code safety before you scan or submit payments.' },
  { title: 'Screenshot Scanner', description: 'Upload suspicious screenshots for automated fraud analysis.' }
];

const steps = [
  { title: 'Paste URL or message', description: 'Submit the suspicious link, message, or QR content to BlockBridge.' },
  { title: 'AI analyzes content', description: 'Our engine evaluates domains, headers, and scam indicators instantly.' },
  { title: 'Risk score generated', description: 'Get a clear score that shows how risky the content is.' },
  { title: 'Safety recommendation shown', description: 'Receive a simple next step to stay safe and avoid fraud.' }
];

const comparison = [
  { label: 'Safe Example', value: 'https://blockbridge.ai', details: 'Trusted domain, proper certificate, and clean reputation.', status: 'safe' },
  { label: 'Dangerous Example', value: 'http://free-login-secure.com', details: 'Phishing indicators, suspicious redirect, and credential risk.', status: 'unsafe' }
];

const plans = [
  {
    title: 'Free',
    price: '₹0',
    features: ['URL scanning', 'Basic scam alerts', 'Weekly security checks'],
    target: 'Individuals starting scam protection',
    badge: null
  },
  {
    title: 'Pro',
    price: '₹199/mo',
    features: ['URL + email scan', 'WhatsApp scanner', 'Priority recommendations'],
    target: 'Frequent internet users and professionals',
    badge: 'Most Popular'
  },
  {
    title: 'Business',
    price: '₹499/mo',
    features: ['Team protection', 'Real-time alerts', 'Custom security dashboard'],
    target: 'Small businesses and startups',
    badge: null
  }
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">BlockBridge ScamGuard AI</p>
          <h1>Detect Scams Before They Detect You</h1>
          <p className="hero-text">AI-powered scam detection for safer internet browsing.</p>
          <div className="hero-actions">
            <a href="#cta" className="button button-primary">Start Free Scan</a>
            <a href="#pricing" className="button button-secondary">View Pricing</a>
          </div>
          <div className="hero-trust">
            <span>Trusted to block 1,00,000+ scam attempts</span>
            <span>Covers web, email, WhatsApp, and QR channels</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="status-card">
            <p className="card-label">Live verification</p>
            <h2>Safe vs Dangerous</h2>
            <div className="status-row">
              <span className="status-pill safe">Safe</span>
              <span className="status-pill unsafe">Dangerous</span>
            </div>
            <p className="visual-copy">Instant AI verification to separate trusted content from threats in seconds.</p>
          </div>
        </div>
      </section>

      {/* Threats */}
      <section className="section problem" id="problem">
        <p className="section-label">Why threats matter</p>
        <h2>Scam formats users encounter every day</h2>
        <div className="grid cards-gap feature-grid">
          {threats.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="section-intro">
          <p className="section-label">How it works</p>
          <h2>Four steps to verify suspicious content</h2>
          <p>BlockBridge scores risk and shows the safest action in one clean workflow.</p>
        </div>
        <div className="process-grid">
          {steps.map((step, i) => (
            <article className="process-card" key={step.title}>
              <div className="step-number">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-intro">
          <p className="section-label">Core features</p>
          <h2>Scanners built for the most common fraud channels</h2>
          <p>Five tools that detect scam URLs, messages, emails, QR codes, and screenshots.</p>
        </div>
        <div className="grid cards-gap feature-grid">
          {features.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section className="section" id="demo">
        <div className="section-intro">
          <p className="section-label">Demo preview</p>
          <h2>Instant AI verification in seconds</h2>
          <p>See a safe link against a dangerous scam URL side by side.</p>
        </div>
        <div className="grid comparison-grid">
          {comparison.map((item) => (
            <article className={`comparison-card ${item.status}`} key={item.label}>
              <span>{item.label}</span>
              <h3>{item.value}</h3>
              <p>{item.details}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="section-intro">
          <p className="section-label">Pricing</p>
          <h2>Choose your protection plan</h2>
          <p>From free personal protection to business-grade coverage.</p>
        </div>
        <div className="grid pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card${plan.badge ? ' popular' : ''}`} key={plan.title}>
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}
              <h3>{plan.title}</h3>
              <p className="price">{plan.price}</p>
              <ul>
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <p className="plan-target">{plan.target}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="section">
        <div className="trust-grid">
          <article className="trust-card">
            <h3>1,00,000+</h3>
            <p>Scam attempts blocked across web, email, WhatsApp, and QR.</p>
          </article>
          <article className="trust-card">
            <h3>Real-time AI</h3>
            <p>Continuous monitoring with instant safety recommendations.</p>
          </article>
          <article className="trust-card">
            <h3>Multi-channel</h3>
            <p>One platform covering every fraud channel that matters.</p>
          </article>
        </div>
      </section>



      <footer className="footer">
        <span>© 2026 BlockBridge ScamGuard AI</span>
        <span>Designed for safer browsing</span>
      </footer>
    </>
  );
}

export default Home;
