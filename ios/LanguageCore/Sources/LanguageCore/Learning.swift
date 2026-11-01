import Foundation

/* Spaced repetition (SM-2 style), today's plan and answer statistics — the web app's rules. */

public enum WordStatus: String { case new, learning, known }

extension AppState {
    public func card(_ id: String) -> Card? { guard let c = srs[id], c.gone == nil else { return nil }; return c }
    public func status(_ id: String) -> WordStatus {
        guard let c = card(id) else { return .new }
        return c.interval >= 21 ? .known : .learning
    }
    public func isDue(_ id: String, now: Double = nowMs()) -> Bool { (card(id)?.due ?? .infinity) <= now }

    /// q: 0 again, 1 hard, 2 good, 3 easy
    public mutating func grade(_ id: String, _ q: Int, now: Double = nowMs()) {
        var c = card(id) ?? Card()
        c.t = nil; c.gone = nil
        let today = todayKey(now)
        if c.first == nil { c.first = today }
        // Only the first success of a day schedules the word (a guided session tests it several times);
        // a miss clears that, so the next success reschedules it
        if q > 0 && c.ok == today { return }
        if q == 0 {
            c.ok = nil
            c.reps = 0; c.lapses += 1; c.interval = 0; c.ef = max(1.3, c.ef - 0.2); c.due = now + 10 * 60 * 1000
        } else {
            if c.reps == 0 { c.interval = q == 1 ? 0.5 : q == 2 ? 1 : 3 }
            else if c.reps == 1 { c.interval = q == 1 ? 1 : q == 2 ? 3 : 7 }
            else { c.interval = (c.interval * (q == 1 ? 1.2 : q == 2 ? c.ef : c.ef * 1.4) * 10).rounded() / 10 }
            c.ef = max(1.3, min(3.0, c.ef + (q == 3 ? 0.15 : q == 1 ? -0.15 : 0)))
            c.reps += 1
            c.due = now + c.interval * DAY
            c.ok = today
        }
        srs[id] = c
    }
    /// The interval a rating would give, for the flashcard buttons
    public func nextInterval(_ id: String, _ q: Int) -> String {
        let c = card(id) ?? Card()
        let iv: Double
        if c.reps == 0 { iv = q == 1 ? 0.5 : q == 2 ? 1 : 3 }
        else if c.reps == 1 { iv = q == 1 ? 1 : q == 2 ? 3 : 7 }
        else { iv = (c.interval * (q == 1 ? 1.2 : q == 2 ? c.ef : c.ef * 1.4)).rounded() }
        if iv < 1 { return "12 h" }
        if iv >= 30 { return "\(Int((iv / 30).rounded())) mo" }
        return "\(Int(iv.rounded())) d"
    }
    public mutating func markKnown(_ id: String, now: Double = nowMs()) {
        var c = Card(); c.interval = 30; c.reps = 3; c.due = now + 30 * DAY; srs[id] = c
    }
    public mutating func markLearning(_ id: String, now: Double = nowMs()) {
        var c = Card(); c.due = now; c.first = todayKey(now); srs[id] = c
    }
    public mutating func resetWord(_ id: String) { srs[id] = nil }

    public mutating func recordAnswer(_ correct: Bool, now: Double = nowMs()) {
        stats.answered += 1
        if correct { stats.correct += 1 }
        stats.days[todayKey(now), default: 0] += 1
    }
    /// This device's counts plus those the other synced devices reported
    var allStats: [Stats] { [stats] + Array(peers.values) }
    public func dayCount(_ key: String) -> Int { allStats.reduce(0) { $0 + ($1.days[key] ?? 0) } }
    public var answeredTotal: Int { allStats.reduce(0) { $0 + $1.answered } }
    public var correctTotal: Int { allStats.reduce(0) { $0 + $1.correct } }
    public func streak(now: Date = Date()) -> Int {
        var n = 0
        var d = now
        let cal = Calendar.current
        if dayCount(todayKey(d.timeIntervalSince1970 * 1000)) == 0 { d = cal.date(byAdding: .day, value: -1, to: d)! }
        while dayCount(todayKey(d.timeIntervalSince1970 * 1000)) > 0 { n += 1; d = cal.date(byAdding: .day, value: -1, to: d)! }
        return n
    }

    // MARK: Lessons and own words

    /// Lessons of a course, oldest first
    public func lessons(course: String) -> [(id: String, lesson: Lesson)] {
        lessons.filter { $0.value.gone == nil && $0.value.course == course }
            .map { ($0.key, $0.value) }.sorted { $0.1.created < $1.1.created }
    }
    public func customWords(course: String) -> [Word] {
        custom.filter { $0.value.gone == nil && $0.value.course == course }.sorted { ($0.value.t ?? 0) < ($1.value.t ?? 0) }
            .map { Word(id: $0.key, hz: $0.value.hz.isEmpty ? $0.value.py : $0.value.hz, py: $0.value.py, en: $0.value.en, cat: "custom", lvl: 1, course: course) }
    }
    public mutating func toggleLessonWord(_ lid: String, _ id: String) {
        guard var l = lessons[lid], l.gone == nil else { return }
        if l.words.contains(WordRef(id)) { l.words.removeAll { $0.id == id } } else { l.words.append(WordRef(id)) }
        lessons[lid] = l
    }

    public func dialogue(_ id: String) -> DialogueProgress { guard let d = dlg[id], d.gone == nil else { return DialogueProgress() }; return d }
    public func dialogueDone(_ id: String) -> Bool { let d = dialogue(id); return d.listen != nil && d.read != nil && d.turn != nil }

    public func pinyinFirst(course: String) -> Bool { course == "zh" && courses["zh"]?.pinyinFirst != false }
}

public func newId(_ prefix: String) -> String {
    let t = String(Int(nowMs()), radix: 36)
    let r = String(UInt32.random(in: 0..<UInt32.max), radix: 36).prefix(4)
    return prefix + t + r
}

/// Words of the current course with the learner's own words, and today's plan
public struct CourseWords {
    public let course: Course
    public let all: [Word]          // built-in + own words
    public let selected: [Word]     // in the selected levels
    private let index: [String: Word]

    public init(state: AppState) {
        course = Course.byId(state.course)
        all = (Library.shared.words[course.id] ?? []) + state.customWords(course: course.id)
        let lv = state.courses[course.id]?.levels ?? [1]
        selected = all.filter { lv.contains($0.lvl) }
        index = Dictionary(all.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
    }
    public func word(_ id: String) -> Word? { index[id] ?? Library.shared.word(id) }

    /// The words of all lessons, each once; newest lesson first when picking new words
    public func lessonWords(_ state: AppState, newestFirst: Bool = false) -> [Word] {
        var seen = Set<String>(), out: [Word] = []
        let ls = state.lessons(course: course.id)
        for l in newestFirst ? ls.reversed() : ls {
            for r in l.lesson.words where !seen.contains(r.id) { if let w = word(r.id) { seen.insert(r.id); out.append(w) } }
        }
        return out
    }

    public static let reviewCap = 20
    public func introducedToday(_ state: AppState) -> Int {
        let today = todayKey()
        return all.filter { state.card($0.id)?.first == today }.count
    }
    /// Due reviews (most overdue first) plus a few new words, from the lessons when there are any
    public func planToday(_ state: AppState, extraNew: Int) -> (due: [Word], fresh: [Word], unseen: Int) {
        let now = nowMs()
        let due = all.filter { state.isDue($0.id, now: now) }.sorted { state.card($0.id)!.due < state.card($1.id)!.due }.prefix(Self.reviewCap)
        let lw = lessonWords(state, newestFirst: true)
        let unseen = (lw.isEmpty ? selected : lw).filter { state.status($0.id) == .new }
        let room = max(0, state.settings.newPerDay + extraNew - introducedToday(state))
        return (Array(due), Array(unseen.prefix(room)), unseen.count)
    }
}
