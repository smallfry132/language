import SwiftUI
import LanguageCore

/* A dialogue as a chat (style canvas): listen to it, read it aloud (with a reading time to beat), and role play
 * (the app speaks the other person; you pick your reply, then say it or type it). Switches next to the tabs show
 * the reading line and the translation; each line has Play and 0.75×. */

struct DialogueScreen: View {
    @Environment(Store.self) var store
    let id: String
    @State private var mode: String
    init(id: String, start: String? = nil) { self.id = id; _mode = State(initialValue: start ?? Launch.value("-dlgmode") ?? "listen") }

    var body: some View {
        if let d = store.dialogues.first(where: { $0.id == id }) {
            let st = store.state.dialogue(id)
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    tab("listen", store.t("dlg_listen"), st.listen != nil)
                    tab("read", store.t("dlg_read"), st.read != nil)
                    tab("turn", store.t("rolePlay"), st.turn != nil)
                    // The switches sit with the tabs, not in the toolbar: iOS 26 would wrap both in one glass capsule
                    DialogueToggles().padding(.leading, 8)
                }
                .padding(.horizontal, 16)
                .overlay(alignment: .bottom) { Rectangle().fill(Color.line).frame(height: 1) }
                switch mode {
                case "read": DialogueRead(d: d).id("read" + id)
                case "turn": DialogueTurn(d: d).id("turn" + id)
                default: DialogueListen(d: d).id("listen" + id)
                }
            }
            .background(Color.paper)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    VStack(spacing: 0) {
                        Text((d.icon.map { $0 + " " } ?? "") + d.topic.get(store.state.lang)).font(.subheadline.weight(.bold)).lineLimit(1)
                        Text(d.people.map { store.pyFirst ? $0.py : $0.hz }.joined(separator: " · ")).font(.caption2).foregroundStyle(Color.ink2).lineLimit(1)
                    }
                }
            }
            .onDisappear { store.speaker.stop(); store.mic.cancel() }
        }
    }
    func tab(_ key: String, _ label: String, _ done: Bool) -> some View {
        Button { mode = key } label: {
            Text((done ? "✓ " : "") + label).font(.footnote.weight(mode == key ? .bold : .regular))
                .foregroundStyle(mode == key ? Color.ink : Color.ink2)
                .frame(maxWidth: .infinity, minHeight: 44)
                .overlay(alignment: .bottom) { Rectangle().fill(mode == key ? Color.accent : .clear).frame(height: 2) }
        }.buttonStyle(.plain).accessibilityAddTraits(mode == key ? .isSelected : [])
    }
}

/// Header switches: the reading line (拼 pinyin, あ kana/rōmaji, Aa romanization; 汉 characters in pinyin-first mode)
/// and the translation (EN / DE)
struct DialogueToggles: View {
    @Environment(Store.self) var store
    var body: some View {
        let s = store.state.settings, c = store.course.id
        HStack(spacing: 6) {
            if store.pyFirst {
                toggle("汉", on: s.dlgHz == true, label: store.t("showHz")) { store.update { $0.settings.dlgHz = !(s.dlgHz == true) } }
            } else if c != "vi" {
                toggle(["zh": "拼", "ja": "あ", "ko": "Aa"][c] ?? "Aa", on: s.dlgPy != false, label: store.t("readingLayer")) { store.update { $0.settings.dlgPy = !(s.dlgPy != false) } }
            }
            toggle(store.state.lang.uppercased(), on: s.dlgTr != false, label: store.t("showTr")) { store.update { $0.settings.dlgTr = !(s.dlgTr != false) } }
        }
    }
    func toggle(_ text: String, on: Bool, label: String, action: @escaping () -> Void) -> some View {
        let r = max(2, Look.current.radius - 4)
        return Button(action: action) {
            Text(text).font(text.count > 1 && text.first!.isASCII ? .caption.weight(.bold) : .system(size: 16)).frame(width: 36, height: 36)
                .foregroundStyle(on ? Color.accent : Color.ink2)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
                .overlay(RoundedRectangle(cornerRadius: r).stroke(on ? Color.accent : Color.line, lineWidth: on ? 1.5 : 1))
        }.buttonStyle(.plain).accessibilityLabel(label).accessibilityAddTraits(on ? .isSelected : [])
    }
}

extension Store {
    var dialogueRate: Double { state.settings.dlgSlow == true ? 0.55 : state.settings.rate }
    func sayLine(_ text: String, then: (() -> Void)? = nil) { speaker.say(text, rate: dialogueRate, then: then) }
    /// The reading line with dialogue lines: on unless switched off in the header
    var dialogueReading: Bool { state.settings.dlgPy != false && course.id != "vi" }
}

/// The first character of a role's name in a small box, as the chat's avatar (服 for 服务员)
struct Avatar: View {
    let name: String
    var body: some View {
        let r = Look.current.radius > 8 ? 10.0 : Look.current.radius
        Text(String(name.prefix(name.first?.isASCII == true ? 2 : 1))).hanziFont(15).foregroundStyle(Color.accent)
            .frame(width: 32, height: 32).overlay(RoundedRectangle(cornerRadius: r).stroke(Color.accent, lineWidth: 1.5))
            .accessibilityHidden(true)
    }
}

/// One line of the dialogue as a chat bubble. The other person on the left with an avatar, you on the right
/// in the dark bubble. Tapping a pinyin word shows its meaning; Play and 0.75× read the line out.
struct Bubble<Extra: View>: View {
    @Environment(Store.self) var store
    let d: Dialogue
    let line: Dialogue.Line
    var mine: Bool?
    var highlight: Color?
    @ViewBuilder var extra: Extra

    var body: some View {
        let right = mine ?? (line.who != 0), s = store.state.settings
        let c = store.course.id, zh = c == "zh", pf = store.pyFirst
        let r = Look.current.radius > 8 ? 16.0 : 12.0, corner = max(2, Look.current.radius - 2)
        let shape = UnevenRoundedRectangle(topLeadingRadius: right ? r : corner, bottomLeadingRadius: r, bottomTrailingRadius: r, topTrailingRadius: right ? corner : r)
        let sub = right ? Color.onAction.opacity(0.75) : Color.ink2
        HStack(alignment: .top, spacing: 8) {
            if right { Spacer(minLength: 40) } else { Avatar(name: d.people[line.who].hz) }
            VStack(alignment: .leading, spacing: 3) {
                // Reading line above the line, as on the canvas
                if zh && !pf && store.dialogueReading {
                    if right { Text(line.py).font(.caption.weight(.medium)).foregroundStyle(sub) } else { TapWords(py: line.py, size: 13) }
                }
                if zh && pf {
                    if right { Text(line.py).scaledFont(19, .medium) } else { TapWords(py: line.py, size: 19) }
                    if s.dlgHz == true { Text(line.hz).hanziFont(15).foregroundStyle(sub) }
                } else if c == "vi" {
                    if right { Text(line.hz).hanziFont(19, .semibold) } else { VietText(text: line.hz, size: 19) }
                } else {
                    Text(line.hz).hanziFont(zh ? 20 : 19)
                }
                if (c == "ko" || c == "ja") && store.dialogueReading { Text(line.py).font(.caption).foregroundStyle(sub) }
                if s.dlgTr != false { Text(line.tr(store.state.lang)).font(.caption).foregroundStyle(sub) }
                if let tip = line.tip {
                    // A short tip for this line (round 2), inline under the translation
                    (Text(store.t("tipTitle")).bold().foregroundColor(right ? nil : Color.accent) + Text(" · " + tip.get(store.state.lang)))
                        .font(.caption).foregroundStyle(sub)
                        .padding(.horizontal, 8).padding(.vertical, 6).frame(maxWidth: .infinity, alignment: .leading)
                        .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 6)).strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [3, 3])).foregroundStyle(right ? Color.onAction.opacity(0.35) : Color.line))
                        .padding(.top, 4)
                }
                HStack(spacing: 6) {
                    small(Label(store.t("play"), systemImage: "play.fill"), dark: right) { store.speaker.say(line.hz, rate: store.state.settings.rate) }
                    small(Text("0.75×"), dark: right) { store.speaker.say(line.hz, rate: 0.6) }
                }.padding(.top, 4)
                extra
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
            .foregroundStyle(right ? Color.onAction : Color.ink)
            .background(right ? Color.action : Color.elevated, in: shape)
            .overlay(shape.stroke(highlight ?? (right ? .clear : Color.line), lineWidth: highlight == nil ? 1 : 2))
            if !right { Spacer(minLength: 24) }
        }
    }
    func small<L: View>(_ label: L, dark: Bool, action: @escaping () -> Void) -> some View {
        let r = max(2, Look.current.radius - 6)
        return Button(action: action) {
            label.font(.caption).padding(.horizontal, 10).frame(height: 32)
                .background(dark ? Color.onAction.opacity(0.12) : Color.paper, in: RoundedRectangle(cornerRadius: r))
                .overlay(RoundedRectangle(cornerRadius: r).stroke(dark ? Color.onAction.opacity(0.3) : Color.line))
        }.buttonStyle(.plain)
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
                ForEach(Array(d.lines.enumerated()), id: \.offset) { k, l in
                    Bubble(d: d, line: l, highlight: k == playing ? .accent : nil) { EmptyView() }.id(k)
                }
                if playing < 0 {
                    HStack {
                        Button { token += 1; step(0, token, proxy) } label: { Label(store.t("playAll"), systemImage: "play.fill") }.buttonStyle(.primary)
                        ChipButton(label: "🐢 " + store.t("slowly"), active: store.state.settings.dlgSlow == true) { store.update { $0.settings.dlgSlow = !($0.settings.dlgSlow == true) } }
                    }
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
            ForEach(Array(d.lines.enumerated()), id: \.offset) { k, l in
                Bubble(d: d, line: l, mine: false, highlight: res[k].map { _ in score(k) >= 0.8 ? Color.good : Color.gold }) {
                    VStack(alignment: .leading, spacing: 8) {
                        MicButton(key: "line\(k)", target: l.hz, py: l.py) { r in res[k] = r; selfOK[k] = nil; finishIfDone() }
                        if let r = res[k] { SpokenResult(hz: l.hz, py: l.py, spoken: r) { selfOK[k] = $0 >= 1; finishIfDone() }.id(r.ms) }
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

/// Role play: you get a random role. The other person's lines play by themselves; on your turn you pick your reply
/// from two, then say it (or type it). A good recording moves on; otherwise Retry or go on.
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
    @State private var replies: [Dialogue.Line] = []
    @State private var chosen = false
    @State private var wrongPick: String?
    @State private var typing = false
    @State private var attempt: Spoken?

    var myLines: [Int] { d.lines.indices.filter { d.lines[$0].who == me } }

    var body: some View {
        ScrollViewReader { proxy in
            Page {
                if let me {
                    Text(store.t("rolePlay") + " · " + store.t("youAre", store.pyFirst ? d.people[me].py : d.people[me].hz))
                        .font(.footnote).foregroundStyle(Color.ink2)
                }
                ForEach(Array(shown.enumerated()), id: \.offset) { n, s in
                    let mine = d.lines[s.k].who == me
                    Bubble(d: d, line: d.lines[s.k], mine: mine, highlight: s.ok == false ? Color.gold : nil) { EmptyView() }.id(n)
                    if mine, s.spoken != nil || s.note != nil { result(s).frame(maxWidth: .infinity, alignment: .trailing) }
                }
                if me != nil && i >= d.lines.count { finished }
                Color.clear.frame(height: 1).id("end")
            }
            .onChange(of: shown.count) { withAnimation { proxy.scrollTo("end", anchor: .bottom) } }
            .onChange(of: chosen) { withAnimation { proxy.scrollTo("end", anchor: .bottom) } }
        }
        .safeAreaInset(edge: .bottom) { if let me, i < d.lines.count, d.lines[i].who == me { composer } }
        .onAppear { if me == nil { me = Launch.value("-dlgrole").flatMap(Int.init) ?? Int.random(in: 0..<max(1, d.people.count)); advance(after: false) } }
        .onDisappear { gen += 1 }
    }

    /// How your line went: words heard, or the note for a typed answer
    func result(_ s: Shown) -> some View {
        HStack(spacing: 6) {
            if let h = s.spoken?.heard {
                Text("\(Int((h.score * 100).rounded()))%").fontWeight(.bold).foregroundStyle(h.score >= 0.8 ? Color.good : Color.gold)
                if !h.text.isEmpty { Text("· " + store.t("heardAs", h.text)).lineLimit(2) }
            } else if let note = s.note { Text(note).foregroundStyle(s.ok == true ? Color.good : Color.bad) }
            else if s.spoken != nil { Text("✓").foregroundStyle(Color.good) }
            if let sp = s.spoken { Button { store.speaker.play(sp.wav) } label: { Image(systemName: "play.circle") }.buttonStyle(.plain).accessibilityLabel(store.t("playMine")) }
        }
        .font(.caption).foregroundStyle(Color.ink2).frame(maxWidth: 300, alignment: .trailing)
    }

    var finished: some View {
        CardBox(padding: 20) {
            Text(store.t("dlgTurnDone", right, myLines.count)).font(.title3.weight(.bold)).frame(maxWidth: .infinity)
            HStack {
                Button(store.t("switchRole")) { restart(as: 1 - (me ?? 0)) }.buttonStyle(.secondary)
                Button(store.t("again")) { restart(as: me ?? 0) }.buttonStyle(.primary)
            }
        }
    }
    func restart(as role: Int) {
        gen += 1; me = role; i = 0; right = 0; shown = []; resetTurn(); advance(after: false)
    }

    // MARK: Your turn

    var composer: some View {
        let l = d.lines[i], c = store.course.id, n = (myLines.firstIndex(of: i) ?? 0) + 1
        let r = Look.current.radius
        return VStack(spacing: 12) {
            HStack {
                Text(store.t("pickReply")).fontWeight(.bold).foregroundStyle(Color.ink)
                Spacer()
                Text("\(n) / \(myLines.count)").monospacedDigit()
            }.font(.caption).foregroundStyle(Color.ink2)
            if !chosen {
                HStack(spacing: 8) {
                    ForEach(replies, id: \.self) { x in
                        Button { pick(x, l) } label: {
                            VStack(spacing: 2) {
                                if c == "vi" { VietText(text: x.hz, size: 16) } else if store.pyFirst { PinyinText(py: x.py, size: 15) } else { Text(x.hz).hanziFont(17) }
                                if store.state.settings.dlgTr != false { Text(x.tr(store.state.lang)).font(.caption2).foregroundStyle(Color.ink2).lineLimit(2) }
                            }
                            .multilineTextAlignment(.center).padding(8).frame(maxWidth: .infinity, minHeight: 52)
                            .background(wrongPick == x.hz ? Color.bad.opacity(0.1) : Color.paper, in: RoundedRectangle(cornerRadius: r))
                            .overlay(RoundedRectangle(cornerRadius: r).stroke(wrongPick == x.hz ? Color.bad : Color.line))
                            .foregroundStyle(Color.ink)
                        }.buttonStyle(.plain)
                    }
                }
            } else {
                VStack(spacing: 2) {
                    if c == "zh" && (store.pyFirst || store.dialogueReading) { PinyinText(py: hint > 0 || store.pyFirst ? l.py : Check.hintMask(l.py), size: 15) }
                    if !store.pyFirst || store.state.settings.dlgHz == true { Text(l.hz).hanziFont(c == "vi" ? 18 : 20) }
                    if (c == "ko" || c == "ja") && store.dialogueReading && hint > 0 { Text(l.py).font(.caption).foregroundStyle(Color.ink2) }
                }.frame(maxWidth: .infinity)
                if let a = attempt {
                    HStack(spacing: 8) {
                        if let h = a.heard { Text("\(Int((h.score * 100).rounded()))%").font(.headline).foregroundStyle(h.score >= 0.8 ? Color.good : Color.gold) }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(a.heard.map { store.t("heardAs", $0.text.isEmpty ? "–" : $0.text) } ?? store.t("rateSelf")).font(.caption).foregroundStyle(Color.ink2).lineLimit(2)
                            if let h = a.heard, h.score < 1, !h.text.isEmpty { HeardHintText(hz: l.hz, heard: h.text) }
                        }
                        Spacer()
                        Button(store.t("next")) { answer(ok: a.heard.map { $0.score >= 0.8 }, note: nil, spoken: a) }.buttonStyle(.bordered).tint(.ink)
                    }
                }
                if typing {
                    HStack {
                        PinyinField(placeholder: store.t("typeOr"), text: $typed, submit: submitTyped, autofocus: true)
                        Button(store.t("check"), action: submitTyped).buttonStyle(.bordered).tint(.ink)
                    }
                }
            }
            HStack {
                side(store.t("hint"), "lightbulb") { if chosen { hint += 1 } else { wrongPick = replies.first { $0.hz != l.hz }?.hz } }
                Spacer()
                MicButton(key: "turn\(i)", target: l.hz, py: l.py, big: true) { r in
                    if !chosen { chosen = true }
                    if (r.heard?.score ?? 0) >= 0.8 { answer(ok: true, note: nil, spoken: r) } else { attempt = r }
                }
                Spacer()
                if attempt != nil { side(store.t("retry"), "arrow.counterclockwise") { attempt = nil } }
                else { side(store.t("typeIt"), "keyboard") { chosen = true; typing.toggle() } }
            }
            Text(store.t("speakBtn")).font(.caption2).foregroundStyle(Color.ink2)
        }
        .padding(.horizontal, 16).padding(.top, 12).padding(.bottom, 8)
        .background(Color.elevated)
        .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
        .task(id: i) { if replies.isEmpty { makeReplies() } }
    }
    func side(_ label: String, _ icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 2) { Image(systemName: icon).font(.title3); Text(label).font(.caption2) }
                .frame(width: 64, height: 48).foregroundStyle(Color.ink2)
        }.buttonStyle(.plain).accessibilityLabel(label)
    }
    /// Your line and another line of the dialogue, in random order
    func makeReplies() {
        let l = d.lines[i]
        let others = d.lines.enumerated().filter { $0.offset != i && $0.element.hz != l.hz }.map(\.element)
        let other = others.filter { $0.who == l.who }.randomElement() ?? others.randomElement()
        replies = ([l] + (other.map { [$0] } ?? [])).shuffled()
    }
    func pick(_ x: Dialogue.Line, _ l: Dialogue.Line) {
        if x.hz == l.hz { withAnimation { chosen = true }; wrongPick = nil; store.speaker.say(l.hz, rate: 0.75) }
        else { wrongPick = x.hz; Haptic.answer(false) }
    }
    func resetTurn() { hint = 0; typed = ""; chosen = false; wrongPick = nil; typing = false; attempt = nil; replies = [] }

    func submitTyped() {
        // Tone numbers typed just before Return may not have turned into marks yet
        let raw = typed.trimmingCharacters(in: .whitespaces), v = store.course.id == "zh" ? Lingo.numToMarks(raw) : raw
        guard !v.isEmpty else { return }
        let l = d.lines[i], r = Check.typedLine(v, hz: l.hz, py: l.py, course: store.course.id)
        let note = r.ok ? (r.tonesMissing ? store.t("tonesMissing") : "✓ " + store.t("correct")) : r.tonesWrong ? store.t("tonesWrong") : "✗ " + store.t("wrong")
        Haptic.answer(r.ok)
        answer(ok: r.ok, note: note, spoken: nil)
    }
    /// ok nil: recording without a recogniser (counted as tried)
    func answer(ok: Bool?, note: String?, spoken: Spoken?) {
        let l = d.lines[i]
        if ok == true { right += 1 }
        shown.append(Shown(k: i, ok: ok, note: note, spoken: spoken))
        store.sayLine(l.hz)
        i += 1; resetTurn()
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
        if l.who == me { makeReplies(); return }
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
