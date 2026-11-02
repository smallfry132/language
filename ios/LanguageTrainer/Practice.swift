import SwiftUI
import LanguageCore

/* Practice: grouped by the skills the tutors ask for. Each mode starts right away; the word choice
 * is folded into "Adjust". Results lead back here; in a guided session they lead to the next step. */

enum Mode: String, CaseIterable, Hashable {
    case flash, quiz, type, typer, listen, match, tones, numbers, say, picture, listenPic, choose, trace
    var key: String {
        switch self {
        case .flash: "modeFlash"; case .quiz: "modeQuiz"; case .type: "modeType"; case .typer: "modeTyper"; case .listen: "modeListen"
        case .match: "modeMatch"; case .tones: "modeTones"; case .numbers: "modeNumbers"; case .say: "modeSay"
        case .picture: "modePicture"; case .listenPic: "modeListenPic"; case .choose: "modeChoose"; case .trace: "modeTrace"
        }
    }
}

enum Route: Hashable {
    case mode(Mode)
    case today
    case lesson(String)
    case lessonPractice(String)
    case dialogue(String)
    case dialogues
    case dialogueTurn(String)
    case myLessons
    case sounds
    case soundDrill
    case progress
}

/// Practice (round 2): Listen · Speak · Read · Write, each with its word in the language and a note; rows with a short
/// hint, what is waiting (due words, best speed, dialogues done) and NEW for the newest modes
struct PracticeHome: View {
    @Environment(Store.self) var store
    struct Row { let route: Route; let key: String; let sub: String; var isNew = false }
    static let skillWord: [String: [(String, String)]] = [
        "zh": [("tīng", "听"), ("shuō", "说"), ("dú", "读"), ("xiě", "写")], "vi": [("Nghe", ""), ("Nói", ""), ("Đọc", ""), ("Viết", "")],
        "ja": [("kiku", "聞く"), ("hanasu", "話す"), ("yomu", "読む"), ("kaku", "書く")], "ko": [("deutgi", "듣기"), ("malhagi", "말하기"), ("ilkgi", "읽기"), ("sseugi", "쓰기")]
    ]
    var skills: [(id: String, rows: [Row])] {
        let c = store.course, pics = store.words.selected.contains { store.words.picture($0.id) != nil }, dl = store.dialogues
        let free = dl.randomElement().map { Route.dialogueTurn($0.id) }
        let all: [(String, [Row?])] = [
            ("listen", [Row(route: .mode(.listen), key: "modeListen", sub: "listen"), pics ? Row(route: .mode(.listenPic), key: "modeListenPic", sub: "listenPic") : nil,
                        c.toneOptions != nil ? Row(route: .mode(.tones), key: "modeTones", sub: "tones") : nil, Row(route: .soundDrill, key: "soundDrill", sub: "soundDrill")]),
            ("speak", [Row(route: .mode(.say), key: "modeSay", sub: "say"), dl.isEmpty ? nil : Row(route: .dialogues, key: "dialogues", sub: "dialogues"),
                       free.map { Row(route: $0, key: "modeFree", sub: "freePlay", isNew: true) }, Row(route: .sounds, key: "soundChart", sub: "soundChart")]),
            ("read", [Row(route: .mode(.choose), key: "modeChoose", sub: "choose"), pics ? Row(route: .mode(.picture), key: "modePicture", sub: "picture") : nil,
                      Row(route: .mode(.flash), key: "modeFlash", sub: "flash"), Row(route: .mode(.quiz), key: "modeQuiz", sub: "quiz"), Row(route: .mode(.match), key: "modeMatch", sub: "match")]),
            ("write", [Row(route: .mode(.type), key: "modeType", sub: "type"), c.id == "ja" ? nil : Row(route: .mode(.typer), key: "modeTyper", sub: "typer"), Row(route: .mode(.numbers), key: "modeNumbers", sub: "numbers"), c.id == "zh" ? Row(route: .mode(.trace), key: "modeTrace", sub: "trace", isNew: true) : nil])
        ]
        return all.map { ($0.0, $0.1.compactMap { $0 }) }.filter { !$0.1.isEmpty }
    }
    func meta(_ r: Route, due: Int) -> String {
        switch r {
        case .mode(.listen), .mode(.flash): return due > 0 ? store.t("nDue", due) : ""
        case .mode(.typer): if let b = store.state.typer?[store.course.id], b > 0 { return store.t("bestWpm", b) }; return ""
        case .dialogues: return "\(store.dialogues.filter { store.state.dialogue($0.id).done }.count) / \(store.dialogues.count)"
        default: return ""
        }
    }
    @ViewBuilder func word(_ k: Int) -> some View {
        let w = Self.skillWord[store.course.id]?[k] ?? ("", "")
        if store.course.id == "zh" { if store.pyFirst { PinyinText(py: w.0, size: 14, weight: .bold) } else { Text(w.1).hanziFont(15) } }
        else { Text(w.1.isEmpty ? w.0 : w.1).hanziFont(14, .semibold).foregroundStyle(Color.ink2) }
    }
    var body: some View {
        let due = store.words.selected.filter { store.state.isDue($0.id) }.count
        let pw: (String, String) = ["zh": ("Liànxí", "练习"), "vi": ("Luyện tập", ""), "ja": ("Renshū", "練習"), "ko": ("Yeonseup", "연습")][store.course.id] ?? ("", "")
        Page {
            VStack(alignment: .leading, spacing: 2) {
                CapsLabel(text: store.t("practiceEyebrow"))
                HStack(alignment: .firstTextBaseline) {
                    if store.course.id == "zh" { PinyinText(py: pw.0, size: 26, weight: .bold); Text(pw.1).hanziFont(18).foregroundStyle(Color.ink2) }
                    else { Text(pw.1.isEmpty ? pw.0 : pw.1).hanziFont(26, .bold) }
                    Spacer()
                    if store.course.id == "vi" {
                        let south = store.state.settings.viAccent == "s"
                        Button { store.update { $0.settings.viAccent = south ? "n" : "s" } } label: {
                            Text("\(store.t("accentLabel")) · \(store.t(south ? "accentS" : "accentN"))").font(.caption.weight(.semibold))
                                .padding(.horizontal, 12).frame(height: 34).background(Color.elevated, in: Capsule()).overlay(Capsule().stroke(Color.line))
                        }.buttonStyle(.plain).foregroundStyle(Color.ink)
                    }
                }
            }
            ForEach(Array(skills.enumerated()), id: \.element.id) { _, sk in
                let k = ["listen", "speak", "read", "write"].firstIndex(of: sk.id) ?? 0
                VStack(spacing: 0) {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(store.t("skill_" + sk.id)).font(.headline)
                        word(k)
                        Spacer()
                        Text(store.t("skillNote_" + sk.id)).font(.caption).foregroundStyle(Color.ink2)
                    }.padding(.bottom, 6)
                    Rectangle().fill(store.course.id == "vi" ? Color.line : Color.ink).frame(height: 2)
                    ForEach(Array(sk.rows.enumerated()), id: \.offset) { _, r in
                        NavigationLink(value: r.route) {
                            HStack(spacing: 10) {
                                VStack(alignment: .leading, spacing: 1) {
                                    HStack(spacing: 6) { Text(store.t(r.key)).font(.body.weight(.medium)).foregroundStyle(Color.ink); if r.isNew { NewBadge() } }
                                    Text(store.t("sub_" + r.sub)).font(.caption).foregroundStyle(Color.ink2).multilineTextAlignment(.leading)
                                }
                                Spacer(minLength: 8)
                                Text(meta(r.route, due: due)).font(.caption).foregroundStyle(Color.ink2)
                                Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Color.ink2)
                            }.padding(.vertical, 9).frame(minHeight: 52).contentShape(Rectangle())
                        }.buttonStyle(.plain)
                        Rectangle().fill(Color.line).frame(height: 1)
                    }
                }.padding(.top, 14)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct ListRow: View {
    let title: String
    var sub: String?
    var icon: String?
    var trailing: String?
    var body: some View {
        HStack(spacing: 12) {
            if let icon { Image(systemName: icon).foregroundStyle(Color.ink2).frame(width: 26) }
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.body.weight(.medium)).foregroundStyle(Color.ink)
                if let sub { Text(sub).font(.footnote).foregroundStyle(Color.ink2).multilineTextAlignment(.leading) }
            }
            Spacer(minLength: 8)
            if let trailing { Text(trailing).font(.footnote).foregroundStyle(Color.ink3) }
            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.ink3)
        }
        .padding(.horizontal, 16).padding(.vertical, 13).contentShape(Rectangle())
    }
}

/// Builds the exercise for a mode
/// Launch arguments for screenshots and testing
enum Launch {
    static func has(_ a: String) -> Bool { ProcessInfo.processInfo.arguments.contains(a) }
    static func value(_ a: String) -> String? {
        let args = ProcessInfo.processInfo.arguments
        guard let k = args.firstIndex(of: a), k + 1 < args.count else { return nil }
        return args[k + 1]
    }
}

@MainActor @ViewBuilder
func exercise(_ mode: Mode, _ list: [Word], direction: QuizDirection = .hzTr, done: @escaping (SessionResult) -> Void) -> some View {
    switch mode {
    case .flash: Flashcards(words: list, done: done)
    case .quiz: ChoiceQuiz(list: list, direction: direction, done: done)
    case .listen: ChoiceQuiz(list: list, direction: .listen, done: done)
    case .picture: ChoiceQuiz(list: list, direction: .picWord, done: done)
    case .listenPic: ChoiceQuiz(list: list, direction: .listenPic, done: done)
    case .type: TypeWord(list: list, done: done)
    case .say: SayWord(list: list, done: done)
    case .match: MatchGame(pairs: list, done: done)
    case .tones: ToneDrill(list: list, done: done)
    case .numbers: NumberDrill(done: done)
    case .typer: TyperRun(list: list, done: done)
    case .choose: ChooseWord(list: list, done: done)
    case .trace: TraceRun(list: list, done: done)
    }
}

struct PracticeScreen: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let mode: Mode
    enum Phase { case setup, run(UUID, [Word]), result(SessionResult) }
    @State private var phase = Phase.setup
    @State private var prefs = SetupPrefs.shared
    @State private var started = Date()

    var body: some View {
        Group {
            switch phase {
            case .setup:
                if [.match, .tones, .numbers, .trace].contains(mode) { Color.paper.onAppear { begin() } }
                else { SetupView(mode: mode, prefs: prefs) { begin() }.onAppear {
                    if Launch.has("-autostart") { begin() }
                    else if IntentRouter.shared.quickStart { IntentRouter.shared.quickStart = false; prefs.count = 5; prefs.mins = 0; prefs.pools = ["due"]; begin() }
                    if Launch.has("-result") { // screenshots: a finished round with three mistakes
                        let ws = Array(store.words.selected.prefix(10)), wrong = Array(ws.suffix(3))
                        store.marks = ws.map { !wrong.contains($0) }
                        phase = .result(SessionResult(correct: 7, total: 10, mistakes: wrong, why: Dictionary(uniqueKeysWithValues: wrong.map { ($0.id, store.t("whyPicked", store.tr(ws[0]))) })))
                    }
                } }
            case .run(let id, let list):
                exercise(mode, list, direction: prefs.direction) { phase = .result($0) }.id(id)
            case .result(let r):
                ResultView(result: r, mode: mode, seconds: Int(Date().timeIntervalSince(started)), retry: r.mistakes.isEmpty || [.match, .tones, .numbers, .typer].contains(mode) ? nil : { run(r.mistakes.shuffled()) }, again: { begin() }, back: { dismiss() })
            }
        }
        .navigationTitle(store.t(mode.key))
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.paper)
    }
    func begin() {
        var list: [Word]
        switch mode {
        case .match: list = Array(store.words.selected.filter { !store.tr($0).contains("(") }.shuffled().prefix(6))
        case .tones:
            let pool = store.course.id == "zh" ? store.words.selected.filter { $0.hz.count == 1 && Lingo.firstTone($0.py, course: "zh") != 5 } : store.words.selected.filter { !$0.hz.contains(" ") }
            list = Array(pool.shuffled().prefix(10))
        case .numbers: list = []
        case .trace: // lesson words first, then words you have met (Trace characters)
            let ok = { (w: Word) in Strokes.shared.covers(w.hz) }
            let lw = store.words.lessonWords(store.state, newestFirst: true).filter(ok)
            list = Array((lw.isEmpty ? store.words.selected.filter(ok).sorted { (store.status($0.id) == .new ? 1 : 0) < (store.status($1.id) == .new ? 1 : 0) } : lw).prefix(6))
        default:
            var pool = prefs.pool(store)
            if [.picture, .listenPic].contains(mode) { pool = pool.filter { store.words.picture($0.id) != nil } }
            let take = prefs.take(mode, available: pool.count)
            // Japanese and Korean: words that have a minimal pair come first in Choose the word
            if mode == .choose && ["ja", "ko"].contains(store.course.id) {
                let ids = store.words.idsWithMinimalPairs(pool), paired = pool.filter { ids.contains($0.id) }
                list = Array((paired.shuffled() + pool.filter { !ids.contains($0.id) }).prefix(take))
            } else {
                list = prefs.pools == ["due"] ? Array(pool.prefix(take)) : Array(pool.shuffled().prefix(take))
            }
        }
        if mode == .typer { list = Array(store.words.selected.shuffled().prefix(prefs.count == SetupPrefs.all ? 20 : prefs.count)) }
        if list.isEmpty && mode != .numbers { phase = .setup; return }
        run(list)
    }
    func run(_ list: [Word]) { store.marks = []; started = Date(); phase = .run(UUID(), list) }
}

@Observable @MainActor
final class SetupPrefs {
    static let shared = SetupPrefs()
    static let all = 9999
    /// Which words: several at once (due, lessons, learning, favourites) or all
    var pools: [String] = ["due"]
    var cat = "all"
    var count = 20
    /// Round length by time (5, 10, 15 minutes); 0 = by count
    var mins = 0
    var direction = QuizDirection.hzTr
    var typerContent = "mixed"
    /// Rough seconds per item, for "≈ N min" and rounds by time
    static func secs(_ m: Mode) -> Int {
        switch m { case .flash: 10; case .type: 15; case .say: 20; case .choose: 12; default: 8 }
    }
    func take(_ m: Mode, available n: Int) -> Int {
        min(n, mins > 0 ? max(1, Int((Double(mins * 60) / Double(Self.secs(m))).rounded())) : count)
    }
    func pool(_ store: Store) -> [Word] {
        let base = store.words.selected
        let topic = { (l: [Word]) in self.cat == "all" ? l : self.inTopic(l, store) }
        func one(_ p: String) -> [Word] {
            let list = topic(base)
            switch p {
            case "due":
                let due = list.filter { store.state.isDue($0.id) }, fresh = list.filter { store.status($0.id) == .new }
                return due + fresh.shuffled()
            case "lessons": return topic(store.words.lessonWords(store.state))
            case "favs": return list.filter { store.state.favs.contains(WordRef($0.id)) }
            case "learning": return list.filter { store.status($0.id) == .learning }
            default: return list
            }
        }
        var seen = Set<String>(), out: [Word] = []
        for p in (pools.contains("all") ? ["all"] : pools) { for w in one(p) where seen.insert(w.id).inserted { out.append(w) } }
        if out.isEmpty && pools.contains("due") { return topic(base) }
        return out
    }
    /// The words of the chosen topic (or category, for courses without topics)
    func inTopic(_ l: [Word], _ store: Store) -> [Word] {
        guard store.words.themes.contains(where: { $0.id == cat }) else { return l.filter { $0.cat == cat } }
        return l.filter { store.words.topicId(of: $0.id) == cat }
    }
}

/// Exercise setup (round 2): the chip rows always open, How many or By time, direction as segments,
/// and a bar at the bottom with the matching words, the round and Start
struct SetupView: View {
    @Environment(Store.self) var store
    let mode: Mode
    @Bindable var prefs: SetupPrefs
    let start: () -> Void
    @State private var allTopics = false

    var counts: [Int] { mode == .flash ? [10, 20, 40] : mode == .say ? [5, 10, 20] : [10, 20, 30] }
    var available: Int {
        let p = prefs.pool(store)
        return [.picture, .listenPic].contains(mode) ? p.filter { store.words.picture($0.id) != nil }.count : p.count
    }
    var skill: String? { ["listen": [Mode.listen, .listenPic, .tones], "speak": [.say], "read": [.choose, .picture, .flash, .quiz, .match], "write": [.type, .typer, .numbers]].first { $0.value.contains(mode) }?.key }

    var body: some View {
        let n = available, take = prefs.take(mode, available: n)
        let mins = max(1, Int((Double(take * SetupPrefs.secs(mode)) / 60).rounded()))
        Page {
            Text((skill.map { store.t("skill_" + $0) + " · " } ?? "") + store.t("setUpRound")).font(.footnote).foregroundStyle(Color.ink2)
            section("levels") { LevelChips() }
            if mode == .typer {
                section("typerContent") {
                    WrapLayout(spacing: 6) { ForEach(["words", "sentences", "mixed"], id: \.self) { k in ChipButton(label: store.t("typer" + k.capitalized), active: prefs.typerContent == k) { prefs.typerContent = k } } }
                }
                if let best = store.state.typer?[store.course.id], best > 0 { Text("\(store.t("typerBest")): \(best) \(store.t("wpm"))").font(.footnote).foregroundStyle(Color.ink2) }
            } else {
                section("whichWords") {
                    let due = store.words.selected.filter { store.state.isDue($0.id) }.count
                    let pools = [("due", store.t("dueWords") + (due > 0 ? " · \(due)" : ""))] + (store.words.lessonWords(store.state).isEmpty ? [] : [("lessons", store.t("lessonsPool"))])
                        + [("all", store.t("allWords")), ("learning", store.t("learningOnly")), ("favs", store.t("favsOnly"))]
                    WrapLayout(spacing: 6) {
                        ForEach(pools, id: \.0) { k, l in ChipButton(label: l, active: prefs.pools.contains(k)) { togglePool(k) } }
                    }
                }
                section(store.words.themes.isEmpty ? "category" : "topics") { topics }
            }
            section("howMany") {
                SegBar(options: counts.map { ("\($0)", "\($0)") } + [("\(SetupPrefs.all)", store.t("allN", n))], selected: prefs.mins == 0 ? "\(prefs.count)" : nil) { prefs.count = Int($0) ?? 10; prefs.mins = 0 }
                if mode != .typer {
                    HStack(spacing: 6) {
                        Text(store.t("orByTime")).font(.footnote).foregroundStyle(Color.ink2)
                        NewBadge()
                        ForEach([5, 10, 15], id: \.self) { m in
                            Button("\(m)") { prefs.mins = prefs.mins == m ? 0 : m }.font(.footnote.weight(prefs.mins == m ? .heavy : .regular))
                                .underline(prefs.mins == m).foregroundStyle(prefs.mins == m ? Color.ink : Color.ink2).frame(minWidth: 30, minHeight: 36)
                        }
                        Text(store.t("minShort")).font(.footnote).foregroundStyle(Color.ink2)
                    }
                }
            }
            if mode == .quiz {
                let dirs: [QuizDirection] = store.pyFirst ? [.hzTr, .trHz] : [.hzTr, .trHz, .hzPy, .pyHz]
                section("direction") {
                    SegBar(options: dirs.map { ($0.rawValue, store.t("dir" + $0.rawValue.prefix(1).uppercased() + $0.rawValue.dropFirst())) }, selected: prefs.direction.rawValue) { prefs.direction = QuizDirection(rawValue: $0) ?? .hzTr }
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 1) {
                    Text(store.t("wordsMatch", n)).font(.subheadline.weight(.bold))
                    if mode != .typer { Text(store.t("perRound", take, mins)).font(.caption).foregroundStyle(Color.ink2) }
                }
                Spacer()
                Button(store.t("start"), action: start).buttonStyle(.primary).frame(width: 130).accessibilityIdentifier("Start")
                    .disabled(mode != .typer && n < ([.flash, .type, .say].contains(mode) ? 1 : 4))
            }
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Color.elevated.ignoresSafeArea(edges: .bottom))
            .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
        }
        .onAppear {
            if !counts.contains(prefs.count) && prefs.count != SetupPrefs.all { prefs.count = counts[1] }
            if store.words.lessonWords(store.state).isEmpty { prefs.pools.removeAll { $0 == "lessons" }; if prefs.pools.isEmpty { prefs.pools = ["due"] } }
            if store.pyFirst && [.hzPy, .pyHz].contains(prefs.direction) { prefs.direction = .hzTr }
        }
    }
    @ViewBuilder var topics: some View {
        let opts: [(String, String)] = store.words.themes.isEmpty
            ? Library.shared.categoryOrder.filter { c in store.words.selected.contains { $0.cat == c } }.map { ($0, store.catName($0)) }
            : store.words.themes.map { ($0.id, $0.name.get(store.state.lang)) }
        let shown = allTopics || opts.prefix(6).contains(where: { $0.0 == prefs.cat }) == false && prefs.cat != "all" ? opts : Array(opts.prefix(6))
        WrapLayout(spacing: 6) {
            ChipButton(label: store.t("all"), active: prefs.cat == "all") { prefs.cat = "all" }
            ForEach(shown, id: \.0) { k, l in ChipButton(label: l, active: prefs.cat == k) { prefs.cat = k } }
            if shown.count < opts.count { ChipButton(label: "+ \(opts.count - shown.count)", active: false) { allTopics = true } }
        }
    }
    func togglePool(_ k: String) {
        var cur = prefs.pools
        if k == "all" { cur = ["all"] }
        else if cur.contains(k) { if cur.count > 1 { cur.removeAll { $0 == k } } }
        else { cur.removeAll { $0 == "all" }; cur.append(k) }
        prefs.pools = cur
    }
    func section<C: View>(_ title: String, @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            CapsLabel(text: store.t(title))
            content()
        }.padding(.top, 6)
    }
}

struct LevelChips: View {
    @Environment(Store.self) var store
    var body: some View {
        ChipRow {
            ForEach(store.course.levels, id: \.self) { l in
                let n = store.words.all.filter { $0.lvl == l }.count
                ChipButton(label: "\(store.course.levelName(l))  \(n)", active: store.levels.contains(l)) {
                    var lv = store.levels
                    if lv.contains(l) { if lv.count == 1 { return }; lv.removeAll { $0 == l } } else { lv.append(l) }
                    store.update { $0.courses[$0.course, default: CourseState()].levels = lv.sorted() }
                }
            }
        }
    }
}

/// Result (round 2): the score, one cell per answer (a wrong one is an outlined ✕, never colour alone),
/// the mistakes with what you picked, Retry mistakes · Done
struct ResultView: View {
    @Environment(Store.self) var store
    let result: SessionResult
    var mode: Mode?
    var seconds = 0
    var retry: (() -> Void)?
    let again: () -> Void
    let back: () -> Void
    @State private var marks: [Bool] = []
    var body: some View {
        let pct = result.total > 0 ? Int((Double(result.correct) / Double(result.total) * 100).rounded()) : 100
        Page {
            CapsLabel(text: (mode.map { store.t($0.key) + " · " } ?? "") + store.t("result"))
            HStack(alignment: .firstTextBaseline, spacing: 0) {
                Text("\(result.correct)").scaledFont(64, .heavy)
                Text("/\(result.total)").scaledFont(28, .bold).foregroundStyle(Color.ink2)
            }
            Text("\(pct)%" + (seconds > 0 ? " · " + fmtTime(Double(seconds) * 1000) + " " + store.t("minShort") : "") + (result.extra.map { " · " + $0 } ?? ""))
                .font(.subheadline).foregroundStyle(Color.ink2)
            if !marks.isEmpty && marks.count <= 60 {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 10), spacing: 4) {
                    ForEach(Array(marks.enumerated()), id: \.offset) { _, ok in
                        RoundedRectangle(cornerRadius: max(1, Look.current.radius / 2)).fill(ok ? Color.ink : Color.clear).aspectRatio(1, contentMode: .fit)
                            .overlay { if !ok { RoundedRectangle(cornerRadius: max(1, Look.current.radius / 2)).stroke(Color.accent, lineWidth: 1.5); Text("✕").font(.caption2.weight(.bold)).foregroundStyle(Color.accent) } }
                    }
                }
                .accessibilityElement().accessibilityLabel(store.t("resultCells", result.correct, result.total - result.correct))
            }
            if result.mistakes.isEmpty {
                Text(store.t("perfect")).foregroundStyle(Color.ink2).padding(.vertical, 8)
            } else {
                VStack(spacing: 6) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(store.t("mistakesN", result.mistakes.count)).font(.subheadline.weight(.bold))
                        Spacer()
                        Text(store.t("addedToReviews")).font(.caption).foregroundStyle(Color.ink2)
                    }
                    Rectangle().fill(Color.ink).frame(height: 2)
                }.padding(.top, 8)
                ForEach(result.mistakes) { w in
                    HStack(spacing: 10) {
                        Text("✕").font(.caption.weight(.bold)).foregroundStyle(Color.accent).frame(width: 24, height: 24)
                            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.accent, lineWidth: 1.5))
                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 6) {
                                WordLine(word: w, size: 16)
                                if store.course.id == "zh" && store.pyFirst { Text(w.hz).hanziFont(15).foregroundStyle(Color.ink2) }
                                else if store.course.id == "zh" { PinyinText(py: w.py, size: 14) }
                            }
                            Text(store.tr(w) + (result.why[w.id].map { " · " + $0 } ?? "")).font(.footnote).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        SquareButton(icon: "speaker.wave.2", label: store.t("play") + " " + w.hz) { store.speaker.say(w.hz) }
                    }
                    .padding(.vertical, 6)
                    Divider()
                }
            }
            if let retry { Button(store.t("retryMistakes"), action: retry).buttonStyle(SecondaryButtonStyle(tint: .accent)).padding(.top, 10) }
            else { Button(store.t("playAgain"), action: again).buttonStyle(.secondary).padding(.top, 10) }
            Button(store.t("done"), action: back).buttonStyle(.primary)
        }
        .onAppear {
            marks = store.marks.count == result.total ? store.marks : Array(repeating: true, count: result.correct) + Array(repeating: false, count: max(0, result.total - result.correct))
            store.update { $0.stats.sessions += 1 }; checkGoal(store)
        }
    }
}

struct MistakeList: View {
    @Environment(Store.self) var store
    let words: [Word]
    var body: some View {
        SectionTitle(text: store.t("reviewMistakes"))
        ForEach(words) { w in
            HStack(spacing: 12) {
                if store.pyFirst {
                    VStack(alignment: .leading) { PinyinText(py: w.py, size: 20, weight: .semibold); Text(store.tr(w)).font(.footnote).foregroundStyle(Color.ink2) }
                } else {
                    Text(w.hz).hanziFont(24)
                    VStack(alignment: .leading) { Text(w.py).font(.subheadline); Text(store.tr(w)).font(.footnote).foregroundStyle(Color.ink2) }
                }
                Spacer()
                SpeakButton(text: w.hz, small: true)
            }
        }
    }
}

@MainActor func checkGoal(_ store: Store) {
    let n = store.state.dayCount(todayKey()), goal = store.state.settings.dailyGoal
    if n >= goal && n - 1 < goal { store.toast(store.t("goalReached")) }
}

// MARK: Drills built on PickRound

struct ToneIcon: View {
    let n: Int
    let course: String
    var body: some View {
        let zh: [Int: [CGPoint]] = [1: [.init(x: 4, y: 10), .init(x: 44, y: 10)], 2: [.init(x: 4, y: 28), .init(x: 44, y: 8)], 3: [.init(x: 4, y: 10), .init(x: 24, y: 30), .init(x: 44, y: 12)], 4: [.init(x: 4, y: 8), .init(x: 44, y: 30)], 5: [.init(x: 20, y: 18), .init(x: 28, y: 18)]]
        let vi: [Int: [CGPoint]] = [1: [.init(x: 4, y: 14), .init(x: 44, y: 14)], 2: [.init(x: 4, y: 18), .init(x: 24, y: 23), .init(x: 44, y: 30)], 3: [.init(x: 4, y: 28), .init(x: 44, y: 8)], 4: [.init(x: 4, y: 12), .init(x: 16, y: 26), .init(x: 26, y: 24), .init(x: 44, y: 10)], 5: [.init(x: 4, y: 24), .init(x: 20, y: 14), .init(x: 24, y: 22), .init(x: 44, y: 6)], 6: [.init(x: 8, y: 16), .init(x: 22, y: 30)]]
        let pts = (course == "zh" ? zh : vi)[n] ?? []
        Path { p in p.addLines(pts) }
            .stroke(course == "zh" ? Color.tone(n) : Color.viTone(n), style: StrokeStyle(lineWidth: 3.5, lineCap: .round, lineJoin: .round))
            .frame(width: 48, height: 36)
    }
}

@MainActor func toneName(_ store: Store, _ n: Int) -> String {
    store.course.id == "zh" ? store.t("toneN", n) : "\(["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"][n - 1]) (\(["a", "à", "á", "ả", "ã", "ạ"][n - 1]))"
}

struct ToneDrill: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    var body: some View {
        let c = store.course
        let tones = c.toneOptions ?? [1, 2, 3, 4]
        PickRound(questions: list.map { w in
            let real = Lingo.firstTone(c.id == "zh" ? w.py : w.hz, course: c.id)
            return .init(
                play: { store.speaker.say(w.hz, rate: 0.7) },
                prompt: AnyView(VStack(spacing: 8) {
                    Text(w.hz).hanziFont(52)
                    Text(store.tr(w)).foregroundStyle(Color.ink2)
                    Text(store.t("toneQ")).foregroundStyle(Color.ink2)
                    Button { store.speaker.say(w.hz, rate: 0.7) } label: { Label(store.t("play"), systemImage: "play.fill") }.buttonStyle(.borderedProminent).tint(.accent)
                }),
                options: tones.map { n in AnyView(HStack { ToneIcon(n: n, course: c.id); Text(toneName(store, n)) }) },
                answer: tones.firstIndex(of: real) ?? 0,
                reveal: AttributedString("\(w.hz) \(w.py) · \(toneName(store, real))"),
                mistake: w)
        }, done: done)
    }
}

struct NumberDrill: View {
    @Environment(Store.self) var store
    let done: (SessionResult) -> Void
    @State private var qs: [(n: Int, opts: [Int])] = (1...99).shuffled().prefix(10).map { n in
        (n, ([n] + (1...99).filter { $0 != n && abs($0 - n) < 40 }.shuffled().prefix(3)).shuffled())
    }
    var body: some View {
        let c = store.course.id
        PickRound(questions: qs.map { n, opts in
            let written = Numbers.written(n, course: c), spoken = Numbers.spoken(n, course: c)
            return .init(
                play: { store.speaker.say(written) },
                prompt: AnyView(VStack(spacing: 8) {
                    Text(written).hanziFont(c == "vi" ? 34 : 52).multilineTextAlignment(.center)
                    Text(store.t("numPrompt")).foregroundStyle(Color.ink2)
                    SpeakButton(text: written, small: true)
                }),
                options: opts.map { AnyView(Text("\($0)").font(.title3.monospacedDigit())) },
                answer: opts.firstIndex(of: n)!,
                reveal: AttributedString("\(written) = \(n)" + (spoken.isEmpty ? "" : " · \(spoken)")),
                mistake: nil)
        }, done: done)
    }
}

struct SoundDrillScreen: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    @State private var cat = "all"
    @State private var runID = UUID()
    @State private var result: SessionResult?
    @State private var slow = false
    @State private var qs: [(set: [SoundCell], name: String, target: Int)] = []

    func regen() {
        guard let data = Library.shared.sounds[store.course.id] else { return }
        let pool: [(set: [SoundCell], name: String)] = data.drills.filter { cat == "all" || $0.id == cat }.flatMap { d in d.sets.map { ($0, d.name.get(store.state.lang)) } }
        qs = (0..<10).map { _ in let q = pool.randomElement()!; return (q.set, q.name, Int.random(in: 0..<q.set.count)) }
        runID = UUID()
    }

    var body: some View {
        Group {
            if let data = Library.shared.sounds[store.course.id] {
                if let r = result {
                    ResultView(result: r, again: { result = nil; regen() }, back: { dismiss() })
                } else if !qs.isEmpty {
                    PickRound(questions: qs.map { q in
                        let target = q.set[q.target]
                        let play = { speakSound(store, target.say, slow: slow) }
                        return .init(
                            play: play,
                            prompt: AnyView(VStack(spacing: 8) {
                                Text(q.name).foregroundStyle(Color.ink2)
                                Text(store.t("drillPrompt")).foregroundStyle(Color.ink2)
                                HStack {
                                    Button { play() } label: { Label(store.t("play"), systemImage: "play.fill") }.buttonStyle(.borderedProminent).tint(.accent)
                                    Button { speakSound(store, target.say, slow: slow, twice: true) } label: { Text("×2") }.buttonStyle(.bordered).tint(.ink)
                                }
                            }),
                            options: q.set.map { c in AnyView(HStack { Text(c.t ?? "").font(.title3); if let s = c.s, s != c.t { Text(s).foregroundStyle(Color.ink3) } }) },
                            answer: q.target,
                            reveal: AttributedString((target.t ?? "") + (target.s.map { $0 != target.t ? " " + $0 : "" } ?? "")),
                            mistake: nil)
                    }, header: AnyView(VStack(alignment: .leading) {
                        ChipRow {
                            ChipButton(label: store.t("allDrills"), active: cat == "all") { cat = "all"; regen() }
                            ForEach(data.drills) { d in ChipButton(label: d.name.get(store.state.lang), active: cat == d.id) { cat = d.id; regen() } }
                        }
                        Toggle(isOn: $slow) { Label(store.t("slow"), systemImage: "tortoise") }.font(.subheadline).tint(.accent)
                    }), done: { result = $0 }).id(runID)
                }
            }
        }
        .navigationTitle(store.t("listenPick")).navigationBarTitleDisplayMode(.inline).background(Color.paper)
        .onAppear { if qs.isEmpty { regen() } }
    }
}

/// Isolated syllables get clipped by most voices; a sentence-final mark makes the voice give them full length
@MainActor func speakSound(_ store: Store, _ text: String, slow: Bool, twice: Bool = false) {
    let pad = store.course.id == "zh" || store.course.id == "ja" ? "。" : "." // Korean ends sentences with "."
    let body = text.hasSuffix("。") || text.hasSuffix(".") ? text : text + pad
    store.speaker.say(twice ? body + " " + body : body, rate: slow ? 0.5 : 0.7)
}
