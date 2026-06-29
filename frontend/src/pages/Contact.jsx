import { useState } from 'react';
import '../styles.css';
import '../contact.css';
import API from '../config.js';

const faqs = [
  { q: 'How does scam detection work?', a: 'Our AI engine analyzes URLs, message patterns, domain reputation, and metadata to generate a real-time risk score.' },
  { q: 'Is BlockBridge free to use?', a: 'Yes — the Free plan includes URL scanning and basic scam alerts with no credit card required.' },
  { q: 'Can I report a scam?', a: 'Absolutely. Use the Report a Suspicious Activity form to submit suspicious URLs, messages, or screenshots directly to our AI team.' },
  { q: 'How accurate is AI detection?', a: 'Our engine is continuously trained on live threat data. Accuracy improves with every scam report submitted by users.' },
];

const subjects = ['Scam Report', 'Technical Support', 'Business Inquiry', 'General Question'];

function Contact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactErrors, setContactErrors] = useState({});
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const [reportForm, setReportForm] = useState({ url: '', whatsapp: '', emailContent: '', reporterEmail: '' });
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  function validateContact() {
    const errs = {};
    if (!contactForm.name.trim()) errs.name = 'Full name is required.';
    if (!contactForm.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) errs.email = 'Enter a valid email.';
    if (contactForm.phone && !/^[+\d\s()-]{10,}$/.test(contactForm.phone)) errs.phone = 'Enter a valid phone number.';
    if (!contactForm.subject) errs.subject = 'Please select a subject.';
    if (!contactForm.message.trim()) errs.message = 'Message cannot be empty.';
    return errs;
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    const errs = validateContact();
    if (Object.keys(errs).length) { setContactErrors(errs); return; }
    
    setContactErrors({});
    setContactLoading(true);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok) {
        setContactSent(true);
        setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setContactErrors({ submit: data.message || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setContactErrors({ submit: 'Request timed out. The server may be waking up. Please try again in 30 seconds.' });
      } else {
        setContactErrors({ submit: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setContactLoading(false);
    }
  }

  async function handleReportSubmit(e) {
    e.preventDefault();
    
    if (!reportForm.url && !reportForm.whatsapp && !reportForm.emailContent) {
      alert('Please provide at least one suspicious item to report.');
      return;
    }
    
    setReportLoading(true);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API}/api/contact/report-scam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok) {
        setReportSent(true);
        setReportForm({ url: '', whatsapp: '', emailContent: '', reporterEmail: '' });
      } else {
        alert(data.message || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Request timed out. The server may be waking up. Please try again in 30 seconds.');
      } else {
        alert('Network error. Please check your connection and try again.');
      }
    } finally {
      setReportLoading(false);
    }
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

      {/* 2. Contact Form + 3. Contact Info */}
      <section className="contact-grid section">
        <div className="section-card contact-form-card">
          <p className="section-label">Contact Form</p>

          {contactSent ? (
            <div className="form-success">
              <span className="success-icon">✓</span>
              <p>Message sent. We'll get back to you within 24–48 hours.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name" type="text" placeholder="Your full name"
                    value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className={contactErrors.name ? 'input-error' : ''}
                  />
                  {contactErrors.name && <span className="field-error">{contactErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email" type="email" placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    className={contactErrors.email ? 'input-error' : ''}
                  />
                  {contactErrors.email && <span className="field-error">{contactErrors.email}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone / WhatsApp <span className="optional">optional</span></label>
                  <input
                    id="phone" type="tel" placeholder="+91 1234567890"
                    value={contactForm.phone}
                    onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                    className={contactErrors.phone ? 'input-error' : ''}
                  />
                  {contactErrors.phone && <span className="field-error">{contactErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    value={contactForm.subject}
                    onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                    className={contactErrors.subject ? 'input-error' : ''}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {contactErrors.subject && <span className="field-error">{contactErrors.subject}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message" rows={5} placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className={contactErrors.message ? 'input-error' : ''}
                />
                {contactErrors.message && <span className="field-error">{contactErrors.message}</span>}
              </div>
              {contactErrors.submit && <div className="field-error">{contactErrors.submit}</div>}
              <button type="submit" className="button button-primary" disabled={contactLoading}>
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="contact-side">
          {/* 3. Contact Info */}
          <div className="section-card info-card">
            <p className="section-label">Contact Info</p>
            <div className="info-item">
              <span className="info-label">Support Email</span>
              <span className="info-value">blockbridgescamguardai@gmail.com</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">+91 6381487329</span>
            </div>
            <div className="info-item">
              <span className="info-label">Response Time</span>
              <span className="info-value">Within 24–48 hours</span>
            </div>
          </div>
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
              <button type="submit" className="button button-primary" disabled={reportLoading}>
                {reportLoading ? 'Submitting...' : 'Report Scam to AI Team'}
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
