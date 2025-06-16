// test-connection.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Attempting to connect to: ' + process.env.MONGODB_URI);
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });
    await client.connect();
    console.log('Successfully connected to MongoDB');
    await client.close();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
  }
}

testConnection();
