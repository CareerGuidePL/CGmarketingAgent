#!/usr/bin/env node
/**
 * Tworzy workflowy na instancji n8n (POST), gdy nie istnieją jeszcze (PUT by zwrócił 404).
 * Kolejność: cg-gen-content → ingest → hitl → orchestrator (orchestrator dostaje zmapowane ID subworkflowu).
 * Wymaga N8N_API_URL, N8N_API_KEY w .env.
 *
 * Użycie: node scripts/n8n/create-workflows-remote.mjs
 */
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

const STEPS = [
  { rel: "workflows/generate/cg-gen-content.json", oldId: "z7FIfQqHzQGJW4ib" },
  { rel: "workflows/ingest/cg-ingest-discord.json", oldId: "MvyZHtercUEd3cVb" },
  { rel: "workflows/hitl/cg-hitl-discord-reply.json", oldId: "QV6IEXUG6GY9DM3l" },
  { rel: "workflows/orchestrator/cg-orchestrator-main.json", oldId: "ov4KpAcVoAuWnEPT" },
];

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

function stripForCreate(wf) {
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

function applyIdMapToJsonText(text, idMap) {
  let s = text;
  for (const [from, to] of Object.entries(idMap)) {
    if (from !== to) s = s.split(from).join(to);
  }
  return s;
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env"));
  const base = process.env.N8N_API_URL?.replace(/\/$/, "");
  const key = process.env.N8N_API_KEY;
  if (!base || !key) {
    console.error("Brak N8N_API_URL lub N8N_API_KEY (ustaw w .env).");
    process.exit(1);
  }

  /** @type {Record<string, string>} */
  const idMap = {};

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const fp = path.join(ROOT, step.rel);
    if (!fs.existsSync(fp)) {
      console.error("Brak pliku:", fp);
      process.exit(1);
    }
    let raw = fs.readFileSync(fp, "utf8");
    if (i === STEPS.length - 1) {
      raw = applyIdMapToJsonText(raw, idMap);
    }
    const wf = JSON.parse(raw);
    const payload = stripForCreate(wf);
    const url = `${base}/api/v1/workflows`;
    const { status, json } = await requestJson(url, "POST", { "X-N8N-API-KEY": key }, JSON.stringify(payload));
    if (status < 200 || status >= 300) {
      console.error("FAIL POST", step.rel, status, JSON.stringify(json).slice(0, 800));
      process.exit(1);
    }
    const newId = json?.id;
    if (!newId) {
      console.error("Brak id w odpowiedzi:", step.rel, JSON.stringify(json).slice(0, 400));
      process.exit(1);
    }
    idMap[step.oldId] = newId;
    console.log("Utworzono", step.rel, "→", json?.name, `id=${newId} (${status})`);
  }

  console.log("\nMapowanie starych ID → nowe:", idMap);
  console.log("\nW n8n przypnij credential’e do węzłów (SeaTable, Discord, Gemini, Google Drive), potem aktywuj workflowy.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
