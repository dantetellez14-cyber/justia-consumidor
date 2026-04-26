#!/usr/bin/env node
// Injects a unique CACHE_VERSION into public/sw.js at build time.
// Uses VERCEL_GIT_COMMIT_SHA (available on Vercel) or a timestamp fallback.
const fs = require("fs");
const path = require("path");

const sha = process.env.VERCEL_GIT_COMMIT_SHA;
const version = sha ? sha.slice(0, 8) : Date.now().toString(36);
const swPath = path.join(__dirname, "../public/sw.js");

const original = fs.readFileSync(swPath, "utf8");
const updated = original.replace(
  /const CACHE_VERSION = "justia-[^"]+";/,
  `const CACHE_VERSION = "justia-${version}";`
);

fs.writeFileSync(swPath, updated);
console.log(`[inject-sw-version] CACHE_VERSION → justia-${version}`);
