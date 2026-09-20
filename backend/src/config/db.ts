import mongoose from "mongoose";
import { databaseConfig } from "./database";
import { env } from "./index";

let isConnected = false;
let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(
      databaseConfig.uri,
      databaseConfig.options,
    );
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`Primary MongoDB connection failed (${error?.message || error}).`);

    // In development or test, fall back to embedded in-memory MongoDB server
    if (env.NODE_ENV !== "production") {
      try {
        console.log("Starting embedded in-memory MongoDB fallback server...");
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect().catch(() => {});
        }
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        console.log(`Fallback in-memory MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (memErr) {
        console.error("Failed to start in-memory MongoDB fallback:", memErr);
      }
    }

    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
  if (mongodInstance) {
    await mongodInstance.stop().catch(() => {});
    mongodInstance = null;
  }
  isConnected = false;
  console.log("MongoDB disconnected");
};

mongoose.connection.on("connected", () => {
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err?.message || err);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
});

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

export default mongoose;
