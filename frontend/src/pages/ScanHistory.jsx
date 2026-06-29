import { useState, useEffect } from 'react';
import '../scan-history.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const userData = localStorage.getItem('bb_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchScans();
  }, [filters]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bb_token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('types', filters.type);
      if (filters.search) params.append('searchQuery', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_URL}/api/scan-history?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskStatus = (score) => {
    if (score < 26) return { color: '#42d8b1', bg: '#e8f8f3', label: 'SAFE' };
    if (score < 51) return { color: '#f0b429', bg: '#fff8e8', label: 'LOW RISK' };
    if (score < 76) return { color: '#ff9a3d', bg: '#fff3e8', label: 'SUSPICIOUS' };
    return { color: '#ff6a6a', bg: '#ffe8e8', label: 'DANGEROUS' };
  };

  const getScanIcon = (type) => {
    const icons = {
      URL: '🔍', EMAIL: '📧', WHATSAPP: '💬',
      QR: '📷', SCREENSHOT: '🖼', JOB: '💼', INVESTMENT: '💰'
    };
    return icons[type] || '🔍';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Input', 'Risk Score', 'Status', 'Result'];
    const rows = scans.map(scan => {
      const status = getRiskStatus(scan.risk_score);
      return [
        formatDate(scan.created_at),
        scan.scan_type,
        scan.input.substring(0, 100),
        scan.risk_score,
        status.label,
        scan.result
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const isPro = user?.plan === 'PRO' || user?.plan === 'BUSINESS';
  const isBusiness = user?.plan === 'BUSINESS';

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentScans = scans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(scans.length / itemsPerPage);

  if (loading) {
    return (
      <div className="scan-history-container">
        <div className="loading">Loading scan history...</div>
      </div>
    );
  }

  return (
    <div className="scan-history-container">
      <div className="history-header">
        <div>
          <h1>Scan History</h1>
          <p>View and manage all your security scans</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isBusiness && (
            <button onClick={exportToCSV} className="button button-secondary">
              📊 Export CSV
            </button>
          )}
          <button onClick={() => window.location.hash = '#/dashboard'} className="button button-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Scan Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            disabled={!isPro}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="URL">URL</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="QR">QR Code</option>
            <option value="SCREENSHOT">Screenshot</option>
            <option value="JOB">Job</option>
            <option value="INVESTMENT">Investment</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search scans..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            disabled={!isPro}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            disabled={!isPro}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            disabled={!isPro}
            className="filter-input"
          />
        </div>

        {!isPro && (
          <div className="filter-upgrade-notice">
            🔒 Upgrade to Pro to unlock filtering and search
          </div>
        )}
      </div>

      {/* History Table */}
      {scans.length === 0 ? (
        <div className="empty-state">
          <p>No scan history found</p>
          <button onClick={() => window.location.hash = '#/dashboard'} className="button button-primary">
            Start Scanning
          </button>
        </div>
      ) : (
        <>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Scanner</th>
                  <th>Input</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentScans.map((scan) => {
                  const status = getRiskStatus(scan.risk_score);
                  return (
                    <tr key={scan.id}>
                      <td>{formatDate(scan.created_at)}</td>
                      <td>
                        <span className="scan-type">
                          {getScanIcon(scan.scan_type)} {scan.scan_type}
                        </span>
                      </td>
                      <td className="input-cell">
                        {scan.input.substring(0, 50)}
                        {scan.input.length > 50 && '...'}
                      </td>
                      <td>
                        <span className="risk-score" style={{ color: status.color }}>
                          {scan.risk_score}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ 
                          background: status.bg, 
                          color: status.color 
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-button"
                          disabled={!isPro}
                          title={!isPro ? 'Upgrade to Pro for PDF reports' : 'Download PDF Report'}
                        >
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
