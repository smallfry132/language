/* Beginner dialogues for the Chinese course (HSK 1 vocabulary, a few common extras).
 * Written for this app. Pinyin follows the spoken tone changes of 不 and 一 (bú shì, yì bēi), like the word lists.
 * Fields: id, topic { en, de }, people [names as { hz, py }], lines [{ who: index into people, hz, py, en, de }]
 * Korean lines have no py: the romanization is generated from the Hangul (js/korean.js). Vietnamese lines have no py
 * (the spelling is the reading); Japanese py is Hepburn romaji. A line may carry a short tip { en, de }. */
window.DIALOGUES = {
  ko: [
    {
      id: "ko-greet", icon: "👋", topic: { en: "Greetings", de: "Begrüßung" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "안녕하세요!", en: "Hello!", de: "Hallo!" },
        { who: 1, hz: "안녕하세요!", en: "Hello!", de: "Hallo!" },
        { who: 0, hz: "잘 지내요?", en: "How are you?", de: "Wie geht es dir?" },
        { who: 1, hz: "네, 잘 지내요. 민수 씨는요?", en: "I'm fine. And you, Minsu?", de: "Gut. Und dir, Minsu?" },
        { who: 0, hz: "저도 잘 지내요.", en: "I'm fine too.", de: "Mir geht es auch gut." },
        { who: 1, hz: "안녕히 가세요!", en: "Goodbye!", de: "Auf Wiedersehen!" },
        { who: 0, hz: "내일 봐요!", en: "See you tomorrow!", de: "Bis morgen!" }
      ]
    },
    {
      id: "ko-name", icon: "🙂", topic: { en: "What's your name?", de: "Wie heißt du?" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "이름이 뭐예요?", en: "What's your name?", de: "Wie heißt du?" },
        { who: 1, hz: "저는 안나예요. 이름이 뭐예요?", en: "I'm Anna. What's your name?", de: "Ich bin Anna. Wie heißt du?" },
        { who: 0, hz: "저는 김민수예요.", en: "I'm Kim Minsu.", de: "Ich bin Kim Minsu." },
        { who: 1, hz: "만나서 반갑습니다.", en: "Nice to meet you.", de: "Freut mich." },
        { who: 0, hz: "저도 만나서 반가워요.", en: "Nice to meet you too.", de: "Freut mich auch." }
      ]
    },
    {
      id: "ko-country", icon: "🌍", topic: { en: "Which country are you from?", de: "Aus welchem Land kommst du?" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "어느 나라 사람이에요?", en: "Which country are you from?", de: "Aus welchem Land kommst du?" },
        { who: 1, hz: "저는 독일 사람이에요. 민수 씨는 한국 사람이에요?", en: "I'm German. Are you Korean, Minsu?", de: "Ich bin Deutsche. Bist du Koreaner, Minsu?" },
        { who: 0, hz: "네, 저는 한국 사람이에요.", en: "Yes, I'm Korean.", de: "Ja, ich bin Koreaner." },
        { who: 1, hz: "선생님도 한국 사람이에요?", en: "Is the teacher Korean too?", de: "Ist der Lehrer auch Koreaner?" },
        { who: 0, hz: "아니요, 선생님은 미국 사람이에요.", en: "No, the teacher is American.", de: "Nein, der Lehrer ist Amerikaner." }
      ]
    },
    {
      id: "ko-from", icon: "📍", topic: { en: "Where are you from?", de: "Woher kommst du?" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "고향이 어디예요?", en: "Where is your hometown?", de: "Woher kommst du?" },
        { who: 1, hz: "제 고향은 베를린이에요.", en: "My hometown is Berlin.", de: "Ich komme aus Berlin." },
        { who: 0, hz: "지금 어디에 살아요?", en: "Where do you live now?", de: "Wo wohnst du jetzt?" },
        { who: 1, hz: "지금은 서울에 살아요.", en: "I live in Seoul now.", de: "Jetzt wohne ich in Seoul." },
        { who: 0, hz: "서울을 좋아해요?", en: "Do you like Seoul?", de: "Gefällt dir Seoul?" },
        { who: 1, hz: "네, 정말 좋아해요! 서울은 아주 커요.", en: "Yes, I really like it! Seoul is very big.", de: "Ja, sehr! Seoul ist sehr groß." }
      ]
    },
    {
      id: "ko-family", icon: "👨‍👩‍👧", topic: { en: "Family", de: "Familie" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "가족이 몇 명이에요?", en: "How many people are in your family?", de: "Wie viele seid ihr in deiner Familie?" },
        { who: 1, hz: "네 명이에요. 아버지, 어머니, 오빠, 그리고 저예요.", en: "Four: my father, mother, older brother and me.", de: "Vier: Vater, Mutter, mein älterer Bruder und ich." },
        { who: 0, hz: "오빠는 몇 살이에요?", en: "How old is your older brother?", de: "Wie alt ist dein älterer Bruder?" },
        { who: 1, hz: "스물다섯 살이에요.", en: "He's twenty-five.", de: "Er ist fünfundzwanzig." },
        { who: 0, hz: "오빠는 무슨 일을 해요?", en: "What does he do?", de: "Was arbeitet er?" },
        { who: 1, hz: "의사예요.", en: "He's a doctor.", de: "Er ist Arzt." }
      ]
    },
    {
      id: "ko-food", icon: "🍜", topic: { en: "Ordering food", de: "Essen bestellen" },
      people: [{ hz: "직원", py: "jigwon" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "어서 오세요! 주문하시겠어요?", en: "Welcome! Would you like to order?", de: "Willkommen! Möchten Sie bestellen?" },
        { who: 1, hz: "비빔밥 하나하고 김치찌개 하나 주세요.", en: "One bibimbap and one kimchi stew, please.", de: "Einmal Bibimbap und einmal Kimchi-Eintopf, bitte." },
        { who: 0, hz: "음료수는 뭐로 하시겠어요?", en: "What would you like to drink?", de: "Was möchten Sie trinken?" },
        { who: 1, hz: "물 주세요. 감사합니다.", en: "Water, please. Thank you.", de: "Wasser, bitte. Danke." },
        { who: 0, hz: "네. 더 필요한 거 있으세요?", en: "Okay. Anything else?", de: "Gut. Brauchen Sie noch etwas?" },
        { who: 1, hz: "아니요, 괜찮아요. 얼마예요?", en: "No, that's all. How much is it?", de: "Nein, danke. Was kostet das?" },
        { who: 0, hz: "모두 만 오천 원이에요.", en: "Fifteen thousand won altogether.", de: "Zusammen fünfzehntausend Won." }
      ]
    },
    {
      id: "ko-time", icon: "🕒", topic: { en: "Telling the time", de: "Uhrzeit" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "지금 몇 시예요?", en: "What time is it now?", de: "Wie spät ist es jetzt?" },
        { who: 1, hz: "세 시 십 분이에요.", en: "It's ten past three.", de: "Es ist zehn nach drei." },
        { who: 0, hz: "몇 시에 학교에 가요?", en: "What time are you going to school?", de: "Um wie viel Uhr gehst du zur Schule?" },
        { who: 1, hz: "네 시 반에 가요.", en: "I'm going at half past four.", de: "Um halb fünf." },
        { who: 0, hz: "그러면 같이 가요!", en: "Then let's go together!", de: "Dann lass uns zusammen gehen!" },
        { who: 1, hz: "좋아요!", en: "Great!", de: "Gern!" }
      ]
    },
    {
      id: "ko-day", icon: "☀️", topic: { en: "What are you doing today?", de: "Was machst du heute?" },
      people: [{ hz: "민수", py: "Minsu" }, { hz: "안나", py: "Anna" }],
      lines: [
        { who: 0, hz: "오늘 뭐 해요?", en: "What are you doing today?", de: "Was machst du heute?" },
        { who: 1, hz: "오전에 한국어를 공부해요. 오후에는 시장에 가요.", en: "In the morning I study Korean. In the afternoon I go to the market.", de: "Vormittags lerne ich Koreanisch. Nachmittags gehe ich auf den Markt." },
        { who: 0, hz: "저녁에는요?", en: "And in the evening?", de: "Und abends?" },
        { who: 1, hz: "저녁에는 집에서 드라마를 봐요. 민수 씨는요?", en: "In the evening I watch dramas at home. And you, Minsu?", de: "Abends schaue ich zu Hause Serien. Und du, Minsu?" },
        { who: 0, hz: "저는 영화를 보러 가고 싶어요.", en: "I'd like to go and see a film.", de: "Ich möchte ins Kino gehen." },
        { who: 1, hz: "저도 영화를 좋아해요!", en: "I like films too!", de: "Ich mag Filme auch!" }
      ]
    }
  ],
  zh: [
    {
      id: "zh-greet", icon: "👋", topic: { en: "Greetings", de: "Begrüßung" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你好！", py: "Nǐ hǎo!", en: "Hello!", de: "Hallo!" },
        { who: 1, hz: "你好！", py: "Nǐ hǎo!", en: "Hello!", de: "Hallo!" },
        { who: 0, hz: "你好吗？", py: "Nǐ hǎo ma?", en: "How are you?", de: "Wie geht es dir?", tip: { en: "ma at the end turns a statement into a yes/no question.", de: "ma am Satzende macht aus einer Aussage eine Ja/Nein-Frage." } },
        { who: 1, hz: "我很好，谢谢。你呢？", py: "Wǒ hěn hǎo, xièxie. Nǐ ne?", en: "I'm fine, thanks. And you?", de: "Mir geht es gut, danke. Und dir?", tip: { en: "ne after a word asks “and …?”: Nǐ ne? = And you?", de: "ne nach einem Wort fragt „und …?“: Nǐ ne? = Und du?" } },
        { who: 0, hz: "我也很好。", py: "Wǒ yě hěn hǎo.", en: "I'm fine too.", de: "Mir geht es auch gut.", tip: { en: "yě (also) always comes before the verb or adjective.", de: "yě (auch) steht immer vor dem Verb oder Adjektiv." } },
        { who: 1, hz: "再见！", py: "Zàijiàn!", en: "Goodbye!", de: "Auf Wiedersehen!" },
        { who: 0, hz: "明天见！", py: "Míngtiān jiàn!", en: "See you tomorrow!", de: "Bis morgen!" }
      ]
    },
    {
      id: "zh-name", icon: "🙂", topic: { en: "What's your name?", de: "Wie heißt du?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你叫什么名字？", py: "Nǐ jiào shénme míngzi?", en: "What's your name?", de: "Wie heißt du?", tip: { en: "shénme = what. It stays where the answer goes, not at the front.", de: "shénme = was. Es steht dort, wo die Antwort hinkommt, nicht am Anfang." } },
        { who: 1, hz: "我叫安娜。你呢？", py: "Wǒ jiào Ānnà. Nǐ ne?", en: "My name is Anna. And you?", de: "Ich heiße Anna. Und du?" },
        { who: 0, hz: "我姓王，叫王明。", py: "Wǒ xìng Wáng, jiào Wáng Míng.", en: "My surname is Wang, my name is Wang Ming.", de: "Mein Familienname ist Wang, ich heiße Wang Ming.", tip: { en: "xìng is the family name, jiào the full name. The family name comes first.", de: "xìng ist der Familienname, jiào der ganze Name. Der Familienname steht vorn." } },
        { who: 1, hz: "认识你很高兴。", py: "Rènshi nǐ hěn gāoxìng.", en: "Nice to meet you.", de: "Freut mich, dich kennenzulernen." },
        { who: 0, hz: "认识你，我也很高兴。", py: "Rènshi nǐ, wǒ yě hěn gāoxìng.", en: "Nice to meet you too.", de: "Freut mich auch." }
      ]
    },
    {
      id: "zh-country", icon: "🌍", topic: { en: "Which country are you from?", de: "Aus welchem Land kommst du?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你是哪国人？", py: "Nǐ shì nǎ guó rén?", en: "Which country are you from?", de: "Aus welchem Land kommst du?", tip: { en: "nǎ guó = which country; add rén for the nationality.", de: "nǎ guó = welches Land; mit rén wird daraus die Nationalität." } },
        { who: 1, hz: "我是德国人。你是中国人吗？", py: "Wǒ shì Déguó rén. Nǐ shì Zhōngguó rén ma?", en: "I'm German. Are you Chinese?", de: "Ich bin Deutsche. Bist du Chinese?" },
        { who: 0, hz: "是，我是中国人。", py: "Shì, wǒ shì Zhōngguó rén.", en: "Yes, I'm Chinese.", de: "Ja, ich bin Chinese." },
        { who: 1, hz: "你的老师也是中国人吗？", py: "Nǐ de lǎoshī yě shì Zhōngguó rén ma?", en: "Is your teacher Chinese too?", de: "Ist dein Lehrer auch Chinese?" },
        { who: 0, hz: "不是，他是美国人。", py: "Bú shì, tā shì Měiguó rén.", en: "No, he's American.", de: "Nein, er ist Amerikaner.", tip: { en: "bù becomes bú before a 4th tone: bú shì.", de: "bù wird vor einem 4. Ton zu bú: bú shì." } }
      ]
    },
    {
      id: "zh-from", icon: "📍", topic: { en: "Where are you from?", de: "Woher kommst du?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你是哪里人？", py: "Nǐ shì nǎlǐ rén?", en: "Where are you from?", de: "Woher kommst du?" },
        { who: 1, hz: "我是柏林人。", py: "Wǒ shì Bólín rén.", en: "I'm from Berlin.", de: "Ich komme aus Berlin." },
        { who: 0, hz: "你现在住在哪儿？", py: "Nǐ xiànzài zhù zài nǎr?", en: "Where do you live now?", de: "Wo wohnst du jetzt?" },
        { who: 1, hz: "我现在住在北京。", py: "Wǒ xiànzài zhù zài Běijīng.", en: "I live in Beijing now.", de: "Ich wohne jetzt in Peking." },
        { who: 0, hz: "你喜欢北京吗？", py: "Nǐ xǐhuan Běijīng ma?", en: "Do you like Beijing?", de: "Gefällt dir Peking?" },
        { who: 1, hz: "很喜欢！北京很大。", py: "Hěn xǐhuan! Běijīng hěn dà.", en: "I like it a lot! Beijing is very big.", de: "Sehr! Peking ist sehr groß." }
      ]
    },
    {
      id: "zh-family", icon: "👨‍👩‍👧", topic: { en: "Family", de: "Familie" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你家有几口人？", py: "Nǐ jiā yǒu jǐ kǒu rén?", en: "How many people are in your family?", de: "Wie viele Personen seid ihr in deiner Familie?" },
        { who: 1, hz: "我家有四口人：爸爸、妈妈、哥哥和我。", py: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.", en: "There are four of us: dad, mom, my older brother and me.", de: "Wir sind vier: Papa, Mama, mein älterer Bruder und ich." },
        { who: 0, hz: "你哥哥今年多大？", py: "Nǐ gēge jīnnián duō dà?", en: "How old is your brother this year?", de: "Wie alt ist dein Bruder dieses Jahr?" },
        { who: 1, hz: "他今年二十五岁。", py: "Tā jīnnián èrshíwǔ suì.", en: "He is twenty-five this year.", de: "Er ist dieses Jahr fünfundzwanzig." },
        { who: 0, hz: "他做什么工作？", py: "Tā zuò shénme gōngzuò?", en: "What does he do for work?", de: "Was arbeitet er?" },
        { who: 1, hz: "他是医生。", py: "Tā shì yīshēng.", en: "He is a doctor.", de: "Er ist Arzt." }
      ]
    },
    {
      id: "zh-food", icon: "🍜", topic: { en: "Ordering food", de: "Essen bestellen" },
      people: [{ hz: "服务员", py: "fúwùyuán" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "您好！请问，您要吃什么？", py: "Nín hǎo! Qǐngwèn, nín yào chī shénme?", en: "Hello! What would you like to eat?", de: "Guten Tag! Was möchten Sie essen?" },
        { who: 1, hz: "我要一碗米饭和一个菜。", py: "Wǒ yào yì wǎn mǐfàn hé yí ge cài.", en: "I'd like a bowl of rice and a dish.", de: "Ich hätte gern eine Schüssel Reis und ein Gericht.", tip: { en: "yào = want. Number + measure word + thing: yì wǎn mǐfàn, yí ge cài.", de: "yào = möchten. Zahl + Zählwort + Sache: yì wǎn mǐfàn, yí ge cài." } },
        { who: 0, hz: "喝什么？", py: "Hē shénme?", en: "What would you like to drink?", de: "Was möchten Sie trinken?" },
        { who: 1, hz: "一杯茶，谢谢。", py: "Yì bēi chá, xièxie.", en: "A cup of tea, thanks.", de: "Eine Tasse Tee, danke." },
        { who: 0, hz: "好的。还要别的吗？", py: "Hǎo de. Hái yào bié de ma?", en: "Okay. Anything else?", de: "Gut. Sonst noch etwas?" },
        { who: 1, hz: "不要了。多少钱？", py: "Bú yào le. Duōshao qián?", en: "No, that's all. How much is it?", de: "Nein, danke. Was kostet das?" },
        { who: 0, hz: "一共三十五块。", py: "Yígòng sānshíwǔ kuài.", en: "Thirty-five yuan altogether.", de: "Zusammen fünfunddreißig Yuan.", tip: { en: "kuài is the spoken word for yuan.", de: "kuài ist das gesprochene Wort für Yuan." } }
      ]
    },
    {
      id: "zh-time", icon: "🕒", topic: { en: "Telling the time", de: "Uhrzeit" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "现在几点？", py: "Xiànzài jǐ diǎn?", en: "What time is it now?", de: "Wie spät ist es jetzt?" },
        { who: 1, hz: "现在三点十分。", py: "Xiànzài sān diǎn shí fēn.", en: "It's ten past three.", de: "Es ist zehn nach drei." },
        { who: 0, hz: "你几点去学校？", py: "Nǐ jǐ diǎn qù xuéxiào?", en: "What time are you going to school?", de: "Um wie viel Uhr gehst du zur Schule?" },
        { who: 1, hz: "我四点半去学校。", py: "Wǒ sì diǎn bàn qù xuéxiào.", en: "I'm going at half past four.", de: "Ich gehe um halb fünf zur Schule." },
        { who: 0, hz: "我们一起去吧！", py: "Wǒmen yìqǐ qù ba!", en: "Let's go together!", de: "Lass uns zusammen gehen!" },
        { who: 1, hz: "好啊！", py: "Hǎo a!", en: "Great!", de: "Gern!" }
      ]
    },
    {
      id: "zh-day", icon: "☀️", topic: { en: "What are you doing today?", de: "Was machst du heute?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你今天做什么？", py: "Nǐ jīntiān zuò shénme?", en: "What are you doing today?", de: "Was machst du heute?" },
        { who: 1, hz: "上午我学习汉语，下午去商店买东西。", py: "Shàngwǔ wǒ xuéxí Hànyǔ, xiàwǔ qù shāngdiàn mǎi dōngxi.", en: "In the morning I study Chinese, in the afternoon I go shopping.", de: "Vormittags lerne ich Chinesisch, nachmittags gehe ich einkaufen." },
        { who: 0, hz: "晚上呢？", py: "Wǎnshang ne?", en: "And in the evening?", de: "Und abends?" },
        { who: 1, hz: "晚上我在家看电视。你呢？", py: "Wǎnshang wǒ zài jiā kàn diànshì. Nǐ ne?", en: "In the evening I watch TV at home. And you?", de: "Abends sehe ich zu Hause fern. Und du?" },
        { who: 0, hz: "我想去看电影。", py: "Wǒ xiǎng qù kàn diànyǐng.", en: "I'd like to go and see a film.", de: "Ich möchte ins Kino gehen." },
        { who: 1, hz: "我也喜欢看电影！", py: "Wǒ yě xǐhuan kàn diànyǐng!", en: "I like watching films too!", de: "Ich gehe auch gern ins Kino!" }
      ]
    }
  ],
  vi: [
    {
      "id": "vi-greet",
      "icon": "👋",
      "topic": {
        "en": "Greetings",
        "de": "Begrüßung"
      },
      "people": [
        {
          "hz": "Lan"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Chào bạn!",
          "en": "Hi!",
          "de": "Hallo!"
        },
        {
          "who": 1,
          "hz": "Chào Lan! Bạn khỏe không?",
          "en": "Hi Lan! How are you?",
          "de": "Hallo Lan! Wie geht's dir?",
          "tip": {
            "en": "không at the end makes a yes/no question.",
            "de": "không am Satzende macht eine Ja/Nein-Frage."
          }
        },
        {
          "who": 0,
          "hz": "Mình khỏe, cảm ơn. Còn bạn?",
          "en": "I'm fine, thanks. And you?",
          "de": "Mir geht's gut, danke. Und dir?",
          "tip": {
            "en": "Còn bạn? = “and you?” — it turns the question back.",
            "de": "Còn bạn? = „und du?“ – gibt die Frage zurück."
          }
        },
        {
          "who": 1,
          "hz": "Mình cũng khỏe.",
          "en": "I'm fine too.",
          "de": "Mir geht's auch gut.",
          "tip": {
            "en": "cũng (also) comes before the verb or adjective.",
            "de": "cũng (auch) steht vor dem Verb oder Adjektiv."
          }
        },
        {
          "who": 0,
          "hz": "Hẹn gặp lại nhé!",
          "en": "See you again!",
          "de": "Bis bald!",
          "tip": {
            "en": "nhé at the end makes it warm and friendly.",
            "de": "nhé am Ende klingt freundlich und warm."
          }
        },
        {
          "who": 1,
          "hz": "Tạm biệt!",
          "en": "Goodbye!",
          "de": "Tschüss!"
        }
      ]
    },
    {
      "id": "vi-name",
      "icon": "🙂",
      "topic": {
        "en": "What's your name?",
        "de": "Wie heißt du?"
      },
      "people": [
        {
          "hz": "Minh"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Bạn tên là gì?",
          "en": "What's your name?",
          "de": "Wie heißt du?",
          "tip": {
            "en": "gì = what. It goes at the end, where the answer would be.",
            "de": "gì = was. Es steht am Ende, wo die Antwort hinkommt."
          }
        },
        {
          "who": 1,
          "hz": "Mình tên là Anna. Còn bạn?",
          "en": "My name is Anna. And you?",
          "de": "Ich heiße Anna. Und du?",
          "tip": {
            "en": "Mình is a friendly “I” among friends; tôi is the neutral one.",
            "de": "Mình ist ein freundliches „ich“ unter Freunden; tôi ist neutral."
          }
        },
        {
          "who": 0,
          "hz": "Mình tên là Minh.",
          "en": "My name is Minh.",
          "de": "Ich heiße Minh."
        },
        {
          "who": 1,
          "hz": "Rất vui được gặp bạn.",
          "en": "Nice to meet you.",
          "de": "Freut mich, dich kennenzulernen."
        },
        {
          "who": 0,
          "hz": "Mình cũng rất vui.",
          "en": "Nice to meet you too.",
          "de": "Freut mich auch."
        }
      ]
    },
    {
      "id": "vi-country",
      "icon": "🌍",
      "topic": {
        "en": "Nationality",
        "de": "Nationalität"
      },
      "people": [
        {
          "hz": "Minh"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Chào bạn! Bạn tên là gì?",
          "en": "Hi! What's your name?",
          "de": "Hallo! Wie heißt du?"
        },
        {
          "who": 1,
          "hz": "Mình tên là Anna.",
          "en": "My name is Anna.",
          "de": "Ich heiße Anna.",
          "tip": {
            "en": "Mình is a friendly “I” among friends; tôi is the neutral one.",
            "de": "Mình ist ein freundliches „ich“ unter Freunden; tôi ist neutral."
          }
        },
        {
          "who": 0,
          "hz": "Bạn là người nước nào?",
          "en": "Which country are you from?",
          "de": "Aus welchem Land kommst du?",
          "tip": {
            "en": "nước nào = which country.",
            "de": "nước nào = welches Land."
          }
        },
        {
          "who": 1,
          "hz": "Mình là người Đức.",
          "en": "I'm German.",
          "de": "Ich bin Deutsche.",
          "tip": {
            "en": "người + country = nationality. Đức is Germany.",
            "de": "người + Land = Nationalität. Đức ist Deutschland."
          }
        },
        {
          "who": 0,
          "hz": "Ồ, bạn nói tiếng Việt giỏi quá!",
          "en": "Oh, your Vietnamese is really good!",
          "de": "Oh, du sprichst richtig gut Vietnamesisch!",
          "tip": {
            "en": "quá after an adjective = really, so.",
            "de": "quá nach einem Adjektiv = wirklich, so."
          }
        },
        {
          "who": 1,
          "hz": "Cảm ơn bạn! Mình đang học.",
          "en": "Thank you! I'm learning.",
          "de": "Danke! Ich lerne gerade.",
          "tip": {
            "en": "đang before a verb = doing it right now.",
            "de": "đang vor einem Verb = gerade dabei."
          }
        }
      ]
    },
    {
      "id": "vi-family",
      "icon": "👨‍👩‍👧",
      "topic": {
        "en": "Family",
        "de": "Familie"
      },
      "people": [
        {
          "hz": "Lan"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Nhà bạn có mấy người?",
          "en": "How many people are in your family?",
          "de": "Wie viele seid ihr in deiner Familie?",
          "tip": {
            "en": "mấy = how many, for small numbers.",
            "de": "mấy = wie viele, für kleine Zahlen."
          }
        },
        {
          "who": 1,
          "hz": "Nhà mình có bốn người: bố, mẹ, em gái và mình.",
          "en": "Four: my dad, my mum, my younger sister and me.",
          "de": "Vier: Papa, Mama, meine jüngere Schwester und ich.",
          "tip": {
            "en": "em gái = younger sister; chị = older sister.",
            "de": "em gái = jüngere Schwester; chị = ältere Schwester."
          }
        },
        {
          "who": 0,
          "hz": "Em gái bạn bao nhiêu tuổi?",
          "en": "How old is your sister?",
          "de": "Wie alt ist deine Schwester?"
        },
        {
          "who": 1,
          "hz": "Em ấy mười hai tuổi.",
          "en": "She is twelve.",
          "de": "Sie ist zwölf."
        },
        {
          "who": 0,
          "hz": "Bố mẹ bạn làm gì?",
          "en": "What do your parents do?",
          "de": "Was machen deine Eltern beruflich?"
        },
        {
          "who": 1,
          "hz": "Bố mình là bác sĩ, mẹ mình là giáo viên.",
          "en": "My dad is a doctor, my mum is a teacher.",
          "de": "Mein Papa ist Arzt, meine Mama ist Lehrerin."
        }
      ]
    },
    {
      "id": "vi-cafe",
      "icon": "☕",
      "topic": {
        "en": "At the café",
        "de": "Im Café"
      },
      "people": [
        {
          "hz": "Nhân viên"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Chào chị! Chị uống gì ạ?",
          "en": "Hello! What would you like to drink?",
          "de": "Hallo! Was möchten Sie trinken?",
          "tip": {
            "en": "ạ at the end is polite; staff use it with customers.",
            "de": "ạ am Ende ist höflich; Bedienungen sagen es zu Gästen."
          }
        },
        {
          "who": 1,
          "hz": "Cho tôi một cà phê sữa đá.",
          "en": "An iced coffee with milk, please.",
          "de": "Einen Eiskaffee mit Milch, bitte.",
          "tip": {
            "en": "Cho tôi … = “give me …”, the easy way to order.",
            "de": "Cho tôi … = „gib mir …“, so bestellt man am einfachsten."
          }
        },
        {
          "who": 0,
          "hz": "Chị có ăn gì không ạ?",
          "en": "Would you like something to eat?",
          "de": "Möchten Sie etwas essen?"
        },
        {
          "who": 1,
          "hz": "Có, cho tôi một bánh mì.",
          "en": "Yes, a bánh mì, please.",
          "de": "Ja, ein Bánh mì, bitte."
        },
        {
          "who": 0,
          "hz": "Của chị hết năm mươi nghìn ạ.",
          "en": "That's fifty thousand dong.",
          "de": "Das macht fünfzigtausend Dong.",
          "tip": {
            "en": "nghìn = thousand; prices are usually said in thousands.",
            "de": "nghìn = tausend; Preise nennt man meist in Tausendern."
          }
        },
        {
          "who": 1,
          "hz": "Đây ạ. Cảm ơn em!",
          "en": "Here you go. Thank you!",
          "de": "Bitte schön. Danke!",
          "tip": {
            "en": "You call a younger staff member em.",
            "de": "Eine jüngere Bedienung spricht man mit em an."
          }
        }
      ]
    },
    {
      "id": "vi-time",
      "icon": "🕒",
      "topic": {
        "en": "Telling the time",
        "de": "Uhrzeit"
      },
      "people": [
        {
          "hz": "Minh"
        },
        {
          "hz": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "Bây giờ là mấy giờ?",
          "en": "What time is it now?",
          "de": "Wie spät ist es jetzt?"
        },
        {
          "who": 1,
          "hz": "Bây giờ là ba giờ chiều.",
          "en": "It's three in the afternoon.",
          "de": "Es ist drei Uhr nachmittags.",
          "tip": {
            "en": "giờ = o'clock; sáng · chiều · tối = morning · afternoon · evening.",
            "de": "giờ = Uhr; sáng · chiều · tối = morgens · nachmittags · abends."
          }
        },
        {
          "who": 0,
          "hz": "Mấy giờ bạn đi học?",
          "en": "What time do you go to class?",
          "de": "Um wie viel Uhr gehst du zum Unterricht?"
        },
        {
          "who": 1,
          "hz": "Bốn giờ rưỡi.",
          "en": "Half past four.",
          "de": "Halb fünf.",
          "tip": {
            "en": "rưỡi = half past.",
            "de": "rưỡi = halb (nach der Stunde)."
          }
        },
        {
          "who": 0,
          "hz": "Vậy mình đi cùng nhé!",
          "en": "Then let's go together!",
          "de": "Dann gehen wir zusammen!"
        },
        {
          "who": 1,
          "hz": "Ừ, được!",
          "en": "Yeah, OK!",
          "de": "Ja, gut!"
        }
      ]
    }
  ],
  ja: [
    {
      "id": "ja-greet",
      "icon": "👋",
      "topic": {
        "en": "Greetings",
        "de": "Begrüßung"
      },
      "people": [
        {
          "hz": "田中",
          "py": "Tanaka"
        },
        {
          "hz": "アンナ",
          "py": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "おはようございます。",
          "py": "Ohayō gozaimasu.",
          "en": "Good morning.",
          "de": "Guten Morgen.",
          "tip": {
            "en": "ございます makes it polite; with friends just おはよう.",
            "de": "ございます macht es höflich; unter Freunden reicht おはよう."
          }
        },
        {
          "who": 1,
          "hz": "おはようございます。お元気ですか。",
          "py": "Ohayō gozaimasu. O-genki desu ka.",
          "en": "Good morning. How are you?",
          "de": "Guten Morgen. Wie geht es Ihnen?",
          "tip": {
            "en": "か at the end makes a question.",
            "de": "か am Satzende macht eine Frage."
          }
        },
        {
          "who": 0,
          "hz": "はい、元気です。アンナさんは？",
          "py": "Hai, genki desu. Anna-san wa?",
          "en": "Yes, I'm fine. And you, Anna?",
          "de": "Ja, gut. Und Ihnen, Anna?",
          "tip": {
            "en": "さん after a name is polite — never use it for yourself.",
            "de": "さん nach einem Namen ist höflich – nie für sich selbst."
          }
        },
        {
          "who": 1,
          "hz": "私も元気です。",
          "py": "Watashi mo genki desu.",
          "en": "I'm fine too.",
          "de": "Mir geht es auch gut.",
          "tip": {
            "en": "も = too, also.",
            "de": "も = auch."
          }
        },
        {
          "who": 0,
          "hz": "じゃあ、また。",
          "py": "Jā, mata.",
          "en": "Well, see you.",
          "de": "Also dann, bis bald."
        },
        {
          "who": 1,
          "hz": "またね！",
          "py": "Mata ne!",
          "en": "See you!",
          "de": "Bis dann!"
        }
      ]
    },
    {
      "id": "ja-name",
      "icon": "🙂",
      "topic": {
        "en": "Introducing yourself",
        "de": "Sich vorstellen"
      },
      "people": [
        {
          "hz": "田中",
          "py": "Tanaka"
        },
        {
          "hz": "アンナ",
          "py": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "はじめまして。田中です。",
          "py": "Hajimemashite. Tanaka desu.",
          "en": "Nice to meet you. I'm Tanaka.",
          "de": "Freut mich. Ich bin Tanaka.",
          "tip": {
            "en": "はじめまして is only for the very first meeting.",
            "de": "はじめまして sagt man nur beim allerersten Treffen."
          }
        },
        {
          "who": 1,
          "hz": "はじめまして。アンナです。",
          "py": "Hajimemashite. Anna desu.",
          "en": "Nice to meet you. I'm Anna.",
          "de": "Freut mich. Ich bin Anna."
        },
        {
          "who": 0,
          "hz": "アンナさんはどこから来ましたか。",
          "py": "Anna-san wa doko kara kimashita ka.",
          "en": "Where are you from, Anna?",
          "de": "Woher kommen Sie, Anna?"
        },
        {
          "who": 1,
          "hz": "ドイツから来ました。",
          "py": "Doitsu kara kimashita.",
          "en": "I'm from Germany.",
          "de": "Ich komme aus Deutschland.",
          "tip": {
            "en": "から = from.",
            "de": "から = aus, von."
          }
        },
        {
          "who": 0,
          "hz": "そうですか。よろしくお願いします。",
          "py": "Sō desu ka. Yoroshiku onegai shimasu.",
          "en": "I see. Nice to meet you.",
          "de": "Ach so. Freut mich sehr.",
          "tip": {
            "en": "よろしくお願いします closes an introduction.",
            "de": "よろしくお願いします schließt eine Vorstellung ab."
          }
        },
        {
          "who": 1,
          "hz": "こちらこそ、よろしくお願いします。",
          "py": "Kochira koso, yoroshiku onegai shimasu.",
          "en": "Likewise.",
          "de": "Ganz meinerseits."
        }
      ]
    },
    {
      "id": "ja-cafe",
      "icon": "☕",
      "topic": {
        "en": "At the café",
        "de": "Im Café"
      },
      "people": [
        {
          "hz": "店員",
          "py": "Ten'in"
        },
        {
          "hz": "アンナ",
          "py": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "いらっしゃいませ。ご注文は？",
          "py": "Irasshaimase. Go-chūmon wa?",
          "en": "Welcome — what would you like?",
          "de": "Willkommen – was darf es sein?",
          "tip": {
            "en": "いらっしゃいませ is what staff say; you don't need to answer it.",
            "de": "いらっしゃいませ sagt das Personal; darauf antwortet man nicht."
          }
        },
        {
          "who": 1,
          "hz": "コーヒーを一つください。",
          "py": "Kōhī o hitotsu kudasai.",
          "en": "One coffee, please.",
          "de": "Einen Kaffee, bitte.",
          "tip": {
            "en": "ー stretches the vowel before it. コーヒー has two, so it takes four beats.",
            "de": "ー verlängert den Vokal davor. コーヒー hat zwei, also vier Takte."
          }
        },
        {
          "who": 0,
          "hz": "ホットとアイス、どちらにしますか。",
          "py": "Hotto to aisu, dochira ni shimasu ka.",
          "en": "Hot or iced?",
          "de": "Heiß oder kalt?"
        },
        {
          "who": 1,
          "hz": "ホットでお願いします。",
          "py": "Hotto de onegai shimasu.",
          "en": "Hot, please.",
          "de": "Heiß, bitte."
        },
        {
          "who": 0,
          "hz": "四百円です。",
          "py": "Yonhyaku en desu.",
          "en": "That's 400 yen.",
          "de": "Das macht 400 Yen."
        },
        {
          "who": 1,
          "hz": "はい、どうぞ。",
          "py": "Hai, dōzo.",
          "en": "Here you are.",
          "de": "Bitte schön."
        },
        {
          "who": 0,
          "hz": "ありがとうございました。",
          "py": "Arigatō gozaimashita.",
          "en": "Thank you very much.",
          "de": "Vielen Dank."
        }
      ]
    },
    {
      "id": "ja-shop",
      "icon": "🛍️",
      "topic": {
        "en": "Shopping",
        "de": "Einkaufen"
      },
      "people": [
        {
          "hz": "アンナ",
          "py": "Anna"
        },
        {
          "hz": "店員",
          "py": "Ten'in"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "すみません、これはいくらですか。",
          "py": "Sumimasen, kore wa ikura desu ka.",
          "en": "Excuse me, how much is this?",
          "de": "Entschuldigung, was kostet das?",
          "tip": {
            "en": "すみません opens almost any question to a stranger.",
            "de": "すみません leitet fast jede Frage an Fremde ein."
          }
        },
        {
          "who": 1,
          "hz": "それは千円です。",
          "py": "Sore wa sen en desu.",
          "en": "That's 1,000 yen.",
          "de": "Das kostet 1.000 Yen.",
          "tip": {
            "en": "これ = this (near me), それ = that (near you).",
            "de": "これ = das hier (bei mir), それ = das da (bei dir)."
          }
        },
        {
          "who": 0,
          "hz": "じゃあ、これをください。",
          "py": "Jā, kore o kudasai.",
          "en": "Then I'll take this.",
          "de": "Dann nehme ich das."
        },
        {
          "who": 1,
          "hz": "袋はいりますか。",
          "py": "Fukuro wa irimasu ka.",
          "en": "Do you need a bag?",
          "de": "Brauchen Sie eine Tüte?"
        },
        {
          "who": 0,
          "hz": "いいえ、大丈夫です。",
          "py": "Iie, daijōbu desu.",
          "en": "No, I'm fine.",
          "de": "Nein, danke.",
          "tip": {
            "en": "大丈夫です is a soft way to say no thanks.",
            "de": "大丈夫です ist eine sanfte Art, nein danke zu sagen."
          }
        },
        {
          "who": 1,
          "hz": "ありがとうございました。",
          "py": "Arigatō gozaimashita.",
          "en": "Thank you very much.",
          "de": "Vielen Dank."
        }
      ]
    },
    {
      "id": "ja-time",
      "icon": "🕒",
      "topic": {
        "en": "Telling the time",
        "de": "Uhrzeit"
      },
      "people": [
        {
          "hz": "田中",
          "py": "Tanaka"
        },
        {
          "hz": "アンナ",
          "py": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "今、何時ですか。",
          "py": "Ima, nanji desu ka.",
          "en": "What time is it now?",
          "de": "Wie spät ist es jetzt?"
        },
        {
          "who": 1,
          "hz": "三時半です。",
          "py": "Sanji han desu.",
          "en": "Half past three.",
          "de": "Halb vier.",
          "tip": {
            "en": "半 = half past.",
            "de": "半 = halb (nach der Stunde)."
          }
        },
        {
          "who": 0,
          "hz": "授業は何時からですか。",
          "py": "Jugyō wa nanji kara desu ka.",
          "en": "What time does class start?",
          "de": "Um wie viel Uhr fängt der Unterricht an?",
          "tip": {
            "en": "から … まで = from … until.",
            "de": "から … まで = von … bis."
          }
        },
        {
          "who": 1,
          "hz": "四時からです。",
          "py": "Yoji kara desu.",
          "en": "From four.",
          "de": "Um vier.",
          "tip": {
            "en": "Four o'clock is よじ, not よんじ.",
            "de": "Vier Uhr heißt よじ, nicht よんじ."
          }
        },
        {
          "who": 0,
          "hz": "じゃあ、一緒に行きましょう。",
          "py": "Jā, issho ni ikimashō.",
          "en": "Then let's go together.",
          "de": "Dann gehen wir zusammen."
        },
        {
          "who": 1,
          "hz": "はい、行きましょう。",
          "py": "Hai, ikimashō.",
          "en": "Yes, let's go.",
          "de": "Ja, gehen wir."
        }
      ]
    },
    {
      "id": "ja-day",
      "icon": "☀️",
      "topic": {
        "en": "Your weekend",
        "de": "Dein Wochenende"
      },
      "people": [
        {
          "hz": "田中",
          "py": "Tanaka"
        },
        {
          "hz": "アンナ",
          "py": "Anna"
        }
      ],
      "lines": [
        {
          "who": 0,
          "hz": "週末は何をしますか。",
          "py": "Shūmatsu wa nani o shimasu ka.",
          "en": "What do you do at the weekend?",
          "de": "Was machen Sie am Wochenende?"
        },
        {
          "who": 1,
          "hz": "友達と映画を見ます。",
          "py": "Tomodachi to eiga o mimasu.",
          "en": "I watch films with friends.",
          "de": "Ich schaue mit Freunden Filme.",
          "tip": {
            "en": "と = with (a person).",
            "de": "と = mit (einer Person)."
          }
        },
        {
          "who": 0,
          "hz": "いいですね。どんな映画が好きですか。",
          "py": "Ii desu ne. Donna eiga ga suki desu ka.",
          "en": "Nice. What kind of films do you like?",
          "de": "Schön. Was für Filme mögen Sie?"
        },
        {
          "who": 1,
          "hz": "日本のアニメが好きです。",
          "py": "Nihon no anime ga suki desu.",
          "en": "I like Japanese anime.",
          "de": "Ich mag japanische Anime.",
          "tip": {
            "en": "が好きです = I like …; the thing you like takes が.",
            "de": "が好きです = ich mag …; das, was man mag, bekommt が."
          }
        },
        {
          "who": 0,
          "hz": "私もです！",
          "py": "Watashi mo desu!",
          "en": "Me too!",
          "de": "Ich auch!"
        }
      ]
    }
  ]
};
