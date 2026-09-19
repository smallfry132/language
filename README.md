# HSK 1 Trainer

A web app for studying the 150 words of **HSK level 1**, optimized for **iPhone** (Safari, installable as a full-screen web app) and **Mac**.

No build step, no dependencies, no backend: plain HTML, CSS and JavaScript. Progress is stored locally in the browser.

## Features

- **Word tiles (Kachel-Übersicht)** – all 150 HSK 1 words as tiles with hanzi, pinyin (Latin pronunciation) and translation. Search by hanzi, pinyin (with or without tones) or meaning; filter by category or learning status; tap a tile for details, example sentence and audio.
- **English and German** translations – switch the whole UI and translations with the EN/DE toggle.
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
js/data.js            The 150 HSK 1 words: hanzi, pinyin, EN/DE, category, example sentence
js/app.js             Application logic (views, training modes, spaced repetition, speech, storage)
manifest.webmanifest  PWA manifest
sw.js                 Service worker (offline cache)
icons/                App icons (SVG + PNG for iOS home screen)
```

## Data

The word list follows the HSK 1 (HSK 2.0, 150 words) standard. Each entry has hanzi, pinyin with tone marks, an English and a German translation, a category, and a short example sentence with pinyin and translations. Edit `js/data.js` to adjust translations or add words.
