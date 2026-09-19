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
  const COURSES = {
    zh: { id: "zh", glyph: "中", name: "中文 · Chinese", title: "HSK Trainer", tts: "zh-CN", script: "cjk", levels: [1, 2, 3], levelName: (l) => "HSK " + l, allLabel: "HSK 1–3", words: ZH_WORDS, toneOptions: [1, 2, 3, 4], testPhrase: "你好，我学习汉语。", source: { text: "glxxyz/hskhsk.com", url: "https://github.com/glxxyz/hskhsk.com" } },
    vi: { id: "vi", glyph: "Vi", name: "Tiếng Việt · Vietnamese", title: "Tiếng Việt Trainer", tts: "vi-VN", script: "latin", levels: [1, 2, 3, 4, 5, 6], levelName: (l) => ["A1", "A2", "B1", "B2", "C1", "C2"][l - 1], allLabel: "A1–C2", words: VI_WORDS, toneOptions: [1, 2, 3, 4, 5, 6], testPhrase: "Xin chào, tôi học tiếng Việt.", source: null },
    ja: { id: "ja", glyph: "あ", name: "日本語 · Japanese", title: "JLPT Trainer", tts: "ja-JP", script: "cjk", levels: [1, 2, 3, 4, 5], levelName: (l) => "N" + (6 - l), allLabel: "N5–N1", words: JA_WORDS, toneOptions: null, testPhrase: "こんにちは。日本語を勉強しています。", source: { text: "jamsinclair/open-anki-jlpt-decks", url: "https://github.com/jamsinclair/open-anki-jlpt-decks" } }
  };
  const CATS = window.HSK1_CATEGORIES;
  const BY_ID = Object.fromEntries(Object.values(COURSES).flatMap((c) => c.words).map((w) => [w.id, w]));
  const wid = (v) => (/^\d+$/.test(String(v)) ? +v : String(v)); // dataset ids back to their stored type
  let C = COURSES.zh;          // current course
  let ALL_WORDS = C.words;     // all words of the current course
  let WORDS = ALL_WORDS;       // words in the selected levels of the current course
  const curLevels = () => S.courses[C.id].levels;
  function applyCourse() {
    C = COURSES[S.course] || COURSES.zh;
    ALL_WORDS = C.words;
    document.documentElement.classList.toggle("latin", C.script === "latin");
    applyLevels();
  }
  function applyLevels() {
    const lv = curLevels();
    WORDS = ALL_WORDS.filter((w) => lv.includes(w.lvl));
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
  const norm = (s) => (C.id === "zh" ? stripTones(s) : C.id === "ja" ? stripJa(s) : stripVi(s));
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
    stats: { answered: 0, correct: 0, days: {}, sessions: 0 },
    settings: { rate: 0.85, autoSpeak: true, tilePinyin: true, quizSize: 10, dailyGoal: 20, theme: "auto" },
    course: "zh",
    courses: { zh: { levels: [1] }, vi: { levels: [1] }, ja: { levels: [1] } }
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
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  /* ---------------- i18n ---------------- */
  const I18N = {
    en: {
      brandSub: "Trainer", words: "Words", train: "Train", progress: "Progress", more: "More",
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
      modeNumbers: "Numbers", modeNumbersDesc: "Read and write Chinese numbers 1–99.",
      setupTitle: "Session setup", whichWords: "Which words?", allWords: "All words", dueWords: "Due & new", favsOnly: "Favorites", learningOnly: "Learning", howMany: "How many?",
      direction: "Direction", dirHzTr: "Character → Meaning", dirTrHz: "Meaning → Character", dirHzPy: "Character → Pinyin", dirPyHz: "Pinyin → Character",
      tapToFlip: "Tap to reveal", rateAgain: "Again", rateHard: "Hard", rateGood: "Good", rateEasy: "Easy",
      correct: "Correct!", wrong: "Not quite.", answerWas: "Answer:", check: "Check", skip: "Skip", showAnswer: "Show answer",
      typeHint: "Tones are optional (nǐ hǎo = nihao = ni3hao3).", typePlaceholder: "pinyin…",
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
      noZhVoice: "No Chinese voice found yet", ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. If no Chinese voice is listed, add one under Settings → Accessibility → Spoken Content → Voices → Chinese.",
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
      voice: "Voice", voiceAuto: "Automatic", refreshVoices: "Look for voices", langName: "Chinese",
      ttsHintAndroid: (lang) => `On Android the app uses the phone's text-to-speech engine. Install “Speech Services by Google” from the Play Store, then open Settings → General management (or System) → Language & input → Text-to-speech output, choose Google as the preferred engine, tap its settings → Install voice data → ${lang}. Reload this page afterwards. Chrome and Samsung Internet both work.`,
      ttsNoVoiceAndroid: (lang) => `No ${lang} voice was found on this device yet. After installing the voice data, tap “Look for voices” or reload the page.`,
      course: "Course", switchCourse: "Switch language", courseHint: "Each language keeps its own words, levels and progress.", knownOf: (k, n) => `${k} of ${n} known`
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
      modeNumbers: "Zahlen", modeNumbersDesc: "Chinesische Zahlen 1–99 lesen und schreiben.",
      setupTitle: "Übung einrichten", whichWords: "Welche Wörter?", allWords: "Alle Wörter", dueWords: "Fällig & neu", favsOnly: "Favoriten", learningOnly: "In Arbeit", howMany: "Wie viele?",
      direction: "Richtung", dirHzTr: "Zeichen → Bedeutung", dirTrHz: "Bedeutung → Zeichen", dirHzPy: "Zeichen → Pinyin", dirPyHz: "Pinyin → Zeichen",
      tapToFlip: "Tippen zum Aufdecken", rateAgain: "Nochmal", rateHard: "Schwer", rateGood: "Gut", rateEasy: "Leicht",
      correct: "Richtig!", wrong: "Leider nein.", answerWas: "Lösung:", check: "Prüfen", skip: "Überspringen", showAnswer: "Lösung zeigen",
      typeHint: "Töne sind optional (nǐ hǎo = nihao = ni3hao3).", typePlaceholder: "Pinyin…",
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
      noZhVoice: "Noch keine chinesische Stimme gefunden", ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Wird keine chinesische Stimme angezeigt, füge eine hinzu unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Chinesisch.",
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
      voice: "Stimme", voiceAuto: "Automatisch", refreshVoices: "Stimmen suchen", langName: "Chinesisch",
      ttsHintAndroid: (lang) => `Unter Android nutzt die App die Sprachausgabe des Telefons. Installiere „Speech Services by Google“ aus dem Play Store, öffne dann Einstellungen → Allgemeine Verwaltung (oder System) → Sprache und Eingabe → Text-zu-Sprache-Ausgabe, wähle Google als bevorzugtes Modul, tippe auf dessen Einstellungen → Sprachdaten installieren → ${lang}. Danach diese Seite neu laden. Chrome und Samsung Internet funktionieren beide.`,
      ttsNoVoiceAndroid: (lang) => `Auf diesem Gerät wurde noch keine ${lang}-Stimme gefunden. Nach dem Installieren der Sprachdaten auf „Stimmen suchen“ tippen oder die Seite neu laden.`,
      course: "Kurs", switchCourse: "Sprache wechseln", courseHint: "Jede Sprache hat eigene Wörter, Stufen und eigenen Fortschritt.", knownOf: (k, n) => `${k} von ${n} gelernt`
    }
  };
  // Course-specific wording (Vietnamese is written in Latin script: no hanzi, no pinyin)
  const COURSE_I18N = {
    ja: {
      en: {
        brandSub: "Japanese", search: "Search kanji, kana, romaji or meaning…", tilePinyin: "Reading on tiles", langName: "Japanese",
        modeType: "Type the reading", modeTypeDesc: "See the word, type its reading in kana or romaji.",
        modeNumbers: "Numbers", modeNumbersDesc: "Read and write Japanese numbers 1–99.",
        dirHzTr: "Word → Meaning", dirTrHz: "Meaning → Word", dirHzPy: "Word → Reading", dirPyHz: "Reading → Word",
        typeHint: "Kana or romaji (たべる = taberu). Long vowels as written: ou / oo.", typePlaceholder: "reading…",
        pinyinTips: "Reading tips", numbers: "Number trainer", numbersDesc: "Practice 1–99",
        noZhVoice: "No Japanese voice found yet",
        ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. If no Japanese voice is listed, add one under Settings → Accessibility → Spoken Content → Voices → Japanese.",
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
        brandSub: "Japanisch", search: "Kanji, Kana, Romaji oder Bedeutung suchen…", tilePinyin: "Lesung auf Kacheln", langName: "Japanisch",
        modeType: "Lesung tippen", modeTypeDesc: "Wort sehen, Lesung in Kana oder Romaji eingeben.",
        modeNumbers: "Zahlen", modeNumbersDesc: "Japanische Zahlen 1–99 lesen und schreiben.",
        dirHzTr: "Wort → Bedeutung", dirTrHz: "Bedeutung → Wort", dirHzPy: "Wort → Lesung", dirPyHz: "Lesung → Wort",
        typeHint: "Kana oder Romaji (たべる = taberu). Lange Vokale wie geschrieben: ou / oo.", typePlaceholder: "Lesung…",
        pinyinTips: "Lese-Tipps", numbers: "Zahlen-Trainer", numbersDesc: "1–99 üben",
        noZhVoice: "Noch keine japanische Stimme gefunden",
        ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Wird keine japanische Stimme angezeigt, füge eine hinzu unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Japanisch.",
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
    vi: {
      en: {
        brandSub: "Vietnamese", search: "Search word or meaning…", tilePinyin: "Pronunciation on tiles",
        modeType: "Type the word", modeTypeDesc: "See the meaning, type the Vietnamese word.",
        modeTones: "Tone drill", modeTonesDesc: "Hear a syllable and identify one of the six tones.",
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
        ttsHint: "No sound on iPhone? Flip the ring/silent switch to ring and turn the volume up: speech follows the silent switch. If no Vietnamese voice is listed, add one under Settings → Accessibility → Spoken Content → Voices → Vietnamese.",
        tone1: "Ngang – level", tone2: "Huyền – low falling", tone3: "Sắc – rising", tone4: "Hỏi – dipping-rising", tone5: "Ngã – broken rising", tone6: "Nặng – low, short",
        tone1d: "Flat, mid-high, no mark: ma.", tone2d: "Starts mid and falls gently, grave accent: mà.", tone3d: "Rises sharply, acute accent: má.", tone4d: "Dips then rises, hook: mả.", tone5d: "Rises with a catch in the throat, tilde: mã.", tone6d: "Drops abruptly and stops, dot below: mạ."
      },
      de: {
        brandSub: "Vietnamesisch", search: "Wort oder Bedeutung suchen…", tilePinyin: "Aussprache auf Kacheln",
        modeType: "Wort tippen", modeTypeDesc: "Bedeutung sehen, vietnamesisches Wort eingeben.",
        modeTones: "Ton-Training", modeTonesDesc: "Silbe hören und einen der sechs Töne erkennen.",
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
        ttsHint: "Kein Ton auf dem iPhone? Stell den Klingel-/Stumm-Schalter auf Klingeln und dreh die Lautstärke auf – die Sprachausgabe folgt dem Stumm-Schalter. Wird keine vietnamesische Stimme angezeigt, füge eine hinzu unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Vietnamesisch.",
        tone1: "Ngang – eben", tone2: "Huyền – tief fallend", tone3: "Sắc – steigend", tone4: "Hỏi – fallend-steigend", tone5: "Ngã – gebrochen steigend", tone6: "Nặng – tief, kurz",
        tone1d: "Flach, mittelhoch, kein Zeichen: ma.", tone2d: "Beginnt mittel und fällt sanft, Gravis: mà.", tone3d: "Steigt deutlich, Akut: má.", tone4d: "Fällt und steigt wieder, Haken: mả.", tone5d: "Steigt mit Kehlknacks, Tilde: mã.", tone6d: "Fällt abrupt und stoppt, Punkt unten: mạ."
      }
    }
  };
  const t = (key, ...args) => {
    const o = COURSE_I18N[C.id];
    const v = (o && (o[S.lang]?.[key] ?? o.en?.[key])) ?? I18N[S.lang][key] ?? I18N.en[key] ?? key;
    return typeof v === "function" ? v(...args) : v;
  };
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
  function pickVoice() {
    if (!TTS.available) return;
    const same = courseVoices();
    // Manual choice from settings (stored per course) wins when that voice is present
    const wanted = S.settings.voices && S.settings.voices[C.id];
    const manual = wanted && same.find((v) => v.voiceURI === wanted || v.name === wanted);
    if (manual) { TTS.voice = manual; return; }
    const exact = new RegExp("^" + C.tts.replace("-", "[-_]") + "([-_#].*)?$", "i"); // zh-CN, zh_CN, zh_CN_#Hans
    const pref = same.find((v) => exact.test(v.lang) && /Tingting|Ting-Ting|Linh|Google|Microsoft|Premium|Enhanced/i.test(v.name))
      || same.find((v) => exact.test(v.lang) && !/eSpeak/i.test(v.name))
      || same.find((v) => exact.test(v.lang))
      || same.find((v) => !/HK|TW/i.test(v.lang)) || same[0];
    TTS.voice = pref || null;
  }
  if (TTS.available) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); if (route[0] === "more" && !route[1]) render(); }; }
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
  function card(id) { return S.srs[id] || null; }
  function status(id) { const c = card(id); if (!c) return "new"; return c.interval >= 21 ? "known" : "learning"; }
  function isDue(id) { const c = card(id); return !!c && c.due <= Date.now(); }
  function grade(id, q) { // q: 0 again, 1 hard, 2 good, 3 easy
    const now = Date.now();
    const c = card(id) || { ef: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 };
    if (q === 0) {
      c.reps = 0; c.lapses = (c.lapses || 0) + 1; c.interval = 0; c.ef = Math.max(1.3, c.ef - 0.2); c.due = now + 10 * 60 * 1000;
    } else {
      if (c.reps === 0) c.interval = q === 1 ? 0.5 : q === 2 ? 1 : 3;
      else if (c.reps === 1) c.interval = q === 1 ? 1 : q === 2 ? 3 : 7;
      else c.interval = Math.round(c.interval * (q === 1 ? 1.2 : q === 2 ? c.ef : c.ef * 1.4) * 10) / 10;
      c.ef = Math.max(1.3, Math.min(3.0, c.ef + (q === 3 ? 0.15 : q === 1 ? -0.15 : 0)));
      c.reps += 1;
      c.due = now + c.interval * DAY;
    }
    S.srs[id] = c;
    save();
  }
  function markKnown(id) { S.srs[id] = { ef: 2.5, interval: 30, reps: 3, due: Date.now() + 30 * DAY, lapses: 0 }; save(); }
  function markLearning(id) { S.srs[id] = { ef: 2.5, interval: 0, reps: 0, due: Date.now(), lapses: 0 }; save(); }
  function resetWord(id) { delete S.srs[id]; save(); }
  function recordAnswer(correct) {
    S.stats.answered += 1; if (correct) S.stats.correct += 1;
    const k = todayKey(); S.stats.days[k] = (S.stats.days[k] || 0) + 1; save();
  }
  function dueWords() { return WORDS.filter((w) => isDue(w.id)); }
  function streak() {
    let n = 0; const d = new Date();
    if (!S.stats.days[todayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.stats.days[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
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
  const TABS = [
    { id: "words", ico: "🀄", key: "words" },
    { id: "train", ico: "🎯", key: "train" },
    { id: "progress", ico: "📈", key: "progress" },
    { id: "more", ico: "⋯", key: "more" }
  ];
  let route = [];
  let cleanup = null;

  function navigate(path) { location.hash = "#/" + path; }
  function parseRoute() { const h = location.hash.replace(/^#\/?/, ""); return h ? h.split("/") : ["words"]; }
  function renderNav() {
    const html = TABS.map((tab) => `<button class="tab ${route[0] === tab.id ? "active" : ""}" data-route="${tab.id}" type="button"><span class="tab-ico">${tab.id === "words" && C.script !== "cjk" ? "🔤" : tab.ico}</span><span>${t(tab.key)}</span></button>`).join("");
    $("#nav-desktop").innerHTML = html; $("#nav-mobile").innerHTML = html;
    $$("[data-route]").forEach((b) => (b.onclick = () => navigate(b.dataset.route)));
    $$(".lang-toggle").forEach((b) => { b.textContent = S.lang === "de" ? "DE" : "EN"; b.onclick = toggleLang; });
    $("[data-i18n=brandSub]").textContent = t("brandSub");
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
    if (route[0] === "words") render(); else navigate("words");
  }
  function updateBrand() {
    $$(".course-glyph-brand").forEach((el) => { el.textContent = C.glyph; el.classList.toggle("latin", C.script === "latin"); });
    $(".brand-title").textContent = C.title.replace(" Trainer", "");
    $$(".brand, #course-btn").forEach((b) => { b.onclick = openCourseSheet; b.title = t("switchCourse"); });
  }
  function toggleLang() { S.lang = S.lang === "de" ? "en" : "de"; save(); document.documentElement.lang = S.lang; render(); }
  function setTopbar(title, back) {
    $("#topbar-title").textContent = title;
    const b = $("#topbar-back"); b.hidden = !back;
    b.onclick = back ? () => navigate(back) : null;
    $("#course-btn").hidden = !!back;
  }
  function render() {
    closeSheet();
    if (cleanup) { cleanup(); cleanup = null; }
    route = parseRoute();
    renderNav();
    const view = $("#view");
    view.scrollTop = 0; window.scrollTo(0, 0);
    view.className = "view fade-in";
    const main = route[0];
    if (main === "train") renderTrain(view);
    else if (main === "progress") renderProgress(view);
    else if (main === "more") renderMore(view);
    else renderWords(view);
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
      if (wf.cat !== "all" && w.cat !== wf.cat) return false;
      if (wf.status === "favs" && !S.favs.includes(w.id)) return false;
      if (wf.status === "due" && !isDue(w.id)) return false;
      if (["new", "learning", "known"].includes(wf.status) && status(w.id) !== wf.status) return false;
      if (!q) return true;
      return w.hz.toLowerCase().includes(q) || norm(w.hz).includes(qs) || norm(w.py).includes(qs) || w.py.toLowerCase().includes(q) || (w.romaji && w.romaji.includes(qs)) || w.en.toLowerCase().includes(q) || (w.de || "").toLowerCase().includes(q);
    });
  }
  function renderWords(view) {
    setTopbar(t("words") + " · " + levelLabel(), null);
    const statusFilters = [["all", t("all")], ["due", t("due")], ["new", t("new")], ["learning", t("learning")], ["known", t("known")], ["favs", "★ " + t("favorites")]];
    view.innerHTML = `
      <input class="search" id="search" type="search" placeholder="${esc(t("search"))}" value="${esc(wf.q)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      ${levelChips("lvl-chips")}
      <div class="chips" id="status-chips">${statusFilters.map(([k, l]) => `<button class="chip ${wf.status === k ? "active" : ""}" data-status="${k}" type="button">${l}</button>`).join("")}</div>
      <div class="chips" id="cat-chips">
        <button class="chip ${wf.cat === "all" ? "active" : ""}" data-cat="all" type="button">${t("all")}</button>
        ${Object.keys(CATS).filter((c) => WORDS.some((w) => w.cat === c)).map((c) => `<button class="chip ${wf.cat === c ? "active" : ""}" data-cat="${c}" type="button">${CATS[c].icon} ${catName(c)}</button>`).join("")}
      </div>
      <div class="list-hint" id="words-hint"></div>
      <div class="tiles" id="tiles"></div>`;
    const search = $("#search");
    search.oninput = () => { wf.q = search.value; drawTiles(); };
    bindLevelChips("lvl-chips", () => { setTopbar(t("words") + " · " + levelLabel(), null); drawTiles(); });
    $$("#status-chips .chip").forEach((b) => (b.onclick = () => { wf.status = b.dataset.status; $$("#status-chips .chip").forEach((x) => x.classList.toggle("active", x === b)); drawTiles(); }));
    $$("#cat-chips .chip").forEach((b) => (b.onclick = () => { wf.cat = b.dataset.cat; $$("#cat-chips .chip").forEach((x) => x.classList.toggle("active", x === b)); drawTiles(); }));
    drawTiles();
  }
  let tileLimit = 240;
  function drawTiles(reset) {
    if (reset !== false) tileLimit = 240;
    const list = filteredWords();
    $("#words-hint").textContent = t("wordsCount", list.length, WORDS.length);
    const tiles = $("#tiles");
    if (!list.length) { tiles.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div>${t("noResults")}</div>`; return; }
    const CHUNK = 240;
    const shown = list.slice(0, tileLimit);
    tiles.innerHTML = shown.map((w) => `
      <button class="tile" data-id="${w.id}" type="button">
        <span class="tile-dot ${status(w.id)}"></span>
        ${S.favs.includes(w.id) ? `<span class="tile-fav">★</span>` : ""}
        <span class="tile-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</span>
        ${S.settings.tilePinyin ? `<span class="tile-py">${w.py}</span>` : ""}
        <span class="tile-tr">${esc(tr(w))}</span>
        <span class="tile-num">${curLevels().length > 1 ? `<span class="lvl-badge l${w.lvl}">${C.levelName(w.lvl)}</span>` : (C.id === "zh" ? w.id : "")}</span>
      </button>`).join("") + (list.length > shown.length ? `<button class="btn block tiles-more" id="tiles-more" type="button">${t("showMore", Math.min(CHUNK, list.length - shown.length), list.length - shown.length)}</button>` : "");
    $$(".tile", tiles).forEach((b) => (b.onclick = () => openWord(wid(b.dataset.id))));
    const more = $("#tiles-more"); if (more) more.onclick = () => { tileLimit += CHUNK; drawTiles(false); };
  }
  function openWord(id) {
    const w = BY_ID[id];
    const st = status(id); const fav = S.favs.includes(id);
    openSheet(`
      <div class="detail-hz">${w.hz}</div>
      <div class="detail-py">${w.py}</div>
      <div class="detail-tr">${esc(tr(w))}</div>
      ${tr2(w) ? `<div class="detail-tr2">${esc(tr2(w))}</div>` : ""}
      <div class="detail-meta">
        <span class="pill ${st}">${t(st)}</span>
        <span class="pill new">${CATS[w.cat].icon} ${catName(w.cat)}</span>
        <span class="pill new">${C.levelName(w.lvl)}${C.id === "zh" ? " · #" + w.id : ""}</span>
      </div>
      <div class="row" style="justify-content:center;margin-top:12px"><button class="speak-btn" id="d-speak" type="button" aria-label="${t("speak")}">🔊</button></div>
      ${w.ex ? `<div class="example">
        <div class="row"><div class="grow"><div class="ex-hz">${w.ex}</div>${w.exPy ? `<div class="ex-py">${w.exPy}</div>` : ""}<div class="ex-tr">${esc(exTr(w))}</div></div><button class="speak-btn sm" id="d-speak-ex" type="button" aria-label="${t("speak")}">🔊</button></div>
      </div>` : ""}
      <div class="detail-actions">
        <button class="btn ${st === "known" ? "ghost" : "success"}" id="d-known" type="button">${st === "known" ? "↺ " + t("resetWord") : "✓ " + t("markKnown")}</button>
        <button class="btn ${fav ? "warn" : ""}" id="d-fav" type="button">${fav ? "★ " + t("unfav") : "☆ " + t("fav")}</button>
        ${st !== "learning" ? `<button class="btn block" id="d-learn" type="button">📝 ${t("markLearning")}</button>` : ""}
        <button class="btn block ghost" id="d-close" type="button">${t("close")}</button>
      </div>`, () => { if (route[0] === "words" && $("#tiles")) drawTiles(); });
    $("#d-speak").onclick = () => speak(w.hz);
    if ($("#d-speak-ex")) $("#d-speak-ex").onclick = () => speak(w.ex);
    $("#d-close").onclick = closeSheet;
    $("#d-fav").onclick = () => { S.favs = fav ? S.favs.filter((x) => x !== id) : S.favs.concat(id); save(); openWord(id); };
    $("#d-known").onclick = () => { if (st === "known") resetWord(id); else markKnown(id); openWord(id); };
    const learnBtn = $("#d-learn"); if (learnBtn) learnBtn.onclick = () => { markLearning(id); openWord(id); };
  }

  /* ================= TRAIN ================= */
  const MODES = [
    { id: "flash", ico: "🃏", key: "modeFlash" },
    { id: "quiz", ico: "✅", key: "modeQuiz" },
    { id: "type", ico: "⌨️", key: "modeType" },
    { id: "listen", ico: "👂", key: "modeListen" },
    { id: "match", ico: "🧩", key: "modeMatch" },
    { id: "tones", ico: "🎵", key: "modeTones" },
    { id: "numbers", ico: "🔢", key: "modeNumbers" }
  ];
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
    if (mode === "match") return startMatch(view);
    if (mode === "tones") return C.toneOptions ? startTones(view) : renderTrainHome(view);
    if (mode === "numbers") return startNumbers(view);
  }
  function renderTrainHome(view) {
    setTopbar(t("train"), null);
    const due = dueWords().length; const newCount = WORDS.filter((w) => status(w.id) === "new").length;
    view.innerHTML = `
      <div class="due-banner">
        <div class="grow"><div class="big">${due}</div><div>${t("dueToday")}${newCount ? ` · ${newCount} ${t("new").toLowerCase()}` : ""}</div><div class="small" style="opacity:.8">${levelLabel()}</div></div>
        <button class="btn" id="review-now" type="button">${due ? t("reviewNow") : t("modeFlash")}</button>
      </div>
      <div class="mode-grid">
        ${MODES.filter((m) => m.id !== "tones" || C.toneOptions).map((m) => `<button class="mode-card" data-mode="${m.id}" type="button"><span class="mode-ico">${m.ico}</span><span class="mode-title">${t(m.key)}</span><span class="mode-desc">${t(m.key + "Desc")}</span></button>`).join("")}
      </div>`;
    $("#review-now").onclick = () => navigate("train/flash");
    $$("[data-mode]").forEach((b) => (b.onclick = () => navigate("train/" + b.dataset.mode)));
  }

  /* --- Session setup --- */
  const setupPrefs = { pool: "due", count: 10, cat: "all", direction: "hzTr" };
  function poolWords(pool, cat) {
    let list = cat === "all" ? WORDS : WORDS.filter((w) => w.cat === cat);
    if (pool === "due") {
      const due = list.filter((w) => isDue(w.id)); const fresh = list.filter((w) => status(w.id) === "new");
      list = due.concat(shuffle(fresh));
      if (!list.length) list = cat === "all" ? WORDS : WORDS.filter((w) => w.cat === cat);
    } else if (pool === "favs") list = list.filter((w) => S.favs.includes(w.id));
    else if (pool === "learning") list = list.filter((w) => status(w.id) === "learning");
    return list;
  }
  function setupSession(view, mode, cfg) {
    const pools = [["due", t("dueWords")], ["all", t("allWords")], ["learning", t("learningOnly")], ["favs", t("favsOnly")]];
    const dirs = [["hzTr", t("dirHzTr")], ["trHz", t("dirTrHz")], ["hzPy", t("dirHzPy")], ["pyHz", t("dirPyHz")]];
    view.innerHTML = `
      <div class="card stack">
        <h2>${t("setupTitle")}</h2>
        <div class="section-title" style="margin-top:4px">${t("levels")}</div>
        ${levelChips("s-lvl-chips")}
        <div class="section-title">${t("whichWords")}</div>
        <div class="chips" id="pool-chips">${pools.map(([k, l]) => `<button class="chip ${setupPrefs.pool === k ? "active" : ""}" data-pool="${k}" type="button">${l}</button>`).join("")}</div>
        <div class="section-title">${t("category")}</div>
        <div class="chips" id="scat-chips"><button class="chip ${setupPrefs.cat === "all" ? "active" : ""}" data-cat="all" type="button">${t("all")}</button>${Object.keys(CATS).map((c) => `<button class="chip ${setupPrefs.cat === c ? "active" : ""}" data-cat="${c}" type="button">${CATS[c].icon} ${catName(c)}</button>`).join("")}</div>
        <div class="section-title">${t("howMany")}</div>
        <div class="chips" id="count-chips">${cfg.count.map((n) => `<button class="chip ${setupPrefs.count === n ? "active" : ""}" data-count="${n}" type="button">${n === 150 ? t("all") : n}</button>`).join("")}</div>
        ${cfg.direction ? `<div class="section-title">${t("direction")}</div><div class="chips" id="dir-chips">${dirs.map(([k, l]) => `<button class="chip ${setupPrefs.direction === k ? "active" : ""}" data-dir="${k}" type="button">${l}</button>`).join("")}</div>` : ""}
        <div class="list-hint" id="pool-info"></div>
        <button class="btn primary block" id="start" type="button">${t("start")}</button>
      </div>`;
    const bind = (sel, attr, key) => $$(sel + " .chip").forEach((b) => (b.onclick = () => { setupPrefs[key] = attr === "count" ? +b.dataset[attr] : b.dataset[attr]; $$(sel + " .chip").forEach((x) => x.classList.toggle("active", x === b)); updateInfo(); }));
    bind("#pool-chips", "pool", "pool"); bind("#scat-chips", "cat", "cat"); bind("#count-chips", "count", "count");
    if (cfg.direction) bind("#dir-chips", "dir", "direction");
    bindLevelChips("s-lvl-chips", updateInfo);
    function updateInfo() { const n = poolWords(setupPrefs.pool, setupPrefs.cat).length; $("#pool-info").textContent = t("wordsCount", Math.min(n, setupPrefs.count), n); $("#start").disabled = n < (mode === "flash" || mode === "type" ? 1 : 4); }
    updateInfo();
    $("#start").onclick = () => {
      let list = poolWords(setupPrefs.pool, setupPrefs.cat);
      list = setupPrefs.pool === "due" ? list.slice(0, setupPrefs.count) : sample(list, setupPrefs.count);
      if (mode === "flash") runFlash(view, list);
      else if (mode === "quiz") runQuiz(view, list, setupPrefs.direction);
      else if (mode === "type") runType(view, list);
      else if (mode === "listen") runQuiz(view, list, "listen");
    };
  }

  function sessionHead(i, n, extra) {
    return `<div class="session-head"><div class="progress-bar"><span style="width:${Math.round((i / n) * 100)}%"></span></div><span class="count">${i}/${n}${extra ? " · " + extra : ""}</span></div>`;
  }
  function showResult(view, { correct, total, mistakes, mode, extra, onAgain }) {
    S.stats.sessions += 1; save();
    const pct = total ? Math.round((correct / total) * 100) : 100;
    view.innerHTML = `
      <div class="card result-card">
        <div class="big">${pct}%</div>
        <div class="sub">${t("resultScore", correct, total)}${extra ? " · " + extra : ""}</div>
        ${mistakes.length ? `<div class="result-list"><div class="section-title">${t("reviewMistakes")}</div>${mistakes.map((w) => `<div class="result-item"><span class="hanzi">${w.hz}</span><div class="grow"><div class="r-py">${w.py}</div><div class="r-tr">${esc(tr(w))}</div></div><button class="speak-btn sm" data-speak="${w.hz}" type="button">🔊</button></div>`).join("")}</div>` : `<div class="sub" style="margin-top:12px">🎉 ${t("perfect")}</div>`}
        <div class="stack" style="margin-top:20px">
          <button class="btn primary block" id="r-again" type="button">${t("playAgain")}</button>
          <button class="btn block" id="r-back" type="button">${t("backToTrain")}</button>
        </div>
      </div>`;
    $("#r-again").onclick = onAgain;
    $("#r-back").onclick = () => navigate("train");
    $$("[data-speak]").forEach((b) => (b.onclick = () => speak(b.dataset.speak)));
    checkGoal();
  }
  function checkGoal() {
    const n = S.stats.days[todayKey()] || 0;
    if (n >= S.settings.dailyGoal && n - 1 < S.settings.dailyGoal) toast(t("goalReached"));
  }
  function bindKeys(handler) {
    const fn = (e) => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.key !== "Enter") return; handler(e); };
    document.addEventListener("keydown", fn);
    cleanup = () => document.removeEventListener("keydown", fn);
  }

  /* --- Flashcards --- */
  function runFlash(view, list) {
    let i = 0, flipped = false; const mistakes = [];
    const queue = list.slice();
    function draw() {
      if (i >= queue.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct: list.length - mistakes.length, total: list.length, mistakes, onAgain: () => navigate("train/flash") }); }
      const w = queue[i];
      view.innerHTML = `
        ${sessionHead(i, queue.length)}
        <div class="flashcard" id="fc">
          ${flipped ? `
            <div class="fc-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div>
            <div class="fc-py">${w.py}</div>
            <div class="fc-tr">${esc(tr(w))}</div>
            ${tr2(w) ? `<div class="fc-tr2">${esc(tr2(w))}</div>` : ""}
            ${w.ex ? `<div class="fc-ex"><span class="hanzi">${w.ex}</span>${w.exPy}<br>${esc(exTr(w))}</div>` : ""}
            <button class="speak-btn" id="fc-speak" type="button" style="margin-top:10px">🔊</button>`
          : `<div class="fc-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div><div class="fc-hint">${t("tapToFlip")}</div>`}
        </div>
        ${flipped ? `
          <div class="rate-grid">
            <button class="btn danger" data-q="0" type="button">${t("rateAgain")}<small>&lt; 10 min</small></button>
            <button class="btn warn" data-q="1" type="button">${t("rateHard")}<small>${nextInterval(w.id, 1)}</small></button>
            <button class="btn success" data-q="2" type="button">${t("rateGood")}<small>${nextInterval(w.id, 2)}</small></button>
            <button class="btn info" data-q="3" type="button">${t("rateEasy")}<small>${nextInterval(w.id, 3)}</small></button>
          </div>` : `<button class="btn primary block" id="fc-flip" type="button" style="margin-top:14px">${t("showAnswer")}</button>`}
        <div class="kbd-hint">${t("keys")}</div>`;
      const flip = () => { flipped = true; draw(); if (S.settings.autoSpeak) speak(w.hz); };
      if (!flipped) { $("#fc").onclick = flip; $("#fc-flip").onclick = flip; }
      else {
        $("#fc-speak").onclick = (e) => { e.stopPropagation(); speak(w.hz); };
        $("#fc").onclick = () => speak(w.ex || w.hz);
        $$("[data-q]").forEach((b) => (b.onclick = () => rate(+b.dataset.q)));
      }
    }
    function rate(q) {
      const w = queue[i];
      grade(w.id, q); recordAnswer(q >= 2);
      if (q < 2 && !mistakes.includes(w)) mistakes.push(w);
      if (q === 0) queue.push(w); // see it again at the end of this session
      i++; flipped = false; draw();
    }
    bindKeys((e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!flipped) { flipped = true; draw(); if (S.settings.autoSpeak) speak(queue[i].hz); } else rate(2); }
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

  /* --- Multiple choice / listening quiz --- */
  function runQuiz(view, list, direction) {
    let i = 0, correct = 0, answered = false; const mistakes = [];
    const optCount = 4;
    function optionsFor(w) {
      const distractors = sample(WORDS.filter((x) => x.id !== w.id && (direction === "hzPy" || direction === "pyHz" || direction === "listen" ? true : tr(x) !== tr(w))), optCount - 1);
      return shuffle([w].concat(distractors));
    }
    function draw(autoPlay) {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => navigate("train/" + (direction === "listen" ? "listen" : "quiz")) }); }
      const w = list[i]; const opts = optionsFor(w); answered = false;
      let prompt, optHtml;
      const label = (x) => direction === "hzTr" ? esc(tr(x)) : direction === "hzPy" ? x.py : `<span class="hanzi">${x.hz}</span>`;
      const optClass = direction === "trHz" || direction === "pyHz" || direction === "listen" ? "hanzi" : "";
      if (direction === "hzTr" || direction === "hzPy") prompt = `<div class="q-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div><button class="speak-btn sm" id="q-speak" type="button">🔊</button>`;
      else if (direction === "trHz") prompt = `<div class="q-text">${esc(tr(w))}</div>${tr2(w) ? `<div class="q-sub">${esc(tr2(w))}</div>` : ""}`;
      else if (direction === "pyHz") prompt = `<div class="q-text">${w.py}</div>`;
      else prompt = `<div class="q-sub">${t("listenPrompt")}</div><button class="btn primary" id="q-play" type="button" style="margin-top:8px">▶︎ ${t("play")}</button><div class="q-sub small">${t("listenHint")}</div>`;
      optHtml = opts.map((x, k) => `<button class="option ${optClass}" data-id="${x.id}" type="button"><span class="opt-key">${k + 1}</span><span>${label(x)}</span></button>`).join("");
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}<div class="quiz-q">${prompt}</div><div class="options">${optHtml}</div><div id="fb"></div><div class="kbd-hint">${t("keys")}</div>`;
      if ($("#q-speak")) $("#q-speak").onclick = () => speak(w.hz);
      if ($("#q-play")) { $("#q-play").onclick = () => speak(w.hz); if (autoPlay) speak(w.hz); }
      $$(".option").forEach((b) => (b.onclick = () => answer(wid(b.dataset.id))));
    }
    function answer(id) {
      if (answered) return; answered = true;
      const w = list[i]; const ok = id === w.id;
      $$(".option").forEach((b) => { b.disabled = true; if (wid(b.dataset.id) === w.id) b.classList.add("correct"); else if (wid(b.dataset.id) === id) b.classList.add("wrong"); });
      grade(w.id, ok ? 2 : 0); recordAnswer(ok);
      if (ok) correct++; else mistakes.push(w);
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow"><span class="hanzi">${w.hz}</span> ${w.py} · ${esc(tr(w))}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="q-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speak(w.hz);
      $("#q-next").onclick = next;
      if (S.settings.autoSpeak && direction !== "listen") speak(w.hz);
    }
    function next() { i++; draw(true); }
    bindKeys((e) => {
      if (/^[1-4]$/.test(e.key) && !answered) { const b = $$(".option")[+e.key - 1]; if (b) b.click(); }
      else if ((e.key === "Enter" || e.key === " ") && answered) { e.preventDefault(); next(); }
      else if (e.key === " " && direction === "listen") { e.preventDefault(); speak(list[i].hz); }
    });
    draw(false);
  }

  /* --- Type pinyin --- */
  function runType(view, list) {
    let i = 0, correct = 0, answered = false; const mistakes = [];
    function draw() {
      if (i >= list.length) { if (cleanup) { cleanup(); cleanup = null; } return showResult(view, { correct, total: list.length, mistakes, onAgain: () => navigate("train/type") }); }
      const w = list[i]; answered = false;
      const promptHtml = C.id === "zh" || C.id === "ja"
        ? `<div class="q-hz ${isLong(w.hz) ? "long" : ""}">${w.hz}</div><div class="q-sub">${esc(tr(w))}</div>`
        : `<div class="q-text">${esc(tr(w))}</div>${tr2(w) ? `<div class="q-sub">${esc(tr2(w))}</div>` : ""}`;
      view.innerHTML = `${sessionHead(i, list.length, `✓ ${correct}`)}
        <div class="quiz-q">${promptHtml}</div>
        <input class="type-input" id="ti" type="text" placeholder="${t("typePlaceholder")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">
        <div class="list-hint center">${t("typeHint")}</div>
        <div class="row" style="margin-top:8px"><button class="btn ghost grow" id="t-skip" type="button">${t("skip")}</button><button class="btn primary grow" id="t-check" type="button">${t("check")}</button></div>
        <div id="fb"></div>`;
      const input = $("#ti"); input.focus();
      $("#t-check").onclick = () => check(input.value);
      $("#t-skip").onclick = () => { if (!answered) reveal(false); else next(); };
      input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); if (!answered) check(input.value); else next(); } };
    }
    function check(val) {
      const w = list[i]; const v = val.trim(); if (!v) return;
      let ok;
      if (C.id === "zh") {
        ok = stripTones(v) === stripTones(w.py);
        const digits = v.replace(/[^0-9]/g, "").replace(/[05]/g, "");
        if (ok && digits) ok = digits === toneSeq(w.py).join("");
      } else if (C.id === "ja") {
        const a = stripJa(v);
        ok = a === stripJa(w.kana) || a === stripJa(w.romaji) || a === stripJa(w.hz) || a === stripJa(w.romaji).replace(/'/g, "") || a === toRomaji(w.kana).replace(/ou/g, "oo") || a.replace(/ou/g, "oo") === stripJa(w.romaji).replace(/ou/g, "oo");
      } else {
        ok = hasDiacritics(v) ? v.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim() === w.hz.normalize("NFC").toLowerCase() : stripVi(v) === stripVi(w.hz);
      }
      reveal(ok);
    }
    function reveal(ok) {
      answered = true; const w = list[i];
      const input = $("#ti"); input.disabled = true; input.classList.add(ok ? "ok" : "bad");
      grade(w.id, ok ? 2 : 0); recordAnswer(ok);
      if (ok) correct++; else mistakes.push(w);
      $("#fb").innerHTML = `<div class="feedback ${ok ? "ok" : "bad"}"><span>${ok ? "✓ " + t("correct") : "✗ " + t("wrong")}</span><span class="grow">${t("answerWas")} <b>${C.id === "zh" || C.id === "ja" ? w.py : w.hz}</b>${C.id === "zh" || C.id === "ja" ? "" : ` <span class="muted">[${esc(w.py)}]</span>`}</span><button class="speak-btn sm" id="fb-speak" type="button">🔊</button></div><button class="btn primary block" id="t-next" type="button" style="margin-top:12px">${t("next")}</button>`;
      $("#fb-speak").onclick = () => speak(w.hz);
      $("#t-next").onclick = next; $("#t-next").focus();
      if (S.settings.autoSpeak) speak(w.hz);
    }
    function next() { i++; draw(); }
    bindKeys((e) => { if (e.key === "Enter" && answered && e.target.id !== "ti") { e.preventDefault(); next(); } });
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
        <div class="match-col">${left.map((w) => `<button class="match-card hanzi" data-side="a" data-id="${w.id}" type="button">${w.hz}</button>`).join("")}</div>
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
  function numToHanzi(n) {
    if (C.id === "vi") return numToVi(n);
    if (C.id === "ja") return numToJa(n, false);
    if (n <= 10) return NUM_HZ[n];
    const tens = Math.floor(n / 10), ones = n % 10;
    return (tens > 1 ? NUM_HZ[tens] : "") + "十" + (ones ? NUM_HZ[ones] : "");
  }
  function numToPinyin(n) {
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

  /* ================= PROGRESS ================= */
  function renderProgress(view) {
    setTopbar(t("progress") + " · " + levelLabel(), null);
    const counts = { new: 0, learning: 0, known: 0 };
    WORDS.forEach((w) => counts[status(w.id)]++);
    const due = dueWords().length; const st = streak();
    const acc = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) : 0;
    const today = S.stats.days[todayKey()] || 0;
    const total = WORDS.length; const r = 50, circ = 2 * Math.PI * r;
    const knownLen = (counts.known / total) * circ, learnLen = (counts.learning / total) * circ;
    // Heatmap of last 56 days
    const days = []; const d = new Date(); d.setDate(d.getDate() - 55);
    for (let k = 0; k < 56; k++) { const key = todayKey(d); const n = S.stats.days[key] || 0; days.push({ key, n }); d.setDate(d.getDate() + 1); }
    const lvl = (n) => (n === 0 ? "" : n < 10 ? "l1" : n < 30 ? "l2" : "l3");
    const catRows = Object.keys(CATS).filter((c) => WORDS.some((w) => w.cat === c)).map((c) => {
      const ws = WORDS.filter((w) => w.cat === c); const k = ws.filter((w) => status(w.id) === "known").length; const l = ws.filter((w) => status(w.id) === "learning").length;
      return `<div class="cat-row"><span>${CATS[c].icon}</span><div><div class="cat-name">${catName(c)}</div><div class="progress-bar" style="margin-top:4px"><span class="green" style="width:${(k / ws.length) * 100}%"></span></div></div><span class="cat-count">${k}/${ws.length}${l ? ` <span class="pill learning">${l}</span>` : ""}</span></div>`;
    }).join("");
    const lvlRows = C.levels.map((l) => {
      const ws = ALL_WORDS.filter((w) => w.lvl === l); const k = ws.filter((w) => status(w.id) === "known").length; const lr = ws.filter((w) => status(w.id) === "learning").length;
      return `<div class="cat-row"><span class="lvl-badge l${l}">${C.levelName(l)}</span><div><div class="progress-bar" style="margin-top:4px"><span class="green" style="width:${(k / ws.length) * 100}%"></span></div></div><span class="cat-count">${k}/${ws.length}${lr ? ` <span class="pill learning">${lr}</span>` : ""}</span></div>`;
    }).join("");
    view.innerHTML = `
      ${levelChips("p-lvl-chips")}
      <div class="stats-grid">
        <div class="stat green"><div class="stat-val">${counts.known}</div><div class="stat-lbl">${t("statsWords")} / ${total}</div></div>
        <div class="stat gold"><div class="stat-val">${counts.learning}</div><div class="stat-lbl">${t("statsLearning")}</div></div>
        <div class="stat accent"><div class="stat-val">${due}</div><div class="stat-lbl">${t("statsDue")}</div></div>
        <div class="stat blue"><div class="stat-val">${st}</div><div class="stat-lbl">${t("statsStreak")}</div></div>
      </div>
      <div class="section-title">${t("overview")}</div>
      <div class="card ring-wrap">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--bg-sunken)" stroke-width="14"/>
          <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--gold)" stroke-width="14" stroke-dasharray="${learnLen} ${circ}" stroke-dashoffset="${-knownLen}" transform="rotate(-90 60 60)"/>
          <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--green)" stroke-width="14" stroke-dasharray="${knownLen} ${circ}" transform="rotate(-90 60 60)" stroke-linecap="${counts.known ? "round" : "butt"}"/>
          <text x="60" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">${Math.round((counts.known / total) * 100)}%</text>
          <text x="60" y="76" text-anchor="middle" font-size="10" fill="var(--text-2)">${t("known")}</text>
        </svg>
        <div class="legend grow">
          <div><span class="dot" style="background:var(--green)"></span>${t("known")}: <b>${counts.known}</b></div>
          <div><span class="dot" style="background:var(--gold)"></span>${t("learning")}: <b>${counts.learning}</b></div>
          <div><span class="dot" style="background:var(--bg-sunken);border:1px solid var(--line)"></span>${t("new")}: <b>${counts.new}</b></div>
          <div class="small muted" style="margin-top:6px">${t("statsAccuracy")}: <b>${acc}%</b> · ${t("statsAnswered")}: <b>${S.stats.answered}</b></div>
        </div>
      </div>
      <div class="section-title">${t("dailyGoal")}</div>
      <div class="card">
        <div class="row"><span class="grow">${t("statsToday")}: <b>${today}</b> / ${S.settings.dailyGoal}</span><div class="seg" id="goal-seg">${[10, 20, 50].map((g) => `<button data-goal="${g}" class="${S.settings.dailyGoal === g ? "active" : ""}" type="button">${g}</button>`).join("")}</div></div>
        <div class="progress-bar" style="margin-top:10px"><span class="${today >= S.settings.dailyGoal ? "green" : ""}" style="width:${Math.min(100, (today / S.settings.dailyGoal) * 100)}%"></span></div>
      </div>
      <div class="section-title">${t("activity")}</div>
      <div class="card"><div class="heat">${days.map((x) => `<div class="day ${lvl(x.n)}" title="${x.key}: ${x.n}"></div>`).join("")}</div></div>
      <div class="section-title">${t("perLevel")}</div>
      <div class="card">${lvlRows}</div>
      <div class="section-title">${t("byCategory")}</div>
      <div class="card">${catRows}</div>
      <div style="margin-top:20px"><button class="btn danger block" id="reset-all" type="button">${t("resetAll")}</button></div>`;
    $$("[data-goal]").forEach((b) => (b.onclick = () => { S.settings.dailyGoal = +b.dataset.goal; save(); render(); }));
    bindLevelChips("p-lvl-chips", render);
    $("#reset-all").onclick = () => { if (confirm(t("resetConfirm"))) { ALL_WORDS.forEach((w) => delete S.srs[w.id]); S.favs = S.favs.filter((id) => BY_ID[id] && BY_ID[id].course !== C.id); S.stats = structuredClone(DEFAULT_STATE.stats); save(); toast(t("resetDone")); render(); } };
  }

  /* ================= MORE ================= */
  function renderMore(view) {
    const sub = route[1];
    if (sub === "tones" && !C.toneOptions) return navigate("more");
    if (sub === "tones") return renderTones(view);
    if (sub === "pinyin") return renderPinyinTips(view);
    if (sub === "about") return renderAbout(view);
    setTopbar(t("more"), null);
    const voices = courseVoices();
    const chosen = !!(S.settings.voices && S.settings.voices[C.id]);
    view.innerHTML = `
      <div class="list">
        ${C.toneOptions ? `<button class="list-item" data-go="more/tones" type="button"><span class="li-ico">🎵</span><span class="grow"><div class="li-title">${t("toneGuide")}</div><div class="li-sub">${t("toneGuideDesc")}</div></span><span class="li-chev">›</span></button>` : ""}
        <button class="list-item" data-go="train/numbers" type="button"><span class="li-ico">🔢</span><span class="grow"><div class="li-title">${t("numbers")}</div><div class="li-sub">${t("numbersDesc")}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" data-go="more/pinyin" type="button"><span class="li-ico">🔤</span><span class="grow"><div class="li-title">${t("pinyinTips")}</div></span><span class="li-chev">›</span></button>
        <button class="list-item" data-go="more/about" type="button"><span class="li-ico">📱</span><span class="grow"><div class="li-title">${t("about")}</div></span><span class="li-chev">›</span></button>
      </div>
      <div class="section-title">${t("settings")}</div>
      <div class="list">
        <div class="list-item static"><span class="li-ico">🌐</span><span class="grow li-title">${t("language")}</span><div class="seg"><button data-lang="en" class="${S.lang === "en" ? "active" : ""}" type="button">English</button><button data-lang="de" class="${S.lang === "de" ? "active" : ""}" type="button">Deutsch</button></div></div>
        <div class="list-item static"><span class="li-ico">🎨</span><span class="grow li-title">${t("theme")}</span><div class="seg">${["auto", "light", "dark"].map((th) => `<button data-th="${th}" class="${S.settings.theme === th ? "active" : ""}" type="button">${t("theme" + th[0].toUpperCase() + th.slice(1))}</button>`).join("")}</div></div>
        <div class="list-item static"><span class="li-ico">🔊</span><span class="grow li-title">${t("autoSpeak")}</span><button class="switch ${S.settings.autoSpeak ? "on" : ""}" id="sw-speak" type="button" aria-label="${t("autoSpeak")}"></button></div>
        <div class="list-item static"><span class="li-ico">🐢</span><span class="grow li-title">${t("ttsRate")}<div class="li-sub" id="rate-val">${S.settings.rate.toFixed(2)}×</div></span><input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${S.settings.rate}"></div>
        <div class="list-item static"><span class="li-ico">🀄</span><span class="grow li-title">${t("tilePinyin")}</span><button class="switch ${S.settings.tilePinyin ? "on" : ""}" id="sw-tile" type="button" aria-label="${t("tilePinyin")}"></button></div>
        <div class="list-item static"><span class="li-ico">🎙️</span><span class="grow li-title">${t("voice")}<div class="li-sub">${TTS.voice ? esc(TTS.voice.name) + " (" + esc(TTS.voice.lang) + ")" : (TTS.available ? t("noZhVoice") : t("noTts"))}</div></span>
          ${voices.length ? `<select id="voice-sel" class="voice-sel"><option value="">${t("voiceAuto")}</option>${voices.map((v) => `<option value="${esc(v.voiceURI)}" ${TTS.voice && v.voiceURI === TTS.voice.voiceURI && chosen ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select>` : `<button class="btn sm" id="voice-refresh" type="button">${t("refreshVoices")}</button>`}
        </div>
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
    $("#sw-tile").onclick = () => { S.settings.tilePinyin = !S.settings.tilePinyin; save(); $("#sw-tile").classList.toggle("on", S.settings.tilePinyin); };
    $("#rate").oninput = (e) => { S.settings.rate = +e.target.value; $("#rate-val").textContent = S.settings.rate.toFixed(2) + "×"; save(); };
    $("#tts-test").onclick = () => speak(C.testPhrase);
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

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    const th = S.settings.theme;
    if (th === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", th);
  }

  /* ---------------- Init ---------------- */
  applyTheme();
  document.documentElement.lang = S.lang;
  render();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  // Expose a tiny debug API (handy in the console)
  window.HSK1 = { state: () => S, get words() { return WORDS; }, get all() { return ALL_WORDS; }, get course() { return C; }, courses: COURSES, switchCourse, speak, navigate };
})();
