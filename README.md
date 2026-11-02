# Language Trainer

An app for studying vocabulary in four courses: **Chinese, HSK levels 1–3** (150 + 150 + 300 words), **Japanese, JLPT N5–N1** (about 8,000 words), **Vietnamese, A1–C2** (950 words in six levels) and **Korean, A1–A2** (643 words). Switch between them with the button in the top-left corner; each course keeps its own words, levels and progress. The app is optimized for **iPhone** (Safari, installable as a full-screen web app) and **Mac**.

It comes in two forms that share the same courses and sync with each other:

| Folder | What | Runs on |
|---|---|---|
| [`web/`](web) | The web app: plain HTML, CSS and JavaScript, no build step. Also hosts the sync server. | Any browser; installable on iPhone, Mac and Android home screens |
| [`ios/`](ios) | The native iPhone app in SwiftUI, with Apple's on-device speech recognition and voices | iPhone and iPad (iOS 17+) |
| [`android/`](android) | Reserved for a native Android app (not started) | – |

The web app's word lists, dialogues, sound charts and texts are the single source: `node tools/export-data.mjs` copies them into the iPhone app.

## Features

- **Today** (start screen) – one guided session per day: review the due words, meet a few new words (listen and repeat out loud), then hear-and-pick and hear-and-write them. Streak, daily goal and words known at a glance.
- **Dialogues** (Chinese) – eight short HSK 1 conversations (greetings, names, nationality, where you're from, family, ordering food, time, your day). Three ways through each: *Listen* (line by line, tap a word for its meaning), *Read aloud* (the microphone checks which syllables came through and keeps your reading time) and *Your turn* (the app speaks one role, you answer by speaking or typing pinyin).
- **Tone curve** (Chinese, Say the word and the daily Speak step) – your pitch is measured on the device while you speak (YIN pitch tracking, nothing is uploaded), split into syllables and drawn over the shape of each expected tone, including the 3rd-tone change (nǐ hǎo → ní hǎo). Mismatches get a short tip. It is a rough guide: it learns the middle of your voice over time.
- **Speaking** – speech recognition through the browser (Safari on Mac and iPhone, Chrome) checks words and sentences; where it isn't available you record yourself and compare with the model voice.
- **Practice** is grouped by skill: Listen, Speak, Read, Write. Pinyin is coloured by tone everywhere.
- **One look per language** – Ink Grid for Chinese (paper, ink and a seal red; characters in a 田字格 practice grid), Quiet Ruby for Japanese (washi, indigo, Mincho type, furigana above the word), Block Builder for Korean (each syllable block shown with its letters: consonants blue, vowels yellow, final consonants red), Tone Color for Vietnamese (forest and lime; every syllable in its tone's colour with its tone contour). Each has its own palette in light and dark, corners, the font for words and tab labels in its own script. Mandarin and Vietnamese share one tone-colour system by contour (level red, rising amber, dipping green, falling blue). *Reading help* (Settings) shows pinyin, romanization or kana always, for new words only, or never.
- **Topics** (all courses; Chinese sorted by hand, Vietnamese and Japanese generated from it by meaning, see `tools/build-topics.mjs`) – all 601 words in 20 topics in learning order (greetings, people, family, countries, numbers, time, food, shopping, home, clothes, town, travel, body, nature, free time, school, verbs, describing, questions, little words), each split into small groups in a natural order: numbers 0 → 10, days yesterday → tomorrow, opposites in pairs, verbs by meaning. Words, practice and the daily new words follow this order.
- **Pictures** – 184 Chinese, 137 Vietnamese and 183 Japanese words that can be drawn have an emoji picture, shown on tiles, new words, flashcards and Say the word. *Picture to word* and *Hear and pick the picture* train meaning without a translation in between; in multiple choice and listening, a word with a picture is asked with pictures.
- **Lessons** – one lesson per class with your tutor: add words from the lists or your own words (pinyin, characters, meaning). New words for Today come from the newest lesson first; each lesson can also be practised on its own.
- **Pinyin first** (Chinese, on by default) – for learners who don't read characters yet: pinyin is shown big everywhere, and quizzes, listening and matching use pinyin and meaning instead of characters. Turn it off under More → Settings when you start learning characters.
- **Sync** – keeps progress, lessons and settings the same on Mac and iPhone through a sync code (More → Sync). Needs the server setup below.
- **Word tiles (Kachel-Übersicht)** – all words of the selected HSK levels as tiles with hanzi, pinyin (Latin pronunciation) and translation. Search by hanzi, pinyin (with or without tones) or meaning; filter by category or learning status; tap a tile for details, example sentence and audio.
- **Course switcher** (top-left) – Chinese, Japanese or Vietnamese. The whole app follows: word set, levels, speech voice, tone system, number trainer and pronunciation tips.
- **Level selector** – study HSK 1, 2 and 3 (or A1 to C2) individually or combined. The selection applies to tiles, training and progress.
- **English and German** – the UI is bilingual; HSK 1 words carry German translations, HSK 2 and 3 are English only (German falls back to English).
- **Pronunciation** via the device's speech synthesis (Chinese or Vietnamese voice on iOS and macOS).
- **Training modes**
  - Flashcards with spaced repetition (SM-2 style scheduling, "Again / Hard / Good / Easy")
  - Multiple choice in four directions (character → meaning, meaning → character, character → pinyin, pinyin → character)
  - Type the pinyin (tones optional; tone numbers like `ni3hao3` are checked when given)
  - Listening: hear a word, pick the character
  - Matching game with timer
  - Typewriter: copy-type pinyin (with tone marks) or Vietnamese (with all diacritics) as fast as you can, with live per-character highlighting, words per minute and accuracy. Enter finishes the line, reads it aloud and moves to the next one. In Chinese, tone numbers turn into marks as you type (`ni3` → `nǐ`, `lv4` → `lǜ`); for Vietnamese use the system's Telex or VNI keyboard. Words, example sentences or both; personal best WPM is kept per course.
  - Tone drill: hear a syllable and identify its tone (4 Mandarin tones, 6 Vietnamese tones)
  - Number trainer for 1–99 (read and write), Chinese and Vietnamese
- **Sounds** – a textbook-style pronunciation chart per language: one base sound per row with its variants as playable cells (Mandarin finals and initials across the four tones, Vietnamese vowels across the six tones plus consonants and final consonants, the Japanese kana tables plus length and double-consonant contrasts). Tapping a cell plays it and lists real words from the word lists containing that sound. A listen-and-pick drill trains minimal pairs (tones, similar consonants, similar vowels, long vs short vowels).
- **Daily session** – Meet · Cards · Listen · Say · Type with one header (step, words left, minutes left); Continue resumes where you stopped; the Done screen lists the words to watch and why.
- **Type the reading** – letters first, then a tone tile per syllable (4 for Chinese, 6 for Vietnamese).
- **Trace characters** (Chinese) – stroke by stroke in a 田字格: Trace, Copy or From memory, with the stroke order. Stroke data for the HSK 1–3 characters comes from [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) / Make Me a Hanzi under the Arphic Public License (`web/data/ARPHICPL.TXT`).
- **Dialogues** in all four languages (Vietnamese and Japanese written for this app), with short tips on single lines.
- **Statistics** – 12-week heatmap, progress per level, tones when speaking, accuracy per skill.
- **First launch** – choose course, level and pinyin first, then check voice and microphone. Clear states when there is no voice, the microphone is off or the sync server can't be reached.
- **Desktop** – from 860 px the dock becomes a sidebar (with My lessons and Dialogues), Learn becomes a grid with a Typer card, Words opens words in a side pane.
- **iPhone widgets and Siri** – word of the day on the Home and Lock Screen; “Quiz me” and “Word of the day” for Siri (see ios/README.md).
- **Progress** – known / learning / new counts, due reviews, streak, daily goal, activity heatmap, progress per category.
- **Extras** – tone guide with audio, pinyin tips, appearance (auto / light / dark), speech speed.
- **PWA** – manifest, icons and a service worker so the app works offline once loaded.

## Run it

Any static web server works. For local use:

```bash
cd web && python3 -m http.server 8000
# then open http://localhost:8000
```

On Vercel the project's **Root Directory** is `web` (Project → Settings → Build and Deployment).

The iPhone app: see [ios/README.md](ios/README.md).

## Sync setup (Vercel)

Sync runs as a Vercel function (`web/api/sync.mjs`) that stores one JSON document per sync code in Upstash Redis.

1. In the Vercel dashboard open the project → **Storage** → **Create Database** → **Upstash for Redis** (free plan) and connect it to the project for all environments. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Redeploy.
3. In the app: More → Sync → **Turn on sync**, then enter the code on the other device. On iPhone, enter it in the Home Screen app: it has its own storage, separate from Safari. The native iPhone app has the same screen under Settings → Sync and syncs with the web app.

The code is the only credential: whoever has it can read and change the progress. The server keeps only a SHA-256 hash of it as the key. Without the database the app works as before and More → Sync says that sync isn't set up.

## Install on iPhone

1. Open the page in Safari.
2. Tap the Share button.
3. Choose **Add to Home Screen**.

The app then launches full screen, respects the notch and home indicator, and works offline.

On a Mac, use Safari's **File → Add to Dock** or bookmark the page.

## Install on Android

1. Open the page in Chrome (or Samsung Internet).
2. Menu (⋮) → **Add to Home screen** / **Install app**.
3. For speech: Android uses the phone's text-to-speech engine. Install **Speech Services by Google** from the Play Store, then in Settings → General management (or System) → Language & input → Text-to-speech output choose Google as the engine and use **Install voice data** to add Chinese and Vietnamese. The app's More → Settings page shows which voice was found and lets you pick one manually.

## Project layout

```
web/
  index.html            App shell
  css/style.css         Styles (light/dark, iPhone safe areas, desktop sidebar)
  js/data.js            HSK 1 words: hanzi, pinyin, EN/DE, category, example sentence
  js/data-hsk2.js       HSK 2 words (English)
  js/data-hsk3.js       HSK 3 words (English)
  js/data-vi.js         Vietnamese A1–A2 words (word, pronunciation guide, English, example)
  js/data-vi-2.js       Vietnamese B1–C2 words
  js/data-ja.js         JLPT N5–N1 words as compact rows [level, kanji, kana, meaning]
  js/data-ko.js         Korean A1–A2 words by topic [id, Hangul, English, German, example, example in English]
  js/korean.js          Hangul → romanization and spoken form (sound changes between syllables)
  js/sounds-data.js     Sound charts and listening drills per language
  js/dialogues.js       Dialogues per course (Chinese: HSK 1)
  js/themes.js          Topics (ordered groups of word ids) and pictures for the Chinese words
  js/themes-auto.js     Topics and pictures for Vietnamese and Japanese (generated, see tools/build-topics.mjs)
  js/app.js             Application logic (views, training modes, spaced repetition, speech, storage, sync)
  api/sync.mjs          Vercel function: sync store (Upstash Redis)
  manifest.webmanifest  PWA manifest
  sw.js                 Service worker (offline cache)
  icons/                App icons (SVG + PNG for iOS home screen)
ios/
  LanguageTrainer.xcodeproj   Xcode project (app + UI tests)
  LanguageTrainer/            SwiftUI screens, speech, microphone, sync client
  LanguageCore/               Swift package: data, spaced repetition, sync merge, answer checks, tone curve (swift test)
  LanguageTrainerUITests/     UI tests that tap through a session, a lesson, a dialogue and the settings
android/                Placeholder for a native Android app
tools/export-data.mjs   Copies the web app's data and texts into the iPhone app
tools/build-topics.mjs  Builds the Vietnamese and Japanese topics and pictures from the Chinese ones and the meanings
tools/check-themes.mjs  Checks that every word is in exactly one topic and no picture is used twice
```

## Data

The word lists follow the official **HSK 2.0** standard (2012): 150 words for HSK 1, 150 for HSK 2 and 300 for HSK 3. The word membership and pinyin were checked against the MIT-licensed lists in [glxxyz/hskhsk.com](https://github.com/glxxyz/hskhsk.com). The concise translations, categories and example sentences were written for this app; treat them as learner-oriented glosses rather than dictionary entries. Edit the `js/data*.js` files to adjust them.

The Japanese list is the JLPT N5–N1 vocabulary from [jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) (MIT), which is based on Jonathan Waller's JLPT lists at tanos.co.uk (CC BY). Kanji, kana reading and English meaning come from that data; romaji and the rough category assignment are derived automatically at load time, and there are no example sentences for Japanese.

The Korean list (643 words, Seoul standard, polite 해요 style, each with an example sentence) was compiled for this app and sorted into the topics by hand; the A1/A2 levels are an editorial grading, not the official TOPIK list. Romanization (Revised Romanization) and the spoken form shown in brackets when sound changes alter the spelling (독일 [도길]) are generated from the Hangul by `js/korean.js`. Korean also has the eight dialogues, a Hangul sound chart with drills for plain/aspirated/tense consonants, similar vowels and final consonants, and Sino-Korean numbers.

The Vietnamese list (950 words, Northern standard) was compiled for this app: A1–B1 cover everyday topics, B2–C1 society, work and formal register, C2 literary and idiomatic vocabulary including common proverbs. The level grading is editorial and not based on an official syllabus. Its pronunciation column is a rough English respelling, not IPA.

Word ids are stable and used as keys for the stored learning progress: 1–150 HSK 1, 151–301 HSK 2, 302–601 HSK 3, `v1`–`v950` Vietnamese (A1 v1–160, A2 v161–350, B1 v351–500, B2 v501–650, C1 v651–800, C2 v801–950), `j1`–`j8034` Japanese in file order (N5 first), `k1`–`k643` Korean.

## Progress storage

The web app stores everything in the browser's localStorage under one key; the iPhone app keeps the same document as a JSON file. Each word has a spaced-repetition record (ease factor, interval in days, repetitions, lapses, next due time); a word with no record is *new*, an interval under 21 days is *learning*, 21 days or more is *known*. Daily answer counts feed the streak, heatmap and daily goal. Nothing leaves the device unless you turn on sync.
