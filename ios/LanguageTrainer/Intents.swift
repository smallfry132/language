import AppIntents
import Foundation
import LanguageCore

/* Siri and Shortcuts (round-2 canvas): "Quiz me on Chinese" opens a five-question listening round;
 * "Word of the day" answers with today's word without opening the app. */

enum CourseChoice: String, AppEnum {
    case zh, ja, ko, vi
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Course"
    static let caseDisplayRepresentations: [CourseChoice: DisplayRepresentation] = [
        .zh: "Chinese", .ja: "Japanese", .ko: "Korean", .vi: "Vietnamese"
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

struct QuizIntent: AppIntent {
    static let title: LocalizedStringResource = "Quiz me"
    static let description = IntentDescription("Five listening questions with the words you are learning.")
    static let openAppWhenRun = true
    @Parameter(title: "Course", default: .zh) var course: CourseChoice
    @MainActor func perform() async throws -> some IntentResult {
        IntentRouter.shared.post(course: course.rawValue, route: "practice/mode/listen")
        return .result()
    }
}

struct WordOfDayIntent: AppIntent {
    static let title: LocalizedStringResource = "Word of the day"
    static let description = IntentDescription("Today's word in your course, read out with its meaning.")
    @Parameter(title: "Course", default: .zh) var course: CourseChoice
    func perform() async throws -> some IntentResult & ProvidesDialog {
        guard let p = WordOfDay.pick(course: course.rawValue) else { return .result(dialog: "No word today.") }
        let w = p.word
        let reading = course == .vi || w.py == w.hz ? "" : " — \(course == .ja ? (w.romaji ?? w.py) : w.py)"
        return .result(dialog: IntentDialog(stringLiteral: "\(w.hz)\(reading): \(w.en)"))
    }
}

struct TrainerShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: QuizIntent(), phrases: ["Quiz me in \(.applicationName)", "Quiz me on \(\.$course) in \(.applicationName)", "Start a \(.applicationName) quiz"],
                    shortTitle: "Quiz me", systemImageName: "questionmark.bubble")
        AppShortcut(intent: WordOfDayIntent(), phrases: ["\(.applicationName) word of the day", "Word of the day in \(.applicationName)", "What's the \(\.$course) word of the day in \(.applicationName)"],
                    shortTitle: "Word of the day", systemImageName: "character.book.closed")
    }
}
