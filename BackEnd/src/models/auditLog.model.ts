import mongoose from 'mongoose';
import type { IAuditLog } from '../types/types.js';

const auditLogSchema = new mongoose.Schema<IAuditLog>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String, // e.g., "POST", "PATCH", "DELETE"
  entity: String, // e.g., "Task", "Session"
  entityId: String,
  entityType: { type: String },
  path: String,
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
