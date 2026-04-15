import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, CameraOff, CircleCheckBig, AlertTriangle, Shield } from 'lucide-react';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error, expired
  const [statusMessage, setStatusMessage] = useState('');
  const [scannedCode, setScannedCode] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Simulate QR scanning (In real app, integrate with jsQR or ZXing)
  const simulateScan = () => {
    if (!isScanning) return;

    setScanStatus('scanning');
    setStatusMessage('Scanning...');

    // Simulate successful scan after 1.8 seconds
    setTimeout(() => {
      const isValid = Math.random() > 0.3; // 70% success rate for demo

      if (isValid) {
        setScanStatus('success');
        setStatusMessage('Attendance recorded successfully');
        setScannedCode('SESS-2026-0416-ROOM-A');
      } else {
        setScanStatus('error');
        setStatusMessage('Invalid or expired QR code');
      }
    }, 1800);
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
      setStatusMessage('Scanning...');
      
      // Start simulated scanning loop
      simulateScan();
    } catch (err) {
      setScanStatus('error');
      setStatusMessage('Camera access denied or unavailable');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setScanStatus('idle');
    setStatusMessage('');
    setScannedCode(null);
  };

  // Auto-restart scanning simulation when active
  useEffect(() => {
    let interval;
    if (isScanning && scanStatus === 'scanning') {
      interval = setInterval(simulateScan, 2500);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanStatus]);

  const resetScan = () => {
    setScanStatus('idle');
    setStatusMessage('');
    setScannedCode(null);
  };

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '620px', width: '100%' }}>
        
        {/* Header */}
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QrCode size={28} color="var(--primary)" />
            Session QR Check-In
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Point your camera at the session QR code
          </p>
        </div>

        <div style={{ padding: '32px 28px' }}>
          
          {/* Scanner Container */}
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
            {/* Video Feed */}
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

            {/* Placeholder when not scanning */}
            {!isScanning && (
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
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Camera is ready</p>
                <p style={{ fontSize: '0.9rem' }}>Click "Start Scanner" to begin</p>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <>
                {/* Corner Markers */}
                <div style={{ position: 'absolute', inset: '20px', pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', top: '0', left: '0', width: '50px', height: '50px', borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', top: '0', right: '0', width: '50px', height: '50px', borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: '0', left: '0', width: '50px', height: '50px', borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '50px', height: '50px', borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '8px' }} />
                </div>

                {/* Animated Scanning Line */}
                <div 
                  className="scan-line"
                  style={{
                    position: 'absolute',
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                    boxShadow: '0 0 12px var(--primary)',
                    animation: 'scan 2s linear infinite',
                  }}
                />
              </>
            )}
          </div>

          {/* Status Message */}
          <div style={{ marginTop: '24px', textAlign: 'center', minHeight: '60px' }}>
            {scanStatus === 'success' && (
              <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 }}>
                <CircleCheckBig size={24} />
                {statusMessage}
              </div>
            )}

            {scanStatus === 'error' && (
              <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 }}>
                <AlertTriangle size={24} />
                {statusMessage}
              </div>
            )}

            {scanStatus === 'scanning' && (
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {statusMessage}
              </div>
            )}

            {scanStatus === 'idle' && (
              <p style={{ color: 'var(--text-muted)' }}>Position the QR code within the frame</p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            {!isScanning ? (
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '14px' }}
                onClick={startScanner}
              >
                <Camera size={18} />
                Start Scanner
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '14px' }}
                onClick={stopScanner}
              >
                <CameraOff size={18} />
                Stop Scanner
              </button>
            )}

            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '14px' }}
              onClick={resetScan}
              disabled={isScanning}
            >
              <CircleCheckBig size={18} />
              Manual Check-in
            </button>
          </div>

          {/* Security Info */}
          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: 'var(--bg-input)', 
            borderRadius: 'var(--radius)', 
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.85rem'
          }}>
            <Shield size={20} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Secure Scan Active</div>
              <div style={{ color: 'var(--text-secondary)' }}>Connected to approved campus network</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation for scanning line */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 15%; }
          100% { top: 85%; }
        }
        
        .scan-line {
          animation: scan 1.8s linear infinite;
        }
      `}</style>
    </div>
  );
}