# HSK Trainer

A web app for studying the 600 words of **HSK levels 1–3** (150 + 150 + 300), optimized for **iPhone** (Safari, installable as a full-screen web app) and **Mac**.

No build step, no dependencies, no backend: plain HTML, CSS and JavaScript. Progress is stored locally in the browser.

## Features

- **Word tiles (Kachel-Übersicht)** – all words of the selected HSK levels as tiles with hanzi, pinyin (Latin pronunciation) and translation. Search by hanzi, pinyin (with or without tones) or meaning; filter by category or learning status; tap a tile for details, example sentence and audio.
- **Level selector** – study HSK 1, 2 and 3 individually or combined. The selection applies to tiles, training and progress.
- **English and German** – the UI is bilingual; HSK 1 words carry German translations, HSK 2 and 3 are English only (German falls back to English).
- **Pronunciation** via the device's speech synthesis (Chinese voice on iOS and macOS).
- **Training modes**
  - Flashcards with spaced repetition (SM-2 style scheduling, "Again / Hard / Good / Easy")
  - Multiple choice in four directions (character → meaning, meaning → character, character → pinyin, pinyin → character)
  - Type the pinyin (tones optional; tone numbers like `ni3hao3` are checked when given)
  - Listening: hear a word, pick the character
  - Matching game with timer
  - Tone drill: hear a syllable and identify its tone
  - Number trainer for 1–99 (read and write)
- **Progress** – known / learning / new counts, due reviews, streak, daily goal, activity heatmap, progress per category.
- **Extras** – tone guide with audio, pinyin tips, appearance (auto / light / dark), speech speed.
- **PWA** – manifest, icons and a service worker so the app works offline once loaded.

## Run it

Any static web server works. For local use:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or publish the repository with GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder) and open the resulting URL on your iPhone or Mac.

## Install on iPhone

1. Open the page in Safari.
2. Tap the Share button.
3. Choose **Add to Home Screen**.

The app then launches full screen, respects the notch and home indicator, and works offline.

On a Mac, use Safari's **File → Add to Dock** or bookmark the page.

## Project layout

```
index.html            App shell
css/style.css         Styles (light/dark, iPhone safe areas, desktop sidebar)
js/data.js            HSK 1 words: hanzi, pinyin, EN/DE, category, example sentence
js/data-hsk2.js       HSK 2 words (English)
js/data-hsk3.js       HSK 3 words (English)
js/app.js             Application logic (views, training modes, spaced repetition, speech, storage)
manifest.webmanifest  PWA manifest
sw.js                 Service worker (offline cache)
icons/                App icons (SVG + PNG for iOS home screen)
```

## Data

The word lists follow the official **HSK 2.0** standard (2012): 150 words for HSK 1, 150 for HSK 2 and 300 for HSK 3. The word membership and pinyin were checked against the MIT-licensed lists in [glxxyz/hskhsk.com](https://github.com/glxxyz/hskhsk.com). The concise translations, categories and example sentences were written for this app; treat them as learner-oriented glosses rather than dictionary entries. Edit the `js/data*.js` files to adjust them.

Word ids are stable and used as keys for the stored learning progress: 1–150 HSK 1, 151–301 HSK 2, 302–601 HSK 3.
