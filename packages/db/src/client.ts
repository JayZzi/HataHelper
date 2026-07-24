import mongoose, { ConnectOptions } from 'mongoose';

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: MongooseGlobal | undefined;
}

if (!globalThis.mongooseGlobal) {
  globalThis.mongooseGlobal = { conn: null, promise: null };
}

const cached: MongooseGlobal = globalThis.mongooseGlobal;

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const MONGO_URI =
    uri ||
    process.env.MONGO_URI ||
    'mongodb://admin:secretpassword@localhost:27017/hatahelper?authSource=admin';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      console.log('MongoDB successfully connected!');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}