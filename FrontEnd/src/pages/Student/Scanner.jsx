import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, CameraOff, CircleCheckBig, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import apiFetch from '../../utils/api';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [statusMessage, setStatusMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleScanSuccess = async (qrToken) => {
    setLoading(true);
    setScanStatus('scanning');
    setStatusMessage('Verifying attendance...');

    try {
      const response = await apiFetch('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({ qrToken })
      });

      setScanStatus('success');
      setStatusMessage(`Attendance recorded: ${response.data?.status || 'Success'}!`);
      setIsScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      setScanStatus('error');
      setStatusMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsScanning(true);
      setScanStatus('scanning');
      setStatusMessage('Waiting for QR code...');
    } catch (err) {
      setScanStatus('error');
      setStatusMessage('Camera access denied or unavailable');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
    setScanStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '620px', width: '100%' }}>
        
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QrCode size={28} color="var(--primary)" />
            Session Check-In
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scan the QR code or enter the token manually
          </p>
        </div>

        <div style={{ padding: '32px 28px' }}>
          
          <div 
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '3px solid var(--border)',
              background: '#000',
              aspectRatio: '4 / 3',
              boxShadow: 'var(--shadow)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isScanning ? 'block' : 'none',
              }}
            />

            {!isScanning && scanStatus !== 'success' && (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-input)',
                color: 'var(--text-secondary)',
              }}>
                <Camera size={64} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.6 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Ready for Check-In</p>
              </div>
            )}

            {scanStatus === 'success' && (
               <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: statusMessage.toLowerCase().includes('late') ? 'rgba(255, 190, 11, 0.15)' : 'rgba(0, 184, 148, 0.15)',
                color: statusMessage.toLowerCase().includes('late') ? '#ffbe0b' : '#00b894',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  padding: '30px', 
                  width: '80%', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {statusMessage.toLowerCase().includes('late') ? (
                    <AlertTriangle size={60} color="#ffbe0b" style={{ marginBottom: 15 }} />
                  ) : (
                    <CheckCircle size={60} color="#00b894" style={{ marginBottom: 15 }} />
                  )}
                  <h3 style={{ color: '#1a1a1a', margin: '0 0 5px 0' }}>{statusMessage.toLowerCase().includes('late') ? 'LATE' : 'PRESENT'}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>Verification Successful</p>
                  
                  <div style={{ width: '100%', borderTop: '1px dashed #eee', paddingTop: 15, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>NAME</span>
                      <span style={{ color: '#333', fontWeight: 600, fontSize: '0.8rem' }}>{statusMessage.split(': ')[1]?.split('!')[0] || 'Verified Student'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>TIME</span>
                      <span style={{ color: '#333', fontWeight: 600, fontSize: '0.8rem' }}>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanStatus === 'error' && (
               <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 118, 117, 0.15)',
                color: '#ff7675',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  padding: '30px', 
                  width: '80%', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <CameraOff size={60} color="#ff7675" style={{ marginBottom: 15 }} />
                  <h3 style={{ color: '#1a1a1a', margin: '0 0 5px 0' }}>INVALID</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 10 }}>{statusMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', minHeight: '60px' }}>
            {scanStatus === 'success' ? (
              <div style={{ color: '#00b894', fontWeight: 700, fontSize: '1.1rem' }}>Entry Recorded Successfully</div>
            ) : scanStatus === 'error' ? (
              <div style={{ color: 'var(--danger)', fontWeight: 600 }}>Try scanning again or contact admin</div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>{statusMessage || 'Awaiting input...'}</div>
            )}
          </div>

          {!isScanning && scanStatus !== 'success' && (
            <div style={{ marginTop: 20 }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>MANUAL TOKEN ENTRY</label>
               <div style={{ display: 'flex', gap: 10 }}>
                 <input 
                  className="form-input" 
                  placeholder="Paste token here..." 
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  style={{ flex: 1 }}
                 />
                 <button 
                  className="btn btn-primary" 
                  disabled={!manualToken || loading}
                  onClick={() => handleScanSuccess(manualToken)}
                 >
                   Verify
                 </button>
               </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            {scanStatus === 'success' ? (
               <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setScanStatus('idle')}>Scan Another</button>
            ) : !isScanning ? (
              <button className="btn btn-primary" style={{ flex: 1, padding: '14px' }} onClick={startScanner}>
                <Camera size={18} /> Start Camera
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={stopScanner}>
                <CameraOff size={18} /> Stop Camera
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}