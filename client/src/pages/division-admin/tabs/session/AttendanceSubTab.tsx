import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { QrCode, X, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { addToast } from '../../../../features/ui/uiSlice';
import type { Attendance } from '../../../../features/bootcamps/types';
import { useSessionAttendance, useMarkAttendanceManual, useUpdateAttendance, useGenerateQR } from '../../../../features/bootcamps/bootcampsApi';

const STATUS_OPTIONS: Attendance['status'][] = ['present', 'absent', 'late', 'excused'];

const STATUS_STYLES = {
  present: 'bg-success/10 text-success',
  absent: 'bg-danger/10 text-danger',
  late: 'bg-warning/10 text-warning',
  excused: 'bg-info/10 text-info',
};

const STATUS_ICONS = {
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  excused: AlertCircle,
};

export default function AttendanceSubTab({ sessionId }: { sessionId: string }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useSessionAttendance(sessionId);
  const markAttendance = useMarkAttendanceManual();
  const updateAttendance = useUpdateAttendance();
  const generateQR = useGenerateQR();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<{ qrImage: string; expiresIn: number; sessionTitle: string } | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [noteText, setNoteText] = useState('');

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const handleStatusChange = async (studentId: string, attendanceId: string | null, currentStatus: string, newStatus: Attendance['status']) => {
    if (currentStatus === newStatus) return;

    try {
      if (attendanceId) {
        await updateAttendance.mutateAsync({ id: attendanceId, sessionId, status: newStatus });
      } else {
        await markAttendance.mutateAsync({ studentId, sessionId, status: newStatus });
      }
      toast('Attendance updated.');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to update attendance.', 'error');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const result = await generateQR.mutateAsync(sessionId);
      setQrData(result);
      setShowQRModal(true);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to generate QR code.', 'error');
    }
  };

  const handleDownloadQR = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.qrImage;
    link.download = `attendance-qr-${sessionId}.png`;
    link.click();
  };

  const openNoteModal = (record: any) => {
    setSelectedRecord(record);
    setNoteText(record.note || '');
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedRecord?.attendanceId) return;
    try {
      await updateAttendance.mutateAsync({
        id: selectedRecord.attendanceId,
        sessionId,
        note: noteText || undefined,
      });
      toast('Note saved.');
      setShowNoteModal(false);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to save note.', 'error');
    }
  };

  if (isLoading) return <div className="py-12 text-center text-text-muted text-sm">Loading attendance…</div>;

  const attendance = data?.attendance || [];
  const stats = data?.stats || { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats & Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Attendance Overview</h3>
          <button className="btn btn-primary flex items-center gap-2" onClick={handleGenerateQR}>
            <QrCode size={15} /> Generate QR Code
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-bg-hover rounded-lg p-3">
            <div className="text-xs text-text-muted mb-1">Total</div>
            <div className="text-xl font-black text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-success/10 rounded-lg p-3">
            <div className="text-xs text-success mb-1">Present</div>
            <div className="text-xl font-black text-success">{stats.present}</div>
          </div>
          <div className="bg-danger/10 rounded-lg p-3">
            <div className="text-xs text-danger mb-1">Absent</div>
            <div className="text-xl font-black text-danger">{stats.absent}</div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3">
            <div className="text-xs text-warning mb-1">Late</div>
            <div className="text-xl font-black text-warning">{stats.late}</div>
          </div>
          <div className="bg-info/10 rounded-lg p-3">
            <div className="text-xs text-info mb-1">Excused</div>
            <div className="text-xl font-black text-info">{stats.excused}</div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        {attendance.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">No students enrolled in this bootcamp yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-text-muted border-b border-border">
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Marked At</th>
                  <th className="py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record: any) => {
                  const Icon = STATUS_ICONS[record.status as Attendance['status']];
                  return (
                    <tr key={record.student._id} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">
                              {record.student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-text-primary">{record.student.name}</div>
                            <div className="text-xs text-text-muted">{record.student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-none outline-none cursor-pointer capitalize ${STATUS_STYLES[record.status as Attendance['status']]}`}
                          value={record.status}
                          onChange={e => handleStatusChange(record.student._id, record.attendanceId, record.status, e.target.value as Attendance['status'])}
                          disabled={markAttendance.isPending || updateAttendance.isPending}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-xs text-text-muted">
                        {record.markedAt ? new Date(record.markedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </td>
                      <td className="py-3">
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => openNoteModal(record)}
                          disabled={!record.attendanceId}
                        >
                          {record.note ? 'View/Edit' : 'Add Note'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowQRModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Attendance QR Code</h2>
              <button className="modal-close" onClick={() => setShowQRModal(false)}><X size={15} /></button>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <img src={qrData.qrImage} alt="Attendance QR Code" className="w-64 h-64" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary mb-1">{qrData.sessionTitle}</p>
                <p className="text-xs text-text-muted">Expires in {Math.floor(qrData.expiresIn / 60)} minutes</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowQRModal(false)}>Close</button>
              <button className="btn-primary flex items-center gap-2" onClick={handleDownloadQR}>
                <Download size={14} /> Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedRecord && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNoteModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Attendance Note</h2>
              <button className="modal-close" onClick={() => setShowNoteModal(false)}><X size={15} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Student</label>
                <div className="text-sm font-semibold text-text-primary">{selectedRecord.student.name}</div>
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Add a note or reason for this attendance status..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-actions mt-4">
              <button className="btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSaveNote}
                disabled={updateAttendance.isPending}
              >
                {updateAttendance.isPending ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}