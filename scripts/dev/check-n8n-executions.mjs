/**
 * Lista ostatnich wykonań workflowów (Public API n8n).
 * Użycie: node scripts/dev/check-n8n-executions.mjs [status] [wf:<workflowId>]
 */
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let k = t.slice(0, i).trim(), v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(path.join(ROOT, ".env"));
const base = process.env.N8N_API_URL.replace(/\/$/, "");
const key = process.env.N8N_API_KEY;

const statusFilter = process.argv[2] && !process.argv[2].startsWith("wf:") ? `&status=${process.argv[2]}` : "";
const wfFilter = process.argv.find(a => a.startsWith("wf:")) ? `&workflowId=${process.argv.find(a => a.startsWith("wf:")).slice(3)}` : "";
const u = new URL(base + `/api/v1/executions?limit=30&includeData=false${statusFilter}${wfFilter}`);
const lib = u.protocol === "https:" ? https : http;
const req = lib.request(
  { hostname: u.hostname, port: u.port || (u.protocol === "https:" ? 443 : 80), path: u.pathname + u.search, headers: { "X-N8N-API-KEY": key } },
  (r) => {
    let d = "";
    r.on("data", (c) => (d += c));
    r.on("end", () => {
      const j = JSON.parse(d);
      for (const ex of j.data || []) {
        const dur = ex.stoppedAt ? Math.round((new Date(ex.stoppedAt) - new Date(ex.startedAt)) / 1000) + "s" : "(running)";
        console.log(ex.id, "|", ex.status.padEnd(10), "|", dur, "|", ex.startedAt, "|", ex.workflowId);
      }
    });
  }
);
req.on("error", (e) => console.error(e));
req.end();
