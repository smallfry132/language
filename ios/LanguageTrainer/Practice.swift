import SwiftUI
import LanguageCore

/* Practice: grouped by the skills the tutors ask for. Each mode starts right away; the word choice
 * is folded into "Adjust". Results lead back here; in a guided session they lead to the next step. */

enum Mode: String, CaseIterable, Hashable {
    case flash, quiz, type, typer, listen, match, tones, numbers, say, picture, listenPic, choose
    var key: String {
        switch self {
        case .flash: "modeFlash"; case .quiz: "modeQuiz"; case .type: "modeType"; case .typer: "modeTyper"; case .listen: "modeListen"
        case .match: "modeMatch"; case .tones: "modeTones"; case .numbers: "modeNumbers"; case .say: "modeSay"
        case .picture: "modePicture"; case .listenPic: "modeListenPic"; case .choose: "modeChoose"
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
    case sounds
    case soundDrill
    case progress
}

struct PracticeHome: View {
    @Environment(Store.self) var store
    struct Row { let route: Route; let key: String }
    var skills: [(id: String, icon: String, rows: [Row])] {
        let c = store.course, pics = store.words.selected.contains { store.words.picture($0.id) != nil }
        return [
            ("listen", "ear", [Row(route: .mode(.listen), key: "modeListen")] + (pics ? [Row(route: .mode(.listenPic), key: "modeListenPic")] : []) + (c.toneOptions != nil ? [Row(route: .mode(.tones), key: "modeTones")] : []) + [Row(route: .soundDrill, key: "soundDrill")]),
            ("speak", "mic", [Row(route: .mode(.say), key: "modeSay")] + (store.dialogues.isEmpty ? [] : [Row(route: .dialogues, key: "dialoguesRead")]) + [Row(route: .sounds, key: "soundChart")]),
            ("read", "book", [Row(route: .mode(.choose), key: "modeChoose")] + (pics ? [Row(route: .mode(.picture), key: "modePicture")] : []) + [Row(route: .mode(.flash), key: "modeFlash"), Row(route: .mode(.quiz), key: "modeQuiz"), Row(route: .mode(.match), key: "modeMatch")]),
            ("write", "pencil", [Row(route: .mode(.type), key: "modeType")] + (c.id == "ja" ? [] : [Row(route: .mode(.typer), key: "modeTyper")]) + [Row(route: .mode(.numbers), key: "modeNumbers")])
        ]
    }
    /// Listening exercises wait until there is a voice for the course
    static func needsVoice(_ r: Route) -> Bool { if case .mode(let m) = r { return [.listen, .listenPic, .tones].contains(m) }; return r == .soundDrill }
    var body: some View {
        Page {
            NoVoiceCard()
            let due = store.words.selected.filter { store.state.isDue($0.id) }.count
            if due > 0 { Text(store.t("dueInToday", due)).font(.subheadline).foregroundStyle(Color.accent) }
            ForEach(skills.map { sk in (id: sk.id, icon: sk.icon, rows: sk.rows.filter { !(store.noVoice && Self.needsVoice($0.route)) }) }.filter { !$0.rows.isEmpty }, id: \.id) { sk in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: sk.icon).font(.title3).foregroundStyle(Color.accent).frame(width: 28)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(store.t("skill_" + sk.id)).font(.title3.weight(.semibold))
                        Text(store.t("skill_" + sk.id + "Desc")).font(.footnote).foregroundStyle(Color.ink2)
                    }
                }.padding(.top, 14)
                VStack(spacing: 0) {
                    ForEach(Array(sk.rows.enumerated()), id: \.offset) { k, r in
                        NavigationLink(value: r.route) {
                            ListRow(title: store.t(r.key), sub: store.t(r.key + "Desc"))
                        }.buttonStyle(.plain)
                        if k < sk.rows.count - 1 { Divider().padding(.leading, 16) }
                    }
                }.background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
            }
        }
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
    }
}

struct PracticeScreen: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let mode: Mode
    enum Phase { case setup, run(UUID, [Word]), result(SessionResult) }
    @State private var phase = Phase.setup
    @State private var prefs = SetupPrefs.shared

    var body: some View {
        Group {
            switch phase {
            case .setup:
                if [.match, .tones, .numbers].contains(mode) { Color.paper.onAppear { begin() } }
                else { SetupView(mode: mode, prefs: prefs) { begin() }.onAppear { if Launch.has("-autostart") { begin() } } }
            case .run(let id, let list):
                exercise(mode, list, direction: prefs.direction) { phase = .result($0) }.id(id)
            case .result(let r):
                ResultView(result: r, again: { begin() }, back: { dismiss() })
            }
        }
        .navigationTitle(store.t(mode.key))
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.paper)
        .onAppear { store.currentSkill = Store.modeSkill[mode.rawValue] }
        .onDisappear { store.currentSkill = nil }
    }
    func begin() {
        var list: [Word]
        switch mode {
        case .match: list = Array(store.words.selected.filter { !store.tr($0).contains("(") }.shuffled().prefix(6))
        case .tones:
            let pool = store.course.id == "zh" ? store.words.selected.filter { $0.hz.count == 1 && Lingo.firstTone($0.py, course: "zh") != 5 } : store.words.selected.filter { !$0.hz.contains(" ") }
            list = Array(pool.shuffled().prefix(10))
        case .numbers: list = []
        default:
            var pool = prefs.pool(store)
            if [.picture, .listenPic].contains(mode) { pool = pool.filter { store.words.picture($0.id) != nil } }
            list = prefs.pool == "due" ? Array(pool.prefix(prefs.count)) : Array(pool.shuffled().prefix(prefs.count))
        }
        if mode == .typer { list = Array(store.words.selected.shuffled().prefix(prefs.count)) }
        if list.isEmpty && mode != .numbers { phase = .setup; return }
        phase = .run(UUID(), list)
    }
}

@Observable @MainActor
final class SetupPrefs {
    static let shared = SetupPrefs()
    var pool = "due"
    var cat = "all"
    var count = 10
    var direction = QuizDirection.hzTr
    var typerContent = "mixed"

    func pool(_ store: Store) -> [Word] {
        let base = store.words.selected
        var list = cat == "all" ? base : inTopic(base, store)
        let all = { (l: [Word]) in self.cat == "all" ? l : self.inTopic(l, store) }
        switch pool {
        case "due":
            let due = list.filter { store.state.isDue($0.id) }, fresh = list.filter { store.status($0.id) == .new }
            list = due + fresh.shuffled()
            if list.isEmpty { list = all(base) }
        case "lessons": list = all(store.words.lessonWords(store.state))
        case "favs": list = list.filter { store.state.favs.contains(WordRef($0.id)) }
        case "learning": list = list.filter { store.status($0.id) == .learning }
        default: break
        }
        return list
    }
    /// The words of the chosen topic (or category, for courses without topics)
    func inTopic(_ l: [Word], _ store: Store) -> [Word] {
        guard store.words.themes.contains(where: { $0.id == cat }) else { return l.filter { $0.cat == cat } }
        return l.filter { store.words.topicId(of: $0.id) == cat }
    }
}

struct SetupView: View {
    @Environment(Store.self) var store
    let mode: Mode
    @Bindable var prefs: SetupPrefs
    let start: () -> Void

    var counts: [Int] { mode == .flash ? [10, 20, 40, 150] : mode == .say ? [5, 10, 20] : [10, 20, 40] }
    var available: Int {
        let p = prefs.pool(store)
        return [.picture, .listenPic].contains(mode) ? p.filter { store.words.picture($0.id) != nil }.count : p.count
    }

    var body: some View {
        let n = available
        Page {
            CardBox {
                Text(store.t(mode.key)).font(.title2.weight(.bold))
                Text(store.t(mode.key + "Desc")).foregroundStyle(Color.ink2)
                if mode == .typer { Text(store.t("typerIntro")).font(.footnote).foregroundStyle(Color.ink2) }
                if mode != .typer { Text(store.t("wordsCount", min(n, prefs.count), n)).font(.footnote).foregroundStyle(Color.ink3) }
                if mode == .typer, let best = store.state.typer?[store.course.id], best > 0 {
                    Text("\(store.t("typerBest")): \(best) \(store.t("wpm"))").font(.footnote).foregroundStyle(Color.ink2)
                }
                Button(store.t("start"), action: start).buttonStyle(.primary)
                    .disabled(mode != .typer && n < ([.flash, .type, .say].contains(mode) ? 1 : 4))
                DisclosureGroup(store.t("adjust")) {
                    VStack(alignment: .leading, spacing: 4) {
                        SectionTitle(text: store.t("levels"))
                        LevelChips()
                        if mode == .typer {
                            SectionTitle(text: store.t("typerContent"))
                            ChipRow { ForEach(["words", "sentences", "mixed"], id: \.self) { k in ChipButton(label: store.t("typer" + k.capitalized), active: prefs.typerContent == k) { prefs.typerContent = k } } }
                        } else {
                            SectionTitle(text: store.t("whichWords"))
                            let pools = [("due", "dueWords")] + (store.words.lessonWords(store.state).isEmpty ? [] : [("lessons", "lessonsPool")]) + [("all", "allWords"), ("learning", "learningOnly"), ("favs", "favsOnly")]
                            ChipRow { ForEach(pools, id: \.0) { k, l in ChipButton(label: store.t(l), active: prefs.pool == k) { prefs.pool = k } } }
                            SectionTitle(text: store.t(store.words.themes.isEmpty ? "category" : "topics"))
                            TopicChips(selection: $prefs.cat)
                        }
                        SectionTitle(text: store.t("howMany"))
                        ChipRow { ForEach(counts, id: \.self) { c in ChipButton(label: c == 150 ? store.t("all") : "\(c)", active: prefs.count == c) { prefs.count = c } } }
                        if mode == .quiz {
                            SectionTitle(text: store.t("direction"))
                            let dirs: [QuizDirection] = store.pyFirst ? [.hzTr, .trHz] : [.hzTr, .trHz, .hzPy, .pyHz]
                            ChipRow { ForEach(dirs, id: \.self) { d in ChipButton(label: store.t("dir" + d.rawValue.prefix(1).uppercased() + d.rawValue.dropFirst()), active: prefs.direction == d) { prefs.direction = d } } }
                        }
                    }.padding(.top, 6)
                }.tint(Color.ink2)
            }
        }
        .onAppear {
            if !counts.contains(prefs.count) { prefs.count = counts[0] }
            if prefs.pool == "lessons" && store.words.lessonWords(store.state).isEmpty { prefs.pool = "due" }
            if store.pyFirst && [.hzPy, .pyHz].contains(prefs.direction) { prefs.direction = .hzTr }
        }
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

struct ResultView: View {
    @Environment(Store.self) var store
    let result: SessionResult
    let again: () -> Void
    let back: () -> Void
    var body: some View {
        Page {
            CardBox(padding: 24) {
                VStack(spacing: 6) {
                    Text("\(result.total > 0 ? Int((Double(result.correct) / Double(result.total) * 100).rounded()) : 100)%").scaledFont(56, .heavy)
                    Text(store.t("resultScore", result.correct, result.total) + (result.extra.map { " · " + $0 } ?? "")).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
                    if result.mistakes.isEmpty { Text("🎉 " + store.t("perfect")).padding(.top, 8) }
                }.frame(maxWidth: .infinity)
                if !result.mistakes.isEmpty { MistakeList(words: result.mistakes) }
            }
            Button(store.t("playAgain"), action: again).buttonStyle(.primary)
            Button(store.t("backToTrain"), action: back).buttonStyle(.secondary)
        }
        .onAppear { store.update { $0.stats.sessions += 1 }; checkGoal(store) }
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
