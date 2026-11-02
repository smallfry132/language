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
    /// German and Spanish: the plural (with article, "–" when there is none) and the gender from the article
    /// (m, f, n; nil for plural-only nouns and words that are not nouns)
    public let pl: String?
    public let g: String?
    public var course: String = ""

    enum CodingKeys: String, CodingKey { case id, hz, py, en, de, cat, lvl, ex, exPy, exEn, exDe, kana, romaji, pron, pl, g }

    public init(id: String, hz: String, py: String, en: String, de: String? = nil, cat: String, lvl: Int, ex: String? = nil, exPy: String? = nil, exEn: String? = nil, exDe: String? = nil, kana: String? = nil, romaji: String? = nil, pron: String? = nil, pl: String? = nil, g: String? = nil, course: String) {
        self.id = id; self.hz = hz; self.py = py; self.en = en; self.de = de; self.cat = cat; self.lvl = lvl
        self.ex = ex; self.exPy = exPy; self.exEn = exEn; self.exDe = exDe; self.kana = kana; self.romaji = romaji; self.pron = pron
        self.pl = pl; self.g = g; self.course = course
    }
    /// German and Spanish words have no reading (py is left out of the data)
    public init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id); hz = try c.decode(String.self, forKey: .hz)
        py = try c.decodeIfPresent(String.self, forKey: .py) ?? ""
        en = try c.decode(String.self, forKey: .en); de = try c.decodeIfPresent(String.self, forKey: .de)
        cat = try c.decodeIfPresent(String.self, forKey: .cat) ?? "misc"; lvl = try c.decodeIfPresent(Int.self, forKey: .lvl) ?? 1
        ex = try c.decodeIfPresent(String.self, forKey: .ex); exPy = try c.decodeIfPresent(String.self, forKey: .exPy)
        exEn = try c.decodeIfPresent(String.self, forKey: .exEn); exDe = try c.decodeIfPresent(String.self, forKey: .exDe)
        kana = try c.decodeIfPresent(String.self, forKey: .kana); romaji = try c.decodeIfPresent(String.self, forKey: .romaji)
        pron = try c.decodeIfPresent(String.self, forKey: .pron); pl = try c.decodeIfPresent(String.self, forKey: .pl)
        g = try c.decodeIfPresent(String.self, forKey: .g)
    }
    /// The article and the noun apart (der Tisch → ("der", "Tisch")), only for nouns with a gender
    public var articleSplit: (article: String, noun: String)? {
        guard g != nil, let sp = hz.firstIndex(of: " ") else { return nil }
        let a = String(hz[..<sp])
        return ["der", "die", "das", "el", "la"].contains(a) ? (a, String(hz[hz.index(after: sp)...])) : nil
    }
    /// The plural when there is one ("–" and empty mean none)
    public var plural: String? { (pl ?? "").isEmpty || pl == "–" ? nil : pl }
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
    /// German and Spanish: nouns carry an article and are coloured by gender
    public var gender: Bool { id == "de" || id == "es" }

    public func levelName(_ l: Int) -> String {
        switch id {
        case "vi": return ["A1", "A2", "B1", "B2", "C1", "C2"][max(0, min(5, l - 1))]
        case "ja": return "N\(6 - l)"
        case "ko", "de", "es": return ["A1", "A2"][max(0, min(1, l - 1))]
        default: return "HSK \(l)"
        }
    }

    public static let all: [Course] = [
        Course(id: "zh", glyph: "中", name: "中文 · Chinese", title: "HSK Trainer", tts: "zh-CN", script: .cjk, levels: [1, 2, 3], allLabel: "HSK 1–3", toneOptions: [1, 2, 3, 4], testPhrase: "你好，我学习汉语。", sourceText: "glxxyz/hskhsk.com", sourceURL: "https://github.com/glxxyz/hskhsk.com"),
        Course(id: "vi", glyph: "Vi", name: "Tiếng Việt · Vietnamese", title: "Tiếng Việt Trainer", tts: "vi-VN", script: .latin, levels: [1, 2, 3, 4, 5, 6], allLabel: "A1–C2", toneOptions: [1, 2, 3, 4, 5, 6], testPhrase: "Xin chào, tôi học tiếng Việt.", sourceText: nil, sourceURL: nil),
        Course(id: "ja", glyph: "あ", name: "日本語 · Japanese", title: "JLPT Trainer", tts: "ja-JP", script: .cjk, levels: [1, 2, 3, 4, 5], allLabel: "N5–N1", toneOptions: nil, testPhrase: "こんにちは。日本語を勉強しています。", sourceText: "jamsinclair/open-anki-jlpt-decks", sourceURL: "https://github.com/jamsinclair/open-anki-jlpt-decks"),
        Course(id: "ko", glyph: "한", name: "한국어 · Korean", title: "Korean Trainer", tts: "ko-KR", script: .cjk, levels: [1, 2], allLabel: "A1–A2", toneOptions: nil, testPhrase: "안녕하세요. 저는 한국어를 공부해요.", sourceText: nil, sourceURL: nil),
        Course(id: "de", glyph: "De", name: "Deutsch · German", title: "Deutsch Trainer", tts: "de-DE", script: .latin, levels: [1, 2], allLabel: "A1–A2", toneOptions: nil, testPhrase: "Hallo, ich lerne Deutsch.", sourceText: nil, sourceURL: nil),
        Course(id: "es", glyph: "Es", name: "Español · Spanish", title: "Español Trainer", tts: "es-ES", script: .latin, levels: [1, 2], allLabel: "A1–A2", toneOptions: nil, testPhrase: "Hola, estoy aprendiendo español.", sourceText: nil, sourceURL: nil)
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
    /// Vietnamese is written in Latin letters: its people and lines have no separate reading (py is then "")
    public struct Person: Codable, Sendable {
        public let hz: String
        public let py: String
        /// "m" or "f": the person speaks with a man's or a woman's voice
        public let g: String?
        /// 1 = man, 2 = woman, 0 = not known (AVSpeechSynthesisVoice's order)
        public var gender: Int { g == "m" ? 1 : g == "f" ? 2 : 0 }
        public init(from d: Decoder) throws {
            let c = try d.container(keyedBy: CodingKeys.self)
            hz = try c.decode(String.self, forKey: .hz); py = try c.decodeIfPresent(String.self, forKey: .py) ?? ""
            g = try c.decodeIfPresent(String.self, forKey: .g)
        }
    }
    public struct Line: Codable, Hashable, Sendable {
        public let who: Int
        public let hz: String
        public let py: String
        public let en: String
        public let de: String?
        /// A short note on the line's grammar or usage, shown inline (round-2 canvas)
        public let tip: LocalText?
        public func tr(_ lang: String) -> String { lang == "de" ? (de ?? en) : en }
        public init(from d: Decoder) throws {
            let c = try d.container(keyedBy: CodingKeys.self)
            who = try c.decode(Int.self, forKey: .who); hz = try c.decode(String.self, forKey: .hz)
            py = try c.decodeIfPresent(String.self, forKey: .py) ?? ""
            en = try c.decode(String.self, forKey: .en); de = try c.decodeIfPresent(String.self, forKey: .de)
            tip = try c.decodeIfPresent(LocalText.self, forKey: .tip)
        }
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
    /// Tile groups (Vietnamese initials): the meaning of the example word, and whether North and South differ
    public let gloss: LocalText?
    public let ns: Bool?
}
public struct SoundGroup: Codable, Identifiable, Sendable {
    public let id: String
    public let name: LocalText
    public let head: [String]?
    public let rows: [SoundRow]
    public let kana: Bool?
    /// Shown as a grid of tiles (one word per letter) instead of the chart
    public let tiles: Bool?
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
    /// A drawn picture per word id (art.json, made by tools/build-art.mjs): the file name in Data/art
    public let art: [String: String]
    /// "Say it" tips per course (tips.json)
    public let tips: SayTips
    /// Word families per course (families.json)
    public let families: [String: [FamilyData]]
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
        art = Bundle.module.url(forResource: "art", withExtension: "json", subdirectory: "Data").flatMap { try? Data(contentsOf: $0) }
            .flatMap { try? JSONDecoder().decode([String: [String: String]].self, from: $0) }?.values.reduce(into: [:]) { $0.merge($1) { a, _ in a } } ?? [:]
        families = Bundle.module.url(forResource: "families", withExtension: "json", subdirectory: "Data").flatMap { try? Data(contentsOf: $0) }.flatMap { try? JSONDecoder().decode([String: [FamilyData]].self, from: $0) } ?? [:]
        tips = SayTips(json: Bundle.module.url(forResource: "tips", withExtension: "json", subdirectory: "Data").flatMap { try? Data(contentsOf: $0) })
        index = Dictionary(words.values.flatMap { $0 }.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
    }

    public func word(_ id: String) -> Word? { index[id] }
    /// The file of a word's drawn picture
    public func artURL(_ id: String) -> URL? {
        art[id].flatMap { Bundle.module.url(forResource: $0, withExtension: "webp", subdirectory: "Data/art") }
    }
}
