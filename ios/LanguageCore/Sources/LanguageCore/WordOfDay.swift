import Foundation

/* The word of the day for widgets and Siri: one word with a picture from the first level of a course, the same all
 * day, picked from the bundled lists only (a widget cannot read the app's progress without an App Group).
 * Loads just the one course's file, so the widget stays small in memory. */

public enum WordOfDay {
    private static func load<T: Decodable>(_ name: String, _ type: T.Type) -> T? {
        guard let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Data"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    /// German and Spanish nouns carry their article ("die Tür"); the one-word check looks at the word after it
    public static func bare(_ w: Word) -> String {
        guard w.g != nil, let sp = w.hz.firstIndex(of: " ") else { return w.hz }
        return String(w.hz[w.hz.index(after: sp)...])
    }
    static func dayNumber(_ date: Date) -> Int {
        Int(date.timeIntervalSince1970 / 86400 + Double(TimeZone.current.secondsFromGMT(for: date)) / 86400)
    }
    static func pool(_ course: String) -> (words: [Word], pics: [String: String])? {
        guard let words = load("words-\(course)", [Word].self)?.filter({ $0.lvl == 1 }) else { return nil }
        let pics = load("pictures", [String: [String: String]].self)?[course] ?? [:]
        let withPic = words.filter { pics[$0.id] != nil && !bare($0).contains(" ") }
        let pool = withPic.count >= 7 ? withPic : Array(words.prefix(60))
        return pool.isEmpty ? nil : (pool.map { var w = $0; w.course = course; return w }, pics)
    }

    public static func pick(course: String, date: Date = Date()) -> (word: Word, picture: String?)? {
        guard let p = pool(course) else { return nil }
        let w = p.words[dayNumber(date) % p.words.count]
        return (w, p.pics[w.id])
    }

    /// One question a day for the quiz widget, five for Siri (n = 0…4): a word other than the word of the day, and a
    /// second word with a different meaning and spelling to choose against
    public static func quiz(course: String, date: Date = Date(), n: Int = 0) -> (word: Word, other: Word, rightFirst: Bool)? {
        guard let p = pool(course), p.words.count > 3 else { return nil }
        let day = dayNumber(date), c = p.words.count
        let w = p.words[(day + c / 2 + n * 7) % c]
        var k = (day * 3 + n + 1) % c
        while p.words[k].id == w.id || p.words[k].en == w.en || p.words[k].hz == w.hz { k = (k + 1) % c }
        return (w, p.words[k], (day + n) % 2 == 0)
    }
}

/// What the app shares with its widgets when an App Group is set up (streak, due words); absent otherwise
public struct WidgetSnapshot: Codable, Sendable {
    public var course: String
    public var streak: Int
    public var due: Int
    public var day: String
    public init(course: String, streak: Int, due: Int, day: String) { self.course = course; self.streak = streak; self.due = due; self.day = day }

    public static let appGroup = "group.com.smallfry132.languagetrainer"
    /// nil without the App Group entitlement (free developer accounts can't add one), so nothing is shared then
    static var file: URL? { FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup)?.appendingPathComponent("widget.json") }
    public static func read() -> WidgetSnapshot? { file.flatMap { try? Data(contentsOf: $0) }.flatMap { try? JSONDecoder().decode(WidgetSnapshot.self, from: $0) } }
    public func write() { if let f = Self.file, let d = try? JSONEncoder().encode(self) { try? d.write(to: f, options: .atomic) } }
}
