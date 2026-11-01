// Builds topics and pictures for Vietnamese, Japanese and Korean from the hand-made Chinese ones (web/js/themes.js).
// Korean words come with their topic group already (data-ko.js, field t); they only get pictures here.
//   node tools/build-topics.mjs   → web/js/themes-auto.js
// A word goes, in this order of preference:
//   1. where the Chinese word with the same English meaning is (same group, same place in the order, same picture)
//   2. where a meaning rule below puts it
//   3. where the course's own category puts it (the word lists' cat field)
//   4. into "More words", one group per level
// Inside a group, words matched to Chinese words keep the Chinese order; the rest follow by level.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JS = path.join(ROOT, "web/js");
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data.js", "data-hsk2.js", "data-hsk3.js", "data-vi.js", "data-vi-2.js", "data-ja.js", "data-ko.js", "themes.js"]) vm.runInContext(fs.readFileSync(path.join(JS, f), "utf8"), ctx);
const app = fs.readFileSync(path.join(JS, "app.js"), "utf8");
const a = app.indexOf("const KANA = "), b = app.indexOf("  const JA_WORDS = ");
vm.runInContext(app.slice(a, b).replace(/^\s*const /gm, "var "), ctx); // toRomaji, jaCategory
const W = ctx.window;

const ZH = [].concat(W.HSK1_WORDS, W.HSK2_WORDS, W.HSK3_WORDS);
const COURSES = {
  vi: { levels: ["A1", "A2", "B1", "B2", "C1", "C2"], words: W.VI_WORDS.map((w) => ({ id: w.id, hz: w.w, en: w.en, cat: w.cat, lvl: w.lvl })) },
  ja: { levels: ["N5", "N4", "N3", "N2", "N1"], words: W.JA_WORDS_RAW.map(([lvl, expr, , en], i) => ({ id: "j" + (i + 1), hz: expr, en, cat: ctx.jaCategory(expr, en), lvl })) },
  ko: { levels: ["A1", "A2"], words: W.KO_WORDS.map((w) => ({ id: w.id, hz: w.w, en: w.en, cat: "", lvl: w.lvl, t: w.t })) }
};

// English meanings: "to open; to drive" → ["to open", "to drive"]; brackets dropped
const senses = (en) => String(en).toLowerCase().replace(/\([^)]*\)/g, "").split(/[,;/]/).map((s) => s.replace(/[!?.~…]/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);

// The Chinese groups, their order and pictures, by meaning
const groupKey = (t, g) => `${t.id}/${g}`;
const zhOrder = {}, zhGroup = {};
let n = 0;
W.THEMES.zh.forEach((t) => t.groups.forEach((g, gi) => g.ids.forEach((id) => { zhOrder[id] = n++; zhGroup[id] = groupKey(t, gi); })));
const bySense = new Map(), mainSense = new Map(); // meaning → Chinese word; main (first) meaning → Chinese word
for (const pass of [0, 1]) for (const w of ZH) senses(w.en).forEach((s, k) => { if ((pass === 0) === (k === 0) && !bySense.has(s)) bySense.set(s, w.id); });
for (const w of ZH) { const s = senses(w.en)[0]; if (s && !mainSense.has(s)) mainSense.set(s, w.id); }
const G = (theme, name) => { const t = W.THEMES.zh.find((x) => x.id === theme); const gi = t.groups.findIndex((g) => g.name.en === name); if (gi < 0) throw new Error(theme + "/" + name); return groupKey(t, gi); };

// Meaning rules, tried on the first meaning, then on the whole gloss; first match wins
const R = (re, theme, group) => [re, G(theme, group)];
const RULES = [
  R(/\b(particle|suffix|prefix|copula|honorific|indicates|marker|auxiliary)\b/, "grammar", "Grammar particles"),
  R(/^(what|who|whom|whose|where|when|why|how|which)\b/, "questions", "Question words"),
  R(/^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/, "numbers", "0 to 10"),
  R(/^(eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|ten thousand|million|hundred million|billion)\b/, "numbers", "Hundred, thousand, ten thousand"),
  R(/\b(counter for|measure word)\b/, "numbers", "Measure words"),
  R(/^(first|second|third|half|number|numeral|count|counting|pair|double|total|altogether)\b/, "numbers", "Counting and order"),
  R(/\b(kilogram|kilometer|kilometre|meter|metre|centimeter|gram|litre|liter|weight|length|size|percent)\b/, "numbers", "Weights and lengths"),
  R(/^(hello|hi|good morning|good evening|good night|good afternoon|goodbye|bye|thank|thanks|sorry|excuse me|please|welcome|you're welcome|congratulations|cheers|see you|nice to meet)\b/, "hello", "Greetings and polite words"),
  R(/^(i|me|you|he|him|she|her|it|we|us|they|them|myself|yourself|oneself|everyone|everybody|someone|somebody|nobody|others|other people)$/, "people", "I, you, he, she"),
  R(/^(this|that|these|those|here|there|every|each)$/, "people", "This, that, every"),
  R(/\b(father|mother|dad|mom|mum|parents?|brothers?|sisters?|siblings?)\b/, "family", "Parents and siblings"),
  R(/\b(son|daughter|child|children|kid|husband|wife|grandfather|grandmother|grandparent|grandchild|uncle|aunt|cousin|family|relative|niece|nephew|marry|married|marriage|wedding|baby)\b/, "family", "Children, partners, grandparents"),
  R(/\b(age|years old|young|elderly|neighbou?r)\b/, "family", "Age and neighbours"),
  R(/\b(name|mr|mrs|ms|miss|sir|madam|person|people|man|woman|men|women|boy|girl|friend|guest|stranger|adult|male|female|introduce|introduction)\b/, "people", "Names and introductions"),
  R(/\b(north|south|east|west)\b/, "countries", "North, south, east, west"),
  R(/\b(language|english|japanese|chinese|vietnamese|word|sentence|meaning|letter of the alphabet|kanji|hiragana|katakana|grammar|vocabulary|pronunciation|translat)/, "countries", "Languages"),
  R(/\b(country|nation|national|world|city|capital|village|province|foreign|abroad|japan|china|vietnam|america|england|france|germany|korea|europe|asia|culture|international)\b/, "countries", "Countries and the world"),
  R(/\b(o'clock|hour|minute|clock|now|time)\b/, "time", "Telling the time"),
  R(/\b(morning|noon|afternoon|evening|night|tonight|midnight|dawn|daytime)\b/, "time", "Parts of the day"),
  R(/\b(today|tomorrow|yesterday|day|days|week|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|daily)\b/, "time", "Days and weeks"),
  R(/\b(month|year|season|spring|summer|autumn|winter|january|february|march|april|june|july|august|september|october|november|december|birthday|holiday|festival|new year|calendar|date|anniversary)\b/, "time", "Months, years, seasons"),
  R(/^(before|after|later|soon|already|recently|recent|past|future|until|since|finally|at last|immediately|right away|formerly|previously|a while|for a long time|at first|then)\b/, "time", "Before, now, after"),
  R(/^(to eat|to drink|hungry|full|thirsty|delicious|tasty|taste|sweet|salty|spicy|sour|bitter|fresh|to cook|cooking|meal)\b/, "food", "Eating and drinking"),
  R(/\b(fruit|apple|banana|orange|grapes?|mango|watermelon|lemon|strawberry|peach|pineapple|coconut|pear|melon)\b/, "food", "Fruit"),
  R(/\b(water|tea|coffee|milk|beer|wine|juice|alcohol|sake|beverage|soft drink)\b/, "food", "Drinks"),
  R(/\b(restaurant|menu|waiter|waitress|chopsticks|spoon|fork|knife|bowl|plate|dish \(plate|cup|glass|bottle|cafe|café|canteen|cafeteria)\b/, "food", "At the restaurant"),
  R(/\b(rice|noodles?|bread|meat|beef|pork|chicken \(meat|egg|eggs|soup|vegetables?|tofu|dish|breakfast|lunch|dinner|supper|cake|sugar|salt|pepper|oil|sauce|food|snack|sandwich|sushi|pho|sweets|candy|butter|cheese|fish sauce)\b/, "food", "Meals"),
  R(/\b(money|yen|dong|dollar|coin|bank|credit card|cash|wallet|cost|fee|price|payment|to pay|salary|tax)\b/, "shopping", "Money"),
  R(/\b(buy|sell|shop|store|market|expensive|cheap|discount|customer|gift|present|shopping|department store|supermarket|goods)\b/, "shopping", "Buying and selling"),
  R(/^(to wake up|to get up|to sleep|sleep|to bathe|bath|to take a bath|to shower|shower|to wash|to brush|to wear|to put on|to take off|to rest|to clean|to sweep|to tidy)\b/, "day", "From morning to night"),
  R(/\b(house|home|room|kitchen|bed|bedroom|table|desk|chair|door|window|wall|floor|roof|stairs|lamp|light|refrigerator|fridge|key|bathroom|garden|apartment|furniture|shelf|sofa|curtain|toilet)\b/, "day", "At home"),
  R(/\b(clothes|clothing|shirt|t-shirt|trousers|pants|skirt|dress|coat|jacket|shoes?|socks|hat|cap|glasses|spectacles|wristwatch|watch|bag|handbag|umbrella|button|pocket|ring|necklace|sweater|uniform|kimono|tie|belt|gloves)\b/, "clothes", "Clothes"),
  R(/\b(phone|telephone|computer|internet|email|e-mail|photo|photograph|camera|film|movie|television|tv|radio|newspaper|magazine|news|program|programme|video|mail|post|postcard|stamp|online|website|smartphone)\b/, "clothes", "Phone, computer, media"),
  R(/\b(school|hospital|hotel|company|office|park|library|station|airport|street|road|bridge|building|post office|museum|temple|shrine|church|police|factory|theater|theatre|cinema|pharmacy|stadium|pagoda|zoo|embassy|town|place)\b/, "town", "Places"),
  R(/^(inside|outside|above|on top|up|down|below|under|beneath|front|in front|behind|back|left|right|next to|beside|between|middle|center|centre|near|nearby|far|corner|side|around|top|bottom)\b/, "town", "Where is it?"),
  R(/^(from|towards|toward|to \(a place)\b/, "town", "From, to, towards"),
  R(/^(to go|to come|to return|to go back|to come back|to arrive|to enter|to go in|to leave|to exit|to go out|to walk|to pass|to cross|to stop|to depart|to set out|to be late|to bring|to carry|to pick up|to move)\b/, "travel", "Going and coming"),
  R(/\b(car|bus|train|taxi|bicycle|bike|motorbike|motorcycle|plane|airplane|aeroplane|ship|boat|subway|metro|ticket|to drive|to ride|traffic|driver|vehicle|platform)\b/, "travel", "Transport"),
  R(/\b(travel|trip|tour|tourist|passport|suitcase|luggage|baggage|map|visa|sightseeing|vacation|journey|guide)\b/, "travel", "Travelling"),
  R(/\b(sick|ill|illness|disease|medicine|doctor|nurse|cold \(illness|fever|pain|painful|to hurt|injur|wound|health|healthy|cough|headache|patient|clinic|dentist)\b/, "body", "At the doctor's"),
  R(/\b(body|head|face|eyes?|ears?|nose|mouth|tooth|teeth|hair|hands?|fingers?|arms?|legs?|foot|feet|stomach|belly|heart|neck|shoulder|skin|blood|voice|lips|tongue|back \(of body)\b/, "body", "The body"),
  R(/\b(weather|rain|raining|snow|wind|windy|cloud|clouds|sunny|cloudy|storm|typhoon|thunder|lightning|temperature|humid|fog)\b/, "nature", "Weather"),
  R(/^(hot|cold|warm|cool)$/, "nature", "Weather"),
  R(/\b(animal|dog|cat|bird|fish|horse|cow|pig|chicken|duck|mouse|rat|insect|monkey|elephant|tiger|bear|rabbit|snake|buffalo|panda|sheep|goat|frog|butterfly|mosquito)\b/, "nature", "Animals"),
  R(/\b(sun|moon|stars?|sky|trees?|flowers?|grass|leaf|leaves|forest|woods|mountain|hill|river|sea|ocean|lake|island|beach|stone|rock|earth|nature|environment|sand|fire|field|plant)\b/, "nature", "Nature"),
  R(/\b(sport|sports|football|soccer|baseball|tennis|basketball|volleyball|to swim|swimming|to jog|to climb|exercise|competition|race|team|to win|to lose|ski|skiing|athlete|gym|match \(game)\b/, "free", "Sports"),
  R(/\b(hobby|music|song|to sing|to dance|dance|to draw|to paint|painting|guitar|piano|game|to play|party|fun|concert|instrument|festival|toy|chess)\b/, "free", "Hobbies and friends"),
  R(/\b(student|teacher|class|classroom|lesson|blackboard|pen|pencil|notebook|book|dictionary|university|college|kindergarten|textbook|eraser|ruler)\b/, "school", "At school"),
  R(/\b(homework|exam|examination|test|to study|study|to learn|to teach|to practice|to practise|to review|to answer|answer|question|grade|marks|math|mathematics|history|science|subject|research|knowledge|lecture)\b/, "school", "Learning"),
  R(/\b(work|job|boss|manager|colleague|employee|meeting|business|factory|worker|occupation|career|profession|office worker|company employee)\b/, "school", "At work"),
  R(/^(red|blue|green|yellow|white|black|brown|pink|purple|grey|gray|colou?r)\b/, "describe", "Colours"),
  R(/^(happy|sad|angry|afraid|scared|frightened|worried|to worry|glad|lonely|tired|busy|surprised|nervous|calm|to laugh|to smile|to cry|to feel|feeling|emotion|to enjoy|anxious|embarrassed|jealous|proud|disappointed|bored)\b/, "describe", "Feelings"),
  R(/^(big|large|small|little|long|short|tall|high|low|new|old|fast|quick|slow|good|bad|easy|difficult|hard|many|much|few|heavy|light|wide|narrow|thick|thin|clean|dirty|early|late|right|wrong|correct|strong|weak|bright|dark|fat|deep|shallow|loud|young)\b/, "describe", "Opposites"),
  R(/^(beautiful|pretty|cute|clever|smart|intelligent|kind|gentle|famous|quiet|noisy|convenient|inconvenient|comfortable|simple|clear|strange|same|different|important|special|interesting|boring|delicious|polite|rude|honest|lazy|diligent|serious|safe|dangerous|free|necessary|possible|impossible)\b/, "describe", "People and things"),
  R(/^(to see|to look|to watch|to hear|to listen|to say|to speak|to talk|to tell|to ask|to read|to write|to call|to explain|to reply|to show)\b/, "verbs", "Seeing, hearing, saying"),
  R(/^(to want|to like|to love|to hope|to wish|to need|must|to have to|to be able|can|may|should|ought)\b/, "verbs", "Want, like, can, must"),
  R(/^(to know|to understand|to think|to believe|to remember|to forget|to decide|to choose|to plan|to prepare|to find|to discover|to notice|to guess|to consider|to imagine|to recognize|to recognise|to compare)\b/, "verbs", "Knowing and thinking"),
  R(/^(to help|to take care|to look after|to let|to allow|to permit|to join|to participate|to take part|to improve|to try hard|to work hard|to support|to protect|to invite)\b/, "verbs", "Helping and taking part"),
  R(/^(to be|to exist|to have|there is|there are|not have|to own)$/, "verbs", "To be and to have"),
  R(/^(not|no|very|too|really|quite|rather|extremely|most|more|less|fairly|so)\b/, "grammar", "Not, very, more"),
  R(/^(and|or|but|because|therefore|if|although|though|also|even|only|except|besides|however|moreover|furthermore|as well)\b/, "grammar", "And, also, but, because"),
  R(/^(again|often|always|sometimes|usually|never|still|yet|just|suddenly|almost|certainly|surely|maybe|perhaps|probably|of course|actually|in fact|together|once|frequently|occasionally|gradually)\b/, "grammar", "When and how often"),
];

// The word lists' own categories, when no meaning rule fits
const BY_CAT = {
  phrases: G("hello", "Greetings and polite words"), pronouns: G("people", "I, you, he, she"), people: G("people", "Names and introductions"),
  family: G("family", "Children, partners, grandparents"), numbers: G("numbers", "Counting and order"), measure: G("numbers", "Measure words"),
  time: G("time", "Before, now, after"), food: G("food", "Meals"), places: G("town", "Places"), transport: G("travel", "Transport"),
  objects: G("day", "At home"), body: G("body", "The body"), nature: G("nature", "Nature"), animals: G("nature", "Animals"),
  study: G("school", "Learning"), sports: G("free", "Hobbies and friends"), question: G("questions", "Question words"),
  particles: G("grammar", "Grammar particles"), adverbs: G("grammar", "When and how often")
};
// Same English, different thing: 風邪 "cold" is the illness, not the weather
const NO_PICTURE = new Set(["風邪"]);
const MORE_VERBS = "verbs/more", MORE_DESC = "describe/more";

const out = { THEMES: {}, PICTURES: {} };
const stats = {};
for (const [course, c] of Object.entries(COURSES)) {
  const placed = new Map(); // group key → [{ w, rank }]
  const pics = {}, usedPics = new Set(), how = { chinese: 0, rule: 0, category: 0, verb: 0, more: 0 };
  const put = (key, w, rank) => { if (!placed.has(key)) placed.set(key, []); placed.get(key).push({ w, rank }); };
  for (const [i, w] of c.words.entries()) {
    const ss = senses(w.en);
    if (w.t) { // sorted by hand: "food/2" = the third group of Food & drink
      const [tid, gi] = w.t.split("/"), t = W.THEMES.zh.find((x) => x.id === tid);
      if (!t || !t.groups[+gi]) throw new Error(`${w.id}: no topic group ${w.t}`);
      how.rule++; put(groupKey(t, +gi), w, i);
      const same = mainSense.get(ss[0]), p = same !== undefined ? W.PICTURES.zh[same] : undefined;
      if (p && !usedPics.has(p) && !NO_PICTURE.has(w.hz)) { pics[w.id] = p; usedPics.add(p); }
      continue;
    }
    const zhId = ss.map((s) => bySense.get(s)).find((x) => x !== undefined);
    if (zhId !== undefined) {
      how.chinese++; put(zhGroup[zhId], w, zhOrder[zhId]);
      // The picture only when both words mainly mean the same (菜 "dish, vegetable" must not give 野菜 "vegetable" a dish)
      const same = mainSense.get(ss[0]);
      const p = same !== undefined && same === zhId && !NO_PICTURE.has(w.hz) ? W.PICTURES.zh[zhId] : undefined;
      if (p && !usedPics.has(p)) { pics[w.id] = p; usedPics.add(p); }
      continue;
    }
    const first = ss[0] || "", whole = ss.join(", ");
    const rule = RULES.find(([re]) => re.test(first)) || RULES.find(([re]) => re.test(whole));
    const rank = 1e6 + w.lvl * 1e5 + i;
    if (rule) { how.rule++; put(rule[1], w, rank); continue; }
    if (BY_CAT[w.cat]) { how.category++; put(BY_CAT[w.cat], w, rank); continue; }
    if (/^to /.test(first) || w.cat === "verbs") { how.verb++; put(MORE_VERBS, w, rank); continue; }
    if (w.cat === "adjectives" || (course === "ja" && /[いな]$/.test(w.hz) && !/^to /.test(first))) { how.verb++; put(MORE_DESC, w, rank); continue; }
    how.more++; put("more/" + w.lvl, w, rank);
  }
  // Same topics and groups as Chinese, plus "More verbs", "More describing words" and "More words" by level
  const themes = W.THEMES.zh.map((t) => ({
    id: t.id, icon: t.icon, name: t.name,
    groups: t.groups.map((g, gi) => ({ name: g.name, key: groupKey(t, gi) }))
      .concat(t.id === "verbs" ? [{ name: { en: "More verbs", de: "Weitere Verben" }, key: MORE_VERBS }] : [])
      .concat(t.id === "describe" ? [{ name: { en: "More describing words", de: "Weitere beschreibende Wörter" }, key: MORE_DESC }] : [])
  })).concat([{ id: "more", icon: "📚", name: { en: "More words", de: "Weitere Wörter" }, groups: c.levels.map((l, k) => ({ name: { en: l, de: l }, key: "more/" + (k + 1) })) }]);
  out.THEMES[course] = themes.map((t) => ({
    id: t.id, icon: t.icon, name: t.name,
    groups: t.groups.map((g) => ({ name: g.name, ids: (placed.get(g.key) || []).sort((x, y) => x.rank - y.rank || x.w.lvl - y.w.lvl).map((x) => x.w.id) })).filter((g) => g.ids.length)
  })).filter((t) => t.groups.length);
  // Pictures for common things the Chinese list doesn't have
  const EXTRA = { vegetable: "🥬", vegetables: "🥬", dish: "🍲", car: "🚗", train: "🚆", motorbike: "🛵", motorcycle: "🏍️", bed: "🛏️", key: "🔑", window: "🪟", house: "🏡", kitchen: "🍳", "ice cream": "🍦",
    orange: "🍊", lemon: "🍋", strawberry: "🍓", mango: "🥭", pineapple: "🍍", coconut: "🥥", grape: "🍇", peach: "🍑", tomato: "🍅", potato: "🥔", carrot: "🥕",
    corn: "🌽", mushroom: "🍄", cheese: "🧀", chicken: "🐔", pig: "🐖", cow: "🐄", mouse: "🐁", rabbit: "🐇", monkey: "🐒", elephant: "🐘", tiger: "🐅",
    snake: "🐍", frog: "🐸", butterfly: "🦋", duck: "🦆", buffalo: "🐃", sheep: "🐑", star: "⭐", sea: "🌊", mountain: "🏔️", river: "🏞️", island: "🏝️",
    fire: "🔥", rainbow: "🌈", lightning: "⚡", thunder: "🌩️", typhoon: "🌀", leaf: "🍃", tooth: "🦷", hand: "✋", finger: "👉", heart: "🫀", baby: "👶",
    king: "🤴", police: "👮", hospital: "🏥", church: "⛪", temple: "🛕", shrine: "⛩️", bridge: "🌉", factory: "🏭", school: "🏫", stadium: "🏟️",
    guitar: "🎸", piano: "🎹", ball: "🏐", tennis: "🎾", baseball: "⚾", swimming: "🏊", ski: "⛷️", book: "📘", letter: "✉️", scissors: "✂️", clock: "🕰️",
    door: "🚪", toilet: "🚽", shoes: "👟", socks: "🧦", glasses: "👓", coat: "🧥", gloves: "🧤", ring: "💍", tie: "👔", kimono: "👘", sun: "☀️", moon: "🌙" };
  for (const t of out.THEMES[course]) for (const g of t.groups) for (const id of g.ids) {
    if (pics[id]) continue;
    const w = c.words.find((x) => x.id === id), p = EXTRA[senses(w.en)[0]];
    if (p && !usedPics.has(p)) { pics[id] = p; usedPics.add(p); }
  }
  out.PICTURES[course] = pics;
  stats[course] = { ...how, words: c.words.length, pictures: Object.keys(pics).length };
}

const header = `/* Topics and pictures for Vietnamese, Japanese and Korean, generated by tools/build-topics.mjs from the Chinese ones
 * (themes.js) and the English meanings. Do not edit by hand: change the rules there and run it again. */\n`;
fs.writeFileSync(path.join(JS, "themes-auto.js"), header +
  `Object.assign(window.THEMES = window.THEMES || {}, ${JSON.stringify(out.THEMES)});\n` +
  `Object.assign(window.PICTURES = window.PICTURES || {}, ${JSON.stringify(out.PICTURES)});\n`);
console.log(JSON.stringify(stats));
