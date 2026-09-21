import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "deck.html");
const outPath = path.join(__dirname, "Ekyama-Pitch-Deck.pdf");

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`file://${htmlPath}`);
await page.pdf({
  path: outPath,
  width: "1280px",
  height: "720px",
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});
await browser.close();
console.log("Wrote", outPath);
