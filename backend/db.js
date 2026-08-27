const { MongoClient } = require("mongodb");

let cached = global.__mongo;

if (!cached) {
  cached = global.__mongo = { client: null, db: null };
}

async function connectDB() {
  if (cached.db) return cached.db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 4000,
    connectTimeoutMS: 4000,
  });

  await client.connect();
  cached.client = client;
  cached.db = client.db();

  return cached.db;
}

function getDB() {
  return cached.db;
}

module.exports = connectDB;
module.exports.getDB = getDB;
