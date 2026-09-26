import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully to remote cluster');
  } catch (error) {
    console.warn('Remote MongoDB connection failed, falling back to MongoMemoryServer:', error.message);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to local in-memory MongoDB server at', uri);
  }
};

export default connectDB;
