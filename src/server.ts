import 'dotenv/config';
import {migrateToLatest} from "./db/migrate";
import fs from 'node:fs';

import app from './app';

// Server port
const port = process.env.PORT;

// Server
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require("https");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require("http");

// Start up http server
http.createServer(app).listen(port);
console.log("Express is listening on port", port);

// Create and start https server (only when not in non-docker / non-cloud env and certs are available)
if (
  process.env.NODE_ENV.toLowerCase() !== "cloud"
  && fs.existsSync('./https_private_key.pem')
  && fs.existsSync('./certificate.pem')
) {
  const httpsOptions = {
    key: fs.readFileSync('./https_private_key.pem'),
    cert: fs.readFileSync('./certificate.pem'),
  };
  https.createServer(httpsOptions, app).listen('3001');
  console.log("Https express is listening on port 3001");
} else {
  console.log("SSL private key / cert not found, skipping HTTPS setup...");
}

// Connect to postgres
async function main() {
  await migrateToLatest();
  console.log("Connected to postgres!");
}
main().catch((err) => console.log(err));

module.exports = app;
