/**
 * cPanel "Setup Node.js App" startup file.
 *
 * The hosting runs Node through Phusion Passenger, which starts this file and
 * hands the app its port. It loads the server-only settings from
 * .env.production (uploaded by the deploy workflow, never committed), then
 * starts Next's standalone server from ./server.
 *
 * The server lives in a subfolder because CloudLinux's Node selector reserves
 * `node_modules` in the app root for its own virtual environment.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS: Passenger requires this file directly. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Settings made in cPanel's own environment-variable screen win.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, '.env.production'));
process.env.NODE_ENV = 'production';
// Shared hosts often preset HOSTNAME to the machine's own name; bind locally,
// Passenger proxies the public traffic in.
process.env.HOSTNAME = '127.0.0.1';

const serverDir = path.join(__dirname, 'server');
process.chdir(serverDir);
require(path.join(serverDir, 'server.js'));
