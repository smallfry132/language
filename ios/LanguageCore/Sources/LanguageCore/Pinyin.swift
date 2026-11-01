import Foundation

/* Pinyin, Vietnamese and Japanese text helpers (ports of the web app's functions of the same names). */

public enum Lingo {
    static let combining: ClosedRange<Unicode.Scalar> = "\u{0300}"..."\u{036F}"
    static let toneMarks: [Unicode.Scalar: Int] = ["\u{0304}": 1, "\u{0301}": 2, "\u{030C}": 3, "\u{0300}": 4]          // Mandarin: none = neutral (5)
    static let viToneMarks: [Unicode.Scalar: Int] = ["\u{0300}": 2, "\u{0301}": 3, "\u{0309}": 4, "\u{0303}": 5, "\u{0323}": 6] // ngang(1) huyền sắc hỏi ngã nặng

    static func dropMarks(_ s: String) -> String {
        String(String.UnicodeScalarView(s.decomposedStringWithCanonicalMapping.unicodeScalars.filter { !combining.contains($0) }))
    }

    /// Pinyin: drop tone marks, v = ü, drop spaces, punctuation and tone numbers
    public static func stripTones(_ s: String) -> String {
        dropMarks(s).lowercased().replacingOccurrences(of: "v", with: "u")
            .filter { !" \t\n'’-.,!?0123456789".contains($0) }
    }
    /// Vietnamese: drop diacritics (đ → d), collapse spaces
    public static func stripVi(_ s: String) -> String {
        let x = dropMarks(s).replacingOccurrences(of: "đ", with: "d").replacingOccurrences(of: "Đ", with: "D").lowercased()
            .filter { !".,!?'’".contains($0) }
        return x.split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
    }
    public static func stripJa(_ s: String) -> String {
        s.precomposedStringWithCanonicalMapping.lowercased().filter { !" \t\n'’-.,!?・".contains($0) }
    }
    public static func norm(_ s: String, course: String) -> String {
        course == "zh" ? stripTones(s) : course == "ja" ? stripJa(s) : stripVi(s)
    }
    public static func hasDiacritics(_ s: String) -> Bool {
        s.decomposedStringWithCanonicalMapping.unicodeScalars.contains { combining.contains($0) } || s.lowercased().contains("đ")
    }
    /// Tone numbers of the marked syllables, in order
    public static func toneSeq(_ py: String) -> [Int] {
        py.decomposedStringWithCanonicalMapping.unicodeScalars.compactMap { toneMarks[$0] }
    }
    public static func firstTone(_ s: String, course: String) -> Int {
        if course == "zh" { return toneSeq(s).first ?? 5 }
        return s.decomposedStringWithCanonicalMapping.unicodeScalars.compactMap { viToneMarks[$0] }.first ?? 1
    }

    // MARK: Syllables

    static let finals = ["iang", "iong", "uang", "ueng", "ang", "eng", "ing", "ong", "ian", "iao", "uai", "uan", "van", "ai", "ei", "ao", "ou", "an", "en", "in", "un", "vn", "ia", "ie", "iu", "ua", "uo", "ue", "ve", "er", "a", "o", "e", "i", "u", "v"]
    static let initials = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "w", "y"]
    static let partFinals = (["ui"] + finals).sorted { $0.count > $1.count } // written finals, longest first (ui = uei)

    public struct Part: Hashable, Sendable {
        public let text: String
        public let tone: Int      // 1–4, 5 = neutral; 0 for separators
        public let sep: Bool
    }

    /// Pinyin split into syllables (original letters kept) and separators, each syllable with its tone
    public static func pyParts(_ py: String) -> [Part] {
        var out: [Part] = []
        var letters: [Character] = []
        func flush() {
            guard !letters.isEmpty else { return }
            let plain: [Character] = letters.map { c in
                let d = String(c).decomposedStringWithCanonicalMapping
                if d.unicodeScalars.contains("\u{0308}") { return "v" }
                return Character(String(d.unicodeScalars.first!).lowercased())
            }
            var i = 0
            while i < letters.count {
                let rest = String(plain[i...])
                let ini = initials.first { rest.hasPrefix($0) } ?? ""
                let fin = partFinals.first { rest.dropFirst(ini.count).hasPrefix($0) } ?? ""
                let len = max(1, min(letters.count - i, ini.count + fin.count))
                let text = String(letters[i..<(i + len)])
                out.append(Part(text: text, tone: toneSeq(text).first ?? 5, sep: false))
                i += len
            }
            letters = []
        }
        var sep = ""
        for c in py {
            if c.isLetter {
                if !sep.isEmpty { out.append(Part(text: sep, tone: 0, sep: true)); sep = "" }
                letters.append(c)
            } else {
                flush()
                sep.append(c)
            }
        }
        flush()
        if !sep.isEmpty { out.append(Part(text: sep, tone: 0, sep: true)) }
        return out
    }

    /// Syllables with initial and final (for finding example words in the sound chart)
    public static func pySyllables(_ py: String) -> [(i: String, f: String, tone: Int)] {
        var out: [(String, String, Int)] = []
        for part in py.split(whereSeparator: { " '’".contains($0) }) {
            let chars = Array(part)
            let plain: [Character] = chars.map { c in
                let d = String(c).decomposedStringWithCanonicalMapping
                if d.unicodeScalars.contains("\u{0308}") { return "v" }
                return Character(String(d.unicodeScalars.first!).lowercased())
            }
            let tones: [Int] = chars.map { toneSeq(String($0)).first ?? 0 }
            var i = 0
            while i < plain.count {
                let rest = String(plain[i...])
                let ini = initials.first { rest.hasPrefix($0) } ?? ""
                let fin = finals.first { rest.dropFirst(ini.count).hasPrefix($0) } ?? ""
                let len = max(1, min(plain.count - i, ini.count + fin.count))
                let tone = tones[i..<(i + len)].first { $0 > 0 } ?? 5
                out.append((ini, fin.isEmpty ? String(rest.prefix(1)) : fin, tone))
                i += len
            }
        }
        return out
    }

    // MARK: Tone numbers → marks

    static let pyTone: [Character: [Character]] = ["a": ["ā", "á", "ǎ", "à"], "e": ["ē", "é", "ě", "è"], "i": ["ī", "í", "ǐ", "ì"], "o": ["ō", "ó", "ǒ", "ò"], "u": ["ū", "ú", "ǔ", "ù"], "ü": ["ǖ", "ǘ", "ǚ", "ǜ"]]

    /// One syllable + tone number → tone mark (a/e first, then the o of "ou", else the last vowel); v → ü
    public static func markSyllable(_ syl: String, _ tone: Int) -> String {
        var s = Array(syl.replacingOccurrences(of: "v", with: "ü").replacingOccurrences(of: "V", with: "Ü"))
        if tone == 5 { return String(s) }
        let low = s.map { Character($0.lowercased()) }
        var k = low.firstIndex(of: "a") ?? low.firstIndex(of: "e") ?? -1
        if k < 0 { for j in 0..<max(0, low.count - 1) where low[j] == "o" && low[j + 1] == "u" { k = j; break } }
        if k < 0 { for j in stride(from: low.count - 1, through: 0, by: -1) where pyTone[low[j]] != nil { k = j; break } }
        if k < 0 { return String(s) + String(tone) }
        let m = pyTone[low[k]]![tone - 1]
        s[k] = s[k] == low[k] ? m : Character(String(m).uppercased())
        return String(s)
    }
    /// "ni3hao3" → "nǐhǎo"
    public static func numToMarks(_ s: String) -> String {
        var out = "", syl = ""
        for c in s {
            if c.isLetter && c.isASCII || c == "ü" || c == "Ü" { syl.append(c) }
            else if let d = c.wholeNumberValue, (1...5).contains(d), !syl.isEmpty { out += markSyllable(syl, d); syl = "" }
            else { out += syl; syl = ""; out.append(c) }
        }
        return out + syl
    }

    // MARK: Japanese and Vietnamese

    public static func kataToHira(_ s: String) -> String {
        String(String.UnicodeScalarView(s.unicodeScalars.map { u in
            (0x30A1...0x30F6).contains(u.value) ? Unicode.Scalar(u.value - 0x60)! : u
        }))
    }
    public static func viNoTone(_ s: String) -> String {
        let marks: Set<Unicode.Scalar> = ["\u{0323}", "\u{0300}", "\u{0301}", "\u{0303}", "\u{0309}"]
        return String(String.UnicodeScalarView(s.decomposedStringWithCanonicalMapping.unicodeScalars.filter { !marks.contains($0) }))
            .precomposedStringWithCanonicalMapping.lowercased()
    }
}
