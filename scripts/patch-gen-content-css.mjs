import fs from "fs";

const p = new URL("../workflows/generate/cg-gen-content.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(p, "utf8"));

const NEW = `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");:root{--cg-brand-primary:#4d96d9;--cg-brand-accent:#89c6eb;--cg-text-default:#1a1e32;--cg-text-muted:#667797;--cg-surface-page:#fcfcfe;--cg-surface-card:#ffffff;--cg-border-default:#e0e1e8;--cg-matcher-cyan:#00acc1;--cg-matcher-purple:#8e44ad;--cg-matcher-pink:#d81b60}.cg-root.cg-dark{--cg-brand-primary:#93c5fd;--cg-brand-accent:#bae6fd;--cg-text-default:#f8fafc;--cg-text-muted:#94a3b8;--cg-surface-page:#0c0e14;--cg-surface-card:rgba(30,41,59,0.55);--cg-border-default:rgba(148,163,184,0.14);--cg-ring-brand:rgba(147,197,253,0.35)}*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0;width:100%;min-height:100vh;background:#0c0e14;-webkit-font-smoothing:antialiased}body{font-family:"Inter",system-ui,sans-serif;font-size:18px;line-height:1.6;color:#f8fafc;background:#0c0e14}.cg-root{width:1200px;min-height:630px;color:var(--cg-text-default);position:relative;isolation:isolate;background:var(--cg-surface-page)}.cg-root.cg-dark{background-color:#0c0e14;background-image:radial-gradient(ellipse 90% 70% at 10% -15%,rgba(77,150,217,0.22),transparent 55%),radial-gradient(ellipse 75% 60% at 92% 8%,rgba(142,68,173,0.18),transparent 50%),radial-gradient(ellipse 55% 45% at 75% 100%,rgba(0,172,193,0.12),transparent 50%),linear-gradient(168deg,#0a0c12 0%,#111827 38%,#0f172a 72%,#0c0e14 100%)}.cg-root.cg-dark::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:radial-gradient(circle at center,transparent 0%,rgba(0,0,0,0.35) 100%);opacity:0.85}.cg-root.cg-dark::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0.07;background-image:linear-gradient(rgba(248,250,252,0.35) 1px,transparent 1px),linear-gradient(90deg,rgba(248,250,252,0.35) 1px,transparent 1px);background-size:48px 48px}.cg-root.cg-dark>*{position:relative;z-index:1}.cg-post-layout{width:100%;padding:56px 72px;display:flex;flex-direction:column;gap:24px}.cg-post-header{display:flex;align-items:center;gap:16px;margin-bottom:8px;flex-wrap:wrap}.cg-logo{width:56px;height:auto;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4))}.cg-kicker{font-size:15px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--cg-brand-primary);text-shadow:0 0 24px var(--cg-ring-brand)}.cg-channel-pill{font-size:13px;font-weight:600;padding:6px 14px;border-radius:999px;background:var(--cg-surface-card);border:1px solid var(--cg-border-default);color:var(--cg-brand-accent);box-shadow:0 0 0 1px rgba(255,255,255,0.04) inset,0 8px 24px -8px rgba(0,0,0,0.4);backdrop-filter:blur(8px)}.cg-user-image{width:100%;border-radius:16px;overflow:hidden;margin-bottom:8px;border:1px solid var(--cg-border-default);box-shadow:0 12px 40px -12px rgba(0,0,0,0.5)}.cg-user-image:empty{display:none}.cg-user-image img{width:100%;height:auto;display:block;border-radius:16px}.cg-post-body{font-size:20px;line-height:1.65;color:var(--cg-text-default)}.cg-post-body p{margin:0 0 16px}.cg-post-body strong{font-weight:700}.cg-post-body h1,.cg-post-body h2,.cg-post-body h3{margin:24px 0 12px;line-height:1.3;letter-spacing:-0.02em;text-shadow:0 1px 0 rgba(255,255,255,0.06),0 18px 40px rgba(0,0,0,0.45)}.cg-post-body h1{font-size:36px;font-weight:700}.cg-post-body h2{font-size:28px;font-weight:700}.cg-post-body h3{font-size:22px;font-weight:600}.cg-hashtag{color:var(--cg-brand-primary);font-weight:500}.cg-rule{height:5px;width:140px;border-radius:999px;background:linear-gradient(90deg,var(--cg-matcher-cyan),var(--cg-matcher-purple),var(--cg-matcher-pink));margin:16px 0 0;box-shadow:0 0 20px rgba(0,172,193,0.45),0 0 36px rgba(142,68,173,0.35)}`;

function patchNodes(nodes, label) {
  let n = 0;
  for (const node of nodes) {
    const jc = node.parameters?.jsCode;
    if (typeof jc === "string" && jc.includes("const baseCss = `")) {
      if (jc.includes("#93c5fd") && jc.includes("ellipse 90% 70%")) continue;
      const next = jc.replace(
        /const baseCss = `[\s\S]*?`;\n  const chExtra/,
        `const baseCss = \`${NEW}\`;\n  const chExtra`,
      );
      if (next === jc) throw new Error(`replace failed: ${label} ${node.name || node.id}`);
      node.parameters.jsCode = next;
      n++;
    }
  }
  return n;
}

let n = patchNodes(data.nodes, "nodes");
if (Array.isArray(data.activeVersion?.nodes)) {
  n += patchNodes(data.activeVersion.nodes, "activeVersion.nodes");
}
console.log("patched Build Image HTML nodes:", n);
fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
