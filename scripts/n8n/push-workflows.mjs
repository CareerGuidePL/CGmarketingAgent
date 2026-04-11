#!/usr/bin/env node
/**
 * PUT workflow JSON to n8n (update by id embedded in file).
 * Loads N8N_API_URL, N8N_API_KEY from repo .env (does not print secrets).
 * Usage: node scripts/n8n/push-workflows.mjs [workflow.json ...]
 * Default: orchestrator, generate, ingest paths used by CG agent.
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

function stripForApi(wf) {
  const o = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: wf.settings?.executionOrder ?? "v1",
    },
  };
  if (wf.staticData !== undefined) o.staticData = wf.staticData;
  if (wf.pinData !== undefined) o.pinData = wf.pinData;
  return o;
}

function requestJson(urlStr, method, headers, body) {
  const u = new URL(urlStr);
  const lib = u.protocol === "https:" ? https : http;
  const opts = {
    method,
    hostname: u.hostname,
    port: u.port || (u.protocol === "https:" ? 443 : 80),
    path: u.pathname + u.search,
    headers: {
      ...headers,
      "Content-Type": "application/json",
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
          json = { raw: data };
        }
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env"));
  const base = process.env.N8N_API_URL?.replace(/\/$/, "");
  const key = process.env.N8N_API_KEY;
  if (!base || !key) {
    console.error("Brak N8N_API_URL lub N8N_API_KEY (ustaw w .env).");
    process.exit(1);
  }

  const defaults = [
    "workflows/orchestrator/cg-orchestrator-main.json",
    "workflows/generate/cg-gen-content.json",
    "workflows/ingest/cg-ingest-discord.json",
  ];
  const rels =
    process.argv.length > 2 ? process.argv.slice(2) : defaults;

  for (const rel of rels) {
    const fp = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
    if (!fs.existsSync(fp)) {
      console.error("Brak pliku:", fp);
      process.exit(1);
    }
    const wf = JSON.parse(fs.readFileSync(fp, "utf8"));
    const id = wf.id;
    if (!id) {
      console.error("Brak workflow id w JSON:", rel);
      process.exit(1);
    }
    const payload = stripForApi(wf);
    const url = `${base}/api/v1/workflows/${id}`;
    const { status, json } = await requestJson(
      url,
      "PUT",
      { "X-N8N-API-KEY": key },
      JSON.stringify(payload)
    );
    if (status >= 200 && status < 300) {
      console.log("OK", rel, "->", json?.name || id, `(${status})`);
    } else {
      console.error("FAIL", rel, status, JSON.stringify(json).slice(0, 500));
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
