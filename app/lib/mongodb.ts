import mongoose from "mongoose";

// Define a global cache for MongoDB connection
declare global {
  var mongooseCache: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

// Use the global cache to avoid multiple connections
const cached = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectToDatabase(): Promise<mongoose.Mongoose> {
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    console.log("📌 MONGODB_URI:", MONGODB_URI); // Debugging

    if (!MONGODB_URI) {
      throw new Error("⚠️ MONGODB_URI is missing in environment variables!");
    }

    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ Connected to MongoDB");
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
