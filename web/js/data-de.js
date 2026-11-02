/* German beginner vocabulary — two levels (A1 ≈ first steps, A2 ≈ everyday life), standard German.
 * Written for this app, sorted into the same topics as the other courses (themes.js); the levels are an editorial
 * grading, not the official Goethe list. Nouns carry their article (der/die/das) and plural.
 * Rows: [id, word, plural, English, example, example in English]. Ids are stable: never reuse or renumber them.
 * Each block: topic/group (index into the Chinese topic's groups, see themes.js) and level. */
(function () {
  const out = [];
  const add = (t, lvl, rows) => rows.forEach(([id, w, pl, en, ex, exEn]) => out.push({ id, w, pl: pl || "", en, t, lvl, ex: ex || "", exEn: exEn || "" }));

  /* ───────────── A1 ───────────── */

  add("hello/0", 1, [
    ["de1", "hallo", "", "hello, hi", "Hallo, ich bin Anna.", "Hello, I'm Anna."],
    ["de2", "guten Morgen", "", "good morning", "Guten Morgen, Herr Weber!", "Good morning, Mr Weber!"],
    ["de3", "guten Tag", "", "hello, good day", "Guten Tag, wie kann ich helfen?", "Hello, how can I help?"],
    ["de4", "guten Abend", "", "good evening", "Guten Abend, Frau Klein!", "Good evening, Mrs Klein!"],
    ["de5", "gute Nacht", "", "good night", "Gute Nacht, schlaf gut!", "Good night, sleep well!"],
    ["de6", "tschüss", "", "bye", "Tschüss, bis morgen!", "Bye, see you tomorrow!"],
    ["de7", "auf Wiedersehen", "", "goodbye", "Auf Wiedersehen und danke!", "Goodbye and thank you!"],
    ["de8", "danke", "", "thank you, thanks", "Danke für den Kaffee!", "Thanks for the coffee!"],
    ["de9", "bitte", "", "please; you're welcome", "Ein Wasser, bitte.", "A water, please."],
    ["de10", "ja", "", "yes", "Ja, das ist richtig.", "Yes, that's right."],
    ["de11", "nein", "", "no", "Nein, danke.", "No, thank you."],
    ["de12", "Entschuldigung", "", "excuse me, sorry", "Entschuldigung, wo ist der Bahnhof?", "Excuse me, where is the station?"],
    ["de13", "Wie geht's?", "", "how are you?", "Hallo Tom, wie geht's?", "Hi Tom, how are you?"],
    ["de14", "freut mich", "", "nice to meet you", "Ich bin Lena. – Freut mich!", "I'm Lena. – Nice to meet you!"]
  ]);

  add("people/0", 1, [
    ["de15", "ich", "", "I", "Ich bin müde.", "I'm tired."],
    ["de16", "du", "", "you (informal)", "Du bist nett.", "You are nice."],
    ["de17", "er", "", "he; it (for der-words)", "Er ist mein Bruder.", "He is my brother."],
    ["de18", "sie", "", "she; they; it (for die-words)", "Ist sie deine Schwester?", "Is she your sister?"],
    ["de19", "es", "", "it", "Es ist kalt.", "It is cold."],
    ["de20", "wir", "", "we", "Wir wohnen in Hamburg.", "We live in Hamburg."],
    ["de21", "ihr", "", "you (plural, informal)", "Kommt ihr heute?", "Are you all coming today?"],
    ["de22", "Sie", "", "you (polite)", "Woher kommen Sie?", "Where are you from?"]
  ]);

  add("people/1", 1, [
    ["de23", "dieser", "", "this, this one", "Dieser Tisch ist neu.", "This table is new."],
    ["de24", "jeder", "", "every, each", "Ich trinke jeden Tag Tee.", "I drink tea every day."],
    ["de25", "alle", "", "all, everybody", "Alle sind hier.", "Everybody is here."],
    ["de26", "etwas", "", "something; a little", "Möchtest du etwas trinken?", "Would you like something to drink?"],
    ["de27", "nichts", "", "nothing", "Ich habe nichts gesehen.", "I didn't see anything."]
  ]);

  add("people/2", 1, [
    ["de28", "der Name", "die Namen", "name", "Mein Name ist Paul.", "My name is Paul."],
    ["de29", "heißen", "", "to be called", "Ich heiße Maria.", "My name is Maria."],
    ["de30", "der Mann", "die Männer", "man; husband", "Der Mann dort ist mein Vater.", "The man over there is my father."],
    ["de31", "die Frau", "die Frauen", "woman; wife; Mrs", "Die Frau heißt Eva.", "The woman is called Eva."],
    ["de32", "der Herr", "die Herren", "gentleman; Mr", "Herr Schmidt ist nicht da.", "Mr Schmidt isn't here."],
    ["de33", "der Junge", "die Jungen", "boy", "Der Junge spielt Fußball.", "The boy plays football."],
    ["de34", "das Mädchen", "die Mädchen", "girl", "Das Mädchen ist sieben.", "The girl is seven."],
    ["de35", "die Leute", "–", "people (plural only)", "Die Leute hier sind nett.", "The people here are nice."],
    ["de36", "wohnen", "", "to live (somewhere)", "Ich wohne in Köln.", "I live in Cologne."],
    ["de37", "die Adresse", "die Adressen", "address", "Wie ist deine Adresse?", "What is your address?"]
  ]);

  add("family/0", 1, [
    ["de38", "die Familie", "die Familien", "family", "Meine Familie ist groß.", "My family is big."],
    ["de39", "die Eltern", "–", "parents (plural only)", "Meine Eltern wohnen in Wien.", "My parents live in Vienna."],
    ["de40", "der Vater", "die Väter", "father", "Mein Vater kocht gern.", "My father likes cooking."],
    ["de41", "die Mutter", "die Mütter", "mother", "Meine Mutter ist Ärztin.", "My mother is a doctor."],
    ["de42", "der Bruder", "die Brüder", "brother", "Ich habe einen Bruder.", "I have a brother."],
    ["de43", "die Schwester", "die Schwestern", "sister", "Meine Schwester ist zwölf.", "My sister is twelve."],
    ["de44", "die Geschwister", "–", "brothers and sisters (plural only)", "Hast du Geschwister?", "Do you have brothers or sisters?"]
  ]);

  add("family/1", 1, [
    ["de45", "das Kind", "die Kinder", "child", "Sie haben zwei Kinder.", "They have two children."],
    ["de46", "der Sohn", "die Söhne", "son", "Unser Sohn geht zur Schule.", "Our son goes to school."],
    ["de47", "die Tochter", "die Töchter", "daughter", "Ihre Tochter heißt Mia.", "Her daughter is called Mia."],
    ["de48", "die Oma", "die Omas", "grandma", "Meine Oma ist achtzig.", "My grandma is eighty."],
    ["de49", "der Opa", "die Opas", "grandpa", "Opa liest die Zeitung.", "Grandpa is reading the paper."]
  ]);

  add("family/2", 1, [
    ["de50", "der Geburtstag", "die Geburtstage", "birthday", "Wann hast du Geburtstag?", "When is your birthday?"],
    ["de51", "der Nachbar", "die Nachbarn", "neighbour (man)", "Unser Nachbar hat einen Hund.", "Our neighbour has a dog."]
  ]);

  add("countries/0", 1, [
    ["de52", "das Land", "die Länder", "country; countryside", "Deutschland ist ein schönes Land.", "Germany is a beautiful country."],
    ["de53", "Deutschland", "–", "Germany", "Ich lerne Deutsch in Deutschland.", "I'm learning German in Germany."],
    ["de54", "Österreich", "–", "Austria", "Wien liegt in Österreich.", "Vienna is in Austria."],
    ["de55", "die Schweiz", "–", "Switzerland", "Wir fahren in die Schweiz.", "We're going to Switzerland."]
  ]);

  add("countries/2", 1, [
    ["de56", "die Sprache", "die Sprachen", "language", "Welche Sprachen sprichst du?", "Which languages do you speak?"],
    ["de57", "Deutsch", "–", "German (language)", "Ich spreche ein bisschen Deutsch.", "I speak a little German."],
    ["de58", "Englisch", "–", "English (language)", "Sprechen Sie Englisch?", "Do you speak English?"],
    ["de59", "sprechen", "", "to speak (spricht)", "Er spricht sehr schnell.", "He speaks very fast."]
  ]);

  add("numbers/0", 1, [
    ["de60", "null", "", "zero", "Es ist null Grad.", "It's zero degrees."],
    ["de61", "eins", "", "one", "Eins, zwei, drei – los!", "One, two, three – go!"],
    ["de62", "zwei", "", "two", "Ich habe zwei Katzen.", "I have two cats."],
    ["de63", "drei", "", "three", "Drei Kaffee, bitte.", "Three coffees, please."],
    ["de64", "vier", "", "four", "Wir sind vier Personen.", "There are four of us."],
    ["de65", "fünf", "", "five", "Der Bus kommt in fünf Minuten.", "The bus comes in five minutes."],
    ["de66", "sechs", "", "six", "Das Kind ist sechs Jahre alt.", "The child is six years old."],
    ["de67", "sieben", "", "seven", "Die Woche hat sieben Tage.", "A week has seven days."],
    ["de68", "acht", "", "eight", "Ich stehe um acht auf.", "I get up at eight."],
    ["de69", "neun", "", "nine", "Das kostet neun Euro.", "That costs nine euros."],
    ["de70", "zehn", "", "ten", "Ich bin in zehn Minuten da.", "I'll be there in ten minutes."]
  ]);

  add("numbers/1", 1, [
    ["de71", "elf", "", "eleven", "Die Schule ist um elf zu Ende.", "School finishes at eleven."],
    ["de72", "zwölf", "", "twelve", "Ein Jahr hat zwölf Monate.", "A year has twelve months."],
    ["de73", "dreizehn", "", "thirteen", "Mein Bruder ist dreizehn.", "My brother is thirteen."],
    ["de74", "vierzehn", "", "fourteen", "Der Kurs hat vierzehn Leute.", "The course has fourteen people."],
    ["de75", "fünfzehn", "", "fifteen", "Wir warten fünfzehn Minuten.", "We wait fifteen minutes."],
    ["de76", "sechzehn", "", "sixteen", "Sie ist sechzehn Jahre alt.", "She is sixteen years old."],
    ["de77", "siebzehn", "", "seventeen", "Der Zug fährt um siebzehn Uhr.", "The train leaves at five p.m."],
    ["de78", "achtzehn", "", "eighteen", "Mit achtzehn darf man Auto fahren.", "At eighteen you can drive a car."],
    ["de79", "neunzehn", "", "nineteen", "Das Buch kostet neunzehn Euro.", "The book costs nineteen euros."],
    ["de80", "zwanzig", "", "twenty", "Ich bin zwanzig.", "I'm twenty."],
    ["de81", "dreißig", "", "thirty", "Der Monat hat dreißig Tage.", "The month has thirty days."],
    ["de82", "vierzig", "", "forty", "Mein Vater ist vierzig.", "My father is forty."],
    ["de83", "fünfzig", "", "fifty", "Das sind fünfzig Euro.", "That's fifty euros."],
    ["de84", "sechzig", "", "sixty", "Eine Stunde hat sechzig Minuten.", "An hour has sixty minutes."],
    ["de85", "siebzig", "", "seventy", "Meine Oma ist siebzig.", "My grandma is seventy."],
    ["de86", "achtzig", "", "eighty", "Hier darf man achtzig fahren.", "You can drive at eighty here."],
    ["de87", "neunzig", "", "ninety", "Der Film dauert neunzig Minuten.", "The film lasts ninety minutes."],
    ["de88", "hundert", "", "hundred", "Das kostet hundert Euro.", "That costs a hundred euros."],
    ["de89", "tausend", "", "thousand", "Die Stadt hat tausend Einwohner.", "The town has a thousand inhabitants."]
  ]);

  add("numbers/2", 1, [
    ["de90", "die Zahl", "die Zahlen", "number, figure", "Schreib die Zahl an die Tafel.", "Write the number on the board."],
    ["de91", "erste", "", "first", "Das ist mein erster Tag hier.", "It's my first day here."]
  ]);

  add("numbers/3", 1, [
    ["de92", "das Stück", "die Stücke", "piece", "Ein Stück Kuchen, bitte.", "A piece of cake, please."],
    ["de93", "die Flasche", "die Flaschen", "bottle", "Eine Flasche Wasser, bitte.", "A bottle of water, please."],
    ["de94", "die Tasse", "die Tassen", "cup", "Ich trinke eine Tasse Tee.", "I'm drinking a cup of tea."],
    ["de95", "das Glas", "die Gläser", "glass", "Ein Glas Saft, bitte.", "A glass of juice, please."]
  ]);

  add("numbers/4", 1, [
    ["de96", "das Kilo", "die Kilos", "kilo", "Ein Kilo Äpfel, bitte.", "A kilo of apples, please."]
  ]);

  add("time/0", 1, [
    ["de97", "die Uhr", "die Uhren", "clock, watch; o'clock", "Es ist drei Uhr.", "It's three o'clock."],
    ["de98", "die Zeit", "die Zeiten", "time", "Hast du heute Zeit?", "Do you have time today?"],
    ["de99", "die Stunde", "die Stunden", "hour; lesson", "Der Film dauert zwei Stunden.", "The film lasts two hours."],
    ["de100", "die Minute", "die Minuten", "minute", "Warte eine Minute!", "Wait a minute!"],
    ["de101", "halb", "", "half; half (to the next hour)", "Es ist halb acht.", "It's half past seven."],
    ["de102", "das Viertel", "die Viertel", "quarter", "Es ist Viertel nach zwei.", "It's a quarter past two."],
    ["de103", "vor", "", "before; to (the hour); in front of; ago", "Es ist zehn vor neun.", "It's ten to nine."]
  ]);

  add("time/1", 1, [
    ["de104", "der Morgen", "die Morgen", "morning", "Am Morgen trinke ich Kaffee.", "In the morning I drink coffee."],
    ["de105", "der Abend", "die Abende", "evening", "Am Abend sehe ich fern.", "In the evening I watch TV."],
    ["de106", "die Nacht", "die Nächte", "night", "In der Nacht schlafe ich.", "At night I sleep."]
  ]);

  add("time/2", 1, [
    ["de107", "der Tag", "die Tage", "day", "Der Tag war schön.", "The day was nice."],
    ["de108", "die Woche", "die Wochen", "week", "Nächste Woche habe ich Urlaub.", "Next week I'm on holiday."],
    ["de109", "der Montag", "die Montage", "Monday", "Am Montag arbeite ich.", "On Monday I work."],
    ["de110", "der Dienstag", "die Dienstage", "Tuesday", "Der Kurs ist am Dienstag.", "The course is on Tuesday."],
    ["de111", "der Mittwoch", "die Mittwoche", "Wednesday", "Am Mittwoch gehe ich schwimmen.", "On Wednesday I go swimming."],
    ["de112", "der Donnerstag", "die Donnerstage", "Thursday", "Am Donnerstag kommt meine Mutter.", "My mother is coming on Thursday."],
    ["de113", "der Freitag", "die Freitage", "Friday", "Am Freitag gehen wir ins Kino.", "On Friday we're going to the cinema."],
    ["de114", "der Samstag", "die Samstage", "Saturday", "Am Samstag kaufe ich ein.", "On Saturday I go shopping."],
    ["de115", "der Sonntag", "die Sonntage", "Sunday", "Am Sonntag schlafe ich lange.", "On Sunday I sleep in."],
    ["de116", "das Wochenende", "die Wochenenden", "weekend", "Schönes Wochenende!", "Have a nice weekend!"]
  ]);

  add("time/3", 1, [
    ["de117", "der Monat", "die Monate", "month", "Ich bleibe einen Monat hier.", "I'm staying here for a month."],
    ["de118", "das Jahr", "die Jahre", "year", "Ich bin dreißig Jahre alt.", "I'm thirty years old."],
    ["de119", "der Frühling", "die Frühlinge", "spring", "Im Frühling blühen die Blumen.", "In spring the flowers bloom."],
    ["de120", "der Sommer", "die Sommer", "summer", "Im Sommer ist es warm.", "In summer it's warm."],
    ["de121", "der Herbst", "die Herbste", "autumn, fall", "Im Herbst regnet es oft.", "In autumn it often rains."],
    ["de122", "der Winter", "die Winter", "winter", "Im Winter schneit es.", "In winter it snows."]
  ]);

  add("time/4", 1, [
    ["de123", "gestern", "", "yesterday", "Gestern war ich krank.", "Yesterday I was ill."],
    ["de124", "heute", "", "today", "Heute ist Montag.", "Today is Monday."],
    ["de125", "morgen", "", "tomorrow", "Bis morgen!", "See you tomorrow!"],
    ["de126", "jetzt", "", "now", "Ich habe jetzt keine Zeit.", "I don't have time now."],
    ["de127", "dann", "", "then", "Erst essen wir, dann gehen wir.", "First we eat, then we go."],
    ["de128", "früh", "", "early", "Ich stehe früh auf.", "I get up early."],
    ["de129", "spät", "", "late", "Es ist schon spät.", "It's already late."]
  ]);

  add("food/0", 1, [
    ["de130", "essen", "", "to eat (isst)", "Wir essen um zwölf.", "We eat at twelve."],
    ["de131", "trinken", "", "to drink", "Was möchtest du trinken?", "What would you like to drink?"],
    ["de132", "der Hunger", "–", "hunger", "Ich habe Hunger.", "I'm hungry."],
    ["de133", "der Durst", "–", "thirst", "Hast du Durst?", "Are you thirsty?"],
    ["de134", "das Essen", "die Essen", "food; meal", "Das Essen ist fertig.", "The food is ready."],
    ["de135", "kochen", "", "to cook", "Heute koche ich Suppe.", "Today I'm cooking soup."],
    ["de136", "das Brot", "die Brote", "bread", "Ich kaufe ein Brot.", "I'm buying a loaf of bread."],
    ["de137", "der Käse", "die Käse", "cheese", "Ich mag Käse.", "I like cheese."],
    ["de138", "das Fleisch", "–", "meat", "Ich esse kein Fleisch.", "I don't eat meat."],
    ["de139", "der Fisch", "die Fische", "fish", "Heute gibt es Fisch.", "Today there's fish."],
    ["de140", "das Ei", "die Eier", "egg", "Ich esse ein Ei zum Frühstück.", "I eat an egg for breakfast."],
    ["de141", "das Gemüse", "die Gemüse", "vegetables", "Gemüse ist gesund.", "Vegetables are healthy."],
    ["de142", "lecker", "", "tasty, delicious", "Die Suppe ist lecker!", "The soup is delicious!"]
  ]);

  add("food/1", 1, [
    ["de143", "das Frühstück", "die Frühstücke", "breakfast", "Das Frühstück ist um sieben.", "Breakfast is at seven."],
    ["de144", "das Mittagessen", "die Mittagessen", "lunch", "Was gibt es zum Mittagessen?", "What's for lunch?"],
    ["de145", "das Abendessen", "die Abendessen", "dinner, supper", "Das Abendessen ist fertig.", "Dinner is ready."]
  ]);

  add("food/2", 1, [
    ["de146", "das Obst", "–", "fruit", "Ich esse viel Obst.", "I eat a lot of fruit."],
    ["de147", "der Apfel", "die Äpfel", "apple", "Der Apfel ist grün.", "The apple is green."],
    ["de148", "die Banane", "die Bananen", "banana", "Ich nehme zwei Bananen.", "I'll take two bananas."]
  ]);

  add("food/3", 1, [
    ["de149", "das Wasser", "–", "water", "Ein Glas Wasser, bitte.", "A glass of water, please."],
    ["de150", "der Kaffee", "die Kaffees", "coffee", "Ich trinke morgens Kaffee.", "I drink coffee in the morning."],
    ["de151", "der Tee", "die Tees", "tea", "Möchtest du Tee?", "Would you like tea?"],
    ["de152", "die Milch", "–", "milk", "Kaffee mit Milch, bitte.", "Coffee with milk, please."],
    ["de153", "der Saft", "die Säfte", "juice", "Der Saft ist kalt.", "The juice is cold."]
  ]);

  add("food/4", 1, [
    ["de154", "das Restaurant", "die Restaurants", "restaurant", "Das Restaurant ist heute geschlossen.", "The restaurant is closed today."],
    ["de155", "das Café", "die Cafés", "café", "Wir treffen uns im Café.", "We're meeting at the café."],
    ["de156", "die Speisekarte", "die Speisekarten", "menu", "Die Speisekarte, bitte.", "The menu, please."],
    ["de157", "bestellen", "", "to order", "Ich möchte bestellen.", "I'd like to order."],
    ["de158", "die Rechnung", "die Rechnungen", "bill, invoice", "Die Rechnung, bitte!", "The bill, please!"]
  ]);

  add("shopping/0", 1, [
    ["de159", "kaufen", "", "to buy", "Ich kaufe Brot.", "I'm buying bread."],
    ["de160", "verkaufen", "", "to sell", "Er verkauft sein Auto.", "He's selling his car."],
    ["de161", "einkaufen", "", "to go shopping (kauft ein)", "Wir kaufen am Samstag ein.", "We go shopping on Saturday."],
    ["de162", "der Supermarkt", "die Supermärkte", "supermarket", "Der Supermarkt ist um die Ecke.", "The supermarket is around the corner."],
    ["de163", "das Geschäft", "die Geschäfte", "shop; business", "Das Geschäft öffnet um neun.", "The shop opens at nine."],
    ["de164", "kosten", "", "to cost", "Was kostet das?", "How much does that cost?"],
    ["de165", "der Preis", "die Preise", "price", "Der Preis ist gut.", "The price is good."],
    ["de166", "teuer", "", "expensive", "Das Hotel ist zu teuer.", "The hotel is too expensive."],
    ["de167", "billig", "", "cheap", "Die Schuhe waren billig.", "The shoes were cheap."]
  ]);

  add("shopping/1", 1, [
    ["de168", "das Geld", "die Gelder", "money", "Ich habe kein Geld dabei.", "I have no money on me."],
    ["de169", "der Euro", "die Euros", "euro", "Das kostet zehn Euro.", "That costs ten euros."],
    ["de170", "bezahlen", "", "to pay", "Kann ich mit Karte bezahlen?", "Can I pay by card?"],
    ["de171", "die Karte", "die Karten", "card; ticket; map", "Hier ist meine Karte.", "Here is my card."]
  ]);

  add("day/0", 1, [
    ["de172", "aufstehen", "", "to get up (steht auf)", "Ich stehe um sieben auf.", "I get up at seven."],
    ["de173", "duschen", "", "to shower", "Ich dusche morgens.", "I shower in the morning."],
    ["de174", "schlafen", "", "to sleep (schläft)", "Das Baby schläft.", "The baby is sleeping."]
  ]);

  add("day/1", 1, [
    ["de175", "das Haus", "die Häuser", "house", "Das Haus ist alt.", "The house is old."],
    ["de176", "die Wohnung", "die Wohnungen", "flat, apartment", "Meine Wohnung hat drei Zimmer.", "My flat has three rooms."],
    ["de177", "zu Hause", "", "at home", "Heute bleibe ich zu Hause.", "Today I'm staying at home."],
    ["de178", "das Zimmer", "die Zimmer", "room", "Mein Zimmer ist klein.", "My room is small."],
    ["de179", "die Küche", "die Küchen", "kitchen", "Die Küche ist groß.", "The kitchen is big."],
    ["de180", "das Bad", "die Bäder", "bathroom; bath", "Das Bad ist neu.", "The bathroom is new."],
    ["de181", "die Toilette", "die Toiletten", "toilet", "Wo ist die Toilette?", "Where is the toilet?"],
    ["de182", "das Bett", "die Betten", "bed", "Das Bett ist bequem.", "The bed is comfortable."],
    ["de183", "der Tisch", "die Tische", "table", "Das Buch liegt auf dem Tisch.", "The book is on the table."],
    ["de184", "der Stuhl", "die Stühle", "chair", "Setz dich auf den Stuhl.", "Sit down on the chair."],
    ["de185", "die Tür", "die Türen", "door", "Die Tür ist offen.", "The door is open."],
    ["de186", "das Fenster", "die Fenster", "window", "Das Fenster ist zu.", "The window is closed."],
    ["de187", "öffnen", "", "to open", "Kannst du das Fenster öffnen?", "Can you open the window?"],
    ["de188", "schließen", "", "to close, to shut", "Bitte schließ die Tür.", "Please close the door."]
  ]);

  add("clothes/0", 1, [
    ["de189", "die Hose", "die Hosen", "trousers, pants", "Die Hose ist zu lang.", "The trousers are too long."],
    ["de190", "das Hemd", "die Hemden", "shirt", "Er trägt ein weißes Hemd.", "He's wearing a white shirt."],
    ["de191", "die Jacke", "die Jacken", "jacket", "Nimm eine Jacke mit!", "Take a jacket!"],
    ["de192", "das Kleid", "die Kleider", "dress", "Das Kleid ist schön.", "The dress is beautiful."],
    ["de193", "der Schuh", "die Schuhe", "shoe", "Meine Schuhe sind neu.", "My shoes are new."],
    ["de194", "die Tasche", "die Taschen", "bag; pocket", "Meine Tasche ist schwer.", "My bag is heavy."],
    ["de195", "tragen", "", "to wear; to carry (trägt)", "Sie trägt eine Brille.", "She wears glasses."]
  ]);

  add("clothes/1", 1, [
    ["de196", "das Handy", "die Handys", "mobile phone", "Mein Handy ist kaputt.", "My phone is broken."],
    ["de197", "anrufen", "", "to call, to phone (ruft an)", "Ich rufe dich morgen an.", "I'll call you tomorrow."],
    ["de198", "der Computer", "die Computer", "computer", "Der Computer ist neu.", "The computer is new."],
    ["de199", "das Internet", "–", "internet", "Gibt es hier Internet?", "Is there internet here?"],
    ["de200", "die E-Mail", "die E-Mails", "email", "Ich schreibe dir eine E-Mail.", "I'll write you an email."]
  ]);

  add("town/0", 1, [
    ["de201", "die Stadt", "die Städte", "town, city", "Berlin ist eine große Stadt.", "Berlin is a big city."],
    ["de202", "die Straße", "die Straßen", "street, road", "Ich wohne in dieser Straße.", "I live on this street."],
    ["de203", "das Kino", "die Kinos", "cinema", "Gehen wir heute ins Kino?", "Shall we go to the cinema today?"]
  ]);

  add("town/1", 1, [
    ["de204", "hier", "", "here", "Ich wohne hier.", "I live here."],
    ["de205", "da", "", "there; here (present)", "Ist Paul da?", "Is Paul there?"],
    ["de206", "dort", "", "there, over there", "Dort ist der Bahnhof.", "The station is over there."],
    ["de207", "links", "", "left, on the left", "Die Bank ist links.", "The bank is on the left."],
    ["de208", "rechts", "", "right, on the right", "Gehen Sie hier rechts.", "Turn right here."],
    ["de209", "geradeaus", "", "straight ahead", "Gehen Sie immer geradeaus.", "Keep going straight ahead."],
    ["de210", "oben", "", "up, upstairs, at the top", "Das Bad ist oben.", "The bathroom is upstairs."],
    ["de211", "unten", "", "down, downstairs, at the bottom", "Die Küche ist unten.", "The kitchen is downstairs."],
    ["de212", "vorne", "", "at the front", "Wir sitzen vorne.", "We're sitting at the front."],
    ["de213", "hinten", "", "at the back", "Der Ausgang ist hinten.", "The exit is at the back."],
    ["de214", "nah", "", "near, close", "Der Bahnhof ist ganz nah.", "The station is very close."],
    ["de215", "weit", "", "far", "Ist es weit?", "Is it far?"]
  ]);

  add("town/2", 1, [
    ["de216", "aus", "", "from, out of", "Ich komme aus Italien.", "I come from Italy."],
    ["de217", "von", "", "from; of; by", "Der Brief ist von meiner Oma.", "The letter is from my grandma."],
    ["de218", "nach", "", "to (cities, countries); after; past (the hour)", "Wir fahren nach Berlin.", "We're going to Berlin."],
    ["de219", "zu", "", "to (a person or place); too; closed", "Ich gehe zu meiner Freundin.", "I'm going to my friend's."],
    ["de220", "bis", "", "until; as far as", "Ich arbeite bis fünf.", "I work until five."]
  ]);

  add("travel/0", 1, [
    ["de221", "gehen", "", "to go, to walk", "Ich gehe nach Hause.", "I'm going home."],
    ["de222", "kommen", "", "to come", "Wann kommst du nach Hause?", "When are you coming home?"],
    ["de223", "fahren", "", "to go (by vehicle), to drive (fährt)", "Wir fahren mit dem Bus.", "We're going by bus."],
    ["de224", "fliegen", "", "to fly", "Wir fliegen nach Spanien.", "We're flying to Spain."],
    ["de225", "laufen", "", "to run; to walk (läuft)", "Das Kind läuft schnell.", "The child runs fast."],
    ["de226", "ankommen", "", "to arrive (kommt an)", "Der Zug kommt um acht an.", "The train arrives at eight."]
  ]);

  add("travel/1", 1, [
    ["de227", "das Auto", "die Autos", "car", "Mein Auto ist rot.", "My car is red."],
    ["de228", "der Bus", "die Busse", "bus", "Der Bus ist voll.", "The bus is full."],
    ["de229", "der Zug", "die Züge", "train", "Der Zug hat Verspätung.", "The train is late."],
    ["de230", "das Fahrrad", "die Fahrräder", "bicycle", "Ich fahre mit dem Fahrrad zur Arbeit.", "I cycle to work."],
    ["de231", "das Flugzeug", "die Flugzeuge", "plane", "Das Flugzeug ist pünktlich.", "The plane is on time."],
    ["de232", "der Bahnhof", "die Bahnhöfe", "railway station", "Wo ist der Bahnhof?", "Where is the station?"],
    ["de233", "die Haltestelle", "die Haltestellen", "stop (bus, tram)", "Die Haltestelle ist dort.", "The stop is over there."],
    ["de234", "die Fahrkarte", "die Fahrkarten", "ticket (bus, train)", "Eine Fahrkarte nach Bonn, bitte.", "A ticket to Bonn, please."]
  ]);

  add("travel/2", 1, [
    ["de235", "die Reise", "die Reisen", "trip, journey", "Gute Reise!", "Have a good trip!"],
    ["de236", "der Urlaub", "die Urlaube", "holiday, vacation", "Im August mache ich Urlaub.", "I'm going on holiday in August."],
    ["de237", "das Hotel", "die Hotels", "hotel", "Das Hotel ist am Bahnhof.", "The hotel is by the station."]
  ]);

  add("body/0", 1, [
    ["de238", "der Kopf", "die Köpfe", "head", "Mein Kopf tut weh.", "My head hurts."],
    ["de239", "das Auge", "die Augen", "eye", "Er hat blaue Augen.", "He has blue eyes."],
    ["de240", "das Ohr", "die Ohren", "ear", "Mein Ohr tut weh.", "My ear hurts."],
    ["de241", "die Nase", "die Nasen", "nose", "Das Baby hat eine kleine Nase.", "The baby has a small nose."],
    ["de242", "der Mund", "die Münder", "mouth", "Mach bitte den Mund auf.", "Please open your mouth."],
    ["de243", "der Arm", "die Arme", "arm", "Mein Arm ist gebrochen.", "My arm is broken."],
    ["de244", "die Hand", "die Hände", "hand", "Wasch dir die Hände!", "Wash your hands!"],
    ["de245", "das Bein", "die Beine", "leg", "Mein Bein tut weh.", "My leg hurts."],
    ["de246", "der Fuß", "die Füße", "foot", "Wir gehen zu Fuß.", "We're going on foot."]
  ]);

  add("body/1", 1, [
    ["de247", "krank", "", "ill, sick", "Ich bin heute krank.", "I'm ill today."],
    ["de248", "gesund", "", "healthy", "Obst ist gesund.", "Fruit is healthy."],
    ["de249", "wehtun", "", "to hurt (tut weh)", "Mein Bauch tut weh.", "My stomach hurts."],
    ["de250", "der Arzt", "die Ärzte", "doctor (man)", "Ich muss zum Arzt.", "I have to go to the doctor."],
    ["de251", "die Ärztin", "die Ärztinnen", "doctor (woman)", "Die Ärztin ist sehr nett.", "The doctor is very nice."],
    ["de252", "die Apotheke", "die Apotheken", "pharmacy, chemist's", "Die Apotheke ist neben der Bank.", "The pharmacy is next to the bank."],
    ["de253", "das Krankenhaus", "die Krankenhäuser", "hospital", "Er liegt im Krankenhaus.", "He's in hospital."]
  ]);

  add("nature/0", 1, [
    ["de254", "das Wetter", "–", "weather", "Wie ist das Wetter heute?", "What's the weather like today?"],
    ["de255", "die Sonne", "die Sonnen", "sun", "Die Sonne scheint.", "The sun is shining."],
    ["de256", "der Regen", "–", "rain", "Ich mag keinen Regen.", "I don't like rain."],
    ["de257", "regnen", "", "to rain", "Es regnet.", "It's raining."],
    ["de258", "der Schnee", "–", "snow", "Die Kinder spielen im Schnee.", "The children are playing in the snow."],
    ["de259", "warm", "", "warm", "Heute ist es warm.", "It's warm today."],
    ["de260", "heiß", "", "hot", "Im Juli ist es heiß.", "It's hot in July."],
    ["de261", "kalt", "", "cold", "Das Wasser ist kalt.", "The water is cold."]
  ]);

  add("nature/1", 1, [
    ["de262", "der Baum", "die Bäume", "tree", "Im Garten steht ein Baum.", "There's a tree in the garden."],
    ["de263", "die Blume", "die Blumen", "flower", "Die Blumen sind für dich.", "The flowers are for you."],
    ["de264", "der Wald", "die Wälder", "forest, woods", "Wir gehen im Wald spazieren.", "We go for a walk in the woods."],
    ["de265", "der Berg", "die Berge", "mountain", "Der Berg ist sehr hoch.", "The mountain is very high."],
    ["de266", "das Meer", "die Meere", "sea", "Im Sommer fahren wir ans Meer.", "In summer we go to the seaside."]
  ]);

  add("nature/2", 1, [
    ["de267", "das Tier", "die Tiere", "animal", "Magst du Tiere?", "Do you like animals?"],
    ["de268", "der Hund", "die Hunde", "dog", "Der Hund ist groß.", "The dog is big."],
    ["de269", "die Katze", "die Katzen", "cat", "Die Katze schläft auf dem Sofa.", "The cat is sleeping on the sofa."]
  ]);

  add("free/0", 1, [
    ["de270", "der Sport", "–", "sport, sports", "Ich mache gern Sport.", "I like doing sport."],
    ["de271", "spielen", "", "to play", "Die Kinder spielen im Garten.", "The children are playing in the garden."],
    ["de272", "der Fußball", "die Fußbälle", "football, soccer; football (ball)", "Er spielt Fußball.", "He plays football."],
    ["de273", "schwimmen", "", "to swim", "Ich schwimme gern.", "I like swimming."]
  ]);

  add("free/1", 1, [
    ["de274", "der Freund", "die Freunde", "friend (man); boyfriend", "Das ist mein Freund Max.", "This is my friend Max."],
    ["de275", "die Freundin", "die Freundinnen", "friend (woman); girlfriend", "Meine Freundin wohnt in Bremen.", "My friend lives in Bremen."],
    ["de276", "das Hobby", "die Hobbys", "hobby", "Mein Hobby ist Kochen.", "My hobby is cooking."],
    ["de277", "gern", "", "gladly; (with a verb) to like doing", "Ich lese gern.", "I like reading."],
    ["de278", "die Musik", "–", "music", "Ich höre gern Musik.", "I like listening to music."],
    ["de279", "der Film", "die Filme", "film, movie", "Der Film war toll.", "The film was great."],
    ["de280", "besuchen", "", "to visit", "Am Sonntag besuche ich meine Oma.", "On Sunday I'm visiting my grandma."]
  ]);

  add("school/0", 1, [
    ["de281", "die Schule", "die Schulen", "school", "Die Schule beginnt um acht.", "School starts at eight."],
    ["de282", "der Lehrer", "die Lehrer", "teacher (man)", "Unser Lehrer ist sehr nett.", "Our teacher is very nice."],
    ["de283", "die Lehrerin", "die Lehrerinnen", "teacher (woman)", "Die Lehrerin erklärt das Wort.", "The teacher explains the word."],
    ["de284", "der Schüler", "die Schüler", "pupil, student (school)", "Die Schüler machen eine Pause.", "The pupils are having a break."],
    ["de285", "der Kurs", "die Kurse", "course, class", "Der Kurs ist am Abend.", "The course is in the evening."],
    ["de286", "das Buch", "die Bücher", "book", "Das Buch ist interessant.", "The book is interesting."],
    ["de287", "der Stift", "die Stifte", "pen, pencil", "Hast du einen Stift?", "Do you have a pen?"]
  ]);

  add("school/1", 1, [
    ["de288", "lernen", "", "to learn, to study", "Ich lerne Deutsch.", "I'm learning German."],
    ["de289", "lesen", "", "to read (liest)", "Er liest die Zeitung.", "He's reading the newspaper."],
    ["de290", "schreiben", "", "to write", "Schreib deinen Namen hier.", "Write your name here."],
    ["de291", "das Wort", "die Wörter", "word", "Was bedeutet dieses Wort?", "What does this word mean?"],
    ["de292", "üben", "", "to practise", "Wir üben jeden Tag.", "We practise every day."]
  ]);

  add("school/2", 1, [
    ["de293", "arbeiten", "", "to work", "Ich arbeite in einem Büro.", "I work in an office."],
    ["de294", "die Arbeit", "die Arbeiten", "work; job", "Die Arbeit macht Spaß.", "The work is fun."],
    ["de295", "der Beruf", "die Berufe", "job, profession", "Was sind Sie von Beruf?", "What do you do for a living?"],
    ["de296", "das Büro", "die Büros", "office", "Das Büro ist im ersten Stock.", "The office is on the first floor."],
    ["de297", "der Chef", "die Chefs", "boss (man)", "Mein Chef ist im Urlaub.", "My boss is on holiday."],
    ["de298", "der Kollege", "die Kollegen", "colleague (man)", "Mein Kollege kommt aus Polen.", "My colleague is from Poland."]
  ]);

  add("verbs/0", 1, [
    ["de299", "sein", "", "to be (ist)", "Ich bin Student.", "I'm a student."],
    ["de300", "haben", "", "to have (hat)", "Ich habe eine Schwester.", "I have a sister."],
    ["de301", "es gibt", "", "there is, there are", "Es gibt hier ein Café.", "There's a café here."]
  ]);

  add("verbs/1", 1, [
    ["de302", "sehen", "", "to see (sieht)", "Ich sehe den Bus.", "I can see the bus."],
    ["de303", "hören", "", "to hear; to listen to", "Hörst du die Musik?", "Can you hear the music?"],
    ["de304", "sagen", "", "to say, to tell", "Was sagst du?", "What are you saying?"]
  ]);

  add("verbs/2", 1, [
    ["de305", "möchten", "", "would like", "Ich möchte einen Kaffee.", "I'd like a coffee."],
    ["de306", "wollen", "", "to want (will)", "Wir wollen ins Kino gehen.", "We want to go to the cinema."],
    ["de307", "mögen", "", "to like (mag)", "Ich mag Schokolade.", "I like chocolate."],
    ["de308", "können", "", "can, to be able to (kann)", "Kannst du schwimmen?", "Can you swim?"],
    ["de309", "müssen", "", "must, to have to (muss)", "Ich muss jetzt gehen.", "I have to go now."],
    ["de310", "dürfen", "", "may, to be allowed to (darf)", "Darf ich hier sitzen?", "May I sit here?"]
  ]);

  add("verbs/3", 1, [
    ["de311", "wissen", "", "to know (a fact) (weiß)", "Ich weiß es nicht.", "I don't know."],
    ["de312", "kennen", "", "to know (a person, a place)", "Kennst du Anna?", "Do you know Anna?"],
    ["de313", "denken", "", "to think", "Ich denke an dich.", "I'm thinking of you."],
    ["de314", "glauben", "", "to believe, to think", "Ich glaube, er kommt nicht.", "I don't think he's coming."],
    ["de315", "finden", "", "to find; to think (opinion)", "Wie findest du das Buch?", "What do you think of the book?"],
    ["de316", "verstehen", "", "to understand", "Ich verstehe das nicht.", "I don't understand that."]
  ]);

  add("verbs/4", 1, [
    ["de317", "machen", "", "to do, to make", "Was machst du heute?", "What are you doing today?"],
    ["de318", "nehmen", "", "to take (nimmt)", "Ich nehme den Fisch.", "I'll have the fish."],
    ["de319", "geben", "", "to give (gibt)", "Gib mir bitte das Buch.", "Please give me the book."],
    ["de320", "bringen", "", "to bring", "Der Kellner bringt den Kaffee.", "The waiter brings the coffee."],
    ["de321", "brauchen", "", "to need", "Ich brauche Hilfe.", "I need help."],
    ["de322", "suchen", "", "to look for", "Ich suche meine Brille.", "I'm looking for my glasses."],
    ["de323", "zeigen", "", "to show", "Zeig mir das Foto!", "Show me the photo!"],
    ["de324", "warten", "", "to wait", "Ich warte auf den Bus.", "I'm waiting for the bus."]
  ]);

  add("verbs/5", 1, [
    ["de325", "helfen", "", "to help (hilft)", "Kannst du mir helfen?", "Can you help me?"],
    ["de326", "zusammen", "", "together", "Wir lernen zusammen.", "We study together."]
  ]);

  add("describe/0", 1, [
    ["de327", "groß", "", "big, large; tall", "Das Haus ist groß.", "The house is big."],
    ["de328", "klein", "", "small, little; short (person)", "Die Wohnung ist klein.", "The flat is small."],
    ["de329", "viel", "", "much, a lot", "Ich habe viel Arbeit.", "I have a lot of work."],
    ["de330", "wenig", "", "little, not much", "Ich habe wenig Zeit.", "I have little time."],
    ["de331", "lang", "", "long", "Der Weg ist lang.", "The way is long."],
    ["de332", "kurz", "", "short", "Der Film ist kurz.", "The film is short."],
    ["de333", "schnell", "", "fast, quick", "Das Auto ist schnell.", "The car is fast."],
    ["de334", "langsam", "", "slow", "Bitte sprechen Sie langsam.", "Please speak slowly."],
    ["de335", "alt", "", "old", "Mein Auto ist alt.", "My car is old."],
    ["de336", "neu", "", "new", "Ist das Handy neu?", "Is the phone new?"],
    ["de337", "jung", "", "young", "Der Lehrer ist noch jung.", "The teacher is still young."],
    ["de338", "gut", "", "good; well", "Das Essen ist gut.", "The food is good."],
    ["de339", "schlecht", "", "bad", "Das Wetter ist schlecht.", "The weather is bad."],
    ["de340", "richtig", "", "right, correct", "Die Antwort ist richtig.", "The answer is right."],
    ["de341", "falsch", "", "wrong, false", "Das ist falsch.", "That's wrong."],
    ["de342", "leicht", "", "easy; light", "Die Übung ist leicht.", "The exercise is easy."],
    ["de343", "schwer", "", "difficult; heavy", "Deutsch ist nicht so schwer.", "German isn't that difficult."],
    ["de344", "schön", "", "beautiful, nice", "Das Wetter ist schön.", "The weather is nice."],
    ["de345", "einfach", "", "simple, easy", "Das ist ganz einfach.", "That's really simple."]
  ]);

  add("describe/1", 1, [
    ["de346", "die Farbe", "die Farben", "colour", "Welche Farbe magst du?", "Which colour do you like?"],
    ["de347", "rot", "", "red", "Die Tomate ist rot.", "The tomato is red."],
    ["de348", "blau", "", "blue", "Der Himmel ist blau.", "The sky is blue."],
    ["de349", "grün", "", "green", "Das Gras ist grün.", "The grass is green."],
    ["de350", "gelb", "", "yellow", "Die Banane ist gelb.", "The banana is yellow."],
    ["de351", "schwarz", "", "black", "Ich trinke den Kaffee schwarz.", "I drink my coffee black."],
    ["de352", "weiß", "", "white", "Der Schnee ist weiß.", "The snow is white."]
  ]);

  add("describe/2", 1, [
    ["de353", "traurig", "", "sad", "Warum bist du traurig?", "Why are you sad?"],
    ["de354", "müde", "", "tired", "Ich bin sehr müde.", "I'm very tired."],
    ["de355", "lieben", "", "to love", "Ich liebe dich.", "I love you."]
  ]);

  add("describe/3", 1, [
    ["de356", "nett", "", "nice, kind", "Deine Schwester ist nett.", "Your sister is nice."],
    ["de357", "toll", "", "great, brilliant", "Das ist eine tolle Idee!", "That's a great idea!"]
  ]);

  add("describe/4", 1, [
    ["de358", "das Problem", "die Probleme", "problem", "Kein Problem!", "No problem!"],
    ["de359", "die Idee", "die Ideen", "idea", "Gute Idee!", "Good idea!"],
    ["de360", "interessant", "", "interesting", "Der Film ist interessant.", "The film is interesting."],
    ["de361", "wichtig", "", "important", "Das ist sehr wichtig.", "That's very important."]
  ]);

  add("questions/0", 1, [
    ["de362", "was", "", "what", "Was ist das?", "What is that?"],
    ["de363", "wer", "", "who", "Wer ist das?", "Who is that?"],
    ["de364", "wie", "", "how", "Wie heißt du?", "What's your name?"],
    ["de365", "wo", "", "where", "Wo wohnst du?", "Where do you live?"],
    ["de366", "woher", "", "where from", "Woher kommst du?", "Where are you from?"],
    ["de367", "wohin", "", "where to", "Wohin fährst du?", "Where are you going?"],
    ["de368", "wann", "", "when", "Wann kommst du?", "When are you coming?"],
    ["de369", "warum", "", "why", "Warum lernst du Deutsch?", "Why are you learning German?"],
    ["de370", "wie viel", "", "how much, how many", "Wie viel kostet das?", "How much is that?"],
    ["de371", "welcher", "", "which", "Welcher Bus fährt zum Bahnhof?", "Which bus goes to the station?"]
  ]);

  add("questions/1", 1, [
    ["de372", "fragen", "", "to ask", "Darf ich etwas fragen?", "May I ask something?"],
    ["de373", "die Frage", "die Fragen", "question", "Ich habe eine Frage.", "I have a question."],
    ["de374", "antworten", "", "to answer", "Bitte antworte mir schnell.", "Please answer me quickly."],
    ["de375", "die Antwort", "die Antworten", "answer", "Danke für deine Antwort.", "Thanks for your answer."]
  ]);

  add("grammar/0", 1, [
    ["de376", "nicht", "", "not", "Ich komme nicht.", "I'm not coming."],
    ["de377", "kein", "", "no, not a, not any", "Ich habe kein Auto.", "I don't have a car."],
    ["de378", "sehr", "", "very", "Das ist sehr gut.", "That's very good."],
    ["de379", "mehr", "", "more", "Möchtest du mehr Kaffee?", "Would you like more coffee?"],
    ["de380", "nur", "", "only, just", "Ich habe nur zehn Euro.", "I only have ten euros."],
    ["de381", "ein bisschen", "", "a little, a bit", "Ich spreche ein bisschen Deutsch.", "I speak a little German."]
  ]);

  add("grammar/1", 1, [
    ["de382", "und", "", "and", "Ich trinke Kaffee und Tee.", "I drink coffee and tea."],
    ["de383", "oder", "", "or", "Tee oder Kaffee?", "Tea or coffee?"],
    ["de384", "aber", "", "but", "Ich bin müde, aber glücklich.", "I'm tired but happy."],
    ["de385", "auch", "", "also, too", "Ich komme auch.", "I'm coming too."],
    ["de386", "weil", "", "because (verb goes to the end)", "Ich lerne Deutsch, weil ich in Berlin wohne.", "I'm learning German because I live in Berlin."]
  ]);

  add("grammar/2", 1, [
    ["de387", "immer", "", "always", "Er ist immer pünktlich.", "He's always on time."],
    ["de388", "oft", "", "often", "Ich gehe oft schwimmen.", "I often go swimming."],
    ["de389", "manchmal", "", "sometimes", "Manchmal koche ich.", "Sometimes I cook."],
    ["de390", "nie", "", "never", "Ich trinke nie Kaffee.", "I never drink coffee."],
    ["de391", "schon", "", "already", "Bist du schon fertig?", "Are you finished already?"],
    ["de392", "noch", "", "still; yet; more", "Ich bin noch müde.", "I'm still tired."],
    ["de393", "wieder", "", "again", "Komm bald wieder!", "Come again soon!"]
  ]);

  add("grammar/3", 1, [
    ["de394", "der", "", "the (masculine)", "Der Tisch ist neu.", "The table is new."],
    ["de395", "die", "", "the (feminine; all plurals)", "Die Lampe ist neu.", "The lamp is new."],
    ["de396", "das", "", "the (neuter); that, this", "Das Haus ist neu.", "The house is new."],
    ["de397", "ein", "", "a, an (masculine, neuter)", "Ich habe ein Fahrrad.", "I have a bike."],
    ["de398", "eine", "", "a, an (feminine)", "Sie hat eine Katze.", "She has a cat."],
    ["de399", "mein", "", "my", "Das ist mein Bruder.", "This is my brother."],
    ["de400", "dein", "", "your (informal)", "Ist das dein Handy?", "Is that your phone?"],
    ["de401", "mich", "", "me (accusative)", "Kannst du mich hören?", "Can you hear me?"],
    ["de402", "dich", "", "you (accusative, informal)", "Ich liebe dich.", "I love you."],
    ["de403", "mir", "", "(to) me (dative)", "Gib mir das Salz.", "Give me the salt."],
    ["de404", "dir", "", "(to) you (dative, informal)", "Wie geht es dir?", "How are you?"],
    ["de405", "in", "", "in, into", "Ich wohne in Berlin.", "I live in Berlin."],
    ["de406", "an", "", "at, on (a vertical surface)", "Das Bild hängt an der Wand.", "The picture hangs on the wall."],
    ["de407", "auf", "", "on (top of)", "Die Tasse steht auf dem Tisch.", "The cup is on the table."],
    ["de408", "mit", "", "with; by (transport)", "Ich fahre mit dem Bus.", "I go by bus."],
    ["de409", "ohne", "", "without", "Kaffee ohne Milch, bitte.", "Coffee without milk, please."],
    ["de410", "für", "", "for", "Das Geschenk ist für dich.", "The present is for you."],
    ["de411", "um", "", "at (clock time); around", "Der Kurs beginnt um neun.", "The course starts at nine."]
  ]);

  /* ───────────── A2 ───────────── */

  add("hello/0", 2, [
    ["de412", "vielen Dank", "", "thank you very much", "Vielen Dank für Ihre Hilfe!", "Thank you very much for your help!"],
    ["de413", "gern geschehen", "", "you're welcome", "Danke! – Gern geschehen.", "Thank you! – You're welcome."],
    ["de414", "es tut mir leid", "", "I'm sorry", "Es tut mir leid, ich komme zu spät.", "I'm sorry, I'm late."],
    ["de415", "herzlichen Glückwunsch", "", "congratulations", "Herzlichen Glückwunsch zum Geburtstag!", "Happy birthday!"]
  ]);

  add("people/0", 2, [
    ["de416", "man", "", "one, you, people (in general)", "Hier darf man nicht rauchen.", "You're not allowed to smoke here."]
  ]);

  add("people/1", 2, [
    ["de417", "alles", "", "everything", "Alles ist gut.", "Everything is fine."],
    ["de418", "jemand", "", "somebody, someone", "Jemand hat angerufen.", "Somebody called."],
    ["de419", "niemand", "", "nobody, no one", "Niemand ist zu Hause.", "Nobody is at home."],
    ["de420", "beide", "", "both", "Beide Kinder gehen zur Schule.", "Both children go to school."],
    ["de421", "andere", "", "other, different", "Ich möchte eine andere Farbe.", "I'd like a different colour."]
  ]);

  add("people/2", 2, [
    ["de422", "der Mensch", "die Menschen", "person, human being", "Er ist ein guter Mensch.", "He is a good person."],
    ["de423", "die Telefonnummer", "die Telefonnummern", "phone number", "Hast du meine Telefonnummer?", "Do you have my phone number?"],
    ["de424", "der Nachname", "die Nachnamen", "surname, last name", "Wie ist Ihr Nachname?", "What's your surname?"],
    ["de425", "buchstabieren", "", "to spell", "Können Sie das bitte buchstabieren?", "Could you spell that, please?"],
    ["de426", "sich vorstellen", "", "to introduce oneself (stellt sich vor)", "Darf ich mich vorstellen?", "May I introduce myself?"],
    ["de427", "kennenlernen", "", "to get to know, to meet (lernt kennen)", "Ich möchte deine Familie kennenlernen.", "I'd like to meet your family."]
  ]);

  add("family/1", 2, [
    ["de428", "das Baby", "die Babys", "baby", "Das Baby schläft.", "The baby is sleeping."],
    ["de429", "verheiratet", "", "married", "Bist du verheiratet?", "Are you married?"],
    ["de430", "die Großmutter", "die Großmütter", "grandmother", "Meine Großmutter backt gern.", "My grandmother likes baking."],
    ["de431", "der Großvater", "die Großväter", "grandfather", "Mein Großvater war Lehrer.", "My grandfather was a teacher."],
    ["de432", "der Onkel", "die Onkel", "uncle", "Mein Onkel hat ein Restaurant.", "My uncle has a restaurant."],
    ["de433", "die Tante", "die Tanten", "aunt", "Meine Tante wohnt in Zürich.", "My aunt lives in Zurich."],
    ["de434", "der Ehemann", "die Ehemänner", "husband", "Ihr Ehemann arbeitet bei der Bank.", "Her husband works at the bank."],
    ["de435", "die Ehefrau", "die Ehefrauen", "wife", "Das ist meine Ehefrau Sara.", "This is my wife Sara."],
    ["de436", "heiraten", "", "to marry, to get married", "Wir heiraten im Sommer.", "We're getting married in summer."],
    ["de437", "die Hochzeit", "die Hochzeiten", "wedding", "Die Hochzeit war wunderschön.", "The wedding was beautiful."]
  ]);

  add("family/2", 2, [
    ["de438", "geboren", "", "born", "Ich bin 1998 geboren.", "I was born in 1998."],
    ["de439", "leben", "", "to live, to be alive", "Meine Großeltern leben noch.", "My grandparents are still alive."]
  ]);

  add("countries/0", 2, [
    ["de440", "Europa", "–", "Europe", "Deutschland liegt in Europa.", "Germany is in Europe."],
    ["de441", "Frankreich", "–", "France", "Paris ist die Hauptstadt von Frankreich.", "Paris is the capital of France."],
    ["de442", "Italien", "–", "Italy", "Im Urlaub fahren wir nach Italien.", "We're going to Italy on holiday."],
    ["de443", "Spanien", "–", "Spain", "Sie kommt aus Spanien.", "She's from Spain."],
    ["de444", "die Türkei", "–", "Turkey", "Meine Eltern kommen aus der Türkei.", "My parents are from Turkey."],
    ["de445", "die Hauptstadt", "die Hauptstädte", "capital (city)", "Berlin ist die Hauptstadt von Deutschland.", "Berlin is the capital of Germany."],
    ["de446", "das Ausland", "–", "abroad, foreign countries", "Sie arbeitet im Ausland.", "She works abroad."]
  ]);

  add("countries/1", 2, [
    ["de447", "der Norden", "–", "north", "Hamburg liegt im Norden.", "Hamburg is in the north."],
    ["de448", "der Süden", "–", "south", "München liegt im Süden.", "Munich is in the south."],
    ["de449", "der Osten", "–", "east", "Dresden liegt im Osten.", "Dresden is in the east."],
    ["de450", "der Westen", "–", "west", "Köln liegt im Westen.", "Cologne is in the west."]
  ]);

  add("countries/2", 2, [
    ["de451", "die Muttersprache", "die Muttersprachen", "mother tongue, first language", "Meine Muttersprache ist Englisch.", "My first language is English."],
    ["de452", "übersetzen", "", "to translate", "Kannst du den Brief übersetzen?", "Can you translate the letter?"]
  ]);

  add("numbers/1", 2, [
    ["de453", "die Million", "die Millionen", "million", "Berlin hat fast vier Millionen Einwohner.", "Berlin has almost four million inhabitants."]
  ]);

  add("numbers/2", 2, [
    ["de454", "die Nummer", "die Nummern", "number (phone, room, house)", "Welche Nummer hat dein Zimmer?", "What number is your room?"],
    ["de455", "zählen", "", "to count", "Das Kind kann bis zehn zählen.", "The child can count to ten."],
    ["de456", "zweite", "", "second", "Das ist mein zweiter Kaffee.", "This is my second coffee."],
    ["de457", "dritte", "", "third", "Wir wohnen im dritten Stock.", "We live on the third floor."],
    ["de458", "letzte", "", "last", "Das ist der letzte Bus.", "This is the last bus."],
    ["de459", "die Hälfte", "die Hälften", "half", "Die Hälfte ist für dich.", "Half is for you."],
    ["de460", "ein paar", "", "a few, a couple of", "Ich bleibe ein paar Tage.", "I'm staying a few days."]
  ]);

  add("numbers/3", 2, [
    ["de461", "die Packung", "die Packungen", "packet, pack", "Ich kaufe eine Packung Nudeln.", "I'm buying a packet of pasta."]
  ]);

  add("numbers/4", 2, [
    ["de462", "der Liter", "die Liter", "litre", "Ich trinke zwei Liter Wasser am Tag.", "I drink two litres of water a day."],
    ["de463", "der Meter", "die Meter", "metre", "Der Tisch ist zwei Meter lang.", "The table is two metres long."],
    ["de464", "der Kilometer", "die Kilometer", "kilometre", "Bis zum Bahnhof sind es zwei Kilometer.", "It's two kilometres to the station."]
  ]);

  add("time/0", 2, [
    ["de465", "pünktlich", "", "on time, punctual", "Der Zug ist pünktlich.", "The train is on time."],
    ["de466", "dauern", "", "to last, to take (time)", "Wie lange dauert der Kurs?", "How long does the course last?"]
  ]);

  add("time/1", 2, [
    ["de467", "der Nachmittag", "die Nachmittage", "afternoon", "Am Nachmittag gehe ich spazieren.", "In the afternoon I go for a walk."],
    ["de468", "mittags", "", "at midday", "Mittags esse ich nur einen Salat.", "At midday I only eat a salad."],
    ["de469", "nachmittags", "", "in the afternoon(s)", "Nachmittags habe ich frei.", "I'm free in the afternoons."]
  ]);

  add("time/3", 2, [
    ["de470", "der Januar", "die Januare", "January", "Im Januar ist es kalt.", "It's cold in January."],
    ["de471", "der Februar", "die Februare", "February", "Der Februar ist kurz.", "February is short."],
    ["de472", "der März", "die Märze", "March", "Im März beginnt der Frühling.", "Spring begins in March."],
    ["de473", "der April", "die Aprile", "April", "Im April regnet es oft.", "It often rains in April."],
    ["de474", "der Mai", "die Maie", "May", "Mein Geburtstag ist im Mai.", "My birthday is in May."],
    ["de475", "der Juni", "die Junis", "June", "Im Juni sind die Tage lang.", "In June the days are long."],
    ["de476", "der Juli", "die Julis", "July", "Im Juli haben die Kinder Ferien.", "The children are on holiday in July."],
    ["de477", "der August", "die Auguste", "August", "Im August fahren wir ans Meer.", "In August we go to the seaside."],
    ["de478", "der September", "die September", "September", "Im September beginnt die Schule.", "School starts in September."],
    ["de479", "der Oktober", "die Oktober", "October", "Im Oktober werden die Blätter bunt.", "In October the leaves turn colourful."],
    ["de480", "der November", "die November", "November", "Der November ist oft grau.", "November is often grey."],
    ["de481", "der Dezember", "die Dezember", "December", "Im Dezember ist Weihnachten.", "Christmas is in December."],
    ["de482", "die Ferien", "–", "(school) holidays (plural only)", "In den Ferien fahren wir weg.", "We're going away in the holidays."],
    ["de483", "Weihnachten", "–", "Christmas", "Frohe Weihnachten!", "Merry Christmas!"]
  ]);

  add("time/4", 2, [
    ["de484", "bald", "", "soon", "Der Bus kommt bald.", "The bus is coming soon."],
    ["de485", "vorgestern", "", "the day before yesterday", "Vorgestern war ich beim Arzt.", "The day before yesterday I was at the doctor's."],
    ["de486", "übermorgen", "", "the day after tomorrow", "Übermorgen fahren wir in den Urlaub.", "The day after tomorrow we go on holiday."],
    ["de487", "gerade", "", "just, right now", "Ich esse gerade.", "I'm eating right now."],
    ["de488", "sofort", "", "immediately, right away", "Komm bitte sofort!", "Please come right away!"],
    ["de489", "früher", "", "earlier; in the past, used to", "Früher habe ich in Wien gewohnt.", "I used to live in Vienna."],
    ["de490", "vorher", "", "before, beforehand", "Ruf mich vorher an.", "Call me beforehand."],
    ["de491", "danach", "", "afterwards, after that", "Wir essen und danach gehen wir spazieren.", "We eat and afterwards we go for a walk."],
    ["de492", "später", "", "later", "Bis später!", "See you later!"]
  ]);

  add("food/0", 2, [
    ["de493", "das Brötchen", "die Brötchen", "bread roll", "Zum Frühstück esse ich zwei Brötchen.", "For breakfast I eat two rolls."],
    ["de494", "die Butter", "–", "butter", "Das Brot mit Butter, bitte.", "The bread with butter, please."],
    ["de495", "der Reis", "–", "rice", "Wir essen Reis mit Gemüse.", "We're eating rice with vegetables."],
    ["de496", "die Kartoffel", "die Kartoffeln", "potato", "Die Kartoffeln sind heiß.", "The potatoes are hot."],
    ["de497", "die Tomate", "die Tomaten", "tomato", "Die Tomaten sind rot.", "The tomatoes are red."],
    ["de498", "der Kuchen", "die Kuchen", "cake", "Der Kuchen ist sehr gut.", "The cake is very good."],
    ["de499", "der Zucker", "–", "sugar", "Kaffee ohne Zucker, bitte.", "Coffee without sugar, please."],
    ["de500", "das Salz", "die Salze", "salt", "Gibst du mir das Salz?", "Can you pass me the salt?"],
    ["de501", "der Salat", "die Salate", "salad; lettuce", "Ich nehme einen Salat.", "I'll have a salad."],
    ["de502", "die Suppe", "die Suppen", "soup", "Die Suppe ist zu heiß.", "The soup is too hot."],
    ["de503", "die Schokolade", "die Schokoladen", "chocolate", "Die Schokolade ist aus der Schweiz.", "The chocolate is from Switzerland."],
    ["de504", "das Eis", "–", "ice cream; ice", "Im Sommer essen wir viel Eis.", "In summer we eat a lot of ice cream."],
    ["de505", "süß", "", "sweet", "Der Kuchen ist sehr süß.", "The cake is very sweet."],
    ["de506", "satt", "", "full (after eating)", "Danke, ich bin satt.", "Thanks, I'm full."],
    ["de507", "schmecken", "", "to taste (good)", "Schmeckt es dir?", "Do you like it? (the food)"],
    ["de508", "probieren", "", "to try, to taste", "Möchtest du mal probieren?", "Would you like to try some?"]
  ]);

  add("food/1", 2, [
    ["de509", "frühstücken", "", "to have breakfast", "Wir frühstücken zusammen.", "We have breakfast together."],
    ["de510", "guten Appetit", "", "enjoy your meal", "Das Essen ist fertig. Guten Appetit!", "Dinner is ready. Enjoy your meal!"]
  ]);

  add("food/2", 2, [
    ["de511", "die Orange", "die Orangen", "orange", "Die Orangen kommen aus Spanien.", "The oranges come from Spain."],
    ["de512", "die Erdbeere", "die Erdbeeren", "strawberry", "Im Juni gibt es frische Erdbeeren.", "In June there are fresh strawberries."],
    ["de513", "die Zitrone", "die Zitronen", "lemon", "Tee mit Zitrone, bitte.", "Tea with lemon, please."]
  ]);

  add("food/3", 2, [
    ["de514", "das Bier", "die Biere", "beer", "Zwei Bier, bitte.", "Two beers, please."],
    ["de515", "der Wein", "die Weine", "wine", "Möchtest du ein Glas Wein?", "Would you like a glass of wine?"]
  ]);

  add("food/4", 2, [
    ["de516", "der Kellner", "die Kellner", "waiter", "Der Kellner bringt das Essen.", "The waiter brings the food."],
    ["de517", "reservieren", "", "to reserve, to book", "Ich möchte einen Tisch reservieren.", "I'd like to book a table."],
    ["de518", "der Nachtisch", "die Nachtische", "dessert", "Was gibt es zum Nachtisch?", "What's for dessert?"],
    ["de519", "das Trinkgeld", "die Trinkgelder", "tip (money)", "Wir geben zehn Prozent Trinkgeld.", "We give a ten percent tip."],
    ["de520", "getrennt", "", "separately", "Zusammen oder getrennt?", "Together or separately?"],
    ["de521", "der Teller", "die Teller", "plate", "Der Teller ist leer.", "The plate is empty."]
  ]);

  add("shopping/0", 2, [
    ["de522", "der Laden", "die Läden", "shop, store", "Der Laden macht um acht zu.", "The shop closes at eight."],
    ["de523", "die Kasse", "die Kassen", "till, checkout", "Bitte zahlen Sie an der Kasse.", "Please pay at the checkout."],
    ["de524", "der Kunde", "die Kunden", "customer (man)", "Der Kunde möchte bezahlen.", "The customer wants to pay."],
    ["de525", "günstig", "", "good value, inexpensive", "Das Hotel ist günstig.", "The hotel is good value."],
    ["de526", "umtauschen", "", "to exchange (tauscht um)", "Kann ich die Hose umtauschen?", "Can I exchange the trousers?"],
    ["de527", "geöffnet", "", "open (shop)", "Die Apotheke ist bis 20 Uhr geöffnet.", "The pharmacy is open until 8 p.m."],
    ["de528", "geschlossen", "", "closed", "Sonntags ist der Laden geschlossen.", "The shop is closed on Sundays."]
  ]);

  add("shopping/1", 2, [
    ["de529", "die Bank", "die Banken", "bank", "Ich muss zur Bank.", "I have to go to the bank."],
    ["de530", "die Kreditkarte", "die Kreditkarten", "credit card", "Nehmen Sie Kreditkarten?", "Do you take credit cards?"],
    ["de531", "ausgeben", "", "to spend (gibt aus)", "Wir geben zu viel Geld aus.", "We spend too much money."]
  ]);

  add("day/0", 2, [
    ["de532", "fernsehen", "", "to watch TV (sieht fern)", "Am Abend sehen wir fern.", "In the evening we watch TV."],
    ["de533", "aufwachen", "", "to wake up (wacht auf)", "Ich wache jeden Tag um sechs auf.", "I wake up at six every day."],
    ["de534", "sich waschen", "", "to wash (oneself) (wäscht sich)", "Das Kind wäscht sich die Hände.", "The child is washing his hands."],
    ["de535", "putzen", "", "to clean; to brush (teeth)", "Ich putze mir die Zähne.", "I'm brushing my teeth."]
  ]);

  add("day/1", 2, [
    ["de536", "der Schlüssel", "die Schlüssel", "key", "Wo ist mein Schlüssel?", "Where is my key?"],
    ["de537", "das Wohnzimmer", "die Wohnzimmer", "living room", "Wir sitzen im Wohnzimmer.", "We're sitting in the living room."],
    ["de538", "das Schlafzimmer", "die Schlafzimmer", "bedroom", "Das Schlafzimmer ist ruhig.", "The bedroom is quiet."],
    ["de539", "der Garten", "die Gärten", "garden", "Die Kinder spielen im Garten.", "The children are playing in the garden."],
    ["de540", "der Stock", "die Stock", "floor, storey", "Ich wohne im zweiten Stock.", "I live on the second floor."],
    ["de541", "der Schrank", "die Schränke", "cupboard, wardrobe", "Die Teller sind im Schrank.", "The plates are in the cupboard."],
    ["de542", "der Kühlschrank", "die Kühlschränke", "fridge", "Die Milch ist im Kühlschrank.", "The milk is in the fridge."],
    ["de543", "die Miete", "die Mieten", "rent", "Die Miete ist sehr hoch.", "The rent is very high."],
    ["de544", "mieten", "", "to rent", "Wir mieten eine Wohnung.", "We're renting a flat."],
    ["de545", "umziehen", "", "to move (house) (zieht um)", "Im Mai ziehen wir um.", "We're moving in May."]
  ]);

  add("clothes/0", 2, [
    ["de546", "die Kleidung", "–", "clothes, clothing", "Ich brauche neue Kleidung.", "I need new clothes."],
    ["de547", "der Mantel", "die Mäntel", "coat", "Im Winter trage ich einen Mantel.", "In winter I wear a coat."],
    ["de548", "die Brille", "die Brillen", "glasses", "Ich brauche eine neue Brille.", "I need new glasses."],
    ["de549", "die Größe", "die Größen", "size; height", "Welche Größe haben Sie?", "What size are you?"],
    ["de550", "anziehen", "", "to put on (clothes) (zieht an)", "Ich ziehe die Jacke an.", "I'm putting on my jacket."],
    ["de551", "ausziehen", "", "to take off (clothes) (zieht aus)", "Bitte ziehen Sie die Schuhe aus.", "Please take off your shoes."],
    ["de552", "anprobieren", "", "to try on (probiert an)", "Kann ich das Kleid anprobieren?", "Can I try on the dress?"],
    ["de553", "passen", "", "to fit; to suit", "Die Schuhe passen nicht.", "The shoes don't fit."]
  ]);

  add("clothes/1", 2, [
    ["de554", "das Telefon", "die Telefone", "telephone", "Das Telefon klingelt.", "The phone is ringing."],
    ["de555", "das Foto", "die Fotos", "photo", "Das Foto ist schön.", "The photo is nice."],
    ["de556", "der Laptop", "die Laptops", "laptop", "Ich arbeite am Laptop.", "I work on my laptop."],
    ["de557", "die Nachricht", "die Nachrichten", "message; (plural) the news", "Ich schicke dir eine Nachricht.", "I'll send you a message."],
    ["de558", "schicken", "", "to send", "Schick mir die Adresse!", "Send me the address!"],
    ["de559", "online", "", "online", "Ich kaufe oft online ein.", "I often shop online."],
    ["de560", "die Zeitung", "die Zeitungen", "newspaper", "Mein Vater liest jeden Morgen die Zeitung.", "My father reads the paper every morning."]
  ]);

  add("town/0", 2, [
    ["de561", "der Platz", "die Plätze", "square; place, seat", "Ist der Platz frei?", "Is this seat free?"],
    ["de562", "der Park", "die Parks", "park", "Wir gehen in den Park.", "We're going to the park."],
    ["de563", "der Markt", "die Märkte", "market", "Am Samstag ist Markt.", "There's a market on Saturday."],
    ["de564", "das Dorf", "die Dörfer", "village", "Meine Oma wohnt in einem kleinen Dorf.", "My grandma lives in a small village."],
    ["de565", "das Museum", "die Museen", "museum", "Das Museum ist montags geschlossen.", "The museum is closed on Mondays."],
    ["de566", "die Kirche", "die Kirchen", "church", "Die Kirche ist sehr alt.", "The church is very old."],
    ["de567", "die Post", "–", "post office; post, mail", "Ich bringe den Brief zur Post.", "I'm taking the letter to the post office."],
    ["de568", "die Polizei", "–", "police", "Ruf die Polizei!", "Call the police!"],
    ["de569", "die Ecke", "die Ecken", "corner", "Die Bäckerei ist an der Ecke.", "The bakery is on the corner."],
    ["de570", "der Weg", "die Wege", "way, path", "Kennst du den Weg?", "Do you know the way?"]
  ]);

  add("town/1", 2, [
    ["de571", "neben", "", "next to, beside", "Die Post ist neben der Bank.", "The post office is next to the bank."],
    ["de572", "zwischen", "", "between", "Das Café ist zwischen Kino und Museum.", "The café is between the cinema and the museum."],
    ["de573", "hinter", "", "behind", "Der Garten ist hinter dem Haus.", "The garden is behind the house."],
    ["de574", "über", "", "over, above; about", "Die Lampe hängt über dem Tisch.", "The lamp hangs over the table."],
    ["de575", "unter", "", "under, below", "Die Katze liegt unter dem Bett.", "The cat is lying under the bed."],
    ["de576", "gegenüber", "", "opposite", "Die Apotheke ist gegenüber.", "The pharmacy is opposite."],
    ["de577", "die Nähe", "–", "vicinity, nearness", "Gibt es hier in der Nähe ein Café?", "Is there a café near here?"],
    ["de578", "draußen", "", "outside", "Die Kinder spielen draußen.", "The children are playing outside."]
  ]);

  add("town/2", 2, [
    ["de579", "die Richtung", "die Richtungen", "direction", "In welche Richtung muss ich gehen?", "Which direction do I have to go?"],
    ["de580", "durch", "", "through", "Wir gehen durch den Park.", "We walk through the park."]
  ]);

  add("travel/0", 2, [
    ["de581", "abfahren", "", "to depart, to leave (fährt ab)", "Wann fährt der Bus ab?", "When does the bus leave?"],
    ["de582", "einsteigen", "", "to get on, to get in (steigt ein)", "Bitte schnell einsteigen!", "Please get on quickly!"],
    ["de583", "aussteigen", "", "to get off, to get out (steigt aus)", "Wir steigen an der nächsten Haltestelle aus.", "We get off at the next stop."],
    ["de584", "umsteigen", "", "to change (trains, buses) (steigt um)", "In Frankfurt müssen Sie umsteigen.", "You have to change in Frankfurt."],
    ["de585", "abholen", "", "to pick up, to collect (holt ab)", "Ich hole dich am Bahnhof ab.", "I'll pick you up at the station."],
    ["de586", "spazieren gehen", "", "to go for a walk", "Nach dem Essen gehen wir spazieren.", "After the meal we go for a walk."]
  ]);

  add("travel/1", 2, [
    ["de587", "die U-Bahn", "die U-Bahnen", "underground, subway", "Ich fahre mit der U-Bahn.", "I take the underground."],
    ["de588", "das Taxi", "die Taxis", "taxi", "Wir nehmen ein Taxi.", "We'll take a taxi."],
    ["de589", "der Flughafen", "die Flughäfen", "airport", "Wie komme ich zum Flughafen?", "How do I get to the airport?"],
    ["de590", "die Straßenbahn", "die Straßenbahnen", "tram", "Nimm die Straßenbahn Linie 4.", "Take tram number 4."],
    ["de591", "das Ticket", "die Tickets", "ticket", "Ich habe die Tickets online gekauft.", "I bought the tickets online."],
    ["de592", "die Verspätung", "die Verspätungen", "delay", "Der Zug hat zehn Minuten Verspätung.", "The train is ten minutes late."],
    ["de593", "der Stau", "die Staus", "traffic jam", "Wir stehen im Stau.", "We're stuck in a traffic jam."],
    ["de594", "parken", "", "to park", "Hier darf man nicht parken.", "You can't park here."]
  ]);

  add("travel/2", 2, [
    ["de595", "reisen", "", "to travel", "Ich reise gern.", "I like travelling."],
    ["de596", "der Koffer", "die Koffer", "suitcase", "Mein Koffer ist schwer.", "My suitcase is heavy."],
    ["de597", "der Pass", "die Pässe", "passport", "Hast du deinen Pass?", "Do you have your passport?"],
    ["de598", "das Gepäck", "–", "luggage", "Wo kann ich mein Gepäck lassen?", "Where can I leave my luggage?"],
    ["de599", "buchen", "", "to book", "Ich habe ein Zimmer gebucht.", "I've booked a room."],
    ["de600", "packen", "", "to pack", "Hast du schon den Koffer gepackt?", "Have you packed your suitcase yet?"],
    ["de601", "der Ausflug", "die Ausflüge", "trip, outing", "Am Sonntag machen wir einen Ausflug.", "On Sunday we're going on a trip."],
    ["de602", "der Ausweis", "die Ausweise", "ID card", "Bitte zeigen Sie Ihren Ausweis.", "Please show your ID."]
  ]);

  add("body/0", 2, [
    ["de603", "das Haar", "die Haare", "hair", "Sie hat lange Haare.", "She has long hair."],
    ["de604", "der Bauch", "die Bäuche", "belly, stomach", "Nach dem Essen ist mein Bauch voll.", "After the meal my stomach is full."],
    ["de605", "das Gesicht", "die Gesichter", "face", "Sie hat ein freundliches Gesicht.", "She has a friendly face."],
    ["de606", "der Zahn", "die Zähne", "tooth", "Mir tut ein Zahn weh.", "One of my teeth hurts."],
    ["de607", "der Rücken", "die Rücken", "back", "Mein Rücken tut weh.", "My back hurts."],
    ["de608", "das Herz", "die Herzen", "heart", "Mein Herz schlägt schnell.", "My heart is beating fast."]
  ]);

  add("body/1", 2, [
    ["de609", "der Schmerz", "die Schmerzen", "pain", "Haben Sie Schmerzen?", "Are you in pain?"],
    ["de610", "das Fieber", "–", "fever, temperature", "Das Kind hat Fieber.", "The child has a temperature."],
    ["de611", "die Erkältung", "die Erkältungen", "cold (illness)", "Ich habe eine Erkältung.", "I have a cold."],
    ["de612", "der Husten", "–", "cough", "Ich habe Husten und Schnupfen.", "I have a cough and a cold."],
    ["de613", "der Zahnarzt", "die Zahnärzte", "dentist (man)", "Morgen muss ich zum Zahnarzt.", "Tomorrow I have to go to the dentist."],
    ["de614", "der Unfall", "die Unfälle", "accident", "Er hatte einen Unfall.", "He had an accident."],
    ["de615", "sich fühlen", "", "to feel", "Ich fühle mich nicht gut.", "I don't feel well."],
    ["de616", "gute Besserung", "", "get well soon", "Du bist krank? Gute Besserung!", "You're ill? Get well soon!"]
  ]);

  add("nature/0", 2, [
    ["de617", "der Wind", "die Winde", "wind", "Der Wind ist kalt.", "The wind is cold."],
    ["de618", "die Wolke", "die Wolken", "cloud", "Am Himmel sind viele Wolken.", "There are lots of clouds in the sky."],
    ["de619", "sonnig", "", "sunny", "Morgen wird es sonnig.", "Tomorrow it will be sunny."],
    ["de620", "schneien", "", "to snow", "Es schneit seit gestern.", "It's been snowing since yesterday."],
    ["de621", "der Grad", "die Grade", "degree", "Es sind dreißig Grad.", "It's thirty degrees."],
    ["de622", "der Regenschirm", "die Regenschirme", "umbrella", "Nimm einen Regenschirm mit!", "Take an umbrella!"]
  ]);

  add("nature/1", 2, [
    ["de623", "die Natur", "–", "nature", "Ich bin gern in der Natur.", "I like being out in nature."],
    ["de624", "der Fluss", "die Flüsse", "river", "Der Rhein ist ein Fluss.", "The Rhine is a river."],
    ["de625", "der See", "die Seen", "lake", "Wir schwimmen im See.", "We swim in the lake."],
    ["de626", "der Himmel", "die Himmel", "sky; heaven", "Der Himmel ist heute blau.", "The sky is blue today."],
    ["de627", "der Mond", "die Monde", "moon", "Der Mond scheint hell.", "The moon is shining brightly."],
    ["de628", "der Stern", "die Sterne", "star", "Nachts sieht man viele Sterne.", "At night you can see lots of stars."],
    ["de629", "der Strand", "die Strände", "beach", "Wir liegen den ganzen Tag am Strand.", "We lie on the beach all day."],
    ["de630", "die Pflanze", "die Pflanzen", "plant", "Die Pflanze braucht Wasser.", "The plant needs water."]
  ]);

  add("nature/2", 2, [
    ["de631", "der Vogel", "die Vögel", "bird", "Der Vogel singt.", "The bird is singing."],
    ["de632", "die Kuh", "die Kühe", "cow", "Auf der Wiese stehen Kühe.", "There are cows in the meadow."],
    ["de633", "das Schwein", "die Schweine", "pig", "Der Bauer hat zwanzig Schweine.", "The farmer has twenty pigs."]
  ]);

  add("free/0", 2, [
    ["de634", "tanzen", "", "to dance", "Wir tanzen den ganzen Abend.", "We dance all evening."],
    ["de635", "wandern", "", "to hike", "Am Wochenende wandern wir in den Bergen.", "At the weekend we go hiking in the mountains."],
    ["de636", "das Schwimmbad", "die Schwimmbäder", "swimming pool", "Das Schwimmbad ist im Sommer voll.", "The swimming pool is full in summer."],
    ["de637", "das Spiel", "die Spiele", "game; match", "Das Spiel beginnt um acht.", "The match starts at eight."],
    ["de638", "gewinnen", "", "to win", "Wer hat gewonnen?", "Who won?"],
    ["de639", "verlieren", "", "to lose", "Wir haben das Spiel verloren.", "We lost the match."]
  ]);

  add("free/1", 2, [
    ["de640", "die Freizeit", "–", "free time", "Was machst du in der Freizeit?", "What do you do in your free time?"],
    ["de641", "die Party", "die Partys", "party", "Kommst du zu meiner Party?", "Are you coming to my party?"],
    ["de642", "einladen", "", "to invite (lädt ein)", "Ich lade dich zum Essen ein.", "I'm inviting you for a meal."],
    ["de643", "die Einladung", "die Einladungen", "invitation", "Danke für die Einladung!", "Thanks for the invitation!"],
    ["de644", "feiern", "", "to celebrate, to party", "Wir feiern meinen Geburtstag.", "We're celebrating my birthday."],
    ["de645", "das Geschenk", "die Geschenke", "present, gift", "Das Geschenk ist für dich.", "The present is for you."],
    ["de646", "treffen", "", "to meet (trifft)", "Ich treffe meine Freunde im Café.", "I'm meeting my friends at the café."],
    ["de647", "der Spaß", "die Späße", "fun; joke", "Viel Spaß!", "Have fun!"],
    ["de648", "das Konzert", "die Konzerte", "concert", "Gehst du mit ins Konzert?", "Are you coming to the concert?"]
  ]);

  add("school/0", 2, [
    ["de649", "die Klasse", "die Klassen", "class; year, grade", "Meine Tochter ist in der dritten Klasse.", "My daughter is in third grade."],
    ["de650", "die Schülerin", "die Schülerinnen", "pupil (girl)", "Die Schülerin hat eine Frage.", "The pupil has a question."],
    ["de651", "die Universität", "die Universitäten", "university", "Sie studiert an der Universität Wien.", "She studies at the University of Vienna."],
    ["de652", "der Student", "die Studenten", "student (man)", "Mein Bruder ist Student.", "My brother is a student."],
    ["de653", "studieren", "", "to study (at university)", "Ich studiere Medizin.", "I'm studying medicine."],
    ["de654", "die Prüfung", "die Prüfungen", "exam", "Morgen habe ich eine Prüfung.", "I have an exam tomorrow."],
    ["de655", "die Pause", "die Pausen", "break", "Wir machen zehn Minuten Pause.", "We'll take a ten-minute break."]
  ]);

  add("school/1", 2, [
    ["de656", "die Hausaufgabe", "die Hausaufgaben", "homework (task)", "Hast du deine Hausaufgaben gemacht?", "Have you done your homework?"],
    ["de657", "die Seite", "die Seiten", "page; side", "Lest bitte Seite zehn.", "Please read page ten."],
    ["de658", "der Satz", "die Sätze", "sentence", "Bilde einen Satz mit diesem Wort.", "Make a sentence with this word."],
    ["de659", "die Übung", "die Übungen", "exercise", "Macht bitte Übung drei.", "Please do exercise three."],
    ["de660", "das Beispiel", "die Beispiele", "example", "Kannst du ein Beispiel geben?", "Can you give an example?"],
    ["de661", "der Fehler", "die Fehler", "mistake", "Ich mache noch viele Fehler.", "I still make a lot of mistakes."],
    ["de662", "erklären", "", "to explain", "Kannst du mir das erklären?", "Can you explain that to me?"],
    ["de663", "wiederholen", "", "to repeat; to revise", "Bitte wiederholen Sie das.", "Please repeat that."],
    ["de664", "bedeuten", "", "to mean", "Was bedeutet das?", "What does that mean?"]
  ]);

  add("school/2", 2, [
    ["de665", "die Firma", "die Firmen", "company, firm", "Die Firma ist in München.", "The company is in Munich."],
    ["de666", "der Job", "die Jobs", "job", "Ich suche einen neuen Job.", "I'm looking for a new job."],
    ["de667", "sich bewerben", "", "to apply (for a job) (bewirbt sich)", "Ich bewerbe mich bei einer Bank.", "I'm applying to a bank."],
    ["de668", "die Bewerbung", "die Bewerbungen", "application", "Ich schreibe eine Bewerbung.", "I'm writing a job application."],
    ["de669", "der Termin", "die Termine", "appointment, meeting", "Ich habe um drei einen Termin.", "I have an appointment at three."],
    ["de670", "verdienen", "", "to earn", "Er verdient gut.", "He earns well."],
    ["de671", "der Mitarbeiter", "die Mitarbeiter", "employee, staff member (man)", "Die Firma hat fünfzig Mitarbeiter.", "The company has fifty employees."],
    ["de672", "der Verkäufer", "die Verkäufer", "shop assistant, salesman", "Der Verkäufer ist sehr freundlich.", "The shop assistant is very friendly."]
  ]);

  add("verbs/0", 2, [
    ["de673", "werden", "", "to become; will (wird)", "Ich möchte Ärztin werden.", "I want to become a doctor."],
    ["de674", "bleiben", "", "to stay, to remain", "Wie lange bleibst du?", "How long are you staying?"],
    ["de675", "liegen", "", "to lie; to be (situated)", "Das Buch liegt auf dem Tisch.", "The book is lying on the table."],
    ["de676", "stehen", "", "to stand; to be (upright)", "Die Flasche steht im Kühlschrank.", "The bottle is in the fridge."]
  ]);

  add("verbs/1", 2, [
    ["de677", "schauen", "", "to look, to watch", "Schau mal, ein Vogel!", "Look, a bird!"],
    ["de678", "zuhören", "", "to listen (hört zu)", "Hör mir bitte zu!", "Please listen to me!"],
    ["de679", "erzählen", "", "to tell (a story)", "Erzähl mal, wie war der Urlaub?", "Tell me, how was the holiday?"],
    ["de680", "lachen", "", "to laugh", "Warum lachst du?", "Why are you laughing?"]
  ]);

  add("verbs/2", 2, [
    ["de681", "sollen", "", "should, to be supposed to", "Was soll ich tun?", "What should I do?"],
    ["de682", "Lust haben", "", "to feel like (doing)", "Hast du Lust auf Kino?", "Do you feel like going to the cinema?"]
  ]);

  add("verbs/3", 2, [
    ["de683", "meinen", "", "to think, to mean", "Was meinst du?", "What do you think?"],
    ["de684", "hoffen", "", "to hope", "Ich hoffe, du kommst.", "I hope you'll come."],
    ["de685", "vergessen", "", "to forget (vergisst)", "Ich habe meinen Schlüssel vergessen.", "I've forgotten my key."],
    ["de686", "sich erinnern", "", "to remember", "Erinnerst du dich an mich?", "Do you remember me?"]
  ]);

  add("verbs/4", 2, [
    ["de687", "tun", "", "to do", "Was kann ich für Sie tun?", "What can I do for you?"],
    ["de688", "holen", "", "to fetch, to get", "Ich hole schnell Brot.", "I'll quickly get some bread."],
    ["de689", "legen", "", "to lay, to put (flat)", "Leg das Buch auf den Tisch.", "Put the book on the table."],
    ["de690", "stellen", "", "to put (upright)", "Stell die Flasche in den Kühlschrank.", "Put the bottle in the fridge."],
    ["de691", "benutzen", "", "to use", "Darf ich dein Handy benutzen?", "May I use your phone?"],
    ["de692", "anfangen", "", "to begin, to start (fängt an)", "Der Film fängt um acht an.", "The film starts at eight."],
    ["de693", "aufhören", "", "to stop (hört auf)", "Hör auf, bitte!", "Stop it, please!"],
    ["de694", "versuchen", "", "to try", "Ich versuche es noch einmal.", "I'll try again."]
  ]);

  add("verbs/5", 2, [
    ["de695", "die Hilfe", "–", "help", "Danke für deine Hilfe!", "Thanks for your help!"],
    ["de696", "mitkommen", "", "to come along (kommt mit)", "Kommst du mit ins Kino?", "Are you coming to the cinema with us?"],
    ["de697", "mitmachen", "", "to join in (macht mit)", "Darf ich mitmachen?", "Can I join in?"],
    ["de698", "teilnehmen", "", "to take part (nimmt teil)", "Ich nehme an dem Kurs teil.", "I'm taking part in the course."]
  ]);

  add("describe/0", 2, [
    ["de699", "laut", "", "loud, noisy", "Die Musik ist zu laut.", "The music is too loud."],
    ["de700", "leise", "", "quiet, soft", "Bitte sprich leise, das Baby schläft.", "Please speak quietly, the baby is asleep."],
    ["de701", "voll", "", "full", "Der Bus ist voll.", "The bus is full."],
    ["de702", "leer", "", "empty", "Die Flasche ist leer.", "The bottle is empty."],
    ["de703", "hell", "", "light, bright", "Die Wohnung ist schön hell.", "The flat is nice and bright."],
    ["de704", "dunkel", "", "dark", "Im Winter wird es früh dunkel.", "In winter it gets dark early."],
    ["de705", "sauber", "", "clean", "Die Küche ist sauber.", "The kitchen is clean."],
    ["de706", "schmutzig", "", "dirty", "Deine Schuhe sind schmutzig.", "Your shoes are dirty."],
    ["de707", "schwierig", "", "difficult", "Die Prüfung war schwierig.", "The exam was difficult."],
    ["de708", "hoch", "", "high, tall", "Der Turm ist sehr hoch.", "The tower is very tall."],
    ["de709", "offen", "", "open", "Das Fenster ist offen.", "The window is open."]
  ]);

  add("describe/1", 2, [
    ["de710", "grau", "", "grey", "Der Himmel ist grau.", "The sky is grey."],
    ["de711", "braun", "", "brown", "Sie hat braune Augen.", "She has brown eyes."],
    ["de712", "orange", "", "orange", "Sie trägt eine orange Jacke.", "She's wearing an orange jacket."]
  ]);

  add("describe/2", 2, [
    ["de713", "glücklich", "", "happy", "Wir sind sehr glücklich.", "We're very happy."],
    ["de714", "zufrieden", "", "satisfied, content", "Bist du mit dem Hotel zufrieden?", "Are you happy with the hotel?"],
    ["de715", "sich freuen", "", "to be happy, to look forward to", "Ich freue mich auf das Wochenende.", "I'm looking forward to the weekend."],
    ["de716", "die Liebe", "–", "love", "Liebe ist das Wichtigste.", "Love is the most important thing."],
    ["de717", "das Gefühl", "die Gefühle", "feeling", "Ich habe ein gutes Gefühl.", "I have a good feeling."],
    ["de718", "die Angst", "die Ängste", "fear", "Ich habe Angst vor Hunden.", "I'm afraid of dogs."],
    ["de719", "allein", "", "alone", "Ich wohne allein.", "I live alone."],
    ["de720", "ruhig", "", "calm, quiet", "Bleib ruhig!", "Stay calm!"],
    ["de721", "langweilig", "", "boring; bored (mir ist langweilig)", "Mir ist langweilig.", "I'm bored."]
  ]);

  add("describe/3", 2, [
    ["de722", "freundlich", "", "friendly", "Die Leute hier sind sehr freundlich.", "The people here are very friendly."],
    ["de723", "lustig", "", "funny", "Der Film ist sehr lustig.", "The film is very funny."],
    ["de724", "kaputt", "", "broken", "Der Fernseher ist kaputt.", "The TV is broken."],
    ["de725", "bequem", "", "comfortable", "Die Schuhe sind bequem.", "The shoes are comfortable."],
    ["de726", "gemütlich", "", "cosy", "Das Café ist sehr gemütlich.", "The café is very cosy."]
  ]);

  add("describe/4", 2, [
    ["de727", "die Sache", "die Sachen", "thing, matter; (plural) things, stuff", "Pack deine Sachen ein.", "Pack your things."],
    ["de728", "das Thema", "die Themen", "topic, subject", "Das ist ein interessantes Thema.", "That's an interesting topic."],
    ["de729", "die Information", "die Informationen", "information", "Danke für die Information.", "Thanks for the information."],
    ["de730", "die Meinung", "die Meinungen", "opinion", "Was ist deine Meinung?", "What's your opinion?"],
    ["de731", "der Grund", "die Gründe", "reason", "Es gibt keinen Grund zur Sorge.", "There's no reason to worry."],
    ["de732", "möglich", "", "possible", "Ist das möglich?", "Is that possible?"],
    ["de733", "sicher", "", "sure; safe", "Bist du sicher?", "Are you sure?"],
    ["de734", "egal", "", "doesn't matter, all the same", "Das ist mir egal.", "I don't mind."],
    ["de735", "gleich", "", "same; in a moment", "Wir haben die gleiche Jacke.", "We have the same jacket."],
    ["de736", "stimmen", "", "to be right, to be true", "Das stimmt!", "That's right!"]
  ]);

  add("questions/0", 2, [
    ["de737", "wie lange", "", "how long", "Wie lange dauert die Fahrt?", "How long does the journey take?"],
    ["de738", "wie oft", "", "how often", "Wie oft gehst du schwimmen?", "How often do you go swimming?"],
    ["de739", "was für ein", "", "what kind of", "Was für ein Auto hast du?", "What kind of car do you have?"]
  ]);

  add("questions/1", 2, [
    ["de740", "Wie bitte?", "", "pardon?, sorry?", "Wie bitte? Ich habe Sie nicht verstanden.", "Pardon? I didn't understand you."],
    ["de741", "noch einmal", "", "once more, again", "Können Sie das noch einmal sagen?", "Could you say that again?"],
    ["de742", "keine Ahnung", "", "no idea", "Wo ist Tom? – Keine Ahnung.", "Where's Tom? – No idea."],
    ["de743", "ob", "", "whether, if", "Weißt du, ob er kommt?", "Do you know if he's coming?"]
  ]);

  add("grammar/0", 2, [
    ["de744", "so", "", "so, like this", "Das ist so schön!", "That's so beautiful!"],
    ["de745", "ganz", "", "quite; whole; completely", "Das ist ganz einfach.", "That's quite simple."],
    ["de746", "wirklich", "", "really", "Das ist wirklich schön.", "That's really nice."],
    ["de747", "fast", "", "almost", "Ich bin fast fertig.", "I'm almost finished."],
    ["de748", "genug", "", "enough", "Wir haben genug Zeit.", "We have enough time."],
    ["de749", "genau", "", "exactly; exact", "Genau, das meine ich.", "Exactly, that's what I mean."],
    ["de750", "gar nicht", "", "not at all", "Das ist gar nicht teuer.", "That's not expensive at all."],
    ["de751", "am liebsten", "", "most of all, best (preference)", "Am liebsten esse ich Pizza.", "I like pizza best."]
  ]);

  add("grammar/1", 2, [
    ["de752", "denn", "", "because, for", "Ich bleibe zu Hause, denn ich bin krank.", "I'm staying at home because I'm ill."],
    ["de753", "dass", "", "that (conjunction)", "Ich glaube, dass er recht hat.", "I think that he's right."],
    ["de754", "wenn", "", "if; when, whenever", "Wenn es regnet, bleiben wir zu Hause.", "If it rains, we'll stay at home."],
    ["de755", "als", "", "when (in the past); than; as", "Als ich klein war, wohnten wir in Bonn.", "When I was little, we lived in Bonn."],
    ["de756", "sondern", "", "but (rather)", "Nicht heute, sondern morgen.", "Not today, but tomorrow."],
    ["de757", "deshalb", "", "that's why, therefore", "Ich war krank, deshalb bin ich nicht gekommen.", "I was ill, that's why I didn't come."],
    ["de758", "zum Beispiel", "", "for example", "Ich mag Obst, zum Beispiel Äpfel.", "I like fruit, for example apples."]
  ]);

  add("grammar/2", 2, [
    ["de759", "einmal", "", "once", "Ich war einmal in Paris.", "I've been to Paris once."],
    ["de760", "selten", "", "rarely, seldom", "Ich esse selten Fleisch.", "I rarely eat meat."],
    ["de761", "meistens", "", "mostly, usually", "Meistens fahre ich mit dem Rad.", "I usually go by bike."],
    ["de762", "normalerweise", "", "normally, usually", "Normalerweise stehe ich um sechs auf.", "I normally get up at six."],
    ["de763", "zuerst", "", "first, at first", "Zuerst lernen wir die Zahlen.", "First we learn the numbers."],
    ["de764", "endlich", "", "finally, at last", "Endlich ist Wochenende!", "At last it's the weekend!"]
  ]);

  add("grammar/3", 2, [
    ["de765", "bei", "", "at (someone's place); near", "Ich wohne bei meinen Eltern.", "I live with my parents."],
    ["de766", "ihn", "", "him; it (accusative)", "Kennst du ihn?", "Do you know him?"],
    ["de767", "ihm", "", "(to) him (dative)", "Ich helfe ihm.", "I'm helping him."],
    ["de768", "uns", "", "us, (to) us", "Besuch uns bald!", "Visit us soon!"],
    ["de769", "euch", "", "you, (to) you (plural, informal)", "Ich rufe euch morgen an.", "I'll call you tomorrow."],
    ["de770", "Ihnen", "", "(to) you (polite, dative)", "Wie geht es Ihnen?", "How are you?"],
    ["de771", "sich", "", "himself, herself, themselves (reflexive)", "Er wäscht sich.", "He's washing himself."],
    ["de772", "unser", "", "our", "Das ist unser Haus.", "This is our house."],
    ["de773", "seit", "", "since, for (time)", "Ich wohne seit zwei Jahren hier.", "I've lived here for two years."]
  ]);

  window.DE_WORDS = out;
})();
