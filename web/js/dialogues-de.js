/* German beginner dialogues, written for this app. Lines: { who, hz (the German line), en, de (same as hz), tip? { en, de } }. */
window.DIALOGUES = window.DIALOGUES || {};
window.DIALOGUES.de = [
  {
    id: "de-greet", icon: "👋", topic: { en: "Greetings", de: "Begrüßung" },
    people: [{ hz: "Lena" }, { hz: "Tom" }],
    lines: [
      { who: 0, hz: "Hallo Tom! Wie geht's?", en: "Hi Tom! How are you?", de: "Hallo Tom! Wie geht's?", tip: { en: "Wie geht's? is the short, friendly form of Wie geht es dir?", de: "Wie geht's? ist die kurze, freundliche Form von Wie geht es dir?" } },
      { who: 1, hz: "Danke, gut. Und dir?", en: "Fine, thanks. And you?", de: "Danke, gut. Und dir?", tip: { en: "Und dir? (and you?) uses dir, not du, because it is short for Wie geht es dir?", de: "Und dir? steht mit dir, nicht du, weil es die Kurzform von Wie geht es dir? ist." } },
      { who: 0, hz: "Auch gut, danke. Ich bin nur ein bisschen müde.", en: "Fine too, thanks. I'm just a bit tired.", de: "Auch gut, danke. Ich bin nur ein bisschen müde." },
      { who: 1, hz: "Ich auch. Ich muss jetzt leider zur Arbeit.", en: "Me too. Unfortunately I have to go to work now.", de: "Ich auch. Ich muss jetzt leider zur Arbeit." },
      { who: 0, hz: "Kein Problem. Bis morgen!", en: "No problem. See you tomorrow!", de: "Kein Problem. Bis morgen!" },
      { who: 1, hz: "Tschüss, Lena!", en: "Bye, Lena!", de: "Tschüss, Lena!", tip: { en: "Tschüss is for friends and family; with strangers say Auf Wiedersehen.", de: "Tschüss sagt man zu Freunden und Familie; zu Fremden sagt man Auf Wiedersehen." } }
    ]
  },
  {
    id: "de-name", icon: "🙂", topic: { en: "Introducing yourself", de: "Sich vorstellen" },
    people: [{ hz: "Frau Becker" }, { hz: "Daniel" }],
    lines: [
      { who: 0, hz: "Guten Tag! Ich heiße Anja Becker. Wie heißen Sie?", en: "Hello! My name is Anja Becker. What's your name?", de: "Guten Tag! Ich heiße Anja Becker. Wie heißen Sie?", tip: { en: "Sie (always with a capital S) is the polite you, for adults you don't know well.", de: "Sie (immer groß) ist die höfliche Anrede für Erwachsene, die man nicht gut kennt." } },
      { who: 1, hz: "Ich heiße Daniel Smith. Freut mich!", en: "My name is Daniel Smith. Nice to meet you!", de: "Ich heiße Daniel Smith. Freut mich!" },
      { who: 0, hz: "Freut mich auch. Woher kommen Sie?", en: "Nice to meet you too. Where are you from?", de: "Freut mich auch. Woher kommen Sie?" },
      { who: 1, hz: "Ich komme aus Kanada, aus Toronto. Und Sie?", en: "I'm from Canada, from Toronto. And you?", de: "Ich komme aus Kanada, aus Toronto. Und Sie?", tip: { en: "Countries and cities follow aus: Ich komme aus Kanada. A few countries take an article: aus der Schweiz.", de: "Nach aus folgt das Land oder die Stadt: Ich komme aus Kanada. Manche Länder haben einen Artikel: aus der Schweiz." } },
      { who: 0, hz: "Ich komme aus Hamburg, aber ich wohne jetzt hier in München.", en: "I'm from Hamburg, but I live here in Munich now.", de: "Ich komme aus Hamburg, aber ich wohne jetzt hier in München." },
      { who: 1, hz: "Ich wohne auch erst seit zwei Monaten hier.", en: "I've only been living here for two months too.", de: "Ich wohne auch erst seit zwei Monaten hier.", tip: { en: "German uses the present tense with seit for something that is still going on: Ich wohne seit … = I have been living …", de: "Mit seit steht im Deutschen das Präsens, wenn etwas noch andauert: Ich wohne seit zwei Monaten hier." } },
      { who: 0, hz: "Dann herzlich willkommen in München!", en: "Then welcome to Munich!", de: "Dann herzlich willkommen in München!" }
    ]
  },
  {
    id: "de-family", icon: "👨‍👩‍👧", topic: { en: "Family", de: "Familie" },
    people: [{ hz: "Sara" }, { hz: "Jonas" }],
    lines: [
      { who: 0, hz: "Wer ist das auf dem Foto?", en: "Who is that in the photo?", de: "Wer ist das auf dem Foto?" },
      { who: 1, hz: "Das ist meine Familie. Das sind meine Eltern.", en: "That's my family. Those are my parents.", de: "Das ist meine Familie. Das sind meine Eltern." },
      { who: 0, hz: "Und der Junge hier? Ist das dein Bruder?", en: "And the boy here? Is that your brother?", de: "Und der Junge hier? Ist das dein Bruder?" },
      { who: 1, hz: "Ja, das ist mein Bruder Leo. Er ist zwölf.", en: "Yes, that's my brother Leo. He's twelve.", de: "Ja, das ist mein Bruder Leo. Er ist zwölf.", tip: { en: "mein for der and das words (mein Bruder), meine for die words and plurals (meine Schwester, meine Eltern).", de: "mein bei der- und das-Wörtern (mein Bruder), meine bei die-Wörtern und im Plural (meine Schwester, meine Eltern)." } },
      { who: 0, hz: "Hast du auch eine Schwester?", en: "Do you have a sister too?", de: "Hast du auch eine Schwester?" },
      { who: 1, hz: "Nein, ich habe keine Schwester. Und du? Hast du Geschwister?", en: "No, I don't have a sister. And you? Do you have any brothers or sisters?", de: "Nein, ich habe keine Schwester. Und du? Hast du Geschwister?", tip: { en: "Use kein, not nicht, before a noun: Ich habe keine Schwester = I don't have a sister.", de: "Vor einem Nomen verneint man mit kein, nicht mit nicht: Ich habe keine Schwester." } },
      { who: 0, hz: "Ja, zwei Schwestern. Sie wohnen beide in Berlin.", en: "Yes, two sisters. They both live in Berlin.", de: "Ja, zwei Schwestern. Sie wohnen beide in Berlin." }
    ]
  },
  {
    id: "de-cafe", icon: "☕", topic: { en: "At the café", de: "Im Café" },
    people: [{ hz: "Kellner" }, { hz: "Mia" }],
    lines: [
      { who: 0, hz: "Guten Tag! Was möchten Sie trinken?", en: "Hello! What would you like to drink?", de: "Guten Tag! Was möchten Sie trinken?" },
      { who: 1, hz: "Ich hätte gern einen Kaffee mit Milch, bitte.", en: "I'd like a coffee with milk, please.", de: "Ich hätte gern einen Kaffee mit Milch, bitte.", tip: { en: "Ich hätte gern … and Ich möchte … are the polite ways to order. Ich will … sounds blunt.", de: "Ich hätte gern … und Ich möchte … sind höflich. Ich will … klingt unhöflich direkt." } },
      { who: 0, hz: "Gern. Möchten Sie auch etwas essen?", en: "Certainly. Would you like something to eat too?", de: "Gern. Möchten Sie auch etwas essen?" },
      { who: 1, hz: "Ja, ein Stück Apfelkuchen, bitte.", en: "Yes, a piece of apple cake, please.", de: "Ja, ein Stück Apfelkuchen, bitte.", tip: { en: "ein Stück + noun, with no 'of': ein Stück Kuchen, eine Tasse Tee, ein Glas Wasser.", de: "ein Stück + Nomen, ohne weiteres Wort: ein Stück Kuchen, eine Tasse Tee, ein Glas Wasser." } },
      { who: 0, hz: "Mit Sahne?", en: "With cream?", de: "Mit Sahne?" },
      { who: 1, hz: "Nein, danke. Ohne Sahne.", en: "No, thanks. Without cream.", de: "Nein, danke. Ohne Sahne." },
      { who: 1, hz: "Entschuldigung, ich möchte bitte zahlen.", en: "Excuse me, I'd like to pay, please.", de: "Entschuldigung, ich möchte bitte zahlen.", tip: { en: "In Germany you usually pay at the table, and the waiter asks: Zusammen oder getrennt? (together or separately?)", de: "In Deutschland zahlt man meist am Tisch, und der Kellner fragt: Zusammen oder getrennt?" } },
      { who: 0, hz: "Das macht sechs Euro achtzig.", en: "That's six euros eighty.", de: "Das macht sechs Euro achtzig." }
    ]
  },
  {
    id: "de-shop", icon: "🛍️", topic: { en: "Shopping", de: "Einkaufen" },
    people: [{ hz: "Verkäuferin" }, { hz: "Ben" }],
    lines: [
      { who: 0, hz: "Guten Tag! Kann ich Ihnen helfen?", en: "Hello! Can I help you?", de: "Guten Tag! Kann ich Ihnen helfen?", tip: { en: "helfen takes the dative: Ihnen, dir, mir – not Sie, dich, mich.", de: "helfen steht mit Dativ: Ihnen, dir, mir – nicht Sie, dich, mich." } },
      { who: 1, hz: "Ja, bitte. Ich suche eine Jacke.", en: "Yes, please. I'm looking for a jacket.", de: "Ja, bitte. Ich suche eine Jacke." },
      { who: 0, hz: "Wie finden Sie diese Jacke hier?", en: "What do you think of this jacket here?", de: "Wie finden Sie diese Jacke hier?" },
      { who: 1, hz: "Die ist schön. Was kostet sie?", en: "That's nice. How much is it?", de: "Die ist schön. Was kostet sie?" },
      { who: 0, hz: "Neunundfünfzig Euro.", en: "Fifty-nine euros.", de: "Neunundfünfzig Euro.", tip: { en: "German says the ones before the tens: neunundfünfzig = nine-and-fifty.", de: "Im Deutschen kommen die Einer vor den Zehnern: neunundfünfzig." } },
      { who: 1, hz: "Hm, das ist ein bisschen teuer. Haben Sie auch etwas Billigeres?", en: "Hmm, that's a bit expensive. Do you have anything cheaper?", de: "Hm, das ist ein bisschen teuer. Haben Sie auch etwas Billigeres?" },
      { who: 0, hz: "Ja, die blaue Jacke dort kostet nur vierzig Euro.", en: "Yes, the blue jacket over there is only forty euros.", de: "Ja, die blaue Jacke dort kostet nur vierzig Euro." },
      { who: 1, hz: "Super, die nehme ich.", en: "Great, I'll take it.", de: "Super, die nehme ich.", tip: { en: "Die nehme ich: the object comes first for emphasis, so the verb stays in second place.", de: "Die nehme ich: Das Objekt steht zur Betonung vorne, das Verb bleibt an zweiter Stelle." } }
    ]
  },
  {
    id: "de-time", icon: "🕒", topic: { en: "Time and plans", de: "Uhrzeit und Pläne" },
    people: [{ hz: "Lisa" }, { hz: "Max" }],
    lines: [
      { who: 0, hz: "Entschuldigung, wie spät ist es?", en: "Excuse me, what time is it?", de: "Entschuldigung, wie spät ist es?" },
      { who: 1, hz: "Es ist halb vier.", en: "It's half past three.", de: "Es ist halb vier.", tip: { en: "halb vier means half TO four, so 3:30 – not 4:30!", de: "halb vier heißt eine halbe Stunde vor vier, also 3:30 Uhr." } },
      { who: 0, hz: "Danke. Hast du heute Abend Zeit? Wir können ins Kino gehen.", en: "Thanks. Are you free this evening? We could go to the cinema.", de: "Danke. Hast du heute Abend Zeit? Wir können ins Kino gehen." },
      { who: 1, hz: "Heute kann ich leider nicht. Aber morgen habe ich Zeit.", en: "Unfortunately I can't today. But I'm free tomorrow.", de: "Heute kann ich leider nicht. Aber morgen habe ich Zeit.", tip: { en: "When a sentence starts with a time word, the verb comes second and the subject follows: Morgen habe ich Zeit.", de: "Beginnt der Satz mit einer Zeitangabe, steht das Verb an zweiter Stelle und das Subjekt danach: Morgen habe ich Zeit." } },
      { who: 0, hz: "Gut, dann morgen. Um wie viel Uhr?", en: "OK, tomorrow then. At what time?", de: "Gut, dann morgen. Um wie viel Uhr?" },
      { who: 1, hz: "Der Film beginnt um Viertel nach acht. Treffen wir uns um acht vor dem Kino?", en: "The film starts at a quarter past eight. Shall we meet at eight in front of the cinema?", de: "Der Film beginnt um Viertel nach acht. Treffen wir uns um acht vor dem Kino?" },
      { who: 0, hz: "Perfekt. Bis morgen!", en: "Perfect. See you tomorrow!", de: "Perfekt. Bis morgen!" }
    ]
  }
];
