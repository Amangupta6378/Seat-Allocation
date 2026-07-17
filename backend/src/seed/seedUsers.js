const { connectToDatabase } = require('../config/db');
const User = require('../models/User');

async function seedUsers() {
  console.log('Connecting to database...');
  await connectToDatabase();

  const accounts = [
    { username: 'admin', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { username: 'hr', name: 'HR User', email: 'hr@example.com', password: 'hr1234', role: 'hr' }
  ];

  for (const account of accounts) {
    const existing = await User.findOne({ $or: [{ email: account.email }, { username: account.username }] });
    if (existing) {
      existing.username = account.username;
      existing.name = account.name;
      existing.email = account.email;
      existing.password = account.password;
      existing.role = account.role;
      await existing.save();
    } else {
      await User.create(account);
    }
  }

  console.log('Seeded admin and HR users.');
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});