/* Korean beginner vocabulary — two levels (A1 ≈ first steps, A2 ≈ everyday life), Seoul standard, polite 해요 style.
 * Compiled for this app, sorted into the same topics as the other courses (themes.js); the levels are an
 * editorial grading, not the official TOPIK list. Romanization is generated (js/korean.js).
 * Rows: [id, Hangul, English, German, example, example in English]. Ids are stable: never reuse or renumber them.
 * Each block: topic/group (index into the Chinese topic's groups, see themes.js) and level. */
(function () {
  const out = [];
  const add = (t, lvl, rows) => rows.forEach(([id, w, en, de, ex, exEn]) => out.push({ id, w, en, de, t, lvl, ex: ex || "", exEn: exEn || "" }));

  add("hello/0", 1, [
    ["k1", "안녕하세요", "hello", "hallo", "안녕하세요, 저는 민수예요.", "Hello, I'm Minsu."],
    ["k2", "안녕히 가세요", "goodbye (to someone leaving)", "auf Wiedersehen (zu jemandem, der geht)", "안녕히 가세요, 내일 봐요.", "Goodbye, see you tomorrow."],
    ["k3", "안녕히 계세요", "goodbye (to someone staying)", "auf Wiedersehen (zu jemandem, der bleibt)", "저 먼저 갈게요. 안녕히 계세요.", "I'll go first. Goodbye."],
    ["k4", "감사합니다", "thank you", "danke", "도와주셔서 감사합니다.", "Thank you for helping me."],
    ["k5", "고마워요", "thanks", "danke", "선물 고마워요!", "Thanks for the present!"],
    ["k6", "죄송합니다", "I'm sorry (formal)", "Entschuldigung (förmlich)", "늦어서 죄송합니다.", "I'm sorry I'm late."],
    ["k7", "미안해요", "sorry", "tut mir leid", "미안해요, 몰랐어요.", "Sorry, I didn't know."],
    ["k8", "괜찮아요", "it's okay; I'm fine", "schon gut; mir geht es gut", "괜찮아요, 걱정하지 마세요.", "It's okay, don't worry."],
    ["k9", "네", "yes", "ja", "네, 맞아요.", "Yes, that's right."],
    ["k10", "아니요", "no", "nein", "아니요, 저는 학생이 아니에요.", "No, I'm not a student."],
    ["k11", "여보세요", "hello (on the phone)", "hallo (am Telefon)", "여보세요? 민수 씨예요?", "Hello? Is that Minsu?"],
    ["k12", "실례합니다", "excuse me", "Entschuldigung, darf ich stören", "실례합니다, 화장실이 어디예요?", "Excuse me, where is the restroom?"],
    ["k13", "환영합니다", "welcome", "willkommen", "한국에 오신 것을 환영합니다.", "Welcome to Korea."],
    ["k14", "반갑습니다", "nice to meet you", "freut mich", "만나서 반갑습니다.", "Nice to meet you."],
    ["k15", "천만에요", "you're welcome", "gern geschehen", "감사합니다. — 천만에요.", "Thank you. — You're welcome."],
    ["k16", "잘 먹겠습니다", "thank you for the meal (before eating)", "guten Appetit (vor dem Essen)", "와, 맛있겠다! 잘 먹겠습니다.", "Wow, looks delicious! Thank you for the meal."]
  ]);
  add("hello/0", 2, [
    ["k17", "축하해요", "congratulations", "herzlichen Glückwunsch", "생일 축하해요!", "Happy birthday!"],
    ["k18", "수고하셨습니다", "thank you for your hard work", "danke für Ihre Mühe", "오늘 수고하셨습니다.", "Thank you for your hard work today."],
    ["k19", "잘 지내요", "I'm doing well", "mir geht es gut", "저는 잘 지내요. 민수 씨는요?", "I'm doing well. And you, Minsu?"]
  ]);

  add("people/0", 1, [
    ["k20", "저", "I, me (polite)", "ich (höflich)", "저는 독일 사람이에요.", "I'm German."],
    ["k21", "나", "I, me (casual)", "ich (vertraut)", "나도 가고 싶어.", "I want to go too."],
    ["k22", "우리", "we, our", "wir, unser", "우리 같이 가요.", "Let's go together."],
    ["k23", "당신", "you (to a spouse; formal writing)", "du, Sie (an den Partner; schriftlich)", "당신을 사랑해요.", "I love you."],
    ["k24", "그", "he; that", "er; jener", "그는 제 친구예요.", "He is my friend."],
    ["k25", "그녀", "she", "sie", "그녀는 의사예요.", "She is a doctor."],
    ["k26", "누구", "who", "wer", "저 사람은 누구예요?", "Who is that person?"],
    ["k27", "모두", "everyone, all", "alle, alles", "모두 앉으세요.", "Everyone, please sit down."]
  ]);
  add("people/1", 1, [
    ["k28", "이것", "this (thing)", "das hier", "이것은 뭐예요?", "What is this?"],
    ["k29", "그것", "that (thing)", "das da", "그것을 주세요.", "Please give me that."],
    ["k30", "저것", "that over there", "das dort drüben", "저것은 남산타워예요.", "That over there is Namsan Tower."],
    ["k31", "여기", "here", "hier", "여기 앉으세요.", "Please sit here."],
    ["k32", "거기", "there", "da", "거기에 뭐가 있어요?", "What's there?"],
    ["k33", "저기", "over there", "dort drüben", "버스 정류장은 저기예요.", "The bus stop is over there."],
    ["k34", "매일", "every day", "jeden Tag", "저는 매일 한국어를 공부해요.", "I study Korean every day."]
  ]);
  add("people/2", 1, [
    ["k35", "이름", "name", "Name", "이름이 뭐예요?", "What's your name?"],
    ["k36", "씨", "Mr./Ms. (after a name)", "Herr/Frau (nach dem Namen)", "민수 씨, 안녕하세요.", "Hello, Minsu."],
    ["k37", "사람", "person", "Mensch, Person", "저 사람은 한국 사람이에요.", "That person is Korean."],
    ["k38", "친구", "friend", "Freund, Freundin", "제 친구는 서울에 살아요.", "My friend lives in Seoul."],
    ["k39", "남자", "man", "Mann", "저 남자는 키가 커요.", "That man is tall."],
    ["k40", "여자", "woman", "Frau", "그 여자는 선생님이에요.", "That woman is a teacher."],
    ["k41", "소개하다", "to introduce", "vorstellen", "제 친구를 소개할게요.", "Let me introduce my friend."],
    ["k42", "만나다", "to meet", "treffen", "내일 친구를 만나요.", "I'm meeting a friend tomorrow."],
    ["k43", "알다", "to know", "wissen, kennen", "저는 그 사람을 알아요.", "I know that person."]
  ]);
  add("people/2", 2, [
    ["k44", "손님", "guest, customer", "Gast, Kunde", "손님, 뭘 드릴까요?", "What can I get you, sir/madam?"],
    ["k45", "어른", "adult", "Erwachsener", "어른한테는 존댓말을 써요.", "You use polite speech with adults."],
    ["k46", "아이", "child", "Kind", "아이가 공원에서 놀아요.", "The child plays in the park."]
  ]);

  add("family/0", 1, [
    ["k47", "가족", "family", "Familie", "우리 가족은 네 명이에요.", "There are four people in my family."],
    ["k48", "아버지", "father", "Vater", "아버지는 회사원이에요.", "My father is an office worker."],
    ["k49", "어머니", "mother", "Mutter", "어머니는 요리를 잘해요.", "My mother cooks well."],
    ["k50", "아빠", "dad", "Papa", "아빠, 사랑해요!", "Dad, I love you!"],
    ["k51", "엄마", "mom", "Mama", "엄마가 전화했어요.", "Mom called."],
    ["k52", "형", "older brother (said by a man)", "älterer Bruder (von einem Mann gesagt)", "형은 대학생이에요.", "My older brother is a university student."],
    ["k53", "오빠", "older brother (said by a woman)", "älterer Bruder (von einer Frau gesagt)", "오빠는 키가 커요.", "My older brother is tall."],
    ["k54", "누나", "older sister (said by a man)", "ältere Schwester (von einem Mann gesagt)", "누나는 서울에 살아요.", "My older sister lives in Seoul."],
    ["k55", "언니", "older sister (said by a woman)", "ältere Schwester (von einer Frau gesagt)", "언니하고 쇼핑했어요.", "I went shopping with my older sister."],
    ["k56", "동생", "younger brother or sister", "jüngerer Bruder, jüngere Schwester", "제 동생은 열 살이에요.", "My younger sibling is ten."]
  ]);
  add("family/1", 1, [
    ["k57", "아들", "son", "Sohn", "아들이 하나 있어요.", "I have one son."],
    ["k58", "딸", "daughter", "Tochter", "딸이 피아노를 쳐요.", "My daughter plays the piano."],
    ["k59", "남편", "husband", "Ehemann", "제 남편은 요리사예요.", "My husband is a cook."],
    ["k60", "아내", "wife", "Ehefrau", "아내와 같이 여행했어요.", "I travelled with my wife."],
    ["k61", "할아버지", "grandfather", "Großvater", "할아버지는 부산에 사세요.", "My grandfather lives in Busan."],
    ["k62", "할머니", "grandmother", "Großmutter", "할머니 댁에 가요.", "I'm going to my grandmother's."],
    ["k63", "아기", "baby", "Baby", "아기가 자고 있어요.", "The baby is sleeping."]
  ]);
  add("family/1", 2, [
    ["k64", "부모님", "parents", "Eltern", "부모님께 전화해요.", "I call my parents."],
    ["k65", "결혼하다", "to marry", "heiraten", "내년에 결혼해요.", "We're getting married next year."],
    ["k66", "삼촌", "uncle", "Onkel", "삼촌이 선물을 주셨어요.", "My uncle gave me a present."],
    ["k67", "이모", "aunt (mother's sister)", "Tante (Schwester der Mutter)", "이모는 미국에 살아요.", "My aunt lives in America."]
  ]);
  add("family/2", 1, [
    ["k68", "나이", "age", "Alter", "나이가 어떻게 되세요?", "How old are you?"],
    ["k69", "살", "years old (counter)", "Jahre alt (Zählwort)", "저는 스물다섯 살이에요.", "I'm twenty-five."],
    ["k70", "젊다", "to be young", "jung sein", "선생님은 아주 젊어요.", "The teacher is very young."]
  ]);
  add("family/2", 2, [
    ["k71", "이웃", "neighbour", "Nachbar", "이웃이 아주 친절해요.", "The neighbours are very kind."],
    ["k72", "늙다", "to grow old", "alt werden", "할아버지가 많이 늙으셨어요.", "Grandfather has grown quite old."]
  ]);

  add("countries/0", 1, [
    ["k73", "한국", "Korea", "Korea", "한국은 아름다운 나라예요.", "Korea is a beautiful country."],
    ["k74", "서울", "Seoul", "Seoul", "서울은 한국의 수도예요.", "Seoul is the capital of Korea."],
    ["k75", "나라", "country", "Land", "어느 나라 사람이에요?", "Which country are you from?"],
    ["k76", "독일", "Germany", "Deutschland", "저는 독일에서 왔어요.", "I'm from Germany."],
    ["k77", "미국", "America, the USA", "Amerika, die USA", "제 친구는 미국 사람이에요.", "My friend is American."],
    ["k78", "중국", "China", "China", "중국 음식을 좋아해요.", "I like Chinese food."],
    ["k79", "일본", "Japan", "Japan", "일본에 가 봤어요?", "Have you been to Japan?"],
    ["k80", "외국", "foreign country", "Ausland", "외국에서 살고 싶어요.", "I'd like to live abroad."],
    ["k81", "외국인", "foreigner", "Ausländer", "외국인 친구가 많아요.", "I have many foreign friends."],
    ["k82", "고향", "hometown", "Heimatort", "고향이 어디예요?", "Where is your hometown?"]
  ]);
  add("countries/0", 2, [
    ["k83", "세계", "world", "Welt", "세계 여행을 하고 싶어요.", "I want to travel around the world."],
    ["k84", "도시", "city", "Stadt", "부산은 큰 도시예요.", "Busan is a big city."],
    ["k85", "시골", "countryside", "Land, Dorf", "시골은 조용해요.", "The countryside is quiet."],
    ["k86", "문화", "culture", "Kultur", "한국 문화에 관심이 있어요.", "I'm interested in Korean culture."]
  ]);
  add("countries/1", 2, [
    ["k87", "동쪽", "east", "Osten", "해가 동쪽에서 떠요.", "The sun rises in the east."],
    ["k88", "서쪽", "west", "Westen", "해가 서쪽으로 져요.", "The sun sets in the west."],
    ["k89", "남쪽", "south", "Süden", "부산은 남쪽에 있어요.", "Busan is in the south."],
    ["k90", "북쪽", "north", "Norden", "북쪽은 겨울에 추워요.", "The north is cold in winter."]
  ]);
  add("countries/2", 1, [
    ["k91", "한국어", "Korean (language)", "Koreanisch", "한국어를 배워요.", "I'm learning Korean."],
    ["k92", "영어", "English", "Englisch", "영어를 할 수 있어요?", "Can you speak English?"],
    ["k93", "독일어", "German (language)", "Deutsch", "독일어는 어려워요.", "German is difficult."],
    ["k94", "한글", "Hangul (the Korean alphabet)", "Hangul (das koreanische Alphabet)", "한글은 배우기 쉬워요.", "Hangul is easy to learn."],
    ["k95", "말", "speech, words, language", "Sprache, Worte", "천천히 말해 주세요.", "Please speak slowly."],
    ["k96", "단어", "word", "Wort", "이 단어는 무슨 뜻이에요?", "What does this word mean?"]
  ]);
  add("countries/2", 2, [
    ["k97", "문장", "sentence", "Satz", "문장을 읽어 보세요.", "Try reading the sentence."],
    ["k98", "뜻", "meaning", "Bedeutung", "뜻을 몰라요.", "I don't know the meaning."]
  ]);

  add("numbers/0", 1, [
    ["k99", "영", "zero", "null", "영에서 십까지 세요.", "Count from zero to ten."],
    ["k100", "일", "one (Sino-Korean)", "eins (sinokoreanisch)", "일 층에 있어요.", "It's on the first floor."],
    ["k101", "이", "two (Sino-Korean)", "zwei (sinokoreanisch)", "이 번 버스를 타세요.", "Take bus number two."],
    ["k102", "삼", "three (Sino-Korean)", "drei (sinokoreanisch)", "삼 월에 만나요.", "Let's meet in March."],
    ["k103", "사", "four (Sino-Korean)", "vier (sinokoreanisch)", "사 층으로 가세요.", "Go to the fourth floor."],
    ["k104", "오", "five (Sino-Korean)", "fünf (sinokoreanisch)", "오 분만 기다리세요.", "Please wait just five minutes."],
    ["k105", "육", "six (Sino-Korean)", "sechs (sinokoreanisch)", "유월에 휴가가 있어요.", "I have holidays in June."],
    ["k106", "칠", "seven (Sino-Korean)", "sieben (sinokoreanisch)", "칠 월은 더워요.", "July is hot."],
    ["k107", "팔", "eight (Sino-Korean)", "acht (sinokoreanisch)", "팔 번 출구로 나가세요.", "Take exit eight."],
    ["k108", "구", "nine (Sino-Korean)", "neun (sinokoreanisch)", "구 시에 수업이 있어요.", "Class is at nine."],
    ["k109", "십", "ten (Sino-Korean)", "zehn (sinokoreanisch)", "십 분 후에 출발해요.", "We leave in ten minutes."]
  ]);
  add("numbers/1", 1, [
    ["k110", "백", "hundred", "hundert", "백 원이에요.", "It's a hundred won."],
    ["k111", "천", "thousand", "tausend", "천 원만 주세요.", "Just give me a thousand won."],
    ["k112", "만", "ten thousand", "zehntausend", "만 원이에요.", "It's ten thousand won."]
  ]);
  add("numbers/2", 1, [
    ["k113", "하나", "one (native Korean)", "eins (koreanisch)", "사과 하나 주세요.", "One apple, please."],
    ["k114", "둘", "two (native Korean)", "zwei (koreanisch)", "커피 둘 주세요.", "Two coffees, please."],
    ["k115", "셋", "three (native Korean)", "drei (koreanisch)", "하나, 둘, 셋!", "One, two, three!"],
    ["k116", "넷", "four (native Korean)", "vier (koreanisch)", "우리는 넷이에요.", "There are four of us."],
    ["k117", "다섯", "five (native Korean)", "fünf (koreanisch)", "다섯 시에 끝나요.", "It ends at five."],
    ["k118", "여섯", "six (native Korean)", "sechs (koreanisch)", "여섯 시에 일어나요.", "I get up at six."],
    ["k119", "일곱", "seven (native Korean)", "sieben (koreanisch)", "일곱 시에 아침을 먹어요.", "I eat breakfast at seven."],
    ["k120", "여덟", "eight (native Korean)", "acht (koreanisch)", "여덟 시에 출근해요.", "I go to work at eight."],
    ["k121", "아홉", "nine (native Korean)", "neun (koreanisch)", "아홉 시에 시작해요.", "It starts at nine."],
    ["k122", "열", "ten (native Korean)", "zehn (koreanisch)", "열 시에 자요.", "I go to bed at ten."],
    ["k123", "스물", "twenty (native Korean)", "zwanzig (koreanisch)", "스무 살이에요.", "I'm twenty."],
    ["k124", "첫째", "first", "erstens, der erste", "첫째 날은 서울에 있어요.", "The first day we're in Seoul."],
    ["k125", "반", "half", "halb, Hälfte", "세 시 반이에요.", "It's half past three."],
    ["k126", "번", "number; time (occurrence)", "Nummer; Mal", "한 번 더 말해 주세요.", "Please say it once more."]
  ]);
  add("numbers/3", 1, [
    ["k127", "개", "counter for things", "Zählwort für Dinge", "사과 세 개 주세요.", "Three apples, please."],
    ["k128", "명", "counter for people", "Zählwort für Personen", "학생이 열 명 있어요.", "There are ten students."],
    ["k129", "마리", "counter for animals", "Zählwort für Tiere", "고양이 두 마리가 있어요.", "There are two cats."],
    ["k130", "잔", "counter for cups and glasses", "Zählwort für Tassen und Gläser", "커피 한 잔 주세요.", "A cup of coffee, please."],
    ["k131", "병", "bottle; counter for bottles", "Flasche; Zählwort für Flaschen", "물 한 병 주세요.", "A bottle of water, please."],
    ["k132", "권", "counter for books", "Zählwort für Bücher", "책 두 권을 샀어요.", "I bought two books."],
    ["k133", "장", "counter for flat things (paper, tickets)", "Zählwort für flache Dinge (Papier, Karten)", "표 두 장 주세요.", "Two tickets, please."]
  ]);
  add("numbers/3", 2, [
    ["k134", "대", "counter for vehicles and machines", "Zählwort für Fahrzeuge und Geräte", "차가 두 대 있어요.", "There are two cars."],
    ["k135", "벌", "counter for clothes", "Zählwort für Kleidung", "옷 한 벌을 샀어요.", "I bought an outfit."],
    ["k136", "켤레", "pair (of shoes, socks)", "Paar (Schuhe, Socken)", "양말 두 켤레 주세요.", "Two pairs of socks, please."]
  ]);
  add("numbers/4", 2, [
    ["k137", "킬로그램", "kilogram", "Kilogramm", "사과 일 킬로그램 주세요.", "One kilogram of apples, please."],
    ["k138", "미터", "metre", "Meter", "백 미터 앞에 있어요.", "It's a hundred metres ahead."]
  ]);

  add("time/0", 1, [
    ["k139", "시", "o'clock", "Uhr", "지금 세 시예요.", "It's three o'clock now."],
    ["k140", "분", "minute", "Minute", "십 분 걸려요.", "It takes ten minutes."],
    ["k141", "시간", "time; hour", "Zeit; Stunde", "시간이 없어요.", "I don't have time."],
    ["k142", "지금", "now", "jetzt", "지금 몇 시예요?", "What time is it now?"],
    ["k143", "때", "time, when", "Zeit, als", "어릴 때 부산에 살았어요.", "I lived in Busan when I was little."]
  ]);
  add("time/0", 2, [
    ["k144", "초", "second (time)", "Sekunde", "십 초만 기다려요.", "Wait just ten seconds."],
    ["k145", "시계", "clock, watch", "Uhr", "시계가 멈췄어요.", "The clock has stopped."]
  ]);
  add("time/1", 1, [
    ["k146", "아침", "morning; breakfast", "Morgen; Frühstück", "아침에 운동해요.", "I exercise in the morning."],
    ["k147", "오전", "a.m., before noon", "Vormittag", "오전 열 시에 만나요.", "Let's meet at 10 a.m."],
    ["k148", "점심", "noon; lunch", "Mittag; Mittagessen", "점심 먹었어요?", "Have you had lunch?"],
    ["k149", "오후", "p.m., afternoon", "Nachmittag", "오후에 시간 있어요?", "Do you have time in the afternoon?"],
    ["k150", "저녁", "evening; dinner", "Abend; Abendessen", "저녁에 영화를 봐요.", "In the evening I watch a film."],
    ["k151", "밤", "night", "Nacht", "밤에 잠을 잘 못 자요.", "I don't sleep well at night."]
  ]);
  add("time/2", 1, [
    ["k152", "어제", "yesterday", "gestern", "어제 뭐 했어요?", "What did you do yesterday?"],
    ["k153", "오늘", "today", "heute", "오늘은 날씨가 좋아요.", "The weather is nice today."],
    ["k154", "내일", "tomorrow", "morgen", "내일 봐요.", "See you tomorrow."],
    ["k155", "날", "day", "Tag", "좋은 날이에요.", "It's a good day."],
    ["k156", "주말", "weekend", "Wochenende", "주말에 뭐 해요?", "What are you doing at the weekend?"],
    ["k157", "주", "week", "Woche", "다음 주에 시험이 있어요.", "There's an exam next week."],
    ["k158", "월요일", "Monday", "Montag", "월요일에 회사에 가요.", "On Monday I go to the office."],
    ["k159", "화요일", "Tuesday", "Dienstag", "화요일에 수업이 있어요.", "I have class on Tuesday."],
    ["k160", "수요일", "Wednesday", "Mittwoch", "수요일에 만나요.", "Let's meet on Wednesday."],
    ["k161", "목요일", "Thursday", "Donnerstag", "목요일은 바빠요.", "Thursday is busy."],
    ["k162", "금요일", "Friday", "Freitag", "금요일 저녁에 파티가 있어요.", "There's a party on Friday evening."],
    ["k163", "토요일", "Saturday", "Samstag", "토요일에 쉬어요.", "I rest on Saturday."],
    ["k164", "일요일", "Sunday", "Sonntag", "일요일에 교회에 가요.", "I go to church on Sunday."]
  ]);
  add("time/2", 2, [
    ["k165", "그저께", "the day before yesterday", "vorgestern", "그저께 서울에 왔어요.", "I came to Seoul the day before yesterday."],
    ["k166", "모레", "the day after tomorrow", "übermorgen", "모레 떠나요.", "I leave the day after tomorrow."],
    ["k167", "평일", "weekday", "Wochentag, werktags", "평일에는 일해요.", "I work on weekdays."]
  ]);
  add("time/3", 1, [
    ["k168", "월", "month", "Monat", "몇 월이에요?", "What month is it?"],
    ["k169", "년", "year", "Jahr", "이천이십육 년이에요.", "It's 2026."],
    ["k170", "생일", "birthday", "Geburtstag", "생일이 언제예요?", "When is your birthday?"],
    ["k171", "봄", "spring", "Frühling", "봄에 꽃이 피어요.", "Flowers bloom in spring."],
    ["k172", "여름", "summer", "Sommer", "여름은 더워요.", "Summer is hot."],
    ["k173", "가을", "autumn", "Herbst", "가을 하늘이 높아요.", "The autumn sky is high."],
    ["k174", "겨울", "winter", "Winter", "겨울에 눈이 와요.", "It snows in winter."]
  ]);
  add("time/3", 2, [
    ["k175", "작년", "last year", "letztes Jahr", "작년에 한국에 왔어요.", "I came to Korea last year."],
    ["k176", "내년", "next year", "nächstes Jahr", "내년에 졸업해요.", "I graduate next year."],
    ["k177", "계절", "season", "Jahreszeit", "어느 계절을 좋아해요?", "Which season do you like?"],
    ["k178", "휴가", "holiday, vacation", "Urlaub", "여름 휴가를 가요.", "I'm going on summer holiday."],
    ["k179", "명절", "traditional holiday", "traditionelles Fest", "설날은 큰 명절이에요.", "Seollal is a big holiday."]
  ]);
  add("time/4", 1, [
    ["k180", "전", "before, ago", "vor, bevor", "삼 년 전에 왔어요.", "I came three years ago."],
    ["k181", "후", "after, later", "nach, später", "수업 후에 만나요.", "Let's meet after class."],
    ["k182", "다음", "next", "nächste", "다음 역은 서울역이에요.", "The next station is Seoul Station."],
    ["k183", "먼저", "first, beforehand", "zuerst", "먼저 손을 씻으세요.", "Wash your hands first."],
    ["k184", "벌써", "already", "schon", "벌써 끝났어요?", "Is it over already?"],
    ["k185", "곧", "soon", "bald", "곧 도착해요.", "We'll arrive soon."]
  ]);
  add("time/4", 2, [
    ["k186", "아까", "a moment ago", "vorhin", "아까 전화했어요.", "I called a moment ago."],
    ["k187", "요즘", "these days", "heutzutage, in letzter Zeit", "요즘 바빠요.", "I'm busy these days."],
    ["k188", "나중에", "later", "später", "나중에 다시 올게요.", "I'll come back later."],
    ["k189", "드디어", "finally", "endlich", "드디어 방학이에요!", "Finally it's the holidays!"],
    ["k190", "잠깐", "a moment", "einen Moment", "잠깐만 기다려 주세요.", "Please wait a moment."]
  ]);

  add("food/0", 1, [
    ["k191", "먹다", "to eat", "essen", "같이 밥 먹어요.", "Let's eat together."],
    ["k192", "마시다", "to drink", "trinken", "물을 많이 마셔요.", "I drink a lot of water."],
    ["k193", "배고프다", "to be hungry", "hungrig sein", "배고파요. 밥 먹어요.", "I'm hungry. Let's eat."],
    ["k194", "배부르다", "to be full", "satt sein", "많이 먹어서 배불러요.", "I ate a lot, so I'm full."],
    ["k195", "목마르다", "to be thirsty", "durstig sein", "목말라요. 물 좀 주세요.", "I'm thirsty. Some water, please."],
    ["k196", "맛있다", "to be delicious", "lecker sein", "이 김치 정말 맛있어요.", "This kimchi is really delicious."],
    ["k197", "맛없다", "to taste bad", "nicht schmecken", "이 음식은 맛없어요.", "This food doesn't taste good."],
    ["k198", "맵다", "to be spicy", "scharf sein", "떡볶이가 너무 매워요.", "The tteokbokki is too spicy."],
    ["k199", "달다", "to be sweet", "süß sein", "이 케이크는 너무 달아요.", "This cake is too sweet."]
  ]);
  add("food/0", 2, [
    ["k200", "짜다", "to be salty", "salzig sein", "국이 좀 짜요.", "The soup is a bit salty."],
    ["k201", "요리하다", "to cook", "kochen", "주말에 요리해요.", "I cook at the weekend."],
    ["k202", "신선하다", "to be fresh", "frisch sein", "생선이 신선해요.", "The fish is fresh."]
  ]);
  add("food/1", 1, [
    ["k203", "밥", "cooked rice; meal", "Reis; Mahlzeit", "밥을 먹었어요?", "Have you eaten?"],
    ["k204", "음식", "food", "Essen", "한국 음식을 좋아해요.", "I like Korean food."],
    ["k205", "김치", "kimchi", "Kimchi", "김치를 매일 먹어요.", "I eat kimchi every day."],
    ["k206", "빵", "bread", "Brot", "아침에 빵을 먹어요.", "I eat bread in the morning."],
    ["k207", "고기", "meat", "Fleisch", "고기를 안 먹어요.", "I don't eat meat."],
    ["k208", "계란", "egg", "Ei", "계란 두 개 주세요.", "Two eggs, please."],
    ["k209", "라면", "instant noodles", "Instantnudeln", "밤에 라면을 먹었어요.", "I ate ramyeon at night."],
    ["k210", "국", "soup", "Suppe", "국이 뜨거워요.", "The soup is hot."],
    ["k211", "야채", "vegetables", "Gemüse", "야채를 많이 먹으세요.", "Eat lots of vegetables."],
    ["k212", "생선", "fish (as food)", "Fisch (als Essen)", "생선을 구웠어요.", "I grilled fish."],
    ["k213", "불고기", "bulgogi (marinated beef)", "Bulgogi (mariniertes Rindfleisch)", "불고기가 제일 좋아요.", "Bulgogi is my favourite."],
    ["k214", "비빔밥", "bibimbap (mixed rice)", "Bibimbap (gemischter Reis)", "비빔밥 하나 주세요.", "One bibimbap, please."]
  ]);
  add("food/1", 2, [
    ["k215", "떡볶이", "tteokbokki (spicy rice cakes)", "Tteokbokki (scharfe Reiskuchen)", "떡볶이는 길에서 팔아요.", "Tteokbokki is sold in the street."],
    ["k216", "케이크", "cake", "Kuchen", "생일 케이크를 샀어요.", "I bought a birthday cake."],
    ["k217", "소금", "salt", "Salz", "소금을 조금 넣으세요.", "Add a little salt."],
    ["k218", "설탕", "sugar", "Zucker", "설탕은 빼 주세요.", "No sugar, please."],
    ["k219", "아침밥", "breakfast", "Frühstück", "아침밥을 꼭 먹어요.", "I always eat breakfast."]
  ]);
  add("food/2", 1, [
    ["k220", "과일", "fruit", "Obst", "과일을 좋아해요.", "I like fruit."],
    ["k221", "사과", "apple", "Apfel", "사과가 빨개요.", "The apple is red."],
    ["k222", "바나나", "banana", "Banane", "바나나 한 개 주세요.", "One banana, please."],
    ["k223", "딸기", "strawberry", "Erdbeere", "딸기가 달아요.", "The strawberries are sweet."]
  ]);
  add("food/2", 2, [
    ["k224", "수박", "watermelon", "Wassermelone", "여름에 수박을 먹어요.", "We eat watermelon in summer."],
    ["k225", "포도", "grapes", "Weintrauben", "포도 주스를 마셨어요.", "I drank grape juice."],
    ["k226", "귤", "tangerine", "Mandarine", "겨울에는 귤을 먹어요.", "In winter we eat tangerines."]
  ]);
  add("food/3", 1, [
    ["k227", "물", "water", "Wasser", "물 한 잔 주세요.", "A glass of water, please."],
    ["k228", "커피", "coffee", "Kaffee", "아침마다 커피를 마셔요.", "I drink coffee every morning."],
    ["k229", "차", "tea", "Tee", "녹차를 좋아해요.", "I like green tea."],
    ["k230", "우유", "milk", "Milch", "우유를 마셔요.", "I drink milk."],
    ["k231", "주스", "juice", "Saft", "오렌지 주스 주세요.", "Orange juice, please."],
    ["k232", "맥주", "beer", "Bier", "맥주 한 잔 할래요?", "Shall we have a beer?"]
  ]);
  add("food/3", 2, [
    ["k233", "소주", "soju", "Soju", "소주는 한국 술이에요.", "Soju is a Korean liquor."],
    ["k234", "술", "alcohol, liquor", "Alkohol", "저는 술을 못 마셔요.", "I can't drink alcohol."],
    ["k235", "음료수", "drink, beverage", "Getränk", "음료수는 뭐로 하시겠어요?", "What would you like to drink?"]
  ]);
  add("food/4", 1, [
    ["k236", "식당", "restaurant", "Restaurant", "식당이 어디에 있어요?", "Where is the restaurant?"],
    ["k237", "메뉴", "menu", "Speisekarte", "메뉴 좀 보여 주세요.", "Please show me the menu."],
    ["k238", "주문하다", "to order", "bestellen", "주문하시겠어요?", "Would you like to order?"],
    ["k239", "젓가락", "chopsticks", "Essstäbchen", "젓가락을 쓸 수 있어요.", "I can use chopsticks."],
    ["k240", "숟가락", "spoon", "Löffel", "숟가락 하나 더 주세요.", "One more spoon, please."],
    ["k241", "컵", "cup, glass", "Becher, Glas", "컵이 깨졌어요.", "The glass broke."],
    ["k242", "카페", "café", "Café", "카페에서 공부해요.", "I study in a café."]
  ]);
  add("food/4", 2, [
    ["k243", "그릇", "bowl, dish", "Schüssel, Schale", "그릇을 씻었어요.", "I washed the bowls."],
    ["k244", "계산하다", "to pay (the bill)", "bezahlen (die Rechnung)", "여기서 계산해요?", "Do I pay here?"],
    ["k245", "포장하다", "to take away, to wrap", "zum Mitnehmen einpacken", "포장해 주세요.", "To take away, please."]
  ]);

  add("shopping/0", 1, [
    ["k246", "사다", "to buy", "kaufen", "시장에서 과일을 샀어요.", "I bought fruit at the market."],
    ["k247", "팔다", "to sell", "verkaufen", "이 가게는 빵을 팔아요.", "This shop sells bread."],
    ["k248", "가게", "shop", "Laden", "가게가 몇 시에 열어요?", "What time does the shop open?"],
    ["k249", "시장", "market", "Markt", "시장은 사람이 많아요.", "The market is crowded."],
    ["k250", "비싸다", "to be expensive", "teuer sein", "이 가방은 너무 비싸요.", "This bag is too expensive."],
    ["k251", "싸다", "to be cheap", "billig sein", "여기는 물건이 싸요.", "Things are cheap here."],
    ["k252", "선물", "present, gift", "Geschenk", "선물을 받았어요.", "I got a present."],
    ["k253", "얼마", "how much", "wie viel", "이거 얼마예요?", "How much is this?"]
  ]);
  add("shopping/0", 2, [
    ["k254", "편의점", "convenience store", "Supermarkt rund um die Uhr", "편의점에서 우유를 샀어요.", "I bought milk at the convenience store."],
    ["k255", "백화점", "department store", "Kaufhaus", "백화점에서 옷을 샀어요.", "I bought clothes at the department store."],
    ["k256", "마트", "supermarket", "Supermarkt", "마트에 가요.", "I'm going to the supermarket."],
    ["k257", "할인", "discount", "Rabatt", "오늘 할인해요.", "There's a discount today."],
    ["k258", "물건", "thing, goods", "Ding, Ware", "물건을 많이 샀어요.", "I bought a lot of things."]
  ]);
  add("shopping/1", 1, [
    ["k259", "돈", "money", "Geld", "돈이 없어요.", "I don't have money."],
    ["k260", "원", "won (Korean currency)", "Won (koreanische Währung)", "오천 원이에요.", "It's five thousand won."],
    ["k261", "카드", "card (credit card)", "Karte (Kreditkarte)", "카드로 계산할게요.", "I'll pay by card."],
    ["k262", "은행", "bank", "Bank", "은행에 가야 해요.", "I have to go to the bank."]
  ]);
  add("shopping/1", 2, [
    ["k263", "현금", "cash", "Bargeld", "현금으로 낼게요.", "I'll pay in cash."],
    ["k264", "지갑", "wallet", "Geldbeutel", "지갑을 잃어버렸어요.", "I lost my wallet."],
    ["k265", "가격", "price", "Preis", "가격이 얼마예요?", "What's the price?"]
  ]);

  add("day/0", 1, [
    ["k266", "일어나다", "to get up", "aufstehen", "일곱 시에 일어나요.", "I get up at seven."],
    ["k267", "자다", "to sleep", "schlafen", "열한 시에 자요.", "I go to sleep at eleven."],
    ["k268", "씻다", "to wash", "waschen", "손을 씻으세요.", "Wash your hands."],
    ["k269", "입다", "to wear, to put on (clothes)", "anziehen, tragen", "코트를 입으세요.", "Put on a coat."],
    ["k270", "쉬다", "to rest", "sich ausruhen", "주말에 집에서 쉬어요.", "At the weekend I rest at home."],
    ["k271", "청소하다", "to clean", "putzen", "방을 청소했어요.", "I cleaned my room."]
  ]);
  add("day/0", 2, [
    ["k272", "샤워하다", "to shower", "duschen", "아침에 샤워해요.", "I shower in the morning."],
    ["k273", "이를 닦다", "to brush one's teeth", "Zähne putzen", "자기 전에 이를 닦아요.", "I brush my teeth before bed."],
    ["k274", "출근하다", "to go to work", "zur Arbeit gehen", "여덟 시에 출근해요.", "I go to work at eight."],
    ["k275", "퇴근하다", "to leave work", "Feierabend machen", "여섯 시에 퇴근해요.", "I leave work at six."]
  ]);
  add("day/1", 1, [
    ["k276", "집", "house, home", "Haus, Zuhause", "집에 가요.", "I'm going home."],
    ["k277", "방", "room", "Zimmer", "제 방은 작아요.", "My room is small."],
    ["k278", "문", "door", "Tür", "문을 닫아 주세요.", "Please close the door."],
    ["k279", "창문", "window", "Fenster", "창문을 열까요?", "Shall I open the window?"],
    ["k280", "책상", "desk", "Schreibtisch", "책상 위에 책이 있어요.", "There's a book on the desk."],
    ["k281", "의자", "chair", "Stuhl", "의자에 앉으세요.", "Sit on the chair."],
    ["k282", "침대", "bed", "Bett", "침대가 편해요.", "The bed is comfortable."],
    ["k283", "화장실", "toilet, bathroom", "Toilette, Bad", "화장실이 어디예요?", "Where is the toilet?"],
    ["k284", "부엌", "kitchen", "Küche", "어머니가 부엌에 계세요.", "Mother is in the kitchen."],
    ["k285", "텔레비전", "television", "Fernseher", "텔레비전을 봐요.", "I watch television."]
  ]);
  add("day/1", 2, [
    ["k286", "냉장고", "refrigerator", "Kühlschrank", "우유는 냉장고에 있어요.", "The milk is in the fridge."],
    ["k287", "열쇠", "key", "Schlüssel", "열쇠를 잃어버렸어요.", "I lost my key."],
    ["k288", "아파트", "apartment block, flat", "Wohnung, Wohnblock", "아파트 십 층에 살아요.", "I live on the tenth floor of an apartment block."],
    ["k289", "불", "light; fire", "Licht; Feuer", "불 좀 꺼 주세요.", "Please turn off the light."],
    ["k290", "에어컨", "air conditioner", "Klimaanlage", "에어컨을 켤까요?", "Shall I turn on the air conditioner?"]
  ]);

  add("clothes/0", 1, [
    ["k291", "옷", "clothes", "Kleidung", "새 옷을 샀어요.", "I bought new clothes."],
    ["k292", "바지", "trousers", "Hose", "청바지를 입어요.", "I wear jeans."],
    ["k293", "치마", "skirt", "Rock", "치마가 예뻐요.", "The skirt is pretty."],
    ["k294", "신발", "shoes", "Schuhe", "신발을 벗으세요.", "Please take off your shoes."],
    ["k295", "모자", "hat, cap", "Mütze, Hut", "모자를 쓰세요.", "Put on a hat."],
    ["k296", "가방", "bag", "Tasche", "가방이 무거워요.", "The bag is heavy."],
    ["k297", "우산", "umbrella", "Regenschirm", "우산을 가져가세요.", "Take an umbrella."]
  ]);
  add("clothes/0", 2, [
    ["k298", "셔츠", "shirt", "Hemd", "흰 셔츠를 입었어요.", "I'm wearing a white shirt."],
    ["k299", "양말", "socks", "Socken", "양말이 젖었어요.", "My socks got wet."],
    ["k300", "안경", "glasses", "Brille", "안경을 써요.", "I wear glasses."],
    ["k301", "코트", "coat", "Mantel", "겨울 코트가 필요해요.", "I need a winter coat."]
  ]);
  add("clothes/1", 1, [
    ["k302", "핸드폰", "mobile phone", "Handy", "핸드폰 번호가 뭐예요?", "What's your mobile number?"],
    ["k303", "전화", "telephone, call", "Telefon, Anruf", "전화해 주세요.", "Please call me."],
    ["k304", "컴퓨터", "computer", "Computer", "컴퓨터로 일해요.", "I work on the computer."],
    ["k305", "사진", "photo", "Foto", "사진을 찍어도 돼요?", "May I take a photo?"],
    ["k306", "영화", "film, movie", "Film", "영화 보러 가요.", "Let's go and see a film."],
    ["k307", "노래", "song", "Lied", "이 노래를 좋아해요.", "I like this song."]
  ]);
  add("clothes/1", 2, [
    ["k308", "인터넷", "internet", "Internet", "인터넷이 느려요.", "The internet is slow."],
    ["k309", "이메일", "email", "E-Mail", "이메일을 보냈어요.", "I sent an email."],
    ["k310", "카메라", "camera", "Kamera", "새 카메라를 샀어요.", "I bought a new camera."],
    ["k311", "신문", "newspaper", "Zeitung", "아버지는 신문을 읽으세요.", "Father reads the newspaper."],
    ["k312", "드라마", "TV drama", "Fernsehserie", "한국 드라마를 봐요.", "I watch Korean dramas."]
  ]);

  add("town/0", 1, [
    ["k313", "학교", "school", "Schule", "학교에 걸어서 가요.", "I walk to school."],
    ["k314", "병원", "hospital", "Krankenhaus", "병원에 가야 해요.", "I have to go to the hospital."],
    ["k315", "회사", "company, office", "Firma", "회사가 멀어요.", "The office is far."],
    ["k316", "호텔", "hotel", "Hotel", "호텔에 묵어요.", "I'm staying at a hotel."],
    ["k317", "공원", "park", "Park", "공원에서 산책해요.", "I take a walk in the park."],
    ["k318", "도서관", "library", "Bibliothek", "도서관에서 책을 빌렸어요.", "I borrowed a book from the library."],
    ["k319", "역", "station", "Bahnhof", "역까지 얼마나 걸려요?", "How long does it take to the station?"],
    ["k320", "길", "road, way", "Straße, Weg", "길을 잃었어요.", "I've lost my way."]
  ]);
  add("town/0", 2, [
    ["k321", "우체국", "post office", "Post", "우체국에서 편지를 보냈어요.", "I sent a letter at the post office."],
    ["k322", "약국", "pharmacy", "Apotheke", "약국이 근처에 있어요?", "Is there a pharmacy nearby?"],
    ["k323", "건물", "building", "Gebäude", "저 건물은 아주 높아요.", "That building is very tall."],
    ["k324", "교회", "church", "Kirche", "일요일에 교회에 가요.", "On Sunday I go to church."],
    ["k325", "박물관", "museum", "Museum", "박물관을 구경했어요.", "I looked around the museum."],
    ["k326", "경찰서", "police station", "Polizeiwache", "경찰서가 어디예요?", "Where is the police station?"],
    ["k327", "곳", "place", "Ort", "조용한 곳이 좋아요.", "I like quiet places."]
  ]);
  add("town/1", 1, [
    ["k328", "어디", "where", "wo", "어디에 가요?", "Where are you going?"],
    ["k329", "위", "on, above", "auf, über", "책상 위에 있어요.", "It's on the desk."],
    ["k330", "아래", "under, below", "unter", "의자 아래에 고양이가 있어요.", "There's a cat under the chair."],
    ["k331", "안", "inside", "innen, in", "가방 안에 뭐가 있어요?", "What's in the bag?"],
    ["k332", "밖", "outside", "draußen", "밖에 비가 와요.", "It's raining outside."],
    ["k333", "앞", "front", "vorne, vor", "학교 앞에서 만나요.", "Let's meet in front of the school."],
    ["k334", "뒤", "behind, back", "hinten, hinter", "집 뒤에 산이 있어요.", "There's a mountain behind the house."],
    ["k335", "옆", "beside, next to", "neben", "은행 옆에 카페가 있어요.", "There's a café next to the bank."],
    ["k336", "왼쪽", "left", "links", "왼쪽으로 가세요.", "Go left."],
    ["k337", "오른쪽", "right", "rechts", "오른쪽에 있어요.", "It's on the right."],
    ["k338", "근처", "nearby", "Nähe", "근처에 편의점이 있어요?", "Is there a convenience store nearby?"]
  ]);
  add("town/1", 2, [
    ["k339", "사이", "between", "zwischen", "은행과 병원 사이에 있어요.", "It's between the bank and the hospital."],
    ["k340", "가운데", "middle", "Mitte", "가운데에 앉으세요.", "Sit in the middle."],
    ["k341", "건너편", "the other side", "gegenüber", "길 건너편에 있어요.", "It's across the street."]
  ]);
  add("town/2", 1, [
    ["k342", "에서", "from; at (place of action)", "aus, von; in (Ort einer Handlung)", "독일에서 왔어요.", "I came from Germany."],
    ["k343", "까지", "until, to", "bis", "역까지 걸어가요.", "I walk to the station."]
  ]);

  add("travel/0", 1, [
    ["k344", "가다", "to go", "gehen, fahren", "학교에 가요.", "I go to school."],
    ["k345", "오다", "to come", "kommen", "친구가 집에 와요.", "A friend is coming to my house."],
    ["k346", "돌아가다", "to go back", "zurückgehen", "다음 달에 독일로 돌아가요.", "I'm going back to Germany next month."],
    ["k347", "도착하다", "to arrive", "ankommen", "몇 시에 도착해요?", "What time do you arrive?"],
    ["k348", "들어가다", "to go in", "hineingehen", "안으로 들어가세요.", "Please go inside."],
    ["k349", "나가다", "to go out", "hinausgehen", "잠깐 나갔다 올게요.", "I'll pop out for a moment."],
    ["k350", "걷다", "to walk", "zu Fuß gehen", "공원까지 걸어요.", "I walk to the park."],
    ["k351", "출발하다", "to depart", "abfahren", "기차가 곧 출발해요.", "The train leaves soon."],
    ["k352", "기다리다", "to wait", "warten", "여기서 기다릴게요.", "I'll wait here."]
  ]);
  add("travel/0", 2, [
    ["k353", "떠나다", "to leave", "verlassen, abreisen", "내일 서울을 떠나요.", "I leave Seoul tomorrow."],
    ["k354", "늦다", "to be late", "spät sein", "늦어서 미안해요.", "Sorry I'm late."],
    ["k355", "건너다", "to cross", "überqueren", "길을 건널 때 조심하세요.", "Be careful when crossing the road."],
    ["k356", "가져가다", "to take along", "mitnehmen", "우산을 가져가세요.", "Take an umbrella with you."]
  ]);
  add("travel/1", 1, [
    ["k357", "버스", "bus", "Bus", "버스를 타요.", "I take the bus."],
    ["k358", "지하철", "subway", "U-Bahn", "지하철이 빨라요.", "The subway is fast."],
    ["k359", "택시", "taxi", "Taxi", "택시를 탈까요?", "Shall we take a taxi?"],
    ["k360", "기차", "train", "Zug", "기차로 부산에 가요.", "I go to Busan by train."],
    ["k361", "비행기", "airplane", "Flugzeug", "비행기 표를 샀어요.", "I bought a plane ticket."],
    ["k362", "자동차", "car", "Auto", "자동차가 있어요?", "Do you have a car?"],
    ["k363", "자전거", "bicycle", "Fahrrad", "자전거를 타요.", "I ride a bike."],
    ["k364", "타다", "to ride, to take (a vehicle)", "fahren, nehmen (Verkehrsmittel)", "버스를 타고 가요.", "I go by bus."],
    ["k365", "공항", "airport", "Flughafen", "공항까지 한 시간 걸려요.", "It takes an hour to the airport."]
  ]);
  add("travel/1", 2, [
    ["k366", "배", "ship, boat", "Schiff, Boot", "배를 타고 제주도에 가요.", "I take the boat to Jeju Island."],
    ["k367", "운전하다", "to drive", "Auto fahren", "운전할 수 있어요?", "Can you drive?"],
    ["k368", "내리다", "to get off", "aussteigen", "다음 역에서 내려요.", "I get off at the next station."],
    ["k369", "갈아타다", "to change (trains, buses)", "umsteigen", "시청역에서 갈아타세요.", "Change at City Hall station."],
    ["k370", "정류장", "bus stop", "Haltestelle", "정류장에서 기다려요.", "I wait at the bus stop."]
  ]);
  add("travel/2", 1, [
    ["k371", "여행", "trip, travel", "Reise", "여행을 좋아해요.", "I like travelling."],
    ["k372", "표", "ticket", "Fahrkarte, Ticket", "표 한 장 주세요.", "One ticket, please."],
    ["k373", "지도", "map", "Karte", "지도를 보세요.", "Look at the map."]
  ]);
  add("travel/2", 2, [
    ["k374", "여권", "passport", "Reisepass", "여권을 보여 주세요.", "Please show me your passport."],
    ["k375", "가방을 싸다", "to pack (a bag)", "packen", "여행 가방을 쌌어요.", "I packed my suitcase."],
    ["k376", "구경하다", "to look around, to sightsee", "sich umsehen, besichtigen", "시내를 구경했어요.", "I looked around the city centre."],
    ["k377", "예약하다", "to book, to reserve", "reservieren", "호텔을 예약했어요.", "I booked a hotel."]
  ]);

  add("body/0", 1, [
    ["k378", "몸", "body", "Körper", "몸이 안 좋아요.", "I don't feel well."],
    ["k379", "머리", "head; hair", "Kopf; Haare", "머리가 아파요.", "I have a headache."],
    ["k380", "얼굴", "face", "Gesicht", "얼굴이 빨개요.", "Your face is red."],
    ["k381", "눈", "eye; snow", "Auge; Schnee", "눈이 커요.", "Your eyes are big."],
    ["k382", "코", "nose", "Nase", "코가 막혔어요.", "My nose is blocked."],
    ["k383", "입", "mouth", "Mund", "입을 벌리세요.", "Open your mouth."],
    ["k384", "귀", "ear", "Ohr", "귀가 아파요.", "My ear hurts."],
    ["k385", "손", "hand", "Hand", "손을 씻어요.", "I wash my hands."],
    ["k386", "발", "foot", "Fuß", "발이 차가워요.", "My feet are cold."],
    ["k387", "다리", "leg; bridge", "Bein; Brücke", "다리가 아파요.", "My leg hurts."]
  ]);
  add("body/0", 2, [
    ["k388", "이", "tooth", "Zahn", "이가 아파요.", "I have toothache."],
    ["k389", "배", "stomach, belly", "Bauch", "배가 아파요.", "I have a stomach ache."],
    ["k390", "목", "neck, throat", "Hals", "목이 아파요.", "I have a sore throat."],
    ["k391", "키", "height", "Körpergröße", "키가 얼마예요?", "How tall are you?"]
  ]);
  add("body/1", 1, [
    ["k392", "아프다", "to hurt, to be sick", "weh tun, krank sein", "어디가 아파요?", "Where does it hurt?"],
    ["k393", "약", "medicine", "Medizin", "약을 드세요.", "Please take the medicine."],
    ["k394", "의사", "doctor", "Arzt, Ärztin", "의사가 되고 싶어요.", "I want to become a doctor."],
    ["k395", "감기", "a cold", "Erkältung", "감기에 걸렸어요.", "I caught a cold."]
  ]);
  add("body/1", 2, [
    ["k396", "열", "fever", "Fieber", "열이 나요.", "I have a fever."],
    ["k397", "간호사", "nurse", "Krankenpfleger, Krankenschwester", "간호사가 친절해요.", "The nurse is kind."],
    ["k398", "건강하다", "to be healthy", "gesund sein", "건강하세요!", "Stay healthy!"],
    ["k399", "다치다", "to get hurt", "sich verletzen", "다리를 다쳤어요.", "I hurt my leg."]
  ]);

  add("nature/0", 1, [
    ["k400", "날씨", "weather", "Wetter", "오늘 날씨가 어때요?", "How's the weather today?"],
    ["k401", "비", "rain", "Regen", "비가 와요.", "It's raining."],
    ["k402", "눈이 오다", "to snow", "schneien", "어제 눈이 왔어요.", "It snowed yesterday."],
    ["k403", "바람", "wind", "Wind", "바람이 많이 불어요.", "It's very windy."],
    ["k404", "덥다", "to be hot", "heiß sein", "오늘은 너무 더워요.", "It's too hot today."],
    ["k405", "춥다", "to be cold", "kalt sein", "겨울은 추워요.", "Winter is cold."],
    ["k406", "따뜻하다", "to be warm", "warm sein", "봄은 따뜻해요.", "Spring is warm."],
    ["k407", "시원하다", "to be cool, refreshing", "kühl, erfrischend sein", "바람이 시원해요.", "The breeze is cool."]
  ]);
  add("nature/0", 2, [
    ["k408", "맑다", "to be clear, sunny", "klar, sonnig sein", "하늘이 맑아요.", "The sky is clear."],
    ["k409", "흐리다", "to be cloudy", "bewölkt sein", "오늘은 흐려요.", "It's cloudy today."],
    ["k410", "구름", "cloud", "Wolke", "구름이 많아요.", "There are lots of clouds."],
    ["k411", "태풍", "typhoon", "Taifun", "태풍이 와요.", "A typhoon is coming."]
  ]);
  add("nature/1", 1, [
    ["k412", "해", "sun", "Sonne", "해가 떴어요.", "The sun has risen."],
    ["k413", "달", "moon", "Mond", "달이 밝아요.", "The moon is bright."],
    ["k414", "하늘", "sky", "Himmel", "하늘이 파래요.", "The sky is blue."],
    ["k415", "산", "mountain", "Berg", "주말에 산에 가요.", "I go to the mountains at the weekend."],
    ["k416", "바다", "sea", "Meer", "바다가 보고 싶어요.", "I want to see the sea."],
    ["k417", "강", "river", "Fluss", "한강은 서울에 있어요.", "The Han River is in Seoul."],
    ["k418", "나무", "tree", "Baum", "나무가 많아요.", "There are many trees."],
    ["k419", "꽃", "flower", "Blume", "꽃이 예뻐요.", "The flowers are pretty."]
  ]);
  add("nature/1", 2, [
    ["k420", "별", "star", "Stern", "밤하늘에 별이 많아요.", "There are many stars in the night sky."],
    ["k421", "섬", "island", "Insel", "제주도는 섬이에요.", "Jeju is an island."],
    ["k422", "자연", "nature", "Natur", "자연을 사랑해요.", "I love nature."]
  ]);
  add("nature/2", 1, [
    ["k423", "동물", "animal", "Tier", "동물을 좋아해요.", "I like animals."],
    ["k424", "개", "dog", "Hund", "개를 키워요.", "I keep a dog."],
    ["k425", "고양이", "cat", "Katze", "고양이가 귀여워요.", "The cat is cute."],
    ["k426", "새", "bird", "Vogel", "새가 노래해요.", "The bird is singing."]
  ]);
  add("nature/2", 2, [
    ["k427", "물고기", "fish (animal)", "Fisch (Tier)", "강에 물고기가 많아요.", "There are many fish in the river."],
    ["k428", "말", "horse", "Pferd", "제주도에서 말을 탔어요.", "I rode a horse on Jeju."],
    ["k429", "소", "cow", "Kuh, Rind", "시골에 소가 있어요.", "There are cows in the countryside."],
    ["k430", "돼지", "pig", "Schwein", "돼지가 배고파요.", "The pig is hungry."]
  ]);

  add("free/0", 1, [
    ["k431", "운동", "exercise, sport", "Sport, Bewegung", "매일 운동해요.", "I exercise every day."],
    ["k432", "축구", "football", "Fußball", "축구를 해요.", "I play football."],
    ["k433", "수영", "swimming", "Schwimmen", "수영을 배워요.", "I'm learning to swim."],
    ["k434", "등산", "hiking", "Wandern, Bergsteigen", "주말에 등산을 가요.", "I go hiking at the weekend."]
  ]);
  add("free/0", 2, [
    ["k435", "야구", "baseball", "Baseball", "야구 경기를 봤어요.", "I watched a baseball game."],
    ["k436", "농구", "basketball", "Basketball", "친구들과 농구했어요.", "I played basketball with friends."],
    ["k437", "경기", "match, game", "Spiel, Wettkampf", "경기에서 이겼어요.", "We won the match."],
    ["k438", "이기다", "to win", "gewinnen", "우리 팀이 이겼어요.", "Our team won."],
    ["k439", "지다", "to lose", "verlieren", "아쉽게 졌어요.", "We lost, sadly."]
  ]);
  add("free/1", 1, [
    ["k440", "취미", "hobby", "Hobby", "취미가 뭐예요?", "What's your hobby?"],
    ["k441", "음악", "music", "Musik", "음악을 들어요.", "I listen to music."],
    ["k442", "노래하다", "to sing", "singen", "노래방에서 노래해요.", "I sing at karaoke."],
    ["k443", "춤추다", "to dance", "tanzen", "춤추는 것을 좋아해요.", "I like dancing."],
    ["k444", "놀다", "to play, to hang out", "spielen, abhängen", "친구들과 놀아요.", "I hang out with friends."],
    ["k445", "게임", "game", "Spiel", "게임을 해요.", "I play games."]
  ]);
  add("free/1", 2, [
    ["k446", "그림", "picture, painting", "Bild, Gemälde", "그림을 그려요.", "I draw pictures."],
    ["k447", "피아노", "piano", "Klavier", "피아노를 쳐요.", "I play the piano."],
    ["k448", "노래방", "karaoke room", "Karaoke-Raum", "노래방에 갈까요?", "Shall we go to karaoke?"],
    ["k449", "산책하다", "to take a walk", "spazieren gehen", "저녁에 산책해요.", "I take a walk in the evening."]
  ]);

  add("school/0", 1, [
    ["k450", "학생", "student", "Schüler, Student", "저는 학생이에요.", "I'm a student."],
    ["k451", "선생님", "teacher", "Lehrer, Lehrerin", "선생님, 질문이 있어요.", "Teacher, I have a question."],
    ["k452", "수업", "class, lesson", "Unterricht", "수업이 몇 시에 끝나요?", "What time does class end?"],
    ["k453", "책", "book", "Buch", "책을 읽어요.", "I read a book."],
    ["k454", "공책", "notebook", "Heft", "공책에 쓰세요.", "Write in your notebook."],
    ["k455", "연필", "pencil", "Bleistift", "연필 좀 빌려 주세요.", "Please lend me a pencil."],
    ["k456", "볼펜", "ballpoint pen", "Kugelschreiber", "볼펜이 없어요.", "I don't have a pen."],
    ["k457", "교실", "classroom", "Klassenzimmer", "교실에 학생이 많아요.", "There are many students in the classroom."],
    ["k458", "대학교", "university", "Universität", "대학교에 다녀요.", "I go to university."]
  ]);
  add("school/0", 2, [
    ["k459", "사전", "dictionary", "Wörterbuch", "사전을 찾아보세요.", "Look it up in the dictionary."],
    ["k460", "반", "class (group)", "Klasse", "우리 반은 열 명이에요.", "There are ten people in our class."],
    ["k461", "친구들", "friends, classmates", "Freunde, Mitschüler", "친구들과 공부해요.", "I study with friends."]
  ]);
  add("school/1", 1, [
    ["k462", "공부하다", "to study", "lernen, studieren", "한국어를 공부해요.", "I study Korean."],
    ["k463", "배우다", "to learn", "lernen", "태권도를 배워요.", "I'm learning taekwondo."],
    ["k464", "가르치다", "to teach", "unterrichten", "영어를 가르쳐요.", "I teach English."],
    ["k465", "숙제", "homework", "Hausaufgaben", "숙제를 다 했어요.", "I've finished my homework."],
    ["k466", "시험", "exam", "Prüfung", "내일 시험이 있어요.", "I have an exam tomorrow."],
    ["k467", "질문", "question", "Frage", "질문 있어요?", "Any questions?"],
    ["k468", "대답하다", "to answer", "antworten", "질문에 대답하세요.", "Answer the question."]
  ]);
  add("school/1", 2, [
    ["k469", "복습하다", "to review", "wiederholen", "집에서 복습해요.", "I review at home."],
    ["k470", "연습하다", "to practise", "üben", "발음을 연습해요.", "I practise pronunciation."],
    ["k471", "발음", "pronunciation", "Aussprache", "발음이 좋아요.", "Your pronunciation is good."],
    ["k472", "유학", "studying abroad", "Auslandsstudium", "한국으로 유학을 왔어요.", "I came to Korea to study."]
  ]);
  add("school/2", 1, [
    ["k473", "일", "work, job", "Arbeit", "일이 많아요.", "I have a lot of work."],
    ["k474", "일하다", "to work", "arbeiten", "은행에서 일해요.", "I work at a bank."],
    ["k475", "회사원", "office worker", "Büroangestellter", "저는 회사원이에요.", "I'm an office worker."]
  ]);
  add("school/2", 2, [
    ["k476", "회의", "meeting", "Besprechung", "세 시에 회의가 있어요.", "There's a meeting at three."],
    ["k477", "동료", "colleague", "Kollege, Kollegin", "동료와 점심을 먹어요.", "I have lunch with colleagues."],
    ["k478", "사장님", "company president, boss", "Chef, Geschäftsführer", "사장님이 오셨어요.", "The boss has arrived."],
    ["k479", "직업", "occupation, job", "Beruf", "직업이 뭐예요?", "What's your job?"]
  ]);

  add("verbs/0", 1, [
    ["k480", "이다", "to be (is, am, are)", "sein", "저는 학생이에요.", "I am a student."],
    ["k481", "있다", "to have; there is; to be (somewhere)", "haben; es gibt; sich befinden", "시간 있어요?", "Do you have time?"],
    ["k482", "없다", "to not have; there isn't", "nicht haben; es gibt nicht", "돈이 없어요.", "I have no money."],
    ["k483", "아니다", "to not be", "nicht sein", "저는 의사가 아니에요.", "I'm not a doctor."]
  ]);
  add("verbs/1", 1, [
    ["k484", "보다", "to see, to watch", "sehen, schauen", "영화를 봐요.", "I watch a film."],
    ["k485", "듣다", "to listen, to hear", "hören", "음악을 들어요.", "I listen to music."],
    ["k486", "말하다", "to speak, to say", "sprechen, sagen", "천천히 말해 주세요.", "Please speak slowly."],
    ["k487", "읽다", "to read", "lesen", "신문을 읽어요.", "I read the newspaper."],
    ["k488", "쓰다", "to write; to use", "schreiben; benutzen", "편지를 써요.", "I write a letter."],
    ["k489", "묻다", "to ask", "fragen", "길을 물어봤어요.", "I asked the way."],
    ["k490", "이야기하다", "to talk", "sich unterhalten", "친구와 이야기해요.", "I talk with a friend."]
  ]);
  add("verbs/2", 1, [
    ["k491", "좋아하다", "to like", "mögen", "커피를 좋아해요.", "I like coffee."],
    ["k492", "싫어하다", "to dislike", "nicht mögen", "추운 날씨를 싫어해요.", "I dislike cold weather."],
    ["k493", "사랑하다", "to love", "lieben", "가족을 사랑해요.", "I love my family."],
    ["k494", "원하다", "to want", "wollen", "뭘 원해요?", "What do you want?"],
    ["k495", "할 수 있다", "can, to be able to", "können", "한국어를 할 수 있어요.", "I can speak Korean."],
    ["k496", "필요하다", "to need", "brauchen", "도움이 필요해요.", "I need help."]
  ]);
  add("verbs/2", 2, [
    ["k497", "바라다", "to hope, to wish", "hoffen, wünschen", "좋은 결과를 바라요.", "I hope for a good result."],
    ["k498", "해야 하다", "must, to have to", "müssen", "일찍 가야 해요.", "I have to go early."]
  ]);
  add("verbs/3", 1, [
    ["k499", "모르다", "to not know", "nicht wissen", "잘 모르겠어요.", "I'm not sure."],
    ["k500", "생각하다", "to think", "denken", "다시 생각해 볼게요.", "I'll think about it again."],
    ["k501", "이해하다", "to understand", "verstehen", "이해했어요?", "Did you understand?"],
    ["k502", "기억하다", "to remember", "sich erinnern", "그 이름을 기억해요.", "I remember that name."],
    ["k503", "잊다", "to forget", "vergessen", "약속을 잊었어요.", "I forgot the appointment."],
    ["k504", "찾다", "to look for, to find", "suchen, finden", "열쇠를 찾고 있어요.", "I'm looking for my key."]
  ]);
  add("verbs/3", 2, [
    ["k505", "결정하다", "to decide", "entscheiden", "아직 결정 못 했어요.", "I haven't decided yet."],
    ["k506", "고르다", "to choose", "auswählen", "하나 고르세요.", "Choose one."],
    ["k507", "믿다", "to believe, to trust", "glauben, vertrauen", "저를 믿으세요.", "Trust me."],
    ["k508", "준비하다", "to prepare", "vorbereiten", "시험을 준비해요.", "I'm preparing for the exam."]
  ]);
  add("verbs/4", 1, [
    ["k509", "하다", "to do", "machen, tun", "뭐 해요?", "What are you doing?"],
    ["k510", "만들다", "to make", "machen, herstellen", "케이크를 만들었어요.", "I made a cake."],
    ["k511", "주다", "to give", "geben", "이거 저한테 주세요.", "Please give this to me."],
    ["k512", "받다", "to receive", "bekommen", "편지를 받았어요.", "I received a letter."],
    ["k513", "열다", "to open", "öffnen", "문을 열어 주세요.", "Please open the door."],
    ["k514", "닫다", "to close", "schließen", "창문을 닫으세요.", "Close the window."],
    ["k515", "시작하다", "to start", "anfangen", "수업을 시작해요.", "Let's start the class."],
    ["k516", "끝나다", "to end", "enden", "영화가 끝났어요.", "The film has ended."],
    ["k517", "앉다", "to sit", "sitzen, sich setzen", "여기 앉으세요.", "Please sit here."],
    ["k518", "서다", "to stand", "stehen", "여기에 서 있어요.", "I'm standing here."]
  ]);
  add("verbs/4", 2, [
    ["k519", "빌리다", "to borrow", "leihen", "책을 빌렸어요.", "I borrowed a book."],
    ["k520", "바꾸다", "to change, to exchange", "wechseln, tauschen", "돈을 바꾸고 싶어요.", "I'd like to exchange money."],
    ["k521", "놓다", "to put, to place", "legen, stellen", "여기에 놓으세요.", "Put it here."],
    ["k522", "켜다", "to turn on", "einschalten", "불을 켜 주세요.", "Please turn on the light."],
    ["k523", "끄다", "to turn off", "ausschalten", "텔레비전을 꺼요.", "I turn off the television."],
    ["k524", "잃어버리다", "to lose (something)", "verlieren (etwas)", "지갑을 잃어버렸어요.", "I lost my wallet."]
  ]);
  add("verbs/5", 1, [
    ["k525", "돕다", "to help", "helfen", "제가 도와 드릴게요.", "Let me help you."],
    ["k526", "가르쳐 주다", "to teach (someone), to show", "jemandem beibringen, zeigen", "길을 가르쳐 주세요.", "Please show me the way."]
  ]);
  add("verbs/5", 2, [
    ["k527", "초대하다", "to invite", "einladen", "생일 파티에 초대했어요.", "I invited them to the birthday party."],
    ["k528", "참가하다", "to take part", "teilnehmen", "대회에 참가해요.", "I'm taking part in the contest."],
    ["k529", "약속하다", "to promise; to make an appointment", "versprechen; sich verabreden", "내일 만나기로 약속했어요.", "We agreed to meet tomorrow."]
  ]);

  add("describe/0", 1, [
    ["k530", "크다", "to be big", "groß sein", "집이 커요.", "The house is big."],
    ["k531", "작다", "to be small", "klein sein", "방이 작아요.", "The room is small."],
    ["k532", "많다", "to be many, much", "viel sein", "사람이 많아요.", "There are many people."],
    ["k533", "적다", "to be few, little", "wenig sein", "시간이 적어요.", "There's little time."],
    ["k534", "길다", "to be long", "lang sein", "머리가 길어요.", "Her hair is long."],
    ["k535", "짧다", "to be short", "kurz sein", "치마가 짧아요.", "The skirt is short."],
    ["k536", "빠르다", "to be fast", "schnell sein", "지하철이 빨라요.", "The subway is fast."],
    ["k537", "느리다", "to be slow", "langsam sein", "인터넷이 느려요.", "The internet is slow."],
    ["k538", "좋다", "to be good", "gut sein", "날씨가 좋아요.", "The weather is good."],
    ["k539", "나쁘다", "to be bad", "schlecht sein", "기분이 나빠요.", "I'm in a bad mood."],
    ["k540", "새롭다", "to be new", "neu sein", "새로운 친구를 만났어요.", "I met a new friend."],
    ["k541", "쉽다", "to be easy", "leicht sein", "한글은 쉬워요.", "Hangul is easy."],
    ["k542", "어렵다", "to be difficult", "schwer sein", "문법이 어려워요.", "The grammar is difficult."],
    ["k543", "가깝다", "to be near", "nah sein", "집이 가까워요.", "My house is near."],
    ["k544", "멀다", "to be far", "weit sein", "학교가 멀어요.", "The school is far."]
  ]);
  add("describe/0", 2, [
    ["k545", "높다", "to be high", "hoch sein", "산이 높아요.", "The mountain is high."],
    ["k546", "낮다", "to be low", "niedrig sein", "의자가 낮아요.", "The chair is low."],
    ["k547", "무겁다", "to be heavy", "schwer sein (Gewicht)", "가방이 무거워요.", "The bag is heavy."],
    ["k548", "가볍다", "to be light", "leicht sein (Gewicht)", "이 노트북은 가벼워요.", "This laptop is light."],
    ["k549", "깨끗하다", "to be clean", "sauber sein", "방이 깨끗해요.", "The room is clean."],
    ["k550", "더럽다", "to be dirty", "schmutzig sein", "신발이 더러워요.", "The shoes are dirty."],
    ["k551", "맞다", "to be right, correct", "richtig sein", "네, 맞아요.", "Yes, that's right."],
    ["k552", "틀리다", "to be wrong", "falsch sein", "답이 틀렸어요.", "The answer is wrong."]
  ]);
  add("describe/1", 1, [
    ["k553", "색", "colour", "Farbe", "무슨 색을 좋아해요?", "What colour do you like?"],
    ["k554", "빨간색", "red", "Rot", "빨간색 차예요.", "It's a red car."],
    ["k555", "파란색", "blue", "Blau", "파란색 셔츠를 샀어요.", "I bought a blue shirt."],
    ["k556", "노란색", "yellow", "Gelb", "노란색 꽃이에요.", "It's a yellow flower."],
    ["k557", "하얀색", "white", "Weiß", "하얀색 신발이에요.", "They're white shoes."],
    ["k558", "검은색", "black", "Schwarz", "검은색 가방이에요.", "It's a black bag."]
  ]);
  add("describe/1", 2, [
    ["k559", "초록색", "green", "Grün", "초록색을 좋아해요.", "I like green."]
  ]);
  add("describe/2", 1, [
    ["k560", "기쁘다", "to be glad", "froh sein", "만나서 기뻐요.", "I'm glad to meet you."],
    ["k561", "행복하다", "to be happy", "glücklich sein", "지금 정말 행복해요.", "I'm really happy now."],
    ["k562", "슬프다", "to be sad", "traurig sein", "영화가 슬퍼요.", "The film is sad."],
    ["k563", "화나다", "to get angry", "wütend werden", "왜 화났어요?", "Why are you angry?"],
    ["k564", "피곤하다", "to be tired", "müde sein", "오늘은 피곤해요.", "I'm tired today."],
    ["k565", "바쁘다", "to be busy", "beschäftigt sein", "요즘 바빠요.", "I'm busy these days."],
    ["k566", "재미있다", "to be fun, interesting", "Spaß machen, interessant sein", "한국어 공부가 재미있어요.", "Studying Korean is fun."],
    ["k567", "재미없다", "to be boring", "langweilig sein", "그 영화는 재미없어요.", "That film is boring."],
    ["k568", "웃다", "to laugh, to smile", "lachen, lächeln", "아기가 웃어요.", "The baby is laughing."],
    ["k569", "울다", "to cry", "weinen", "왜 울어요?", "Why are you crying?"]
  ]);
  add("describe/2", 2, [
    ["k570", "무섭다", "to be scary, afraid", "Angst machen, sich fürchten", "그 영화는 무서워요.", "That film is scary."],
    ["k571", "걱정하다", "to worry", "sich Sorgen machen", "걱정하지 마세요.", "Don't worry."],
    ["k572", "외롭다", "to be lonely", "einsam sein", "혼자 있으면 외로워요.", "I'm lonely when I'm alone."],
    ["k573", "심심하다", "to be bored", "sich langweilen", "집에 있으니까 심심해요.", "I'm bored staying at home."],
    ["k574", "기분", "mood, feeling", "Stimmung, Laune", "오늘 기분이 좋아요.", "I'm in a good mood today."]
  ]);
  add("describe/3", 1, [
    ["k575", "예쁘다", "to be pretty", "hübsch sein", "꽃이 예뻐요.", "The flower is pretty."],
    ["k576", "귀엽다", "to be cute", "süß sein", "강아지가 귀여워요.", "The puppy is cute."],
    ["k577", "멋있다", "to be cool, stylish", "cool, schick sein", "그 옷이 멋있어요.", "Those clothes look cool."],
    ["k578", "친절하다", "to be kind", "freundlich sein", "직원이 친절해요.", "The staff are kind."],
    ["k579", "조용하다", "to be quiet", "ruhig sein", "도서관은 조용해요.", "The library is quiet."],
    ["k580", "시끄럽다", "to be noisy", "laut sein", "밖이 시끄러워요.", "It's noisy outside."],
    ["k581", "같다", "to be the same", "gleich sein", "우리는 나이가 같아요.", "We're the same age."],
    ["k582", "다르다", "to be different", "anders sein", "생각이 달라요.", "Our opinions differ."]
  ]);
  add("describe/3", 2, [
    ["k583", "편하다", "to be comfortable, convenient", "bequem, praktisch sein", "이 신발은 편해요.", "These shoes are comfortable."],
    ["k584", "중요하다", "to be important", "wichtig sein", "건강이 제일 중요해요.", "Health is most important."],
    ["k585", "유명하다", "to be famous", "berühmt sein", "이 식당은 유명해요.", "This restaurant is famous."],
    ["k586", "똑똑하다", "to be smart", "klug sein", "동생이 똑똑해요.", "My younger sibling is smart."],
    ["k587", "위험하다", "to be dangerous", "gefährlich sein", "밤에는 위험해요.", "It's dangerous at night."],
    ["k588", "안전하다", "to be safe", "sicher sein", "한국은 안전해요.", "Korea is safe."]
  ]);
  add("describe/4", 2, [
    ["k589", "문제", "problem, question", "Problem, Aufgabe", "문제가 있어요.", "There's a problem."],
    ["k590", "이유", "reason", "Grund", "이유가 뭐예요?", "What's the reason?"],
    ["k591", "방법", "way, method", "Methode, Weg", "좋은 방법이 있어요.", "There's a good way."],
    ["k592", "경험", "experience", "Erfahrung", "좋은 경험이었어요.", "It was a good experience."],
    ["k593", "약속", "appointment, promise", "Verabredung, Versprechen", "오늘 약속이 있어요.", "I have plans today."]
  ]);

  add("questions/0", 1, [
    ["k594", "뭐", "what", "was", "뭐 먹을까요?", "What shall we eat?"],
    ["k595", "언제", "when", "wann", "언제 와요?", "When are you coming?"],
    ["k596", "왜", "why", "warum", "왜 늦었어요?", "Why were you late?"],
    ["k597", "어떻게", "how", "wie", "어떻게 가요?", "How do I get there?"],
    ["k598", "어느", "which", "welcher", "어느 것이 좋아요?", "Which one do you like?"],
    ["k599", "몇", "how many (with counters)", "wie viele (mit Zählwort)", "몇 시예요?", "What time is it?"],
    ["k600", "무슨", "what kind of", "was für ein", "무슨 음식을 좋아해요?", "What kind of food do you like?"],
    ["k601", "어때요", "how is it?", "wie ist es?", "이 옷 어때요?", "How do these clothes look?"]
  ]);

  add("grammar/0", 1, [
    ["k602", "안", "not (before a verb)", "nicht (vor dem Verb)", "저는 고기를 안 먹어요.", "I don't eat meat."],
    ["k603", "못", "cannot", "nicht können", "수영을 못 해요.", "I can't swim."],
    ["k604", "아주", "very", "sehr", "아주 맛있어요.", "It's very delicious."],
    ["k605", "정말", "really", "wirklich", "정말 고마워요.", "Thank you so much."],
    ["k606", "너무", "too, very", "zu, sehr", "너무 비싸요.", "It's too expensive."],
    ["k607", "제일", "most, the best", "am meisten, am besten", "제일 좋아하는 음식이에요.", "It's my favourite food."],
    ["k608", "조금", "a little", "ein bisschen", "한국어를 조금 해요.", "I speak a little Korean."],
    ["k609", "많이", "a lot", "viel", "많이 드세요.", "Please eat a lot."]
  ]);
  add("grammar/0", 2, [
    ["k610", "더", "more", "mehr", "조금 더 주세요.", "A little more, please."],
    ["k611", "덜", "less", "weniger", "덜 맵게 해 주세요.", "Make it less spicy, please."],
    ["k612", "별로", "not really, not particularly", "nicht besonders", "별로 안 좋아해요.", "I don't really like it."]
  ]);
  add("grammar/1", 1, [
    ["k613", "그리고", "and (then)", "und", "밥을 먹어요. 그리고 커피를 마셔요.", "I eat. And then I drink coffee."],
    ["k614", "하고", "and, with", "und, mit", "친구하고 영화를 봤어요.", "I watched a film with a friend."],
    ["k615", "그런데", "but, by the way", "aber, übrigens", "그런데 이름이 뭐예요?", "By the way, what's your name?"],
    ["k616", "그래서", "so, therefore", "deshalb, also", "비가 와요. 그래서 집에 있어요.", "It's raining. So I'm staying home."],
    ["k617", "하지만", "but, however", "aber, jedoch", "맛있어요. 하지만 비싸요.", "It's tasty. But it's expensive."],
    ["k618", "도", "also, too", "auch", "저도 학생이에요.", "I'm a student too."],
    ["k619", "만", "only", "nur", "물만 마셔요.", "I only drink water."]
  ]);
  add("grammar/1", 2, [
    ["k620", "그러면", "then, in that case", "dann, in dem Fall", "그러면 내일 만나요.", "Then let's meet tomorrow."],
    ["k621", "또는", "or", "oder", "커피 또는 차를 드세요.", "Have coffee or tea."],
    ["k622", "왜냐하면", "because", "weil", "왜냐하면 바빴어요.", "Because I was busy."]
  ]);
  add("grammar/2", 1, [
    ["k623", "다시", "again", "wieder, nochmal", "다시 말해 주세요.", "Please say it again."],
    ["k624", "자주", "often", "oft", "자주 만나요.", "We meet often."],
    ["k625", "항상", "always", "immer", "항상 고마워요.", "Thank you, always."],
    ["k626", "가끔", "sometimes", "manchmal", "가끔 영화를 봐요.", "I sometimes watch films."],
    ["k627", "같이", "together", "zusammen", "같이 가요!", "Let's go together!"],
    ["k628", "빨리", "quickly", "schnell", "빨리 오세요.", "Come quickly."],
    ["k629", "천천히", "slowly", "langsam", "천천히 드세요.", "Eat slowly."],
    ["k630", "아직", "still, not yet", "noch, noch nicht", "아직 안 먹었어요.", "I haven't eaten yet."]
  ]);
  add("grammar/2", 2, [
    ["k631", "갑자기", "suddenly", "plötzlich", "갑자기 비가 왔어요.", "Suddenly it rained."],
    ["k632", "아마", "probably, maybe", "wahrscheinlich, vielleicht", "아마 늦을 거예요.", "I'll probably be late."],
    ["k633", "물론", "of course", "natürlich", "물론이죠!", "Of course!"],
    ["k634", "보통", "usually", "normalerweise", "보통 일곱 시에 일어나요.", "I usually get up at seven."],
    ["k635", "꼭", "surely, without fail", "unbedingt", "꼭 오세요.", "Be sure to come."]
  ]);
  add("grammar/3", 1, [
    ["k636", "은/는", "topic particle", "Themenpartikel", "저는 민수예요.", "I'm Minsu."],
    ["k637", "이/가", "subject particle", "Subjektpartikel", "날씨가 좋아요.", "The weather is good."],
    ["k638", "을/를", "object particle", "Objektpartikel", "사과를 먹어요.", "I eat an apple."],
    ["k639", "에", "to, at, in (place, time)", "nach, in, um (Ort, Zeit)", "학교에 가요.", "I go to school."],
    ["k640", "의", "possessive particle ('s)", "Genitivpartikel", "제 친구의 집이에요.", "It's my friend's house."]
  ]);
  add("grammar/3", 2, [
    ["k641", "(으)로", "by, with, towards", "mit, nach, in Richtung", "버스로 가요.", "I go by bus."],
    ["k642", "한테", "to (a person)", "an, zu (einer Person)", "친구한테 전화했어요.", "I called a friend."],
    ["k643", "보다", "than (in comparisons)", "als (im Vergleich)", "형이 저보다 커요.", "My brother is taller than me."]
  ]);

  window.KO_WORDS = out;
})();
