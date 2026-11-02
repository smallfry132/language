import WidgetKit
import SwiftUI
import AppIntents
import AVFoundation
import LanguageCore

/* Interactive widgets (iOS 17): Hear it plays the word with the system voice without opening the app, and the
 * daily quiz takes one tap. The widget keeps its own answer for the day; without an App Group the app can't see it,
 * so the answer isn't counted as a review yet. */

let voiceLanguage = ["zh": "zh-CN", "ja": "ja-JP", "ko": "ko-KR", "vi": "vi-VN", "de": "de-DE", "es": "es-ES"]

/// Speaks one line and waits until it has finished, so the widget extension stays alive while it plays
final class WidgetVoice: NSObject, AVSpeechSynthesizerDelegate, @unchecked Sendable {
    static let shared = WidgetVoice()
    private let synth = AVSpeechSynthesizer()
    private var done: CheckedContinuation<Void, Never>?
    override init() { super.init(); synth.delegate = self }
    func say(_ text: String, language: String) async {
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: .duckOthers)
        try? AVAudioSession.sharedInstance().setActive(true)
        let u = AVSpeechUtterance(string: text)
        u.voice = AVSpeechSynthesisVoice.speechVoices().filter { $0.language == language }.max { $0.quality.rawValue < $1.quality.rawValue }
            ?? AVSpeechSynthesisVoice(language: language)
        u.rate = AVSpeechUtteranceDefaultSpeechRate * 0.85
        await withCheckedContinuation { c in done = c; synth.speak(u) }
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    func speechSynthesizer(_ s: AVSpeechSynthesizer, didFinish u: AVSpeechUtterance) { done?.resume(); done = nil }
    func speechSynthesizer(_ s: AVSpeechSynthesizer, didCancel u: AVSpeechUtterance) { done?.resume(); done = nil }
}

struct HearWordIntent: AudioPlaybackIntent {
    static let title: LocalizedStringResource = "Hear the word"
    static let isDiscoverable = false
    @Parameter(title: "Course") var course: String
    @Parameter(title: "Text") var text: String
    init() {}
    init(course: String, text: String) { self.course = course; self.text = text }
    func perform() async throws -> some IntentResult {
        await WidgetVoice.shared.say(text, language: voiceLanguage[course] ?? "en-US")
        return .result()
    }
}

// MARK: Daily quiz

func dayKey(_ d: Date = Date()) -> String {
    let c = Calendar.current.dateComponents([.year, .month, .day], from: d)
    return "\(c.year!)-\(c.month!)-\(c.day!)"
}
/// The widget's own record of today's answer (0 or 1 = the option tapped), in the extension's defaults
enum QuizAnswers {
    static func key(_ course: String, _ day: String) -> String { "quiz.\(course).\(day)" }
    static func get(_ course: String, _ day: String) -> Int? { UserDefaults.standard.object(forKey: key(course, day)) as? Int }
    static func set(_ course: String, _ day: String, _ pick: Int) { UserDefaults.standard.set(pick, forKey: key(course, day)) }
}

struct QuizAnswerIntent: AppIntent {
    static let title: LocalizedStringResource = "Answer the daily quiz"
    static let isDiscoverable = false
    @Parameter(title: "Course") var course: String
    @Parameter(title: "Day") var day: String
    @Parameter(title: "Pick") var pick: Int
    init() {}
    init(course: String, day: String, pick: Int) { self.course = course; self.day = day; self.pick = pick }
    func perform() async throws -> some IntentResult {
        if QuizAnswers.get(course, day) == nil { QuizAnswers.set(course, day, pick) } // one answer a day
        return .result()
    }
}

struct QuizEntry: TimelineEntry {
    let date: Date
    let course: String
    let day: String
    let quiz: (word: Word, other: Word, rightFirst: Bool)?
    let answer: Int?
}

struct QuizProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> QuizEntry { entry(.zh) }
    func snapshot(for configuration: CourseConfig, in context: Context) async -> QuizEntry { entry(configuration.course) }
    func timeline(for configuration: CourseConfig, in context: Context) async -> Timeline<QuizEntry> {
        Timeline(entries: [entry(configuration.course)], policy: .after(nextMidnight()))
    }
    func entry(_ c: WidgetCourse) -> QuizEntry {
        let now = Date(), day = dayKey(now)
        return QuizEntry(date: now, course: c.rawValue, day: day, quiz: WordOfDay.quiz(course: c.rawValue, date: now), answer: QuizAnswers.get(c.rawValue, day))
    }
}

/// How an option is written: the reading for Chinese and Japanese (romanised first), the word itself elsewhere
func optionLabel(_ w: Word) -> String { w.course == "zh" ? w.py : w.course == "ja" ? (w.romaji ?? w.py) : w.hz }

struct QuizWidgetView: View {
    let e: QuizEntry
    var look: WidgetLook { .of(e.course) }
    var body: some View {
        Group {
            if let q = e.quiz {
                let options = q.rightFirst ? [q.word, q.other] : [q.other, q.word]
                let right = q.rightFirst ? 0 : 1
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Which means “\(q.word.en)”?").font(.system(size: 15, weight: .bold)).lineLimit(2)
                        Spacer(minLength: 4)
                        Text("1 a day").font(.system(size: 10, weight: .semibold)).foregroundStyle(look.muted)
                    }
                    HStack(spacing: 8) {
                        ForEach(0..<2, id: \.self) { i in option(options[i], i, right: right) }
                    }
                    if let a = e.answer {
                        Text(a == right ? "Right. Next question tomorrow." : "It’s \(optionLabel(q.word)). Next question tomorrow.")
                            .font(.system(size: 12)).foregroundStyle(look.muted).lineLimit(1).minimumScaleFactor(0.8)
                    } else {
                        Text(courseNames[e.course].map { "\($0.capitalized) · tap one" } ?? "").font(.system(size: 11)).foregroundStyle(look.muted)
                    }
                }
                .foregroundStyle(look.ink)
            } else { Text("—") }
        }
        .containerBackground(for: .widget) { look.bg }
    }
    @ViewBuilder func option(_ w: Word, _ i: Int, right: Int) -> some View {
        let picked = e.answer == i, shown = e.answer != nil
        let label = (shown && i == right ? "✓ " : picked ? "✕ " : "") + optionLabel(w)
        let shape = RoundedRectangle(cornerRadius: max(look.radius, 6))
        Button(intent: QuizAnswerIntent(course: e.course, day: e.day, pick: i)) {
            Text(label).font(e.course == "zh" || e.course == "vi" ? .system(size: 16, weight: .semibold) : look.word(17))
                .lineLimit(1).minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity, minHeight: 40)
                .foregroundStyle(shown && i == right ? look.buttonInk : look.ink)
                .background(shown && i == right ? look.button : Color.clear, in: shape)
                .overlay(shape.stroke(look.muted.opacity(shown && i != right && !picked ? 0.25 : 0.6), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

struct QuizWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "DailyQuiz", intent: CourseConfig.self, provider: QuizProvider()) { QuizWidgetView(e: $0) }
            .configurationDisplayName("Daily quiz")
            .description("One question a day, answered with a tap — no app opens.")
            .supportedFamilies([.systemMedium])
    }
}

// MARK: Progress

struct ProgressEntry: TimelineEntry {
    let date: Date
    let course: String
    let snapshot: WidgetSnapshot?
}

struct ProgressProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> ProgressEntry { ProgressEntry(date: Date(), course: "zh", snapshot: nil) }
    func snapshot(for configuration: CourseConfig, in context: Context) async -> ProgressEntry { entry(configuration.course) }
    func timeline(for configuration: CourseConfig, in context: Context) async -> Timeline<ProgressEntry> {
        Timeline(entries: [entry(configuration.course)], policy: .after(nextMidnight()))
    }
    func entry(_ c: WidgetCourse) -> ProgressEntry {
        ProgressEntry(date: Date(), course: c.rawValue, snapshot: WidgetSnapshot.read().flatMap { $0.course == c.rawValue && $0.day == todayKey(nowMs()) ? $0 : nil })
    }
}

/// Today's plan once the app shares it; until then a quiet placeholder — never a made-up number
struct ProgressWidgetView: View {
    let e: ProgressEntry
    @Environment(\.widgetFamily) var family
    var look: WidgetLook { .of(e.course) }
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(courseNames[e.course] ?? "") · TODAY").font(.system(size: 9, weight: .bold)).kerning(1).foregroundStyle(look.muted)
            Spacer(minLength: 0)
            if let s = e.snapshot {
                Text("\(s.streak)-day streak").font(.system(size: 13, weight: .semibold)).foregroundStyle(look.accent)
                Text("\(s.due)").font(look.word(34)) + Text(" due").font(.system(size: 14)).foregroundColor(look.muted)
                Text("Continue →").font(.system(size: 13, weight: .semibold))
            } else {
                Text("Open the app").font(look.word(family == .systemSmall ? 20 : 24))
                Text("to see today’s plan").font(.system(size: 13)).foregroundStyle(look.muted)
            }
        }
        .foregroundStyle(look.ink)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .widgetURL(URL(string: "trainer://learn"))
        .containerBackground(for: .widget) { look.bg }
    }
}

struct ProgressWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "Progress", intent: CourseConfig.self, provider: ProgressProvider()) { ProgressWidgetView(e: $0) }
            .configurationDisplayName("Today")
            .description("Today’s plan. Until the app can share its progress, this shows a quiet placeholder.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
