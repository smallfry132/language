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
    public let themes: [Theme]      // topics of the course (empty when it has none)
    private let index: [String: Word]
    private let order: [String: Int] // position in the topics' learning order
    private let topicOf: [String: String]

    public init(state: AppState) {
        course = Course.byId(state.course)
        all = (Library.shared.words[course.id] ?? []) + state.customWords(course: course.id)
        let lv = state.courses[course.id]?.levels ?? [1]
        themes = Library.shared.themes[course.id] ?? []
        var order: [String: Int] = [:], topicOf: [String: String] = [:]
        for t in themes { for g in t.groups { for id in g.ids where order[id] == nil { order[id] = order.count; topicOf[id] = t.id } } }
        self.order = order; self.topicOf = topicOf
        // Words in learning order: by topic when the course has topics, own words after
        selected = all.filter { lv.contains($0.lvl) }.enumerated()
            .sorted { (order[$0.element.id] ?? Int.max - 100_000 + $0.offset) < (order[$1.element.id] ?? Int.max - 100_000 + $1.offset) }
            .map(\.element)
        index = Dictionary(all.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
    }
    public func word(_ id: String) -> Word? { index[id] ?? Library.shared.word(id) }
    public func picture(_ id: String) -> String? { Library.shared.pictures[id] }
    /// The topic a word belongs to
    public func theme(of id: String) -> Theme? { topicOf[id].flatMap { t in themes.first { $0.id == t } } }
    public func topicId(of id: String) -> String? { topicOf[id] }
    /// The words of a topic in its order, grouped, from the selected levels
    public func groups(of t: Theme) -> [(name: LocalText, words: [Word])] {
        let sel = Set(selected.map(\.id))
        return t.groups.map { g in (g.name, g.ids.filter { sel.contains($0) }.compactMap { index[$0] }) }.filter { !$0.words.isEmpty }
    }

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
        let due = all.filter { state.isDue($0.id, now: now) }.sorted { state.card($0.id)!.due < state.card($1.id)!.due }.prefix(state.settings.maxReviews ?? Self.reviewCap)
        let lw = lessonWords(state, newestFirst: true)
        let unseen = (lw.isEmpty ? selected : lw).filter { state.status($0.id) == .new }
        let room = max(0, state.settings.newPerDay + extraNew - introducedToday(state))
        return (Array(due), Array(unseen.prefix(room)), unseen.count)
    }
}

// MARK: Words that sound alike (choose the word)

extension CourseWords {
    /// How a word sounds without its tones: 茶 chá → cha, trà → tra, 차 cha → cha
    public static func soundKey(_ w: Word, course: String) -> String {
        switch course {
        case "zh": return Lingo.stripTones(w.py)
        case "vi": return Lingo.stripVi(w.hz).replacingOccurrences(of: " ", with: "")
        case "ja": return Lingo.stripJa(w.romaji ?? w.py)
        default: return Lingo.stripKo(w.py)
        }
    }
    static func distance(_ a: String, _ b: String) -> Int {
        let a = Array(a), b = Array(b)
        if a.isEmpty || b.isEmpty { return max(a.count, b.count) }
        var row = Array(0...b.count)
        for i in 1...a.count {
            var prev = row[0]; row[0] = i
            for j in 1...b.count {
                let cur = row[j]
                row[j] = min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] == b[j - 1] ? 0 : 1))
                prev = cur
            }
        }
        return row[b.count]
    }
    /// Up to `count` other words that sound most like `w` (same sound with another tone first), each with a
    /// different meaning and spelling. Words that sound nothing alike are left out; `fill` tops up from `selected`.
    public func soundAlikes(_ w: Word, count: Int = 3, meaning: (Word) -> String, fill: Bool = true) -> [Word] {
        let key = Self.soundKey(w, course: course.id), m = meaning(w)
        // Japanese options are shown in kana: two words that read the same (取る / 撮る) would look identical
        let face = { (x: Word) in self.course.id == "ja" ? (x.kana ?? x.hz) : x.hz }
        // Minimal pairs first (Japanese long vowel or small っ, Korean final consonant)
        var pairs: [Word] = [], seen0: Set<String> = [w.hz, face(w), m]
        for x in minimalPairs(w).shuffled() where pairs.count < count && !seen0.contains(face(x)) && !seen0.contains(meaning(x)) {
            pairs.append(x); seen0.insert(face(x)); seen0.insert(meaning(x))
        }
        if pairs.count >= count { return pairs }
        // Japanese has 8,000 words: stay within the levels being studied
        let pool = (course.id == "ja" || course.id == "ko") && selected.count > 200 ? selected : all
        // Close (one sound apart) first; if that finds too few, words that share about half their sound
        var limit = max(1, key.count / 3)
        let wide = max(2, (key.count + 1) / 2)
        var scored: [(Word, Int)] = []
        for x in pool where x.id != w.id && x.hz != w.hz && meaning(x) != m && !pairs.contains(x) {
            let k = Self.soundKey(x, course: course.id)
            guard abs(k.count - key.count) <= wide else { continue }
            let d = Self.distance(k, key)
            if d <= wide { scored.append((x, d * 10 + abs(x.hz.count - w.hz.count))) }
        }
        if scored.filter({ $0.1 < (limit + 1) * 10 }).count < count { limit = wide }
        scored = scored.filter { $0.1 < (limit + 1) * 10 }
        var out = pairs, seen = seen0
        for (x, _) in scored.shuffled().sorted(by: { $0.1 < $1.1 }) where out.count < count && !seen.contains(face(x)) && !seen.contains(meaning(x)) {
            out.append(x); seen.insert(face(x)); seen.insert(meaning(x))
        }
        if fill {
            for x in selected.shuffled() where out.count < count && x.id != w.id && !seen.contains(face(x)) && !seen.contains(meaning(x)) {
                out.append(x); seen.insert(face(x)); seen.insert(meaning(x))
            }
        }
        return out
    }
}

// MARK: Minimal pairs (Japanese long vowel / small っ, Korean final consonant)

extension Lingo {
    static let kanaVowel: [Character: Character] = {
        var m: [Character: Character] = [:]
        let rows: [(Character, String)] = [("a", "あかさたなはまやらわがざだばぱぁゃゎ"), ("i", "いきしちにひみりぎじぢびぴぃ"), ("u", "うくすつぬふむゆるぐずづぶぷぅゅ"), ("e", "えけせてねへめれげぜでべぺぇ"), ("o", "おこそとのほもよろをごぞどぼぽぉょ")]
        for (v, s) in rows { for c in s { m[c] = v } }
        return m
    }()
    /// Japanese kana without long vowels and small っ: おばあさん → おばさん, コーヒー → こひ, ようか / よっか → よか
    public static func jaShort(_ kana: String) -> String {
        var out = "", prev: Character? = nil
        for c in kataToHira(kana) where c != "ー" && c != "っ" {
            let same = (c == "あ" && prev == "a") || (c == "い" && (prev == "i" || prev == "e")) || (c == "う" && (prev == "u" || prev == "o"))
                || (c == "え" && prev == "e") || (c == "お" && prev == "o")
            if !same { out.append(c) }
            if let v = kanaVowel[c] { prev = v }
        }
        return out
    }
    /// Korean words of the same length that differ only in the final consonant of one syllable: 잔 · 장 · 자 · 잠
    public static func koFinalOnly(_ a: String, _ b: String) -> Bool {
        let x = Array(a), y = Array(b)
        guard x.count == y.count, a != b else { return false }
        var diff = 0
        for k in x.indices where x[k] != y[k] {
            guard let p = koJamo(x[k]), let q = koJamo(y[k]), p.i == q.i, p.v == q.v else { return false }
            diff += 1
        }
        return diff == 1
    }
}

/// What went wrong in a recognised attempt, where the language makes it clear
public enum HeardHint: Equatable, Sendable {
    case koFinalMissing(heard: String, final: String)  // 잔 said as 자
    case koFinalExtra(heard: String, final: String)    // 자 said as 잔
    case jaHold                                        // おばあさん heard as おばさん
}

extension Lingo {
    public static func heardHint(target: String, kana: String?, heard: String, course: String) -> HeardHint? {
        if course == "ko" {
            let hangul = { (s: String) in Array(s.filter { ("\u{AC00}"..."\u{D7A3}").contains($0) }) }
            let want = hangul(target), got = hangul(heard)
            for k in 0..<min(want.count, got.count) {
                guard let a = koJamo(want[k]), let b = koJamo(got[k]), a.i == b.i, a.v == b.v, a.f != b.f else { continue }
                return a.f.isEmpty ? .koFinalExtra(heard: String(got[k]), final: b.f) : .koFinalMissing(heard: String(got[k]), final: a.f)
            }
        }
        if course == "ja", let kana {
            let h = kataToHira(heard.filter { !"。、！？ ".contains($0) })
            if h != kataToHira(kana) && jaShort(h) == jaShort(kana) { return .jaHold }
        }
        return nil
    }
}

extension CourseWords {
    /// Words that differ from `w` by one long vowel or small っ (Japanese) or one final consonant (Korean)
    public func minimalPairs(_ w: Word) -> [Word] {
        switch course.id {
        case "ja":
            guard let kana = w.kana else { return [] }
            let k = Lingo.jaShort(kana)
            guard k.count > 1 else { return [] }
            var seen = Set<String>(), out: [Word] = []
            for x in selected + all.filter({ $0.lvl <= 2 }) where x.id != w.id && !seen.contains(x.id) {
                guard let xk = x.kana, xk != kana, Lingo.jaShort(xk) == k else { continue }
                seen.insert(x.id); out.append(x)
            }
            return out
        case "ko": return all.filter { $0.id != w.id && Lingo.koFinalOnly($0.hz, w.hz) }
        default: return []
        }
    }
    /// The ids of the words in `pool` that have at least one minimal pair (one pass, grouped by key)
    public func idsWithMinimalPairs(_ pool: [Word]) -> Set<String> {
        switch course.id {
        case "ja":
            var byKey: [String: Set<String>] = [:] // key → the kana spellings that share it
            var seen = Set<String>()
            for x in selected + all.filter({ $0.lvl <= 2 }) where seen.insert(x.id).inserted {
                if let k = x.kana { byKey[Lingo.jaShort(k), default: []].insert(k) }
            }
            return Set(pool.filter { w in
                guard let k = w.kana else { return false }
                let key = Lingo.jaShort(k)
                return key.count > 1 && (byKey[key]?.count ?? 0) > 1
            }.map(\.id))
        case "ko":
            // Words with their finals taken off: only those in the same group can differ in one final
            func bare(_ s: String) -> String { String(s.map { c in Lingo.koJamo(c).map { "\($0.i)\($0.v)" } ?? String(c) }.joined()) }
            let groups = Dictionary(grouping: all, by: { bare($0.hz) })
            return Set(pool.filter { w in (groups[bare(w.hz)] ?? []).contains { Lingo.koFinalOnly($0.hz, w.hz) } }.map(\.id))
        default: return []
        }
    }
    /// "long" or "final" when `x` is a minimal pair of `w`
    public func pairKind(_ w: Word, _ x: Word) -> String? {
        guard x.id != w.id else { return nil }
        if course.id == "ja", let a = w.kana, let b = x.kana, Lingo.jaShort(a) == Lingo.jaShort(b) { return "long" }
        if course.id == "ko", Lingo.koFinalOnly(w.hz, x.hz) { return "final" }
        return nil
    }
}
