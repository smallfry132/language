import Foundation

/* German and Spanish: typing, searching, number words and the Spanish stress (ports of the web app's latinTyped,
 * stripLatin, numToDe, numToEs and esStress). */

extension Lingo {
    /// Case, accents and umlauts don't matter for searching (straße = strasse, café = cafe)
    public static func stripLatin(_ s: String) -> String {
        var x = s.precomposedStringWithCanonicalMapping.lowercased()
        for (a, b) in [("ß", "ss"), ("ä", "a"), ("ö", "o"), ("ü", "u")] { x = x.replacingOccurrences(of: a, with: b) }
        x = dropMarks(x).filter { !".,!?¿¡'’".contains($0) }
        return x.split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
    }

    /// A typed German or Spanish answer. German: ä ö ü ß may be typed ae oe ue ss. Spanish: accents (and ñ) are optional,
    /// but typed accents must be right. Nouns need their article: the gender is part of the word.
    public static func latinTyped(_ v: String, _ hz: String, course: String) -> Bool {
        func clean(_ s: String) -> String {
            s.precomposedStringWithCanonicalMapping.lowercased().filter { !".,!?¿¡".contains($0) }
                .split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
        }
        let a = clean(v), b = clean(hz)
        if a == b { return true }
        if course == "de" {
            var spelled = b, back = a
            for (u, e) in [("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")] { spelled = spelled.replacingOccurrences(of: u, with: e) }
            for (u, e) in [("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")] { back = back.replacingOccurrences(of: e, with: u) }
            return a == spelled || back == b
        }
        let accents = a.decomposedStringWithCanonicalMapping.unicodeScalars.contains { (0x300...0x36F).contains($0.value) }
        return !accents && stripLatin(a) == stripLatin(b)
    }

    /// Spanish: the word in syllables with the stressed one in capitals (ca-SA, ca-FÉ, ha-BLAR). Vowels in a row stay
    /// together unless one is an accented í/ú or both are strong (a e o); a consonant between vowels starts the next
    /// syllable, two are split unless they belong together (pl, br, tr, ch, ll, rr …). The stress rule: a written accent,
    /// else the second-to-last syllable after a vowel, n or s, else the last.
    public static func esStress(_ word: String) -> String {
        let V = Set("aeiouáéíóúü"), weakAccent = Set("íú"), strong = Set("aeoáéó")
        let low = Array(word.lowercased())
        let keep: Set<String> = ["pl", "pr", "bl", "br", "fl", "fr", "tr", "dr", "cl", "cr", "gl", "gr", "ch", "ll", "rr"]
        var syl: [String] = [], cur = "", i = 0
        while i < low.count {
            cur.append(low[i])
            if V.contains(low[i]) {
                var j = i + 1
                while j < low.count, V.contains(low[j]), !weakAccent.contains(low[j]), !weakAccent.contains(low[i]), !(strong.contains(low[j]) && strong.contains(low[j - 1])) {
                    cur.append(low[j]); j += 1
                }
                var k = j
                while k < low.count, !V.contains(low[k]) { k += 1 }
                let cons = String(low[j..<k])
                if k >= low.count { cur += cons; syl.append(cur); cur = ""; i = k; break }
                let take = cons.count <= 1 ? 0 : keep.contains(String(cons.suffix(2))) ? cons.count - 2 : cons.count - 1
                cur += cons.prefix(take); syl.append(cur); cur = ""; i = j + take; continue
            }
            i += 1
        }
        if !cur.isEmpty { if syl.isEmpty { syl.append(cur) } else { syl[syl.count - 1] += cur } }
        var st = syl.firstIndex { $0.contains(where: { "áéíóú".contains($0) }) } ?? -1
        if st < 0 { st = "aeiouns".contains(low.last ?? " ") ? max(0, syl.count - 2) : syl.count - 1 }
        return syl.enumerated().map { $0.offset == st ? $0.element.uppercased() : $0.element }.joined(separator: "-")
    }
}

extension Numbers {
    /// German: the ones come first (einundzwanzig)
    static func toDe(_ n: Int) -> String {
        let one = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"]
        let tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"]
        if n < 20 { return one[n] }
        let t = n / 10, o = n % 10
        return o > 0 ? (o == 1 ? "ein" : one[o]) + "und" + tens[t] : tens[t]
    }
    /// Spanish: 16–29 written as one word (dieciséis, veintiuno), then "treinta y uno"
    static func toEs(_ n: Int) -> String {
        let one = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"]
        let tens = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"]
        if n < 30 { return one[n] }
        let t = n / 10, o = n % 10
        return o > 0 ? "\(tens[t]) y \(one[o])" : tens[t]
    }
}
