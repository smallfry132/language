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
    public static func written(_ n: Int, course: String) -> String {
        if course == "vi" { return toVi(n) }
        if course == "ja" { return toJa(n, pron: false) }
        if n <= 10 { return hz[n] }
        let tens = n / 10, ones = n % 10
        return (tens > 1 ? hz[tens] : "") + "十" + (ones > 0 ? hz[ones] : "")
    }
    /// Pinyin or romaji ("" for Vietnamese, which is already written in Latin letters)
    public static func spoken(_ n: Int, course: String) -> String {
        if course == "vi" { return "" }
        if course == "ja" { return toJa(n, pron: true) }
        if n <= 10 { return py[n] }
        let tens = n / 10, ones = n % 10
        return (tens > 1 ? py[tens] + " " : "") + "shí" + (ones > 0 ? " " + py[ones] : "")
    }
}
