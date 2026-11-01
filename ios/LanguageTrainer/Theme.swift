import SwiftUI
import LanguageCore

/* Colours and small building blocks shared by all screens. The palette matches the web app:
 * warm paper background, red accent for actions, one colour per tone in the content.
 * Text colours meet 4.5:1 on the backgrounds; with Increase Contrast they move further toward black or white. */

extension Color {
    /// Light and dark variants; text colours get a stronger variant when Increase Contrast is on
    static func dynamic(_ light: UInt32, _ dark: UInt32, text: Bool = true) -> Color {
        Color(UIColor { t in
            let dark_ = t.userInterfaceStyle == .dark
            let c = UIColor(hex: dark_ ? dark : light)
            guard text, t.accessibilityContrast == .high else { return c }
            return c.mixed(with: dark_ ? .white : .black, amount: 0.3)
        })
    }
    static let paper = dynamic(0xF6F3EE, 0x151417, text: false)
    static let elevated = dynamic(0xFFFFFF, 0x212024, text: false)
    static let sunken = dynamic(0xECE8E1, 0x0F0E11, text: false)
    static let ink = dynamic(0x1C1B1F, 0xF3F1EE)
    static let ink2 = dynamic(0x5F5B66, 0xB3AFB8)
    static let ink3 = dynamic(0x6B6772, 0x9A96A1)
    static let accentRed = dynamic(0xC8372D, 0xEF6A5E)
    static let good = dynamic(0x216F45, 0x4FC27F)
    static let gold = dynamic(0x856310, 0xE2B455)
    static let bad = dynamic(0xC0302F, 0xF26B6B)
    static let info = dynamic(0x2A62C4, 0x6F9CF0)
    /// Tone 1 is raspberry, not the red of the buttons: one colour means one thing
    static func tone(_ n: Int) -> Color {
        switch n {
        case 1: return dynamic(0xB3245E, 0xF2729F)
        case 2: return dynamic(0x985A07, 0xE3A447)
        case 3: return dynamic(0x237548, 0x5FCA8A)
        case 4: return dynamic(0x2A62C4, 0x7EA7F2)
        default: return dynamic(0x6B6772, 0x9A96A1)
        }
    }
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
    init(_ size: CGFloat, _ weight: Font.Weight, _ design: Font.Design, relativeTo style: Font.TextStyle) {
        _size = ScaledMetric(wrappedValue: size, relativeTo: style)
        self.weight = weight; self.design = design
    }
    func body(content: Content) -> some View { content.font(.system(size: size, weight: weight, design: design)) }
}
extension View {
    func scaledFont(_ size: CGFloat, _ weight: Font.Weight = .regular, design: Font.Design = .default) -> some View {
        modifier(ScaledFont(size, weight, design, relativeTo: size >= 28 ? .largeTitle : size >= 20 ? .title3 : .body))
    }
    /// Characters: medium weight reads best for hanzi and kana
    func hanziFont(_ size: CGFloat) -> some View { scaledFont(size, .medium) }
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
                else { a.foregroundColor = Color.tone(p.tone) }
                k += 1
            }
            out += a
        }
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
        if store.pyFirst { PinyinText(py: word.py, size: size * 0.8, weight: .semibold) }
        else {
            // Long words a little smaller: 4+ characters, or 12+ letters in Latin script (Vietnamese)
            let long = store.course.script == .cjk ? word.hz.count >= 4 : word.hz.count >= 12
            SwiftUI.Text(word.hz).hanziFont(long ? size * 0.7 : size)
        }
    }
}

struct CardBox<Content: View>: View {
    var padding: CGFloat = 16
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 10) { content }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Color.ink.opacity(0.06)))
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
                .background(active ? Color.ink : Color.elevated, in: Capsule())
                .foregroundStyle(active ? Color.paper : Color.ink)
                .overlay(Capsule().stroke(Color.ink.opacity(active ? 0 : 0.12)))
                .padding(.vertical, 5).contentShape(Rectangle()) // a 44 pt tall target around the smaller chip
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(active ? .isSelected : [])
    }
}

struct ChipRow<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) { HStack(spacing: 8) { content }.padding(.horizontal, 16) }
            .padding(.horizontal, -16)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var tint: Color = .accentRed
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).frame(maxWidth: .infinity).padding(.vertical, 14)
            .background(tint.opacity(configuration.isPressed ? 0.8 : 1), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .foregroundStyle(.white)
    }
}
struct SecondaryButtonStyle: ButtonStyle {
    var tint: Color = .ink
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline.weight(.medium)).frame(maxWidth: .infinity).padding(.vertical, 13)
            .background(Color.elevated.opacity(configuration.isPressed ? 0.6 : 1), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Color.ink.opacity(0.12)))
            .foregroundStyle(tint)
    }
}
extension ButtonStyle where Self == PrimaryButtonStyle { static var primary: PrimaryButtonStyle { .init() } }
extension ButtonStyle where Self == SecondaryButtonStyle { static var secondary: SecondaryButtonStyle { .init() } }

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
        }.buttonStyle(.plain).accessibilityLabel(store.t("speak"))
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
    var body: some View {
        HStack(spacing: 12) {
            ProgressView(value: Double(i), total: Double(max(n, 1))).tint(.accentRed)
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
                .padding(16).frame(maxWidth: 640).frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Color.paper)
    }
}


func fmtTime(_ ms: Double) -> String {
    let s = Int((ms / 1000).rounded())
    return String(format: "%d:%02d", s / 60, s % 60)
}
