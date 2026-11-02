import Foundation

/* Checking answers: typed words, typed dialogue lines and what the speech recogniser heard. */

public enum Check {
    /// Units to compare: characters for Chinese and Japanese, words for Vietnamese; digits become number words
    public static func units(_ s: String, course: String) -> [String] {
        var x = ""
        var digits = ""
        func flush() {
            guard !digits.isEmpty else { return }
            if let n = Int(digits), n <= 99 { x += Numbers.written(n, course: course) + (course == "vi" ? " " : "") } else { x += digits }
            digits = ""
        }
        for c in s { if c.isASCII && c.isNumber { digits.append(c) } else { flush(); x.append(c) } }
        flush()
        if course == "vi" {
            return x.precomposedStringWithCanonicalMapping.lowercased().split(whereSeparator: { !$0.isLetter }).map(String.init)
        }
        return x.unicodeScalars.filter { u in
            u.properties.isIdeographic || (0x3040...0x309F).contains(u.value) || (0x30A0...0x30FF).contains(u.value) || (0xAC00...0xD7A3).contains(u.value)
        }.map { String($0) }
    }

    public struct Heard: Equatable {
        public var score: Double
        public var hit: [Bool]
        public var text: String
        public init(score: Double, hit: [Bool], text: String) { self.score = score; self.hit = hit; self.text = text }
    }
    /// Which target units were heard (longest common subsequence over the recogniser's alternatives)
    /// Chinese: every reading a character has in the word lists ("是" → shì), so a homophone the recogniser wrote
    /// (事 for 是, 她 for 他) still counts as the syllable that was said
    static let zhReadings: [String: Set<String>] = {
        var out: [String: Set<String>] = [:]
        for w in Library.shared.words["zh"] ?? [] {
            let chars = units(w.hz, course: "zh"), syl = Lingo.pyParts(w.py).filter { !$0.sep }.map { $0.text.lowercased() }
            guard chars.count == syl.count else { continue }
            for (c, y) in zip(chars, syl) { out[c, default: []].insert(y) }
        }
        return out
    }()
    /// What the recogniser wrote, read back: the reading (pinyin, romanization) and the meaning, from the word lists.
    /// Chinese is split into the longest list words (城市 → chéngshì "city"); characters outside the lists get the
    /// system's pinyin and no meaning.
    public struct HeardReading: Equatable { public let text: String; public let py: String; public let meaning: String }
    static var listCache: [String: [String: Word]] = [:]
    public static func reading(of text: String, course: String, lang: String) -> HeardReading {
        let words = Library.shared.words[course] ?? []
        let byHz = listCache[course] ?? { let d = Dictionary(words.map { ($0.hz, $0) }, uniquingKeysWith: { a, _ in a }); listCache[course] = d; return d }()
        let mean = { (w: Word) in (lang == "de" ? (w.de ?? w.en) : w.en).components(separatedBy: CharacterSet(charactersIn: ";,(")).first?.trimmingCharacters(in: .whitespaces) ?? "" }
        let clean = text.trimmingCharacters(in: .whitespacesAndNewlines.union(.punctuationCharacters))
        if let w = byHz[clean] { return HeardReading(text: clean, py: w.py, meaning: mean(w)) }
        guard course == "zh" else { return HeardReading(text: clean, py: "", meaning: "") }
        let chars = units(clean, course: "zh")
        var i = 0, pys: [String] = [], means: [String] = []
        while i < chars.count {
            var found: Word?, len = 1
            for l in stride(from: min(4, chars.count - i), through: 1, by: -1) { if let w = byHz[chars[i..<(i + l)].joined()] { found = w; len = l; break } }
            if let w = found { pys.append(w.py); means.append(mean(w)) }
            else { pys.append(chars[i].applyingTransform(.mandarinToLatin, reverse: false) ?? zhReadings[chars[i]]?.sorted().first ?? "?") } // the system's own pinyin
            i += len
        }
        return HeardReading(text: clean, py: pys.joined(separator: " "), meaning: means.filter { !$0.isEmpty }.joined(separator: " · "))
    }
    /// Chinese: syllables heard with another tone (target shì, heard shí → ("shì", "shí")), same syllable count only
    public static func heardDiff(targetPy: String, heardPy: String) -> [(String, String)] {
        let a = Lingo.pyParts(targetPy).filter { !$0.sep }.map { $0.text.lowercased() }, b = Lingo.pyParts(heardPy).filter { !$0.sep }.map { $0.text.lowercased() }
        guard a.count == b.count else { return [] }
        // Only the same syllable with another tone is worth pointing out (shì → shí); a different word is just different
        let bare = { (x: String) in x.folding(options: .diacriticInsensitive, locale: nil) }
        return zip(a, b).filter { $0 != $1 && bare($0) == bare($1) }.map { ($0, $1) }
    }
    public static func matchHeard(_ target: String, _ alts: [String], course: String, py: String? = nil) -> Heard {
        let tc = units(target, course: course)
        let syl = py.map { Lingo.pyParts($0).filter { !$0.sep }.map { $0.text.lowercased() } } ?? []
        let bySound = course == "zh" && syl.count == tc.count
        func same(_ i: Int, _ h: String) -> Bool { tc[i] == h || (bySound && (zhReadings[h]?.contains(syl[i]) ?? false)) }
        var best = Heard(score: 0, hit: tc.map { _ in false }, text: alts.first ?? "")
        for a in alts {
            let hc = units(a, course: course), n = tc.count, m = hc.count
            var L = Array(repeating: Array(repeating: 0, count: m + 1), count: n + 1)
            if n > 0 && m > 0 {
                for i in stride(from: n - 1, through: 0, by: -1) {
                    for j in stride(from: m - 1, through: 0, by: -1) {
                        L[i][j] = same(i, hc[j]) ? L[i + 1][j + 1] + 1 : max(L[i + 1][j], L[i][j + 1])
                    }
                }
            }
            var hit = tc.map { _ in false }, i = 0, j = 0
            while i < n && j < m {
                if same(i, hc[j]) { hit[i] = true; i += 1; j += 1 } else if L[i + 1][j] >= L[i][j + 1] { i += 1 } else { j += 1 }
            }
            let score = n > 0 ? Double(L[0][0]) / Double(n) : 0
            if score > best.score || best.text.isEmpty { best = Heard(score: score, hit: hit, text: a) }
        }
        return best
    }

    /// A typed word in "Type the word" (pinyin, kana/romaji or Vietnamese)
    public static func typedWord(_ v: String, _ w: Word) -> Bool {
        let v = v.trimmingCharacters(in: .whitespaces)
        guard !v.isEmpty else { return false }
        switch w.course {
        case "zh":
            var ok = Lingo.stripTones(v) == Lingo.stripTones(w.py)
            let digits = v.filter { ("1"..."4").contains($0) }
            if ok && !digits.isEmpty { ok = digits == Lingo.toneSeq(w.py).map(String.init).joined() }
            else if ok && !Lingo.toneSeq(v).isEmpty { ok = Lingo.toneSeq(v) == Lingo.toneSeq(w.py) } // tone marks typed: they must be right
            return ok
        case "ko":
            return koTyped(v, hz: w.hz, roman: w.py)
        case "ja":
            let a = Lingo.stripJa(v), ro = Lingo.stripJa(w.romaji ?? "")
            return a == Lingo.stripJa(w.kana ?? "") || a == ro || a == Lingo.stripJa(w.hz) || a == ro.replacingOccurrences(of: "'", with: "")
                || a.replacingOccurrences(of: "ou", with: "oo") == ro.replacingOccurrences(of: "ou", with: "oo")
        default:
            if Lingo.hasDiacritics(v) {
                let a = v.precomposedStringWithCanonicalMapping.lowercased().split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
                return a == w.hz.precomposedStringWithCanonicalMapping.lowercased()
            }
            return Lingo.stripVi(v) == Lingo.stripVi(w.hz)
        }
    }

    public struct Typed: Equatable {
        public var ok: Bool
        public var tonesMissing = false
        public var tonesWrong = false
    }
    /// A typed dialogue answer: pinyin (tones optional, but typed tones must match) or the characters
    public static func typedLine(_ v: String, hz: String, py: String, course: String) -> Typed {
        if v.unicodeScalars.contains(where: { $0.properties.isIdeographic || (0xAC00...0xD7A3).contains($0.value) }) { return Typed(ok: matchHeard(hz, [v], course: course).score >= 0.9) }
        if course == "ko" { return Typed(ok: koTyped(v, hz: hz, roman: py)) }
        if course != "zh" {
            let n = Lingo.norm(v, course: course) == Lingo.norm(hz, course: course)
            if !Lingo.hasDiacritics(v) { return Typed(ok: n) }
            let lettersOnly = { (s: String) in s.precomposedStringWithCanonicalMapping.lowercased().filter { $0.isLetter || $0.isWhitespace }.split(whereSeparator: { $0.isWhitespace }).joined(separator: " ") }
            return Typed(ok: n && lettersOnly(v) == lettersOnly(hz))
        }
        let clean = { (s: String) in s.filter { !":;：，。！？、".contains($0) } }
        if Lingo.stripTones(clean(v)) != Lingo.stripTones(clean(py)) { return Typed(ok: false) }
        if Lingo.toneSeq(v).isEmpty { return Typed(ok: true, tonesMissing: true) }
        let mine = Lingo.pyParts(clean(v)).filter { !$0.sep }, want = Lingo.pyParts(clean(py)).filter { !$0.sep }
        if mine.count != want.count {
            let same = Lingo.toneSeq(v) == Lingo.toneSeq(py)
            return Typed(ok: same, tonesWrong: !same)
        }
        // Only syllables you gave a tone are checked; untoned ones are just "not typed"
        let wrong = zip(mine, want).contains { $0.tone != 5 && $0.tone != $1.tone }
        let missing = zip(mine, want).contains { $0.tone == 5 && $1.tone != 5 }
        return Typed(ok: !wrong, tonesMissing: !wrong && missing, tonesWrong: wrong)
    }

    /// A typed Korean answer: Hangul or romanization; spaces and punctuation don't matter
    static func koTyped(_ v: String, hz: String, roman: String) -> Bool {
        let plain = { (s: String) in s.precomposedStringWithCanonicalMapping.lowercased().filter { $0.isLetter } }
        let a = plain(v)
        return !a.isEmpty && (a == plain(hz) || a == plain(roman))
    }

    /// The dialogue hint: first letter of each word, the rest as dots
    public static func hintMask(_ py: String) -> String {
        py.split(separator: " ", omittingEmptySubsequences: false).map { word -> String in
            var out = "", seenLetter = false
            for c in word {
                if !seenLetter { out.append(c); if c.isLetter { seenLetter = true } }
                else { out.append(c.isLetter ? "·" : c) }
            }
            return out
        }.joined(separator: " ")
    }
}
