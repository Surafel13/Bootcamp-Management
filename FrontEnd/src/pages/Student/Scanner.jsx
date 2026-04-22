import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, CircleCheckBig, AlertTriangle, Shield, CheckCircle, Clock, Play } from 'lucide-react';
import apiFetch from '../../utils/api';

export default function Scanner() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, success, error
  const [statusMessage, setStatusMessage] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchOngoingSessions = async () => {
    try {
      setLoading(true);
      // Fetch only upcoming/ongoing sessions
      const data = await apiFetch('/sessions?status=upcoming');
      setSessions(data.data.sessions || []);
      
      // If there is only one session, auto-select it
      if (data.data.sessions?.length === 1) {
        setActiveSession(data.data.sessions[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pollActiveQR = useCallback(async () => {
    if (!activeSession || scanStatus === 'success') return;

    try {
      const data = await apiFetch(`/sessions/${activeSession._id}/active-qr`);
      if (data.qrToken) {
        setQrToken(data.qrToken);
        setQrImage(data.qrImage);
        setTimeLeft(data.expiresIn);
      } else {
        setQrToken(null);
        setQrImage(null);
        setTimeLeft(0);
      }
    } catch (err) {
      console.error('Error polling QR:', err);
    }
  }, [activeSession, scanStatus]);

  useEffect(() => {
    fetchOngoingSessions();
  }, []);

  useEffect(() => {
    let pollInterval;
    if (activeSession && scanStatus !== 'success') {
      pollActiveQR(); // Initial poll
      pollInterval = setInterval(pollActiveQR, 3000); // Poll every 3s
    }
    return () => clearInterval(pollInterval);
  }, [activeSession, scanStatus, pollActiveQR]);

  useEffect(() => {
    let timerInterval;
    if (timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const handleCheckIn = async () => {
    if (!qrToken) return;

    setVerifying(true);
    try {
      const response = await apiFetch('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ qrToken })
      });

      setScanStatus('success');
      setStatusMessage(`Attendance recorded: ${response.data?.status || 'Success'}!`);
    } catch (err) {
      setScanStatus('error');
      setStatusMessage(err.message || 'Verification failed');
      // After an error, let them try again by resetting after a few seconds
      setTimeout(() => {
        setScanStatus('idle');
        setStatusMessage('');
      }, 3000);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Clock size={40} className="animate-spin" style={{ marginBottom: 16 }} />
          <p>Finding ongoing sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="card" style={{ maxWidth: '620px', width: '100%', margin: '40px auto' }}>
        
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QrCode size={28} color="var(--primary)" />
            Attendance Check-In
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeSession ? `Session: ${activeSession.title}` : 'Select a session to check-in'}
          </p>
        </div>

        <div style={{ padding: '32px 28px' }}>
          {!activeSession ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p>No active sessions found for check-in right now.</p>
                </div>
              ) : (
                sessions.map(s => (
                  <button 
                    key={s._id} 
                    className="card" 
                    style={{ 
                      padding: 16, 
                      textAlign: 'left', 
                      width: '100%', 
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-input)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    onClick={() => setActiveSession(s)}
                  >
                    <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={12} style={{ marginRight: 4 }} /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {s.location}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : scanStatus === 'success' ? (
            <div style={{
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 184, 148, 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed #00b894',
              padding: '20px',
              textAlign: 'center'
            }}>
              <CheckCircle size={80} color="#00b894" style={{ marginBottom: 20 }} />
              <h3 style={{ color: '#00b894', margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 800 }}>CHECKED IN!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{statusMessage}</p>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: 24 }}
                onClick={() => {
                  setActiveSession(null);
                  setScanStatus('idle');
                  fetchOngoingSessions();
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '3px solid var(--border)',
                  background: '#fff',
                  aspectRatio: '1 / 1',
                  maxWidth: '300px',
                  margin: '0 auto 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow)',
                }}
              >
                {qrImage ? (
                  <img src={qrImage} alt="QR Code" style={{ width: '90%', height: '90%' }} />
                ) : (
                  <div style={{ padding: 40, color: 'var(--text-muted)' }}>
                    <Clock size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem' }}>Waiting for Instructor to broadcast QR...</p>
                  </div>
                )}
                
                {qrToken && (
                   <div style={{ 
                     position: 'absolute', 
                     bottom: 10, 
                     right: 10, 
                     background: 'var(--primary)', 
                     color: 'white', 
                     fontSize: '0.7rem', 
                     padding: '2px 8px', 
                     borderRadius: 99,
                     fontWeight: 700
                   }}>
                     {timeLeft}s
                   </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                {qrToken ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px', fontSize: '1.1rem', gap: 12 }}
                    onClick={handleCheckIn}
                    disabled={verifying}
                  >
                    {verifying ? <Clock className="animate-spin" size={20} /> : <Play size={20} />}
                    {verifying ? 'Verifying...' : 'Check-In Now'}
                  </button>
                ) : (
                  <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                    <Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    QR Code is not yet active for this session
                  </div>
                )}
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => {
                  setActiveSession(null);
                  setQrToken(null);
                  setQrImage(null);
                }}
              >
                Back to Session List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}