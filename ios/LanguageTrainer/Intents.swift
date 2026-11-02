import AppIntents
import Foundation
import SwiftUI
import LanguageCore

/* Siri and Shortcuts (round-3 canvas): "Quiz me" asks five two-option questions right in Siri (iOS 26),
 * "Word of the day" says today's word twice with an example, and
 * "Listening practice" opens the five-question listening round in the app. Siri's answers aren't counted as
 * reviews: the quiz runs outside the app's progress. */

enum CourseChoice: String, AppEnum {
    case zh, ja, ko, vi, de, es
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Course"
    static let caseDisplayRepresentations: [CourseChoice: DisplayRepresentation] = [
        .zh: "Chinese", .ja: "Japanese", .ko: "Korean", .vi: "Vietnamese", .de: "German", .es: "Spanish"
    ]
}

/// A route left by an intent for the app's root view to open (the app may still be starting)
@MainActor final class IntentRouter {
    static let shared = IntentRouter()
    static let notice = Notification.Name("IntentRouter.pending")
    private var pending: (course: String, route: String)?
    /// The next exercise screen starts at once with five words
    var quickStart = false
    func post(course: String, route: String) {
        pending = (course, route); quickStart = true
        NotificationCenter.default.post(name: Self.notice, object: nil)
    }
    func take() -> (course: String, route: String)? { defer { pending = nil }; return pending }
}

/// How Siri shows and says a word: the reading for Chinese and Japanese (romanised first), the word itself elsewhere
func siriLabel(_ w: Word) -> String { w.course == "zh" ? w.py : w.course == "ja" ? (w.romaji ?? w.py) : w.hz }

struct ListenIntent: AppIntent {
    static let title: LocalizedStringResource = "Listening practice"
    static let description = IntentDescription("Five listening questions with the words you are learning, in the app.")
    static let openAppWhenRun = true
    @Parameter(title: "Course", default: .zh) var course: CourseChoice
    init() {}
    init(course: CourseChoice) { self.course = course }
    @MainActor func perform() async throws -> some IntentResult {
        IntentRouter.shared.post(course: course.rawValue, route: "practice/mode/listen")
        return .result()
    }
}

struct QuizIntent: AppIntent {
    static let title: LocalizedStringResource = "Quiz me"
    static let description = IntentDescription("Five quick questions in Siri: pick the word for a meaning.")
    @Parameter(title: "Course", default: .zh) var course: CourseChoice
    func perform() async throws -> some IntentResult & ProvidesDialog {
        guard #available(iOS 26.0, *) else {
            return .result(dialog: "Quiz me in Siri needs iOS 26. Say “Listening practice” to practise in the app.")
        }
        var right = 0
        for n in 0..<5 {
            guard let q = WordOfDay.quiz(course: course.rawValue, n: n) else { break }
            let words = q.rightFirst ? [q.word, q.other] : [q.other, q.word]
            let options = words.map { IntentChoiceOption(title: LocalizedStringResource(stringLiteral: siriLabel($0))) }
            let dialog = IntentDialog(full: "Which means \(q.word.en)? \(siriLabel(words[0])), or \(siriLabel(words[1]))?",
                                      supporting: "Which means “\(q.word.en)”?")
            let picked = try await requestChoice(between: options, dialog: dialog, view: QuizSnippet(n: n, en: q.word.en))
            if picked == options[q.rightFirst ? 0 : 1] { right += 1 }
        }
        return .result(dialog: IntentDialog(stringLiteral: right == 5 ? "All five right." : "\(right) of 5 right."))
    }
}

struct QuizSnippet: View {
    let n: Int
    let en: String
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("“Quiz me” · \(n + 1) of 5").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
            Text("Which means “\(en)”?").font(.title3.weight(.bold))
            Text("Say “the first one” or tap").font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding()
    }
}

struct WordOfDayIntent: AppIntent {
    static let title: LocalizedStringResource = "Word of the day"
    static let description = IntentDescription("Today's word in your course, said twice with an example.")
    @Parameter(title: "Course", default: .zh) var course: CourseChoice
    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        guard let w = WordOfDay.pick(course: course.rawValue)?.word else { return .result(dialog: "No word today.", view: EmptyView()) }
        let say = siriLabel(w)
        let example = w.ex.map { ex in " " + ex + (w.exEn.map { " — \($0)" } ?? "") } ?? ""
        return .result(dialog: IntentDialog(full: "\(say). \(say). \(w.en).\(example)", supporting: "\(say): \(w.en)"),
                       view: WordSnippet(w: w))
    }
}

struct WordSnippet: View {
    let w: Word
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Word of the day").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
            Text(siriLabel(w)).font(.largeTitle.weight(.bold))
            Text(w.course == "zh" || w.course == "ja" ? "\(w.hz) · \(w.en)" : w.en).font(.headline)
            if let ex = w.ex {
                Text(([w.course == "zh" ? (w.exPy ?? ex) : ex] + [w.exEn].compactMap { $0 }).joined(separator: " · "))
                    .font(.subheadline).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding()
    }
}

struct TrainerShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: QuizIntent(), phrases: ["Quiz me in \(.applicationName)", "Quiz me on \(\.$course) in \(.applicationName)", "Start a \(.applicationName) quiz"],
                    shortTitle: "Quiz me", systemImageName: "questionmark.bubble")
        AppShortcut(intent: WordOfDayIntent(), phrases: ["\(.applicationName) word of the day", "Word of the day in \(.applicationName)", "What's the \(\.$course) word of the day in \(.applicationName)"],
                    shortTitle: "Word of the day", systemImageName: "character.book.closed")
        AppShortcut(intent: ListenIntent(), phrases: ["Listening practice in \(.applicationName)", "Practise listening to \(\.$course) in \(.applicationName)"],
                    shortTitle: "Listening practice", systemImageName: "ear")
    }
}
