import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully to remote cluster');
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      console.warn('Remote MongoDB connection failed, falling back to MongoMemoryServer (test environment):', error.message);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to local in-memory MongoDB server at', uri);
      return;
    }

    console.error('CRITICAL: Remote MongoDB connection failed. Halting startup to prevent data loss or silent fallback:', error.message);
    throw error;
  }
};

export default connectDB;
