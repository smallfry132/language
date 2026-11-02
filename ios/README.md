# Language Trainer for iPhone

The native iPhone app: the same courses, lessons, dialogues and practice as the web app, built in SwiftUI.
It syncs with the web app through the same sync code (Settings → Sync).

What the native app adds:

- **Speech recognition on the iPhone** (Apple's recogniser, on the device or on Apple's servers as it decides; the expected word is passed as a hint, and Chinese homophones such as 事 for 是 count) for words and dialogue lines, and a recording of every attempt to play back next to the model voice.
- **Tone curve** computed from the raw microphone samples (the same YIN pitch tracking as the web app, sped up with Accelerate).
- **Voices**: Apple's voices, including Premium and Enhanced ones (download them under Settings → Accessibility → Spoken Content → Voices, then pick one in the app's settings). Speech plays even with the silent switch on.
- **New words per day** can be set in Settings (also synced to the web app).

## Run it on your iPhone

1. Open `ios/LanguageTrainer.xcodeproj` in Xcode.
2. Xcode → Settings → Accounts: add your Apple ID (a free one works).
3. Select the **LanguageTrainer** target → **Signing & Capabilities** → choose your team. If Xcode says the bundle id is taken, change `com.smallfry132.languagetrainer` to something of your own.
4. Connect the iPhone with a cable, choose it at the top of the Xcode window and press **Run** (⌘R).
5. The first time: on the iPhone, Settings → General → VPN & Device Management → trust your developer certificate. iOS 16+ also asks you to turn on Developer Mode (Settings → Privacy & Security → Developer Mode).

With a free Apple ID the app runs for 7 days, then Xcode has to install it again (just press Run). A paid Apple Developer account ($99/year) removes that limit and allows TestFlight.

## Layout

```
LanguageTrainer.xcodeproj   Xcode project (app + UI tests); the folders below are picked up automatically
LanguageTrainer/            The app
  App.swift                 Tabs, navigation, settings sheet
  Store.swift               The learner's state: saving, change stamps, sync with the web app's server
  Speech.swift              Voices, microphone, speech recognition
  SpeakingViews.swift       Microphone button, feedback, tone-curve chart
  Today.swift               Today and the guided session
  Exercises.swift           Flashcards, multiple choice, listening, typing, meet, say the word, matching
  Practice.swift            Practice home, session setup, results, tone/number/sound drills
  Typer.swift               Typewriter
  Lessons.swift             Lessons, lesson editor, dialogue list
  DialogueView.swift        Dialogues: listen, read aloud, your turn
  WordsView.swift           Word tiles and word details
  SoundChart.swift          Sound chart
  SettingsViews.swift       Statistics, settings, sync, tone guide, tips, about
  Trace.swift               Trace characters (stroke order in a 田字格)
  Intents.swift             Siri and Shortcuts: Quiz me, Word of the day, Listening practice
LanguageWidget/             Home and Lock Screen widgets (word of the day, daily quiz, today); Info.plist in LanguageWidget-Info.plist
  Theme.swift               Colours and shared building blocks
  Demo.swift                A demo learner for screenshots and tests (launch argument -demo)
LanguageCore/               Swift package with everything that isn't a screen (runs and tests on the Mac)
  Sources/LanguageCore/Data/   Word lists, dialogues, sounds, texts (generated from web/js)
LanguageTrainerUITests/     UI tests
```

## iPad

- Full width: a sidebar instead of the dock (the course, the four sections, My lessons with the newest lessons, Dialogues).
  Split View and Slide Over keep the dock. In landscape Learn uses two columns and a word opens in a pane beside the tiles.
- Keyboard: **1–9** pick an answer (also the article in Der, die, das? and Again/Hard/Good/Easy on a card),
  **Space** shows a card's answer and goes on to the next question, **⌘ Return** adds the words in Add words.
  (A plain Return does not reach a button on iOS without a text field, and the iPad keeps the arrow keys for moving between items.)
- Apple Pencil in character tracing: the stroke follows the pressure; double-tap or squeeze shows the strokes once more.
- Drag a word tile from Words onto a lesson in the sidebar to add it (or into another app as text).
- The word-of-the-day widget also comes in the large size.

## Develop

```bash
cd ios/LanguageCore && swift test                      # logic tests on the Mac
node tools/export-data.mjs                             # after changing web/js data or texts
xcodebuild -project ios/LanguageTrainer.xcodeproj -scheme LanguageTrainer \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro' test   # UI tests in the simulator
```

Launch arguments for testing: `-demo` (a demo learner), `-mute` (silent voices), `-route today/session` (open a screen),
`-autostart`, `-step 2`, `-dlgmode turn`, `-syncURL http://127.0.0.1:8765/api/sync`, `-syncCode XXXXX-…`.

## Widgets and Siri

The **LanguageWidget** extension has three widgets, for all six courses: the word of the day (Home Screen small and
medium, Lock Screen) in each course's look, where the medium size's Hear it button plays the word without opening the
app and a tap elsewhere opens the app and plays it; a daily quiz (one two-option question a day, answered in the
widget; the answer stays in the widget, so it isn't counted as a review); and Today, which shows a quiet “Open the app
to see today's plan” until progress can be shared. Siri and Shortcuts know “Quiz me in Trainer” (five two-option
questions inside Siri, iOS 26), “Trainer word of the day” (said twice, with an example) and “Listening practice in
Trainer” (opens the app's five-question listening round).

Streak and due words on the widgets need an **App Group**, which free Apple IDs can't always add: with a paid
account, add the App Groups capability to both the LanguageTrainer and LanguageWidget targets with the group
`group.com.smallfry132.languagetrainer`. Without it the widgets simply leave those numbers out.
