import Foundation

/* Word lists, dialogues and sound charts, exported from the web app by tools/export-data.mjs.
 * Every course normalises its words to: id, hz (the word as written), py (pronunciation), meanings,
 * category, level and an optional example. Ids are unique across courses ("1" for Chinese, "v1", "j1"). */

public struct Word: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let hz: String
    public let py: String
    public let en: String
    public let de: String?
    public let cat: String
    public let lvl: Int
    public let ex: String?
    public let exPy: String?
    public let exEn: String?
    public let exDe: String?
    public let kana: String?
    public let romaji: String?
    /// Korean: how the word is said when sound changes alter the spelling (독일 → 도길)
    public let pron: String?
    public var course: String = ""

    enum CodingKeys: String, CodingKey { case id, hz, py, en, de, cat, lvl, ex, exPy, exEn, exDe, kana, romaji, pron }

    public init(id: String, hz: String, py: String, en: String, de: String? = nil, cat: String, lvl: Int, ex: String? = nil, exPy: String? = nil, exEn: String? = nil, exDe: String? = nil, kana: String? = nil, romaji: String? = nil, pron: String? = nil, course: String) {
        self.id = id; self.hz = hz; self.py = py; self.en = en; self.de = de; self.cat = cat; self.lvl = lvl
        self.ex = ex; self.exPy = exPy; self.exEn = exEn; self.exDe = exDe; self.kana = kana; self.romaji = romaji; self.pron = pron; self.course = course
    }
}

public enum Script: String, Sendable { case cjk, latin }

public struct Course: Identifiable, Sendable {
    public let id: String
    public let glyph: String
    public let name: String
    public let title: String
    public let tts: String
    public let script: Script
    public let levels: [Int]
    public let allLabel: String
    public let toneOptions: [Int]?
    public let testPhrase: String
    public let sourceText: String?
    public let sourceURL: String?

    public func levelName(_ l: Int) -> String {
        switch id {
        case "vi": return ["A1", "A2", "B1", "B2", "C1", "C2"][max(0, min(5, l - 1))]
        case "ja": return "N\(6 - l)"
        case "ko": return ["A1", "A2"][max(0, min(1, l - 1))]
        default: return "HSK \(l)"
        }
    }

    public static let all: [Course] = [
        Course(id: "zh", glyph: "中", name: "中文 · Chinese", title: "HSK Trainer", tts: "zh-CN", script: .cjk, levels: [1, 2, 3], allLabel: "HSK 1–3", toneOptions: [1, 2, 3, 4], testPhrase: "你好，我学习汉语。", sourceText: "glxxyz/hskhsk.com", sourceURL: "https://github.com/glxxyz/hskhsk.com"),
        Course(id: "vi", glyph: "Vi", name: "Tiếng Việt · Vietnamese", title: "Tiếng Việt Trainer", tts: "vi-VN", script: .latin, levels: [1, 2, 3, 4, 5, 6], allLabel: "A1–C2", toneOptions: [1, 2, 3, 4, 5, 6], testPhrase: "Xin chào, tôi học tiếng Việt.", sourceText: nil, sourceURL: nil),
        Course(id: "ja", glyph: "あ", name: "日本語 · Japanese", title: "JLPT Trainer", tts: "ja-JP", script: .cjk, levels: [1, 2, 3, 4, 5], allLabel: "N5–N1", toneOptions: nil, testPhrase: "こんにちは。日本語を勉強しています。", sourceText: "jamsinclair/open-anki-jlpt-decks", sourceURL: "https://github.com/jamsinclair/open-anki-jlpt-decks"),
        Course(id: "ko", glyph: "한", name: "한국어 · Korean", title: "Korean Trainer", tts: "ko-KR", script: .cjk, levels: [1, 2], allLabel: "A1–A2", toneOptions: nil, testPhrase: "안녕하세요. 저는 한국어를 공부해요.", sourceText: nil, sourceURL: nil)
    ]
    public static func byId(_ id: String) -> Course { all.first { $0.id == id } ?? all[0] }
}

public struct Category: Codable, Sendable {
    public let en: String
    public let de: String
    public let icon: String
}

/// A text in English and German ({ en, de } in the data files)
public struct LocalText: Codable, Hashable, Sendable {
    public let en: String
    public let de: String?
    public func get(_ lang: String) -> String { lang == "de" ? (de ?? en) : en }
}

public struct Dialogue: Codable, Identifiable, Sendable {
    public struct Person: Codable, Sendable { public let hz: String; public let py: String }
    public struct Line: Codable, Hashable, Sendable {
        public let who: Int
        public let hz: String
        public let py: String
        public let en: String
        public let de: String?
        public func tr(_ lang: String) -> String { lang == "de" ? (de ?? en) : en }
    }
    public let id: String
    public let icon: String?
    public let topic: LocalText
    public let people: [Person]
    public let lines: [Line]
}

/// A topic (Food & drink) with ordered groups of words (Meals, Fruit, Drinks…)
public struct Theme: Codable, Identifiable, Sendable {
    public struct Group: Codable, Sendable { public let name: LocalText; public let ids: [String] }
    public let id: String
    public let icon: String
    public let name: LocalText
    public let groups: [Group]
}

public struct SoundCell: Codable, Hashable, Sendable {
    public let t: String?
    public let s: String?
    public let sub: String?
    public var say: String { s ?? t ?? "" }
}
public struct SoundMatch: Codable, Sendable {
    public let final: String?
    public let initial: String?
    public let vowel: String?
}
public struct SoundRow: Codable, Sendable {
    public let base: String
    public let cells: [SoundCell]
    public let match: SoundMatch?
    public let note: LocalText?
}
public struct SoundGroup: Codable, Identifiable, Sendable {
    public let id: String
    public let name: LocalText
    public let head: [String]?
    public let rows: [SoundRow]
    public let kana: Bool?
}
public struct SoundDrill: Codable, Identifiable, Sendable {
    public let id: String
    public let name: LocalText
    public let sets: [[SoundCell]]
}
public struct SoundData: Codable, Sendable {
    public let intro: LocalText?
    public let groups: [SoundGroup]
    public let drills: [SoundDrill]
}

/// All built-in data, loaded once from the package resources
public final class Library: @unchecked Sendable {
    public static let shared = Library()

    public let words: [String: [Word]]
    public let categories: [String: Category]
    public let categoryOrder: [String]
    public let dialogues: [String: [Dialogue]]
    public let sounds: [String: SoundData]
    public let strings: Strings
    public let themes: [String: [Theme]]
    /// An emoji per word id for words that can be shown as a picture
    public let pictures: [String: String]
    private let index: [String: Word]

    private init() {
        func load<T: Decodable>(_ name: String, _ type: T.Type) -> T {
            guard let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Data"),
                  let data = try? Data(contentsOf: url) else { fatalError("missing resource \(name).json") }
            do { return try JSONDecoder().decode(T.self, from: data) } catch { fatalError("bad resource \(name).json: \(error)") }
        }
        var words: [String: [Word]] = [:]
        for c in Course.all {
            words[c.id] = load("words-\(c.id)", [Word].self).map { var w = $0; w.course = c.id; return w }
        }
        self.words = words
        categories = load("categories", [String: Category].self)
        // The order of the web app's category table (JSON objects keep it, Swift dictionaries don't)
        categoryOrder = ["numbers", "people", "pronouns", "time", "food", "places", "objects", "verbs", "adjectives", "question", "particles", "measure", "phrases", "nature", "animals", "transport", "study", "family", "body", "sports", "adverbs", "misc", "custom"]
        dialogues = load("dialogues", [String: [Dialogue]].self)
        sounds = load("sounds", [String: SoundData].self)
        strings = load("strings", Strings.self)
        themes = load("themes", [String: [Theme]].self)
        pictures = load("pictures", [String: [String: String]].self).values.reduce(into: [:]) { $0.merge($1) { a, _ in a } }
        index = Dictionary(words.values.flatMap { $0 }.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
    }

    public func word(_ id: String) -> Word? { index[id] }
}
