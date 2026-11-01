import Foundation

/// The interface texts of the web app (exported to strings.json), looked up the same way:
/// pinyin-first wording, then the course's own wording, then the base table, then English.
public struct Strings: Decodable, Sendable {
    public enum Value: Decodable, Sendable {
        case text(String)
        case list([String])
        public init(from decoder: Decoder) throws {
            let c = try decoder.singleValueContainer()
            if let s = try? c.decode(String.self) { self = .text(s) } else { self = .list(try c.decode([String].self)) }
        }
    }
    typealias Table = [String: [String: Value]] // lang → key → value
    let base: Table
    let pinyinFirst: Table
    let course: [String: Table]

    func value(_ key: String, lang: String, course c: String, pinyinFirst pf: Bool) -> Value? {
        if pf, let v = pinyinFirst[lang]?[key] { return v }
        if let o = course[c] { if let v = o[lang]?[key] ?? o["en"]?[key] { return v } }
        return base[lang]?[key] ?? base["en"]?[key]
    }
}

/// Texts for one moment of the app: interface language, course and pinyin-first mode
public struct Texts: Sendable {
    public let lang: String
    public let course: String
    public let pinyinFirst: Bool
    let strings: Strings

    public init(lang: String, course: String, pinyinFirst: Bool, strings: Strings = Library.shared.strings) {
        self.lang = lang; self.course = course; self.pinyinFirst = pinyinFirst; self.strings = strings
    }

    /// t("wordsCount", 3, 10) → "3 of 10 words"; a "key.one" form is used when the first number is 1
    public func callAsFunction(_ key: String, _ args: CustomStringConvertible...) -> String {
        if let extra = Texts.extra[lang]?[key] ?? Texts.extra["en"]?[key] { return fill(extra, args) }
        if key == "toneLike", lang == "en", let n = args.first.flatMap({ Int("\($0)") }) {
            return "sounded like a \(["", "1st", "2nd", "3rd", "4th"][max(0, min(4, n))]) tone"
        }
        var template: String?
        if let first = args.first, "\(first)" == "1", case .text(let s)? = strings.value(key + ".one", lang: lang, course: course, pinyinFirst: pinyinFirst) { template = s }
        if template == nil, case .text(let s)? = strings.value(key, lang: lang, course: course, pinyinFirst: pinyinFirst) { template = s }
        return fill(template ?? key, args)
    }

    public func list(_ key: String) -> [String] {
        if case .list(let l)? = strings.value(key, lang: lang, course: course, pinyinFirst: pinyinFirst) { return l }
        return []
    }

    private func fill(_ s: String, _ args: [CustomStringConvertible]) -> String {
        var out = s
        for (i, a) in args.enumerated() { out = out.replacingOccurrences(of: "{\(i)}", with: "\(a)") }
        return out
    }

    /// Texts only the native app needs
    static let extra: [String: [String: String]] = [
        "en": [
            "micPermission": "Allow microphone and speech recognition in Settings to use speaking practice.",
            "openSettings": "Open Settings",
            "syncCodeHintApp": "Enter this code on your other devices under Settings → Sync. Anyone with the code can see and change your progress, so keep it private.",
            "paste": "Paste",
            "voiceHint": "Better voices: Settings → Accessibility → Spoken Content → Voices. Download a Premium or Enhanced voice for the language, then pick it here.",
            "installApp": "This is the native iPhone app. The same course also runs in the browser at language-smoky-five.vercel.app, and sync keeps both in step.",
            "deleteConfirm": "Delete",
            "newPerDay": "New words per day",
            "voiceGuideTitle": "Get a natural voice",
            "voiceGuideBanner": "This iPhone only has the basic {0} voice. A free, much more natural one takes a minute to download.",
            "voiceGuideWhy": "Apps can't download voices themselves: the iPhone keeps them in the Settings app. Do this once per language:",
            "voiceStep1": "Tap “Open Settings” below, then go back to the main list of Settings.",
            "voiceStep2": "Go to Accessibility → Spoken Content → Voices. Or type “Voices” into the search field at the top of Settings.",
            "voiceStep3": "Choose {0}, then a voice such as {1}, and tap the download symbol next to “Premium” or “Enhanced”.",
            "voiceStep4": "Come back here: the app uses the new voice by itself.",
            "voiceNow": "Voice now: {0}",
            "voiceGood": "✓ A natural voice is installed.",
            "voiceNone": "No voice for this language yet.",
            "voiceShowMe": "Show me how",
            "notNow": "Not now",
            "readingLayer": "Reading help",
            "readingLayerDesc": "Pinyin, romanization or kana with each word.",
            "readingAlways": "Always", "readingNew": "New words", "readingOff": "Off",
            "learn": "Learn", "me": "Me", "continue": "Continue", "wordOfDay": "Word of the day",
            "dueCount": "{0} due", "minutes": "{0} min", "learningCourse": "Learning {0} · {1}",
            "dailyPlan": "Daily plan", "maxReviews": "Max reviews per day", "whileStudying": "While studying",
            "voiceMic": "Voice & microphone", "colorTones": "Colour by tone", "autoPlay": "Auto-play audio",
            "reminder": "Daily reminder", "reminderBody": "A few minutes of {0} keep your streak going.",
            "tipTitle": "Tip", "allTips": "All tips", "allDialogues": "All dialogues", "testMic": "Test microphone",
            "words3": "{0} words", "goalToday": "Today’s goal",
            "lessonEmpty": "No lessons yet. Add the words from each class with your tutor, and Learn will train exactly those.",
            "backToday": "Back to Learn"
        ],
        "de": [
            "micPermission": "Erlaube Mikrofon und Spracherkennung in den Einstellungen, um das Sprechen zu üben.",
            "openSettings": "Einstellungen öffnen",
            "syncCodeHintApp": "Gib diesen Code auf deinen anderen Geräten unter Einstellungen → Synchronisieren ein. Wer den Code kennt, kann deinen Fortschritt sehen und ändern – behalte ihn für dich.",
            "paste": "Einfügen",
            "voiceHint": "Bessere Stimmen: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen. Lade eine Premium- oder erweiterte Stimme für die Sprache und wähle sie hier.",
            "installApp": "Das ist die native iPhone-App. Derselbe Kurs läuft auch im Browser unter language-smoky-five.vercel.app, und die Synchronisierung hält beide gleich.",
            "deleteConfirm": "Löschen",
            "newPerDay": "Neue Wörter pro Tag",
            "voiceGuideTitle": "Natürliche Stimme einrichten",
            "voiceGuideBanner": "Auf diesem iPhone gibt es nur die einfache Stimme für {0}. Eine kostenlose, viel natürlichere ist in einer Minute geladen.",
            "voiceGuideWhy": "Apps können Stimmen nicht selbst laden: das iPhone verwaltet sie in den Einstellungen. Einmal pro Sprache:",
            "voiceStep1": "Tippe unten auf „Einstellungen öffnen“ und geh dann zurück zur Hauptliste der Einstellungen.",
            "voiceStep2": "Öffne Bedienungshilfen → Gesprochene Inhalte → Stimmen. Oder tippe „Stimmen“ oben ins Suchfeld der Einstellungen.",
            "voiceStep3": "Wähle {0}, dann eine Stimme wie {1}, und tippe auf das Download-Symbol neben „Premium“ oder „Erweitert“.",
            "voiceStep4": "Komm hierher zurück: die App nutzt die neue Stimme von selbst.",
            "voiceNow": "Stimme jetzt: {0}",
            "voiceGood": "✓ Eine natürliche Stimme ist installiert.",
            "voiceNone": "Noch keine Stimme für diese Sprache.",
            "voiceShowMe": "Zeig mir wie",
            "notNow": "Später",
            "readingLayer": "Lesehilfe",
            "readingLayerDesc": "Pinyin, Umschrift oder Kana zu jedem Wort.",
            "readingAlways": "Immer", "readingNew": "Neue Wörter", "readingOff": "Aus",
            "learn": "Lernen", "me": "Ich", "continue": "Weiter", "wordOfDay": "Wort des Tages",
            "dueCount": "{0} fällig", "minutes": "{0} Min.", "learningCourse": "Lernt {0} · {1}",
            "dailyPlan": "Tagesplan", "maxReviews": "Höchstens Wiederholungen pro Tag", "whileStudying": "Beim Lernen",
            "voiceMic": "Stimme & Mikrofon", "colorTones": "Nach Ton einfärben", "autoPlay": "Audio automatisch abspielen",
            "reminder": "Tägliche Erinnerung", "reminderBody": "Ein paar Minuten {0} halten deine Serie am Leben.",
            "tipTitle": "Tipp", "allTips": "Alle Tipps", "allDialogues": "Alle Dialoge", "testMic": "Mikrofon testen",
            "words3": "{0} Wörter", "goalToday": "Tagesziel",
            "lessonEmpty": "Noch keine Lektionen. Füge nach jeder Stunde die Wörter deiner Lehrerin oder deines Lehrers hinzu, dann übt „Lernen“ genau diese.",
            "backToday": "Zurück zu Lernen"
        ]
    ]
}
