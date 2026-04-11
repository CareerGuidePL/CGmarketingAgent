#!/usr/bin/env node
/**
 * Lista workflowów na instancji (id + nazwa). N8N_API_URL, N8N_API_KEY z .env.
 */
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function get(urlStr, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    lib
      .get(u, { headers }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null });
          } catch (e) {
            resolve({ status: res.statusCode, json: null, raw: data });
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env"));
  const base = process.env.N8N_API_URL?.replace(/\/$/, "");
  const key = process.env.N8N_API_KEY;
  if (!base || !key) {
    console.error("Brak N8N_API_URL lub N8N_API_KEY w .env");
    process.exit(1);
  }
  const { status, json } = await get(`${base}/api/v1/workflows?limit=250`, {
    "X-N8N-API-KEY": key,
  });
  if (status < 200 || status >= 300) {
    console.error("HTTP", status, JSON.stringify(json).slice(0, 400));
    process.exit(1);
  }
  const rows = json?.data ?? json ?? [];
  for (const w of rows) {
    console.log(`${w.id}\t${w.name}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
