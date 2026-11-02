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

    public static func pick(course: String, date: Date = Date()) -> (word: Word, picture: String?)? {
        guard var words = load("words-\(course)", [Word].self) else { return nil }
        words = words.filter { $0.lvl == 1 }
        let pics = load("pictures", [String: [String: String]].self)?[course] ?? [:]
        let withPic = words.filter { pics[$0.id] != nil && !$0.hz.contains(" ") }
        let pool = withPic.count >= 7 ? withPic : Array(words.prefix(60))
        guard !pool.isEmpty else { return nil }
        let day = Int(date.timeIntervalSince1970 / 86400 + Double(TimeZone.current.secondsFromGMT(for: date)) / 86400)
        var w = pool[day % pool.count]; w.course = course
        return (w, pics[w.id])
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
