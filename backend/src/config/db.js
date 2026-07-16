const mongoose = require('mongoose');

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ethara';
  await mongoose.connect(uri, { dbName: 'ethara' });
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
  return mongoose.connection;
}

async function disconnectFromDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectToDatabase, disconnectFromDatabase };
