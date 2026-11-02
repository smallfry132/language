/* Spanish beginner vocabulary — two levels (A1 ≈ first steps, A2 ≈ everyday life).
 * Written for this app, sorted into the same topics as the other courses (themes.js); the levels are an editorial
 * grading, not the Cervantes inventories. Nouns carry their article (el/la) and plural.
 * Rows: [id, word, plural, English, German, example, example in English, example in German].
 * Ids are stable: never reuse or renumber them. Each block: topic/group (see themes.js) and level. */
(function () {
  const out = [];
  const add = (t, lvl, rows) => rows.forEach(([id, w, pl, en, de, ex, exEn, exDe]) => out.push({ id, w, pl: pl || "", en, de, t, lvl, ex: ex || "", exEn: exEn || "", exDe: exDe || "" }));

  add("hello/0", 1, [
    ["es1", "hola", "", "hello, hi", "hallo", "¡Hola! Soy Ana.", "Hi! I'm Ana.", "Hallo! Ich bin Ana."],
    ["es2", "adiós", "", "goodbye", "auf Wiedersehen, tschüss", "Adiós, ¡buen viaje!", "Goodbye, have a good trip!", "Auf Wiedersehen, gute Reise!"],
    ["es3", "buenos días", "", "good morning", "guten Morgen", "Buenos días, señora López.", "Good morning, Mrs López.", "Guten Morgen, Frau López."],
    ["es4", "buenas tardes", "", "good afternoon, good evening (before dark)", "guten Tag, guten Abend (bis es dunkel wird)", "Buenas tardes, ¿cómo está usted?", "Good afternoon, how are you?", "Guten Tag, wie geht es Ihnen?"],
    ["es5", "buenas noches", "", "good evening, good night", "guten Abend, gute Nacht", "Buenas noches, que duermas bien.", "Good night, sleep well.", "Gute Nacht, schlaf gut."],
    ["es6", "gracias", "", "thank you, thanks", "danke", "Gracias por el café.", "Thanks for the coffee.", "Danke für den Kaffee."],
    ["es7", "de nada", "", "you're welcome", "gern geschehen, bitte", "De nada, es un placer.", "You're welcome, it's a pleasure.", "Gern geschehen, es ist mir ein Vergnügen."],
    ["es8", "por favor", "", "please", "bitte", "Un café, por favor.", "A coffee, please.", "Einen Kaffee, bitte."],
    ["es9", "perdón", "", "sorry, excuse me", "Entschuldigung, Verzeihung", "Perdón, ¿dónde está la estación?", "Excuse me, where is the station?", "Entschuldigung, wo ist der Bahnhof?"],
    ["es10", "lo siento", "", "I'm sorry", "es tut mir leid", "Lo siento, no tengo tiempo.", "I'm sorry, I don't have time.", "Es tut mir leid, ich habe keine Zeit."],
    ["es11", "sí", "", "yes", "ja", "Sí, soy de Madrid.", "Yes, I'm from Madrid.", "Ja, ich komme aus Madrid."],
    ["es12", "no", "", "no, not", "nein, nicht", "No, no hablo francés.", "No, I don't speak French.", "Nein, ich spreche kein Französisch."],
    ["es13", "hasta luego", "", "see you later, bye", "bis später, tschüss", "Hasta luego, Marta.", "See you later, Marta.", "Bis später, Marta."],
    ["es14", "¿qué tal?", "", "how are you?, how's it going?", "wie geht's?", "Hola, Luis, ¿qué tal?", "Hi, Luis, how's it going?", "Hallo, Luis, wie geht's?"]
  ]);
  add("hello/0", 2, [
    ["es15", "hasta mañana", "", "see you tomorrow", "bis morgen", "Buenas noches y hasta mañana.", "Good night, see you tomorrow.", "Gute Nacht und bis morgen."],
    ["es16", "encantado", "", "pleased to meet you, delighted", "freut mich, sehr erfreut", "Encantada, yo soy Elena.", "Pleased to meet you, I'm Elena.", "Freut mich, ich bin Elena."],
    ["es17", "bienvenido", "", "welcome", "willkommen", "¡Bienvenidos a México!", "Welcome to Mexico!", "Willkommen in Mexiko!"],
    ["es18", "de acuerdo", "", "OK, agreed", "einverstanden, okay", "De acuerdo, nos vemos a las cinco.", "OK, see you at five.", "Einverstanden, wir sehen uns um fünf."],
    ["es19", "disculpe", "", "excuse me (polite)", "entschuldigen Sie", "Disculpe, ¿tiene hora?", "Excuse me, do you have the time?", "Entschuldigen Sie, wissen Sie, wie spät es ist?"],
    ["es20", "felicidades", "", "congratulations, happy birthday", "herzlichen Glückwunsch", "¡Felicidades por tu cumpleaños!", "Happy birthday!", "Herzlichen Glückwunsch zum Geburtstag!"],
    ["es21", "¡salud!", "", "cheers!; bless you!", "prost!; Gesundheit!", "¡Salud! Por los amigos.", "Cheers! To friends.", "Prost! Auf die Freunde."],
    ["es22", "buen provecho", "", "enjoy your meal", "guten Appetit", "¡Buen provecho a todos!", "Enjoy your meal, everyone!", "Guten Appetit allerseits!"],
    ["es23", "igualmente", "", "likewise, you too", "gleichfalls, ebenso", "Igualmente, que te vaya bien.", "You too, all the best.", "Gleichfalls, alles Gute."],
    ["es24", "el saludo", "los saludos", "greeting", "der Gruß", "Muchos saludos a tu familia.", "Best wishes to your family.", "Viele Grüße an deine Familie."]
  ]);

  add("people/0", 1, [
    ["es25", "yo", "", "I", "ich", "Yo soy Carmen.", "I'm Carmen.", "Ich bin Carmen."],
    ["es26", "tú", "", "you (informal; tu without accent: your)", "du", "¿Tú eres Pedro?", "Are you Pedro?", "Bist du Pedro?"],
    ["es27", "él", "", "he (el without accent: the)", "er", "Él es mi hermano.", "He is my brother.", "Er ist mein Bruder."],
    ["es28", "ella", "", "she", "sie", "Ella vive en Sevilla.", "She lives in Seville.", "Sie wohnt in Sevilla."],
    ["es29", "usted", "", "you (polite)", "Sie (höflich)", "¿Usted es el señor Ruiz?", "Are you Mr Ruiz?", "Sind Sie Herr Ruiz?"],
    ["es30", "nosotros", "", "we (f. nosotras)", "wir", "Nosotros somos de Colombia.", "We are from Colombia.", "Wir kommen aus Kolumbien."],
    ["es31", "ellos", "", "they (male or mixed)", "sie (Plural, männlich oder gemischt)", "Ellos trabajan en un banco.", "They work in a bank.", "Sie arbeiten in einer Bank."],
    ["es32", "ellas", "", "they (female)", "sie (Plural, weiblich)", "Ellas son mis amigas.", "They are my friends.", "Sie sind meine Freundinnen."]
  ]);
  add("people/0", 2, [
    ["es33", "vosotros", "", "you (plural, informal; Spain only) (f. vosotras)", "ihr (nur in Spanien)", "¿Vosotros venís a la fiesta?", "Are you all coming to the party?", "Kommt ihr zur Party?"],
    ["es34", "ustedes", "", "you (plural; polite in Spain, the usual form in Latin America)", "ihr, Sie (Plural)", "¿Ustedes hablan inglés?", "Do you speak English?", "Sprechen Sie Englisch?"]
  ]);

  add("people/1", 1, [
    ["es35", "este", "", "this (f. esta)", "dieser, diese, dieses", "Este libro es muy bueno.", "This book is very good.", "Dieses Buch ist sehr gut."],
    ["es36", "esto", "", "this (thing)", "das (hier)", "¿Qué es esto?", "What is this?", "Was ist das?"],
    ["es37", "eso", "", "that (thing)", "das (da)", "Eso no es verdad.", "That isn't true.", "Das stimmt nicht."],
    ["es38", "todo", "", "all, whole; everything", "ganz, alle; alles", "Todos los días como fruta.", "I eat fruit every day.", "Ich esse jeden Tag Obst."],
    ["es39", "otro", "", "other, another", "andere, noch ein", "¿Quieres otro café?", "Would you like another coffee?", "Möchtest du noch einen Kaffee?"]
  ]);
  add("people/1", 2, [
    ["es40", "ese", "", "that (f. esa)", "dieser, der da", "¿Cuánto cuesta esa camisa?", "How much is that shirt?", "Wie viel kostet das Hemd da?"],
    ["es41", "aquel", "", "that (over there) (f. aquella)", "jener (dort drüben)", "Aquella casa es de mi abuelo.", "That house over there is my grandfather's.", "Das Haus dort drüben gehört meinem Großvater."],
    ["es42", "cada", "", "each, every", "jeder, jede, jedes", "Cada alumno tiene un libro.", "Each pupil has a book.", "Jeder Schüler hat ein Buch."],
    ["es43", "mismo", "", "same", "gleich, derselbe", "Tenemos la misma edad.", "We are the same age.", "Wir sind gleich alt."],
    ["es44", "algo", "", "something, anything", "etwas", "¿Quieres algo de beber?", "Would you like something to drink?", "Möchtest du etwas trinken?"],
    ["es45", "nada", "", "nothing", "nichts", "No tengo nada que hacer.", "I have nothing to do.", "Ich habe nichts zu tun."],
    ["es46", "alguien", "", "somebody, anybody", "jemand", "¿Hay alguien en casa?", "Is anybody home?", "Ist jemand zu Hause?"],
    ["es47", "nadie", "", "nobody", "niemand", "No hay nadie en la oficina.", "There's nobody in the office.", "Es ist niemand im Büro."]
  ]);

  add("people/2", 1, [
    ["es48", "el nombre", "los nombres", "name, first name", "der Name, der Vorname", "Mi nombre es Laura.", "My name is Laura.", "Mein Name ist Laura."],
    ["es49", "llamarse", "", "to be called", "heißen", "¿Cómo te llamas? Me llamo Tomás.", "What's your name? My name is Tomás.", "Wie heißt du? Ich heiße Tomás."],
    ["es50", "mucho gusto", "", "nice to meet you", "freut mich, angenehm", "Mucho gusto, soy Pablo.", "Nice to meet you, I'm Pablo.", "Freut mich, ich bin Pablo."],
    ["es51", "el señor", "los señores", "Mr; gentleman", "Herr; der Herr", "El señor Pérez es mi profesor.", "Mr Pérez is my teacher.", "Herr Pérez ist mein Lehrer."],
    ["es52", "la señora", "las señoras", "Mrs; lady", "Frau; die Dame", "La señora López vive aquí.", "Mrs López lives here.", "Frau López wohnt hier."],
    ["es53", "el hombre", "los hombres", "man", "der Mann", "Ese hombre es mi vecino.", "That man is my neighbour.", "Der Mann da ist mein Nachbar."],
    ["es54", "la mujer", "las mujeres", "woman; wife", "die Frau; die Ehefrau", "La mujer del sombrero es mi tía.", "The woman in the hat is my aunt.", "Die Frau mit dem Hut ist meine Tante."]
  ]);
  add("people/2", 2, [
    ["es55", "el apellido", "los apellidos", "surname, last name", "der Nachname", "Mi apellido es García.", "My surname is García.", "Mein Nachname ist García."],
    ["es56", "la persona", "las personas", "person", "die Person, der Mensch", "Hay tres personas en la sala.", "There are three people in the room.", "Es sind drei Personen im Raum."],
    ["es57", "la gente", "–", "people", "die Leute", "La gente aquí es muy amable.", "People here are very friendly.", "Die Leute hier sind sehr freundlich."],
    ["es58", "el chico", "los chicos", "boy, young man", "der Junge, der junge Mann", "El chico se llama Diego.", "The boy is called Diego.", "Der Junge heißt Diego."],
    ["es59", "la chica", "las chicas", "girl, young woman", "das Mädchen, die junge Frau", "La chica de la foto es mi prima.", "The girl in the photo is my cousin.", "Das Mädchen auf dem Foto ist meine Cousine."],
    ["es60", "presentar", "", "to introduce, to present", "vorstellen", "Te presento a mi amiga Sara.", "Let me introduce my friend Sara.", "Ich stelle dir meine Freundin Sara vor."],
    ["es61", "la dirección", "las direcciones", "address; direction", "die Adresse; die Richtung", "¿Cuál es tu dirección?", "What's your address?", "Wie ist deine Adresse?"]
  ]);

  add("family/0", 1, [
    ["es62", "la familia", "las familias", "family", "die Familie", "Mi familia es grande.", "My family is big.", "Meine Familie ist groß."],
    ["es63", "el padre", "los padres", "father (pl. also: parents)", "der Vater (Pl. auch: die Eltern)", "Mi padre es médico.", "My father is a doctor.", "Mein Vater ist Arzt."],
    ["es64", "la madre", "las madres", "mother", "die Mutter", "Mi madre se llama Rosa.", "My mother's name is Rosa.", "Meine Mutter heißt Rosa."],
    ["es65", "el papá", "los papás", "dad", "der Papa", "Mi papá cocina muy bien.", "My dad cooks very well.", "Mein Papa kocht sehr gut."],
    ["es66", "la mamá", "las mamás", "mum, mom", "die Mama", "¡Mamá, tengo hambre!", "Mum, I'm hungry!", "Mama, ich habe Hunger!"],
    ["es67", "el hermano", "los hermanos", "brother (pl. also: siblings)", "der Bruder (Pl. auch: die Geschwister)", "Mi hermano tiene veinte años.", "My brother is twenty.", "Mein Bruder ist zwanzig."],
    ["es68", "la hermana", "las hermanas", "sister", "die Schwester", "Mi hermana estudia en Madrid.", "My sister studies in Madrid.", "Meine Schwester studiert in Madrid."]
  ]);

  add("family/1", 1, [
    ["es69", "el hijo", "los hijos", "son (pl. also: children)", "der Sohn (Pl. auch: die Kinder)", "Tienen un hijo y una hija.", "They have a son and a daughter.", "Sie haben einen Sohn und eine Tochter."],
    ["es70", "la hija", "las hijas", "daughter", "die Tochter", "Su hija tiene cinco años.", "Their daughter is five.", "Ihre Tochter ist fünf."],
    ["es71", "el niño", "los niños", "child, boy", "das Kind, der Junge", "Los niños juegan en el parque.", "The children are playing in the park.", "Die Kinder spielen im Park."],
    ["es72", "el esposo", "los esposos", "husband", "der Ehemann", "Mi esposo es de Chile.", "My husband is from Chile.", "Mein Mann kommt aus Chile."],
    ["es73", "la esposa", "las esposas", "wife", "die Ehefrau", "Su esposa trabaja en un hospital.", "His wife works in a hospital.", "Seine Frau arbeitet in einem Krankenhaus."],
    ["es74", "el abuelo", "los abuelos", "grandfather (pl. also: grandparents)", "der Großvater (Pl. auch: die Großeltern)", "Mi abuelo tiene ochenta años.", "My grandfather is eighty.", "Mein Großvater ist achtzig."],
    ["es75", "la abuela", "las abuelas", "grandmother", "die Großmutter", "La abuela vive con nosotros.", "Grandma lives with us.", "Oma wohnt bei uns."]
  ]);
  add("family/1", 2, [
    ["es76", "la niña", "las niñas", "girl (child)", "das Mädchen", "La niña lleva un vestido rojo.", "The girl is wearing a red dress.", "Das Mädchen trägt ein rotes Kleid."],
    ["es77", "el bebé", "los bebés", "baby", "das Baby", "El bebé duerme mucho.", "The baby sleeps a lot.", "Das Baby schläft viel."],
    ["es78", "el novio", "los novios", "boyfriend; groom", "der Freund (Partner); der Bräutigam", "Mi novio es muy simpático.", "My boyfriend is very nice.", "Mein Freund ist sehr nett."],
    ["es79", "la novia", "las novias", "girlfriend; bride", "die Freundin (Partnerin); die Braut", "Su novia se llama Lucía.", "His girlfriend is called Lucía.", "Seine Freundin heißt Lucía."],
    ["es80", "el marido", "los maridos", "husband", "der Ehemann, der Mann", "Su marido es profesor.", "Her husband is a teacher.", "Ihr Mann ist Lehrer."],
    ["es81", "la pareja", "las parejas", "couple; partner", "das Paar; der Partner, die Partnerin", "Mi pareja es de Argentina.", "My partner is from Argentina.", "Mein Partner kommt aus Argentinien."],
    ["es82", "casarse", "", "to get married", "heiraten", "Se casan en junio.", "They're getting married in June.", "Sie heiraten im Juni."],
    ["es83", "el tío", "los tíos", "uncle (pl. also: aunt and uncle)", "der Onkel (Pl. auch: Onkel und Tante)", "Mi tío vive en el campo.", "My uncle lives in the country.", "Mein Onkel wohnt auf dem Land."],
    ["es84", "la tía", "las tías", "aunt", "die Tante", "Mi tía hace unos pasteles muy ricos.", "My aunt makes very tasty cakes.", "Meine Tante backt sehr leckere Kuchen."],
    ["es85", "el primo", "los primos", "cousin (male)", "der Cousin", "Mi primo tiene quince años.", "My cousin is fifteen.", "Mein Cousin ist fünfzehn."],
    ["es86", "la prima", "las primas", "cousin (female)", "die Cousine", "Voy al cine con mi prima.", "I'm going to the cinema with my cousin.", "Ich gehe mit meiner Cousine ins Kino."],
    ["es87", "el nieto", "los nietos", "grandson (pl. also: grandchildren)", "der Enkel (Pl. auch: die Enkelkinder)", "La abuela tiene seis nietos.", "Grandma has six grandchildren.", "Oma hat sechs Enkelkinder."]
  ]);

  add("family/2", 1, [
    ["es88", "la edad", "las edades", "age", "das Alter", "¿Qué edad tiene tu hijo?", "How old is your son?", "Wie alt ist dein Sohn?"],
    ["es89", "el cumpleaños", "los cumpleaños", "birthday", "der Geburtstag", "Hoy es mi cumpleaños.", "Today is my birthday.", "Heute ist mein Geburtstag."]
  ]);
  add("family/2", 2, [
    ["es90", "el vecino", "los vecinos", "neighbour (f. la vecina)", "der Nachbar, die Nachbarin", "Mi vecino tiene un perro.", "My neighbour has a dog.", "Mein Nachbar hat einen Hund."],
    ["es91", "mayor", "", "older; elderly", "älter; alt (höflich)", "Mi hermana mayor vive en Lima.", "My older sister lives in Lima.", "Meine ältere Schwester wohnt in Lima."],
    ["es92", "menor", "", "younger", "jünger", "Mi hermano menor tiene diez años.", "My younger brother is ten.", "Mein jüngerer Bruder ist zehn."],
    ["es93", "nacer", "", "to be born", "geboren werden", "Nací en Valencia.", "I was born in Valencia.", "Ich bin in Valencia geboren."],
    ["es94", "casado", "", "married", "verheiratet", "¿Estás casado?", "Are you married?", "Bist du verheiratet?"],
    ["es95", "soltero", "", "single, unmarried", "ledig, Single", "Mi primo está soltero.", "My cousin is single.", "Mein Cousin ist Single."]
  ]);

  add("countries/0", 1, [
    ["es96", "el país", "los países", "country", "das Land", "Perú es un país muy bonito.", "Peru is a very beautiful country.", "Peru ist ein sehr schönes Land."],
    ["es97", "España", "–", "Spain", "Spanien", "Vivo en España.", "I live in Spain.", "Ich wohne in Spanien."],
    ["es98", "México", "–", "Mexico", "Mexiko", "Mi amiga es de México.", "My friend is from Mexico.", "Meine Freundin kommt aus Mexiko."],
    ["es99", "Alemania", "–", "Germany", "Deutschland", "Soy de Alemania.", "I'm from Germany.", "Ich komme aus Deutschland."],
    ["es100", "Estados Unidos", "–", "United States", "die Vereinigten Staaten, die USA", "Mi tío vive en Estados Unidos.", "My uncle lives in the United States.", "Mein Onkel lebt in den USA."]
  ]);
  add("countries/0", 2, [
    ["es101", "el mundo", "–", "world", "die Welt", "Quiero viajar por todo el mundo.", "I want to travel all over the world.", "Ich will um die ganze Welt reisen."],
    ["es102", "extranjero", "", "foreign; foreigner", "ausländisch; der Ausländer", "En mi clase hay muchos estudiantes extranjeros.", "There are many foreign students in my class.", "In meiner Klasse gibt es viele ausländische Studenten."],
    ["es103", "Argentina", "–", "Argentina", "Argentinien", "En Argentina se come mucha carne.", "People eat a lot of meat in Argentina.", "In Argentinien isst man viel Fleisch."],
    ["es104", "Colombia", "–", "Colombia", "Kolumbien", "El café de Colombia es famoso.", "Colombian coffee is famous.", "Der Kaffee aus Kolumbien ist berühmt."],
    ["es105", "Francia", "–", "France", "Frankreich", "París está en Francia.", "Paris is in France.", "Paris liegt in Frankreich."],
    ["es106", "Italia", "–", "Italy", "Italien", "Este verano vamos a Italia.", "This summer we're going to Italy.", "Diesen Sommer fahren wir nach Italien."],
    ["es107", "Austria", "–", "Austria", "Österreich", "Viena es la capital de Austria.", "Vienna is the capital of Austria.", "Wien ist die Hauptstadt von Österreich."],
    ["es108", "Suiza", "–", "Switzerland", "die Schweiz", "En Suiza se hablan cuatro idiomas.", "Four languages are spoken in Switzerland.", "In der Schweiz spricht man vier Sprachen."],
    ["es109", "Europa", "–", "Europe", "Europa", "España está en el sur de Europa.", "Spain is in the south of Europe.", "Spanien liegt im Süden Europas."],
    ["es110", "la capital", "las capitales", "capital (city)", "die Hauptstadt", "Lima es la capital de Perú.", "Lima is the capital of Peru.", "Lima ist die Hauptstadt von Peru."]
  ]);

  add("countries/1", 2, [
    ["es111", "el norte", "–", "north", "der Norden", "Bilbao está en el norte de España.", "Bilbao is in the north of Spain.", "Bilbao liegt im Norden Spaniens."],
    ["es112", "el sur", "–", "south", "der Süden", "En el sur hace mucho calor.", "It's very hot in the south.", "Im Süden ist es sehr heiß."],
    ["es113", "el este", "–", "east", "der Osten", "El sol sale por el este.", "The sun rises in the east.", "Die Sonne geht im Osten auf."],
    ["es114", "el oeste", "–", "west", "der Westen", "Vivimos en el oeste de la ciudad.", "We live in the west of the city.", "Wir wohnen im Westen der Stadt."],
    ["es115", "el mapa", "los mapas", "map (masculine)", "die Landkarte, der Stadtplan", "¿Tienes un mapa de la ciudad?", "Do you have a map of the city?", "Hast du einen Stadtplan?"]
  ]);

  add("countries/2", 1, [
    ["es116", "el idioma", "los idiomas", "language (masculine)", "die Sprache", "Hablo tres idiomas.", "I speak three languages.", "Ich spreche drei Sprachen."],
    ["es117", "el español", "–", "Spanish (language)", "Spanisch (die Sprache)", "Estudio español desde enero.", "I've been studying Spanish since January.", "Ich lerne seit Januar Spanisch."],
    ["es118", "el inglés", "–", "English (language)", "Englisch (die Sprache)", "¿Hablas inglés?", "Do you speak English?", "Sprichst du Englisch?"],
    ["es119", "el alemán", "–", "German (language)", "Deutsch (die Sprache)", "Mi madre habla alemán y español.", "My mother speaks German and Spanish.", "Meine Mutter spricht Deutsch und Spanisch."]
  ]);
  add("countries/2", 2, [
    ["es120", "el francés", "–", "French (language)", "Französisch (die Sprache)", "Mi hijo aprende francés en el colegio.", "My son is learning French at school.", "Mein Sohn lernt Französisch in der Schule."],
    ["es121", "la lengua", "las lenguas", "language; tongue", "die Sprache; die Zunge", "Mi lengua materna es el alemán.", "My mother tongue is German.", "Meine Muttersprache ist Deutsch."],
    ["es122", "traducir", "", "to translate", "übersetzen", "¿Puedes traducir esta frase?", "Can you translate this sentence?", "Kannst du diesen Satz übersetzen?"]
  ]);

  add("numbers/0", 1, [
    ["es123", "cero", "", "zero", "null", "Hoy estamos a cero grados.", "It's zero degrees today.", "Heute sind es null Grad."],
    ["es124", "uno", "", "one (un before a masc. noun, una before a fem. noun)", "eins", "Solo quiero uno.", "I only want one.", "Ich möchte nur einen."],
    ["es125", "dos", "", "two", "zwei", "Tengo dos gatos.", "I have two cats.", "Ich habe zwei Katzen."],
    ["es126", "tres", "", "three", "drei", "Son las tres.", "It's three o'clock.", "Es ist drei Uhr."],
    ["es127", "cuatro", "", "four", "vier", "Hay cuatro sillas en la cocina.", "There are four chairs in the kitchen.", "In der Küche stehen vier Stühle."],
    ["es128", "cinco", "", "five", "fünf", "Mi hija tiene cinco años.", "My daughter is five years old.", "Meine Tochter ist fünf Jahre alt."],
    ["es129", "seis", "", "six", "sechs", "Trabajo seis horas al día.", "I work six hours a day.", "Ich arbeite sechs Stunden am Tag."],
    ["es130", "siete", "", "seven", "sieben", "La semana tiene siete días.", "The week has seven days.", "Die Woche hat sieben Tage."],
    ["es131", "ocho", "", "eight", "acht", "Me levanto a las ocho.", "I get up at eight.", "Ich stehe um acht auf."],
    ["es132", "nueve", "", "nine", "neun", "Vivo en el número nueve.", "I live at number nine.", "Ich wohne in der Nummer neun."],
    ["es133", "diez", "", "ten", "zehn", "La entrada cuesta diez euros.", "The ticket costs ten euros.", "Der Eintritt kostet zehn Euro."]
  ]);

  add("numbers/1", 1, [
    ["es134", "once", "", "eleven", "elf", "Mi hijo tiene once años.", "My son is eleven.", "Mein Sohn ist elf."],
    ["es135", "doce", "", "twelve", "zwölf", "Comemos a las doce.", "We eat at twelve.", "Wir essen um zwölf."],
    ["es136", "trece", "", "thirteen", "dreizehn", "Hay trece alumnos en la clase.", "There are thirteen pupils in the class.", "In der Klasse sind dreizehn Schüler."],
    ["es137", "catorce", "", "fourteen", "vierzehn", "El museo abre el catorce de mayo.", "The museum opens on the fourteenth of May.", "Das Museum öffnet am vierzehnten Mai."],
    ["es138", "quince", "", "fifteen", "fünfzehn", "El tren sale en quince minutos.", "The train leaves in fifteen minutes.", "Der Zug fährt in fünfzehn Minuten ab."],
    ["es139", "dieciséis", "", "sixteen", "sechzehn", "Mi prima tiene dieciséis años.", "My cousin is sixteen.", "Meine Cousine ist sechzehn."],
    ["es140", "diecisiete", "", "seventeen", "siebzehn", "Son diecisiete euros, por favor.", "That's seventeen euros, please.", "Das macht siebzehn Euro, bitte."],
    ["es141", "dieciocho", "", "eighteen", "achtzehn", "En España se puede votar a los dieciocho años.", "In Spain you can vote at eighteen.", "In Spanien darf man mit achtzehn wählen."],
    ["es142", "diecinueve", "", "nineteen", "neunzehn", "Hoy estamos a diecinueve grados.", "It's nineteen degrees today.", "Heute sind es neunzehn Grad."],
    ["es143", "veinte", "", "twenty", "zwanzig", "Tengo veinte años.", "I'm twenty years old.", "Ich bin zwanzig Jahre alt."],
    ["es144", "treinta", "", "thirty", "dreißig", "Abril tiene treinta días.", "April has thirty days.", "Der April hat dreißig Tage."],
    ["es145", "cuarenta", "", "forty", "vierzig", "Mi padre tiene cuarenta y cinco años.", "My father is forty-five.", "Mein Vater ist fünfundvierzig."],
    ["es146", "cincuenta", "", "fifty", "fünfzig", "Hay cincuenta personas en la sala.", "There are fifty people in the room.", "Im Saal sind fünfzig Leute."],
    ["es147", "sesenta", "", "sixty", "sechzig", "Una hora tiene sesenta minutos.", "An hour has sixty minutes.", "Eine Stunde hat sechzig Minuten."],
    ["es148", "setenta", "", "seventy", "siebzig", "Mi abuela tiene setenta años.", "My grandmother is seventy.", "Meine Großmutter ist siebzig."],
    ["es149", "ochenta", "", "eighty", "achtzig", "El autobús va a ochenta kilómetros por hora.", "The bus goes at eighty kilometres an hour.", "Der Bus fährt achtzig Kilometer pro Stunde."],
    ["es150", "noventa", "", "ninety", "neunzig", "Mi vecino tiene noventa años.", "My neighbour is ninety.", "Mein Nachbar ist neunzig."],
    ["es151", "cien", "", "a hundred (ciento in 101–199)", "hundert", "Hay cien personas en la fiesta.", "There are a hundred people at the party.", "Auf der Party sind hundert Leute."],
    ["es152", "mil", "", "a thousand", "tausend", "El viaje cuesta mil euros.", "The trip costs a thousand euros.", "Die Reise kostet tausend Euro."]
  ]);
  add("numbers/1", 2, [
    ["es153", "doscientos", "", "two hundred", "zweihundert", "La bicicleta cuesta doscientos euros.", "The bike costs two hundred euros.", "Das Fahrrad kostet zweihundert Euro."],
    ["es154", "quinientos", "", "five hundred", "fünfhundert", "Hay quinientos kilómetros hasta Madrid.", "It's five hundred kilometres to Madrid.", "Bis Madrid sind es fünfhundert Kilometer."],
    ["es155", "el millón", "los millones", "million", "die Million", "Madrid tiene más de tres millones de habitantes.", "Madrid has more than three million inhabitants.", "Madrid hat mehr als drei Millionen Einwohner."]
  ]);

  add("numbers/2", 1, [
    ["es156", "el número", "los números", "number", "die Zahl, die Nummer", "¿Cuál es tu número de teléfono?", "What's your phone number?", "Wie ist deine Telefonnummer?"],
    ["es157", "primero", "", "first (primer before a masc. noun)", "erste", "Es mi primer día en el trabajo.", "It's my first day at work.", "Es ist mein erster Tag bei der Arbeit."],
    ["es158", "segundo", "", "second", "zweite", "Es la segunda vez que vengo.", "It's the second time I've come.", "Ich bin zum zweiten Mal hier."],
    ["es159", "último", "", "last", "letzte", "Es el último tren de hoy.", "It's the last train today.", "Das ist der letzte Zug heute."]
  ]);
  add("numbers/2", 2, [
    ["es160", "contar", "", "to count; to tell", "zählen; erzählen", "Mi hijo sabe contar hasta veinte.", "My son can count to twenty.", "Mein Sohn kann bis zwanzig zählen."],
    ["es161", "tercero", "", "third (tercer before a masc. noun)", "dritte", "Es la tercera calle a la derecha.", "It's the third street on the right.", "Es ist die dritte Straße rechts."],
    ["es162", "la mitad", "las mitades", "half", "die Hälfte", "Solo quiero la mitad.", "I only want half.", "Ich möchte nur die Hälfte."],
    ["es163", "medio", "", "half (a)", "halb", "Medio kilo de tomates, por favor.", "Half a kilo of tomatoes, please.", "Ein halbes Kilo Tomaten, bitte."]
  ]);

  add("numbers/3", 1, [
    ["es164", "la botella", "las botellas", "bottle", "die Flasche", "Una botella de agua, por favor.", "A bottle of water, please.", "Eine Flasche Wasser, bitte."],
    ["es165", "el vaso", "los vasos", "glass (for drinking)", "das Glas", "¿Me das un vaso de leche?", "Can you give me a glass of milk?", "Gibst du mir ein Glas Milch?"]
  ]);
  add("numbers/3", 2, [
    ["es166", "la taza", "las tazas", "cup", "die Tasse", "Una taza de té, por favor.", "A cup of tea, please.", "Eine Tasse Tee, bitte."],
    ["es167", "el par", "los pares", "pair; a couple of", "das Paar; ein paar", "Necesito un par de zapatos nuevos.", "I need a new pair of shoes.", "Ich brauche ein Paar neue Schuhe."],
    ["es168", "el trozo", "los trozos", "piece", "das Stück", "¿Quieres un trozo de pastel?", "Would you like a piece of cake?", "Möchtest du ein Stück Kuchen?"],
    ["es169", "el paquete", "los paquetes", "packet, parcel", "die Packung, das Paket", "Compra un paquete de arroz.", "Buy a packet of rice.", "Kauf eine Packung Reis."]
  ]);

  add("numbers/4", 2, [
    ["es170", "el kilo", "los kilos", "kilo", "das Kilo", "Un kilo de naranjas, por favor.", "A kilo of oranges, please.", "Ein Kilo Orangen, bitte."],
    ["es171", "el gramo", "los gramos", "gram", "das Gramm", "Doscientos gramos de queso, por favor.", "Two hundred grams of cheese, please.", "Zweihundert Gramm Käse, bitte."],
    ["es172", "el litro", "los litros", "litre", "der Liter", "Bebo dos litros de agua al día.", "I drink two litres of water a day.", "Ich trinke zwei Liter Wasser am Tag."],
    ["es173", "el kilómetro", "los kilómetros", "kilometre", "der Kilometer", "El pueblo está a cinco kilómetros.", "The village is five kilometres away.", "Das Dorf ist fünf Kilometer entfernt."],
    ["es174", "pesar", "", "to weigh", "wiegen", "La maleta pesa veinte kilos.", "The suitcase weighs twenty kilos.", "Der Koffer wiegt zwanzig Kilo."]
  ]);

  add("time/0", 1, [
    ["es175", "la hora", "las horas", "hour; time (on the clock)", "die Stunde; die Uhrzeit", "¿Qué hora es?", "What time is it?", "Wie spät ist es?"],
    ["es176", "el minuto", "los minutos", "minute", "die Minute", "Espera un minuto, por favor.", "Wait a minute, please.", "Warte bitte eine Minute."],
    ["es177", "el reloj", "los relojes", "clock, watch", "die Uhr", "Mi reloj no funciona.", "My watch doesn't work.", "Meine Uhr geht nicht."],
    ["es178", "y media", "", "half past", "halb (nach)", "Son las dos y media.", "It's half past two.", "Es ist halb drei."]
  ]);
  add("time/0", 2, [
    ["es179", "y cuarto", "", "quarter past", "Viertel nach", "Llego a las siete y cuarto.", "I'll arrive at quarter past seven.", "Ich komme um Viertel nach sieben an."],
    ["es180", "menos cuarto", "", "quarter to", "Viertel vor", "Son las diez menos cuarto.", "It's quarter to ten.", "Es ist Viertel vor zehn."],
    ["es181", "en punto", "", "o'clock, on the dot", "Punkt, genau", "La clase empieza a las nueve en punto.", "The class starts at nine o'clock sharp.", "Der Unterricht beginnt Punkt neun."]
  ]);

  add("time/1", 1, [
    ["es182", "el día", "los días", "day (masculine)", "der Tag", "¡Qué día tan bonito!", "What a lovely day!", "Was für ein schöner Tag!"],
    ["es183", "la mañana", "las mañanas", "morning", "der Morgen, der Vormittag", "Trabajo por la mañana.", "I work in the morning.", "Ich arbeite vormittags."],
    ["es184", "la tarde", "las tardes", "afternoon, early evening", "der Nachmittag, der frühe Abend", "Por la tarde voy al gimnasio.", "In the afternoon I go to the gym.", "Nachmittags gehe ich ins Fitnessstudio."],
    ["es185", "la noche", "las noches", "night, evening", "die Nacht, der Abend", "Esta noche vamos al cine.", "Tonight we're going to the cinema.", "Heute Abend gehen wir ins Kino."]
  ]);
  add("time/1", 2, [
    ["es186", "el mediodía", "los mediodías", "noon, midday", "der Mittag", "Comemos al mediodía.", "We eat at midday.", "Wir essen mittags."],
    ["es187", "la medianoche", "las medianoches", "midnight", "die Mitternacht", "La fiesta termina a medianoche.", "The party ends at midnight.", "Die Party endet um Mitternacht."]
  ]);

  add("time/2", 1, [
    ["es188", "el lunes", "los lunes", "Monday", "der Montag", "El lunes tengo clase.", "I have class on Monday.", "Am Montag habe ich Unterricht."],
    ["es189", "el martes", "los martes", "Tuesday", "der Dienstag", "El martes voy al médico.", "On Tuesday I'm going to the doctor.", "Am Dienstag gehe ich zum Arzt."],
    ["es190", "el miércoles", "los miércoles", "Wednesday", "der Mittwoch", "Los miércoles juego al fútbol.", "On Wednesdays I play football.", "Mittwochs spiele ich Fußball."],
    ["es191", "el jueves", "los jueves", "Thursday", "der Donnerstag", "Nos vemos el jueves.", "See you on Thursday.", "Wir sehen uns am Donnerstag."],
    ["es192", "el viernes", "los viernes", "Friday", "der Freitag", "El viernes salimos a cenar.", "On Friday we're going out for dinner.", "Am Freitag gehen wir essen."],
    ["es193", "el sábado", "los sábados", "Saturday", "der Samstag", "El sábado no trabajo.", "I don't work on Saturday.", "Am Samstag arbeite ich nicht."],
    ["es194", "el domingo", "los domingos", "Sunday", "der Sonntag", "Los domingos como con mi familia.", "On Sundays I have lunch with my family.", "Sonntags esse ich mit meiner Familie."],
    ["es195", "la semana", "las semanas", "week", "die Woche", "Trabajo cinco días a la semana.", "I work five days a week.", "Ich arbeite fünf Tage pro Woche."],
    ["es196", "el fin de semana", "los fines de semana", "weekend", "das Wochenende", "¿Qué haces el fin de semana?", "What are you doing at the weekend?", "Was machst du am Wochenende?"]
  ]);
  add("time/2", 2, [
    ["es197", "la fecha", "las fechas", "date", "das Datum", "¿Qué fecha es hoy?", "What's the date today?", "Welches Datum ist heute?"],
    ["es198", "el calendario", "los calendarios", "calendar", "der Kalender", "Apunto la cita en el calendario.", "I'll write the appointment in the calendar.", "Ich trage den Termin in den Kalender ein."]
  ]);

  add("time/3", 1, [
    ["es199", "el mes", "los meses", "month", "der Monat", "El mes que viene voy a Perú.", "Next month I'm going to Peru.", "Nächsten Monat fahre ich nach Peru."],
    ["es200", "el año", "los años", "year", "das Jahr", "Este año estudio español.", "This year I'm studying Spanish.", "Dieses Jahr lerne ich Spanisch."],
    ["es201", "enero", "–", "January", "der Januar", "En enero hace frío.", "It's cold in January.", "Im Januar ist es kalt."],
    ["es202", "febrero", "–", "February", "der Februar", "Febrero es el mes más corto.", "February is the shortest month.", "Der Februar ist der kürzeste Monat."],
    ["es203", "marzo", "–", "March", "der März", "Mi cumpleaños es en marzo.", "My birthday is in March.", "Mein Geburtstag ist im März."],
    ["es204", "abril", "–", "April", "der April", "En abril llueve mucho.", "It rains a lot in April.", "Im April regnet es viel."],
    ["es205", "mayo", "–", "May", "der Mai", "En mayo hay muchas flores.", "There are lots of flowers in May.", "Im Mai gibt es viele Blumen."],
    ["es206", "junio", "–", "June", "der Juni", "Las clases terminan en junio.", "Classes end in June.", "Der Unterricht endet im Juni."],
    ["es207", "julio", "–", "July", "der Juli", "En julio vamos a la playa.", "In July we go to the beach.", "Im Juli fahren wir an den Strand."],
    ["es208", "agosto", "–", "August", "der August", "En agosto muchas tiendas cierran.", "In August many shops close.", "Im August schließen viele Geschäfte."],
    ["es209", "septiembre", "–", "September", "der September", "El curso empieza en septiembre.", "The school year starts in September.", "Das Schuljahr beginnt im September."],
    ["es210", "octubre", "–", "October", "der Oktober", "Nos casamos en octubre.", "We're getting married in October.", "Wir heiraten im Oktober."],
    ["es211", "noviembre", "–", "November", "der November", "En noviembre los días son cortos.", "In November the days are short.", "Im November sind die Tage kurz."],
    ["es212", "diciembre", "–", "December", "der Dezember", "La Navidad es en diciembre.", "Christmas is in December.", "Weihnachten ist im Dezember."],
    ["es213", "el verano", "los veranos", "summer", "der Sommer", "En verano hace calor.", "It's hot in summer.", "Im Sommer ist es heiß."],
    ["es214", "el invierno", "los inviernos", "winter", "der Winter", "En invierno nieva en las montañas.", "In winter it snows in the mountains.", "Im Winter schneit es in den Bergen."]
  ]);
  add("time/3", 2, [
    ["es215", "la primavera", "las primaveras", "spring", "der Frühling", "Me encanta la primavera.", "I love spring.", "Ich liebe den Frühling."],
    ["es216", "el otoño", "los otoños", "autumn, fall", "der Herbst", "En otoño caen las hojas.", "In autumn the leaves fall.", "Im Herbst fallen die Blätter."],
    ["es217", "la Navidad", "las Navidades", "Christmas", "Weihnachten", "¡Feliz Navidad!", "Merry Christmas!", "Frohe Weihnachten!"],
    ["es218", "el siglo", "los siglos", "century", "das Jahrhundert", "Esta iglesia es del siglo XV.", "This church is from the 15th century.", "Diese Kirche stammt aus dem 15. Jahrhundert."]
  ]);

  add("time/4", 1, [
    ["es219", "ahora", "", "now", "jetzt", "Ahora no puedo hablar.", "I can't talk now.", "Ich kann jetzt nicht reden."],
    ["es220", "hoy", "", "today", "heute", "Hoy hace sol.", "It's sunny today.", "Heute scheint die Sonne."],
    ["es221", "mañana", "", "tomorrow", "morgen", "Mañana tengo un examen.", "I have an exam tomorrow.", "Morgen habe ich eine Prüfung."],
    ["es222", "ayer", "", "yesterday", "gestern", "Ayer fui al cine.", "Yesterday I went to the cinema.", "Gestern war ich im Kino."],
    ["es223", "antes", "", "before, earlier", "vorher, früher", "Antes vivía en Madrid.", "I used to live in Madrid.", "Früher habe ich in Madrid gewohnt."],
    ["es224", "después", "", "after, afterwards, later", "danach, nachher, später", "Primero como y después estudio.", "First I eat and then I study.", "Erst esse ich und danach lerne ich."],
    ["es225", "temprano", "", "early", "früh", "Mañana me levanto temprano.", "Tomorrow I'm getting up early.", "Morgen stehe ich früh auf."],
    ["es226", "tarde", "", "late", "spät", "Ya es tarde, me voy a casa.", "It's late now, I'm going home.", "Es ist schon spät, ich gehe nach Hause."]
  ]);
  add("time/4", 2, [
    ["es227", "pronto", "", "soon", "bald", "¡Hasta pronto!", "See you soon!", "Bis bald!"],
    ["es228", "luego", "", "later, then", "später, dann", "Te llamo luego.", "I'll call you later.", "Ich rufe dich später an."],
    ["es229", "anoche", "", "last night", "gestern Abend, letzte Nacht", "Anoche dormí muy mal.", "I slept very badly last night.", "Letzte Nacht habe ich sehr schlecht geschlafen."],
    ["es230", "pasado mañana", "", "the day after tomorrow", "übermorgen", "Nos vemos pasado mañana.", "See you the day after tomorrow.", "Wir sehen uns übermorgen."],
    ["es231", "el momento", "los momentos", "moment", "der Moment, der Augenblick", "Un momento, por favor.", "One moment, please.", "Einen Moment, bitte."],
    ["es232", "el futuro", "–", "future", "die Zukunft", "¿Qué planes tienes para el futuro?", "What plans do you have for the future?", "Was hast du für die Zukunft vor?"],
    ["es233", "próximo", "", "next", "nächste", "El próximo año voy a México.", "Next year I'm going to Mexico.", "Nächstes Jahr fahre ich nach Mexiko."],
    ["es234", "hace", "", "ago (hace dos días: two days ago)", "vor (zeitlich)", "Llegué hace dos días.", "I arrived two days ago.", "Ich bin vor zwei Tagen angekommen."]
  ]);

  add("food/0", 1, [
    ["es235", "comer", "", "to eat; to have lunch", "essen; zu Mittag essen", "¿Qué quieres comer?", "What do you want to eat?", "Was möchtest du essen?"],
    ["es236", "beber", "", "to drink", "trinken", "Bebo mucha agua.", "I drink a lot of water.", "Ich trinke viel Wasser."],
    ["es237", "tomar", "", "to take; to have (food, drink)", "nehmen; trinken, essen", "¿Qué vas a tomar?", "What will you have?", "Was nimmst du?"],
    ["es238", "la comida", "las comidas", "food; meal", "das Essen; die Mahlzeit", "La comida está muy rica.", "The food is very tasty.", "Das Essen ist sehr lecker."],
    ["es239", "el hambre", "–", "hunger (feminine: mucha hambre)", "der Hunger", "Tengo mucha hambre.", "I'm very hungry.", "Ich habe großen Hunger."]
  ]);
  add("food/0", 2, [
    ["es240", "la sed", "–", "thirst", "der Durst", "¿Tienes sed?", "Are you thirsty?", "Hast du Durst?"],
    ["es241", "rico", "", "tasty; rich", "lecker; reich", "¡Qué rica está la sopa!", "The soup is so tasty!", "Die Suppe ist so lecker!"],
    ["es242", "cocinar", "", "to cook", "kochen", "Mi padre cocina los domingos.", "My father cooks on Sundays.", "Mein Vater kocht sonntags."],
    ["es243", "probar", "", "to taste, to try", "probieren", "¿Quieres probar la paella?", "Do you want to try the paella?", "Möchtest du die Paella probieren?"],
    ["es244", "dulce", "", "sweet", "süß", "Este café está muy dulce.", "This coffee is very sweet.", "Dieser Kaffee ist sehr süß."],
    ["es245", "picante", "", "spicy, hot", "scharf", "¿Es picante la salsa?", "Is the sauce spicy?", "Ist die Soße scharf?"],
    ["es246", "la sal", "–", "salt", "das Salz", "¿Me pasas la sal?", "Can you pass me the salt?", "Gibst du mir das Salz?"],
    ["es247", "el azúcar", "–", "sugar", "der Zucker", "¿Tomas el café con azúcar?", "Do you take sugar in your coffee?", "Trinkst du den Kaffee mit Zucker?"]
  ]);

  add("food/1", 1, [
    ["es248", "el desayuno", "los desayunos", "breakfast", "das Frühstück", "El desayuno está listo.", "Breakfast is ready.", "Das Frühstück ist fertig."],
    ["es249", "el almuerzo", "los almuerzos", "lunch (Spain often: la comida)", "das Mittagessen", "El almuerzo es a la una.", "Lunch is at one.", "Das Mittagessen ist um eins."],
    ["es250", "la cena", "las cenas", "dinner, supper", "das Abendessen", "La cena es a las nueve.", "Dinner is at nine.", "Das Abendessen ist um neun."],
    ["es251", "el pan", "los panes", "bread", "das Brot", "Compro pan todos los días.", "I buy bread every day.", "Ich kaufe jeden Tag Brot."],
    ["es252", "la carne", "las carnes", "meat", "das Fleisch", "No como carne.", "I don't eat meat.", "Ich esse kein Fleisch."],
    ["es253", "el pescado", "los pescados", "fish (as food)", "der Fisch (als Essen)", "Hoy hay pescado para cenar.", "There's fish for dinner today.", "Heute gibt es Fisch zum Abendessen."],
    ["es254", "la papa", "las papas", "potato (Spain: la patata)", "die Kartoffel", "Quiero pollo con papas fritas.", "I'd like chicken and chips.", "Ich möchte Hähnchen mit Pommes."]
  ]);
  add("food/1", 2, [
    ["es255", "desayunar", "", "to have breakfast", "frühstücken", "Desayuno a las siete.", "I have breakfast at seven.", "Ich frühstücke um sieben."],
    ["es256", "almorzar", "", "to have lunch", "zu Mittag essen", "Almorzamos en la oficina.", "We have lunch at the office.", "Wir essen im Büro zu Mittag."],
    ["es257", "cenar", "", "to have dinner", "zu Abend essen", "Esta noche cenamos en casa.", "Tonight we're having dinner at home.", "Heute Abend essen wir zu Hause."],
    ["es258", "la sopa", "las sopas", "soup", "die Suppe", "La sopa está muy caliente.", "The soup is very hot.", "Die Suppe ist sehr heiß."],
    ["es259", "el pollo", "los pollos", "chicken", "das Hähnchen", "Hoy comemos arroz con pollo.", "Today we're having chicken and rice.", "Heute essen wir Reis mit Hähnchen."],
    ["es260", "la ensalada", "las ensaladas", "salad", "der Salat", "Una ensalada mixta, por favor.", "A mixed salad, please.", "Einen gemischten Salat, bitte."],
    ["es261", "el arroz", "–", "rice", "der Reis", "La paella se hace con arroz.", "Paella is made with rice.", "Paella macht man mit Reis."],
    ["es262", "el huevo", "los huevos", "egg", "das Ei", "Desayuno dos huevos.", "I have two eggs for breakfast.", "Ich esse zwei Eier zum Frühstück."],
    ["es263", "el queso", "los quesos", "cheese", "der Käse", "Me encanta el queso.", "I love cheese.", "Ich liebe Käse."],
    ["es264", "la verdura", "las verduras", "vegetables", "das Gemüse", "Comemos mucha verdura.", "We eat lots of vegetables.", "Wir essen viel Gemüse."],
    ["es265", "el jamón", "los jamones", "ham", "der Schinken", "Un sándwich de jamón y queso, por favor.", "A ham and cheese sandwich, please.", "Ein Sandwich mit Schinken und Käse, bitte."],
    ["es266", "el tomate", "los tomates", "tomato", "die Tomate", "Compra un kilo de tomates.", "Buy a kilo of tomatoes.", "Kauf ein Kilo Tomaten."]
  ]);

  add("food/2", 1, [
    ["es267", "la fruta", "las frutas", "fruit", "das Obst", "Como fruta todos los días.", "I eat fruit every day.", "Ich esse jeden Tag Obst."],
    ["es268", "la manzana", "las manzanas", "apple", "der Apfel", "Esta manzana está muy dulce.", "This apple is very sweet.", "Dieser Apfel ist sehr süß."],
    ["es269", "la naranja", "las naranjas", "orange", "die Orange", "Las naranjas de Valencia son famosas.", "Oranges from Valencia are famous.", "Die Orangen aus Valencia sind berühmt."],
    ["es270", "el plátano", "los plátanos", "banana (also: la banana)", "die Banane", "Desayuno un plátano.", "I have a banana for breakfast.", "Ich esse eine Banane zum Frühstück."]
  ]);
  add("food/2", 2, [
    ["es271", "la uva", "las uvas", "grape", "die Weintraube", "En Nochevieja se comen doce uvas.", "On New Year's Eve people eat twelve grapes.", "An Silvester isst man zwölf Weintrauben."],
    ["es272", "el limón", "los limones", "lemon", "die Zitrone", "Un té con limón, por favor.", "A tea with lemon, please.", "Einen Tee mit Zitrone, bitte."],
    ["es273", "la fresa", "las fresas", "strawberry", "die Erdbeere", "Me encantan las fresas.", "I love strawberries.", "Ich liebe Erdbeeren."]
  ]);

  add("food/3", 1, [
    ["es274", "el agua", "las aguas", "water (feminine: el agua fría)", "das Wasser", "Un vaso de agua, por favor.", "A glass of water, please.", "Ein Glas Wasser, bitte."],
    ["es275", "el café", "los cafés", "coffee; café", "der Kaffee; das Café", "¿Tomamos un café?", "Shall we have a coffee?", "Trinken wir einen Kaffee?"],
    ["es276", "el té", "los tés", "tea (te without accent: you, to you)", "der Tee", "Bebo té por la mañana.", "I drink tea in the morning.", "Ich trinke morgens Tee."],
    ["es277", "la leche", "–", "milk", "die Milch", "Un café con leche, por favor.", "A white coffee, please.", "Einen Milchkaffee, bitte."],
    ["es278", "el jugo", "los jugos", "juice (Spain: el zumo)", "der Saft", "Un jugo de naranja, por favor.", "An orange juice, please.", "Einen Orangensaft, bitte."],
    ["es279", "la cerveza", "las cervezas", "beer", "das Bier", "Dos cervezas, por favor.", "Two beers, please.", "Zwei Bier, bitte."],
    ["es280", "el vino", "los vinos", "wine", "der Wein", "¿Vino tinto o blanco?", "Red or white wine?", "Rotwein oder Weißwein?"]
  ]);
  add("food/3", 2, [
    ["es281", "el refresco", "los refrescos", "soft drink", "das Erfrischungsgetränk, die Limo", "¿Quieres un refresco?", "Would you like a soft drink?", "Möchtest du eine Limo?"]
  ]);

  add("food/4", 1, [
    ["es282", "el restaurante", "los restaurantes", "restaurant", "das Restaurant", "Es un restaurante muy bueno.", "It's a very good restaurant.", "Das ist ein sehr gutes Restaurant."],
    ["es283", "el menú", "los menús", "menu; set menu", "die Speisekarte; das Menü", "¿Nos trae el menú, por favor?", "Could you bring us the menu, please?", "Bringen Sie uns bitte die Speisekarte?"],
    ["es284", "pedir", "", "to order; to ask for", "bestellen; bitten um", "Voy a pedir pescado.", "I'm going to order fish.", "Ich bestelle Fisch."],
    ["es285", "la cuenta", "las cuentas", "bill, check; account", "die Rechnung; das Konto", "La cuenta, por favor.", "The bill, please.", "Die Rechnung, bitte."]
  ]);
  add("food/4", 2, [
    ["es286", "el camarero", "los camareros", "waiter (f. la camarera; Latin America also: el mesero)", "der Kellner, die Kellnerin", "El camarero es muy amable.", "The waiter is very friendly.", "Der Kellner ist sehr freundlich."],
    ["es287", "el plato", "los platos", "plate; dish; course", "der Teller; das Gericht; der Gang", "Este plato es típico de Valencia.", "This dish is typical of Valencia.", "Dieses Gericht ist typisch für Valencia."],
    ["es288", "el postre", "los postres", "dessert", "der Nachtisch", "¿Qué hay de postre?", "What's for dessert?", "Was gibt es zum Nachtisch?"],
    ["es289", "la propina", "las propinas", "tip (money)", "das Trinkgeld", "Dejamos una buena propina.", "We left a good tip.", "Wir haben ein gutes Trinkgeld gegeben."],
    ["es290", "reservar", "", "to book, to reserve", "reservieren", "Quiero reservar una mesa para dos.", "I'd like to book a table for two.", "Ich möchte einen Tisch für zwei reservieren."],
    ["es291", "el cuchillo", "los cuchillos", "knife", "das Messer", "Este cuchillo no corta.", "This knife doesn't cut.", "Dieses Messer schneidet nicht."],
    ["es292", "el tenedor", "los tenedores", "fork", "die Gabel", "¿Me trae otro tenedor?", "Could you bring me another fork?", "Bringen Sie mir noch eine Gabel?"],
    ["es293", "la cuchara", "las cucharas", "spoon", "der Löffel", "La sopa se come con cuchara.", "You eat soup with a spoon.", "Suppe isst man mit dem Löffel."]
  ]);

  add("shopping/0", 1, [
    ["es294", "comprar", "", "to buy", "kaufen", "Quiero comprar pan.", "I want to buy bread.", "Ich möchte Brot kaufen."],
    ["es295", "vender", "", "to sell", "verkaufen", "Venden fruta en el mercado.", "They sell fruit at the market.", "Auf dem Markt verkauft man Obst."],
    ["es296", "la tienda", "las tiendas", "shop, store", "der Laden, das Geschäft", "La tienda abre a las diez.", "The shop opens at ten.", "Der Laden öffnet um zehn."],
    ["es297", "el mercado", "los mercados", "market", "der Markt", "Vamos al mercado los sábados.", "We go to the market on Saturdays.", "Samstags gehen wir auf den Markt."],
    ["es298", "costar", "", "to cost", "kosten", "¿Cuánto cuesta este libro?", "How much does this book cost?", "Wie viel kostet dieses Buch?"],
    ["es299", "caro", "", "expensive", "teuer", "Este reloj es muy caro.", "This watch is very expensive.", "Diese Uhr ist sehr teuer."],
    ["es300", "barato", "", "cheap", "billig, günstig", "La fruta es barata aquí.", "Fruit is cheap here.", "Obst ist hier günstig."]
  ]);
  add("shopping/0", 2, [
    ["es301", "el supermercado", "los supermercados", "supermarket", "der Supermarkt", "El supermercado está al lado de mi casa.", "The supermarket is next to my house.", "Der Supermarkt ist neben meinem Haus."],
    ["es302", "la bolsa", "las bolsas", "bag", "die Tüte, die Tasche", "¿Necesita una bolsa?", "Do you need a bag?", "Brauchen Sie eine Tüte?"],
    ["es303", "la oferta", "las ofertas", "offer, special offer", "das Angebot", "Las naranjas están de oferta.", "Oranges are on special offer.", "Orangen sind im Angebot."],
    ["es304", "la talla", "las tallas", "size (clothes)", "die Größe (Kleidung)", "¿Qué talla usa?", "What size do you wear?", "Welche Größe tragen Sie?"]
  ]);

  add("shopping/1", 1, [
    ["es305", "el dinero", "–", "money", "das Geld", "No tengo dinero.", "I don't have any money.", "Ich habe kein Geld."],
    ["es306", "el euro", "los euros", "euro", "der Euro", "El café cuesta dos euros.", "The coffee costs two euros.", "Der Kaffee kostet zwei Euro."],
    ["es307", "el precio", "los precios", "price", "der Preis", "¿Cuál es el precio de esta camisa?", "What's the price of this shirt?", "Was kostet dieses Hemd?"],
    ["es308", "pagar", "", "to pay", "bezahlen", "¿Puedo pagar con tarjeta?", "Can I pay by card?", "Kann ich mit Karte bezahlen?"]
  ]);
  add("shopping/1", 2, [
    ["es309", "la tarjeta", "las tarjetas", "card", "die Karte", "Pago siempre con tarjeta.", "I always pay by card.", "Ich bezahle immer mit Karte."],
    ["es310", "el dólar", "los dólares", "dollar", "der Dollar", "Son veinte dólares.", "That's twenty dollars.", "Das macht zwanzig Dollar."],
    ["es311", "el cajero", "los cajeros", "cash machine, ATM; cashier", "der Geldautomat; der Kassierer", "¿Hay un cajero por aquí?", "Is there a cash machine around here?", "Gibt es hier einen Geldautomaten?"],
    ["es312", "el billete", "los billetes", "banknote; ticket (Latin America also: el boleto)", "der Geldschein; die Fahrkarte", "Solo tengo un billete de cincuenta.", "I only have a fifty-euro note.", "Ich habe nur einen Fünfziger."],
    ["es313", "el efectivo", "–", "cash", "das Bargeld", "¿Paga en efectivo o con tarjeta?", "Are you paying in cash or by card?", "Zahlen Sie bar oder mit Karte?"],
    ["es314", "cambiar", "", "to change, to exchange", "wechseln, ändern, umtauschen", "Quiero cambiar dólares por euros.", "I'd like to change dollars into euros.", "Ich möchte Dollar in Euro wechseln."]
  ]);

  add("day/0", 1, [
    ["es315", "levantarse", "", "to get up", "aufstehen", "Me levanto a las siete.", "I get up at seven.", "Ich stehe um sieben auf."],
    ["es316", "ducharse", "", "to have a shower", "duschen", "Me ducho por la mañana.", "I shower in the morning.", "Ich dusche morgens."],
    ["es317", "acostarse", "", "to go to bed", "ins Bett gehen", "Me acuesto a las once.", "I go to bed at eleven.", "Ich gehe um elf ins Bett."],
    ["es318", "dormir", "", "to sleep", "schlafen", "Duermo ocho horas.", "I sleep eight hours.", "Ich schlafe acht Stunden."]
  ]);
  add("day/0", 2, [
    ["es319", "despertarse", "", "to wake up", "aufwachen", "Me despierto antes del despertador.", "I wake up before the alarm clock.", "Ich wache vor dem Wecker auf."],
    ["es320", "lavarse", "", "to wash (oneself)", "sich waschen", "Lávate las manos antes de comer.", "Wash your hands before eating.", "Wasch dir vor dem Essen die Hände."],
    ["es321", "vestirse", "", "to get dressed", "sich anziehen", "Me visto y salgo de casa.", "I get dressed and leave the house.", "Ich ziehe mich an und gehe aus dem Haus."],
    ["es322", "descansar", "", "to rest", "sich ausruhen", "El domingo descanso.", "On Sunday I rest.", "Am Sonntag ruhe ich mich aus."]
  ]);

  add("day/1", 1, [
    ["es323", "la casa", "las casas", "house; home", "das Haus; das Zuhause", "Hoy me quedo en casa.", "I'm staying at home today.", "Heute bleibe ich zu Hause."],
    ["es324", "vivir", "", "to live", "wohnen, leben", "Vivo en Barcelona.", "I live in Barcelona.", "Ich wohne in Barcelona."],
    ["es325", "la habitación", "las habitaciones", "room; bedroom", "das Zimmer", "Mi habitación es pequeña.", "My room is small.", "Mein Zimmer ist klein."],
    ["es326", "la cocina", "las cocinas", "kitchen; cooking", "die Küche", "La cocina es muy moderna.", "The kitchen is very modern.", "Die Küche ist sehr modern."],
    ["es327", "el baño", "los baños", "bathroom; toilet", "das Bad; die Toilette", "¿Dónde está el baño?", "Where is the bathroom?", "Wo ist die Toilette?"],
    ["es328", "la puerta", "las puertas", "door", "die Tür", "Cierra la puerta, por favor.", "Close the door, please.", "Mach bitte die Tür zu."],
    ["es329", "la mesa", "las mesas", "table", "der Tisch", "La comida está en la mesa.", "The food is on the table.", "Das Essen steht auf dem Tisch."],
    ["es330", "la cama", "las camas", "bed", "das Bett", "Los niños ya están en la cama.", "The children are already in bed.", "Die Kinder sind schon im Bett."]
  ]);
  add("day/1", 2, [
    ["es331", "la ventana", "las ventanas", "window", "das Fenster", "Abre la ventana, hace calor.", "Open the window, it's hot.", "Mach das Fenster auf, es ist heiß."],
    ["es332", "la silla", "las sillas", "chair", "der Stuhl", "Siéntate en esta silla.", "Sit on this chair.", "Setz dich auf diesen Stuhl."],
    ["es333", "el apartamento", "los apartamentos", "flat, apartment (Spain: el piso)", "die Wohnung", "Mi apartamento tiene dos habitaciones.", "My flat has two bedrooms.", "Meine Wohnung hat zwei Zimmer."],
    ["es334", "la llave", "las llaves", "key", "der Schlüssel", "¿Dónde están las llaves?", "Where are the keys?", "Wo sind die Schlüssel?"],
    ["es335", "el jardín", "los jardines", "garden", "der Garten", "Los niños juegan en el jardín.", "The children play in the garden.", "Die Kinder spielen im Garten."],
    ["es336", "el refrigerador", "los refrigeradores", "fridge (Spain: la nevera)", "der Kühlschrank", "La leche está en el refrigerador.", "The milk is in the fridge.", "Die Milch ist im Kühlschrank."],
    ["es337", "limpiar", "", "to clean", "putzen, sauber machen", "Los sábados limpio la casa.", "On Saturdays I clean the house.", "Samstags putze ich das Haus."],
    ["es338", "lavar", "", "to wash", "waschen", "Tengo que lavar la ropa.", "I have to wash the clothes.", "Ich muss die Wäsche waschen."]
  ]);

  add("clothes/0", 1, [
    ["es339", "la ropa", "–", "clothes", "die Kleidung", "Necesito ropa nueva.", "I need new clothes.", "Ich brauche neue Kleidung."],
    ["es340", "llevar", "", "to wear; to carry, to take", "tragen; mitnehmen, bringen", "Hoy llevo una camisa azul.", "Today I'm wearing a blue shirt.", "Heute trage ich ein blaues Hemd."],
    ["es341", "la camisa", "las camisas", "shirt", "das Hemd", "Esta camisa es de algodón.", "This shirt is cotton.", "Dieses Hemd ist aus Baumwolle."],
    ["es342", "el pantalón", "los pantalones", "trousers, pants (often plural)", "die Hose", "Estos pantalones son muy cómodos.", "These trousers are very comfortable.", "Diese Hose ist sehr bequem."],
    ["es343", "el zapato", "los zapatos", "shoe", "der Schuh", "Me compro unos zapatos negros.", "I'm buying some black shoes.", "Ich kaufe mir schwarze Schuhe."]
  ]);
  add("clothes/0", 2, [
    ["es344", "la camiseta", "las camisetas", "T-shirt", "das T-Shirt", "En verano llevo camiseta.", "In summer I wear a T-shirt.", "Im Sommer trage ich T-Shirt."],
    ["es345", "la falda", "las faldas", "skirt", "der Rock", "Me gusta tu falda.", "I like your skirt.", "Dein Rock gefällt mir."],
    ["es346", "el vestido", "los vestidos", "dress", "das Kleid", "Lleva un vestido verde.", "She's wearing a green dress.", "Sie trägt ein grünes Kleid."],
    ["es347", "el abrigo", "los abrigos", "coat", "der Mantel", "Ponte el abrigo, hace frío.", "Put your coat on, it's cold.", "Zieh den Mantel an, es ist kalt."],
    ["es348", "el suéter", "los suéteres", "jumper, sweater (Spain: el jersey)", "der Pullover", "Este suéter abriga mucho.", "This jumper is very warm.", "Dieser Pullover hält schön warm."],
    ["es349", "la chaqueta", "las chaquetas", "jacket", "die Jacke", "Llévate una chaqueta por si acaso.", "Take a jacket just in case.", "Nimm sicherheitshalber eine Jacke mit."],
    ["es350", "ponerse", "", "to put on (clothes)", "anziehen, aufsetzen", "Me pongo los zapatos y salimos.", "I'll put my shoes on and we'll go.", "Ich ziehe die Schuhe an und wir gehen."]
  ]);

  add("clothes/1", 1, [
    ["es351", "el teléfono", "los teléfonos", "telephone, phone", "das Telefon", "El teléfono está sonando.", "The phone is ringing.", "Das Telefon klingelt."],
    ["es352", "el celular", "los celulares", "mobile phone, cell phone (Spain: el móvil)", "das Handy", "Mi celular no tiene batería.", "My mobile's battery is dead.", "Mein Handy hat keinen Akku mehr."],
    ["es353", "la computadora", "las computadoras", "computer (Spain: el ordenador)", "der Computer", "Trabajo con la computadora.", "I work on the computer.", "Ich arbeite am Computer."],
    ["es354", "llamar", "", "to call, to phone", "anrufen, rufen", "Te llamo mañana.", "I'll call you tomorrow.", "Ich rufe dich morgen an."]
  ]);
  add("clothes/1", 2, [
    ["es355", "la televisión", "las televisiones", "television", "das Fernsehen, der Fernseher", "Por la noche vemos la televisión.", "In the evening we watch television.", "Abends sehen wir fern."],
    ["es356", "la foto", "las fotos", "photo (feminine)", "das Foto", "¿Me haces una foto?", "Will you take a photo of me?", "Machst du ein Foto von mir?"],
    ["es357", "la radio", "las radios", "radio (feminine)", "das Radio", "Escucho la radio en el carro.", "I listen to the radio in the car.", "Ich höre im Auto Radio."],
    ["es358", "internet", "–", "internet (usually no article)", "das Internet", "Busco la dirección en internet.", "I'll look up the address on the internet.", "Ich suche die Adresse im Internet."],
    ["es359", "el correo electrónico", "los correos electrónicos", "email", "die E-Mail", "Te mando un correo electrónico.", "I'll send you an email.", "Ich schicke dir eine E-Mail."],
    ["es360", "el mensaje", "los mensajes", "message", "die Nachricht", "Tengo un mensaje de mi madre.", "I have a message from my mother.", "Ich habe eine Nachricht von meiner Mutter."],
    ["es361", "la pantalla", "las pantallas", "screen", "der Bildschirm", "La pantalla de mi celular está rota.", "My phone screen is broken.", "Der Bildschirm von meinem Handy ist kaputt."],
    ["es362", "enviar", "", "to send", "schicken, senden", "Te envío las fotos esta noche.", "I'll send you the photos tonight.", "Ich schicke dir die Fotos heute Abend."]
  ]);

  add("town/0", 1, [
    ["es363", "la ciudad", "las ciudades", "city, town", "die Stadt", "Sevilla es una ciudad preciosa.", "Seville is a beautiful city.", "Sevilla ist eine wunderschöne Stadt."],
    ["es364", "la calle", "las calles", "street", "die Straße", "Vivo en esta calle.", "I live on this street.", "Ich wohne in dieser Straße."],
    ["es365", "el banco", "los bancos", "bank; bench", "die Bank", "El banco cierra a las dos.", "The bank closes at two.", "Die Bank schließt um zwei."],
    ["es366", "el parque", "los parques", "park", "der Park", "Paseamos por el parque.", "We go for a walk in the park.", "Wir gehen im Park spazieren."]
  ]);
  add("town/0", 2, [
    ["es367", "el hotel", "los hoteles", "hotel", "das Hotel", "El hotel está cerca de la playa.", "The hotel is near the beach.", "Das Hotel ist in der Nähe des Strandes."],
    ["es368", "el hospital", "los hospitales", "hospital", "das Krankenhaus", "Mi madre trabaja en el hospital.", "My mother works at the hospital.", "Meine Mutter arbeitet im Krankenhaus."],
    ["es369", "la plaza", "las plazas", "square", "der Platz", "Nos vemos en la plaza.", "Let's meet in the square.", "Wir treffen uns auf dem Platz."],
    ["es370", "la iglesia", "las iglesias", "church", "die Kirche", "La iglesia es muy antigua.", "The church is very old.", "Die Kirche ist sehr alt."],
    ["es371", "el centro", "los centros", "centre, town centre", "das Zentrum, die Innenstadt", "Trabajo en el centro.", "I work in the town centre.", "Ich arbeite in der Innenstadt."],
    ["es372", "el museo", "los museos", "museum", "das Museum", "El museo está cerrado los lunes.", "The museum is closed on Mondays.", "Das Museum ist montags geschlossen."],
    ["es373", "la farmacia", "las farmacias", "chemist's, pharmacy", "die Apotheke", "¿Hay una farmacia por aquí?", "Is there a chemist's around here?", "Gibt es hier eine Apotheke?"],
    ["es374", "el pueblo", "los pueblos", "village, small town; people (nation)", "das Dorf; das Volk", "Mis abuelos viven en un pueblo.", "My grandparents live in a village.", "Meine Großeltern wohnen in einem Dorf."],
    ["es375", "el barrio", "los barrios", "neighbourhood, district", "das Viertel, der Stadtteil", "Mi barrio es muy tranquilo.", "My neighbourhood is very quiet.", "Mein Viertel ist sehr ruhig."],
    ["es376", "el edificio", "los edificios", "building", "das Gebäude", "Vivo en un edificio de diez pisos.", "I live in a ten-storey building.", "Ich wohne in einem Gebäude mit zehn Stockwerken."]
  ]);

  add("town/1", 1, [
    ["es377", "aquí", "", "here", "hier", "Ven aquí, por favor.", "Come here, please.", "Komm bitte her."],
    ["es378", "allí", "", "there", "dort", "Mi casa está allí.", "My house is over there.", "Mein Haus ist dort."],
    ["es379", "cerca", "", "near, close", "nah, in der Nähe", "El banco está cerca de aquí.", "The bank is near here.", "Die Bank ist hier in der Nähe."],
    ["es380", "lejos", "", "far", "weit (weg)", "Mi trabajo está lejos de casa.", "My work is far from home.", "Meine Arbeit ist weit von zu Hause."],
    ["es381", "arriba", "", "up, upstairs, above", "oben, nach oben", "El baño está arriba.", "The bathroom is upstairs.", "Das Bad ist oben."],
    ["es382", "abajo", "", "down, downstairs, below", "unten, nach unten", "Te espero abajo.", "I'll wait for you downstairs.", "Ich warte unten auf dich."],
    ["es383", "la izquierda", "–", "left (a la izquierda: on the left)", "links, die linke Seite", "Gira a la izquierda.", "Turn left.", "Bieg links ab."],
    ["es384", "la derecha", "–", "right (a la derecha: on the right)", "rechts, die rechte Seite", "El museo está a la derecha.", "The museum is on the right.", "Das Museum ist rechts."],
    ["es385", "delante", "", "in front, ahead", "vorne, davor", "Hay un parque delante de mi casa.", "There's a park in front of my house.", "Vor meinem Haus ist ein Park."],
    ["es386", "detrás", "", "behind", "hinten, dahinter", "El jardín está detrás de la casa.", "The garden is behind the house.", "Der Garten ist hinter dem Haus."]
  ]);
  add("town/1", 2, [
    ["es387", "al lado", "", "next to, beside", "neben, nebenan", "La farmacia está al lado del banco.", "The chemist's is next to the bank.", "Die Apotheke ist neben der Bank."],
    ["es388", "dentro", "", "inside", "drinnen, innen", "Hace frío, vamos dentro.", "It's cold, let's go inside.", "Es ist kalt, gehen wir rein."],
    ["es389", "fuera", "", "outside", "draußen, außen", "Hace buen tiempo, comemos fuera.", "The weather is nice, let's eat outside.", "Das Wetter ist schön, wir essen draußen."],
    ["es390", "enfrente", "", "opposite", "gegenüber", "El hotel está enfrente de la estación.", "The hotel is opposite the station.", "Das Hotel ist gegenüber vom Bahnhof."],
    ["es391", "la esquina", "las esquinas", "corner (of a street)", "die Ecke", "En la esquina hay un café.", "There's a café on the corner.", "An der Ecke ist ein Café."],
    ["es392", "recto", "", "straight (todo recto: straight on)", "gerade (immer geradeaus)", "Siga todo recto hasta la plaza.", "Go straight on to the square.", "Gehen Sie immer geradeaus bis zum Platz."]
  ]);

  add("town/2", 1, [
    ["es393", "desde", "", "from, since", "von, seit", "Vivo aquí desde 2020.", "I've lived here since 2020.", "Ich wohne seit 2020 hier."],
    ["es394", "hasta", "", "until, as far as", "bis", "Trabajo hasta las seis.", "I work until six.", "Ich arbeite bis sechs."]
  ]);
  add("town/2", 2, [
    ["es395", "hacia", "", "towards", "in Richtung, nach", "Caminamos hacia el centro.", "We walk towards the centre.", "Wir gehen in Richtung Zentrum."],
    ["es396", "cruzar", "", "to cross", "überqueren", "Cruza la calle con cuidado.", "Cross the street carefully.", "Überquere die Straße vorsichtig."]
  ]);

  add("travel/0", 1, [
    ["es397", "ir", "", "to go", "gehen, fahren", "Voy al trabajo en autobús.", "I go to work by bus.", "Ich fahre mit dem Bus zur Arbeit."],
    ["es398", "venir", "", "to come", "kommen", "¿Vienes a la fiesta?", "Are you coming to the party?", "Kommst du zur Party?"],
    ["es399", "llegar", "", "to arrive", "ankommen", "El tren llega a las diez.", "The train arrives at ten.", "Der Zug kommt um zehn an."],
    ["es400", "salir", "", "to leave, to go out", "abfahren, ausgehen, hinausgehen", "Salgo de casa a las ocho.", "I leave home at eight.", "Ich gehe um acht aus dem Haus."],
    ["es401", "volver", "", "to come back, to return", "zurückkommen, zurückkehren", "Vuelvo a las cinco.", "I'll be back at five.", "Ich bin um fünf zurück."],
    ["es402", "caminar", "", "to walk", "gehen, zu Fuß gehen", "Camino una hora todos los días.", "I walk for an hour every day.", "Ich gehe jeden Tag eine Stunde zu Fuß."]
  ]);
  add("travel/0", 2, [
    ["es403", "entrar", "", "to go in, to enter", "hineingehen, eintreten", "¿Puedo entrar?", "May I come in?", "Darf ich hereinkommen?"],
    ["es404", "a pie", "", "on foot", "zu Fuß", "Voy al colegio a pie.", "I go to school on foot.", "Ich gehe zu Fuß zur Schule."],
    ["es405", "subir", "", "to go up; to get on", "hinaufgehen; einsteigen", "Subimos al autobús.", "We get on the bus.", "Wir steigen in den Bus ein."],
    ["es406", "bajar", "", "to go down; to get off", "hinuntergehen; aussteigen", "Bajo en la próxima parada.", "I'm getting off at the next stop.", "Ich steige an der nächsten Haltestelle aus."],
    ["es407", "pasar", "", "to pass, to go through; to happen; to spend (time)", "vorbeigehen; passieren; verbringen", "¿Qué pasa?", "What's happening?", "Was ist los?"],
    ["es408", "quedarse", "", "to stay", "bleiben", "Me quedo en casa hoy.", "I'm staying at home today.", "Ich bleibe heute zu Hause."]
  ]);

  add("travel/1", 1, [
    ["es409", "el carro", "los carros", "car (Spain: el coche; Argentina: el auto)", "das Auto", "Mi carro es rojo.", "My car is red.", "Mein Auto ist rot."],
    ["es410", "el autobús", "los autobuses", "bus", "der Bus", "Espero el autobús.", "I'm waiting for the bus.", "Ich warte auf den Bus."],
    ["es411", "el tren", "los trenes", "train", "der Zug", "El tren sale a las nueve.", "The train leaves at nine.", "Der Zug fährt um neun ab."],
    ["es412", "el avión", "los aviones", "plane", "das Flugzeug", "Vamos a Lima en avión.", "We're flying to Lima.", "Wir fliegen nach Lima."],
    ["es413", "la estación", "las estaciones", "station; season", "der Bahnhof; die Jahreszeit", "La estación está cerca.", "The station is nearby.", "Der Bahnhof ist in der Nähe."]
  ]);
  add("travel/1", 2, [
    ["es414", "la bicicleta", "las bicicletas", "bicycle", "das Fahrrad", "Voy a la universidad en bicicleta.", "I cycle to university.", "Ich fahre mit dem Fahrrad zur Uni."],
    ["es415", "el aeropuerto", "los aeropuertos", "airport", "der Flughafen", "¿Cómo llego al aeropuerto?", "How do I get to the airport?", "Wie komme ich zum Flughafen?"],
    ["es416", "el barco", "los barcos", "boat, ship", "das Schiff, das Boot", "Vamos a la isla en barco.", "We're going to the island by boat.", "Wir fahren mit dem Schiff auf die Insel."],
    ["es417", "el metro", "los metros", "underground, subway; metre", "die U-Bahn; der Meter", "Voy al trabajo en metro.", "I go to work by underground.", "Ich fahre mit der U-Bahn zur Arbeit."],
    ["es418", "el taxi", "los taxis", "taxi", "das Taxi", "Llamamos un taxi.", "Let's call a taxi.", "Wir rufen ein Taxi."],
    ["es419", "la parada", "las paradas", "stop (bus, tram)", "die Haltestelle", "La parada está enfrente del hotel.", "The stop is opposite the hotel.", "Die Haltestelle ist gegenüber vom Hotel."],
    ["es420", "manejar", "", "to drive (Spain: conducir)", "Auto fahren", "¿Sabes manejar?", "Can you drive?", "Kannst du Auto fahren?"]
  ]);

  add("travel/2", 1, [
    ["es421", "viajar", "", "to travel", "reisen", "Me gusta mucho viajar.", "I love travelling.", "Ich reise sehr gern."],
    ["es422", "el viaje", "los viajes", "trip, journey", "die Reise", "¡Buen viaje!", "Have a good trip!", "Gute Reise!"],
    ["es423", "las vacaciones", "–", "holidays, vacation", "der Urlaub, die Ferien", "En agosto estoy de vacaciones.", "In August I'm on holiday.", "Im August habe ich Urlaub."]
  ]);
  add("travel/2", 2, [
    ["es424", "la maleta", "las maletas", "suitcase", "der Koffer", "Mi maleta es azul.", "My suitcase is blue.", "Mein Koffer ist blau."],
    ["es425", "el turista", "los turistas", "tourist (also: la turista)", "der Tourist, die Touristin", "En verano hay muchos turistas.", "There are many tourists in summer.", "Im Sommer gibt es viele Touristen."],
    ["es426", "el pasaporte", "los pasaportes", "passport", "der Reisepass", "No olvides el pasaporte.", "Don't forget your passport.", "Vergiss den Reisepass nicht."],
    ["es427", "el vuelo", "los vuelos", "flight", "der Flug", "El vuelo sale a las seis.", "The flight leaves at six.", "Der Flug geht um sechs."],
    ["es428", "el equipaje", "–", "luggage, baggage", "das Gepäck", "Mi equipaje no ha llegado.", "My luggage hasn't arrived.", "Mein Gepäck ist nicht angekommen."],
    ["es429", "visitar", "", "to visit", "besuchen, besichtigen", "Quiero visitar el museo.", "I want to visit the museum.", "Ich möchte das Museum besuchen."]
  ]);

  add("body/0", 1, [
    ["es430", "la cabeza", "las cabezas", "head", "der Kopf", "Me duele la cabeza.", "I have a headache.", "Ich habe Kopfschmerzen."],
    ["es431", "la cara", "las caras", "face", "das Gesicht", "Tiene una cara muy simpática.", "She has a very friendly face.", "Sie hat ein sehr freundliches Gesicht."],
    ["es432", "el ojo", "los ojos", "eye", "das Auge", "Mi hija tiene los ojos verdes.", "My daughter has green eyes.", "Meine Tochter hat grüne Augen."],
    ["es433", "la boca", "las bocas", "mouth", "der Mund", "No hables con la boca llena.", "Don't talk with your mouth full.", "Sprich nicht mit vollem Mund."],
    ["es434", "el pelo", "los pelos", "hair", "das Haar, die Haare", "Ana tiene el pelo largo.", "Ana has long hair.", "Ana hat lange Haare."],
    ["es435", "la mano", "las manos", "hand (feminine)", "die Hand", "Lávate las manos.", "Wash your hands.", "Wasch dir die Hände."],
    ["es436", "el pie", "los pies", "foot", "der Fuß", "Me duelen los pies.", "My feet hurt.", "Mir tun die Füße weh."]
  ]);
  add("body/0", 2, [
    ["es437", "la nariz", "las narices", "nose", "die Nase", "Tengo la nariz roja por el frío.", "My nose is red from the cold.", "Meine Nase ist rot vor Kälte."],
    ["es438", "la pierna", "las piernas", "leg", "das Bein", "Me duele la pierna derecha.", "My right leg hurts.", "Mir tut das rechte Bein weh."],
    ["es439", "el cuerpo", "los cuerpos", "body", "der Körper", "El deporte es bueno para el cuerpo.", "Sport is good for the body.", "Sport ist gut für den Körper."],
    ["es440", "el diente", "los dientes", "tooth", "der Zahn", "Me lavo los dientes tres veces al día.", "I brush my teeth three times a day.", "Ich putze mir dreimal am Tag die Zähne."],
    ["es441", "el brazo", "los brazos", "arm", "der Arm", "Me duele el brazo.", "My arm hurts.", "Mir tut der Arm weh."],
    ["es442", "la espalda", "las espaldas", "back", "der Rücken", "Tengo dolor de espalda.", "I have backache.", "Ich habe Rückenschmerzen."],
    ["es443", "el estómago", "los estómagos", "stomach", "der Magen", "Me duele el estómago.", "I have a stomach ache.", "Ich habe Bauchschmerzen."],
    ["es444", "el corazón", "los corazones", "heart", "das Herz", "Tiene un corazón de oro.", "He has a heart of gold.", "Er hat ein Herz aus Gold."]
  ]);

  add("body/1", 1, [
    ["es445", "el médico", "los médicos", "doctor (f. la médica)", "der Arzt, die Ärztin", "Tengo que ir al médico.", "I have to go to the doctor.", "Ich muss zum Arzt gehen."],
    ["es446", "enfermo", "", "ill, sick", "krank", "Hoy estoy enfermo.", "I'm ill today.", "Heute bin ich krank."],
    ["es447", "doler", "", "to hurt", "wehtun", "Me duele la garganta.", "I have a sore throat.", "Mir tut der Hals weh."]
  ]);
  add("body/1", 2, [
    ["es448", "el dolor", "los dolores", "pain", "der Schmerz", "Tengo un dolor muy fuerte.", "I have a very bad pain.", "Ich habe sehr starke Schmerzen."],
    ["es449", "sano", "", "healthy", "gesund", "La fruta es muy sana.", "Fruit is very healthy.", "Obst ist sehr gesund."],
    ["es450", "la medicina", "las medicinas", "medicine", "das Medikament, die Medizin", "Toma la medicina después de comer.", "Take the medicine after eating.", "Nimm das Medikament nach dem Essen."],
    ["es451", "la salud", "–", "health", "die Gesundheit", "La salud es lo más importante.", "Health is the most important thing.", "Gesundheit ist das Wichtigste."],
    ["es452", "la fiebre", "–", "fever, temperature", "das Fieber", "El niño tiene fiebre.", "The child has a temperature.", "Das Kind hat Fieber."],
    ["es453", "el resfriado", "los resfriados", "cold (illness)", "die Erkältung", "Tengo un resfriado.", "I have a cold.", "Ich habe eine Erkältung."]
  ]);

  add("nature/0", 1, [
    ["es454", "el tiempo", "–", "weather; time", "das Wetter; die Zeit", "¿Qué tiempo hace hoy?", "What's the weather like today?", "Wie ist das Wetter heute?"],
    ["es455", "el sol", "–", "sun", "die Sonne", "Hoy hace sol.", "It's sunny today.", "Heute scheint die Sonne."],
    ["es456", "la lluvia", "las lluvias", "rain", "der Regen", "Me gusta el sonido de la lluvia.", "I like the sound of the rain.", "Ich mag das Geräusch des Regens."],
    ["es457", "llover", "", "to rain", "regnen", "Llueve mucho en Galicia.", "It rains a lot in Galicia.", "In Galicien regnet es viel."],
    ["es458", "el calor", "–", "heat, warmth", "die Hitze, die Wärme", "Hace mucho calor.", "It's very hot.", "Es ist sehr heiß."],
    ["es459", "el frío", "–", "cold (noun)", "die Kälte", "Tengo frío.", "I'm cold.", "Mir ist kalt."]
  ]);
  add("nature/0", 2, [
    ["es460", "la nieve", "–", "snow", "der Schnee", "A los niños les encanta la nieve.", "Children love snow.", "Kinder lieben Schnee."],
    ["es461", "nevar", "", "to snow", "schneien", "Nieva en la montaña.", "It's snowing in the mountains.", "In den Bergen schneit es."],
    ["es462", "la nube", "las nubes", "cloud", "die Wolke", "Hoy no hay ni una nube.", "There isn't a single cloud today.", "Heute gibt es keine einzige Wolke."],
    ["es463", "el viento", "los vientos", "wind", "der Wind", "Hace mucho viento.", "It's very windy.", "Es ist sehr windig."],
    ["es464", "la temperatura", "las temperaturas", "temperature", "die Temperatur", "La temperatura baja por la noche.", "The temperature drops at night.", "Nachts sinkt die Temperatur."]
  ]);

  add("nature/1", 1, [
    ["es465", "el mar", "los mares", "sea", "das Meer", "Me encanta nadar en el mar.", "I love swimming in the sea.", "Ich schwimme sehr gern im Meer."],
    ["es466", "la playa", "las playas", "beach", "der Strand", "En julio vamos a la playa.", "In July we go to the beach.", "Im Juli fahren wir an den Strand."],
    ["es467", "la montaña", "las montañas", "mountain", "der Berg", "Subimos a la montaña.", "We're climbing the mountain.", "Wir steigen auf den Berg."],
    ["es468", "el río", "los ríos", "river", "der Fluss", "El río pasa por la ciudad.", "The river runs through the city.", "Der Fluss fließt durch die Stadt."],
    ["es469", "la flor", "las flores", "flower", "die Blume", "Te compro unas flores.", "I'll buy you some flowers.", "Ich kaufe dir Blumen."]
  ]);
  add("nature/1", 2, [
    ["es470", "el árbol", "los árboles", "tree", "der Baum", "Hay un árbol grande en el jardín.", "There's a big tree in the garden.", "Im Garten steht ein großer Baum."],
    ["es471", "el lago", "los lagos", "lake", "der See", "Nadamos en el lago.", "We swim in the lake.", "Wir schwimmen im See."],
    ["es472", "el cielo", "los cielos", "sky; heaven", "der Himmel", "El cielo está muy azul.", "The sky is very blue.", "Der Himmel ist sehr blau."],
    ["es473", "el campo", "los campos", "countryside; field", "das Land (auf dem Land); das Feld", "Mis abuelos viven en el campo.", "My grandparents live in the country.", "Meine Großeltern wohnen auf dem Land."],
    ["es474", "la isla", "las islas", "island", "die Insel", "Mallorca es una isla muy bonita.", "Mallorca is a very beautiful island.", "Mallorca ist eine sehr schöne Insel."],
    ["es475", "el bosque", "los bosques", "forest, wood", "der Wald", "Paseamos por el bosque.", "We go for a walk in the forest.", "Wir gehen im Wald spazieren."],
    ["es476", "la luna", "las lunas", "moon", "der Mond", "Esta noche hay luna llena.", "There's a full moon tonight.", "Heute Nacht ist Vollmond."]
  ]);

  add("nature/2", 1, [
    ["es477", "el animal", "los animales", "animal", "das Tier", "¿Cuál es tu animal favorito?", "What's your favourite animal?", "Was ist dein Lieblingstier?"],
    ["es478", "el perro", "los perros", "dog", "der Hund", "Mi perro se llama Toby.", "My dog is called Toby.", "Mein Hund heißt Toby."],
    ["es479", "el gato", "los gatos", "cat", "die Katze", "El gato duerme en el sofá.", "The cat is sleeping on the sofa.", "Die Katze schläft auf dem Sofa."]
  ]);
  add("nature/2", 2, [
    ["es480", "el pájaro", "los pájaros", "bird", "der Vogel", "Por la mañana cantan los pájaros.", "The birds sing in the morning.", "Morgens singen die Vögel."],
    ["es481", "el pez", "los peces", "fish (alive)", "der Fisch (lebendig)", "Hay muchos peces en el río.", "There are lots of fish in the river.", "Im Fluss gibt es viele Fische."],
    ["es482", "el caballo", "los caballos", "horse", "das Pferd", "Mi hermana monta a caballo.", "My sister rides horses.", "Meine Schwester reitet."],
    ["es483", "la vaca", "las vacas", "cow", "die Kuh", "Las vacas comen hierba.", "Cows eat grass.", "Kühe fressen Gras."]
  ]);

  add("free/0", 1, [
    ["es484", "el deporte", "los deportes", "sport", "der Sport", "¿Haces deporte?", "Do you do any sport?", "Treibst du Sport?"],
    ["es485", "el fútbol", "–", "football, soccer", "der Fußball", "El fútbol es muy popular en España.", "Football is very popular in Spain.", "Fußball ist in Spanien sehr beliebt."],
    ["es486", "jugar", "", "to play", "spielen", "Los niños juegan en el parque.", "The children play in the park.", "Die Kinder spielen im Park."],
    ["es487", "correr", "", "to run", "laufen, rennen", "Corro todas las mañanas.", "I run every morning.", "Ich laufe jeden Morgen."]
  ]);
  add("free/0", 2, [
    ["es488", "nadar", "", "to swim", "schwimmen", "¿Sabes nadar?", "Can you swim?", "Kannst du schwimmen?"],
    ["es489", "la pelota", "las pelotas", "ball", "der Ball", "El perro juega con la pelota.", "The dog is playing with the ball.", "Der Hund spielt mit dem Ball."],
    ["es490", "el partido", "los partidos", "match, game", "das Spiel", "¿Vemos el partido esta noche?", "Shall we watch the match tonight?", "Schauen wir heute Abend das Spiel?"],
    ["es491", "el equipo", "los equipos", "team; equipment", "die Mannschaft; die Ausrüstung", "¿Cuál es tu equipo favorito?", "What's your favourite team?", "Was ist deine Lieblingsmannschaft?"],
    ["es492", "ganar", "", "to win; to earn", "gewinnen; verdienen", "Nuestro equipo siempre gana.", "Our team always wins.", "Unsere Mannschaft gewinnt immer."],
    ["es493", "perder", "", "to lose; to miss", "verlieren; verpassen", "No quiero perder el tren.", "I don't want to miss the train.", "Ich will den Zug nicht verpassen."],
    ["es494", "la piscina", "las piscinas", "swimming pool", "das Schwimmbad", "En verano vamos a la piscina.", "In summer we go to the pool.", "Im Sommer gehen wir ins Schwimmbad."]
  ]);

  add("free/1", 1, [
    ["es495", "el amigo", "los amigos", "friend (f. la amiga)", "der Freund, die Freundin", "Mi amigo Juan vive en Bogotá.", "My friend Juan lives in Bogotá.", "Mein Freund Juan wohnt in Bogotá."],
    ["es496", "la fiesta", "las fiestas", "party; festival", "die Party, das Fest", "El sábado hay una fiesta.", "There's a party on Saturday.", "Am Samstag gibt es eine Party."],
    ["es497", "la música", "–", "music", "die Musik", "Escucho música en el tren.", "I listen to music on the train.", "Ich höre im Zug Musik."],
    ["es498", "el cine", "los cines", "cinema", "das Kino", "¿Vamos al cine?", "Shall we go to the cinema?", "Gehen wir ins Kino?"],
    ["es499", "la película", "las películas", "film, movie", "der Film", "La película es muy buena.", "The film is very good.", "Der Film ist sehr gut."],
    ["es500", "leer", "", "to read", "lesen", "Me gusta leer en la cama.", "I like reading in bed.", "Ich lese gern im Bett."]
  ]);
  add("free/1", 2, [
    ["es501", "bailar", "", "to dance", "tanzen", "¿Quieres bailar?", "Would you like to dance?", "Möchtest du tanzen?"],
    ["es502", "cantar", "", "to sing", "singen", "Mi abuela canta muy bien.", "My grandmother sings very well.", "Meine Großmutter singt sehr gut."],
    ["es503", "la canción", "las canciones", "song", "das Lied", "Esta canción es preciosa.", "This song is beautiful.", "Dieses Lied ist wunderschön."],
    ["es504", "tocar", "", "to play (an instrument); to touch", "spielen (Instrument); berühren", "Mi hermano toca la guitarra.", "My brother plays the guitar.", "Mein Bruder spielt Gitarre."],
    ["es505", "el regalo", "los regalos", "present, gift", "das Geschenk", "Este regalo es para ti.", "This present is for you.", "Dieses Geschenk ist für dich."],
    ["es506", "invitar", "", "to invite; to treat", "einladen", "Te invito a cenar.", "I'm inviting you to dinner.", "Ich lade dich zum Abendessen ein."]
  ]);

  add("school/0", 1, [
    ["es507", "la escuela", "las escuelas", "school", "die Schule", "Mis hijos van a la escuela a pie.", "My children walk to school.", "Meine Kinder gehen zu Fuß zur Schule."],
    ["es508", "la clase", "las clases", "class; lesson; classroom", "die Klasse; der Unterricht; das Klassenzimmer", "La clase empieza a las nueve.", "The lesson starts at nine.", "Der Unterricht beginnt um neun."],
    ["es509", "el profesor", "los profesores", "teacher (f. la profesora)", "der Lehrer, die Lehrerin", "Mi profesora es de Sevilla.", "My teacher is from Seville.", "Meine Lehrerin kommt aus Sevilla."],
    ["es510", "el estudiante", "los estudiantes", "student (also: la estudiante)", "der Student, die Studentin", "Soy estudiante de medicina.", "I'm a medical student.", "Ich bin Medizinstudent."],
    ["es511", "la universidad", "las universidades", "university", "die Universität", "Estudio en la universidad.", "I study at university.", "Ich studiere an der Universität."],
    ["es512", "el libro", "los libros", "book", "das Buch", "Estoy leyendo un libro muy bueno.", "I'm reading a very good book.", "Ich lese gerade ein sehr gutes Buch."]
  ]);
  add("school/0", 2, [
    ["es513", "el cuaderno", "los cuadernos", "exercise book, notebook", "das Heft", "Escribe las palabras en el cuaderno.", "Write the words in your exercise book.", "Schreib die Wörter ins Heft."],
    ["es514", "el papel", "los papeles", "paper", "das Papier", "¿Tienes un papel?", "Do you have a piece of paper?", "Hast du ein Blatt Papier?"],
    ["es515", "el lápiz", "los lápices", "pencil", "der Bleistift", "Escribe con lápiz, por favor.", "Write in pencil, please.", "Schreib bitte mit Bleistift."],
    ["es516", "el bolígrafo", "los bolígrafos", "pen (ballpoint)", "der Kugelschreiber", "¿Me prestas un bolígrafo?", "Can you lend me a pen?", "Leihst du mir einen Kuli?"],
    ["es517", "el examen", "los exámenes", "exam, test", "die Prüfung", "Mañana tengo un examen de español.", "I have a Spanish exam tomorrow.", "Morgen habe ich eine Spanischprüfung."]
  ]);

  add("school/1", 1, [
    ["es518", "aprender", "", "to learn", "lernen", "Aprendo español en internet.", "I'm learning Spanish online.", "Ich lerne Spanisch im Internet."],
    ["es519", "estudiar", "", "to study", "lernen, studieren", "Mi hermana estudia medicina.", "My sister studies medicine.", "Meine Schwester studiert Medizin."],
    ["es520", "enseñar", "", "to teach; to show", "unterrichten, beibringen; zeigen", "Mi madre enseña matemáticas.", "My mother teaches maths.", "Meine Mutter unterrichtet Mathe."],
    ["es521", "escribir", "", "to write", "schreiben", "Escribo una carta a mi abuela.", "I'm writing a letter to my grandmother.", "Ich schreibe meiner Großmutter einen Brief."],
    ["es522", "la palabra", "las palabras", "word", "das Wort", "No conozco esta palabra.", "I don't know this word.", "Ich kenne dieses Wort nicht."]
  ]);
  add("school/1", 2, [
    ["es523", "repetir", "", "to repeat", "wiederholen", "¿Puede repetir, por favor?", "Could you repeat that, please?", "Können Sie das bitte wiederholen?"],
    ["es524", "la frase", "las frases", "sentence; phrase", "der Satz", "Lee la frase en voz alta.", "Read the sentence aloud.", "Lies den Satz laut vor."],
    ["es525", "el ejercicio", "los ejercicios", "exercise", "die Übung", "Ahora hacemos el ejercicio dos.", "Now we'll do exercise two.", "Jetzt machen wir Übung zwei."],
    ["es526", "el error", "los errores", "mistake, error", "der Fehler", "Todos cometemos errores.", "We all make mistakes.", "Wir alle machen Fehler."],
    ["es527", "explicar", "", "to explain", "erklären", "¿Me lo puedes explicar otra vez?", "Can you explain it to me again?", "Kannst du es mir noch einmal erklären?"]
  ]);

  add("school/2", 1, [
    ["es528", "el trabajo", "los trabajos", "work; job", "die Arbeit; der Job", "Tengo un trabajo nuevo.", "I have a new job.", "Ich habe einen neuen Job."],
    ["es529", "trabajar", "", "to work", "arbeiten", "Trabajo en una tienda.", "I work in a shop.", "Ich arbeite in einem Laden."],
    ["es530", "la oficina", "las oficinas", "office", "das Büro", "Mi oficina está en el centro.", "My office is in the town centre.", "Mein Büro ist in der Innenstadt."],
    ["es531", "el jefe", "los jefes", "boss (f. la jefa)", "der Chef, die Chefin", "Mi jefa es muy simpática.", "My boss is very nice.", "Meine Chefin ist sehr nett."]
  ]);
  add("school/2", 2, [
    ["es532", "el compañero", "los compañeros", "colleague; classmate (f. la compañera)", "der Kollege; der Mitschüler", "Como con mis compañeros de trabajo.", "I have lunch with my colleagues.", "Ich esse mit meinen Kollegen zu Mittag."],
    ["es533", "la empresa", "las empresas", "company, firm", "die Firma, das Unternehmen", "Trabajo en una empresa alemana.", "I work for a German company.", "Ich arbeite bei einer deutschen Firma."],
    ["es534", "la reunión", "las reuniones", "meeting", "die Besprechung, das Treffen", "Tengo una reunión a las diez.", "I have a meeting at ten.", "Ich habe um zehn eine Besprechung."],
    ["es535", "el sueldo", "los sueldos", "salary, wages", "das Gehalt, der Lohn", "El sueldo no es muy alto.", "The salary isn't very high.", "Das Gehalt ist nicht sehr hoch."]
  ]);

  add("verbs/0", 1, [
    ["es536", "ser", "", "to be (who or what something is: identity, origin, job)", "sein (wer oder was: Identität, Herkunft, Beruf)", "Soy profesora y soy de Chile.", "I'm a teacher and I'm from Chile.", "Ich bin Lehrerin und komme aus Chile."],
    ["es537", "estar", "", "to be (where or how: place, state)", "sein (wo oder wie: Ort, Zustand), sich befinden", "Estoy cansado y estoy en casa.", "I'm tired and I'm at home.", "Ich bin müde und bin zu Hause."],
    ["es538", "tener", "", "to have", "haben", "Tengo un hermano y una hermana.", "I have a brother and a sister.", "Ich habe einen Bruder und eine Schwester."],
    ["es539", "haber", "", "to have (helper verb); hay: there is, there are", "haben (Hilfsverb); hay: es gibt", "Hay un banco en la esquina.", "There's a bank on the corner.", "An der Ecke gibt es eine Bank."]
  ]);
  add("verbs/0", 2, [
    ["es540", "quedar", "", "to be left; to be (located); to arrange to meet", "übrig sein; liegen; sich verabreden", "¿Dónde queda el museo?", "Where is the museum?", "Wo liegt das Museum?"]
  ]);

  add("verbs/1", 1, [
    ["es541", "ver", "", "to see; to watch", "sehen; anschauen", "¿Ves aquella casa?", "Do you see that house over there?", "Siehst du das Haus dort drüben?"],
    ["es542", "mirar", "", "to look (at)", "schauen, ansehen", "Mira, ¡está nevando!", "Look, it's snowing!", "Schau, es schneit!"],
    ["es543", "oír", "", "to hear", "hören", "No te oigo bien.", "I can't hear you well.", "Ich höre dich nicht gut."],
    ["es544", "escuchar", "", "to listen (to)", "zuhören, (an)hören", "Escucha, es importante.", "Listen, it's important.", "Hör zu, es ist wichtig."],
    ["es545", "decir", "", "to say, to tell", "sagen", "¿Qué dices?", "What are you saying?", "Was sagst du?"],
    ["es546", "hablar", "", "to speak, to talk", "sprechen, reden", "Hablo un poco de español.", "I speak a little Spanish.", "Ich spreche ein bisschen Spanisch."]
  ]);
  add("verbs/1", 2, [
    ["es547", "contestar", "", "to answer", "antworten, beantworten", "No contesta el teléfono.", "He isn't answering the phone.", "Er geht nicht ans Telefon."]
  ]);

  add("verbs/2", 1, [
    ["es548", "querer", "", "to want; to love", "wollen, möchten; lieben", "Quiero un café, por favor.", "I'd like a coffee, please.", "Ich möchte einen Kaffee, bitte."],
    ["es549", "gustar", "", "to like (literally: to please)", "gefallen, mögen", "Me gusta la música latina.", "I like Latin music.", "Ich mag lateinamerikanische Musik."],
    ["es550", "poder", "", "can, to be able to; may", "können; dürfen", "¿Puedo abrir la ventana?", "May I open the window?", "Darf ich das Fenster öffnen?"],
    ["es551", "deber", "", "must, should; to owe", "müssen, sollen; schulden", "Debes descansar más.", "You should rest more.", "Du solltest dich mehr ausruhen."],
    ["es552", "tener que", "", "to have to", "müssen", "Tengo que trabajar mañana.", "I have to work tomorrow.", "Ich muss morgen arbeiten."],
    ["es553", "necesitar", "", "to need", "brauchen", "Necesito ayuda.", "I need help.", "Ich brauche Hilfe."]
  ]);
  add("verbs/2", 2, [
    ["es554", "preferir", "", "to prefer", "vorziehen, lieber mögen", "Prefiero el té al café.", "I prefer tea to coffee.", "Ich trinke lieber Tee als Kaffee."],
    ["es555", "encantar", "", "to love (literally: to delight)", "sehr gefallen, lieben", "Me encanta bailar.", "I love dancing.", "Ich tanze unheimlich gern."]
  ]);

  add("verbs/3", 1, [
    ["es556", "saber", "", "to know (facts); can (a skill)", "wissen; können", "¿Sabes dónde está la estación?", "Do you know where the station is?", "Weißt du, wo der Bahnhof ist?"],
    ["es557", "sé", "", "I know (from saber; se without accent is a pronoun)", "ich weiß", "No lo sé.", "I don't know.", "Ich weiß es nicht."],
    ["es558", "conocer", "", "to know (people, places); to get to know", "kennen; kennenlernen", "¿Conoces a mi hermano?", "Do you know my brother?", "Kennst du meinen Bruder?"],
    ["es559", "pensar", "", "to think", "denken", "Pienso mucho en ti.", "I think about you a lot.", "Ich denke viel an dich."],
    ["es560", "entender", "", "to understand", "verstehen", "Perdón, no entiendo.", "Sorry, I don't understand.", "Entschuldigung, ich verstehe nicht."]
  ]);
  add("verbs/3", 2, [
    ["es561", "creer", "", "to believe, to think", "glauben", "Creo que va a llover.", "I think it's going to rain.", "Ich glaube, es wird regnen."],
    ["es562", "recordar", "", "to remember; to remind", "sich erinnern; erinnern", "No recuerdo su nombre.", "I can't remember his name.", "Ich erinnere mich nicht an seinen Namen."],
    ["es563", "olvidar", "", "to forget", "vergessen", "Olvidé las llaves.", "I forgot the keys.", "Ich habe die Schlüssel vergessen."]
  ]);

  add("verbs/4", 1, [
    ["es564", "hacer", "", "to do, to make", "machen, tun", "¿Qué haces?", "What are you doing?", "Was machst du?"],
    ["es565", "dar", "", "to give", "geben", "¿Me das tu número?", "Will you give me your number?", "Gibst du mir deine Nummer?"],
    ["es566", "abrir", "", "to open", "öffnen, aufmachen", "La tienda abre a las nueve.", "The shop opens at nine.", "Der Laden öffnet um neun."],
    ["es567", "cerrar", "", "to close, to shut", "schließen, zumachen", "Cierra la ventana, por favor.", "Close the window, please.", "Mach bitte das Fenster zu."],
    ["es568", "empezar", "", "to begin, to start", "anfangen, beginnen", "La película empieza a las ocho.", "The film starts at eight.", "Der Film fängt um acht an."],
    ["es569", "terminar", "", "to finish, to end", "beenden, aufhören, zu Ende sein", "Termino de trabajar a las cinco.", "I finish work at five.", "Ich höre um fünf mit der Arbeit auf."],
    ["es570", "buscar", "", "to look for", "suchen", "Busco mis gafas.", "I'm looking for my glasses.", "Ich suche meine Brille."],
    ["es571", "encontrar", "", "to find", "finden", "No encuentro mi celular.", "I can't find my phone.", "Ich finde mein Handy nicht."]
  ]);
  add("verbs/4", 2, [
    ["es572", "poner", "", "to put; to switch on", "stellen, legen; einschalten", "Pon la leche en el refrigerador.", "Put the milk in the fridge.", "Stell die Milch in den Kühlschrank."],
    ["es573", "usar", "", "to use", "benutzen, verwenden", "¿Puedo usar tu computadora?", "Can I use your computer?", "Darf ich deinen Computer benutzen?"],
    ["es574", "traer", "", "to bring", "bringen, mitbringen", "¿Nos trae la cuenta, por favor?", "Could you bring us the bill, please?", "Bringen Sie uns bitte die Rechnung?"],
    ["es575", "dejar", "", "to leave; to let; to lend", "lassen; verlassen; leihen", "Deja las llaves en la mesa.", "Leave the keys on the table.", "Lass die Schlüssel auf dem Tisch."],
    ["es576", "preparar", "", "to prepare, to make", "vorbereiten, zubereiten", "Preparo la cena para todos.", "I'm making dinner for everyone.", "Ich mache das Abendessen für alle."]
  ]);

  add("verbs/5", 1, [
    ["es577", "ayudar", "", "to help", "helfen", "¿Te ayudo con la maleta?", "Shall I help you with the suitcase?", "Soll ich dir mit dem Koffer helfen?"],
    ["es578", "la ayuda", "–", "help", "die Hilfe", "Gracias por tu ayuda.", "Thanks for your help.", "Danke für deine Hilfe."],
    ["es579", "esperar", "", "to wait; to hope; to expect", "warten; hoffen; erwarten", "Te espero en la puerta.", "I'll wait for you at the door.", "Ich warte an der Tür auf dich."]
  ]);
  add("verbs/5", 2, [
    ["es580", "compartir", "", "to share", "teilen", "Comparto apartamento con dos amigos.", "I share a flat with two friends.", "Ich teile mir eine Wohnung mit zwei Freunden."],
    ["es581", "cuidar", "", "to look after, to take care of", "sich kümmern um, aufpassen auf", "Mi madre cuida a mis hijos.", "My mother looks after my children.", "Meine Mutter passt auf meine Kinder auf."]
  ]);

  add("describe/0", 1, [
    ["es582", "grande", "", "big, large (gran before a noun: great)", "groß", "Vivimos en una casa grande.", "We live in a big house.", "Wir wohnen in einem großen Haus."],
    ["es583", "pequeño", "", "small, little", "klein", "Mi habitación es muy pequeña.", "My room is very small.", "Mein Zimmer ist sehr klein."],
    ["es584", "largo", "", "long", "lang", "Es un viaje muy largo.", "It's a very long journey.", "Das ist eine sehr lange Reise."],
    ["es585", "corto", "", "short (length)", "kurz", "Llevo el pelo corto.", "I have short hair.", "Ich habe kurze Haare."],
    ["es586", "alto", "", "tall, high", "groß, hoch", "Mi hermano es muy alto.", "My brother is very tall.", "Mein Bruder ist sehr groß."],
    ["es587", "bajo", "", "short (person), low", "klein, niedrig", "Mi abuela es baja.", "My grandmother is short.", "Meine Großmutter ist klein."],
    ["es588", "rápido", "", "fast, quick", "schnell", "El tren es más rápido que el autobús.", "The train is faster than the bus.", "Der Zug ist schneller als der Bus."],
    ["es589", "lento", "", "slow", "langsam", "Hoy internet va muy lento.", "The internet is very slow today.", "Das Internet ist heute sehr langsam."],
    ["es590", "nuevo", "", "new", "neu", "Tengo un celular nuevo.", "I have a new phone.", "Ich habe ein neues Handy."],
    ["es591", "viejo", "", "old", "alt", "Este carro es muy viejo.", "This car is very old.", "Dieses Auto ist sehr alt."],
    ["es592", "joven", "", "young", "jung", "Mi profesora es muy joven.", "My teacher is very young.", "Meine Lehrerin ist sehr jung."],
    ["es593", "bueno", "", "good (buen before a masc. noun)", "gut", "Es un buen restaurante.", "It's a good restaurant.", "Das ist ein gutes Restaurant."],
    ["es594", "malo", "", "bad (mal before a masc. noun)", "schlecht", "Hoy hace mal tiempo.", "The weather is bad today.", "Heute ist schlechtes Wetter."],
    ["es595", "caliente", "", "hot (to the touch)", "heiß, warm", "Cuidado, el plato está caliente.", "Careful, the plate is hot.", "Vorsicht, der Teller ist heiß."],
    ["es596", "frío", "", "cold", "kalt", "La cerveza está muy fría.", "The beer is very cold.", "Das Bier ist sehr kalt."],
    ["es597", "fácil", "", "easy", "leicht, einfach", "El ejercicio es fácil.", "The exercise is easy.", "Die Übung ist leicht."],
    ["es598", "difícil", "", "difficult, hard", "schwer, schwierig", "El alemán es difícil.", "German is difficult.", "Deutsch ist schwer."]
  ]);
  add("describe/0", 2, [
    ["es599", "bonito", "", "pretty, nice", "schön, hübsch", "¡Qué vestido tan bonito!", "What a pretty dress!", "Was für ein hübsches Kleid!"],
    ["es600", "feo", "", "ugly", "hässlich", "Este edificio es bastante feo.", "This building is pretty ugly.", "Dieses Gebäude ist ziemlich hässlich."],
    ["es601", "lleno", "", "full", "voll", "El autobús va lleno.", "The bus is full.", "Der Bus ist voll."],
    ["es602", "vacío", "", "empty", "leer", "La calle está vacía.", "The street is empty.", "Die Straße ist leer."],
    ["es603", "limpio", "", "clean", "sauber", "La cocina está limpia.", "The kitchen is clean.", "Die Küche ist sauber."],
    ["es604", "sucio", "", "dirty", "schmutzig", "Tengo las manos sucias.", "My hands are dirty.", "Ich habe schmutzige Hände."],
    ["es605", "abierto", "", "open", "offen, geöffnet", "¿Está abierta la farmacia?", "Is the chemist's open?", "Hat die Apotheke offen?"],
    ["es606", "cerrado", "", "closed, shut", "geschlossen, zu", "El banco está cerrado.", "The bank is closed.", "Die Bank ist geschlossen."]
  ]);

  add("describe/1", 1, [
    ["es607", "el color", "los colores", "colour", "die Farbe", "¿De qué color es tu carro?", "What colour is your car?", "Welche Farbe hat dein Auto?"],
    ["es608", "blanco", "", "white", "weiß", "Quiero una camisa blanca.", "I want a white shirt.", "Ich möchte ein weißes Hemd."],
    ["es609", "negro", "", "black", "schwarz", "Tengo un gato negro.", "I have a black cat.", "Ich habe eine schwarze Katze."],
    ["es610", "rojo", "", "red", "rot", "Me gusta tu carro rojo.", "I like your red car.", "Mir gefällt dein rotes Auto."],
    ["es611", "azul", "", "blue", "blau", "El mar está muy azul.", "The sea is very blue.", "Das Meer ist sehr blau."],
    ["es612", "verde", "", "green", "grün", "Sus ojos son verdes.", "Her eyes are green.", "Ihre Augen sind grün."],
    ["es613", "amarillo", "", "yellow", "gelb", "El plátano es amarillo.", "The banana is yellow.", "Die Banane ist gelb."]
  ]);
  add("describe/1", 2, [
    ["es614", "gris", "", "grey", "grau", "Hoy el cielo está gris.", "The sky is grey today.", "Heute ist der Himmel grau."],
    ["es615", "marrón", "", "brown (Latin America also: café)", "braun", "Llevo unos zapatos marrones.", "I'm wearing brown shoes.", "Ich trage braune Schuhe."],
    ["es616", "rosa", "", "pink (also: rosado)", "rosa", "La niña quiere una bicicleta rosa.", "The girl wants a pink bike.", "Das Mädchen will ein rosa Fahrrad."]
  ]);

  add("describe/2", 1, [
    ["es617", "bien", "", "well, fine", "gut", "Estoy bien, gracias.", "I'm fine, thanks.", "Mir geht es gut, danke."],
    ["es618", "mal", "", "badly, not well", "schlecht", "El niño duerme mal.", "The boy sleeps badly.", "Der Junge schläft schlecht."],
    ["es619", "feliz", "", "happy", "glücklich", "¡Feliz cumpleaños!", "Happy birthday!", "Alles Gute zum Geburtstag!"],
    ["es620", "triste", "", "sad", "traurig", "¿Por qué estás triste?", "Why are you sad?", "Warum bist du traurig?"],
    ["es621", "cansado", "", "tired", "müde", "Estoy muy cansada hoy.", "I'm very tired today.", "Ich bin heute sehr müde."]
  ]);
  add("describe/2", 2, [
    ["es622", "contento", "", "glad, pleased", "froh, zufrieden", "Estoy muy contento con mi trabajo.", "I'm very happy with my job.", "Ich bin mit meiner Arbeit sehr zufrieden."],
    ["es623", "enojado", "", "angry (Spain: enfadado)", "wütend, verärgert", "¿Estás enojado conmigo?", "Are you angry with me?", "Bist du sauer auf mich?"],
    ["es624", "nervioso", "", "nervous", "nervös", "Estoy nervioso por el examen.", "I'm nervous about the exam.", "Ich bin wegen der Prüfung nervös."],
    ["es625", "preocupado", "", "worried", "besorgt", "Mi madre está preocupada.", "My mother is worried.", "Meine Mutter ist besorgt."],
    ["es626", "aburrido", "", "bored (estar); boring (ser)", "gelangweilt; langweilig", "La película es muy aburrida.", "The film is very boring.", "Der Film ist sehr langweilig."]
  ]);

  add("describe/3", 1, [
    ["es627", "simpático", "", "nice, friendly", "sympathisch, nett", "Tu hermana es muy simpática.", "Your sister is very nice.", "Deine Schwester ist sehr nett."],
    ["es628", "amable", "", "kind, friendly", "freundlich, liebenswürdig", "Muchas gracias, es usted muy amable.", "Thank you very much, you're very kind.", "Vielen Dank, Sie sind sehr freundlich."]
  ]);
  add("describe/3", 2, [
    ["es629", "guapo", "", "good-looking, handsome, pretty", "hübsch, gut aussehend", "Su novio es muy guapo.", "Her boyfriend is very good-looking.", "Ihr Freund sieht sehr gut aus."],
    ["es630", "inteligente", "", "intelligent, clever", "intelligent, klug", "Es una niña muy inteligente.", "She's a very clever girl.", "Sie ist ein sehr kluges Mädchen."],
    ["es631", "divertido", "", "funny, fun", "lustig, witzig", "La fiesta fue muy divertida.", "The party was great fun.", "Die Party war sehr lustig."],
    ["es632", "delgado", "", "slim, thin", "schlank, dünn", "Mi padre es alto y delgado.", "My father is tall and slim.", "Mein Vater ist groß und schlank."],
    ["es633", "serio", "", "serious", "ernst", "El profesor es un poco serio.", "The teacher is a bit serious.", "Der Lehrer ist ein bisschen ernst."]
  ]);

  add("describe/4", 1, [
    ["es634", "la cosa", "las cosas", "thing", "die Sache, das Ding", "Tengo muchas cosas que hacer.", "I have lots of things to do.", "Ich habe viel zu tun."],
    ["es635", "el problema", "los problemas", "problem (masculine)", "das Problem", "No hay problema.", "No problem.", "Kein Problem."],
    ["es636", "la idea", "las ideas", "idea", "die Idee", "¡Qué buena idea!", "What a good idea!", "Was für eine gute Idee!"],
    ["es637", "importante", "", "important", "wichtig", "Es muy importante dormir bien.", "It's very important to sleep well.", "Es ist sehr wichtig, gut zu schlafen."],
    ["es638", "la verdad", "las verdades", "truth", "die Wahrheit", "Dime la verdad.", "Tell me the truth.", "Sag mir die Wahrheit."]
  ]);
  add("describe/4", 2, [
    ["es639", "interesante", "", "interesting", "interessant", "Es un libro muy interesante.", "It's a very interesting book.", "Das ist ein sehr interessantes Buch."],
    ["es640", "posible", "", "possible", "möglich", "¿Es posible pagar con tarjeta?", "Is it possible to pay by card?", "Kann man mit Karte bezahlen?"],
    ["es641", "el ejemplo", "los ejemplos", "example (por ejemplo: for example)", "das Beispiel", "¿Puedes darme un ejemplo?", "Can you give me an example?", "Kannst du mir ein Beispiel geben?"],
    ["es642", "diferente", "", "different", "anders, verschieden", "Mi hermano y yo somos muy diferentes.", "My brother and I are very different.", "Mein Bruder und ich sind sehr verschieden."]
  ]);

  add("questions/0", 1, [
    ["es643", "qué", "", "what; which", "was; welcher", "¿Qué quieres?", "What do you want?", "Was möchtest du?"],
    ["es644", "quién", "", "who", "wer", "¿Quién es esa chica?", "Who is that girl?", "Wer ist das Mädchen da?"],
    ["es645", "dónde", "", "where", "wo", "¿Dónde vives?", "Where do you live?", "Wo wohnst du?"],
    ["es646", "cuándo", "", "when (in questions)", "wann", "¿Cuándo es tu cumpleaños?", "When is your birthday?", "Wann hast du Geburtstag?"],
    ["es647", "cómo", "", "how", "wie", "¿Cómo estás?", "How are you?", "Wie geht es dir?"],
    ["es648", "cuánto", "", "how much, how many", "wie viel, wie viele", "¿Cuánto cuesta?", "How much is it?", "Wie viel kostet das?"],
    ["es649", "cuál", "", "which, what", "welcher, welche, welches; was", "¿Cuál es tu color favorito?", "What's your favourite colour?", "Was ist deine Lieblingsfarbe?"],
    ["es650", "por qué", "", "why", "warum", "¿Por qué estudias español?", "Why are you learning Spanish?", "Warum lernst du Spanisch?"]
  ]);
  add("questions/0", 2, [
    ["es651", "de dónde", "", "where from", "woher", "¿De dónde eres?", "Where are you from?", "Woher kommst du?"],
    ["es652", "adónde", "", "where (to)", "wohin", "¿Adónde vas?", "Where are you going?", "Wohin gehst du?"]
  ]);

  add("questions/1", 1, [
    ["es653", "preguntar", "", "to ask (a question)", "fragen", "¿Puedo preguntar algo?", "May I ask something?", "Darf ich etwas fragen?"],
    ["es654", "la pregunta", "las preguntas", "question", "die Frage", "Tengo una pregunta.", "I have a question.", "Ich habe eine Frage."],
    ["es655", "responder", "", "to answer, to reply", "antworten", "Responde a la pregunta, por favor.", "Answer the question, please.", "Beantworte bitte die Frage."],
    ["es656", "la respuesta", "las respuestas", "answer", "die Antwort", "No sé la respuesta.", "I don't know the answer.", "Ich weiß die Antwort nicht."]
  ]);
  add("questions/1", 2, [
    ["es657", "¿verdad?", "", "right?, isn't it?", "oder?, nicht wahr?", "Hace frío, ¿verdad?", "It's cold, isn't it?", "Es ist kalt, oder?"]
  ]);

  add("grammar/0", 1, [
    ["es658", "muy", "", "very", "sehr", "Estoy muy bien.", "I'm very well.", "Mir geht es sehr gut."],
    ["es659", "mucho", "", "a lot, much, many", "viel, viele", "Tengo mucho trabajo.", "I have a lot of work.", "Ich habe viel Arbeit."],
    ["es660", "poco", "", "little, not much, few", "wenig, wenige", "Tengo poco tiempo.", "I have little time.", "Ich habe wenig Zeit."],
    ["es661", "más", "", "more; plus", "mehr; plus", "¿Quieres más pan?", "Would you like more bread?", "Möchtest du mehr Brot?"],
    ["es662", "menos", "", "less, fewer; minus", "weniger; minus", "Ahora trabajo menos.", "Now I work less.", "Jetzt arbeite ich weniger."]
  ]);
  add("grammar/0", 2, [
    ["es663", "demasiado", "", "too, too much", "zu, zu viel", "Este abrigo es demasiado caro.", "This coat is too expensive.", "Dieser Mantel ist zu teuer."],
    ["es664", "bastante", "", "quite, fairly; enough", "ziemlich; genug", "El examen fue bastante fácil.", "The exam was quite easy.", "Die Prüfung war ziemlich leicht."],
    ["es665", "casi", "", "almost, nearly", "fast, beinahe", "Son casi las diez.", "It's almost ten.", "Es ist fast zehn."],
    ["es666", "solo", "", "only; alone", "nur; allein", "Solo hablo un poco de español.", "I only speak a little Spanish.", "Ich spreche nur ein bisschen Spanisch."]
  ]);

  add("grammar/1", 1, [
    ["es667", "y", "", "and (e before i- and hi-)", "und", "Tengo un perro y un gato.", "I have a dog and a cat.", "Ich habe einen Hund und eine Katze."],
    ["es668", "o", "", "or (u before o- and ho-)", "oder", "¿Té o café?", "Tea or coffee?", "Tee oder Kaffee?"],
    ["es669", "pero", "", "but", "aber", "Es caro, pero es muy bueno.", "It's expensive, but it's very good.", "Es ist teuer, aber sehr gut."],
    ["es670", "porque", "", "because", "weil", "Estudio español porque me gusta.", "I study Spanish because I like it.", "Ich lerne Spanisch, weil es mir gefällt."],
    ["es671", "también", "", "also, too", "auch", "Yo también soy de Alemania.", "I'm from Germany too.", "Ich komme auch aus Deutschland."],
    ["es672", "si", "", "if, whether (sí with accent: yes)", "wenn, falls; ob", "Si llueve, nos quedamos en casa.", "If it rains, we'll stay at home.", "Wenn es regnet, bleiben wir zu Hause."]
  ]);
  add("grammar/1", 2, [
    ["es673", "tampoco", "", "not either, neither", "auch nicht", "Yo tampoco lo sé.", "I don't know either.", "Ich weiß es auch nicht."],
    ["es674", "entonces", "", "then, so", "dann, also", "Entonces, ¿nos vemos mañana?", "So, shall we meet tomorrow?", "Also, sehen wir uns morgen?"],
    ["es675", "por eso", "", "that's why, so", "deshalb", "Estoy cansado, por eso me quedo en casa.", "I'm tired, so I'm staying at home.", "Ich bin müde, deshalb bleibe ich zu Hause."]
  ]);

  add("grammar/2", 1, [
    ["es676", "siempre", "", "always", "immer", "Siempre desayuno café con leche.", "I always have white coffee for breakfast.", "Zum Frühstück trinke ich immer Milchkaffee."],
    ["es677", "a veces", "", "sometimes", "manchmal", "A veces voy al trabajo en bicicleta.", "Sometimes I cycle to work.", "Manchmal fahre ich mit dem Fahrrad zur Arbeit."],
    ["es678", "nunca", "", "never", "nie", "Nunca como carne.", "I never eat meat.", "Ich esse nie Fleisch."]
  ]);
  add("grammar/2", 2, [
    ["es679", "ya", "", "already; now", "schon; jetzt", "Ya he comido, gracias.", "I've already eaten, thanks.", "Ich habe schon gegessen, danke."],
    ["es680", "todavía", "", "still; yet (todavía no: not yet)", "noch (noch nicht)", "Todavía no he terminado.", "I haven't finished yet.", "Ich bin noch nicht fertig."],
    ["es681", "cuando", "", "when (not in questions)", "wenn, als", "Cuando llego a casa, me ducho.", "When I get home, I have a shower.", "Wenn ich nach Hause komme, dusche ich."],
    ["es682", "otra vez", "", "again", "noch einmal, wieder", "¿Puedes decirlo otra vez?", "Can you say it again?", "Kannst du das noch einmal sagen?"]
  ]);

  add("grammar/3", 1, [
    ["es683", "el", "", "the (masculine singular; él with accent: he)", "der, das (Artikel)", "El perro es muy grande.", "The dog is very big.", "Der Hund ist sehr groß."],
    ["es684", "la", "", "the (feminine singular)", "die, der, das (Artikel)", "La casa es blanca.", "The house is white.", "Das Haus ist weiß."],
    ["es685", "un", "", "a, an (masculine)", "ein", "Tengo un perro.", "I have a dog.", "Ich habe einen Hund."],
    ["es686", "una", "", "a, an (feminine)", "eine", "Quiero una manzana.", "I'd like an apple.", "Ich möchte einen Apfel."],
    ["es687", "de", "", "of, from; 's", "von, aus", "El libro de Ana está aquí.", "Ana's book is here.", "Anas Buch ist hier."],
    ["es688", "a", "", "to, at", "nach, zu, an, um", "Voy a la playa a las diez.", "I'm going to the beach at ten.", "Ich gehe um zehn an den Strand."],
    ["es689", "en", "", "in, on, at", "in, an, auf", "Vivo en Madrid.", "I live in Madrid.", "Ich wohne in Madrid."],
    ["es690", "con", "", "with", "mit", "Vivo con mis padres.", "I live with my parents.", "Ich wohne bei meinen Eltern."],
    ["es691", "para", "", "for; in order to", "für; um zu", "Este regalo es para ti.", "This present is for you.", "Dieses Geschenk ist für dich."],
    ["es692", "mi", "", "my", "mein, meine", "Mi casa es tu casa.", "My house is your house.", "Mein Haus ist dein Haus."],
    ["es693", "tu", "", "your (informal; tú with accent: you)", "dein, deine", "Tu hermano es muy simpático.", "Your brother is very nice.", "Dein Bruder ist sehr nett."],
    ["es694", "su", "", "his, her, its, their; your (polite)", "sein, ihr; Ihr", "Su casa es muy bonita.", "Her house is very pretty.", "Ihr Haus ist sehr schön."],
    ["es695", "que", "", "that, which, who", "dass; der, die, das (Relativpronomen)", "Creo que tienes razón.", "I think you're right.", "Ich glaube, dass du recht hast."],
    ["es696", "me", "", "me, to me, myself", "mich, mir", "¿Me ayudas, por favor?", "Can you help me, please?", "Hilfst du mir bitte?"],
    ["es697", "te", "", "you, to you, yourself (informal; el té: tea)", "dich, dir", "Te quiero mucho.", "I love you very much.", "Ich hab dich sehr lieb."],
    ["es698", "se", "", "himself, herself, themselves; one (impersonal) (sé with accent: I know)", "sich; man", "¿Cómo se dice «gracias» en alemán?", "How do you say 'gracias' in German?", "Wie sagt man „gracias“ auf Deutsch?"]
  ]);
  add("grammar/3", 2, [
    ["es699", "entre", "", "between, among", "zwischen, unter", "El banco está entre la farmacia y el hotel.", "The bank is between the chemist's and the hotel.", "Die Bank liegt zwischen der Apotheke und dem Hotel."],
    ["es700", "sin", "", "without", "ohne", "Un café sin azúcar, por favor.", "A coffee without sugar, please.", "Einen Kaffee ohne Zucker, bitte."],
    ["es701", "por", "", "for, through, by, because of; per", "für, durch, wegen; pro", "Gracias por todo.", "Thanks for everything.", "Danke für alles."],
    ["es702", "lo", "", "it, him", "es, ihn", "No lo entiendo.", "I don't understand it.", "Ich verstehe es nicht."],
    ["es703", "nuestro", "", "our", "unser", "Nuestra casa está cerca del mar.", "Our house is near the sea.", "Unser Haus ist in der Nähe des Meeres."]
  ]);

  window.ES_WORDS = out;
})();
