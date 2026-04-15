import { useState } from 'react';
import { Shield, Eye, Clock, User, HardDrive } from 'lucide-react';

const LOGS = [
  { id: 1, action: 'User Created', target: 'John Doe (Instructor)', actor: 'Admin Root', timestamp: '2026-04-12 14:22:15', severity: 'Info' },
  { id: 2, action: 'Schedule Override', target: 'React Session #12', actor: 'Admin Root', timestamp: '2026-04-12 13:45:02', severity: 'Warning' },
  { id: 3, action: 'Login Attempt', target: 'External IP 192.168.1.1', actor: 'System', timestamp: '2026-04-12 12:10:55', severity: 'Info' },
  { id: 4, action: 'Data Export', target: 'Student Attendance CSV', actor: 'Admin Root', timestamp: '2026-04-12 10:05:33', severity: 'Critical' },
];

export default function AuditLogsPage() {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={24} color="var(--primary)" />
            <h2>System Audit Logs</h2>
          </div>
          <button className="btn btn-secondary" style={{ gap: 8 }}>
            <HardDrive size={15} /> Export Archives
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Target</th>
                <th>Performer</th>
                <th>Severity</th>
                <th>Log</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} /> {log.timestamp}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.action}</td>
                  <td>{log.target}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                      <User size={13} /> {log.actor}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: 4, 
                      fontSize: '0.7rem', 
                      fontWeight: 800,
                      background: log.severity === 'Critical' ? 'var(--danger)' : 
                                 log.severity === 'Warning' ? '#f39c12' : 'var(--bg-input)',
                      color: log.severity === 'Critical' || log.severity === 'Warning' ? '#fff' : 'var(--text-secondary)'
                    }}>
                      {log.severity}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" title="View Details">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
