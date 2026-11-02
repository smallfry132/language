import Foundation

/// Numbers 0–99 written out per course (the number trainer and speech matching use them)
public enum Numbers {
    static let hz = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    static let py = ["líng", "yī", "èr", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ", "shí"]
    static let vi = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"]
    static let jaRo = ["zero", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyuu", "juu"]

    static func toVi(_ n: Int) -> String {
        if n <= 10 { return vi[n] }
        let tens = n / 10, ones = n % 10
        if tens == 1 { return "mười" + (ones > 0 ? " " + (ones == 5 ? "lăm" : vi[ones]) : "") }
        var s = vi[tens] + " mươi"
        if ones == 1 { s += " mốt" } else if ones == 4 { s += " tư" } else if ones == 5 { s += " lăm" } else if ones > 0 { s += " " + vi[ones] }
        return s
    }
    static func toJa(_ n: Int, pron: Bool) -> String {
        let h = pron ? jaRo : hz, sep = pron ? " " : ""
        if n <= 10 { return h[n] }
        let tens = n / 10, ones = n % 10
        return (tens > 1 ? h[tens] + sep : "") + h[10] + (ones > 0 ? sep + h[ones] : "")
    }
    /// The number as written in the course (characters, or Vietnamese words)
    static let ko = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"]
    static let koRo = ["yeong", "il", "i", "sam", "sa", "o", "yuk", "chil", "pal", "gu", "sip"]
    /// Korean: Sino-Korean numbers (money, dates, minutes); the romanization joins syllables as they are said (십일 sibil)
    static func toKo(_ n: Int, roman: Bool) -> String {
        let t = roman ? koRo : ko
        let parts = n <= 10 ? [t[n]] : (n / 10 > 1 ? [t[n / 10]] : []) + [t[10]] + (n % 10 > 0 ? [t[n % 10]] : [])
        guard roman else { return parts.joined() }
        return parts.dropFirst().reduce(parts[0]) { a, b in
            guard let first = b.first, "aeiouy".contains(first), let last = a.last, !"aeiouy".contains(last) else { return a + b }
            let carry = ["p": "b", "k": "g", "l": "r", "t": "d"][String(last)] ?? String(last)
            return String(a.dropLast()) + carry + b
        }
    }
    public static func written(_ n: Int, course: String) -> String {
        if course == "ko" { return toKo(n, roman: false) }
        if course == "vi" { return toVi(n) }
        if course == "de" { return toDe(n) }
        if course == "es" { return toEs(n) }
        if course == "ja" { return toJa(n, pron: false) }
        if n <= 10 { return hz[n] }
        let tens = n / 10, ones = n % 10
        return (tens > 1 ? hz[tens] : "") + "十" + (ones > 0 ? hz[ones] : "")
    }
    /// Pinyin or romaji ("" for Vietnamese, German and Spanish, which are already written in Latin letters)
    public static func spoken(_ n: Int, course: String) -> String {
        if course == "ko" { return toKo(n, roman: true) }
        if course == "vi" || course == "de" || course == "es" { return "" }
        if course == "ja" { return toJa(n, pron: true) }
        if n <= 10 { return py[n] }
        let tens = n / 10, ones = n % 10
        return (tens > 1 ? py[tens] + " " : "") + "shí" + (ones > 0 ? " " + py[ones] : "")
    }
}
