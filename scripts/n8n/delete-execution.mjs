#!/usr/bin/env node
/**
 * DELETE pojedynczego execution w n8n (Public API).
 * Klucz i URL z repo `.env`: N8N_API_URL, N8N_API_KEY (jak przy push workflowów).
 *
 * Użycie: node scripts/n8n/delete-execution.mjs <executionId>
 */
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
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

function request(urlStr, method, headers, body = "") {
  const u = new URL(urlStr);
  const lib = u.protocol === "https:" ? https : http;
  const opts = {
    method,
    hostname: u.hostname,
    port: u.port || (u.protocol === "https:" ? 443 : 80),
    path: u.pathname + u.search,
    headers: {
      ...headers,
      "Content-Length": Buffer.byteLength(body),
    },
  };
  return new Promise((resolve, reject) => {
    const req = lib.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch {
          json = data ? { raw: data } : null;
        }
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env"));
  const base = process.env.N8N_API_URL?.replace(/\/$/, "");
  const key = process.env.N8N_API_KEY;
  const id = process.argv[2]?.trim();

  if (!base || !key) {
    console.error("Brak N8N_API_URL lub N8N_API_KEY (ustaw w .env).");
    process.exit(1);
  }
  if (!id) {
    console.error("Podaj executionId: node scripts/n8n/delete-execution.mjs <id>");
    process.exit(1);
  }

  const url = `${base}/api/v1/executions/${encodeURIComponent(id)}`;
  const { status, json } = await request(url, "DELETE", {
    "X-N8N-API-KEY": key,
  });

  if (status >= 200 && status < 300) {
    console.log("OK", id, `(${status})`);
  } else {
    console.error("FAIL", status, JSON.stringify(json).slice(0, 500));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
