/**
 * Retry + backoff na wszystkich wezlach SeaTable w cg-ingest-discord; scheduler co 3 min.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const WF = path.join(ROOT, "workflows/ingest/cg-ingest-discord.json");

const RETRY = {
  retryOnFail: true,
  maxTries: 2,
  waitBetweenTries: 8000,
};

function patchSection(nodes) {
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
  }
}

const data = JSON.parse(fs.readFileSync(WF, "utf8"));
patchSection(data.nodes);
if (data.activeVersion?.nodes) patchSection(data.activeVersion.nodes);

fs.writeFileSync(WF, `${JSON.stringify(data, null, 2)}\n`);
console.log("OK:", WF);
