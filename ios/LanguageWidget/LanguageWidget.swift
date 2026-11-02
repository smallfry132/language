import WidgetKit
import SwiftUI
import AppIntents
import LanguageCore

/* Widgets (round-3 canvas): the word of the day on the Home Screen (small, medium) and the Lock Screen
 * (rectangular, circular), each in its course's look; a daily two-option quiz; and a progress widget. Lock Screen
 * versions are monochrome as iOS renders them, so tone stays in the marks and gender in the article word.
 * Streak, goal and due words appear only when the app can share them (App Group) — never a made-up number. */

enum WidgetCourse: String, AppEnum {
    case zh, ja, ko, vi, de, es
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Course"
    static let caseDisplayRepresentations: [WidgetCourse: DisplayRepresentation] = [
        .zh: "Chinese", .ja: "Japanese", .ko: "Korean", .vi: "Vietnamese", .de: "German", .es: "Spanish"
    ]
}

struct CourseConfig: WidgetConfigurationIntent {
    static let title: LocalizedStringResource = "Word of the day"
    static let description = IntentDescription("A word to learn today, in your course's look.")
    @Parameter(title: "Course", default: .zh) var course: WidgetCourse
}

struct WordEntry: TimelineEntry {
    let date: Date
    let course: String
    let word: Word?
    let picture: String?
    let snapshot: WidgetSnapshot?
}

/// A new word (and quiz question) just after midnight
func nextMidnight() -> Date { Calendar.current.startOfDay(for: Date().addingTimeInterval(86400)).addingTimeInterval(60) }

struct WordProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> WordEntry { entry(.zh, Date()) }
    func snapshot(for configuration: CourseConfig, in context: Context) async -> WordEntry { entry(configuration.course, Date()) }
    func timeline(for configuration: CourseConfig, in context: Context) async -> Timeline<WordEntry> {
        Timeline(entries: [entry(configuration.course, Date())], policy: .after(nextMidnight()))
    }
    func entry(_ c: WidgetCourse, _ date: Date) -> WordEntry {
        let p = WordOfDay.pick(course: c.rawValue, date: date)
        let snap = WidgetSnapshot.read().flatMap { $0.course == c.rawValue ? $0 : nil }
        return WordEntry(date: date, course: c.rawValue, word: p?.word, picture: p?.picture, snapshot: snap)
    }
}

/// Each course's look, simplified: colours, corner radius and the face of the word. The look fonts (Barlow, Fraunces …)
/// aren't bundled into the widget; the system's condensed and serif designs stand in for them.
struct WidgetLook {
    let bg: Color, ink: Color, muted: Color, accent: Color, button: Color, buttonInk: Color
    var radius: CGFloat = 10
    var width: Font.Width = .standard
    var design: Font.Design = .default
    func word(_ size: CGFloat) -> Font { .system(size: size, weight: design == .serif ? .semibold : .bold, design: design).width(width) }

    static func dyn(_ l: UInt32, _ d: UInt32) -> Color { Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(rgb: d) : UIColor(rgb: l) }) }
    static func of(_ c: String) -> WidgetLook {
        switch c {
        case "ja": return WidgetLook(bg: dyn(0xF7F7F4, 0x171716), ink: dyn(0x1E1E1E, 0xEEEEEA), muted: dyn(0x4E4E4A, 0xB5B5AE), accent: dyn(0x24365C, 0xA9BBE0),
                                     button: dyn(0x24365C, 0xA9BBE0), buttonInk: dyn(0xF7F7F4, 0x171716), radius: 8)
        case "ko": return WidgetLook(bg: dyn(0xF6F8FD, 0x10141F), ink: dyn(0x16213E, 0xEDF1FA), muted: dyn(0x4A5578, 0xAEB8D3), accent: dyn(0x1D4E9E, 0x8DB0F0),
                                     button: dyn(0x16213E, 0xEDF1FA), buttonInk: dyn(0xF2B544, 0x16213E), radius: 12)
        case "vi": return WidgetLook(bg: dyn(0xFAFAF7, 0x0F2A24), ink: dyn(0x0F2A24, 0xFAFAF7), muted: dyn(0x3F5A53, 0xB9C9C2), accent: dyn(0x0F2A24, 0xC5F27A),
                                     button: dyn(0x0F2A24, 0xC5F27A), buttonInk: dyn(0xC5F27A, 0x0F2A24), radius: 12)
        case "de": return WidgetLook(bg: dyn(0xF6F6F3, 0x141414), ink: dyn(0x161616, 0xEDEDE8), muted: dyn(0x5C5C57, 0xA8A8A2), accent: dyn(0xB7791F, 0xE0A341),
                                     button: dyn(0x161616, 0xEDEDE8), buttonInk: dyn(0xF6F6F3, 0x141414), radius: 6, width: .condensed)
        case "es": return WidgetLook(bg: dyn(0xFBF6EF, 0x1B1714), ink: dyn(0x2A1E16, 0xF3EBE0), muted: dyn(0x6E5A4A, 0xC2B2A2), accent: dyn(0xC4572B, 0xE8805A),
                                     button: dyn(0x2A1E16, 0xF3EBE0), buttonInk: dyn(0xFBF6EF, 0x1B1714), radius: 18, design: .serif)
        default: return WidgetLook(bg: dyn(0xFAF8F3, 0x161514), ink: dyn(0x1C1C1C, 0xF2EEE6), muted: dyn(0x5F5A55, 0xB9B2A8), accent: dyn(0xB8322A, 0xE2766B),
                                   button: dyn(0x1C1C1C, 0xF2EEE6), buttonInk: dyn(0xFAF8F3, 0x161514), radius: 0)
        }
    }
    /// Gender colours (German der/die/das, Spanish el/la): only ever outlines and text, never a fill
    static func gender(_ course: String, _ g: String) -> Color {
        switch (course, g) {
        case ("de", "m"): return dyn(0x1F5FBF, 0x86ABF2)
        case ("de", "f"): return dyn(0xA82E25, 0xF08A80)
        case ("de", _): return dyn(0x24704A, 0x6FC795)
        case (_, "f"): return dyn(0xA3193F, 0xF27A97)
        default: return dyn(0x2456A6, 0x8FB0F0)
        }
    }
}
extension UIColor {
    convenience init(rgb: UInt32) { self.init(red: CGFloat((rgb >> 16) & 0xFF) / 255, green: CGFloat((rgb >> 8) & 0xFF) / 255, blue: CGFloat(rgb & 0xFF) / 255, alpha: 1) }
}

/// Tone colours shared by Mandarin and Vietnamese (level red · rising amber · dipping green · falling blue …),
/// lighter on dark backgrounds
func toneColor(_ course: String, _ n: Int) -> Color {
    let c = WidgetLook.dyn
    let zh: [Int: Color] = [1: c(0xC62828, 0xF28B82), 2: c(0xB45309, 0xF2B66B), 3: c(0x15803D, 0x6FCF8E), 4: c(0x1D4ED8, 0x9DB8FF)]
    let grey = c(0x475569, 0xA8B4C4)
    if course == "zh" { return zh[n] ?? grey }
    let vi: [Int: Color] = [1: zh[1]!, 2: zh[4]!, 3: zh[2]!, 4: zh[3]!, 5: c(0x7C3AED, 0xC4A8FF), 6: grey]
    return vi[n] ?? .primary
}
let viToneNames = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"]
let viToneHints = ["level", "low falling", "rising", "dipping", "broken rising", "heavy"]
let viToneArrows = ["→", "↘", "↗", "↓↗", "↗̰", "↓"]
let zhToneNames = [1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "neutral"]
let zhToneMarks = [1: "¯", 2: "ˊ", 3: "ˇ", 4: "ˋ", 5: "·"]

/// What each course shows around the word: a tag above it (gender, kana, letters, tone), the meaning line and a hint
enum WordLines {
    static func genderShort(_ w: Word) -> String? {
        guard let g = w.g, let art = w.hz.split(separator: " ").first else { return nil }
        return "\(art) · \(g)"
    }
    static func genderLong(_ w: Word) -> String? {
        guard let g = w.g, let art = w.hz.split(separator: " ").first else { return nil }
        return "\(art) · " + (["m": "masculine", "f": "feminine", "n": "neuter"][g] ?? g)
    }
    /// The meaning without its note in brackets, for the small sizes ("teacher (f. la profesora)" → "teacher")
    static func short(_ en: String) -> String { en.components(separatedBy: " (")[0] }
    static func plural(_ w: Word) -> String? { w.pl.flatMap { $0 == "–" || $0.isEmpty ? nil : "pl. \($0)" } }
    /// German: how to type it without umlauts (Brötchen → Broetchen)
    static func typed(_ w: Word) -> String? {
        let b = WordOfDay.bare(w)
        var t = b
        for (u, e) in [("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss"), ("Ä", "Ae"), ("Ö", "Oe"), ("Ü", "Ue")] { t = t.replacingOccurrences(of: u, with: e) }
        return t == b ? nil : "type: \(t)"
    }
    static func stress(_ w: Word) -> String { Lingo.esStress(WordOfDay.bare(w)) }
    static func zhTones(_ w: Word) -> [Int] { Lingo.pyParts(w.py).filter { !$0.sep }.map(\.tone) }

    static func meaning(_ w: Word) -> String {
        switch w.course {
        case "zh":
            let t = zhTones(w).map { zhToneNames[$0] ?? "" }
            return "\(w.en) · " + (Set(t).count == 1 && t.count > 1 ? "\(t[0]) + \(t[0]) tone" : t.joined(separator: " + ") + " tone")
        case "de": return [w.en, plural(w)].compactMap { $0 }.joined(separator: " · ")
        case "es": return "\(w.en) · \(stress(w))"
        default: return w.en
        }
    }
    static func hint(_ w: Word) -> String? {
        switch w.course {
        case "de": return typed(w)
        case "es":
            let s = stress(w).split(separator: "-")
            guard s.count > 1, let up = s.first(where: { $0 == $0.uppercased() }) else { return nil }
            return "stress on \(up)"
        case "zh":
            let t = zhTones(w)
            if t.count > 1, Set(t).count == 1 { return ["", "both level", "both rise", "both dip", "both fall"][min(4, max(0, t[0]))] }
            return nil
        default: return nil
        }
    }
}

/// The reading, coloured by tone where the language has tones (plain in accented, monochrome rendering)
struct Reading: View {
    let w: Word
    var size: CGFloat
    @Environment(\.widgetRenderingMode) var mode
    var body: some View {
        if w.course == "zh" {
            Lingo.pyParts(w.py).reduce(Text("")) { t, p in t + Text(p.text).foregroundColor(p.sep || mode != .fullColor ? nil : toneColor("zh", p.tone)) }
                .font(.system(size: size, weight: .bold))
        } else if w.course == "vi" {
            w.hz.split(separator: " ").enumerated().reduce(Text("")) { t, e in t + Text((e.offset > 0 ? " " : "") + e.element).foregroundColor(mode == .fullColor ? toneColor("vi", Lingo.firstTone(String(e.element), course: "vi")) : nil) }
                .font(.system(size: size, weight: .bold))
        } else {
            Text(w.course == "ja" ? (w.romaji ?? w.py) : w.py).font(.system(size: size, weight: .bold))
        }
    }
}

/// Spanish: the stressed syllable is heavier and underlined in terracotta (ma·ña·na)
struct StressedWord: View {
    let w: Word
    let font: Font
    let accent: Color
    @Environment(\.widgetRenderingMode) var mode
    var body: some View {
        let word = Array(WordOfDay.bare(w))
        let syl = WordLines.stress(w).split(separator: "-").map(String.init)
        var at = 0
        return syl.reduce(Text("")) { t, s in
            let part = String(word[min(at, word.count)..<min(at + s.count, word.count)]); at += s.count
            guard s == s.uppercased(), syl.count > 1 else { return t + Text(part) }
            return t + Text(part).underline(true, color: mode == .fullColor ? accent : nil).foregroundColor(mode == .fullColor ? accent : nil).fontWeight(.heavy)
        }
        .font(font)
    }
}

/// The article as an outlined chip in its gender colour ("die · f")
struct GenderChip: View {
    let text: String
    let color: Color
    let radius: CGFloat
    var body: some View {
        Text(text).font(.system(size: 11, weight: .bold)).foregroundStyle(color)
            .padding(.horizontal, 6).padding(.vertical, 2)
            .overlay(RoundedRectangle(cornerRadius: min(radius, 8)).stroke(color, lineWidth: 1.2))
    }
}

/// 田字格: a character in its practice square
struct GridChar: View {
    let c: Character
    let size: CGFloat
    let accent: Color
    var body: some View {
        ZStack {
            Path { p in p.move(to: CGPoint(x: 0, y: size / 2)); p.addLine(to: CGPoint(x: size, y: size / 2)); p.move(to: CGPoint(x: size / 2, y: 0)); p.addLine(to: CGPoint(x: size / 2, y: size)) }
                .stroke(accent.opacity(0.35), style: StrokeStyle(lineWidth: 0.8, dash: [3, 2]))
            Text(String(c)).font(.custom("Songti SC", size: size * 0.72))
        }
        .frame(width: size, height: size)
        .overlay(Rectangle().stroke(accent, lineWidth: 1.2))
    }
}

/// Korean: the letters of each block (consonant blue, vowel yellow, final red)
struct JamoTiles: View {
    let hz: String
    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(hz.prefix(3).enumerated()), id: \.offset) { _, ch in
                if let j = Lingo.koJamo(ch) {
                    HStack(spacing: 1) {
                        tile(j.i, Color(UIColor(rgb: 0x1D4E9E)), .white)
                        tile(j.v, Color(UIColor(rgb: 0xF2B544)), Color(UIColor(rgb: 0x16213E)))
                        if !j.f.isEmpty { tile(j.f, Color(UIColor(rgb: 0xC8323C)), .white) }
                    }
                }
            }
        }
    }
    func tile(_ s: String, _ bg: Color, _ fg: Color) -> some View {
        Text(s).font(.system(size: 11, weight: .bold)).foregroundStyle(fg).frame(width: 17, height: 17).background(bg, in: RoundedRectangle(cornerRadius: 4))
    }
}

/// The course as one glyph for the round Lock Screen widget
func courseGlyph(_ c: String) -> String { ["zh": "中", "ja": "あ", "ko": "한", "vi": "Ơ", "de": "Ä", "es": "Ñ"][c] ?? "·" }
let courseNames = ["zh": "CHINESE", "ja": "JAPANESE", "ko": "KOREAN", "vi": "VIETNAMESE", "de": "GERMAN", "es": "SPANISH"]

/// What the voice reads: the written word (characters, or the noun with its article)
func spoken(_ w: Word) -> String { w.hz }

struct WordWidgetView: View {
    let e: WordEntry
    @Environment(\.widgetFamily) var family
    var look: WidgetLook { .of(e.course) }
    var body: some View {
        Group {
            if let w = e.word {
                switch family {
                case .systemMedium: medium(w)
                case .systemLarge: large(w)
                case .accessoryRectangular: rectangular(w)
                case .accessoryCircular: circular(w)
                default: small(w)
                }
            } else { Text("—") }
        }
        .widgetURL(e.word.map { URL(string: "trainer://word/\(e.course)/\($0.id)")! })
        .containerBackground(for: .widget) { look.bg }
    }
    func eyebrow(_ s: String) -> some View { Text(s).font(.system(size: 9, weight: .bold)).kerning(1).foregroundStyle(look.muted).lineLimit(1) }

    @ViewBuilder func face(_ w: Word, big: CGFloat) -> some View {
        switch w.course {
        case "zh": HStack(spacing: 3) { ForEach(Array(w.hz.prefix(3).enumerated()), id: \.offset) { GridChar(c: $0.element, size: w.hz.count > 2 ? big * 0.66 : big, accent: look.accent) } }
        case "ja":
            VStack(spacing: 0) {
                if let k = w.kana, k != w.hz { Text(k).font(.system(size: 10)).foregroundStyle(look.muted) }
                Text(w.hz).font(.custom("Hiragino Mincho ProN", size: big * 0.8)).minimumScaleFactor(0.5).lineLimit(1)
            }
        case "ko": VStack(alignment: .leading, spacing: 4) { JamoTiles(hz: w.hz); Text(w.hz).font(.system(size: big * 0.6, weight: .semibold)) }
        case "de": Text(WordOfDay.bare(w)).font(look.word(big * 0.7)).lineLimit(1).minimumScaleFactor(0.5)
        case "es": StressedWord(w: w, font: look.word(big * 0.66), accent: look.accent).lineLimit(1).minimumScaleFactor(0.5)
        default: Reading(w: w, size: big * 0.62)
        }
    }
    /// German and Spanish: the article chip above the word
    @ViewBuilder func chip(_ w: Word, long: Bool) -> some View {
        if let g = w.g, let t = long ? WordLines.genderLong(w) : WordLines.genderShort(w) {
            GenderChip(text: t, color: WidgetLook.gender(w.course, g), radius: look.radius)
        }
    }
    var latin: Bool { e.course == "de" || e.course == "es" }

    func small(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            eyebrow("WORD OF THE DAY")
            Spacer(minLength: 0)
            chip(w, long: false)
            face(w, big: 44)
            if !latin && w.course != "vi" { Reading(w: w, size: 15).lineLimit(1).minimumScaleFactor(0.6) }
            Text(smallMeaning(w)).font(.system(size: 12)).foregroundStyle(look.muted).lineLimit(2).minimumScaleFactor(0.8)
        }
        .foregroundStyle(look.ink)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
    func smallMeaning(_ w: Word) -> String {
        switch w.course {
        case "vi": return "\(w.en) · \(viToneNames[max(0, min(5, Lingo.firstTone(w.hz, course: "vi") - 1))])"
        case "de": return [WordLines.short(w.en), WordLines.plural(w)].compactMap { $0 }.joined(separator: " · ")
        case "es": return "\(WordLines.short(w.en)) · \(WordLines.stress(w))"
        default: return w.en
        }
    }

    /// Large (iPad Home Screen, also iPhone): the medium widget with the word's example sentence below
    func large(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            medium(w).frame(maxHeight: 170)
            Rectangle().fill(look.muted.opacity(0.3)).frame(height: 1)
            if let ex = w.ex, !ex.isEmpty {
                eyebrow("EXAMPLE")
                Text(ex).font(w.course == "de" || w.course == "es" ? look.word(20) : .system(size: 20, weight: .medium)).foregroundStyle(look.ink).lineLimit(3).minimumScaleFactor(0.7)
                if let py = w.exPy, !py.isEmpty, w.course != "vi" { Text(py).font(.system(size: 13)).foregroundStyle(look.muted).lineLimit(2) }
                if let en = w.exEn, !en.isEmpty { Text(en).font(.system(size: 13)).foregroundStyle(look.muted).lineLimit(2) }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    /// Medium: the course and tag above the word, the meaning and a hint below, Hear it plays the word in place
    func medium(_ w: Word) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                eyebrow("\(courseNames[w.course] ?? "") · WORD OF THE DAY")
                tag(w)
                face(w, big: 46)
                if !latin && w.course != "vi" { Reading(w: w, size: 15).lineLimit(1) }
                Text(WordLines.meaning(w)).font(.system(size: 12)).foregroundStyle(look.muted).lineLimit(2)
                if let h = WordLines.hint(w), !h.isEmpty { Text(h).font(.system(size: 11, weight: .medium)).foregroundStyle(look.muted).lineLimit(1) }
            }
            Spacer(minLength: 0)
            VStack(alignment: .trailing, spacing: 8) {
                if let s = e.snapshot { Text("\(s.streak) days").font(.system(size: 13, weight: .bold)).foregroundStyle(look.accent) }
                if let p = e.picture { Text(p).font(.system(size: 34)) }
                Spacer(minLength: 0)
                Button(intent: HearWordIntent(course: w.course, text: spoken(w))) {
                    Text("▶ Hear it").font(.system(size: 12, weight: .semibold)).padding(.horizontal, 10).padding(.vertical, 6)
                        .background(look.button, in: RoundedRectangle(cornerRadius: max(look.radius, 4)))
                        .foregroundStyle(look.buttonInk)
                }
                .buttonStyle(.plain)
            }
        }
        .foregroundStyle(look.ink)
    }
    @ViewBuilder func tag(_ w: Word) -> some View {
        switch w.course {
        case "de", "es": chip(w, long: true)
        case "vi":
            let n = max(0, min(5, Lingo.firstTone(w.hz, course: "vi") - 1))
            Text("\(viToneArrows[n]) \(viToneNames[n]) · \(viToneHints[n])").font(.system(size: 11, weight: .semibold)).foregroundStyle(look.accent)
        default: EmptyView()
        }
    }

    func rectangular(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            switch w.course {
            case "de", "es":
                HStack(spacing: 4) {
                    Text(w.hz).font(.system(size: 15, weight: .bold))
                    if let g = w.g { Text("(\(g))").font(.system(size: 13)) }
                }
                Text([WordLines.short(w.en), w.pl.flatMap { $0 == "–" ? nil : $0 } ?? (w.course == "es" ? WordLines.stress(w) : nil)].compactMap { $0 }.joined(separator: " · ")).font(.system(size: 12)).lineLimit(1)
            default:
                HStack(spacing: 4) { Reading(w: w, size: 15); if w.course != "vi" { Text(w.hz).font(.system(size: 14)) } }
                let marks = w.course == "zh" ? " · " + WordLines.zhTones(w).map { zhToneMarks[$0] ?? "" }.joined(separator: " ") : ""
                Text(w.en + marks + (e.snapshot.map { " · \($0.due) due" } ?? "")).font(.system(size: 12)).lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .widgetAccentable()
    }
    /// Round: the course glyph (tap opens the app and plays the word); the streak once the app can share it
    func circular(_ w: Word) -> some View {
        ZStack {
            AccessoryWidgetBackground()
            if let s = e.snapshot {
                VStack(spacing: 0) { Text("\(s.streak)").font(.system(size: 18, weight: .bold)); Text("days").font(.system(size: 9)) }
            } else {
                Text(courseGlyph(w.course)).font(.system(size: 24, weight: .semibold))
            }
        }
    }
}

struct WordWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "WordOfDay", intent: CourseConfig.self, provider: WordProvider()) { WordWidgetView(e: $0) }
            .configurationDisplayName("Word of the day")
            .description("A word to learn today, in your course's look. Hear it plays the word.")
            .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryCircular])
    }
}

@main
struct LanguageWidgets: WidgetBundle {
    var body: some Widget {
        WordWidget()
        QuizWidget()
        ProgressWidget()
    }
}
