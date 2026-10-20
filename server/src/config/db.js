import mongoose from 'mongoose';
import dns from 'dns';

// Ensure reliable SRV DNS resolution for MongoDB Atlas across local routers/ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura';

  try {
    mongoose.set('bufferTimeoutMS', 2500);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`[Database Error] Failed to connect to MongoDB at ${uri}: ${error.message}`);
    console.error(`[Database Help] Ensure MongoDB is running locally or specify a valid MONGODB_URI in server/.env (e.g., MongoDB Atlas connection string).`);
    // We don't exit in dev mode immediately so health checks and mock diagnostics can still report status cleanly
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});
