import Foundation

/* The learner's state. Same JSON shape as the web app's localStorage document (hsk1trainer.v1),
 * so both can sync through the same server. Entries of the keyed maps carry their change time `t`;
 * a deleted entry stays as a tombstone { gone: 1, t } so the deletion reaches the other devices. */

public let DAY: Double = 86_400_000
public func nowMs() -> Double { (Date().timeIntervalSince1970 * 1000).rounded() }
public func todayKey(_ ms: Double? = nil) -> String {
    let d = ms.map { Date(timeIntervalSince1970: $0 / 1000) } ?? Date()
    let c = Calendar.current.dateComponents([.year, .month, .day], from: d)
    return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
}

/// A word id as the web app stores it: a number for Chinese words, a string otherwise
public struct WordRef: Codable, Hashable, Sendable {
    public let id: String
    public init(_ id: String) { self.id = id }
    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let n = try? c.decode(Int.self) { id = String(n) } else if let d = try? c.decode(Double.self) { id = String(Int(d)) } else { id = try c.decode(String.self) }
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        if let n = Int(id), String(n) == id { try c.encode(n) } else { try c.encode(id) }
    }
}

/// An entry of a synced map: knows its change time and whether it was deleted
public protocol SyncEntry: Codable {
    var t: Double? { get set }
    var gone: Int? { get set }
    static func tombstone(_ t: Double) -> Self
}

extension KeyedDecodingContainer {
    func get<T: Decodable>(_ key: Key, _ fallback: T) -> T { ((try? decodeIfPresent(T.self, forKey: key)) ?? nil) ?? fallback }
}

public struct Card: SyncEntry, Equatable {
    public var ef = 2.5, interval = 0.0, reps = 0, due = 0.0, lapses = 0
    public var first: String?
    public var ok: String?
    public var t: Double?
    public var gone: Int?
    enum K: String, CodingKey { case ef, interval, reps, due, lapses, first, ok, t, gone }
    public init() {}
    public static func tombstone(_ t: Double) -> Card { var c = Card(); c.gone = 1; c.t = t; return c }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        gone = c.get(.gone, nil as Int?); t = c.get(.t, nil as Double?)
        ef = c.get(.ef, 2.5); interval = c.get(.interval, 0.0); reps = c.get(.reps, 0); due = c.get(.due, 0.0); lapses = c.get(.lapses, 0)
        first = c.get(.first, nil as String?); ok = c.get(.ok, nil as String?)
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encodeIfPresent(t, forKey: .t)
        if gone != nil { try c.encode(1, forKey: .gone); return }
        try c.encode(ef, forKey: .ef); try c.encode(interval, forKey: .interval); try c.encode(reps, forKey: .reps)
        try c.encode(due, forKey: .due); try c.encode(lapses, forKey: .lapses)
        try c.encodeIfPresent(first, forKey: .first); try c.encodeIfPresent(ok, forKey: .ok)
    }
}

public struct Lesson: SyncEntry, Equatable {
    public var course = "zh", name = "", words: [WordRef] = [], created = 0.0
    public var t: Double?
    public var gone: Int?
    enum K: String, CodingKey { case course, name, words, created, t, gone }
    public init(course: String, name: String, created: Double) { self.course = course; self.name = name; self.created = created }
    public static func tombstone(_ t: Double) -> Lesson { var l = Lesson(course: "", name: "", created: 0); l.gone = 1; l.t = t; return l }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        gone = c.get(.gone, nil as Int?); t = c.get(.t, nil as Double?)
        course = c.get(.course, "zh"); name = c.get(.name, ""); words = c.get(.words, [WordRef]()); created = c.get(.created, 0.0)
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encodeIfPresent(t, forKey: .t)
        if gone != nil { try c.encode(1, forKey: .gone); return }
        try c.encode(course, forKey: .course); try c.encode(name, forKey: .name); try c.encode(words, forKey: .words); try c.encode(created, forKey: .created)
    }
}

public struct CustomWord: SyncEntry, Equatable {
    public var course = "zh", hz = "", py = "", en = ""
    public var t: Double?
    public var gone: Int?
    enum K: String, CodingKey { case course, hz, py, en, t, gone }
    public init(course: String, hz: String, py: String, en: String) { self.course = course; self.hz = hz; self.py = py; self.en = en }
    public static func tombstone(_ t: Double) -> CustomWord { var w = CustomWord(course: "", hz: "", py: "", en: ""); w.gone = 1; w.t = t; return w }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        gone = c.get(.gone, nil as Int?); t = c.get(.t, nil as Double?)
        course = c.get(.course, "zh"); hz = c.get(.hz, ""); py = c.get(.py, ""); en = c.get(.en, "")
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encodeIfPresent(t, forKey: .t)
        if gone != nil { try c.encode(1, forKey: .gone); return }
        try c.encode(course, forKey: .course); try c.encode(hz, forKey: .hz); try c.encode(py, forKey: .py); try c.encode(en, forKey: .en)
    }
}

public struct DialogueProgress: SyncEntry, Equatable {
    public struct Read: Codable, Equatable {
        public var best: Double, last: Double, acc: Double?
        public init(best: Double, last: Double, acc: Double?) { self.best = best; self.last = last; self.acc = acc }
    }
    public struct Turn: Codable, Equatable {
        public var best: Int, last: Int
        public init(best: Int, last: Int) { self.best = best; self.last = last }
    }
    public var listen: String?
    public var read: Read?
    public var turn: Turn?
    public var t: Double?
    public var gone: Int?
    public init() {}
    public static func tombstone(_ t: Double) -> DialogueProgress { var d = DialogueProgress(); d.gone = 1; d.t = t; return d }
    enum K: String, CodingKey { case listen, read, turn, t, gone }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        gone = c.get(.gone, nil as Int?); t = c.get(.t, nil as Double?)
        listen = c.get(.listen, nil as String?); read = c.get(.read, nil as Read?); turn = c.get(.turn, nil as Turn?)
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encodeIfPresent(t, forKey: .t)
        if gone != nil { try c.encode(1, forKey: .gone); return }
        try c.encodeIfPresent(listen, forKey: .listen); try c.encodeIfPresent(read, forKey: .read); try c.encodeIfPresent(turn, forKey: .turn)
    }
}

public struct Stats: Codable, Equatable {
    public var answered = 0, correct = 0, sessions = 0
    public var days: [String: Int] = [:]
    public var since = 0.0
    enum K: String, CodingKey { case answered, correct, sessions, days, since }
    public init(since: Double = 0) { self.since = since }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        answered = c.get(.answered, 0); correct = c.get(.correct, 0); sessions = c.get(.sessions, 0)
        days = c.get(.days, [String: Int]()); since = c.get(.since, 0.0)
    }
}

public struct Settings: Codable, Equatable {
    public var rate = 0.85, autoSpeak = true, tilePinyin = true, quizSize = 10, dailyGoal = 20, theme = "auto", newPerDay = 5
    public var f0base: Double?
    public var dlgHz: Bool?, dlgTr: Bool?, dlgSlow: Bool?
    /// Chosen voice per course. Voices differ per device, so this is never synced.
    public var voices: [String: String]?
    enum K: String, CodingKey { case rate, autoSpeak, tilePinyin, quizSize, dailyGoal, theme, newPerDay, f0base, dlgHz, dlgTr, dlgSlow, voices }
    public init() {}
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        rate = c.get(.rate, 0.85); autoSpeak = c.get(.autoSpeak, true); tilePinyin = c.get(.tilePinyin, true); quizSize = c.get(.quizSize, 10)
        dailyGoal = c.get(.dailyGoal, 20); theme = c.get(.theme, "auto"); newPerDay = c.get(.newPerDay, 5)
        f0base = c.get(.f0base, nil as Double?); dlgHz = c.get(.dlgHz, nil as Bool?); dlgTr = c.get(.dlgTr, nil as Bool?); dlgSlow = c.get(.dlgSlow, nil as Bool?)
        voices = c.get(.voices, nil as [String: String]?)
    }
    /// The settings that sync (without the device's voices)
    public var synced: Settings { var s = self; s.voices = nil; return s }
}

public struct CourseState: Codable, Equatable {
    public var levels: [Int] = [1]
    public var pinyinFirst: Bool?
    public init() {}
}

public struct AppState: Codable, Equatable {
    public var lang = Locale.preferredLanguages.first?.hasPrefix("de") == true ? "de" : "en"
    public var srs: [String: Card] = [:]
    public var favs: [WordRef] = []
    public var stats = Stats()
    public var settings = Settings()
    public var course = "zh"
    public var courses: [String: CourseState] = ["zh": CourseState(), "vi": CourseState(), "ja": CourseState()]
    public var lessons: [String: Lesson] = [:]
    public var custom: [String: CustomWord] = [:]
    public var dlg: [String: DialogueProgress] = [:]
    public var peers: [String: Stats] = [:]
    public var mt: [String: Double] = [:]
    public var typer: [String: Int]?
    public init() {}

    enum K: String, CodingKey { case lang, srs, favs, stats, settings, course, courses, lessons, custom, dlg, peers, mt, typer }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        let d = AppState()
        lang = c.get(.lang, d.lang); srs = c.get(.srs, d.srs); favs = c.get(.favs, d.favs); stats = c.get(.stats, d.stats)
        settings = c.get(.settings, d.settings); course = c.get(.course, d.course); courses = c.get(.courses, d.courses)
        lessons = c.get(.lessons, d.lessons); custom = c.get(.custom, d.custom); dlg = c.get(.dlg, d.dlg)
        peers = c.get(.peers, d.peers); mt = c.get(.mt, d.mt); typer = c.get(.typer, nil as [String: Int]?)
        for k in ["zh", "vi", "ja"] where (courses[k]?.levels ?? []).isEmpty { courses[k] = CourseState() }
        if Course.all.allSatisfy({ $0.id != course }) { course = "zh" }
    }
}
