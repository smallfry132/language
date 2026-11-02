/* Spanish beginner dialogues, written for this app. Lines: { who, hz (the Spanish line), en, de, tip? { en, de } }. */
window.DIALOGUES = window.DIALOGUES || {};
window.DIALOGUES.es = [
  {
    id: "es-greet", icon: "👋", topic: { en: "Greetings", de: "Begrüßung" },
    people: [{ hz: "Lucía", g: "f" }, { hz: "Pablo", g: "m" }],
    lines: [
      { who: 0, hz: "¡Hola, Pablo! ¿Qué tal?", en: "Hi, Pablo! How are you?", de: "Hallo, Pablo! Wie geht's?", tip: { en: "Spanish opens questions and exclamations with ¿ and ¡.", de: "Spanisch beginnt Fragen und Ausrufe mit ¿ und ¡." } },
      { who: 1, hz: "Muy bien, gracias. ¿Y tú?", en: "Very well, thanks. And you?", de: "Sehr gut, danke. Und dir?" },
      { who: 0, hz: "Bien, un poco cansada.", en: "Fine, a little tired.", de: "Gut, ein bisschen müde.", tip: { en: "Adjectives agree with the speaker: Lucía says cansada, Pablo would say cansado.", de: "Adjektive richten sich nach der Person: Lucía sagt cansada, Pablo würde cansado sagen." } },
      { who: 1, hz: "¿Mucho trabajo?", en: "A lot of work?", de: "Viel Arbeit?" },
      { who: 0, hz: "Sí, mucho. Bueno, me voy. ¡Hasta luego!", en: "Yes, a lot. Well, I'm off. See you later!", de: "Ja, viel. Na gut, ich gehe. Bis später!" },
      { who: 1, hz: "¡Adiós, Lucía! Hasta mañana.", en: "Bye, Lucía! See you tomorrow.", de: "Tschüss, Lucía! Bis morgen.", tip: { en: "The h in hasta is silent: always say “asta”.", de: "Das h in hasta ist stumm: immer „asta“ sprechen." } }
    ]
  },
  {
    id: "es-name", icon: "🙂", topic: { en: "What's your name?", de: "Wie heißt du?" },
    people: [{ hz: "Carmen", g: "f" }, { hz: "Tom", g: "m" }],
    lines: [
      { who: 0, hz: "Buenos días. ¿Cómo se llama usted?", en: "Good morning. What's your name?", de: "Guten Morgen. Wie heißen Sie?", tip: { en: "usted is the polite “you”; it takes the same verb form as he/she: se llama.", de: "usted ist das höfliche „Sie“; das Verb steht wie bei er/sie: se llama." } },
      { who: 1, hz: "Me llamo Tom. ¿Y usted?", en: "My name is Tom. And you?", de: "Ich heiße Tom. Und Sie?" },
      { who: 0, hz: "Yo soy Carmen. Mucho gusto.", en: "I'm Carmen. Nice to meet you.", de: "Ich bin Carmen. Freut mich." },
      { who: 1, hz: "Encantado. Por favor, tutéame.", en: "Pleased to meet you. Please call me tú.", de: "Freut mich. Bitte duz mich.", tip: { en: "A man says encantado, a woman encantada.", de: "Ein Mann sagt encantado, eine Frau encantada." } },
      { who: 0, hz: "¡Vale! ¿De dónde eres, Tom?", en: "OK! Where are you from, Tom?", de: "Okay! Woher kommst du, Tom?" },
      { who: 1, hz: "Soy de Alemania, de Hamburgo.", en: "I'm from Germany, from Hamburg.", de: "Ich komme aus Deutschland, aus Hamburg.", tip: { en: "ser de = to be from. Origin is permanent, so it uses ser, not estar.", de: "ser de = herkommen aus. Herkunft ist dauerhaft, darum ser, nicht estar." } },
      { who: 0, hz: "¡Qué bien! Hablas muy bien español.", en: "How nice! You speak Spanish very well.", de: "Wie schön! Du sprichst sehr gut Spanisch." }
    ]
  },
  {
    id: "es-family", icon: "👨‍👩‍👧", topic: { en: "Family", de: "Familie" },
    people: [{ hz: "Sofía", g: "f" }, { hz: "Diego", g: "m" }],
    lines: [
      { who: 0, hz: "¿Tienes hermanos, Diego?", en: "Do you have any brothers or sisters, Diego?", de: "Hast du Geschwister, Diego?", tip: { en: "hermanos means brothers, but also brothers and sisters together.", de: "hermanos heißt Brüder, aber auch Geschwister." } },
      { who: 1, hz: "Sí, tengo una hermana. Se llama Ana.", en: "Yes, I have a sister. Her name is Ana.", de: "Ja, ich habe eine Schwester. Sie heißt Ana." },
      { who: 0, hz: "¿Cuántos años tiene?", en: "How old is she?", de: "Wie alt ist sie?", tip: { en: "Age uses tener: tengo veinte años (literally: I have twenty years).", de: "Das Alter steht mit tener: tengo veinte años (wörtlich: ich habe zwanzig Jahre)." } },
      { who: 1, hz: "Tiene dieciocho años. Es estudiante.", en: "She's eighteen. She's a student.", de: "Sie ist achtzehn. Sie ist Studentin." },
      { who: 1, hz: "¿Y tú? ¿Tu familia es grande?", en: "And you? Is your family big?", de: "Und du? Ist deine Familie groß?" },
      { who: 0, hz: "Sí, bastante. Tengo dos hermanos y vivo con mis padres y mi abuela.", en: "Yes, quite. I have two brothers and I live with my parents and my grandmother.", de: "Ja, ziemlich. Ich habe zwei Brüder und wohne bei meinen Eltern und meiner Großmutter.", tip: { en: "los padres = the parents (padre = father).", de: "los padres = die Eltern (padre = Vater)." } }
    ]
  },
  {
    id: "es-cafe", icon: "☕", topic: { en: "At the café", de: "Im Café" },
    people: [{ hz: "Camarero", g: "m" }, { hz: "Elena", g: "f" }],
    lines: [
      { who: 0, hz: "Buenas tardes. ¿Qué desea tomar?", en: "Good afternoon. What would you like?", de: "Guten Tag. Was möchten Sie trinken?", tip: { en: "tomar (to take) is the usual verb for having food or drinks.", de: "tomar (nehmen) ist das übliche Verb für Essen und Getränke." } },
      { who: 1, hz: "Un café con leche, por favor.", en: "A white coffee, please.", de: "Einen Milchkaffee, bitte." },
      { who: 0, hz: "¿Algo para comer?", en: "Anything to eat?", de: "Etwas zu essen?" },
      { who: 1, hz: "Sí, quisiera una tostada con tomate.", en: "Yes, I'd like some toast with tomato.", de: "Ja, ich hätte gern einen Toast mit Tomate.", tip: { en: "quisiera (I would like) is softer and more polite than quiero (I want).", de: "quisiera (ich hätte gern) ist weicher und höflicher als quiero (ich will)." } },
      { who: 0, hz: "Muy bien. Ahora mismo se lo traigo.", en: "Very good. I'll bring it right away.", de: "Sehr gut. Ich bringe es Ihnen sofort." },
      { who: 1, hz: "Perdone, ¿me trae la cuenta, por favor?", en: "Excuse me, could you bring me the bill, please?", de: "Entschuldigung, bringen Sie mir bitte die Rechnung?" },
      { who: 0, hz: "Claro. Son cuatro euros con cincuenta.", en: "Of course. That's four euros fifty.", de: "Natürlich. Das macht vier Euro fünfzig.", tip: { en: "Prices: cuatro euros con cincuenta = €4.50.", de: "Preise: cuatro euros con cincuenta = 4,50 €." } }
    ]
  },
  {
    id: "es-shop", icon: "🛍️", topic: { en: "How much is it?", de: "Wie viel kostet das?" },
    people: [{ hz: "Marta", g: "f" }, { hz: "Vendedor", g: "m" }],
    lines: [
      { who: 0, hz: "Perdone, ¿cuánto cuesta esta camiseta?", en: "Excuse me, how much is this T-shirt?", de: "Entschuldigung, wie viel kostet dieses T-Shirt?" },
      { who: 1, hz: "Cuesta quince euros.", en: "It costs fifteen euros.", de: "Es kostet fünfzehn Euro." },
      { who: 0, hz: "¿Y las camisetas azules?", en: "And the blue T-shirts?", de: "Und die blauen T-Shirts?", tip: { en: "Adjectives usually come after the noun and agree with it: las camisetas azules.", de: "Adjektive stehen meist nach dem Nomen und passen sich an: las camisetas azules." } },
      { who: 1, hz: "Esas cuestan doce. Están de oferta.", en: "Those cost twelve. They're on special offer.", de: "Die kosten zwölf. Sie sind im Angebot." },
      { who: 0, hz: "¡Qué baratas! Me llevo dos.", en: "So cheap! I'll take two.", de: "Wie günstig! Ich nehme zwei.", tip: { en: "llevarse = to take (buy) something: me llevo esta.", de: "llevarse = etwas nehmen (kaufen): me llevo esta." } },
      { who: 1, hz: "Perfecto. Son veinticuatro euros. ¿Paga con tarjeta?", en: "Perfect. That's twenty-four euros. Are you paying by card?", de: "Perfekt. Das macht vierundzwanzig Euro. Zahlen Sie mit Karte?" },
      { who: 0, hz: "No, en efectivo. Aquí tiene.", en: "No, in cash. Here you are.", de: "Nein, bar. Bitte schön." }
    ]
  },
  {
    id: "es-time", icon: "🕒", topic: { en: "What time is it?", de: "Wie spät ist es?" },
    people: [{ hz: "Javier", g: "m" }, { hz: "Isabel", g: "f" }],
    lines: [
      { who: 0, hz: "Isabel, ¿qué hora es?", en: "Isabel, what time is it?", de: "Isabel, wie spät ist es?" },
      { who: 1, hz: "Son las cinco y media.", en: "It's half past five.", de: "Es ist halb sechs.", tip: { en: "Times use son las (it's), but one o'clock is es la una.", de: "Uhrzeiten mit son las (es ist), aber ein Uhr heißt es la una." } },
      { who: 0, hz: "¿Vamos al cine esta noche?", en: "Shall we go to the cinema tonight?", de: "Gehen wir heute Abend ins Kino?" },
      { who: 1, hz: "¡Buena idea! ¿A qué hora empieza la película?", en: "Good idea! What time does the film start?", de: "Gute Idee! Um wie viel Uhr fängt der Film an?", tip: { en: "¿A qué hora…? asks “at what time…?”; the answer is a las…", de: "¿A qué hora…? fragt „um wie viel Uhr…?“; die Antwort ist a las…" } },
      { who: 0, hz: "A las nueve menos cuarto.", en: "At quarter to nine.", de: "Um Viertel vor neun." },
      { who: 1, hz: "Perfecto. ¿Quedamos a las ocho en la plaza?", en: "Perfect. Shall we meet at eight in the square?", de: "Perfekt. Treffen wir uns um acht auf dem Platz?" },
      { who: 0, hz: "Vale, hasta luego.", en: "OK, see you later.", de: "Okay, bis später.", tip: { en: "vale (OK) is typical of Spain; in Latin America people say bueno or está bien.", de: "vale (okay) ist typisch für Spanien; in Lateinamerika sagt man bueno oder está bien." } }
    ]
  }
];
