# Language Trainer for iPhone

The native iPhone app: the same courses, lessons, dialogues and practice as the web app, built in SwiftUI.
It syncs with the web app through the same sync code (Settings → Sync).

What the native app adds:

- **Speech recognition on the iPhone** (Apple's recogniser, on the device when the language supports it) for words and dialogue lines, and a recording of every attempt to play back next to the model voice.
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
  Intents.swift             Siri and Shortcuts: Quiz me, Word of the day
LanguageWidget/             Home and Lock Screen widgets (word of the day); Info.plist in LanguageWidget-Info.plist
  Theme.swift               Colours and shared building blocks
  Demo.swift                A demo learner for screenshots and tests (launch argument -demo)
LanguageCore/               Swift package with everything that isn't a screen (runs and tests on the Mac)
  Sources/LanguageCore/Data/   Word lists, dialogues, sounds, texts (generated from web/js)
LanguageTrainerUITests/     UI tests
```

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

The **LanguageWidget** extension shows the word of the day (Home Screen small and medium, Lock Screen) in each
course's look; tapping it opens the app and plays the word. Siri and Shortcuts know “Quiz me in Trainer” (five
listening questions) and “Trainer word of the day”.

Streak and due words on the widgets need an **App Group**, which free Apple IDs can't always add: with a paid
account, add the App Groups capability to both the LanguageTrainer and LanguageWidget targets with the group
`group.com.smallfry132.languagetrainer`. Without it the widgets simply leave those numbers out.
