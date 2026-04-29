/**
 * BMS Database Seed Script (Final Version)
 * Run with: node seed.cjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017/bms';

// Define Minimal Schemas for Seeding
const divisionSchema = new mongoose.Schema({ name: String, description: String });
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String },
  roles: [String],
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Division' }],
  status: { type: String, default: 'active' }
});

const Division = mongoose.model('Division', divisionSchema);
const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Divisions
    const existingDivs = await Division.find();
    let devDiv;

    if (existingDivs.length === 0) {
      console.log('🌱 Seeding Divisions...');
      devDiv = await Division.create({ name: 'Development', description: 'Full-stack software development' });
      await Division.create({ name: 'Cybersecurity', description: 'Network security and ethical hacking' });
      await Division.create({ name: 'Data Science', description: 'Machine learning and big data' });
      await Division.create({ name: 'CPD', description: 'Professional development' });
      console.log('✅ Divisions created.');
    } else {
      devDiv = await Division.findOne({ name: 'Development' });
    }

    // 2. Seed Admin
    const hashed = await bcrypt.hash('Admin@123', 12);
    await User.findOneAndUpdate(
      { email: 'admin@bms.com' },
      { name: 'Super Admin', password: hashed, roles: ['super_admin'], status: 'active' },
      { upsert: true }
    );
    console.log('✅ Super Admin ready.');

    // 3. Seed Instructor
    const iHashed = await bcrypt.hash('Instructor@123', 12);
    await User.findOneAndUpdate(
      { email: 'instructor@bms.com' },
      { 
        name: 'Test Instructor', 
        password: iHashed, 
        roles: ['division_admin'], 
        divisions: [devDiv._id],
        status: 'active' 
      },
      { upsert: true }
    );
    console.log('✅ Test Instructor ready.');

    // 4. Seed Student
    const sHashed = await bcrypt.hash('Student@123', 12);
    await User.findOneAndUpdate(
      { email: 'student@bms.com' },
      { 
        name: 'Test Student', 
        password: sHashed, 
        roles: ['student'], 
        divisions: [devDiv._id],
        status: 'active' 
      },
      { upsert: true }
    );
    console.log('✅ Test Student ready.');

    console.log('\n🎉 ALL ACCOUNTS READY! You can now log in as any role.');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
