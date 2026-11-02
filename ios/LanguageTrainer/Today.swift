import SwiftUI
import LanguageCore

/* The guided daily session (style canvas, round 2): Meet · Cards · Listen · Say · Type, started from Learn.
 * Every exercise shows the session header (close, step title, step and item count, minutes left, five labelled
 * segments); each step hands over to the next without an intro card. Today's progress is kept on this device
 * (the done steps and the day's practice words), so Continue picks up where you left. */

/// A guided session: a chain of steps, each an exercise; the Done screen at the end
struct FlowStep: Identifiable {
    let id = UUID()
    let kind: String      // meet, review, listen, speak, write
    let list: [Word]
    static let seconds: [String: Int] = ["meet": 25, "review": 10, "listen": 8, "speak": 20, "write": 15]
}

/// What the session header needs; exercises inside a session read it from the environment
struct FlowInfo {
    var steps: [FlowStep]
    var step: Int
    var close: () -> Void
}
private struct FlowInfoKey: EnvironmentKey { static let defaultValue: FlowInfo? = nil }
extension EnvironmentValues {
    var flowInfo: FlowInfo? { get { self[FlowInfoKey.self] } set { self[FlowInfoKey.self] = newValue } }
}

/// The session header: close, step title, "Step 1 of 5 · word 2 of 5", minutes left, five labelled segments
struct FlowHeader: View {
    @Environment(Store.self) var store
    let flow: FlowInfo
    let i: Int
    let n: Int
    var body: some View {
        let st = flow.steps[flow.step], course = store.course.id
        let left = flow.steps.enumerated().filter { $0.offset >= flow.step }.reduce(0) { s, x in
            s + (x.offset == flow.step ? max(0, n - i) : x.element.list.count) * (FlowStep.seconds[x.element.kind] ?? 10)
        }
        let title = st.kind == "write" && (course == "vi" || course == "ko") ? "flow_write_word" : "flow_" + st.kind
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Button { flow.close() } label: {
                    Image(systemName: "xmark").font(.system(size: 18, weight: .semibold)).frame(width: 44, height: 44)
                }.buttonStyle(.card).foregroundStyle(Color.ink).padding(.leading, -10).accessibilityLabel(store.t("closeSession"))
                VStack(alignment: .leading, spacing: 1) {
                    Text(store.t(title)).font(.subheadline.weight(.bold))
                    Text(store.t(st.kind == "meet" ? "flowSubWord" : "flowSub", flow.step + 1, flow.steps.count, min(i + 1, n), n)).font(.caption).foregroundStyle(Color.ink2)
                }
                Spacer()
                Text(store.t("minLeft", max(1, Int((Double(left) / 60).rounded())))).font(.caption).foregroundStyle(Color.ink2)
            }
            StepSegments(kinds: flow.steps.map(\.kind), done: Set(flow.steps.prefix(flow.step).map(\.kind)), current: st.kind)
        }
        .padding(.bottom, 12)
        .overlay(alignment: .bottom) { Rectangle().fill(Color.line).frame(height: 1).padding(.horizontal, -16) }
        .padding(.bottom, 4)
    }
}

/// Five labelled segments (Meet · Cards · Listen · Say · Type): done in ink, the current one in the accent
struct StepSegments: View {
    @Environment(Store.self) var store
    let kinds: [String]
    let done: Set<String>
    let current: String?
    var onDark = false
    var body: some View {
        HStack(alignment: .top, spacing: 4) {
            ForEach(kinds, id: \.self) { k in
                let isDone = done.contains(k), cur = k == current
                VStack(alignment: .leading, spacing: 4) {
                    RoundedRectangle(cornerRadius: Look.current.radius > 8 ? 2 : 0)
                        .fill(isDone ? (onDark ? Color.white : Color.ink) : cur ? (onDark ? darkAccent : Color.accent) : (onDark ? Color.white.opacity(0.2) : Color.sunken))
                        .frame(height: 4)
                    Text(store.t("seg_" + k)).font(.caption2.weight(cur ? .bold : .regular)).lineLimit(1)
                        .foregroundStyle(onDark ? Color.white.opacity(cur ? 1 : 0.7) : cur ? Color.ink : Color.ink2)
                }.frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .accessibilityElement(children: .combine)
    }
    var darkAccent: Color { store.course.id == "vi" ? Color.dynamic(0xC5F27A, 0xC5F27A, text: false) : Color.dynamic(0xF2B544, 0xF2B544, text: false) }
}

/// Today's session plan, with the day's progress kept on this device (UserDefaults, per day and course)
@MainActor enum TodaySession {
    struct Saved: Codable { var day: String; var course: String; var done: [String]; var ids: [String] }
    static let key = "flow.today"
    static func saved(_ course: String) -> Saved? {
        guard let d = UserDefaults.standard.data(forKey: key), let s = try? JSONDecoder().decode(Saved.self, from: d),
              s.day == todayKey(), s.course == course else { return nil }
        return s
    }
    static func save(_ s: Saved) { if let d = try? JSONEncoder().encode(s) { UserDefaults.standard.set(d, forKey: key) } }
    static func reset() { UserDefaults.standard.removeObject(forKey: key) }

    /// All five steps, which are done today, the fixed practice words and the steps still to do
    static func plan(_ store: Store) -> (steps: [FlowStep], done: [String], ids: [String], todo: [FlowStep]) {
        let p = store.words.planToday(store.state, extraNew: store.extraNew), sv = saved(store.course.id)
        let ids = sv?.ids ?? (p.fresh + p.due.shuffled().prefix(max(0, 12 - p.fresh.count))).map(\.id)
        let practice = ids.compactMap { store.word($0) }, done = sv?.done ?? []
        let steps = [FlowStep(kind: "meet", list: p.fresh), FlowStep(kind: "review", list: p.due), FlowStep(kind: "listen", list: store.noVoice ? [] : practice.shuffled()),
                     FlowStep(kind: "speak", list: Array(practice.shuffled().prefix(6))), FlowStep(kind: "write", list: practice.shuffled())]
        return (steps, done, ids, steps.filter { !$0.list.isEmpty && !done.contains($0.kind) })
    }
    static func minutes(_ steps: [FlowStep]) -> Int {
        max(1, Int((Double(steps.reduce(0) { $0 + $1.list.count * (FlowStep.seconds[$1.kind] ?? 10) }) / 60).rounded()))
    }
}

struct FlowScreen: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let lessonId: String?
    @State private var steps: [FlowStep] = []
    @State private var i = 0
    @State private var results: [(FlowStep, SessionResult)] = []
    @State private var persist = false
    @State private var ids: [String] = []
    @State private var round = 0 // a new round (Practise these again) redraws the steps

    var body: some View {
        Group {
            if steps.isEmpty { Color.paper }
            else if i >= steps.count { FlowDone(results: results, again: againRound) { dismiss() } }
            else {
                run(steps[i]).id(steps[i].id)
                    .environment(\.flowInfo, FlowInfo(steps: steps, step: i, close: { dismiss() }))
                    .onAppear { store.currentSkill = Store.flowSkill[steps[i].kind] }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .background(Color.paper)
        .onDisappear { store.currentSkill = nil }
        .onAppear {
            if steps.isEmpty { build() }
            if let k = Launch.value("-step").flatMap(Int.init), k < steps.count { i = k }
            if Launch.has("-done") { // for screenshots: the Done screen with a mistake per step
                results = steps.map { st in (st, SessionResult(correct: max(0, st.list.count - 1), total: st.list.count, mistakes: Array(st.list.prefix(1)), why: Dictionary(uniqueKeysWithValues: st.list.prefix(1).map { ($0.id, store.t("whyAgain")) }))) }
                i = steps.count
            }
        }
    }

    func build() {
        if let lid = lessonId, let l = store.state.lessons[lid], l.gone == nil {
            let ws = l.words.compactMap { store.word($0.id) }, pick = Array(ws.shuffled().prefix(15))
            steps = [FlowStep(kind: "meet", list: ws.filter { store.status($0.id) == .new }), FlowStep(kind: "review", list: ws.filter { store.state.isDue($0.id, now: nowMs()) }),
                     FlowStep(kind: "listen", list: pick), FlowStep(kind: "write", list: pick.shuffled())]
            steps = steps.filter { !$0.list.isEmpty }
        } else {
            let p = TodaySession.plan(store)
            if TodaySession.saved(store.course.id) == nil { TodaySession.save(.init(day: todayKey(), course: store.course.id, done: [], ids: p.ids)) }
            steps = p.todo; ids = p.ids; persist = true
        }
        if steps.isEmpty { dismiss() }
    }

    /// Practise these again: listening and typing over the words of the Watch these list
    func againRound(_ words: [Word]) {
        results = []; persist = false; i = 0; round += 1
        steps = [FlowStep(kind: "listen", list: words.shuffled()), FlowStep(kind: "write", list: words.shuffled())]
    }

    @ViewBuilder func run(_ s: FlowStep) -> some View {
        let done = { (r: SessionResult) in
            results.append((s, r))
            if persist, var sv = TodaySession.saved(store.course.id) { if !sv.done.contains(s.kind) { sv.done.append(s.kind) }; TodaySession.save(sv) }
            i += 1
            if i >= steps.count { store.update { $0.stats.sessions += 1 }; checkGoal(store) }
        }
        switch s.kind {
        case "review": Flashcards(words: s.list, done: done)
        case "meet": Meet(list: s.list, done: done)
        case "listen": ChoiceQuiz(list: s.list, direction: .listen, done: done)
        case "speak": SayWord(list: s.list, done: done)
        default: TypeWord(list: s.list, done: done)
        }
    }
}

/// The end of a session: a seal stamp, four numbers, the words to watch and why, Practise these again
struct FlowDone: View {
    @Environment(Store.self) var store
    let results: [(FlowStep, SessionResult)]
    let again: ([Word]) -> Void
    let close: () -> Void

    var body: some View {
        let course = store.course.id
        let by = { (k: String) in results.filter { $0.0.kind == k }.map(\.1) }
        let total = { (rs: [SessionResult]) in rs.reduce(0) { $0 + $1.total } }
        let correct = { (rs: [SessionResult]) in rs.reduce(0) { $0 + $1.correct } }
        let reviewed = total(by("review")) + total(by("meet")), fresh = total(by("meet"))
        let say = by("speak"), graded = results.filter { $0.0.kind != "meet" }.map(\.1)
        let pct = total(graded) > 0 ? Int((Double(correct(graded)) / Double(total(graded)) * 100).rounded()) : 100
        let sayPct = total(say) > 0 && (course == "zh" || course == "vi") ? Int((Double(correct(say)) / Double(total(say)) * 100).rounded()) : nil
        let mistakes = Array(results.flatMap { $0.1.mistakes }.reduce(into: [Word]()) { a, w in if !a.contains(where: { $0.id == w.id }) { a.append(w) } }.prefix(12))
        let why = results.reduce(into: [String: String]()) { a, r in a.merge(r.1.why) { x, _ in x } }
        let seal = ["zh": ("完成", "Wánchéng!", "完成"), "ja": ("完了", "Kanryō!", "完了"), "ko": ("완료", "Wallyo!", "완료"), "vi": ("Xong", "Xong rồi!", "")][course] ?? ("完成", "Wánchéng!", "完成")
        Page {
            VStack(spacing: 16) {
                SealStamp(text: seal.0, latin: course == "vi").padding(.top, 24)
                VStack(spacing: 2) {
                    Text(seal.1).font(.system(size: 34, weight: .bold)).foregroundStyle(course == "zh" ? Color.tone(2) : Color.ink)
                    Text(seal.2.isEmpty ? store.t("sessionIsDone") : "\(seal.2) · \(store.t("sessionIsDone"))").font(.subheadline).foregroundStyle(Color.ink2)
                }
                Grid(horizontalSpacing: 0, verticalSpacing: 0) {
                    GridRow { cell("\(reviewed)", store.t("cardsReviewed")); cell("+\(fresh)", store.t("newWordsLower")) }
                    GridRow {
                        if let sayPct { cell("\(sayPct)%", store.t("tonesRight")) } else { cell("\(pct)%", store.t("rightAnswers")) }
                        cell("\(store.state.streak())", store.t("dayStreak"), hot: true)
                    }
                }
                .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
                .overlay(alignment: .leading) { Rectangle().fill(Color.line).frame(width: 1) }
                if !mistakes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        CapsLabel(text: store.t("watchThese", mistakes.count))
                        WrapLayout(spacing: 8, lineSpacing: 8) {
                            ForEach(mistakes) { w in
                                Button { store.speaker.say(w.hz) } label: {
                                    HStack(spacing: 6) {
                                        word(w)
                                        Text(why[w.id] ?? store.tr(w)).font(.caption).foregroundStyle(Color.ink2)
                                    }
                                    .padding(.horizontal, 10).padding(.vertical, 6)
                                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius))
                                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius).stroke(Color.line))
                                }.buttonStyle(.card)
                            }
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
                HStack(spacing: 6) {
                    Circle().fill(Color.tone(3)).frame(width: 8, height: 8)
                    Text(store.device.code != nil ? store.t("savedSynced") : store.t("savedHere")).font(.caption).foregroundStyle(Color.ink2)
                    Spacer()
                }
            }
            VStack(spacing: 10) {
                if !mistakes.isEmpty {
                    Button(store.t("practiseThese", mistakes.count)) { again(mistakes) }
                        .buttonStyle(SecondaryButtonStyle(tint: .accent))
                        .overlay(RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2).stroke(Color.accent, lineWidth: 1.5))
                }
                Button(store.t("done")) { close() }.buttonStyle(.primary).accessibilityIdentifier("FlowDone")
            }.padding(.top, 20)
        }
    }
    func cell(_ big: String, _ small: String, hot: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(big).font(.system(size: 24, weight: .bold)).foregroundStyle(hot ? Color.accent : Color.ink)
            Text(small).font(.caption).foregroundStyle(Color.ink2)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(12)
        .overlay(alignment: .trailing) { Rectangle().fill(Color.line).frame(width: 1) }
        .overlay(alignment: .bottom) { Rectangle().fill(Color.line).frame(height: 1) }
    }
    @ViewBuilder func word(_ w: Word) -> some View {
        switch store.course.id {
        case "zh": PinyinText(py: w.py, size: 14, weight: .bold)
        case "vi": VietText(text: w.hz, size: 14, weight: .bold)
        default: Text(w.hz).hanziFont(14, .bold)
        }
    }
}

/// The seal of a finished session: two characters in a tilted red square (Vietnamese: one word on lime)
struct SealStamp: View {
    let text: String
    var latin = false
    var body: some View {
        Group {
            if latin {
                Text(text).font(.system(size: 26, weight: .heavy))
            } else {
                LazyVGrid(columns: [GridItem(.fixed(38), spacing: 0), GridItem(.fixed(38), spacing: 0)], spacing: 0) {
                    ForEach(Array(text.enumerated()), id: \.offset) { _, c in Text(String(c)).hanziFont(34, .heavy).frame(height: 38) }
                }.frame(maxHeight: .infinity, alignment: .top).padding(.top, 10)
            }
        }
        .foregroundStyle(latin ? Color.dynamic(0x0F2A24, 0x0F2A24, text: false) : .white)
        .frame(width: 96, height: 96)
        .background(latin ? Color.dynamic(0xC5F27A, 0xC5F27A, text: false) : Color.accent, in: RoundedRectangle(cornerRadius: Look.current.radius))
        .rotationEffect(.degrees(-4))
        .accessibilityElement().accessibilityLabel(text)
    }
}
