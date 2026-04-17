import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, Search, Filter } from 'lucide-react';

const AttendancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('monthly'); // weekly | monthly

  // Sample Data
  const summary = {
    totalClasses: 48,
    attended: 42,
    absent: 4,
    permission: 2,
    percentage: 87.5
  };

  const heatmapData = [
    // Simplified 7x5 example (real implementation can be expanded)
    { date: '2026-04-01', status: 'present' },
    { date: '2026-04-02', status: 'present' },
    { date: '2026-04-03', status: 'absent' },
    { date: '2026-04-04', status: 'present' },
    { date: '2026-04-05', status: 'permission' },
    // ... more data for full month
  ];

  const attendanceHistory = [
    { id: 1, date: '2026-04-14', subject: 'Advanced React Patterns', status: 'present', time: '2:00 PM - 4:00 PM' },
    { id: 2, date: '2026-04-13', subject: 'Cybersecurity Fundamentals', status: 'present', time: '3:00 PM - 5:00 PM' },
    { id: 3, date: '2026-04-12', subject: 'Data Analysis with Python', status: 'absent', time: '1:00 PM - 3:00 PM' },
    { id: 4, date: '2026-04-11', subject: 'Web Development Workshop', status: 'permission', time: '10:00 AM - 12:00 PM' },
    { id: 5, date: '2026-04-10', subject: 'Advanced React Patterns', status: 'present', time: '2:00 PM - 4:00 PM' },
  ];

  const filteredHistory = attendanceHistory
    .filter(record => 
      record.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'All' || record.status === statusFilter.toLowerCase())
    );

  const getStatusColor = (status) => {
    if (status === 'present') return 'var(--success)';
    if (status === 'absent') return 'var(--danger)';
    return 'var(--warning)';
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return <CheckCircle size={18} color="var(--success)" />;
    if (status === 'absent') return <XCircle size={18} color="var(--danger)" />;
    return <AlertTriangle size={18} color="var(--warning)" />;
  };

  const getHeatmapColor = (status) => {
    if (status === 'present') return '#00b894';
    if (status === 'absent') return '#d63031';
    return '#fdcb6e';
  };

  const lowAttendance = summary.percentage < 75;

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track your class attendance and performance</p>
      </div>

      {/* Attendance Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <p className="stat-label">Total Classes</p>
          <div className="stat-value">{summary.totalClasses}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <p className="stat-label">Classes Attended</p>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{summary.attended}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <p className="stat-label">Absent</p>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{summary.absent}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <p className="stat-label">Attendance Rate</p>
          <div className="stat-value" style={{ color: summary.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
            {summary.percentage}%
          </div>
          {lowAttendance && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '8px' }}>
              ⚠️ Attendance below 75% — needs improvement
            </p>
          )}
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Attendance Heatmap</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>April 2026</span>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '6px',
            maxWidth: '620px'
          }}>
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i + 1;
              const status = day % 7 === 0 ? 'absent' : day % 5 === 0 ? 'permission' : 'present';
              return (
                <div
                  key={i}
                  title={`April ${day}, 2026 — ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: getHeatmapColor(status),
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: '#00b894', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Present</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: '#d63031', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Absent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: '#fdcb6e', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Permission</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Attendance History</h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px', minWidth: '140px' }}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Permission">Permission</option>
            </select>
          </div>
        </div>

        <div className="table-wrap" style={{ padding: '0 24px 24px' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject / Course</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.subject}</td>
                  <td>{record.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(record.status)}
                      <span style={{ 
                        color: getStatusColor(record.status),
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Highlight (if needed) */}
      <div className="card" style={{ marginTop: '24px', background: 'var(--bg-active)' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--success)' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)' }}>Today’s Class Marked Present</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Advanced React Patterns • 2:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;