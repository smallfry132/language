import WidgetKit
import SwiftUI
import AppIntents
import LanguageCore

/* Widgets (round-2 canvas): the word of the day on the Home Screen (small, medium) and the Lock Screen
 * (rectangular, circular), each in its course's look. Lock Screen versions are monochrome as iOS renders them,
 * so the tone stays in the marks. Streak and due words appear only when the app can share them (App Group). */

enum WidgetCourse: String, AppEnum {
    case zh, ja, ko, vi
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Course"
    static let caseDisplayRepresentations: [WidgetCourse: DisplayRepresentation] = [
        .zh: "Chinese", .ja: "Japanese", .ko: "Korean", .vi: "Vietnamese"
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

struct WordProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> WordEntry { entry(.zh, Date()) }
    func snapshot(for configuration: CourseConfig, in context: Context) async -> WordEntry { entry(configuration.course, Date()) }
    func timeline(for configuration: CourseConfig, in context: Context) async -> Timeline<WordEntry> {
        // A new word just after midnight
        let next = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400)).addingTimeInterval(60)
        return Timeline(entries: [entry(configuration.course, Date())], policy: .after(next))
    }
    func entry(_ c: WidgetCourse, _ date: Date) -> WordEntry {
        let p = WordOfDay.pick(course: c.rawValue, date: date)
        let snap = WidgetSnapshot.read().flatMap { $0.course == c.rawValue ? $0 : nil }
        return WordEntry(date: date, course: c.rawValue, word: p?.word, picture: p?.picture, snapshot: snap)
    }
}

/// Each course's colours (the app's looks, simplified): background, ink, muted ink, accent
struct WidgetLook {
    let bg: Color, ink: Color, muted: Color, accent: Color
    static func of(_ c: String) -> WidgetLook {
        func dyn(_ l: UInt32, _ d: UInt32) -> Color { Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(rgb: d) : UIColor(rgb: l) }) }
        switch c {
        case "ja": return WidgetLook(bg: dyn(0xF7F7F4, 0x171716), ink: dyn(0x1E1E1E, 0xEEEEEA), muted: dyn(0x4E4E4A, 0xB5B5AE), accent: dyn(0x24365C, 0xA9BBE0))
        case "ko": return WidgetLook(bg: dyn(0xF6F8FD, 0x10141F), ink: dyn(0x16213E, 0xEDF1FA), muted: dyn(0x4A5578, 0xAEB8D3), accent: dyn(0x1D4E9E, 0x8DB0F0))
        case "vi": return WidgetLook(bg: dyn(0xFAFAF7, 0x0F1A17), ink: dyn(0x0F2A24, 0xE6F0EC), muted: dyn(0x3F5A53, 0xA9C2BA), accent: dyn(0x0F2A24, 0xC5F27A))
        default: return WidgetLook(bg: dyn(0xFAF8F3, 0x161514), ink: dyn(0x1C1C1C, 0xF2EEE6), muted: dyn(0x5F5A55, 0xB9B2A8), accent: dyn(0xB8322A, 0xE2766B))
        }
    }
}
extension UIColor {
    convenience init(rgb: UInt32) { self.init(red: CGFloat((rgb >> 16) & 0xFF) / 255, green: CGFloat((rgb >> 8) & 0xFF) / 255, blue: CGFloat(rgb & 0xFF) / 255, alpha: 1) }
}

/// Tone colours shared by Mandarin and Vietnamese (level red · rising amber · dipping green · falling blue …)
func toneColor(_ course: String, _ n: Int) -> Color {
    let zh: [Int: Color] = [1: Color(UIColor(rgb: 0xC62828)), 2: Color(UIColor(rgb: 0xB45309)), 3: Color(UIColor(rgb: 0x15803D)), 4: Color(UIColor(rgb: 0x1D4ED8))]
    if course == "zh" { return zh[n] ?? Color(UIColor(rgb: 0x475569)) }
    let vi: [Int: Color] = [1: zh[1]!, 2: zh[4]!, 3: zh[2]!, 4: zh[3]!, 5: Color(UIColor(rgb: 0x7C3AED)), 6: Color(UIColor(rgb: 0x475569))]
    return vi[n] ?? .primary
}
let viToneNames = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"]

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

struct WordWidgetView: View {
    let e: WordEntry
    @Environment(\.widgetFamily) var family
    var look: WidgetLook { .of(e.course) }
    var body: some View {
        Group {
            if let w = e.word {
                switch family {
                case .systemMedium: medium(w)
                case .accessoryRectangular: rectangular(w)
                case .accessoryCircular: circular(w)
                default: small(w)
                }
            } else { Text("—") }
        }
        .widgetURL(e.word.map { URL(string: "trainer://word/\(e.course)/\($0.id)")! })
        .containerBackground(for: .widget) { look.bg }
    }
    var eyebrow: some View { Text("WORD OF THE DAY").font(.system(size: 9, weight: .bold)).kerning(1).foregroundStyle(look.muted) }

    @ViewBuilder func face(_ w: Word, big: CGFloat) -> some View {
        switch w.course {
        case "zh": HStack(spacing: 3) { ForEach(Array(w.hz.prefix(3).enumerated()), id: \.offset) { GridChar(c: $0.element, size: w.hz.count > 2 ? big * 0.66 : big, accent: look.accent) } }
        case "ja":
            VStack(spacing: 0) {
                if let k = w.kana, k != w.hz { Text(k).font(.system(size: 10)).foregroundStyle(look.muted) }
                Text(w.hz).font(.custom("Hiragino Mincho ProN", size: big * 0.8)).minimumScaleFactor(0.5).lineLimit(1)
            }
        case "ko": VStack(alignment: .leading, spacing: 4) { JamoTiles(hz: w.hz); Text(w.hz).font(.system(size: big * 0.6, weight: .semibold)) }
        default: Reading(w: w, size: big * 0.62)
        }
    }

    func small(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            eyebrow
            Spacer(minLength: 0)
            face(w, big: 44)
            if w.course != "vi" { Reading(w: w, size: 15).lineLimit(1).minimumScaleFactor(0.6) }
            Text(w.en).font(.system(size: 12)).foregroundStyle(look.muted).lineLimit(1)
        }
        .foregroundStyle(look.ink)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    func medium(_ w: Word) -> some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                eyebrow
                face(w, big: 46)
                if w.course != "vi" { Reading(w: w, size: 15).lineLimit(1) }
                Text(meaningLine(w)).font(.system(size: 12)).foregroundStyle(look.muted).lineLimit(2)
            }
            Spacer(minLength: 0)
            VStack(alignment: .trailing, spacing: 8) {
                if let s = e.snapshot { Text("\(s.streak) days").font(.system(size: 13, weight: .bold)).foregroundStyle(look.accent) }
                if let p = e.picture { Text(p).font(.system(size: 34)) }
                Spacer(minLength: 0)
                Text("▶ Hear it").font(.system(size: 12, weight: .semibold)).padding(.horizontal, 10).padding(.vertical, 6)
                    .background(look.accent, in: Capsule()).foregroundStyle(e.course == "vi" ? Color(UIColor(rgb: 0xC5F27A)) : .white)
            }
        }
        .foregroundStyle(look.ink)
    }
    func meaningLine(_ w: Word) -> String {
        if w.course == "vi" { let n = Lingo.firstTone(w.hz, course: "vi"); return "\(w.en) · \(viToneNames[max(0, min(5, n - 1))])" }
        return w.en
    }

    func rectangular(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            HStack(spacing: 4) { Reading(w: w, size: 15); if w.course != "vi" { Text(w.hz).font(.system(size: 14)) } }
            Text(w.en + (e.snapshot.map { " · \($0.due) due" } ?? "")).font(.system(size: 12)).lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .widgetAccentable()
    }
    func circular(_ w: Word) -> some View {
        ZStack {
            AccessoryWidgetBackground()
            if let s = e.snapshot {
                VStack(spacing: 0) { Text("\(s.streak)").font(.system(size: 18, weight: .bold)); Text("days").font(.system(size: 9)) }
            } else {
                Text(String(w.hz.prefix(w.course == "vi" ? 4 : 1))).font(.system(size: w.course == "vi" ? 13 : 24, weight: .semibold)).minimumScaleFactor(0.5)
            }
        }
    }
}

struct WordWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "WordOfDay", intent: CourseConfig.self, provider: WordProvider()) { WordWidgetView(e: $0) }
            .configurationDisplayName("Word of the day")
            .description("A word to learn today, in your course's look.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryCircular])
    }
}

@main
struct LanguageWidgets: WidgetBundle {
    var body: some Widget { WordWidget() }
}
