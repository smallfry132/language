import Foundation

/* How a voice should sound on this device (Me → Voice → Sound), and which voice the second person of a dialogue
 * gets. Kept apart from AVFoundation so it can be tested. */

/// Equaliser and pitch for one voice: gains in dB (−6…+6), pitch in cents (−300…+300)
public struct VoiceTune: Codable, Equatable, Sendable {
    public var bass: Double, clarity: Double, bright: Double, pitch: Double
    public init(bass: Double = 0, clarity: Double = 2, bright: Double = 0, pitch: Double = 0) {
        self.bass = Self.gain(bass); self.clarity = Self.gain(clarity); self.bright = Self.gain(bright); self.pitch = Self.cents(pitch)
    }
    /// A light clarity boost, nothing else
    public static let standard = VoiceTune()
    public static func gain(_ x: Double) -> Double { min(6, max(-6, x.isFinite ? x : 0)) }
    public static func cents(_ x: Double) -> Double { min(300, max(-300, x.isFinite ? x : 0)) }
    enum CodingKeys: String, CodingKey { case bass, clarity, bright, pitch }
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.init(bass: (try? c.decode(Double.self, forKey: .bass)) ?? 0, clarity: (try? c.decode(Double.self, forKey: .clarity)) ?? 2,
                  bright: (try? c.decode(Double.self, forKey: .bright)) ?? 0, pitch: (try? c.decode(Double.self, forKey: .pitch)) ?? 0)
    }
}

/// A voice as far as choosing is concerned. gender: 0 unknown, 1 male, 2 female
public struct VoiceInfo: Equatable, Sendable {
    public let id: String, language: String, rank: Int, gender: Int
    public init(id: String, language: String, rank: Int, gender: Int) { self.id = id; self.language = language; self.rank = rank; self.gender = gender }
}

public enum VoicePick {
    /// The second person's voice in a dialogue: another good (not robotic) voice of the language, the exact language
    /// first, the other gender than the main voice where both are known, then the best quality. nil = no second
    /// voice: the same voice speaks lower (samePitchDrop). Chinese voices of another region speak another standard
    /// (Taiwan), so Chinese only takes the exact language.
    public static func second(main: VoiceInfo?, among voices: [VoiceInfo], language: String) -> VoiceInfo? {
        let cand = candidates(main: main, among: voices, language: language)
        let mg = main?.gender ?? 0
        let other = { (v: VoiceInfo) -> Bool in mg != 0 && v.gender != 0 && v.gender != mg }
        return cand.sorted { a, b in other(a) != other(b) ? other(a) : a.rank > b.rank }.first
    }
    /// The pitch drop in cents for the second person when there is no second voice
    public static let samePitchDrop = -250.0

    /// Good voices besides the main one: the exact language, else the same language of another region (never for Chinese)
    static func candidates(main: VoiceInfo?, among voices: [VoiceInfo], language: String) -> [VoiceInfo] {
        let pool = voices.filter { $0.rank > 0 && $0.id != main?.id }
        let exact = pool.filter { $0.language == language }
        return !exact.isEmpty || language.hasPrefix("zh") ? exact : pool.filter { $0.language.prefix(2) == language.prefix(2) }
    }

    /// The voice of a person in a dialogue, so that a man speaks with a man's voice and a woman with a woman's.
    /// gender and otherGender: 1 = man, 2 = woman, 0 = not known. The main voice is kept for whoever matches it;
    /// otherwise the best installed voice of the person's gender; with none, the main voice pitched down for a man
    /// or up for a woman. Two people of the same gender get two voices (or the second one a little lower/higher).
    /// Returns the voice id (nil = the main voice) and a pitch shift in cents.
    public static func person(gender g: Int, who: Int, otherGender og: Int, main: VoiceInfo?, among voices: [VoiceInfo], language: String) -> (id: String?, cents: Double) {
        let mg = main?.gender ?? 0
        // Gender not known (of the person or of the main voice): the second person just sounds different
        guard g != 0, mg != 0 else {
            guard who == 1 else { return (nil, 0) }
            let v = second(main: main, among: voices, language: language)
            return (v?.id, v == nil ? samePitchDrop : 0)
        }
        let same = og == g && who == 1, nudge = g == 1 ? -150.0 : 150.0
        let pool = candidates(main: main, among: voices, language: language).filter { $0.gender == g }.sorted { $0.rank > $1.rank }
        if mg == g { return same ? (pool.first?.id, pool.isEmpty ? nudge : 0) : (nil, 0) }
        if same && pool.count >= 2 { return (pool[1].id, 0) }
        if let v = pool.first { return (v.id, same ? nudge : 0) }
        return (nil, (g == 1 ? -350 : 300) + (same ? nudge : 0))
    }
}
