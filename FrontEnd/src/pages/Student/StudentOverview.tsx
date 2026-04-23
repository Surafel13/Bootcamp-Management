import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import apiFetch from '../../utils/api';

const AttendancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        const data = await apiFetch('/attendance/me');
        setAttendanceHistory(data.data.attendances || data.data.records || []);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAttendance();
  }, []);

  const total = attendanceHistory.length;
  const attended = attendanceHistory.filter(r => r.status === 'present').length;
  const late = attendanceHistory.filter(r => r.status === 'late').length;
  const absent = attendanceHistory.filter(r => r.status === 'absent').length;
  const percentage = total > 0 ? Math.round(((attended + late) / total) * 100) : 0;

  const filteredHistory = attendanceHistory.filter(record => {
    const sessionTitle = record.session?.title || '';
    const matchSearch = sessionTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || record.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const getStatusIcon = (status) => {
    if (status === 'present') return <CheckCircle size={18} color="var(--success)" />;
    if (status === 'late') return <AlertTriangle size={18} color="#fdcb6e" />;
    return <XCircle size={18} color="var(--danger)" />;
  };

  const getStatusColor = (status) => {
    if (status === 'present') return 'var(--success)';
    if (status === 'late') return '#b7860a';
    return 'var(--danger)';
  };

  const getHeatmapColor = (status) => {
    if (status === 'present') return '#00b894';
    if (status === 'late') return '#fdcb6e';
    if (status === 'absent') return '#d63031';
    return 'var(--border)';
  };

  const lowAttendance = percentage < 75;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>Track your class attendance and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <p className="stat-label">Total Sessions</p>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <p className="stat-label">Attended</p>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{attended}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <p className="stat-label">Absent</p>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{absent}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <p className="stat-label">Attendance Rate</p>
          <div className="stat-value" style={{ color: percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
            {percentage}%
          </div>
          {lowAttendance && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '8px' }}>
              ⚠️ Below 75% — needs improvement
            </p>
          )}
        </div>
      </div>

      {/* Attendance Heatmap (Visual using real data) */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Attendance Calendar</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', maxWidth: '620px' }}>
            {Array.from({ length: 35 }).map((_, i) => {
              const day = new Date();
              day.setDate(day.getDate() - (34 - i));
              const match = attendanceHistory.find(r =>
                new Date(r.scannedAt).toDateString() === day.toDateString()
              );
              const status = match ? match.status : null;
              return (
                <div key={i} title={`${day.toDateString()}${status ? ` — ${status}` : ' — No session'}`} style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: status ? getHeatmapColor(status) : 'var(--border)',
                  cursor: 'pointer', transition: 'transform 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[['Present', '#00b894'], ['Late', '#fdcb6e'], ['Absent', '#d63031'], ['No Session', 'var(--border)']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, background: color, borderRadius: 4 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Attendance History</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="search-box">
              <Search size={15} />
              <input placeholder="Search session..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ padding: '8px 12px', minWidth: '140px' }}>
              <option value="All">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div className="table-wrap" style={{ padding: '0 24px 24px' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading your attendance...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Time Scanned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30 }}>No attendance records found.</td></tr>
                ) : filteredHistory.map(record => (
                  <tr key={record._id}>
                    <td>{record.scannedAt ? new Date(record.scannedAt).toLocaleDateString() : '-'}</td>
                    <td>{record.session?.title || '-'}</td>
                    <td>{record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getStatusIcon(record.status)}
                        <span style={{ color: getStatusColor(record.status), fontWeight: 600, textTransform: 'capitalize' }}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;