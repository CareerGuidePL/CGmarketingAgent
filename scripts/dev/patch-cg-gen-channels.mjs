/**
 * Patch cg-gen-content: normalize noisy `channels` input (Seatable / nested JSON strings).
 * Usage: node scripts/dev/patch-cg-gen-channels.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wfPath = path.join(__dirname, "..", "..", "workflows/generate/cg-gen-content.json");

const BUILD_PROMPT_JS = `const item = $input.first().json;
const DEF = { linkedin: 3000, facebook: 2200, instagram: 2200, x: 280, youtube: 5000, tiktok: 2200, default: 2000 };
const VALID = new Set(Object.keys(DEF).filter((k) => k !== "default"));
const DEFAULT_CH = ["linkedin", "facebook", "instagram"];

function stripChannelNoise(s) {
  let v = String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\\u201c|\\u201d/g, '"');
  let prev;
  do {
    prev = v;
    v = v.replace(/^[\\[\\s"\`'']+|[\\]\\s"\`'']+$/g, "").trim();
  } while (v !== prev);
  return v;
}

function isGarbageLabel(s) {
  const t = String(s || "").toLowerCase();
  return !t || /deleted\\s*option|deleted\\s*optic|\\[object\\s+object\\]/.test(t);
}

/** SeaTable Multiple Select czesto zwraca obiekty { name | text | label | display_value | value } zamiast stringow. */
function channelFromCellPart(p) {
  if (p == null || p === "") return "";
  if (typeof p === "object" && !Array.isArray(p)) {
    const v = p.name ?? p.text ?? p.label ?? p.display_value ?? p.display ?? p.option ?? p.value ?? "";
    return stripChannelNoise(v);
  }
  return stripChannelNoise(p);
}

function flattenChannelList(parts) {
  const out = [];
  for (const p of parts) {
    if (p == null || p === "") continue;
    if (typeof p === "object" && !Array.isArray(p)) {
      const t = channelFromCellPart(p);
      if (t && !isGarbageLabel(t)) out.push(t);
      continue;
    }
    const str = String(p).trim();
    if (str.startsWith("[")) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          for (const x of parsed) {
            const t = channelFromCellPart(x);
            if (t && !isGarbageLabel(t)) out.push(t);
          }
        } else {
          const t = channelFromCellPart(parsed);
          if (t && !isGarbageLabel(t)) out.push(t);
        }
      } catch (e) {
        const t = stripChannelNoise(str.replace(/[\\[\\]"]/g, ""));
        if (t && !isGarbageLabel(t)) out.push(t);
      }
    } else {
      const t = stripChannelNoise(str);
      if (t && !isGarbageLabel(t)) out.push(t);
    }
  }
  return [...new Set(out.filter(Boolean))];
}

function unwrapChannelsField(ch) {
  if (ch == null || ch === "") return null;
  if (Array.isArray(ch)) return ch;
  if (typeof ch === "string") return ch;
  if (typeof ch === "object") {
    if (Array.isArray(ch.options)) return ch.options;
    if (Array.isArray(ch.values)) return ch.values;
    const single = ch.text ?? ch.display ?? ch.name ?? ch.value;
    if (single != null && single !== "") return String(single);
    try {
      return JSON.stringify(ch);
    } catch (e) {
      return null;
    }
  }
  return String(ch);
}

function parseChannels(ch) {
  const raw = unwrapChannelsField(ch);
  if (raw === null) return DEFAULT_CH.slice();
  if (Array.isArray(raw)) {
    const flat = flattenChannelList(raw);
    const known = flat.filter((c) => VALID.has(c));
    /** Wiersz z >=2 slotami multi-select, ale tylko 1 poprawny kanal = zwykle usuniete opcje + jeden zywy tag. */
    if (raw.length >= 2 && known.length === 1) return DEFAULT_CH.slice();
    return known.length ? known : flat.length ? flat : DEFAULT_CH.slice();
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return DEFAULT_CH.slice();
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) {
        const flat = flattenChannelList(p);
        const known = flat.filter((c) => VALID.has(c));
        if (p.length >= 2 && known.length === 1) return DEFAULT_CH.slice();
        return known.length ? known : flat.length ? flat : DEFAULT_CH.slice();
      }
    } catch (e) {}
    const flat = flattenChannelList(t.split(/[,;]+/));
    const known = flat.filter((c) => VALID.has(c));
    return known.length ? known : flat.length ? flat : DEFAULT_CH.slice();
  }
  return DEFAULT_CH.slice();
}

const channels = parseChannels(item.channels);

let specs = {};
try {
  const raw = item.channel_specs;
  const arr = typeof raw === "string" ? JSON.parse(raw || "[]") : (raw || []);
  if (Array.isArray(arr)) for (const s of arr) {
    if (s && s.channel) {
      const k = String(s.channel).toLowerCase();
      specs[k] = { max_length: Number(s.max_length) || DEF[k] || DEF.default, tone: s.tone || "", post_structure: s.post_structure || "", emoji_style: s.emoji_style || "" };
    }
  }
} catch (e) {}
for (const c of channels) if (!specs[c]) specs[c] = { max_length: DEF[c] || DEF.default, tone: "", post_structure: "", emoji_style: "" };
const specLines = channels.map(c => \`- \${c}: max \${specs[c].max_length} znakow\` + (specs[c].tone ? \`, ton: \${specs[c].tone}\` : ""));
let userPrompt = \`Kanaly (w kolejnosci): \${channels.join(", ")}\\nLimity znakow:\\n\${specLines.join("\\n")}\\n\\nMaterial zrodlowy:\\n\${item.raw_text || ""}\`;
if (item.revision_feedback) userPrompt += \`\\n\\nPoprawki (zastosuj):\\n\${item.revision_feedback}\`;
const systemPrompt = \`Zwroc WYLACZNIE jeden obiekt JSON (bez znacznikow markdown, bez komentarzy), dokladnie w ksztalcie:
{"slides":[{"channel":"nazwa","body":"pelny tekst posta"}]}
Musi byc dokladnie \${channels.length} elementow w "slides", w kolejnosci kanalow: \${JSON.stringify(channels)}.
Pole "channel" musi dokladnie odpowiadac nazwie z listy (malymi literami).
Zasady tresci:
- linkedin: profesjonalnie, akapity, lista numerowana lub bullet, hashtagi na koncu
- facebook: luzniej, emoji OK, punkty z ✅
- instagram: zwiezle, wiecej emoji, enumeracja 1️⃣2️⃣3️⃣, hashtagi
- x: body max 280 znakow
Kazde "body": nie dluzsze niz limit znakow z zapytania dla tego kanalu. Pisz po polsku.\`;
return [{ json: { systemPrompt, userPrompt, job_id: item.job_id, assets: item.assets || "[]", channels, specs, slide_theme: item.slide_theme || "" } }];`;

const PARSE_SLIDES_JS = `const item = $input.first().json;
const raw = item.text || item.output || "";
let text = String(raw).trim();
const fence = text.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/);
if (fence) text = fence[1].trim();
let data;
try { data = JSON.parse(text); } catch (e) { throw new Error("Niepoprawny JSON z LLM: " + e.message); }
const slides = data.slides || [];
const meta = $('Build Prompt').first().json;
const channels = meta.channels || [];
const specs = meta.specs || {};
const jobId = meta.job_id;
const assets = meta.assets || "[]";

function normCh(x) {
  let v = String(x || "")
    .trim()
    .toLowerCase()
    .replace(/\\u201c|\\u201d/g, '"');
  let prev;
  do {
    prev = v;
    v = v.replace(/^[\\[\\s"\`']+|[\\]\\s"\`']+$/g, "").trim();
  } while (v !== prev);
  return v;
}

const out = [];
for (const ch of channels) {
  const chN = normCh(ch);
  const found = slides.find((s) => normCh(s.channel) === chN);
  let body = found ? String(found.body || "") : "";
  if (!body) body = "[Brak tresci dla " + chN + "]";
  const maxLen = (specs[chN] && specs[chN].max_length) || 3000;
  if (body.length > maxLen) body = body.slice(0, maxLen - 1) + "…";
  out.push({ json: { job_id: jobId, channel: chN, generated_text: body, assets, slide_theme: meta.slide_theme || "" } });
}
return out;`;

const wf = JSON.parse(fs.readFileSync(wfPath, "utf8"));
for (const n of wf.nodes) {
  if (n.id === "build-prompt") n.parameters.jsCode = BUILD_PROMPT_JS;
  if (n.id === "parse-slides") n.parameters.jsCode = PARSE_SLIDES_JS;
}
fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2) + "\n", "utf8");
console.log("Patched", wfPath);
