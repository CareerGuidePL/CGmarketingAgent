const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;

let browser;

async function getBrowser() {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });
  }
  return browser;
}

// POST /render  { html, css?, width?, height?, format? }
// Returns: image binary (PNG or JPEG)
app.post("/render", async (req, res) => {
  const { html, css, width = 1200, height = 630, format = "png" } = req.body;

  if (!html) {
    return res.status(400).json({ error: "html field is required" });
  }

  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>${css || ""}</style>
</head><body>${html}</body></html>`;

  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setViewport({ width: Number(width), height: Number(height) });
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const imgFormat = format === "jpeg" || format === "jpg" ? "jpeg" : "png";
    const screenshot = await page.screenshot({
      type: imgFormat,
      fullPage: false,
    });

    const buf = Buffer.isBuffer(screenshot) ? screenshot : Buffer.from(screenshot);
    res.set("Content-Type", `image/${imgFormat}`);
    res.set("Content-Length", buf.length);
    res.end(buf);
  } catch (err) {
    console.error("Render error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close().catch(() => {});
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`hcti-render listening on :${PORT}`));
