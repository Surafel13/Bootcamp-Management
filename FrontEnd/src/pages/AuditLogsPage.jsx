import { useState, useEffect } from 'react';
import { Shield, Eye, Clock, User, HardDrive } from 'lucide-react';
import apiFetch from '../utils/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/reports/logs');
      setLogs(data.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getSeverity = (method) => {
    switch (method) {
      case 'DELETE': return 'Critical';
      case 'PATCH':  return 'Warning';
      case 'POST':   return 'Info';
      default:       return 'Info';
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={24} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>System Audit Logs</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Security tracking and administrative action history</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ gap: 8 }} onClick={() => window.print()}>
            <HardDrive size={15} /> Export PDF
          </button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Fetching security logs...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Resource Path</th>
                  <th>Performer</th>
                  <th>Severity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const severity = getSeverity(log.action);
                  return (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} /> {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.path}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                          <User size={13} /> {log.user?.name || 'System'}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: 4, 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          background: severity === 'Critical' ? 'var(--danger)' : 
                                     severity === 'Warning' ? '#f39c12' : 'var(--bg-input)',
                          color: severity === 'Critical' || severity === 'Warning' ? '#fff' : 'var(--text-secondary)'
                        }}>
                          {severity}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn" title="View Details">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs recorded yet. Perform an action to see it logged here.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
