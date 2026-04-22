const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/bms');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}
test();
