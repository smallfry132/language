// Checks web/js/themes.js and themes-auto.js: every word of every course in exactly one topic group,
// no unknown ids, no picture used twice within a course.
//   node tools/check-themes.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const JS = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../web/js");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data.js", "data-hsk2.js", "data-hsk3.js", "data-vi.js", "data-vi-2.js", "data-ja.js", "themes.js", "themes-auto.js"]) vm.runInContext(fs.readFileSync(path.join(JS, f), "utf8"), ctx);
const W = ctx.window;
const COURSES = {
  zh: [].concat(W.HSK1_WORDS, W.HSK2_WORDS, W.HSK3_WORDS).map((w) => ({ id: w.id, hz: w.hz, en: w.en })),
  vi: W.VI_WORDS.map((w) => ({ id: w.id, hz: w.w, en: w.en })),
  ja: W.JA_WORDS_RAW.map((r, i) => ({ id: "j" + (i + 1), hz: r[1], en: r[3] }))
};
let failed = false;
for (const [course, words] of Object.entries(COURSES)) {
  const known = new Set(words.map((w) => w.id));
  const seen = new Map(), problems = [];
  for (const t of W.THEMES[course]) for (const g of t.groups) for (const id of g.ids) {
    if (!known.has(id)) problems.push(`unknown id ${id} in ${t.id} › ${g.name.en}`);
    if (seen.has(id)) problems.push(`id ${id} in both ${seen.get(id)} and ${t.id} › ${g.name.en}`);
    seen.set(id, `${t.id} › ${g.name.en}`);
  }
  words.filter((w) => !seen.has(w.id)).forEach((w) => problems.push(`not in any topic: ${w.id} ${w.hz} ${w.en}`));
  const byPic = new Map();
  for (const [id, p] of Object.entries(W.PICTURES[course] || {})) {
    if (!known.has(course === "zh" ? +id : id)) problems.push(`picture for unknown id ${id}`);
    if (byPic.has(p)) problems.push(`picture ${p} used for ${byPic.get(p)} and ${id}`);
    byPic.set(p, id);
  }
  console.log(`${course}: ${seen.size} of ${words.length} words in ${W.THEMES[course].length} topics, ${byPic.size} pictures`);
  if (problems.length) { failed = true; console.log(problems.slice(0, 20).join("\n")); }
}
if (failed) process.exit(1);
