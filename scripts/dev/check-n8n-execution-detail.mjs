/**
 * Szczegóły jednego execution (Public API n8n).
 * Użycie: node scripts/dev/check-n8n-execution-detail.mjs <executionId>
 */
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const execId = process.argv[2] || "1987";

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

const u = new URL(`${base}/api/v1/executions/${execId}?includeData=true`);
const lib = u.protocol === "https:" ? https : http;
const req = lib.request(
  { hostname: u.hostname, port: u.port || (u.protocol === "https:" ? 443 : 80), path: u.pathname + u.search, headers: { "X-N8N-API-KEY": key } },
  (r) => {
    let d = "";
    r.on("data", (c) => (d += c));
    r.on("end", () => {
      const j = JSON.parse(d);
      console.log("Status:", j.status, "| Workflow:", j.workflowId, "| Mode:", j.mode);
      console.log("Started:", j.startedAt, "| Stopped:", j.stoppedAt);
      if (j.data?.parentExecution) console.log("ParentExecution:", j.data.parentExecution.executionId);
      const runData = j.data?.resultData?.runData;
      if (runData) {
        for (const [nodeName, runs] of Object.entries(runData)) {
          const r0 = runs[0];
          if (r0?.error) {
            console.log(`  [ERR] ${nodeName}: ${(r0.error.message || "").slice(0, 120)}`);
            continue;
          }
          const mainOutputs = r0?.data?.main || [];
          const outputSummary = mainOutputs.map((out, i) => {
            const len = out?.length ?? 0;
            if (len === 0) return `out${i}:0`;
            const sample = out[0]?.json;
            if (sample && Object.keys(sample).length < 10 && JSON.stringify(sample).length < 200) {
              return `out${i}:${len} ${JSON.stringify(sample)}`;
            }
            return `out${i}:${len}`;
          }).join(" | ");
          console.log(`  ${nodeName}: ${outputSummary || "no outputs"}`);
        }
      }
      console.log("lastNodeExecuted:", j.data?.resultData?.lastNodeExecuted);
    });
  }
);
req.on("error", (e) => console.error(e));
req.end();
