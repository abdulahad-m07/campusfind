const crypto = require("crypto");
const { URL } = require("url");
const { ObjectId } = require("mongodb");

const connectDB = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "campusfind-dev-secret-change-me";

let cachedTokenLib = null;
let cachedBcrypt = null;
let cachedMulter = null;
let cachedBlob = null;

function getJsonWebTokenLib() {
  if (!cachedTokenLib) cachedTokenLib = require("jsonwebtoken");
  return cachedTokenLib;
}
function getBcrypt() {
  if (!cachedBcrypt) cachedBcrypt = require("bcryptjs");
  return cachedBcrypt;
}
function getMulter() {
  if (!cachedMulter) cachedMulter = require("multer");
  return cachedMulter;
}
function getBlob() {
  if (!cachedBlob) cachedBlob = require("@vercel/blob");
  return cachedBlob;
}

function roleFromUsername(username) {
  if (/^\d{9}$/.test(username)) return "student";
  if (/^[^\s@]+@acpce\.ac\.in$/i.test(username)) return "faculty";
  return null;
}

function publicUser(user) {
  return {
    _id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

function serializeItem(i) {
  return {
    ...i,
    _id: i._id.toString(),
    reporterId: i.reporterId ? i.reporterId.toString() : undefined,
    claimedBy: i.claimedBy ? i.claimedBy.toString() : undefined,
  };
}

async function getUserById(id) {
  const db = await connectDB();
  return db.collection("users").findOne({ _id: new ObjectId(id) });
}

async function requireAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const jwt = getJsonWebTokenLib();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.uid);
    return user || null;
  } catch {
    return null;
  }
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.end(body);
}

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain");
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function runUpload(req, user) {
  const multer = getMulter();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (rq, file, cb) => {
      if (file && file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files are allowed"));
    },
  });

  const reqObj = await new Promise((resolve, reject) => {
    upload.single("image")(req, { statusCode: 200, setHeader: () => {}, end: () => {} }, (err) =>
      err ? reject(err) : resolve(req)
    );
  });

  if (!reqObj.file) return { status: 400, body: { error: "No file uploaded" } };

  const blob = getBlob();
  const blobResult = await blob.put(
    `item-${crypto.randomBytes(13).toString("hex")}`,
    reqObj.file.buffer,
    {
      access: "public",
      contentType: reqObj.file.mimetype,
      addRandomSuffix: true,
    }
  );
  return { status: 200, body: { imageUrl: blobResult.url } };
}

// ---- Routes ----
async function route(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    return res.end();
  }

  // Diagnostics
  if (path === "/api/diag/nodb") return sendJson(res, 200, { ok: true, now: Date.now() });
  if (path === "/api/diag/db") {
    const start = Date.now();
    try {
      const db = await connectDB();
      await db.command({ ping: 1 });
      return sendJson(res, 200, { ok: true, ms: Date.now() - start });
    } catch (err) {
      return sendJson(res, 500, { ok: false, ms: Date.now() - start, error: err.message });
    }
  }

  if (path === "/api" || path === "/") return sendText(res, 200, "CampusFind backend is working!");

  // Auth login
  if (path === "/api/auth/login" && method === "POST") {
    let body;
    try {
      body = JSON.parse((await readBody(req)).toString() || "{}");
    } catch {
      return sendJson(res, 400, { error: "Invalid request body" });
    }
    const { username, password } = body;
    if (!username || !password) return sendJson(res, 400, { error: "Username and password are required" });

    const db = await connectDB();
    const user = await db.collection("users").findOne({ username: username.toLowerCase() });
    if (!user || !(await getBcrypt().compare(password, user.password))) {
      return sendJson(res, 401, { error: "Invalid username or password" });
    }
    const jwt = getJsonWebTokenLib();
    const token = jwt.sign({ uid: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return sendJson(res, 200, { token, user: publicUser(user) });
  }

  // Auth register
  if (path === "/api/auth/register" && method === "POST") {
    let body;
    try {
      body = JSON.parse((await readBody(req)).toString() || "{}");
    } catch {
      return sendJson(res, 400, { error: "Invalid request body" });
    }
    const { username, password, name } = body;
    if (!username || !password || !name) {
      return sendJson(res, 400, { error: "Username, password and name are required" });
    }
    const role = roleFromUsername(username);
    if (!role) {
      return sendJson(res, 400, {
        error: "Invalid username. Use a 9-digit PRN (student) or an @acpce.ac.in email (faculty).",
      });
    }
    if (password.length < 4) {
      return sendJson(res, 400, { error: "Password must be at least 4 characters" });
    }

    const db = await connectDB();
    const col = db.collection("users");
    const existing = await col.findOne({ username: username.toLowerCase() });
    if (existing) return sendJson(res, 409, { error: "Username already taken" });

    const hashed = await getBcrypt().hash(password, 10);
    const doc = { username: username.toLowerCase(), password: hashed, role, name, createdAt: new Date() };
    const result = await col.insertOne(doc);
    const user = { _id: result.insertedId, ...doc };
    const jwt = getJsonWebTokenLib();
    const token = jwt.sign({ uid: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return sendJson(res, 201, { token, user: publicUser(user) });
  }

  // Auth me
  if (path === "/api/auth/me" && method === "GET") {
    const user = await requireAuth(req);
    if (!user) return sendJson(res, 401, { error: "Authentication required" });
    return sendJson(res, 200, publicUser(user));
  }

  // Image upload
  if (path === "/api/upload" && method === "POST") {
    const user = await requireAuth(req);
    if (!user) return sendJson(res, 401, { error: "Authentication required" });
    try {
      const result = await runUpload(req, user);
      return sendJson(res, result.status, result.body);
    } catch (err) {
      return sendJson(res, 500, { error: err.message || "Image upload failed" });
    }
  }

  // Claim item
  const claimMatch = path.match(/^\/api\/items\/([^/]+)\/claim$/);
  if (claimMatch && method === "POST") {
    const user = await requireAuth(req);
    if (!user) return sendJson(res, 401, { error: "Authentication required" });
    let id = claimMatch[1];
    if (!ObjectId.isValid(id)) return sendJson(res, 404, { error: "Item not found" });

    const db = await connectDB();
    const col = db.collection("items");
    const item = await col.findOne({ _id: new ObjectId(id) });
    if (!item) return sendJson(res, 404, { error: "Item not found" });

    const isReporter = item.reporterId && item.reporterId.toString() === user._id.toString();
    const isFaculty = user.role === "faculty";
    if (!isReporter && !isFaculty) {
      return sendJson(res, 403, { error: "Only the reporter or faculty can claim this item" });
    }

    const updated = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { claimed: true, claimedBy: user._id, claimedAt: new Date() } },
      { returnDocument: "after", includeResultMetadata: true }
    );
    return sendJson(res, 200, serializeItem(updated.value));
  }

  // Single item
  const itemMatch = path.match(/^\/api\/items\/([^/]+)$/);
  if (itemMatch && method === "GET") {
    let id = itemMatch[1];
    if (!ObjectId.isValid(id)) return sendJson(res, 404, { error: "Item not found" });
    const db = await connectDB();
    const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
    if (!item) return sendJson(res, 404, { error: "Item not found" });
    return sendJson(res, 200, serializeItem(item));
  }

  // List items
  if (path === "/api/items" && method === "GET") {
    const q = (url.searchParams.get("q") || "").toString().trim().toLowerCase();
    const db = await connectDB();
    const filter = { claimed: { $ne: true } };
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ itemName: regex }, { description: regex }, { location: regex }];
    }
    const docs = await db.collection("items").find(filter).sort({ date: -1 }).toArray();
    return sendJson(res, 200, docs.map(serializeItem));
  }

  // Create item
  if (path === "/api/items" && method === "POST") {
    const user = await requireAuth(req);
    if (!user) return sendJson(res, 401, { error: "Authentication required" });
    let body;
    try {
      body = JSON.parse((await readBody(req)).toString() || "{}");
    } catch {
      return sendJson(res, 400, { error: "Invalid request body" });
    }
    const { type, itemName, description, location, date, contact, imageUrl } = body;
    if (!["lost", "found"].includes(type)) return sendJson(res, 400, { error: "type must be 'lost' or 'found'" });
    if (!itemName || !description || !location || !date || !contact) {
      return sendJson(res, 400, { error: "All required fields must be filled" });
    }
    const db = await connectDB();
    const doc = {
      type, itemName, description, location, date, contact,
      imageUrl: imageUrl || "",
      reporterId: user._id, reporterName: user.name, reporterRole: user.role,
      claimed: false, createdAt: new Date(),
    };
    const result = await db.collection("items").insertOne(doc);
    return sendJson(res, 201, serializeItem({ _id: result.insertedId, ...doc }));
  }

  return sendJson(res, 404, { error: "Not found" });
}

const handler = async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    sendJson(res, 500, { error: "Internal server error" });
  }
};

module.exports = handler;
module.exports.handler = handler;
