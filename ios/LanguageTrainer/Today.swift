import SwiftUI
import LanguageCore

/* The guided daily session (review, new words, listen, speak, write), started from Learn. */

/// A guided session: a chain of steps, each an exercise; a summary at the end
struct FlowStep: Identifiable {
    let id = UUID()
    let kind: String      // review, meet, listen, speak, write
    let list: [Word]
    var title: String { "step" + kind.prefix(1).uppercased() + kind.dropFirst() }
    var icon: String { ["review": "book", "meet": "leaf", "listen": "ear", "speak": "mic", "write": "pencil"][kind] ?? "circle" }
}

struct FlowScreen: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let lessonId: String?
    @State private var steps: [FlowStep] = []
    @State private var i = 0
    @State private var running = false
    @State private var results: [(FlowStep, SessionResult)] = []

    var body: some View {
        Group {
            if steps.isEmpty { Color.paper }
            else if i >= steps.count { summary }
            else if running { run(steps[i]).id(steps[i].id) }
            else { intro(steps[i]) }
        }
        .navigationTitle(store.t("sessionTitle")).navigationBarTitleDisplayMode(.inline).background(Color.paper)
        .onAppear {
            if steps.isEmpty { build() }
            if let k = Launch.value("-step").flatMap(Int.init), k < steps.count { i = k; running = Launch.has("-autostart") }
            else if Launch.has("-autostart") { running = true }
        }
    }

    func build() {
        if let lid = lessonId, let l = store.state.lessons[lid], l.gone == nil {
            let ws = l.words.compactMap { store.word($0.id) }, pick = Array(ws.shuffled().prefix(15))
            steps = [FlowStep(kind: "meet", list: ws.filter { store.status($0.id) == .new }), FlowStep(kind: "listen", list: pick), FlowStep(kind: "write", list: pick.shuffled())]
        } else {
            let p = store.words.planToday(store.state, extraNew: store.extraNew)
            // Listening and writing practise the new words plus some of the reviews
            let practice = p.fresh + p.due.shuffled().prefix(max(0, 12 - p.fresh.count))
            steps = [FlowStep(kind: "review", list: p.due), FlowStep(kind: "meet", list: p.fresh), FlowStep(kind: "listen", list: practice.shuffled()),
                     FlowStep(kind: "speak", list: Array(practice.shuffled().prefix(6))), FlowStep(kind: "write", list: practice.shuffled())]
        }
        steps = steps.filter { !$0.list.isEmpty }
        if steps.isEmpty { dismiss() }
    }

    @ViewBuilder func run(_ s: FlowStep) -> some View {
        let done = { (r: SessionResult) in results.append((s, r)); running = false; i += 1; if i >= steps.count { store.update { $0.stats.sessions += 1 }; checkGoal(store) } }
        switch s.kind {
        case "review": Flashcards(words: s.list, done: done)
        case "meet": Meet(list: s.list, done: done)
        case "listen": ChoiceQuiz(list: s.list, direction: .listen, done: done)
        case "speak": SayWord(list: s.list, done: done)
        default: TypeWord(list: s.list, done: done)
        }
    }

    func intro(_ s: FlowStep) -> some View {
        Page {
            HStack(spacing: 0) {
                ForEach(Array(steps.enumerated()), id: \.offset) { k, x in
                    VStack(spacing: 4) {
                        Image(systemName: k < i ? "checkmark.circle.fill" : x.icon).font(.title3)
                            .foregroundStyle(k < i ? Color.good : k == i ? Color.accent : Color.ink3)
                        Text(store.t(x.title)).font(.caption2).foregroundStyle(k == i ? Color.ink : Color.ink3)
                    }.frame(maxWidth: .infinity)
                }
            }.padding(.vertical, 8)
            CardBox(padding: 24) {
                VStack(spacing: 10) {
                    Text(store.t("stepOf", i + 1, steps.count)).font(.footnote).foregroundStyle(Color.ink3)
                    Image(systemName: s.icon).scaledFont(40).foregroundStyle(Color.accent).padding(6)
                    Text(store.t(s.title)).font(.title.weight(.bold))
                    Text(store.t(s.title + "Desc")).multilineTextAlignment(.center).foregroundStyle(Color.ink2)
                    Text(store.t("stepCount", s.list.count)).font(.footnote).foregroundStyle(Color.ink3)
                    Button(store.t("start")) { running = true }.buttonStyle(.primary).padding(.top, 6)
                }.frame(maxWidth: .infinity)
            }
        }
    }

    var summary: some View {
        let mistakes = results.flatMap { $0.1.mistakes }.reduce(into: [Word]()) { a, w in if !a.contains(where: { $0.id == w.id }) { a.append(w) } }
        return Page {
            CardBox(padding: 24) {
                VStack(spacing: 6) { Text("🎉").scaledFont(52); Text(store.t("sessionSummary")).font(.title2.weight(.bold)) }.frame(maxWidth: .infinity)
                ForEach(Array(results.enumerated()), id: \.offset) { _, r in
                    HStack {
                        Image(systemName: r.0.icon).frame(width: 26).foregroundStyle(Color.ink2)
                        Text(store.t(r.0.title))
                        Spacer()
                        Text(r.0.kind == "meet" ? store.t("newLearned", r.1.total) : store.t("resultScore", r.1.correct, r.1.total)).font(.footnote).foregroundStyle(Color.ink2)
                    }
                }
                if !mistakes.isEmpty { MistakeList(words: mistakes) }
            }
            Button(store.t(lessonId == nil ? "backToday" : "back")) { dismiss() }.buttonStyle(.primary)
        }
    }
}
