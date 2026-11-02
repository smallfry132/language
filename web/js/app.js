/* ============================================================
   Language Trainer (Chinese HSK 1–3, Vietnamese A1–A2) — application logic
   Vanilla JS, no build step. State lives in localStorage.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Courses ----------------
   * Every course normalizes its words to: id, hz (the word as displayed), py (pronunciation),
   * en, de?, cat, lvl, ex, exPy, exEn, exDe?. Word ids are unique across courses
   * (numbers for Chinese, "v…" strings for Vietnamese) so progress can share one store. */
  const ZH_WORDS = [].concat(
    window.HSK1_WORDS.map((w) => ({ ...w, lvl: 1, course: "zh" })),
    (window.HSK2_WORDS || []).map((w) => ({ ...w, lvl: 2, course: "zh" })),
    (window.HSK3_WORDS || []).map((w) => ({ ...w, lvl: 3, course: "zh" }))
  );
  const VI_WORDS = (window.VI_WORDS || []).map((w) => ({ id: w.id, hz: w.w, py: w.pr, en: w.en, cat: w.cat, lvl: w.lvl, ex: w.ex, exPy: "", exEn: w.exEn, course: "vi" }));
  /* Kana → wāpuro-style romaji (Hepburn, long vowels written out: おう → ou, ー repeats the vowel). */
  const KANA = { あ:"a",い:"i",う:"u",え:"e",お:"o",か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",を:"wo",ん:"n",が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",ぁ:"a",ぃ:"i",ぅ:"u",ぇ:"e",ぉ:"o",ゃ:"ya",ゅ:"yu",ょ:"yo",ゎ:"wa",ゐ:"i",ゑ:"e",ゔ:"vu" };
  const KANA_DIGRAPH = { きゃ:"kya",きゅ:"kyu",きょ:"kyo",しゃ:"sha",しゅ:"shu",しょ:"sho",ちゃ:"cha",ちゅ:"chu",ちょ:"cho",にゃ:"nya",にゅ:"nyu",にょ:"nyo",ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",みゃ:"mya",みゅ:"myu",みょ:"myo",りゃ:"rya",りゅ:"ryu",りょ:"ryo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",じゃ:"ja",じゅ:"ju",じょ:"jo",ぢゃ:"ja",ぢゅ:"ju",ぢょ:"jo",びゃ:"bya",びゅ:"byu",びょ:"byo",ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",しぇ:"she",じぇ:"je",ちぇ:"che",てぃ:"ti",でぃ:"di",とぅ:"tu",どぅ:"du",ふぁ:"fa",ふぃ:"fi",ふぇ:"fe",ふぉ:"fo",うぃ:"wi",うぇ:"we",うぉ:"wo",ゔぁ:"va",ゔぃ:"vi",ゔぇ:"ve",ゔぉ:"vo",つぁ:"tsa",つぇ:"tse",つぉ:"tso" };
  function toRomaji(kana) {
    // katakana → hiragana, keep ー
    const h = Array.from(kana).map((c) => { const code = c.charCodeAt(0); return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : c; }).join("");
    let out = "", i = 0, sokuon = false;
    while (i < h.length) {
      const two = h.slice(i, i + 2), one = h[i];
      let r = null, step = 1;
      if (KANA_DIGRAPH[two]) { r = KANA_DIGRAPH[two]; step = 2; }
      else if (one === "っ") { sokuon = true; i++; continue; }
      else if (one === "ー") { const m = out.match(/[aeiou]$/); r = m ? m[0] : ""; }
      else if (KANA[one] !== undefined) r = KANA[one];
      else r = one; // kanji, punctuation, latin
      if (r === "n" && one === "ん") { const next = h[i + 1]; if (next && /[あいうえおやゆよ]/.test(next)) r = "n'"; }
      if (sokuon) { r = (r[0] === "c" ? "t" : r[0]) + r; sokuon = false; }
      out += r; i += step;
    }
    return out;
  }
  const NUM_WORDS_EN = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|ten thousand|million|first|second|third)\b/i;
  function jaCategory(expr, meaning) {
    const m = meaning.toLowerCase();
    if (NUM_WORDS_EN.test(m) || /^\d/.test(m) || /counter for/.test(m)) return "numbers";
    if (/^to /.test(m)) return "verbs";
    if (/^(mr|mrs|ms|father|mother|brother|sister|son|daughter|grandfather|grandmother|husband|wife|uncle|aunt|parents|child|children|family|baby)\b/.test(m)) return "family";
    if (/^(teacher|student|doctor|friend|person|people|man|woman|boy|girl|adult|company employee|foreigner|police|clerk|customer)\b/.test(m)) return "people";
    if (/^(i|you|he|she|we|they|this|that|which|what|who|where|when|why|how|everyone|something|somebody|nothing|nobody|myself)\b/.test(m)) return /^(what|which|who|where|when|why|how)\b/.test(m) ? "question" : "pronouns";
    if (/^(morning|evening|night|noon|today|tomorrow|yesterday|now|week|month|year|hour|minute|o'clock|time|spring|summer|autumn|winter|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|birthday|holiday|next|last|every)\b/.test(m)) return "time";
    if (/\b(rice|bread|meat|fish|water|tea|coffee|milk|egg|vegetable|fruit|apple|sushi|noodle|soup|sugar|salt|beer|sake|alcohol|food|meal|breakfast|lunch|dinner|cake|sweets|restaurant|drink)\b/.test(m) && !/^to /.test(m)) return "food";
    if (/\b(station|school|hospital|bank|post office|shop|store|park|hotel|library|company|office|room|house|home|city|town|country|road|street|river|mountain|sea|building|kitchen|garden|airport|country|world|place)\b/.test(m)) return "places";
    if (/\b(car|train|bus|bicycle|taxi|airplane|subway|ship|boat|ticket|traffic)\b/.test(m)) return "transport";
    if (/\b(head|hand|foot|leg|eye|ear|mouth|nose|hair|body|stomach|tooth|teeth|illness|medicine|cold|fever|healthy|sick|injury|blood|heart)\b/.test(m)) return "body";
    if (/\b(dog|cat|bird|fish|horse|cow|pig|animal|insect|chicken)\b/.test(m) && !/\b(meat|to)\b/.test(m)) return "animals";
    if (/\b(rain|snow|wind|weather|sky|sun|moon|star|cloud|flower|tree|forest|nature|earth|hot|cold weather|typhoon|earthquake)\b/.test(m)) return "nature";
    if (/\b(sport|tennis|baseball|soccer|swimming|music|song|movie|film|game|hobby|travel|trip|piano|guitar|dance|photograph|picture|book|reading)\b/.test(m)) return "sports";
    if (/^(please|hello|good morning|good evening|good night|goodbye|thank you|excuse me|i'm sorry|welcome|congratulations|cheers|yes|no|ah!|oh!|well|um|really\?)/.test(m) || /[!？?]$/.test(expr)) return "phrases";
    if (/[いしきくらる]$/.test(expr) && /^(bright|dark|big|small|new|old|hot|cold|warm|cool|good|bad|expensive|cheap|long|short|tall|low|high|fast|slow|early|late|near|far|busy|free|fun|interesting|boring|delicious|difficult|easy|heavy|light|quiet|noisy|beautiful|pretty|cute|kind|strong|weak|young|dangerous|safe|sad|happy|lonely|sweet|spicy|salty|bitter|round|thick|thin|wide|narrow|deep|shallow|dirty|clean)\b/.test(m)) return "adjectives";
    if (/^(very|a little|often|always|sometimes|usually|already|still|not yet|again|soon|slowly|quickly|together|also|but|and|or|because|however|therefore|then|for example|perhaps|probably|surely|of course|about|approximately|just|only|more|most|first of all|at once|suddenly|gradually|especially|for the first time|at last)\b/.test(m)) return "adverbs";
    if (/^(desk|chair|table|door|window|bag|umbrella|key|pen|pencil|paper|notebook|dictionary|camera|watch|clock|telephone|television|radio|computer|shoes|clothes|shirt|hat|glasses|money|wallet|box|cup|glass|plate|knife|bottle|letter|stamp|newspaper|magazine|map|photo|bed|refrigerator|toy)\b/.test(m)) return "objects";
    if (/\b(particle|suffix|prefix|copula|honorific|auxiliary|indicates|conjunction|interjection)\b/.test(m)) return "particles";
    if (/\b(study|learn|homework|exam|test|class|lesson|university|kanji|hiragana|katakana|grammar|word|language|english|japanese|question|answer|meaning|work|job|meeting)\b/.test(m)) return "study";
    return "misc";
  }
  const JA_WORDS = (window.JA_WORDS_RAW || []).map((r, i) => {
    const [lvl, expr, reading, meaning] = r;
    const romaji = toRomaji(reading);
    return { id: "j" + (i + 1), hz: expr, py: reading === expr ? romaji : `${reading} · ${romaji}`, kana: reading, romaji, en: meaning, cat: jaCategory(expr, meaning), lvl, ex: "", exPy: "", exEn: "", course: "ja" };
  });
  // Korean: Hangul with generated romanization (korean.js); pron = how it is said when sound changes alter the spelling
  const KO_WORDS = (window.KO_WORDS || []).map((w) => {
    const pron = window.KO.pronounce(w.w);
    return { id: w.id, hz: w.w, py: window.KO.romanize(w.w), en: w.en, de: w.de, cat: "misc", lvl: w.lvl, ex: w.ex, exPy: window.KO.romanize(w.ex), exEn: w.exEn, pron: pron !== w.w ? pron : "", course: "ko" };
  });
  ((window.DIALOGUES && window.DIALOGUES.ko) || []).forEach((d) => d.lines.forEach((l) => { l.py = l.py || window.KO.romanize(l.hz); }));
  // A typed Korean answer: Hangul, or romanization as pronounced or letter by letter (spaces don't matter)
  const koTyped = (v, hz) => { const a = v.normalize("NFC").toLowerCase().replace(/[^\p{L}]/gu, ""), plain = (s) => s.toLowerCase().replace(/[^\p{L}]/gu, ""); return a === plain(hz) || a === plain(window.KO.romanize(hz)) || a === plain(window.KO.romanize(hz, { spelled: true })); };
  // Hangul syllable → its letters (initial, vowel, final) as Unicode compatibility jamo
  const KO_I = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ", KO_V = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ", KO_F = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const koJamo = (ch) => { const n = ch.codePointAt(0) - 0xac00; return n >= 0 && n < 11172 ? { i: KO_I[Math.floor(n / 588)], v: KO_V[Math.floor((n % 588) / 28)], f: KO_F[n % 28] } : null; };
  const COURSES = {
    zh: { id: "zh", glyph: "中", name: "中文 · Chinese", title: "HSK Trainer", tts: "zh-CN", script: "cjk", levels: [1, 2, 3], levelName: (l) => "HSK " + l, allLabel: "HSK 1–3", words: ZH_WORDS, toneOptions: [1, 2, 3, 4], testPhrase: "你好，我学习汉语。", source: { text: "glxxyz/hskhsk.com", url: "https://github.com/glxxyz/hskhsk.com" } },
    vi: { id: "vi", glyph: "Vi", name: "Tiếng Việt · Vietnamese", title: "Tiếng Việt Trainer", tts: "vi-VN", script: "latin", levels: [1, 2, 3, 4, 5, 6], levelName: (l) => ["A1", "A2", "B1", "B2", "C1", "C2"][l - 1], allLabel: "A1–C2", words: VI_WORDS, toneOptions: [1, 2, 3, 4, 5, 6], testPhrase: "Xin chào, tôi học tiếng Việt.", source: null },
    ja: { id: "ja", glyph: "あ", name: "日本語 · Japanese", title: "JLPT Trainer", tts: "ja-JP", script: "cjk", levels: [1, 2, 3, 4, 5], levelName: (l) => "N" + (6 - l), allLabel: "N5–N1", words: JA_WORDS, toneOptions: null, testPhrase: "こんにちは。日本語を勉強しています。", source: { text: "jamsinclair/open-anki-jlpt-decks", url: "https://github.com/jamsinclair/open-anki-jlpt-decks" } },
    ko: { id: "ko", glyph: "한", name: "한국어 · Korean", title: "Korean Trainer", tts: "ko-KR", script: "cjk", levels: [1, 2], levelName: (l) => ["A1", "A2"][l - 1], allLabel: "A1–A2", words: KO_WORDS, toneOptions: null, testPhrase: "안녕하세요. 저는 한국어를 공부해요.", source: null }
  };
  const CATS = window.HSK1_CATEGORIES;
  CATS.custom = { en: "My words", de: "Eigene Wörter", icon: "✏️" };
  const BY_ID = Object.fromEntries(Object.values(COURSES).flatMap((c) => c.words).map((w) => [w.id, w]));
  const wid = (v) => (/^\d+$/.test(String(v)) ? +v : String(v)); // dataset ids back to their stored type
  let C = COURSES.zh;          // current course
  let ALL_WORDS = C.words;     // all words of the current course (built-in + own words)
  let WORDS = ALL_WORDS;       // words in the selected levels of the current course
  const curLevels = () => S.courses[C.id].levels;
  // Own words (added in a lesson) live in S.custom as { course, hz, py, en, t }; they join level 1 of their course
  const customWords = (course) => Object.entries(S.custom || {}).filter(([, x]) => !x.gone && x.course === course)
    .map(([id, x]) => ({ id, hz: x.hz || x.py, py: x.py, en: x.en, cat: "custom", lvl: 1, ex: "", exPy: "", exEn: "", course }));
  // One look per language (Ink Grid, Quiet Ruby, Block Builder, Tone Color): colours and fonts in style.css
  // under html[data-course]; here the tab labels written in the language itself
  const LOOK_EXTRA = { zh: ["课", "话"], ja: ["課", "話"], ko: ["과", "화"], vi: ["Bài", "Thoại"] };
  const LOOK_TABS = { zh: ["学", "练", "词", "我"], ja: ["学", "練", "語", "私"], ko: ["학", "연", "단", "나"], vi: ["Học", "Tập", "Từ", "Tôi"] };
  function applyCourse() {
    C = COURSES[S.course] || COURSES.zh;
    document.documentElement.dataset.course = C.id;
    const own = customWords(C.id);
    own.forEach((w) => (BY_ID[w.id] = w));
    ALL_WORDS = C.words.concat(own);
    document.documentElement.classList.toggle("latin", C.script === "latin");
    applyLevels();
  }
  function applyLevels() {
    const lv = curLevels();
    WORDS = ALL_WORDS.filter((w) => lv.includes(w.lvl));
    // Courses with topics: words in learning order (topic by topic), own words after
    if (themes().length) { const o = themeOrder(); WORDS = WORDS.map((w, k) => [w, o[w.id] ?? 1e6 + k]).sort((a, b) => a[1] - b[1]).map((x) => x[0]); }
  }
  // Topics (themes.js): every word of the course in one ordered group; pictures for words that can be shown
  const themes = () => (window.THEMES && window.THEMES[C.id]) || [];
  let themeOrderCache = null;
  function themeOrder() {
    if (themeOrderCache && themeOrderCache.course === C.id) return themeOrderCache.order;
    const order = {}, topic = {}; let n = 0;
    themes().forEach((t) => t.groups.forEach((g) => g.ids.forEach((id) => { if (order[id] === undefined) { order[id] = n++; topic[id] = t.id; } })));
    themeOrderCache = { course: C.id, order, topic };
    return order;
  }
  const pic = (w) => (window.PICTURES && window.PICTURES[C.id] && window.PICTURES[C.id][w.id]) || "";
  const picHtml = (w, cls) => (pic(w) ? `<div class="pic ${cls || ""}" aria-hidden="true">${pic(w)}</div>` : "");
  const topicOf = (id) => { themeOrder(); return themeOrderCache.topic[id]; }; // a lookup table: Japanese has 8,000 words
  const hasPics = () => WORDS.some((w) => pic(w));
  // A word passes the topic (or, without topics, category) filter
  const inCat = (w, cat) => cat === "all" || (themes().length ? topicOf(w.id) === cat : w.cat === cat);
  function topicChips(id, active) {
    const opts = themes().length ? themes().map((t) => [t.id, `${t.icon} ${esc(L(t.name))}`])
      : Object.keys(CATS).filter((c) => WORDS.some((w) => w.cat === c)).map((c) => [c, `${CATS[c].icon} ${catName(c)}`]);
    return `<div class="chips" id="${id}"><button class="chip ${active === "all" ? "active" : ""}" data-cat="all" type="button">${t("all")}</button>${opts.map(([k, l]) => `<button class="chip ${active === k ? "active" : ""}" data-cat="${k}" type="button">${l}</button>`).join("")}</div>`;
  }
  const levelLabel = () => (curLevels().length === C.levels.length ? C.allLabel : curLevels().map((l) => C.levelName(l)).join(" · "));
  const STORAGE_KEY = "hsk1trainer.v1";
  const DAY = 86400000;

  /* ---------------- Utilities ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const todayKey = (d) => { const x = d ? new Date(d) : new Date(); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const isLong = (hz) => (C.script === "cjk" ? hz.length >= 3 : hz.length >= 9);
  // Pinyin: drop tone marks, treat v as ü, drop spaces/punctuation/tone numbers
  const stripTones = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/v/g, "u").replace(/[\s'’\-.,!?0-9]/g, "");
  // Vietnamese: drop diacritics (đ → d), collapse spaces
  const stripVi = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[.,!?'’]/g, "").replace(/\s+/g, " ").trim();
  const stripJa = (s) => s.normalize("NFC").toLowerCase().replace(/[\s'’\-.,!?・]/g, "");
  // Korean: Hangul or romanization, without spaces, hyphens and punctuation
  const stripKo = (s) => s.normalize("NFC").toLowerCase().replace(/[\s'’\-.,!?]/g, "");
  const norm = (s) => (C.id === "zh" ? stripTones(s) : C.id === "ja" ? stripJa(s) : C.id === "ko" ? stripKo(s) : stripVi(s));
  const hasDiacritics = (s) => /[̀-ͯ]/.test(s.normalize("NFD")) || /đ/i.test(s);
  const TONE_MARKS = { "̄": 1, "́": 2, "̌": 3, "̀": 4 };           // Mandarin: 1–4, none = neutral (5)
  const VI_TONE_MARKS = { "̀": 2, "́": 3, "̉": 4, "̃": 5, "̣": 6 }; // Vietnamese: ngang(1) huyền sắc hỏi ngã nặng
  const toneSeq = (py) => Array.from(py.normalize("NFD")).map((c) => TONE_MARKS[c]).filter(Boolean);
  const firstTone = (w) => {
    if (C.id === "zh") return toneSeq(w).length ? toneSeq(w)[0] : 5;
    const marks = Array.from(w.normalize("NFD")).map((c) => VI_TONE_MARKS[c]).filter(Boolean);
    return marks[0] || 1;
  };
  const VI_TONE_NAMES = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"];
  const toneName = (n) => (C.id === "zh" ? t("toneN", n) : `${VI_TONE_NAMES[n - 1]} (${["a", "à", "á", "ả", "ã", "ạ"][n - 1]})`);

  /* ---------------- State ---------------- */
  const DEFAULT_STATE = {
    lang: (navigator.language || "en").toLowerCase().startsWith("de") ? "de" : "en",
    srs: {},
    favs: [],
    stats: { answered: 0, correct: 0, days: {}, sessions: 0, since: 0 },
    settings: { rate: 0.85, autoSpeak: true, tilePinyin: true, quizSize: 10, dailyGoal: 20, theme: "auto", newPerDay: 5 }, // readingLayer: always | new | off
    course: "zh",
    courses: { zh: { levels: [1] }, vi: { levels: [1] }, ja: { levels: [1] }, ko: { levels: [1] } },
    lessons: {},  // id → { course, name, words: [ids], created, t }
    custom: {},   // id → own word { course, hz, py, en, t }
    dlg: {},      // dialogue id → { listen: day, read: { best, last, acc }, turn: { best, last } }
    peers: {},    // device id → stats of the other synced devices
    mt: {}        // last-change times of the whole-value fields, for sync
  };
  let S = load();
  // Migration: level selection used to live in settings.levels (Chinese only)
  if (!S.courses) S.courses = structuredClone(DEFAULT_STATE.courses);
  if (Array.isArray(S.settings.levels) && S.settings.levels.length) { S.courses.zh.levels = S.settings.levels; delete S.settings.levels; }
  Object.keys(COURSES).forEach((k) => { if (!S.courses[k] || !Array.isArray(S.courses[k].levels) || !S.courses[k].levels.length) S.courses[k] = { levels: [1] }; });
  if (!COURSES[S.course]) S.course = "zh";
  // Migration: id 44 used to be 火车站 (now HSK 2, id 191); it is 一点儿 in the official HSK 1 list
  if (!S.migrated44) { if (S.srs[44]) { S.srs[191] = S.srs[44]; delete S.srs[44]; } S.favs = S.favs.map((x) => (x === 44 ? 191 : x)); S.migrated44 = true; }
  applyCourse();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_STATE), ...parsed, settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }, stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) } };
    } catch (e) { return structuredClone(DEFAULT_STATE); }
  }
  function save() {
    if (stamp()) { DEV.dirty = true; saveDev(); scheduleSync(); }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ }
  }

  /* ---------------- Change stamps (for sync) ----------------
   * save() compares the state with a snapshot of the last save and stamps what changed:
   * entries of the keyed maps get their own time `t` (a removed entry becomes { gone: 1, t }),
   * whole-value fields get a time in S.mt. Sync merges by these times, newest wins. */
  const LWW_FIELDS = ["favs", "settings", "courses", "typer", "lang"]; // the current course stays per device
  const MAP_FIELDS = ["srs", "lessons", "custom", "dlg"];
  const syncSettings = (s) => { const { voices, ...rest } = s; return rest; }; // voices differ per device
  const lwwJson = (f) => JSON.stringify(f === "settings" ? syncSettings(S.settings) : S[f] ?? null);
  const entryJson = (e) => { const { t, ...rest } = e || {}; return JSON.stringify(rest); };
  let snap = null;
  function takeSnap() {
    snap = { lww: {}, maps: {}, stats: JSON.stringify(S.stats) };
    LWW_FIELDS.forEach((f) => (snap.lww[f] = lwwJson(f)));
    MAP_FIELDS.forEach((m) => { S[m] = S[m] || {}; snap.maps[m] = Object.fromEntries(Object.entries(S[m]).map(([id, e]) => [id, entryJson(e)])); });
  }
  function stamp() {
    const now = Date.now(); let changed = false;
    S.mt = S.mt || {};
    const sj = JSON.stringify(S.stats); if (sj !== snap.stats) { snap.stats = sj; changed = true; } // device-own counts, merged per device
    LWW_FIELDS.forEach((f) => { const j = lwwJson(f); if (j !== snap.lww[f]) { S.mt[f] = now; snap.lww[f] = j; changed = true; } });
    MAP_FIELDS.forEach((m) => {
      const cur = S[m], old = snap.maps[m];
      Object.keys(cur).forEach((id) => { const j = entryJson(cur[id]); if (j !== old[id]) { cur[id].t = now; old[id] = j; changed = true; } });
      Object.keys(old).forEach((id) => { if (!cur[id]) { cur[id] = { gone: 1, t: now }; old[id] = entryJson(cur[id]); changed = true; } });
    });
    return changed;
  }

  /* ---------------- i18n ---------------- */
  const I18N = {
    en: {
      brandSub: "Trainer", words: "Words", train: "Practice", progress: "Progress", more: "More",
      search: "Search hanzi, pinyin or meaning…", all: "All", favorites: "Favorites", new: "New", learning: "Learning", known: "Known", due: "Due",
      wordsCount: (n, t) => `${n} of ${t} words`, noResults: "No words match your filters.",
      category: "Category", example: "Example", markKnown: "Mark as known", markLearning: "Mark as learning", resetWord: "Reset progress",
      fav: "Favorite", unfav: "Unfavorite", practice: "Practice", close: "Close", next: "Next", back: "Back", start: "Start", done: "Done", again: "Again", finish: "Finish",
      dueToday: "due for review", reviewNow: "Review now", nothingDue: "Nothing due — great job!",
      modeFlash: "Flashcards", modeFlashDesc: "Spaced repetition. Flip the card and rate yourself.",
      modeQuiz: "Multiple choice", modeQuizDesc: "Pick the right translation, character or pinyin.",
      modeType: "Type pinyin", modeTypeDesc: "See the character, type its pinyin.",
      modeListen: "Listening", modeListenDesc: "Hear the word, choose the character.",
      modeMatch: "Matching", modeMatchDesc: "Match characters with their meanings against the clock.",
      modeTones: "Tone drill", modeTonesDesc: "Hear a syllable and identify its tone.",
      modeTyper: "Typewriter", modeTyperDesc: "Copy-type pinyin as fast as you can. Enter reads it aloud.",
      typerIntro: "Type the line exactly as shown, tone marks included. Press Enter when you are done: the app reads it aloud and moves on.",
      typerHint: "Tone numbers turn into marks: ni3 → nǐ, lv4 → lǜ, ma5 → ma. Enter = done + speak.",
      typerContent: "Content", typerWords: "Words", typerSentences: "Sentences", typerMixed: "Mixed",
      typerBest: "Personal best", typerRecord: "New record", wpm: "WPM", accuracy: "accuracy",
      modeNumbers: "Numbers", modeNumbersDesc: "Read and write Chinese numbers 1–99.",
      setupTitle: "Session setup", whichWords: "Which words?", allWords: "All words", dueWords: "Due & new", favsOnly: "Favorites", learningOnly: "Learning", howMany: "How many?",
      direction: "Direction", dirHzTr: "Character → Meaning", dirTrHz: "Meaning → Character", dirHzPy: "Character → Pinyin", dirPyHz: "Pinyin → Character",
      tapToFlip: "Tap to reveal", rateAgain: "Again", rateHard: "Hard", rateGood: "Good", rateEasy: "Easy",
      correct: "Correct!", wrong: "Not quite.", answerWas: "Answer:", check: "Check", skip: "Skip", showAnswer: "Show answer",
      typeHint: "Tones are optional, but typed tones must be right. Numbers become marks: ni3hao3 → nǐhǎo.", typePlaceholder: "pinyin…",
      resultTitle: "Session complete", resultScore: (c, t) => `${c} of ${t} correct`, reviewMistakes: "Words to review", perfect: "Perfect round!", timeTaken: "Time",
      playAgain: "Play again", backToTrain: "Back to training", listenPrompt: "Which word did you hear?", play: "Play", listenHint: "Tap ▶︎ to hear it again.",
      matchTitle: "Match the pairs", pairsLeft: (n) => `${n} pairs left`, mistakes: "mistakes",
      statsWords: "Words known", statsLearning: "Learning", statsDue: "Due today", statsStreak: "Day streak", statsAccuracy: "Accuracy", statsAnswered: "Answers total", statsToday: "Today",
      overview: "Overview", byCategory: "By category", activity: "Last 8 weeks", dailyGoal: "Daily goal", goalReached: "Goal reached today 🎉",
      resetAll: "Reset all progress", resetConfirm: "Delete all learning progress? This cannot be undone.", resetDone: "Progress reset.",
      settings: "Settings", language: "Language", ttsRate: "Speech speed", autoSpeak: "Speak on reveal", tilePinyin: "Pinyin on tiles", ttsTest: "Test voice", theme: "Appearance", themeAuto: "Auto", themeLight: "Light", themeDark: "Dark",
      toneGuide: "Tone guide", toneGuideDesc: "The four tones plus neutral, with audio", numbers: "Number trainer", numbersDesc: "Practice 1–99", pinyinTips: "Pinyin tips", about: "About & install",
      tone1: "1st tone – high, flat", tone2: "2nd tone – rising", tone3: "3rd tone – falling-rising", tone4: "4th tone – falling", tone5: "Neutral – light, short",
      tone1d: "Like holding a note when singing: mā.", tone2d: "Like asking “what?”: má.", tone3d: "Dip down, then up: mǎ.", tone4d: "Sharp, like a command: mà.", tone5d: "Quick and unstressed: ma.",
      toneDrill: "Tone drill", toneQ: "Which tone is it?", toneN: (n) => `Tone ${n}`, toneNeutral: "Neutral",
      numPrompt: "Which number is this?", numPrompt2: "Which is", numHint: "Type the number and press Enter.", numMode1: "Read", numMode2: "Write",
      installTitle: "Install on iPhone", installSteps: ["Open this page in Safari.", "Tap the Share button.", "Choose “Add to Home Screen”.", "Launch it from the Home Screen — it runs full screen and works offline."],
      installMac: "On a Mac: in Safari choose File → Add to Dock, or simply bookmark the page.",
      aboutText: "All 600 words of HSK levels 1–3 with pinyin, English translations (German for HSK 1), example sentences and pronunciation via your device's speech synthesis. Your progress is stored locally on this device.",
      noTts: "Speech synthesis is not available in this browser.", speak: "Pronounce",
      noZhVoice: "No Chinese voice found yet", ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. For a natural sound, download a Premium or Enhanced Chinese voice under Settings → Accessibility → Spoken Content → Voices → Chinese (or search Settings for “Voices”): the app picks it by itself.",
      pinyinTipsText: [
        "Pinyin is the Latin transcription of Mandarin. It is not English: “q” sounds like “ch” in “cheese”, “x” like a soft “sh”, “zh” like “j” in “judge”, “c” like “ts” in “cats”.",
        "“ü” (written “u” after j, q, x, y) is pronounced like the German “ü”.",
        "Tones change meaning: mā (mother), má (hemp), mǎ (horse), mà (scold).",
        "Two 3rd tones in a row: the first becomes a 2nd tone (nǐ hǎo → ní hǎo).",
        "“bù” becomes “bú” before a 4th tone (bú kèqi), and “yī” changes to “yí” before a 4th tone and “yì” before other tones."
      ],
      keys: "Keys: 1–4 select · Space / Enter continue", installed: "Ready for offline use.",
      today: "today", streakMsg: (n) => n === 1 ? "1 day" : `${n} days`,
      levels: "Levels", levelHint: "Choose which HSK levels to study. The selection applies to tiles, training and progress.", perLevel: "By level", lvlBadge: (n) => `HSK ${n}`,
      dataSource: "Word lists follow the official HSK 2.0 lists (2012).",
      showMore: (n, rest) => `Show ${n} more (${rest} remaining)`,
      sounds: "Sounds", playRow: "Play row", slow: "Slow playback", twice: "Play twice", viewList: "Show whole table", viewFocus: "One sound at a time", soundKeys: "Keys: ← → sound · 1–6 play cell · Space play row", examplesFor: (x) => `Words with “${x}”`, noExamples: "No example words in the current lists.", listenPick: "Listen & pick", drillPrompt: "Which one did you hear?", drillOf: "Drill", allDrills: "Mixed", soundsIntroMore: "Tap the row label to hear the whole row.",
      voice: "Voice", voiceAuto: "Automatic", refreshVoices: "Look for voices", langName: "Chinese",
      ttsHintAndroid: (lang) => `On Android the app uses the phone's text-to-speech engine. Install “Speech Services by Google” from the Play Store, then open Settings → General management (or System) → Language & input → Text-to-speech output, choose Google as the preferred engine, tap its settings → Install voice data → ${lang}. Reload this page afterwards. Chrome and Samsung Internet both work.`,
      ttsNoVoiceAndroid: (lang) => `No ${lang} voice was found on this device yet. After installing the voice data, tap “Look for voices” or reload the page.`,
      course: "Course", switchCourse: "Switch language", courseHint: "Each language keeps its own words, levels and progress.", knownOf: (k, n) => `${k} of ${n} known`,
      tabToday: "Today", sessionTitle: "Today's session", sessionDesc: (r, n) => `${r} to review · ${n} new`, sessionDone: "Done for today 🎉", sessionDoneSub: "Come back tomorrow for your reviews, or practise freely in Train.",
      sessionEmpty: "Nothing due and no new words left. Add a lesson below, or learn more words.", moreNew: (n) => (n === 1 ? "Learn 1 more new word" : `Learn ${n} more new words`), fullStats: "All statistics", backToday: "Back to Learn",
      modeChoose: "Choose the word", modeChooseDesc: "Fill the gap in a sentence. The options sound alike, so pick by meaning.", chooseTitle: "Choose the right word",
      chooseSub: "They sound alike — pick by meaning.", chooseSubTone: "Same letters, different tone — different word.", chooseNoEx: "Which word means this?",
      soundsLike: (a, b) => `${a} sounds like it but means “${b}”.`, rolePlay: "Role play", youAre: (r) => `you’re ${r}`, pickReply: "Your turn — pick a reply, then say it",
      typeIt: "Type", retry: "Retry", cardFront: "Word → sound & meaning", cardListen: "Listen → word & tone", toneFamily: "Tone family — tap to compare",
      dueNow: "Due today", reviewCards: (n) => (n === 1 ? "Review 1 card" : `Review ${n} cards`), sampleLine: "sample line",
      stepOf: (i, n) => `Step ${i} of ${n}`, stepCount: (n) => (n === 1 ? "1 word" : `${n} words`),
      stepReview: "Review", stepReviewDesc: "Words due today. Say each one out loud before you flip the card.",
      stepMeet: "New words", stepMeetDesc: "Listen, then say each word out loud three times. Copy the melody of the tones.",
      stepListen: "Listen", stepListenDesc: "Hear a word and pick what you heard. Listen to the tones.",
      stepWrite: "Write", stepWriteDesc: "Hear a word and type its pinyin with tones (ni3hao3 → nǐhǎo).",
      sayAloud: "Say it out loud 3×, then go on.", slowly: "Slowly", sessionSummary: "Session complete", newLearned: (n) => (n === 1 ? "1 new word" : `${n} new words`),
      lessons: "Lessons", lessonNew: "New lesson", lessonName: "Lesson name", lessonDefault: (n) => `Lesson ${n}`, lessonWords: (n) => (n === 1 ? "1 word" : `${n} words`),
      lessonEmpty: "No lessons yet. Add the words from each class with your tutor, and Learn will train exactly those.",
      lessonNoWords: "No words in this lesson yet. Search the list below or add your own.",
      lessonAddSearch: "Add words from the list", lessonSearch: "Search pinyin, meaning or characters…", lessonOwn: "Add your own word",
      ownPy: "Pinyin (ni3hao3 → nǐhǎo)", ownHz: "Characters (needed for audio)", ownEn: "Meaning", ownWord: "Word", ownReading: "Reading (kana)", ownHint: "Not in the list? Ask your tutor for the characters: without them the voice can't read the word.",
      add: "Add", remove: "Remove", added: "Added", deleteLesson: "Delete lesson", deleteLessonConfirm: "Delete this lesson? The words and your progress stay.",
      practiceLesson: "Practise this lesson", lessonsPool: "My lessons", addToLesson: "Add to lesson",
      pinyinFirst: "Pinyin first", pinyinFirstDesc: "Show pinyin big and practise pinyin and meaning instead of characters. Turn off when you start learning characters.",
      sync: "Sync", syncDesc: "Keep Mac and iPhone in step", syncIntro: "Sync keeps your progress, lessons and settings the same on all your devices.",
      syncOn: "Turn on sync", syncHave: "Already on another device? Enter its code:", syncConnect: "Connect",
      syncCodeLbl: "Sync code", syncCodeHint: "Enter this code on your other device under More → Sync. On iPhone, enter it in the Home Screen app: it keeps its own storage, separate from Safari. Anyone with the code can see and change your progress, so keep it private.",
      syncCopy: "Copy code", copied: "Copied", syncNow: "Sync now", syncLast: (s) => `Last synced ${s}`, syncNever: "Not synced yet", syncPending: "Changes waiting to sync",
      syncDisconnect: "Turn off on this device", syncDisconnectConfirm: "Stop syncing this device? Its progress stays here, and the other devices keep theirs.",
      syncNotSetup: "Sync isn't set up on the server yet.", syncFailed: "Sync failed. It will try again.", syncOffline: "Offline. Changes sync when you're back online.", syncBadCode: "That code doesn't look right.", syncDone: "Synced",
      justNow: "just now", minAgo: (n) => `${n} min ago`, hAgo: (n) => `${n} h ago`,
      wordsMet: "Words met", dialogues: "Dialogues", myLessons: "My lessons", adjust: "Adjust",
      dueInToday: (n) => (n === 1 ? "1 word is due. Review it in Today" : `${n} words are due. Review them in Today`),
      skill_listen: "Listen", skill_listenDesc: "Train your ear for words, tones and similar sounds.",
      skill_speak: "Speak", skill_speakDesc: "Say words and sentences out loud and get feedback.",
      skill_read: "Read", skill_readDesc: "Recognise words and what they mean.",
      skill_write: "Write", skill_writeDesc: "Type pinyin from memory and from hearing.",
      modeSay: "Say the word", modeSayDesc: "Say a word and see your pitch curve against the tone shape.",
      soundDrill: "Similar sounds", soundDrillDesc: "Hear two sounds that are easy to mix up and pick the right one.",
      soundChart: "Sound chart", soundChartDesc: "Every sound with its tones, to listen and repeat.",
      dialoguesRead: "Read dialogues aloud", dialoguesReadDesc: "Short conversations: listen, read aloud, answer.",
      stepSpeak: "Speak", stepSpeakDesc: "Say each word out loud and compare your pitch curve with the tone shape.",
      noVoice: "No voice detected. Speak a little louder or closer to the microphone.", toneAllGood: "✓ The tones sound right.",
      toneLike: (n) => `sounded like a ${["", "1st", "2nd", "3rd", "4th"][n]} tone`,
      tipFlat: "Keep it high and level", tipHigher: "Start higher and hold it", tipRise: "Let it rise more toward the end", tipLower: "Go lower and let it dip", tipFall: "Start high and fall all the way down",
      sandhiNote: "Two 3rd tones in a row: the first one is said as a 2nd tone.", pitchHint: "A rough guide: your voice (solid line) against the tone shape (dashed).",
      dlg_listen: "Listen", dlg_read: "Read aloud", dlg_turn: "Role play",
      dlg_listenHint: "Play the whole dialogue, then tap a line to hear it again. Tap a word to see what it means.",
      dlg_readHint: "Read each line aloud: tap the microphone, speak, and see which words came through. Your reading time is kept, so you can see yourself get faster.",
      dlg_turnHint: "Choose a role. The app speaks the other person; you answer by speaking or typing.",
      showHz: "Characters", showTr: "Translation", playAll: "Play all", stop: "Stop",
      readTime: (s) => `Reading time ${s}`, bestTime: (s) => `best ${s}`,
      chooseRole: "Who do you want to be?", iAm: (n) => `I'm ${n}`, switchRole: "Swap roles",
      dlgTurnDone: (c, n) => `${c} of ${n} answers right`, sayIn: (l) => `Say it in ${l}:`, typeOr: "…or type the pinyin", hint: "Hint",
      tonesMissing: "✓ Right. Next time add the tones too.", tonesWrong: "Right words, but check the tones.",
      speakBtn: "Speak", listening: "Listening… tap to stop", record: "Record", stopRec: "Stop", playMine: "You", playModel: "Model",
      rateSelf: "Did it sound like the model?",
      heardGreat: "Clear, well done.", heardAlmost: "Almost. Listen to the model and try again.", heardNo: "That didn't come through. Try again, a little slower.", heardAs: (x) => `Heard: ${x}`,
      micBlocked: "Speech recognition isn't available here, so you'll record yourself instead. On iPhone it needs Dictation (Settings → General → Keyboard) and microphone access.",
      noMic: "No access to the microphone.",
      topics: "Topics", allTopics: "All topics", byTopic: "By topic",
      modePicture: "Picture to word", modePictureDesc: "See a picture and pick the word, without a translation in between.",
      modeListenPic: "Hear and pick the picture", modeListenPicDesc: "Hear a word and pick its picture.",
      pictureQ: "What is this?", hearPicQ: "Which picture did you hear?", pronHint: "How it is said",
      learn: "Learn", me: "Me", continue: "Continue", wordOfDay: "Word of the day", goalToday: "Today’s goal", minutes: (n) => `${n} min`, words3: (n) => `${n} words`,
      dailyPlan: "Daily plan", maxReviews: "Max reviews per day", newPerDay: "New words per day", whileStudying: "While studying", colorTones: "Colour by tone", allDialogues: "All dialogues",
      learningCourse: (l, v) => `Learning ${l} · ${v}`, tipTitle: "Tip",
      readingLayer: "Reading help", readingLayerDesc: "Pinyin, romanization or kana with each word.", readingAlways: "Always", readingNew: "New words", readingOff: "Off",
      closeSession: "Close session", flow_meet: "Meet new words", flow_review: "Review cards", flow_listen: "Listen", flow_speak: "Say the word", flow_write: "Type the reading",
      seg_meet: "Meet", seg_review: "Cards", seg_listen: "Listen", seg_speak: "Say", seg_write: "Type",
      flowSub: (s, n, i, m) => `Step ${s} of ${n} · ${i} of ${m}`, flowSubWord: (s, n, i, m) => `Step ${s} of ${n} · word ${i} of ${m}`, minLeft: (n) => `≈ ${n} min left`, minAbout: (n) => `≈ ${n} min`,
      sessionIsDone: "Today’s session is done", cardsReviewed: "cards reviewed", newWordsLower: "new words", tonesRight: "tones right when speaking", rightAnswers: "right answers", dayStreak: "day streak",
      watchThese: (n) => `Watch these · ${n}`, savedSynced: "Progress saved · synced", savedHere: "Progress saved on this device", practiseThese: (n) => (n === 1 ? "Practise this one again" : `Practise these ${n} again`),
      toneShort1: "1st · level", toneShort2: "2nd · rising", toneShort3: "3rd · dipping", toneShort4: "4th · falling", charSmall: "Character, small for now", newWord: "New word", sayIt: "Say it", playExample: "Play example", iKnowIt: "I know it", nextWord: "Next word",
      whyAgain: "card · Again", whyTyped: (s) => `typed ${s}`, whyPicked: (s) => `picked ${s}`, whyTones: "tones need work", whyNotHeard: "not heard yet",
      sessionPlan: (r, n) => `${r} reviews + ${n} new words`, sessionPlanReviews: (r) => `${r} reviews`, sessionPlanNew: (n) => `${n} new words`, topicLine: (x) => `Topic · ${x}`, todaysSession: "Today’s session",
      hearIt: "Hear it", typeThePinyin: "Type the pinyin", typeTheWord: "Type the word", typePickHint: "Letters only — then tap each tone below. Tone numbers (de2guo2) and tone marks work too.", eachSyllable: "Each syllable needs a tone · neutral tone: leave it unselected", dontKnow: "I don’t know — show me", flow_write_word: "Type the word", typePickHintVi: "Letters only — then tap each tone below. Telex (traf → trà) works too.", eachSyllableVi: "Each syllable needs a tone · no mark = ngang",
      practiceEyebrow: "Practice", pasteList: "Paste a list", pasteShort: "Paste list", pasteNewLesson: "Goes into a new lesson", pasteLabel: "Words from your tutor", pastePhZh: "nǐ hǎo, xièxie, 老师 teacher …", pastePh: "One word per line, or with commas", pasteHint: "Pinyin, characters or meanings — one per line or separated by commas. Each word is looked up for you.", skipped: "skipped", undo: "Undo", pasteWhich: "Which one?", pasteParts: "Not one word in the list — add its parts?", noneOwn: "None — my own word", notInListShort: "Not in the word list — add it as your own:", pasteCount: (n) => (n === 1 ? "1 word to add" : `${n} words to add`), pasteOpen: (n) => `${n} still open`, lessonDated: (n, d) => `Lesson ${n} · ${d}`, modeFamilies: "Word families", sub_families: "Similar words side by side", famSub: (n) => `${n} families · see the difference`, fam_pair: "Opposites", fam_tone: "Same sound, other tone", fam_build: "One part, many words", fam_final: "One final consonant", together: "Together:", compare: "Compare", whichOne: "Which one?", nextFamily: "Next family", famQListen: "Which one did you hear?", famQMeaning: "Which one means this?", wordFamily: "Word family", bestOnMac: "Best on the Mac · Typer", typerRaceZh: "Typing race · pinyin + tones", typerRace: "Typing race", typerHintZh: "type de2guo2 or the marks.", typerHintVi: "Telex or VNI keyboard.", typerHintKo: "Korean keyboard.", loading: "Loading…", traceOffline: "The stroke data could not be loaded. Connect once to download it.", trace_trace: "Trace", trace_copy: "Copy", trace_memory: "From memory", strokeOf: (i, n) => `Stroke ${i} of ${n}`, traceAria: (c) => `Writing grid for ${c}`, traceStart: (d) => `Start at the red dot and ${d}.`, strokeGood: (n) => `Stroke ${n} looks good.`, dirDot: "make a short dot", dirRight: "go across to the right", dirDownRight: "sweep down to the right", dirDown: "go straight down", dirDownLeft: "sweep down to the left", dirUpRight: "flick up to the right", dirLeft: "go to the left", traceAgain: "Not quite — start at the red dot and follow the stroke.", traceHelp: "Here is the next stroke — follow the dashed line.", traceDone: "Character done", order: "Order", showMe: "Show me", clear: "Clear", whyStrokes: "strokes", koFinalMissing: (h, f) => `Heard ${h} — the final ${f} was missing.`, koFinalExtra: (h, f) => `Heard ${h} — there is no final ${f} here.`, jaHold: (r) => `Hold the long vowels and small っ: ${r}.`, cardPicKo: "Picture → Korean", cardKanji: "Kanji → reading & meaning", picture: "Picture", chooseLong: "One long vowel changes the meaning.", chooseFinal: "Only the final consonant changes.", micOffTitle: "The microphone is off for this app", micOffText: "Turn it on in your browser’s or the system’s settings to get tone feedback — or say it aloud and rate yourself.", rateMyself: "Rate myself", rateSelfAloud: "Say it aloud after the model, then rate yourself:", getVoice: "Get a voice · 2 min", listenHidden: "Listening exercises are hidden until a voice is installed.", cantReach: "Can’t reach the sync server", offlineWord: "Offline", savedHereSync: "Your progress is saved on this device and syncs when you’re back online.", tryAgain: "Try again", syncCode: "Sync code", syncing: "Syncing…", obStep: (i, n) => `Step ${i} of ${n}`, obWhat: "What do you want to learn?", obWhatSub: "Each language has its own look. You can switch any time.", wordsN: (n) => `${n.toLocaleString("en")} words`, obStarting: "Just starting", obDone: (l) => `${l} done`, obPfSub: "Recommended if you can’t read characters yet", obContinue: (l) => `Continue with ${l}`, obReady: "Let’s get your ears and voice ready", obVoice: (l) => `${l} voice`, obVoiceDefault: "Default voice found · a more natural one is free", obVoiceGood: (q) => `${q} voice found`, obHow: "Show me how · 2 min", obMic: "Microphone", obMicSub: "For Say the word, dialogues and role play", obMicText: "The app listens only while you use the mic button, and compares your pitch with the model to check your tones. Nothing is uploaded.", obAllowMic: "Allow microphone", obMicOn: "Microphone on", obPlan: (n, m) => `${n} new words + reviews · ≈ ${m} min`, change: "Change", obStart: "Start learning", obLater: "Not now — I’ll tap and type instead", showAllVoices: (n) => `Show all ${n} voices`, inUse: "in use", noVoiceTitle: (l) => `No ${l} voice on this device`, noVoiceText: "You can keep learning — words show their reading and tone marks. Add a free voice to hear them.", speed: "Speed", speedSlow: "Slow", speedLearner: "Learner", speedNative: "Native", naturalVoice: "Get a natural voice · free, ≈ 2 min", naturalVoiceText: (l) => `Your device has better ${l} voices than the default — they just need downloading once.`, voiceStepsIos: ["Open Settings → Accessibility → Spoken Content.", "Tap Voices → {0}.", "Pick a voice marked Enhanced or Premium and tap download.", "Come back here — the new voice shows up in this list.", "Tap Test voice to hear the difference."], voiceStepsMac: ["Open System Settings → Accessibility → Spoken Content.", "Click System voice → Manage Voices… → {0}.", "Tick a voice marked Enhanced or Premium to download it.", "Reload this page — the new voice shows up in this list.", "Click Test voice to hear the difference."], testVoice: "Test voice", statsTitle: (l) => `Statistics · ${l}`, ofKnown: (n) => `of ${n} known`, accuracyLower: "accuracy", last12: "Last 12 weeks", daysStudied: (n) => (n === 1 ? "1 day studied" : `${n} days studied`), heatAria: "Study heatmap for the last 12 weeks", less: "less", more: "more", byLevel: "By level", lvMeta: (k, l, n) => `${k} known · ${l} learning · of ${n}`, lvNotStarted: (n) => `not started · ${n} words`, tonesSpeaking: "Tones when speaking", weakestTone: (x) => `The ${x} tone is your weakest — there’s a drill for it in Practice → Tone drill.`, tonesEmpty: "Say a few words with the microphone (Practice → Say the word) to see how each tone comes out.", bySkill: "By skill", lessonN: (n) => `Lesson ${n}`, pctLearned: (n) => `${n}% learned`, pickFromList: "Pick from list", typeMyOwn: "Type my own", ownTyped: (n) => (n === 1 ? "1 typed in by you" : `${n} typed in by you`), ownTag: "Own", removeX: (x) => `Remove ${x}`, ownPrompt: "Pinyin, English or characters", ownPromptOther: "The word or its meaning", alreadyIn: "Already in this lesson", notInList: "Not in the word list — add it as your own word:", addOwn: "Add as my word", lessonsSub: "Words from your tutor classes", newShort: "New", ownN: (n) => `${n} own`, practiseLessonN: (n) => `Practise lesson ${n}`, noLessonsYet: "No lessons yet", noLessonsText: "After your next class, add the new words here so they come up in your daily session.", firstLesson: "First lesson", afterClass: "After class", afterClassText: "Add new words while they’re fresh. Pick them from the list, or type your own — the reading and audio are filled in for you.", dlgTopicsDone: (n, d) => `${n} topics · ${d} done`, timed: "timed", linesN: (n) => `${n} lines`, freeSub: "Random partner, uses only words you know", noDialogues: "No dialogues for this language yet.", searchWords: "Search words", review: "Review", wordsInOrder: (n) => `${n} words · in learning order`, sayItLike: "Say it like", wordDetail: "Word detail", favorite: "Favourite", status: "Status", inLesson: (x) => `In ${x}`, addToLessonX: (x) => `Add to ${x}`, tapTile: "Tap a tile to hear it", voiceNorth: "Northern voice", voiceSouth: "Southern voice", nsNote: "d, gi and r sound like “z” in the North and like “y” in the South.", telexNote: "Telex: <b>dd</b> → đ · <b>aa</b> → â · <b>ow</b> → ơ · tones <b>f s r x j</b>", result: "Result", resultCells: (c, w) => `${c} correct, ${w} wrong`, mistakesN: (n) => `Mistakes · ${n}`, addedToReviews: "Added to today’s reviews", retryMistakes: "Retry mistakes", rateSelfQ: "No speech recogniser on this device? Rate yourself:", notYet: "Not yet", closeEnough: "Close", gotIt: "Got it", sayHint: "Tap the mic and say the word.", tonesRightShort: "tones right", heardShort: "heard", model: "Model", you: "You", setUpRound: "set up this round", allN: (n) => `All ${n}`, orByTime: "or by time", minShort: "min", wordsMatch: (n) => (n === 1 ? "1 word matches" : `${n} words match`), perRound: (k, m) => `${k} per round · ≈ ${m} min`, skillNote_listen: "Ears first", skillNote_speak: "Your tutor’s focus", skillNote_read: "Characters, gently", skillNote_write: "Typing is best on the Mac",
      sub_listen: "Hear a word, pick the meaning", sub_listenPic: "No reading needed", sub_tones: "Which tone did you hear?", sub_soundDrill: "zh / z / j · q / ch / c", sub_say: "Mic + pitch curve per syllable", sub_dialogues: "Listen · read aloud · role play", sub_freePlay: "Random partner, any topic", sub_soundChart: "Pinyin initials & finals",
      sub_choose: "Sound-alikes in a sentence", sub_picture: "See it, pick the pinyin", sub_flash: "Spaced repetition", sub_quiz: "4 directions", sub_match: "Pinyin ↔ meaning", sub_type: "Pinyin + tone picker", sub_typer: "Timed typing race", sub_numbers: "yī èr sān … to 99", sub_trace: "Stroke order, when you start reading",
      modeFree: "Free role play", modeTrace: "Trace characters", newBadge: "New", nDue: (n) => `${n} due`, bestWpm: (n) => `best ${n} wpm`, accentLabel: "Accent", accentN: "Northern", accentS: "Southern",
      nextDialogue: "Next dialogue", allLessons: "All lessons", dlgOf: (i, n) => `${i} of ${n}`, fromTutor: "From your tutor", syncedWith: (x) => `Synced · ${x}`
    },
    de: {
      brandSub: "Trainer", words: "Wörter", train: "Üben", progress: "Fortschritt", more: "Mehr",
      search: "Hanzi, Pinyin oder Bedeutung suchen…", all: "Alle", favorites: "Favoriten", new: "Neu", learning: "In Arbeit", known: "Gelernt", due: "Fällig",
      wordsCount: (n, t) => `${n} von ${t} Wörtern`, noResults: "Keine Wörter passen zu deinem Filter.",
      category: "Kategorie", example: "Beispiel", markKnown: "Als gelernt markieren", markLearning: "Als in Arbeit markieren", resetWord: "Fortschritt zurücksetzen",
      fav: "Favorit", unfav: "Favorit entfernen", practice: "Üben", close: "Schließen", next: "Weiter", back: "Zurück", start: "Start", done: "Fertig", again: "Nochmal", finish: "Beenden",
      dueToday: "zur Wiederholung fällig", reviewNow: "Jetzt wiederholen", nothingDue: "Nichts fällig – super!",
      modeFlash: "Karteikarten", modeFlashDesc: "Spaced Repetition. Karte umdrehen und selbst bewerten.",
      modeQuiz: "Multiple Choice", modeQuizDesc: "Wähle die richtige Übersetzung, das Zeichen oder Pinyin.",
      modeType: "Pinyin tippen", modeTypeDesc: "Zeichen sehen, Pinyin eingeben.",
      modeListen: "Hören", modeListenDesc: "Wort anhören, richtiges Zeichen wählen.",
      modeMatch: "Zuordnen", modeMatchDesc: "Zeichen und Bedeutungen auf Zeit zuordnen.",
      modeTones: "Ton-Training", modeTonesDesc: "Silbe hören und den Ton erkennen.",
      modeTyper: "Schreibmaschine", modeTyperDesc: "Pinyin so schnell wie möglich abtippen. Enter liest es vor.",
      typerIntro: "Tippe die Zeile genau ab, mit Tonzeichen. Mit Enter bist du fertig: die App liest sie vor und geht weiter.",
      typerHint: "Tonzahlen werden zu Zeichen: ni3 → nǐ, lv4 → lǜ, ma5 → ma. Enter = fertig + vorlesen.",
      typerContent: "Inhalt", typerWords: "Wörter", typerSentences: "Sätze", typerMixed: "Gemischt",
      typerBest: "Bestwert", typerRecord: "Neuer Rekord", wpm: "WPM", accuracy: "Genauigkeit",
      modeNumbers: "Zahlen", modeNumbersDesc: "Chinesische Zahlen 1–99 lesen und schreiben.",
      setupTitle: "Übung einrichten", whichWords: "Welche Wörter?", allWords: "Alle Wörter", dueWords: "Fällig & neu", favsOnly: "Favoriten", learningOnly: "In Arbeit", howMany: "Wie viele?",
      direction: "Richtung", dirHzTr: "Zeichen → Bedeutung", dirTrHz: "Bedeutung → Zeichen", dirHzPy: "Zeichen → Pinyin", dirPyHz: "Pinyin → Zeichen",
      tapToFlip: "Tippen zum Aufdecken", rateAgain: "Nochmal", rateHard: "Schwer", rateGood: "Gut", rateEasy: "Leicht",
      correct: "Richtig!", wrong: "Leider nein.", answerWas: "Lösung:", check: "Prüfen", skip: "Überspringen", showAnswer: "Lösung zeigen",
      typeHint: "Töne sind optional, getippte Töne müssen aber stimmen. Zahlen werden zu Zeichen: ni3hao3 → nǐhǎo.", typePlaceholder: "Pinyin…",
      resultTitle: "Übung beendet", resultScore: (c, t) => `${c} von ${t} richtig`, reviewMistakes: "Wörter zum Wiederholen", perfect: "Fehlerfreie Runde!", timeTaken: "Zeit",
      playAgain: "Nochmal spielen", backToTrain: "Zurück zur Übersicht", listenPrompt: "Welches Wort hast du gehört?", play: "Abspielen", listenHint: "Tippe ▶︎, um es erneut zu hören.",
      matchTitle: "Paare zuordnen", pairsLeft: (n) => `${n} Paare übrig`, mistakes: "Fehler",
      statsWords: "Gelernte Wörter", statsLearning: "In Arbeit", statsDue: "Heute fällig", statsStreak: "Tage in Folge", statsAccuracy: "Trefferquote", statsAnswered: "Antworten gesamt", statsToday: "Heute",
      overview: "Übersicht", byCategory: "Nach Kategorie", activity: "Letzte 8 Wochen", dailyGoal: "Tagesziel", goalReached: "Tagesziel erreicht 🎉",
      resetAll: "Gesamten Fortschritt löschen", resetConfirm: "Wirklich den gesamten Lernfortschritt löschen? Das kann nicht rückgängig gemacht werden.", resetDone: "Fortschritt gelöscht.",
      settings: "Einstellungen", language: "Sprache", ttsRate: "Sprechtempo", autoSpeak: "Beim Aufdecken vorlesen", tilePinyin: "Pinyin auf Kacheln", ttsTest: "Stimme testen", theme: "Darstellung", themeAuto: "Auto", themeLight: "Hell", themeDark: "Dunkel",
      toneGuide: "Töne-Übersicht", toneGuideDesc: "Die vier Töne plus neutraler Ton, mit Audio", numbers: "Zahlen-Trainer", numbersDesc: "1–99 üben", pinyinTips: "Pinyin-Tipps", about: "Info & Installation",
      tone1: "1. Ton – hoch, gleichbleibend", tone2: "2. Ton – steigend", tone3: "3. Ton – fallend-steigend", tone4: "4. Ton – fallend", tone5: "Neutral – leicht, kurz",
      tone1d: "Wie ein gehaltener Ton beim Singen: mā.", tone2d: "Wie die Frage „Was?“: má.", tone3d: "Erst runter, dann hoch: mǎ.", tone4d: "Kurz und bestimmt, wie ein Befehl: mà.", tone5d: "Kurz und unbetont: ma.",
      toneDrill: "Ton-Training", toneQ: "Welcher Ton ist das?", toneN: (n) => `${n}. Ton`, toneNeutral: "Neutral",
      numPrompt: "Welche Zahl ist das?", numPrompt2: "Wie schreibt man", numHint: "Zahl eingeben und Enter drücken.", numMode1: "Lesen", numMode2: "Schreiben",
      installTitle: "Auf dem iPhone installieren", installSteps: ["Seite in Safari öffnen.", "Auf das Teilen-Symbol tippen.", "„Zum Home-Bildschirm“ wählen.", "Vom Home-Bildschirm starten – läuft im Vollbild und offline."],
      installMac: "Auf dem Mac: in Safari Ablage → Zum Dock hinzufügen wählen oder die Seite als Lesezeichen speichern.",
      aboutText: "Alle 600 Wörter der HSK-Stufen 1–3 mit Pinyin, englischer Übersetzung (Deutsch für HSK 1), Beispielsätzen und Aussprache über die Sprachausgabe deines Geräts. Dein Fortschritt wird lokal auf diesem Gerät gespeichert.",
      noTts: "Sprachausgabe ist in diesem Browser nicht verfügbar.", speak: "Aussprechen",
      noZhVoice: "Noch keine chinesische Stimme gefunden", ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Für einen natürlichen Klang lade eine Premium- oder erweiterte chinesische Stimme unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Chinesisch (oder suche in den Einstellungen nach „Stimmen“): die App wählt sie von selbst.",
      pinyinTipsText: [
        "Pinyin ist die lateinische Umschrift des Mandarin. Achtung: „q“ klingt wie „tch“, „x“ wie ein weiches „sch“, „zh“ wie „dsch“ in „Dschungel“, „c“ wie „ts“ in „Zahl“.",
        "„ü“ (nach j, q, x, y nur als „u“ geschrieben) spricht man wie das deutsche „ü“.",
        "Töne ändern die Bedeutung: mā (Mutter), má (Hanf), mǎ (Pferd), mà (schimpfen).",
        "Zwei 3. Töne hintereinander: der erste wird zum 2. Ton (nǐ hǎo → ní hǎo).",
        "„bù“ wird vor einem 4. Ton zu „bú“ (bú kèqi); „yī“ wird vor einem 4. Ton zu „yí“ und vor anderen Tönen zu „yì“."
      ],
      keys: "Tasten: 1–4 wählen · Leertaste / Enter weiter", installed: "Offline nutzbar.",
      today: "heute", streakMsg: (n) => n === 1 ? "1 Tag" : `${n} Tage`,
      levels: "Stufen", levelHint: "Wähle die HSK-Stufen, die du lernen möchtest. Die Auswahl gilt für Kacheln, Übungen und Fortschritt.", perLevel: "Nach Stufe", lvlBadge: (n) => `HSK ${n}`,
      dataSource: "Die Wortlisten folgen den offiziellen HSK-2.0-Listen (2012).",
      showMore: (n, rest) => `${n} weitere anzeigen (${rest} übrig)`,
      sounds: "Laute", playRow: "Zeile abspielen", slow: "Langsam abspielen", twice: "Zweimal abspielen", viewList: "Ganze Tabelle zeigen", viewFocus: "Ein Laut nach dem anderen", soundKeys: "Tasten: ← → Laut · 1–6 Zelle · Leertaste Zeile", examplesFor: (x) => `Wörter mit „${x}“`, noExamples: "Keine Beispielwörter in den aktuellen Listen.", listenPick: "Hören & wählen", drillPrompt: "Welchen Laut hast du gehört?", drillOf: "Übung", allDrills: "Gemischt", soundsIntroMore: "Tippe die Zeilenbezeichnung, um die ganze Zeile zu hören.",
      voice: "Stimme", voiceAuto: "Automatisch", refreshVoices: "Stimmen suchen", langName: "Chinesisch",
      ttsHintAndroid: (lang) => `Unter Android nutzt die App die Sprachausgabe des Telefons. Installiere „Speech Services by Google“ aus dem Play Store, öffne dann Einstellungen → Allgemeine Verwaltung (oder System) → Sprache und Eingabe → Text-zu-Sprache-Ausgabe, wähle Google als bevorzugtes Modul, tippe auf dessen Einstellungen → Sprachdaten installieren → ${lang}. Danach diese Seite neu laden. Chrome und Samsung Internet funktionieren beide.`,
      ttsNoVoiceAndroid: (lang) => `Auf diesem Gerät wurde noch keine ${lang}-Stimme gefunden. Nach dem Installieren der Sprachdaten auf „Stimmen suchen“ tippen oder die Seite neu laden.`,
      course: "Kurs", switchCourse: "Sprache wechseln", courseHint: "Jede Sprache hat eigene Wörter, Stufen und eigenen Fortschritt.", knownOf: (k, n) => `${k} von ${n} gelernt`,
      tabToday: "Heute", sessionTitle: "Heutige Einheit", sessionDesc: (r, n) => `${r} wiederholen · ${n} neu`, sessionDone: "Für heute geschafft 🎉", sessionDoneSub: "Morgen warten neue Wiederholungen. Oder übe frei unter „Üben“.",
      sessionEmpty: "Nichts fällig und keine neuen Wörter übrig. Leg unten eine Lektion an oder lerne weitere Wörter.", moreNew: (n) => (n === 1 ? "1 weiteres neues Wort lernen" : `${n} weitere neue Wörter lernen`), fullStats: "Alle Statistiken", backToday: "Zurück zu Lernen",
      modeChoose: "Wähle das Wort", modeChooseDesc: "Fülle die Lücke im Satz. Die Optionen klingen ähnlich, also wähle nach Bedeutung.", chooseTitle: "Wähle das richtige Wort",
      chooseSub: "Sie klingen ähnlich – wähle nach Bedeutung.", chooseSubTone: "Gleiche Buchstaben, anderer Ton – anderes Wort.", chooseNoEx: "Welches Wort bedeutet das?",
      soundsLike: (a, b) => `${a} klingt ähnlich, bedeutet aber „${b}“.`, rolePlay: "Rollenspiel", youAre: (r) => `du bist ${r}`, pickReply: "Du bist dran – wähle eine Antwort und sprich sie",
      typeIt: "Tippen", retry: "Nochmal", cardFront: "Wort → Klang & Bedeutung", cardListen: "Hören → Wort & Ton", toneFamily: "Tonfamilie – tippe zum Vergleichen",
      dueNow: "Heute fällig", reviewCards: (n) => (n === 1 ? "1 Karte wiederholen" : `${n} Karten wiederholen`), sampleLine: "Beispielsatz",
      stepOf: (i, n) => `Schritt ${i} von ${n}`, stepCount: (n) => (n === 1 ? "1 Wort" : `${n} Wörter`),
      stepReview: "Wiederholen", stepReviewDesc: "Heute fällige Wörter. Sprich jedes Wort laut, bevor du die Karte umdrehst.",
      stepMeet: "Neue Wörter", stepMeetDesc: "Hör zu und sprich jedes Wort dreimal laut nach. Ahme die Tonmelodie nach.",
      stepListen: "Hören", stepListenDesc: "Hör ein Wort und wähle, was du gehört hast. Achte auf die Töne.",
      stepWrite: "Schreiben", stepWriteDesc: "Hör ein Wort und tippe sein Pinyin mit Tönen (ni3hao3 → nǐhǎo).",
      sayAloud: "Sprich es 3× laut, dann weiter.", slowly: "Langsam", sessionSummary: "Einheit geschafft", newLearned: (n) => (n === 1 ? "1 neues Wort" : `${n} neue Wörter`),
      lessons: "Lektionen", lessonNew: "Neue Lektion", lessonName: "Name der Lektion", lessonDefault: (n) => `Lektion ${n}`, lessonWords: (n) => (n === 1 ? "1 Wort" : `${n} Wörter`),
      lessonEmpty: "Noch keine Lektionen. Füge nach jeder Stunde die Wörter deiner Lehrerin oder deines Lehrers hinzu, dann übt „Lernen“ genau diese.",
      lessonNoWords: "Noch keine Wörter in dieser Lektion. Such unten in der Liste oder füge eigene hinzu.",
      lessonAddSearch: "Wörter aus der Liste hinzufügen", lessonSearch: "Pinyin, Bedeutung oder Zeichen suchen…", lessonOwn: "Eigenes Wort hinzufügen",
      ownPy: "Pinyin (ni3hao3 → nǐhǎo)", ownHz: "Schriftzeichen (für die Aussprache nötig)", ownEn: "Bedeutung", ownWord: "Wort", ownReading: "Lesung (Kana)", ownHint: "Nicht in der Liste? Frag nach den Schriftzeichen: ohne sie kann die Stimme das Wort nicht vorlesen.",
      add: "Hinzufügen", remove: "Entfernen", added: "Hinzugefügt", deleteLesson: "Lektion löschen", deleteLessonConfirm: "Diese Lektion löschen? Die Wörter und dein Fortschritt bleiben erhalten.",
      practiceLesson: "Diese Lektion üben", lessonsPool: "Meine Lektionen", addToLesson: "Zur Lektion hinzufügen",
      pinyinFirst: "Pinyin zuerst", pinyinFirstDesc: "Pinyin groß anzeigen und Pinyin und Bedeutung statt Schriftzeichen üben. Ausschalten, sobald du Zeichen lernst.",
      sync: "Synchronisieren", syncDesc: "Mac und iPhone abgleichen", syncIntro: "Die Synchronisierung hält Fortschritt, Lektionen und Einstellungen auf all deinen Geräten gleich.",
      syncOn: "Synchronisierung einschalten", syncHave: "Schon auf einem anderen Gerät eingeschaltet? Gib dessen Code ein:", syncConnect: "Verbinden",
      syncCodeLbl: "Sync-Code", syncCodeHint: "Gib diesen Code auf deinem anderen Gerät unter Mehr → Synchronisieren ein. Auf dem iPhone in der App vom Home-Bildschirm: sie hat einen eigenen Speicher, getrennt von Safari. Wer den Code kennt, kann deinen Fortschritt sehen und ändern – behalte ihn für dich.",
      syncCopy: "Code kopieren", copied: "Kopiert", syncNow: "Jetzt synchronisieren", syncLast: (s) => `Zuletzt synchronisiert ${s}`, syncNever: "Noch nicht synchronisiert", syncPending: "Änderungen warten auf Synchronisierung",
      syncDisconnect: "Auf diesem Gerät ausschalten", syncDisconnectConfirm: "Synchronisierung auf diesem Gerät beenden? Der Fortschritt bleibt hier erhalten, die anderen Geräte behalten ihren.",
      syncNotSetup: "Die Synchronisierung ist auf dem Server noch nicht eingerichtet.", syncFailed: "Synchronisierung fehlgeschlagen. Neuer Versuch folgt.", syncOffline: "Offline. Änderungen werden synchronisiert, sobald du wieder online bist.", syncBadCode: "Dieser Code sieht nicht richtig aus.", syncDone: "Synchronisiert",
      justNow: "gerade eben", minAgo: (n) => `vor ${n} Min.`, hAgo: (n) => `vor ${n} Std.`,
      wordsMet: "Wörter kennengelernt", dialogues: "Dialoge", myLessons: "Meine Lektionen", adjust: "Anpassen",
      dueInToday: (n) => (n === 1 ? "1 Wort ist fällig. Wiederhole es unter Heute" : `${n} Wörter sind fällig. Wiederhole sie unter Heute`),
      skill_listen: "Hören", skill_listenDesc: "Trainiere dein Ohr für Wörter, Töne und ähnliche Laute.",
      skill_speak: "Sprechen", skill_speakDesc: "Sprich Wörter und Sätze laut und bekomme Rückmeldung.",
      skill_read: "Lesen", skill_readDesc: "Wörter und ihre Bedeutung erkennen.",
      skill_write: "Schreiben", skill_writeDesc: "Pinyin aus dem Kopf und nach Gehör tippen.",
      modeSay: "Wort sprechen", modeSayDesc: "Sag ein Wort und sieh deine Tonhöhenkurve neben der Tonform.",
      soundDrill: "Ähnliche Laute", soundDrillDesc: "Zwei leicht verwechselbare Laute hören und den richtigen wählen.",
      soundChart: "Lauttabelle", soundChartDesc: "Jeder Laut mit seinen Tönen, zum Anhören und Nachsprechen.",
      dialoguesRead: "Dialoge laut lesen", dialoguesReadDesc: "Kurze Gespräche: hören, laut lesen, antworten.",
      stepSpeak: "Sprechen", stepSpeakDesc: "Sag jedes Wort laut und vergleiche deine Tonhöhenkurve mit der Tonform.",
      noVoice: "Keine Stimme erkannt. Sprich etwas lauter oder näher am Mikrofon.", toneAllGood: "✓ Die Töne klingen richtig.",
      toneLike: (n) => `klang wie ein ${n}. Ton`,
      tipFlat: "Bleib hoch und gleichmäßig", tipHigher: "Setz höher an und halte den Ton", tipRise: "Lass ihn zum Ende hin stärker steigen", tipLower: "Geh tiefer und lass ihn absinken", tipFall: "Setz hoch an und fall ganz nach unten",
      sandhiNote: "Zwei 3. Töne hintereinander: der erste wird als 2. Ton gesprochen.", pitchHint: "Eine grobe Orientierung: deine Stimme (durchgezogen) neben der Tonform (gestrichelt).",
      dlg_listen: "Hören", dlg_read: "Laut lesen", dlg_turn: "Rollenspiel",
      dlg_listenHint: "Spiel den ganzen Dialog ab, dann tippe eine Zeile, um sie noch einmal zu hören. Tippe ein Wort, um seine Bedeutung zu sehen.",
      dlg_readHint: "Lies jede Zeile laut: tippe aufs Mikrofon, sprich, und sieh, welche Wörter angekommen sind. Deine Lesezeit wird gespeichert, so siehst du, wie du schneller wirst.",
      dlg_turnHint: "Wähle eine Rolle. Die App spricht die andere Person, du antwortest sprechend oder tippend.",
      showHz: "Schriftzeichen", showTr: "Übersetzung", playAll: "Alles abspielen", stop: "Stopp",
      readTime: (s) => `Lesezeit ${s}`, bestTime: (s) => `Bestzeit ${s}`,
      chooseRole: "Wer möchtest du sein?", iAm: (n) => `Ich bin ${n}`, switchRole: "Rollen tauschen",
      dlgTurnDone: (c, n) => `${c} von ${n} Antworten richtig`, sayIn: (l) => `Sag es auf ${l}:`, typeOr: "…oder tippe das Pinyin", hint: "Tipp",
      tonesMissing: "✓ Richtig. Nächstes Mal auch mit Tönen.", tonesWrong: "Richtige Wörter, aber prüf die Töne.",
      speakBtn: "Sprechen", listening: "Ich höre zu… tippen zum Beenden", record: "Aufnehmen", stopRec: "Stopp", playMine: "Du", playModel: "Vorbild",
      rateSelf: "Klang es wie das Vorbild?",
      heardGreat: "Klar und deutlich, super.", heardAlmost: "Fast. Hör dir das Vorbild an und versuch es noch einmal.", heardNo: "Das kam nicht an. Versuch es noch einmal, etwas langsamer.", heardAs: (x) => `Gehört: ${x}`,
      micBlocked: "Spracherkennung ist hier nicht verfügbar, du nimmst dich stattdessen auf. Auf dem iPhone braucht sie die Diktierfunktion (Einstellungen → Allgemein → Tastatur) und Zugriff aufs Mikrofon.",
      noMic: "Kein Zugriff aufs Mikrofon.",
      topics: "Themen", allTopics: "Alle Themen", byTopic: "Nach Thema",
      modePicture: "Bild zum Wort", modePictureDesc: "Bild sehen und das Wort wählen, ohne Übersetzung dazwischen.",
      modeListenPic: "Hören und Bild wählen", modeListenPicDesc: "Wort hören und das passende Bild wählen.",
      pictureQ: "Was ist das?", hearPicQ: "Welches Bild hast du gehört?", pronHint: "So wird es gesprochen",
      learn: "Lernen", me: "Ich", continue: "Weiter", wordOfDay: "Wort des Tages", goalToday: "Tagesziel", minutes: (n) => `${n} Min.`, words3: (n) => `${n} Wörter`,
      dailyPlan: "Tagesplan", maxReviews: "Höchstens Wiederholungen pro Tag", newPerDay: "Neue Wörter pro Tag", whileStudying: "Beim Lernen", colorTones: "Nach Ton einfärben", allDialogues: "Alle Dialoge",
      learningCourse: (l, v) => `Lernt ${l} · ${v}`, tipTitle: "Tipp",
      readingLayer: "Lesehilfe", readingLayerDesc: "Pinyin, Umschrift oder Kana zu jedem Wort.", readingAlways: "Immer", readingNew: "Neue Wörter", readingOff: "Aus",
      closeSession: "Einheit schließen", flow_meet: "Neue Wörter kennenlernen", flow_review: "Karten wiederholen", flow_listen: "Hören", flow_speak: "Wort sprechen", flow_write: "Lesung tippen",
      seg_meet: "Neu", seg_review: "Karten", seg_listen: "Hören", seg_speak: "Sagen", seg_write: "Tippen",
      flowSub: (s, n, i, m) => `Schritt ${s} von ${n} · ${i} von ${m}`, flowSubWord: (s, n, i, m) => `Schritt ${s} von ${n} · Wort ${i} von ${m}`, minLeft: (n) => `≈ noch ${n} Min.`, minAbout: (n) => `≈ ${n} Min.`,
      sessionIsDone: "Die heutige Einheit ist geschafft", cardsReviewed: "Karten wiederholt", newWordsLower: "neue Wörter", tonesRight: "Töne richtig gesprochen", rightAnswers: "richtige Antworten", dayStreak: "Tage in Folge",
      watchThese: (n) => `Darauf achten · ${n}`, savedSynced: "Fortschritt gespeichert · synchronisiert", savedHere: "Fortschritt auf diesem Gerät gespeichert", practiseThese: (n) => (n === 1 ? "Dieses noch einmal üben" : `Diese ${n} noch einmal üben`),
      toneShort1: "1. · eben", toneShort2: "2. · steigend", toneShort3: "3. · tief", toneShort4: "4. · fallend", charSmall: "Das Zeichen, vorerst klein", newWord: "Neues Wort", sayIt: "Sag es", playExample: "Beispiel abspielen", iKnowIt: "Kenne ich", nextWord: "Nächstes Wort",
      whyAgain: "Karte · Nochmal", whyTyped: (s) => `getippt: ${s}`, whyPicked: (s) => `gewählt: ${s}`, whyTones: "Töne üben", whyNotHeard: "noch nicht erkannt",
      sessionPlan: (r, n) => `${r} Wiederholungen + ${n} neue Wörter`, sessionPlanReviews: (r) => `${r} Wiederholungen`, sessionPlanNew: (n) => `${n} neue Wörter`, topicLine: (x) => `Thema · ${x}`, todaysSession: "Heutige Einheit",
      hearIt: "Anhören", typeThePinyin: "Pinyin tippen", typeTheWord: "Wort tippen", typePickHint: "Nur Buchstaben – dann unten jeden Ton antippen. Tonzahlen (de2guo2) und Tonzeichen gehen auch.", eachSyllable: "Jede Silbe braucht einen Ton · neutraler Ton: nichts wählen", dontKnow: "Weiß ich nicht – zeig es mir", flow_write_word: "Wort tippen", typePickHintVi: "Nur Buchstaben – dann unten jeden Ton antippen. Telex (traf → trà) geht auch.", eachSyllableVi: "Jede Silbe braucht einen Ton · ohne Zeichen = ngang",
      practiceEyebrow: "Üben", pasteList: "Liste einfügen", pasteShort: "Liste einfügen", pasteNewLesson: "Kommt in eine neue Lektion", pasteLabel: "Wörter aus dem Unterricht", pastePhZh: "nǐ hǎo, xièxie, 老师 Lehrer …", pastePh: "Ein Wort pro Zeile oder mit Kommas", pasteHint: "Pinyin, Zeichen oder Bedeutungen – eins pro Zeile oder mit Kommas getrennt. Jedes Wort wird für dich nachgeschlagen.", skipped: "übersprungen", undo: "Rückgängig", pasteWhich: "Welches?", pasteParts: "Kein einzelnes Wort der Liste – die Teile hinzufügen?", noneOwn: "Keins – mein eigenes Wort", notInListShort: "Nicht in der Wortliste – als eigenes Wort hinzufügen:", pasteCount: (n) => (n === 1 ? "1 Wort zum Hinzufügen" : `${n} Wörter zum Hinzufügen`), pasteOpen: (n) => `${n} noch offen`, lessonDated: (n, d) => `Lektion ${n} · ${d}`, modeFamilies: "Wortfamilien", sub_families: "Ähnliche Wörter nebeneinander", famSub: (n) => `${n} Familien · sieh den Unterschied`, fam_pair: "Gegensätze", fam_tone: "Gleicher Laut, anderer Ton", fam_build: "Ein Teil, viele Wörter", fam_final: "Ein Endkonsonant", together: "Zusammen:", compare: "Vergleichen", whichOne: "Welches ist es?", nextFamily: "Nächste Familie", famQListen: "Welches hast du gehört?", famQMeaning: "Welches bedeutet das?", wordFamily: "Wortfamilie", bestOnMac: "Am besten am Mac · Schreibmaschine", typerRaceZh: "Tipp-Rennen · Pinyin + Töne", typerRace: "Tipp-Rennen", typerHintZh: "tippe de2guo2 oder die Zeichen.", typerHintVi: "Telex- oder VNI-Tastatur.", typerHintKo: "Koreanische Tastatur.", loading: "Lädt …", traceOffline: "Die Strichdaten konnten nicht geladen werden. Einmal online gehen, um sie zu laden.", trace_trace: "Nachziehen", trace_copy: "Abschreiben", trace_memory: "Aus dem Kopf", strokeOf: (i, n) => `Strich ${i} von ${n}`, traceAria: (c) => `Schreibfeld für ${c}`, traceStart: (d) => `Beim roten Punkt anfangen und ${d}.`, strokeGood: (n) => `Strich ${n} sieht gut aus.`, dirDot: "einen kurzen Punkt setzen", dirRight: "nach rechts ziehen", dirDownRight: "nach rechts unten schwingen", dirDown: "gerade nach unten ziehen", dirDownLeft: "nach links unten schwingen", dirUpRight: "nach rechts oben schnellen", dirLeft: "nach links ziehen", traceAgain: "Nicht ganz – beim roten Punkt anfangen und dem Strich folgen.", traceHelp: "Hier ist der nächste Strich – folge der gestrichelten Linie.", traceDone: "Zeichen fertig", order: "Reihenfolge", showMe: "Zeig es mir", clear: "Löschen", whyStrokes: "Striche", koFinalMissing: (h, f) => `Gehört: ${h} – der Endkonsonant ${f} fehlte.`, koFinalExtra: (h, f) => `Gehört: ${h} – hier gibt es kein ${f} am Ende.`, jaHold: (r) => `Lange Vokale und kleines っ halten: ${r}.`, cardPicKo: "Bild → Koreanisch", cardKanji: "Kanji → Lesung & Bedeutung", picture: "Bild", chooseLong: "Ein langer Vokal ändert die Bedeutung.", chooseFinal: "Nur der Endkonsonant ändert sich.", micOffTitle: "Das Mikrofon ist für diese App aus", micOffText: "Schalte es in den Einstellungen des Browsers oder Systems ein, um Rückmeldung zu den Tönen zu bekommen – oder sprich laut und bewerte dich selbst.", rateMyself: "Selbst bewerten", rateSelfAloud: "Sprich es nach der Vorlage laut, dann bewerte dich:", getVoice: "Stimme holen · 2 Min.", listenHidden: "Hörübungen sind ausgeblendet, bis eine Stimme installiert ist.", cantReach: "Sync-Server nicht erreichbar", offlineWord: "Offline", savedHereSync: "Dein Fortschritt ist auf diesem Gerät gespeichert und wird synchronisiert, sobald du wieder online bist.", tryAgain: "Erneut versuchen", syncCode: "Sync-Code", syncing: "Synchronisiere …", obStep: (i, n) => `Schritt ${i} von ${n}`, obWhat: "Was möchtest du lernen?", obWhatSub: "Jede Sprache hat ihr eigenes Aussehen. Du kannst jederzeit wechseln.", wordsN: (n) => `${n.toLocaleString("de")} Wörter`, obStarting: "Ganz neu", obDone: (l) => `${l} geschafft`, obPfSub: "Empfohlen, wenn du noch keine Zeichen lesen kannst", obContinue: (l) => `Weiter mit ${l}`, obReady: "Ohren und Stimme vorbereiten", obVoice: (l) => `Stimme für ${l}`, obVoiceDefault: "Standardstimme gefunden · eine natürlichere gibt es kostenlos", obVoiceGood: (q) => `${q}-Stimme gefunden`, obHow: "Zeig mir wie · 2 Min.", obMic: "Mikrofon", obMicSub: "Für Wort sprechen, Dialoge und Rollenspiel", obMicText: "Die App hört nur zu, während du die Mikrofon-Taste benutzt, und vergleicht deine Tonhöhe mit der Vorlage. Nichts wird hochgeladen.", obAllowMic: "Mikrofon erlauben", obMicOn: "Mikrofon an", obPlan: (n, m) => `${n} neue Wörter + Wiederholungen · ≈ ${m} Min.`, change: "Ändern", obStart: "Loslegen", obLater: "Jetzt nicht – ich tippe lieber", showAllVoices: (n) => `Alle ${n} Stimmen zeigen`, inUse: "aktiv", noVoiceTitle: (l) => `Keine Stimme für ${l} auf diesem Gerät`, noVoiceText: "Du kannst weiterlernen – Wörter zeigen Lesung und Tonzeichen. Lade eine kostenlose Stimme, um sie zu hören.", speed: "Tempo", speedSlow: "Langsam", speedLearner: "Lernend", speedNative: "Normal", naturalVoice: "Natürliche Stimme holen · kostenlos, ≈ 2 Min.", naturalVoiceText: (l) => `Dein Gerät hat bessere Stimmen für ${l} als die Standardstimme – sie müssen nur einmal geladen werden.`, voiceStepsIos: ["Einstellungen → Bedienungshilfen → Gesprochene Inhalte öffnen.", "Stimmen → {0} tippen.", "Eine Stimme mit „Erweitert“ oder „Premium“ wählen und laden.", "Hierher zurückkommen – die neue Stimme erscheint in der Liste.", "Auf „Stimme testen“ tippen und den Unterschied hören."], voiceStepsMac: ["Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte öffnen.", "Systemstimme → Stimmen verwalten … → {0}.", "Eine Stimme mit „Erweitert“ oder „Premium“ ankreuzen und laden.", "Diese Seite neu laden – die neue Stimme erscheint in der Liste.", "Auf „Stimme testen“ klicken und den Unterschied hören."], testVoice: "Stimme testen", statsTitle: (l) => `Statistik · ${l}`, ofKnown: (n) => `von ${n} gelernt`, accuracyLower: "richtig", last12: "Letzte 12 Wochen", daysStudied: (n) => (n === 1 ? "1 Lerntag" : `${n} Lerntage`), heatAria: "Lernkalender der letzten 12 Wochen", less: "weniger", more: "mehr", byLevel: "Nach Stufe", lvMeta: (k, l, n) => `${k} gelernt · ${l} in Arbeit · von ${n}`, lvNotStarted: (n) => `nicht begonnen · ${n} Wörter`, tonesSpeaking: "Töne beim Sprechen", weakestTone: (x) => `Der ${x} Ton ist dein schwächster – dafür gibt es unter Üben → Ton-Training eine Übung.`, tonesEmpty: "Sprich ein paar Wörter ins Mikrofon (Üben → Wort sprechen), dann siehst du, wie jeder Ton gelingt.", bySkill: "Nach Fertigkeit", lessonN: (n) => `Lektion ${n}`, pctLearned: (n) => `${n} % gelernt`, pickFromList: "Aus der Liste", typeMyOwn: "Selbst tippen", ownTyped: (n) => (n === 1 ? "1 von dir eingetippt" : `${n} von dir eingetippt`), ownTag: "Eigen", removeX: (x) => `${x} entfernen`, ownPrompt: "Pinyin, Deutsch oder Zeichen", ownPromptOther: "Das Wort oder seine Bedeutung", alreadyIn: "Schon in dieser Lektion", notInList: "Nicht in der Wortliste – als eigenes Wort hinzufügen:", addOwn: "Als mein Wort hinzufügen", lessonsSub: "Wörter aus deinem Unterricht", newShort: "Neu", ownN: (n) => `${n} eigene`, practiseLessonN: (n) => `Lektion ${n} üben`, noLessonsYet: "Noch keine Lektionen", noLessonsText: "Füge nach der nächsten Stunde die neuen Wörter hier hinzu, dann kommen sie in deiner täglichen Einheit dran.", firstLesson: "Erste Lektion", afterClass: "Nach dem Unterricht", afterClassText: "Neue Wörter eintragen, solange sie frisch sind. Aus der Liste wählen oder selbst tippen – Lesung und Ton werden ergänzt.", dlgTopicsDone: (n, d) => `${n} Themen · ${d} fertig`, timed: "mit Zeit", linesN: (n) => `${n} Zeilen`, freeSub: "Zufälliger Partner, nur Wörter, die du kennst", noDialogues: "Für diese Sprache gibt es noch keine Dialoge.", searchWords: "Wörter suchen", review: "Wiederholen", wordsInOrder: (n) => `${n} Wörter · in Lernreihenfolge`, sayItLike: "So klingt es", wordDetail: "Wortdetails", favorite: "Favorit", status: "Status", inLesson: (x) => `In ${x}`, addToLessonX: (x) => `Zu ${x} hinzufügen`, tapTile: "Tippe eine Kachel an, um sie zu hören", voiceNorth: "Nördliche Stimme", voiceSouth: "Südliche Stimme", nsNote: "d, gi und r klingen im Norden wie ein stimmhaftes „s“, im Süden wie „j“.", telexNote: "Telex: <b>dd</b> → đ · <b>aa</b> → â · <b>ow</b> → ơ · Töne <b>f s r x j</b>", result: "Ergebnis", resultCells: (c, w) => `${c} richtig, ${w} falsch`, mistakesN: (n) => `Fehler · ${n}`, addedToReviews: "Zu den heutigen Wiederholungen hinzugefügt", retryMistakes: "Fehler wiederholen", rateSelfQ: "Keine Spracherkennung auf diesem Gerät? Bewerte dich selbst:", notYet: "Noch nicht", closeEnough: "Fast", gotIt: "Geschafft", sayHint: "Tippe aufs Mikrofon und sag das Wort.", tonesRightShort: "Töne richtig", heardShort: "erkannt", model: "Vorlage", you: "Du", setUpRound: "Runde einrichten", allN: (n) => `Alle ${n}`, orByTime: "oder nach Zeit", minShort: "Min.", wordsMatch: (n) => (n === 1 ? "1 Wort passt" : `${n} Wörter passen`), perRound: (k, m) => `${k} pro Runde · ≈ ${m} Min.`, skillNote_listen: "Erst die Ohren", skillNote_speak: "Schwerpunkt im Unterricht", skillNote_read: "Zeichen, ganz sanft", skillNote_write: "Tippen geht am Mac am besten",
      sub_listen: "Wort hören, Bedeutung wählen", sub_listenPic: "Ohne Lesen", sub_tones: "Welchen Ton hast du gehört?", sub_soundDrill: "zh / z / j · q / ch / c", sub_say: "Mikro + Tonkurve je Silbe", sub_dialogues: "Hören · laut lesen · Rollenspiel", sub_freePlay: "Zufälliger Partner, beliebiges Thema", sub_soundChart: "Pinyin-Anlaute und -Auslaute",
      sub_choose: "Ähnlich klingende Wörter im Satz", sub_picture: "Bild sehen, Pinyin wählen", sub_flash: "Verteilte Wiederholung", sub_quiz: "4 Richtungen", sub_match: "Pinyin ↔ Bedeutung", sub_type: "Pinyin + Tonwahl", sub_typer: "Tipp-Rennen auf Zeit", sub_numbers: "yī èr sān … bis 99", sub_trace: "Strichfolge, wenn du mit Zeichen anfängst",
      modeFree: "Freies Rollenspiel", modeTrace: "Zeichen nachziehen", newBadge: "Neu", nDue: (n) => `${n} fällig`, bestWpm: (n) => `Rekord ${n} WpM`, accentLabel: "Akzent", accentN: "Nord", accentS: "Süd",
      nextDialogue: "Nächster Dialog", allLessons: "Alle Lektionen", dlgOf: (i, n) => `${i} von ${n}`, fromTutor: "Aus deinem Unterricht", syncedWith: (x) => `Synchronisiert · ${x}`
    }
  };
  // Pinyin-first wording (Chinese while characters are not studied yet)
  const PF_I18N = {
    en: {
      search: "Search pinyin, meaning or characters…",
      modeQuizDesc: "Pick the right meaning or pinyin.", modeTypeDesc: "Hear the word and see its meaning, type the pinyin.",
      modeListenDesc: "Hear the word, choose the pinyin.", modeMatchDesc: "Match pinyin with meanings against the clock.",
      dirHzTr: "Pinyin → Meaning", dirTrHz: "Meaning → Pinyin"
    },
    de: {
      search: "Pinyin, Bedeutung oder Zeichen suchen…",
      modeQuizDesc: "Wähle die richtige Bedeutung oder das Pinyin.", modeTypeDesc: "Wort hören, Bedeutung sehen, Pinyin eingeben.",
      modeListenDesc: "Wort anhören, richtiges Pinyin wählen.", modeMatchDesc: "Pinyin und Bedeutungen auf Zeit zuordnen.",
      dirHzTr: "Pinyin → Bedeutung", dirTrHz: "Bedeutung → Pinyin"
    }
  };
  // Course-specific wording (Vietnamese is written in Latin script: no hanzi, no pinyin)
  const COURSE_I18N = {
    ja: {
      en: {
        skillNote_read: "Kana and kanji", skillNote_write: "Romaji or kana", sub_soundDrill: "Long vowels · small っ", sub_say: "Microphone check", sub_soundChart: "Kana tables", sub_choose: "One long vowel changes the word", sub_picture: "See it, pick the word", sub_match: "Word ↔ meaning", sub_type: "Romaji or kana", sub_numbers: "ichi, ni, san … to 99",
        modeSayDesc: "See a word and say it. The microphone checks it, or you record and compare.", stepSpeakDesc: "Say each word out loud. The microphone checks it, or you record yourself and compare.",
        brandSub: "Japanese", search: "Search kanji, kana, romaji or meaning…", tilePinyin: "Reading on tiles", langName: "Japanese", typeOr: "…or type it",
        modeType: "Type the reading", modeTypeDesc: "See the word, type its reading in kana or romaji.",
        modeNumbers: "Numbers", modeNumbersDesc: "Read and write Japanese numbers 1–99.",
        dirHzTr: "Word → Meaning", dirTrHz: "Meaning → Word", dirHzPy: "Word → Reading", dirPyHz: "Reading → Word",
        typeHint: "Kana or romaji (たべる = taberu). Long vowels as written: ou / oo.", typePlaceholder: "reading…",
        pinyinTips: "Reading tips", numbers: "Number trainer", numbersDesc: "Practice 1–99",
        noZhVoice: "No Japanese voice found yet",
        ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. For a natural sound, download a Premium or Enhanced Japanese voice under Settings → Accessibility → Spoken Content → Voices → Japanese (or search Settings for “Voices”): the app picks it by itself.",
        aboutText: "The JLPT vocabulary from N5 to N1 (about 8,000 words) with kana reading, romaji and English meaning, and pronunciation via your device's speech synthesis. Your progress is stored locally on this device.",
        dataSource: "Words, readings and meanings come from the open JLPT lists in",
        pinyinTipsText: [
          "Japanese is written with kanji (Chinese characters) plus two syllabaries, hiragana and katakana. The reading shown here is in kana, followed by romaji.",
          "Romaji here is written the way you type it: long vowels stay as written (とうきょう = toukyou), and っ doubles the following consonant (きって = kitte).",
          "Vowels are short and pure: a as in “father”, i as in “ski”, u as in “put” (lips relaxed), e as in “bed”, o as in “more”.",
          "r is a light tap between English r and l. f (ふ) is blown softly between the lips. ん before b, p, m sounds like m.",
          "Pitch accent, not stress, distinguishes some words (はし bridge vs はし chopsticks). Listen to the audio and imitate the melody.",
          "Meanings list several senses separated by commas. In multiple choice, any sense counts as the word's meaning."
        ]
      },
      de: {
        skillNote_read: "Kana und Kanji", skillNote_write: "Romaji oder Kana", sub_soundDrill: "Lange Vokale · kleines っ", sub_say: "Mikrofon-Check", sub_soundChart: "Kana-Tabellen", sub_choose: "Ein langer Vokal ändert das Wort", sub_picture: "Bild sehen, Wort wählen", sub_match: "Wort ↔ Bedeutung", sub_type: "Romaji oder Kana", sub_numbers: "ichi, ni, san … bis 99",
        modeSayDesc: "Wort sehen und laut sagen. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.", stepSpeakDesc: "Sag jedes Wort laut. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.",
        brandSub: "Japanisch", search: "Kanji, Kana, Romaji oder Bedeutung suchen…", tilePinyin: "Lesung auf Kacheln", langName: "Japanisch", typeOr: "…oder tippe es",
        modeType: "Lesung tippen", modeTypeDesc: "Wort sehen, Lesung in Kana oder Romaji eingeben.",
        modeNumbers: "Zahlen", modeNumbersDesc: "Japanische Zahlen 1–99 lesen und schreiben.",
        dirHzTr: "Wort → Bedeutung", dirTrHz: "Bedeutung → Wort", dirHzPy: "Wort → Lesung", dirPyHz: "Lesung → Wort",
        typeHint: "Kana oder Romaji (たべる = taberu). Lange Vokale wie geschrieben: ou / oo.", typePlaceholder: "Lesung…",
        pinyinTips: "Lese-Tipps", numbers: "Zahlen-Trainer", numbersDesc: "1–99 üben",
        noZhVoice: "Noch keine japanische Stimme gefunden",
        ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Für einen natürlichen Klang lade eine Premium- oder erweiterte japanische Stimme unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Japanisch (oder suche in den Einstellungen nach „Stimmen“): die App wählt sie von selbst.",
        aboutText: "Der JLPT-Wortschatz von N5 bis N1 (rund 8.000 Wörter) mit Kana-Lesung, Romaji und englischer Bedeutung sowie Aussprache über die Sprachausgabe deines Geräts. Dein Fortschritt wird lokal auf diesem Gerät gespeichert.",
        dataSource: "Wörter, Lesungen und Bedeutungen stammen aus den offenen JLPT-Listen in",
        pinyinTipsText: [
          "Japanisch wird mit Kanji (chinesischen Zeichen) und zwei Silbenschriften geschrieben, Hiragana und Katakana. Die Lesung steht hier in Kana, gefolgt von Romaji.",
          "Romaji ist so geschrieben, wie man es tippt: lange Vokale bleiben wie geschrieben (とうきょう = toukyou), っ verdoppelt den folgenden Konsonanten (きって = kitte).",
          "Vokale sind kurz und rein: a wie in „Vater“, i wie in „Kino“, u wie in „Mut“ (Lippen entspannt), e wie in „Bett“, o wie in „Ofen“.",
          "r ist ein leichter Zungenschlag zwischen r und l. f (ふ) wird sanft zwischen den Lippen geblasen. ん vor b, p, m klingt wie m.",
          "Nicht Betonung, sondern Tonhöhe unterscheidet manche Wörter (はし Brücke vs. はし Essstäbchen). Höre das Audio und imitiere die Melodie.",
          "Bedeutungen listen mehrere Lesarten durch Kommas getrennt. Im Multiple Choice zählt jede davon als Bedeutung des Wortes."
        ]
      }
    },
    ko: {
      en: {
        skillNote_read: "Hangul blocks", skillNote_write: "Korean keyboard", sub_soundDrill: "ㄱ / ㅋ / ㄲ · ㅓ / ㅗ", sub_say: "Microphone check", sub_soundChart: "Hangul letters", sub_choose: "Only the final consonant changes", sub_picture: "See it, pick the word", sub_match: "Word ↔ meaning", sub_type: "Hangul or romanization", sub_numbers: "il, i, sam … to 99",
        modeSayDesc: "See a word and say it. The microphone checks it, or you record and compare.", stepSpeakDesc: "Say each word out loud. The microphone checks it, or you record yourself and compare.",
        brandSub: "Korean", search: "Search Hangul, romanization or meaning…", tilePinyin: "Romanization on tiles", langName: "Korean", typeOr: "…or type it",
        modeType: "Type the word", modeTypeDesc: "See the meaning, type the Korean word in Hangul or romanization.",
        typeHint: "Hangul or romanization (감사합니다 = gamsahamnida). Spaces don't matter.", typePlaceholder: "Korean…",
        modeTyperDesc: "Copy-type Korean in Hangul as fast as you can. Enter reads it aloud.",
        typerIntro: "Type the line exactly as shown, in Hangul. Press Enter when you are done: the app reads it aloud and moves on.",
        typerHint: "Use the Korean keyboard (두벌식). Enter = done + speak.",
        modeNumbers: "Numbers", modeNumbersDesc: "Read and write Sino-Korean numbers 1–99 (일, 이, 삼…).",
        dirHzTr: "Word → Meaning", dirTrHz: "Meaning → Word", dirHzPy: "Word → Romanization", dirPyHz: "Romanization → Word",
        pinyinTips: "Hangul tips", numbers: "Number trainer", numbersDesc: "Practice 1–99",
        noZhVoice: "No Korean voice found yet",
        ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. For a natural sound, download a Premium or Enhanced Korean voice under Settings → Accessibility → Spoken Content → Voices → Korean (or search Settings for “Voices”): the app picks it by itself.",
        aboutText: "643 everyday Korean words (A1–A2, Seoul standard, polite 해요 style) with romanization, English and German meanings, example sentences and pronunciation via your device's speech synthesis. Your progress is stored on this device.",
        dataSource: "The word list was compiled for this app and sorted into topics; the levels are an editorial grading, not the official TOPIK list. Romanization follows the Revised Romanization of Korean, generated from the Hangul with the main sound changes.",
        pinyinTipsText: [
          "Learn Hangul first: it takes a few days and is far more reliable than romanization. Start with the sound chart (Practice → Speak → Sound chart).",
          "Each syllable block is a consonant + vowel (+ a final consonant, 받침): 한 = ㅎ + ㅏ + ㄴ. A silent ㅇ fills the consonant place before a vowel: 아.",
          "Three kinds of consonants: plain (ㄱ ㄷ ㅂ ㅈ ㅅ), aspirated with a puff of air (ㅋ ㅌ ㅍ ㅊ) and tense, tight without air (ㄲ ㄸ ㅃ ㅉ ㅆ).",
          "A final consonant moves to the next syllable when that starts with a vowel: 한국어 is said 한구거 (hangugeo). Words where speech differs from spelling show it in brackets: 독일 [도길].",
          "Before ㄴ or ㅁ, final ㄱ ㄷ ㅂ become ㅇ ㄴ ㅁ: 감사합니다 is said 감사함니다.",
          "Korean puts the verb last (subject – object – verb): 저는 사과를 먹어요 = I apple eat.",
          "Particles mark the role of a word: 은/는 topic, 이/가 subject, 을/를 object, 에 place or time, 의 possessive.",
          "The polite 해요 style (-아요/-어요) is the everyday form with people you don't know well; this course uses it throughout."
        ]
      },
      de: {
        skillNote_read: "Hangul-Blöcke", skillNote_write: "Koreanische Tastatur", sub_soundDrill: "ㄱ / ㅋ / ㄲ · ㅓ / ㅗ", sub_say: "Mikrofon-Check", sub_soundChart: "Hangul-Buchstaben", sub_choose: "Nur der Endkonsonant ändert sich", sub_picture: "Bild sehen, Wort wählen", sub_match: "Wort ↔ Bedeutung", sub_type: "Hangul oder Umschrift", sub_numbers: "il, i, sam … bis 99",
        modeSayDesc: "Wort sehen und laut sagen. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.", stepSpeakDesc: "Sag jedes Wort laut. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.",
        brandSub: "Koreanisch", search: "Hangul, Umschrift oder Bedeutung suchen…", tilePinyin: "Umschrift auf Kacheln", langName: "Koreanisch", typeOr: "…oder tippe es",
        modeType: "Wort tippen", modeTypeDesc: "Bedeutung sehen, koreanisches Wort in Hangul oder Umschrift eingeben.",
        typeHint: "Hangul oder Umschrift (감사합니다 = gamsahamnida). Leerzeichen sind egal.", typePlaceholder: "Koreanisch…",
        modeTyperDesc: "Koreanisch in Hangul so schnell wie möglich abtippen. Enter liest es vor.",
        typerIntro: "Tippe die Zeile genau ab, in Hangul. Mit Enter bist du fertig: die App liest sie vor und geht weiter.",
        typerHint: "Nutze die koreanische Tastatur (두벌식). Enter = fertig + vorlesen.",
        modeNumbers: "Zahlen", modeNumbersDesc: "Sinokoreanische Zahlen 1–99 lesen und schreiben (일, 이, 삼…).",
        dirHzTr: "Wort → Bedeutung", dirTrHz: "Bedeutung → Wort", dirHzPy: "Wort → Umschrift", dirPyHz: "Umschrift → Wort",
        pinyinTips: "Hangul-Tipps", numbers: "Zahlen-Trainer", numbersDesc: "1–99 üben",
        noZhVoice: "Noch keine koreanische Stimme gefunden",
        ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Für einen natürlichen Klang lade eine Premium- oder erweiterte koreanische Stimme unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Koreanisch (oder suche in den Einstellungen nach „Stimmen“): die App wählt sie von selbst.",
        aboutText: "643 koreanische Alltagswörter (A1–A2, Seoul-Standard, höflicher 해요-Stil) mit Umschrift, englischer und deutscher Bedeutung, Beispielsätzen und Aussprache über die Sprachausgabe deines Geräts. Dein Fortschritt wird auf diesem Gerät gespeichert.",
        dataSource: "Die Wortliste wurde für diese App zusammengestellt und nach Themen sortiert; die Stufen sind eine redaktionelle Einteilung, nicht die offizielle TOPIK-Liste. Die Umschrift folgt der Revidierten Romanisierung und wird mit den wichtigsten Lautregeln aus dem Hangul erzeugt.",
        pinyinTipsText: [
          "Lerne zuerst Hangul: das dauert ein paar Tage und ist viel verlässlicher als die Umschrift. Beginne mit der Lauttabelle (Üben → Sprechen → Lauttabelle).",
          "Jeder Silbenblock ist Konsonant + Vokal (+ Schlusskonsonant, 받침): 한 = ㅎ + ㅏ + ㄴ. Ein stummes ㅇ füllt vor einem Vokal den Konsonantenplatz: 아.",
          "Drei Arten von Konsonanten: einfach (ㄱ ㄷ ㅂ ㅈ ㅅ), behaucht mit Luftstoß (ㅋ ㅌ ㅍ ㅊ) und gespannt, fest ohne Luft (ㄲ ㄸ ㅃ ㅉ ㅆ).",
          "Ein Schlusskonsonant rutscht in die nächste Silbe, wenn diese mit einem Vokal beginnt: 한국어 spricht man 한구거 (hangugeo). Wörter, deren Aussprache von der Schreibung abweicht, zeigen sie in Klammern: 독일 [도길].",
          "Vor ㄴ oder ㅁ werden ㄱ ㄷ ㅂ am Silbenende zu ㅇ ㄴ ㅁ: 감사합니다 spricht man 감사함니다.",
          "Im Koreanischen steht das Verb am Ende (Subjekt – Objekt – Verb): 저는 사과를 먹어요 = ich Apfel esse.",
          "Partikeln zeigen die Rolle eines Wortes: 은/는 Thema, 이/가 Subjekt, 을/를 Objekt, 에 Ort oder Zeit, 의 Besitz.",
          "Der höfliche 해요-Stil (-아요/-어요) ist die Alltagsform mit Menschen, die man nicht gut kennt; dieser Kurs nutzt ihn durchgehend."
        ]
      }
    },
    vi: {
      en: {
        skillNote_read: "", skillNote_speak: "", skillNote_write: "Telex keyboard", sub_tones: "ma · mà · má · mả · mã · mạ", sub_soundDrill: "tr / ch · s / x · d / gi / r", sub_say: "Mic + tone check", sub_soundChart: "Initials, finals, tones", sub_choose: "Same letters, different tone", sub_picture: "See it, pick the word", sub_match: "Word ↔ meaning", sub_type: "Telex: traf → trà, suwax → sữa", sub_numbers: "một, hai, ba … to 99",
        modeSayDesc: "See a word and say it. The microphone checks it, or you record and compare.", stepSpeakDesc: "Say each word out loud. The microphone checks it, or you record yourself and compare.",
        brandSub: "Vietnamese", search: "Search word or meaning…", tilePinyin: "Pronunciation on tiles", typeOr: "…or type it",
        modeType: "Type the word", modeTypeDesc: "See the meaning, type the Vietnamese word.",
        modeTones: "Tone drill", modeTonesDesc: "Hear a syllable and identify one of the six tones.",
        modeTyperDesc: "Copy-type Vietnamese with all diacritics. Enter reads it aloud.",
        typerIntro: "Type the line exactly as shown, with all diacritics (ă â ê ô ơ ư đ and the tone marks). Press Enter when you are done: the app reads it aloud and moves on.",
        typerHint: "Use a Vietnamese keyboard (Telex or VNI) for diacritics. Enter = done + speak.",
        modeNumbers: "Numbers", modeNumbersDesc: "Read and write Vietnamese numbers 1–99.",
        dirHzTr: "Word → Meaning", dirTrHz: "Meaning → Word", dirHzPy: "Word → Pronunciation", dirPyHz: "Pronunciation → Word",
        typeHint: "Diacritics are optional (cảm ơn = cam on). If you type them, they must be right.", typePlaceholder: "Vietnamese…",
        toneGuide: "Tone guide", toneGuideDesc: "The six tones of Vietnamese, with audio", numbers: "Number trainer", numbersDesc: "Practice 1–99",
        pinyinTips: "Pronunciation tips", toneQ: "Which tone is it?",
        aboutText: "950 Vietnamese words from A1 to C2 (Northern standard) with a pronunciation guide, English translations, example sentences and pronunciation via your device's speech synthesis. Your progress is stored locally on this device.",
        dataSource: "The word list was compiled for this app: A1–B1 cover everyday topics, B2–C1 society, work and formal language, C2 literary and idiomatic vocabulary. The levels are an editorial grading, not an official syllabus; the pronunciation guide is a rough English respelling of the Hanoi accent.",
        pinyinTipsText: [
          "Vietnamese uses the Latin alphabet with extra letters (ă â ê ô ơ ư đ) and tone marks. Every syllable carries one of six tones, and the tone changes the meaning: ma (ghost), mà (but), má (cheek), mả (grave), mã (horse), mạ (rice seedling).",
          "đ is a hard d as in “dog”. Plain d and gi are pronounced like English “z” in the North (dạ = “zah”).",
          "x sounds like “s”; s is also “s” in the North. c, k and q are all a hard “k”; ch and tr are close to “ch”.",
          "ng at the start of a word is the sound at the end of “sing”. Try “ngon” by starting from “sing-on” and dropping the “si”.",
          "Final consonants are never released: “tốt” ends with the tongue in the t position but no puff of air.",
          "ư is an “u” said with unrounded lips; ơ is like the “u” in “fur”; â is a short “uh”; ă is a short “a”.",
          "Kinship words double as pronouns: anh (older male), chị (older female), em (younger person), cô (aunt/young woman), bác (older uncle/aunt). Pick them by relative age.",
          "Speaking to a stranger, a safe polite pattern is “xin chào” + “anh/chị” and adding “ạ” at the end of sentences for politeness."
        ],
        noZhVoice: "No Vietnamese voice found yet", langName: "Vietnamese",
        ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. For a natural sound, download a Premium or Enhanced Vietnamese voice under Settings → Accessibility → Spoken Content → Voices → Vietnamese (or search Settings for “Voices”): the app picks it by itself.",
        tone1: "Ngang – level", tone2: "Huyền – low falling", tone3: "Sắc – rising", tone4: "Hỏi – dipping-rising", tone5: "Ngã – broken rising", tone6: "Nặng – low, short",
        tone1d: "Flat, mid-high, no mark: ma.", tone2d: "Starts mid and falls gently, grave accent: mà.", tone3d: "Rises sharply, acute accent: má.", tone4d: "Dips then rises, hook: mả.", tone5d: "Rises with a catch in the throat, tilde: mã.", tone6d: "Drops abruptly and stops, dot below: mạ."
      },
      de: {
        skillNote_read: "", skillNote_speak: "", skillNote_write: "Telex-Tastatur", sub_tones: "ma · mà · má · mả · mã · mạ", sub_soundDrill: "tr / ch · s / x · d / gi / r", sub_say: "Mikro + Tonprüfung", sub_soundChart: "Anlaute, Auslaute, Töne", sub_choose: "Gleiche Buchstaben, anderer Ton", sub_picture: "Bild sehen, Wort wählen", sub_match: "Wort ↔ Bedeutung", sub_type: "Telex: traf → trà, suwax → sữa", sub_numbers: "một, hai, ba … bis 99",
        modeSayDesc: "Wort sehen und laut sagen. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.", stepSpeakDesc: "Sag jedes Wort laut. Das Mikrofon prüft es, oder du nimmst dich auf und vergleichst.",
        brandSub: "Vietnamesisch", search: "Wort oder Bedeutung suchen…", tilePinyin: "Aussprache auf Kacheln", typeOr: "…oder tippe es",
        modeType: "Wort tippen", modeTypeDesc: "Bedeutung sehen, vietnamesisches Wort eingeben.",
        modeTones: "Ton-Training", modeTonesDesc: "Silbe hören und einen der sechs Töne erkennen.",
        modeTyperDesc: "Vietnamesisch mit allen Diakritika abtippen. Enter liest es vor.",
        typerIntro: "Tippe die Zeile genau ab, mit allen Diakritika (ă â ê ô ơ ư đ und Tonzeichen). Mit Enter bist du fertig: die App liest sie vor und geht weiter.",
        typerHint: "Nutze eine vietnamesische Tastatur (Telex oder VNI) für die Diakritika. Enter = fertig + vorlesen.",
        modeNumbers: "Zahlen", modeNumbersDesc: "Vietnamesische Zahlen 1–99 lesen und schreiben.",
        dirHzTr: "Wort → Bedeutung", dirTrHz: "Bedeutung → Wort", dirHzPy: "Wort → Aussprache", dirPyHz: "Aussprache → Wort",
        typeHint: "Diakritika sind optional (cảm ơn = cam on). Wenn du sie tippst, müssen sie stimmen.", typePlaceholder: "Vietnamesisch…",
        toneGuide: "Töne-Übersicht", toneGuideDesc: "Die sechs Töne des Vietnamesischen, mit Audio", numbers: "Zahlen-Trainer", numbersDesc: "1–99 üben",
        pinyinTips: "Aussprache-Tipps", toneQ: "Welcher Ton ist das?",
        aboutText: "950 vietnamesische Wörter von A1 bis C2 (Nordstandard) mit Ausspracheführer, englischer Übersetzung, Beispielsätzen und Aussprache über die Sprachausgabe deines Geräts. Dein Fortschritt wird lokal auf diesem Gerät gespeichert.",
        dataSource: "Die Wortliste wurde für diese App zusammengestellt: A1–B1 Alltag, B2–C1 Gesellschaft, Arbeit und formelle Sprache, C2 literarischer und idiomatischer Wortschatz. Die Stufen sind eine redaktionelle Einteilung, kein offizieller Lehrplan; der Ausspracheführer ist eine grobe englische Umschrift des Hanoi-Akzents.",
        pinyinTipsText: [
          "Vietnamesisch nutzt das lateinische Alphabet mit Zusatzbuchstaben (ă â ê ô ơ ư đ) und Tonzeichen. Jede Silbe trägt einen von sechs Tönen, und der Ton ändert die Bedeutung: ma (Geist), mà (aber), má (Wange), mả (Grab), mã (Pferd), mạ (Reissetzling).",
          "đ ist ein hartes d. Einfaches d und gi klingen im Norden wie ein stimmhaftes s (dạ = „sa“ wie in „Sahne“).",
          "x wird wie ß gesprochen, s im Norden ebenso. c, k und q sind alle ein hartes k; ch und tr ähneln „tsch“.",
          "ng am Wortanfang ist der Laut am Ende von „sing“. „ngon“: von „sing-on“ ausgehen und „si“ weglassen.",
          "Endkonsonanten werden nicht gelöst: „tốt“ endet mit der Zunge in t-Stellung, aber ohne Luftstoß.",
          "ư ist ein u mit ungerundeten Lippen; ơ ähnelt dem ö in „Möwe“ ohne Rundung; â ist ein kurzes „ö/uh“; ă ein kurzes a.",
          "Verwandtschaftswörter dienen als Pronomen: anh (älterer Mann), chị (ältere Frau), em (jüngere Person), cô (Tante/junge Frau), bác (älterer Onkel/Tante). Wähle nach relativem Alter.",
          "Gegenüber Fremden ist „xin chào“ + „anh/chị“ höflich; ein „ạ“ am Satzende macht den Satz respektvoll."
        ],
        noZhVoice: "Noch keine vietnamesische Stimme gefunden", langName: "Vietnamesisch",
        ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Für einen natürlichen Klang lade eine Premium- oder erweiterte vietnamesische Stimme unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Vietnamesisch (oder suche in den Einstellungen nach „Stimmen“): die App wählt sie von selbst.",
        tone1: "Ngang – eben", tone2: "Huyền – tief fallend", tone3: "Sắc – steigend", tone4: "Hỏi – fallend-steigend", tone5: "Ngã – gebrochen steigend", tone6: "Nặng – tief, kurz",
        tone1d: "Flach, mittelhoch, kein Zeichen: ma.", tone2d: "Beginnt mittel und fällt sanft, Gravis: mà.", tone3d: "Steigt deutlich, Akut: má.", tone4d: "Fällt und steigt wieder, Haken: mả.", tone5d: "Steigt mit Kehlknacks, Tilde: mã.", tone6d: "Fällt abrupt und stoppt, Punkt unten: mạ."
      }
    }
  };
  const t = (key, ...args) => {
    const o = COURSE_I18N[C.id];
    const v = (pyFirst() ? PF_I18N[S.lang][key] : undefined) ?? (o && (o[S.lang]?.[key] ?? o.en?.[key])) ?? I18N[S.lang][key] ?? I18N.en[key] ?? key;
    return typeof v === "function" ? v(...args) : v;
  };
  // Pinyin first: Chinese learners who don't read characters yet see and practise pinyin instead (on unless turned off)
  function pyFirst() { return C.id === "zh" && S.courses.zh.pinyinFirst !== false; }
  // The written form of a word as the learner reads it
  const face = (w) => (pyFirst() ? `<span class="py-face">${pyHtml(w.py)}</span>` : `<span class="hanzi">${w.hz}</span>`);
  const tr = (w) => (S.lang === "de" && w.de ? w.de : w.en);
  const tr2 = (w) => (S.lang === "de" ? (w.de ? w.en : "") : (w.de || ""));
  const exTr = (w) => (S.lang === "de" && w.exDe ? w.exDe : w.exEn);
  const catName = (c) => (CATS[c] ? (S.lang === "de" ? CATS[c].de : CATS[c].en) : c);

  /* ---------------- Speech ---------------- */
  const TTS = { voice: null, available: "speechSynthesis" in window };
  const IS_ANDROID = /android/i.test(navigator.userAgent);
  const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Voices of the current course language. Android reports langs like "zh_CN_#Hans" or "vi_VN".
  function courseVoices() {
    if (!TTS.available) return [];
    const base = C.tts.split("-")[0];
    return speechSynthesis.getVoices().filter((v) => new RegExp("^" + base + "([-_]|$)", "i").test(v.lang) || (base === "zh" && /chinese|中文|普通话|mandarin/i.test(v.name)));
  }
  // Apple's Eloquence voices (Eddy, Flo, Grandma…) exist for every language but sound robotic
  const robotic = (v) => /eloquence|eSpeak/i.test(v.voiceURI + " " + v.name) || /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/.test(v.name);
  function pickVoice() {
    if (!TTS.available) return;
    const same = courseVoices();
    // Manual choice from settings (stored per course) wins when that voice is present
    const wanted = S.settings.voices && S.settings.voices[C.id];
    const manual = wanted && same.find((v) => v.voiceURI === wanted || v.name === wanted);
    if (manual) { TTS.voice = manual; return; }
    const exact = new RegExp("^" + C.tts.replace("-", "[-_]") + "([-_#].*)?$", "i"); // zh-CN, zh_CN, zh_CN_#Hans
    // Apple's Eloquence voices (Eddy, Flo, Grandma…) exist for every language but sound robotic: never the automatic choice
    const pref = same.find((v) => exact.test(v.lang) && /Premium|Enhanced|Erweitert/i.test(v.name) && !robotic(v))
      || same.find((v) => exact.test(v.lang) && /Tingting|Ting-Ting|Lili|Linh|Yuna|Sora|Jian|Suhyun|Kyoko|Otoya|Google|Microsoft/i.test(v.name) && !robotic(v))
      || same.find((v) => exact.test(v.lang) && !robotic(v))
      || same.find((v) => exact.test(v.lang))
      || same.find((v) => !/HK|TW/i.test(v.lang)) || same[0];
    TTS.voice = pref || null;
  }
  if (TTS.available) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); if (route[0] === "more" && !route[1]) render(); }; }
  // No voice for this course on the device (once the voice list has loaded): listening is hidden, words still show their reading
  const noVoice = () => !TTS.available || (speechSynthesis.getVoices().length > 0 && !courseVoices().length);
  let currentUtterance = null; // keep a reference: Safari garbage-collects utterances mid-speech otherwise
  function speak(text, opts) {
    if (!TTS.available) { toast(t("noTts")); return; }
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      if (speechSynthesis.paused) speechSynthesis.resume();
      if (!TTS.voice) pickVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = C.tts;
      if (TTS.voice) { try { u.voice = TTS.voice; } catch (e) { /* stale voice object: fall back to lang-based selection */ } }
      u.rate = (opts && opts.rate) || S.settings.rate;
      u.pitch = 1;
      if (opts && opts.onend) u.onend = opts.onend;
      currentUtterance = u;
      // iOS drops an utterance queued in the same tick as cancel(); defer minimally
      setTimeout(() => speechSynthesis.speak(u), 0);
    } catch (e) { /* ignore */ }
  }
  // iOS only plays speech after a user gesture: unlock with a silent utterance on the first touch/click
  function unlockSpeech() {
    if (!TTS.available) return;
    try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* ignore */ }
    setTimeout(() => { if (!TTS.voice) { pickVoice(); if (TTS.voice && route[0] === "more" && !route[1]) render(); } }, 600);
    document.removeEventListener("touchend", unlockSpeech, true);
    document.removeEventListener("click", unlockSpeech, true);
  }
  if (TTS.available) {
    document.addEventListener("touchend", unlockSpeech, true);
    document.addEventListener("click", unlockSpeech, true);
    // Safari pauses speech when the page is hidden and never resumes it
    document.addEventListener("visibilitychange", () => { if (!document.hidden && speechSynthesis.paused) speechSynthesis.resume(); });
  }

  /* ---------------- Spaced repetition (SM-2 style) ---------------- */
  function card(id) { const c = S.srs[id]; return c && !c.gone ? c : null; }
  function status(id) { const c = card(id); if (!c) return "new"; return c.interval >= 21 ? "known" : "learning"; }
  function isDue(id) { const c = card(id); return !!c && c.due <= Date.now(); }
  function grade(id, q) { // q: 0 again, 1 hard, 2 good, 3 easy
    const now = Date.now();
    const c = card(id) || { ef: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 };
    c.first = c.first || todayKey();
    // Only the first success of a day schedules the word (a guided session tests it several times);
    // a miss clears that, so the next success reschedules it
    if (q > 0 && c.ok === todayKey()) return;
    if (q === 0) {
      delete c.ok;
      c.reps = 0; c.lapses = (c.lapses || 0) + 1; c.interval = 0; c.ef = Math.max(1.3, c.ef - 0.2); c.due = now + 10 * 60 * 1000;
    } else {
      if (c.reps === 0) c.interval = q === 1 ? 0.5 : q === 2 ? 1 : 3;
      else if (c.reps === 1) c.interval = q === 1 ? 1 : q === 2 ? 3 : 7;
      else c.interval = Math.round(c.interval * (q === 1 ? 1.2 : q === 2 ? c.ef : c.ef * 1.4) * 10) / 10;
      c.ef = Math.max(1.3, Math.min(3.0, c.ef + (q === 3 ? 0.15 : q === 1 ? -0.15 : 0)));
      c.reps += 1;
      c.due = now + c.interval * DAY;
      c.ok = todayKey();
    }
    S.srs[id] = c;
    save();
  }
  function markKnown(id) { S.srs[id] = { ef: 2.5, interval: 30, reps: 3, due: Date.now() + 30 * DAY, lapses: 0 }; save(); }
  function markLearning(id) { S.srs[id] = { ef: 2.5, interval: 0, reps: 0, due: Date.now(), lapses: 0, first: todayKey() }; save(); }
  function resetWord(id) { delete S.srs[id]; save(); }
  function recordAnswer(correct) {
    if (!flow && typeof runMarks !== "undefined") runMarks.push(!!correct);
    S.stats.answered += 1; if (correct) S.stats.correct += 1;
    const sk = typeof curSkill === "function" ? curSkill() : null; if (sk) bumpPair("skill", sk, correct);
    const k = todayKey(); S.stats.days[k] = (S.stats.days[k] || 0) + 1; save();
  }
  // S.stats counts this device; S.peers holds the counts the other synced devices reported
  const allStats = () => [S.stats].concat(Object.values(S.peers || {}));
  const dayCount = (k) => allStats().reduce((a, s) => a + ((s.days && s.days[k]) || 0), 0);
  const statSum = (f) => allStats().reduce((a, s) => a + (s[f] || 0), 0);
  function dueWords() { return WORDS.filter((w) => isDue(w.id)); }
  function streak() {
    let n = 0; const d = new Date();
    if (!dayCount(todayKey(d))) d.setDate(d.getDate() - 1);
    while (dayCount(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 1800); }

  /* ---------------- Sheet (modal) ---------------- */
  function openSheet(html, onClose) {
    const sheet = $("#sheet"), bd = $("#sheet-backdrop");
    sheet.innerHTML = `<div class="sheet-handle"></div>${html}`;
    sheet.hidden = false; bd.hidden = false;
    sheet._onClose = onClose;
    bd.onclick = closeSheet;
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    const sheet = $("#sheet"), bd = $("#sheet-backdrop");
    if (sheet.hidden) return;
    sheet.hidden = true; bd.hidden = true; document.body.style.overflow = "";
    if (sheet._onClose) { const f = sheet._onClose; sheet._onClose = null; f(); }
  }

  /* ---------------- Router ---------------- */
  // Line icons (24×24, stroke = currentColor)
  const ICON = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    lessons: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7M8 11h5"/>',
    train: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    words: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    listen: '<path d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3 3 0 0 1-6 0"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0"/>',
    speak: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
    read: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
    write: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    chat: '<path d="M4 5h11v8H8l-4 3z"/><path d="M15 9h5v8l-3-2h-6v-2"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    more: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
  };
  const icon = (k, cls) => `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
  // Four sections (style canvas): Learn (today, lessons, dialogues), Practice, Words, Me (settings)
  const TABS = [
    { id: "today", key: "learn", also: ["progress", "lessons", "dialogues"] },
    { id: "train", key: "train", also: ["sounds", "families"] },
    { id: "words", key: "words", also: [] },
    { id: "more", key: "me", also: [] }
  ];
  let route = [];
  let cleanup = null;
  let flow = null; // guided session in progress (Today), see startFlow

  function navigate(path) { location.hash = "#/" + path; }
  function parseRoute() { const h = location.hash.replace(/^#\/?/, ""); return h ? h.split("/") : ["today"]; }
  function renderNav() {
    const glyphs = LOOK_TABS[C.id];
    const html = TABS.map((tab, k) => `<button class="tab ${route[0] === tab.id || tab.also.includes(route[0]) ? "active" : ""}" data-route="${tab.id}" type="button"><span class="tab-ico ${glyphs ? "tab-glyph" : ""}" aria-hidden="true">${glyphs ? esc(glyphs[k]) : icon(tab.id)}</span><span>${t(tab.key)}</span></button>`).join("");
    // Desktop (round 2): the dock becomes a sidebar with My lessons and Dialogues as their own places
    const extra = [["lessons", "myLessons", LOOK_EXTRA[C.id][0]], ["dialogues", "dialogues", LOOK_EXTRA[C.id][1]]].map(([r, key, g]) => `<button class="tab ${route[0] === r ? "active" : ""}" data-route="${r}" type="button"><span class="tab-ico tab-glyph" aria-hidden="true">${esc(g)}</span><span>${t(key)}</span></button>`).join("");
    $("#nav-desktop").innerHTML = html.replace(`class="tab active" data-route="today"`, route[0] === "lessons" || route[0] === "dialogues" ? `class="tab" data-route="today"` : `class="tab active" data-route="today"`) + extra;
    $("#nav-mobile").innerHTML = html;
    const last = courseLessons().length;
    $(".brand-sub").textContent = `${levelLabel()}${last ? " · " + t("lessonN", last).toLowerCase() : ""}`;
    $("#side-foot").innerHTML = `${DEV.code ? `<span class="side-sync"><i class="${sync.state && sync.state !== "ok" ? "off" : ""}"></i>${esc(syncStatusText().replace(/^☁️ /, ""))}</span>` : ""}<span class="side-lang">${["en", "de"].map((l) => `<button class="link-btn ${S.lang === l ? "on" : ""}" data-side-lang="${l}" type="button">${l === "en" ? "English" : "Deutsch"}</button>`).join(" · ")}</span>`;
    $$("[data-side-lang]").forEach((b) => (b.onclick = () => { S.lang = b.dataset.sideLang; document.documentElement.lang = S.lang; save(); render(); }));
    $$("[data-route]").forEach((b) => (b.onclick = () => navigate(b.dataset.route)));
    $$(".lang-toggle").forEach((b) => { b.innerHTML = icon("settings"); b.setAttribute("aria-label", t("settings")); b.classList.toggle("active", route[0] === "more"); b.onclick = () => navigate("more"); });
    updateBrand();
  }
  function openCourseSheet() {
    openSheet(`
      <h2 style="text-align:center;margin-bottom:4px">${t("switchCourse")}</h2>
      <p class="muted small center" style="margin-bottom:14px">${t("courseHint")}</p>
      <div class="stack">
        ${Object.values(COURSES).map((c) => {
          const known = c.words.filter((w) => status(w.id) === "known").length;
          return `<button class="course-card ${c.id === C.id ? "active" : ""}" data-course="${c.id}" type="button">
            <span class="course-glyph ${c.script}">${c.glyph}</span>
            <span class="grow"><div class="course-name">${c.name}</div><div class="small muted">${c.words.length} ${t("words").toLowerCase()} · ${c.allLabel} · ${t("knownOf", known, c.words.length)}</div></span>
            ${c.id === C.id ? "<span class=\"course-check\">✓</span>" : ""}
          </button>`;
        }).join("")}
        <button class="btn block ghost" id="c-close" type="button">${t("close")}</button>
      </div>`);
    $$("[data-course]").forEach((b) => (b.onclick = () => switchCourse(b.dataset.course)));
    $("#c-close").onclick = closeSheet;
  }
  function switchCourse(id) {
    if (!COURSES[id]) return;
    S.course = id; save();
    applyCourse(); pickVoice();
    wf.q = ""; wf.cat = "all"; wf.status = "all"; setupPrefs.cat = "all";
    closeSheet();
    if (route[0] === "words" || route[0] === "today") render(); else navigate("today");
  }
  function updateBrand() {
    $$(".course-glyph-brand").forEach((el) => { el.textContent = C.glyph; el.classList.toggle("latin", C.script === "latin"); });
    $(".brand-title").textContent = t("langName");
    $$(".brand, #course-btn").forEach((b) => { b.onclick = openCourseSheet; b.title = t("switchCourse"); });
  }
  function setTopbar(title, back) {
    $("#topbar-title").textContent = title;
    const b = $("#topbar-back"); b.hidden = !back;
    b.onclick = back ? () => navigate(back) : null;
    $("#course-btn").hidden = !!back;
  }
  function render() {
    closeSheet();
    if (cleanup) { cleanup(); cleanup = null; }
    flow = null; document.body.classList.remove("in-flow");
    runMarks = []; runT0 = Date.now(); runMode = null; runWhy = {};
    // Leaving a screen ends any listening or recording that is still running
    if (MIC.cap) { MIC.cap.aborted = true; MIC.cap.finish(); }
    if (MIC.rec) { MIC.rec.onresult = null; MIC.rec.abort ? MIC.rec.abort() : MIC.rec.stop(); }
    route = parseRoute();
    renderNav();
    const view = $("#view");
    view.scrollTop = 0; window.scrollTo(0, 0);
    view.className = "view fade-in";
    document.body.classList.remove("home");
    const main = route[0];
    // First launch: a short welcome (existing learners with progress skip it)
    if (!S.settings.onboarded && Object.keys(S.srs).length) { S.settings.onboarded = 1; save(); }
    if (!S.settings.onboarded || main === "welcome") return renderWelcome(view);
    if (main === "train") renderTrain(view);
    else if (main === "words") renderWords(view);
    else if (main === "sounds") renderSounds(view);
    else if (main === "lessons") renderLessons(view);
    else if (main === "dialogues") renderDialogues(view);
    else if (main === "families") renderFamilies(view);
    else if (main === "progress") renderProgress(view);
    else if (main === "more") renderMore(view);
    else renderToday(view);
  }
  window.addEventListener("hashchange", render);

  /* ---------------- Level selector (shared) ---------------- */
  function levelChips(id) {
    return `<div class="chips level-chips" id="${id}">${C.levels.map((l) => {
      const n = ALL_WORDS.filter((w) => w.lvl === l).length;
      return `<button class="chip lvl ${curLevels().includes(l) ? "active" : ""}" data-lvl="${l}" type="button">${C.levelName(l)} <span class="chip-n">${n}</span></button>`;
    }).join("")}</div>`;
  }
  function bindLevelChips(id, onChange) {
    $$(`#${id} .chip`).forEach((b) => (b.onclick = () => {
      const l = +b.dataset.lvl; let lv = curLevels().slice();
      if (lv.includes(l)) { if (lv.length === 1) return; lv = lv.filter((x) => x !== l); } else lv.push(l);
      S.courses[C.id].levels = lv.sort(); save(); applyLevels();
      $$(`#${id} .chip`).forEach((x) => x.classList.toggle("active", curLevels().includes(+x.dataset.lvl)));
      onChange();
    }));
  }

  /* ================= WORDS (tile overview) ================= */
  const wf = { q: "", cat: "all", status: "all" };
  function filteredWords() {
    const q = wf.q.trim().toLowerCase(); const qs = norm(q);
    return WORDS.filter((w) => {
      if (!inCat(w, wf.cat)) return false;
      if (wf.status === "favs" && !S.favs.includes(w.id)) return false;
      if (wf.status === "due" && !isDue(w.id)) return false;
      if (["new", "learning", "known"].includes(wf.status) && status(w.id) !== wf.status) return false;
      if (!q) return true;
      return w.hz.toLowerCase().includes(q) || norm(w.hz).includes(qs) || norm(w.py).includes(qs) || w.py.toLowerCase().includes(q) || (w.romaji && w.romaji.includes(qs)) || w.en.toLowerCase().includes(q) || (w.de || "").toLowerCase().includes(q);
    }).sort((a, b) => (themes().length ? 0 : (status(a.id) === "new") - (status(b.id) === "new"))); // learning order with topics, else words you have met first
  }
  function renderWords(view) {
    setTopbar(t("words") + " · " + levelLabel(), null);
    document.body.classList.add("home");
    const due = dueWords().length;
    const statusFilters = [["all", t("all")], ["new", "□ " + t("new")], ["learning", "◧ " + t("learning")], ["known", "■ " + t("known")], ["favs", "★"]];
    const topics = themes().length ? themes().map((x, k) => [x.id, `${k + 1} ${L(x.name)}`]) : Object.keys(CATS).filter((c) => WORDS.some((w) => w.cat === c)).map((c) => [c, catName(c)]);
    view.innerHTML = `<div class="words-wrap"><section class="words-main">
      <div class="w2-head">
        <div class="word-stats">${[["new", t("new"), "tn4"], ["learning", t("learning"), "tn2"], ["due", t("due"), "accent"]].map(([k, l, c]) => `<button class="ws ${wf.status === k ? "on" : ""} ${k === "due" && due ? "hot" : ""}" data-ws="${k}" type="button"><b class="${c}">${k === "due" ? due : WORDS.filter((w) => status(w.id) === k).length}</b>${l}</button>`).join("")}</div>
        ${due ? `<button class="btn primary" id="review-due" type="button">${t("review")}</button>` : ""}
      </div>
      <div class="search-wrap"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><label class="sr-only" for="search">${t("searchWords")}</label><input class="search" id="search" type="search" placeholder="${esc(t("search"))}" value="${esc(wf.q)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
      <div class="chips w2-chips"><span id="lvl-wrap">${levelChips("lvl-chips")}</span><span class="chip-sep"></span><span class="chips" id="status-chips">${statusFilters.map(([k, l]) => `<button class="chip ${wf.status === k ? "active" : ""}" data-status="${k}" type="button" aria-pressed="${wf.status === k}" ${k === "favs" ? `aria-label="${t("favorites")}"` : ""}>${l}</button>`).join("")}</span></div>
      <div class="chips" id="cat-chips"><button class="chip ${wf.cat === "all" ? "active" : ""}" data-cat="all" type="button">${t("allTopics")}</button>${topics.map(([k, l]) => `<button class="chip ${wf.cat === k ? "active" : ""}" data-cat="${k}" type="button">${esc(l)}</button>`).join("")}</div>
      <div class="list-hint" id="words-hint"></div>
      <div id="tiles"></div></section><aside id="word-pane" class="word-pane" aria-label="${t("wordDetail")}"></aside></div>`;
    const search = $("#search");
    // Desktop: ⌘F / Ctrl+F searches the words; the first word opens in the side pane
    bindKeys((e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") { e.preventDefault(); search.focus(); search.select(); } });
    search.oninput = () => { wf.q = search.value; drawTiles(); };
    $$("[data-ws]").forEach((b) => (b.onclick = () => { wf.status = wf.status === b.dataset.ws ? "all" : b.dataset.ws; render(); }));
    if ($("#review-due")) $("#review-due").onclick = () => { setupPrefs.pools = ["due"]; setupPrefs.mins = 0; navigate("train/flash"); };
    bindLevelChips("lvl-chips", () => { setTopbar(t("words") + " · " + levelLabel(), null); drawTiles(); });
    $$("#status-chips .chip").forEach((b) => (b.onclick = () => { wf.status = b.dataset.status; $$("#status-chips .chip").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", x === b); }); drawTiles(); }));
    $$("#cat-chips .chip").forEach((b) => (b.onclick = () => { wf.cat = b.dataset.cat; $$("#cat-chips .chip").forEach((x) => x.classList.toggle("active", x === b)); drawTiles(); }));
    drawTiles();
  }
  // Status as a shape, never colour alone: □ new · ◧ learning · ■ known
  const statusShape = (id) => { const st = status(id), h = st === "known" ? 10 : st === "learning" ? 5 : 0; return `<svg class="st-shape" width="12" height="12" viewBox="0 0 12 12" role="img" aria-label="${t(st)}"><rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/>${h ? `<rect x="1" y="${11 - h}" width="10" height="${h}" fill="currentColor"/>` : ""}</svg>`; };
  // One word as a compact tile: picture, the word as the learner reads it, the rest small, the status shape
  function wordTileHtml(w, sel) {
    const main = C.id === "zh" ? (pyFirst() ? `<span class="wt-main py-face">${pyHtml(w.py)}</span><span class="wt-sub"><span class="hanzi">${esc(w.hz)}</span> · ${esc(tr(w))}</span>`
        : `<span class="wt-main hanzi">${esc(w.hz)}</span><span class="wt-sub">${showsReading(w) ? pyHtml(w.py) + " · " : ""}${esc(tr(w))}</span>`)
      : C.id === "vi" ? `<span class="wt-main">${viHtml(w.hz)}</span><span class="wt-sub">${esc(tr(w))}</span>`
      : `<span class="wt-main hanzi">${esc(w.hz)}</span><span class="wt-sub">${showsReading(w) ? esc(C.id === "ja" ? (w.kana && w.kana !== w.hz ? w.kana : w.romaji) : w.py) + " · " : ""}${esc(tr(w))}</span>`;
    return `<button class="wtile ${sel ? "sel" : ""}" data-id="${w.id}" type="button"><span class="wt-pic ${pic(w) ? "" : "ph"}" aria-hidden="true">${pic(w) || esc(Array.from(w.hz)[0] || "")}</span><span class="wt-text">${main}</span>${statusShape(w.id)}</button>`;
  }
  let tileLimit = 240;
  function drawTiles(reset) {
    if (reset !== false) tileLimit = 240;
    const list = filteredWords();
    $("#words-hint").textContent = t("wordsCount", list.length, WORDS.length);
    const tiles = $("#tiles");
    if (!list.length) { tiles.innerHTML = `<div class="state-card"><b>${t("noResults")}</b></div>`; return; }
    const CHUNK = 240;
    if (themes().length) {
      // Topic headings, the words in learning order
      const pass = new Set(list.map((w) => w.id));
      tiles.innerHTML = themes().map((th, k) => [th, k]).filter(([th]) => wf.cat === "all" || th.id === wf.cat).map(([th, k]) => {
        const ws = th.groups.flatMap((g) => g.ids).filter((id) => pass.has(id)).map((id) => BY_ID[id]);
        return ws.length ? `<div class="topic-rule"><b>${k + 1} · ${esc(L(th.name))}</b><span>${t("wordsInOrder", ws.length)}</span></div><div class="wgrid">${ws.map((w) => wordTileHtml(w)).join("")}</div>` : "";
      }).join("");
    } else {
      const shown = list.slice(0, tileLimit);
      tiles.innerHTML = `<div class="wgrid">${shown.map((w) => wordTileHtml(w)).join("")}</div>` + (list.length > shown.length ? `<button class="btn block tiles-more" id="tiles-more" type="button">${t("showMore", Math.min(CHUNK, list.length - shown.length), list.length - shown.length)}</button>` : "");
    }
    $$(".wtile", tiles).forEach((b) => (b.onclick = () => openWord(wid(b.dataset.id))));
    const pane = $("#word-pane");
    if (pane && getComputedStyle(pane).display !== "none") { const selId = pane.dataset.word && BY_ID[wid(pane.dataset.word)] ? wid(pane.dataset.word) : list[0].id; openWord(selId); }
    const more = $("#tiles-more"); if (more) more.onclick = () => { tileLimit += CHUNK; drawTiles(false); };
  }
  // How a word is said, in the way its language needs it: Korean letters building each block (and the spoken form
  // when it differs), 田字格 for Chinese, kana above the word for Japanese, tone contours for Vietnamese; plus the tip
  function sayLikeHtml(w) {
    const tip = sayTip(w), tipText = tip ? [tip.sound, tip.tone].filter(Boolean).join(" ") : "";
    let shape = "";
    if (C.id === "ko") {
      const blocks = (s) => Array.from(s).map((ch) => { const j = koJamo(ch); return j ? `<span class="jt"><i class="kb-i">${j.i}</i><i class="kb-v">${j.v}</i>${j.f ? `<i class="kb-f">${j.f}</i>` : ""}</span>` : ""; }).join("");
      shape = `<div class="say-like-ko">${blocks(w.hz)}${w.pron ? `<span class="arrow">→</span><b class="hanzi">[${esc(w.pron)}]</b>` : ""}</div>`;
    } else if (C.id === "zh") shape = gridHtml(w.hz, Array.from(w.hz).length > 2 ? "sm" : "md");
    else if (C.id === "ja") shape = `<div class="say-like-ja hanzi">${w.kana && w.kana !== w.hz ? `<ruby>${esc(w.hz)}<rt>${esc(w.kana)}</rt></ruby>` : esc(w.hz)}</div>`;
    else if (C.id === "vi") shape = contoursHtml(w.hz);
    return `<div class="say-like"><div class="eyebrow">${t("sayItLike")}</div>${shape}${tipText ? `<div class="sl-tip"><span class="grow">${esc(tipText)}</span><button class="sq-btn" id="d-speak" type="button" aria-label="${t("play")} ${esc(w.hz)}">${icon("speaker")}</button></div>` : `<div class="sl-tip"><span class="grow"></span><button class="sq-btn" id="d-speak" type="button" aria-label="${t("play")}">${icon("speaker")}</button></div>`}</div>`;
  }
  function wordSheetHtml(w) {
    const id = w.id, st = status(id), fav = S.favs.includes(id);
    const ls = courseLessons(), last = ls[ls.length - 1];
    const reading = C.id === "zh" ? (pyFirst() ? `<div class="wsh-word py-face">${pyHtml(w.py)}</div><div class="wsh-sub"><span class="hanzi">${esc(w.hz)}</span> · ${esc(tr(w))}</div>` : `<div class="wsh-word hanzi">${esc(w.hz)}</div><div class="wsh-sub">${pyHtml(w.py)} · ${esc(tr(w))}</div>`)
      : C.id === "vi" ? `<div class="wsh-word">${viHtml(w.hz)}</div><div class="wsh-sub">${esc(w.py)} · ${esc(tr(w))}</div>`
      : `<div class="wsh-word hanzi">${esc(w.hz)}</div><div class="wsh-sub">${esc(C.id === "ja" ? w.romaji || w.py : w.py)} · ${esc(tr(w))}</div>`;
    const ex = w.ex ? `<div class="wsh-ex"><div class="grow">${pyFirst() && w.exPy ? `<div class="ex-main">${markIn(w.exPy, w.py)}</div><div class="ex-sub"><span class="hanzi">${esc(w.ex)}</span> · ${esc(exTr(w))}</div>` : `<div class="ex-main hanzi">${markIn(w.ex, w.hz)}</div><div class="ex-sub">${w.exPy && C.id !== "vi" ? esc(w.exPy) + " · " : ""}${esc(exTr(w))}</div>`}</div><button class="sq-btn" id="d-speak-ex" type="button" aria-label="${t("playExample")}">${icon("play")}</button></div>` : "";
    return `
      <div class="wsh" role="group" aria-label="${esc(t("wordDetail"))}: ${esc(w.hz)}">
        <div class="wsh-top">${pic(w) ? `<div class="wsh-pic" role="img" aria-label="${esc(tr(w))}">${pic(w)}</div>` : ""}<div class="grow">${reading}</div>
          <button class="sq-btn ${fav ? "on" : ""}" id="d-fav" type="button" aria-label="${t("favorite")}" aria-pressed="${fav}">${icon("star")}</button></div>
        <div class="wsh-meta">${C.levelName(w.lvl)}${(() => { const th = themes().find((x) => x.id === topicOf(w.id)); return th ? " · " + esc(L(th.name)) : ""; })()}${tr2(w) ? " · " + esc(tr2(w)) : ""}</div>
        ${sayLikeHtml(w)}
        ${familiesOf(id).length ? `<div class="eyebrow">${t("wordFamily")}</div>${familiesOf(id).slice(0, 2).map((f) => familyCardHtml(f, id)).join("")}` : ""}
        ${ex}
        <div class="eyebrow">${t("status")}</div>
        <div class="seg" id="d-status">${["new", "learning", "known"].map((k) => `<button class="${st === k ? "on" : ""}" data-st="${k}" type="button" aria-pressed="${st === k}">${t(k)}</button>`).join("")}</div>
        ${last ? `<button class="btn block fd-again" id="d-add" type="button">${last.words.includes(id) ? "✓ " + t("inLesson", esc(last.name)) : "＋ " + t("addToLessonX", esc(last.name))}</button>
          ${ls.length > 1 ? `<div class="chips">${ls.slice(0, -1).reverse().map((l) => `<button class="chip ${l.words.includes(id) ? "active" : ""}" data-lesson="${l.id}" type="button">${l.words.includes(id) ? "✓ " : "+ "}${esc(l.name)}</button>`).join("")}</div>` : ""}` : ""}
      </div>`;
  }
  function bindWordSheet(w, again) {
    const id = w.id;
    $("#d-speak").onclick = () => speak(w.hz);
    if ($("#d-speak-ex")) $("#d-speak-ex").onclick = () => speak(w.ex);
    $("#d-fav").onclick = () => { S.favs = S.favs.includes(id) ? S.favs.filter((x) => x !== id) : S.favs.concat(id); save(); again(); };
    $$("#d-status [data-st]").forEach((b) => (b.onclick = () => { const k = b.dataset.st; if (k === "new") resetWord(id); else if (k === "learning") markLearning(id); else markKnown(id); again(); }));
    const ls = courseLessons(), last = ls[ls.length - 1];
    if ($("#d-add")) $("#d-add").onclick = () => { toggleLessonWord(last.id, id); again(); };
    $$("[data-lesson]", $(".wsh")).forEach((b) => (b.onclick = () => { toggleLessonWord(b.dataset.lesson, id); again(); }));
    $$(".wsh [data-go]").forEach((b) => (b.onclick = () => { closeSheet(); navigate(b.dataset.go); }));
  }
  function openWord(id) {
    const w = BY_ID[id];
    // Wide screens (desktop): the word opens in the side pane next to the tiles
    if (route[0] === "words" && $("#word-pane") && getComputedStyle($("#word-pane")).display !== "none") {
      $("#word-pane").innerHTML = wordSheetHtml(w); $("#word-pane").dataset.word = id; bindWordSheet(w, () => { drawTiles(); });
      $$(".wtile").forEach((b) => b.classList.toggle("sel", wid(b.dataset.id) === id)); return;
    }
    openSheet(`${wordSheetHtml(w)}<button class="btn block ghost" id="d-close" type="button" style="margin-top:10px">${t("close")}</button>`, () => { if (route[0] === "words" && $("#tiles")) drawTiles(); });
    bindWordSheet(w, () => openWord(id));
    $("#d-close").onclick = closeSheet;
  }

  /* ================= TRAIN ================= */
  const MODES = [
    { id: "flash", ico: "🃏", key: "modeFlash" },
    { id: "quiz", ico: "✅", key: "modeQuiz" },
    { id: "type", ico: "⌨️", key: "modeType" },
    { id: "typer", ico: "⚡", key: "modeTyper" },
    { id: "listen", ico: "👂", key: "modeListen" },
    { id: "match", ico: "🧩", key: "modeMatch" },
    { id: "tones", ico: "🎵", key: "modeTones" },
    { id: "numbers", ico: "🔢", key: "modeNumbers" },
    { id: "say", ico: "🎤", key: "modeSay" },
    { id: "picture", ico: "🖼️", key: "modePicture" },
    { id: "listenPic", ico: "👂", key: "modeListenPic" },
    { id: "choose", ico: "🔤", key: "modeChoose" },
    { id: "trace", ico: "✍️", key: "modeTrace" }
  ];
  // Practice (round 2): grouped by skill, each group with its word in the language and a note; rows show
  // what is waiting (due words, best speed, dialogues done) and NEW for the newest modes
  const SKILLS = [
    { id: "listen", rows: [["train/listen", "modeListen", "listen"], ["train/listenPic", "modeListenPic", "listenPic"], ["train/tones", "modeTones", "tones"], ["sounds/drill", "soundDrill", "soundDrill"]] },
    { id: "speak", rows: [["train/say", "modeSay", "say"], ["dialogues", "dialogues", "dialogues"], ["free", "modeFree", "freePlay", true], ["sounds", "soundChart", "soundChart"]] },
    { id: "read", rows: [["families", "modeFamilies", "families", true], ["train/choose", "modeChoose", "choose"], ["train/picture", "modePicture", "picture"], ["train/flash", "modeFlash", "flash"], ["train/quiz", "modeQuiz", "quiz"], ["train/match", "modeMatch", "match"]] },
    { id: "write", rows: [["train/type", "modeType", "type"], ["train/typer", "modeTyper", "typer"], ["train/numbers", "modeNumbers", "numbers"], ["train/trace", "modeTrace", "trace", true]] }
  ];
  const SKILL_WORD = { zh: [["tīng", "听"], ["shuō", "说"], ["dú", "读"], ["xiě", "写"]], vi: [["Nghe"], ["Nói"], ["Đọc"], ["Viết"]], ja: [["kiku", "聞く"], ["hanasu", "話す"], ["yomu", "読む"], ["kaku", "書く"]], ko: [["deutgi", "듣기"], ["malhagi", "말하기"], ["ilkgi", "읽기"], ["sseugi", "쓰기"]] };
  const PRACTICE_WORD = { zh: ["Liànxí", "练习"], vi: ["Luyện tập"], ja: ["Renshū", "練習"], ko: ["Yeonseup", "연습"] };
  function renderTrain(view) {
    const mode = route[1];
    if (!mode) return renderTrainHome(view);
    const m = MODES.find((x) => x.id === mode);
    if (!m) return renderTrainHome(view);
    setTopbar(t(m.key), "train");
    if (mode === "flash") return setupSession(view, mode, { pool: true, count: [10, 20, 40, 150] });
    if (mode === "quiz") return setupSession(view, mode, { pool: true, count: [10, 20, 40], direction: true });
    if (mode === "type") return setupSession(view, mode, { pool: true, count: [10, 20, 40] });
    if (mode === "listen") return setupSession(view, mode, { pool: true, count: [10, 20, 40] });
    if (mode === "typer") return C.id === "ja" ? renderTrainHome(view) : startTyper(view);
    if (mode === "match") return startMatch(view);
    if (mode === "tones") return C.toneOptions ? startTones(view) : renderTrainHome(view);
    if (mode === "numbers") return startNumbers(view);
    if (mode === "say") return setupSession(view, mode, { pool: true, count: [5, 10, 20] });
    if (mode === "choose") return setupSession(view, mode, { pool: true, count: [10, 20, 40] });
    if (mode === "trace") return C.id === "zh" ? startTrace(view) : renderTrainHome(view);
    if (mode === "picture" || mode === "listenPic") return hasPics() ? setupSession(view, mode, { pool: true, count: [10, 20, 40], pics: true }) : renderTrainHome(view);
  }
  function renderTrainHome(view) {
    setTopbar(t("train"), null);
    document.body.classList.add("home");
    const due = dueWords().length, dl = courseDialogues();
    const nv = noVoice();
    const hidden = (r) => (nv && ["train/listen", "train/listenPic", "train/tones", "sounds/drill"].includes(r)) || ((r === "train/picture" || r === "train/listenPic") && !hasPics()) || (r === "train/tones" && !C.toneOptions) || (r === "train/typer" && C.id === "ja") || ((r === "dialogues" || r === "free") && !dl.length) || (r === "train/trace" && C.id !== "zh") || (r === "families" && !families().length);
    const meta = (r) => r === "train/listen" || r === "train/flash" ? (due ? t("nDue", due) : "")
      : r === "train/typer" && S.typer && S.typer[C.id] ? t("bestWpm", S.typer[C.id])
      : r === "dialogues" ? `${dl.filter((d) => dlgDone(d.id)).length} / ${dl.length}` : "";
    const word = (k) => { const x = SKILL_WORD[C.id][k]; return C.id === "zh" ? (pyFirst() ? `<span class="py-face">${pyHtml(x[0])}</span>` : `<span class="hanzi">${x[1]}</span>`) : `<span class="${x[1] ? "hanzi" : ""}">${esc(x[1] || x[0])}</span>`; };
    const pw = PRACTICE_WORD[C.id];
    view.innerHTML = `
      <div class="page-head"><span class="eyebrow">${t("practiceEyebrow")}</span>
        <div class="row"><span class="ph-title grow">${C.id === "zh" ? `${pyHtml(pw[0])} <span class="hanzi ph-sub">${pw[1]}</span>` : `<span class="${pw[1] ? "hanzi" : ""}">${esc(pw[1] || pw[0])}</span>`}</span>
        ${C.id === "vi" ? `<button class="accent-btn" id="accent" type="button">${t("accentLabel")} · ${t(S.settings.viAccent === "s" ? "accentS" : "accentN")}</button>` : ""}</div></div>
      ${nv ? `<div class="state-card warn"><b>${t("noVoiceTitle", t("langName"))}</b><p>${t("noVoiceText")}</p><button class="btn primary" data-go="more/voice" type="button">${t("getVoice")}</button><p class="small">${t("listenHidden")}</p></div>` : ""}
      ${SKILLS.map((sk, k) => !sk.rows.some(([r]) => !hidden(r)) ? "" : `
        <section class="skill2">
          <div class="sk2-head"><span class="sk2-name">${t("skill_" + sk.id)} ${word(k)}</span><span class="sk2-note">${esc(t("skillNote_" + sk.id))}</span></div>
          ${sk.rows.filter(([r]) => !hidden(r)).map(([r, key, sub, isNew]) => `<button class="sk2-row" data-go="${r}" type="button"><span class="grow"><span class="sk2-t">${t(key)}${isNew ? `<span class="new-badge">${t("newBadge")}</span>` : ""}</span><span class="sk2-s">${esc(t("sub_" + sub))}</span></span><span class="sk2-m">${meta(r)}</span>${icon("chev")}</button>`).join("")}
        </section>`).join("")}`;
    $$("[data-go]").forEach((b) => (b.onclick = () => {
      if (b.dataset.go === "free") { const d = dl[Math.floor(Math.random() * dl.length)]; return navigate("lessons/d/" + d.id + "/turn"); }
      navigate(b.dataset.go);
    }));
    if ($("#accent")) $("#accent").onclick = () => { S.settings.viAccent = S.settings.viAccent === "s" ? "n" : "s"; save(); pickVoice(); render(); };
  }

  /* --- Session setup (round 2): chip rows always open, How many or By time, direction as a segmented control,
   * and a sticky summary bar with the number of matching words and Start --- */
  const setupPrefs = { pools: ["due"], count: 10, mins: 0, cat: "all", direction: "hzTr" };
  const MODE_SECS = { flash: 10, quiz: 8, listen: 8, picture: 8, listenPic: 8, type: 15, say: 20, choose: 12 };
  function poolWords(pool, cat) {
    const pools = Array.isArray(pool) ? pool : [pool];
    const one = (p) => {
      let list = WORDS.filter((w) => inCat(w, cat));
      if (p === "due") {
        const due = list.filter((w) => isDue(w.id)); const fresh = list.filter((w) => status(w.id) === "new");
        list = due.concat(shuffle(fresh));
      } else if (p === "lessons") list = lessonWords().filter((w) => inCat(w, cat));
      else if (p === "favs") list = list.filter((w) => S.favs.includes(w.id));
      else if (p === "learning") list = list.filter((w) => status(w.id) === "learning");
      return list;
    };
    const seen = new Set(), out = [];
    pools.forEach((p) => one(p).forEach((w) => { if (!seen.has(w.id)) { seen.add(w.id); out.push(w); } }));
    return out.length || !pools.includes("due") ? out : WORDS.filter((w) => inCat(w, cat));
  }
  function setupSession(view, mode, cfg) {
    const m = MODES.find((x) => x.id === mode), skill = SKILLS.find((sk) => sk.rows.some(([r]) => r === "train/" + mode));
    const due = WORDS.filter((w) => isDue(w.id)).length;
    const pools = [["due", t("dueWords") + (due ? " · " + due : "")]].concat(lessonWords().length ? [["lessons", t("lessonsPool")]] : [], [["all", t("allWords")], ["learning", t("learningOnly")], ["favs", t("favsOnly")]]);
    setupPrefs.pools = setupPrefs.pools.filter((p) => pools.some(([k]) => k === p)); if (!setupPrefs.pools.length) setupPrefs.pools = ["due"];
    // Pinyin first: the character directions make no sense yet
    const dirs = [["hzTr", t("dirHzTr")], ["trHz", t("dirTrHz")]].concat(pyFirst() ? [] : [["hzPy", t("dirHzPy")], ["pyHz", t("dirPyHz")]]);
    if (!dirs.some(([k]) => k === setupPrefs.direction)) setupPrefs.direction = "hzTr";
    if (!cfg.count.includes(setupPrefs.count) && setupPrefs.count !== 9999) setupPrefs.count = cfg.count[1] || cfg.count[0];
    const secs = MODE_SECS[mode] || 10;
    const topics = themes().length ? themes().map((x) => [x.id, L(x.name)]) : Object.keys(CATS).filter((c) => WORDS.some((w) => w.cat === c)).map((c) => [c, catName(c)]);
    let showAll = setupPrefs.cat !== "all" && topics.findIndex(([k]) => k === setupPrefs.cat) >= 6;
    const poolOf = () => poolWords(setupPrefs.pools.includes("all") ? ["all"] : setupPrefs.pools, setupPrefs.cat).filter((w) => !cfg.pics || pic(w));
    document.body.classList.add("home"); // the setup has its own header
    function draw() {
      const n = poolOf().length, per = setupPrefs.mins ? Math.max(1, Math.round((setupPrefs.mins * 60) / secs)) : setupPrefs.count;
      const take = Math.min(n, per), mins = Math.max(1, Math.round((take * secs) / 60));
      const tp = showAll ? topics : topics.slice(0, 6);
      view.innerHTML = `
        <div class="setup2">
          <div class="setup-head"><button class="fh-close" id="su-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t(m.key)}</div><div class="fh-sub">${skill ? t("skill_" + skill.id) + " · " : ""}${t("setUpRound")}</div></div></div>
          <div class="su-sec"><div class="su-label">${t("levels")}</div>${levelChips("s-lvl-chips")}</div>
          <div class="su-sec"><div class="su-label">${t("whichWords")}</div><div class="chips" id="pool-chips">${pools.map(([k, l]) => `<button class="chip ${setupPrefs.pools.includes(k) ? "active" : ""}" data-pool="${k}" type="button" aria-pressed="${setupPrefs.pools.includes(k)}">${l}</button>`).join("")}</div></div>
          <div class="su-sec"><div class="su-label">${t(themes().length ? "topics" : "category")}</div><div class="chips" id="scat-chips"><button class="chip ${setupPrefs.cat === "all" ? "active" : ""}" data-cat="all" type="button">${t("all")}</button>${tp.map(([k, l]) => `<button class="chip ${setupPrefs.cat === k ? "active" : ""}" data-cat="${k}" type="button">${esc(l)}</button>`).join("")}${!showAll && topics.length > 6 ? `<button class="chip" id="more-topics" type="button">+ ${topics.length - 6}</button>` : ""}</div></div>
          <div class="su-sec"><div class="su-label">${t("howMany")}</div>
            <div class="seg" id="count-seg">${cfg.count.filter((c) => c < 150).map((c) => `<button class="${!setupPrefs.mins && setupPrefs.count === c ? "on" : ""}" data-count="${c}" type="button">${c}</button>`).join("")}<button class="${!setupPrefs.mins && setupPrefs.count === 9999 ? "on" : ""}" data-count="9999" type="button">${t("allN", n)}</button></div>
            <div class="by-time">${t("orByTime")} <span class="new-badge">${t("newBadge")}</span> · ${[5, 10, 15].map((x) => `<button class="link-btn ${setupPrefs.mins === x ? "on" : ""}" data-mins="${x}" type="button">${x}</button>`).join(" · ")} ${t("minShort")}</div></div>
          ${cfg.direction ? `<div class="su-sec"><div class="su-label">${t("direction")}</div><div class="seg" id="dir-seg">${dirs.map(([k, l]) => `<button class="${setupPrefs.direction === k ? "on" : ""}" data-dir="${k}" type="button">${l}</button>`).join("")}</div></div>` : ""}
        </div>
        <div class="su-bar"><div class="grow"><b>${t("wordsMatch", n)}</b><span>${t("perRound", take, mins)}</span></div><button class="btn primary" id="start" type="button" ${n < (mode === "flash" || mode === "type" || mode === "say" ? 1 : 4) ? "disabled" : ""}>${t("start")}</button></div>`;
      $("#su-back").onclick = () => navigate("train");
      $$("#pool-chips .chip").forEach((b) => (b.onclick = () => {
        const k = b.dataset.pool, cur = setupPrefs.pools;
        setupPrefs.pools = k === "all" ? ["all"] : cur.includes(k) ? (cur.length > 1 ? cur.filter((x) => x !== k) : cur) : cur.filter((x) => x !== "all").concat(k);
        draw();
      }));
      $$("#scat-chips [data-cat]").forEach((b) => (b.onclick = () => { setupPrefs.cat = b.dataset.cat; draw(); }));
      if ($("#more-topics")) $("#more-topics").onclick = () => { showAll = true; draw(); };
      $$("#count-seg [data-count]").forEach((b) => (b.onclick = () => { setupPrefs.count = +b.dataset.count; setupPrefs.mins = 0; draw(); }));
      $$("[data-mins]").forEach((b) => (b.onclick = () => { setupPrefs.mins = setupPrefs.mins === +b.dataset.mins ? 0 : +b.dataset.mins; draw(); }));
      $$("#dir-seg [data-dir]").forEach((b) => (b.onclick = () => { setupPrefs.direction = b.dataset.dir; draw(); }));
      bindLevelChips("s-lvl-chips", draw);
      $("#start").onclick = () => start(take);
    }
    function start(take) {
      let list = poolOf();
      // Japanese and Korean: words that have a minimal pair come first in Choose the word
      if (mode === "choose" && (C.id === "ja" || C.id === "ko")) { const p = list.filter((w) => minimalPairs(w).length); list = shuffle(p).concat(list.filter((w) => !p.includes(w))); }
      list = setupPrefs.pools.includes("due") && setupPrefs.pools.length === 1 || mode === "choose" ? list.slice(0, take) : sample(list, take);
      run(list);
    }
    function run(list) {
      runWhy = {}; runMarks = []; runT0 = Date.now(); runMode = { mode, again: run };
      if (mode === "flash") runFlash(view, list);
      else if (mode === "quiz") runQuiz(view, list, setupPrefs.direction);
      else if (mode === "type") runType(view, list);
      else if (mode === "listen") runQuiz(view, list, "listen");
      else if (mode === "say") runSay(view, list);
      else if (mode === "picture") runQuiz(view, list, "picWord");
      else if (mode === "listenPic") runQuiz(view, list, "listenPic");
      else if (mode === "choose") runChoose(view, list);
    }
    draw();
  }

  // The current practice round (outside the daily session): answers in order, start time, how to run it again
  let runMarks = [], runT0 = 0, runMode = null;
  function sessionHead(i, n, extra) {
    if (flow) return flowHead(i, n); // inside the daily session: its own header
    const close = `<button class="fh-close" id="ex-close" type="button" aria-label="${t("close")}">${icon("close")}</button>`;
    // One segment per question when they fit, as on the style canvas
    if (n <= 24) return `<div class="session-head">${close}<div class="segments" role="progressbar" aria-valuenow="${i}" aria-valuemax="${n}">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? "on" : ""}"></i>`).join("")}</div><span class="count">${i}/${n}${extra ? " · " + extra : ""}</span></div>`;
    return `<div class="session-head">${close}<div class="progress-bar"><span style="width:${Math.round((i / n) * 100)}%"></span></div><span class="count">${i}/${n}${extra ? " · " + extra : ""}</span></div>`;
  }
  document.addEventListener("click", (e) => { if (e.target.closest("#ex-close")) navigate(route[0] === "train" ? "train" : route[0]); });
  // Result (round 2): score, one cell per answer (a wrong one is an outlined ✕, never colour alone), the mistakes
  // with what you picked, Retry mistakes · Done
  function showResult(view, { correct, total, mistakes, mode, extra, onAgain }) {
    if (flow) return flowStepDone(view, { correct, total, mistakes });
    S.stats.sessions += 1; save();
    const pct = total ? Math.round((correct / total) * 100) : 100;
    const m = runMode && MODES.find((x) => x.id === runMode.mode);
    const marks = runMarks.length ? runMarks : Array.from({ length: total }, (_, k) => k < correct);
    const secs = runT0 ? Math.round((Date.now() - runT0) / 1000) : 0;
    const again = runMode ? runMode.again : null;
    view.innerHTML = `
      <div class="res2">
        <span class="eyebrow">${m ? esc(t(m.key)) + " · " : ""}${t("result")}</span>
        <div class="res2-score"><b>${correct}</b><span>/${total}</span></div>
        <div class="res2-sub">${pct}%${secs ? ` · ${fmtTime(secs * 1000)} ${t("minShort")}` : ""}${extra ? " · " + extra : ""}</div>
        ${marks.length && marks.length <= 60 ? `<div class="res2-cells" role="img" aria-label="${esc(t("resultCells", correct, total - correct))}">${marks.map((ok) => `<i class="${ok ? "ok" : "bad"}">${ok ? "" : "✕"}</i>`).join("")}</div>` : ""}
        ${mistakes.length ? `<div class="res2-mhead"><b>${t("mistakesN", mistakes.length)}</b><span>${t("addedToReviews")}</span></div>
          <div class="res2-list">${mistakes.map((w) => `<div class="res2-row"><span class="x">✕</span><div class="grow"><div class="r2-word">${C.id === "zh" ? `${pyHtml(w.py)} <span class="hanzi">${esc(w.hz)}</span>` : C.id === "vi" ? viHtml(w.hz) : `<span class="hanzi">${esc(w.hz)}</span> <small>${esc(w.py)}</small>`}</div><div class="r2-sub">${esc(tr(w))}${runWhy[w.id] ? " · " + esc(runWhy[w.id]) : ""}</div></div><button class="sq-btn" data-speak="${esc(w.hz)}" type="button" aria-label="${t("play")}">${icon("speaker")}</button></div>`).join("")}</div>` : `<div class="res2-perfect">${t("perfect")}</div>`}
      </div>
      <div class="stack res2-btns">
        ${mistakes.length && again ? `<button class="btn block fd-again" id="r-retry" type="button">${t("retryMistakes")}</button>` : `<button class="btn block" id="r-again" type="button">${t("playAgain")}</button>`}
        <button class="btn primary block" id="r-back" type="button">${t("done")}</button>
      </div>`;
    if ($("#r-retry")) $("#r-retry").onclick = () => again(shuffle(mistakes.slice()));
    if ($("#r-again")) $("#r-again").onclick = onAgain;
    $("#r-back").onclick = () => navigate("train");
    $$("[data-speak]").forEach((b) => (b.onclick = () => speak(b.dataset.speak)));
    checkGoal();
  }
  function checkGoal() {
    const n = dayCount(todayKey());
    if (n >= S.settings.dailyGoal && n - 1 < S.settings.dailyGoal) toast(t("goalReached"));
  }
  function bindKeys(handler) {
    const fn = (e) => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.key !== "Enter") return; handler(e); };
    document.addEventListener("keydown", fn);
    cleanup = () => document.removeEventListener("keydown", fn);
  }

  /* --- Flashcards (style canvas): the word large (in its 田字格 for Chinese), its sound with the tone, the meaning,
   * an example; Vietnamese starts from the sound and shows the tone family. Again · Hard · Good · Easy. --- */
  function runFlash(view, list) {
    let i = 0, flipped = false; const mistakes = [];
    const queue = list.slice();
    const listenFirst = C.id === "vi";
    const picFirst = (w) => C.id === "ko" && !!pic(w); // Korean (round 2): picture → word
    const koBlocks = (hz) => Array.from(hz).map((ch) => { const j = koJamo(ch); return j ? `<span class="jt"><i class="kb-i">${j.i}</i><i class="kb-v">${j.v}</i>${j.f ? `<i class="kb-f">${j.f}</i>` : ""}</span>` : ""; }).join("");
    const hl = (ex, hz) => { const k = ex.toLowerCase().indexOf(hz.toLowerCase()); return k < 0 ? esc(ex) : `${esc(ex.slice(0, k))}<b class="hl">${esc(ex.slice(k, k + hz.length))}</b>${esc(ex.slice(k + hz.length))}`; };
    const toneFamily = (w) => { const key = stripVi(w.hz), seen = new Set(); return ALL_WORDS.filter((x) => stripVi(x.hz) === key && !seen.has(x.hz) && seen.add(x.hz)).slice(0, 5); };
    function draw() {
      if (i >= queue.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct: list.length - mistakes.length, total: list.length, mistakes, onAgain: () => navigate("train/flash") }); }
      const w = queue[i], n = C.id === "zh" ? (toneSeq(w.py)[0] || 5) : firstToneVi(w.hz.split(/\s+/)[0]);
      const len = Array.from(w.hz).length;
      const front = listenFirst ? `<button class="fc-listen" id="fc-play" type="button" aria-label="${t("play")}">🔊</button><div class="fc-hint">${t("listenHint")}</div>`
        : C.id === "zh" && !pyFirst() ? gridHtml(w.hz, len > 2 ? "md" : len === 2 ? "" : "lg")
        : picFirst(w) ? `<div class="fc-pic big" role="img" aria-label="${esc(t("picture"))}">${pic(w)}</div>`
        : pyFirst() ? `<div class="fc-py big">${pyHtml(w.py)}</div>` : `<div class="fc-hz ${isLong(w.hz) ? "long" : ""}">${C.id === "vi" ? viHtml(w.hz) : esc(w.hz)}</div>`;
      const fam = listenFirst ? toneFamily(w) : [];
      const back = `
        ${C.id === "zh" ? gridHtml(w.hz, len > 2 ? "sm" : "md") : C.id === "vi" ? `<div class="fc-tone tc-${VI_TONE_CLASS[n]}">${toneSvg(n)} ${VI_TONE_NAMES[n - 1]}</div><div class="fc-hz">${viHtml(w.hz)}</div>`
          : C.id === "ja" ? `<div class="fc-ruby hanzi">${w.kana && w.kana !== w.hz ? `<ruby>${esc(w.hz)}<rt>${esc(w.kana)}</rt></ruby>` : esc(w.hz)}</div><div class="fc-romaji">${esc(w.romaji || w.py)}</div>`
          : C.id === "ko" ? `${picFirst(w) ? `<div class="fc-pic sm" aria-hidden="true">${pic(w)}</div>` : ""}<div class="fc-hz hanzi">${esc(w.hz)}</div><div class="fc-romaji"><b>${esc(w.py)}</b>${w.pron ? ` · [${esc(w.pron)}]` : ""}</div><div class="say-like-ko center">${koBlocks(w.hz)}</div>` : heroHtml(w)}
        <div class="fc-sound">${C.id === "zh" ? `<span class="fc-py">${pyHtml(w.py)}</span>${n >= 1 && n <= 4 ? `<span class="tone-badge tn${n}">${t("toneN", n)}</span>` : ""}` : ""}<button class="speak-btn sm sq" id="fc-speak" type="button" aria-label="${t("play")}">🔊</button></div>
        <div class="fc-tr">${esc(tr(w))}</div>
        ${C.id === "ja" && w.kana ? `<div class="kana-tiles" aria-hidden="true">${Array.from(w.kana).map((ch) => `<i>${esc(ch)}</i>`).join("")}</div>` : ""}
        ${C.id === "ko" && sayTip(w) && sayTip(w).sound ? `<div class="fc-tip">${esc(sayTip(w).sound)}</div>` : ""}
        ${pic(w) && !picFirst(w) ? `<div class="fc-pic" aria-hidden="true">${pic(w)}</div>` : ""}
        ${fam.length > 1 ? `<div class="tone-family">${fam.map((x) => `<button class="tf ${x.id === w.id ? "on" : ""}" data-fam="${esc(x.hz)}" data-tr="${esc(tr(x))}" type="button">${viHtml(x.hz)}</button>`).join("")}</div><div class="fc-hint">${t("toneFamily")}</div>` : ""}
        ${w.ex ? `<div class="fc-ex"><div class="grow"><div class="hanzi">${hl(w.ex, w.hz)}</div>${w.exPy && C.id !== "vi" ? `<div class="small">${C.id === "zh" ? pyHtml(w.exPy) : esc(w.exPy)}</div>` : ""}<div class="small muted">${esc(exTr(w))}</div></div><button class="speak-btn sm" id="fc-ex" type="button" aria-label="${t("play")}">🔊</button></div>` : ""}`;
      view.innerHTML = `
        ${sessionHead(i, queue.length)}
        <div class="flashcard canvas-card" id="fc">
          <div class="fc-top"><span>${t(listenFirst ? "cardListen" : picFirst(w) ? "cardPicKo" : C.id === "ja" && w.kana && w.kana !== w.hz ? "cardKanji" : "cardFront")}</span><span>${flipped ? "2 / 2" : "1 / 2"}</span></div>
          ${flipped ? back : `${front}<div class="fc-hint">${t("tapToFlip")}</div>`}
        </div>
        ${flipped ? `
          <div class="rate-grid canvas">
            <button class="btn r-again" data-q="0" type="button">${t("rateAgain")}<small>&lt; 10 min</small></button>
            <button class="btn" data-q="1" type="button">${t("rateHard")}<small>${nextInterval(w.id, 1)}</small></button>
            <button class="btn r-good" data-q="2" type="button">${t("rateGood")}<small>${nextInterval(w.id, 2)}</small></button>
            <button class="btn" data-q="3" type="button">${t("rateEasy")}<small>${nextInterval(w.id, 3)}</small></button>
          </div>` : `<button class="btn primary block" id="fc-flip" type="button" style="margin-top:14px">${t("showAnswer")}</button>`}
        <div class="kbd-hint">${t("keys")}</div>`;
      const flip = () => { flipped = true; draw(); if (S.settings.autoSpeak && !listenFirst) speak(w.hz); };
      if (!flipped) {
        $("#fc").onclick = (e) => { if (e.target.closest("#fc-play")) speak(w.hz); else flip(); };
        $("#fc-flip").onclick = flip;
      } else {
        $("#fc-speak").onclick = (e) => { e.stopPropagation(); speak(w.hz); };
        if ($("#fc-ex")) $("#fc-ex").onclick = (e) => { e.stopPropagation(); speak(w.ex); };
        $$("[data-fam]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); speak(b.dataset.fam); toast(`${b.dataset.fam} · ${b.dataset.tr}`); }));
        $$("[data-q]").forEach((b) => (b.onclick = () => rate(+b.dataset.q)));
      }
      if (!flipped && listenFirst) speak(w.hz);
    }
    function rate(q) {
      const w = queue[i];
      grade(w.id, q); recordAnswer(q >= 2);
      if (q < 2 && !mistakes.includes(w)) { mistakes.push(w); noteMiss(w, q === 0 ? t("whyAgain") : t("rateHard")); }
      if (q === 0) queue.push(w); // see it again at the end of this session
      i++; flipped = false; draw();
    }
    bindKeys((e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!flipped) { flipped = true; draw(); if (S.settings.autoSpeak && !listenFirst) speak(queue[i].hz); } else rate(2); }
      else if (flipped && /^[1-4]$/.test(e.key)) rate(+e.key - 1);
    });
    draw();
  }
  function nextInterval(id, q) {
    const c = card(id) || { ef: 2.5, interval: 0, reps: 0 };
    let iv;
    if (c.reps === 0) iv = q === 1 ? 0.5 : q === 2 ? 1 : 3;
    else if (c.reps === 1) iv = q === 1 ? 1 : q === 2 ? 3 : 7;
    else iv = Math.round(c.interval * (q === 1 ? 1.2 : q === 2 ? c.ef : c.ef * 1.4));
    if (iv < 1) return "12 h";
    if (iv >= 30) return Math.round(iv / 30) + " mo";
    return Math.round(iv) + " d";
  }

  /* --- Multiple choice / listening quiz ---
   * Directions: hzTr, trHz, hzPy, pyHz, listen, picWord (see a picture, pick the word), listenPic (hear, pick the picture).
   * Where a word has a picture, its meaning is asked as a picture instead of a translation. */
  function runQuiz(view, list, direction) {
    let i = 0, correct = 0, answered = false; const mistakes = [];
    const optCount = 4;
    const listens = direction === "listen" || direction === "listenPic";
    const usesPics = (w) => direction === "picWord" || direction === "listenPic" || ((direction === "hzTr" || direction === "listen") && !!pic(w));
    const picsOnly = (w) => usesPics(w) && (direction === "hzTr" || direction === "listenPic");
    function optionsFor(w) {
      // Options must look different: no repeated meaning, and with pinyin shown no repeated pinyin (他/她 are both tā)
      const shown = (x) => (direction === "hzPy" || pyFirst() && direction !== "hzTr" ? x.py : direction === "hzTr" ? tr(x) : x.hz);
      const seen = new Set([shown(w)]); const distractors = [];
      let pool = WORDS.length >= 8 ? WORDS : ALL_WORDS;
      if (usesPics(w)) { const p = (l) => l.filter((x) => pic(x)); pool = p(WORDS).length >= 8 ? p(WORDS) : p(ALL_WORDS); }
      for (const x of shuffle(pool)) {
        if (distractors.length === optCount - 1) break;
        if (x.id === w.id || seen.has(shown(x)) || (direction !== "hzPy" && direction !== "pyHz" && direction !== "listen" && tr(x) === tr(w))) continue;
        seen.add(shown(x)); distractors.push(x);
      }
      return shuffle([w].concat(distractors));
    }
    function draw(autoPlay) {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => navigate("train/" + ({ listen: "listen", picWord: "picture", listenPic: "listenPic" }[direction] || "quiz")) }); }
      const w = list[i]; const opts = optionsFor(w); answered = false;
      let prompt, optHtml;
      const label = (x) => picsOnly(w) ? `<span class="pic-opt" aria-label="${esc(tr(x))}">${pic(x)}</span>`
        : direction === "listen" && usesPics(w) ? `<span class="pic-sm" aria-hidden="true">${pic(x)}</span> ${face(x)}`
        : direction === "hzTr" ? esc(tr(x)) : direction === "hzPy" ? x.py : face(x);
      const optClass = !pyFirst() && (direction === "trHz" || direction === "pyHz" || direction === "listen") ? "hanzi" : "";
      if (direction === "hzTr" || direction === "hzPy") prompt = `${pyFirst() ? `<div class="q-text py-face">${pyHtml(w.py)}</div>` : `<div class="q-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div>`}<button class="speak-btn sm" id="q-speak" type="button">🔊</button>`;
      else if (direction === "trHz") prompt = `<div class="q-text">${esc(tr(w))}</div>${tr2(w) ? `<div class="q-sub">${esc(tr2(w))}</div>` : ""}`;
      else if (direction === "pyHz") prompt = `<div class="q-text">${w.py}</div>`;
      else if (direction === "picWord") prompt = `<div class="pic huge" aria-label="${esc(tr(w))}">${pic(w)}</div><div class="q-sub">${t("pictureQ")}</div>`;
      else if (direction === "listenPic") prompt = `<div class="q-sub">${t("hearPicQ")}</div><button class="btn primary" id="q-play" type="button" style="margin-top:8px">▶︎ ${t("play")}</button><div class="q-sub small">${t("listenHint")}</div>`;
      else prompt = `<div class="q-sub">${t("listenPrompt")}</div><button class="btn primary" id="q-play" type="button" style="margin-top:8px">▶︎ ${t("play")}</button><div class="q-sub small">${t("listenHint")}</div>`;
      optHtml = opts.map((x, k) => `<button class="option ${picsOnly(w) ? "" : optClass}" data-id="${x.id}" type="button"><span class="opt-key">${k + 1}</span><span>${label(x)}</span></button>`).join("");
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}<div class="quiz-q">${prompt}</div><div class="options ${picsOnly(w) ? "pics" : ""}">${optHtml}</div><div id="fb"></div><div class="kbd-hint">${t("keys")}</div>`;
      if ($("#q-speak")) $("#q-speak").onclick = () => speak(w.hz);
      if ($("#q-play")) { $("#q-play").onclick = () => speak(w.hz); if (autoPlay) speak(w.hz); }
      $$(".option").forEach((b) => (b.onclick = () => answer(wid(b.dataset.id))));
    }
    function answer(id) {
      if (answered) return; answered = true;
      const w = list[i]; const ok = id === w.id;
      $$(".option").forEach((b) => { b.disabled = true; if (wid(b.dataset.id) === w.id) b.classList.add("correct"); else if (wid(b.dataset.id) === id) b.classList.add("wrong"); });
      grade(w.id, ok ? 2 : 0); recordAnswer(ok);
      if (ok) correct++; else { mistakes.push(w); const x = BY_ID[id]; if (x) noteMiss(w, t("whyPicked", direction === "hzTr" || direction === "picWord" || direction === "listenPic" ? tr(x) : `${tr(x)} (${C.id === "zh" || C.id === "ja" ? x.py : x.hz})`)); }
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow"><span class="hanzi">${w.hz}</span> ${w.py} · ${esc(tr(w))}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="q-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speak(w.hz);
      $("#q-next").onclick = next;
      if (S.settings.autoSpeak && !listens) speak(w.hz);
    }
    function next() { i++; draw(true); }
    bindKeys((e) => {
      if (/^[1-4]$/.test(e.key) && !answered) { const b = $$(".option")[+e.key - 1]; if (b) b.click(); }
      else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); next(); }
      else if (e.key === " " && listens) { e.preventDefault(); speak(list[i].hz); }
    });
    draw(false);
  }

  /* --- Choose the right word (style canvas): a sentence with a gap and four words that sound alike
   * (茶 chá / 查 chá / 差 chà / 叉 chā, trà / tra / trả / trại). Without an example sentence the meaning is the question. --- */
  const soundKey = (w) => (C.id === "zh" ? stripTones(w.py) : C.id === "vi" ? stripVi(w.hz).replace(/ /g, "") : C.id === "ja" ? stripJa(w.romaji || w.py) : w.py.toLowerCase().replace(/[\s'’\-.,!?]/g, ""));
  function editDistance(a, b) {
    a = Array.from(a); b = Array.from(b);
    let row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0]; row[0] = i;
      for (let j = 1; j <= b.length; j++) { const cur = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    }
    return row[b.length];
  }
  // The same rules as the iPhone app (CourseWords.soundAlikes): one sound apart first, else about half, then any word
  // Minimal pairs: Japanese words that differ only in a long vowel or a small っ (おばあさん / おばさん),
  // Korean words that differ only in one final consonant (잔 / 장 / 자 / 잠)
  const jaShort = (kana) => { const k = kataToHira(kana || "").replace(/[ーっ]/g, ""); let out = "", prev = ""; for (const ch of k) { const v = (toRomaji(ch).match(/[aiueo]$/) || [""])[0]; const same = (ch === "あ" && prev === "a") || (ch === "い" && (prev === "i" || prev === "e")) || (ch === "う" && (prev === "u" || prev === "o")) || (ch === "え" && prev === "e") || (ch === "お" && prev === "o"); if (!same) out += ch; prev = v || prev; } return out; };
  const koFinalOnly = (a, b) => { const x = Array.from(a), y = Array.from(b); if (x.length !== y.length || a === b) return false; let diff = 0; for (let k = 0; k < x.length; k++) { if (x[k] === y[k]) continue; const p = koJamo(x[k]), q = koJamo(y[k]); if (!p || !q || p.i !== q.i || p.v !== q.v) return false; diff++; } return diff === 1; };
  function minimalPairs(w) {
    if (C.id === "ja") { const k = jaShort(w.kana); return k.length > 1 ? [...new Set(WORDS.concat(ALL_WORDS.filter((x) => x.lvl <= 2)))].filter((x) => x.id !== w.id && x.kana !== w.kana && jaShort(x.kana) === k) : []; }
    if (C.id === "ko") return ALL_WORDS.filter((x) => x.id !== w.id && koFinalOnly(x.hz, w.hz));
    return [];
  }
  const pairKind = (w, x) => (x.id === w.id ? "" : C.id === "ja" && jaShort(w.kana) === jaShort(x.kana) ? "long" : C.id === "ko" && koFinalOnly(w.hz, x.hz) ? "final" : "");
  function soundAlikes(w, count = 3) {
    const key = soundKey(w), m = tr(w);
    const pairs = [], seen0 = new Set([w.hz, m]);
    for (const x of shuffle(minimalPairs(w))) { if (pairs.length >= count) break; if (seen0.has(x.hz) || seen0.has(tr(x))) continue; pairs.push(x); seen0.add(x.hz); seen0.add(tr(x)); }
    if (pairs.length >= count) return pairs;
    let limit = Math.max(1, Math.floor(key.length / 3)); const wide = Math.max(2, Math.floor((key.length + 1) / 2));
    let scored = [];
    const pool = (C.id === "ja" || C.id === "ko") && WORDS.length > 200 ? WORDS : ALL_WORDS; // Japanese has 8,000 words: stay within the levels you study
    for (const x of pool) {
      if (x.id === w.id || x.hz === w.hz || tr(x) === m || pairs.includes(x)) continue;
      const k = soundKey(x); if (Math.abs(k.length - key.length) > wide) continue;
      const d = editDistance(k, key);
      if (d <= wide) scored.push([x, d * 10 + Math.abs(Array.from(x.hz).length - Array.from(w.hz).length)]);
    }
    if (scored.filter((e) => e[1] < (limit + 1) * 10).length < count) limit = wide;
    scored = shuffle(scored.filter((e) => e[1] < (limit + 1) * 10)).sort((a, b) => a[1] - b[1]);
    const out = pairs.slice(), seen = new Set([w.hz, m].concat(pairs.flatMap((x) => [x.hz, tr(x)])));
    for (const [x] of scored) { if (out.length >= count) break; if (seen.has(x.hz) || seen.has(tr(x))) continue; out.push(x); seen.add(x.hz); seen.add(tr(x)); }
    for (const x of shuffle(WORDS)) { if (out.length >= count) break; if (x.id === w.id || seen.has(x.hz) || seen.has(tr(x))) continue; out.push(x); seen.add(x.hz); seen.add(tr(x)); }
    return out;
  }
  // Korean options: the letters of the syllable that changes, the final one red (dashed when there is none)
  function koFinalTiles(hz, target) {
    const x = Array.from(hz), y = Array.from(target); let k = x.findIndex((c, j) => c !== y[j]); if (k < 0) k = x.length - 1;
    const j = koJamo(x[k]); if (!j) return "";
    return `<span class="ch-jamo"><i class="kb-i">${j.i}</i><i class="kb-v">${j.v}</i><i class="${j.f ? "kb-f" : "kb-none"}">${j.f || ""}</i></span>`;
  }
  function runChoose(view, list) {
    let i = 0, correct = 0, answered = false; const mistakes = [];
    const split = (s, part) => { if (!s || !part) return null; const k = s.toLowerCase().indexOf(part.toLowerCase()); return k < 0 ? null : [s.slice(0, k), s.slice(k + part.length)]; };
    const gapOf = (w) => {
      const sentence = split(w.ex, w.hz);
      const main = (tr(w).split(/[,;/(]/)[0] || "").trim().replace(/^to /, "");
      return { sentence, reading: sentence && split(w.exPy, w.py), tr: split(exTr(w), main) };
    };
    const cjk = (s) => /[\u2E80-\uFFEF]/.test(s);
    const fill = (parts, filled, word, kind) => {
      const piece = (x) => (kind === "py" ? pyHtml(x) : kind === "vi" ? viHtml(x) : esc(x));
      const mid = filled ? `<u class="gap on">${kind === "py" ? pyHtml(word) : esc(word)}</u>` : `<span class="gap">${kind === "py" || !cjk(word) ? "____" : "＿＿"}</span>`;
      return piece(parts[0]) + mid + piece(parts[1]);
    };
    const sound = (x) => (C.id === "zh" ? (pyFirst() ? `<span class="hanzi">${esc(x.hz)}</span>` : pyHtml(x.py)) : C.id === "vi" ? (() => { const n = firstToneVi(x.hz); return `<span class="tc-${VI_TONE_CLASS[n]}">${VI_TONE_NAMES[n - 1]}</span>`; })() : C.id === "ja" ? esc(x.kana && x.kana !== x.hz ? x.kana : x.romaji || x.py) : esc(x.py));
    function draw() {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => navigate("train/choose") }); }
      const w = list[i], g = gapOf(w), opts = shuffle([w].concat(soundAlikes(w))); answered = false;
      const q = (filled) => g.sentence ? `
          ${g.reading && !pyFirst() && (C.id === "zh" || readingLayer() !== "off" || filled) ? `<div class="ch-reading">${fill(g.reading, filled, w.py, C.id === "zh" ? "py" : "")}</div>` : ""}
          <div class="ch-line"><div class="grow ${pyFirst() ? "ch-py" : "hanzi ch-sent"}">${pyFirst() && g.reading ? fill(g.reading, filled, w.py, "py") : fill(g.sentence, filled, w.hz, C.id === "vi" ? "vi" : "")}</div><button class="speak-btn sm sq" id="ch-play" type="button" aria-label="${t("play")}">🔊</button></div>
          ${exTr(w) && (filled || g.tr) ? `<div class="ch-tr">${filled ? esc(exTr(w)) : esc(g.tr[0]) + "___" + esc(g.tr[1])}</div>` : ""}`
        : `<div class="ch-meaning">${esc(tr(w))}</div>${pic(w) ? `<div class="pic big" aria-hidden="true">${pic(w)}</div>` : ""}`;
      view.innerHTML = `${sessionHead(i, list.length)}
        <div class="ch-head"><div class="caps">${t("chooseTitle")}</div><div class="muted">${opts.some((x) => pairKind(w, x) === "long") ? t("chooseLong") : opts.some((x) => pairKind(w, x) === "final") ? t("chooseFinal") : g.sentence ? t(C.id === "vi" ? "chooseSubTone" : "chooseSub") : t("chooseNoEx")}</div></div>
        <div class="ch-q" id="ch-q">${q(false)}</div>
        <div class="ch-grid">${opts.map((x) => `<button class="ch-opt" data-id="${x.id}" type="button"><span class="ch-word ${C.id === "vi" || pyFirst() ? "py" : "hanzi"}">${pyFirst() ? pyHtml(x.py) : C.id === "vi" ? viHtml(x.hz) : C.id === "ja" && x.kana ? esc(x.kana) : esc(x.hz)}</span>${C.id === "ko" && opts.some((o) => pairKind(w, o) === "final") ? koFinalTiles(x.hz, w.hz) : ""}<span class="ch-sound">${C.id === "ja" ? esc(x.romaji || x.py) + (x.hz !== x.kana ? ` · <span class="hanzi">${esc(x.hz)}</span>` : "") : sound(x)}</span>${g.sentence ? `<span class="ch-tr2">${esc(tr(x))}</span>` : `<span class="ch-tr2" hidden>${esc(tr(x))}</span>`}<i class="ch-mark" aria-hidden="true"></i></button>`).join("")}</div>
        <div id="fb"></div>`;
      const bindPlay = () => { if ($("#ch-play")) $("#ch-play").onclick = () => speak(w.ex || w.hz); };
      bindPlay();
      $$(".ch-opt").forEach((b) => (b.onclick = () => {
        if (answered) return; answered = true;
        const x = BY_ID[wid(b.dataset.id)] || opts.find((o) => String(o.id) === b.dataset.id), ok = x.id === w.id;
        $$(".ch-opt").forEach((o) => { o.disabled = true; o.querySelector(".ch-tr2").hidden = false; const id = wid(o.dataset.id); if (id === w.id) o.classList.add("correct"); else if (id === x.id) o.classList.add("wrong"); });
        $("#ch-q").innerHTML = q(true); bindPlay();
        grade(w.id, ok ? 2 : 0); recordAnswer(ok);
        if (ok) correct++; else mistakes.push(w);
        const other = ok ? opts.find((o) => o.id !== w.id) : x;
        const rd = (o) => (C.id === "vi" ? VI_TONE_NAMES[firstToneVi(o.hz) - 1] : o.py);
        $("#fb").innerHTML = `<div class="ch-panel ${ok ? "ok" : "bad"}"><div class="row"><span class="ch-ico">${ok ? "✓" : "✗"}</span><div class="grow"><b>${(ok ? t("correct") : t("wrong")).replace(/[.!]$/, "")} — <span class="hanzi">${esc(w.hz)}</span> ${esc(rd(w))}, ${esc(tr(w))}</b>${other ? `<div class="muted small">${esc(t("soundsLike", `${other.hz} (${rd(other)})`, tr(other)))}</div>` : ""}</div><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="ch-next" type="button">${t("continue")}</button></div>`;
        $("#fb-speak").onclick = () => speak(w.hz);
        $("#ch-next").onclick = () => { i++; draw(); };
        if (S.settings.autoSpeak) speak(w.hz);
      }));
    }
    bindKeys((e) => {
      if (/^[1-4]$/.test(e.key) && !answered) { const b = $$(".ch-opt")[+e.key - 1]; if (b) b.click(); }
      else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); i++; draw(); }
    });
    draw();
  }

  /* --- Type the reading (style canvas, round 2): Chinese and Vietnamese type the letters, then tap each
   * syllable's tone (4 or 6 tiles; a second tap clears it = neutral tone). Tone numbers and Telex marks work too. --- */
  const VI_COMBINING = ["", "", "̀", "́", "̉", "̃", "̣"];
  function viMark(syl, tone) {
    const base = syl.normalize("NFD").replace(/[̣̀́̃̉]/g, "").normalize("NFC");
    if (tone <= 1) return base;
    const low = base.toLowerCase(), V = "aăâeêioôơuưy";
    let start = 0;
    if (/^qu/.test(low)) start = 2; else if (/^gi[aăâeêioôơuưy]/.test(low)) start = 2;
    const idx = []; for (let k = start; k < low.length; k++) if (V.includes(low[k])) idx.push(k); else if (idx.length) break;
    if (!idx.length) return base;
    const mod = idx.filter((k) => "ăâêôơư".includes(low[k]));
    const ends = idx[idx.length - 1] < low.length - 1;
    const k = mod.length ? mod[mod.length - 1] : ends ? idx[idx.length - 1] : idx.length >= 3 ? idx[1] : idx[0];
    return (base.slice(0, k) + (base[k] + VI_COMBINING[tone]).normalize("NFC") + base.slice(k + 1)).normalize("NFC");
  }
  const tonePick = () => C.id === "zh" || C.id === "vi";
  // The syllables of what was typed, each with its tone (0 = none chosen yet)
  function typedSyllables(v) {
    if (C.id === "vi") return v.trim().split(/\s+/).filter(Boolean).map((x) => ({ text: x, tone: firstToneVi(x) })); // no mark = ngang
    return pyParts(numToMarks(v)).filter((x) => !x.sep).map((x) => ({ text: x.text, tone: toneSeq(x.text)[0] || 0 }));
  }
  const plainSyl = (x) => (C.id === "vi" ? viMark(x, 1) : x.normalize("NFD").replace(/[\u0300\u0301\u0304\u030c]/g, "").normalize("NFC"));
  const markSyl = (x, n) => (C.id === "vi" ? viMark(x, n) : markSyllable(plainSyl(x), n || 5));
  function runType(view, list) {
    let i = 0, correct = 0, answered = false; const mistakes = [];
    function draw() {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => navigate("train/type") }); }
      const w = list[i]; answered = false;
      const pick = tonePick();
      const promptHtml = pick
        ? `<div class="type-prompt">${pic(w) ? `<div class="tp-pic" aria-hidden="true">${pic(w)}</div>` : ""}<div class="grow"><div class="tp-tr">${esc(tr(w))}</div>${C.id === "zh" ? `<div class="tp-hz hanzi">${esc(w.hz)}</div>` : tr2(w) ? `<div class="tp-hz">${esc(tr2(w))}</div>` : ""}</div><button class="sq-btn" id="q-speak" type="button" aria-label="${t("hearIt")}">${icon("speaker")}</button></div>`
        : pyFirst()
        ? `<div class="quiz-q"><div class="q-text">${esc(tr(w))}</div><button class="speak-btn sm" id="q-speak" type="button">🔊</button></div>`
        : C.id === "ja"
        ? `<div class="quiz-q"><div class="q-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div><div class="q-sub">${esc(tr(w))}</div></div>`
        : `<div class="quiz-q"><div class="q-text">${esc(tr(w))}</div>${tr2(w) ? `<div class="q-sub">${esc(tr2(w))}</div>` : ""}</div>`;
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}
        ${promptHtml}
        ${pick ? `<label class="type-label" for="ti">${t(C.id === "zh" ? "typeThePinyin" : "typeTheWord")}</label>` : ""}
        <input class="type-input ${pick ? "line" : ""}" id="ti" type="text" placeholder="${pick ? "" : t("typePlaceholder")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">
        <div class="list-hint ${pick ? "" : "center"}">${t(pick ? (C.id === "vi" ? "typePickHintVi" : "typePickHint") : "typeHint")}</div>
        ${pick ? `<div class="syl-grid" id="syl-grid"></div><div class="list-hint center">${t(C.id === "vi" ? "eachSyllableVi" : "eachSyllable")}</div>` : ""}
        <div id="fb"></div>
        <div class="type-foot" id="t-foot"><button class="btn primary block" id="t-check" type="button">${t("check")}</button><button class="btn ghost block" id="t-skip" type="button">${t("dontKnow")}</button></div>`;
      const input = $("#ti"); input.focus();
      if ($("#q-speak")) { $("#q-speak").onclick = () => { speak(w.hz); input.focus(); }; if (pyFirst() || pick) speak(w.hz); }
      const drawSyl = () => {
        if (!pick) return;
        const syls = typedSyllables(input.value), n = C.id === "zh" ? 4 : 6;
        $("#syl-grid").innerHTML = syls.map((x, k) => `<div class="syl ${x.tone ? "" : "open"}"><b class="${x.tone ? (C.id === "zh" ? "tn" + x.tone : "tc-" + VI_TONE_CLASS[x.tone]) : ""}">${esc(x.text)}</b>
          <div class="tone-tiles n${n}">${Array.from({ length: n }, (_, j) => `<button class="tt ${C.id === "zh" ? "tn" + (j + 1) : "tc-" + VI_TONE_CLASS[j + 1]} ${x.tone === j + 1 ? "on" : ""}" data-syl="${k}" data-tone="${j + 1}" type="button" aria-pressed="${x.tone === j + 1}" aria-label="${esc(toneName(j + 1))}">${toneSvg(j + 1)}</button>`).join("")}</div></div>`).join("");
        $$("[data-syl]").forEach((b) => (b.onclick = () => {
          if (answered) return;
          const cur = typedSyllables(input.value), k = +b.dataset.syl, n2 = +b.dataset.tone;
          cur[k].text = markSyl(cur[k].text, cur[k].tone === n2 && C.id === "zh" ? 5 : n2);
          input.value = cur.map((x) => x.text).join(C.id === "vi" ? " " : "");
          drawSyl();
        }));
      };
      input.addEventListener("input", (e) => { if (C.id === "zh") liveToneMarks(e, input); drawSyl(); });
      drawSyl();
      $("#t-check").onclick = () => check(input.value);
      $("#t-skip").onclick = () => { if (!answered) reveal(false); else next(); };
      input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); if (!answered) check(input.value); else next(); } };
    }
    function check(val) {
      const w = list[i]; const v = val.trim(); if (!v) return;
      let ok;
      if (C.id === "zh") {
        const typed = numToMarks(v);
        ok = stripTones(typed) === stripTones(w.py) && toneSeq(typed).join("") === toneSeq(w.py).join(""); // the picker asks for every tone
      } else if (C.id === "ja") {
        const a = stripJa(v);
        ok = a === stripJa(w.kana) || a === stripJa(w.romaji) || a === stripJa(w.hz) || a === stripJa(w.romaji).replace(/'/g, "") || a === toRomaji(w.kana).replace(/ou/g, "oo") || a.replace(/ou/g, "oo") === stripJa(w.romaji).replace(/ou/g, "oo");
      } else if (C.id === "ko") {
        ok = koTyped(v, w.hz);
      } else {
        const a = v.normalize("NFC").toLowerCase().split(/\s+/), b = w.hz.normalize("NFC").toLowerCase().split(/\s+/);
        ok = stripVi(v) === stripVi(w.hz) && a.length === b.length && a.every((x, k) => firstToneVi(x) === firstToneVi(b[k]));
      }
      reveal(ok);
    }
    function reveal(ok) {
      answered = true; const w = list[i];
      const input = $("#ti"); input.disabled = true; input.classList.add(ok ? "ok" : "bad");
      grade(w.id, ok ? 2 : 0); recordAnswer(ok);
      if (ok) correct++; else { mistakes.push(w); const v = input.value.trim(); noteMiss(w, v ? t("whyTyped", v) : t("whyNotHeard")); }
      $("#t-foot").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow">${t("answerWas")} <b>${C.id === "zh" ? pyHtml(w.py) : C.id === "ja" ? esc(w.py) : C.id === "vi" ? viHtml(w.hz) : esc(w.hz)}</b>${C.id === "zh" || C.id === "ja" || C.id === "vi" ? "" : ` <span class="muted">[${esc(w.py)}]</span>`}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="t-next" type="button">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speak(w.hz);
      $("#t-next").onclick = next; $("#t-next").focus();
      if (S.settings.autoSpeak) speak(w.hz);
    }
    function next() { i++; draw(); }
    bindKeys((e) => { if (e.key === "Enter" && answered && e.target.id !== "ti") { e.preventDefault(); next(); } });
    draw();
  }

  /* --- Trace characters (round 2): one character at a time in a 田字格. Trace shows the character faintly,
   * Copy shows it beside the grid, From memory shows nothing until two misses. The next stroke is dashed with a
   * red start dot; a stroke counts when it follows the stroke's centre line (data/strokes-zh.json, Arphic PL). --- */
  let STROKES = null, traceMode = "trace";
  const loadStrokes = () => STROKES ? Promise.resolve(STROKES) : fetch("data/strokes-zh.json").then((r) => r.json()).then((d) => (STROKES = d));
  function resampleLine(pts, n) {
    const len = [0]; for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const total = len[len.length - 1] || 1, out = [];
    for (let j = 0; j < n; j++) { const d = (j / (n - 1)) * total; let k = 1; while (k < len.length - 1 && len[k] < d) k++; const a = pts[k - 1], b = pts[k] || a, f = len[k] - len[k - 1] ? (d - len[k - 1]) / (len[k] - len[k - 1]) : 0; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
    return { pts: out, total };
  }
  function strokeMatches(drawn, median) {
    if (drawn.length < 2) return Math.hypot(drawn[0][0] - median[0][0], drawn[0][1] - median[0][1]) < 120 && resampleLine(median, 2).total < 160; // a dot
    const a = resampleLine(drawn, 16), b = resampleLine(median, 16);
    const avg = a.pts.reduce((s, p, k) => s + Math.hypot(p[0] - b.pts[k][0], p[1] - b.pts[k][1]), 0) / 16;
    const start = Math.hypot(a.pts[0][0] - b.pts[0][0], a.pts[0][1] - b.pts[0][1]), end = Math.hypot(a.pts[15][0] - b.pts[15][0], a.pts[15][1] - b.pts[15][1]);
    return avg < 150 && start < 230 && end < 260 && a.total > b.total * 0.35;
  }
  function strokeDir(m) {
    const dx = m[m.length - 1][0] - m[0][0], dy = m[m.length - 1][1] - m[0][1], len = Math.hypot(dx, dy);
    if (len < 140) return "dirDot";
    const ang = (Math.atan2(-dy, dx) * 180) / Math.PI; // screen angle: 0 = right, 90 = down
    return ang > -25 && ang < 25 ? "dirRight" : ang >= 25 && ang < 65 ? "dirDownRight" : ang >= 65 && ang < 115 ? "dirDown" : ang >= 115 && ang < 160 ? "dirDownLeft" : ang <= -25 && ang > -90 ? "dirUpRight" : "dirLeft";
  }
  async function startTrace(view) {
    view.innerHTML = `<div class="state-card">${t("loading")}</div>`;
    let data; try { data = await loadStrokes(); } catch (e) { view.innerHTML = `<div class="state-card warn"><b>${t("traceOffline")}</b></div>`; return; }
    if (route[0] !== "train" || route[1] !== "trace") return;
    const ok = (w) => Array.from(w.hz).every((c) => data[c]);
    const lw = lessonWords(true).filter(ok), from = lw.length ? lw : WORDS.filter(ok).filter((w) => status(w.id) !== "new").concat(WORDS.filter(ok));
    const words = [...new Map(from.map((w) => [w.id, w])).values()].slice(0, 6), lessonName = lw.length ? courseLessons().slice(-1)[0].name : "";
    let wi = 0, ci = 0, si = 0, misses = 0, wordMiss = 0, right = 0, drawing = null, lastOk = false, timer = 0;
    runMarks = []; runT0 = Date.now(); runMode = { mode: "trace", again: () => navigate("train/trace") };
    const mistakes = [];
    document.body.classList.add("home");
    const grid = `<line x1="0" y1="512" x2="1024" y2="512" class="tg-line"/><line x1="512" y1="0" x2="512" y2="1024" class="tg-line"/>`;
    const tr8 = (inner) => `<g transform="translate(0,900) scale(1,-1)">${inner}</g>`;
    function draw() {
      if (wi >= words.length) { clearTimeout(timer); return showResult(view, { correct: right, total: words.length, mistakes }); }
      const w = words[wi], ch = Array.from(w.hz)[ci], d = data[ch], n = d.s.length, m = d.m[si];
      const showGhost = traceMode === "trace", showNext = traceMode === "trace" || misses >= 2;
      view.innerHTML = `
        <div class="setup-head"><button class="fh-close" id="ex-close" type="button" aria-label="${t("close")}">${icon("close")}</button><div class="grow"><div class="fh-title">${t("modeTrace")} <span class="new-badge">${t("newBadge")}</span></div><div class="fh-sub">${lessonName ? esc(lessonName) + " · " : ""}${t("dlgOf", wi + 1, words.length)}</div></div></div>
        <div class="seg" id="tr-mode" style="margin:10px 0">${["trace", "copy", "memory"].map((k) => `<button data-tm="${k}" class="${traceMode === k ? "on" : ""}" type="button">${t("trace_" + k)}</button>`).join("")}</div>
        <div class="tr-word"><span class="grow"><b class="py-face">${pyHtml(w.py)}</b> ${esc(tr(w))}${traceMode === "copy" ? ` <span class="hanzi tr-model">${esc(ch)}</span>` : ""}</span><span class="fh-sub">${t("strokeOf", Math.min(si + 1, n), n)}</span></div>
        <svg class="tr-grid" id="tr-svg" viewBox="0 0 1024 1024" role="img" aria-label="${esc(t("traceAria", ch))}">
          <rect x="2" y="2" width="1020" height="1020" class="tg-box"/>${grid}
          ${tr8(`${showGhost ? d.s.map((p) => `<path d="${p}" class="tg-ghost"/>`).join("") : ""}
            ${d.s.slice(0, si).map((p) => `<path d="${p}" class="tg-ink"/>`).join("")}
            ${si < n && showNext ? `<path d="${d.s[si]}" class="tg-next"/><circle cx="${m[0][0]}" cy="${m[0][1]}" r="34" class="tg-dot"/>${m.length > 1 ? `<line x1="${m[0][0]}" y1="${m[0][1]}" x2="${m[Math.min(2, m.length - 1)][0]}" y2="${m[Math.min(2, m.length - 1)][1]}" class="tg-arrow"/>` : ""}` : ""}`)}
          <polyline id="tr-live" class="tg-live" points=""/>
        </svg>
        <div class="tr-hint" id="tr-hint">${si < n ? esc(t("traceStart", t(strokeDir(m)))) + (lastOk && si > 0 ? " " + esc(t("strokeGood", si)) : "") : ""}</div>
        ${n <= 14 ? `<div class="tr-order"><span class="fh-sub">${t("order")}</span>${d.s.map((_, k) => `<svg viewBox="0 0 1024 1024" class="${k === si ? "cur" : k < si ? "done" : ""}" aria-hidden="true">${tr8(d.s.slice(0, k + 1).map((p, j) => `<path d="${p}" class="${j === k ? "tg-last" : "tg-ink"}"/>`).join(""))}</svg>`).join("")}</div>` : ""}
        <div class="tr-btns"><button class="btn" id="tr-show" type="button">${t("showMe")}</button><button class="btn" id="tr-clear" type="button">${t("clear")}</button><button class="btn primary" id="tr-next" type="button">${t("next")} →</button></div>`;
      const svg = $("#tr-svg"), live = $("#tr-live");
      const toData = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
      svg.onpointerdown = (e) => { if (si >= n) return; svg.setPointerCapture(e.pointerId); drawing = [toData(e)]; live.setAttribute("points", drawing.map((p) => p.join(",")).join(" ")); };
      svg.onpointermove = (e) => { if (!drawing) return; drawing.push(toData(e)); live.setAttribute("points", drawing.map((p) => p.join(",")).join(" ")); };
      svg.onpointerup = () => {
        if (!drawing) return; const pts = drawing.map(([x, y]) => [x, 900 - y]); drawing = null;
        if (strokeMatches(pts, m)) { si++; misses = 0; lastOk = true; if (si >= n) return charDone(); draw(); }
        else { misses++; wordMiss++; lastOk = false; live.setAttribute("points", ""); $("#tr-hint").textContent = t(misses >= 2 && traceMode !== "trace" ? "traceHelp" : "traceAgain"); if (misses === 2 && traceMode !== "trace") draw(); }
      };
      $$("[data-tm]").forEach((b) => (b.onclick = () => { traceMode = b.dataset.tm; si = 0; misses = 0; draw(); }));
      $("#tr-clear").onclick = () => { si = 0; misses = 0; lastOk = false; draw(); };
      $("#tr-show").onclick = () => { // the strokes one after another, then back to where you were
        const g = svg.querySelector("g"); const keep = g.innerHTML; let k = 0; clearTimeout(timer); speak(w.hz);
        const step = () => { if (!$("#tr-svg")) return; g.innerHTML = d.s.map((p, j) => `<path d="${p}" class="${j < k ? "tg-ink" : "tg-ghost"}"/>`).join(""); if (k++ < n) timer = setTimeout(step, 450); else timer = setTimeout(() => { if ($("#tr-svg")) g.innerHTML = keep; }, 900); };
        step(); wordMiss++;
      };
      $("#tr-next").onclick = () => { wordMiss++; nextChar(); };
    }
    function charDone() { $("#tr-hint").textContent = "✓ " + t("traceDone"); setTimeout(nextChar, 600); }
    function nextChar() {
      const w = words[wi]; si = 0; misses = 0; lastOk = false; ci++;
      if (ci >= Array.from(w.hz).length) { const good = wordMiss <= 1; recordAnswer(good); if (good) right++; else { mistakes.push(w); noteMiss(w, t("whyStrokes")); } wi++; ci = 0; wordMiss = 0; }
      draw();
    }
    cleanup = () => clearTimeout(timer);
    draw();
  }

  /* --- Typewriter: copy-type pinyin / Vietnamese for speed; Enter speaks the line --- */
  const PY_TONE = { a: "āáǎà", e: "ēéěè", i: "īíǐì", o: "ōóǒò", u: "ūúǔù", "ü": "ǖǘǚǜ" };
  // One syllable + tone number → tone mark (a/e first, then the o of "ou", else the last vowel); v → ü
  function markSyllable(syl, tone) {
    const s = syl.replace(/v/g, "ü").replace(/V/g, "Ü");
    if (tone === 5) return s;
    const low = s.toLowerCase();
    let k = low.indexOf("a");
    if (k < 0) k = low.indexOf("e");
    if (k < 0) k = low.indexOf("ou");
    if (k < 0) for (let j = low.length - 1; j >= 0; j--) if (PY_TONE[low[j]]) { k = j; break; }
    if (k < 0) return s + tone;
    const m = PY_TONE[low[k]][tone - 1];
    return s.slice(0, k) + (s[k] === low[k] ? m : m.toUpperCase()) + s.slice(k + 1);
  }
  const numToMarks = (s) => s.replace(/([a-zA-ZüÜ]+)([1-5])/g, (_, syl, d) => markSyllable(syl, +d));
  // Typing comparison: NFC, curly apostrophes and dashes count as their plain keyboard versions
  const typerNorm = (s) => s.normalize("NFC").replace(/[’‘]/g, "'").replace(/[—–]/g, "-").replace(/\s+/g, " ");
  const typerPrefs = { content: "mixed", count: 10 };
  function typerItems(list, content) {
    const zh = C.id === "zh";
    const word = (w) => ({ w, text: typerNorm(zh ? w.py : w.hz), show: zh ? w.hz : "", sub: tr(w), say: w.hz });
    const sent = (w) => (w.ex ? { w, text: typerNorm(zh ? w.exPy : w.ex), show: zh ? w.ex : "", sub: exTr(w), say: w.ex } : null);
    return list.map((w) => (content === "words" ? word(w) : content === "sentences" ? sent(w) || word(w) : Math.random() < 0.5 ? word(w) : sent(w) || word(w)));
  }
  function startTyper(view) {
    const contents = [["words", t("typerWords")], ["sentences", t("typerSentences")], ["mixed", t("typerMixed")]];
    const best = (S.typer && S.typer[C.id]) || 0;
    view.innerHTML = `
      <div class="card stack">
        <h2>${t("modeTyper")}</h2>
        <p class="list-hint" style="margin:0">${t("typerIntro")}</p>
        <div class="section-title" style="margin-top:4px">${t("levels")}</div>
        ${levelChips("ty-lvl-chips")}
        <div class="section-title">${t("typerContent")}</div>
        <div class="chips" id="ty-content">${contents.map(([k, l]) => `<button class="chip ${typerPrefs.content === k ? "active" : ""}" data-v="${k}" type="button">${l}</button>`).join("")}</div>
        <div class="section-title">${t("howMany")}</div>
        <div class="chips" id="ty-count">${[10, 20, 40].map((n) => `<button class="chip ${typerPrefs.count === n ? "active" : ""}" data-v="${n}" type="button">${n}</button>`).join("")}</div>
        ${best ? `<div class="list-hint">${t("typerBest")}: <b>${best} ${t("wpm")}</b></div>` : ""}
        <button class="btn primary block" id="start" type="button">${t("start")}</button>
      </div>`;
    const bind = (sel, key) => $$(sel + " .chip").forEach((b) => (b.onclick = () => { typerPrefs[key] = key === "count" ? +b.dataset.v : b.dataset.v; $$(sel + " .chip").forEach((x) => x.classList.toggle("active", x === b)); }));
    bind("#ty-content", "content"); bind("#ty-count", "count");
    bindLevelChips("ty-lvl-chips", () => {});
    $("#start").onclick = () => runTyper(view, typerItems(sample(WORDS, typerPrefs.count), typerPrefs.content));
  }
  function runTyper(view, items) {
    let i = 0, startedAt = 0, last = null; const done = [];
    const chars = (s) => Array.from(s);
    function lineHtml(target, typed, live) {
      const tc = chars(target), yc = chars(typed);
      let html = tc.map((c, k) => {
        const cls = k < yc.length ? (yc[k] === c ? "ok" : "bad") : live && k === yc.length ? "cur" : "todo";
        return `<span class="tc ${cls}${c === " " ? " sp" : ""}">${c === " " ? " " : esc(c)}</span>`;
      }).join("");
      if (yc.length > tc.length) html += `<span class="tc bad extra">${esc(yc.slice(tc.length).join(""))}</span>`;
      return html;
    }
    const scoreOf = (target, typed) => {
      const tc = chars(target), yc = chars(typed); let ok = 0;
      tc.forEach((c, k) => { if (yc[k] === c) ok++; });
      return Math.round((ok / Math.max(tc.length, yc.length)) * 100);
    };
    // Net speed: only correctly typed characters count (5 characters = 1 word)
    const wpmOf = (target, typed, ms) => { const tc = chars(target); const ok = chars(typed).filter((c, k) => c === tc[k]).length; return Math.round((ok / 5) / Math.max(ms / 60000, 1 / 600)); };
    function lastHtml() {
      if (!last) return "";
      return `<div class="typer-last ${last.acc === 100 ? "ok" : "bad"}">
        <div class="grow"><div class="typer-line small">${lineHtml(last.item.text, last.typed, false)}</div>
        ${last.item.show ? `<div class="hanzi small">${last.item.show}</div>` : ""}</div>
        <div class="typer-num"><b>${last.wpm}</b><small>${t("wpm")}</small></div>
        <div class="typer-num"><b>${last.acc}%</b><small>${t("accuracy")}</small></div>
        <button class="speak-btn sm" id="ty-replay" type="button">🔊</button>
      </div>`;
    }
    function draw() {
      if (i >= items.length) return finish();
      const it = items[i]; startedAt = 0;
      view.innerHTML = `${sessionHead(i, items.length)}
        <div class="card typer-card">
          ${it.show ? `<div class="typer-show hanzi">${it.show}</div>` : ""}
          <div class="typer-line" id="ty-line" aria-hidden="true">${lineHtml(it.text, "", true)}</div>
          <div class="typer-sub">${esc(it.sub || "")}</div>
          <input class="type-input" id="ty-in" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(it.text)}">
          <div class="typer-stats"><span id="ty-wpm">0 ${t("wpm")}</span><span id="ty-acc">100%</span><button class="btn ghost sm" id="ty-hear" type="button">🔊 ${t("play")}</button></div>
        </div>
        ${lastHtml()}
        <div class="kbd-hint">${t("typerHint")}</div>`;
      const input = $("#ty-in"); input.focus();
      if ($("#ty-replay")) $("#ty-replay").onclick = () => speak(last.item.say);
      $("#ty-hear").onclick = () => { speak(it.say); input.focus(); };
      input.addEventListener("input", (e) => {
        if (e.isComposing) return;
        if (!startedAt && input.value) startedAt = Date.now();
        if (C.id === "zh" && /[1-5]/.test(input.value)) { // live tone numbers → tone marks, keep the caret in place
          const pos = input.selectionStart, before = numToMarks(input.value.slice(0, pos));
          input.value = before + numToMarks(input.value.slice(pos));
          input.setSelectionRange(before.length, before.length);
        }
        update();
      });
      input.addEventListener("compositionend", update);
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
        e.preventDefault(); submit();
      });
    }
    function update() {
      const it = items[i], typed = typerNorm($("#ty-in").value);
      $("#ty-line").innerHTML = lineHtml(it.text, typed, true);
      if (startedAt && Date.now() - startedAt > 1000) $("#ty-wpm").textContent = `${wpmOf(it.text, typed, Date.now() - startedAt)} ${t("wpm")}`;
      $("#ty-acc").textContent = `${typed ? scoreOf(chars(it.text).slice(0, chars(typed).length).join(""), typed) : 100}%`;
    }
    function submit() {
      const it = items[i], typed = typerNorm($("#ty-in").value).trim();
      if (!typed) return;
      const acc = scoreOf(it.text, typed), wpm = startedAt ? wpmOf(it.text, typed, Date.now() - startedAt) : 0;
      speak(it.say);
      recordAnswer(acc === 100);
      last = { item: it, typed, acc, wpm }; done.push(last);
      i++; draw();
    }
    function finish() {
      const n = done.length || 1;
      const avgWpm = Math.round(done.reduce((a, d) => a + d.wpm, 0) / n);
      const avgAcc = Math.round(done.reduce((a, d) => a + d.acc, 0) / n);
      const topWpm = Math.max(0, ...done.filter((d) => d.acc >= 90).map((d) => d.wpm));
      S.typer = S.typer || {};
      const record = topWpm > (S.typer[C.id] || 0);
      if (record) S.typer[C.id] = topWpm;
      const misses = done.filter((d) => d.acc < 100).map((d) => ({ hz: d.item.show || d.item.text, py: d.item.show ? d.item.text : "", en: d.item.sub, say: d.item.say }));
      showResult(view, { correct: done.length - misses.length, total: done.length, mistakes: misses, extra: `${avgWpm} ${t("wpm")} · ${avgAcc}%${record ? " · 🏆 " + t("typerRecord") : ""}`, onAgain: () => runTyper(view, typerItems(sample(WORDS, typerPrefs.count), typerPrefs.content)) });
      // showResult speaks w.hz; for sentences speak the original text instead of the pinyin line
      $$("[data-speak]").forEach((b, k) => (b.onclick = () => speak(misses[k].say)));
    }
    draw();
  }

  /* --- Matching game --- */
  function startMatch(view) {
    const pairs = sample(WORDS.filter((w) => !/\(/.test(tr(w))), 6);
    let selected = null, matched = 0, mistakes = 0; const wrongWords = new Set();
    const start = Date.now(); let timer;
    const left = shuffle(pairs), right = shuffle(pairs);
    view.innerHTML = `
      <div class="session-head"><div class="grow"><b>${t("matchTitle")}</b> <span class="muted small" id="m-left">${t("pairsLeft", 6)}</span></div><span class="count" id="m-time">0:00</span></div>
      <div class="match-grid">
        <div class="match-col">${left.map((w) => `<button class="match-card ${pyFirst() ? "" : "hanzi"}" data-side="a" data-id="${w.id}" type="button">${pyFirst() ? pyHtml(w.py) : w.hz}</button>`).join("")}</div>
        <div class="match-col">${right.map((w) => `<button class="match-card" data-side="b" data-id="${w.id}" type="button">${esc(tr(w))}</button>`).join("")}</div>
      </div>`;
    const timeStr = () => { const s = Math.round((Date.now() - start) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
    timer = setInterval(() => { const el = $("#m-time"); if (el) el.textContent = timeStr(); }, 500);
    cleanup = () => clearInterval(timer);
    $$(".match-card").forEach((b) => (b.onclick = () => pick(b)));
    function pick(b) {
      if (b.classList.contains("done")) return;
      if (!selected) { selected = b; b.classList.add("selected"); if (b.dataset.side === "a") speak(BY_ID[b.dataset.id].hz); return; }
      if (selected === b) { b.classList.remove("selected"); selected = null; return; }
      if (selected.dataset.side === b.dataset.side) { selected.classList.remove("selected"); selected = b; b.classList.add("selected"); if (b.dataset.side === "a") speak(BY_ID[b.dataset.id].hz); return; }
      const a = selected; selected = null; a.classList.remove("selected");
      if (a.dataset.id === b.dataset.id) {
        a.classList.add("done"); b.classList.add("done"); matched++; recordAnswer(true);
        $("#m-left").textContent = t("pairsLeft", 6 - matched);
        if (matched === 6) {
          clearInterval(timer); const elapsed = timeStr();
          setTimeout(() => showResult(view, { correct: 6, total: 6, mistakes: Array.from(wrongWords), extra: `${t("timeTaken")} ${elapsed} · ${mistakes} ${t("mistakes")}`, onAgain: () => startMatch(view) }), 400);
        }
      } else {
        mistakes++; recordAnswer(false); wrongWords.add(BY_ID[a.dataset.id]);
        a.classList.add("shake"); b.classList.add("shake"); setTimeout(() => { a.classList.remove("shake"); b.classList.remove("shake"); }, 350);
      }
    }
  }

  /* --- Tone drill --- */
  function startTones(view) {
    const pool = C.id === "zh" ? WORDS.filter((w) => w.hz.length === 1 && firstTone(w.py) !== 5) : WORDS.filter((w) => !w.hz.includes(" "));
    const toneOf = (w) => firstTone(C.id === "zh" ? w.py : w.hz);
    const list = sample(pool, 10); let i = 0, correct = 0, answered = false; const mistakes = [];
    function draw(autoPlay) {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => startTones(view) }); }
      const w = list[i]; answered = false;
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}
        <div class="quiz-q"><div class="q-hz">${w.hz}</div><div class="q-sub">${esc(tr(w))}</div><div class="q-sub">${t("toneQ")}</div><button class="btn primary" id="q-play" type="button" style="margin-top:8px">▶︎ ${t("play")}</button></div>
        <div class="options">${C.toneOptions.map((n) => `<button class="option" data-tone="${n}" type="button"><span class="opt-key">${n}</span><span>${toneSvg(n)} ${toneName(n)}</span></button>`).join("")}</div>
        <div id="fb"></div><div class="kbd-hint">${t("keys")}</div>`;
      $("#q-play").onclick = () => speak(w.hz, { rate: 0.7 }); if (autoPlay) speak(w.hz, { rate: 0.7 });
      $$(".option").forEach((b) => (b.onclick = () => answer(+b.dataset.tone)));
    }
    function answer(n) {
      if (answered) return; answered = true;
      const w = list[i]; const real = toneOf(w); const ok = n === real;
      $$(".option").forEach((b) => { b.disabled = true; if (+b.dataset.tone === real) b.classList.add("correct"); else if (+b.dataset.tone === n) b.classList.add("wrong"); });
      recordAnswer(ok); if (ok) correct++; else mistakes.push(w);
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow"><span class="hanzi">${w.hz}</span> <b>${w.py}</b> · ${toneName(real)}</span></div><button class="btn primary block" id="q-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#q-next").onclick = () => { i++; draw(true); };
    }
    bindKeys((e) => { if (/^[1-6]$/.test(e.key) && C.toneOptions.includes(+e.key) && !answered) answer(+e.key); else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); i++; draw(true); } else if (e.key === " ") { e.preventDefault(); speak(list[i].hz, { rate: 0.7 }); } });
    draw(false);
  }
  function toneSvg(n) {
    const zh = { 1: "M4 10 H44", 2: "M4 28 L44 8", 3: "M4 10 L24 30 L44 12", 4: "M4 8 L44 30", 5: "M20 18 h8" };
    const vi = { 1: "M4 14 H44", 2: "M4 18 Q24 24 44 30", 3: "M4 28 L44 8", 4: "M4 12 Q20 30 30 20 T44 10", 5: "M4 24 L20 14 L24 22 L44 6", 6: "M8 16 L22 30" };
    const paths = C.id === "zh" ? zh : vi;
    return `<svg class="tone-svg" viewBox="0 0 48 36" aria-hidden="true"><path d="${paths[n]}" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  /* --- Numbers trainer --- */
  const NUM_HZ = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const NUM_PY = ["líng", "yī", "èr", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ", "shí"];
  const VI_NUM = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"];
  function numToVi(n) {
    if (n <= 10) return VI_NUM[n];
    const tens = Math.floor(n / 10), ones = n % 10;
    if (tens === 1) return "mười" + (ones ? " " + (ones === 5 ? "lăm" : VI_NUM[ones]) : "");
    let s = VI_NUM[tens] + " mươi";
    if (ones === 1) s += " mốt"; else if (ones === 4) s += " tư"; else if (ones === 5) s += " lăm"; else if (ones) s += " " + VI_NUM[ones];
    return s;
  }
  const JA_NUM_HZ = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const JA_NUM_RO = ["zero", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyuu", "juu"];
  function numToJa(n, pron) {
    const H = pron ? JA_NUM_RO : JA_NUM_HZ; const sep = pron ? " " : "";
    if (n <= 10) return H[n];
    const tens = Math.floor(n / 10), ones = n % 10;
    return (tens > 1 ? H[tens] + sep : "") + H[10] + (ones ? sep + H[ones] : "");
  }
  // Korean: Sino-Korean numbers (used for money, dates, minutes, phone numbers)
  const KO_NUM = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"];
  const numToKo = (n) => (n <= 10 ? KO_NUM[n] : (Math.floor(n / 10) > 1 ? KO_NUM[Math.floor(n / 10)] : "") + "십" + (n % 10 ? KO_NUM[n % 10] : ""));
  function numToHanzi(n) {
    if (C.id === "ko") return numToKo(n);
    if (C.id === "vi") return numToVi(n);
    if (C.id === "ja") return numToJa(n, false);
    if (n <= 10) return NUM_HZ[n];
    const tens = Math.floor(n / 10), ones = n % 10;
    return (tens > 1 ? NUM_HZ[tens] : "") + "十" + (ones ? NUM_HZ[ones] : "");
  }
  function numToPinyin(n) {
    if (C.id === "ko") return window.KO.romanize(numToKo(n));
    if (C.id === "vi") return "";
    if (C.id === "ja") return numToJa(n, true);
    if (n <= 10) return NUM_PY[n];
    const tens = Math.floor(n / 10), ones = n % 10;
    return ((tens > 1 ? NUM_PY[tens] + " " : "") + "shí" + (ones ? " " + NUM_PY[ones] : ""));
  }
  const numPrefs = { mode: "read" };
  function startNumbers(view) {
    let i = 0, correct = 0, answered = false; const total = 10; const mistakes = [];
    const nums = sample(Array.from({ length: 99 }, (_, k) => k + 1), total);
    function draw() {
      if (i >= total) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total, mistakes: [], onAgain: () => startNumbers(view) }); }
      const n = nums[i]; answered = false;
      const seg = `<div class="row" style="justify-content:center;margin-bottom:12px"><div class="seg"><button data-nm="read" class="${numPrefs.mode === "read" ? "active" : ""}" type="button">${t("numMode1")}</button><button data-nm="write" class="${numPrefs.mode === "write" ? "active" : ""}" type="button">${t("numMode2")}</button></div></div>`;
      if (numPrefs.mode === "read") {
        view.innerHTML = `${sessionHead(i, total, `✓ ${correct}`)}${seg}
          <div class="quiz-q"><div class="num-big">${numToHanzi(n)}</div><div class="q-sub">${t("numPrompt")}</div><button class="speak-btn sm" id="q-speak" type="button" style="margin-top:6px">🔊</button></div>
          <input class="type-input num-input" id="ti" type="number" inputmode="numeric" pattern="[0-9]*" placeholder="?" enterkeyhint="done">
          <div class="list-hint center">${t("numHint")}</div>
          <button class="btn primary block" id="t-check" type="button" style="margin-top:8px">${t("check")}</button><div id="fb"></div>`;
        const input = $("#ti"); input.focus();
        $("#q-speak").onclick = () => speak(numToHanzi(n));
        $("#t-check").onclick = () => { if (!answered) reveal(+input.value === n, n); else next(); };
        input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); if (!answered) reveal(+input.value === n, n); else next(); } };
      } else {
        const opts = shuffle([n].concat(sample(Array.from({ length: 99 }, (_, k) => k + 1).filter((x) => x !== n && Math.abs(x - n) < 40), 3)));
        view.innerHTML = `${sessionHead(i, total, `✓ ${correct}`)}${seg}
          <div class="quiz-q"><div class="q-sub">${t("numPrompt2")}</div><div class="q-text" style="font-size:44px">${n}</div></div>
          <div class="options">${opts.map((x, k) => `<button class="option hanzi" data-n="${x}" type="button"><span class="opt-key">${k + 1}</span><span>${numToHanzi(x)}</span></button>`).join("")}</div><div id="fb"></div>`;
        $$(".option").forEach((b) => (b.onclick = () => { if (answered) return; $$(".option").forEach((x) => { x.disabled = true; if (+x.dataset.n === n) x.classList.add("correct"); else if (x === b) x.classList.add("wrong"); }); reveal(+b.dataset.n === n, n); }));
      }
      $$("[data-nm]").forEach((b) => (b.onclick = () => { numPrefs.mode = b.dataset.nm; draw(); }));
    }
    function reveal(ok, n) {
      answered = true; recordAnswer(ok); if (ok) correct++;
      const input = $("#ti"); if (input) { input.disabled = true; input.classList.add(ok ? "ok" : "bad"); }
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow"><span class="hanzi">${numToHanzi(n)}</span> = <b>${n}</b>${numToPinyin(n) ? " · " + numToPinyin(n) : ""}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="t-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speak(numToHanzi(n));
      $("#t-next").onclick = next; $("#t-next").focus();
      if (S.settings.autoSpeak) speak(numToHanzi(n));
    }
    function next() { i++; draw(); }
    bindKeys((e) => {
      if (numPrefs.mode === "write" && /^[1-4]$/.test(e.key) && !answered) { const b = $$(".option")[+e.key - 1]; if (b) b.click(); }
      else if ((e.key === "Enter" || e.key === " ") && answered && e.target.id !== "ti") { e.preventDefault(); next(); }
    });
    draw();
  }

  /* ================= SOUNDS ================= */
  const L = (o) => (o ? (o[S.lang] || o.en || "") : "");
  // --- pinyin syllable analysis (for finding example words by initial/final/tone) ---
  const PY_FINALS = ["iang", "iong", "uang", "ueng", "ang", "eng", "ing", "ong", "ian", "iao", "uai", "uan", "van", "ai", "ei", "ao", "ou", "an", "en", "in", "un", "vn", "ia", "ie", "iu", "ua", "uo", "ue", "ve", "er", "a", "o", "e", "i", "u", "v"];
  const PY_INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "w", "y"];
  // Pinyin split into syllables (keeping the original letters) and separators, each syllable with its tone
  const PART_FINALS = ["ui"].concat(PY_FINALS).sort((a, b) => b.length - a.length); // written finals, longest first (ui = uei)
  function pyParts(py) {
    const out = [];
    String(py).split(/([^\p{L}]+)/u).forEach((part, k) => {
      if (k % 2) { out.push({ text: part, sep: true }); return; }
      const chars = Array.from(part);
      const plain = chars.map((c) => { const d = c.normalize("NFD"); return d.includes("\u0308") ? "v" : d[0].toLowerCase(); });
      let i = 0;
      while (i < chars.length) {
        const rest = plain.slice(i).join("");
        const ini = PY_INITIALS.find((x) => rest.startsWith(x)) || "";
        const fin = PART_FINALS.find((x) => rest.slice(ini.length).startsWith(x)) || "";
        const len = (ini.length + fin.length) || 1;
        const text = chars.slice(i, i + len).join("");
        out.push({ text, tone: toneSeq(text)[0] || 5 });
        i += len;
      }
    });
    return out;
  }
  // One colour per tone, so the tone pattern of a word is visible at a glance
  const pyHtml = (py) => pyParts(py).map((x) => (x.sep ? esc(x.text) : `<span class="tn${x.tone}">${esc(x.text)}</span>`)).join("");
  // Vietnamese: each syllable in its tone's colour (the marks stay, so colour is never the only cue)
  const VI_TONE_CLASS = ["", "level", "falling", "rising", "dipping", "broken", "light"];
  const viHtml = (s) => esc(s).replace(/[\p{L}]+/gu, (syl) => `<span class="tc-${VI_TONE_CLASS[firstToneVi(syl)]}">${syl}</span>`);
  const firstToneVi = (syl) => { const m = Array.from(syl.normalize("NFD")).map((c) => VI_TONE_MARKS[c]).filter(Boolean); return m[0] || 1; };
  // The reading layer (pinyin, romanization, kana) with a word: always, for words not yet known, or off
  const readingLayer = () => S.settings.readingLayer || (S.settings.tilePinyin === false ? "off" : "always");
  const showsReading = (w) => (readingLayer() === "off" ? false : readingLayer() === "new" ? status(w.id) !== "known" : true);
  // The word large, with what its language needs: 田字格 grid, furigana, Hangul letters, tone contours
  function heroHtml(w) {
    if (C.id === "zh") return pyFirst()
      ? `<div class="hero-py">${pyHtml(w.py)}</div>${gridHtml(w.hz, "sm")}`
      : `${gridHtml(w.hz, Array.from(w.hz).length > 2 ? "md" : "")}<div class="hero-sub">${pyShow(w.py)}</div>`;
    if (C.id === "ja") return `${w.kana && w.kana !== w.hz ? `<div class="furigana">${esc(w.kana)}</div>` : ""}<div class="hero-word">${esc(w.hz)}</div>${w.romaji ? `<div class="romaji">${esc(w.romaji)}</div>` : ""}`;
    if (C.id === "ko") return `<div class="hero-word">${esc(w.hz)}</div><div class="hero-sub">${esc(w.py)}</div>${pronHtml(w)}${koBlocksHtml(w.hz)}`;
    if (C.id === "vi") return `<div class="hero-word">${viHtml(w.hz)}</div><div class="romaji">${esc(w.py)}</div>${contoursHtml(w.hz)}`;
    return `<div class="hero-word">${esc(w.hz)}</div><div class="hero-sub">${pyShow(w.py)}</div>`;
  }
  const gridHtml = (hz, size) => `<div class="grid-chars ${size || ""}" role="img" aria-label="${esc(hz)}">${Array.from(hz).filter((c) => /\S/.test(c)).map((c) => `<span class="gc" aria-hidden="true">${esc(c)}</span>`).join("")}</div>`;
  const koBlocksHtml = (hz) => `<div class="ko-blocks" aria-hidden="true">${Array.from(hz).map((ch) => { const j = koJamo(ch); return j ? `<span class="kb"><i class="kb-i">${j.i}</i><i class="kb-v">${j.v}</i>${j.f ? `<i class="kb-f">${j.f}</i>` : ""}<b>→ ${ch}</b></span>` : ""; }).join("")}</div>`;
  const contoursHtml = (hz) => `<div class="contours">${hz.split(/\s+/).filter(Boolean).map((syl) => { const n = firstToneVi(syl); return `<span class="contour tc-${VI_TONE_CLASS[n]}">${toneSvg(n)} ${VI_TONE_NAMES[n - 1]}</span>`; }).join("")}</div>`;
  // Korean: how the word is said when it differs from the spelling (독일 → [도길])
  const pronHtml = (w) => (w.pron ? `<div class="pron-hint" title="${esc(t("pronHint"))}">[${esc(w.pron)}]</div>` : "");
  const pyShow = (py) => (C.id === "zh" ? pyHtml(py) : esc(py));
  // Typing pinyin: tone numbers turn into marks as you type (ni3 → nǐ), the caret stays in place
  function liveToneMarks(e, input) {
    if (e.isComposing || !/[1-5]/.test(input.value)) return;
    const pos = input.selectionStart, before = numToMarks(input.value.slice(0, pos));
    input.value = before + numToMarks(input.value.slice(pos)); input.setSelectionRange(before.length, before.length);
  }
  function pySyllables(py) {
    const out = [];
    for (const part of py.split(/[\s'’]+/)) {
      const chars = Array.from(part);
      const plain = chars.map((c) => { const d = c.normalize("NFD"); return d.includes("̈") ? "v" : d[0].toLowerCase(); });
      const tones = chars.map((c) => { const d = c.normalize("NFD"); for (const ch of d) if (TONE_MARKS[ch]) return TONE_MARKS[ch]; return 0; });
      let i = 0;
      while (i < plain.length) {
        const rest = plain.slice(i).join("");
        const ini = PY_INITIALS.find((x) => rest.startsWith(x)) || "";
        const afterIni = rest.slice(ini.length);
        const fin = PY_FINALS.find((x) => afterIni.startsWith(x)) || "";
        const len = (ini.length + fin.length) || 1;
        const tone = tones.slice(i, i + len).find(Boolean) || 5;
        out.push({ i: ini, f: fin || rest[0], tone });
        i += len;
      }
    }
    return out;
  }
  const VI_INI = /^(ngh|ng|nh|kh|ph|th|tr|ch|gh|gi|qu|[bcdđghklmnpqrstvx])/;
  const VI_FIN = /(ch|ng|nh|[cmnpt])$/;
  const viNoTone = (s) => s.normalize("NFD").replace(/[̣̀́̃̉]/g, "").normalize("NFC").toLowerCase();
  const kataToHira = (s) => Array.from(s).map((c) => { const code = c.charCodeAt(0); return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : c; }).join("");
  function soundExamples(row, cell) {
    const m = row.match; const hits = [];
    const want = (w) => {
      if (C.id === "zh") {
        const sy = pySyllables(w.py); const tone = cell ? (toneSeq(cell.t)[0] || 0) : 0;
        return sy.some((x) => (m.final ? x.f === m.final : true) && (m.initial ? new RegExp("^(" + m.initial + ")$").test(x.i) : true) && (!tone || x.tone === tone));
      }
      if (C.id === "vi") {
        const syl = viNoTone(w.hz).split(/\s+/);
        if (m.vowel) return syl.some((x) => x.includes(m.vowel));
        if (m.initial) { const set = m.initial.split("|"); return syl.some((x) => { const r = x.match(VI_INI); return r && set.includes(r[1]); }); }
        if (m.final) { const set = m.final.split("|"); return syl.some((x) => { const r = x.match(VI_FIN); return r && set.includes(r[1]); }); }
      }
      if (C.id === "ko") {
        if (cell && cell.t && w.hz.includes(cell.t)) return true; // the syllable itself
        if (cell) return false;
        return Array.from(w.hz).some((ch) => { const j = koJamo(ch); return j && (m.initial ? j.i === m.initial : m.vowel ? j.v === m.vowel : j.f === m.final); });
      }
      if (C.id === "ja") {
        const reading = kataToHira(w.kana || "");
        const keys = cell ? [kataToHira(cell.t)] : row.cells.map((c) => kataToHira(c.t)).filter(Boolean);
        return keys.some((k) => k && reading.includes(k));
      }
      return false;
    };
    for (const w of ALL_WORDS) { if (want(w)) { hits.push(w); if (hits.length >= 60) break; } }
    hits.sort((a, b) => a.lvl - b.lvl || a.hz.length - b.hz.length);
    return hits.slice(0, 6);
  }
  const soundPrefs = { group: null, row: 0, view: "focus", slow: false };
  // Isolated syllables get clipped by most voices; a sentence-final mark makes the engine give them full length.
  function speakSound(text, twice) {
    const pad = C.id === "zh" || C.id === "ja" ? "。" : "."; // Korean ends sentences with "."
    const body = /[。.!?！？]$/.test(text) ? text : text + pad;
    speak(twice ? body + " " + body : body, { rate: soundPrefs.slow ? 0.5 : 0.7 });
  }
  function renderSounds(view) {
    if (route[1] === "drill") return renderSoundDrill(view);
    const data = window.SOUNDS && window.SOUNDS[C.id];
    setTopbar(t("sounds") + " · " + C.title.replace(" Trainer", ""), "train");
    if (!data) { view.innerHTML = `<div class="empty">🗣️</div>`; return; }
    let gi = Math.max(0, data.groups.findIndex((x) => x.id === soundPrefs.group)); if (gi < 0) gi = 0;
    const g = data.groups[gi];
    if (soundPrefs.row >= g.rows.length) soundPrefs.row = 0;
    const sep = C.id === "ja" ? "、" : C.id === "zh" ? "，" : ", ";
    const rate = () => (soundPrefs.slow ? 0.5 : 0.7);
    const cellHtml = (r, ri, c, ci) => c.t ? `<button class="scell" data-row="${ri}" data-cell="${ci}" type="button"><span class="scell-t">${esc(c.t)}</span>${c.s && c.s !== c.t ? `<span class="scell-s">${esc(c.s)}</span>` : ""}${c.sub ? `<span class="scell-sub">${esc(c.sub)}</span>` : ""}</button>` : `<span class="scell empty"></span>`;
    const headHtml = g.head && g.head.length ? `<div class="shead-row">${g.head.map((h) => `<div class="scell-h">${esc(h)}</div>`).join("")}</div>` : "";
    const toolbar = `
      <div class="chips" id="sg-chips">${data.groups.map((x) => `<button class="chip ${x === g ? "active" : ""}" data-g="${x.id}" type="button">${esc(L(x.name))}</button>`).join("")}</div>
      <div class="sindex-wrap">
        <div class="chips sindex" id="sindex">${g.rows.map((r, ri) => `<button class="chip lvl ${ri === soundPrefs.row ? "active" : ""}" data-row="${ri}" type="button">${esc(r.base)}</button>`).join("")}</div>
        <div class="stools">
          <button class="btn sm icon ${soundPrefs.slow ? "warn" : "ghost"}" id="s-slow" type="button" title="${t("slow")}">🐢</button>
          <button class="btn sm icon ghost" id="s-view" type="button" title="${soundPrefs.view === "focus" ? t("viewList") : t("viewFocus")}">${soundPrefs.view === "focus" ? "▦" : "▭"}</button>
        </div>
      </div>`;
    if (g.tiles) { // Vietnamese initials (round 2): one tile per letter with a word, N/S where North and South differ
      const south = S.settings.viAccent === "s";
      view.innerHTML = `<div class="chips" id="sg-chips">${data.groups.map((x) => `<button class="chip ${x === g ? "active" : ""}" data-g="${x.id}" type="button">${esc(L(x.name))}</button>`).join("")}</div>
        <div class="list-hint">${t("tapTile")} · ${t(south ? "voiceSouth" : "voiceNorth")}</div>
        <div class="stiles">${g.rows.map((r, ri) => `<button class="stile ${r.ns ? "ns" : ""}" data-tile="${ri}" type="button"><span class="st-l">${esc(r.base)}</span><span class="st-w">${viHtml(r.cells[0].t)} <small>${esc(L(r.gloss))}</small></span>${r.ns ? `<span class="st-ns">N/S</span>` : ""}</button>`).join("")}</div>
        <div class="snote-box"><b>N/S</b> · ${t("nsNote")}</div>
        <div class="snote-box">${t("telexNote")}</div>
        <button class="btn primary block" id="go-drill" type="button" style="margin-top:12px">🎧 ${t("listenPick")}</button>`;
      $$("[data-g]").forEach((b) => (b.onclick = () => { soundPrefs.group = b.dataset.g; soundPrefs.row = 0; render(); }));
      $$("[data-tile]").forEach((b) => (b.onclick = () => { const r = g.rows[+b.dataset.tile]; speak(r.cells[0].t, { rate: rate() }); }));
      $("#go-drill").onclick = () => navigate("sounds/drill");
      return;
    }
    if (soundPrefs.view === "focus") {
      const ri = soundPrefs.row; const r = g.rows[ri];
      const pos = `${ri + 1} / ${g.rows.length}`;
      view.innerHTML = `${toolbar}
        <div class="card sfocus ${g.kana ? "kana" : ""}" id="sfocus">
          <div class="sfocus-head">
            <button class="btn icon" id="s-prev" type="button" aria-label="previous">‹</button>
            <div class="sfocus-title"><div class="sfocus-base">${esc(r.base)}</div><div class="sfocus-pos">${esc(L(g.name))} · ${pos}</div></div>
            <button class="btn icon" id="s-next" type="button" aria-label="next">›</button>
          </div>
          ${headHtml}
          <div class="scells big">${r.cells.map((c, ci) => cellHtml(r, ri, c, ci)).join("")}</div>
          ${r.note ? `<div class="snote focus">${esc(L(r.note))}</div>` : ""}
          <button class="btn block" id="s-playrow" type="button">🔊 ${t("playRow")}</button>
          <div class="sex" id="sex-${ri}" hidden></div>
        </div>
        <div class="kbd-hint">${t("soundKeys")}</div>
        <button class="btn primary block" id="go-drill" type="button" style="margin-top:12px">🎧 ${t("listenPick")}</button>`;
    } else {
      view.innerHTML = `${toolbar}
        <div class="card sound-table ${g.kana ? "kana" : ""}">
          ${g.head && g.head.length ? `<div class="srow shead"><div class="sbase"></div><div class="scells">${g.head.map((h) => `<div class="scell-h">${esc(h)}</div>`).join("")}</div></div>` : ""}
          ${g.rows.map((r, ri) => `
            <div class="srow ${ri === soundPrefs.row ? "current" : ""}" data-row="${ri}" id="srow-${ri}">
              <button class="sbase" data-row="${ri}" type="button" title="${t("playRow")}">${esc(r.base)}</button>
              <div class="scells">${r.cells.map((c, ci) => cellHtml(r, ri, c, ci)).join("")}</div>
            </div>
            ${r.note ? `<div class="snote">${esc(L(r.note))}</div>` : ""}
            <div class="sex" id="sex-${ri}" hidden></div>`).join("")}
        </div>
        <button class="btn primary block" id="go-drill" type="button" style="margin-top:16px">🎧 ${t("listenPick")}</button>`;
    }
    // ---- wiring ----
    const rerender = () => { if (cleanup) { cleanup(); cleanup = null; } renderSounds(view); };
    $$("#sg-chips .chip").forEach((b) => (b.onclick = () => { soundPrefs.group = b.dataset.g; soundPrefs.row = 0; rerender(); }));
    $$("#sindex .chip").forEach((b) => (b.onclick = () => goRow(+b.dataset.row)));
    $("#s-slow").onclick = () => { soundPrefs.slow = !soundPrefs.slow; rerender(); };
    $("#s-view").onclick = () => { soundPrefs.view = soundPrefs.view === "focus" ? "list" : "focus"; rerender(); };
    $("#go-drill").onclick = () => navigate("sounds/drill");
    const activeChip = $("#sindex .chip.active"); if (activeChip && activeChip.scrollIntoView) activeChip.scrollIntoView({ inline: "center", block: "nearest" });
    function goRow(ri, dir) {
      // move across groups at the ends
      if (ri < 0) { const pg = (gi - 1 + data.groups.length) % data.groups.length; soundPrefs.group = data.groups[pg].id; soundPrefs.row = data.groups[pg].rows.length - 1; return rerender(); }
      if (ri >= g.rows.length) { const ng = (gi + 1) % data.groups.length; soundPrefs.group = data.groups[ng].id; soundPrefs.row = 0; return rerender(); }
      soundPrefs.row = ri;
      if (soundPrefs.view === "focus") { rerender(); if (dir) playRow(); }
      else { $$(".srow").forEach((x) => x.classList.toggle("current", +x.dataset.row === ri)); $$("#sindex .chip").forEach((x) => x.classList.toggle("active", +x.dataset.row === ri)); const el = $(`#srow-${ri}`); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); }
    }
    const playRow = () => { const r = g.rows[soundPrefs.row]; speak(r.cells.filter((c) => c.t).map((c) => c.s || c.t).join(sep), { rate: soundPrefs.slow ? 0.5 : 0.7 }); };
    const playCell = (ri, ci) => { const c = g.rows[ri].cells[ci]; if (!c || !c.t) return; speakSound(c.s || c.t, false); showExamples(ri, ci); };
    function showExamples(ri, ci) {
      const r = g.rows[ri]; const cell = ci == null ? null : r.cells[ci];
      $$(".sex").forEach((x) => { x.hidden = true; });
      $$(".scell.active").forEach((x) => x.classList.remove("active"));
      if (cell) { const el = $(`.scell[data-row="${ri}"][data-cell="${ci}"]`); if (el) el.classList.add("active"); }
      const box = $(`#sex-${ri}`); if (!box) return;
      if (!r.match && !(C.id === "ja" && g.kana)) return;
      const ex = soundExamples(r, cell);
      box.hidden = false;
      box.innerHTML = `<div class="sex-title">${t("examplesFor", cell ? cell.t : r.base)}</div>` + (ex.length ? ex.map((w) => `<button class="sex-item" data-id="${w.id}" type="button"><span class="hanzi sex-hz">${w.hz}</span><span class="grow"><span class="sex-py">${w.py}</span><span class="sex-tr">${esc(tr(w))}</span></span><span class="speak-btn sm" data-speak="${esc(w.hz)}">🔊</span></button>`).join("") : `<div class="muted small">${t("noExamples")}</div>`);
      $$(".sex-item", box).forEach((b) => (b.onclick = (e) => { const sp = e.target.closest("[data-speak]"); if (sp) { speak(sp.dataset.speak, { rate: rate() }); return; } openWord(wid(b.dataset.id)); }));
    }
    $$(".scell:not(.empty)").forEach((b) => (b.onclick = () => { soundPrefs.row = +b.dataset.row; playCell(+b.dataset.row, +b.dataset.cell); }));
    $$(".sbase").forEach((b) => (b.onclick = () => { goRow(+b.dataset.row); playRow(); showExamples(+b.dataset.row, null); }));
    if (soundPrefs.view === "focus") {
      $("#s-prev").onclick = () => goRow(soundPrefs.row - 1, -1);
      $("#s-next").onclick = () => goRow(soundPrefs.row + 1, 1);
      $("#s-playrow").onclick = () => { playRow(); showExamples(soundPrefs.row, null); };
      showExamples(soundPrefs.row, null);
      // swipe left/right on the card
      let sx = null; const card = $("#sfocus");
      card.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
      card.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (dx < -60) goRow(soundPrefs.row + 1, 1); else if (dx > 60) goRow(soundPrefs.row - 1, -1); }, { passive: true });
    }
    bindKeys((e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goRow(soundPrefs.row + 1, 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goRow(soundPrefs.row - 1, -1); }
      else if (e.key === "ArrowDown" && soundPrefs.view === "list") { e.preventDefault(); goRow(Math.min(g.rows.length - 1, soundPrefs.row + 1)); }
      else if (e.key === "ArrowUp" && soundPrefs.view === "list") { e.preventDefault(); goRow(Math.max(0, soundPrefs.row - 1)); }
      else if (e.key === " ") { e.preventDefault(); playRow(); }
      else if (/^[1-6]$/.test(e.key)) { playCell(soundPrefs.row, +e.key - 1); }
    });
  }
  const drillPrefs = { cat: "all" };
  function renderSoundDrill(view) {
    const data = window.SOUNDS && window.SOUNDS[C.id]; if (!data) return navigate("sounds");
    setTopbar(t("listenPick"), "sounds");
    const cats = data.drills;
    let pool = drillPrefs.cat === "all" ? cats.flatMap((d) => d.sets.map((set) => ({ set, name: L(d.name) }))) : (cats.find((d) => d.id === drillPrefs.cat) || cats[0]).sets.map((set) => ({ set, name: L((cats.find((d) => d.id === drillPrefs.cat) || cats[0]).name) }));
    const total = 10; let i = 0, correct = 0, answered = false; const mistakes = [];
    const qs = Array.from({ length: total }, () => { const q = pool[Math.floor(Math.random() * pool.length)]; return { ...q, target: q.set[Math.floor(Math.random() * q.set.length)] }; });
    function draw(autoPlay) {
      if (i >= total) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total, mistakes, onAgain: () => renderSoundDrill(view) }); }
      const q = qs[i]; answered = false;
      view.innerHTML = `
        <div class="chips" id="sd-chips"><button class="chip ${drillPrefs.cat === "all" ? "active" : ""}" data-c="all" type="button">${t("allDrills")}</button>${cats.map((d) => `<button class="chip ${drillPrefs.cat === d.id ? "active" : ""}" data-c="${d.id}" type="button">${esc(L(d.name))}</button>`).join("")}</div>
        ${sessionHead(i, total, `✓ ${correct}`)}
        <div class="quiz-q"><div class="q-sub">${esc(q.name)}</div><div class="q-sub">${t("drillPrompt")}</div><div class="row" style="justify-content:center;margin-top:8px"><button class="btn primary" id="q-play" type="button">▶︎ ${t("play")}</button><button class="btn icon ${soundPrefs.slow ? "warn" : ""}" id="q-slow" type="button" title="${t("slow")}">🐢</button><button class="btn icon" id="q-twice" type="button" title="${t("twice")}">×2</button></div><div class="q-sub small">${t("listenHint")}</div></div>
        <div class="options sound-options">${q.set.map((it, k) => `<button class="option ${C.script === "cjk" && !/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(it.t) ? "hanzi" : ""}" data-k="${k}" type="button"><span class="opt-key">${k + 1}</span><span>${esc(it.t)}${it.s && it.s !== it.t ? ` <span class="muted hanzi">${esc(it.s)}</span>` : ""}</span></button>`).join("")}</div>
        <div id="fb"></div><div class="kbd-hint">${t("keys")}</div>`;
      $$("#sd-chips .chip").forEach((b) => (b.onclick = () => { drillPrefs.cat = b.dataset.c; if (cleanup) { cleanup(); cleanup = null; } renderSoundDrill(view); }));
      const play = (twice) => speakSound(q.target.s || q.target.t, twice);
      $("#q-play").onclick = () => play(false); $("#q-twice").onclick = () => play(true);
      $("#q-slow").onclick = () => { soundPrefs.slow = !soundPrefs.slow; $("#q-slow").classList.toggle("warn", soundPrefs.slow); play(false); };
      if (autoPlay) play(false);
      $$(".option").forEach((b) => (b.onclick = () => answer(+b.dataset.k)));
    }
    function answer(k) {
      if (answered) return; answered = true;
      const q = qs[i]; const real = q.set.indexOf(q.target); const ok = k === real;
      $$(".option").forEach((b) => { b.disabled = true; if (+b.dataset.k === real) b.classList.add("correct"); else if (+b.dataset.k === k) b.classList.add("wrong"); });
      recordAnswer(ok); if (ok) correct++; else mistakes.push({ hz: q.target.t, py: q.target.s && q.target.s !== q.target.t ? q.target.s : "", en: q.name, id: "d" + i });
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow"><b>${esc(q.target.t)}</b>${q.target.s && q.target.s !== q.target.t ? ` <span class="hanzi">${esc(q.target.s)}</span>` : ""}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="q-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speakSound(q.target.s || q.target.t, false);
      $("#q-next").onclick = () => { i++; draw(true); };
    }
    bindKeys((e) => { if (/^[1-6]$/.test(e.key) && !answered) { const b = $$(".option")[+e.key - 1]; if (b) b.click(); } else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); i++; draw(true); } else if (e.key === " " && !answered) { e.preventDefault(); $("#q-play").click(); } });
    draw(false);
  }

  /* ================= TODAY ================= */
  // Lessons of the current course, oldest first
  function courseLessons() {
    return Object.entries(S.lessons || {}).filter(([, l]) => !l.gone && l.course === C.id)
      .map(([id, l]) => ({ id, ...l })).sort((a, b) => a.created - b.created);
  }
  // The words of all lessons, each once; newest lesson first when picking new words
  function lessonWords(newestFirst) {
    const seen = new Set(); const out = []; const ls = courseLessons();
    (newestFirst ? ls.reverse() : ls).forEach((l) => l.words.forEach((id) => { if (!seen.has(id) && BY_ID[id]) { seen.add(id); out.push(BY_ID[id]); } }));
    return out;
  }
  function toggleLessonWord(lid, id) {
    const l = S.lessons[lid]; if (!l) return;
    l.words = l.words.includes(id) ? l.words.filter((x) => x !== id) : l.words.concat(id);
    save();
  }
  const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // Today's plan: due reviews (most overdue first) plus a few new words, from the lessons when there are any
  const REVIEW_CAP = 20;
  let extraNew = 0; // "learn more" taps since the app was opened
  const introducedToday = () => ALL_WORDS.filter((w) => { const c = card(w.id); return c && c.first === todayKey(); }).length;
  function planToday() {
    const due = ALL_WORDS.filter((w) => isDue(w.id)).sort((a, b) => card(a.id).due - card(b.id).due).slice(0, S.settings.maxReviews || REVIEW_CAP);
    const lw = lessonWords(true);
    const unseen = (lw.length ? lw : WORDS).filter((w) => status(w.id) === "new");
    const room = Math.max(0, S.settings.newPerDay + extraNew - introducedToday());
    return { due, fresh: unseen.slice(0, room), unseen: unseen.length };
  }

  // A greeting for the time of day, in the language being learnt
  function greeting() {
    const h = new Date().getHours(), part = h < 11 ? 0 : h < 18 ? 1 : 2;
    const g = { zh: [["早上好", "zǎoshang hǎo"], ["下午好", "xiàwǔ hǎo"], ["晚上好", "wǎnshang hǎo"]], ja: [["おはよう", "ohayō"], ["こんにちは", "konnichiwa"], ["こんばんは", "konbanwa"]], ko: [["좋은 아침이에요", "joeun achimieyo"], ["안녕하세요", "annyeonghaseyo"], ["좋은 저녁이에요", "joeun jeonyeogieyo"]], vi: [["Chào buổi sáng", ""], ["Chào buổi chiều", ""], ["Chào buổi tối", ""]] }[C.id][part];
    return { text: g[0], reading: g[1], tr: (S.lang === "de" ? ["Guten Morgen", "Guten Tag", "Guten Abend"] : ["Good morning", "Good afternoon", "Good evening"])[part] };
  }
  // The same word all day: one you have met (or the next to meet) that has a picture
  function wordOfDay() {
    const pics = WORDS.filter((w) => pic(w)), met = pics.filter((w) => status(w.id) !== "new");
    const pool = met.length >= 3 ? met : pics.slice(0, 30);
    return pool.length ? pool[Math.floor(Date.now() / DAY) % pool.length] : null;
  }

  /* ================= LEARN (home) =================
   * From the style canvas: greeting in the language, streak, today's goal, one Continue for the daily session,
   * a word of the day, Review · Listen · Speak, then the next dialogue and your lessons. */
  function renderToday(view) {
    if (route[1] === "session") return startTodaySession(view);
    setTopbar(t("learn"), null);
    document.body.classList.add("home"); // the greeting is the title (mobile)
    const p = planToday();
    const n = dayCount(todayKey()), goal = S.settings.dailyGoal, st = streak();
    const work = p.due.length || p.fresh.length || todaySteps().todo.length;
    const g = greeting(), pf = pyFirst();
    const topic = p.fresh[0] && themes().find((x) => x.id === topicOf(p.fresh[0].id));
    const wd = wordOfDay();
    const tiles = pyFirst() ? ["fùxí", "tīng", "shuō"] : ({ zh: ["复习", "听", "说"], ja: ["復習", "聞く", "話す"], ko: ["복습", "듣기", "말하기"] })[C.id];
    const native = ({ zh: ["继续", "今天的课"], ja: ["続ける", "今日のレッスン"], ko: ["계속", "오늘의 공부"], vi: ["Tiếp tục", "Bài hôm nay"] })[C.id] || ["", ""];
    const days = S.lang === "de" ? (st === 1 ? "Tag" : "Tage") : (st === 1 ? "day" : "days");
    const streakHtml = C.id === "ja" ? `<div class="streak-ja"><b class="hanzi">${st}日</b><span>${t("statsStreak")}</span></div>`
      : C.id === "ko" ? `<div class="streak-pill"><i></i>${st} ${days}</div>`
      : C.id === "vi" ? `<div class="streak-pill dark">${st} ${days}</div>`
      : `<div class="streak-box"><b>${st}</b><span>${days}</span></div>`;
    const f = Math.min(1, n / Math.max(goal, 1));
    const goalBar = C.id === "ko" ? `<div class="goal-blocks">${Array.from({ length: 10 }, (_, k) => `<i class="${k < f * 10 ? "on" : ""}"></i>`).join("")}</div>`
      : `<div class="progress-bar goal-bar"><span style="width:${f * 100}%"></span></div>`;
    const cont = t("continue") + (native[0] ? " · " + native[0] : "");
    const ts = todaySteps(), stepsLeft = ts.todo.length;
    const planText = p.due.length && p.fresh.length ? t("sessionPlan", p.due.length, p.fresh.length) : p.due.length ? t("sessionPlanReviews", p.due.length) : t("sessionPlanNew", p.fresh.length);
    const segs = `<div class="fh-steps cc-steps" style="grid-template-columns:repeat(${ts.steps.length},minmax(0,1fr))">${ts.steps.map((x) => { const done = ts.done.includes(x.kind) || !x.list.length; const cur = !done && x === ts.todo[0]; return `<div class="${done ? "done" : cur ? "cur" : ""}"><i></i><span>${t("seg_" + x.kind)}</span></div>`; }).join("")}</div>`;
    const lessonCard = `<div class="lesson-card">
        ${work || stepsLeft ? `<div class="cc-eyebrow"><span>${t("todaysSession")}</span><span>${t("minAbout", flowMins(ts.todo))}</span></div>
          <div class="cc-title">${planText}</div>${topic ? `<div class="cc-sub">${t("topicLine", esc(L(topic.name)))}</div>` : ""}
          ${segs}
          <button class="btn block cc-btn" id="go-session" type="button">${esc(cont)}</button>`
        : `<div class="cc-title">${n || introducedToday() ? t("sessionDone") : t("sessionTitle")}</div><div class="cc-sub">${n || introducedToday() ? t("sessionDoneSub") : t("sessionEmpty")}</div>
          ${p.unseen ? `<button class="btn block cc-btn" id="more-new" type="button">${t("moreNew", Math.min(5, p.unseen))}</button>` : ""}`}
      </div>`;
    const label = `<span class="wod-label">${t("wordOfDay")}</span>`;
    const say = wd ? `<span class="speak-btn sm" data-speak="${esc(wd.hz)}" aria-label="${t("speak")}">🔊</span>` : "";
    let wod = "";
    if (wd && C.id === "zh") wod = `<button class="card wod" id="wod" type="button">${gridHtml(wd.hz, Array.from(wd.hz).length > 1 ? "sm" : "lg")}
        <span class="grow wod-text">${label}<span class="wod-word">${pyHtml(wd.py)}</span><span class="wod-tr">${esc(tr(wd))}</span><span class="wod-emoji" aria-hidden="true">${pic(wd) || ""}</span></span>${say}</button>`;
    else if (wd && C.id === "ja") wod = `<button class="wod wod-ja" id="wod" type="button"><span class="vword hanzi">${esc(Array.from(wd.hz).slice(0, 4).join(""))}</span>
        <span class="grow wod-text">${label}${wd.kana && wd.kana !== wd.hz ? `<span class="furigana">${esc(wd.kana)}</span>` : ""}<span class="wod-word">${esc(wd.romaji || wd.py)}</span><span class="wod-tr">${esc(tr(wd))}</span><span class="speak-ring" data-speak="${esc(wd.hz)}" aria-label="${t("speak")}">▶</span></span></button>`;
    else if (wd && C.id === "ko") wod = `<button class="card wod-ko" id="wod" type="button"><span class="row"><span class="grow wod-text">${label}<span><span class="hanzi wod-word">${esc(wd.hz)}</span> <span class="wod-tr">${esc(tr(wd))}</span></span></span>${say}</span>
        ${Array.from(wd.hz).filter((c) => koJamo(c)).slice(0, 3).map((c) => { const j = koJamo(c); return `<span class="build"><i class="kb-i">${j.i}</i><i class="kb-v">${j.v}</i>${j.f ? `<i class="kb-f">${j.f}</i>` : ""}<span class="arrow">→</span><b class="hanzi">${c}</b><span class="rom">${esc(window.KO ? KO.romanize(c) : "")}</span></span>`; }).join("")}</button>`;
    else if (wd && C.id === "vi") { const tn = firstToneVi(wd.hz.split(/\s+/)[0]);
      wod = `<button class="card wod wod-vi" id="wod" type="button"><span class="tone-tile tc-${VI_TONE_CLASS[tn]}">${toneSvg(tn)}<b>${VI_TONE_NAMES[tn - 1]}</b></span>
        <span class="grow wod-text">${label}<span class="wod-word hanzi">${viHtml(wd.hz)}</span><span class="wod-tr">${esc(tr(wd))}</span></span><span class="speak-sq" data-speak="${esc(wd.hz)}" aria-label="${t("speak")}">🔊</span></button>`; }
    const quick = C.id === "vi" ? `<div class="card tone-drill" id="tone-drill"><div class="row"><b class="grow">${t("toneQ")}</b><button class="link-btn" id="td-play" type="button">▶ ${t("play")}</button></div>
        <div class="td-grid">${["ma", "mà", "má", "mả", "mã", "mạ"].map((s, k) => `<button class="td tc-${VI_TONE_CLASS[k + 1]}" data-td="${k + 1}" type="button">${s}</button>`).join("")}</div></div>`
      : `<div class="quick-tiles">${[["train/flash", tiles[0], t("stepReview") + (p.due.length ? " · " + p.due.length : ""), p.due.length], ["train/listen", tiles[1], t("stepListen") + " · " + t("minutes", 5)], ["train/say", tiles[2], t("stepSpeak") + " · " + t("words3", 5)]]
          .map(([r, big, small, hot]) => `<button class="qt ${hot ? "hot" : ""}" data-go="${r}" type="button"><span class="qt-big ${pyFirst() ? "py-face" : "hanzi"}">${pyFirst() ? pyHtml(big) : big}</span><span class="qt-small">${small}</span></button>`).join("")}</div>`;
    const next = courseDialogues().find((d) => !dlgDone(d.id)) || null;
    const lessons = courseLessons();
    const best = (S.typer && S.typer[C.id]) || 0;
    const typerCard = C.id === "ja" ? "" : `<div class="desk-typer desk-only"><span class="eyebrow">${t("bestOnMac")}</span><b>${t(C.id === "zh" ? "typerRaceZh" : "typerRace")}</b><span>${best ? t("bestWpm", best) + " · " : ""}${t(C.id === "zh" ? "typerHintZh" : C.id === "vi" ? "typerHintVi" : "typerHintKo")}</span><button class="btn seal" data-go="train/typer" type="button">${t("start")} · T</button></div>`;
    view.innerHTML = `
      <div class="learn-page">
      <div class="learn">
      <div class="learn-head">
        <div class="grow">
          <button class="course-switch" id="course-switch" type="button">${esc(t("langName"))} · ${esc(levelLabel())} ▾</button>
          ${C.id === "zh" ? (pf ? `<div class="greet py-big">${pyHtml(g.reading)}</div><div class="greet-sub">${g.text} · ${esc(g.tr)}</div>` : `<div class="greet-ruby">${pyHtml(g.reading)}</div><div class="greet hanzi">${g.text}</div><div class="greet-sub">${esc(g.tr)}</div>`)
            : `<div class="greet hanzi">${C.id === "vi" ? viHtml(g.text) : esc(g.text)}</div><div class="greet-sub">${g.reading ? esc(g.reading) + " · " : ""}${esc(g.tr)}</div>`}
        </div>
        ${streakHtml}
      </div>
      <div class="goal-row"><span>${t("goalToday")}</span><b>${n} / ${goal}</b></div>
      ${goalBar}
      ${lessonCard}
      ${wod}
      ${typerCard}
      ${quick}
      </div>
      ${next ? nextDialogueHtml(next) : ""}
      <div class="rule-block">
        <div class="rule-head"><span>${t("myLessons")}</span><button class="link-btn" id="new-lesson" type="button">＋ ${t("lessonNew")}</button></div>
        ${lessons.length ? lessons.slice().reverse().slice(0, 3).map((l) => { const ws = l.words.filter((id) => BY_ID[id]), k = ws.filter((id) => status(id) === "known").length, pc = ws.length ? Math.round((k / ws.length) * 100) : 0;
          return `<button class="lesson-line" data-lesson="${l.id}" type="button"><span class="ll-row"><span class="ll-name">${esc(l.name)}</span><span class="ll-meta">${t("lessonWords", ws.length)} · ${pc}%</span></span><span class="ll-bar"><i style="width:${pc}%"></i></span></button>`; }).join("") + `<button class="link-btn" data-go="lessons" type="button">${t("allLessons")} →</button>`
          : `<div class="list-hint">${t("lessonEmpty")}</div>`}
      </div>
      ${DEV.code && (sync.state === "offline" || sync.state === "error") ? `<div class="state-card sync-card"><div class="row"><span class="sc-dot"></span><span class="grow"><b>${t("cantReach")}</b><span class="small">${sync.state === "offline" ? t("offlineWord") : t("syncFailed")}${DEV.last ? " · " + t("syncLast", ago(DEV.last)) : ""}</span></span></div><p>${t("savedHereSync")}</p><div class="row"><button class="btn grow" id="sync-retry" type="button">${t("tryAgain")}</button><button class="btn grow" data-go="more/sync" type="button">${t("syncCode")}</button></div></div>`
        : DEV.code ? `<div class="sync-line" id="sync-line"><i class="${sync.state && sync.state !== "ok" ? "off" : ""}"></i>${syncStatusText()}</div>` : ""}
      </div>`;
    // Desktop: T starts the typing race
    bindKeys((e) => { if (C.id !== "ja" && (e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); navigate("train/typer"); } });
    if ($("#go-session")) $("#go-session").onclick = () => navigate("today/session");
    if ($("#sync-retry")) $("#sync-retry").onclick = () => { syncNow(); toast(t("syncing")); };
    if ($("#more-new")) $("#more-new").onclick = () => { extraNew += 5; navigate("today/session"); };
    $("#course-switch").onclick = openCourseSheet;
    if ($("#wod")) $("#wod").onclick = (e) => { if (e.target.closest("[data-speak]")) speak(wd.hz); else openWord(wd.id); };
    $$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
    $$("[data-dlg]").forEach((b) => (b.onclick = () => navigate("lessons/d/" + b.dataset.dlg)));
    bindLessonList(lessons);
    if ($("#tone-drill")) { // Vietnamese: which tone did you hear?
      const syl = ["ma", "mà", "má", "mả", "mã", "mạ"];
      let target = 1 + Math.floor(Math.random() * 6), picked = 0;
      const play = () => speak(syl[target - 1] + ".", { rate: 0.7 });
      $("#td-play").onclick = play;
      $$("[data-td]").forEach((b) => (b.onclick = () => {
        if (picked) { picked = 0; target = 1 + Math.floor(Math.random() * 6); $$("[data-td]").forEach((x) => x.classList.remove("right", "wrong")); play(); return; }
        picked = +b.dataset.td; recordAnswer(picked === target);
        $(`[data-td="${target}"]`).classList.add("right"); if (picked !== target) b.classList.add("wrong");
      }));
    }
  }
  // The next dialogue on Learn: its first line, and which of Listen · Read aloud · Role play are done
  function nextDialogueHtml(d) {
    const all = courseDialogues(), st = dlgState(d.id), l0 = d.lines[0];
    const line = C.id === "zh" && pyFirst() ? `<div class="nd-line py-face">${pyHtml(l0.py)}</div><div class="nd-sub"><span class="hanzi">${esc(l0.hz)}</span> · ${esc(L(l0))}</div>`
      : `<div class="nd-line hanzi">${C.id === "vi" ? viHtml(l0.hz) : esc(l0.hz)}</div><div class="nd-sub">${l0.py && C.id !== "vi" ? (C.id === "zh" ? pyHtml(l0.py) : esc(l0.py)) + " · " : ""}${esc(L(l0))}</div>`;
    return `<button class="rule-block nd" data-dlg="${d.id}" type="button">
      <div class="rule-head"><span>${t("nextDialogue")}</span><span>${esc(L(d.topic))} · ${t("dlgOf", all.indexOf(d) + 1, all.length)}</span></div>
      ${line}
      <div class="mode-ticks">${DLG_MODES.map((m) => `<span class="${st[m] ? "on" : ""}">${st[m] ? icon("check") : "<i></i>"}${t("dlg_" + m)}</span>`).join("")}</div>
    </button>`;
  }
  // Your lessons as a list with progress (Learn and the dialogues page)
  function lessonListHtml(lessons) {
    return lessons.length ? `<div class="list">${lessons.slice().reverse().map((l) => {
      const ws = l.words.filter((id) => BY_ID[id]); const k = ws.filter((id) => status(id) === "known").length; const lr = ws.filter((id) => status(id) === "learning").length;
      return `<button class="list-item" data-lesson="${l.id}" type="button"><span class="li-ico">${icon("lessons")}</span><span class="grow"><div class="li-title">${esc(l.name)}</div><div class="li-sub">${t("lessonWords", ws.length)} · ${t("knownOf", k, ws.length)}</div><div class="progress-bar lesson-bar"><span class="green" style="width:${ws.length ? (k / ws.length) * 100 : 0}%"></span><span class="gold" style="width:${ws.length ? (lr / ws.length) * 100 : 0}%"></span></div></span><span class="li-chev">›</span></button>`;
    }).join("")}</div>` : `<div class="card list-hint" style="margin:0">${t("lessonEmpty")}</div>`;
  }
  function bindLessonList(lessons) {
    $("#new-lesson").onclick = () => {
      const id = newId("l");
      S.lessons[id] = { course: C.id, name: t("lessonDefault", lessons.length + 1), words: [], created: Date.now() };
      save(); navigate("lessons/" + id);
    };
    $$("[data-lesson]").forEach((b) => (b.onclick = () => navigate("lessons/" + b.dataset.lesson)));
  }

  /* ================= WORD FAMILIES (js/families.js) =================
   * Small sets to see side by side: opposites (and the word they make together, 大 + 小 → 大小 "size"),
   * the same syllable with another tone, one part inside many words, one Korean final consonant. */
  let famCache = null;
  function families() {
    if (famCache && famCache.course === C.id && famCache.n === ALL_WORDS.length) return famCache.sets;
    const raw = (window.FAMILIES && window.FAMILIES[C.id]) || [];
    const find = (x) => {
      const hz = typeof x === "string" ? x : x.hz, py = typeof x === "string" ? null : x.py;
      const w = ALL_WORDS.find((v) => !isOwn(v.id) && (v.hz === hz || v.hz.split(/\s*;\s*/).includes(hz)) && (!py || v.py === py));
      return w || (typeof x === "object" && x.en ? { id: "f:" + hz, hz, py: x.py || "", en: x.en, de: x.de, inline: true } : null);
    };
    const sets = raw.map((f, k) => ({ ...f, k, items: f.words.map(find).filter(Boolean), whole: f.whole ? { id: "f:" + f.whole.hz, inline: true, ...f.whole } : null })).filter((f) => f.items.length >= 2);
    famCache = { course: C.id, n: ALL_WORDS.length, sets };
    return sets;
  }
  const familiesOf = (id) => families().filter((f) => f.items.some((w) => w.id === id));
  const famReading = (w) => C.id === "zh" ? pyHtml(w.py) : C.id === "vi" ? viHtml(w.hz) : esc(w.hz);
  const famSub = (w) => C.id === "zh" ? `<span class="hanzi">${esc(w.hz)}</span>` : C.id === "vi" ? "" : esc(C.id === "ja" ? w.romaji || w.py : w.py);
  // A family in one line: words with · between them (and = the word they make)
  const famLine = (f) => f.items.map((w) => `<span class="${C.id === "zh" ? "" : "hanzi"}">${famReading(w)}</span>`).join(" · ") + (f.whole ? ` <span class="fam-eq">→ ${famReading(f.whole)}</span>` : "");
  function familyCardHtml(f, here) {
    return `<div class="fam-mini"><div class="fam-mini-words">${f.items.map((w) => `<button class="fam-chip ${w.id === here ? "on" : ""}" data-fam-say="${esc(w.hz)}" type="button"><b>${famReading(w)}</b><span>${esc(tr(w))}</span></button>`).join("")}</div>
      ${f.whole ? `<div class="fam-whole"><span class="fam-eq">${t("together")}</span> <b>${famReading(f.whole)}</b> ${C.id === "zh" ? `<span class="hanzi">${esc(f.whole.hz)}</span> ` : ""}· ${esc(tr(f.whole))}</div>` : ""}
      <button class="link-btn" data-go="families/${f.k}" type="button">${t("compare")} →</button></div>`;
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-fam-say]"); if (b) speak(b.dataset.famSay); });
  const FAM_KINDS = ["pair", "tone", "final", "build"];
  function renderFamilies(view) {
    if (route[1] === "quiz") return runFamilyQuiz(view, route[2] !== undefined ? [families().find((f) => f.k === +route[2])].filter(Boolean) : families());
    if (route[1] !== undefined) return renderFamily(view, +route[1]);
    setTopbar(t("modeFamilies"), "train");
    document.body.classList.add("home");
    const fs = families();
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("modeFamilies")}</div><div class="fh-sub">${t("famSub", fs.length)}</div></div><button class="btn sm primary" data-go="families/quiz" type="button">${t("whichOne")}</button></div>
      ${FAM_KINDS.filter((k) => fs.some((f) => f.kind === k)).map((k) => `<section class="skill2"><div class="sk2-head"><span class="sk2-name">${t("fam_" + k)}</span><span class="sk2-note">${fs.filter((f) => f.kind === k).length}</span></div>
        ${fs.filter((f) => f.kind === k).map((f) => `<button class="sk2-row" data-go="families/${f.k}" type="button"><span class="grow"><span class="sk2-t fam-line">${famLine(f)}</span><span class="sk2-s">${f.items.map((w) => esc(tr(w).split(/[;,(]/)[0].trim())).join(" · ")}${f.whole ? " → " + esc(tr(f.whole).split(/[;,(]/)[0]) : ""}</span></span>${icon("chev")}</button>`).join("")}</section>`).join("")}`;
    $("#pg-back").onclick = () => navigate("train");
    $$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
  }
  // One family side by side: a card per word (picture, reading, meaning, the tone where that is the difference)
  function renderFamily(view, k) {
    const fs = families(), f = fs.find((x) => x.k === k);
    if (!f) return navigate("families");
    setTopbar(t("modeFamilies"), "families");
    document.body.classList.add("home");
    const pos = fs.indexOf(f), nextF = fs[(pos + 1) % fs.length];
    const toneOf = (w) => C.id === "zh" ? toneBadge(w) : C.id === "vi" ? toneBadge(w) : C.id === "ko" && f.kind === "final" ? (() => { const ch = Array.from(w.hz).find((c, j) => f.items.some((o) => Array.from(o.hz)[j] !== c)) || Array.from(w.hz).slice(-1)[0], jm = koJamo(ch); return jm ? `<span class="ch-jamo"><i class="kb-i">${jm.i}</i><i class="kb-v">${jm.v}</i><i class="${jm.f ? "kb-f" : "kb-none"}">${jm.f || ""}</i></span>` : ""; })() : "";
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("fam_" + f.kind)}</div><div class="fh-sub">${t("dlgOf", pos + 1, fs.length)}</div></div></div>
      <div class="fam-grid n${Math.min(f.items.length, 4)}">${f.items.map((w) => `
        <button class="fam-card" data-fam-say="${esc(w.hz)}" type="button">
          ${pic(w) ? `<span class="fam-pic" aria-hidden="true">${pic(w)}</span>` : ""}
          <span class="fam-word ${C.id === "zh" || C.id === "vi" ? "" : "hanzi"}">${famReading(w)}</span>
          ${famSub(w) ? `<span class="fam-sub">${famSub(w)}</span>` : ""}
          ${f.kind === "tone" || f.kind === "final" ? toneOf(w) : ""}
          <span class="fam-tr">${esc(tr(w))}</span>
          <span class="fam-play">${icon("speaker")}</span>
        </button>`).join("")}</div>
      ${f.whole ? `<div class="fam-sum"><span class="fam-plus">${f.items.map((w) => `<span class="hanzi">${esc(w.hz)}</span>`).join(" + ")} →</span>
        <button class="fam-card wide" data-fam-say="${esc(f.whole.hz)}" type="button"><span class="fam-word">${famReading(f.whole)}</span>${C.id === "zh" ? `<span class="fam-sub"><span class="hanzi">${esc(f.whole.hz)}</span></span>` : ""}<span class="fam-tr">${esc(tr(f.whole))}</span><span class="fam-play">${icon("speaker")}</span></button></div>` : ""}
      ${f.note ? `<div class="say-tip">${esc(L(f.note))}</div>` : ""}
      <div class="tr-btns two"><button class="btn primary" data-go="families/quiz/${f.k}" type="button">${t("whichOne")}</button><button class="btn" data-go="families/${nextF.k}" type="button">${t("nextFamily")} →</button></div>`;
    $("#pg-back").onclick = () => navigate("families");
    $$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
  }
  // Which one? Hear a word (or see its meaning) and pick it among its family
  function runFamilyQuiz(view, sets) {
    setTopbar(t("whichOne"), "families");
    document.body.classList.add("home");
    const qs = [];
    const pool = shuffle(sets.slice());
    const want = sets.length === 1 ? 6 : 10; // one family: each word a few times; all families: one question each
    for (let k = 0; qs.length < want && k < want * 2; k++) { const f = pool[k % pool.length]; qs.push({ f, w: f.items[Math.floor(Math.random() * f.items.length)], listen: !noVoice() && f.kind !== "build" && Math.random() < 0.6 }); }
    let i = 0, correct = 0, answered = false; const mistakes = [];
    runMarks = []; runT0 = Date.now(); runWhy = {}; runMode = { mode: "families", again: (ws) => runFamilyQuiz(view, sets.filter((f) => ws.some((w) => f.items.includes(w)))) };
    function draw() {
      if (i >= qs.length) return showResult(view, { correct, total: qs.length, mistakes });
      const q = qs[i]; answered = false;
      view.innerHTML = `${sessionHead(i, qs.length, `✓ ${correct}`)}
        <div class="ch-head"><div class="caps">${t("fam_" + q.f.kind)}</div><div class="muted">${q.listen ? t("famQListen") : t("famQMeaning")}</div></div>
        <div class="quiz-q">${q.listen ? `<button class="btn primary" id="q-play" type="button">${icon("play")} ${t("play")}</button>` : `<div class="q-text">${esc(tr(q.w))}</div>`}</div>
        <div class="fam-grid n${Math.min(q.f.items.length, 4)}">${shuffle(q.f.items.slice()).map((w) => `<button class="fam-card opt" data-pick="${esc(w.id)}" type="button"><span class="fam-word ${C.id === "zh" || C.id === "vi" ? "" : "hanzi"}">${famReading(w)}</span>${famSub(w) ? `<span class="fam-sub">${famSub(w)}</span>` : ""}<span class="fam-tr" hidden>${esc(tr(w))}</span></button>`).join("")}</div>
        <div id="fb"></div>`;
      if ($("#q-play")) { $("#q-play").onclick = () => speak(q.w.hz); speak(q.w.hz); }
      $$("[data-pick]").forEach((b) => (b.onclick = () => {
        if (answered) return; answered = true;
        const ok = b.dataset.pick === String(q.w.id), x = q.f.items.find((w) => String(w.id) === b.dataset.pick);
        $$("[data-pick]").forEach((o) => { o.disabled = true; o.querySelector(".fam-tr").hidden = false; if (o.dataset.pick === String(q.w.id)) o.classList.add("correct"); else if (o === b) o.classList.add("wrong"); });
        if (!q.w.inline) grade(q.w.id, ok ? 2 : 0);
        recordAnswer(ok);
        if (ok) correct++; else if (!mistakes.includes(q.w)) { mistakes.push(q.w); noteMiss(q.w, t("whyPicked", tr(x))); }
        $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow">${famReading(q.w)} · ${esc(tr(q.w))}</span><button class="speak-btn sm" data-fam-say="${esc(q.w.hz)}" type="button">🔊</button></div><button class="btn primary block" id="q-next" type="button" style="margin-top:12px">${t("next")}</button>`;
        $("#q-next").onclick = () => { i++; draw(); };
        if (!q.listen) speak(q.w.hz);
      }));
    }
    bindKeys((e) => { if (/^[1-4]$/.test(e.key) && !answered) { const b = $$("[data-pick]")[+e.key - 1]; if (b) b.click(); } else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); i++; draw(); } });
    draw();
  }

  /* ================= MY LESSONS and DIALOGUES (round 2) ================= */
  const isOwn = (id) => typeof id === "string" && id[0] === "u";
  const lessonDate = (ms) => new Date(ms).toLocaleDateString(S.lang === "de" ? "de-DE" : "en-GB", { weekday: "short", day: "numeric", month: "short" });
  function lessonStats(l) {
    const ws = l.words.filter((id) => BY_ID[id]), k = ws.filter((id) => status(id) === "known").length;
    return { ws, own: ws.filter(isOwn).length, pct: ws.length ? Math.round((k / ws.length) * 100) : 0 };
  }
  function newLesson() {
    const id = newId("l");
    S.lessons[id] = { course: C.id, name: t("lessonDefault", courseLessons().length + 1), words: [], created: Date.now() };
    save(); navigate("lessons/" + id);
  }
  function renderLessons(view) {
    if (route[1] === "d" && route[2]) return renderDialogue(view, route[2], route[3]);
    if (route[1] === "paste") return renderPaste(view, null);
    if (route[1]) return route[2] === "practice" ? startLessonSession(view, route[1]) : route[2] === "paste" ? renderPaste(view, route[1]) : renderLesson(view, route[1]);
    setTopbar(t("myLessons"), "today");
    document.body.classList.add("home");
    const ls = courseLessons().slice().reverse();
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("myLessons")}</div><div class="fh-sub">${t("lessonsSub")}</div></div><button class="btn sm" data-go="lessons/paste" type="button">${t("pasteShort")}</button><button class="btn sm" id="new-lesson" type="button">＋ ${t("newShort")}</button></div>
      ${ls.length ? `<div class="lesson-list">${ls.map((l, k) => { const st = lessonStats(l);
        return `<div class="lrow ${k === 0 ? "cur" : ""}"><button class="lrow-main" data-lesson="${l.id}" type="button"><span class="lrow-n">${ls.length - k}</span><span class="grow"><span class="lrow-name">${esc(l.name)}</span><span class="lrow-meta">${lessonDate(l.created)} · ${t("lessonWords", st.ws.length)}${st.own ? " · " + t("ownN", st.own) : ""}</span><span class="ll-bar"><i style="width:${st.pct}%"></i></span></span><span class="lrow-pct">${st.pct}%</span></button>
          ${st.ws.length ? `<button class="sq-btn" data-practise="${l.id}" type="button" aria-label="${t("practiseLessonN", ls.length - k)}">${icon("play")}</button>` : ""}</div>`; }).join("")}</div>`
        : `<div class="state-card"><div class="sc-ico">${icon("lessons")}</div><b>${t("noLessonsYet")}</b><p>${t("noLessonsText")}</p><div class="row" style="justify-content:center"><button class="btn primary" id="first-lesson" type="button">＋ ${t("firstLesson")}</button><button class="btn" data-go="lessons/paste" type="button">${t("pasteShort")}</button></div></div>`}
      <div class="say-tip"><b>${t("afterClass")}</b> · ${t("afterClassText")}</div>`;
    $("#pg-back").onclick = () => navigate("today");
    $("#new-lesson").onclick = newLesson;
    if ($("#first-lesson")) $("#first-lesson").onclick = newLesson;
    $$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
    $$("[data-lesson]").forEach((b) => (b.onclick = () => navigate("lessons/" + b.dataset.lesson)));
    $$("[data-practise]").forEach((b) => (b.onclick = () => navigate("lessons/" + b.dataset.practise + "/practice")));
  }
  function renderDialogues(view) {
    setTopbar(t("dialogues"), "today");
    document.body.classList.add("home");
    const dl = courseDialogues();
    const first = (d) => { const l0 = d.lines[0]; return C.id === "zh" ? (pyFirst() ? `<span class="py-face">${pyHtml(l0.py)}</span> <span class="hanzi muted">${esc(l0.hz)}</span>` : `<span class="hanzi">${esc(l0.hz)}</span> <span class="muted">${esc(l0.py)}</span>`) : C.id === "vi" ? viHtml(l0.hz) : `<span class="hanzi">${esc(l0.hz)}</span>`; };
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("dialogues")}</div><div class="fh-sub">${t("dlgTopicsDone", dl.length, dl.filter((d) => dlgDone(d.id)).length)}</div></div></div>
      ${dl.length ? `<div class="mt-legend"><span><b>L</b> ${t("dlg_listen")}</span><span><b>R</b> ${t("dlg_read")} · ${t("timed")}</span><span><b>P</b> ${t("dlg_turn")}</span></div>
      <div class="dlg-list">${dl.map((d, k) => { const st = dlgState(d.id); return `<button class="drow" data-dlg="${d.id}" type="button"><span class="drow-n">${String(k + 1).padStart(2, "0")}</span><span class="grow"><span class="drow-t">${esc(L(d.topic))}</span><span class="drow-f">${first(d)}</span><span class="drow-l">${t("linesN", d.lines.length)}</span></span><span class="ticks">${DLG_MODES.map((m, j) => `<i class="${st[m] ? "on" : ""}">${"LRP"[j]}</i>`).join("")}</span></button>`; }).join("")}</div>
      <div class="free-card"><div class="grow"><b>${t("modeFree")} <span class="new-badge">${t("newBadge")}</span></b><span>${t("freeSub")}</span></div><button class="btn primary" id="free" type="button">${t("start")}</button></div>`
      : `<div class="state-card"><b>${t("noDialogues")}</b></div>`}`;
    $("#pg-back").onclick = () => navigate("today");
    $$("[data-dlg]").forEach((b) => (b.onclick = () => navigate("lessons/d/" + b.dataset.dlg)));
    if ($("#free")) $("#free").onclick = () => navigate("lessons/d/" + dl[Math.floor(Math.random() * dl.length)].id + "/turn");
  }

  /* ================= DIALOGUES ================= */
  const courseDialogues = () => (window.DIALOGUES && window.DIALOGUES[C.id]) || [];
  const DLG_MODES = ["listen", "read", "turn"];
  const dlgState = (id) => { const x = S.dlg[id]; return x && !x.gone ? x : {}; };
  const dlgDone = (id) => DLG_MODES.every((m) => dlgState(id)[m]);
  function dlgMark(id, patch) { S.dlg[id] = { ...dlgState(id), ...patch }; save(); }
  const fmtTime = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  function dialogueRow(d) {
    const st = dlgState(d.id);
    return `<button class="list-item" data-dlg="${d.id}" type="button"><span class="li-ico">${icon("chat")}</span>
      <span class="grow"><div class="li-title">${esc(L(d.topic))}</div>
      <div class="dlg-steps">${DLG_MODES.map((m) => `<span class="dlg-step ${st[m] ? "done" : ""}">${st[m] ? "✓ " : ""}${t("dlg_" + m)}</span>`).join("")}${st.read && st.read.best ? `<span class="dlg-step">${t("bestTime", fmtTime(st.read.best))}</span>` : ""}</div></span>
      <span class="li-chev">›</span></button>`;
  }
  // Pinyin split into words that can be tapped for their meaning
  const pyTapWords = (py) => py.split(/(\s+)/).map((tok) => (/\S/.test(tok) ? `<span class="w" data-w="${esc(tok)}">${pyHtml(tok)}</span>` : tok)).join("");
  function lookupPy(tok) {
    const key = (s) => s.normalize("NFC").toLowerCase().replace(/[^\p{L}]/gu, "");
    const k = key(tok); if (!k) return null;
    return ALL_WORDS.find((w) => key(w.py) === k) || ALL_WORDS.find((w) => stripTones(w.py) === stripTones(tok)) || null;
  }
  let dlgGen = 0;
  function renderDialogue(view, id, mode) {
    const gen = ++dlgGen, alive = () => gen === dlgGen && !!$("#chat");
    const d = courseDialogues().find((x) => x.id === id);
    if (!d) return navigate("dialogues");
    if (!DLG_MODES.includes(mode)) mode = "listen";
    setTopbar(L(d.topic), "dialogues");
    const st = dlgState(id);
    const zhPf = pyFirst();
    const opt = () => ({ hz: zhPf ? !!S.settings.dlgHz : true, tr: S.settings.dlgTr !== false, slow: !!S.settings.dlgSlow, py: S.settings.dlgPy !== false && C.id !== "vi" });
    const nameOf = (who) => (zhPf ? esc(d.people[who].py) : d.people[who].hz);
    const say = (text, onend) => speak(text, { rate: opt().slow ? 0.55 : S.settings.rate, onend });
    // A chat bubble (style canvas): the other person on the left with an avatar, you on the right in the dark bubble;
    // the reading line above, the translation under it, Play and 0.75×
    function bubble(l, k, extra, mine) {
      const o = opt(), right = mine === undefined ? !!l.who : mine;
      const main = C.id === "zh" ? (zhPf ? (right ? esc(l.py) : pyTapWords(l.py)) : `<span class="hanzi">${l.hz}</span>`) : C.id === "vi" ? (right ? esc(l.hz) : viHtml(l.hz)) : `<span class="hanzi">${esc(l.hz)}</span>`;
      const above = C.id === "zh" && !zhPf && o.py ? `<div class="b-sub">${right ? esc(l.py) : pyTapWords(l.py)}</div>` : "";
      const below = C.id === "zh" ? (zhPf && o.hz ? `<div class="b-sub hanzi">${l.hz}</div>` : "") : (C.id === "ko" || C.id === "ja") && o.py ? `<div class="b-sub">${esc(l.py)}</div>` : "";
      return `<div class="b-row ${right ? "right" : "left"}">${right ? "" : `<span class="avatar hanzi" aria-hidden="true">${esc(Array.from(d.people[l.who].hz)[0])}</span>`}
        <div class="bubble ${right ? "right" : "left"} ${extra && extra.cls ? extra.cls : ""}" data-line="${k}">
        ${above}<div class="b-main">${main}</div>${below}
        ${o.tr ? `<div class="b-tr">${esc(L(l))}</div>` : ""}
        ${l.tip ? `<div class="tip-chip"><b>${t("tipTitle")}</b> · ${esc(L(l.tip))}</div>` : ""}
        <div class="b-btns"><button class="b-btn" data-play="${k}" type="button">▶ ${t("play")}</button><button class="b-btn" data-slow="${k}" type="button">0.75×</button></div>
        ${extra && extra.html ? extra.html : ""}
      </div></div>`;
    }
    const toggles = `${zhPf ? `<button class="tg ${opt().hz ? "on" : ""}" data-opt="dlgHz" type="button" aria-label="${t("showHz")}">汉</button>`
      : C.id !== "vi" ? `<button class="tg ${opt().py ? "on" : ""}" data-opt="dlgPy" type="button" aria-label="${t("readingLayer")}">${({ zh: "拼", ja: "あ", ko: "Aa" })[C.id] || "Aa"}</button>` : ""}
      <button class="tg ${opt().tr ? "on" : ""}" data-opt="dlgTr" type="button" aria-label="${t("showTr")}">${S.lang.toUpperCase()}</button>`;
    view.innerHTML = `
      <div class="dlg-bar"><div class="dlg-tabs">${DLG_MODES.map((m) => `<button data-mode="${m}" class="${m === mode ? "active" : ""}" type="button">${st[m] ? "✓ " : ""}${m === "turn" ? t("rolePlay") : t("dlg_" + m)}</button>`).join("")}</div><div class="dlg-toggles">${toggles}</div></div>
      <p class="list-hint">${mode === "turn" ? "" : t("dlg_" + mode + "Hint")}</p>
      <div class="chat" id="chat"></div>
      <div id="dlg-foot" class="dlg-foot"></div>`;
    $$("[data-mode]").forEach((b) => (b.onclick = () => navigate(`lessons/d/${id}/${b.dataset.mode}`)));
    $$("[data-opt]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.opt; S.settings[k] = !(k === "dlgTr" || k === "dlgPy" ? S.settings[k] !== false : !!S.settings[k]); save();
      b.classList.toggle("on", k === "dlgTr" || k === "dlgPy" ? S.settings[k] !== false : !!S.settings[k]); redraw();
    }));
    // Tapping a word shows its meaning; tapping elsewhere on a bubble plays the line
    $("#chat").onclick = (e) => {
      const w = e.target.closest(".w");
      if (w) { const hit = lookupPy(w.dataset.w); if (hit) { toast(`${hit.py} · ${hit.hz} · ${tr(hit)}`); speak(hit.hz); } return; }
      const pb = e.target.closest("[data-play],[data-slow]");
      if (pb) { const l = d.lines[+(pb.dataset.play ?? pb.dataset.slow)]; speak(l.hz, { rate: pb.dataset.slow !== undefined ? 0.6 : S.settings.rate }); return; }
      const b = e.target.closest(".bubble"); if (b && !e.target.closest("button")) say(d.lines[+b.dataset.line].hz);
    };
    let redraw;
    if (mode === "listen") runDlgListen(); else if (mode === "read") runDlgRead(); else runDlgTurn();

    function runDlgListen() {
      let playing = -1, token = 0;
      redraw = () => {
        if (!alive()) return;
        $("#chat").innerHTML = d.lines.map((l, k) => bubble(l, k, { cls: k === playing ? "playing" : "" })).join("");
        $("#dlg-foot").innerHTML = playing < 0
          ? `<div class="row"><button class="btn primary grow" id="d-play" type="button">${icon("play")} ${t("playAll")}</button><button class="chip ${opt().slow ? "active" : ""}" id="d-slow" type="button">🐢 ${t("slowly")}</button></div>`
          : `<button class="btn block" id="d-stop" type="button">${icon("stop")} ${t("stop")}</button>`;
        if ($("#d-play")) $("#d-play").onclick = () => { const my = ++token; step(0, my); };
        if ($("#d-slow")) $("#d-slow").onclick = () => { S.settings.dlgSlow = !S.settings.dlgSlow; save(); redraw(); };
        if ($("#d-stop")) $("#d-stop").onclick = () => { token++; playing = -1; speechSynthesis.cancel(); redraw(); };
      };
      function step(k, my) {
        if (my !== token || !alive()) return;
        if (k >= d.lines.length) { playing = -1; dlgMark(id, { listen: todayKey() }); redraw(); return; }
        playing = k; redraw();
        const el = $(`.bubble[data-line="${k}"]`); if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        let moved = false;
        const go = () => { if (moved) return; moved = true; setTimeout(() => step(k + 1, my), 450); };
        say(d.lines[k].hz, go);
        // Safari sometimes skips onend: move on after a generous estimate
        setTimeout(go, 1500 + Array.from(d.lines[k].hz).length * (opt().slow ? 700 : 420));
      }
      cleanup = () => { token++; };
      redraw();
    }

    function runDlgRead() {
      const res = d.lines.map(() => null); // { score, hit, text, ms, url }
      redraw = () => {
        if (!alive()) return;
        $("#chat").innerHTML = d.lines.map((l, k) => bubble(l, k, { cls: res[k] ? (res[k].score >= 0.8 ? "good" : "weak") : "", html: `<div class="b-act">${micButton(k)}${res[k] ? resultHtml(l, res[k]) : ""}</div>` }, false)).join("");
        const doneN = res.filter(Boolean).length;
        const total = res.reduce((a, r) => a + (r ? r.ms : 0), 0);
        const acc = doneN ? res.reduce((a, r) => a + (r ? r.score : 0), 0) / doneN : 0;
        $("#dlg-foot").innerHTML = `<div class="read-sum">${doneN}/${d.lines.length} · ${t("readTime", fmtTime(total))}${st.read && st.read.best ? ` · ${t("bestTime", fmtTime(st.read.best))}` : ""}${doneN && SR_OK() ? ` · ${Math.round(acc * 100)}%` : ""}</div>`;
        bindMics($("#chat"), (k) => d.lines[k], (k, r) => {
          res[k] = r;
          if (res.every(Boolean)) {
            const ms = res.reduce((a, x) => a + x.ms, 0), accAll = res.reduce((a, x) => a + x.score, 0) / res.length;
            const prev = dlgState(id).read || {};
            dlgMark(id, { read: { best: Math.min(prev.best || Infinity, ms), last: ms, acc: Math.round(accAll * 100) } });
          }
          redraw();
        });
      };
      redraw();
    }

    // Role play: a random role; pick your reply from two, then say it (or type it). A good recording moves on,
    // otherwise Retry or Next.
    function runDlgTurn() {
      let me = Math.floor(Math.random() * d.people.length), i = 0, right = 0, hint = 0, chosen = false, wrongPick = null, typing = false, attempt = null, replies = [];
      const shown = []; // { k, res }
      const myLines = () => d.lines.map((l, k) => (l.who === me ? k : -1)).filter((k) => k >= 0);
      const makeReplies = () => {
        const l = d.lines[i], others = d.lines.filter((x, k) => k !== i && x.hz !== l.hz);
        const other = shuffle(others.filter((x) => x.who === l.who))[0] || shuffle(others)[0];
        replies = shuffle([l].concat(other ? [other] : []));
      };
      const resetTurn = () => { hint = 0; chosen = false; wrongPick = null; typing = false; attempt = null; replies = []; };
      redraw = () => {
        if (!alive()) return;
        $("#chat").innerHTML = `<div class="list-hint">${t("rolePlay")} · ${t("youAre", nameOf(me))}</div>` + shown.map((x) => bubble(d.lines[x.k], x.k, x.res ? { cls: x.res.ok === false ? "weak" : "", html: x.res.html ? `<div class="b-act">${x.res.html}</div>` : "" } : null, d.lines[x.k].who === me)).join("");
        const foot = $("#dlg-foot");
        foot.classList.toggle("composer", i < d.lines.length && d.lines[i].who === me);
        if (i >= d.lines.length) {
          foot.innerHTML = `<div class="card center"><div class="hero-title">${t("dlgTurnDone", right, myLines().length)}</div>
            <div class="row" style="margin-top:12px"><button class="btn grow" id="t-swap" type="button">${t("switchRole")}</button><button class="btn primary grow" id="t-again" type="button">${t("again")}</button></div></div>`;
          $("#t-swap").onclick = () => { me = (me + 1) % d.people.length; i = 0; right = 0; shown.length = 0; resetTurn(); advance(); };
          $("#t-again").onclick = () => { i = 0; right = 0; shown.length = 0; resetTurn(); advance(); };
          return;
        }
        const l = d.lines[i];
        if (l.who !== me) { foot.innerHTML = ""; return; }
        if (!replies.length) makeReplies();
        const n = myLines().indexOf(i) + 1;
        const line = (x) => (C.id === "vi" ? viHtml(x.hz) : zhPf ? pyHtml(x.py) : `<span class="hanzi">${esc(x.hz)}</span>`);
        const hintTxt = hint === 0 ? "" : C.id === "zh" ? l.py : l.py || l.hz;
        foot.innerHTML = `
          <div class="cp-head"><b>${t("pickReply")}</b><span>${n} / ${myLines().length}</span></div>
          ${!chosen ? `<div class="cp-replies">${replies.map((x, k) => `<button class="cp-reply ${wrongPick === k ? "wrong" : ""}" data-reply="${k}" type="button"><span>${line(x)}</span>${opt().tr ? `<small>${esc(L(x))}</small>` : ""}</button>`).join("")}</div>`
            : `<div class="cp-line">${C.id === "zh" && !zhPf && opt().py ? `<div>${pyHtml(hint ? l.py : l.py.split(/\s+/).map((w) => w.replace(/^([^a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]*)(.)(.*)$/, (_, a, b, c) => a + b + c.replace(/[\p{L}]/gu, "·"))).join(" "))}</div>` : ""}<div class="cp-main">${line(l)}</div>${hintTxt && C.id !== "zh" ? `<div class="small muted">${esc(hintTxt)}</div>` : ""}</div>
              ${attempt ? `<div class="cp-attempt">${attempt.html}<button class="btn sm" id="t-next" type="button">${t("next")}</button></div>` : ""}
              ${typing ? `<form class="row turn-type" id="turn-form"><input class="type-input" name="a" type="text" placeholder="${esc(t("typeOr"))}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${C.tts}"><button class="btn" type="submit">${t("check")}</button></form>` : ""}`}
          <div class="cp-actions">
            <button class="cp-side" id="t-hint" type="button">💡<span>${t("hint")}</span></button>
            <div class="turn-mic big">${micButton("turn")}</div>
            ${attempt ? `<button class="cp-side" id="t-retry" type="button">↺<span>${t("retry")}</span></button>` : `<button class="cp-side" id="t-type" type="button">⌨️<span>${t("typeIt")}</span></button>`}
          </div>`;
        $$("[data-reply]").forEach((b) => (b.onclick = () => {
          const x = replies[+b.dataset.reply];
          if (x.hz === l.hz) { chosen = true; wrongPick = null; speak(l.hz, { rate: 0.75 }); } else wrongPick = +b.dataset.reply;
          redraw();
        }));
        $("#t-hint").onclick = () => { if (chosen) hint++; else wrongPick = replies.findIndex((x) => x.hz !== l.hz); redraw(); };
        if ($("#t-type")) $("#t-type").onclick = () => { chosen = true; typing = !typing; redraw(); if ($("#turn-form")) $("#turn-form").a.focus(); };
        if ($("#t-retry")) $("#t-retry").onclick = () => { attempt = null; redraw(); };
        if ($("#t-next")) $("#t-next").onclick = () => answer(attempt.r);
        if ($("#turn-form")) {
          const input = $("#turn-form").a;
          if (C.id === "zh") input.addEventListener("input", (e) => liveToneMarks(e, input));
          $("#turn-form").onsubmit = (e) => { e.preventDefault(); if (input.value.trim()) answer(checkTyped(l, input.value)); };
        }
        bindMics(foot, () => l, (_, r) => {
          chosen = true;
          const res = r.mode === "rec" ? { ok: r.self, rec: r } : { ok: r.score >= 0.8, heard: r };
          if (res.ok) answer(res); else { attempt = { r: res, html: resultHtml(l, r) }; redraw(); }
        });
      };
      function answer(r) {
        const l = d.lines[i];
        if (r.ok) right++;
        const msg = r.skipped ? "" : r.heard ? `<div class="heard ${r.ok ? "ok" : "bad"}">${Math.round(r.heard.score * 100)}%${r.heard.text ? " · " + esc(t("heardAs", r.heard.text)) : ""}</div>` : r.rec ? "" : `<div class="heard ${r.ok ? "ok" : "bad"}">${r.ok ? (r.tones === false ? t("tonesMissing") : "✓ " + t("correct")) : r.tonesWrong ? t("tonesWrong") : "✗ " + t("wrong")}</div>`;
        shown.push({ k: i, res: { ok: r.ok, html: msg } });
        say(l.hz);
        i++; resetTurn(); advance(true);
      }
      // Play the other person's lines until it is my turn again
      function advance(afterMine) {
        if (!alive()) return;
        redraw();
        const l = d.lines[i];
        if (!l || l.who === me) { if (i >= d.lines.length) { dlgMark(id, { turn: { best: Math.max((dlgState(id).turn || {}).best || 0, right), last: right } }); redraw(); } return; }
        setTimeout(() => {
          if (!alive()) return;
          shown.push({ k: i, res: null }); i++;
          redraw();
          const el = $("#chat .b-row:last-child"); if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
          let moved = false; const go = () => { if (moved) return; moved = true; setTimeout(() => advance(), 300); };
          say(l.hz, go); setTimeout(go, 1500 + Array.from(l.hz).length * 420);
        }, afterMine ? 1400 : 200);
      }
      advance();
    }
  }
  // Typed answer in a dialogue: pinyin (tones optional, but if typed they must match) or the characters
  function checkTyped(l, v) {
    if (/[\p{Script=Han}\p{Script=Hangul}]/u.test(v)) return { ok: matchHeard(l.hz, [v]).score >= 0.9 };
    if (C.id === "ko") return { ok: koTyped(v, l.hz) };
    if (C.id !== "zh") return { ok: hasDiacritics(v) ? norm(v) === norm(l.hz) && v.normalize("NFC").toLowerCase().replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ").trim() === l.hz.normalize("NFC").toLowerCase().replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ").trim() : norm(v) === norm(l.hz) };
    const clean = (s) => s.replace(/[:;：，。！？、]/g, "");
    if (stripTones(clean(v)) !== stripTones(clean(l.py))) return { ok: false };
    if (!toneSeq(v).length) return { ok: true, tones: false };
    const mine = pyParts(clean(v)).filter((x) => !x.sep), want = pyParts(clean(l.py)).filter((x) => !x.sep);
    if (mine.length !== want.length) { const same = toneSeq(v).join("") === toneSeq(l.py).join(""); return { ok: same, tonesWrong: !same }; }
    // Only syllables you gave a tone are checked; untoned ones are just "not typed"
    const wrong = mine.some((x, k) => x.tone !== 5 && x.tone !== want[k].tone);
    const missing = mine.some((x, k) => x.tone === 5 && want[k].tone !== 5);
    return { ok: !wrong, tonesWrong: wrong, tones: missing ? false : undefined };
  }

  /* ---------------- Speaking: speech recognition, with recording as the fallback ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC = { rec: null, cap: null, srBroken: false };
  const SR_OK = () => !!SR && !MIC.srBroken;
  const AC = window.AudioContext || window.webkitAudioContext;
  const CAN_RECORD = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && AC);
  // Units to compare: characters for Chinese and Japanese, words for Vietnamese; digits become number words
  function unitsOf(s) {
    const x = String(s).replace(/\d+/g, (m) => (+m <= 99 ? numToHanzi(+m) + (C.id === "vi" ? " " : "") : m));
    return C.id === "vi" ? x.normalize("NFC").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean) : Array.from(x).filter((c) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(c));
  }
  // Which target units were heard (longest common subsequence over the recogniser's alternatives)
  function matchHeard(target, alts) {
    const tc = unitsOf(target); let best = { score: 0, hit: tc.map(() => false), text: alts[0] || "" };
    alts.forEach((a) => {
      const hc = unitsOf(a), n = tc.length, m = hc.length;
      const Lm = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) Lm[i][j] = tc[i] === hc[j] ? Lm[i + 1][j + 1] + 1 : Math.max(Lm[i + 1][j], Lm[i][j + 1]);
      const hit = tc.map(() => false); let i = 0, j = 0;
      while (i < n && j < m) { if (tc[i] === hc[j]) { hit[i] = true; i++; j++; } else if (Lm[i + 1][j] >= Lm[i][j + 1]) i++; else j++; }
      const score = n ? Lm[0][0] / n : 0;
      if (score > best.score || !best.text) best = { score, hit, text: a };
    });
    return best;
  }
  function hearOnce() {
    return new Promise((resolve, reject) => {
      if (TTS.available) speechSynthesis.cancel();
      const r = new SR(); MIC.rec = r;
      r.lang = C.tts; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
      let got = [];
      r.onresult = (e) => { got = Array.from(e.results[0] || []).map((a) => a.transcript); };
      r.onerror = (e) => { MIC.rec = null; reject(e.error || "error"); };
      r.onend = () => { MIC.rec = null; resolve(got); };
      try { r.start(); } catch (e) { MIC.rec = null; reject("start"); }
    });
  }
  /* ---------------- Voice capture: raw samples for playback and pitch, all on the device ---------------- */
  const CAP_RATE = 16000;
  // Records the microphone; stops by itself once you have spoken and gone quiet (or after 6 s).
  // Returns a handle whose stop() resolves to { samples (16 kHz), url (WAV), ms }.
  function startCapture(onAutoStop) {
    const ctx = new AC(); // created inside the tap so iOS lets it run
    const cap = { chunks: [], t0: Date.now(), heard: false, quiet: 0, done: false, nodes: [], stream: null };
    cap.ready = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then((stream) => {
      cap.stream = stream;
      const src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(2048, 1, 1);
      proc.onaudioprocess = (e) => {
        const x = e.inputBuffer.getChannelData(0); cap.chunks.push(new Float32Array(x));
        let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i];
        if (Math.sqrt(s / x.length) > 0.02) { cap.heard = true; cap.quiet = 0; } else if (cap.heard) cap.quiet += x.length / ctx.sampleRate;
        if (!cap.done && ((cap.heard && cap.quiet > 0.8) || Date.now() - cap.t0 > 6000)) { cap.done = true; if (onAutoStop) onAutoStop(); }
      };
      src.connect(proc); proc.connect(ctx.destination); // the processor only runs when connected; its output is silent
      cap.nodes = [src, proc];
      return ctx.resume ? ctx.resume() : null;
    });
    cap.stop = async () => {
      cap.done = true;
      try { await cap.ready; } catch (e) { ctx.close(); throw e; }
      cap.nodes.forEach((n) => n.disconnect());
      cap.stream.getTracks().forEach((tr) => tr.stop()); // releases the mic: iOS then plays speech at full volume again
      const rate = ctx.sampleRate; ctx.close();
      const all = new Float32Array(cap.chunks.reduce((a, c) => a + c.length, 0)); let o = 0;
      cap.chunks.forEach((c) => { all.set(c, o); o += c.length; });
      const samples = resample(all, rate, CAP_RATE);
      return { samples, ms: Date.now() - cap.t0, url: URL.createObjectURL(wavBlob(samples, CAP_RATE)) };
    };
    return cap;
  }
  function resample(x, from, to) {
    if (from === to) return x;
    const n = Math.floor((x.length * to) / from), out = new Float32Array(n), step = from / to;
    for (let i = 0; i < n; i++) { const p = i * step, k = Math.floor(p), f = p - k; out[i] = x[k] * (1 - f) + (x[k + 1] || 0) * f; }
    return out;
  }
  function wavBlob(x, rate) {
    const buf = new ArrayBuffer(44 + x.length * 2), v = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, "RIFF"); v.setUint32(4, 36 + x.length * 2, true); str(8, "WAVEfmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, x.length * 2, true);
    for (let i = 0; i < x.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x[i])) * 0x7fff, true);
    return new Blob([buf], { type: "audio/wav" });
  }

  /* ---------------- Pitch and tones ----------------
   * YIN pitch tracking every 10 ms, split into syllables, each syllable's contour compared with the
   * shape of the tone it should have. A rough guide, not a verdict: it shows what to change. */
  function pitchTrack(x, sr) {
    const hop = Math.round(sr * 0.01), W = Math.round(sr * 0.032), tMin = Math.floor(sr / 450), tMax = Math.floor(sr / 70);
    const d = new Float32Array(tMax + 1), frames = [];
    for (let s = 0; s + W + tMax < x.length; s += hop) {
      let e = 0; for (let j = 0; j < W; j++) e += x[s + j] * x[s + j];
      let run = 0, tau = -1;
      for (let k = 1; k <= tMax; k++) {
        let sum = 0; for (let j = 0; j < W; j++) { const v = x[s + j] - x[s + j + k]; sum += v * v; }
        run += sum; d[k] = run ? (sum * k) / run : 1;
      }
      for (let k = tMin; k <= tMax; k++) if (d[k] < 0.15) { while (k < tMax && d[k + 1] < d[k]) k++; tau = k; break; }
      let f0 = null;
      if (tau > 0) { const a = d[tau - 1], b = d[tau], c = tau < tMax ? d[tau + 1] : b, den = a - 2 * b + c; const p = den ? (a - c) / (2 * den) : 0; f0 = sr / (tau + (Math.abs(p) < 1 ? p : 0)); }
      frames.push({ rms: Math.sqrt(e / W), f0 });
    }
    const maxR = Math.max(0, ...frames.map((f) => f.rms));
    frames.forEach((f) => { if (f.rms < Math.max(0.008, maxR * 0.12)) f.f0 = null; });
    // Octave errors: fold values far from the median back; then a 5-frame median filter
    const med = median(frames.filter((f) => f.f0).map((f) => f.f0));
    frames.forEach((f) => { if (f.f0 && f.f0 > med * 1.7) f.f0 /= 2; else if (f.f0 && f.f0 < med * 0.6) f.f0 *= 2; });
    return frames.map((f, i) => (f.f0 ? { f0: median(frames.slice(Math.max(0, i - 2), i + 3).filter((g) => g.f0).map((g) => g.f0)) } : { f0: null }));
  }
  function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
  // Voiced stretches (short gaps bridged, tiny blips dropped) as arrays of frame indices
  function voicedRuns(frames) {
    const runs = []; let cur = null, gap = 0;
    frames.forEach((f, i) => {
      if (f.f0) { if (cur && gap <= 3) cur.push(i); else { cur = [i]; runs.push(cur); } gap = 0; }
      else gap++;
    });
    return runs.filter((r) => r.length >= 4).map((r) => r.filter((i) => frames[i].f0));
  }
  // Tone shapes on a 1–5 scale (5 = high), five points each; the 3rd tone stays low inside words
  const TONE_SHAPES = { 1: [4.5, 4.5, 4.5, 4.5, 4.5], 2: [2.8, 3.1, 3.6, 4.2, 4.8], 3: [2.2, 1.6, 1.2, 1.3, 1.8], 4: [4.8, 4.2, 3.3, 2.4, 1.6] };
  const TONE3_END = [2.2, 1.5, 1.2, 2, 3.3]; // a 3rd tone at the end may rise again
  function toneCheck(py, frames) {
    const sylls = pyParts(py).filter((x) => !x.sep);
    // Tone change: 3rd + 3rd is said 2nd + 3rd (nǐ hǎo → ní hǎo)
    const want = sylls.map((x) => x.tone);
    let sandhi = false;
    for (let i = 0; i < want.length - 1; i++) if (want[i] === 3 && want[i + 1] === 3) { want[i] = 2; sandhi = true; }
    let runs = voicedRuns(frames);
    if (!runs.length || runs.flat().length < sylls.length) return { none: true };
    const n = sylls.length;
    while (runs.length > n) { // merge across the smallest gap
      let k = 0, g = Infinity;
      for (let i = 0; i < runs.length - 1; i++) { const gi = runs[i + 1][0] - runs[i][runs[i].length - 1]; if (gi < g) { g = gi; k = i; } }
      runs.splice(k, 2, runs[k].concat(runs[k + 1]));
    }
    while (runs.length < n) { // split the longest stretch in two
      let k = 0; runs.forEach((r, i) => { if (r.length > runs[k].length) k = i; });
      const r = runs[k], h = Math.ceil(r.length / 2); runs.splice(k, 1, r.slice(0, h), r.slice(h));
    }
    const all = runs.flat().map((i) => frames[i].f0), med = median(all), base = S.settings.f0base;
    const center = base ? (n > 1 ? Math.sqrt(base * med) : base) : med;
    S.settings.f0base = Math.round(base ? Math.pow(base, 0.85) * Math.pow(med, 0.15) : med); save(); // your voice's middle, learnt over time
    const level = (f0) => Math.max(0.3, Math.min(5.7, 3 + (12 * Math.log2(f0 / center)) / 3.5));
    const res = sylls.map((x, i) => {
      const lv = runs[i].map((k) => level(frames[k].f0));
      const cut = lv.length >= 10 ? Math.floor(lv.length * 0.15) : 0; // edges are consonants and creak
      const core = lv.slice(cut, lv.length - cut || undefined);
      const pts = [0, 1, 2, 3, 4].map((b) => { const part = core.slice(Math.floor((b * core.length) / 5), Math.max(Math.floor(((b + 1) * core.length) / 5), Math.floor((b * core.length) / 5) + 1)); return part.reduce((a, v) => a + v, 0) / part.length; });
      const w = want[i];
      if (w === 5) return { text: x.text, want: w, lv, ok: null };
      const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
      const dist = (tpl) => { const ms = mean(pts), mt = mean(tpl); return pts.reduce((s, v, j) => s + ((v - ms) - (tpl[j] - mt)) ** 2, 0) / 5 + 0.3 * (ms - mt) ** 2; };
      const ds = { 1: dist(TONE_SHAPES[1]), 2: dist(TONE_SHAPES[2]), 3: Math.min(dist(TONE_SHAPES[3]), i === n - 1 ? dist(TONE3_END) : Infinity), 4: dist(TONE_SHAPES[4]) };
      const got = +Object.keys(ds).reduce((a, b) => (ds[b] < ds[a] ? b : a));
      const ok = got === w || ds[w] <= ds[got] + 0.35;
      const slope = pts[4] - pts[0], m = mean(pts);
      const tip = ok ? "" : w === 1 ? (Math.abs(slope) > 1.2 ? "tipFlat" : "tipHigher") : w === 2 ? "tipRise" : w === 3 ? "tipLower" : "tipFall";
      return { text: x.text, want: w, got, ok, lv, tip, m };
    });
    const scored = res.filter((r) => r.ok !== null);
    return { res, sandhi, score: scored.length ? scored.filter((r) => r.ok).length / scored.length : 1 };
  }
  // Your pitch (solid) over the tone shape (dashed), one column per syllable
  function pitchChart(a) {
    if (a.none) return `<div class="heard bad">${t("noVoice")}</div>`;
    const CW = 110, H = 132, top = 8, bottom = 30, n = a.res.length;
    const y = (lv) => (top + ((5.5 - lv) / 5) * (H - top - bottom)).toFixed(1);
    const grid = [1, 2, 3, 4, 5].map((lv) => `<line x1="0" x2="${n * CW}" y1="${y(lv)}" y2="${y(lv)}" class="pc-grid"/>`).join("");
    const cols = a.res.map((r, i) => {
      const x0 = i * CW + 14, x1 = (i + 1) * CW - 14, xs = (j, len) => (x0 + (len > 1 ? (j / (len - 1)) * (x1 - x0) : (x1 - x0) / 2)).toFixed(1);
      const shape = r.want === 3 && i === n - 1 ? TONE3_END : TONE_SHAPES[r.want];
      const target = shape ? `<polyline class="pc-target tn${r.want}" points="${shape.map((v, j) => `${xs(j, 5)},${y(v)}`).join(" ")}"/>` : "";
      const you = r.lv.length > 1 ? `<polyline class="pc-you" points="${r.lv.map((v, j) => `${xs(j, r.lv.length)},${y(v)}`).join(" ")}"/>` : `<circle class="pc-dot" cx="${xs(0, 1)}" cy="${y(r.lv[0])}" r="3"/>`;
      const mark = r.ok === null ? "" : r.ok ? " ✓" : " ✗";
      return `${i ? `<line class="pc-sep" x1="${i * CW}" x2="${i * CW}" y1="${top}" y2="${H - bottom + 4}"/>` : ""}${target}${you}
        <text x="${(x0 + x1) / 2}" y="${H - 8}" class="pc-label tn${r.want}" text-anchor="middle">${esc(r.text)}${mark}</text>`;
    }).join("");
    const notes = a.res.filter((r) => r.ok === false).map((r) => `<li><b class="tn${r.want}">${esc(r.text)}</b>: ${t("toneLike", r.got)}. ${t(r.tip)}.</li>`).join("");
    return `<div class="pitch ${a.score === 1 ? "ok" : "bad"}">
      <svg class="pitch-chart" viewBox="0 0 ${n * CW} ${H}" style="max-width:${n * CW * 1.5}px" role="img" aria-label="${esc(t("pitchHint"))}">${grid}${cols}</svg>
      <div class="pitch-msg">${a.score === 1 ? t("toneAllGood") : `<ul>${notes}</ul>`}</div>
      ${a.sandhi ? `<div class="small muted">${t("sandhiNote")}</div>` : ""}
      <div class="small muted">${t("pitchHint")}</div>
    </div>`;
  }

  const micButton = (k) => `<button class="mic-btn" data-mic="${k}" type="button">${icon("speak")}<span>${SR_OK() ? t("speakBtn") : t("record")}</span></button>`;
  const playBtns = (url) => `<button class="btn sm" data-play-url="${url}" type="button">▶ ${t("playMine")}</button>`;
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-play-url]"); if (b) new Audio(b.dataset.playUrl).play(); });
  // Wire every mic button in root. getTarget(k) → { hz, py } to say; done(k, result) receives
  //   { mode: "sr", score, hit, text, ms }                 speech recognition (words)
  //   { mode: "pitch", score, tones, url, ms }             tone curve (Chinese words, opts.pitch)
  //   { mode: "rec", url, ms, self, score }                recording, self-rated
  function bindMics(root, getTarget, done, opts) {
    const pitch = !!(opts && opts.pitch) && C.id === "zh" && CAN_RECORD;
    $$("[data-mic]", root).forEach((b) => {
      if (pitch) b.querySelector("span").textContent = t("speakBtn");
      b.onclick = async () => {
        const k = b.dataset.mic, label = b.querySelector("span"), target = getTarget(k);
        const idle = () => { b.classList.remove("live"); label.textContent = pitch || SR_OK() ? t("speakBtn") : t("record"); };
        if (!pitch && SR_OK()) {
          if (MIC.rec) { MIC.rec.stop(); return; }
          b.classList.add("live"); label.textContent = t("listening");
          const t0 = Date.now();
          try {
            const alts = await hearOnce();
            done(k, { mode: "sr", ...matchHeard(target.hz, alts), ms: Date.now() - t0 });
          } catch (err) {
            idle();
            if (["not-allowed", "service-not-allowed", "start", "audio-capture", "network", "language-not-supported"].includes(err)) { MIC.srBroken = true; idle(); if (opts && opts.onDenied && /not-allowed|audio-capture/.test(err)) opts.onDenied(); else toast(t("micBlocked")); }
            else if (err === "no-speech") toast(t("heardNo"));
          }
          return;
        }
        if (!CAN_RECORD) { if (opts && opts.onDenied) opts.onDenied(); else toast(t("noMic")); return; }
        if (MIC.cap) { MIC.cap.finish(); return; } // second tap stops early
        if (TTS.available) speechSynthesis.cancel();
        let finished = false;
        const cap = startCapture(() => cap.finish());
        MIC.cap = cap;
        cap.finish = async () => {
          if (finished) return; finished = true; MIC.cap = null;
          let rec; try { rec = await cap.stop(); } catch (e) { if (!cap.aborted) { idle(); if (opts && opts.onDenied) opts.onDenied(); else toast(t("noMic")); } return; }
          if (cap.aborted) return;
          idle();
          if (pitch) {
            const tones = toneCheck(target.py, pitchTrack(rec.samples, CAP_RATE));
            if (!tones.none) recordTones(tones);
            done(k, { mode: "pitch", tones, score: tones.none ? 0 : tones.score, url: rec.url, ms: rec.ms });
            return;
          }
          // Recording without a check: listen to yourself next to the model and rate it
          const box = document.createElement("div"); box.className = "self-rate";
          box.innerHTML = `<div class="row">${playBtns(rec.url)}<button class="btn sm" data-p="model" type="button">▶ ${t("playModel")}</button></div>
            <div class="small muted">${t("rateSelfQ")}</div><div class="rate3"><button class="btn" data-r="0" type="button">${t("notYet")}</button><button class="btn" data-r="0.6" type="button">${t("closeEnough")}</button><button class="btn" data-r="1" type="button">${t("gotIt")}</button></div>`;
          const host = opts && opts.rateHost && $(opts.rateHost);
          if (host) host.replaceChildren(box); else b.after(box);
          box.querySelector('[data-p="model"]').onclick = () => speak(target.hz);
          new Audio(rec.url).play();
          $$("[data-r]", box).forEach((x) => (x.onclick = () => { box.remove(); done(k, { mode: "rec", url: rec.url, ms: rec.ms, self: x.dataset.r === "1", score: +x.dataset.r }); }));
        };
        b.classList.add("live"); label.textContent = t("listening");
        cap.ready.catch(() => cap.finish());
      };
    });
  }
  // Feedback under a spoken line or word
  function resultHtml(l, r) {
    if (r.mode === "pitch") return `${pitchChart(r.tones)}<div class="row">${playBtns(r.url)}<button class="btn sm" data-say-model="${esc(l.hz)}" type="button">▶ ${t("playModel")}</button></div>`;
    if (r.mode === "rec") return `<div class="heard ${r.self ? "ok" : "bad"}">${r.score >= 1 ? "✓ " + t("gotIt") : r.score > 0 ? "≈ " + t("closeEnough") : "↺ " + t("notYet")} ${playBtns(r.url)}</div>`;
    const msg = r.score >= 0.8 ? t("heardGreat") : r.score >= 0.4 ? t("heardAlmost") : t("heardNo");
    let line = "";
    const parts = C.id === "zh" ? pyParts(l.py) : [];
    if (parts.filter((x) => !x.sep).length === r.hit.length && r.hit.length) {
      let k = 0;
      line = parts.map((x) => (x.sep ? esc(x.text) : `<span class="${r.hit[k++] ? "tn" + x.tone : "missed"}">${esc(x.text)}</span>`)).join("");
    }
    return `<div class="heard ${r.score >= 0.8 ? "ok" : "bad"}"><div>${msg} <b>${Math.round(r.score * 100)}%</b></div>${line ? `<div class="heard-line">${line}</div>` : ""}${r.text ? `<div class="small muted">${t("heardAs", esc(r.text))}</div>` : ""}${r.score < 1 && r.text ? heardHint(l, r.text) : ""}</div>`;
  }
  // What went wrong, where the language makes it clear: a Korean final consonant that was missing or different,
  // a Japanese long vowel or small っ that was not held
  function heardHint(l, heard) {
    if (C.id === "ko") {
      const want = Array.from(l.hz.replace(/[^\uAC00-\uD7A3]/g, "")), got = Array.from(heard.replace(/[^\uAC00-\uD7A3]/g, ""));
      for (let k = 0; k < Math.min(want.length, got.length); k++) {
        const a = koJamo(want[k]), b = koJamo(got[k]);
        if (a && b && a.i === b.i && a.v === b.v && a.f !== b.f) return `<div class="heard-tip">${a.f ? t("koFinalMissing", got[k], a.f) : t("koFinalExtra", got[k], b.f)}</div>`;
      }
    }
    if (C.id === "ja" && l.kana) { const h = kataToHira(heard.replace(/[。、！？\s]/g, "")); if (h !== kataToHira(l.kana) && jaShort(h) === jaShort(l.kana)) return `<div class="heard-tip">${t("jaHold", esc(l.romaji || l.py))}</div>`; }
    return "";
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-say-model]"); if (b) speak(b.dataset.sayModel); });

  /* --- Say the word (round 2): the word, then after speaking: tones right, the model and your curve,
   * what was heard, one tip, Play mine / Play model; without a recogniser you rate yourself (Not yet · Close · Got it) --- */
  function runSay(view, list) {
    let i = 0, correct = 0, skipped = 0; const mistakes = [];
    function draw() {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length - skipped, mistakes, onAgain: () => navigate("train/say") }); }
      const w = list[i]; let res = null;
      const reading = C.id === "zh" ? (pyFirst() ? `<div class="say-word">${pyHtml(w.py)}</div><div class="say-sub"><span class="hanzi">${esc(w.hz)}</span> · ${esc(tr(w))}</div>` : `<div class="say-word hanzi">${esc(w.hz)}</div><div class="say-sub">${pyHtml(w.py)} · ${esc(tr(w))}</div>`)
        : C.id === "vi" ? `<div class="say-word">${viHtml(w.hz)}</div><div class="say-sub">${esc(tr(w))}</div>`
        : `<div class="say-word hanzi">${esc(w.hz)}</div><div class="say-sub">${esc(w.py)} · ${esc(tr(w))}</div>`;
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}
        <div class="say2">
          <div class="say2-card">${picHtml(w, "say-pic")}<div class="grow">${reading}</div><div class="say-score" id="say-score" hidden></div></div>
          <div id="say-res"><div class="say-idle"><button class="btn" id="m-say" type="button">${icon("play")} ${t("playModel")}</button><div class="small muted">${t("sayHint")}</div></div></div>
        </div>
        <div class="say2-foot"><button class="btn ghost" id="s-skip" type="button">${t("skip")}</button><div class="say-mic">${micButton("w")}</div><button class="btn" id="s-next" type="button">${t("next")} →</button></div>`;
      $("#m-say").onclick = () => speak(w.hz);
      $("#s-skip").onclick = () => { skipped++; i++; draw(); };
      $("#s-next").onclick = () => {
        if (!res) { skipped++; i++; return draw(); }
        const ok = res.score >= 0.8;
        grade(w.id, ok ? 2 : res.score > 0 ? 1 : 0); recordAnswer(ok);
        if (ok) correct++; else { mistakes.push(w); noteMiss(w, res.tones && res.tones.res && res.tones.res.some((x) => x.ok === false) ? t("whyTones") : t("whyNotHeard")); }
        i++; draw();
      };
      bindMics(view, () => w, (_, r) => {
        res = r;
        const box = $("#say-score");
        if (r.mode === "pitch" && !r.tones.none) { const sc = r.tones.res.filter((x) => x.ok !== null); box.innerHTML = `<b>${sc.filter((x) => x.ok).length} / ${sc.length}</b><span>${t("tonesRightShort")}</span>`; box.hidden = false; }
        else if (r.mode === "sr") { box.innerHTML = `<b>${Math.round(r.score * 100)}%</b><span>${t("heardShort")}</span>`; box.hidden = false; }
        $("#say-res").innerHTML = (r.mode === "pitch" ? `<div class="pc-legend"><span><i></i>${t("model")}</span><span><i class="you"></i>${t("you")}</span></div>` : "") + resultHtml(w, r)
          + (r.mode === "pitch" ? "" : `<div class="row" style="margin-top:8px"><button class="btn sm" data-say-model="${esc(w.hz)}" type="button">▶ ${t("playModel")}</button></div>`);
        $("#s-next").classList.add("primary");
      }, { rateHost: "#say-res", onDenied: () => {
        $("#say-res").innerHTML = `<div class="state-card warn"><b>${t("micOffTitle")}</b><p>${t("micOffText")}</p><button class="btn" id="s-rate" type="button">${t("rateMyself")}</button></div>`;
        $(".say-mic .mic-btn").disabled = true;
        $("#s-rate").onclick = () => {
          speak(w.hz);
          $("#say-res").innerHTML = `<div class="self-rate"><div class="small muted">${t("rateSelfAloud")}</div><div class="rate3"><button class="btn" data-r="0" type="button">${t("notYet")}</button><button class="btn" data-r="0.6" type="button">${t("closeEnough")}</button><button class="btn" data-r="1" type="button">${t("gotIt")}</button></div></div>`;
          $$("#say-res [data-r]").forEach((b) => (b.onclick = () => { res = { mode: "self", score: +b.dataset.r }; $("#say-res").innerHTML = `<div class="heard ${res.score >= 1 ? "ok" : "bad"}">${res.score >= 1 ? "✓ " + t("gotIt") : res.score > 0 ? "≈ " + t("closeEnough") : "↺ " + t("notYet")}</div>`; $("#s-next").classList.add("primary"); }));
        };
      }, pitch: w.py.split(/\s+/).length <= 2 && pyParts(w.py).filter((x) => !x.sep).length <= 4 });
    }
    draw();
  }

  /* --- Guided session (style canvas, round 2): Meet · Cards · Listen · Say · Type. Every exercise shows the
   * session header (close, step title, step and item count, minutes left, five labelled segments); each step's
   * showResult hands over to the next. Today's progress is kept on this device so Continue picks up where you left. --- */
  const FLOW_SECS = { meet: 25, review: 10, listen: 8, speak: 20, write: 15 };
  const FLOW_KEY = "lt.flow";
  const flowSaved = () => { try { const x = JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); return x && x.day === todayKey() && x.course === C.id ? x : null; } catch (e) { return null; } };
  const flowSave = (x) => { try { localStorage.setItem(FLOW_KEY, JSON.stringify({ ...x, day: todayKey(), course: C.id })); } catch (e) { /* private mode */ } };
  const flowMins = (steps) => Math.max(1, Math.round(steps.reduce((s, x) => s + x.list.length * FLOW_SECS[x.kind], 0) / 60));
  // Why a word goes on the "watch these" list at the end of a session
  let runWhy = {}; // the same outside the session, for the result screen
  function noteMiss(w, why) { const m = flow ? flow.why : runWhy; if (w && !m[w.id]) m[w.id] = why; }
  function startFlow(view, steps, back, opts) {
    flow = { steps: steps.filter((x) => x.list.length), i: 0, results: [], back, why: {}, persist: !!(opts && opts.persist) };
    if (!flow.steps.length) { flow = null; return navigate(back); }
    runFlowStep(view);
  }
  function runFlowStep(view) {
    const st = flow.steps[flow.i];
    setTopbar(t("sessionTitle"), flow.back);
    document.body.classList.add("in-flow");
    if (cleanup) { cleanup(); cleanup = null; }
    st.run(view, st.list);
  }
  function flowHead(i, n) {
    const st = flow.steps[flow.i];
    const left = flow.steps.slice(flow.i).reduce((s, x, k) => s + (k ? x.list.length : Math.max(0, n - i)) * FLOW_SECS[x.kind], 0);
    return `<div class="flow-head">
        <div class="fh-row"><button class="fh-close" id="fh-close" type="button" aria-label="${t("closeSession")}">${icon("close")}</button>
          <div class="grow"><div class="fh-title">${t(st.kind === "write" && (C.id === "vi" || C.id === "ko") ? "flow_write_word" : "flow_" + st.kind)}</div><div class="fh-sub">${t(st.kind === "meet" ? "flowSubWord" : "flowSub", flow.i + 1, flow.steps.length, Math.min(i + 1, n), n)}</div></div>
          <span class="fh-left">${t("minLeft", Math.max(1, Math.round(left / 60)))}</span></div>
        <div class="fh-steps" style="grid-template-columns:repeat(${flow.steps.length},minmax(0,1fr))">${flow.steps.map((x, k) => `<div class="${k < flow.i ? "done" : k === flow.i ? "cur" : ""}"><i></i><span>${t("seg_" + x.kind)}</span></div>`).join("")}</div>
      </div>`;
  }
  // Bound after every draw: the close button of the session header leaves the session (progress is kept)
  document.addEventListener("click", (e) => { if (e.target.closest("#fh-close") && flow) { const b = flow.back; flow = null; navigate(b); } });
  function flowStepDone(view, res) {
    if (cleanup) { cleanup(); cleanup = null; }
    const st = flow.steps[flow.i];
    flow.results.push({ ...res, step: st });
    if (flow.persist) { const sv = flowSaved() || { done: [], ids: flow.ids }; sv.done = [...new Set(sv.done.concat(st.kind))]; flowSave(sv); }
    flow.i++;
    if (flow.i < flow.steps.length) return runFlowStep(view);
    const f = flow; flow = null; // the Done screen stays full-screen; leaving it re-renders
    S.stats.sessions += 1; save();
    flowDone(view, f);
  }
  const SEAL = { zh: ["完成", "Wánchéng!", "完成"], ja: ["完了", "Kanryō!", "完了"], ko: ["완료", "Wallyo!", "완료"], vi: ["Xong", "Xong rồi!", ""] };
  function flowDone(view, f) {
    const by = (k) => f.results.filter((r) => r.step.kind === k);
    const sum = (rs, key) => rs.reduce((s, r) => s + r[key], 0);
    const reviewed = sum(by("review"), "total") + sum(by("meet"), "total");
    const fresh = sum(by("meet"), "total");
    const say = by("speak"), sayPct = sum(say, "total") ? Math.round((sum(say, "correct") / sum(say, "total")) * 100) : null;
    const graded = f.results.filter((r) => r.step.kind !== "meet"), pct = sum(graded, "total") ? Math.round((sum(graded, "correct") / sum(graded, "total")) * 100) : 100;
    const mistakes = [...new Map(f.results.flatMap((r) => r.mistakes).map((w) => [w.id, w])).values()].slice(0, 12);
    const seal = SEAL[C.id] || SEAL.zh, st = streak();
    const cell = (big, small, hot) => `<div class="fd-cell"><b class="${hot ? "hot" : ""}">${big}</b><span>${small}</span></div>`;
    view.innerHTML = `
      <div class="flow-done">
        <div class="seal-stamp ${C.id}" role="img" aria-label="${esc(seal[0])}">${(C.id === "vi" ? [seal[0]] : Array.from(seal[0])).map((c) => `<span>${esc(c)}</span>`).join("")}</div>
        <div class="fd-title">${esc(seal[1])}</div>
        <div class="fd-sub">${seal[2] ? `<span class="hanzi">${seal[2]}</span> · ` : ""}${t("sessionIsDone")}</div>
        <div class="fd-grid">
          ${cell(reviewed, t("cardsReviewed"))}${cell("+" + fresh, t("newWordsLower"))}
          ${sayPct !== null && (C.id === "zh" || C.id === "vi") ? cell(sayPct + "%", t("tonesRight")) : cell(pct + "%", t("rightAnswers"))}
          ${cell(st, t("dayStreak"), true)}
        </div>
        ${mistakes.length ? `<div class="fd-watch"><div class="fd-label">${t("watchThese", mistakes.length)}</div><div class="fd-chips">${mistakes.map((w) => `<button class="fd-chip" data-speak="${esc(w.hz)}" type="button"><b>${C.id === "zh" ? pyHtml(w.py) : C.id === "vi" ? viHtml(w.hz) : esc(w.hz)}</b><span>${esc(f.why[w.id] || tr(w))}</span></button>`).join("")}</div></div>` : ""}
        <div class="fd-saved"><i></i>${DEV.code ? t("savedSynced") : t("savedHere")}</div>
      </div>
      <div class="stack fd-btns">
        ${mistakes.length ? `<button class="btn block fd-again" id="fd-again" type="button">${t("practiseThese", mistakes.length)}</button>` : ""}
        <button class="btn primary block" id="r-back" type="button">${t("done")}</button>
      </div>`;
    $("#r-back").onclick = () => navigate(f.back);
    if ($("#fd-again")) $("#fd-again").onclick = () => startFlow(view, [
      { kind: "listen", list: shuffle(mistakes), run: (v, l) => runQuiz(v, l, "listen") },
      { kind: "write", list: shuffle(mistakes), run: runType }
    ], f.back);
    $$("[data-speak]").forEach((b) => (b.onclick = () => speak(b.dataset.speak)));
    checkGoal();
  }
  // Today's session: the words for listening, speaking and typing are fixed for the day, so Continue resumes
  function todaySteps() {
    const p = planToday(), sv = flowSaved();
    const ids = sv && sv.ids ? sv.ids : p.fresh.concat(shuffle(p.due).slice(0, Math.max(0, 12 - p.fresh.length))).map((w) => w.id);
    const practice = ids.map((id) => BY_ID[id]).filter(Boolean), done = (sv && sv.done) || [];
    const steps = [
      { kind: "meet", list: p.fresh, run: runMeet },
      { kind: "review", list: p.due, run: runFlash },
      { kind: "listen", list: noVoice() ? [] : shuffle(practice), run: (v, l) => runQuiz(v, l, "listen") },
      { kind: "speak", list: SR_OK() || CAN_RECORD ? shuffle(practice).slice(0, 6) : [], run: runSay },
      { kind: "write", list: shuffle(practice), run: runType }
    ];
    return { steps, done, ids, todo: steps.filter((x) => x.list.length && !done.includes(x.kind)) };
  }
  function startTodaySession(view) {
    const d = todaySteps();
    if (!flowSaved()) flowSave({ done: [], ids: d.ids });
    startFlow(view, d.todo, "today", { persist: true });
    if (flow) flow.ids = d.ids;
  }
  function startLessonSession(view, lid) {
    const l = S.lessons[lid];
    if (!l || l.gone || l.course !== C.id) return navigate("lessons");
    const ws = l.words.map((id) => BY_ID[id]).filter(Boolean);
    const pick = shuffle(ws).slice(0, 15);
    startFlow(view, [
      { kind: "meet", list: ws.filter((w) => status(w.id) === "new"), run: runMeet },
      { kind: "review", list: ws.filter((w) => isDue(w.id)), run: runFlash },
      { kind: "listen", list: pick, run: (v, x) => runQuiz(v, x, "listen") },
      { kind: "write", list: shuffle(pick), run: runType }
    ], "lessons/" + lid);
  }

  // "Say it": one tip for the trickiest sound of a word and one for its tone (tips.js)
  function sayTip(w) {
    const T = window.SAY_TIPS && window.SAY_TIPS[C.id]; if (!T) return null;
    const L = (o) => (o ? o[S.lang] || o.en : "");
    if (C.id === "zh") {
      const syls = pySyllables(w.py);
      for (const [key, tip] of T.sound) {
        const s = syls.find((x) => (key === "ü" ? /v/.test(x.f) && /^[lnr]?$/.test(x.i) : x.i === key));
        if (s) return { sound: L(tip), tone: L(T.tone[s.tone]) };
      }
      return { sound: "", tone: L(T.tone[(syls[0] || {}).tone || 5]) };
    }
    if (C.id === "vi") {
      const syls = w.hz.toLowerCase().split(/\s+/).filter(Boolean);
      for (const [key, tip] of T.sound) {
        const s = syls.find((x) => viNoTone(x).startsWith(key) && (key !== "d" || !viNoTone(x).startsWith("đ")));
        if (s) return { sound: L(tip), tone: L(T.tone[firstToneVi(s)]) };
      }
      return { sound: "", tone: L(T.tone[firstToneVi(syls[0] || "")]) };
    }
    if (C.id === "ja") {
      if (/[āīūēō]/.test(w.romaji || "")) return { sound: L(T.long), tone: "" };
      const k = w.kana || w.hz, hit = T.sound.find(([key]) => k.includes(key));
      return { sound: hit ? L(hit[1]) : "", tone: L(T.flat) };
    }
    if (C.id === "ko") {
      if (w.pron) return { sound: L(T.liaison).replace("{0}", w.pron), tone: "" };
      const jamo = Array.from(w.hz).map(koJamo).filter(Boolean).flatMap((j) => [j.i, j.v, j.f]).join("");
      const hit = T.sound.find(([key]) => jamo.includes(key));
      return hit ? { sound: L(hit[1]), tone: "" } : null;
    }
    return null;
  }
  // The tone of a word's first syllable as a small badge with its contour (Chinese and Vietnamese)
  function toneBadge(w) {
    if (C.id === "zh") { const n = toneSeq(w.py)[0] || 5; return n <= 4 ? `<span class="tone-chip tn${n}">${toneSvg(n)}${t("toneShort" + n)}</span>` : ""; }
    if (C.id === "vi") { const n = firstToneVi(w.hz.split(/\s+/)[0]); return `<span class="tone-chip tc-${VI_TONE_CLASS[n]}">${toneSvg(n)}${VI_TONE_NAMES[n - 1]}</span>`; }
    return "";
  }
  // An example sentence with the word underlined
  const markIn = (s, word) => { const k = word ? s.toLowerCase().indexOf(word.toLowerCase()) : -1; return k < 0 ? esc(s) : `${esc(s.slice(0, k))}<u>${esc(s.slice(k, k + word.length))}</u>${esc(s.slice(k + word.length))}`; };

  /* --- Meet: first contact with a new word, listen and repeat --- */
  function runMeet(view, list) {
    let i = 0;
    function draw() {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct: list.length, total: list.length, mistakes: [] }); }
      const w = list[i], tip = sayTip(w), pf = pyFirst();
      const word = C.id === "zh"
        ? (pf ? `<div class="meet-big py-face">${pyHtml(w.py)}</div><div class="meet-tr">${esc(tr(w))}</div><div class="meet-char">${gridHtml(w.hz, "xs")}<span>${t("charSmall")}</span></div>`
          : `${gridHtml(w.hz, Array.from(w.hz).length > 2 ? "md" : "")}<div class="meet-big sm">${pyHtml(w.py)}</div><div class="meet-tr">${esc(tr(w))}</div>`)
        : C.id === "vi" ? `<div class="meet-big hanzi">${viHtml(w.hz)}</div>${w.py ? `<div class="romaji">${esc(w.py)}</div>` : ""}<div class="meet-tr">${esc(tr(w))}</div>`
        : `${heroHtml(w)}<div class="meet-tr">${esc(tr(w))}</div>`;
      const exLine = w.ex ? (pf && w.exPy ? `<div class="ex-main">${markIn(w.exPy, w.py)}</div><div class="ex-sub"><span class="hanzi">${esc(w.ex)}</span> · ${esc(exTr(w))}</div>`
        : `<div class="ex-main hanzi">${markIn(w.ex, w.hz)}</div><div class="ex-sub">${w.exPy && C.id !== "vi" ? esc(w.exPy) + " · " : ""}${esc(exTr(w))}</div>`) : "";
      view.innerHTML = `${sessionHead(i, list.length)}
        <div class="meet2">
          <div class="meet2-card">
            <div class="meet2-top"><span class="eyebrow">${t("newWord")}</span>${toneBadge(w)}</div>
            ${pic(w) ? `<div class="meet2-pic" aria-hidden="true">${pic(w)}</div>` : ""}
            ${word}
            <div class="meet2-btns"><button class="btn primary" id="m-say" type="button">${icon("play")} ${t("play")}</button><button class="btn" id="m-slow" type="button">0.75×</button></div>
          </div>
          ${tip && (tip.sound || tip.tone) ? `<div class="say-tip"><b>${t("sayIt")}</b> · ${esc([tip.sound, tip.tone].filter(Boolean).join(" "))}</div>` : ""}
          ${exLine ? `<div class="meet2-ex"><div class="grow">${exLine}</div><button class="sq-btn" id="m-ex" type="button" aria-label="${t("playExample")}">${icon("play")}</button></div>` : ""}
        </div>
        <div class="meet2-foot"><button class="btn" id="m-know" type="button">${t("iKnowIt")}</button><button class="btn seal" id="m-next" type="button">${t("nextWord")} →</button></div>`;
      $("#m-say").onclick = () => speak(w.hz);
      $("#m-slow").onclick = () => speak(w.hz, { rate: (S.settings.rate || 0.85) * 0.75 });
      if ($("#m-ex")) $("#m-ex").onclick = () => speak(w.ex);
      $("#m-next").onclick = next;
      $("#m-know").onclick = () => { markKnown(w.id); i++; draw(); };
      speak(w.hz);
    }
    function next() { const w = list[i]; if (!card(w.id)) markLearning(w.id); i++; draw(); }
    bindKeys((e) => { if (e.key === "Enter") { e.preventDefault(); next(); } else if (e.key === " ") { e.preventDefault(); speak(list[i].hz); } });
    draw();
  }

  /* --- Paste a list: whatever the tutor sent (pinyin, characters, meanings; one per line or with commas).
   * Each piece is looked up: one match is taken, several (shi → 是 十 事 …) are offered to choose from, anything
   * else becomes your own word with what could be read from the line. One tap adds them to a lesson. --- */
  const HAN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu;
  function parseList(text) {
    return text.split(/[\n\r,，、;；\t|]+|\s{2,}/).map((x) => x.replace(/^\s*(?:\d+[.)]|[-•*·])\s*/, "").trim()).filter((x) => x && !/^\d+$/.test(x)).slice(0, 80);
  }
  function matchPiece(raw) {
    const pool = ALL_WORDS.filter((w) => !isOwn(w.id)), native = (raw.match(HAN) || []).join(""), latin = raw.replace(HAN, " ").replace(/\s+/g, " ").trim();
    const low = raw.toLowerCase(), q = norm(raw);
    let hits = [];
    if (native && C.id !== "vi") hits = pool.filter((w) => w.hz === native || w.hz.split(/\s*;\s*/).includes(native) || (w.kana && w.kana === native));
    if (!hits.length) hits = pool.filter((w) => w.hz.toLowerCase() === low); // Vietnamese, or a whole native word
    if (!hits.length && latin && C.id === "zh") {
      const exact = pool.filter((w) => w.py.toLowerCase().replace(/\s/g, "") === numToMarks(latin).toLowerCase().replace(/\s/g, ""));
      hits = exact.length ? exact : pool.filter((w) => norm(w.py) === norm(latin));
    }
    if (!hits.length && latin && C.id === "ja") hits = pool.filter((w) => w.romaji && stripJa(w.romaji) === stripJa(latin));
    if (!hits.length && latin && C.id === "ko") hits = pool.filter((w) => norm(w.py) === norm(latin));
    if (!hits.length && C.id === "vi") hits = pool.filter((w) => stripVi(w.hz) === stripVi(raw));
    if (!hits.length && latin) { const m = latin.toLowerCase().replace(/^to /, ""); hits = pool.filter((w) => [w.en, w.de || ""].some((x) => x.toLowerCase().split(/\s*[;,(]\s*/).map((y) => y.replace(/^to /, "").trim()).includes(m))); }
    hits = [...new Map(hits.map((w) => [w.id, w])).values()].sort((a, b) => a.lvl - b.lvl).slice(0, 6);
    // What an own word could be: characters from the native part, the rest as reading and meaning
    const words = latin.split(" "), pyLike = C.id === "zh" ? words.filter((x) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]|^[a-z]+[1-5]$/i.test(x)) : [];
    const own = C.id === "zh" ? { hz: native, py: numToMarks(pyLike.join(" ")) || (native ? "" : latin), en: native || pyLike.length ? words.filter((x) => !pyLike.includes(x)).join(" ") : "" }
      : C.id === "vi" ? { hz: raw, en: "" } : { hz: native || latin, py: native ? latin : "", en: "" };
    // Not one word, but each part is (nǐ hǎo → 你 + 好): offer to add the parts
    let parts = null;
    if (!hits.length && /\s/.test(raw.trim())) { const ps = raw.trim().split(/\s+/).map((x) => matchPiece(x)); if (ps.every((x) => x.hits.length)) parts = ps.map((x) => x.hits[0].id); }
    return { raw, hits, parts, pick: hits.length === 1 ? hits[0].id : null, own, skip: false };
  }
  function renderPaste(view, lid) {
    const l = lid && S.lessons[lid];
    setTopbar(t("pasteList"), lid ? "lessons/" + lid : "lessons");
    document.body.classList.add("home");
    let rows = [];
    const draft = () => { try { return sessionStorage.getItem("lt.paste") || ""; } catch (e) { return ""; } };
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("pasteList")}</div><div class="fh-sub">${l ? esc(l.name) : t("pasteNewLesson")}</div></div></div>
      <label class="su-label" for="p-text">${t("pasteLabel")}</label>
      <textarea class="paste-box" id="p-text" rows="6" placeholder="${esc(t(C.id === "zh" ? "pastePhZh" : "pastePh"))}" lang="${C.tts}" autocapitalize="off" autocorrect="off" spellcheck="false">${esc(draft())}</textarea>
      <div class="list-hint">${t("pasteHint")}</div>
      <div id="p-rows"></div>
      <div class="su-bar" id="p-bar" hidden><div class="grow"><b id="p-count"></b><span id="p-sub"></span></div><button class="btn primary" id="p-add" type="button">${t("add")}</button></div>`;
    const box = $("#p-text");
    const line = (w) => C.id === "zh" ? `<b class="py-face">${pyHtml(w.py)}</b> <span class="hanzi">${esc(w.hz)}</span> · ${esc(tr(w))}` : C.id === "vi" ? `<b>${viHtml(w.hz)}</b> · ${esc(tr(w))}` : `<b class="hanzi">${esc(w.hz)}</b> ${esc(w.py)} · ${esc(tr(w))}`;
    function drawRows() {
      $("#p-rows").innerHTML = rows.map((r, k) => {
        const inLesson = l && r.pick && l.words.includes(r.pick);
        const head = `<span class="p-raw">${esc(r.raw)}</span>`;
        if (r.skip) return `<div class="p-row skip">${head}<span class="grow muted small">${t("skipped")}</span><button class="link-btn" data-undo="${k}" type="button">${t("undo")}</button></div>`;
        if (r.multi) return `<div class="p-row ok">${head}<span class="grow">${r.multi.map((id) => line(BY_ID[id])).join("<br>")}</span><button class="sq-btn sm" data-skip="${k}" type="button" aria-label="${t("skip")}">${icon("close")}</button></div>`;
        if (r.pick) { const w = BY_ID[r.pick]; return `<div class="p-row ok">${head}<span class="grow">${line(w)}${inLesson ? ` <span class="muted small">· ${t("alreadyIn")}</span>` : ""}</span>${r.hits.length > 1 ? `<button class="link-btn" data-repick="${k}" type="button">${t("change")}</button>` : ""}<button class="sq-btn sm" data-skip="${k}" type="button" aria-label="${t("skip")}">${icon("close")}</button></div>`; }
        if (r.parts && !r.ownChosen) return `<div class="p-row ask">${head}<span class="grow"><span class="small muted">${t("pasteParts")}</span><span class="p-choices"><button class="chip" data-parts="${k}" type="button">${r.parts.map((id) => line(BY_ID[id]).replace(/ · [^<]*$/, "")).join(" + ")}</button><button class="chip" data-ownit="${k}" type="button">${t("noneOwn")}</button></span></span></div>`;
        if (r.hits.length) return `<div class="p-row ask">${head}<span class="grow"><span class="small muted">${t("pasteWhich")}</span><span class="p-choices">${r.hits.map((w) => `<button class="chip" data-pick="${k}:${w.id}" type="button">${C.id === "zh" ? `${pyHtml(w.py)} <span class="hanzi">${esc(w.hz)}</span>` : esc(w.hz)} · ${esc(tr(w).split(/[;,(]/)[0].trim())}</button>`).join("")}<button class="chip" data-ownit="${k}" type="button">${t("noneOwn")}</button></span></span></div>`;
        return `<div class="p-row own">${head}<span class="grow"><span class="small muted">${t("notInListShort")}</span>
          <span class="p-own">${C.id === "zh" ? `<input data-own="${k}:py" value="${esc(r.own.py || "")}" placeholder="${esc(t("ownPy"))}" aria-label="${esc(t("ownPy"))}"><input data-own="${k}:hz" value="${esc(r.own.hz || "")}" placeholder="${esc(t("ownHz"))}" aria-label="${esc(t("ownHz"))}" lang="zh-CN">` : `<input data-own="${k}:hz" value="${esc(r.own.hz || "")}" placeholder="${esc(t("ownWord"))}" aria-label="${esc(t("ownWord"))}" lang="${C.tts}">`}<input data-own="${k}:en" value="${esc(r.own.en || "")}" placeholder="${esc(t("ownEn"))}" aria-label="${esc(t("ownEn"))}"></span></span><button class="sq-btn sm" data-skip="${k}" type="button" aria-label="${t("skip")}">${icon("close")}</button></div>`;
      }).join("");
      const live = rows.filter((r) => !r.skip);
      const add = live.filter((r) => r.pick && !(l && l.words.includes(r.pick))).length + live.reduce((n, r) => n + (r.multi ? r.multi.length : 0), 0);
      const own = live.filter((r) => !r.pick && !r.multi && !r.hits.length && !(r.parts && !r.ownChosen) && (r.own.hz || r.own.py) && r.own.en).length;
      const open = live.filter((r) => !r.pick && !r.multi && (r.hits.length || (r.parts && !r.ownChosen) || !r.own.en)).length;
      $("#p-bar").hidden = !rows.length;
      $("#p-count").textContent = t("pasteCount", add + own);
      $("#p-sub").textContent = [own ? t("ownN", own) : "", open ? t("pasteOpen", open) : ""].filter(Boolean).join(" · ") || (l ? esc(l.name) : t("pasteNewLesson"));
      $("#p-add").disabled = !(add + own);
      $$("[data-pick]").forEach((b) => (b.onclick = () => { const [k, id] = b.dataset.pick.split(":"); rows[+k].pick = wid(id); drawRows(); }));
      $$("[data-repick]").forEach((b) => (b.onclick = () => { rows[+b.dataset.repick].pick = null; drawRows(); }));
      $$("[data-ownit]").forEach((b) => (b.onclick = () => { const r = rows[+b.dataset.ownit]; r.hits = []; r.ownChosen = true; drawRows(); }));
      $$("[data-parts]").forEach((b) => (b.onclick = () => { const r = rows[+b.dataset.parts]; r.multi = r.parts; r.ownChosen = true; drawRows(); }));
      $$("[data-skip]").forEach((b) => (b.onclick = () => { rows[+b.dataset.skip].skip = true; drawRows(); }));
      $$("[data-undo]").forEach((b) => (b.onclick = () => { rows[+b.dataset.undo].skip = false; drawRows(); }));
      $$("[data-own]").forEach((inp) => {
        if (inp.dataset.own.endsWith(":py")) inp.addEventListener("input", (e) => liveToneMarks(e, inp));
        inp.onchange = () => { const [k, f] = inp.dataset.own.split(":"); rows[+k].own[f] = inp.value.trim(); drawRows(); };
      });
    }
    let timer = 0;
    const parse = () => { const txt = box.value; try { sessionStorage.setItem("lt.paste", txt); } catch (e) { /* private mode */ } const old = new Map(rows.map((r) => [r.raw, r])); rows = parseList(txt).map((p) => old.get(p) || matchPiece(p)); drawRows(); };
    box.oninput = () => { clearTimeout(timer); timer = setTimeout(parse, 250); };
    if (box.value) parse(); else box.focus();
    $("#pg-back").onclick = () => navigate(lid ? "lessons/" + lid : "lessons");
    $("#p-add").onclick = () => {
      let id = lid;
      if (!id) { id = newId("l"); S.lessons[id] = { course: C.id, name: t("lessonDated", courseLessons().length + 1, lessonDate(Date.now())), words: [], created: Date.now() }; }
      const lesson = S.lessons[id];
      rows.filter((r) => !r.skip).forEach((r) => {
        if (r.pick) { if (!lesson.words.includes(r.pick)) lesson.words.push(r.pick); return; }
        if (r.multi) { r.multi.forEach((id) => { if (!lesson.words.includes(id)) lesson.words.push(id); }); return; }
        if (r.hits.length || (r.parts && !r.ownChosen) || !r.own.en || !(r.own.hz || r.own.py)) return;
        const wid2 = newId("u"); S.custom[wid2] = { course: C.id, hz: r.own.hz || r.own.py, py: r.own.py || r.own.hz, en: r.own.en };
        lesson.words.push(wid2);
      });
      save(); applyCourse();
      try { sessionStorage.removeItem("lt.paste"); } catch (e) { /* private mode */ }
      toast(t("added")); navigate("lessons/" + id);
    };
  }

  /* --- Lesson editor (round 2): name, Pick from list · Type my own, the words with OWN and their status --- */
  let lessonAdd = "list";
  function renderLesson(view, lid) {
    const l = S.lessons[lid];
    if (!l || l.gone || l.course !== C.id) return navigate("lessons");
    setTopbar(l.name, "lessons");
    document.body.classList.add("home");
    const n = courseLessons().findIndex((x) => x.id === lid) + 1;
    const own = C.id === "zh" ? [["py", t("ownPy")], ["hz", t("ownHz")], ["en", t("ownEn")]]
      : C.id === "ja" ? [["hz", t("ownWord")], ["py", t("ownReading")], ["en", t("ownEn")]] : [["hz", t("ownWord")], ["en", t("ownEn")]];
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("lessonN", n)}</div><div class="fh-sub" id="l-pct"></div></div></div>
      <label class="su-label" for="l-name">${t("lessonName")}</label>
      <input class="search" id="l-name" type="text" value="${esc(l.name)}">
      <div class="seg" id="l-mode" style="margin-top:14px"><button data-m="list" class="${lessonAdd === "list" ? "on" : ""}" type="button">${t("pickFromList")}</button><button data-m="own" class="${lessonAdd === "own" ? "on" : ""}" type="button">${t("typeMyOwn")}</button><button data-m="paste" type="button">${t("pasteShort")}</button></div>
      <div id="l-add"></div>
      <div class="topic-rule"><b id="l-count"></b><span id="l-owncount"></span></div>
      <div id="l-words"></div>
      <div class="l-steps">${["review", "listen", "speak", "write"].map((k) => `<span>${t("seg_" + k)}</span>`).join("")}</div>
      <button class="btn primary block" id="l-practice" type="button">${t("practiceLesson")}</button>
      <button class="btn danger ghost block" id="l-delete" type="button" style="margin-top:16px">${t("deleteLesson")}</button>`;
    const wordLine = (w) => C.id === "zh" ? `<b class="py-face">${pyHtml(w.py)}</b> <span class="hanzi">${esc(w.hz)}</span> · ${esc(tr(w))}` : C.id === "vi" ? `<b>${viHtml(w.hz)}</b> · ${esc(tr(w))}` : `<b class="hanzi">${esc(w.hz)}</b> ${esc(w.py)} · ${esc(tr(w))}`;
    function drawWords() {
      const st = lessonStats(l), ws = l.words.map((id) => BY_ID[id]).filter(Boolean);
      $("#l-pct").textContent = t("pctLearned", st.pct);
      $("#l-count").textContent = t("lessonWords", ws.length); $("#l-owncount").textContent = st.own ? t("ownTyped", st.own) : "";
      $("#l-words").innerHTML = ws.length ? ws.map((w) => `<div class="lw2"><span class="grow"><span class="lw2-w">${wordLine(w)}${isOwn(w.id) ? ` <span class="own-tag">${t("ownTag")}</span>` : ""}</span></span><span class="lw2-st">${statusShape(w.id)} ${t(status(w.id))}</span>
          <button class="sq-btn sm" data-say="${w.id}" type="button" aria-label="${t("speak")}">${icon("speaker")}</button><button class="sq-btn sm" data-del="${w.id}" type="button" aria-label="${t("removeX", esc(w.hz))}">${icon("close")}</button></div>`).join("")
        : `<div class="list-hint">${t("lessonNoWords")}</div>`;
      $("#l-practice").hidden = !ws.length;
      $$("[data-say]", $("#l-words")).forEach((b) => (b.onclick = () => speak(BY_ID[wid(b.dataset.say)].hz)));
      $$("[data-del]", $("#l-words")).forEach((b) => (b.onclick = () => { toggleLessonWord(lid, wid(b.dataset.del)); drawWords(); drawAdd(true); }));
    }
    const matches = (q) => { const qs = norm(q), ql = q.toLowerCase();
      return ALL_WORDS.filter((w) => !isOwn(w.id) && (w.hz.toLowerCase().includes(ql) || (qs && norm(w.py).includes(qs)) || (qs && norm(w.hz).includes(qs)) || w.en.toLowerCase().includes(ql) || (w.de || "").toLowerCase().includes(ql)))
        .sort((a, b) => (norm(b.py) === qs || b.hz === q) - (norm(a.py) === qs || a.hz === q) || a.py.length - b.py.length); };
    function drawAdd(keep) {
      const box = $("#l-add"), q0 = keep && $("#l-q") ? $("#l-q").value : "";
      if (lessonAdd === "list") {
        box.innerHTML = `<input class="search" id="l-q" type="search" placeholder="${esc(t("lessonSearch"))}" value="${esc(q0)}" aria-label="${esc(t("lessonSearch"))}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><div id="l-hits"></div>`;
        const hits = () => { const q = $("#l-q").value.trim(); const hs = q ? matches(q).filter((w) => !l.words.includes(w.id)).slice(0, 20) : [];
          $("#l-hits").innerHTML = hs.map((w) => `<div class="lw2 hit"><span class="grow lw2-w">${wordLine(w)}</span><button class="btn sm" data-add="${w.id}" type="button">＋ ${t("add")}</button></div>`).join("") || (q ? `<div class="list-hint">${t("noResults")}</div>` : "");
          $$("[data-add]", $("#l-hits")).forEach((b) => (b.onclick = () => { toggleLessonWord(lid, wid(b.dataset.add)); drawWords(); hits(); toast(t("added")); })); };
        $("#l-q").oninput = hits; hits();
      } else {
        // Type my own: what you type is looked up first; a list word comes with its reading and audio,
        // otherwise you add it as your own word (tagged OWN)
        box.innerHTML = `<label class="su-label" for="l-q" style="margin-top:12px;display:block">${t(C.id === "zh" ? "ownPrompt" : "ownPromptOther")}</label>
          <input class="search" id="l-q" type="text" value="${esc(q0)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" lang="${C.tts}"><div id="l-match"></div>`;
        const input = $("#l-q");
        const draw = () => {
          const q = input.value.trim(), hit = q && matches(q).find((w) => norm(w.py) === norm(q) || w.hz === q || w.en.toLowerCase() === q.toLowerCase() || (w.de || "").toLowerCase() === q.toLowerCase());
          if (!q) { $("#l-match").innerHTML = ""; return; }
          if (hit && !l.words.includes(hit.id)) {
            $("#l-match").innerHTML = `<div class="own-match"><span class="grow">${wordLine(hit)} · ${C.levelName(hit.lvl)}</span><button class="btn sm primary" id="l-addhit" type="button">${t("add")}</button></div>`;
            $("#l-addhit").onclick = () => { toggleLessonWord(lid, hit.id); input.value = ""; drawWords(); draw(); toast(t("added")); };
            return;
          }
          if (hit) { $("#l-match").innerHTML = `<div class="list-hint">✓ ${t("alreadyIn")}</div>`; return; }
          const guess = (k) => (k === (C.id === "zh" ? "py" : "hz") ? q : "");
          $("#l-match").innerHTML = `<form class="own-form" id="l-own"><div class="list-hint" style="margin:0">${t("notInList")}</div>
            ${own.map(([k, label]) => `<input class="type-input own-input" name="${k}" type="text" value="${esc(guess(k))}" placeholder="${esc(label)}" aria-label="${esc(label)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ${k === "en" ? "" : 'lang="' + C.tts + '"'}>`).join("")}
            ${C.id === "zh" ? `<div class="list-hint" style="margin:0">${t("ownHint")}</div>` : ""}<button class="btn block" type="submit">＋ ${t("addOwn")}</button></form>`;
          const form = $("#l-own");
          if (C.id === "zh") form.py.addEventListener("input", (e) => liveToneMarks(e, form.py));
          form.onsubmit = (e) => {
            e.preventDefault();
            const v = (k) => (form[k] ? form[k].value.trim() : "");
            const hz = v("hz"), py = v("py") || hz, en = v("en"), main = C.id === "zh" ? "py" : "hz";
            if (!v(main) || !en) { form[v(main) ? "en" : main].focus(); return; }
            const id = newId("u");
            S.custom[id] = { course: C.id, hz: hz || py, py, en };
            l.words = l.words.concat(id); save(); applyCourse();
            input.value = ""; drawWords(); draw(); toast(t("added"));
          };
        };
        input.oninput = (e) => { if (C.id === "zh") liveToneMarks(e, input); draw(); };
        draw();
      }
    }
    drawWords(); drawAdd();
    $("#pg-back").onclick = () => navigate("lessons");
    $$("#l-mode [data-m]").forEach((b) => (b.onclick = () => { if (b.dataset.m === "paste") return navigate("lessons/" + lid + "/paste"); lessonAdd = b.dataset.m; $$("#l-mode [data-m]").forEach((x) => x.classList.toggle("on", x === b)); drawAdd(); }));
    $("#l-name").onchange = () => { l.name = $("#l-name").value.trim() || l.name; save(); };
    $("#l-practice").onclick = () => navigate("lessons/" + lid + "/practice");
    $("#l-delete").onclick = () => { if (confirm(t("deleteLessonConfirm"))) { delete S.lessons[lid]; save(); navigate("lessons"); } };
  }

  /* ================= STATISTICS (round 2) ================= */
  // Per course: accuracy by skill (Listen · Speak · Read · Write) and by tone when speaking, as [right, total]
  const MODE_SKILL = { listen: "listen", listenPic: "listen", tones: "listen", say: "speak", flash: "read", quiz: "read", picture: "read", choose: "read", match: "read", type: "write", typer: "write", numbers: "write", trace: "write" };
  const FLOW_SKILL = { review: "read", listen: "listen", speak: "speak", write: "write" };
  function curSkill() {
    if (flow) return FLOW_SKILL[flow.steps[flow.i].kind] || null;
    if (route[0] === "train") return MODE_SKILL[route[1]] || null;
    if (route[0] === "sounds") return "listen";
    if (route[0] === "families") return "read";
    if (route[0] === "lessons" && route[1] === "d") return "speak";
    return null;
  }
  function bumpPair(group, key, ok) {
    const g = (S.stats[group] = S.stats[group] || {}), c = (g[C.id] = g[C.id] || {}), p = (c[key] = c[key] || [0, 0]);
    if (ok) p[0]++; p[1]++;
  }
  const pairSum = (group, key) => allStats().reduce((a, s) => { const p = s[group] && s[group][C.id] && s[group][C.id][key]; return p ? [a[0] + p[0], a[1] + p[1]] : a; }, [0, 0]);
  // Spoken tones from the pitch check feed "Tones when speaking"
  function recordTones(res) { if (res && res.res) { res.res.forEach((x) => { if (x.ok !== null && x.want >= 1 && x.want <= 4) bumpPair("tones", x.want, x.ok); }); save(); } }
  function renderProgress(view) {
    setTopbar(t("progress"), "more");
    document.body.classList.add("home");
    const st = streak(), all = ALL_WORDS.filter((w) => !isOwn(w.id)), known = all.filter((w) => status(w.id) === "known").length;
    const answered = statSum("answered"), acc = answered ? Math.round((statSum("correct") / answered) * 100) : 0;
    // Last 12 weeks, one column per week (Monday on top)
    const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 83 - ((end.getDay() + 6) % 7) + 6);
    const cells = []; const d = new Date(start); let studied = 0;
    for (let k = 0; k < 84; k++) { const key = todayKey(d), n = d > end ? -1 : dayCount(key); if (n > 0) studied++; cells.push({ key, n }); d.setDate(d.getDate() + 1); }
    const shade = (n) => (n < 0 ? "fut" : n === 0 ? "" : n < 10 ? "l1" : n < 25 ? "l2" : "l3");
    const lvlRows = C.levels.map((l) => {
      const ws = all.filter((w) => w.lvl === l), k = ws.filter((w) => status(w.id) === "known").length, lr = ws.filter((w) => status(w.id) === "learning").length;
      return `<div class="lv-row"><div class="lv-head"><b>${C.levelName(l)}</b><span>${k || lr ? t("lvMeta", k, lr, ws.length) : t("lvNotStarted", ws.length)}</span></div><div class="lv-bar"><i class="k" style="width:${ws.length ? (k / ws.length) * 100 : 0}%"></i><i class="l" style="width:${ws.length ? (lr / ws.length) * 100 : 0}%"></i></div></div>`;
    }).join("");
    const toneN = C.id === "zh" ? 4 : 0, ex = ["mā", "má", "mǎ", "mà"];
    const tones = Array.from({ length: toneN }, (_, k) => { const p = pairSum("tones", k + 1); return { k: k + 1, p, pct: p[1] ? Math.round((p[0] / p[1]) * 100) : null }; });
    const weakest = tones.filter((x) => x.pct !== null && x.p[1] >= 3).sort((a, b) => a.pct - b.pct)[0];
    const skills = ["listen", "speak", "read", "write"].map((k) => { const p = pairSum("skill", k); return { k, pct: p[1] ? Math.round((p[0] / p[1]) * 100) + "%" : "–" }; });
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("statsTitle", t("langName"))}</div></div></div>
      <div class="fd-grid st3"><div class="fd-cell"><b class="hot">${st}</b><span>${t("dayStreak")}</span></div><div class="fd-cell"><b>${known}</b><span>${t("ofKnown", all.length)}</span></div><div class="fd-cell"><b>${acc}%</b><span>${t("accuracyLower")}</span></div></div>
      <div class="st-sec"><div class="rule-head"><span>${t("last12")}</span><span>${t("daysStudied", studied)}</span></div>
        <div class="heat12" role="img" aria-label="${esc(t("heatAria"))}">${cells.map((x) => `<i class="${shade(x.n)}" title="${x.key}: ${Math.max(0, x.n)}"></i>`).join("")}</div>
        <div class="heat-legend">${t("less")} <i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i> ${t("more")}</div></div>
      <div class="st-sec"><div class="rule-head"><span>${t("byLevel")}</span></div>${lvlRows}
        <div class="heat-legend"><i class="k"></i> ${t("known")} <i class="lr"></i> ${t("learning")} <i></i> ${t("new")}</div></div>
      ${toneN ? `<div class="st-sec"><div class="rule-head"><span>${t("tonesSpeaking")}</span></div>
        ${tones.some((x) => x.pct !== null) ? `<div class="tone-bars">${tones.map((x) => `<div class="tb"><span class="tb-ex tn${x.k}">${ex[x.k - 1]}</span><span class="tb-bar"><i class="tn${x.k}" style="width:${x.pct || 0}%"></i></span><span class="tb-pct">${x.pct === null ? "–" : x.pct + "%"}</span></div>`).join("")}</div>
          ${weakest && weakest.pct < 80 ? `<div class="say-tip">${t("weakestTone", t("toneShort" + weakest.k).split(" · ")[0])}</div>` : ""}` : `<div class="list-hint">${t("tonesEmpty")}</div>`}</div>` : ""}
      <div class="st-sec"><div class="rule-head"><span>${t("bySkill")}</span></div><div class="fd-grid st4">${skills.map((x) => `<div class="fd-cell"><b>${x.pct}</b><span>${t("skill_" + x.k)}</span></div>`).join("")}</div></div>
      <div class="st-sec"><div class="rule-head"><span>${t("dailyGoal")}</span></div><div class="seg" id="goal-seg">${[10, 20, 30, 50].map((g) => `<button data-goal="${g}" class="${S.settings.dailyGoal === g ? "on" : ""}" type="button">${g}</button>`).join("")}</div></div>
      <div style="margin-top:24px"><button class="btn danger ghost block" id="reset-all" type="button">${t("resetAll")}</button></div>`;
    $("#pg-back").onclick = () => navigate("more");
    $$("[data-goal]").forEach((b) => (b.onclick = () => { S.settings.dailyGoal = +b.dataset.goal; save(); render(); }));
    $("#reset-all").onclick = () => { if (confirm(t("resetConfirm"))) { ALL_WORDS.forEach((w) => delete S.srs[w.id]); S.favs = S.favs.filter((id) => BY_ID[id] && BY_ID[id].course !== C.id); S.stats = { ...structuredClone(DEFAULT_STATE.stats), since: Date.now() }; S.peers = {}; S.mt.statsReset = Date.now(); save(); toast(t("resetDone")); render(); } };
  }

  /* ================= ONBOARDING (round 2): first launch only ================= */
  let obStep = 1;
  const OB_GLYPH = { zh: "中", ja: "日", ko: "ㅎㅏ", vi: "Việt" };
  function renderWelcome(view) {
    setTopbar("", null);
    document.body.classList.add("in-flow");
    const finish = (to) => { S.settings.onboarded = 1; save(); obStep = 1; navigate(to || "today"); };
    if (obStep === 1) {
      const lvls = C.levels.slice(0, 3);
      const cur = curLevels()[curLevels().length - 1];
      view.innerHTML = `
        <div class="ob">
          <div class="ob-top"><span class="fh-sub">${t("obStep", 1, 2)}</span><div class="seg ob-lang" role="group" aria-label="${t("language")}"><button data-lang="en" class="${S.lang === "en" ? "on" : ""}" type="button">English</button><button data-lang="de" class="${S.lang === "de" ? "on" : ""}" type="button">Deutsch</button></div></div>
          <h1 class="ob-h">${t("obWhat")}</h1><p class="ob-p">${t("obWhatSub")}</p>
          ${Object.values(COURSES).map((c) => c.id === C.id ? `
            <div class="ob-course on"><div class="ob-row"><span class="ob-glyph hanzi ${c.id}">${OB_GLYPH[c.id]}</span><span class="grow"><b>${esc(c.name.split(" · ")[1] || c.name)}</b><span>${c.allLabel} · ${t("wordsN", c.words.length)}</span></span>${icon("check")}</div>
              <div class="seg">${lvls.map((l, k) => `<button data-lvl="${l}" class="${cur === l ? "on" : ""}" type="button">${k === 0 ? t("obStarting") : t("obDone", c.levelName(l - 1))}</button>`).join("")}</div>
              ${c.id === "zh" ? `<div class="ob-row ob-pf"><span class="grow"><b>${t("pinyinFirst")}</b><span>${t("obPfSub")}</span></span><button class="switch ${pyFirst() ? "on" : ""}" id="ob-pf" type="button" role="switch" aria-checked="${pyFirst()}" aria-label="${t("pinyinFirst")}"></button></div>` : ""}
            </div>` : `<button class="ob-course" data-course="${c.id}" type="button"><span class="ob-glyph hanzi ${c.id}">${OB_GLYPH[c.id]}</span><span class="grow"><b>${esc(c.name.split(" · ")[1] || c.name)}</b><span>${c.allLabel} · ${t("wordsN", c.words.length)}</span></span></button>`).join("")}
        </div>
        <button class="btn primary block ob-go" id="ob-next" type="button">${t("obContinue", t("langName"))}</button>`;
      $$("[data-lang]").forEach((b) => (b.onclick = () => { S.lang = b.dataset.lang; document.documentElement.lang = S.lang; save(); render(); }));
      $$("[data-course]").forEach((b) => (b.onclick = () => { S.course = b.dataset.course; save(); applyCourse(); pickVoice(); render(); }));
      $$("[data-lvl]").forEach((b) => (b.onclick = () => { S.courses[C.id].levels = [+b.dataset.lvl]; save(); applyLevels(); render(); }));
      if ($("#ob-pf")) $("#ob-pf").onclick = () => { S.courses.zh.pinyinFirst = !pyFirst(); save(); render(); };
      $("#ob-next").onclick = () => { obStep = 2; render(); };
      return;
    }
    const voices = courseVoices(), q = TTS.voice ? voiceQuality(TTS.voice) : null;
    const go = ({ zh: "开始", ja: "始めよう", ko: "시작", vi: "Bắt đầu" })[C.id];
    view.innerHTML = `
      <div class="ob">
        <div class="ob-top"><button class="fh-close" id="ob-back" type="button" aria-label="${t("back")}">${icon("back")}</button><span class="fh-sub">${t("obStep", 2, 2)}</span></div>
        <h1 class="ob-h">${t("obReady")}</h1>
        <div class="ob-card"><div class="ob-row">${icon("speaker")}<span class="grow"><b>${t("obVoice", t("langName"))}</b><span>${!voices.length ? t("noVoiceTitle", t("langName")) : q === "Default" ? t("obVoiceDefault") : t("obVoiceGood", q)}</span></span></div>
          <div class="row"><button class="btn grow" id="ob-test" type="button" ${voices.length ? "" : "disabled"}>${t("testVoice")}</button><button class="btn grow" id="ob-how" type="button">${t("obHow")}</button></div></div>
        <div class="ob-card"><div class="ob-row">${icon("mic")}<span class="grow"><b>${t("obMic")}</b><span>${t("obMicSub")}</span></span></div>
          <p class="ob-p">${t("obMicText")}</p><button class="btn primary" id="ob-mic" type="button">${t("obAllowMic")}</button></div>
        <div class="ob-card ob-row"><span class="grow"><b>${t("dailyPlan")}</b><span>${t("obPlan", S.settings.newPerDay, Math.round(S.settings.newPerDay * 2))}</span></span><button class="btn sm" id="ob-plan" type="button">${t("change")}</button></div>
      </div>
      <div class="stack ob-go"><button class="btn primary block" id="ob-start" type="button">${t("obStart")}${go ? ` · <span class="hanzi">${go}</span>` : ""}</button>
        <button class="btn ghost block" id="ob-later" type="button">${t("obLater")}</button></div>`;
    $("#ob-back").onclick = () => { obStep = 1; render(); };
    $("#ob-test").onclick = () => speak(C.testPhrase);
    $("#ob-how").onclick = () => finish("more/voice");
    $("#ob-mic").onclick = async () => {
      try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); st.getTracks().forEach((x) => x.stop()); $("#ob-mic").textContent = "✓ " + t("obMicOn"); $("#ob-mic").disabled = true; }
      catch (e) { toast(t("micBlocked")); }
    };
    $("#ob-plan").onclick = () => { const opts = [3, 5, 8, 10]; S.settings.newPerDay = opts[(opts.indexOf(S.settings.newPerDay) + 1) % opts.length] || 5; save(); render(); };
    $("#ob-start").onclick = () => finish("today");
    $("#ob-later").onclick = () => finish("today");
  }

  /* ================= MORE ================= */
  /* --- Voice (round 2): the voices on this device with their quality, speed presets, and how to get a natural one --- */
  const voiceQuality = (v) => (/Premium/i.test(v.name) ? "Premium" : /Enhanced|Erweitert|Natural|Neural|Google|Online/i.test(v.name + " " + v.voiceURI) ? "Enhanced" : "Default");
  const isMac = /Macintosh/.test(navigator.userAgent) && !("ontouchend" in document);
  let voiceAll = false;
  function renderVoice(view) {
    setTopbar(t("voice"), "more");
    document.body.classList.add("home");
    const exact = new RegExp("^" + C.tts.replace("-", "[-_]"), "i"), cur = TTS.voice, chosen = S.settings.voices && S.settings.voices[C.id];
    const good = courseVoices().filter((v) => exact.test(v.lang) && !robotic(v));
    const voices = voiceAll || !good.length ? courseVoices() : good.concat(cur && !good.includes(cur) ? [cur] : []);
    const steps = isMac ? t("voiceStepsMac") : t("voiceStepsIos");
    const rank = { Premium: 0, Enhanced: 1, Default: 2 };
    view.innerHTML = `
      <div class="page-top"><button class="fh-close" id="pg-back" type="button" aria-label="${t("back")}">${icon("back")}</button><div class="grow"><div class="fh-title">${t("voice")}</div></div></div>
      ${voices.length ? `<div class="voice-list">
        <button class="vrow ${!chosen ? "on" : ""}" data-voice="" type="button" aria-pressed="${!chosen}"><i></i><span class="grow"><b>${t("voiceAuto")}</b><span>${cur ? esc(cur.name) : ""}</span></span></button>
        ${voices.slice().sort((a, b) => rank[voiceQuality(a)] - rank[voiceQuality(b)]).map((v) => { const on = chosen && cur && v.voiceURI === cur.voiceURI, q = voiceQuality(v);
          return `<button class="vrow ${on ? "on" : ""}" data-voice="${esc(v.voiceURI)}" type="button" aria-pressed="${!!on}"><i></i><span class="grow"><b>${esc(v.name)}</b><span>${esc(v.lang)}${cur && v.voiceURI === cur.voiceURI ? " · " + t("inUse") : ""}</span></span><span class="q-badge q-${q.toLowerCase()}">${q}</span></button>`; }).join("")}
      </div>${!voiceAll && voices.length < courseVoices().length ? `<button class="link-btn" id="v-all" type="button">${t("showAllVoices", courseVoices().length)}</button>` : ""}` : `<div class="state-card"><b>${t("noVoiceTitle", t("langName"))}</b><p>${t("noVoiceText")}</p></div>`}
      <div class="st-sec"><div class="rule-head"><span>${t("speed")}</span></div>
        <div class="seg">${[[0.6, "speedSlow"], [0.8, "speedLearner"], [1, "speedNative"]].map(([r, k]) => `<button class="${Math.abs(S.settings.rate - r) < 0.04 ? "on" : ""}" data-rate="${r}" type="button">${t(k)} ${r}×</button>`).join("")}</div></div>
      <div class="guide">
        <b>${t("naturalVoice")}</b><p>${t("naturalVoiceText", t("langName"))}</p>
        <ol class="guide-steps">${steps.map((s, k) => `<li><span class="${k === 0 ? "on" : ""}">${k + 1}</span>${esc(s.replace("{0}", t("langName")))}</li>`).join("")}</ol>
        <div class="row"><button class="btn primary grow" id="v-test" type="button">${t("testVoice")}</button><button class="btn grow" id="v-refresh" type="button">${t("refreshVoices")}</button></div>
      </div>`;
    $("#pg-back").onclick = () => navigate("more");
    $$("[data-voice]").forEach((b) => (b.onclick = () => { S.settings.voices = S.settings.voices || {}; if (b.dataset.voice) S.settings.voices[C.id] = b.dataset.voice; else delete S.settings.voices[C.id]; save(); TTS.voice = null; pickVoice(); render(); speak(C.testPhrase); }));
    $$("[data-rate]").forEach((b) => (b.onclick = () => { S.settings.rate = +b.dataset.rate; save(); speak(C.testPhrase); render(); }));
    $("#v-test").onclick = () => speak(C.testPhrase);
    if ($("#v-all")) $("#v-all").onclick = () => { voiceAll = true; render(); };
    $("#v-refresh").onclick = () => { try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* ignore */ } setTimeout(() => { pickVoice(); render(); }, 700); };
  }

  function renderMore(view) {
    const sub = route[1];
    if (sub === "tones" && !C.toneOptions) return navigate("more");
    if (sub === "tones") return renderTones(view);
    if (sub === "pinyin") return renderPinyinTips(view);
    if (sub === "about") return renderAbout(view);
    if (sub === "sync") return renderSync(view);
    if (sub === "voice") return renderVoice(view);
    setTopbar(t("me"), null);
    const voices = courseVoices();
    const chosen = !!(S.settings.voices && S.settings.voices[C.id]);
    const known = WORDS.filter((w) => status(w.id) === "known").length, answered = statSum("answered");
    const glyph = (LOOK_TABS[C.id] || [])[3] || C.glyph;
    const stepper = (id, label, v) => `<div class="list-item static"><span class="grow li-title">${label}</span><div class="stepper"><button data-step="${id}" data-d="-1" type="button" aria-label="−">−</button><b>${v}</b><button data-step="${id}" data-d="1" type="button" aria-label="+">+</button></div></div>`;
    view.innerHTML = `
      <button class="me-head" id="me-course" type="button">
        <span class="me-glyph hanzi" aria-hidden="true">${esc(glyph)}</span>
        <span class="grow"><span class="me-name">${esc(C.name)}</span><span class="me-sub">${esc(t("learningCourse", t("langName"), levelLabel()))}</span></span><span class="li-chev">›</span>
      </button>
      <div class="me-stats">
        <div><b class="accent">${streak()}</b><span>${t("statsStreak")}</span></div>
        <div><b>${known}</b><span>${t("statsWords")}</span></div>
        <div><b>${answered ? Math.round((statSum("correct") / answered) * 100) : 0}%</b><span>${t("statsAccuracy")}</span></div>
      </div>
      <div class="list"><button class="list-item" data-go="progress" type="button"><span class="li-ico">${icon("stats")}</span><span class="grow li-title">${t("fullStats")}</span><span class="li-chev">›</span></button></div>
      <div class="section-title">${t("dailyPlan")}</div>
      <div class="list">
        ${stepper("newPerDay", t("newPerDay"), S.settings.newPerDay)}
        ${stepper("maxReviews", t("maxReviews"), S.settings.maxReviews || REVIEW_CAP)}
        ${stepper("dailyGoal", t("dailyGoal"), S.settings.dailyGoal)}
      </div>
      <div class="section-title">${t("whileStudying")}</div>
      <div class="list">
        ${C.id === "zh" || C.id === "vi" ? `<div class="list-item static"><span class="li-ico">🎨</span><span class="grow li-title">${t("colorTones")}</span><button class="switch ${S.settings.toneColors !== false ? "on" : ""}" id="sw-tones" type="button" aria-label="${t("colorTones")}"></button></div>` : ""}
      </div>
      <div class="section-title">${t("more")}</div>
      <div class="list">
        ${C.toneOptions ? `<button class="list-item" data-go="more/tones" type="button"><span class="li-ico">🎵</span><span class="grow"><div class="li-title">${t("toneGuide")}</div><div class="li-sub">${t("toneGuideDesc")}</div></span><span class="li-chev">›</span></button>` : ""}
        <button class="list-item" data-go="train/numbers" type="button"><span class="li-ico">🔢</span><span class="grow"><div class="li-title">${t("numbers")}</div><div class="li-sub">${t("numbersDesc")}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" data-go="more/pinyin" type="button"><span class="li-ico">🔤</span><span class="grow"><div class="li-title">${t("pinyinTips")}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" data-go="more/sync" type="button"><span class="li-ico">☁️</span><span class="grow"><div class="li-title">${t("sync")}</div><div class="li-sub">${DEV.code ? syncStatusText() : t("syncDesc")}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" data-go="more/about" type="button"><span class="li-ico">📱</span><span class="grow"><div class="li-title">${t("about")}</div></span><span class="li-chev">›</span></button>
      </div>
      <div class="section-title">${t("settings")}</div>
      <div class="list">
        <div class="list-item static"><span class="li-ico">🌐</span><span class="grow li-title">${t("language")}</span><div class="seg"><button data-lang="en" class="${S.lang === "en" ? "active" : ""}" type="button">English</button><button data-lang="de" class="${S.lang === "de" ? "active" : ""}" type="button">Deutsch</button></div></div>
        <div class="list-item static"><span class="li-ico">🎨</span><span class="grow li-title">${t("theme")}</span><div class="seg">${["auto", "light", "dark"].map((th) => `<button data-th="${th}" class="${S.settings.theme === th ? "active" : ""}" type="button">${t("theme" + th[0].toUpperCase() + th.slice(1))}</button>`).join("")}</div></div>
        <div class="list-item static"><span class="li-ico">🔊</span><span class="grow li-title">${t("autoSpeak")}</span><button class="switch ${S.settings.autoSpeak ? "on" : ""}" id="sw-speak" type="button" aria-label="${t("autoSpeak")}"></button></div>
        <div class="list-item static"><span class="li-ico">🐢</span><span class="grow li-title">${t("ttsRate")}<div class="li-sub" id="rate-val">${S.settings.rate.toFixed(2)}× · ${esc(C.testPhrase)} · ${t("sampleLine")}</div></span><div class="seg" id="rate-seg">${[0.5, 0.75, 1, 1.25].map((v) => `<button data-rate="${v}" class="${Math.abs(S.settings.rate - v) < 0.13 ? "active" : ""}" type="button">${v}×</button>`).join("")}</div></div>
        ${C.id === "zh" ? `<div class="list-item static"><span class="li-ico">🔤</span><span class="grow li-title">${t("pinyinFirst")}<div class="li-sub">${t("pinyinFirstDesc")}</div></span><button class="switch ${pyFirst() ? "on" : ""}" id="sw-pf" type="button" aria-label="${t("pinyinFirst")}"></button></div>` : ""}
        <div class="list-item static"><span class="li-ico">🀄</span><span class="grow li-title">${t("readingLayer")}<div class="li-sub">${t("readingLayerDesc")}</div></span><div class="seg" id="reading-seg">${["always", "new", "off"].map((k) => `<button data-reading="${k}" class="${readingLayer() === k ? "active" : ""}" type="button">${t("reading" + k[0].toUpperCase() + k.slice(1))}</button>`).join("")}</div></div>
        <button class="list-item" data-go="more/voice" type="button"><span class="li-ico">🎙️</span><span class="grow"><div class="li-title">${t("voice")}</div><div class="li-sub">${TTS.voice ? esc(TTS.voice.name) + " · " + voiceQuality(TTS.voice) : (TTS.available ? t("noZhVoice") : t("noTts"))}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" id="tts-test" type="button"><span class="li-ico">🗣️</span><span class="grow li-title">${t("ttsTest")}</span><span class="li-chev">🔊</span></button>
      </div>
      <div class="list-hint" style="margin-top:8px">${IS_ANDROID ? t("ttsHintAndroid", t("langName")) : t("ttsHint")}</div>
      ${IS_ANDROID && !voices.length ? `<div class="list-hint">${t("ttsNoVoiceAndroid", t("langName"))}</div>` : ""}`;
    if ($("#voice-sel")) $("#voice-sel").onchange = (e) => { S.settings.voices = S.settings.voices || {}; if (e.target.value) S.settings.voices[C.id] = e.target.value; else delete S.settings.voices[C.id]; save(); TTS.voice = null; pickVoice(); render(); speak(C.testPhrase); };
    if ($("#voice-refresh")) $("#voice-refresh").onclick = () => { try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* ignore */ } setTimeout(() => { pickVoice(); render(); }, 700); };
    $$("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
    $$("[data-lang]").forEach((b) => (b.onclick = () => { S.lang = b.dataset.lang; save(); document.documentElement.lang = S.lang; render(); }));
    $$("button[data-th]").forEach((b) => (b.onclick = () => { S.settings.theme = b.dataset.th; save(); applyTheme(); render(); }));
    $("#sw-speak").onclick = () => { S.settings.autoSpeak = !S.settings.autoSpeak; save(); $("#sw-speak").classList.toggle("on", S.settings.autoSpeak); };
    if ($("#sw-pf")) $("#sw-pf").onclick = () => { S.courses.zh.pinyinFirst = !pyFirst(); save(); render(); };
    $$("[data-reading]").forEach((b) => (b.onclick = () => { S.settings.readingLayer = b.dataset.reading; S.settings.tilePinyin = b.dataset.reading !== "off"; save(); render(); }));
    $$("[data-rate]").forEach((b) => (b.onclick = () => { S.settings.rate = +b.dataset.rate; save(); speak(C.testPhrase); render(); }));
    $("#tts-test").onclick = () => speak(C.testPhrase);
    $("#me-course").onclick = openCourseSheet;
    const STEPS = { newPerDay: [1, 30, 1], maxReviews: [10, 200, 10], dailyGoal: [10, 100, 10] };
    $$("[data-step]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.step, [lo, hi, st] = STEPS[k], cur = k === "maxReviews" ? (S.settings.maxReviews || REVIEW_CAP) : S.settings[k];
      S.settings[k] = Math.max(lo, Math.min(hi, cur + st * +b.dataset.d)); save(); render();
    }));
    if ($("#sw-tones")) $("#sw-tones").onclick = () => { S.settings.toneColors = S.settings.toneColors === false; save(); applyTheme(); render(); };
  }
  function renderTones(view) {
    setTopbar(t("toneGuide"), "more");
    const zh = { ex: [["mā", "妈"], ["má", "麻"], ["mǎ", "马"], ["mà", "骂"], ["ma", "吗"]], words: [["高", "gāo"], ["人", "rén"], ["好", "hǎo"], ["大", "dà"], ["的", "de"]], all: "妈，麻，马，骂，吗", allLabel: "mā · má · mǎ · mà · ma" };
    const vi = { ex: [["ma", "ma"], ["mà", "mà"], ["má", "má"], ["mả", "mả"], ["mã", "mã"], ["mạ", "mạ"]], words: [["ba", "three"], ["nhà", "house"], ["cá", "fish"], ["hỏi", "to ask"], ["mũ", "hat"], ["mẹ", "mother"]], all: "ma, mà, má, mả, mã, mạ", allLabel: "ma · mà · má · mả · mã · mạ" };
    const g = C.id === "zh" ? zh : vi;
    view.innerHTML = `
      <div class="card">
        ${g.ex.map((e, k) => { const n = k + 1; return `<div class="tone-card"><div class="tone-sym">${e[0]}</div><div><div class="tone-name">${toneSvg(n)} ${t("tone" + n)}</div><div class="tone-desc">${t("tone" + n + "d")} &nbsp;·&nbsp; <span class="hanzi">${g.words[k][0]}</span> ${g.words[k][1]}</div></div><button class="speak-btn" data-speak="${e[1]}" type="button">🔊</button></div>`; }).join("")}
      </div>
      <div class="stack" style="margin-top:16px">
        <button class="btn primary block" id="all-tones" type="button">🔊 ${g.allLabel}</button>
        <button class="btn block" id="go-drill" type="button">🎵 ${t("toneDrill")}</button>
      </div>`;
    $$("[data-speak]").forEach((b) => (b.onclick = () => speak(b.dataset.speak, { rate: 0.7 })));
    $("#all-tones").onclick = () => speak(g.all, { rate: 0.6 });
    $("#go-drill").onclick = () => navigate("train/tones");
  }
  function renderPinyinTips(view) {
    setTopbar(t("pinyinTips"), "more");
    view.innerHTML = `<div class="card about stack">${t("pinyinTipsText").map((p) => `<p>• ${esc(p)}</p>`).join("")}</div>`;
  }
  function renderAbout(view) {
    setTopbar(t("about"), "more");
    view.innerHTML = `
      <div class="card about"><h3 style="margin-bottom:8px">${C.title}</h3><p>${esc(t("aboutText"))}</p><p>${esc(t("dataSource"))}${C.source ? ` <a href="${C.source.url}" target="_blank" rel="noopener">${C.source.text}</a> (MIT${C.id === "ja" ? ", based on Jonathan Waller's JLPT lists, tanos.co.uk, CC BY" : ""})` : ""}</p></div>
      <div class="section-title">${t("installTitle")}</div>
      <div class="card about"><ol>${t("installSteps").map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p style="margin-top:10px">${esc(t("installMac"))}</p></div>`;
  }

  /* ---------------- Sync ----------------
   * The server (api/sync.mjs) keeps one JSON document per sync code. A device pulls it, merges it into
   * its state (newest entry or field wins, see stamp), and pushes the result with the version it started
   * from. The server refuses a stale version; the device then pulls and merges again. */
  const DEV_KEY = "langtrainer.device"; // per device, never synced: id, sync code, server version, last sync
  const DEV = (() => { try { return JSON.parse(localStorage.getItem(DEV_KEY)) || {}; } catch (e) { return {}; } })();
  if (!DEV.id) DEV.id = newId("d");
  function saveDev() { try { localStorage.setItem(DEV_KEY, JSON.stringify(DEV)); } catch (e) { /* private mode */ } }
  const sync = { busy: null, again: false, timer: 0, state: "" }; // state: "" | ok | off (no server) | offline | error
  function scheduleSync() { if (!DEV.code) return; clearTimeout(sync.timer); sync.timer = setTimeout(syncNow, 4000); }
  const api = (method, body) => fetch("api/sync", { method, body, cache: "no-store", headers: { "x-sync-code": DEV.code, "content-type": "application/json" } });
  function syncDoc() {
    const doc = { mt: S.mt, settings: syncSettings(S.settings), stats: { ...S.peers, [DEV.id]: S.stats } };
    LWW_FIELDS.filter((f) => f !== "settings").concat(MAP_FIELDS).forEach((f) => (doc[f] = S[f] ?? null));
    return doc;
  }
  // Merge a pulled document into S. Returns true when this device has something the server lacks.
  function mergeDoc(d) {
    let ahead = false;
    const rmt = d.mt || {}; S.mt = S.mt || {};
    LWW_FIELDS.forEach((f) => {
      if ((rmt[f] || 0) > (S.mt[f] || 0)) { S[f] = f === "settings" ? { ...DEFAULT_STATE.settings, ...d.settings, voices: S.settings.voices } : d[f]; S.mt[f] = rmt[f]; }
      else if ((S.mt[f] || 0) > (rmt[f] || 0)) ahead = true;
    });
    MAP_FIELDS.forEach((m) => {
      const mine = S[m], theirs = d[m] || {};
      Object.keys(theirs).forEach((id) => {
        if (mine[id] && (theirs[id].t || 0) <= (mine[id].t || 0)) return;
        // update in place: open screens may hold a reference to the entry
        if (mine[id]) { Object.keys(mine[id]).forEach((k) => delete mine[id][k]); Object.assign(mine[id], theirs[id]); } else mine[id] = theirs[id];
      });
      Object.keys(mine).forEach((id) => { if (!theirs[id] || (mine[id].t || 0) > (theirs[id].t || 0)) ahead = true; });
    });
    // Stats: each device reports its own counts; a reset anywhere drops the counts from before it
    const reset = Math.max(S.mt.statsReset || 0, rmt.statsReset || 0);
    if (reset > (rmt.statsReset || 0)) ahead = true;
    S.mt.statsReset = reset || undefined;
    if ((S.stats.since || 0) < reset) S.stats = { ...structuredClone(DEFAULT_STATE.stats), since: reset };
    const theirStats = d.stats || {};
    S.peers = Object.fromEntries(Object.entries(theirStats).filter(([dev, st]) => dev !== DEV.id && (st.since || 0) >= reset));
    if (JSON.stringify(theirStats[DEV.id] || null) !== JSON.stringify(S.stats)) ahead = true;
    return ahead;
  }
  function commitMerged() {
    takeSnap(); // merged values keep their own times instead of being stamped as new changes
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ }
    applyCourse();
    // Redraw overview screens only; a running exercise keeps going with the merged data
    if (!flow && ((["today", "progress", "words"].includes(route[0]) && !route[1]) || (route[0] === "more" && route[1] === "sync"))) render();
  }
  function syncNow() {
    if (!DEV.code) return Promise.resolve();
    if (sync.busy) { sync.again = true; return sync.busy; }
    sync.busy = (async () => {
      try {
        for (let attempt = 0; ; attempt++) {
          const got = await api("GET");
          if (got.status === 404 || got.status === 503) { sync.state = "off"; return; }
          if (!got.ok) throw new Error("GET " + got.status);
          const { v, data } = await got.json();
          const ahead = data ? mergeDoc(data) : true;
          if (data) commitMerged();
          if (!ahead) { DEV.v = v; break; }
          const put = await api("PUT", JSON.stringify({ base: v, data: syncDoc() }));
          if (put.status === 409 && attempt < 3) continue; // another device was faster: merge its version first
          if (!put.ok) throw new Error("PUT " + put.status);
          DEV.v = (await put.json()).v; break;
        }
        DEV.dirty = false; DEV.last = Date.now(); sync.state = "ok";
      } catch (e) {
        sync.state = navigator.onLine === false ? "offline" : "error";
      } finally {
        saveDev(); sync.busy = null;
        const el = $("#sync-line"); if (el) el.textContent = syncStatusText();
        if (sync.again) { sync.again = false; scheduleSync(); }
      }
    })();
    return sync.busy;
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden || DEV.dirty) syncNow(); });
  window.addEventListener("online", () => syncNow());
  function ago(ts) { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? t("justNow") : m < 60 ? t("minAgo", m) : t("hAgo", Math.round(m / 60)); }
  function syncStatusText() {
    const msg = sync.state === "off" ? t("syncNotSetup") : sync.state === "offline" ? t("syncOffline") : sync.state === "error" ? t("syncFailed")
      : DEV.dirty && sync.state ? t("syncPending") : DEV.last ? t("syncLast", ago(DEV.last)) : t("syncNever");
    return "☁️ " + msg;
  }
  // Codes: 4 groups of 5 from 32 unambiguous characters (100 bits), easy to read out and type
  const CODE_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const makeCode = () => Array.from(crypto.getRandomValues(new Uint8Array(20)), (x) => CODE_ABC[x % 32]).join("").match(/.{5}/g).join("-");
  function parseCode(s) {
    const c = s.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return c.length === 20 && [...c].every((ch) => CODE_ABC.includes(ch)) ? c.match(/.{5}/g).join("-") : null;
  }
  function renderSync(view) {
    setTopbar(t("sync"), "more");
    const connect = (code) => { DEV.code = code; DEV.v = 0; DEV.last = 0; saveDev(); syncNow().then(render); };
    if (!DEV.code) {
      view.innerHTML = `
        <div class="card stack">
          <p>${t("syncIntro")}</p>
          <button class="btn primary block" id="s-on" type="button">☁️ ${t("syncOn")}</button>
        </div>
        <div class="section-title">${t("syncHave")}</div>
        <form class="card stack" id="s-join">
          <input class="type-input sync-code-input" name="code" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" aria-label="${esc(t("syncCodeLbl"))}">
          <button class="btn block" type="submit">${t("syncConnect")}</button>
        </form>`;
      $("#s-on").onclick = () => connect(makeCode());
      $("#s-join").onsubmit = (e) => { e.preventDefault(); const code = parseCode(e.target.code.value); if (code) connect(code); else toast(t("syncBadCode")); };
      return;
    }
    view.innerHTML = `
      <div class="card stack center">
        <div class="section-title" style="margin:0">${t("syncCodeLbl")}</div>
        <div class="sync-code" id="s-code">${esc(DEV.code)}</div>
        <button class="btn block" id="s-copy" type="button">📋 ${t("syncCopy")}</button>
        <p class="list-hint" style="margin:0;text-align:left">${t("syncCodeHint")}</p>
      </div>
      <div class="list-hint center" id="sync-line">${syncStatusText()}</div>
      <div class="stack" style="margin-top:12px">
        <button class="btn primary block" id="s-now" type="button">🔄 ${t("syncNow")}</button>
        <button class="btn ghost block" id="s-off" type="button">${t("syncDisconnect")}</button>
      </div>`;
    $("#s-copy").onclick = () => { navigator.clipboard.writeText(DEV.code).then(() => toast(t("copied")), () => {}); };
    $("#s-now").onclick = () => syncNow().then(() => { if (sync.state === "ok") toast(t("syncDone")); });
    $("#s-off").onclick = () => { if (confirm(t("syncDisconnectConfirm"))) { delete DEV.code; delete DEV.v; delete DEV.last; DEV.dirty = false; saveDev(); sync.state = ""; render(); } };
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    const th = S.settings.theme;
    if (th === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", th);
    document.documentElement.classList.toggle("no-tone-colors", S.settings.toneColors === false);
  }

  /* ---------------- Init ---------------- */
  takeSnap();
  applyTheme();
  document.documentElement.lang = S.lang;
  render();
  syncNow();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  // Expose a tiny debug API (handy in the console)
  window.HSK1 = { state: () => S, get words() { return WORDS; }, get all() { return ALL_WORDS; }, get course() { return C; }, courses: COURSES, switchCourse, speak, navigate, pairs: (id) => minimalPairs(BY_ID[id]).map((x) => x.hz) };
})();
