import React, { useEffect, useState } from 'react';
import './styles.css';
import Home from './pages/Home';
import About from './About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Product from './pages/Product';
import Dashboard from './pages/Dashboard';
import PaymentUpload from './pages/PaymentUpload';
import MyPayments from './pages/MyPayments';
import ActivateSubscription from './pages/ActivateSubscription';
import ScanHistory from './pages/ScanHistory';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function getRoute() {
  const hash = window.location.hash || '#/';
  const route = hash.replace(/^#/, '');
  const valid = [
    '/', '/about', '/contact', '/pricing', '/login', '/product', '/dashboard',
    '/payment-upload', '/my-payments', '/activate', '/scan-history', '/admin/login', '/admin/dashboard'
  ];
  return valid.includes(route) ? route : '/';
}

function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auth page — full screen, no topbar
  if (route === '/login') return <Auth />;

  // Dashboard — has its own shell
  if (route === '/dashboard') return <Dashboard />;

  // Payment pages — full screen
  if (route === '/payment-upload') return <PaymentUpload />;
  if (route === '/my-payments') return <MyPayments />;
  if (route === '/activate') return <ActivateSubscription />;
  
  // Scan history page — full screen
  if (route === '/scan-history') return <ScanHistory />;

  // Admin pages — full screen
  if (route === '/admin/login') return <AdminLogin />;
  if (route === '/admin/dashboard') return <AdminDashboard />;

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">BlockBridge ScamGuard AI</div>
        <nav>
          <a href="#/" className={route === '/' ? 'nav-link active' : 'nav-link'}>Home</a>
          <a href="#/product" className={route === '/product' ? 'nav-link active' : 'nav-link'}>Product</a>
          <a href="#/about" className={route === '/about' ? 'nav-link active' : 'nav-link'}>About</a>
          <a href="#/pricing" className={route === '/pricing' ? 'nav-link active' : 'nav-link'}>Pricing</a>
          <a href="#/contact" className={route === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</a>
          <a href="#/login" className={route === '/login' ? 'nav-link active' : 'nav-link'}>Login</a>
        </nav>
      </header>
      <main>
        {route === '/'        && <Home />}
        {route === '/product' && <Product />}
        {route === '/about'   && <About />}
        {route === '/pricing' && <Pricing />}
        {route === '/contact' && <Contact />}
      </main>
    </div>
  );
}

export default App;
