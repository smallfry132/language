import SwiftUI
import LanguageCore

/* A dialogue in three ways: listen to it, read it aloud (with a reading time to beat),
 * and take a role (the app speaks the other person, you answer by speaking or typing). */

struct DialogueScreen: View {
    @Environment(Store.self) var store
    let id: String
    @State private var mode = Launch.value("-dlgmode") ?? "listen"

    var body: some View {
        if let d = store.dialogues.first(where: { $0.id == id }) {
            let st = store.state.dialogue(id)
            VStack(spacing: 0) {
                Picker("", selection: $mode) {
                    Text((st.listen != nil ? "✓ " : "") + store.t("dlg_listen")).tag("listen")
                    Text((st.read != nil ? "✓ " : "") + store.t("dlg_read")).tag("read")
                    Text((st.turn != nil ? "✓ " : "") + store.t("dlg_turn")).tag("turn")
                }.pickerStyle(.segmented).padding(.horizontal, 16).padding(.top, 8)
                switch mode {
                case "read": DialogueRead(d: d).id("read" + id)
                case "turn": DialogueTurn(d: d).id("turn" + id)
                default: DialogueListen(d: d).id("listen" + id)
                }
            }
            .background(Color.paper)
            .navigationTitle(d.topic.get(store.state.lang)).navigationBarTitleDisplayMode(.inline)
            .onDisappear { store.speaker.stop(); store.mic.cancel() }
        }
    }
}

/// Display options shared by the three modes
struct DialogueOptions: View {
    @Environment(Store.self) var store
    var body: some View {
        let s = store.state.settings
        ChipRow {
            if store.pyFirst { ChipButton(label: store.t("showHz"), active: s.dlgHz == true) { store.update { $0.settings.dlgHz = !(s.dlgHz == true) } } }
            ChipButton(label: store.t("showTr"), active: s.dlgTr != false) { store.update { $0.settings.dlgTr = !(s.dlgTr != false) } }
            ChipButton(label: "🐢 " + store.t("slowly"), active: s.dlgSlow == true) { store.update { $0.settings.dlgSlow = !(s.dlgSlow == true) } }
        }
    }
}

extension Store {
    var dialogueRate: Double { state.settings.dlgSlow == true ? 0.55 : state.settings.rate }
    func sayLine(_ text: String, then: (() -> Void)? = nil) { speaker.say(text, rate: dialogueRate, then: then) }
}

/// One line of the dialogue as a chat bubble; tapping a word shows its meaning, tapping the bubble plays it
struct Bubble<Extra: View>: View {
    @Environment(Store.self) var store
    let d: Dialogue
    let line: Dialogue.Line
    var highlight: Color?
    @ViewBuilder var extra: Extra

    var body: some View {
        let right = line.who != 0, s = store.state.settings
        let zh = store.course.id == "zh", pf = store.pyFirst
        HStack {
            if right { Spacer(minLength: 40) }
            VStack(alignment: .leading, spacing: 5) {
                Text(pf ? d.people[line.who].py : d.people[line.who].hz).font(.caption.weight(.semibold)).foregroundStyle(Color.ink3)
                if zh && pf { TapWords(py: line.py, size: 20) } else if zh { Text(line.hz).hanziFont(22) } else { Text(line.hz).font(.title3) }
                if zh { if pf { if s.dlgHz == true { Text(line.hz).hanziFont(16).foregroundStyle(Color.ink2) } } else { TapWords(py: line.py, size: 15) } }
                if s.dlgTr != false { Text(line.tr(store.state.lang)).font(.footnote).foregroundStyle(Color.ink2) }
                extra
            }
            .padding(12)
            .background(right ? Color.accentRed.opacity(0.08) : Color.elevated, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(highlight ?? Color.ink.opacity(0.06), lineWidth: highlight == nil ? 1 : 2))
            .contentShape(Rectangle())
            .onTapGesture { store.sayLine(line.hz) }
            if !right { Spacer(minLength: 40) }
        }
    }
}

/// Pinyin words you can tap for their meaning
struct TapWords: View {
    @Environment(Store.self) var store
    let py: String
    var size: CGFloat = 20
    var body: some View {
        WrapLayout(spacing: 5) {
            ForEach(Array(py.split(separator: " ").enumerated()), id: \.offset) { _, tok in
                PinyinText(py: String(tok), size: size)
                    .onTapGesture {
                        if let w = lookup(String(tok)) { store.toast("\(w.py) · \(w.hz) · \(store.tr(w))"); store.speaker.say(w.hz) }
                    }
            }
        }
    }
    func lookup(_ tok: String) -> Word? {
        let key = { (s: String) in s.precomposedStringWithCanonicalMapping.lowercased().filter { $0.isLetter } }
        let k = key(tok)
        guard !k.isEmpty else { return nil }
        return store.words.all.first { key($0.py) == k } ?? store.words.all.first { Lingo.stripTones($0.py) == Lingo.stripTones(tok) }
    }
}

/// A simple flow layout: items left to right, wrapping to the next line
struct WrapLayout: Layout {
    var spacing: CGFloat = 6
    var lineSpacing: CGFloat = 2

    /// Each item's position, the line breaks decided once for a width. Measuring and placing use the same
    /// breaks, so a line can never wrap one more time than was measured and run into the text below.
    private func arrange(_ subviews: Subviews, width maxW: CGFloat) -> (points: [CGPoint], size: CGSize) {
        var points: [CGPoint] = [], x: CGFloat = 0, y: CGFloat = 0, lineH: CGFloat = 0, widest: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x > 0 && x + s.width > maxW + 0.5 { y += lineH + lineSpacing; x = 0; lineH = 0 }
            points.append(CGPoint(x: x, y: y))
            widest = max(widest, x + s.width)
            x += s.width + spacing; lineH = max(lineH, s.height)
        }
        return (points, CGSize(width: min(widest, maxW), height: y + lineH))
    }
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(subviews, width: proposal.width ?? .infinity).size
    }
    func placeSubviews(in b: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        // The width the layout was measured with, not the (possibly narrower, rounded) bounds
        let w = max(proposal.width ?? b.width, b.width)
        for (v, p) in zip(subviews, arrange(subviews, width: w).points) {
            v.place(at: CGPoint(x: b.minX + p.x, y: b.minY + p.y), proposal: .unspecified)
        }
    }
}

struct DialogueListen: View {
    @Environment(Store.self) var store
    let d: Dialogue
    @State private var playing = -1
    @State private var token = 0

    var body: some View {
        ScrollViewReader { proxy in
            Page {
                Text(store.t("dlg_listenHint")).font(.footnote).foregroundStyle(Color.ink2)
                DialogueOptions()
                ForEach(Array(d.lines.enumerated()), id: \.offset) { k, l in
                    Bubble(d: d, line: l, highlight: k == playing ? .accentRed : nil) { EmptyView() }.id(k)
                }
                if playing < 0 {
                    Button { token += 1; step(0, token, proxy) } label: { Label(store.t("playAll"), systemImage: "play.fill") }.buttonStyle(.primary)
                } else {
                    Button { token += 1; playing = -1; store.speaker.stop() } label: { Label(store.t("stop"), systemImage: "stop.fill") }.buttonStyle(.secondary)
                }
            }
        }
        .onDisappear { token += 1 }
    }
    func step(_ k: Int, _ my: Int, _ proxy: ScrollViewProxy) {
        guard my == token else { return }
        if k >= d.lines.count { playing = -1; store.update { $0.dlg[d.id, default: DialogueProgress()].listen = todayKey(); $0.dlg[d.id]!.gone = nil }; return }
        playing = k
        withAnimation { proxy.scrollTo(k, anchor: .center) }
        store.sayLine(d.lines[k].hz) {
            Task { try? await Task.sleep(for: .milliseconds(450)); step(k + 1, my, proxy) }
        }
    }
}

struct DialogueRead: View {
    @Environment(Store.self) var store
    let d: Dialogue
    @State private var res: [Int: Spoken] = [:]
    @State private var selfOK: [Int: Bool] = [:]

    var body: some View {
        let st = store.state.dialogue(d.id)
        let doneN = res.count, total = res.values.reduce(0) { $0 + $1.ms }
        let acc = doneN > 0 ? res.keys.reduce(0.0) { $0 + score($1) } / Double(doneN) : 0
        Page {
            Text(store.t("dlg_readHint")).font(.footnote).foregroundStyle(Color.ink2)
            DialogueOptions()
            ForEach(Array(d.lines.enumerated()), id: \.offset) { k, l in
                Bubble(d: d, line: l, highlight: res[k].map { _ in score(k) >= 0.8 ? Color.good : Color.gold }) {
                    VStack(alignment: .leading, spacing: 8) {
                        MicButton(key: "line\(k)", target: l.hz, py: l.py) { r in res[k] = r; selfOK[k] = nil; finishIfDone() }
                        if let r = res[k] { SpokenResult(hz: l.hz, py: l.py, spoken: r) { selfOK[k] = $0; finishIfDone() }.id(r.ms) }
                    }.padding(.top, 4)
                }
            }
            Text("\(doneN)/\(d.lines.count) · \(store.t("readTime", fmtTime(total)))" + (st.read.map { " · " + store.t("bestTime", fmtTime($0.best)) } ?? "") + (doneN > 0 ? " · \(Int((acc * 100).rounded()))%" : ""))
                .font(.footnote.monospacedDigit()).foregroundStyle(Color.ink2).frame(maxWidth: .infinity)
        }
    }
    func score(_ k: Int) -> Double { selfOK[k].map { $0 ? 1 : 0 } ?? res[k]?.score ?? 0 }
    func finishIfDone() {
        guard res.count == d.lines.count else { return }
        let ms = res.values.reduce(0) { $0 + $1.ms }, acc = res.keys.reduce(0.0) { $0 + score($1) } / Double(res.count)
        store.update {
            let prev = $0.dialogue(d.id).read
            var p = $0.dialogue(d.id)
            p.read = .init(best: min(prev?.best ?? .infinity, ms), last: ms, acc: (acc * 100).rounded())
            $0.dlg[d.id] = p
        }
    }
}

struct DialogueTurn: View {
    @Environment(Store.self) var store
    let d: Dialogue
    struct Shown { let k: Int; let ok: Bool?; let note: String?; let spoken: Spoken? }
    @State private var me: Int?
    @State private var i = 0
    @State private var right = 0
    @State private var hint = 0
    @State private var shown: [Shown] = []
    @State private var typed = ""
    @State private var gen = 0

    var body: some View {
        ScrollViewReader { proxy in
            Page {
                Text(store.t("dlg_turnHint")).font(.footnote).foregroundStyle(Color.ink2)
                DialogueOptions()
                ForEach(Array(shown.enumerated()), id: \.offset) { n, s in
                    Bubble(d: d, line: d.lines[s.k], highlight: s.ok.map { $0 ? Color.good : Color.gold }) {
                        if let sp = s.spoken { SpokenResult(hz: d.lines[s.k].hz, py: d.lines[s.k].py, spoken: sp).id(sp.ms) }
                        if let note = s.note { Text(note).font(.subheadline).foregroundStyle(s.ok == true ? Color.good : Color.bad) }
                    }.id(n)
                }
                foot.id("foot")
            }
            .onChange(of: shown.count) { withAnimation { proxy.scrollTo("foot", anchor: .bottom) } }
        }
        .onDisappear { gen += 1 }
    }

    @ViewBuilder var foot: some View {
        if me == nil {
            SectionTitle(text: store.t("chooseRole"))
            HStack { ForEach(Array(d.people.enumerated()), id: \.offset) { k, p in Button(store.t("iAm", store.pyFirst ? p.py : p.hz)) { me = k; advance(after: false) }.buttonStyle(.secondary) } }
        } else if i >= d.lines.count {
            CardBox(padding: 20) {
                Text(store.t("dlgTurnDone", right, d.lines.filter { $0.who == me }.count)).font(.title3.weight(.bold)).frame(maxWidth: .infinity)
                HStack {
                    Button(store.t("switchRole")) { me = 1 - me!; i = 0; right = 0; shown = []; advance(after: false) }.buttonStyle(.secondary)
                }
            }
        } else if d.lines[i].who == me {
            let l = d.lines[i]
            CardBox(padding: 18) {
                Text(store.t("sayIn", store.t("langName"))).font(.footnote).foregroundStyle(Color.ink3)
                Text(l.tr(store.state.lang)).font(.title3.weight(.semibold))
                if hint > 0 {
                    let h = hint == 1 ? Check.hintMask(l.py) : (store.course.id == "zh" ? l.py : l.hz)
                    if store.course.id == "zh" { PinyinText(py: h, size: 18) } else { Text(h) }
                }
                MicButton(key: "turn\(i)", target: l.hz, py: l.py) { r in answer(ok: r.heard.map { $0.score >= 0.8 }, note: nil, spoken: r) }
                    .frame(maxWidth: .infinity)
                HStack {
                    PinyinField(placeholder: store.t("typeOr"), text: $typed, submit: submitTyped, autofocus: false)
                    Button(store.t("check"), action: submitTyped).buttonStyle(.bordered).tint(.ink)
                }
                HStack {
                    if hint < 2 { Button { hint += 1 } label: { Label(store.t("hint"), systemImage: "lightbulb") }.buttonStyle(.borderless) }
                    Spacer()
                    Button(store.t("skip")) { answer(ok: false, note: nil, spoken: nil) }.buttonStyle(.borderless)
                }.font(.subheadline).tint(Color.ink2)
            }
        }
    }

    func submitTyped() {
        // Tone numbers typed just before Return may not have turned into marks yet
        let raw = typed.trimmingCharacters(in: .whitespaces), v = store.course.id == "zh" ? Lingo.numToMarks(raw) : raw
        guard !v.isEmpty else { return }
        let l = d.lines[i], r = Check.typedLine(v, hz: l.hz, py: l.py, course: store.course.id)
        let note = r.ok ? (r.tonesMissing ? store.t("tonesMissing") : "✓ " + store.t("correct")) : r.tonesWrong ? store.t("tonesWrong") : "✗ " + store.t("wrong")
        typed = ""
        Haptic.answer(r.ok)
        answer(ok: r.ok, note: note, spoken: nil)
    }
    /// ok nil: recording without a recogniser (self-rated later, counted as tried)
    func answer(ok: Bool?, note: String?, spoken: Spoken?) {
        let l = d.lines[i]
        if ok == true { right += 1 }
        shown.append(Shown(k: i, ok: ok, note: note, spoken: spoken))
        store.sayLine(l.hz)
        i += 1; hint = 0
        advance(after: true)
    }
    /// Play the other person's lines until it is my turn again
    func advance(after mine: Bool) {
        let my = gen
        guard i < d.lines.count else {
            store.update { var p = $0.dialogue(d.id); p.turn = .init(best: max(p.turn?.best ?? 0, right), last: right); $0.dlg[d.id] = p }
            return
        }
        let l = d.lines[i]
        if l.who == me { return }
        Task {
            try? await Task.sleep(for: .milliseconds(mine ? 1400 : 200))
            // Wait for my answer's line to finish
            while store.speaker.isSpeaking { try? await Task.sleep(for: .milliseconds(100)) }
            guard my == gen else { return }
            shown.append(Shown(k: i, ok: nil, note: nil, spoken: nil))
            i += 1
            store.sayLine(l.hz) { Task { try? await Task.sleep(for: .milliseconds(300)); if my == gen { advance(after: false) } } }
        }
    }
}
