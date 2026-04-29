import mongoose from 'mongoose';
import type { IIpRange } from '../types/types.js';

const ipRangeSchema = new mongoose.Schema<IIpRange>({
  name: String,
  startIP: String, // e.g., "192.168.1.1"
  endIP: String,   // e.g., "192.168.1.50"
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const IpRange = mongoose.model<IIpRange>('IpRange', ipRangeSchema);

export default IpRange
