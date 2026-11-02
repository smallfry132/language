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
        let pool = voices.filter { $0.rank > 0 && $0.id != main?.id }
        let exact = pool.filter { $0.language == language }
        let cand = !exact.isEmpty || language.hasPrefix("zh") ? exact : pool.filter { $0.language.prefix(2) == language.prefix(2) }
        let mg = main?.gender ?? 0
        let other = { (v: VoiceInfo) -> Bool in mg != 0 && v.gender != 0 && v.gender != mg }
        return cand.sorted { a, b in other(a) != other(b) ? other(a) : a.rank > b.rank }.first
    }
    /// The pitch drop in cents for the second person when there is no second voice
    public static let samePitchDrop = -250.0
}
