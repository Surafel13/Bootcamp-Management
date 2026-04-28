import { useState, useRef } from 'react';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, X, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../features/ui/uiSlice';
import { useScanQR } from '../../features/bootcamps/bootcampsApi';

export default function ScannerPage() {
    const dispatch = useDispatch();
    const scanQR = useScanQR();
    const [qrToken, setQrToken] = useState('');
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
    const [scanMode, setScanMode] = useState<'text' | 'camera'>('text');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const toast = (message: string, type: 'success' | 'error' = 'success') =>
        dispatch(addToast({ message, type }));

    const handleScan = async () => {
        if (!qrToken.trim()) {
            toast('Please enter a QR code token', 'error');
            return;
        }

        setScanResult(null);

        try {
            const result = await scanQR.mutateAsync(qrToken);
            setScanResult({
                success: true,
                message: result.message || 'Attendance recorded successfully',
                data: result.data
            });
            toast(result.message || 'Attendance recorded!', 'success');
            setQrToken('');
            stopCamera();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to scan QR code';
            setScanResult({
                success: false,
                message: errorMessage
            });
            toast(errorMessage, 'error');
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setQrToken(text);
            toast('QR token pasted', 'success');
        } catch {
            toast('Failed to paste from clipboard', 'error');
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
            toast('Camera started. Use a QR scanner app to scan, then paste the token.', 'success');
        } catch (err) {
            toast('Failed to access camera. Please check permissions.', 'error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast('Image uploaded. Please use a QR decoder to extract the token.', 'success');
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Instructions */}
            <div className="card bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <QrCode size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary mb-1">How to Mark Attendance</h3>
                        <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                            <li>Your instructor will display a QR code during the session</li>
                            <li>Choose your preferred scanning method below</li>
                            <li>For camera: Use your phone's QR scanner app to scan and copy the token</li>
                            <li>For text: Paste the token directly if you already have it</li>
                            <li>Click "Mark Attendance" to submit</li>
                        </ol>
                        <p className="text-xs text-text-muted mt-2">
                            Note: QR codes expire after 5 minutes and can only be scanned during the session time window.
                        </p>
                    </div>
                </div>
            </div>

            {/* Scan Mode Selector */}
            <div className="card">
                <h2 className="text-lg font-black text-text-primary mb-4">Select Scanning Method</h2>
                <div className="flex gap-3">
                    <button
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${scanMode === 'text'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40'
                            }`}
                        onClick={() => {
                            setScanMode('text');
                            stopCamera();
                        }}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <QrCode size={24} className={scanMode === 'text' ? 'text-primary' : 'text-text-muted'} />
                            <span className={`font-bold text-sm ${scanMode === 'text' ? 'text-primary' : 'text-text-secondary'}`}>
                                Paste Token
                            </span>
                        </div>
                    </button>
                    <button
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${scanMode === 'camera'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40'
                            }`}
                        onClick={() => setScanMode('camera')}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Camera size={24} className={scanMode === 'camera' ? 'text-primary' : 'text-text-muted'} />
                            <span className={`font-bold text-sm ${scanMode === 'camera' ? 'text-primary' : 'text-text-secondary'}`}>
                                Use Camera
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Scanner Input */}
            <div className="card">
                <h2 className="text-lg font-black text-text-primary mb-4">
                    {scanMode === 'text' ? 'Paste QR Token' : 'Camera Scanner'}
                </h2>

                {scanMode === 'text' ? (
                    <div className="flex flex-col gap-3">
                        <div className="form-group">
                            <label>QR Code Token</label>
                            <textarea
                                className="form-input"
                                rows={4}
                                placeholder="Paste the QR code token here..."
                                value={qrToken}
                                onChange={e => setQrToken(e.target.value)}
                                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="btn btn-secondary flex items-center gap-2"
                                onClick={handlePaste}
                            >
                                <QrCode size={15} /> Paste from Clipboard
                            </button>
                            <button
                                className="btn btn-primary flex items-center gap-2 flex-1"
                                onClick={handleScan}
                                disabled={scanQR.isPending || !qrToken.trim()}
                            >
                                <CheckCircle size={15} />
                                {scanQR.isPending ? 'Marking Attendance...' : 'Mark Attendance'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {!cameraActive ? (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Camera size={36} className="text-primary" />
                                </div>
                                <p className="text-sm text-text-secondary text-center max-w-md">
                                    Start your camera to view the QR code. You'll need to use a QR scanner app to decode it and paste the token below.
                                </p>
                                <button
                                    className="btn btn-primary flex items-center gap-2"
                                    onClick={startCamera}
                                >
                                    <Camera size={15} /> Start Camera
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="relative bg-black rounded-lg overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-80 object-cover"
                                    />
                                    <button
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-danger flex items-center justify-center hover:bg-danger/80 transition-colors"
                                        onClick={stopCamera}
                                    >
                                        <X size={16} className="text-white" />
                                    </button>
                                </div>
                                <p className="text-xs text-text-muted text-center">
                                    Use your phone's QR scanner app to scan the code, then paste the token below
                                </p>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Paste Token After Scanning</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="Paste the decoded token here..."
                                value={qrToken}
                                onChange={e => setQrToken(e.target.value)}
                                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="btn btn-secondary flex items-center gap-2"
                                onClick={handlePaste}
                            >
                                <QrCode size={15} /> Paste Token
                            </button>
                            <button
                                className="btn btn-primary flex items-center gap-2 flex-1"
                                onClick={handleScan}
                                disabled={scanQR.isPending || !qrToken.trim()}
                            >
                                <CheckCircle size={15} />
                                {scanQR.isPending ? 'Marking Attendance...' : 'Mark Attendance'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Scan Result */}
            {scanResult && (
                <div className={`card ${scanResult.success ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${scanResult.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                            {scanResult.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold mb-1 ${scanResult.success ? 'text-success' : 'text-danger'}`}>
                                {scanResult.success ? 'Success!' : 'Failed'}
                            </h3>
                            <p className="text-sm text-text-secondary mb-2">{scanResult.message}</p>
                            {scanResult.success && scanResult.data && (
                                <div className="flex flex-col gap-1 text-xs text-text-muted">
                                    {scanResult.data.sessionTitle && (
                                        <span>Session: {scanResult.data.sessionTitle}</span>
                                    )}
                                    {scanResult.data.status && (
                                        <span className="capitalize">Status: {scanResult.data.status}</span>
                                    )}
                                    {scanResult.data.timestamp && (
                                        <span>Time: {new Date(scanResult.data.timestamp).toLocaleString()}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="card bg-bg-hover">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-warning" />
                    Tips & Troubleshooting
                </h3>
                <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
                    <li>Make sure you're scanning the QR code within the session time window (15 minutes before to 30 minutes after session start)</li>
                    <li>Each QR code can only be used once per student</li>
                    <li>If the QR code has expired, ask your instructor to generate a new one</li>
                    <li>You must be enrolled in the bootcamp to mark attendance</li>
                    <li>Camera access requires browser permissions - allow when prompted</li>
                    <li>If you're having issues, contact your instructor for manual attendance marking</li>
                </ul>
            </div>
        </div>
    );
}