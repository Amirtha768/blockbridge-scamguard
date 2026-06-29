import { useState } from 'react';
import '../styles.css';
import '../contact.css';

const faqs = [
  { q: 'How does scam detection work?', a: 'Our AI engine analyzes URLs, message patterns, domain reputation, and metadata to generate a real-time risk score.' },
  { q: 'Is BlockBridge free to use?', a: 'Yes — the Free plan includes URL scanning and basic scam alerts with no credit card required.' },
  { q: 'Can I report a scam?', a: 'Absolutely. Use the Report a Suspicious Activity form to submit suspicious URLs, messages, or screenshots directly to our AI team.' },
  { q: 'How accurate is AI detection?', a: 'Our engine is continuously trained on live threat data. Accuracy improves with every scam report submitted by users.' },
];

const subjects = ['Scam Report', 'Technical Support', 'Business Inquiry', 'General Question'];

function Contact() {
  const [reportForm, setReportForm] = useState({ url: '', whatsapp: '', emailContent: '', reporterEmail: '' });
  const [reportSent, setReportSent] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  function handleReportSubmit(e) {
    e.preventDefault();
    setReportSent(true);
    setReportForm({ url: '', whatsapp: '', emailContent: '', reporterEmail: '' });
  }

  return (
    <>
      {/* Hero */}
      <section className="contact-hero">
        <p className="eyebrow">Support &amp; Contact</p>
        <h1>Contact BlockBridge ScamGuard AI - NEW VERSION</h1>
        <p className="contact-hero-sub">
          We're here to help you stay safe from online scams. Reach out for support, scam reports, or business queries.
        </p>
      </section>

      {/* 2. Contact Info - PRIMARY */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">Get in Touch</p>
          <h2>Contact BlockBridge ScamGuard AI</h2>
          <p>Have questions or need support? Reach out to us directly via email or WhatsApp.</p>
        </div>
        
        <div className="contact-grid">
          <div className="section-card contact-info-card">
            <h3>📧 Email Support</h3>
            <p className="contact-detail-large">blockbridgescamguardai@gmail.com</p>
            <p className="contact-note">We respond within 24-48 hours</p>
            <a href="mailto:blockbridgescamguardai@gmail.com" className="button button-primary">Send Email</a>
          </div>

          <div className="section-card contact-info-card">
            <h3>📱 WhatsApp / Phone</h3>
            <p className="contact-detail-large">+91 6381487329</p>
            <p className="contact-note">Available 9 AM - 6 PM IST (Mon-Sat)</p>
            <a href="https://wa.me/916381487329" target="_blank" rel="noopener noreferrer" className="button button-primary">Chat on WhatsApp</a>
          </div>
        </div>

        <div className="section-card" style={{marginTop: '2rem', textAlign: 'center', padding: '2rem'}}>
          <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '1rem'}}>
            <strong>Need help with scam verification?</strong> Contact us with details of suspicious URLs, messages, or payment requests.
          </p>
          <p style={{color: '#999'}}>
            For payment-related queries, please include your transaction ID or screenshot reference.
          </p>
        </div>
      </section>

      {/* 5. Report Scam */}
      <section className="section">
        <div className="section-card report-card">
          <div className="report-header">
            <div>
              <p className="section-label">Report a Scam</p>
              <h2>Report a Suspicious Activity</h2>
              <p className="report-desc">Your report will be analyzed by our AI security engine to improve scam detection for everyone.</p>
            </div>
          </div>

          {reportSent ? (
            <div className="form-success">
              <span className="success-icon">✓</span>
              <p>Report received. Thank you for helping keep the internet safer.</p>
            </div>
          ) : (
            <form className="contact-form report-form" onSubmit={handleReportSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reporter-email">Your Email <span className="optional">optional</span></label>
                  <input
                    id="reporter-email" type="email" placeholder="your@email.com"
                    value={reportForm.reporterEmail}
                    onChange={e => setReportForm(p => ({ ...p, reporterEmail: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sus-url">Suspicious URL <span className="optional">optional</span></label>
                  <input
                    id="sus-url" type="url" placeholder="https://suspicious-site.com"
                    value={reportForm.url}
                    onChange={e => setReportForm(p => ({ ...p, url: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="whatsapp">WhatsApp Message <span className="optional">optional</span></label>
                  <input
                    id="whatsapp" type="text" placeholder="Paste suspicious message here"
                    value={reportForm.whatsapp}
                    onChange={e => setReportForm(p => ({ ...p, whatsapp: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email-content">Email Content <span className="optional">optional</span></label>
                  <textarea
                    id="email-content" rows={3} placeholder="Paste suspicious email content..."
                    value={reportForm.emailContent}
                    onChange={e => setReportForm(p => ({ ...p, emailContent: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="button button-primary">
                Report Scam to AI Team
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="section">
        <div className="section-intro">
          <p className="section-label">FAQ</p>
          <h2>Common Questions</h2>
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

      {/* 7. Trust */}
      <section className="section">
        <div className="trust-grid">
          <article className="trust-card">
            <h3>1,00,000+ Users</h3>
            <p>Trusted by users protected from scams across web, email, WhatsApp, and QR.</p>
          </article>
          <article className="trust-card">
            <h3>Real-time AI Detection</h3>
            <p>AI-powered scam detection with continuous monitoring and instant risk scoring.</p>
          </article>
          <article className="trust-card">
            <h3>End-to-End Encrypted</h3>
            <p>All communications and reports are secure and encrypted end-to-end.</p>
          </article>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="section">
        <div className="cta-card">
          <div>
            <p className="section-label">Stay protected</p>
            <h2>Don't wait for a scam to happen.</h2>
            <p>Start your free protection today and stay ahead of online threats.</p>
          </div>
          <div className="cta-actions">
            <a href="#/" className="button button-secondary">📊 Go to Dashboard</a>
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

export default Contact;
