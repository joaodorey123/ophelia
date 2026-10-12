#!/usr/bin/env node
/**
 * Turns a password into the value of BUILDER_PASSWORD_HASH.
 *
 *   npm run builder:hash-password
 *
 * The password is read from a prompt rather than an argument so it does not end
 * up in the shell history, and it is never written to a file — copy the hash
 * into the environment yourself.
 */

import { createInterface } from 'node:readline';
import { randomBytes, scryptSync } from 'node:crypto';

const SCRYPT = { N: 16_384, r: 8, p: 1, keylen: 64 };

const rl = createInterface({ input: process.stdin, output: process.stdout });

const password = await new Promise((resolve) => {
  rl.question('Password for the editor: ', resolve);
});
rl.close();

if (!password || password.length < 10) {
  console.error('\nUse at least 10 characters.\n');
  process.exit(1);
}

const salt = randomBytes(16);
const derived = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);

console.log('\nAdd this to your environment variables:\n');
console.log(`BUILDER_PASSWORD_HASH="scrypt:${salt.toString('hex')}:${derived.toString('hex')}"\n`);
