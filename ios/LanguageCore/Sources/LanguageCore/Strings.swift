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
            "newPerDay": "New words per day"
        ],
        "de": [
            "micPermission": "Erlaube Mikrofon und Spracherkennung in den Einstellungen, um das Sprechen zu üben.",
            "openSettings": "Einstellungen öffnen",
            "syncCodeHintApp": "Gib diesen Code auf deinen anderen Geräten unter Einstellungen → Synchronisieren ein. Wer den Code kennt, kann deinen Fortschritt sehen und ändern – behalte ihn für dich.",
            "paste": "Einfügen",
            "voiceHint": "Bessere Stimmen: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen. Lade eine Premium- oder erweiterte Stimme für die Sprache und wähle sie hier.",
            "installApp": "Das ist die native iPhone-App. Derselbe Kurs läuft auch im Browser unter language-smoky-five.vercel.app, und die Synchronisierung hält beide gleich.",
            "deleteConfirm": "Löschen",
            "newPerDay": "Neue Wörter pro Tag"
        ]
    ]
}
