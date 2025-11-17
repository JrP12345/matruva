// connectDb.js
import { MongoClient } from "mongodb";

let client;
let db;

const connectDb = async () => {
  try {
    if (db) return db; // prevent multiple connections

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    db = client.db(); // auto picks DB from URI

    console.log("✓ Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB:", error.message);
    throw error;
  }
};

export default connectDb;
