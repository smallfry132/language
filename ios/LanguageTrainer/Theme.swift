import SwiftUI
import LanguageCore

/* Colours and small building blocks shared by all screens.
 * One look per language, from the style canvas: Ink Grid (Chinese), Quiet Ruby (Japanese), Block Builder (Korean),
 * Tone Color (Vietnamese). Each sets the palette, the corners, the font for words and the tab labels; the screens
 * only use the named colours below. Every text colour meets 4.5:1 in light and dark; with Increase Contrast they
 * move further toward black or white. */

struct Look {
    typealias Pair = (light: UInt32, dark: UInt32)
    let id: String
    let paper: Pair, elevated: Pair, sunken: Pair, line: Pair
    let ink: Pair, ink2: Pair, ink3: Pair
    let action: Pair, onAction: Pair   // main buttons
    let accent: Pair                   // progress, selection, the live microphone
    let radius: CGFloat
    let wordFont: (CGFloat, Font.Weight) -> String? // PostScript name of the font for words in the target script; nil = system
    let tabs: [String]                 // Learn, Practice, Words, Me in the language's own script

    static let inkGrid = Look(id: "zh",
        paper: (0xFAF8F3, 0x161514), elevated: (0xFFFFFF, 0x211F1D), sunken: (0xEFEBE2, 0x0F0E0D), line: (0xDDD5C6, 0x3A3632),
        ink: (0x1C1C1C, 0xF2EEE6), ink2: (0x5F5A55, 0xB9B2A8), ink3: (0x6B655F, 0x9A938A),
        action: (0x1C1C1C, 0xF2EEE6), onAction: (0xFAF8F3, 0x161514), accent: (0xB8322A, 0xE2766B), radius: 2,
        wordFont: { _, w in w.isBold ? "STSongti-SC-Bold" : "STSongti-SC-Regular" }, tabs: ["学", "练", "词", "我"])
    static let quietRuby = Look(id: "ja",
        paper: (0xF7F7F4, 0x171716), elevated: (0xFFFFFF, 0x222220), sunken: (0xECECE7, 0x101010), line: (0xE2E2DC, 0x3A3A36),
        ink: (0x1E1E1E, 0xEEEEEA), ink2: (0x4E4E4A, 0xB5B5AE), ink3: (0x66665F, 0x97978F),
        action: (0x24365C, 0xA9BBE0), onAction: (0xFFFFFF, 0x171716), accent: (0x24365C, 0xA9BBE0), radius: 8,
        wordFont: { _, w in w.isBold ? "HiraMinProN-W6" : "HiraMinProN-W3" }, tabs: ["学", "練", "語", "私"])
    static let blockBuilder = Look(id: "ko",
        paper: (0xF6F8FD, 0x10141F), elevated: (0xFFFFFF, 0x1A2030), sunken: (0xE3E8F4, 0x0B0E16), line: (0xD7DDEC, 0x2E3750),
        ink: (0x16213E, 0xEDF1FA), ink2: (0x4A5578, 0xAEB8D3), ink3: (0x5A6488, 0x8F9AB8),
        action: (0x1D4E9E, 0x8DB0F0), onAction: (0xFFFFFF, 0x10141F), accent: (0x1D4E9E, 0x8DB0F0), radius: 16,
        wordFont: { _, _ in nil }, tabs: ["학", "연", "단", "나"])
    static let toneColor = Look(id: "vi",
        paper: (0xFAFAF7, 0x0F1A17), elevated: (0xFFFFFF, 0x172420), sunken: (0xDDE6E1, 0x0A1210), line: (0xDDE6E1, 0x2A3B36),
        ink: (0x0F2A24, 0xE6F0EC), ink2: (0x3F5A53, 0xA9C2BA), ink3: (0x4F6B63, 0x87A39A),
        action: (0x0F2A24, 0xC5F27A), onAction: (0xC5F27A, 0x0F2A24), accent: (0x0F2A24, 0xC5F27A), radius: 14,
        wordFont: { _, w in w == .heavy || w == .black ? "BeVietnamPro-ExtraBold" : w.isBold ? "BeVietnamPro-SemiBold" : "BeVietnamPro-Regular" },
        tabs: ["Học", "Tập", "Từ", "Tôi"])
    static func of(_ course: String) -> Look { ["zh": inkGrid, "ja": quietRuby, "ko": blockBuilder, "vi": toneColor][course] ?? inkGrid }
    /// The look of the course on screen. Set by the Store when the course changes; read when colours are drawn.
    static var current = inkGrid
    /// Tone colours on pinyin and Vietnamese (Me → Colour by tone)
    static var toneColors = true
}

extension Font.Weight {
    var isBold: Bool { self == .semibold || self == .bold || self == .heavy || self == .black }
}

extension Color {
    /// A colour of the current look, light or dark; text colours get stronger with Increase Contrast
    static func look(_ pick: @escaping (Look) -> Look.Pair, text: Bool = true) -> Color {
        Color(UIColor { t in
            let dark = t.userInterfaceStyle == .dark, pair = pick(Look.current)
            let c = UIColor(hex: dark ? pair.dark : pair.light)
            guard text, t.accessibilityContrast == .high else { return c }
            return c.mixed(with: dark ? .white : .black, amount: 0.3)
        })
    }
    /// Light and dark variants of a fixed colour (the same in every look)
    static func dynamic(_ light: UInt32, _ dark: UInt32, text: Bool = true) -> Color {
        Color(UIColor { t in
            let dark_ = t.userInterfaceStyle == .dark
            let c = UIColor(hex: dark_ ? dark : light)
            guard text, t.accessibilityContrast == .high else { return c }
            return c.mixed(with: dark_ ? .white : .black, amount: 0.3)
        })
    }
    static let paper = look({ $0.paper }, text: false)
    static let elevated = look({ $0.elevated }, text: false)
    static let sunken = look({ $0.sunken }, text: false)
    static let line = look({ $0.line }, text: false)
    static let ink = look { $0.ink }
    static let ink2 = look { $0.ink2 }
    static let ink3 = look { $0.ink3 }
    static let action = look { $0.action }
    static let onAction = look { $0.onAction }
    static let accent = look { $0.accent }
    static let good = dynamic(0x216F45, 0x4FC27F)
    static let gold = dynamic(0x856310, 0xE2B455)
    static let bad = dynamic(0xC0302F, 0xF26B6B)
    static let info = dynamic(0x2A62C4, 0x6F9CF0)
    /// Tone colours shared by Mandarin and Vietnamese: the same contour has the same colour.
    /// level red · rising amber · dipping green · falling blue · light/heavy slate · broken (ngã) violet
    enum Contour { case level, rising, dipping, falling, light, broken }
    static func contour(_ c: Contour) -> Color {
        switch c {
        case .level: return dynamic(0xC62828, 0xF28B82)
        case .rising: return dynamic(0xB45309, 0xF6B35A)
        case .dipping: return dynamic(0x15803D, 0x6FCF97)
        case .falling: return dynamic(0x1D4ED8, 0x8AB4F8)
        case .light: return dynamic(0x475569, 0xA3AEBF)
        case .broken: return dynamic(0x7C3AED, 0xC4A7FF)
        }
    }
    /// Mandarin tones 1–4 and neutral (5)
    static func tone(_ n: Int) -> Color { contour([1: .level, 2: .rising, 3: .dipping, 4: .falling][n] ?? .light) }
    /// Vietnamese tones: ngang, huyền, sắc, hỏi, ngã, nặng (1–6)
    static func viTone(_ n: Int) -> Color { contour([1: .level, 2: .falling, 3: .rising, 4: .dipping, 5: .broken][n] ?? .light) }
}

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
    func mixed(with o: UIColor, amount a: CGFloat) -> UIColor {
        var r1: CGFloat = 0, g1: CGFloat = 0, b1: CGFloat = 0, a1: CGFloat = 0, r2: CGFloat = 0, g2: CGFloat = 0, b2: CGFloat = 0, a2: CGFloat = 0
        getRed(&r1, green: &g1, blue: &b1, alpha: &a1); o.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)
        return UIColor(red: r1 + (r2 - r1) * a, green: g1 + (g2 - g1) * a, blue: b1 + (b2 - b1) * a, alpha: a1)
    }
}

/// A system font at a given size that grows and shrinks with the iPhone's text size (Dynamic Type)
struct ScaledFont: ViewModifier {
    @ScaledMetric var size: CGFloat
    var weight: Font.Weight
    var design: Font.Design
    var word = false
    init(_ size: CGFloat, _ weight: Font.Weight, _ design: Font.Design, relativeTo style: Font.TextStyle, word: Bool = false) {
        _size = ScaledMetric(wrappedValue: size, relativeTo: style)
        self.weight = weight; self.design = design; self.word = word
    }
    func body(content: Content) -> some View {
        if word, let name = Look.current.wordFont(size, weight), UIFont(name: name, size: size) != nil {
            content.font(.custom(name, fixedSize: size))
        } else {
            content.font(.system(size: size, weight: weight, design: design))
        }
    }
}
extension View {
    func scaledFont(_ size: CGFloat, _ weight: Font.Weight = .regular, design: Font.Design = .default) -> some View {
        modifier(ScaledFont(size, weight, design, relativeTo: size >= 28 ? .largeTitle : size >= 20 ? .title3 : .body))
    }
    /// Words in the target script, in the look's font (serif characters, Be Vietnam Pro…)
    func hanziFont(_ size: CGFloat, _ weight: Font.Weight = .medium) -> some View {
        modifier(ScaledFont(size, weight, .default, relativeTo: size >= 28 ? .largeTitle : size >= 20 ? .title3 : .body, word: true))
    }
}

/// Short vibrations for right and wrong answers (the system's Haptics setting turns them off)
@MainActor enum Haptic {
    static let gen = UINotificationFeedbackGenerator()
    static func success() { gen.notificationOccurred(.success) }
    static func error() { gen.notificationOccurred(.error) }
    static func answer(_ ok: Bool) { ok ? success() : error() }
}

/// Pinyin with one colour per tone, so the tone pattern of a word is visible at a glance
struct PinyinText: View {
    let py: String
    var size: CGFloat = 17
    var weight: Font.Weight = .regular
    var body: some View {
        Text(Self.attributed(py)).scaledFont(size, weight)
    }
    static func attributed(_ py: String, missed: [Bool]? = nil) -> AttributedString {
        var out = AttributedString()
        var k = 0
        for p in Lingo.pyParts(py) {
            var a = AttributedString(p.text)
            if !p.sep {
                if let missed, k < missed.count, missed[k] { a.foregroundColor = .ink3; a.strikethroughStyle = .single }
                else { a.foregroundColor = Look.toneColors ? Color.tone(p.tone) : Color.ink }
                k += 1
            }
            out += a
        }
        return out
    }
}

/// Vietnamese: each syllable in its tone's colour; the marks stay, so colour is never the only cue
struct VietText: View {
    let text: String
    var size: CGFloat = 17
    var weight: Font.Weight = .semibold
    var body: some View { Text(Self.attributed(text)).hanziFont(size, weight) }
    static func attributed(_ s: String) -> AttributedString {
        var out = AttributedString(), word = ""
        func flush() {
            guard !word.isEmpty else { return }
            var a = AttributedString(word); a.foregroundColor = Look.toneColors ? Color.viTone(Lingo.firstTone(word, course: "vi")) : Color.ink; out += a; word = ""
        }
        for c in s { if c.isLetter { word.append(c) } else { flush(); out += AttributedString(String(c)) } }
        flush()
        return out
    }
}

/// The pronunciation of a word as the course shows it: coloured pinyin for Chinese, plain text otherwise
struct Pron: View {
    @Environment(Store.self) var store
    let py: String
    var size: CGFloat = 17
    var body: some View {
        if store.course.id == "zh" { PinyinText(py: py, size: size) } else { SwiftUI.Text(py).scaledFont(size).foregroundStyle(Color.ink2) }
    }
}

/// The written form of a word as the learner reads it: pinyin in pinyin-first mode, else the word itself
struct WordFace: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 40
    var body: some View {
        // Long words a little smaller: 4+ characters, or 12+ letters in Latin script (Vietnamese)
        let long = store.course.script == .cjk ? word.hz.count >= 4 : word.hz.count >= 12
        if store.pyFirst { PinyinText(py: word.py, size: size * 0.8, weight: .semibold) }
        else if store.course.id == "vi" { VietText(text: word.hz, size: long ? size * 0.7 : size * 0.85, weight: .heavy) }
        else { SwiftUI.Text(word.hz).hanziFont(long ? size * 0.7 : size) }
    }
}

struct CardBox<Content: View>: View {
    var padding: CGFloat = 16
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 10) { content }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2, style: .continuous).stroke(Color.line))
    }
}

struct ChipButton: View {
    let label: String
    let active: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            SwiftUI.Text(label).font(.subheadline.weight(.medium)).lineLimit(1)
                .padding(.horizontal, 12).padding(.vertical, 8)
                .background(active ? Color.ink : Color.elevated, in: RoundedRectangle(cornerRadius: min(Look.current.radius, 18), style: .continuous))
                .foregroundStyle(active ? Color.paper : Color.ink)
                .overlay(RoundedRectangle(cornerRadius: min(Look.current.radius, 18), style: .continuous).stroke(active ? Color.clear : Color.line))
                .padding(.vertical, 5).contentShape(Rectangle()) // a 44 pt tall target around the smaller chip
        }
        .buttonStyle(.card)
        .accessibilityAddTraits(active ? .isSelected : [])
    }
}

struct ChipRow<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        ScrollView(.horizontal) { HStack(spacing: 8) { content }.padding(.horizontal, 16) }.scrollIndicators(.hidden)
            .padding(.horizontal, -16)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var tint: Color = .action
    var text: Color = .onAction
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).frame(maxWidth: .infinity).padding(.vertical, 14)
            .background(tint.opacity(configuration.isPressed ? 0.8 : 1), in: RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2, style: .continuous))
            .foregroundStyle(text)
    }
}
struct SecondaryButtonStyle: ButtonStyle {
    var tint: Color = .ink
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline.weight(.medium)).frame(maxWidth: .infinity).padding(.vertical, 13)
            .background(Color.elevated.opacity(configuration.isPressed ? 0.6 : 1), in: RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2, style: .continuous).stroke(Color.line))
            .foregroundStyle(tint)
    }
}
extension ButtonStyle where Self == PrimaryButtonStyle { static var primary: PrimaryButtonStyle { .init() } }
extension ButtonStyle where Self == SecondaryButtonStyle { static var secondary: SecondaryButtonStyle { .init() } }
/// A card or row that is a button: like .plain, but the whole frame takes the tap, also where the background is
/// see-through (with .plain only the text and other opaque parts react), and it dims a little while pressed
struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.contentShape(Rectangle()).opacity(configuration.isPressed ? 0.7 : 1)
    }
}
extension ButtonStyle where Self == CardButtonStyle { static var card: CardButtonStyle { .init() } }

struct SpeakButton: View {
    @Environment(Store.self) var store
    let text: String
    var rate: Double?
    var small = false
    var body: some View {
        Button { store.speaker.say(text, rate: rate) } label: {
            Image(systemName: "speaker.wave.2.fill").font(small ? .body : .title2)
                .frame(width: small ? 44 : 56, height: small ? 44 : 56)
                .background(Color.sunken, in: Circle())
                .foregroundStyle(Color.ink)
        }.buttonStyle(.card).accessibilityLabel(store.t("speak"))
    }
}

struct SectionTitle: View {
    let text: String
    var body: some View {
        SwiftUI.Text(text.uppercased()).font(.caption.weight(.semibold)).foregroundStyle(Color.ink3).tracking(0.5)
            .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 18).padding(.bottom, 2)
    }
}

struct ProgressHeader: View {
    let i: Int
    let n: Int
    var extra: String?
    @Environment(\.flowInfo) private var flow
    var body: some View {
        if let flow { FlowHeader(flow: flow, i: i, n: n) } else { bar }
    }
    var bar: some View {
        HStack(spacing: 12) {
            if n <= 24 {
                // One segment per question, as on the style canvas
                HStack(spacing: 3) {
                    ForEach(0..<max(n, 1), id: \.self) { k in
                        RoundedRectangle(cornerRadius: Look.current.radius > 8 ? 2 : 0).fill(k < i ? Color.accent : Color.line).frame(height: 4)
                    }
                }.accessibilityElement().accessibilityLabel("\(i) / \(n)")
            } else {
                ProgressView(value: Double(i), total: Double(max(n, 1))).tint(.accent)
            }
            SwiftUI.Text("\(i)/\(n)" + (extra.map { " · " + $0 } ?? "")).font(.footnote.monospacedDigit()).foregroundStyle(Color.ink2)
        }
    }
}

struct FeedbackBar: View {
    @Environment(Store.self) var store
    let ok: Bool
    var text: AttributedString
    var speak: String?
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: ok ? "checkmark.circle.fill" : "xmark.circle.fill").font(.title3)
            SwiftUI.Text(text).frame(maxWidth: .infinity, alignment: .leading)
            if let speak { SpeakButton(text: speak, small: true) }
        }
        .padding(12)
        .foregroundStyle(ok ? Color.good : Color.bad)
        .background((ok ? Color.good : Color.bad).opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
    }
}

/// The page background and width used by every screen
struct Page<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) { content }
                .padding(16).padding(.bottom, 24).frame(maxWidth: 640).frame(maxWidth: .infinity)
        }
        .scrollIndicators(.hidden)
        .scrollDismissesKeyboard(.interactively)
        .background(Color.paper)
    }
}


func fmtTime(_ ms: Double) -> String {
    let s = Int((ms / 1000).rounded())
    return String(format: "%d:%02d", s / 60, s % 60)
}
