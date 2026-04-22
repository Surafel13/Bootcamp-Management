import { useState, useEffect } from 'react';
import { QrCode, Play, Clock, X, AlertCircle, RefreshCw } from 'lucide-react';
import apiFetch from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorQRPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [qrLoading, setQrLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attendanceType, setAttendanceType] = useState('present');

  const fetchOngoingSessions = async () => {
    try {
      setLoading(true);
      // Fetch only upcoming/ongoing sessions
      const data = await apiFetch('/sessions?status=upcoming');
      setSessions(data.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getQR = async (sessionId) => {
    try {
      setQrLoading(true);
      setErrorMsg('');
      const data = await apiFetch(`/sessions/${sessionId}/generate-qr`, { 
        method: 'POST',
        body: JSON.stringify({ attendanceType })
      });
      setQrToken(data.qrImage); // Set the base64 image string
      setTimeLeft(20);
    } catch (err) {
      console.error(err);
      setErrorMsg(`${err.message} (ID: ${sessionId})`);
      setQrToken(null);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingSessions();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession && qrToken && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQrToken(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, qrToken, timeLeft]);

  const handleStartQR = (session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    if (now < startTime) {
      const diffMs = startTime - now;
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      alert(`Cannot generate QR code yet.\nSession starts in ${hoursLeft} hours and ${minutesLeft} minutes.`);
      return;
    }
    setActiveSession(session);
    getQR(session._id);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Detecting ongoing sessions...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {!activeSession ? (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, background: 'var(--primary-glow)', borderRadius: 12, color: 'var(--primary)' }}>
                <QrCode size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Attendance Broadcast</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select a session to display its check-in QR code</p>
              </div>
            </div>
          </div>
          
          <div style={{ padding: 20 }}>
            {sessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <Clock size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <h3>No sessions scheduled right now</h3>
                <p>Go to the Sessions tab to create or start a bootcamp session.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {sessions.map(s => (
                  <div key={s._id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, marginBottom: 4 }}>{s.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} style={{ marginRight: 4 }} /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {s.location}
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleStartQR(s)}>
                      <Play size={14} /> Broadcast QR
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <button className="btn btn-secondary" onClick={() => setActiveSession(null)}>
              <X size={16} /> Back to List
            </button>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontWeight: 900 }}>{activeSession.title}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Live Attendance Check-in</p>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: 30, 
            borderRadius: 24, 
            display: 'inline-block', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            marginBottom: 30,
            position: 'relative'
          }}>
            {errorMsg ? (
              <div style={{ width: 300, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'red', textAlign: 'center' }}>
                <AlertCircle size={48} style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 'bold' }}>{errorMsg}</p>
              </div>
            ) : qrLoading ? (
              <div style={{ width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="animate-spin" size={32} color="var(--primary)" />
              </div>
            ) : qrToken ? (
              <img 
                src={qrToken} // The backend now sends the full data URL in qrImage/qrToken
                alt="Attendance QR" 
                style={{ width: 300, height: 300 }}
              />
            ) : (
              <div style={{ width: 300, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', borderRadius: 12 }}>
                <QrCode size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center', padding: '0 20px' }}>QR Code Expired or Not Generated.</p>
                <button className="btn btn-primary" onClick={() => getQR(activeSession._id)}>
                  Generate / Refresh
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
             <button 
              className={`btn ${attendanceType === 'present' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAttendanceType('present')}
              style={{ flex: 1, maxWidth: 150 }}
             >
               Mark Present
             </button>
             <button 
              className={`btn ${attendanceType === 'late' ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setAttendanceType('late')}
              style={{ flex: 1, maxWidth: 150, background: attendanceType === 'late' ? '#ffbe0b' : '', color: attendanceType === 'late' ? '#000' : '' }}
             >
               Mark Late
             </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: qrToken ? 'var(--primary)' : 'var(--text-muted)' }}>
              {qrToken ? `Expiring in ${timeLeft}s` : 'Waiting for generation'}
            </div>
            <div className="badge" style={{ padding: '6px 16px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 800 }}>
              <RefreshCw size={14} style={{ marginRight: 6 }} /> Dynamic Anti-Fraud Mode Active
            </div>
            <p style={{ maxWidth: 400, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 10 }}>
              Students should scan this code using their Student Dashboard. 
              The code changes automatically to prevent photo sharing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
