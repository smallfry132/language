// Word pictures: turns the generated pictures in art/words (one per Chinese word id, listed in log.jsonl) into
// small WebP files for the web app and the iPhone app, and maps every course's words onto them. A word of another
// course gets the picture when its English meaning is the same ("Hund" → dog), so no picture is made twice.
//   node tools/build-art.mjs          (needs cwebp: brew install webp)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const src = root + "art/words/";
const data = root + "ios/LanguageCore/Sources/LanguageCore/Data/";
const outs = [root + "web/art/", data + "art/"];
const courses = ["zh", "vi", "ja", "ko", "de", "es"];
const SIZE = 320;

// "to eat (isst)", "water; country", "big, large" → "to eat", "water", "big"
const meaning = (en) => en.toLowerCase().split(/[(;,]/)[0].trim();

const log = readFileSync(src + "log.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((e) => (e.status === "ok" || e.status === "flag") && existsSync(src + e.id + ".jpg"));
const zh = JSON.parse(readFileSync(data + "words-zh.json", "utf8"));
const byMeaning = {};
for (const e of log) {
  const w = zh.find((x) => x.id === e.id);
  if (w && !byMeaning[meaning(w.en)]) byMeaning[meaning(w.en)] = "zh" + e.id;
}

outs.forEach((d) => mkdirSync(d, { recursive: true }));
for (const e of log) {
  const name = "zh" + e.id + ".webp";
  if (outs.every((d) => existsSync(d + name))) continue;
  execFileSync("cwebp", ["-quiet", "-q", "78", "-resize", String(SIZE), String(SIZE), src + e.id + ".jpg", "-o", outs[0] + name]);
  writeFileSync(outs[1] + name, readFileSync(outs[0] + name));
}

const art = {};
for (const c of courses) {
  const words = JSON.parse(readFileSync(data + `words-${c}.json`, "utf8"));
  art[c] = {};
  for (const w of words) {
    const key = c === "zh" ? (log.some((e) => e.id === w.id) ? "zh" + w.id : null) : byMeaning[meaning(w.en)];
    if (key) art[c][w.id] = key;
  }
}
writeFileSync(data + "art.json", JSON.stringify(art));
writeFileSync(root + "web/js/art.js", `/* Word pictures (tools/build-art.mjs): word id → picture in art/ */\nwindow.ART = ${JSON.stringify(art)};\n`);
console.log(log.length + " pictures;", courses.map((c) => `${c} ${Object.keys(art[c]).length}`).join(", "));
