import mongoose from 'mongoose';
import { seedDatabase } from '../seed/seeder.js';

let mongoMemoryInstance = null;

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech';

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`[MongoDB]: Connection to ${targetUri} failed (${err.message}).`);
    console.log('[MongoDB]: Initializing embedded in-memory database instance...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryInstance.getUri() + 'agritech';
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Connected - In-Memory]: ${memUri}`);

      console.log('[MongoDB]: Seeding in-memory database with demo records...');
      await seedDatabase(false);
      console.log('[MongoDB]: Demo data ready.');
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB In-Memory Error]: ${memErr.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
