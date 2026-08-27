require("dotenv").config();

const http = require("http");
const handler = require("./app");

const PORT = process.env.PORT || 3000;

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`CampusFind backend running on http://localhost:${PORT}`);
});
