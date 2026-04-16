import mongoose from 'mongoose';
import type { IDivision } from '../types/types.js';

const divisionSchema = new mongoose.Schema<IDivision>({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Division = mongoose.model<IDivision>('Division', divisionSchema);

export default Division;
