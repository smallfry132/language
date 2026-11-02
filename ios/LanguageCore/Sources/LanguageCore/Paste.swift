import Foundation

/* Paste a list (port of the web app's parseList / matchPiece): whatever the tutor sent — pinyin with marks or
 * numbers, characters, meanings; one per line or with commas — split into pieces, and each piece looked up in
 * the course's words. One match is taken, several are offered, a phrase whose parts are words can be added as
 * its parts, anything else becomes an own word with what could be read from the line. */

public struct PastePiece: Identifiable, Sendable, Equatable {
    public var id: Int
    public let raw: String
    /// Candidates from the word list, lowest level first (at most 6)
    public var hits: [Word]
    /// The words of a phrase whose parts are each a list word (nǐ hǎo → 你 + 好)
    public let parts: [Word]?
    /// What an own word could be, read from the line
    public var ownHz: String
    public var ownPy: String
    public var ownEn: String
}

public enum PasteList {
    /// Pieces of a pasted text: split on new lines, commas (also ， 、), semicolons, tabs, | and double spaces;
    /// numbering and bullets dropped; at most 80
    public static func parse(_ text: String) -> [String] {
        let pattern = "[\\n\\r,，、;；\\t|]+| {2,}"
        let pieces = text.replacingOccurrences(of: pattern, with: "\u{1F}", options: .regularExpression).split(separator: "\u{1F}")
        return pieces.compactMap { p -> String? in
            let s = String(p).replacingOccurrences(of: "^\\s*(?:\\d+[.)]|[-•*·])\\s*", with: "", options: .regularExpression)
                .trimmingCharacters(in: .whitespaces)
            return s.isEmpty || s.allSatisfy(\.isNumber) ? nil : s
        }.prefix(80).map { $0 }
    }

    static func isNative(_ c: Character) -> Bool {
        c.unicodeScalars.contains { s in
            s.properties.isIdeographic || (0x3040...0x30FF).contains(s.value) || (0xAC00...0xD7A3).contains(s.value) || (0x1100...0x11FF).contains(s.value) || (0x3130...0x318F).contains(s.value)
        }
    }
    /// Meaning segments: "to be (am, is)" → ["be", "am", "is"]
    static func meanings(_ s: String) -> [String] {
        s.lowercased().components(separatedBy: CharacterSet(charactersIn: ";,()")).map {
            var x = $0.trimmingCharacters(in: .whitespaces); if x.hasPrefix("to ") { x.removeFirst(3) }; return x
        }.filter { !$0.isEmpty }
    }

    /// Looks a piece up in `words` (the course's words; own words are left out)
    public static func match(_ raw: String, id: Int = 0, words: [Word], course c: String) -> PastePiece {
        let pool = words.filter { !$0.id.hasPrefix("u") }
        let native = String(raw.filter(isNative))
        let latin = raw.map { isNative($0) ? " " : String($0) }.joined().split(whereSeparator: \.isWhitespace).joined(separator: " ")
        let low = raw.lowercased()
        var hits: [Word] = []
        if !native.isEmpty && c != "vi" {
            hits = pool.filter { w in w.hz == native || w.hz.components(separatedBy: ";").map { $0.trimmingCharacters(in: .whitespaces) }.contains(native) || w.kana == native }
        }
        if hits.isEmpty { hits = pool.filter { $0.hz.lowercased() == low } }
        if hits.isEmpty && !latin.isEmpty && c == "zh" {
            let typed = Lingo.numToMarks(latin).lowercased().filter { !$0.isWhitespace }
            let exact = pool.filter { $0.py.lowercased().filter { !$0.isWhitespace } == typed }
            hits = exact.isEmpty ? pool.filter { Lingo.stripTones($0.py) == Lingo.stripTones(latin) } : exact
        }
        if hits.isEmpty && !latin.isEmpty && c == "ja" { hits = pool.filter { ($0.romaji.map(Lingo.stripJa) ?? "") == Lingo.stripJa(latin) } }
        if hits.isEmpty && !latin.isEmpty && c == "ko" { hits = pool.filter { Lingo.stripKo($0.py) == Lingo.stripKo(latin) } }
        if hits.isEmpty && c == "vi" { hits = pool.filter { Lingo.stripVi($0.hz) == Lingo.stripVi(raw) } }
        // German and Spanish: with or without the article, umlauts or accents (Strasse → die Straße)
        if hits.isEmpty && (c == "de" || c == "es") { let q = Lingo.stripLatin(raw); hits = pool.filter { Lingo.stripLatin($0.hz) == q || Lingo.stripLatin($0.articleSplit?.noun ?? "") == q } }
        if hits.isEmpty && !latin.isEmpty {
            var m = latin.lowercased(); if m.hasPrefix("to ") { m.removeFirst(3) }
            hits = pool.filter { meanings($0.en).contains(m) || meanings($0.de ?? "").contains(m) }
        }
        var seen = Set<String>()
        hits = hits.filter { seen.insert($0.id).inserted }.sorted { $0.lvl < $1.lvl }.prefix(6).map { $0 }

        // An own word: characters from the native part, a pinyin-looking part as the reading, the rest as meaning
        let parts = latin.split(separator: " ").map(String.init)
        var ownHz = native, ownPy = "", ownEn = ""
        if c == "zh" {
            let toned = CharacterSet(charactersIn: "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ")
            let pyLike = parts.filter { p in p.unicodeScalars.contains { toned.contains($0) } || p.range(of: "^[a-zA-Z]+[1-5]$", options: .regularExpression) != nil }
            ownPy = Lingo.numToMarks(pyLike.joined(separator: " "))
            if ownPy.isEmpty && native.isEmpty { ownPy = latin }
            ownEn = native.isEmpty && pyLike.isEmpty ? "" : parts.filter { !pyLike.contains($0) }.joined(separator: " ")
        } else if c == "vi" || c == "de" || c == "es" { ownHz = raw }
        else { ownHz = native.isEmpty ? latin : native; ownPy = native.isEmpty ? "" : latin }

        // Not one word, but each part is
        var split: [Word]? = nil
        if hits.isEmpty, raw.trimmingCharacters(in: .whitespaces).contains(" ") {
            let ps = raw.split(whereSeparator: \.isWhitespace).map { match(String($0), words: pool, course: c) }
            if ps.allSatisfy({ !$0.hits.isEmpty }) { split = ps.map { $0.hits[0] } }
        }
        // Chinese characters without spaces: the longest list words from the left (中国人 → 中国 + 人)
        if hits.isEmpty, split == nil, c == "zh", native.count >= 2, latin.isEmpty { split = segment(native, words: pool) }
        return PastePiece(id: id, raw: raw, hits: hits, parts: split, ownHz: ownHz, ownPy: ownPy, ownEn: ownEn)
    }

    /// Characters as list words, longest first from the left; nil when a character is left over or it is one word
    public static func segment(_ s: String, words: [Word]) -> [Word]? {
        let byHz = Dictionary(words.map { ($0.hz, $0) }, uniquingKeysWith: { a, _ in a })
        let chars = Array(s)
        var out: [Word] = [], i = 0
        while i < chars.count {
            guard let n = (1...min(4, chars.count - i)).reversed().first(where: { n in n < chars.count && byHz[String(chars[i..<(i + n)])] != nil }) else { return nil }
            out.append(byHz[String(chars[i..<(i + n)])]!); i += n
        }
        return out.count >= 2 ? out : nil
    }
}
