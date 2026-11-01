/* Sound charts and listening drills per course.
 * rows: one base sound per row, its variants as cells. Each cell: t = text shown, s = text sent to speech (defaults to t).
 * match: how to find example words for the row in the course word list (see soundExamples in app.js).
 * drills: sets of confusable items; a drill plays one and asks which it was. */
window.SOUNDS = {
  zh: {
    intro: { en: "Mandarin syllables are an initial consonant plus a final, spoken in one of four tones (or the light neutral tone). Tap a cell to hear it; example words come from the HSK lists.", de: "Mandarin-Silben bestehen aus Anlaut und Auslaut und werden in einem von vier Tönen (oder dem leichten neutralen Ton) gesprochen. Tippe eine Zelle, um sie zu hören; die Beispielwörter stammen aus den HSK-Listen." },
    groups: [
      { id: "vowels", name: { en: "Vowels", de: "Vokale" }, head: ["1st ˉ", "2nd ˊ", "3rd ˇ", "4th ˋ"], rows: [
        { base: "a", cells: [{ t: "ā", s: "妈" }, { t: "á", s: "麻" }, { t: "ǎ", s: "马" }, { t: "à", s: "骂" }], match: { final: "a" }, note: { en: "open, like 'father'", de: "offen, wie in „Vater“" } },
        { base: "o", cells: [{ t: "ō", s: "摸" }, { t: "ó", s: "魔" }, { t: "wǒ", s: "我" }, { t: "ò", s: "墨" }], match: { final: "o" }, note: { en: "rounded, between 'o' and 'u'", de: "gerundet, zwischen o und u" } },
        { base: "e", cells: [{ t: "ē", s: "哥" }, { t: "é", s: "鹅" }, { t: "ě", s: "可" }, { t: "è", s: "饿" }], match: { final: "e" }, note: { en: "unrounded, like 'uh' with the tongue back", de: "ungerundet, ein dumpfes „ö/uh“" } },
        { base: "i", cells: [{ t: "ī", s: "一" }, { t: "í", s: "姨" }, { t: "ǐ", s: "以" }, { t: "ì", s: "意" }], match: { final: "i" }, note: { en: "like 'ee'; after z c s zh ch sh r it is a buzzing 'i'", de: "wie „ie“; nach z c s zh ch sh r ein summendes i" } },
        { base: "u", cells: [{ t: "ū", s: "乌" }, { t: "ú", s: "无" }, { t: "ǔ", s: "五" }, { t: "ù", s: "物" }], match: { final: "u" }, note: { en: "like 'oo' in 'moon'", de: "wie u in „Mut“" } },
        { base: "ü", cells: [{ t: "ǖ", s: "淤" }, { t: "ǘ", s: "鱼" }, { t: "ǚ", s: "雨" }, { t: "ǜ", s: "玉" }], match: { final: "v" }, note: { en: "like German ü; written u after j q x y", de: "wie deutsches ü; nach j q x y als u geschrieben" } },
        { base: "er", cells: [{ t: "ér", s: "儿" }, { t: "ěr", s: "耳" }, { t: "èr", s: "二" }], match: { final: "er" }, note: { en: "r-coloured vowel", de: "r-gefärbter Vokal" } }
      ] },
      { id: "finals", name: { en: "Finals (vowel + ending)", de: "Auslaute (Vokal + Endung)" }, head: ["1st ˉ", "2nd ˊ", "3rd ˇ", "4th ˋ"], rows: [
        { base: "ai", cells: [{ t: "āi", s: "哀" }, { t: "ái", s: "癌" }, { t: "ǎi", s: "矮" }, { t: "ài", s: "爱" }], match: { final: "ai" } },
        { base: "ei", cells: [{ t: "fēi", s: "飞" }, { t: "féi", s: "肥" }, { t: "fěi", s: "匪" }, { t: "fèi", s: "费" }], match: { final: "ei" } },
        { base: "ao", cells: [{ t: "bāo", s: "包" }, { t: "báo", s: "雹" }, { t: "bǎo", s: "饱" }, { t: "bào", s: "抱" }], match: { final: "ao" } },
        { base: "ou", cells: [{ t: "shōu", s: "收" }, { t: "" }, { t: "shǒu", s: "手" }, { t: "shòu", s: "瘦" }], match: { final: "ou" } },
        { base: "an", cells: [{ t: "cān", s: "餐" }, { t: "cán", s: "残" }, { t: "cǎn", s: "惨" }, { t: "càn", s: "灿" }], match: { final: "an" } },
        { base: "ang", cells: [{ t: "tāng", s: "汤" }, { t: "táng", s: "糖" }, { t: "tǎng", s: "躺" }, { t: "tàng", s: "烫" }], match: { final: "ang" } },
        { base: "en", cells: [{ t: "fēn", s: "分" }, { t: "fén", s: "坟" }, { t: "fěn", s: "粉" }, { t: "fèn", s: "份" }], match: { final: "en" } },
        { base: "eng", cells: [{ t: "fēng", s: "风" }, { t: "féng", s: "逢" }, { t: "fěng", s: "讽" }, { t: "fèng", s: "凤" }], match: { final: "eng" } },
        { base: "in", cells: [{ t: "yīn", s: "音" }, { t: "yín", s: "银" }, { t: "yǐn", s: "引" }, { t: "yìn", s: "印" }], match: { final: "in" } },
        { base: "ing", cells: [{ t: "yīng", s: "英" }, { t: "yíng", s: "迎" }, { t: "yǐng", s: "影" }, { t: "yìng", s: "硬" }], match: { final: "ing" } },
        { base: "ong", cells: [{ t: "tōng", s: "通" }, { t: "tóng", s: "同" }, { t: "tǒng", s: "统" }, { t: "tòng", s: "痛" }], match: { final: "ong" } },
        { base: "ian", cells: [{ t: "yān", s: "烟" }, { t: "yán", s: "盐" }, { t: "yǎn", s: "眼" }, { t: "yàn", s: "燕" }], match: { final: "ian" } },
        { base: "uan", cells: [{ t: "wān", s: "弯" }, { t: "wán", s: "完" }, { t: "wǎn", s: "晚" }, { t: "wàn", s: "万" }], match: { final: "uan" } },
        { base: "iao", cells: [{ t: "jiāo", s: "交" }, { t: "" }, { t: "jiǎo", s: "脚" }, { t: "jiào", s: "叫" }], match: { final: "iao" } },
        { base: "iu", cells: [{ t: "jiū", s: "揪" }, { t: "" }, { t: "jiǔ", s: "九" }, { t: "jiù", s: "就" }], match: { final: "iu" } },
        { base: "ui", cells: [{ t: "duī", s: "堆" }, { t: "" }, { t: "" }, { t: "duì", s: "对" }], match: { final: "ui" } },
        { base: "un", cells: [{ t: "hūn", s: "婚" }, { t: "hún", s: "魂" }, { t: "" }, { t: "hùn", s: "混" }], match: { final: "un" } }
      ] },
      { id: "initials", name: { en: "Consonants (initials)", de: "Konsonanten (Anlaute)" }, head: [], rows: [
        { base: "b · p", cells: [{ t: "bā", s: "八" }, { t: "pā", s: "趴" }], match: { initial: "b|p" }, note: { en: "b is unaspirated (like 'spin'), p has a puff of air", de: "b ohne Hauch (wie in „Spinne“), p mit Hauch" } },
        { base: "d · t", cells: [{ t: "dā", s: "搭" }, { t: "tā", s: "他" }], match: { initial: "d|t" }, note: { en: "same contrast: no puff vs puff", de: "gleicher Kontrast: ohne vs. mit Hauch" } },
        { base: "g · k", cells: [{ t: "gē", s: "哥" }, { t: "kē", s: "科" }], match: { initial: "g|k" } },
        { base: "m · f", cells: [{ t: "mā", s: "妈" }, { t: "fā", s: "发" }], match: { initial: "m|f" } },
        { base: "n · l", cells: [{ t: "ná", s: "拿" }, { t: "lā", s: "拉" }], match: { initial: "n|l" } },
        { base: "h", cells: [{ t: "hā", s: "哈" }, { t: "hē", s: "喝" }], match: { initial: "h" }, note: { en: "rougher than English h, like German 'ch' in 'Bach'", de: "rauer als deutsches h, fast wie „ch“ in „Bach“" } },
        { base: "j · q · x", cells: [{ t: "jī", s: "鸡" }, { t: "qī", s: "七" }, { t: "xī", s: "西" }], match: { initial: "j|q|x" }, note: { en: "tongue flat and forward; only before i and ü", de: "Zunge flach und vorn; nur vor i und ü" } },
        { base: "zh · ch · sh · r", cells: [{ t: "zhī", s: "知" }, { t: "chī", s: "吃" }, { t: "shī", s: "诗" }, { t: "rì", s: "日" }], match: { initial: "zh|ch|sh|r" }, note: { en: "tongue tip curled back (retroflex)", de: "Zungenspitze nach hinten gebogen (retroflex)" } },
        { base: "z · c · s", cells: [{ t: "zī", s: "资" }, { t: "cī", s: "疵" }, { t: "sī", s: "思" }], match: { initial: "z|c|s" }, note: { en: "tongue tip at the teeth: 'dz', 'ts', 's'", de: "Zungenspitze an den Zähnen: „ds“, „ts“, „s“" } },
        { base: "w · y", cells: [{ t: "wǒ", s: "我" }, { t: "yā", s: "呀" }], match: { initial: "w|y" } }
      ] }
    ],
    drills: [
      { id: "tones", name: { en: "Tones", de: "Töne" }, sets: [
        [{ t: "mā", s: "妈" }, { t: "má", s: "麻" }, { t: "mǎ", s: "马" }, { t: "mà", s: "骂" }],
        [{ t: "yī", s: "一" }, { t: "yí", s: "姨" }, { t: "yǐ", s: "以" }, { t: "yì", s: "意" }],
        [{ t: "wū", s: "乌" }, { t: "wú", s: "无" }, { t: "wǔ", s: "五" }, { t: "wù", s: "物" }],
        [{ t: "bāo", s: "包" }, { t: "báo", s: "雹" }, { t: "bǎo", s: "饱" }, { t: "bào", s: "抱" }],
        [{ t: "tāng", s: "汤" }, { t: "táng", s: "糖" }, { t: "tǎng", s: "躺" }, { t: "tàng", s: "烫" }],
        [{ t: "shū", s: "书" }, { t: "shú", s: "熟" }, { t: "shǔ", s: "鼠" }, { t: "shù", s: "树" }],
        [{ t: "mǎi", s: "买" }, { t: "mài", s: "卖" }],
        [{ t: "wèn", s: "问" }, { t: "wén", s: "文" }, { t: "wěn", s: "吻" }]
      ] },
      { id: "initials", name: { en: "Similar consonants", de: "Ähnliche Konsonanten" }, sets: [
        [{ t: "zhī", s: "知" }, { t: "jī", s: "鸡" }, { t: "zī", s: "资" }],
        [{ t: "chī", s: "吃" }, { t: "qī", s: "七" }, { t: "cī", s: "疵" }],
        [{ t: "shī", s: "诗" }, { t: "xī", s: "西" }, { t: "sī", s: "思" }],
        [{ t: "bā", s: "八" }, { t: "pā", s: "趴" }],
        [{ t: "dā", s: "搭" }, { t: "tā", s: "他" }],
        [{ t: "gē", s: "哥" }, { t: "kē", s: "科" }],
        [{ t: "nǚ", s: "女" }, { t: "lǚ", s: "旅" }],
        [{ t: "rè", s: "热" }, { t: "lè", s: "乐" }]
      ] },
      { id: "finals", name: { en: "Similar finals", de: "Ähnliche Auslaute" }, sets: [
        [{ t: "ān", s: "安" }, { t: "āng", s: "肮" }],
        [{ t: "fēn", s: "分" }, { t: "fēng", s: "风" }],
        [{ t: "yīn", s: "音" }, { t: "yīng", s: "英" }],
        [{ t: "nǔ", s: "努" }, { t: "nǚ", s: "女" }],
        [{ t: "mǎi", s: "买" }, { t: "měi", s: "美" }],
        [{ t: "hǎo", s: "好" }, { t: "hòu", s: "后" }],
        [{ t: "lán", s: "蓝" }, { t: "láng", s: "狼" }],
        [{ t: "chē", s: "车" }, { t: "chī", s: "吃" }, { t: "chū", s: "出" }]
      ] }
    ]
  },

  vi: {
    intro: { en: "Vietnamese has twelve vowels and six tones. Each row is one vowel; the cells run through the tones ngang, huyền, sắc, hỏi, ngã, nặng on a carrier syllable. Tap to hear; example words come from the vocabulary lists.", de: "Vietnamesisch hat zwölf Vokale und sechs Töne. Jede Zeile ist ein Vokal; die Zellen durchlaufen die Töne ngang, huyền, sắc, hỏi, ngã, nặng auf einer Trägersilbe. Tippe zum Anhören; die Beispielwörter stammen aus den Wortlisten." },
    groups: [
      { id: "vowels", name: { en: "Vowels × tones", de: "Vokale × Töne" }, head: ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"], rows: [
        { base: "a", cells: [{ t: "ma" }, { t: "mà" }, { t: "má" }, { t: "mả" }, { t: "mã" }, { t: "mạ" }], match: { vowel: "a" }, note: { en: "long open a", de: "langes offenes a" } },
        { base: "ă", cells: [{ t: "băn" }, { t: "bằn" }, { t: "bắn" }, { t: "bẳn" }, { t: "bẵn" }, { t: "bặn" }], match: { vowel: "ă" }, note: { en: "short a; only before a final consonant", de: "kurzes a; nur vor Endkonsonant" } },
        { base: "â", cells: [{ t: "cân" }, { t: "cần" }, { t: "cấn" }, { t: "cẩn" }, { t: "cẫn" }, { t: "cận" }], match: { vowel: "â" }, note: { en: "short 'uh'; only before a final consonant", de: "kurzes „uh“; nur vor Endkonsonant" } },
        { base: "e", cells: [{ t: "me" }, { t: "mè" }, { t: "mé" }, { t: "mẻ" }, { t: "mẽ" }, { t: "mẹ" }], match: { vowel: "e" }, note: { en: "open e as in 'bed'", de: "offenes e wie in „Bett“" } },
        { base: "ê", cells: [{ t: "mê" }, { t: "mề" }, { t: "mế" }, { t: "mể" }, { t: "mễ" }, { t: "mệ" }], match: { vowel: "ê" }, note: { en: "closed e as in 'say' (no glide)", de: "geschlossenes e wie in „See“" } },
        { base: "i", cells: [{ t: "mi" }, { t: "mì" }, { t: "mí" }, { t: "mỉ" }, { t: "mĩ" }, { t: "mị" }], match: { vowel: "i" } },
        { base: "o", cells: [{ t: "mo" }, { t: "mò" }, { t: "mó" }, { t: "mỏ" }, { t: "mõ" }, { t: "mọ" }], match: { vowel: "o" }, note: { en: "open o as in 'law'", de: "offenes o wie in „offen“" } },
        { base: "ô", cells: [{ t: "mô" }, { t: "mồ" }, { t: "mố" }, { t: "mổ" }, { t: "mỗ" }, { t: "mộ" }], match: { vowel: "ô" }, note: { en: "closed o as in 'go' (no glide)", de: "geschlossenes o wie in „Ofen“" } },
        { base: "ơ", cells: [{ t: "mơ" }, { t: "mờ" }, { t: "mớ" }, { t: "mở" }, { t: "mỡ" }, { t: "mợ" }], match: { vowel: "ơ" }, note: { en: "like 'u' in 'fur', lips unrounded", de: "wie ö ohne Lippenrundung" } },
        { base: "u", cells: [{ t: "mu" }, { t: "mù" }, { t: "mú" }, { t: "mủ" }, { t: "mũ" }, { t: "mụ" }], match: { vowel: "u" } },
        { base: "ư", cells: [{ t: "mư" }, { t: "mừ" }, { t: "mứ" }, { t: "mử" }, { t: "mữ" }, { t: "mự" }], match: { vowel: "ư" }, note: { en: "'u' with unrounded lips, tongue back", de: "u mit ungerundeten Lippen, Zunge hinten" } },
        { base: "y", cells: [{ t: "my" }, { t: "mỳ" }, { t: "mý" }, { t: "mỷ" }, { t: "mỹ" }, { t: "mỵ" }], match: { vowel: "y" }, note: { en: "same sound as i", de: "gleicher Laut wie i" } }
      ] },
      { id: "consonants", name: { en: "Consonants", de: "Konsonanten" }, head: [], rows: [
        { base: "b · p · v", cells: [{ t: "ba" }, { t: "pa" }, { t: "va" }], match: { initial: "b|p|v" } },
        { base: "c · k · q", cells: [{ t: "ca" }, { t: "kê" }, { t: "qua" }], match: { initial: "c|k|q" }, note: { en: "all a hard k", de: "alle ein hartes k" } },
        { base: "ch · tr", cells: [{ t: "cha" }, { t: "tra" }], match: { initial: "ch|tr" }, note: { en: "both close to 'ch' in the North", de: "im Norden beide nahe „tsch“" } },
        { base: "d · gi · r", cells: [{ t: "da" }, { t: "gia" }, { t: "ra" }], match: { initial: "d|gi|r" }, note: { en: "all like 'z' in the North", de: "im Norden alle wie stimmhaftes s" } },
        { base: "đ", cells: [{ t: "đa" }, { t: "đi" }, { t: "đu" }], match: { initial: "đ" }, note: { en: "a real hard d", de: "ein echtes hartes d" } },
        { base: "g · gh", cells: [{ t: "ga" }, { t: "ghe" }], match: { initial: "g|gh" }, note: { en: "soft, throaty g", de: "weiches, kehliges g" } },
        { base: "h · kh", cells: [{ t: "ha" }, { t: "kha" }], match: { initial: "h|kh" }, note: { en: "kh is like German 'ch' in 'Bach'", de: "kh wie „ch“ in „Bach“" } },
        { base: "l · n", cells: [{ t: "la" }, { t: "na" }], match: { initial: "l|n" } },
        { base: "m", cells: [{ t: "ma" }, { t: "mi" }], match: { initial: "m" } },
        { base: "ng · ngh", cells: [{ t: "nga" }, { t: "nghe" }], match: { initial: "ng|ngh" }, note: { en: "the sound at the end of 'sing', at the start of a word", de: "der Laut am Ende von „sing“, am Wortanfang" } },
        { base: "nh", cells: [{ t: "nha" }, { t: "nhi" }], match: { initial: "nh" }, note: { en: "like 'ny' in 'canyon'", de: "wie „nj“ in „Kognak“" } },
        { base: "ph", cells: [{ t: "pha" }, { t: "phi" }], match: { initial: "ph" }, note: { en: "f", de: "f" } },
        { base: "s · x", cells: [{ t: "sa" }, { t: "xa" }], match: { initial: "s|x" }, note: { en: "both 's' in the North", de: "im Norden beide wie ß" } },
        { base: "t · th", cells: [{ t: "ta" }, { t: "tha" }], match: { initial: "t|th" }, note: { en: "t without puff, th with puff", de: "t ohne Hauch, th mit Hauch" } }
      ] },
      { id: "finals", name: { en: "Final consonants", de: "Endkonsonanten" }, head: [], rows: [
        { base: "-c · -ch", cells: [{ t: "bác" }, { t: "bách" }], match: { final: "c|ch" }, note: { en: "unreleased stops", de: "nicht gelöste Verschlusslaute" } },
        { base: "-m · -n", cells: [{ t: "cam" }, { t: "can" }], match: { final: "m|n" } },
        { base: "-ng · -nh", cells: [{ t: "cang" }, { t: "canh" }], match: { final: "ng|nh" } },
        { base: "-p · -t", cells: [{ t: "cáp" }, { t: "cát" }], match: { final: "p|t" }, note: { en: "cut off sharply, no puff", de: "abrupt abgeschnitten, kein Hauch" } }
      ] }
    ],
    drills: [
      { id: "tones", name: { en: "Tones", de: "Töne" }, sets: [
        [{ t: "ma" }, { t: "mà" }, { t: "má" }, { t: "mả" }, { t: "mã" }, { t: "mạ" }],
        [{ t: "ba" }, { t: "bà" }, { t: "bá" }, { t: "bả" }, { t: "bã" }, { t: "bạ" }],
        [{ t: "bàn" }, { t: "bán" }, { t: "bạn" }, { t: "bản" }],
        [{ t: "mua" }, { t: "mùa" }, { t: "múa" }, { t: "mụa" }],
        [{ t: "hai" }, { t: "hài" }, { t: "hái" }, { t: "hải" }, { t: "hãi" }, { t: "hại" }],
        [{ t: "cô" }, { t: "cồ" }, { t: "cố" }, { t: "cổ" }, { t: "cỗ" }, { t: "cộ" }]
      ] },
      { id: "vowels", name: { en: "Similar vowels", de: "Ähnliche Vokale" }, sets: [
        [{ t: "tan" }, { t: "tăn" }, { t: "tân" }],
        [{ t: "co" }, { t: "cô" }, { t: "cơ" }],
        [{ t: "tu" }, { t: "tư" }],
        [{ t: "me" }, { t: "mê" }],
        [{ t: "lan" }, { t: "lăn" }, { t: "lân" }],
        [{ t: "bo" }, { t: "bô" }, { t: "bơ" }, { t: "bu" }, { t: "bư" }]
      ] },
      { id: "consonants", name: { en: "Similar consonants", de: "Ähnliche Konsonanten" }, sets: [
        [{ t: "da" }, { t: "gia" }, { t: "ra" }],
        [{ t: "cha" }, { t: "tra" }],
        [{ t: "sa" }, { t: "xa" }],
        [{ t: "na" }, { t: "nha" }, { t: "nga" }],
        [{ t: "ta" }, { t: "tha" }, { t: "đa" }],
        [{ t: "ca" }, { t: "kha" }, { t: "ga" }]
      ] },
      { id: "finals", name: { en: "Final consonants", de: "Endkonsonanten" }, sets: [
        [{ t: "tan" }, { t: "tang" }, { t: "tanh" }],
        [{ t: "bác" }, { t: "bách" }],
        [{ t: "cam" }, { t: "can" }, { t: "cang" }],
        [{ t: "cáp" }, { t: "cát" }, { t: "các" }]
      ] }
    ]
  },

  ja: {
    intro: { en: "Japanese is built from syllables: a vowel or consonant + vowel. Each row of the kana table shares a consonant, each column a vowel (a i u e o). Voiced rows (゛゜) and combined syllables (きゃ) follow. Tap to hear; examples come from the JLPT lists.", de: "Japanisch besteht aus Silben: Vokal oder Konsonant + Vokal. Jede Zeile der Kana-Tafel teilt einen Konsonanten, jede Spalte einen Vokal (a i u e o). Es folgen stimmhafte Reihen (゛゜) und Kombinationen (きゃ). Tippe zum Anhören; die Beispiele stammen aus den JLPT-Listen." },
    groups: [
      { id: "hiragana", name: { en: "Hiragana", de: "Hiragana" }, head: ["a", "i", "u", "e", "o"], kana: true, rows: [
        { base: "∅", cells: [{ t: "あ" }, { t: "い" }, { t: "う" }, { t: "え" }, { t: "お" }] },
        { base: "k", cells: [{ t: "か" }, { t: "き" }, { t: "く" }, { t: "け" }, { t: "こ" }] },
        { base: "s", cells: [{ t: "さ" }, { t: "し" }, { t: "す" }, { t: "せ" }, { t: "そ" }], note: { en: "し = shi", de: "し = shi" } },
        { base: "t", cells: [{ t: "た" }, { t: "ち" }, { t: "つ" }, { t: "て" }, { t: "と" }], note: { en: "ち = chi, つ = tsu", de: "ち = chi, つ = tsu" } },
        { base: "n", cells: [{ t: "な" }, { t: "に" }, { t: "ぬ" }, { t: "ね" }, { t: "の" }] },
        { base: "h", cells: [{ t: "は" }, { t: "ひ" }, { t: "ふ" }, { t: "へ" }, { t: "ほ" }], note: { en: "ふ = fu, blown between the lips", de: "ふ = fu, zwischen den Lippen geblasen" } },
        { base: "m", cells: [{ t: "ま" }, { t: "み" }, { t: "む" }, { t: "め" }, { t: "も" }] },
        { base: "y", cells: [{ t: "や" }, { t: "" }, { t: "ゆ" }, { t: "" }, { t: "よ" }] },
        { base: "r", cells: [{ t: "ら" }, { t: "り" }, { t: "る" }, { t: "れ" }, { t: "ろ" }], note: { en: "a light tap between r and l", de: "leichter Zungenschlag zwischen r und l" } },
        { base: "w", cells: [{ t: "わ" }, { t: "" }, { t: "" }, { t: "" }, { t: "を" }] },
        { base: "n", cells: [{ t: "ん" }, { t: "" }, { t: "" }, { t: "" }, { t: "" }], note: { en: "syllabic n, its own beat", de: "silbisches n, eigener Schlag" } }
      ] },
      { id: "dakuten", name: { en: "Voiced (゛ ゜)", de: "Stimmhaft (゛ ゜)" }, head: ["a", "i", "u", "e", "o"], kana: true, rows: [
        { base: "g", cells: [{ t: "が" }, { t: "ぎ" }, { t: "ぐ" }, { t: "げ" }, { t: "ご" }] },
        { base: "z", cells: [{ t: "ざ" }, { t: "じ" }, { t: "ず" }, { t: "ぜ" }, { t: "ぞ" }], note: { en: "じ = ji", de: "じ = ji" } },
        { base: "d", cells: [{ t: "だ" }, { t: "ぢ" }, { t: "づ" }, { t: "で" }, { t: "ど" }], note: { en: "ぢ づ sound like じ ず", de: "ぢ づ klingen wie じ ず" } },
        { base: "b", cells: [{ t: "ば" }, { t: "び" }, { t: "ぶ" }, { t: "べ" }, { t: "ぼ" }] },
        { base: "p", cells: [{ t: "ぱ" }, { t: "ぴ" }, { t: "ぷ" }, { t: "ぺ" }, { t: "ぽ" }] }
      ] },
      { id: "yoon", name: { en: "Combinations (ゃ ゅ ょ)", de: "Kombinationen (ゃ ゅ ょ)" }, head: ["ya", "yu", "yo"], kana: true, rows: [
        { base: "ky", cells: [{ t: "きゃ" }, { t: "きゅ" }, { t: "きょ" }] },
        { base: "sh", cells: [{ t: "しゃ" }, { t: "しゅ" }, { t: "しょ" }] },
        { base: "ch", cells: [{ t: "ちゃ" }, { t: "ちゅ" }, { t: "ちょ" }] },
        { base: "ny", cells: [{ t: "にゃ" }, { t: "にゅ" }, { t: "にょ" }] },
        { base: "hy", cells: [{ t: "ひゃ" }, { t: "ひゅ" }, { t: "ひょ" }] },
        { base: "my", cells: [{ t: "みゃ" }, { t: "みゅ" }, { t: "みょ" }] },
        { base: "ry", cells: [{ t: "りゃ" }, { t: "りゅ" }, { t: "りょ" }] },
        { base: "gy", cells: [{ t: "ぎゃ" }, { t: "ぎゅ" }, { t: "ぎょ" }] },
        { base: "j", cells: [{ t: "じゃ" }, { t: "じゅ" }, { t: "じょ" }] },
        { base: "by", cells: [{ t: "びゃ" }, { t: "びゅ" }, { t: "びょ" }] },
        { base: "py", cells: [{ t: "ぴゃ" }, { t: "ぴゅ" }, { t: "ぴょ" }] }
      ] },
      { id: "katakana", name: { en: "Katakana", de: "Katakana" }, head: ["a", "i", "u", "e", "o"], kana: true, rows: [
        { base: "∅", cells: [{ t: "ア" }, { t: "イ" }, { t: "ウ" }, { t: "エ" }, { t: "オ" }] },
        { base: "k", cells: [{ t: "カ" }, { t: "キ" }, { t: "ク" }, { t: "ケ" }, { t: "コ" }] },
        { base: "s", cells: [{ t: "サ" }, { t: "シ" }, { t: "ス" }, { t: "セ" }, { t: "ソ" }] },
        { base: "t", cells: [{ t: "タ" }, { t: "チ" }, { t: "ツ" }, { t: "テ" }, { t: "ト" }] },
        { base: "n", cells: [{ t: "ナ" }, { t: "ニ" }, { t: "ヌ" }, { t: "ネ" }, { t: "ノ" }] },
        { base: "h", cells: [{ t: "ハ" }, { t: "ヒ" }, { t: "フ" }, { t: "ヘ" }, { t: "ホ" }] },
        { base: "m", cells: [{ t: "マ" }, { t: "ミ" }, { t: "ム" }, { t: "メ" }, { t: "モ" }] },
        { base: "y", cells: [{ t: "ヤ" }, { t: "" }, { t: "ユ" }, { t: "" }, { t: "ヨ" }] },
        { base: "r", cells: [{ t: "ラ" }, { t: "リ" }, { t: "ル" }, { t: "レ" }, { t: "ロ" }] },
        { base: "w", cells: [{ t: "ワ" }, { t: "" }, { t: "" }, { t: "" }, { t: "ヲ" }] },
        { base: "n", cells: [{ t: "ン" }, { t: "" }, { t: "" }, { t: "" }, { t: "" }] },
        { base: "g", cells: [{ t: "ガ" }, { t: "ギ" }, { t: "グ" }, { t: "ゲ" }, { t: "ゴ" }] },
        { base: "z", cells: [{ t: "ザ" }, { t: "ジ" }, { t: "ズ" }, { t: "ゼ" }, { t: "ゾ" }] },
        { base: "d", cells: [{ t: "ダ" }, { t: "ヂ" }, { t: "ヅ" }, { t: "デ" }, { t: "ド" }] },
        { base: "b", cells: [{ t: "バ" }, { t: "ビ" }, { t: "ブ" }, { t: "ベ" }, { t: "ボ" }] },
        { base: "p", cells: [{ t: "パ" }, { t: "ピ" }, { t: "プ" }, { t: "ペ" }, { t: "ポ" }] }
      ] },
      { id: "length", name: { en: "Length & pauses", de: "Länge & Pausen" }, head: ["short", "long"], rows: [
        { base: "aa", cells: [{ t: "おばさん", sub: "obasan · aunt" }, { t: "おばあさん", sub: "obaasan · grandmother" }], note: { en: "a long vowel holds two beats", de: "ein langer Vokal dauert zwei Schläge" } },
        { base: "ii", cells: [{ t: "おじさん", sub: "ojisan · uncle" }, { t: "おじいさん", sub: "ojiisan · grandfather" }] },
        { base: "oo", cells: [{ t: "とる", sub: "toru · to take" }, { t: "とおる", sub: "tooru · to pass" }] },
        { base: "ou", cells: [{ t: "ここ", sub: "koko · here" }, { t: "こうこう", sub: "koukou · high school" }] },
        { base: "っ", cells: [{ t: "きて", sub: "kite · come" }, { t: "きって", sub: "kitte · stamp" }], note: { en: "small っ is a silent beat before the consonant", de: "kleines っ ist ein stummer Schlag vor dem Konsonanten" } },
        { base: "っ", cells: [{ t: "かた", sub: "kata · shoulder" }, { t: "かった", sub: "katta · bought" }] }
      ] }
    ],
    drills: [
      { id: "length", name: { en: "Long or short vowel", de: "Langer oder kurzer Vokal" }, sets: [
        [{ t: "おばさん" }, { t: "おばあさん" }], [{ t: "おじさん" }, { t: "おじいさん" }], [{ t: "とる" }, { t: "とおる" }], [{ t: "ここ" }, { t: "こうこう" }], [{ t: "え" }, { t: "ええ" }], [{ t: "くろ" }, { t: "くろう" }], [{ t: "ゆき" }, { t: "ゆうき" }]
      ] },
      { id: "sokuon", name: { en: "Double consonant", de: "Doppelkonsonant" }, sets: [
        [{ t: "きて" }, { t: "きって" }], [{ t: "かた" }, { t: "かった" }], [{ t: "さか" }, { t: "さっか" }], [{ t: "おと" }, { t: "おっと" }], [{ t: "まち" }, { t: "まっち" }], [{ t: "いた" }, { t: "いった" }]
      ] },
      { id: "voicing", name: { en: "Voiced or not", de: "Stimmhaft oder nicht" }, sets: [
        [{ t: "か" }, { t: "が" }], [{ t: "た" }, { t: "だ" }], [{ t: "は" }, { t: "ば" }, { t: "ぱ" }], [{ t: "さ" }, { t: "ざ" }], [{ t: "て" }, { t: "で" }], [{ t: "かき" }, { t: "かぎ" }], [{ t: "てんき" }, { t: "でんき" }]
      ] },
      { id: "tricky", name: { en: "Tricky pairs", de: "Knifflige Paare" }, sets: [
        [{ t: "つ" }, { t: "す" }], [{ t: "し" }, { t: "ち" }], [{ t: "ふ" }, { t: "ほ" }], [{ t: "つき" }, { t: "すき" }], [{ t: "しる" }, { t: "ちる" }], [{ t: "りょこう" }, { t: "りよこう" }], [{ t: "びょういん" }, { t: "びよういん" }]
      ] }
    ]
  }
};
