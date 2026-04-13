const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'division_admin', 'student'], default: 'student' },
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Division' }],
  status: { type: String, enum: ['active', 'suspended', 'graduated'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);