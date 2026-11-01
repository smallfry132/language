// Checks web/js/themes.js: every Chinese word in exactly one topic group, no unknown ids, no picture used twice.
//   node tools/check-themes.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const JS = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../web/js");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data.js", "data-hsk2.js", "data-hsk3.js", "themes.js"]) vm.runInContext(fs.readFileSync(path.join(JS, f), "utf8"), ctx);
const W = ctx.window;
const words = [].concat(W.HSK1_WORDS, W.HSK2_WORDS, W.HSK3_WORDS);
const known = new Set(words.map((w) => w.id));
const seen = new Map(), problems = [];
for (const t of W.THEMES.zh) for (const g of t.groups) for (const id of g.ids) {
  if (!known.has(id)) problems.push(`unknown id ${id} in ${t.id} › ${g.name.en}`);
  if (seen.has(id)) problems.push(`id ${id} in both ${seen.get(id)} and ${t.id} › ${g.name.en}`);
  seen.set(id, `${t.id} › ${g.name.en}`);
}
const missing = words.filter((w) => !seen.has(w.id));
missing.forEach((w) => problems.push(`not in any topic: ${w.id} ${w.hz} ${w.en}`));
const pics = Object.entries(W.PICTURES.zh), byPic = new Map();
for (const [id, p] of pics) {
  if (!known.has(+id)) problems.push(`picture for unknown id ${id}`);
  if (byPic.has(p)) problems.push(`picture ${p} used for ${byPic.get(p)} and ${id}`);
  byPic.set(p, id);
}
console.log(`${seen.size} of ${words.length} words in ${W.THEMES.zh.length} topics, ${pics.length} pictures`);
if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
