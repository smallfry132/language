/* Topics and pictures for the Chinese words.
 * THEMES: every HSK 1–3 word in exactly one group, the topics in learning order (greetings first, grammar words last)
 * and each group in a natural order (numbers 0 → 10, days yesterday → tomorrow, opposites in pairs).
 * New words in Today follow this order when there are no lessons.
 * PICTURES: an emoji for words that can be shown as a picture, so you think of the thing, not its translation.
 * Abstract words have none; no two words share a picture. tools/check-themes.mjs checks both. */
window.THEMES = {
  zh: [
    { id: "hello", icon: "👋", name: { en: "Hello & thanks", de: "Hallo & danke" }, groups: [
      { name: { en: "Greetings and polite words", de: "Begrüßung und Höflichkeit" }, ids: [138, 126, 7, 23, 64, 83, 401, 111] }
    ] },
    { id: "people", icon: "🙋", name: { en: "Me, you & others", de: "Ich, du & andere" }, groups: [
      { name: { en: "I, you, he, she", de: "Ich, du, er, sie" }, ids: [112, 74, 224, 105, 106, 251, 113, 167, 595, 324, 483] },
      { name: { en: "This, that, every", de: "Dies, das, jedes" }, ids: [142, 71, 219] },
      { name: { en: "Names and introductions", de: "Namen und Vorstellen" }, ids: [68, 47, 269, 87, 197, 86, 77, 119, 123, 223, 226] }
    ] },
    { id: "family", icon: "👨‍👩‍👧", name: { en: "Family", de: "Familie" }, groups: [
      { name: { en: "Parents and siblings", de: "Eltern und Geschwister" }, ids: [3, 60, 180, 196, 171, 220] },
      { name: { en: "Children, partners, grandparents", de: "Kinder, Partner, Großeltern" }, ids: [26, 76, 187, 292, 231, 554, 468, 505, 302, 426] },
      { name: { en: "Age and neighbours", de: "Alter und Nachbarn" }, ids: [104, 473, 447, 456] }
    ] },
    { id: "countries", icon: "🌍", name: { en: "Countries & languages", de: "Länder & Sprachen" }, groups: [
      { name: { en: "Countries and the world", de: "Länder und die Welt" }, ids: [143, 5, 390, 502, 336, 405, 533] },
      { name: { en: "North, south, east, west", de: "Norden, Süden, Osten, Westen" }, ids: [316, 469, 356, 534] },
      { name: { en: "Languages", de: "Sprachen" }, ids: [35, 588, 147, 435, 281] }
    ] },
    { id: "numbers", icon: "🔢", name: { en: "Numbers & counting", de: "Zahlen & Zählen" }, groups: [
      { name: { en: "0 to 10", de: "0 bis 10" }, ids: [213, 131, 27, 88, 103, 114, 59, 80, 2, 49, 95] },
      { name: { en: "Hundred, thousand, ten thousand", de: "Hundert, tausend, zehntausend" }, ids: [153, 233, 528] },
      { name: { en: "Counting and order", de: "Zählen und Reihenfolge" }, ids: [212, 172, 312, 558] },
      { name: { en: "Measure words", de: "Zählwörter" }, ids: [32, 6, 194, 578, 519, 584, 453, 532, 510, 331, 360, 590, 163, 124, 44, 279] },
      { name: { en: "Weights and lengths", de: "Gewichte und Längen" }, ids: [382, 464] }
    ] },
    { id: "time", icon: "🕒", name: { en: "Time & dates", de: "Zeit & Datum" }, groups: [
      { name: { en: "Telling the time", de: "Uhrzeit" }, ids: [16, 371, 439, 30, 266, 120, 96, 243] },
      { name: { en: "Parts of the day", de: "Tageszeiten" }, ids: [291, 91, 144, 117, 258] },
      { name: { en: "Days and weeks", de: "Tage und Wochen" }, ids: [148, 48, 67, 127, 592, 238, 37] },
      { name: { en: "Months, years, seasons", de: "Monate, Jahre, Jahreszeiten" }, ids: [137, 75, 236, 413, 340, 538, 490, 357, 242, 425] },
      { name: { en: "Before, now, after", de: "Vorher, jetzt, nachher" }, ids: [562, 392, 377, 600, 280, 461, 559, 539, 492, 396, 599, 589, 433] }
    ] },
    { id: "food", icon: "🍜", name: { en: "Food & drink", de: "Essen & Trinken" }, groups: [
      { name: { en: "Eating and drinking", de: "Essen und Trinken" }, ids: [11, 38, 363, 315, 438, 188, 518, 547] },
      { name: { en: "Meals", de: "Gerichte" }, ids: [66, 222, 465, 193, 274, 9, 347] },
      { name: { en: "Fruit", de: "Obst" }, ids: [100, 79, 541, 263] },
      { name: { en: "Drinks", de: "Getränke" }, ids: [99, 10, 202, 225, 480, 565] },
      { name: { en: "At the restaurant", de: "Im Restaurant" }, ids: [28, 328, 177, 440, 445, 527, 477, 4, 481] }
    ] },
    { id: "shopping", icon: "🛍️", name: { en: "Shopping & money", de: "Einkaufen & Geld" }, groups: [
      { name: { en: "Buying and selling", de: "Kaufen und verkaufen" }, ids: [62, 216, 89, 333, 184, 229, 449, 248] },
      { name: { en: "Money", de: "Geld" }, ids: [82, 573, 53, 420, 548, 564] }
    ] },
    { id: "day", icon: "🛏️", name: { en: "Home & daily routine", de: "Zuhause & Alltag" }, groups: [
      { name: { en: "From morning to night", de: "Von morgens bis abends" }, ids: [232, 509, 265, 537, 162, 239, 270, 101] },
      { name: { en: "At home", de: "Zuhause" }, ids: [46, 175, 146, 135, 221, 350, 325, 441, 18, 20, 343, 309, 145] }
    ] },
    { id: "clothes", icon: "👕", name: { en: "Clothes & things", de: "Kleidung & Dinge" }, groups: [
      { name: { en: "Clothes", de: "Kleidung" }, ids: [132, 334, 444, 491, 479, 463, 245, 314, 498] },
      { name: { en: "Phone, computer, media", de: "Handy, Computer, Medien" }, ids: [246, 13, 17, 499, 355, 582, 583, 19, 424, 155, 546] }
    ] },
    { id: "town", icon: "🏙️", name: { en: "In town", de: "In der Stadt" }, groups: [
      { name: { en: "Places", de: "Orte" }, ids: [130, 134, 158, 183, 311, 383, 524, 536, 423, 214, 458, 354, 351] },
      { name: { en: "Where is it?", de: "Wo ist es?" }, ids: [139, 90, 116, 58, 255, 81, 41, 301, 286, 227, 587, 372, 199, 288] },
      { name: { en: "From, to, towards", de: "Von, nach, in Richtung" }, ids: [164, 211, 259, 542] }
    ] },
    { id: "travel", icon: "🚕", name: { en: "Getting around", de: "Unterwegs" }, groups: [
      { name: { en: "Going and coming", de: "Gehen und kommen" }, ids: [84, 54, 42, 168, 198, 161, 299, 185, 431, 448, 577, 337, 345, 422] },
      { name: { en: "Transport", de: "Verkehrsmittel" }, ids: [29, 182, 12, 352, 596, 339, 191, 192, 486, 485, 149] },
      { name: { en: "Travelling", de: "Reisen" }, ids: [215, 230, 397, 549, 353] }
    ] },
    { id: "body", icon: "🫀", name: { en: "Body & health", de: "Körper & Gesundheit" }, groups: [
      { name: { en: "The body", de: "Der Körper" }, ids: [240, 451, 273, 364, 318, 598, 442, 522, 421, 525, 378] },
      { name: { en: "At the doctor's", de: "Beim Arzt" }, ids: [241, 366, 375, 515, 275, 133, 417] }
    ] },
    { id: "nature", icon: "🌦️", name: { en: "Weather, nature & animals", de: "Wetter, Natur & Tiere" }, groups: [
      { name: { en: "Weather", de: "Wetter" }, ids: [108, 235, 284, 118, 271, 385, 57, 85] },
      { name: { en: "Nature", de: "Natur" }, ids: [513, 575, 507, 398, 330, 403] },
      { name: { en: "Animals", de: "Tiere" }, ids: [358, 63, 34, 287, 474, 460, 550] }
    ] },
    { id: "free", icon: "⚽", name: { en: "Free time", de: "Freizeit" }, groups: [
      { name: { en: "Sports", de: "Sport" }, ids: [289, 517, 228, 285, 166, 252, 476, 361, 320] },
      { name: { en: "Hobbies and friends", de: "Hobbys und Freunde" }, ids: [305, 160, 254, 563, 399, 569, 257, 454, 416] }
    ] },
    { id: "school", icon: "🎒", name: { en: "School & work", de: "Schule & Arbeit" }, groups: [
      { name: { en: "At school", de: "In der Schule" }, ids: [128, 55, 110, 545, 195, 207, 308, 472, 395, 98, 341, 234, 321] },
      { name: { en: "Learning", de: "Lernen" }, ids: [129, 419, 373, 452, 601, 204, 253, 335, 508, 450, 457] },
      { name: { en: "At work", de: "Bei der Arbeit" }, ids: [33, 432, 520, 512, 407, 489] }
    ] },
    { id: "verbs", icon: "🏃", name: { en: "Everyday verbs", de: "Alltagsverben" }, groups: [
      { name: { en: "To be and to have", de: "Sein und haben" }, ids: [97, 136, 65] },
      { name: { en: "Seeing, hearing, saying", de: "Sehen, hören, sagen" }, ids: [51, 52, 109, 102, 247, 22, 125, 261, 406, 179, 418, 365] },
      { name: { en: "Want, like, can, must", de: "Wollen, mögen, können, müssen" }, ids: [121, 276, 115, 1, 43, 73, 206, 566, 322, 574, 551, 264, 376] },
      { name: { en: "Knowing and thinking", de: "Wissen und denken" }, ids: [297, 173, 466, 455, 201, 494, 540, 412, 529, 436, 552, 344, 298, 367, 543, 521] },
      { name: { en: "Doing and using", de: "Tun und benutzen" }, ids: [150, 568, 467, 369, 181, 293, 170, 404, 503, 50, 386, 203, 256, 526, 427, 428, 414, 429, 402, 487] },
      { name: { en: "Helping and taking part", de: "Helfen und mitmachen" }, ids: [154, 313, 581, 237, 553, 329, 516, 475, 579, 567, 572] }
    ] },
    { id: "describe", icon: "🎨", name: { en: "Describing things", de: "Dinge beschreiben" }, groups: [
      { name: { en: "Opposites", de: "Gegensätze" }, ids: [14, 122, 24, 92, 178, 304, 159, 359, 208, 217, 268, 434, 36, 400, 174, 165, 470, 496, 478, 504, 374, 332] },
      { name: { en: "Colours", de: "Farben" }, ids: [272, 190, 152, 189, 446, 459] },
      { name: { en: "Feelings", de: "Gefühle" }, ids: [31, 209, 267, 443, 500, 471, 346, 394, 370, 388, 462, 580, 210, 218, 544, 594] },
      { name: { en: "People and things", de: "Menschen und Dinge" }, ids: [78, 437, 342, 493, 495, 570, 306, 368, 506, 415, 488, 484, 560, 591, 593, 514, 555] },
      { name: { en: "Ideas and matters", de: "Ideen und Angelegenheiten" }, ids: [244, 262, 310, 323, 384, 387, 410, 501, 511, 535] }
    ] },
    { id: "questions", icon: "❓", name: { en: "Questions", de: "Fragen" }, groups: [
      { name: { en: "Question words", de: "Fragewörter" }, ids: [94, 93, 70, 69, 45, 25, 140, 141, 260, 362] },
      { name: { en: "Asking", de: "Fragen stellen" }, ids: [61, 72, 393] }
    ] },
    { id: "grammar", icon: "🔗", name: { en: "Little words", de: "Kleine Wörter" }, groups: [
      { name: { en: "Not, very, more", de: "Nicht, sehr, mehr" }, ids: [8, 157, 40, 107, 176, 295, 300, 381, 411, 319, 156] },
      { name: { en: "And, also, but, because", de: "Und, auch, aber, weil" }, ids: [39, 380, 277, 21, 278, 186, 250, 249, 282, 283, 497, 326, 327, 408, 585, 338] },
      { name: { en: "When and how often", de: "Wann und wie oft" }, ids: [290, 571, 430, 597, 561, 296, 200, 586, 523, 409, 557, 205, 348, 482, 556, 576] },
      { name: { en: "Grammar particles", de: "Grammatikpartikel" }, ids: [15, 56, 391, 294, 169, 349, 151, 303, 307, 317, 530, 531, 379, 389] }
    ] }
  ]
};

window.PICTURES = {
  zh: {
    1: "❤️", 2: "8️⃣", 3: "👨", 4: "🥤", 9: "🥬", 10: "🍵", 12: "🚕", 13: "📞", 17: "💻", 18: "📺", 19: "🎬", 27: "2️⃣", 28: "🍴",
    29: "✈️", 31: "😊", 34: "🐕", 46: "🏠", 49: "9️⃣", 55: "🧑‍🏫", 57: "🥶", 59: "6️⃣", 60: "👩", 62: "🛒", 63: "🐈", 66: "🍚",
    76: "👧", 77: "🤝", 79: "🍎", 80: "7️⃣", 82: "💰", 85: "🥵", 88: "3️⃣", 89: "🏪", 95: "🔟", 98: "📕", 99: "💧", 100: "🍇",
    101: "😴", 102: "🗣️", 103: "4️⃣", 108: "🌦️", 109: "🎧", 114: "5️⃣", 118: "🌧️", 125: "✍️", 126: "🙏", 129: "📚", 130: "🏫",
    131: "1️⃣", 132: "👚", 133: "🧑‍⚕️", 134: "🏥", 135: "🪑", 138: "👋", 143: "🇨🇳", 152: "⬜", 153: "💯", 155: "📰", 158: "🏨",
    160: "🎤", 166: "🏀", 182: "🚌", 183: "🏢", 187: "🧒", 188: "😋", 189: "⬛", 190: "🟥", 191: "🚉", 192: "🛫", 193: "🥚",
    202: "☕", 204: "📝", 210: "😩", 213: "0️⃣", 215: "🧭", 222: "🍜", 225: "🥛", 228: "🏃", 230: "🎟️", 231: "👰", 232: "⏰",
    234: "✏️", 235: "🌤️", 241: "🤒", 242: "🎂", 245: "⌚", 246: "📱", 252: "⚽", 254: "💃", 263: "🍉", 265: "🧼", 266: "⏳",
    267: "😄", 271: "❄️", 273: "👁️", 274: "🍖", 275: "💊", 284: "☁️", 285: "🏊", 287: "🐟", 289: "🏋️", 292: "🤵", 309: "📦",
    311: "💼", 314: "👜", 318: "👃", 320: "🏆", 321: "📓", 330: "🌱", 334: "👔", 336: "🏙️", 339: "🚢", 340: "🌸", 347: "🍰",
    350: "💡", 352: "🚇", 353: "🗺️", 354: "🛗", 355: "📧", 357: "⛄", 364: "👂", 366: "🌡️", 375: "🤧", 383: "🏞️", 385: "🌬️",
    394: "😨", 397: "🛂", 398: "🌺", 399: "🎨", 421: "🦶", 425: "🎉", 426: "💍", 443: "😢", 444: "👖", 445: "🥢", 446: "🟦",
    449: "🎁", 454: "💬", 459: "🟩", 460: "🐎", 463: "🧢", 465: "🍞", 474: "🐦", 476: "⛰️", 477: "🍽️", 479: "👞", 480: "🍺",
    481: "🍾", 490: "🍂", 491: "👗", 498: "☂️", 499: "🌐", 500: "😠", 502: "🌍", 507: "🌳", 508: "➗", 509: "🪥", 513: "☀️",
    515: "🤕", 522: "💇", 525: "🦵", 527: "🥣", 536: "🚻", 537: "🛁", 538: "🌻", 541: "🍌", 548: "💳", 549: "🧳", 550: "🐼",
    554: "👴", 468: "👵", 563: "🎵", 564: "🏦", 565: "🧃", 569: "🎮", 573: "💴", 575: "🌙", 582: "🖼️", 583: "📷", 596: "🚲",
    598: "👄", 127: "📅", 16: "🕒", 518: "🍬"
  }
};
