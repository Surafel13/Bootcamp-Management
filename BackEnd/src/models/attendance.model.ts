import mongoose from 'mongoose';
import type { IAttendance } from '../types/types.js';

const attendanceSchema = new mongoose.Schema<IAttendance>({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  status: { type: String, enum: ['attend', 'permission', 'absent'], required: true },
  markedAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Ensure one attendance per student per session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance
