/* Beginner dialogues for the Chinese course (HSK 1 vocabulary, a few common extras).
 * Written for this app. Pinyin follows the spoken tone changes of 不 and 一 (bú shì, yì bēi), like the word lists.
 * Fields: id, topic { en, de }, people [names as { hz, py }], lines [{ who: index into people, hz, py, en, de }] */
window.DIALOGUES = {
  zh: [
    {
      id: "zh-greet", icon: "👋", topic: { en: "Greetings", de: "Begrüßung" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你好！", py: "Nǐ hǎo!", en: "Hello!", de: "Hallo!" },
        { who: 1, hz: "你好！", py: "Nǐ hǎo!", en: "Hello!", de: "Hallo!" },
        { who: 0, hz: "你好吗？", py: "Nǐ hǎo ma?", en: "How are you?", de: "Wie geht es dir?" },
        { who: 1, hz: "我很好，谢谢。你呢？", py: "Wǒ hěn hǎo, xièxie. Nǐ ne?", en: "I'm fine, thanks. And you?", de: "Mir geht es gut, danke. Und dir?" },
        { who: 0, hz: "我也很好。", py: "Wǒ yě hěn hǎo.", en: "I'm fine too.", de: "Mir geht es auch gut." },
        { who: 1, hz: "再见！", py: "Zàijiàn!", en: "Goodbye!", de: "Auf Wiedersehen!" },
        { who: 0, hz: "明天见！", py: "Míngtiān jiàn!", en: "See you tomorrow!", de: "Bis morgen!" }
      ]
    },
    {
      id: "zh-name", icon: "🙂", topic: { en: "What's your name?", de: "Wie heißt du?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你叫什么名字？", py: "Nǐ jiào shénme míngzi?", en: "What's your name?", de: "Wie heißt du?" },
        { who: 1, hz: "我叫安娜。你呢？", py: "Wǒ jiào Ānnà. Nǐ ne?", en: "My name is Anna. And you?", de: "Ich heiße Anna. Und du?" },
        { who: 0, hz: "我姓王，叫王明。", py: "Wǒ xìng Wáng, jiào Wáng Míng.", en: "My surname is Wang, my name is Wang Ming.", de: "Mein Familienname ist Wang, ich heiße Wang Ming." },
        { who: 1, hz: "认识你很高兴。", py: "Rènshi nǐ hěn gāoxìng.", en: "Nice to meet you.", de: "Freut mich, dich kennenzulernen." },
        { who: 0, hz: "认识你，我也很高兴。", py: "Rènshi nǐ, wǒ yě hěn gāoxìng.", en: "Nice to meet you too.", de: "Freut mich auch." }
      ]
    },
    {
      id: "zh-country", icon: "🌍", topic: { en: "Which country are you from?", de: "Aus welchem Land kommst du?" },
      people: [{ hz: "王明", py: "Wáng Míng" }, { hz: "安娜", py: "Ānnà" }],
      lines: [
        { who: 0, hz: "你是哪国人？", py: "Nǐ shì nǎ guó rén?", en: "Which country are you from?", de: "Aus welchem Land kommst du?" },
        { who: 1, hz: "我是德国人。你是中国人吗？", py: "Wǒ shì Déguó rén. Nǐ shì Zhōngguó rén ma?", en: "I'm German. Are you Chinese?", de: "Ich bin Deutsche. Bist du Chinese?" },
        { who: 0, hz: "是，我是中国人。", py: "Shì, wǒ shì Zhōngguó rén.", en: "Yes, I'm Chinese.", de: "Ja, ich bin Chinese." },
        { who: 1, hz: "你的老师也是中国人吗？", py: "Nǐ de lǎoshī yě shì Zhōngguó rén ma?", en: "Is your teacher Chinese too?", de: "Ist dein Lehrer auch Chinese?" },
        { who: 0, hz: "不是，他是美国人。", py: "Bú shì, tā shì Měiguó rén.", en: "No, he's American.", de: "Nein, er ist Amerikaner." }
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
        { who: 1, hz: "我要一碗米饭和一个菜。", py: "Wǒ yào yì wǎn mǐfàn hé yí ge cài.", en: "I'd like a bowl of rice and a dish.", de: "Ich hätte gern eine Schüssel Reis und ein Gericht." },
        { who: 0, hz: "喝什么？", py: "Hē shénme?", en: "What would you like to drink?", de: "Was möchten Sie trinken?" },
        { who: 1, hz: "一杯茶，谢谢。", py: "Yì bēi chá, xièxie.", en: "A cup of tea, thanks.", de: "Eine Tasse Tee, danke." },
        { who: 0, hz: "好的。还要别的吗？", py: "Hǎo de. Hái yào bié de ma?", en: "Okay. Anything else?", de: "Gut. Sonst noch etwas?" },
        { who: 1, hz: "不要了。多少钱？", py: "Bú yào le. Duōshao qián?", en: "No, that's all. How much is it?", de: "Nein, danke. Was kostet das?" },
        { who: 0, hz: "一共三十五块。", py: "Yígòng sānshíwǔ kuài.", en: "Thirty-five yuan altogether.", de: "Zusammen fünfunddreißig Yuan." }
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
  ]
};
