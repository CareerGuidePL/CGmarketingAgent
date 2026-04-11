/**
 * Rate-limit SeaTable: usuwa Search Row ID, retry+backoff na SeaTable, scheduler co 5 min.
 * Uruchom z korzenia repo: node scripts/dev/patch-orchestrator-seatable-throttle.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const WF = path.join(ROOT, "workflows/orchestrator/cg-orchestrator-main.json");

const RETRY = {
  retryOnFail: true,
  maxTries: 2,
  waitBetweenTries: 8000,
};

function patchSection(nodes, connections) {
  const idx = nodes.findIndex((n) => n.id === "search-row");
  if (idx >= 0) nodes.splice(idx, 1);

  for (const node of nodes) {
    if (node.type === "n8n-nodes-base.scheduleTrigger") {
      const iv = node.parameters?.rule?.interval?.[0];
      if (iv && iv.field === "minutes" && iv.minutesInterval === 2) {
        iv.minutesInterval = 30;
      }
    }
    if (node.type === "n8n-nodes-base.seaTable") {
      Object.assign(node, RETRY);
    }
    const jc = node.parameters?.jsCode;
    if (typeof jc === "string") {
      node.parameters.jsCode = jc.replaceAll(
        "$('Search Row ID').first().json._id",
        "$('Get Jobs To Process').first().json._id",
      );
    }
    const rowId = node.parameters?.rowId;
    if (typeof rowId === "string" && rowId.includes("$('Search Row ID')")) {
      node.parameters.rowId = rowId.replaceAll(
        "$('Search Row ID').first().json._id",
        "$('Get Jobs To Process').first().json._id",
      );
    }
  }

  if (connections["Get Jobs To Process"]?.main?.[0]?.[0]) {
    connections["Get Jobs To Process"].main[0][0].node = "Mark Generating";
  }
  delete connections["Search Row ID"];
}

const data = JSON.parse(fs.readFileSync(WF, "utf8"));
patchSection(data.nodes, data.connections);
if (data.activeVersion?.nodes && data.activeVersion?.connections) {
  patchSection(data.activeVersion.nodes, data.activeVersion.connections);
}

fs.writeFileSync(WF, `${JSON.stringify(data, null, 2)}\n`);
console.log("OK:", WF);
