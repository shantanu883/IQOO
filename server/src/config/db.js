import mongoose from "mongoose";
import { env, features } from "./env.js";

let connected = false;

export const isDbConnected = () => connected;

/**
 * Connect to MongoDB Atlas / local Mongo.
 *
 * If no MONGODB_URI is configured we intentionally DO NOT crash — the
 * server boots in "no-DB" mode so the frontend (in demo mode) and the
 * key-gated integrations can still be developed. Routes that require
 * the database guard on `isDbConnected()` and return a clear 503.
 */
export async function connectDB() {
  if (!features.db) {
    console.warn(
      "[db] MONGODB_URI not set — starting in no-DB mode. " +
        "Set it in server/.env to enable persistence and seeding."
    );
    return null;
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    connected = true;
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      connected = false;
      console.warn("[db] MongoDB disconnected");
    });

    return conn;
  } catch (err) {
    connected = false;
    console.error(`[db] MongoDB connection error: ${err.message}`);
    // Don't hard-exit; allow the process to serve non-DB routes and
    // surface a helpful error on DB-backed ones.
    return null;
  }
}
