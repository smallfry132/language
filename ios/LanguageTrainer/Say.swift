import SwiftUI
import LanguageCore

/* Say the word (design round 3): every moment has its own screen. Listening shows the level and a big Stop;
 * when nothing came through nothing is counted and you get two tips; without a recogniser you hear the model,
 * record yourself and decide. The result leads with a verdict, one card per syllable and the one thing to
 * change; the curve waits behind "Why?". */

struct SayWord: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var spoken: Spoken?
    @State private var selfScore: Double?
    /// You are the judge: no recogniser for the language, or "Rate myself instead"
    @State private var judge = false
    @State private var showWhy = Launch.has("-why")
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]
    @State private var skipped = 0

    var key: String { "w\(i)" }
    var listening: Bool { store.mic.isListening(key) || Launch.value("-saystate") == "listening" }
    /// Recorded, but neither words nor a voice came through
    var heardNothing: Bool {
        guard let s = spoken, !judge else { return false }
        return (s.tones?.none ?? true) && (s.heard?.text.isEmpty ?? true)
    }

    var body: some View {
        let w = list[i]
        let pitch = w.py.split(separator: " ").count <= 2 && Lingo.pyParts(w.py).filter { !$0.sep }.count <= 4
        VStack(spacing: 0) {
            Page {
                ProgressHeader(i: i, n: list.count, extra: "✓ \(correct)")
                wordCard(w)
                if listening {
                    ListeningPanel()
                } else if judge {
                    JudgeSteps(word: w, offline: !store.mic.canRecognise(store.course), key: key) { score in selfScore = score; next() }
                } else if heardNothing {
                    nothingCard(w)
                } else if let s = spoken {
                    SayResult(word: w, spoken: s, showWhy: $showWhy).id(s.ms)
                } else {
                    VStack(spacing: 8) {
                        Button { store.speaker.say(w.hz) } label: { Label(store.t("hearIt"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.bordered).tint(.ink)
                        Text(store.t("sayHint")).font(.footnote).foregroundStyle(Color.ink2)
                    }.frame(maxWidth: .infinity).padding(.vertical, 18)
                }
            }
            footer(w, pitch: pitch)
                .padding(.horizontal, 16).padding(.vertical, 10)
                .background(Color.paper)
        }
        .background(Color.paper)
        .onAppear {
            judge = !store.mic.canRecognise(store.course) && store.course.id != "zh" // Chinese still has its tone curve
            screenshotState(w)
        }
        .onDisappear { store.mic.cancel() }
    }

    func wordCard(_ w: Word) -> some View {
        CardBox {
            HStack(spacing: 12) {
                if let p = store.words.picture(w.id) { Text(p).scaledFont(40).accessibilityHidden(true) }
                VStack(alignment: .leading, spacing: 2) {
                    reading(w)
                    Text(sub(w)).font(.subheadline).foregroundStyle(Color.ink2)
                }
                Spacer(minLength: 4)
            }
        }
    }

    /// The bottom row: Stop while listening; Try again + Next after a result; else Skip · microphone · Next
    @ViewBuilder func footer(_ w: Word, pitch: Bool) -> some View {
        if listening {
            VStack(spacing: 6) {
                Button { store.mic.stop() } label: {
                    RoundedRectangle(cornerRadius: 4).fill(Color.onAction).frame(width: 22, height: 22)
                        .frame(width: 76, height: 76).background(Color.action, in: Circle())
                }.buttonStyle(.card).accessibilityLabel(store.t("stopListening"))
                Button(store.t("cancel")) { store.mic.cancel() }.font(.subheadline.weight(.semibold)).foregroundStyle(Color.ink2).frame(minHeight: 36)
            }.frame(maxWidth: .infinity)
        } else if judge {
            Button(store.t("skip")) { skipped += 1; advance() }.buttonStyle(.secondary)
        } else {
            let result = spoken != nil && !heardNothing
            HStack(spacing: 12) {
                if !result { Button(store.t("skip")) { store.mic.cancel(); skipped += 1; advance() }.buttonStyle(.secondary) }
                VStack(spacing: 2) {
                    MicButton(key: key, target: w.hz, py: w.py, pitch: pitch, big: true) { spoken = $0; selfScore = nil; showWhy = Launch.has("-why") }
                    if result || heardNothing { Text(store.t("tryAgain")).font(.caption.weight(.semibold)).foregroundStyle(Color.ink2) }
                }
                Button(store.t("next") + " →") { next() }.buttonStyle(result ? AnyButtonStyle(.primary) : AnyButtonStyle(.secondary))
                    .accessibilityIdentifier("say-next")
            }
        }
    }

    func nothingCard(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(store.t("heardNothing")).font(.title3.weight(.bold))
            Text(store.t("heardNothingText")).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
            VStack(alignment: .leading, spacing: 4) {
                ForEach(["heardNothingTip1", "heardNothingTip2"], id: \.self) { k in
                    Label { Text(store.t(k)) } icon: { Circle().fill(Color.accent).frame(width: 5, height: 5) }.font(.subheadline)
                }
            }
            .padding(12).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.sunken, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
            Button { store.speaker.say(w.hz) } label: { Label(store.t("hearIt"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.bordered).tint(.ink)
            Button(store.t("rateInstead")) { judge = true; spoken = nil }
                .font(.subheadline.weight(.semibold)).foregroundStyle(Color.accent).frame(maxWidth: .infinity, minHeight: 40)
        }
        .padding(16).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
        .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).strokeBorder(Color.line, style: StrokeStyle(lineWidth: 1.5, dash: [6, 4])))
    }

    @ViewBuilder func reading(_ w: Word) -> some View {
        switch store.course.id {
        case "zh": if store.pyFirst { PinyinText(py: w.py, size: 32, weight: .bold) } else { Text(w.hz).hanziFont(34) }
        case "vi": VietText(text: w.hz, size: 32, weight: .heavy).lineLimit(2).minimumScaleFactor(0.6)
        case "de", "es": GenderText(word: w, size: 30).lineLimit(2).minimumScaleFactor(0.6)
        default: Text(w.hz).hanziFont(34).lineLimit(2).minimumScaleFactor(0.6)
        }
    }
    func sub(_ w: Word) -> String {
        switch store.course.id {
        case "zh": return (store.pyFirst ? w.hz : w.py) + " · " + store.tr(w)
        case "vi", "de", "es": return store.tr(w)
        default: return w.py + " · " + store.tr(w)
        }
    }
    func advance() {
        spoken = nil; selfScore = nil; showWhy = false
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count - skipped, mistakes: mistakes, why: why)) } else { i += 1 }
    }
    func next() {
        let w = list[i]
        guard spoken != nil || selfScore != nil, !heardNothing || selfScore != nil else { store.mic.cancel(); skipped += 1; advance(); return } // nothing said yet: like Skip
        let score = selfScore ?? (spoken?.score ?? 0), ok = score >= 0.8
        store.update { $0.grade(w.id, ok ? 2 : score > 0 ? 1 : 0); $0.recordAnswer(ok) }
        store.marks.append(ok)
        if ok { correct += 1 } else {
            mistakes.append(w)
            why[w.id] = store.t(spoken?.tones?.syllables.contains { $0.ok == false } == true ? "whyTones" : "whyNotHeard")
        }
        advance()
    }
    /// Screenshots: -saystate nothing|judge, -heard 诚实 (the recogniser "wrote" that), -tonesay 1,2 (a fake curve)
    func screenshotState(_ w: Word) {
        guard i == 0, spoken == nil else { return }
        switch Launch.value("-saystate") {
        case "nothing": spoken = Spoken(heard: .init(score: 0, hit: [], text: ""), tones: nil, wav: Data(), ms: 1)
        case "judge": judge = true
        default: break
        }
        if let fake = Launch.value("-heard") {
            var s = Spoken(heard: Check.matchHeard(w.hz, [fake], course: store.course.id, py: w.py), tones: nil, wav: Data(), ms: 1)
            if let said = Launch.value("-tonesay") { s.tones = Self.fakeCurve(py: w.py, said: said.split(separator: ",").compactMap { Int($0) }) }
            spoken = s
        }
    }
    /// A pitch curve as if each syllable had been said with the given tone (for screenshots)
    static func fakeCurve(py: String, said: [Int]) -> Pitch.Result {
        let shapes: [Int: [Double]] = [1: [4.6, 4.6, 4.5, 4.6, 4.5], 2: [2.6, 2.9, 3.4, 4.0, 4.6], 3: [2.4, 1.6, 1.2, 1.4, 2.2], 4: [4.8, 4.0, 3.0, 2.0, 1.4]]
        var frames: [Double?] = []
        for t in said {
            for v in shapes[t] ?? shapes[1]! { for _ in 0..<6 { frames.append(180 * pow(2, (v - 3) * 4 / 12 / 2)) } }
            frames.append(contentsOf: Array(repeating: nil, count: 8))
        }
        return Pitch.check(py: py, frames: frames, f0base: 180)
    }
}

/// While listening: live level bars and what happens next
struct ListeningPanel: View {
    @Environment(Store.self) var store
    var body: some View {
        let level = Launch.value("-saystate") == "listening" ? 0.6 : Double(store.mic.level)
        VStack(spacing: 12) {
            HStack(alignment: .center, spacing: 5) {
                ForEach(0..<9, id: \.self) { k in
                    let shape = [0.35, 0.55, 0.8, 0.95, 1, 0.9, 0.75, 0.5, 0.3][k]
                    Capsule().fill(Color.accent).frame(width: 6, height: 8 + 46 * CGFloat(shape * level))
                }
            }
            .frame(height: 60).animation(.easeOut(duration: 0.12), value: level)
            .accessibilityHidden(true)
            Text(store.t("sayListening")).font(.title3.weight(.bold))
            Text(store.t("sayListeningSub")).font(.subheadline).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 24)
        .accessibilityElement(children: .combine).accessibilityAddTraits(.updatesFrequently)
    }
}

/// No recogniser (or you asked to judge): hear the model, record yourself, decide
struct JudgeSteps: View {
    @Environment(Store.self) var store
    let word: Word
    let offline: Bool
    let key: String
    let rate: (Double) -> Void
    @State private var mine: Data?
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if offline { Text(store.t("recogOff")).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true) }
            step(1, store.t("stepHear")) {
                Button { store.speaker.say(word.hz) } label: { Label(store.t("playBtn"), systemImage: "play.fill") }.buttonStyle(.bordered).tint(.ink)
            }
            step(2, store.t("stepSay")) {
                let live = store.mic.isListening(key)
                HStack(spacing: 8) {
                    Button {
                        store.speaker.stop()
                        store.mic.listen(key: key, target: word.hz, py: word.py, course: store.course, pitch: false, f0base: nil) { r in
                            if let r { mine = r.wav; store.speaker.play(r.wav) }
                        }
                    } label: { Label(live ? store.t("stopListening") : store.t("recordMine"), systemImage: live ? "stop.fill" : "record.circle") }
                        .buttonStyle(.bordered).tint(live ? .accent : .ink)
                    if let mine { Button { store.speaker.play(mine) } label: { Label(store.t("playMineBtn"), systemImage: "play.fill") }.buttonStyle(.bordered).tint(.ink) }
                }
            }
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) { number(3); Text(store.t("stepRate")).font(.body.weight(.semibold)) }
                HStack(spacing: 8) {
                    ForEach([(0.0, "notYet"), (0.6, "closeEnough"), (1.0, "gotIt")], id: \.0) { v, k in
                        Button(store.t(k)) { rate(v) }.buttonStyle(v == 1 ? AnyButtonStyle(.primary) : AnyButtonStyle(.secondary))
                    }
                }
                Text(store.t("rateOnlyWhen")).font(.footnote).foregroundStyle(Color.ink2)
            }
            .padding(14)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.ink, lineWidth: 1.5))
        }
    }
    func number(_ n: Int) -> some View {
        Text("\(n)").font(.caption.weight(.bold)).frame(width: 24, height: 24)
            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 4)).stroke(Color.ink, lineWidth: 1.5))
    }
    func step<C: View>(_ n: Int, _ text: String, @ViewBuilder action: () -> C) -> some View {
        HStack(spacing: 10) {
            number(n)
            Text(text).font(.body.weight(.semibold)).frame(maxWidth: .infinity, alignment: .leading)
            action()
        }
        .padding(14)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
        .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
    }
}

/// The result of one attempt: verdict, the syllables, what to change, and the curve behind "Why?"
struct SayResult: View {
    @Environment(Store.self) var store
    let word: Word
    let spoken: Spoken
    @Binding var showWhy: Bool

    struct Syl { let text: String; let tone: Int; let ok: Bool; let reason: String }

    var tones: Pitch.Result? { spoken.tones.flatMap { $0.none ? nil : $0 } }
    var good: Bool { spoken.score >= 0.8 }
    var syllables: [Syl] {
        if let t = tones {
            return t.syllables.map { s in
                let ok = s.ok != false
                let reason = ok ? store.t("good_\(min(max(s.want, 1), 5))") : store.t("got_\(s.got ?? 0)") + " — " + store.t("want_\(s.want)")
                return Syl(text: s.text, tone: s.want, ok: ok, reason: reason)
            }
        }
        // Chinese without a curve: which syllables the recogniser caught
        guard store.course.id == "zh", let h = spoken.heard else { return [] }
        let parts = Lingo.pyParts(word.py).filter { !$0.sep }
        guard parts.count == h.hit.count, parts.count > 1 else { return [] }
        return zip(parts, h.hit).map { p, hit in Syl(text: p.text, tone: p.tone, ok: hit, reason: store.t(hit ? "sylHeard" : "sylMissed")) }
    }
    var wrong: [Pitch.Syllable] { tones?.syllables.filter { $0.ok == false } ?? [] }
    var verdict: (title: String, text: String) {
        let heard = spoken.heard?.score ?? 0
        if good { return (store.t("verdictGood"), store.t(spoken.curveOverruled ? "sentOverruled" : tones != nil ? "sentAllTones" : "sentHeard")) }
        if tones != nil {
            let n = wrong.count
            if heard >= 0.8 { return (store.t("verdictAlmost"), n == 1 ? store.t("sentUnderstoodFix") : store.t("sentUnderstoodFixN", n)) }
            return (store.t(spoken.score >= 0.4 ? "verdictAlmost" : "verdictNotYet"), n == 1 ? store.t("sentFix") : store.t("sentFixN", n))
        }
        return heard >= 0.4 ? (store.t("verdictAlmost"), store.t("sentHeardPart")) : (store.t("verdictNotYet"), store.t("sentNotHeard"))
    }

    var body: some View {
        let v = verdict, syl = syllables
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(v.title).hanziFont(28, .bold).foregroundStyle(good ? Color.good : Color.ink)
                Text(v.text).font(.subheadline).foregroundStyle(Color.ink2)
            }
            .accessibilityElement(children: .combine)
            if !syl.isEmpty {
                HStack(spacing: 8) {
                    ForEach(Array(syl.enumerated()), id: \.offset) { _, s in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 4) {
                                Text(s.text).font(.title3.weight(.bold)).foregroundStyle(Look.toneColors ? Color.tone(s.tone) : Color.ink)
                                Text(s.ok ? "✓" : "✕").font(.headline).foregroundStyle(s.ok ? Color.good : Color.bad)
                            }
                            Text(s.reason).font(.caption).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(10).frame(maxWidth: .infinity, alignment: .topLeading)
                        .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius)))
                        .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius)).stroke(s.ok ? Color.line : Color.bad, lineWidth: s.ok ? 1 : 1.5))
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            if !good { change }
            whyBox
        }
    }

    /// The one thing to change, and model then you
    var change: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(store.t("whatToChange").uppercased()).font(.caption.weight(.bold)).tracking(1.2).foregroundStyle(Color.accent)
            if let s = wrong.first, (1...4).contains(s.want) {
                Text(.init(store.t("change_\(s.want)", "**\(s.text)**"))).font(.subheadline)
            } else {
                Text(store.t("changeHeard")).font(.subheadline)
                if let h = spoken.heard, !h.text.isEmpty { HeardHintText(hz: word.hz, heard: h.text) }
            }
            if !spoken.wav.isEmpty {
                Button {
                    let wav = spoken.wav
                    store.speaker.say(word.hz) { Task { try? await Task.sleep(for: .milliseconds(350)); store.speaker.play(wav) } }
                } label: { Label(store.t("hearDiff"), systemImage: "speaker.wave.2.fill").font(.subheadline.weight(.semibold)) }
                    .buttonStyle(.bordered).tint(.ink)
            }
        }
        .padding(14).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
        .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.accent.opacity(0.5)))
    }

    /// Why? The curve (model thick, you dashed) and what the recogniser heard
    @ViewBuilder var whyBox: some View {
        let hasHeard = !(spoken.heard?.text.isEmpty ?? true)
        if tones != nil || hasHeard {
            VStack(alignment: .leading, spacing: 10) {
                Button { withAnimation(.easeOut(duration: 0.2)) { showWhy.toggle() } } label: {
                    HStack {
                        Text(store.t(tones != nil ? "whyCurve" : "whyHeard")).font(.subheadline.weight(.semibold))
                        Spacer()
                        Image(systemName: showWhy ? "chevron.up" : "chevron.down").font(.caption.weight(.bold))
                    }.foregroundStyle(Color.ink).frame(minHeight: 36)
                }
                .buttonStyle(.card)
                .accessibilityValue(showWhy ? store.t("expanded") : "")
                if showWhy {
                    if let t = tones {
                        PitchChart(result: t, compact: true)
                        Text(store.t("curveLegend")).font(.caption).foregroundStyle(Color.ink2)
                    }
                    if let h = spoken.heard, !h.text.isEmpty { HeardLine(text: h.text, targetPy: word.py) }
                    if spoken.curveOverruled { Text(store.t("curveOverruled", word.py)).font(.footnote).foregroundStyle(Color.good) }
                    HStack(spacing: 10) {
                        if !spoken.wav.isEmpty { Button { store.speaker.play(spoken.wav) } label: { Label(store.t("playMine"), systemImage: "play.fill") }.buttonStyle(.bordered) }
                        Button { store.speaker.say(word.hz) } label: { Label(store.t("playModel"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.bordered)
                    }.font(.subheadline).tint(.ink)
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 8)
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
        }
    }
}
