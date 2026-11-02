import Foundation

/* "Say it" tips (web/js/tips.js, exported as tips.json): one for the trickiest sound of a word, one for its tone.
 * A port of the web app's sayTip(). */

public struct SayTips: Sendable {
    public struct Course: Sendable {
        public var sound: [(key: String, text: LocalText)] = []
        public var tone: [Int: LocalText] = [:]
        public var long: LocalText?
        public var flat: LocalText?
        public var liaison: LocalText?
    }
    public let courses: [String: Course]

    init(json: Data?) {
        func text(_ any: Any?) -> LocalText? {
            guard let d = any as? [String: String], let en = d["en"] else { return nil }
            return LocalText(en: en, de: d["de"])
        }
        var out: [String: Course] = [:]
        if let data = json, let root = try? JSONSerialization.jsonObject(with: data) as? [String: [String: Any]] {
            for (id, o) in root {
                var c = Course()
                for pair in o["sound"] as? [[Any]] ?? [] {
                    if pair.count == 2, let key = pair[0] as? String, let t = text(pair[1]) { c.sound.append((key, t)) }
                }
                for (k, v) in o["tone"] as? [String: Any] ?? [:] { if let n = Int(k), let t = text(v) { c.tone[n] = t } }
                c.long = text(o["long"]); c.flat = text(o["flat"]); c.liaison = text(o["liaison"])
                out[id] = c
            }
        }
        courses = out
    }

    /// The tip for a word: the first sound in list order that the word contains, and the tone of that syllable
    public func tip(for w: Word, lang: String) -> (sound: String, tone: String)? {
        guard let T = courses[w.course] else { return nil }
        let L = { (t: LocalText?) in t?.get(lang) ?? "" }
        switch w.course {
        case "zh":
            let syls = Lingo.pySyllables(w.py)
            for (key, tip) in T.sound {
                let hit = syls.first { key == "ü" ? $0.f.contains("v") && ["", "l", "n", "r"].contains($0.i) : $0.i == key }
                if let s = hit { return (L(tip), L(T.tone[s.tone])) }
            }
            return ("", L(T.tone[syls.first?.tone ?? 5]))
        case "vi":
            let syls = w.hz.lowercased().split(whereSeparator: { $0.isWhitespace }).map(String.init)
            for (key, tip) in T.sound {
                let hit = syls.first { let p = Lingo.viNoTone($0); return p.hasPrefix(key) && (key != "d" || !p.hasPrefix("đ")) }
                if let s = hit { return (L(tip), L(T.tone[Lingo.firstTone(s, course: "vi")])) }
            }
            return ("", L(T.tone[Lingo.firstTone(syls.first ?? "", course: "vi")]))
        case "ja":
            if (w.romaji ?? "").contains(where: { "āīūēō".contains($0) }) { return (L(T.long), "") }
            let k = w.kana ?? w.hz
            return (T.sound.first { k.contains($0.key) }.map { L($0.text) } ?? "", L(T.flat))
        case "ko":
            if let p = w.pron { return (L(T.liaison).replacingOccurrences(of: "{0}", with: p), "") }
            let jamo = w.hz.compactMap { Lingo.koJamo($0) }.map { $0.i + $0.v + $0.f }.joined()
            return T.sound.first { jamo.contains($0.key) }.map { (L($0.text), "") }
        default: return nil
        }
    }
}

extension Lingo {
    static let viCombining: [Int: Unicode.Scalar] = [2: "\u{0300}", 3: "\u{0301}", 4: "\u{0309}", 5: "\u{0303}", 6: "\u{0323}"]

    /// A Vietnamese syllable with its tone mark replaced (1 = ngang, no mark), placed on the vowel that carries it
    public static func viMark(_ syl: String, _ tone: Int) -> String {
        let toneMarks: Set<Unicode.Scalar> = ["\u{0300}", "\u{0301}", "\u{0303}", "\u{0309}", "\u{0323}"]
        let base = String(String.UnicodeScalarView(syl.decomposedStringWithCanonicalMapping.unicodeScalars.filter { !toneMarks.contains($0) })).precomposedStringWithCanonicalMapping
        guard tone > 1, let mark = viCombining[tone] else { return base }
        var chars = Array(base)
        let low = chars.map { Character($0.lowercased()) }
        let vowels = Set("aăâeêioôơuưy")
        var start = 0
        if low.starts(with: ["q", "u"]) { start = 2 } else if low.count > 2, low.starts(with: ["g", "i"]), vowels.contains(low[2]) { start = 2 }
        var idx: [Int] = []
        for k in start..<low.count { if vowels.contains(low[k]) { idx.append(k) } else if !idx.isEmpty { break } }
        guard let last = idx.last else { return base }
        let mod = idx.filter { "ăâêôơư".contains(low[$0]) }
        let ends = last < low.count - 1
        let k = mod.last ?? (ends ? last : idx.count >= 3 ? idx[1] : idx[0])
        chars[k] = Character((String(chars[k]) + String(mark)).precomposedStringWithCanonicalMapping)
        return String(chars).precomposedStringWithCanonicalMapping
    }
}
