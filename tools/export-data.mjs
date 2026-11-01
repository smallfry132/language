// Exports the word lists, dialogues, sound charts and interface texts of the web app as JSON for the native apps.
// The web app (web/js) stays the single source: run this after changing its data or texts.
//   node tools/export-data.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JS = path.join(ROOT, "web/js");
const OUT = path.join(ROOT, "ios/LanguageCore/Sources/LanguageCore/Data");
fs.mkdirSync(OUT, { recursive: true });

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data.js", "data-hsk2.js", "data-hsk3.js", "data-vi.js", "data-vi-2.js", "data-ja.js", "sounds-data.js", "dialogues.js", "themes.js"]) {
  vm.runInContext(fs.readFileSync(path.join(JS, f), "utf8"), ctx, { filename: f });
}
const W = ctx.window;
const app = fs.readFileSync(path.join(JS, "app.js"), "utf8");

// Pieces of app.js that run fine outside the browser: the Japanese helpers and the text tables
const slice = (from, to) => { const a = app.indexOf(from), b = app.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found: " + from); return app.slice(a, b); };
vm.runInContext(slice("const KANA = ", "  const JA_WORDS = ").replace(/^\s*const /gm, "var ").replace(/^\s*function /gm, "function "), ctx);
vm.runInContext(slice("const I18N = {", "  const t = (key").replace(/const (I18N|PF_I18N|COURSE_I18N) =/g, "var $1 ="), ctx);

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));
const words = {
  zh: [].concat(
    W.HSK1_WORDS.map((w) => ({ ...w, lvl: 1 })),
    W.HSK2_WORDS.map((w) => ({ ...w, lvl: 2 })),
    W.HSK3_WORDS.map((w) => ({ ...w, lvl: 3 }))
  ).map((w) => clean({ id: String(w.id), hz: w.hz, py: w.py, en: w.en, de: w.de, cat: w.cat, lvl: w.lvl, ex: w.ex, exPy: w.exPy, exEn: w.exEn, exDe: w.exDe })),
  vi: W.VI_WORDS.map((w) => clean({ id: w.id, hz: w.w, py: w.pr, en: w.en, cat: w.cat, lvl: w.lvl, ex: w.ex, exEn: w.exEn })),
  ja: W.JA_WORDS_RAW.map(([lvl, expr, reading, meaning], i) => {
    const romaji = ctx.toRomaji(reading);
    return { id: "j" + (i + 1), hz: expr, py: reading === expr ? romaji : `${reading} · ${romaji}`, kana: reading, romaji, en: meaning, cat: ctx.jaCategory(expr, meaning), lvl };
  })
};
for (const [c, list] of Object.entries(words)) fs.writeFileSync(path.join(OUT, `words-${c}.json`), JSON.stringify(list));

// Texts: functions become templates with {0}, {1} placeholders; a different singular form is kept as "key.one"
const MARK = ["{0}", "{1}", "{2}"];
function table(src) {
  const out = {};
  for (const [k, v] of Object.entries(src || {})) {
    if (typeof v !== "function") { out[k] = v; continue; }
    const other = v(...MARK);
    out[k] = other;
    if (v.length === 1) { const one = v(1); if (one !== other.replaceAll("{0}", "1")) out[k + ".one"] = one.replaceAll("1", "{0}"); }
  }
  return out;
}
const strings = {
  base: { en: table(ctx.I18N.en), de: table(ctx.I18N.de) },
  pinyinFirst: { en: table(ctx.PF_I18N.en), de: table(ctx.PF_I18N.de) },
  course: Object.fromEntries(Object.entries(ctx.COURSE_I18N).map(([c, o]) => [c, { en: table(o.en), de: table(o.de) }]))
};
fs.writeFileSync(path.join(OUT, "strings.json"), JSON.stringify(strings, null, 1));
fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify({ ...W.HSK1_CATEGORIES, custom: { en: "My words", de: "Eigene Wörter", icon: "✏️" } }));
fs.writeFileSync(path.join(OUT, "dialogues.json"), JSON.stringify(W.DIALOGUES));
fs.writeFileSync(path.join(OUT, "sounds.json"), JSON.stringify(W.SOUNDS));
// Topics with word ids as strings (the native apps use string ids), and pictures per word id
fs.writeFileSync(path.join(OUT, "themes.json"), JSON.stringify(Object.fromEntries(Object.entries(W.THEMES).map(([c, ts]) => [c, ts.map((t) => ({ ...t, groups: t.groups.map((g) => ({ name: g.name, ids: g.ids.map(String) })) }))]))));
fs.writeFileSync(path.join(OUT, "pictures.json"), JSON.stringify(W.PICTURES));
console.log(Object.entries(words).map(([c, l]) => `${c}: ${l.length}`).join(", "), "→", path.relative(ROOT, OUT));
