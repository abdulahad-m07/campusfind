const { MongoMemoryServer } = require("mongodb-memory-server");

async function start() {
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri();
  process.env.MONGODB_URI = uri;
  console.log("[dev] In-memory MongoDB started at", uri);
  require("./server.js");
}

start().catch((e) => {
  console.error("[dev] Failed to start in-memory MongoDB:", e);
  process.exit(1);
});
