import './styles.css';

const problems = [
  'Increase in phishing attacks across email and web.',
  'Fake WhatsApp messages that impersonate trusted contacts.',
  'Fraudulent job offers designed to steal personal data.',
  'QR code scams that redirect users to malicious pages.',
  'Fake websites stealing passwords and payment details.'
];

const benefits = [
  'Detect phishing websites before users click dangerous links.',
  'Scan WhatsApp messages for scam signals and suspicious URLs.',
  'Analyze emails for spoofing, malicious attachments, and phishing intent.',
  'Validate QR codes and warn users before they scan unsafe content.',
  'Inspect screenshots and visual fraud attempts with AI-driven analysis.'
];

const steps = [
  { title: 'User submits suspicious content', description: 'Paste a URL, message, or upload a screenshot for review.' },
  { title: 'AI analyzes data', description: 'Our engine inspects domains, metadata, and scam indicators instantly.' },
  { title: 'Risk score is generated', description: 'Receive a concise score that reflects the threat level.' },
  { title: 'Safe recommendation is provided', description: 'Follow a clear safety action to avoid fraud and stay protected.' }
];

const technologies = [
  'AI-based risk analysis engine',
  'Real-time threat detection',
  'Database-driven scam intelligence',
  'Multi-channel protection for URL, WhatsApp, Email, and QR'
];

const impact = [
  '1,00,000+ scam attempts analyzed',
  'Real-time fraud detection system',
  'Used for phishing, WhatsApp, email, and QR threats'
];

function About() {
  return (
    <div className="page-shell about-page">
      <main>
        <section className="about-hero section-card">
          <div className="hero-copy">
            <p className="eyebrow">About BlockBridge ScamGuard AI</p>
            <h1>We are building a safer internet powered by AI-driven scam detection</h1>
            <p className="hero-text">
              Online scams are increasing every year, and users lose money to phishing, fake links, and digital fraud.
              BlockBridge ScamGuard AI is designed to help people spot threats before they become victims.
            </p>
          </div>
        </section>

        <section className="section-divider" />

        <section className="section-grid">
          <article className="section-card">
            <p className="section-label">Problem statement</p>
            <h2>Digital fraud is growing faster than awareness.</h2>
            <p className="section-text">
              Many users still fall into scams disguised as trusted messages, websites, and offers. The problem is not only
              the attack itself — it is the lack of clear protection at the moment of decision.
            </p>
            <ul className="list-disc">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
            <p className="impact-text">
              “Millions of users fall victim to digital fraud every year without realizing it.”
            </p>
          </article>

          <article className="section-card feature-card">
            <p className="section-label">Our solution</p>
            <h2>Protect users with intelligent scam detection.</h2>
            <p className="section-text">
              BlockBridge ScamGuard AI helps users by detecting phishing websites, scanning WhatsApp messages, analyzing emails,
              checking QR codes, and identifying screenshot scams.
            </p>
            <div className="benefits-list">
              {benefits.map((benefit) => (
                <div className="benefit-item" key={benefit}>
                  <span className="dot" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <p className="impact-text">
              “We use AI to detect threats before users become victims.”
            </p>
          </article>
        </section>

        <section className="section-divider" />

        <section className="flow-section section-grid">
          <article className="section-card flow-card">
            <p className="section-label">Mission</p>
            <h2>Our mission is clear.</h2>
            <p className="section-text">
              “Our mission is to make digital safety accessible to everyone using intelligent AI systems that detect scams in real-time.”
            </p>
          </article>

          <article className="section-card flow-card">
            <p className="section-label">How it works</p>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <div className="step-card" key={step.title}>
                  <div className="step-badge">{index + 1}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="section-divider" />

        <section className="section-grid tech-impact-grid">
          <article className="section-card tech-card">
            <p className="section-label">Technology</p>
            <h2>Built on trusted AI and threat intelligence.</h2>
            <ul className="list-disc">
              {technologies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="section-card founder-card">
            <p className="section-label">Founder</p>
            <h2>Amirtha</h2>
            <p className="founder-role">Cybersecurity Innovator</p>
            <p className="section-text">
              Vision: Safer internet for all users.
            </p>
          </article>
        </section>

        <section className="section-divider" />

        <section className="impact-section section-card">
          <p className="section-label">Impact</p>
          <h2>Trusted by users who need intelligent scam protection.</h2>
          <div className="stats-grid">
            {impact.map((item) => (
              <article className="stat-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-card about-cta">
          <div>
            <p className="section-label">Get started</p>
            <h2>Start Protecting Yourself Today</h2>
            <p className="section-text">
              Join BlockBridge ScamGuard AI and build confidence in every online interaction.
            </p>
          </div>
          <div className="cta-actions">
            <a href="/#/pricing" className="button button-primary">View Pricing</a>
            <a href="/#/dashboard" className="button button-secondary">Go to Dashboard</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 BlockBridge ScamGuard AI</span>
        <span>Designed for safer browsing</span>
      </footer>
    </div>
  );
}

export default About;
